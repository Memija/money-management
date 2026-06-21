import { describe, it, expect } from 'vitest';
import {
  LOCALE_CONFIGS,
  ALL_SKIP_PATTERNS,
  ALL_TX_TYPES,
  ALL_ICON_PREFIX_RE,
  ALL_PROJECTED_DATE_RE,
  ALL_SUMMARY_KEYWORDS,
} from '../parser-i18n';

// ---------------------------------------------------------------------------
// LOCALE_CONFIGS shape
// ---------------------------------------------------------------------------

describe('LOCALE_CONFIGS', () => {
  const EXPECTED_LOCALES = ['de', 'en', 'bs', 'pl', 'sr', 'id'];

  it('contains all expected locales', () => {
    expect(Object.keys(LOCALE_CONFIGS)).toEqual(expect.arrayContaining(EXPECTED_LOCALES));
    expect(Object.keys(LOCALE_CONFIGS)).toHaveLength(EXPECTED_LOCALES.length);
  });

  it.each(EXPECTED_LOCALES)('%s locale has all required fields', (locale) => {
    const config = LOCALE_CONFIGS[locale];
    expect(config.skipPatterns).toBeInstanceOf(Array);
    expect(config.skipPatterns.length).toBeGreaterThan(0);
    expect(config.txTypes).toBeInstanceOf(Array);
    expect(config.txTypes.length).toBeGreaterThan(0);
    expect(config.projectedDateRe).toBeInstanceOf(RegExp);
    expect(config.iconPrefixRe).toBeInstanceOf(RegExp);
    expect(config.summaryKeywords).toBeInstanceOf(Array);
    expect(config.summaryKeywords.length).toBeGreaterThan(0);
  });

  it.each(EXPECTED_LOCALES)('%s locale skipPatterns are all valid RegExp', (locale) => {
    for (const pattern of LOCALE_CONFIGS[locale].skipPatterns) {
      expect(pattern).toBeInstanceOf(RegExp);
      // Ensure the pattern can actually execute without throwing
      expect(() => pattern.test('some test string')).not.toThrow();
    }
  });

  it.each(EXPECTED_LOCALES)('%s locale txTypes are all lowercase strings', (locale) => {
    for (const type of LOCALE_CONFIGS[locale].txTypes) {
      expect(type).toBe(type.toLowerCase());
    }
  });
});

// ---------------------------------------------------------------------------
// ALL_SKIP_PATTERNS — combined from all locales
// ---------------------------------------------------------------------------

