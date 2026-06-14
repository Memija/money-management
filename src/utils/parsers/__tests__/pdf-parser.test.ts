import { describe, it, expect, vi } from 'vitest';
import { parsePdfText } from '../pdf-parser';

vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>();
  return {
    ...actual,
    generateId: () => 'mocked-id',
  };
});

describe('parsePdfText', () => {
  it('parses using Double Date strategy (Booking Date, Value Date)', () => {
    const rawText = `
    01.12.2023 02.12.2023 REWE Supermarkt -45,50 EUR
    15.12.2023 15.12.2023 Gehalt ACME Corp +2.500,00 EUR
    `;
    const result = parsePdfText(rawText, 'TestBank');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'mocked-id',
      date: '2023-12-01',
      description: 'REWE Supermarkt',
      amount: -45.5,
      currency: 'EUR',
      type: 'expense',
      institution: 'TestBank',
    });

    expect(result[1].date).toBe('2023-12-15');
    expect(result[1].description).toBe('Gehalt ACME Corp');
    expect(result[1].amount).toBe(2500);
  });

  it('parses using Single Date strategy', () => {
    const rawText = `
    01.12.2023 Bakery -5,00
    02.12.2023 Bookstore -15,99 EUR
    `;
    const result = parsePdfText(rawText, 'TestBank');

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2023-12-01');
    expect(result[0].description).toBe('Bakery');
    expect(result[0].amount).toBe(-5);

    expect(result[1].date).toBe('2023-12-02');
    expect(result[1].description).toBe('Bookstore');
    expect(result[1].amount).toBe(-15.99);
  });

  it('handles S/H suffixes in Double/Single Date strategies', () => {
    const rawText = `
    01.12.2023 02.12.2023 Shopping 50,00 S
    03.12.2023 Income 100,00 H
    `;
    const result = parsePdfText(rawText, 'TestBank');

    expect(result).toHaveLength(2);
    // S = Soll = negative
    expect(result[0].amount).toBe(-50);
    // H = Haben = positive
    expect(result[1].amount).toBe(100);
  });

  it('parses using Line-by-line fallback strategy', () => {
    const rawText = `
    Something irrelevant
    01.01.2023 Random text in the middle -10.00
    02.01.2023 Another purchase 20.00 EUR
    `;
    const result = parsePdfText(rawText, 'TestBank');

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2023-01-01');
    expect(result[0].description).toBe('Random text in the middle');
    expect(result[0].amount).toBe(-10);

    expect(result[1].date).toBe('2023-01-02');
    expect(result[1].description).toBe('Another purchase');
    expect(result[1].amount).toBe(20);
  });

  it('returns empty array if no matches found', () => {
    const rawText = `
    Welcome to your bank statement.
    Total balance: 1000 EUR.
    Have a nice day!
    `;
    const result = parsePdfText(rawText, 'TestBank');
    expect(result).toEqual([]);
  });

  it('combines strategies if some lines match different patterns (rare but possible)', () => {
    const rawText = `
    01.01.2023 02.01.2023 Double Date Match -10,00 EUR
    03.01.2023 Single Date Match -20,00 EUR
    `;
    // The Double Date regex will match the first line and remove it.
    // The Single Date regex will match the second line.
    const result = parsePdfText(rawText, 'TestBank');

    expect(result).toHaveLength(2);
    expect(result[0].description).toBe('Double Date Match');
    expect(result[1].description).toBe('Single Date Match');
  });

  it('handles multiline text correctly due to whitespace collapsing', () => {
    const rawText = `
    01.01.2023
    02.01.2023
    Split Description
    -10,00 EUR
    `;
    // parsePdfText collapses \n to spaces, so this becomes a Double Date match
    const result = parsePdfText(rawText, 'TestBank');

    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Split Description');
    expect(result[0].amount).toBe(-10);
  });

  it('falls back to "PDF Transaction" when description is missing (Double Date)', () => {
    const rawText = `01.12.2023 02.12.2023   -45,50 EUR`;
    const result = parsePdfText(rawText, 'TestBank');
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('PDF Transaction');
  });

  it('falls back to "PDF Transaction" when description is missing (Single Date)', () => {
    const rawText = `01.12.2023   -5,00`;
    const result = parsePdfText(rawText, 'TestBank');
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('PDF Transaction');
  });

  it('falls back to "PDF Transaction" when description is missing (Fallback)', () => {
    const rawText = `01.01.2023   -10.00`;
    const result = parsePdfText(rawText, 'TestBank');
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('PDF Transaction');
  });
});
