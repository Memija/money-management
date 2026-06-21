import { useState, useCallback } from 'react';
import type { ImportMethod, Transaction } from '../../types';
import type { TranslationStrings } from '../../i18n/types';
import * as XLSX from 'xlsx';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import {
  rowsToTransactions,
  parseBankStatementPaste,
  parsePdfText,
} from '../../utils/transaction-parsers';

export const useTransactionImport = (institutionName: string, method: ImportMethod | null, t?: TranslationStrings) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');

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
            if (txs.length === 0) throw new Error(t?.errorNoTransactionsInFile || 'No transactions found in the file.');
            setTransactions(txs);
          } else {
            // Read as binary buffer so we can detect and handle encoding ourselves
            const buffer = await file.arrayBuffer();

            // Try UTF-8 first; fall back to ISO-8859-1 (Latin-1) if replacement chars appear.
            // ING, Sparkasse, comdirect, Deutsche Bank, and older DKB exports use ISO-8859-1.
            let text = new TextDecoder('utf-8').decode(buffer);
            if (text.includes('\uFFFD')) {
              text = new TextDecoder('iso-8859-1').decode(buffer);
            }

            // Strip UTF-8 BOM (\uFEFF) — present in some ING and bank exports
            text = text.replace(/^\uFEFF/, '');

            // Detect separator using the first non-empty line
            const firstMeaningfulLine = text.split('\n').find((l) => l.trim()) ?? '';
            const cleanFirst = firstMeaningfulLine.replace(/\r$/, '');
            const sep = cleanFirst.includes(';') ? ';' : cleanFirst.includes('\t') ? '\t' : ',';
            const rows = text
              .trim()
              .split('\n')
              // Strip trailing \r (CRLF) and split into cells, unquoting each
              .map((line) => line.replace(/\r$/, '').split(sep).map((cell) => cell.replace(/^"|"$/g, '').trim()));
            const txs = rowsToTransactions(rows, institutionName);
            if (txs.length === 0) throw new Error(t?.errorNoTransactionsInCSV || 'No transactions found in the CSV.');
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
              .map((item) => (item as { str?: string }).str || '')
              .join(' ');
            fullText += pageText + '\n';
          }

          const txLines = parsePdfText(fullText, institutionName);
          if (txLines.length === 0) {
            throw new Error(
              t?.errorParsePdf || 'Could not auto-detect transactions in this PDF. Try exporting as CSV or Excel from your bank portal instead.'
            );
          }
          setTransactions(txLines);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t?.errorProcessFile || 'Failed to process file.');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [method, institutionName, t]
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
      if (lines.length < 2) {
        throw new Error(t?.errorParsePasteOneRow || 'Only 1 row detected. Please make sure to include a header row (e.g. "Date, Description, Amount") and at least one transaction row with a valid date format like DD.MM.YYYY.');
      }
      const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
      const rows = lines.map((l) => l.split(sep).map((c) => c.replace(/^"|"$/g, '').trim()));
      const csvTxs = rowsToTransactions(rows, institutionName, t);
      if (csvTxs.length === 0) {
        throw new Error(
          t?.errorParsePaste || 'No transactions could be parsed. Please try pasting directly from your bank\'s transaction list, or use a CSV/Excel export instead.'
        );
      }
      setTransactions(csvTxs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t?.errorParsePastedData || 'Failed to parse pasted data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  }, []);

  const handleUpdateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
  }, []);

  const handleClearAll = useCallback(() => {
    setTransactions([]);
    setFileName(null);
    setPasteText('');
  }, []);

  return {
    transactions,
    loading,
    error,
    fileName,
    pasteText,
    setPasteText,
    setError,
    setFileName,
    handleFileChange,
    handlePaste,
    handleRemoveTransaction,
    handleUpdateTransaction,
    handleClearAll
  };
};
