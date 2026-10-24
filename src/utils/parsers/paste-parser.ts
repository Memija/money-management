import type { Transaction } from '../../types'
import { extractIbans } from '../account-transfers'
import {
  EXPLICIT_INCOME_KEYWORDS_REGEX,
  generateId,
  inferType,
  parseAmount,
  parseDate,
} from './helpers'
import { htmlToClipboardText } from './html-clipboard-parser'
export * from './html-clipboard-parser'

import {
  ALL_ICON_PREFIX_RE,
  ALL_PROJECTED_DATE_RE,
  ALL_SKIP_PATTERNS,
  ALL_TX_TYPES,
} from './parser-i18n'

const CURRENCY_SYMBOLS: Record<string, string> = {
  '€': 'EUR',
  $: 'USD',
  '£': 'GBP',
  zł: 'PLN',
  ZŁ: 'PLN',
}

export interface ParsedAmount {
  amount: number
  currency: string
}

export function parseAmountLine(line: string): ParsedAmount | null {
  const clean = line.trim().replace(/[\u2212\u2013\u2014]/g, '-')

  // Suffix currency: e.g. -50,00 EUR or - 21.00 USD or +1.200,50 €
  const suffixMatch = clean.match(
    /^,?([+-]?\s*\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*([A-Z]{3}|€|£|\$|zł)$/i,
  )
  if (suffixMatch) {
    const rawCurr = suffixMatch[2].toUpperCase()
    const currency = CURRENCY_SYMBOLS[suffixMatch[2]] || rawCurr
    const numPart = suffixMatch[1].replace(/\s+/g, '')
    return { amount: parseAmount(numPart), currency }
  }

  // Prefix currency: e.g. - € 50,00 or - € 13.99 or +$1,200.50 or -£42.50
  const prefixMatch = clean.match(
    /^([+-])?\s*([A-Z]{3}|€|£|\$|zł)\s*([+-]?\s*\d{1,3}(?:[.,]\d{3})*[.,]\d{2})$/i,
  )
  if (prefixMatch) {
    const sign = prefixMatch[1] === '-' ? -1 : 1
    const rawCurr = prefixMatch[2].toUpperCase()
    const currency = CURRENCY_SYMBOLS[prefixMatch[2]] || rawCurr
    const numPart = prefixMatch[3].replace(/\s+/g, '')
    let val = parseAmount(numPart)
    if (sign === -1 && val > 0) {
      val = -val
    }
    return { amount: val, currency }
  }

  // Pure signed number (e.g. -42,50 or - 42,50 or +1250,00) with default EUR
  const numOnlyMatch = clean.match(/^([+-])?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})$/)
  if (numOnlyMatch) {
    const sign = numOnlyMatch[1] === '-' ? -1 : 1
    let val = parseAmount(numOnlyMatch[2])
    if (sign === -1 && val > 0) {
      val = -val
    }
    return { amount: val, currency: 'EUR' }
  }

  return null
}

// Date header pattern: DD.MM.YYYY — standalone date line (day separator)
const DATE_HEADER_RE = /^(\d{1,2}\.\d{1,2}\.\d{2,4})$/

function getCleanLines(rawText: string): string[] {
  return rawText
    .normalize('NFC')
    .split(/\r?\n/)
    .map((l) =>
      l
        .trim()
        .replace(/[\u2212\u2013\u2014]/g, '-')
        .replace(ALL_ICON_PREFIX_RE, '')
        .trim(),
    )
    .filter((l) => l.length > 0 && !ALL_SKIP_PATTERNS.some((re) => re.test(l)))
}

interface RawTx {
  date: string
  partner: string
  desc: string
  type: string
  amount: number
  currency: string
}

/**
 * Parses the copy-paste output from German bank portals (e.g. ING, Sparkasse, DKB).
 * Also accepts raw HTML input, extracting transactions automatically.
 */
