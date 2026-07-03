import { bs } from '../../i18n/parser-locales/bs'
import { de } from '../../i18n/parser-locales/de'
import { en } from '../../i18n/parser-locales/en'
import { id } from '../../i18n/parser-locales/id'
import { pl } from '../../i18n/parser-locales/pl'
import { sr } from '../../i18n/parser-locales/sr'
import type { ParserLocaleConfig } from '../../i18n/parser-locales/types'

export type { ParserLocaleConfig }

/**
 * All locale configs keyed by locale code.
 * Add a new entry here to support an additional language.
 */
export const LOCALE_CONFIGS: Record<string, ParserLocaleConfig> = { de, en, bs, pl, sr, id }

/**
 * Combined SKIP_PATTERNS drawn from every locale – used by parsers that
 * operate without knowing the portal language in advance.
 */
export const ALL_SKIP_PATTERNS: RegExp[] = [
  // Structural patterns that apply regardless of locale
  /^[A-Z]{2}\d{2}\s(?:\d{4}\s)*\d{1,4}/i, // Generic spaced IBAN
  /^[A-Z]{2}\d{14,32}/i, // Generic continuous IBAN
  ...Object.values(LOCALE_CONFIGS).flatMap((c) => c.skipPatterns),
]

/**
 * Combined TX_TYPES set drawn from every locale – used to identify transaction
 * type label lines without knowing the portal language in advance.
 */
export const ALL_TX_TYPES: Set<string> = new Set(
  Object.values(LOCALE_CONFIGS).flatMap((c) => c.txTypes),
)

/**
 * Combined icon-prefix pattern that strips avatar labels in any locale.
 * Falls back gracefully if a locale's pattern doesn't match.
 */
export const ALL_ICON_PREFIX_RE: RegExp = new RegExp(
  Object.values(LOCALE_CONFIGS)
    .map((c) => c.iconPrefixRe.source)
    .join('|'),
  'i',
)

/**
 * Combined projected-date pattern that matches pending booking annotations
 * in any locale, capturing the date in group 1.
 */
export const ALL_PROJECTED_DATE_RE: RegExp = new RegExp(
  Object.values(LOCALE_CONFIGS)
    .map((c) => `(?:${c.projectedDateRe.source})`)
    .join('|'),
  'i',
)

/**
 * Combined summary keywords drawn from every locale – used by the PDF parser
 * to skip balance/total footer lines.
 */
export const ALL_SUMMARY_KEYWORDS: string[] = Object.values(LOCALE_CONFIGS).flatMap(
  (c) => c.summaryKeywords,
)
