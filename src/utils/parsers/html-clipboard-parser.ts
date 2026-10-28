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

function extractCirrusRows(doc: Document, baseRows: string[]): string[] | null {
  const cirrusRows = doc.querySelectorAll('db-list-row, cirrus-transactions-row-booked')
  if (cirrusRows.length === 0) {
    return null
  }

  const rows = [...baseRows]
  let activeDate = '01.01.2026'
  const nodes = doc.body.querySelectorAll('h3, h4, db-list-row')
  for (const node of nodes) {
    if (node.tagName === 'H3' || node.tagName === 'H4') {
      const dateMatch = node.textContent?.match(/\b(\d{1,2}\.\d{1,2}\.\d{2,4})\b/)
      if (dateMatch) {
        activeDate = dateMatch[1]
      }
      continue
    }
    if (node.tagName.toLowerCase() !== 'db-list-row') {
      continue
    }
    const highlight = node.querySelector('.db-text--highlight')?.textContent?.trim()
    const mute = node.querySelector('.db-text--mute')?.textContent?.trim()
    const amount =
      node.querySelector('.db-amount, [slot="actions"]')?.textContent?.trim() ||
      node.textContent?.match(/([+-]?\s*[\d.,]+\s*EUR)/i)?.[1]
    if (!highlight || !amount) {
      continue
    }
    rows.push(activeDate, highlight)
    if (mute) {
      rows.push(mute)
    }
    rows.push(amount)
  }

  return rows.length > 1 ? rows : null
}

function appendSparkasseCardRow(card: Element, activeDate: string, rows: string[]) {
  const partner = card.querySelector('.mkp-identifier-link, h4, strong')?.textContent?.trim()
  const desc = card.querySelector('p')?.textContent?.trim()
  const amtMatch = card.textContent?.match(/([+-]?\s*\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\s*EUR)/i)
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
  const cardList = doc.querySelector('.mkp-card-list')
  if (!cardList) {
    return null
  }

  const rows = [...baseRows]
  let activeDate = '01.01.2026'
  for (const child of cardList.children) {
    const dateMatch = child.textContent?.match(/\b(\d{1,2}\.\d{1,2}\.\d{2,4})\b/)
    const isDateHeader =
      child.classList.contains('mkp-list-subline') ||
      Boolean(child.querySelector('h3.groupdate, h3'))
    if (dateMatch && isDateHeader) {
      activeDate = dateMatch[1]
    }
    const cards = child.querySelectorAll(
      '.mkp-card-clickable, .mkp-card-debit, .mkp-card-credit, .mkp-card',
    )
    for (const card of cards) {
      appendSparkasseCardRow(card, activeDate, rows)
    }
  }

  return rows.length > 1 ? rows : null
}

function applySollHabenSigns(cellTexts: string[], sollIdx: number, habenIdx: number) {
  if (sollIdx === -1 || habenIdx === -1) {
    return
  }
  const sollVal = cellTexts[sollIdx]
  const habenVal = cellTexts[habenIdx]
  if (sollVal && /\d/.test(sollVal) && !habenVal) {
    cellTexts[sollIdx] = sollVal.startsWith('-') ? sollVal : `-${sollVal}`
  } else if (habenVal && /\d/.test(habenVal) && !sollVal) {
    cellTexts[habenIdx] = habenVal.startsWith('+') ? habenVal : `+${habenVal}`
  }
}

function extractTableRows(table: Element, rows: string[]) {
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
    applySollHabenSigns(cellTexts, sollIdx, habenIdx)
    rows.push(cellTexts.join('\t'))
  }
}

function extractHtmlTables(doc: Document, baseRows: string[]): string[] | null {
  const tables = doc.querySelectorAll('table')
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
    '.feed-card, .timeline-item, .transaction-item, .activity-item',
  )
  if (feedItems.length === 0) {
    return null
  }

  const rows = [...baseRows]
  for (const item of feedItems) {
    const text = item.textContent || ''
    const dateMatch =
      text.match(/\b(\d{1,2}\.\d{1,2}\.\d{2,4})\b/) || text.match(/\b(\d{4}-\d{2}-\d{2})\b/)
    const title = item.querySelector('.title, h4, h5, strong, .partner')?.textContent?.trim()
    const subtitle = item.querySelector('.subtitle, .desc, .cat, p')?.textContent?.trim()
    const amountEl = item.querySelector('.amount, .amt, .amt-neg, .amt-pos, [class*="amount"]')
    const amountText =
      amountEl?.textContent?.trim() ||
      text
        .match(/([+-]?\s*(?:[A-Z]{3}|€|£|\$|zł)?\s*[\d.,]+\s*(?:[A-Z]{3}|€|£|\$|zł)?)/i)?.[1]
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