export function parseBankStatementPaste(rawText: string, institution: string): Transaction[] {
  const textToParse = /<[a-z][\s\S]*>/i.test(rawText) ? htmlToClipboardText(rawText) : rawText
  const cleanLines = getCleanLines(textToParse)

  let currentDate = new Date().toISOString().split('T')[0]
  let hasSeenDate = false
  const rawTxs: RawTx[] = []

  let buf: {
    date: string
    partner: string
    desc: string
    type: string
    projDate: string | null
    currency: string
  } = {
    date: currentDate,
    partner: '',
    desc: '',
    type: '',
    projDate: null,
    currency: 'EUR',
  }

  const pushBuf = (amount: number, currency: string) => {
    if (!buf.partner && !buf.desc && !buf.type) {
      return
    }
    rawTxs.push({
      date: buf.projDate ?? buf.date,
      partner: buf.partner,
      desc: buf.desc,
      type: buf.type,
      amount,
      currency,
    })
    buf = { date: buf.date, partner: '', desc: '', type: '', projDate: null, currency: 'EUR' }
  }

  for (const line of cleanLines) {
    // Projected booking date annotation (pending transactions)
    const projMatch = line.match(ALL_PROJECTED_DATE_RE)
    if (projMatch) {
      hasSeenDate = true
      // Find first captured group (date) — varies by locale branch
      const dateStr = projMatch.slice(1).find(Boolean)
      if (dateStr) {
        buf.projDate = parseDate(dateStr)
      }
      continue
    }

    // Date header line — new calendar day
    if (DATE_HEADER_RE.test(line)) {
      hasSeenDate = true
      currentDate = parseDate(line)
      buf.date = currentDate
      continue
    }

    // Tab-delimited row (copied from an HTML <table> on a bank website)
    if (line.includes('\t')) {
      const cells = line
        .split('\t')
        .map((c) => c.trim())
        .filter(Boolean)
      if (cells.length >= 2) {
        const dateCell = cells.find(
          (c) => /^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(c) || /^\d{4}-\d{2}-\d{2}$/.test(c),
        )
        const amtCell = cells.find(
          (c) =>
            parseAmountLine(c) !== null ||
            /^[+-]?\d{1,3}(?:[.,]\d{3})*[.,]\d{2}(?:\s*(?:EUR|€|USD|\$|GBP|£|PLN|zł))?$/i.test(c),
        )

        if (dateCell && amtCell) {
          hasSeenDate = true
          const remaining = cells.filter((c) => c !== dateCell && c !== amtCell)
          const typeCell = remaining.find((c) => ALL_TX_TYPES.has(c.toLowerCase()))
          const textCells = remaining.filter((c) => c !== typeCell)
          const partner = textCells[0] || ''
          const desc = textCells.slice(1).join(' ') || ''
          const parsed = parseAmountLine(amtCell)
          rawTxs.push({
            date: parseDate(dateCell),
            partner,
            desc,
            type: typeCell || '',
            amount: parsed ? parsed.amount : parseAmount(amtCell),
            currency: parsed ? parsed.currency : 'EUR',
          })
          continue
        }
      }
    }

    if (!hasSeenDate) {
      continue
    }

    // Amount line — finalises the current transaction buffer
    const parsedAmt = parseAmountLine(line)
    if (parsedAmt) {
      pushBuf(parsedAmt.amount, parsedAmt.currency)
      continue
    }

    // Transaction type keyword
    if (ALL_TX_TYPES.has(line.toLowerCase())) {
      buf.type = line
      continue
    }

    // Avatar initials placeholder (e.g. "AM", "MG") — skip
    if (/^[A-Z]{1,3}$/.test(line)) {
      continue
    }

    // Remaining text: first line → partner name, subsequent lines → description
    if (!buf.partner) {
      buf.partner = line
    } else if (!buf.desc) {
      buf.desc = line
    } else {
      buf.desc += ' ' + line
    }
  }

  return rawTxs.map((r) => {
    const fullText = [r.partner, r.desc].filter(Boolean).join(' ')
    const ibans = extractIbans(fullText)
    let amount = r.amount
    if (EXPLICIT_INCOME_KEYWORDS_REGEX.test(fullText) && amount < 0) {
      amount = Math.abs(amount)
    }
    const desc = [r.partner, r.desc].filter(Boolean).join(' – ') || r.type || 'Unknown'
    return {
      id: generateId(),
      date: r.date,
      description: desc,
      amount,
      currency: r.currency,
      type: inferType(amount, fullText || desc),
      institution,
      counterpartyIban: ibans.length > 0 ? ibans[0] : undefined,
    }
  })
}
