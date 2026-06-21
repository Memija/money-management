import type { Transaction } from '../../types';
import { generateId, inferType, parseAmount, parseCurrency, parseDate } from './helpers';
import { ALL_SUMMARY_KEYWORDS } from './parser-i18n';


function isSummaryLine(description: string): boolean {
  const lower = description.toLowerCase();
  return ALL_SUMMARY_KEYWORDS.some((kw) => lower.includes(kw));
}

function parseDoubleDateStrategy(text: string, institution: string): { transactions: Transaction[], remainingText: string } {
  const transactions: Transaction[] = [];
  let remainingText = text;

  // German bank statement: BookingDate ValueDate Description Amount EUR
  const deRegex =
    /(\d{1,2}\.\d{1,2}\.\d{2,4})\s+\d{1,2}\.\d{1,2}\.\d{2,4}\s+(.*?)\s*([+-]?\s?\d{1,3}(?:\.\d{3})*,\d{2}\s*[SH+-]?)\s*([A-Z]{3}|€|£|\$|zł)?/gi;

  let m;
  while ((m = deRegex.exec(remainingText)) !== null) {
    const amountStr = m[3].replace(/\s/g, '');
    const amount = parseAmount(amountStr);
    const desc = m[2].replace(/\s+/g, ' ').trim();
    // Blank out the matched text so it doesn't match the fallback regexes
    remainingText = remainingText.slice(0, m.index) + ' '.repeat(m[0].length) + remainingText.slice(m.index + m[0].length);
    if (isSummaryLine(desc)) {
      continue;
    }

    const curr = parseCurrency(m[4]);

    transactions.push({
      id: generateId(),
      date: parseDate(m[1]),
      description: desc || 'PDF Transaction',
      amount,
      currency: curr,
      type: inferType(amount),
      institution,
    });
  }

  return { transactions, remainingText };
}

function parseSingleDateStrategy(text: string, institution: string): { transactions: Transaction[], remainingText: string } {
  const transactions: Transaction[] = [];
  let remainingText = text;

  // Fallback: Single Date German bank statement: BookingDate Description Amount EUR
  const deRegexSingleDate =
    /(\d{1,2}\.\d{1,2}\.\d{2,4})\s+(.*?)\s*([+-]?\s?\d{1,3}(?:\.\d{3})*,\d{2}\s*[SH+-]?)\s*([A-Z]{3}|€|£|\$|zł)?/gi;

  let m;
  while ((m = deRegexSingleDate.exec(remainingText)) !== null) {
    const amountStr = m[3].replace(/\s/g, '');
    const amount = parseAmount(amountStr);
    const desc = m[2].replace(/\s+/g, ' ').trim();
    remainingText = remainingText.slice(0, m.index) + ' '.repeat(m[0].length) + remainingText.slice(m.index + m[0].length);
    if (isSummaryLine(desc)) {
      continue;
    }

    const curr = parseCurrency(m[4]);

    transactions.push({
      id: generateId(),
      date: parseDate(m[1]),
      description: desc || 'PDF Transaction',
      amount,
      currency: curr,
      type: inferType(amount),
      institution,
    });
  }

  return { transactions, remainingText };
}

function parseFallbackStrategy(text: string, institution: string): Transaction[] {
  const transactions: Transaction[] = [];

  // Generic line-by-line date+amount detection
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const dateRe = /(\d{1,2}[./]\d{1,2}[./]\d{2,4})/;
  // Anchor amount to the end of the line, allowing for optional trailing symbols
  const amtRe = /([+-]?\s?\d{1,3}(?:[.,]\d{3})*[.,]\d{1,2}\s*[A-Za-z+-]?)\s*([A-Z]{3}|€|£|\$|zł)?$/i;

  for (const line of lines) {
    const dMatch = line.match(dateRe);
    const aMatch = line.match(amtRe);
    if (dMatch && aMatch) {
      const amountStr = aMatch[1].replace(/\s/g, '');
      const amount = parseAmount(amountStr);
      const desc = line
        .replace(dMatch[0], '')
        .replace(aMatch[0], '')
        .replace(/\s+/g, ' ')
        .trim();
      if (isSummaryLine(desc)) {
        continue;
      }

      const curr = parseCurrency(aMatch[2]);

      transactions.push({
        id: generateId(),
        date: parseDate(dMatch[1]),
        description: desc || 'PDF Transaction',
        amount,
        currency: curr,
        type: inferType(amount),
        institution,
      });
    }
  }

  return transactions;
}

export function parsePdfText(rawText: string, institution: string): Transaction[] {
  // Normalize: unicode dashes → ASCII minus, collapse whitespace
  const text = rawText
    .replace(/[\u2212\u2013\u2014\u2015]/g, '-')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let remainingText = text;
  let allTransactions: Transaction[] = [];

  // Strategy 1: Double Date matches
  const doubleDateResult = parseDoubleDateStrategy(remainingText, institution);
  if (doubleDateResult.transactions.length > 0) {
    allTransactions = allTransactions.concat(doubleDateResult.transactions);
    remainingText = doubleDateResult.remainingText;
  }

  // Strategy 2: Single Date matches
  const singleDateResult = parseSingleDateStrategy(remainingText, institution);
  if (singleDateResult.transactions.length > 0) {
    allTransactions = allTransactions.concat(singleDateResult.transactions);
    remainingText = singleDateResult.remainingText;
  }

  if (allTransactions.length > 0) {
    return allTransactions;
  }

  // Strategy 3: Line-by-line generic fallback
  return parseFallbackStrategy(rawText, institution);
}
