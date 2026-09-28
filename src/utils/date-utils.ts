/**
 * Utility functions for consistent date and month localization,
 * particularly handling 'bs' and 'sr' locales where browsers often
 * lack complete ICU data or fall back to incorrect abbreviations.
 */

import type { Locale } from '../i18n/types'

export type MonthFormat = 'short' | 'long'

export interface MonthFallback {
  short: string[]
  long: string[]
}

export const MONTH_FALLBACKS: Partial<Record<Locale, MonthFallback>> = {
  bs: {
    short: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
    long: [
      'Januar',
      'Februar',
      'Mart',
      'April',
      'Maj',
      'Juni',
      'Juli',
      'August',
      'Septembar',
      'Oktobar',
      'Novembar',
      'Decembar',
    ],
  },
  sr: {
    short: ['Јан', 'Феб', 'Мар', 'Апр', 'Мај', 'Јун', 'Јул', 'Авг', 'Сеп', 'Окт', 'Нов', 'Дец'],
    long: [
      'Јануар',
      'Фебруар',
      'Март',
      'Април',
      'Мај',
      'Јун',
      'Јул',
      'Август',
      'Септембар',
      'Октобар',
      'Новембар',
      'Децембар',
    ],
  },
}

export const WEEKDAY_FALLBACKS: Partial<Record<Locale, string[]>> = {
  bs: ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'],
  sr: ['Пон', 'Уто', 'Сре', 'Чет', 'Пет', 'Суб', 'Нед'],
}

export const getLocalizedMonthNames = (locale: string, format: MonthFormat = 'short'): string[] => {
  const fallback = MONTH_FALLBACKS[locale as Locale]
  if (fallback) {
    return fallback[format]
  }

  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2023, i, 1)
    const name = new Intl.DateTimeFormat(locale, { month: format }).format(d)
    return name.charAt(0).toUpperCase() + name.slice(1)
  })
}

export const getLocalizedWeekdays = (locale: string): string[] => {
  const fallback = WEEKDAY_FALLBACKS[locale as Locale]
  if (fallback) {
    return fallback
  }

  return Array.from({ length: 7 }, (_, i) => {
    // January 2, 2023 was a Monday
    const d = new Date(2023, 0, 2 + i)
    const name = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d)
    return name.charAt(0).toUpperCase() + name.slice(1)
  })
}

const monthYearCache = new Map<string, string>()
const monthYearDtfCache = new Map<string, Intl.DateTimeFormat>()

function getMonthYearDtf(locale: string, yearFormat: '2-digit' | 'numeric'): Intl.DateTimeFormat {
  const key = `${locale}_${yearFormat}`
  let dtf = monthYearDtfCache.get(key)
  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locale, {
      month: 'short',
      year: yearFormat,
    })
    monthYearDtfCache.set(key, dtf)
  }
  return dtf
}

/**
 * Formats a date string (e.g., '2024-05' or '2024-05-15') to a localized month and year.
 * Dynamically uses MONTH_FALLBACKS for locales that require custom abbreviations,
 * falling back to Intl.DateTimeFormat for other locales.
 */
export const formatMonthYearLocalized = (
  dateString: string,
  locale: string,
  yearFormat: '2-digit' | 'numeric' = '2-digit',
): string => {
  const cacheKey = `${dateString}_${locale}_${yearFormat}`
  const cached = monthYearCache.get(cacheKey)
  if (cached !== undefined) return cached

  let result = ''
  const parts = dateString.split('-')
  if (parts.length >= 2) {
    const yearNum = parts[0]
    const monthIndex = parseInt(parts[1], 10) - 1

    if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
      if (locale in MONTH_FALLBACKS) {
        const months = getLocalizedMonthNames(locale, 'short')
        const yearStr = yearFormat === '2-digit' ? yearNum.slice(-2) : yearNum
        result = `${months[monthIndex]} ${yearStr}`
      }
    }
  }

  if (!result) {
    const intlLocale = locale in MONTH_FALLBACKS ? 'de-DE' : locale
    result = getMonthYearDtf(intlLocale, yearFormat).format(new Date(dateString + '-01'))
  }

  monthYearCache.set(cacheKey, result)
  return result
}
