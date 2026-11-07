import { extractIbans } from '../account-transfers'

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
    const fallbackMatch =
      cleanText.match(/\b(DE\d{2}(?:\s*\d{4}){4}\s*\d{2})\b/i) || cleanText.match(/\b(DE\d{20})\b/i)
    if (fallbackMatch) {
      result.add(fallbackMatch[1].replace(/\s+/g, '').toUpperCase())
    }
  }

  return Array.from(result)
}

function getCellText(el: Element): string {
  return (el.innerHTML || el.textContent || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractCirrusRows(doc: Document, baseRows: string[]): string[] | null {
  const cirrusRows = doc.querySelectorAll(
    'db-list-row, cirrus-transactions-row-booked, tx-list-row',
  )
  if (cirrusRows.length === 0) {
    return null
  }

  const rows = [...baseRows]
  let activeDate = '01.01.2026'
  const nodes = doc.body.querySelectorAll('h3, h4, db-list-row, tx-list-row')
  for (const node of nodes) {
    if (node.tagName === 'H3' || node.tagName === 'H4') {
      const text = getCellText(node)
      const dateMatch =
        text.match(/\b(\d{1,2}[./]\d{1,2}[./]\d{2,4})\b/) || text.match(/\b(\d{4}-\d{2}-\d{2})\b/)
      if (dateMatch) {
        activeDate = dateMatch[1]
      }
      continue
    }
    const tag = node.tagName.toLowerCase()
    if (tag !== 'db-list-row' && tag !== 'tx-list-row') {
      continue
    }
    const highlight = node
      .querySelector('.db-text--highlight, .tx-partner, strong')
      ?.textContent?.trim()
    const mute = node.querySelector('.db-text--mute, .tx-purpose, span')?.textContent?.trim()
    const amount =
      node.querySelector('.db-amount, .tx-amount, [slot="actions"]')?.textContent?.trim() ||
      getCellText(node).match(/([+-]?\s*[\d.,]+\s*(?:EUR|USD|GBP|PLN|CHF|€|\$|£|zł))/i)?.[1]
    if (!highlight || !amount) {
      continue
    }
    rows.push(activeDate, highlight)
    if (mute && mute !== highlight) {
      rows.push(mute)
    }
    rows.push(amount)
  }

  return rows.length > 1 ? rows : null
}

function appendSparkasseCardRow(card: Element, activeDate: string, rows: string[]) {
  const partner = card
    .querySelector('.mkp-identifier-link, .card-partner, h4, strong')
    ?.textContent?.trim()
  const desc = card.querySelector('p, .card-purpose')?.textContent?.trim()
  const amtMatch = getCellText(card).match(
    /([+-]?\s*\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\s*(?:EUR|USD|GBP|PLN|CHF|€|\$|£|zł))/i,
  )
  if (!partner || !amtMatch) {
    return
  }
  rows.push(activeDate, partner)
  if (desc && desc !== partner) {
    rows.push(desc)
  }
  rows.push(amtMatch[1].trim())
}

function extractSparkasseCards(doc: Document, baseRows: string[]): string[] | null {
  const cardList = doc.querySelector('.mkp-card-list, .day-card-list')
  if (!cardList) {
    return null
  }

  const rows = [...baseRows]
  let activeDate = '01.01.2026'
  for (const child of cardList.children) {
    const childText = getCellText(child)
    const dateMatch =
      childText.match(/\b(\d{1,2}[./]\d{1,2}[./]\d{2,4})\b/) ||
      childText.match(/\b(\d{4}-\d{2}-\d{2})\b/)
    const isDateHeader =
      child.classList.contains('mkp-list-subline') ||
      child.classList.contains('day-header') ||
      Boolean(child.querySelector('h3.groupdate, h3, h4'))
    if (dateMatch && isDateHeader) {
      activeDate = dateMatch[1]
    }
    const cards = child.querySelectorAll(
      '.mkp-card-clickable, .mkp-card-debit, .mkp-card-credit, .mkp-card, .day-card',
    )
    for (const card of cards) {
      appendSparkasseCardRow(card, activeDate, rows)
    }
  }

  return rows.length > 1 ? rows : null
}

function applySollHabenSigns(
  cellTexts: string[],
  sollIdx: number,
  habenIdx: number,
  shIndicatorIdx = -1,
  amtIdx = -1,
) {
  if (sollIdx !== -1 && habenIdx !== -1) {
    const sollVal = cellTexts[sollIdx]
    const habenVal = cellTexts[habenIdx]
    if (sollVal && /\d/.test(sollVal) && !habenVal) {
      cellTexts[sollIdx] = sollVal.startsWith('-') ? sollVal : `-${sollVal}`
    } else if (habenVal && /\d/.test(habenVal) && !sollVal) {
      cellTexts[habenIdx] = habenVal.startsWith('+') ? habenVal : `+${habenVal}`
    }
  }
  if (shIndicatorIdx !== -1 && amtIdx !== -1) {
    const ind = cellTexts[shIndicatorIdx]?.trim().toUpperCase() || ''
    const amt = cellTexts[amtIdx]?.trim() || ''
    if (amt && /^(?:S|SOLL|D|DR|DBIT|DEBIT|-)$/i.test(ind) && !amt.startsWith('-')) {
      cellTexts[amtIdx] = `-${amt}`
    }
  }
}

function isBalanceColumnHeader(text: string): boolean {
  return /^(?:saldo|kontostand|balance|neuer saldo|running balance)(?:\s*\(.*\))?$/i.test(text)
}

function extractTableRows(table: Element, rows: string[]) {
  let sollIdx = -1
  let habenIdx = -1
  let shIdx = -1
  let amtIdx = -1
  let balanceIdx = -1
  const trs = table.querySelectorAll('tr, [role="row"]')
  for (const tr of trs) {
    const ths = tr.querySelectorAll('th, [role="columnheader"]')
    if (ths.length > 0) {
      const thTexts = Array.from(ths).map((th) => getCellText(th).toLowerCase())
      sollIdx = thTexts.findIndex(
        (t) => t.includes('soll') || t.includes('belastung') || t === 'debit',
      )
      habenIdx = thTexts.findIndex(
        (t) => t.includes('haben') || t.includes('gutschrift') || t === 'credit',
      )
      shIdx = thTexts.findIndex((t) => t === 's/h' || t === 'soll/haben' || t === 'd/c')
      amtIdx = thTexts.findIndex(
        (t) =>
          t.includes('betrag') || t.includes('amount') || t === 'umsatz' || t.includes('kwota'),
      )
      if (ths.length >= 4 && (amtIdx !== -1 || (sollIdx !== -1 && habenIdx !== -1))) {
        balanceIdx = thTexts.findIndex((t) => isBalanceColumnHeader(t))
      }
      const headerCells = Array.from(ths)
        .map((th) => getCellText(th))
        .filter((_, idx) => idx !== balanceIdx && idx !== shIdx)
      rows.push(headerCells.join('\t'))
      continue
    }

    const tds = tr.querySelectorAll('td, [role="cell"], [role="gridcell"]')
    if (tds.length === 0) {
      continue
    }

    const cellTexts = Array.from(tds).map((td) => getCellText(td))
    applySollHabenSigns(cellTexts, sollIdx, habenIdx, shIdx, amtIdx)
    const filteredCells = cellTexts.filter((_, idx) => idx !== balanceIdx && idx !== shIdx)
    rows.push(filteredCells.join('\t'))
  }
}

function extractHtmlTables(doc: Document, baseRows: string[]): string[] | null {
  const tables = doc.querySelectorAll('table, [role="table"], [role="grid"]')
  if (tables.length === 0) {
    return null
  }

  const rows = [...baseRows]
  for (const table of tables) {
    extractTableRows(table, rows)
  }

  return rows.length > 1 ? rows : null
}

function extractFeedItems(doc: Document, baseRows: string[]): string[] | null {
  const feedItems = doc.querySelectorAll(
    '.feed-card, .timeline-item, .transaction-item, .activity-item, details, article, li',
  )
  if (feedItems.length === 0) {
    return null
  }

  const rows = [...baseRows]
  for (const item of feedItems) {
    const text = getCellText(item)
    const dateMatch =
      text.match(/\b(\d{1,2}[./]\d{1,2}[./]\d{2,4})\b/) || text.match(/\b(\d{4}-\d{2}-\d{2})\b/)
    const title = item
      .querySelector('.title, h4, h5, strong, .partner, [data-partner]')
      ?.textContent?.trim()
    const subtitle = item
      .querySelector('.subtitle, .desc, .cat, p, em, [data-purpose]')
      ?.textContent?.trim()
    const amountEl = item.querySelector(
      '.amount, .amt, .amt-neg, .amt-pos, [class*="amount"], [data-amount]',
    )
    const amountText =
      amountEl?.textContent?.trim() ||
      text
        .match(
          /([+-]?\s*(?:[A-Z]{3}|€|£|\$|zł)?\s*\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\s*(?:[A-Z]{3}|€|£|\$|zł))/i,
        )?.[1]
        ?.trim()

    if (!dateMatch || !title || !amountText) {
      continue
    }
    rows.push(dateMatch[1], title)
    if (subtitle && subtitle !== title) {
      rows.push(subtitle)
    }
    rows.push(amountText)
  }

  return rows.length > 1 ? rows : null
}

/**
 * Converts bank portal HTML (tables, Cirrus Angular components, card lists, or timeline feeds)
 * into plain text clipboard representation matching what browser selection generates.
 */
export function htmlToClipboardText(htmlContent: string): string {
  if (!/<[a-z][\s\S]*>/i.test(htmlContent)) {
    return htmlContent
  }

  const baseRows: string[] = []
  const detectedIbans = extractAccountIbansFromPaste(htmlContent)
  if (detectedIbans.length > 0) {
    baseRows.push(`IBAN: ${detectedIbans[0]}`)
  }

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html')
    const matchedRows =
      extractCirrusRows(doc, baseRows) ||
      extractSparkasseCards(doc, baseRows) ||
      extractHtmlTables(doc, baseRows) ||
      extractFeedItems(doc, baseRows)

    if (matchedRows) {
      return matchedRows.join('\n')
    }
  }

  return baseRows.join('\n')
}
