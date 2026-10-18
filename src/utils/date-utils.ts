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

const monthNamesCache = new Map<string, string[]>()
const weekdaysCache = new Map<string, string[]>()

export const getLocalizedMonthNames = (locale: string, format: MonthFormat = 'short'): string[] => {
  const fallback = MONTH_FALLBACKS[locale as Locale]
  if (fallback) {
    return fallback[format]
  }

  const cacheKey = `${locale}_${format}`
  const cached = monthNamesCache.get(cacheKey)
  if (cached) return cached

  const names = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2023, i, 1)
    const name = new Intl.DateTimeFormat(locale, { month: format }).format(d)
    return name.charAt(0).toUpperCase() + name.slice(1)
  })
  monthNamesCache.set(cacheKey, names)
  return names
}

export const getLocalizedWeekdays = (locale: string): string[] => {
  const fallback = WEEKDAY_FALLBACKS[locale as Locale]
  if (fallback) {
    return fallback
  }

  const cached = weekdaysCache.get(locale)
  if (cached) return cached

  const days = Array.from({ length: 7 }, (_, i) => {
    // January 2, 2023 was a Monday
    const d = new Date(2023, 0, 2 + i)
    const name = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d)
    return name.charAt(0).toUpperCase() + name.slice(1)
  })
  weekdaysCache.set(locale, days)
  return days
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
  if (!dateString) return ''
  const validYearFormat = yearFormat === 'numeric' ? 'numeric' : '2-digit'
  const cacheKey = `${dateString}_${locale}_${validYearFormat}`
  const cached = monthYearCache.get(cacheKey)
  if (cached !== undefined) return cached

  if (!/^\d{4}-\d{2}/.test(dateString)) {
    monthYearCache.set(cacheKey, dateString)
    return dateString
  }

  let result = ''
  const parts = dateString.split('-')
  const yearNum = parts[0]
  const monthIndex = parseInt(parts[1], 10) - 1

  if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
    if (locale in MONTH_FALLBACKS) {
      const months = getLocalizedMonthNames(locale, 'short')
      const yearStr = validYearFormat === '2-digit' ? yearNum.slice(-2) : yearNum
      result = `${months[monthIndex]} ${yearStr}`
    }
  }

  if (!result) {
    const intlLocale = locale in MONTH_FALLBACKS ? 'de-DE' : locale
    result = getMonthYearDtf(intlLocale, validYearFormat).format(
      new Date(`${yearNum}-${parts[1]}-01T00:00:00`),
    )
  }

  monthYearCache.set(cacheKey, result)
  return result
}

/**
 * Generates an array of contiguous 'YYYY-MM' strings between startMonth and endMonth inclusive.
 * e.g. generateMonthRange('2025-10', '2026-02') -> ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02']
 */
export function generateMonthRange(startMonth: string, endMonth: string): string[] {
  if (!startMonth || !endMonth) return []
  if (startMonth > endMonth) return [startMonth]

  const [startYear, startM] = startMonth.split('-').map(Number)
  const [endYear, endM] = endMonth.split('-').map(Number)

  if (isNaN(startYear) || isNaN(startM) || isNaN(endYear) || isNaN(endM)) {
    return [startMonth]
  }

  const months: string[] = []
  let y = startYear
  let m = startM

  while (y < endYear || (y === endYear && m <= endM)) {
    months.push(`${y}-${String(m).padStart(2, '0')}`)
    m++
    if (m > 12) {
      m = 1
      y++
    }
  }
  return months
}
