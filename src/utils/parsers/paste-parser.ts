import type { Transaction } from '../../types'
import { extractIbans } from '../account-transfers'
import {
  EXPLICIT_INCOME_KEYWORDS_REGEX,
  generateId,
  inferType,
  parseAmount,
  parseDate,
} from './helpers'

export function extractAccountIbansFromPaste(rawText: string): string[] {
  const result = new Set<string>()
  const cleanText = rawText.replace(/<[^>]+>/g, ' ')

  // Direct match for German IBAN in header (DE + 20 digits, with or without spaces)
  const directDeMatch = cleanText.match(
    /(?:iban|konto(?:nummer)?|account)[\s:]*(DE\s*\d{2}(?:\s*\d{4}){4}\s*\d{2}|\bDE\d{20}\b)/i,
  )
  if (directDeMatch) {
    result.add(directDeMatch[1].replace(/\s+/g, '').toUpperCase())
  }

  const headerMatch = cleanText.match(
    /(?:iban|konto(?:nummer)?|account)[\s:]+([a-z]{2}\d{2}[a-z0-9 \t]{11,32})/i,
  )
  if (headerMatch) {
    for (const ib of extractIbans(headerMatch[1])) {
      if (ib.startsWith('DE')) {
        const deNormalized = ib.match(/^(DE\d{20})/)?.[1]
        if (deNormalized) {
          result.add(deNormalized)
          continue
        }
      }
      result.add(ib)
    }
  }

  // Fallback: search anywhere in cleanText if header prefix was not present
  if (result.size === 0) {
    const fallbackMatch = cleanText.match(/\b(DE\d{2}(?:\s*\d{4}){4}\s*\d{2})\b/i) || cleanText.match(/\b(DE\d{20})\b/i)
    if (fallbackMatch) {
      result.add(fallbackMatch[1].replace(/\s+/g, '').toUpperCase())
    }
  }

  return Array.from(result)
}

/**
 * Converts bank portal HTML (tables, Cirrus Angular components, card lists, or timeline feeds)
 * into plain text clipboard representation matching what browser selection generates.
 */