describe('ALL_SKIP_PATTERNS', () => {
  it('is a non-empty array of RegExp', () => {
    expect(ALL_SKIP_PATTERNS.length).toBeGreaterThan(0);
    for (const p of ALL_SKIP_PATTERNS) {
      expect(p).toBeInstanceOf(RegExp);
    }
  });

  it('matches German UI noise (de)', () => {
    const noiseLines = [
      '(Umsatzdetails öffnen)',
      'Menü öffnen',
      'Symbol',
      'Zahlungsverkehrspartner',
      'Betrag',
      'Mehr Optionen',
      'Umsatzübersicht',
      'Geld überweisen',
      'Suchen',
      'Filter',
      'Buchungsdetails erweitern',
      'Ihr Kontostand beträgt',
    ];
    for (const line of noiseLines) {
      expect(ALL_SKIP_PATTERNS.some((re) => re.test(line))).toBe(true);
    }
  });

  it('matches English UI noise (en)', () => {
    const noiseLines = [
      '(Open transaction details)',
      'Open menu',
      'Icon',
      'Payment partner',
      'Beneficiary',
      'Transaction type',
      'Amount',
      'More options',
      'Transfer money',
      'Search',
      'Expand booking details',
      'Your account balance is',
    ];
    for (const line of noiseLines) {
      expect(ALL_SKIP_PATTERNS.some((re) => re.test(line))).toBe(true);
    }
  });

  it('matches Bosnian UI noise (bs)', () => {
    const noiseLines = [
      '(Otvori detalje transakcije)',
      'Otvori meni',
      'Simbol',
      'Partner plaćanja',
      'Pretraži',
      'Pregled transakcija',
    ];
    for (const line of noiseLines) {
      expect(ALL_SKIP_PATTERNS.some((re) => re.test(line))).toBe(true);
    }
  });

  it('matches Polish UI noise (pl)', () => {
    const noiseLines = [
      '(Otwórz szczegóły transakcji)',
      'Otwórz menu',
      'Kwota',
      'Szukaj',
      'Filtr',
      'Saldo konta wynosi',
    ];
    for (const line of noiseLines) {
      expect(ALL_SKIP_PATTERNS.some((re) => re.test(line))).toBe(true);
    }
  });

  it('matches Serbian UI noise (sr)', () => {
    const noiseLines = [
      '(Otvori detalje transakcije)',
      'Otvori meni',
      'Iznos',
      'Pretraži',
      'Pregled transakcija',
    ];
    for (const line of noiseLines) {
      expect(ALL_SKIP_PATTERNS.some((re) => re.test(line))).toBe(true);
    }
  });

  it('matches Indonesian UI noise (id)', () => {
    const noiseLines = [
      '(Buka detail transaksi)',
      'Buka menu',
      'Jumlah',
      'Cari',
      'Ikhtisar transaksi',
      'Transfer uang',
    ];
    for (const line of noiseLines) {
      expect(ALL_SKIP_PATTERNS.some((re) => re.test(line))).toBe(true);
    }
  });

  it('matches generic IBANs regardless of locale', () => {
    const ibans = [
      'DE12 3456 7890 1234 5678 90',  // spaced, short final group
      'DE12345678901234567890',        // continuous
      'PL61109010140000071219812874',  // continuous non-DE
      'PL61 1090 1014 0000 0712 1981', // spaced, all digit groups
    ];
    for (const iban of ibans) {
      expect(ALL_SKIP_PATTERNS.some((re) => re.test(iban))).toBe(true);
    }
  });

  it('does NOT match actual transaction data', () => {
    const transactionLines = [
      'Max Mustermann',
      'Invoice reference 1234',
      '-50,00 EUR',
      '+2.000,00 EUR',
      '01.01.2024',
      'John Doe',
    ];
    for (const line of transactionLines) {
      expect(ALL_SKIP_PATTERNS.some((re) => re.test(line))).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// ALL_TX_TYPES — combined transaction type keywords
// ---------------------------------------------------------------------------

describe('ALL_TX_TYPES', () => {
  it('is a non-empty Set', () => {
    expect(ALL_TX_TYPES).toBeInstanceOf(Set);
    expect(ALL_TX_TYPES.size).toBeGreaterThan(0);
  });

  it('contains German transaction types', () => {
    expect(ALL_TX_TYPES.has('überweisung')).toBe(true);
    expect(ALL_TX_TYPES.has('lastschrift')).toBe(true);
    expect(ALL_TX_TYPES.has('dauerauftrag')).toBe(true);
    expect(ALL_TX_TYPES.has('gehalt')).toBe(true);
    expect(ALL_TX_TYPES.has('gutschrift')).toBe(true);
  });

  it('contains English transaction types', () => {
    expect(ALL_TX_TYPES.has('direct debit')).toBe(true);
    expect(ALL_TX_TYPES.has('standing order')).toBe(true);
    expect(ALL_TX_TYPES.has('transfer')).toBe(true);
    expect(ALL_TX_TYPES.has('salary')).toBe(true);
  });

  it('contains Bosnian transaction types', () => {
    expect(ALL_TX_TYPES.has('trajni nalog')).toBe(true);
    expect(ALL_TX_TYPES.has('prijenos')).toBe(true);
  });

  it('contains Polish transaction types', () => {
    expect(ALL_TX_TYPES.has('zlecenie stałe')).toBe(true);
    expect(ALL_TX_TYPES.has('polecenie zapłaty')).toBe(true);
    expect(ALL_TX_TYPES.has('przelew')).toBe(true);
  });

  it('contains Serbian transaction types', () => {
    expect(ALL_TX_TYPES.has('direktno zaduženje')).toBe(true);
    expect(ALL_TX_TYPES.has('prenos')).toBe(true);
  });

  it('contains Indonesian transaction types', () => {
    expect(ALL_TX_TYPES.has('debit langsung')).toBe(true);
    expect(ALL_TX_TYPES.has('perintah tetap')).toBe(true);
  });

  it('all entries are lowercase', () => {
    for (const type of ALL_TX_TYPES) {
      expect(type).toBe(type.toLowerCase());
    }
  });
});

// ---------------------------------------------------------------------------
// ALL_ICON_PREFIX_RE — strips avatar icon labels
// ---------------------------------------------------------------------------

describe('ALL_ICON_PREFIX_RE', () => {
  it('is a valid RegExp', () => {
    expect(ALL_ICON_PREFIX_RE).toBeInstanceOf(RegExp);
    expect(() => ALL_ICON_PREFIX_RE.test('test')).not.toThrow();
  });

  it('matches German icon prefixes', () => {
    expect(ALL_ICON_PREFIX_RE.test('Empfänger-Icon ')).toBe(true);
    expect(ALL_ICON_PREFIX_RE.test('Absender-Icon - ')).toBe(true);
    expect(ALL_ICON_PREFIX_RE.test('Empfanger-Icon ')).toBe(true); // without umlaut
  });

  it('matches English icon prefixes', () => {
    expect(ALL_ICON_PREFIX_RE.test('Receiver-Icon ')).toBe(true);
    expect(ALL_ICON_PREFIX_RE.test('Sender-Icon ')).toBe(true);
  });

  it('matches Bosnian icon prefixes', () => {
    expect(ALL_ICON_PREFIX_RE.test('Ikona-primatelja ')).toBe(true);
    expect(ALL_ICON_PREFIX_RE.test('Ikona-pošiljatelja ')).toBe(true);
  });

  it('matches Polish icon prefixes', () => {
    expect(ALL_ICON_PREFIX_RE.test('Ikona-odbiorcy ')).toBe(true);
    expect(ALL_ICON_PREFIX_RE.test('Ikona-nadawcy ')).toBe(true);
  });

  it('matches Serbian icon prefixes', () => {
    expect(ALL_ICON_PREFIX_RE.test('Ikona-primaoca ')).toBe(true);
    expect(ALL_ICON_PREFIX_RE.test('Ikona-pošiljaoca ')).toBe(true);
  });

  it('matches Indonesian icon prefixes', () => {
    expect(ALL_ICON_PREFIX_RE.test('Ikon-penerima ')).toBe(true);
    expect(ALL_ICON_PREFIX_RE.test('Ikon-pengirim ')).toBe(true);
  });

  it('strips the prefix correctly when used with replace()', () => {
    expect('Empfänger-Icon - Max Mustermann'.replace(ALL_ICON_PREFIX_RE, '')).toBe('Max Mustermann');
    expect('Receiver-Icon   John Doe'.replace(ALL_ICON_PREFIX_RE, '')).toBe('John Doe');
  });

  it('does NOT match regular partner names', () => {
    expect(ALL_ICON_PREFIX_RE.test('Max Mustermann')).toBe(false);
    expect(ALL_ICON_PREFIX_RE.test('Amazon')).toBe(false);
    expect(ALL_ICON_PREFIX_RE.test('John Doe')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ALL_PROJECTED_DATE_RE — pending booking date prefixes
// ---------------------------------------------------------------------------

describe('ALL_PROJECTED_DATE_RE', () => {
  it('is a valid RegExp', () => {
    expect(ALL_PROJECTED_DATE_RE).toBeInstanceOf(RegExp);
    expect(() => ALL_PROJECTED_DATE_RE.test('test')).not.toThrow();
  });

  it('matches German pending date (de)', () => {
    const m = 'Voraussichtliche Buchung: 15.01.2024'.match(ALL_PROJECTED_DATE_RE);
    expect(m).not.toBeNull();
    expect(m!.slice(1).find(Boolean)).toBe('15.01.2024');
  });

  it('matches English pending date (en)', () => {
    const m = 'Expected booking: 15.01.2024'.match(ALL_PROJECTED_DATE_RE);
    expect(m).not.toBeNull();
    expect(m!.slice(1).find(Boolean)).toBe('15.01.2024');
  });

  it('matches English "Pending:" prefix (en)', () => {
    const m = 'Pending: 20.06.2025'.match(ALL_PROJECTED_DATE_RE);
    expect(m).not.toBeNull();
    expect(m!.slice(1).find(Boolean)).toBe('20.06.2025');
  });

  it('matches Bosnian/Serbian pending date', () => {
    const m = 'Očekivano knjiženje: 15.01.2024'.match(ALL_PROJECTED_DATE_RE);
    expect(m).not.toBeNull();
    expect(m!.slice(1).find(Boolean)).toBe('15.01.2024');
  });

  it('matches Polish pending date (pl)', () => {
    const m = 'Przewidywana data księgowania: 15.01.2024'.match(ALL_PROJECTED_DATE_RE);
    expect(m).not.toBeNull();
    expect(m!.slice(1).find(Boolean)).toBe('15.01.2024');
  });

  it('matches Indonesian pending date (id)', () => {
    const m = 'Pembukuan yang diharapkan: 15.01.2024'.match(ALL_PROJECTED_DATE_RE);
    expect(m).not.toBeNull();
    expect(m!.slice(1).find(Boolean)).toBe('15.01.2024');
  });

  it('is case-insensitive', () => {
    expect(ALL_PROJECTED_DATE_RE.test('EXPECTED BOOKING: 01.01.2024')).toBe(true);
    expect(ALL_PROJECTED_DATE_RE.test('pending: 01.01.2024')).toBe(true);
  });

  it('does NOT match regular lines', () => {
    expect(ALL_PROJECTED_DATE_RE.test('01.01.2024')).toBe(false);
    expect(ALL_PROJECTED_DATE_RE.test('Max Mustermann')).toBe(false);
    expect(ALL_PROJECTED_DATE_RE.test('-50,00 EUR')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ALL_SUMMARY_KEYWORDS — footer/balance line detection
// ---------------------------------------------------------------------------

describe('ALL_SUMMARY_KEYWORDS', () => {
  it('is a non-empty string array', () => {
    expect(ALL_SUMMARY_KEYWORDS).toBeInstanceOf(Array);
    expect(ALL_SUMMARY_KEYWORDS.length).toBeGreaterThan(0);
    for (const kw of ALL_SUMMARY_KEYWORDS) {
      expect(typeof kw).toBe('string');
    }
  });

  it('contains German summary keywords', () => {
    expect(ALL_SUMMARY_KEYWORDS).toContain('saldo');
    expect(ALL_SUMMARY_KEYWORDS).toContain('summe');
    expect(ALL_SUMMARY_KEYWORDS).toContain('anfangssaldo');
    expect(ALL_SUMMARY_KEYWORDS).toContain('endsaldo');
    expect(ALL_SUMMARY_KEYWORDS).toContain('gesamtbetrag');
  });

  it('contains English summary keywords', () => {
    expect(ALL_SUMMARY_KEYWORDS).toContain('balance');
    expect(ALL_SUMMARY_KEYWORDS).toContain('opening balance');
    expect(ALL_SUMMARY_KEYWORDS).toContain('closing balance');
    expect(ALL_SUMMARY_KEYWORDS).toContain('total');
  });

  it('contains Polish summary keywords', () => {
    expect(ALL_SUMMARY_KEYWORDS).toContain('suma transakcji');
    expect(ALL_SUMMARY_KEYWORDS).toContain('saldo otwarcia');
    expect(ALL_SUMMARY_KEYWORDS).toContain('saldo zamknięcia');
  });

  it('contains Indonesian summary keywords', () => {
    expect(ALL_SUMMARY_KEYWORDS).toContain('saldo awal');
    expect(ALL_SUMMARY_KEYWORDS).toContain('saldo akhir');
    expect(ALL_SUMMARY_KEYWORDS).toContain('total transaksi');
  });

  it('all entries are lowercase', () => {
    for (const kw of ALL_SUMMARY_KEYWORDS) {
      expect(kw).toBe(kw.toLowerCase());
    }
  });
});
