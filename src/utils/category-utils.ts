import { categoryI18nKeys } from '../i18n/categories'
import { categoryTermsByLocale } from '../i18n/category-terms'
import type { TranslationStrings } from '../i18n/types'
import type { CustomCategory, Transaction } from '../types'
import { categorize } from './categorizer/categorizer'
import {
  extractCleanDescription,
  isInformativeTransaction,
  isPaymentProcessorOnly,
} from './categorizer/description-cleaning'

export * from './categorizer/categorizer'
export * from './categorizer/description-cleaning'

// Build reverse lookup of localized category labels across all languages to canonical keys
const localizedCategoryMap: Record<string, string> = {}
for (const terms of Object.values(categoryTermsByLocale)) {
  const labels: Partial<Record<string, string>> = terms.labels
  for (const [canonicalKey, i18nKey] of Object.entries(categoryI18nKeys)) {
    const label = labels[i18nKey]
    if (typeof label === 'string') {
      const normalized =
        canonicalKey === 'DiningOut'
          ? 'Dining Out'
          : canonicalKey === 'BankFees' || canonicalKey === 'Fees'
            ? 'Bank Fees'
            : canonicalKey
      localizedCategoryMap[label.toLowerCase()] = normalized
    }
  }
}

const canonicalCategoryCache = new Map<string, string>()

/**
 * Resolves any category input (canonical key, localized label, or raw keyword)
 * to its standardized canonical category key ('Salary', 'Rent', 'Groceries', 'Dining Out', etc.).
 */
export function resolveCanonicalCategory(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'Other'
  }
  const trimmed = name.trim()
  if (!trimmed) {
    return 'Other'
  }

  const cached = canonicalCategoryCache.get(trimmed)
  if (cached !== undefined) {
    return cached
  }

  let result = 'Other'
  // 1. Exact match against canonical category keys
  if (categoryI18nKeys[trimmed]) {
    if (trimmed === 'DiningOut') {
      result = 'Dining Out'
    } else if (trimmed === 'BankFees' || trimmed === 'Fees') {
      result = 'Bank Fees'
    } else {
      result = trimmed
    }
  } else {
    // 2. Exact match against localized category labels across all languages
    const lower = trimmed.toLowerCase()
    if (localizedCategoryMap[lower]) {
      result = localizedCategoryMap[lower]
    } else {
      // 3. Multilingual keyword categorization across all locales
      const categorized = categorize(trimmed)
      if (categorized && categorized !== 'Other') {
        result = categorized
      }
    }
  }

  if (canonicalCategoryCache.size < 1000) {
    canonicalCategoryCache.set(trimmed, result)
  }
  return result
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
  if (catKey === 'without-logos') {
    return t.filterWithoutLogosBadge || 'Without logos'
  }

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
    const manualCat = manualCategories[t.id]
    if (
      manualCat === 'Transport' &&
      isPaymentProcessorOnly(extractCleanDescription(t.description))
    ) {
      // Guard against generic payment processors without merchant names having been
      // accidentally lumped into Transport via legacy prefix-matching batch updates
    } else {
      return manualCat
    }
  }
  // User-modified transactions where user explicitly modified fields in import review
  if (t.isModified && t.category) {
    return t.category
  }
  return categorize(t.description, {
    customKeywords,
    amount: t.amount,
    type: t.type,
    partner: t.partner,
  })
}

export * from './loan-propagation'
export * from './plural-utils'


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
  if (amount <= 0 || total <= 0) {
    return '0%'
  }
  const pct = (amount / total) * 100
  if (pct < 0.05) {
    return '<0.1%'
  }
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
  if (!data || data.length === 0) {
    return false
  }
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
