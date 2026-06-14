import { describe, it, expect, vi } from 'vitest';
import { parseBankStatementPaste } from '../paste-parser';

vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>();
  return {
    ...actual,
    generateId: () => 'mocked-id',
  };
});

describe('parseBankStatementPaste', () => {
  it('parses typical bank paste format', () => {
    const rawText = `
01.01.2023
Max Mustermann
Invoice 1234
Überweisung
-50,00 EUR
(Umsatzdetails öffnen)
    `;
    const result = parseBankStatementPaste(rawText, 'TestBank');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'mocked-id',
      date: '2023-01-01',
      description: 'Max Mustermann – Invoice 1234',
      amount: -50,
      currency: 'EUR',
      type: 'expense',
      institution: 'TestBank',
    });
  });

  it('filters out noise and IBANs', () => {
    const rawText = `
Menü öffnen
Symbol
Zahlungsverkehrspartner
01.01.2023
Supermarket
Groceries
Kartenzahlung
-100,50 EUR
DE12 3456
12.01.2023
Salary inc
Monthly Pay
Gehalt
+2.000,00 EUR
    `;
    const result = parseBankStatementPaste(rawText, 'TestBank');

    expect(result).toHaveLength(2);
    expect(result[0].description).toBe('Supermarket – Groceries');
    expect(result[0].amount).toBe(-100.5);

    expect(result[1].description).toBe('Salary inc – Monthly Pay');
    expect(result[1].amount).toBe(2000);
  });

  it('handles pending transactions (Voraussichtliche Buchung)', () => {
    const rawText = `
Voraussichtliche Buchung: 15.01.2023
Pending Store
Some Purchase
Kartenzahlung
-15,99 EUR
    `;
    const result = parseBankStatementPaste(rawText, 'TestBank');

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2023-01-15');
    expect(result[0].description).toBe('Pending Store – Some Purchase');
  });

  it('concatenates multi-line descriptions', () => {
    const rawText = `
01.01.2023
Company Name
Description Line 1
Description Line 2
Description Line 3
Lastschrift
-10,00 EUR
    `;
    const result = parseBankStatementPaste(rawText, 'TestBank');

    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Company Name – Description Line 1 Description Line 2 Description Line 3');
  });

  it('skips avatar initials placeholders', () => {
    const rawText = `
01.01.2023
JD
John Doe
Payment
Überweisung
-5,00 EUR
    `;
    const result = parseBankStatementPaste(rawText, 'TestBank');

    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('John Doe – Payment'); // JD is skipped because it's 2 uppercase letters
  });

  it('returns empty array if no transactions found', () => {
    const rawText = `
Menü öffnen
Symbol
Filter
Suchen
    `;
    const result = parseBankStatementPaste(rawText, 'TestBank');
    expect(result).toEqual([]);
  });

  it('falls back to type as description if partner and desc are missing', () => {
    // Though rare, if it parses without partner/desc but with type
    const rawText = `
01.01.2023
Zinsen
+1,00 EUR
    `;
    const result = parseBankStatementPaste(rawText, 'TestBank');

    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Zinsen');
    expect(result[0].amount).toBe(1);
  });
});
