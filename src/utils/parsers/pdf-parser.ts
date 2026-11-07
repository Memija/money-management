import type { Transaction } from '../../types'
import { extractIbans } from '../account-transfers'
import { repairBrokenWords } from '../categorizer/description-cleaning'
import {
  EXPLICIT_INCOME_KEYWORDS_REGEX,
  generateId,
  inferType,
  parseAmount,
  parseCurrency,
  parseDate,
} from './helpers'
import { ALL_SUMMARY_KEYWORDS } from './parser-i18n'

export function extractAccountIbansFromPdf(fullText: string, fileName?: string): string[] {
  const result = new Set<string>()
  if (fileName) {
    for (const ib of extractIbans(fileName)) {
      result.add(ib)
    }
  }
  const headerMatch = fullText.match(
    /(?:iban|konto(?:nummer)?|account)[\s:]+([a-z]{2}\d{2}[a-z0-9\s]{11,32})/i,
  )
  if (headerMatch) {
    for (const ib of extractIbans(headerMatch[1])) {
      if (ib.startsWith('DE') && ib.length >= 22) {
        result.add(ib.slice(0, 22))
      } else {
        result.add(ib)
      }
    }
  }
  return Array.from(result)
}

function isSummaryLine(description: string): boolean {
  const lower = description.toLowerCase()
  return ALL_SUMMARY_KEYWORDS.some((kw) => lower.includes(kw))
}

const PDF_DATE_SRC = '(?:\\d{1,2}[./]\\d{1,2}[./]\\d{2,4}|\\d{4}-\\d{2}-\\d{2})'
const PDF_SHORT_DE_DATE_SRC = '(?:0?[1-9]|[12]\\d|3[01])\\.(?:0?[1-9]|1[0-2])\\.'
const PDF_DOUBLE_DATE_TOKEN_SRC = `(?:${PDF_DATE_SRC}|${PDF_SHORT_DE_DATE_SRC})`
const PDF_AMT_SRC =
  "(?:[+-]?\\s?\\d{1,3}(?:[.'’]\\d{3})*,\\d{2}\\s*[SH+-]?|[+-]\\s?\\d{1,3}(?:,\\d{3})*\\.\\d{2}(?=\\s*(?:[A-Z]{3}|€|£|\\$|zł)))"
const PDF_CURR_SRC = '([A-Z]{3}|€|£|\\$|zł)?'

function extractStatementYear(text: string): string {
  const fullDateMatch = text.match(/\b\d{1,2}[./]\d{1,2}[./](20\d{2})\b/)
  if (fullDateMatch) {
    return fullDateMatch[1]
  }
  const isoYearMatch = text.match(/\b(20\d{2})-\d{2}-\d{2}\b/)
  if (isoYearMatch) {
    return isoYearMatch[1]
  }
  const slashYearMatch = text.match(/\b(?:0?[1-9]|1[0-2])\s*\/\s*(20\d{2})\b/)
  if (slashYearMatch) {
    return slashYearMatch[1]
  }
  return String(new Date().getFullYear())
}

function parseDoubleDateStrategy(
  text: string,
  institution: string,
  statementYear: string,
): { transactions: Transaction[]; remainingText: string } {
  const transactions: Transaction[] = []
  let remainingText = text

  // Statement row with BookingDate + ValueDate + Description + Amount + Currency
  const deRegex = new RegExp(
    `(${PDF_DOUBLE_DATE_TOKEN_SRC})\\s+${PDF_DOUBLE_DATE_TOKEN_SRC}\\s+(.*?)\\s*(${PDF_AMT_SRC})\\s*${PDF_CURR_SRC}`,
    'gi',
  )

  let m
  while ((m = deRegex.exec(remainingText)) !== null) {
    const amountStr = m[3].replace(/\s/g, '')
    let amount = parseAmount(amountStr)
    const desc = repairBrokenWords(m[2].replace(/\s+/g, ' ').trim())
    if (EXPLICIT_INCOME_KEYWORDS_REGEX.test(desc) && amount < 0) {
      amount = Math.abs(amount)
    }
    // Blank out the matched text so it doesn't match the fallback regexes
    remainingText =
      remainingText.slice(0, m.index) +
      ' '.repeat(m[0].length) +
      remainingText.slice(m.index + m[0].length)
    if (isSummaryLine(desc)) {
      continue
    }

    const curr = parseCurrency(m[4])
    const counterpartyIban = extractIbans(desc)[0] || undefined

    transactions.push({
      id: generateId(),
      date: parseDate(m[1], statementYear),
      description: desc || 'PDF Transaction',
      amount,
      currency: curr,
      type: inferType(amount, desc),
      institution,
      counterpartyIban,
    })
  }

  return { transactions, remainingText }
}

