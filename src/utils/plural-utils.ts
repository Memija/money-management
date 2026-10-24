import type { TranslationStrings } from '../i18n/types'

export interface PluralTemplates {
  singular?: string
  few?: string
  plural?: string
}

const pluralRulesCache = new Map<string, Intl.PluralRules>()
export function getPluralRules(locale: string): Intl.PluralRules {
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
