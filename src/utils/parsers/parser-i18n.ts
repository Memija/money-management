/**
 * Parser i18n configuration
 *
 * This file centralises all locale-specific strings used by the bank statement
 * parsers (paste-parser and pdf-parser). Each locale section contains:
 *
 *  - skipPatterns    – RegExp array: UI noise lines to discard before parsing
 *  - txTypes         – string array: known transaction-type label keywords
 *  - projectedDateRe – RegExp: matches a pending/projected booking-date prefix
 *  - iconPrefixRe    – RegExp: strips avatar icon prefixes from lines
 *
 * To add support for a new language:
 *  1. Add a new entry to LOCALE_CONFIGS with the locale code as key.
 *  2. Fill in the four fields using the bank-portal UI strings for that locale.
 *  3. No changes are required in paste-parser.ts or pdf-parser.ts.
 */

export interface ParserLocaleConfig {
  /** Lines that are pure UI noise and must be discarded before parsing. */
  skipPatterns: RegExp[];
  /** Lower-cased transaction-type keywords (e.g. "direct debit"). */
  txTypes: string[];
  /** Matches a pending/projected booking-date prefix, capturing the date in group 1. */
  projectedDateRe: RegExp;
  /** Strips avatar / icon label prefixes from a copied line. */
  iconPrefixRe: RegExp;
  /** Keywords that indicate a PDF summary / balance footer line. */
  summaryKeywords: string[];
}

// ---------------------------------------------------------------------------
// German (de)
// ---------------------------------------------------------------------------
const de: ParserLocaleConfig = {
  skipPatterns: [
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
    /^\d{2}\.\d{2}\.\d{4},\s*\d{2}:\d{2}\s*Uhr/i, // Date + Time line
  ],
  txTypes: [
    'dauerauftrag', 'lastschrift', 'überweisung', 'gutschrift', 'kartenzahlung',
    'einzahlung', 'auszahlung', 'zinsen', 'entgelt', 'rückbuchung', 'lohnzahlung',
    'gehalt', 'sepa-überweisung', 'sepa-lastschrift',
  ],
  projectedDateRe: /Voraussichtliche Buchung:\s*(\d{1,2}\.\d{1,2}\.\d{2,4})/i,
  iconPrefixRe: /^(?:Empf[aä]nger-Icon|Absender-Icon)[\s-]+/i,
  summaryKeywords: [
    'summe der umsätze', 'summe der umsatze', 'umsätze gesamt', 'umsatze gesamt',
    'saldo', 'anfangssaldo', 'endsaldo', 'kontostand', 'neuer kontostand',
    'alter kontostand', 'übertrag', 'ubertrag', 'summe', 'gesamtbetrag',
  ],
};

// ---------------------------------------------------------------------------
// English (en)
// ---------------------------------------------------------------------------
const en: ParserLocaleConfig = {
  skipPatterns: [
    /^\(Open transaction details\)$/i,
    /^Open menu$/i,
    /^Icon$/i,
    /^Payment partner$/i,
    /^Beneficiary$/i,
    /^Expected booking$/i,
    /^Transaction type$/i,
    /^Amount$/i,
    /^More options$/i,
    /^Transactions (for today|from yesterday|from)/i,
    /^The daily balance is/i,
    /^Daily balance:/i,
    /^Transactions for/i,
    /^\d+ Transaction/i,
    /^Not included in balance/i,
    /^Transaction overview$/i,
    /^Transfer money$/i,
    /^Switch$/i,
    /^Exchange$/i,
    /^Your account balance is$/i,
    /^Show balance details$/i,
    /^Your account currently has a negative balance/i,
    /^You pay interest for this/i,
    /^Are you planning to/i,
    /^Then let us/i,
    /^Filter$/i,
    /^Search$/i,
    /^Expand booking details$/i,
    /^PDF\/CSV$/i,
    /^PremiumAccount/i,
  ],
  txTypes: [
    'direct debit', 'standing order', 'transfer', 'credit', 'card payment',
    'deposit', 'withdrawal', 'interest', 'fee', 'chargeback', 'salary',
    'payroll', 'sepa transfer', 'sepa direct debit', 'payment',
  ],
  projectedDateRe: /(?:Expected booking|Pending):\s*(\d{1,2}\.\d{1,2}\.\d{2,4})/i,
  iconPrefixRe: /^(?:Receiver-Icon|Sender-Icon)[\s-]+/i,
  summaryKeywords: [
    'total transactions', 'total sum', 'balance', 'opening balance', 'closing balance',
    'account balance', 'new balance', 'old balance', 'carried forward', 'total', 'total amount',
  ],
};

