import type { Transaction } from '../../types';
import { generateId, inferType, parseAmount, parseDate } from './helpers';

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
  /^Umsatzübersicht$/i,
  /^Geld überweisen$/i,
  /^Wechseln$/i,
  /^Ihr Kontostand beträgt$/i,
  /^Details des Saldos anzeigen$/i,
  /^Ihr Konto weist aktuell einen negativen Kontostand auf/i,
  /^Dafür bezahlen Sie Zinsen/i,
  /^Planen Sie, diesen Saldo/i,
  /^Dann lassen Sie sich bei uns/i,
  /^Filter$/i,
  /^Suchen$/i,
  /^Buchungsdetails erweitern$/i,
  /^PDF\/CSV$/i,
  /^PremiumKonto/i,
  /^DE\d{2}\s\d{4}/i, // spaced IBAN
  /^DE\d{20}/i, // continuous IBAN
  /^\d{2}\.\d{2}\.\d{4},\s*\d{2}:\d{2}\s*Uhr/i, // Date + Time line
];

// Known transaction type keywords
const TX_TYPES = new Set([
  'dauerauftrag', 'lastschrift', 'überweisung', 'gutschrift', 'kartenzahlung',
  'einzahlung', 'auszahlung', 'zinsen', 'entgelt', 'rückbuchung', 'lohnzahlung',
  'gehalt', 'sepa-überweisung', 'sepa-lastschrift', 'direct debit', 'standing order',
]);

// Amount pattern: optional leading comma and minus or plus, digits with . or , separators, ends with EUR/€
const AMOUNT_RE = /^,?([+-]?\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(EUR|€)$/;
// Date header pattern: DD.MM.YYYY — standalone date line (day separator)
const DATE_HEADER_RE = /^(\d{1,2}\.\d{1,2}\.\d{2,4})$/;
// Projected booking date line: "Voraussichtliche Buchung: DD.MM.YYYY"
const PROJECTED_DATE_RE = /Voraussichtliche Buchung:\s*(\d{1,2}\.\d{1,2}\.\d{2,4})/i;

function getCleanLines(rawText: string): string[] {
  return rawText
    .split(/\r?\n/)
    .map((l) => l.replace(/[\u2212\u2013\u2014]/g, '-').trim())
    .filter((l) => l.length > 0 && !SKIP_PATTERNS.some((re) => re.test(l)));
}

interface RawTx {
  date: string;
  partner: string;
  desc: string;
  type: string;
  amount: number;
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

  let buf: { date: string; partner: string; desc: string; type: string; projDate: string | null } = {
    date: currentDate, partner: '', desc: '', type: '', projDate: null,
  };

  const pushBuf = (amount: number) => {
    if (!buf.partner && !buf.desc && !buf.type) return;
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
    id: generateId(),
    date: r.date,
    description: [r.partner, r.desc].filter(Boolean).join(' – ') || r.type || 'Unknown',
    amount: r.amount,
    currency: 'EUR',
    type: inferType(r.amount),
    institution,
  }));
}
