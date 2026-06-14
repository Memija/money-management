import type { Transaction } from '../../types';
import { generateId, inferType, parseAmount, parseDate } from './helpers';

/**
 * Known preamble-row detection: some banks (ING, comdirect) emit metadata
 * rows before the actual column-header row. We detect the real header by
 * scanning rows until we find one whose cells contain recognised keywords.
 */
export function findHeaderRowIndex(rows: string[][]): number {
  const DATE_HINTS = ['datum', 'date', 'buchungstag', 'buchungsdatum', 'buchung', 'valuta', 'valutadatum', 'wertstellung'];
  const AMOUNT_HINTS = ['betrag', 'amount', 'umsatz', 'saldo', 'sum'];

  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const cells = rows[i].map((c) => c.toLowerCase().trim());
    const hasDate = cells.some((c) => DATE_HINTS.some((k) => c.includes(k)));
    const hasAmount = cells.some((c) => AMOUNT_HINTS.some((k) => c.includes(k)));
    if (hasDate && hasAmount) return i;
  }
  return 0; // fallback: treat row 0 as header
}

/**
 * Match a column header against a set of keywords.
 * Supports two strategies:
 *   1. Phrase match  — the full header equals the phrase (e.g. "umsatz in eur", "amount (eur)")
 *   2. Token match   — the header, split on non-alphanumeric chars, contains a keyword token
 *                      (prevents 'wert' matching 'wertstellung', 'umsatz' matching 'umsatzart')
 */
function headerMatches(h: string, keywords: string[], phrases: string[] = []): boolean {
  if (phrases.some((p) => h === p || h.startsWith(p))) return true;
  const tokens = h.split(/[^a-zäöüß0-9]+/).filter(Boolean);
  return keywords.some((k) => tokens.includes(k));
}

interface ColumnIndices {
  dateIdx: number;
  descIdx: number;
  amountIdx: number;
  sollIdx: number;
  habenIdx: number;
}

function detectColumnIndices(header: string[]): ColumnIndices {
  // ── Date column ──────────────────────────────────────────────────────────────
  let dateIdx = header.findIndex((h) =>
    headerMatches(h,
      ['date', 'datum', 'buchungstag', 'buchungsdatum', 'buchung', 'valuta', 'valutadatum', 'wertstellung', 'booking'],
    )
  );

  // ── Description column ───────────────────────────────────────────────────────
  let descIdx = header.findIndex((h) =>
    headerMatches(h,
      // Token-level keywords (whole-word match)
      ['description', 'beschreibung', 'verwendungszweck', 'buchungstext',
        'auftraggeber', 'empfanger', 'empfänger',
        'zahlungsempfanger', 'zahlungsempfänger',
        'zahlungspflichtige', // DKB gendered: "zahlungspflichtige*r"
        'beguenstigter', 'beguenstigte',
        'kontoinhaber', 'payee', 'recipient', 'purpose'],
      // Full-phrase overrides (e.g. slash-separated compound headers)
      ['auftraggeber/empfänger', 'auftraggeber/empfanger',
        'beguenstigter/zahlungspflichtiger'],
    )
  );

  // ── Amount column ────────────────────────────────────────────────────────────
  let amountIdx = header.findIndex((h) =>
    headerMatches(h,
      // Token-level keywords
      ['betrag', 'amount', 'umsatzbetrag', 'sum'],
      // Full-phrase overrides
      ['umsatz in eur', 'umsatz in usd', 'amount (eur)', 'amount (usd)',
        'umsatz', // standalone 'Umsatz' column (Volksbank) — only matched as exact phrase
        'saldo'],
    )
  );

  // Prefer 'Betrag' over 'Saldo' when both exist (saldo = running balance, not amount)
  const betragIdx = header.findIndex((h) => h === 'betrag' || h.startsWith('betrag'));
  if (betragIdx !== -1 && betragIdx !== amountIdx) amountIdx = betragIdx;

  // ── Soll / Haben split columns (Deutsche Bank and some older formats) ────────
  const sollIdx = header.findIndex((h) => h === 'soll');
  const habenIdx = header.findIndex((h) => h === 'haben');

  // Fallbacks
  if (dateIdx === -1) dateIdx = 0;
  if (descIdx === -1) descIdx = Math.min(1, header.length - 1);
  if (amountIdx === -1 && sollIdx === -1 && habenIdx === -1) amountIdx = Math.min(header.length - 1, 2);

  return { dateIdx, descIdx, amountIdx, sollIdx, habenIdx };
}

function parseRow(row: string[], indices: ColumnIndices, institution: string): Transaction | null {
  if (!row || row.every((cell) => !cell || cell.toString().trim() === '')) return null;

  const { dateIdx, descIdx, amountIdx, sollIdx, habenIdx } = indices;

  const rawAmount = row[amountIdx];
  const rawAmountStr = rawAmount?.toString().trim() ?? '';

  let amount: number;
  if (sollIdx !== -1 && habenIdx !== -1 && (!rawAmountStr || rawAmountStr === '0')) {
    // Deutsche Bank Soll/Haben mode: only one column is populated per row
    const soll = parseAmount(row[sollIdx]?.toString() ?? '0');
    const haben = parseAmount(row[habenIdx]?.toString() ?? '0');
    amount = haben > 0 ? haben : soll > 0 ? -Math.abs(soll) : 0;
  } else {
    amount = parseAmount(rawAmountStr || '0');
  }

  const rawDate = row[dateIdx]?.toString() ?? '';
  const desc = row[descIdx]?.toString?.() ?? 'Unknown';

  return {
    id: generateId(),
    date: parseDate(rawDate),
    description: desc.trim(),
    amount,
    currency: 'EUR',
    type: inferType(amount),
    institution,
  };
}

export function rowsToTransactions(rows: string[][], institution: string): Transaction[] {
  if (rows.length < 2) return [];

  // Skip preamble rows
  const headerRowIdx = findHeaderRowIndex(rows);
  const dataRows = rows.slice(headerRowIdx);
  if (dataRows.length < 2) return [];

  // Normalise header cells: lowercase, strip surrounding quotes
  const header = dataRows[0].map((h) => h?.toString().toLowerCase().trim() ?? '');
  const indices = detectColumnIndices(header);

  const transactions: Transaction[] = [];

  for (let i = 1; i < dataRows.length; i++) {
    const transaction = parseRow(dataRows[i], indices, institution);
    if (transaction) {
      transactions.push(transaction);
    }
  }

  return transactions;
}
