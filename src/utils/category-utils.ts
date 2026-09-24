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
    'Entertainment',
    'Insurance',
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

interface PluralTemplates {
  singular?: string
  few?: string
  plural?: string
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
    rule = new Intl.PluralRules(locale).select(abs)
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
