import { describe, it, expect } from 'vitest';
import { generateId, inferType, parseAmount, parseCurrency, parseDate, isValidDateRaw } from '../helpers';

describe('helpers', () => {
  describe('generateId', () => {
    it('generates a unique 9-character string', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1).toHaveLength(9);
      expect(typeof id1).toBe('string');
    });
  });

  describe('inferType', () => {
    it('returns income for positive amounts', () => {
      expect(inferType(100)).toBe('income');
      expect(inferType(0.01)).toBe('income');
    });

    it('returns income for zero', () => {
      expect(inferType(0)).toBe('income');
      expect(inferType(-0)).toBe('income');
    });

    it('returns expense for negative amounts', () => {
      expect(inferType(-100)).toBe('expense');
      expect(inferType(-0.01)).toBe('expense');
    });
  });

  describe('parseAmount', () => {
    it('returns the number if passed a number', () => {
      expect(parseAmount(123.45)).toBe(123.45);
      expect(parseAmount(-50)).toBe(-50);
    });

    it('parses basic strings', () => {
      expect(parseAmount('123.45')).toBe(123.45);
      expect(parseAmount('-123.45')).toBe(-123.45);
    });

    it('handles European comma formats', () => {
      expect(parseAmount('1.234,56')).toBe(1234.56);
      expect(parseAmount('-1.234,56')).toBe(-1234.56);
      expect(parseAmount('12,34')).toBe(12.34);
    });

    it('handles US comma formats', () => {
      expect(parseAmount('1,234.56')).toBe(1234.56);
      expect(parseAmount('-1,234.56')).toBe(-1234.56);
    });

    it('strips currency symbols and whitespace', () => {
      expect(parseAmount(' € 10.00 ')).toBe(10);
      expect(parseAmount('$-10.00')).toBe(-10);
      expect(parseAmount('£10.00')).toBe(10);
    });

    it('handles trailing negative signs', () => {
      expect(parseAmount('123.45-')).toBe(-123.45);
      expect(parseAmount('1.234,56-')).toBe(-1234.56);
    });

    it('handles credit/debit indicators', () => {
      expect(parseAmount('123.45 S')).toBe(-123.45); // Soll = negative
      expect(parseAmount('123.45 H')).toBe(123.45);  // Haben = positive (assuming 'H' gets stripped and default is positive)
      expect(parseAmount('123,45s')).toBe(-123.45);
    });

    it('handles unicode minus/dash variants', () => {
      expect(parseAmount('\u2212123.45')).toBe(-123.45); // Minus sign
      expect(parseAmount('\u2013123.45')).toBe(-123.45); // En dash
      expect(parseAmount('\u2014123.45')).toBe(-123.45); // Em dash
    });

    it('returns 0 for unparseable garbage', () => {
      expect(parseAmount('abc')).toBe(0);
      expect(parseAmount('')).toBe(0);
      expect(parseAmount('€')).toBe(0);
    });
  });

  describe('parseCurrency', () => {
    it('returns EUR as default when input is undefined or empty', () => {
      expect(parseCurrency(undefined)).toBe('EUR');
      expect(parseCurrency('')).toBe('EUR');
    });

    it('returns EUR for the € symbol', () => {
      expect(parseCurrency('€')).toBe('EUR');
    });

    it('returns USD for the $ symbol', () => {
      expect(parseCurrency('$')).toBe('USD');
    });

    it('returns GBP for the £ symbol', () => {
      expect(parseCurrency('£')).toBe('GBP');
    });

    it('returns PLN for the ZŁ symbol', () => {
      expect(parseCurrency('ZŁ')).toBe('PLN');
      expect(parseCurrency('zł')).toBe('PLN');
    });

    it('returns the uppercase input if it is not a known symbol', () => {
      expect(parseCurrency('chf')).toBe('CHF');
      expect(parseCurrency('YEN')).toBe('YEN');
    });
  });

  describe('parseDate', () => {
    it('returns current date string when input is empty', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(parseDate('')).toBe(today);
      expect(parseDate(null as unknown as string)).toBe(today);
    });

    it('parses ISO format', () => {
      expect(parseDate('2023-12-31')).toBe('2023-12-31');
    });

    it('parses German format (DD.MM.YYYY)', () => {
      expect(parseDate('31.12.2023')).toBe('2023-12-31');
      expect(parseDate('1.2.2023')).toBe('2023-02-01');
    });

    it('parses German format with 2-digit year (DD.MM.YY)', () => {
      expect(parseDate('31.12.23')).toBe('2023-12-31');
      expect(parseDate('01.02.99')).toBe('2099-02-01'); // Note: naive 20xx prepending
    });

    it('parses US format (MM/DD/YYYY)', () => {
      expect(parseDate('12/31/2023')).toBe('2023-12-31');
      expect(parseDate('1/2/2023')).toBe('2023-01-02');
    });

    it('parses US format with 2-digit year (MM/DD/YY)', () => {
      expect(parseDate('12/31/23')).toBe('2023-12-31');
    });

    it('returns current date string as fallback for unrecognised format', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(parseDate('Yesterday')).toBe(today);
    });
  });

  describe('isValidDateRaw', () => {
    it('returns false for empty, null, or undefined values', () => {
      expect(isValidDateRaw('')).toBe(false);
      expect(isValidDateRaw(null as unknown as string)).toBe(false);
      expect(isValidDateRaw(undefined as unknown as string)).toBe(false);
    });

    it('returns true for valid German format (DD.MM.YYYY or DD.MM.YY)', () => {
      expect(isValidDateRaw('31.12.2023')).toBe(true);
      expect(isValidDateRaw('1.2.2023')).toBe(true);
      expect(isValidDateRaw('01.02.23')).toBe(true);
    });

    it('returns true for valid ISO format (YYYY-MM-DD)', () => {
      expect(isValidDateRaw('2023-12-31')).toBe(true);
      expect(isValidDateRaw('2023-01-01')).toBe(true);
    });

    it('returns true for valid US format (MM/DD/YYYY or MM/DD/YY)', () => {
      expect(isValidDateRaw('12/31/2023')).toBe(true);
      expect(isValidDateRaw('1/2/2023')).toBe(true);
      expect(isValidDateRaw('12/31/23')).toBe(true);
    });

    it('returns false for invalid formats or non-date strings', () => {
      expect(isValidDateRaw('Yesterday')).toBe(false);
      expect(isValidDateRaw('2023.12.31')).toBe(false);
      expect(isValidDateRaw('31-12-2023')).toBe(false);
      expect(isValidDateRaw('abc')).toBe(false);
      expect(isValidDateRaw('123')).toBe(false);
    });
  });
});
