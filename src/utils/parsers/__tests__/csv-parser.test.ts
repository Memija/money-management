import { describe, it, expect, vi } from 'vitest';
import { findHeaderRowIndex, rowsToTransactions } from '../csv-parser';

// Mock generateId so snapshot testing or deterministic asserts work if needed,
// though we mostly just check if it returns strings.
vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>();
  return {
    ...actual,
    generateId: () => 'mocked-id',
  };
});

describe('csv-parser', () => {
  describe('findHeaderRowIndex', () => {
    it('returns 0 when no obvious headers are found', () => {
      const rows = [
        ['col1', 'col2', 'col3'],
        ['val1', 'val2', 'val3'],
      ];
      expect(findHeaderRowIndex(rows)).toBe(0);
    });

    it('finds header row amidst preamble', () => {
      const rows = [
        ['Umsätze für Konto', '123456'],
        ['Zeitraum', '01.01.-31.01.'],
        [''],
        ['Datum', 'Verwendungszweck', 'Betrag'],
        ['01.01.2023', 'Supermarket', '-50.00'],
      ];
      expect(findHeaderRowIndex(rows)).toBe(3);
    });

    it('is case-insensitive and trims whitespace', () => {
      const rows = [
        [''],
        ['   DATE  ', ' DESCRIPTION ', '  AMOUNT  '],
        ['01.01.2023', 'Supermarket', '-50.00'],
      ];
      expect(findHeaderRowIndex(rows)).toBe(1);
    });
  });

  describe('rowsToTransactions', () => {
    it('returns empty array for less than 2 rows', () => {
      expect(rowsToTransactions([], 'TestBank')).toEqual([]);
      expect(rowsToTransactions([['Datum', 'Betrag']], 'TestBank')).toEqual([]);
    });

    it('skips completely empty rows', () => {
      const rows = [
        ['Datum', 'Verwendungszweck', 'Betrag'],
        ['01.01.2023', 'Grocery', '-50.00'],
        ['', '', ''],
        ['02.01.2023', 'Salary', '1000.00'],
      ];
      const result = rowsToTransactions(rows, 'TestBank');
      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(-50);
      expect(result[1].amount).toBe(1000);
    });

    it('parses standard CSV correctly', () => {
      const rows = [
        ['Date', 'Description', 'Amount'],
        ['2023-12-01', 'Coffee', '-4.50'],
        ['2023-12-02', 'Paycheck', '2000.00'],
      ];
      const result = rowsToTransactions(rows, 'BankA');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'mocked-id',
        date: '2023-12-01',
        description: 'Coffee',
        amount: -4.50,
        currency: 'EUR',
        type: 'expense',
        institution: 'BankA',
      });
      expect(result[1].amount).toBe(2000);
      expect(result[1].type).toBe('income');
    });

    it('matches exact phrase headers (e.g., umsatz in eur)', () => {
      const rows = [
        ['Buchungstag', 'Buchungstext', 'Umsatz in EUR'],
        ['15.01.2023', 'Test Transaction', '-15.99'],
      ];
      const result = rowsToTransactions(rows, 'comdirect');

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2023-01-15');
      expect(result[0].amount).toBe(-15.99);
    });

    it('falls back to default column indices if headers are missing', () => {
      const rows = [
        ['Col0', 'Col1', 'Col2'],
        ['15.01.2023', 'No Header Match', '-10.00'],
      ];
      const result = rowsToTransactions(rows, 'FallbackBank');

      // Default: date=0, desc=1, amount=2
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2023-01-15');
      expect(result[0].description).toBe('No Header Match');
      expect(result[0].amount).toBe(-10);
    });

    it('handles Deutsche Bank Soll/Haben logic', () => {
      const rows = [
        ['Buchungstag', 'Verwendungszweck', 'Soll', 'Haben'],
        ['01.01.2023', 'Rent', '500.00', ''], // Soll is populated -> expense
        ['02.01.2023', 'Salary', '', '1500.00'], // Haben is populated -> income
        ['03.01.2023', 'Zero', '', '0'],
      ];
      const result = rowsToTransactions(rows, 'DeutscheBank');

      expect(result).toHaveLength(3);
      expect(result[0].amount).toBe(-500);
      expect(result[0].type).toBe('expense');

      expect(result[1].amount).toBe(1500);
      expect(result[1].type).toBe('income');

      expect(result[2].amount).toBe(0);
    });

    it('prefers Betrag over Saldo', () => {
      const rows = [
        ['Datum', 'Beschreibung', 'Betrag', 'Saldo'],
        ['01.01.2023', 'Purchase', '-20', '1000'],
      ];
      const result = rowsToTransactions(rows, 'Sparkasse');

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-20); // Amount should be Betrag, not Saldo
    });

    it('handles DKB gendered payer tokens', () => {
      const rows = [
        ['Wertstellung', 'Zahlungspflichtige*r', 'Betrag'],
        ['01.01.2023', 'John Doe', '-100'],
      ];
      const result = rowsToTransactions(rows, 'DKB');

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('John Doe');
      expect(result[0].amount).toBe(-100);
    });

    it('returns empty array if no data rows left after preamble', () => {
      const rows = [
        ['Preamble'],
        ['Datum', 'Verwendungszweck', 'Betrag']
      ];
      expect(rowsToTransactions(rows, 'TestBank')).toEqual([]);
    });

    it('falls back to empty string or default when cells are missing/short', () => {
      const rows = [
        ['Datum', 'Verwendungszweck', 'Betrag'],
        ['01.01.2023'] // Short row, desc and amount are missing
      ];
      const result = rowsToTransactions(rows, 'TestBank');
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2023-01-01');
      expect(result[0].description).toBe('Unknown');
      expect(result[0].amount).toBe(0);
    });

    it('handles empty amount strings explicitly', () => {
      const rows = [
        ['Datum', 'Verwendungszweck', 'Betrag'],
        ['01.01.2023', 'Some desc', '']
      ];
      const result = rowsToTransactions(rows, 'TestBank');
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(0);
    });
  });
});
