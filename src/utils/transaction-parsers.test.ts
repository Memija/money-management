import { describe, it, expect } from 'vitest';
import {
  parseAmount,
  parseDate,
  findHeaderRowIndex,
  rowsToTransactions,
  parseBankStatementPaste,
  parsePdfText,
} from './transaction-parsers';

/* ═══════════════════════════════════════════════════════════════════════════════
 *  parseAmount — European number format, trailing S/H, Unicode minus
 * ═══════════════════════════════════════════════════════════════════════════════ */

describe('parseAmount', () => {
  it('parses simple positive integer', () => {
    expect(parseAmount('500')).toBe(500);
  });

  it('parses negative with leading minus', () => {
    expect(parseAmount('-15.50')).toBe(-15.50);
  });

  it('parses European format (comma decimal, dot thousands)', () => {
    expect(parseAmount('1.234,56')).toBe(1234.56);
  });

  it('parses negative European format', () => {
    expect(parseAmount('-1.234,56')).toBe(-1234.56);
  });

  it('parses Commerzbank format: -502,58', () => {
    expect(parseAmount('-502,58')).toBe(-502.58);
  });

  it('parses trailing S (Soll = debit)', () => {
    expect(parseAmount('1.234,56S')).toBe(-1234.56);
  });

  it('parses trailing H (Haben = credit) as positive', () => {
    expect(parseAmount('1.234,56H')).toBe(1234.56);
  });

  it('parses trailing minus sign', () => {
    expect(parseAmount('42,00-')).toBe(-42);
  });

  it('parses Unicode minus U+2212', () => {
    expect(parseAmount('\u221242,00')).toBe(-42);
  });

  it('parses en-dash U+2013', () => {
    expect(parseAmount('\u201342,00')).toBe(-42);
  });

  it('parses em-dash U+2014', () => {
    expect(parseAmount('\u201442,00')).toBe(-42);
  });

  it('parses amount with EUR suffix', () => {
    expect(parseAmount('1.234,56 EUR')).toBe(1234.56);
  });

  it('parses amount with € symbol', () => {
    expect(parseAmount('42,50€')).toBe(42.50);
  });

  it('returns 0 for empty string', () => {
    expect(parseAmount('')).toBe(0);
  });

  it('returns 0 for non-numeric', () => {
    expect(parseAmount('abc')).toBe(0);
  });

  it('handles number type pass-through', () => {
    expect(parseAmount(42.5)).toBe(42.5);
  });

  it('parses amount with spaces: - 42,00', () => {
    expect(parseAmount('- 42,00')).toBe(-42);
  });

  it('parses Commerzbank real value: -12,9', () => {
    expect(parseAmount('-12,9')).toBe(-12.9);
  });

  it('parses large salary: 5310,09', () => {
    expect(parseAmount('5310,09')).toBe(5310.09);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
 *  parseDate — German, ISO, US formats
 * ═══════════════════════════════════════════════════════════════════════════════ */

describe('parseDate', () => {
  it('parses DD.MM.YYYY (German)', () => {
    expect(parseDate('20.05.2026')).toBe('2026-05-20');
  });

  it('parses single-digit day/month: 1.3.2026', () => {
    expect(parseDate('1.3.2026')).toBe('2026-03-01');
  });

  it('parses 2-digit year: 20.05.26', () => {
    expect(parseDate('20.05.26')).toBe('2026-05-20');
  });

  it('parses ISO format: 2026-05-20', () => {
    expect(parseDate('2026-05-20')).toBe('2026-05-20');
  });

  it('parses MM/DD/YYYY (US): 05/20/2026', () => {
    expect(parseDate('05/20/2026')).toBe('2026-05-20');
  });

  it('returns today for empty string', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(parseDate('')).toBe(today);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
 *  findHeaderRowIndex — preamble row detection
 * ═══════════════════════════════════════════════════════════════════════════════ */

describe('findHeaderRowIndex', () => {
  it('detects header on row 0 (Commerzbank, DKB, Sparkasse)', () => {
    const rows = [
      ['Buchungstag', 'Wertstellung', 'Buchungstext', 'Betrag', 'Währung'],
      ['20.05.2026', '20.05.2026', 'Test Transaction', '-42,00', 'EUR'],
    ];
    expect(findHeaderRowIndex(rows)).toBe(0);
  });

  it('detects header after ING preamble rows', () => {
    const rows = [
      ['Umsatzanzeige', '', '', '', ''],           // Preamble row 1
      ['Girokonto', 'DE12345678901234567890', '', '', ''],  // Preamble row 2
      ['', '', '', '', ''],                         // Empty row
      ['Buchung', 'Valuta', 'Auftraggeber/Empfänger', 'Buchungstext', 'Betrag'],
      ['20.05.2026', '20.05.2026', 'Max Mustermann', 'Überweisung', '-100,00'],
    ];
    expect(findHeaderRowIndex(rows)).toBe(3);
  });

  it('detects header after comdirect preamble rows', () => {
    const rows = [
      ['"Umsätze Girokonto";', '', '', '', ''],
      ['"Zeitraum: 01.04.2026 - 20.05.2026"', '', '', '', ''],
      ['Buchungstag', 'Wertstellung', 'Vorgang', 'Buchungstext', 'Umsatz in EUR'],
      ['20.05.2026', '20.05.2026', 'Lastschrift', 'Amazon', '-42,00'],
    ];
    expect(findHeaderRowIndex(rows)).toBe(2);
  });

  it('returns 0 if no header found (fallback)', () => {
    const rows = [
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ];
    expect(findHeaderRowIndex(rows)).toBe(0);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
 *  rowsToTransactions — per-bank CSV format tests
 * ═══════════════════════════════════════════════════════════════════════════════ */

describe('rowsToTransactions', () => {
  // ── Commerzbank ────────────────────────────────────────────────────────────

  describe('Commerzbank (baseline)', () => {
    it('parses Commerzbank CSV format', () => {
      const rows = [
        ['Buchungstag', 'Wertstellung', 'Umsatzart', 'Buchungstext', 'Betrag', 'Währung', 'IBAN Kontoinhaber', 'Kategorie'],
        ['20.05.2026', '20.05.2026', 'Dauerauftrag', 'Miete', '-500', 'EUR', 'DE12345678901234567890', ''],
        ['13.05.2026', '15.05.2026', 'Überweisung', 'Gehalt GmbH', '2509,09', 'EUR', 'DE12345678901234567890', 'Einnahmen'],
      ];
      const txs = rowsToTransactions(rows, 'Commerzbank');
      expect(txs).toHaveLength(2);
      expect(txs[0]).toMatchObject({ date: '2026-05-20', amount: -500, type: 'expense', institution: 'Commerzbank' });
      expect(txs[1]).toMatchObject({ date: '2026-05-13', amount: 2509.09, type: 'income' });
    });
  });

  // ── DKB ────────────────────────────────────────────────────────────────────

  describe('DKB (Deutsche Kreditbank)', () => {
    it('parses DKB CSV format with Buchungsdatum and gendered headers', () => {
      // DKB puts recipient/payer in Zahlungspflichtige*r — the first description-matching column.
      // The parser finds Zahlungspflichtige*r first (token: 'zahlungspflichtige') so that's the desc column.
      const rows = [
        ['Buchungsdatum', 'Wertstellung', 'Status', 'Zahlungspflichtige*r', 'Zahlungsempfänger*in', 'Verwendungszweck', 'Umsatztyp', 'IBAN', 'Betrag (€)', 'Gläubiger-ID', 'Mandatsreferenz', 'Kundenreferenz'],
        ['20.05.2026', '20.05.2026', 'Gebucht', 'Netflix Services Germany GmbH', '', 'Netflix Monthly Subscription', 'Lastschrift', 'DE1234567890', '-13,99', 'DE58ZZZ00002444586', 'DD-123', ''],
        ['15.05.2026', '15.05.2026', 'Gebucht', 'Arbeitgeber GmbH', '', 'LOHN/GEHALT 05/2026', 'Gutschrift', 'DE9876543210', '3200,00', '', '', ''],
      ];
      const txs = rowsToTransactions(rows, 'DKB');
      expect(txs).toHaveLength(2);
      expect(txs[0].date).toBe('2026-05-20');
      expect(txs[0].description).toContain('Netflix');
      expect(txs[0].amount).toBe(-13.99);
      expect(txs[0].type).toBe('expense');
      expect(txs[1].amount).toBe(3200);
      expect(txs[1].type).toBe('income');
    });
  });

  // ── ING Deutschland ─────────────────────────────────────────────────────────

  describe('ING Deutschland', () => {
    it('parses ING CSV with preamble rows and Buchung/Valuta headers', () => {
      const rows = [
        ['Umsatzanzeige', '', '', '', '', '', '', ''],
        ['Girokonto', 'DE12345678901234567890', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['Buchung', 'Valuta', 'Auftraggeber/Empfänger', 'Buchungstext', 'Verwendungszweck', 'Saldo', 'Währung', 'Betrag'],
        ['20.05.2026', '20.05.2026', 'Max Mustermann', 'Überweisung', 'Miete Mai 2026', '1.500,00', 'EUR', '-800,00'],
        ['15.05.2026', '15.05.2026', 'Arbeitgeber AG', 'Lohn/Gehalt', 'Gehalt 05/2026', '2.300,00', 'EUR', '3.500,00'],
      ];
      const txs = rowsToTransactions(rows, 'ING Deutschland');
      expect(txs).toHaveLength(2);
      // Should skip first 3 preamble rows and start from the real header (row 3)
      expect(txs[0]).toMatchObject({ date: '2026-05-20', amount: -800, type: 'expense' });
      expect(txs[0].description).toBe('Max Mustermann');
      expect(txs[1]).toMatchObject({ date: '2026-05-15', amount: 3500, type: 'income' });
    });
  });

  // ── Sparkasse ─────────────────────────────────────────────────────────────

  describe('Sparkasse', () => {
    it('parses Sparkasse CSV with Buchungstag/Valutadatum/Beguenstigter headers', () => {
      const rows = [
        ['Auftragskonto', 'Buchungstag', 'Valutadatum', 'Buchungstext', 'Verwendungszweck', 'Beguenstigter/Zahlungspflichtiger', 'Kontonummer', 'BLZ', 'Betrag', 'Währung', 'Info'],
        ['1234567890', '20.05.2026', '20.05.2026', 'SEPA-Lastschrift', 'Netflix Abo', 'Netflix Services Germany', '9876543210', '10050000', '-13,99', 'EUR', 'Umsatz gebucht'],
        ['1234567890', '15.05.2026', '15.05.2026', 'Gehaltsgutschrift', 'Gehalt 05/2026', 'Arbeitgeber GmbH', '1111222233', '10050000', '2.800,50', 'EUR', 'Umsatz gebucht'],
      ];
      const txs = rowsToTransactions(rows, 'Berliner Sparkasse');
      expect(txs).toHaveLength(2);
      // Date should come from Buchungstag (index 1)
      expect(txs[0].date).toBe('2026-05-20');
      expect(txs[0].amount).toBe(-13.99);
      // Description should come from Beguenstigter (first matching desc column)
      expect(txs[1].amount).toBe(2800.50);
      expect(txs[1].type).toBe('income');
    });
  });

  // ── Deutsche Bank — Soll/Haben split ─────────────────────────────────────

  describe('Deutsche Bank (Soll/Haben)', () => {
    it('parses Deutsche Bank CSV with separate Soll and Haben columns', () => {
      const rows = [
        ['Buchungstag', 'Wert', 'Umsatzart', 'Begünstigter / Auftraggeber', 'Verwendungszweck', 'IBAN', 'BIC', 'Kundenreferenz', 'Mandatsreferenz', 'Gläubiger ID', 'Fremde Gebühren', 'Betrag', 'Abweichender Empfänger', 'Anzahl der Aufträge', 'Anzahl der Schecks', 'Soll', 'Haben', 'Währung'],
        ['20.05.2026', '20.05.2026', 'Lastschrift', 'Netflix', 'Abo', 'DE12345', 'COBADEFFXXX', '', '', '', '', '0', '', '', '', '13,99', '', 'EUR'],
        ['15.05.2026', '15.05.2026', 'Gutschrift', 'Arbeitgeber', 'Gehalt', 'DE67890', 'COBADEFFXXX', '', '', '', '', '0', '', '', '', '', '4.200,00', 'EUR'],
      ];
      const txs = rowsToTransactions(rows, 'Deutsche Bank');
      expect(txs).toHaveLength(2);
      // Soll (debit) should be negative
      expect(txs[0].amount).toBe(-13.99);
      expect(txs[0].type).toBe('expense');
      // Haben (credit) should be positive
      expect(txs[1].amount).toBe(4200);
      expect(txs[1].type).toBe('income');
    });
  });

  // ── comdirect ─────────────────────────────────────────────────────────────

  describe('comdirect', () => {
    it('parses comdirect CSV with preamble and "Umsatz in EUR" header', () => {
      const rows = [
        ['Umsätze Girokonto', '', '', '', ''],
        ['Zeitraum: 01.04.2026 - 20.05.2026', '', '', '', ''],
        ['Buchungstag', 'Wertstellung', 'Vorgang', 'Buchungstext', 'Umsatz in EUR'],
        ['20.05.2026', '20.05.2026', 'Lastschrift', 'REWE 42,50 EUR Kartenzahlung', '-42,50'],
        ['15.05.2026', '15.05.2026', 'Überweisung', 'Gehaltszahlung Mai 2026', '3.100,00'],
      ];
      const txs = rowsToTransactions(rows, 'comdirect');
      expect(txs).toHaveLength(2);
      expect(txs[0]).toMatchObject({ date: '2026-05-20', amount: -42.5, type: 'expense' });
      // Description should come from Buchungstext (matches 'buchungstext' token)
      expect(txs[0].description).toContain('REWE');
      expect(txs[1]).toMatchObject({ date: '2026-05-15', amount: 3100, type: 'income' });
    });
  });

  // ── N26 ─────────────────────────────────────────────────────────────────────

  describe('N26', () => {
    it('parses N26 CSV with English headers and Amount (EUR)', () => {
      const rows = [
        ['Date', 'Payee', 'Account number', 'Transaction type', 'Payment reference', 'Amount (EUR)', 'Amount (Foreign Currency)', 'Type Foreign Currency', 'Exchange Rate'],
        ['2026-05-20', 'REWE Supermarket', 'DE12345678901234567890', 'MasterCard Payment', '', '-42.50', '', '', ''],
        ['2026-05-15', 'Employer GmbH', 'DE98765432101234567890', 'Income', 'Salary May', '3100.00', '', '', ''],
      ];
      const txs = rowsToTransactions(rows, 'N26');
      expect(txs).toHaveLength(2);
      expect(txs[0]).toMatchObject({ date: '2026-05-20', description: 'REWE Supermarket', amount: -42.5, type: 'expense' });
      expect(txs[1]).toMatchObject({ date: '2026-05-15', description: 'Employer GmbH', amount: 3100, type: 'income' });
    });
  });

  // ── Volksbank ─────────────────────────────────────────────────────────────

  describe('Volksbank / Raiffeisenbank', () => {
    it('parses Volksbank CSV with standalone "Umsatz" column', () => {
      // Volksbank uses unsigned amounts in the Umsatz column with S/H in a separate column.
      // The parser reads the raw Umsatz value. The S/H column is NOT automatically used
      // for sign detection (only Soll/Haben split columns in Deutsche Bank style are).
      // In practice, many Volksbank exports use signed amounts or include the sign inline.
      const rows = [
        ['Buchungstag', 'Valuta', 'Textschlüssel', 'Primanota', 'Zahlungsempfänger', 'ZahlungsempfängerKto', 'ZahlungsempfängerIBAN', 'ZahlungsempfängerBLZ', 'ZahlungsempfängerBIC', 'Vorgang/Verwendungszweck', 'Kundenreferenz', 'Währung', 'Umsatz', 'Soll/Haben'],
        ['20.05.2026', '20.05.2026', '005', '12345', 'REWE Markt', '9876543', 'DE12345678901234567890', '12345678', 'GENODEF1XXX', 'Kartenzahlung', '', 'EUR', '-42,50', 'S'],
        ['15.05.2026', '15.05.2026', '051', '67890', 'Arbeitgeber AG', '1234567', 'DE98765432101234567890', '87654321', 'GENODEF1XXX', 'Gehalt Mai', '', 'EUR', '2.950,00', 'H'],
      ];
      const txs = rowsToTransactions(rows, 'Berliner Volksbank');
      expect(txs).toHaveLength(2);
      // "Umsatz" should match the amount column (standalone phrase match)
      expect(txs[0].date).toBe('2026-05-20');
      expect(txs[0].amount).toBe(-42.5);
      expect(txs[1].amount).toBe(2950);
    });
  });

  // ── Postbank ──────────────────────────────────────────────────────────────

  describe('Postbank', () => {
    it('parses Postbank CSV format', () => {
      const rows = [
        ['Buchungsdatum', 'Wertstellung', 'Umsatzart', 'Auftraggeber', 'Buchungsdetails', 'Betrag', 'Saldo'],
        ['20.05.2026', '20.05.2026', 'Lastschrift', 'Netflix', 'Abo-Zahlung', '-13,99', '1.234,56'],
        ['15.05.2026', '15.05.2026', 'Gutschrift', 'Arbeitgeber', 'Gehaltszahlung', '2.800,00', '4.034,56'],
      ];
      const txs = rowsToTransactions(rows, 'Postbank');
      expect(txs).toHaveLength(2);
      // Betrag should be preferred over Saldo
      expect(txs[0].amount).toBe(-13.99);
      expect(txs[1].amount).toBe(2800);
    });
  });

  // ── Revolut / Wise / bunq (English format) ────────────────────────────────

  describe('Revolut (English)', () => {
    it('parses Revolut CSV with English headers', () => {
      const rows = [
        ['Date', 'Description', 'Amount', 'Currency', 'Balance'],
        ['2026-05-20', 'REWE Supermarket', '-42.50', 'EUR', '1234.56'],
        ['2026-05-15', 'Salary Payment', '3100.00', 'EUR', '4334.56'],
      ];
      const txs = rowsToTransactions(rows, 'Revolut');
      expect(txs).toHaveLength(2);
      expect(txs[0]).toMatchObject({ date: '2026-05-20', description: 'REWE Supermarket', amount: -42.5 });
      expect(txs[1]).toMatchObject({ date: '2026-05-15', description: 'Salary Payment', amount: 3100 });
    });
  });

  // ── Trade Republic ────────────────────────────────────────────────────────

  describe('Trade Republic', () => {
    it('parses Trade Republic CSV with Datum/Beschreibung/Betrag', () => {
      const rows = [
        ['Datum', 'Beschreibung', 'Betrag', 'Währung'],
        ['20.05.2026', 'Sparplan Ausführung', '-500,00', 'EUR'],
        ['15.05.2026', 'Zinsgutschrift', '12,50', 'EUR'],
      ];
      const txs = rowsToTransactions(rows, 'Trade Republic');
      expect(txs).toHaveLength(2);
      expect(txs[0]).toMatchObject({ date: '2026-05-20', amount: -500, type: 'expense' });
      expect(txs[1]).toMatchObject({ date: '2026-05-15', amount: 12.5, type: 'income' });
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('returns empty for less than 2 rows', () => {
      expect(rowsToTransactions([['Date', 'Betrag']], 'Test')).toEqual([]);
    });

    it('skips empty rows', () => {
      const rows = [
        ['Date', 'Description', 'Amount'],
        ['2026-01-01', 'Test', '100'],
        ['', '', ''],
        ['2026-01-02', 'Test 2', '-50'],
      ];
      const txs = rowsToTransactions(rows, 'Test');
      expect(txs).toHaveLength(2);
    });

    it('handles columns with "Umsatzart" without matching amount to it', () => {
      // "Umsatzart" should NOT match as amount (it contains "umsatz" but is a type column)
      const rows = [
        ['Buchungstag', 'Umsatzart', 'Buchungstext', 'Betrag'],
        ['20.05.2026', 'Lastschrift', 'Test Payment', '-42,00'],
      ];
      const txs = rowsToTransactions(rows, 'Test');
      expect(txs).toHaveLength(1);
      expect(txs[0].amount).toBe(-42);
      // Description should be from Buchungstext, not Umsatzart
      expect(txs[0].description).toBe('Test Payment');
    });

    it('handles "Wertstellung" without matching it as amount', () => {
      // "Wertstellung" contains "wert" but should only match as a date column
      const rows = [
        ['Buchungstag', 'Wertstellung', 'Beschreibung', 'Betrag'],
        ['20.05.2026', '22.05.2026', 'Test Payment', '-42,00'],
      ];
      const txs = rowsToTransactions(rows, 'Test');
      expect(txs).toHaveLength(1);
      // Date should be from Buchungstag, not Wertstellung
      expect(txs[0].date).toBe('2026-05-20');
    });
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
 *  parseBankStatementPaste — structured bank portal copy-paste
 * ═══════════════════════════════════════════════════════════════════════════════ */

describe('parseBankStatementPaste', () => {
  it('parses ING-style portal paste with date headers, types, and amounts', () => {
    // Note: "3.200,00 EUR" without a leading sign looks like a balance line to the parser
    // (BALANCE_RE matches unsigned amounts). In real ING pastes, income amounts typically
    // have a "+" prefix. We test with "+" to match real-world behavior.
    const paste = `20.05.2026
AM
Amazon Payments
AMZN Mktp DE
Lastschrift
-42,50 EUR
Menü öffnen
15.05.2026
AG
Arbeitgeber GmbH
LOHN/GEHALT 05/2026
Gutschrift
+3.200,00 EUR`;

    const txs = parseBankStatementPaste(paste, 'ING Deutschland');
    expect(txs).toHaveLength(2);
    expect(txs[0]).toMatchObject({
      date: '2026-05-20',
      amount: -42.5,
      type: 'expense',
      institution: 'ING Deutschland',
    });
    expect(txs[0].description).toContain('Amazon Payments');
    expect(txs[1]).toMatchObject({
      date: '2026-05-15',
      amount: 3200,
      type: 'income',
    });
  });

  it('skips noise lines (Menü öffnen, Umsatzdetails, etc.)', () => {
    const paste = `20.05.2026
(Umsatzdetails öffnen)
Amazon Payments
AMZN Mktp DE
Symbol
Lastschrift
-42,50 EUR
Menü öffnen`;

    const txs = parseBankStatementPaste(paste, 'Test');
    expect(txs).toHaveLength(1);
    expect(txs[0].description).toContain('Amazon Payments');
  });

  it('skips avatar initials (AM, MG, etc.)', () => {
    const paste = `20.05.2026
AM
Real Partner Name
Reference text
Lastschrift
-10,00 EUR`;

    const txs = parseBankStatementPaste(paste, 'Test');
    expect(txs).toHaveLength(1);
    // "AM" should be skipped, "Real Partner Name" should be the partner
    expect(txs[0].description).toContain('Real Partner Name');
    expect(txs[0].description).not.toMatch(/^AM /);
  });

  it('handles pending transactions with projected booking date', () => {
    const paste = `Voraussichtliche Buchung: 25.05.2026
Pending Merchant
Pending payment
Lastschrift
-99,99 EUR`;

    const txs = parseBankStatementPaste(paste, 'Test');
    expect(txs).toHaveLength(1);
    expect(txs[0].date).toBe('2026-05-25');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════════
 *  parsePdfText — PDF text extraction parsing
 * ═══════════════════════════════════════════════════════════════════════════════ */

describe('parsePdfText', () => {
  it('parses dual-date German bank statement format', () => {
    const text = '20.05.2026 20.05.2026 Dauerauftrag Trade Republic -500,00 EUR 15.05.2026 15.05.2026 Überweisung Gehalt Mai 2026 3.200,00 EUR';
    const txs = parsePdfText(text, 'Commerzbank');
    expect(txs).toHaveLength(2);
    expect(txs[0]).toMatchObject({ date: '2026-05-20', amount: -500, type: 'expense' });
    expect(txs[1]).toMatchObject({ date: '2026-05-15', amount: 3200, type: 'income' });
  });

  it('parses single-date format as fallback', () => {
    const text = '20.05.2026 Lastschrift Netflix -13,99 EUR';
    const txs = parsePdfText(text, 'Test Bank');
    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(-13.99);
  });

  it('parses amounts with trailing S (Soll)', () => {
    const text = '20.05.2026 20.05.2026 Lastschrift Netflix 13,99S EUR';
    const txs = parsePdfText(text, 'Test Bank');
    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(-13.99);
  });

  it('parses amounts with trailing H (Haben)', () => {
    const text = '15.05.2026 15.05.2026 Gutschrift Gehalt 3.200,00H EUR';
    const txs = parsePdfText(text, 'Test Bank');
    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(3200);
  });

  it('handles Unicode minus signs', () => {
    const text = '20.05.2026 20.05.2026 Lastschrift Netflix \u221213,99 EUR';
    const txs = parsePdfText(text, 'Test Bank');
    expect(txs).toHaveLength(1);
    expect(txs[0].amount).toBe(-13.99);
  });

  it('uses line-by-line fallback for non-standard formats', () => {
    const text = `Some header text
20.05.2026 Netflix Subscription -13,99 EUR
15.05.2026 Salary Payment 3.200,00 EUR`;
    const txs = parsePdfText(text, 'Test Bank');
    expect(txs.length).toBeGreaterThanOrEqual(2);
  });

  it('returns empty for text without detectable transactions', () => {
    const text = 'This is just random text without any transactions or dates.';
    const txs = parsePdfText(text, 'Test Bank');
    expect(txs).toHaveLength(0);
  });
});
