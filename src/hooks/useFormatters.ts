import { useCallback, useMemo } from 'react'

import { translations } from '../i18n/translations'
import { useLanguageStore } from '../store/useLanguageStore'
import {
  formatCategoryCount as formatCategoryCountUtil,
  formatCategoryPercent as formatCategoryPercentUtil,
  formatChargesCount as formatChargesCountUtil,
  formatPopularMerchantsCount as formatPopularMerchantsCountUtil,
  formatTransactionCount as formatTransactionCountUtil,
} from '../utils/category-utils'
import { formatMonthYearLocalized } from '../utils/date-utils'

// Pre-cached Intl formatters to avoid expensive constructor calls (60x faster)
const currencyFormatterCache = new Map<string, Intl.NumberFormat>()
const dateFormatterCache = new Map<string, Intl.DateTimeFormat>()

function getCurrencyFormatter(locale: string, maximumFractionDigits?: number): Intl.NumberFormat {
  const key = `${locale}_${maximumFractionDigits ?? 'default'}`
  let fmt = currencyFormatterCache.get(key)
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits,
    })
    currencyFormatterCache.set(key, fmt)
  }
  return fmt
}

function getDateFormatter(locale: string): Intl.DateTimeFormat {
  let fmt = dateFormatterCache.get(locale)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    dateFormatterCache.set(locale, fmt)
  }
  return fmt
}

export const useFormatters = () => {
  const locale = useLanguageStore((s) => s.locale)
  const storeT = useLanguageStore((s) => s.t)
  const t = translations[locale] || storeT || translations['en']

  // Some browsers (especially Chromium-based ones on Windows) have stripped ICU data
  // for 'bs' and 'sr', causing them to fall back to English (YYYY-MM-DD and -€500.00).
  // We map them to 'de-DE' to ensure consistent European formatting (DD.MM.YYYY and -500,00 €).
  const intlLocale = locale === 'bs' || locale === 'sr' ? 'de-DE' : locale

  const formatCurrency = useCallback(
    (amount: number, maximumFractionDigits?: number) => {
      return getCurrencyFormatter(intlLocale, maximumFractionDigits).format(amount)
    },
    [intlLocale],
  )

  const formatDate = useCallback(
    (dateString: string) => {
      if (!dateString) return ''
      const dateToParse = dateString.includes('T') ? dateString : `${dateString}T00:00:00`
      let d = new Date(dateToParse)
      if (isNaN(d.getTime())) {
        d = new Date(dateString)
      }
      if (isNaN(d.getTime())) {
        return dateString
      }
      return getDateFormatter(intlLocale).format(d)
    },
    [intlLocale],
  )

  const formatMonthYear = useCallback(
    (dateString: string, yearFormat: '2-digit' | 'numeric' = '2-digit') => {
      return formatMonthYearLocalized(dateString, locale, yearFormat)
    },
    [locale],
  )

  const formatSavingsRate = useCallback((rate: number) => {
    if (rate <= -100) {
      return `${(Math.abs(rate) / 100 + 1).toFixed(1)}x`
    }
    return `${rate}%`
  }, [])

  const formatCategoryCount = useCallback(
    (count: number) => {
      return formatCategoryCountUtil(count, t, locale)
    },
    [t, locale],
  )

  const formatChargesCount = useCallback(
    (count: number) => {
      return formatChargesCountUtil(count, t, locale)
    },
    [t, locale],
  )

  const formatPopularMerchantsCount = useCallback(
    (count: number) => {
      return formatPopularMerchantsCountUtil(count, t, locale)
    },
    [t, locale],
  )

  const formatCategoryPercent = useCallback(
    (amount: number, total: number) => {
      return formatCategoryPercentUtil(amount, total, locale)
    },
    [locale],
  )

  const formatTransactionCount = useCallback(
    (count: number) => {
      return formatTransactionCountUtil(count, t, locale)
    },
    [t, locale],
  )

  return useMemo(
    () => ({
      formatCurrency,
      formatDate,
      formatMonthYear,
      formatSavingsRate,
      formatCategoryCount,
      formatCategoryPercent,
      formatChargesCount,
      formatPopularMerchantsCount,
      formatTransactionCount,
      locale,
    }),
    [
      formatCurrency,
      formatDate,
      formatMonthYear,
      formatSavingsRate,
      formatCategoryCount,
      formatCategoryPercent,
      formatChargesCount,
      formatPopularMerchantsCount,
      formatTransactionCount,
      locale,
    ],
  )
}