function parseSingleDateStrategy(
  text: string,
  institution: string,
): { transactions: Transaction[]; remainingText: string } {
  const transactions: Transaction[] = []
  let remainingText = text

  // Statement row with Single Date + Description + Amount + Currency
  const deRegexSingleDate = new RegExp(
    `(${PDF_DATE_SRC})\\s+(.*?)\\s*(${PDF_AMT_SRC})\\s*${PDF_CURR_SRC}`,
    'gi',
  )

  let m
  while ((m = deRegexSingleDate.exec(remainingText)) !== null) {
    const amountStr = m[3].replace(/\s/g, '')
    let amount = parseAmount(amountStr)
    const desc = repairBrokenWords(m[2].replace(/\s+/g, ' ').trim())
    if (EXPLICIT_INCOME_KEYWORDS_REGEX.test(desc) && amount < 0) {
      amount = Math.abs(amount)
    }
    remainingText =
      remainingText.slice(0, m.index) +
      ' '.repeat(m[0].length) +
      remainingText.slice(m.index + m[0].length)
    if (isSummaryLine(desc)) {
      continue
    }

    const curr = parseCurrency(m[4])
    const counterpartyIban = extractIbans(desc)[0] || undefined

    transactions.push({
      id: generateId(),
      date: parseDate(m[1]),
      description: desc || 'PDF Transaction',
      amount,
      currency: curr,
      type: inferType(amount, desc),
      institution,
      counterpartyIban,
    })
  }

  return { transactions, remainingText }
}

function parseFallbackStrategy(text: string, institution: string): Transaction[] {
  const transactions: Transaction[] = []

  // Generic line-by-line date+amount detection
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  const dateRe = /(\d{1,2}[./]\d{1,2}[./]\d{2,4})/
  // Anchor amount to the end of the line, allowing for optional trailing symbols
  const amtRe = /([+-]?\s?\d{1,3}(?:[.,]\d{3})*[.,]\d{1,2}\s*[A-Za-z+-]?)\s*([A-Z]{3}|€|£|\$|zł)?$/i

  for (const line of lines) {
    const dMatch = line.match(dateRe)
    const aMatch = line.match(amtRe)
    if (dMatch && aMatch) {
      const amountStr = aMatch[1].replace(/\s/g, '')
      let amount = parseAmount(amountStr)
      const desc = repairBrokenWords(
        line.replace(dMatch[0], '').replace(aMatch[0], '').replace(/\s+/g, ' ').trim(),
      )
      if (EXPLICIT_INCOME_KEYWORDS_REGEX.test(desc) && amount < 0) {
        amount = Math.abs(amount)
      }
      if (isSummaryLine(desc)) {
        continue
      }

      const curr = parseCurrency(aMatch[2])
      const counterpartyIban = extractIbans(desc)[0] || undefined

      transactions.push({
        id: generateId(),
        date: parseDate(dMatch[1]),
        description: desc || 'PDF Transaction',
        amount,
        currency: curr,
        type: inferType(amount, desc),
        institution,
        counterpartyIban,
      })
    }
  }

  return transactions
}

export function parsePdfText(rawText: string, institution: string): Transaction[] {
  // Normalize: unicode dashes → ASCII minus, collapse whitespace
  const text = rawText
    .replace(/[\u2212\u2013\u2014\u2015]/g, '-')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const statementYear = extractStatementYear(text)
  let remainingText = text
  let allTransactions: Transaction[] = []

  // Strategy 1: Double Date matches
  const doubleDateResult = parseDoubleDateStrategy(remainingText, institution, statementYear)
  if (doubleDateResult.transactions.length > 0) {
    allTransactions = allTransactions.concat(doubleDateResult.transactions)
    remainingText = doubleDateResult.remainingText
  }

  // Strategy 2: Single Date matches
  const singleDateResult = parseSingleDateStrategy(remainingText, institution)
  if (singleDateResult.transactions.length > 0) {
    allTransactions = allTransactions.concat(singleDateResult.transactions)
    remainingText = singleDateResult.remainingText
  }

  if (allTransactions.length > 0) {
    return allTransactions
  }

  // Strategy 3: Line-by-line generic fallback
  return parseFallbackStrategy(rawText, institution)
}
