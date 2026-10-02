import { categoryI18nKeys } from '../i18n/categories'
import { translations, type TranslationStrings } from '../i18n/translations'
import type { CustomCategory, Transaction } from '../types'
import { categorize } from './categorizer/categorizer'
import { isInformativeTransaction } from './categorizer/description-cleaning'

export * from './categorizer/categorizer'
export * from './categorizer/description-cleaning'

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
 * applying manual overrides, custom keywords, and contextual metadata.
 * Informative transactions with a value of 0 euro are never categorized.
 */
export function getTransactionCategory(
  t: Transaction,
  customKeywords?: Record<string, string[]>,
  manualCategories?: Record<string, string>,
): string | undefined {
  if (isInformativeTransaction(t)) {
    return undefined
  }
  if (manualCategories && manualCategories[t.id]) {
    return manualCategories[t.id]
  }
  if (t.category) {
    return t.category
  }
  return categorize(t.description, {
    customKeywords,
    amount: t.amount,
    type: t.type,
    partner: t.partner,
  })
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
