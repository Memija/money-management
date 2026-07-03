export interface ParserLocaleConfig {
  /** Lines that are pure UI noise and must be discarded before parsing. */
  skipPatterns: RegExp[]
  /** Lower-cased transaction-type keywords (e.g. "direct debit"). */
  txTypes: string[]
  /** Matches a pending/projected booking-date prefix, capturing the date in group 1. */
  projectedDateRe: RegExp
  /** Strips avatar / icon label prefixes from a copied line. */
  iconPrefixRe: RegExp
  /** Keywords that indicate a PDF summary / balance footer line. */
  summaryKeywords: string[]
}
