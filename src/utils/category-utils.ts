import { categoryI18nKeys } from '../i18n/categories'
import { type CategoryKeywords, translations, type TranslationStrings } from '../i18n/translations'
import type { CustomCategory, Transaction } from '../types'

// Pre-compile regular expressions for categorization
const categoryRegexes: Partial<Record<keyof CategoryKeywords, RegExp>> = {}
const aggregatedKeywords: Record<string, string[]> = {}

// Build aggregated keywords across all languages
for (const locale of Object.values(translations)) {
  const keywords = locale.categoryKeywords
  if (keywords) {
    for (const [cat, words] of Object.entries(keywords)) {
      if (!aggregatedKeywords[cat]) aggregatedKeywords[cat] = []
      aggregatedKeywords[cat].push(...words)
    }
  }
}

// Compile one Regex per category
for (const [cat, words] of Object.entries(aggregatedKeywords)) {
  if (words.length > 0) {
    const uniqueWords = [...new Set(words)]
    categoryRegexes[cat as keyof CategoryKeywords] = new RegExp(uniqueWords.join('|'), 'i')
  }
}

// Build reverse lookup of localized category labels across all languages to canonical keys
const localizedCategoryMap: Record<string, string> = {}
for (const locale of Object.values(translations)) {
  for (const [canonicalKey, i18nKey] of Object.entries(categoryI18nKeys)) {
    const label = locale[i18nKey]
    if (typeof label === 'string') {
      const normalized = canonicalKey === 'DiningOut' ? 'Dining Out' : canonicalKey
      localizedCategoryMap[label.toLowerCase()] = normalized
    }
  }
}

const defaultCategoryCache = new Map<string, string>()

/**
 * Infers a category from a transaction description using keyword matching.
 * Returns one of the standardized category keys (e.g. 'Salary', 'Groceries').
 */
export function categorize(desc: string, customKeywords?: Record<string, string[]>): string {
  if (!desc || typeof desc !== 'string') return 'Other'
  const d = desc.toLowerCase()

  // First evaluate user's custom keywords
  if (customKeywords) {
    for (const [cat, words] of Object.entries(customKeywords)) {
      if (!words || words.length === 0) continue
      if (words.some((w) => d.includes(w.toLowerCase()))) {
        if (cat === 'DiningOut') return 'Dining Out'
        return cat
      }
    }
  }

  const cached = defaultCategoryCache.get(d)
  if (cached !== undefined) {
    return cached
  }

  // Evaluate in the original priority order
  const order: (keyof CategoryKeywords)[] = [
    'Salary',
    'Rent',
    'Groceries',
    'DiningOut',
    'Shopping',
    'Transport',
    'Travel',
    'Entertainment',
    'Insurance',
    'Communication',
    'Utilities',
    'Healthcare',
    'Savings',
    'Transfers',
  ]

  for (const cat of order) {
    if (categoryRegexes[cat]?.test(d)) {
      // Map 'DiningOut' back to 'Dining Out' for the internal key
      const result = cat === 'DiningOut' ? 'Dining Out' : cat
      defaultCategoryCache.set(d, result)
      return result
    }
  }

  defaultCategoryCache.set(d, 'Other')
  return 'Other'
}

/**
 * Resolves any category input (canonical key, localized label, or raw keyword)
 * to its standardized canonical category key ('Salary', 'Rent', 'Groceries', 'Dining Out', etc.).
 */
export function resolveCanonicalCategory(name: string): string {
  if (!name || typeof name !== 'string') return 'Other'
  const trimmed = name.trim()
  if (!trimmed) return 'Other'

  // 1. Exact match against canonical category keys
  if (categoryI18nKeys[trimmed]) {
    return trimmed === 'DiningOut' ? 'Dining Out' : trimmed
  }

  // 2. Exact match against localized category labels across all languages
  const lower = trimmed.toLowerCase()
  if (localizedCategoryMap[lower]) {
    return localizedCategoryMap[lower]
  }

  // 3. Multilingual keyword categorization across all locales
  const categorized = categorize(trimmed)
  if (categorized && categorized !== 'Other') {
    return categorized
  }

  return 'Other'
}

/**
 * Returns a localized display label for a transaction category key.
 * Falls back to the raw key if no translation is found.
 */
