import type { Transaction } from '../../types';
import { generateId, inferType, parseAmount, parseDate } from './helpers';
import { ALL_SKIP_PATTERNS, ALL_TX_TYPES, ALL_ICON_PREFIX_RE, ALL_PROJECTED_DATE_RE } from './parser-i18n';

// Amount pattern: optional leading comma and minus or plus, digits with . or , separators, ends with common currency
const AMOUNT_RE = /^,?([+-]?\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*([A-Z]{3}|€|£|\$|zł)$/i;
// Date header pattern: DD.MM.YYYY — standalone date line (day separator)
const DATE_HEADER_RE = /^(\d{1,2}\.\d{1,2}\.\d{2,4})$/;

function getCleanLines(rawText: string): string[] {
  return rawText
    .normalize('NFC')
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/[\u2212\u2013\u2014]/g, '-').replace(ALL_ICON_PREFIX_RE, '').trim())
    .filter((l) => l.length > 0 && !ALL_SKIP_PATTERNS.some((re) => re.test(l)));
}

interface RawTx {
  date: string;
  partner: string;
  desc: string;
  type: string;
  amount: number;
  currency: string;
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
export function parseBankStatementPaste(rawText: string, institution: string): Transaction[] {
  const cleanLines = getCleanLines(rawText);

  let currentDate = new Date().toISOString().split('T')[0];
  const rawTxs: RawTx[] = [];

  let buf: { date: string; partner: string; desc: string; type: string; projDate: string | null, currency: string } = {
    date: currentDate, partner: '', desc: '', type: '', projDate: null, currency: 'EUR'
  };

  const pushBuf = (amount: number, currency: string) => {
    if (!buf.partner && !buf.desc && !buf.type) {
      return;
    }
    rawTxs.push({
      date: buf.projDate ?? buf.date,
      partner: buf.partner,
      desc: buf.desc,
      type: buf.type,
      amount,
      currency,
    });
    buf = { date: buf.date, partner: '', desc: '', type: '', projDate: null, currency: 'EUR' };
  };

  for (const line of cleanLines) {
    // Projected booking date annotation (pending transactions)
    const projMatch = line.match(ALL_PROJECTED_DATE_RE);
    if (projMatch) {
      // Find first captured group (date) — varies by locale branch
      const dateStr = projMatch.slice(1).find(Boolean);
      if (dateStr) {
        buf.projDate = parseDate(dateStr);
      }
      continue;
    }

    // Date header line — new calendar day
    if (DATE_HEADER_RE.test(line)) {
      currentDate = parseDate(line);
      buf.date = currentDate;
      continue;
    }

    // Amount line — finalises the current transaction buffer
    const amtMatch = line.match(AMOUNT_RE);
    if (amtMatch) {
      let curr = amtMatch[2].toUpperCase();
      if (curr === '€') {
        curr = 'EUR';
      } else if (curr === '$') {
        curr = 'USD';
      } else if (curr === '£') {
        curr = 'GBP';
      } else if (curr === 'ZŁ') {
        curr = 'PLN';
      }
      pushBuf(parseAmount(amtMatch[1]), curr);
      continue;
    }

    // Transaction type keyword
    if (ALL_TX_TYPES.has(line.toLowerCase())) {
      buf.type = line;
      continue;
    }

    // Avatar initials placeholder (e.g. "AM", "MG") — skip
    if (/^[A-Z]{1,3}$/.test(line)) {
      continue;
    }

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
    id: generateId(),
    date: r.date,
    description: [r.partner, r.desc].filter(Boolean).join(' – ') || r.type || 'Unknown',
    amount: r.amount,
    currency: r.currency,
    type: inferType(r.amount),
    institution,
  }));
}
