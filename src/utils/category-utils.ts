import { categoryI18nKeys } from '../i18n/categories'
import { type CategoryKeywords, translations, type TranslationStrings } from '../i18n/translations'

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

/**
 * Infers a category from a transaction description using keyword matching.
 * Returns one of the standardized category keys (e.g. 'Salary', 'Groceries').
 */
export function categorize(desc: string): string {
  if (!desc || typeof desc !== 'string') return 'Other'
  const d = desc.toLowerCase()

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
      if (cat === 'DiningOut') return 'Dining Out'
      return cat
    }
  }

  return 'Other'
}

/**
 * Returns a localized display label for a transaction category key.
 * Falls back to the raw key if no translation is found.
 */
export function getCategoryLabel(catKey: string, t: TranslationStrings): string {
  const i18nKey = categoryI18nKeys[catKey]
  if (i18nKey && t[i18nKey]) {
    return t[i18nKey] as string
  }
  return catKey
}