export function getCategoryLabel(
  catKey: string,
  t: TranslationStrings,
  locale?: string,
  customCategories?: CustomCategory[],
): string {
  const i18nKey = categoryI18nKeys[catKey]
  if (i18nKey && t[i18nKey]) {
    return t[i18nKey] as string
  }

  // Handle custom categories
  if (customCategories && catKey.startsWith('custom_')) {
    const custom = customCategories.find((c) => c.id === catKey)
    if (custom) {
      if (locale && custom.translations[locale]) {
        return custom.translations[locale]
      }
      return custom.translations['en'] || Object.values(custom.translations)[0] || catKey
    }
  }

  return catKey
}

/**
 * Helper to resolve the final category for a transaction,
 * applying manual overrides and custom keywords.
 */
export function getTransactionCategory(
  t: Transaction,
  customKeywords?: Record<string, string[]>,
  manualCategories?: Record<string, string>,
): string {
  if (manualCategories && manualCategories[t.id]) {
    return manualCategories[t.id]
  }
  if (t.category) {
    return t.category
  }
  return categorize(t.description, customKeywords)
}

export const normalizeDescription = (desc: string): string => {
  return (
    desc
      .toLowerCase()
      // Remove dates like DD/MM/YYYY, DD.MM.YY, DD-MM
      .replace(/\b\d{1,2}[-./]\d{1,2}([-./]\d{2,4})?\b/g, '')
      // Remove long numeric strings (e.g., transaction IDs, reference numbers)
      .replace(/\b\d{4,}\b/g, '')
      // Remove special characters, keep alphanumeric and spaces
      .replace(/[^\w\s]/g, ' ')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
  )
}

/**
 * Strips SEPA payment references, bank noise prefixes, transaction IDs,
 * timestamps, and dates from a transaction description to extract the
 * clean core payee/merchant/purpose description.
 */
export function extractCleanDescription(desc: string): string {
  if (!desc || typeof desc !== 'string') return ''

  let cleaned = desc.trim()

  // 1. Remove common German / European banking prefixes
  cleaned = cleaned.replace(
    /^(?:Auftraggeber|Empf[aä]nger|Zahlungsempf[aä]nger|Verwendungszweck|Buchungstext|Umsatztext)\s*:\s*/i,
    '',
  )

  // 2. Strip SEPA reference metadata tags and everything following them when appended at the end
  // Handles: End-to-End-Ref.: ..., End to End Ref: ..., EREF+..., KREF+..., MREF+..., CRED+...,
  // DEBT+..., SVWZ+..., Mandatsref: ..., Referenz: ..., Reference: ..., Ref. Nr: ..., IBAN: ..., BIC: ...
  cleaned = cleaned.replace(
    /(?:\b(?:End[-\s]?to[-\s]?End[-\s]?(?:Ref(?:\.|erenz|-Id)?)|EREF|KREF|MREF|CRED|DEBT|SVWZ|Mandatsref(?:\.|erenz)?|Referenz|Reference|Ref(?:\.|\s*Nr\.?)?|Gl[aä]ubiger[-\s]?ID)\s*[:+]?|\b(?:IBAN|BIC)\s*:\s*[A-Z0-9]+).*/i,
    '',
  )

  // 3. Remove date formats (DD.MM.YYYY, DD/MM/YYYY, DD-MM-YY, etc.) and timestamps
  cleaned = cleaned.replace(
    /\b(?:am\s+)?\d{1,2}[-./]\d{1,2}(?:[-./]\d{2,4})?(?:\s+(?:um\s+)?\d{1,2}:\d{2}(?::\d{2})?)?\b/gi,
    ' ',
  )

  // 4. Remove standalone long numeric or alphanumeric reference codes (8+ chars with digits, e.g. terminal/auth IDs)
  cleaned = cleaned.replace(/\b[A-Za-z0-9]*\d[A-Za-z0-9]{7,}\b/g, ' ')

  // 5. Remove standalone numbers with 4+ digits (e.g. postal codes, terminal codes, internal IDs)
  cleaned = cleaned.replace(/\b\d{4,}\b/g, ' ')

  // 6. Clean up extraneous punctuation while preserving periods, ampersands, and hyphens in brand names
  cleaned = cleaned
    .replace(/[^\w\s\u00C0-\u024F\u0400-\u04FF.&-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.:;/-]+|[\s,.:;/-]+$/g, '')
    .trim()

  return cleaned
}