// ---------------------------------------------------------------------------
// Bosnian (bs)
// ---------------------------------------------------------------------------
const bs: ParserLocaleConfig = {
  skipPatterns: [
    /^\(Otvori detalje transakcije\)$/i,
    /^Otvori meni$/i,
    /^Simbol$/i,
    /^Partner plaćanja$/i,
    /^Korisnik plaćanja$/i,
    /^Vrsta transakcije$/i,
    /^Iznos$/i,
    /^Više opcija$/i,
    /^Transakcije (za danas|od juče|od)/i,
    /^Dnevni saldo iznosi/i,
    /^Dnevni saldo:/i,
    /^Transakcije za/i,
    /^\d+ transakcij/i,
    /^Nije uključeno u saldo/i,
    /^Pregled transakcija$/i,
    /^Prijenos novca$/i,
    /^Prebaci$/i,
    /^Vaš saldo iznosi$/i,
    /^Prikaži detalje salda$/i,
    /^Vaš račun trenutno ima negativan saldo/i,
    /^Plaćate kamate/i,
    /^Filter$/i,
    /^Pretraži$/i,
    /^Proširi detalje knjiženja$/i,
    /^PDF\/CSV$/i,
  ],
  txTypes: [
    'trajni nalog', 'direktna terećenja', 'prijenos', 'odobrenje', 'plaćanje karticom',
    'uplata', 'isplata', 'kamate', 'naknada', 'povrat', 'plaća',
    'sepa prijenos', 'sepa direktna terećenja',
  ],
  projectedDateRe: /(?:Očekivano knjiženje|Na čekanju):\s*(\d{1,2}\.\d{1,2}\.\d{2,4})/i,
  iconPrefixRe: /^(?:Ikona-primatelja|Ikona-pošiljatelja)[\s-]+/i,
  summaryKeywords: [
    'ukupno transakcija', 'ukupan iznos', 'saldo', 'početni saldo', 'završni saldo',
    'stanje računa', 'novi saldo', 'stari saldo', 'preneseno', 'ukupno',
  ],
};

// ---------------------------------------------------------------------------
// Polish (pl)
// ---------------------------------------------------------------------------
const pl: ParserLocaleConfig = {
  skipPatterns: [
    /^\(Otwórz szczegóły transakcji\)$/i,
    /^Otwórz menu$/i,
    /^Symbol$/i,
    /^Partner płatności$/i,
    /^Odbiorca$/i,
    /^Rodzaj transakcji$/i,
    /^Kwota$/i,
    /^Więcej opcji$/i,
    /^Transakcje (na dziś|ze wczoraj|z)/i,
    /^Saldo dzienne wynosi/i,
    /^Saldo dzienne:/i,
    /^Transakcje za/i,
    /^\d+ transakcj/i,
    /^Nie ujęte w saldzie/i,
    /^Przegląd transakcji$/i,
    /^Przelej pieniądze$/i,
    /^Zmień$/i,
    /^Saldo konta wynosi$/i,
    /^Pokaż szczegóły salda$/i,
    /^Twoje konto ma ujemne saldo/i,
    /^Płacisz odsetki/i,
    /^Filtr$/i,
    /^Szukaj$/i,
    /^Rozwiń szczegóły transakcji$/i,
    /^PDF\/CSV$/i,
  ],
  txTypes: [
    'zlecenie stałe', 'polecenie zapłaty', 'przelew', 'uznanie', 'płatność kartą',
    'wpłata', 'wypłata', 'odsetki', 'opłata', 'zwrot', 'wynagrodzenie',
    'przelew sepa', 'polecenie zapłaty sepa',
  ],
  projectedDateRe: /(?:Przewidywana data księgowania|Oczekuje):\s*(\d{1,2}\.\d{1,2}\.\d{2,4})/i,
  iconPrefixRe: /^(?:Ikona-odbiorcy|Ikona-nadawcy)[\s-]+/i,
  summaryKeywords: [
    'suma transakcji', 'łączna kwota', 'saldo', 'saldo otwarcia', 'saldo zamknięcia',
    'saldo konta', 'nowe saldo', 'stare saldo', 'przeniesione', 'razem', 'suma',
  ],
};

// ---------------------------------------------------------------------------
// Serbian (sr)
// ---------------------------------------------------------------------------
const sr: ParserLocaleConfig = {
  skipPatterns: [
    /^\(Otvori detalje transakcije\)$/i,
    /^Otvori meni$/i,
    /^Simbol$/i,
    /^Partner plaćanja$/i,
    /^Korisnik plaćanja$/i,
    /^Vrsta transakcije$/i,
    /^Iznos$/i,
    /^Više opcija$/i,
    /^Transakcije (za danas|od juče|od)/i,
    /^Dnevni saldo iznosi/i,
    /^Dnevni saldo:/i,
    /^Transakcije za/i,
    /^\d+ transakcij/i,
    /^Nije uključeno u saldo/i,
    /^Pregled transakcija$/i,
    /^Prenos novca$/i,
    /^Zameni$/i,
    /^Vaš saldo iznosi$/i,
    /^Prikaži detalje stanja$/i,
    /^Vaš račun trenutno ima negativno stanje/i,
    /^Plaćate kamatu/i,
    /^Filter$/i,
    /^Pretraži$/i,
    /^Proširi detalje knjiženja$/i,
    /^PDF\/CSV$/i,
  ],
  txTypes: [
    'trajni nalog', 'direktno zaduženje', 'prenos', 'uplata', 'plaćanje karticom',
    'depozit', 'isplata', 'kamata', 'naknada', 'povraćaj', 'plata',
    'sepa prenos', 'sepa direktno zaduženje',
  ],
  projectedDateRe: /(?:Očekivano knjiženje|Na čekanju):\s*(\d{1,2}\.\d{1,2}\.\d{2,4})/i,
  iconPrefixRe: /^(?:Ikona-primaoca|Ikona-pošiljaoca)[\s-]+/i,
  summaryKeywords: [
    'ukupno transakcija', 'ukupan iznos', 'saldo', 'početni saldo', 'krajnji saldo',
    'stanje računa', 'novi saldo', 'stari saldo', 'preneseno', 'ukupno',
  ],
};

