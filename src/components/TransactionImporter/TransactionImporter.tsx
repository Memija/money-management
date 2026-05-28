import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  FileText,
  FileType,
  ClipboardPaste,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Info,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import type { ImportMethod, Transaction, ImportedAccount } from '../../types';
import * as XLSX from 'xlsx';
import styles from './TransactionImporter.module.css';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

/* ─── helpers ─── */

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function inferType(amount: number): 'income' | 'expense' {
  return amount >= 0 ? 'income' : 'expense';
}

function parseAmount(raw: string | number): number {
  if (typeof raw === 'number') return raw;
  // Handle European format: 1.234,56 → 1234.56
  let cleaned = raw.replace(/[€$£\s]/g, '').trim();
  if (/,\d{1,2}$/.test(cleaned) && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (/,\d{1,2}$/.test(cleaned)) {
    cleaned = cleaned.replace(',', '.');
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseDate(raw: string): string {
  if (!raw) return new Date().toISOString().split('T')[0];
  // Try to parse DD.MM.YYYY (common German format)
  const deMatch = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (deMatch) {
    const year = deMatch[3].length === 2 ? '20' + deMatch[3] : deMatch[3];
    return `${year}-${deMatch[2].padStart(2, '0')}-${deMatch[1].padStart(2, '0')}`;
  }
  // Try ISO format
  const isoMatch = raw.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];
  // Try MM/DD/YYYY
  const usMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (usMatch) {
    const year = usMatch[3].length === 2 ? '20' + usMatch[3] : usMatch[3];
    return `${year}-${usMatch[1].padStart(2, '0')}-${usMatch[2].padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0];
}

function rowsToTransactions(rows: string[][], institution: string): Transaction[] {
  if (rows.length < 2) return [];

  // Try to auto-detect columns from the header
  const header = rows[0].map((h) => h?.toString().toLowerCase().trim() ?? '');

  let dateIdx = header.findIndex((h) =>
    ['date', 'datum', 'buchungstag', 'buchungsdatum', 'valuta', 'wertstellung', 'booking date'].some((k) => h.includes(k))
  );
  let descIdx = header.findIndex((h) =>
    ['description', 'beschreibung', 'verwendungszweck', 'empfänger', 'auftraggeber', 'recipient', 'buchungstext', 'text', 'name', 'zahlungsempfänger', 'purpose'].some((k) => h.includes(k))
  );
  let amountIdx = header.findIndex((h) =>
    ['amount', 'betrag', 'umsatz', 'saldo', 'value', 'sum', 'wert'].some((k) => h.includes(k))
  );

  // Fallback: assume date=0, desc=1, amount=2
  if (dateIdx === -1) dateIdx = 0;
  if (descIdx === -1) descIdx = Math.min(1, rows[0].length - 1);
  if (amountIdx === -1) amountIdx = Math.min(rows[0].length - 1, 2);

  const transactions: Transaction[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((cell) => !cell || cell.toString().trim() === '')) continue;

    const rawAmount = row[amountIdx];
    const amount = parseAmount(rawAmount?.toString() ?? '0');
    const rawDate = row[dateIdx]?.toString() ?? '';
    const desc = row[descIdx]?.toString?.() ?? 'Unknown';

    transactions.push({
      id: generateId(),
      date: parseDate(rawDate),
      description: desc.trim(),
      amount,
      currency: 'EUR',
      type: inferType(amount),
      institution,
    });
  }

  return transactions;
}

/**
 * Parses the copy-paste output from German bank portals (e.g. ING, Sparkasse DKB).
 * The format is a multi-line block where each transaction is represented as:
 *   - A date header line (DD.MM.YYYY) optionally followed by a balance
 *   - Partner name (2–3 lines of initials + name)
 *   - Reference / description text
 *   - Transaction type (Dauerauftrag, Lastschrift, Überweisung, etc.)
 *   - Amount line ending with EUR
 *   - Optional "Menü öffnen" noise line
 *
 * Pending ("vorgemerkt") transactions are also parsed with their projected booking date.
 */
function parseBankStatementPaste(rawText: string, institution: string): Transaction[] {
  // Normalize unicode minus signs and trim each line
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.replace(/[\u2212\u2013\u2014]/g, '-').trim())
    .filter((l) => l.length > 0);

  // Noise lines to skip outright
  const SKIP_PATTERNS = [
    /^\(Umsatzdetails öffnen\)$/i,
    /^Menü öffnen$/i,
    /^Symbol$/i,
    /^Zahlungsverkehrspartner$/i,
    /^Vorausichtliche Buchung$/i,
    /^Umsatzart$/i,
    /^Betrag$/i,
    /^Mehr Optionen$/i,
    /^Umsätze (für heute|von gestern|vom)/i,
    /^Der Tagessaldo beträgt/i,
    /^Umsätze für/i,
    /^SymbolZahlungsverkehrspartnerVoraus/i,
    // Pending section headers: "1 Umsatz vorgemerkt ..." and its combined variant
    /^\d+ Ums[aä]tz/i,
    /^Nicht im Saldo enthalten/i,
  ];

  // Known transaction type keywords
  const TX_TYPES = new Set([
    'dauerauftrag', 'lastschrift', 'überweisung', 'gutschrift', 'kartenzahlung',
    'einzahlung', 'auszahlung', 'zinsen', 'entgelt', 'rückbuchung', 'lohnzahlung',
    'gehalt', 'sepa-überweisung', 'sepa-lastschrift', 'direct debit', 'standing order',
  ]);

  // Amount pattern: optional leading minus, digits with . or , separators, ends with EUR/€
  const AMOUNT_RE = /^(-?\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(EUR|€)$/;
  // Date header pattern: DD.MM.YYYY — standalone date line (day separator)
  const DATE_HEADER_RE = /^(\d{1,2}\.\d{1,2}\.\d{2,4})$/;
  // Balance line: positive amount with EUR (no leading minus) — daily balance summary
  const BALANCE_RE = /^\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\s*EUR$/;
  // Projected booking date line: "Voraussichtliche Buchung: DD.MM.YYYY"
  const PROJECTED_DATE_RE = /Voraussichtliche Buchung:\s*(\d{1,2}\.\d{1,2}\.\d{2,4})/i;

  let currentDate = new Date().toISOString().split('T')[0];
  const cleanLines = lines.filter((l) => !SKIP_PATTERNS.some((re) => re.test(l)));

  interface RawTx { date: string; partner: string; desc: string; type: string; amount: number }
  const rawTxs: RawTx[] = [];

  let buf: { date: string; partner: string; desc: string; type: string; projDate: string | null } = {
    date: currentDate, partner: '', desc: '', type: '', projDate: null,
  };

  const pushBuf = (amount: number) => {
    if (!buf.partner && !buf.desc) return;
    rawTxs.push({
      date: buf.projDate ?? buf.date,
      partner: buf.partner,
      desc: buf.desc,
      type: buf.type,
      amount,
    });
    buf = { date: buf.date, partner: '', desc: '', type: '', projDate: null };
  };

  for (const line of cleanLines) {
    // Projected booking date annotation (pending transactions)
    const projMatch = line.match(PROJECTED_DATE_RE);
    if (projMatch) {
      buf.projDate = parseDate(projMatch[1]);
      continue;
    }

    // Date header line — new calendar day
    if (DATE_HEADER_RE.test(line)) {
      currentDate = parseDate(line);
      buf.date = currentDate;
      continue;
    }

    // Daily balance summary — skip
    if (BALANCE_RE.test(line)) continue;

    // Amount line — finalises the current transaction buffer
    const amtMatch = line.match(AMOUNT_RE);
    if (amtMatch) {
      pushBuf(parseAmount(amtMatch[1]));
      continue;
    }

    // Transaction type keyword
    if (TX_TYPES.has(line.toLowerCase())) {
      buf.type = line;
      continue;
    }

    // Avatar initials placeholder (e.g. "AM", "MG") — skip
    if (/^[A-Z]{1,3}$/.test(line)) continue;

    // Remaining text: first line → partner name, subsequent lines → description
    if (!buf.partner) {
      buf.partner = line;
    } else if (!buf.desc) {
      buf.desc = line;
    } else {
      buf.desc += ' ' + line;
    }
  }

  return rawTxs.map((r) => ({
    id: Math.random().toString(36).substring(2, 11),
    date: r.date,
    description: [r.partner, r.desc].filter(Boolean).join(' – ') || r.type || 'Unknown',
    amount: r.amount,
    currency: 'EUR',
    type: inferType(r.amount),
    institution,
  }));
}

function parsePdfText(rawText: string, institution: string): Transaction[] {
  // Normalize: unicode dashes → ASCII minus, collapse whitespace
  const text = rawText
    .replace(/[\u2212\u2013\u2014\u2015]/g, '-')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const transactions: Transaction[] = [];

  // German bank statement: BookingDate ValueDate Type Description Category Amount EUR
  const deRegex =
    /(\d{1,2}\.\d{1,2}\.\d{2,4})\s+\d{1,2}\.\d{1,2}\.\d{2,4}\s+(.*?)\s+(-?\s?\d{1,3}(?:\.\d{3})*,\d{2})\s*(?:EUR|€)/g;

  let m;
  while ((m = deRegex.exec(text)) !== null) {
    const amountStr = m[3].replace(/\s/g, '');
    const amount = parseAmount(amountStr);
    const desc = m[2].replace(/\s+/g, ' ').trim();
    transactions.push({
      id: generateId(),
      date: parseDate(m[1]),
      description: desc || 'PDF Transaction',
      amount,
      currency: 'EUR',
      type: inferType(amount),
      institution,
    });
  }

  if (transactions.length > 0) return transactions;

  // Fallback: generic single-line date+amount detection
  const lines = rawText.split(/\r?\n/).filter((l) => l.trim());
  const dateRe = /(\d{1,2}[./]\d{1,2}[./]\d{2,4})/;
  const amtRe = /(-?\s?\d{1,3}(?:[.,]\d{3})*[.,]\d{1,2})\s*(?:€|EUR)?/;

  for (const line of lines) {
    const dMatch = line.match(dateRe);
    const aMatch = line.match(amtRe);
    if (dMatch && aMatch) {
      const amountStr = aMatch[1].replace(/\s/g, '');
      const amount = parseAmount(amountStr);
      const desc = line
        .replace(dMatch[0], '')
        .replace(aMatch[0], '')
        .replace(/\s+/g, ' ')
        .trim();
      transactions.push({
        id: generateId(),
        date: parseDate(dMatch[1]),
        description: desc || 'PDF Transaction',
        amount,
        currency: 'EUR',
        type: inferType(amount),
        institution,
      });
    }
  }

  return transactions;
}

/* ─── component ─── */

const TransactionImporter: React.FC = () => {
  const { selectedInstitution, addImportedAccount, setStep } = useAppStore();
  const t = useLanguageStore((s) => s.t);
  const [method, setMethod] = useState<ImportMethod | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const institutionName = selectedInstitution?.name ?? 'Unknown';

  /* ─── import method cards ─── */

  const importMethods: { key: ImportMethod; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      key: 'spreadsheet',
      label: t.spreadsheetFile,
      icon: <FileSpreadsheet size={24} />,
      desc: t.spreadsheetFileDesc,
    },
    {
      key: 'pdf',
      label: t.pdfStatement,
      icon: <FileType size={24} />,
      desc: t.pdfStatementDesc,
    },
    {
      key: 'paste',
      label: t.copyPaste,
      icon: <ClipboardPaste size={24} />,
      desc: t.copyPasteDesc,
    },
  ];

  /* ─── file handlers ─── */

  const handleFileChange = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      setFileName(file.name);

      try {
        if (method === 'spreadsheet' || file.name.match(/\.(xlsx|xls|csv)$/i)) {
          if (file.name.match(/\.(xlsx|xls)$/i)) {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            const txs = rowsToTransactions(rows, institutionName);
            if (txs.length === 0) throw new Error('No transactions found in the file.');
            setTransactions(txs);
          } else {
            const text = await file.text();
            // Detect separator
            const firstLine = text.split('\n')[0];
            const sep = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';
            const rows = text
              .trim()
              .split('\n')
              .map((line) => line.split(sep).map((cell) => cell.replace(/^"|"$/g, '').trim()));
            const txs = rowsToTransactions(rows, institutionName);
            if (txs.length === 0) throw new Error('No transactions found in the CSV.');
            setTransactions(txs);
          }
        } else if (method === 'pdf' || file.name.match(/\.pdf$/i)) {
          // Dynamically import pdfjs
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
          const data = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => ('str' in item ? item.str : ''))
              .join(' ');
            fullText += pageText + '\n';
          }

          const txLines = parsePdfText(fullText, institutionName);
          if (txLines.length === 0) {
            throw new Error(
              'Could not auto-detect transactions in this PDF. Try exporting as CSV or Excel from your bank portal instead.'
            );
          }
          setTransactions(txLines);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to process file.');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [method, institutionName]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileChange(file);
    },
    [handleFileChange]
  );

  const handlePaste = () => {
    setLoading(true);
    setError(null);
    try {
      // Strategy 1: German bank portal format (multi-line structured copy-paste)
      const bankTxs = parseBankStatementPaste(pasteText, institutionName);
      if (bankTxs.length > 0) {
        setTransactions(bankTxs);
        return;
      }

      // Strategy 2: Structured CSV/TSV fallback (tab, semicolon, or comma separated)
      const lines = pasteText.trim().split('\n');
      const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
      const rows = lines.map((l) => l.split(sep).map((c) => c.replace(/^"|"$/g, '').trim()));
      const csvTxs = rowsToTransactions(rows, institutionName);
      if (csvTxs.length === 0) {
        throw new Error(
          'No transactions could be parsed. Please try pasting directly from your bank\'s transaction list, or use a CSV/Excel export instead.'
        );
      }
      setTransactions(csvTxs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to parse pasted data.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    const account: ImportedAccount = {
      institutionId: selectedInstitution?.id ?? 'unknown',
      institutionName,
      transactions,
      importedAt: new Date().toISOString(),
    };
    addImportedAccount(account);
  };

  const acceptTypes: Record<ImportMethod, string> = {
    spreadsheet: '.xlsx,.xls,.csv',
    pdf: '.pdf',
    paste: '',
  };

  /* ─── render ─── */

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="onboarding-container"
    >
      <button className="back-button" onClick={() => setStep('institution')} id="back-to-institution">
        <ArrowLeft size={18} />
        <span>{t.back}</span>
      </button>

      <div className="onboarding-header">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="onboarding-icon upload-icon"
        >
          <Upload size={32} />
        </motion.div>
        <h1 className="onboarding-title">{t.importTransactionsTitle}</h1>
        <p className="onboarding-subtitle">
          {t.importTransactionsSubtitle.replace('{institution}', institutionName)}
          <br />
          <span className="info-text">
            <Info size={14} />
            {t.importPsd2Notice}
          </span>
        </p>
      </div>

      {/* Step 1: Choose method */}
      {!method && (
        <div className={styles['import-methods-grid']}>
          {importMethods.map((m, idx) => (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={styles['import-method-card']}
              onClick={() => setMethod(m.key)}
              id={`import-method-${m.key}`}
            >
              <div className={styles['import-method-icon']}>{m.icon}</div>
              <div>
                <p className={styles['import-method-label']}>{m.label}</p>
                <p className={styles['import-method-desc']}>{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Step 2: Upload area / Paste */}
      {method && transactions.length === 0 && !loading && (
        <div className={styles['import-upload-area']}>
          <button className="back-link" onClick={() => { setMethod(null); setError(null); setFileName(null); }}>
            {t.chooseDifferentFormat}
          </button>

          {method !== 'paste' ? (
            <div
              className={`${styles['drop-zone']} ${dragOver ? styles['drag-over'] : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              id="drop-zone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptTypes[method]}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                }}
                style={{ display: 'none' }}
                id="file-input"
              />
              <Upload size={40} className={styles['drop-zone-icon']} />
              <p className={styles['drop-zone-title']}>
                {dragOver ? t.dropHere : t.dragDropFile}
              </p>
              <p className={styles['drop-zone-subtitle']}>
                {t.orClickToBrowse.replace('{accepted}', acceptTypes[method])}
              </p>
              {fileName && <p className={styles['file-name-label']}>{fileName}</p>}
            </div>
          ) : (
            <div className={styles['paste-area-wrapper']}>
              <textarea
                className={styles['paste-textarea']}
                placeholder={t.pasteDataPlaceholder}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={10}
                id="paste-area"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`primary-button ${!pasteText.trim() ? 'disabled' : ''}`}
                onClick={handlePaste}
                disabled={!pasteText.trim()}
                id="parse-paste-button"
              >
                {t.parseTransactions}
              </motion.button>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles['import-error']}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className={styles['import-loading']}>
          <Loader2 size={32} className={styles.spinner} />
          <p>{t.processingData}</p>
        </div>
      )}

      {/* Step 3: Preview transactions */}
      {transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={styles['import-preview']}
        >
          <div className={styles['import-preview-header']}>
            <div className={styles['import-preview-info']}>
              <CheckCircle2 size={20} className="success-icon" />
              <span>
                <strong>{transactions.length}</strong> {t.transactionsFound.replace('{count}', '').trim()}
              </span>
            </div>
            <button
              className="clear-button"
              onClick={() => {
                setTransactions([]);
                setFileName(null);
                setPasteText('');
              }}
              id="clear-import"
            >
              <X size={14} />
              {t.clear}
            </button>
          </div>

          <div className="preview-table-wrapper">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>{t.date}</th>
                  <th>{t.description}</th>
                  <th className="text-right">{t.amount}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 50).map((tx) => (
                  <tr key={tx.id}>
                    <td className="date-cell">{tx.date}</td>
                    <td className="desc-cell">{tx.description}</td>
                    <td
                      className={`amount-cell ${tx.type === 'income' ? 'positive' : 'negative'}`}
                    >
                      {tx.type === 'income' ? '+' : ''}
                      {tx.amount.toLocaleString('de-DE', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length > 50 && (
              <p className="more-rows">{t.moreTransactions.replace('{count}', String(transactions.length - 50))}</p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="primary-button"
            onClick={handleConfirmImport}
            id="confirm-import"
          >
            <CheckCircle2 size={18} />
            {t.confirmImport}
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TransactionImporter;