/**
 * Determines whether two transaction descriptions are related
 * (e.g., same core merchant or recurring charge with different SEPA/card reference IDs).
 */
export function isRelatedTransaction(descA: string, descB: string): boolean {
  if (!descA || !descB) return false

  const cleanA = extractCleanDescription(descA).toLowerCase()
  const cleanB = extractCleanDescription(descB).toLowerCase()

  // 1. Exact match on clean description (if length >= 3)
  if (cleanA.length >= 3 && cleanA === cleanB) return true

  // 2. Normalized description fallback
  const normA = normalizeDescription(descA)
  const normB = normalizeDescription(descB)
  if (normA.length >= 3 && normA === normB) return true

  // 3. Prefix matching: if one clean string starts with the other on a word boundary
  // Require at least 8 characters for the shorter string to avoid false positives (e.g. "Bar", "Apple")
  if (cleanA.length >= 8 && cleanB.length >= 8) {
    const shorter = cleanA.length <= cleanB.length ? cleanA : cleanB
    const longer = cleanA.length <= cleanB.length ? cleanB : cleanA
    if (longer.startsWith(shorter)) {
      const nextChar = longer.charAt(shorter.length)
      if (nextChar === '' || nextChar === ' ' || nextChar === '-' || nextChar === '/') {
        return true
      }
    }
  }

  return false
}

/**
 * Finds all non-ghost transactions in a collection that are related to the target transaction.
 * If targetCategory is specified, filters only candidates whose category is different from targetCategory.
 */
export function findRelatedTransactions(
  targetTx: Transaction,
  allTransactions: Transaction[],
  targetCategory?: string,
): Transaction[] {
  if (!targetTx || !allTransactions || allTransactions.length === 0) return []

  const seenIds = new Set<string>()
  const results: Transaction[] = []

  for (const candidate of allTransactions) {
    if (!candidate || candidate.id === targetTx.id || candidate.isGhost) {
      continue
    }

    if (seenIds.has(candidate.id)) {
      continue
    }

    // If targetCategory is specified, only include transactions that don't already have that category
    if (targetCategory !== undefined && candidate.category === targetCategory) {
      continue
    }

    if (isRelatedTransaction(targetTx.description, candidate.description)) {
      seenIds.add(candidate.id)
      results.push(candidate)
    }
  }

  return results
}

interface PluralTemplates {
  singular?: string
  few?: string
  plural?: string
}

const pluralRulesCache = new Map<string, Intl.PluralRules>()
function getPluralRules(locale: string): Intl.PluralRules {
  let pr = pluralRulesCache.get(locale)
  if (!pr) {
    try {
      pr = new Intl.PluralRules(locale)
    } catch {
      pr = new Intl.PluralRules('en')
    }
    pluralRulesCache.set(locale, pr)
  }
  return pr
}

/**
 * Resolves the appropriate plural template string based on count and locale.
 * Uses Intl.PluralRules for accurate CLDR grammatical categories (one, few, many, other)
 * across all languages, with safe fallbacks.
 */
export function resolvePluralTemplate(
  count: number,
  locale: string,
  templates: PluralTemplates,
  defaultEnglish: { singular: string; plural: string },
): string {
  const abs = Math.abs(count)
  let rule: Intl.LDMLPluralRule = 'other'

  try {
    rule = getPluralRules(locale).select(abs)
  } catch {
    rule = abs === 1 ? 'one' : 'other'
  }

  let template: string | undefined

  if (rule === 'one') {
    template = templates.singular || templates.few || templates.plural
  } else if (rule === 'few') {
    template = templates.few || templates.plural || templates.singular
  } else if (abs === 1 && templates.singular) {
    template = templates.singular
  } else {
    template = templates.plural || templates.few || templates.singular
  }

  if (!template) {
    template = abs === 1 ? defaultEnglish.singular : defaultEnglish.plural
  }

  return template.replace('{count}', String(count))
}

/**
 * Formats a localized category count string (e.g. "1 category", "11 categories", "11 категорија").
 * Handles pluralization rules accurately across all supported languages via Intl.PluralRules.
 */