export function htmlToClipboardText(htmlContent: string): string {
  if (!/<[a-z][\s\S]*>/i.test(htmlContent)) {
    return htmlContent
  }

  const rows: string[] = []

  // Extract account IBAN if present in the HTML
  const detectedIbans = extractAccountIbansFromPaste(htmlContent)
  if (detectedIbans.length > 0) {
    rows.push(`IBAN: ${detectedIbans[0]}`)
  }

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html')

    // 1. Deutsche Bank / Norisbank / Postbank Cirrus Angular components
    const cirrusRows = doc.querySelectorAll('db-list-row, cirrus-transactions-row-booked')
    if (cirrusRows.length > 0) {
      let activeDate = '01.01.2026'
      const nodes = doc.body.querySelectorAll('h3, h4, db-list-row')
      for (const node of nodes) {
        if (node.tagName === 'H3' || node.tagName === 'H4') {
          const dateMatch = node.textContent?.match(/\b(\d{1,2}\.\d{1,2}\.\d{2,4})\b/)
          if (dateMatch) {
            activeDate = dateMatch[1]
          }
        } else if (node.tagName.toLowerCase() === 'db-list-row') {
          const highlight = node.querySelector('.db-text--highlight')?.textContent?.trim()
          const mute = node.querySelector('.db-text--mute')?.textContent?.trim()
          const amount =
            node.querySelector('.db-amount, [slot="actions"]')?.textContent?.trim() ||
            node.textContent?.match(/([+-]?\s*[\d.,]+\s*EUR)/i)?.[1]
          if (highlight && amount) {
            rows.push(activeDate)
            rows.push(highlight)
            if (mute) {
              rows.push(mute)
            }
            rows.push(amount)
          }
        }
      }
      if (rows.length > 1) {
        return rows.join('\n')
      }
    }

    // 2. Finanz Informatik IF6 Cards (Sparkassen)
    const cardList = doc.querySelector('.mkp-card-list')
    if (cardList) {
      let activeDate = '01.01.2026'
      for (const child of cardList.children) {
        const dateMatch = child.textContent?.match(/\b(\d{1,2}\.\d{1,2}\.\d{2,4})\b/)
        if (dateMatch && (child.classList.contains('mkp-list-subline') || child.querySelector('h3.groupdate, h3'))) {
          activeDate = dateMatch[1]
        }
        const cards = child.querySelectorAll('.mkp-card-clickable, .mkp-card-debit, .mkp-card-credit, .mkp-card')
        for (const card of cards) {
          const partner = card.querySelector('.mkp-identifier-link, h4, strong')?.textContent?.trim()
          const desc = card.querySelector('p')?.textContent?.trim()
          const amtMatch = card.textContent?.match(/([+-]?\s*\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\s*EUR)/i)
          if (partner && amtMatch) {
            rows.push(activeDate)
            rows.push(partner)
            if (desc && desc !== partner) {
              rows.push(desc)
            }
            rows.push(amtMatch[1].trim())
          }
        }
      }
      if (rows.length > 1) {
        return rows.join('\n')
      }
    }

    // 3. HTML Tables
    const tables = doc.querySelectorAll('table')
    if (tables.length > 0) {
      for (const table of tables) {
        let sollIdx = -1
        let habenIdx = -1
        const trs = table.querySelectorAll('tr')
        for (const tr of trs) {
          const ths = tr.querySelectorAll('th')
          if (ths.length > 0) {
            const thTexts = Array.from(ths).map((th) => th.textContent?.trim().toLowerCase() || '')
            sollIdx = thTexts.findIndex((t) => t.includes('soll') || t.includes('belastung'))
            habenIdx = thTexts.findIndex((t) => t.includes('haben') || t.includes('gutschrift'))
            rows.push(
              Array.from(ths)
                .map((th) => th.textContent?.replace(/\s+/g, ' ').trim() || '')
                .join('\t'),
            )
            continue
          }

          const tds = tr.querySelectorAll('td')
          if (tds.length === 0) {
            continue
          }

          const cellTexts = Array.from(tds).map((td) => td.textContent?.replace(/\s+/g, ' ').trim() || '')

          if (sollIdx !== -1 && habenIdx !== -1) {
            const sollVal = cellTexts[sollIdx]
            const habenVal = cellTexts[habenIdx]
            if (sollVal && /\d/.test(sollVal) && !habenVal) {
              cellTexts[sollIdx] = sollVal.startsWith('-') ? sollVal : `-${sollVal}`
            } else if (habenVal && /\d/.test(habenVal) && !sollVal) {
              cellTexts[habenIdx] = habenVal.startsWith('+') ? habenVal : `+${habenVal}`
            }
          }

          rows.push(cellTexts.join('\t'))
        }
      }
      if (rows.length > 1) {
        return rows.join('\n')
      }
    }

    // 4. Feed cards & Timeline items (Neobanks)
    const feedItems = doc.querySelectorAll('.feed-card, .timeline-item, .transaction-item, .activity-item')
    if (feedItems.length > 0) {
      for (const item of feedItems) {
        const text = item.textContent || ''
        const dateMatch =
          text.match(/\b(\d{1,2}\.\d{1,2}\.\d{2,4})\b/) || text.match(/\b(\d{4}-\d{2}-\d{2})\b/)
        const title = item.querySelector('.title, h4, h5, strong, .partner')?.textContent?.trim()
        const subtitle = item.querySelector('.subtitle, .desc, .cat, p')?.textContent?.trim()
        const amountEl = item.querySelector('.amount, .amt, .amt-neg, .amt-pos, [class*="amount"]')
        const amountText =
          amountEl?.textContent?.trim() ||
          text.match(/([+-]?\s*(?:[A-Z]{3}|€|£|\$|zł)?\s*[\d.,]+\s*(?:[A-Z]{3}|€|£|\$|zł)?)/i)?.[1]?.trim()

        if (dateMatch && title && amountText) {
          rows.push(dateMatch[1])
          rows.push(title)
          if (subtitle && subtitle !== title) {
            rows.push(subtitle)
          }
          rows.push(amountText)
        }
      }
      if (rows.length > 1) {
        return rows.join('\n')
      }
    }
  }

  return rows.join('\n')
}

import {
  ALL_ICON_PREFIX_RE,
  ALL_PROJECTED_DATE_RE,
  ALL_SKIP_PATTERNS,
  ALL_TX_TYPES,
} from './parser-i18n'

const CURRENCY_SYMBOLS: Record<string, string> = {
  '€': 'EUR',
  '$': 'USD',
  '£': 'GBP',
  'zł': 'PLN',
  'ZŁ': 'PLN',
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

// Amount pattern: optional leading comma and minus or plus, digits with . or , separators, ends with common currency
const AMOUNT_RE = /^,?([+-]?\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*([A-Z]{3}|€|£|\$|zł)$/i
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
