export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export const EXPLICIT_INCOME_KEYWORDS_REGEX =
  /(?:\b(?:r[uü]ckverg[uü]tung\w*|rueckverguetung\w*|r[uü]ck[uü]berweisung\w*|rueckueberweisung\w*|geb[uü]hrenerstattung\w*|gebuehrenerstattung\w*|entgelterstattung\w*|reisesp\w*|reisekosten\w*|spesen\w*|auslagenerstattung|gehalt\w*|lohn\w*|bez[uü]ge|arbeitsentgelt\w*|salary\w*|payroll\w*)\b)/i

export function inferType(amount: number, description?: string): 'income' | 'expense' {
  if (description && EXPLICIT_INCOME_KEYWORDS_REGEX.test(description)) {
    return 'income'
  }
  return amount >= 0 ? 'income' : 'expense'
}

export function parseCurrency(raw: string | undefined): string {
  const curr = raw ? raw.toUpperCase() : 'EUR'
  if (curr === '€') {
    return 'EUR'
  } else if (curr === '$') {
    return 'USD'
  } else if (curr === '£') {
    return 'GBP'
  } else if (curr === 'ZŁ') {
    return 'PLN'
  }
  return curr
}

export function parseAmount(raw: string | number): number {
  if (typeof raw === 'number') {
    return raw
  }

  // Normalize Unicode minus/dash variants and apostrophe thousands separators
  const cleanedStr = raw
    .toString()
    .replace(/[\u2212\u2013\u2014\u2015]/g, '-')
    .replace(/['’ʼ]/g, '')
    .trim()

  const isParenthesized = /^\(.*\)$/.test(cleanedStr)
  const hasDebitSuffix = /\b(?:DR|DBIT)\s*$/i.test(cleanedStr)

  // Clean out parentheses, spaces, currency symbols, and any alphabetic indicators (S/H/EUR/etc)
  let cleaned = cleanedStr.replace(/[()€$£a-zA-Z\s+]/g, '').trim()

  let isNegative = false
  // Detect trailing signs/indicators, accounting parentheses, or leading minus
  if (
    isParenthesized ||
    hasDebitSuffix ||
    cleanedStr.endsWith('-') ||
    cleanedStr.endsWith('S') ||
    cleanedStr.endsWith('s') ||
    cleaned.startsWith('-')
  ) {
    isNegative = true
  }

  cleaned = cleaned.replace(/-/g, '') // remove minus so we only rely on isNegative

  // Handle European format: 1.234,56 → 1234.56
  if (/,\d{1,2}$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else {
    // US format: remove commas
    cleaned = cleaned.replace(/,/g, '')
  }

  const num = parseFloat(cleaned)
  if (isNaN(num)) {
    return 0
  }

  return isNegative ? -Math.abs(num) : Math.abs(num)
}

export function parseDate(raw: string, defaultYear?: string): string {
  if (!raw) {
    return new Date().toISOString().split('T')[0]
  }
  const trimmed = raw.trim()
  // Try to parse DD.MM.YYYY (common German format)
  const deMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/)
  if (deMatch) {
    const year = deMatch[3].length === 2 ? '20' + deMatch[3] : deMatch[3]
    return `${year}-${deMatch[2].padStart(2, '0')}-${deMatch[1].padStart(2, '0')}`
  }
  // Try short German Kontoauszug format DD.MM. (year inferred from statement header)
  const deShortMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.$/)
  if (deShortMatch) {
    const year = defaultYear || String(new Date().getFullYear())
    return `${year}-${deShortMatch[2].padStart(2, '0')}-${deShortMatch[1].padStart(2, '0')}`
  }
  // Try ISO format
  const isoMatch = trimmed.match(/^\d{4}-\d{2}-\d{2}/)
  if (isoMatch) {
    return isoMatch[0]
  }
  // Try MM/DD/YYYY or DD/MM/YYYY (disambiguate when first part > 12)
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (slashMatch) {
    const year = slashMatch[3].length === 2 ? '20' + slashMatch[3] : slashMatch[3]
    const first = parseInt(slashMatch[1], 10)
    const month = first > 12 ? slashMatch[2] : slashMatch[1]
    const day = first > 12 ? slashMatch[1] : slashMatch[2]
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return new Date().toISOString().split('T')[0]
}

export function isValidDateRaw(raw: string): boolean {
  if (!raw) {
    return false
  }
  const trimmed = raw.trim()
  if (trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/)) {
    return true
  }
  if (trimmed.match(/^\d{4}-\d{2}-\d{2}/)) {
    return true
  }
  if (trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)) {
    return true
  }
  return false
}

/**
 * Counts occurrences of a delimiter character outside double-quoted strings.
 */
function countUnquotedDelimiter(line: string, sep: string): number {
  let count = 0
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
    } else if (c === sep && !inQuotes) {
      count++
    }
  }
  return count
}

/**
 * Detects the column delimiter (`;`, `\t`, or `,`) across the first 25 non-empty lines,
 * so single-cell preamble rows (e.g. `"Umsatzanzeige"`, `"Umsätze Girokonto"`) do not
 * hide the semicolon or tab delimiter used by the actual table rows below.
 */
export function detectCsvSeparator(text: string): string {
  const nonEmptyLines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 25)

  if (nonEmptyLines.length === 0) {
    return ','
  }

  if (
    nonEmptyLines.some((l) => countUnquotedDelimiter(l, ';') >= 2) ||
    nonEmptyLines[0].includes(';')
  ) {
    return ';'
  }
  if (
    nonEmptyLines.some((l) => countUnquotedDelimiter(l, '\t') >= 2) ||
    nonEmptyLines[0].includes('\t')
  ) {
    return '\t'
  }
  return ','
}

/**
 * Splits a CSV or TSV line into cell values, respecting quotes so that separators
 * inside quoted strings are not split.
 */
export function splitCsvLine(line: string, sep: string): string[] {
  const result: string[] = []
  let cur = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (c === sep && !inQuotes) {
      result.push(cur.trim().replace(/^"|"$/g, ''))
      cur = ''
    } else {
      cur += c
    }
  }
  result.push(cur.trim().replace(/^"|"$/g, ''))
  return result
}

/**
 * Parses full CSV/TSV text into a 2D array of cells, auto-detecting the delimiter
 * across preamble rows and joining multiline quoted cells (e.g. multi-line
 * `Verwendungszweck` fields in German bank exports) into single logical rows.
 */
export function parseCsvText(text: string, sep?: string): string[][] {
  const cleanText = text.replace(/^\uFEFF/, '').trim()
  if (!cleanText) {
    return []
  }

  const resolvedSep = sep ?? detectCsvSeparator(cleanText)
  const rawLines = cleanText.split(/\r?\n/)
  const totalQuotes = (cleanText.match(/"/g) || []).length
  const canMergeMultilineQuotes = totalQuotes > 0 && totalQuotes % 2 === 0

  const logicalLines: string[] = []
  let buffer = ''
  let inQuotes = false

  for (const rawLine of rawLines) {
    if (!canMergeMultilineQuotes) {
      logicalLines.push(rawLine)
      continue
    }

    buffer = buffer ? `${buffer} ${rawLine.trim()}` : rawLine
    for (let i = 0; i < rawLine.length; i++) {
      if (rawLine[i] === '"') {
        inQuotes = !inQuotes
      }
    }

    if (!inQuotes) {
      logicalLines.push(buffer)
      buffer = ''
    }
  }

  if (buffer) {
    logicalLines.push(buffer)
  }

  return logicalLines.map((line) => splitCsvLine(line, resolvedSep))
}