export function formatCategoryCount(
  count: number,
  t?: Partial<TranslationStrings>,
  locale: string = 'en',
): string {
  return resolvePluralTemplate(
    count,
    locale,
    {
      singular: t?.categoryCountSingular,
      few: t?.categoryCountFew,
      plural: t?.categoryCountPlural,
    },
    {
      singular: '{count} category',
      plural: '{count} categories',
    },
  )
}

/**
 * Formats a localized charges count string (e.g. "1 charge", "3 charges", "3 наплате", "3 naplate").
 * Handles pluralization rules accurately across all supported languages via Intl.PluralRules.
 */
export function formatChargesCount(
  count: number,
  t?: Partial<TranslationStrings>,
  locale: string = 'en',
): string {
  return resolvePluralTemplate(
    count,
    locale,
    {
      singular: t?.chargesCountSingular,
      few: t?.chargesCountFew,
      plural: t?.chargesCountPlural || t?.chargesCount,
    },
    {
      singular: '{count} charge',
      plural: '{count} charges',
    },
  )
}

/**
 * Formats a localized popular merchants count string (e.g. "10 popular merchants", "10 popularnih trgovaca").
 * Handles pluralization and grammar rules accurately across all supported languages via Intl.PluralRules.
 */
export function formatPopularMerchantsCount(
  count: number,
  t?: Partial<TranslationStrings>,
  locale: string = 'en',
): string {
  return resolvePluralTemplate(
    count,
    locale,
    {
      singular: t?.popularMerchantsCountSingular,
      few: t?.popularMerchantsCountFew,
      plural: t?.popularMerchantsCountPlural,
    },
    {
      singular: '{count} popular merchant',
      plural: '{count} popular merchants',
    },
  )
}

/**
 * Formats a localized transaction count string (e.g. "1 transaction", "8 transactions", "8 transakcija", "8 transakcji").
 * Handles pluralization rules accurately across all supported languages via Intl.PluralRules.
 */
export function formatTransactionCount(
  count: number,
  t?: Partial<TranslationStrings>,
  locale: string = 'en',
): string {
  return resolvePluralTemplate(
    count,
    locale,
    {
      singular: t?.transactionCountSingular,
      few: t?.transactionCountFew,
      plural: t?.transactionCountPlural,
    },
    {
      singular: '{count} transaction',
      plural: '{count} transactions',
    },
  )
}

/**
 * Formats a category's percentage of total spend.
 * Guarantees that any positive spend is never represented as 0%.
 * - If amount <= 0 or total <= 0: returns "0%"
 * - If percentage is below 0.05%: returns "<0.1%"
 * - If percentage is below 0.95%: returns localized 1-decimal percentage, e.g. "0.6%" or "0,6%"
 * - Otherwise: returns rounded whole percentage, e.g. "49%"
 */
export function formatCategoryPercent(
  amount: number,
  total: number,
  locale: string = 'en',
): string {
  if (amount <= 0 || total <= 0) return '0%'
  const pct = (amount / total) * 100
  if (pct < 0.05) return '<0.1%'
  if (pct < 0.95) {
    const isEuropean = locale === 'de' || locale === 'bs' || locale === 'sr' || locale === 'pl'
    const formatted = pct.toFixed(1)
    return `${isEuropean ? formatted.replace('.', ',') : formatted}%`
  }
  return `${Math.round(pct)}%`
}

/**
 * Evaluates whether monthly category data is extensive enough to occupy
 * a full row on desktop screens rather than sharing half a row.
 * Returns true if:
 * - 6 or more months are present, or
 * - 6 or more distinct categories are present, or
 * - At least 4 months and at least 4 categories (16+ data points), or
 * - Total data matrix points (months * categories) >= 20.
 */
export function hasExtensiveCategoryData(
  data?: Array<Record<string, unknown>> | null,
  categoriesCount?: number,
): boolean {
  if (!data || data.length === 0) return false
  const monthsCount = data.length

  let numCategories = categoriesCount
  if (numCategories === undefined) {
    const catSet = new Set<string>()
    data.forEach((entry) => {
      Object.keys(entry).forEach((k) => {
        if (k !== 'month') {
          catSet.add(k)
        }
      })
    })
    numCategories = catSet.size
  }

  return (
    monthsCount >= 6 ||
    numCategories >= 6 ||
    (monthsCount >= 4 && numCategories >= 4) ||
    monthsCount * numCategories >= 20
  )
}