// ---------------------------------------------------------------------------
// Indonesian (id)
// ---------------------------------------------------------------------------
const id: ParserLocaleConfig = {
  skipPatterns: [
    /^\(Buka detail transaksi\)$/i,
    /^Buka menu$/i,
    /^Simbol$/i,
    /^Mitra pembayaran$/i,
    /^Penerima$/i,
    /^Jenis transaksi$/i,
    /^Jumlah$/i,
    /^Lebih banyak opsi$/i,
    /^Transaksi (untuk hari ini|dari kemarin|dari)/i,
    /^Saldo harian adalah/i,
    /^Saldo harian:/i,
    /^Transaksi untuk/i,
    /^\d+ transaksi/i,
    /^Tidak termasuk dalam saldo/i,
    /^Ikhtisar transaksi$/i,
    /^Transfer uang$/i,
    /^Ganti$/i,
    /^Tukar$/i,
    /^Saldo rekening Anda adalah$/i,
    /^Tampilkan detail saldo$/i,
    /^Rekening Anda saat ini memiliki saldo negatif/i,
    /^Anda membayar bunga/i,
    /^Filter$/i,
    /^Cari$/i,
    /^Perluas detail pembukuan$/i,
    /^PDF\/CSV$/i,
  ],
  txTypes: [
    'perintah tetap', 'debit langsung', 'transfer', 'kredit', 'pembayaran kartu',
    'setor', 'tarik', 'bunga', 'biaya', 'pengembalian', 'gaji',
    'transfer sepa', 'debit langsung sepa',
  ],
  projectedDateRe: /(?:Pembukuan yang diharapkan|Tertunda):\s*(\d{1,2}\.\d{1,2}\.\d{2,4})/i,
  iconPrefixRe: /^(?:Ikon-penerima|Ikon-pengirim)[\s-]+/i,
  summaryKeywords: [
    'total transaksi', 'jumlah total', 'saldo', 'saldo awal', 'saldo akhir',
    'saldo rekening', 'saldo baru', 'saldo lama', 'dibawa', 'total', 'jumlah',
  ],
};

// ---------------------------------------------------------------------------
// Aggregated exports
// ---------------------------------------------------------------------------

/**
 * All locale configs keyed by locale code.
 * Add a new entry here to support an additional language.
 */
export const LOCALE_CONFIGS: Record<string, ParserLocaleConfig> = { de, en, bs, pl, sr, id };

/**
 * Combined SKIP_PATTERNS drawn from every locale – used by parsers that
 * operate without knowing the portal language in advance.
 */
export const ALL_SKIP_PATTERNS: RegExp[] = [
  // Structural patterns that apply regardless of locale
  /^[A-Z]{2}\d{2}\s(?:\d{4}\s)*\d{1,4}/i, // Generic spaced IBAN
  /^[A-Z]{2}\d{14,32}/i,                 // Generic continuous IBAN
  ...Object.values(LOCALE_CONFIGS).flatMap((c) => c.skipPatterns),
];

/**
 * Combined TX_TYPES set drawn from every locale – used to identify transaction
 * type label lines without knowing the portal language in advance.
 */
export const ALL_TX_TYPES: Set<string> = new Set(
  Object.values(LOCALE_CONFIGS).flatMap((c) => c.txTypes),
);

/**
 * Combined icon-prefix pattern that strips avatar labels in any locale.
 * Falls back gracefully if a locale's pattern doesn't match.
 */
export const ALL_ICON_PREFIX_RE: RegExp = new RegExp(
  Object.values(LOCALE_CONFIGS)
    .map((c) => c.iconPrefixRe.source)
    .join('|'),
  'i',
);

/**
 * Combined projected-date pattern that matches pending booking annotations
 * in any locale, capturing the date in group 1.
 */
export const ALL_PROJECTED_DATE_RE: RegExp = new RegExp(
  Object.values(LOCALE_CONFIGS)
    .map((c) => `(?:${c.projectedDateRe.source})`)
    .join('|'),
  'i',
);

/**
 * Combined summary keywords drawn from every locale – used by the PDF parser
 * to skip balance/total footer lines.
 */
export const ALL_SUMMARY_KEYWORDS: string[] = Object.values(LOCALE_CONFIGS).flatMap(
  (c) => c.summaryKeywords,
);
