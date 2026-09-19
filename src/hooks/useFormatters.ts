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

export const useFormatters = () => {
  const locale = useLanguageStore((s) => s.locale)
  const storeT = useLanguageStore((s) => s.t)
  const t = translations[locale] || storeT || translations['en']

  // Some browsers (especially Chromium-based ones on Windows) have stripped ICU data
  // for 'bs' and 'sr', causing them to fall back to English (YYYY-MM-DD and -€500.00).
  // We map them to 'de-DE' to ensure consistent European formatting (DD.MM.YYYY and -500,00 €).
  const intlLocale = locale === 'bs' || locale === 'sr' ? 'de-DE' : locale

  const formatCurrency = (amount: number, maximumFractionDigits?: number) => {
    return amount.toLocaleString(intlLocale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits,
    })
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const dateToParse = dateString.includes('T') ? dateString : `${dateString}T00:00:00`
    let d = new Date(dateToParse)
    if (isNaN(d.getTime())) {
      d = new Date(dateString)
    }
    if (isNaN(d.getTime())) {
      return dateString
    }
    return d.toLocaleDateString(intlLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatMonthYear = (dateString: string, yearFormat: '2-digit' | 'numeric' = '2-digit') => {
    return formatMonthYearLocalized(dateString, locale, yearFormat)
  }

  const formatSavingsRate = (rate: number) => {
    if (rate <= -100) {
      return `${(Math.abs(rate) / 100 + 1).toFixed(1)}x`
    }
    return `${rate}%`
  }

  const formatCategoryCount = (count: number) => {
    return formatCategoryCountUtil(count, t, locale)
  }

  const formatChargesCount = (count: number) => {
    return formatChargesCountUtil(count, t, locale)
  }

  const formatPopularMerchantsCount = (count: number) => {
    return formatPopularMerchantsCountUtil(count, t, locale)
  }

  const formatCategoryPercent = (amount: number, total: number) => {
    return formatCategoryPercentUtil(amount, total, locale)
  }

  const formatTransactionCount = (count: number) => {
    return formatTransactionCountUtil(count, t, locale)
  }

  return {
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
  }
}
