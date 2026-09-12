import { describe, expect, it } from 'vitest'

import { localeOrder } from '../i18n/translations'
import {
  formatMonthYearLocalized,
  getLocalizedMonthNames,
  getLocalizedWeekdays,
  MONTH_FALLBACKS,
  WEEKDAY_FALLBACKS,
} from './date-utils'

describe('date-utils', () => {
  describe('getLocalizedMonthNames', () => {
    it('should return short month names for bs', () => {
      const months = getLocalizedMonthNames('bs', 'short')
      expect(months).toHaveLength(12)
      expect(months[0]).toBe('Jan')
      expect(months[4]).toBe('Maj')
      expect(months[7]).toBe('Aug')
    })

    it('should return long month names for sr in cyrillic', () => {
      const months = getLocalizedMonthNames('sr', 'long')
      expect(months).toHaveLength(12)
      expect(months[0]).toBe('Јануар')
      expect(months[2]).toBe('Март')
      expect(months[7]).toBe('Август')
    })

    it('should fall back to Intl.DateTimeFormat for non-fallback locales like en', () => {
      const months = getLocalizedMonthNames('en', 'short')
      expect(months).toHaveLength(12)
      expect(months[0]).toBe('Jan')
      expect(months[4]).toBe('May')
      expect(months[11]).toBe('Dec')
    })
  })

  describe('getLocalizedWeekdays', () => {
    it('should return weekdays for bs', () => {
      const days = getLocalizedWeekdays('bs')
      expect(days).toEqual(['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'])
    })

    it('should return Cyrillic weekdays for sr', () => {
      const days = getLocalizedWeekdays('sr')
      expect(days).toEqual(['Пон', 'Уто', 'Сре', 'Чет', 'Пет', 'Суб', 'Нед'])
    })

    it('should fall back to Intl.DateTimeFormat for non-fallback locales like en', () => {
      const days = getLocalizedWeekdays('en')
      expect(days).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    })
  })

  describe('formatMonthYearLocalized', () => {
    it('should format month and year in 2-digit format for bs', () => {
      expect(formatMonthYearLocalized('2024-05', 'bs', '2-digit')).toBe('Maj 24')
    })

    it('should format month and year in numeric format for sr', () => {
      expect(formatMonthYearLocalized('2024-03', 'sr', 'numeric')).toBe('Мар 2024')
    })

    it('should format month and year using Intl for non-fallback locales like en', () => {
      const formatted = formatMonthYearLocalized('2024-05', 'en', '2-digit')
      expect(formatted).toMatch(/May(.*)24/)
    })
  })

  describe('guardrail: all registered locales in i18n have valid date formatting', () => {
    it.each(localeOrder)(
      'locale "%s" produces complete and non-numeric month and weekday names',
      (locale) => {
        const shortMonths = getLocalizedMonthNames(locale, 'short')
        expect(shortMonths).toHaveLength(12)
        shortMonths.forEach((month) => {
          expect(month).toBeTruthy()
          // Ensure browser did not fall back to numeric values like "01", "02" due to missing ICU data
          expect(month).not.toMatch(/^\d+$/)
        })

        const longMonths = getLocalizedMonthNames(locale, 'long')
        expect(longMonths).toHaveLength(12)
        longMonths.forEach((month) => {
          expect(month).toBeTruthy()
          expect(month).not.toMatch(/^\d+$/)
        })

        const weekdays = getLocalizedWeekdays(locale)
        expect(weekdays).toHaveLength(7)
        weekdays.forEach((day) => {
          expect(day).toBeTruthy()
        })

        const formatted2Digit = formatMonthYearLocalized('2024-05', locale, '2-digit')
        expect(formatted2Digit).toBeTruthy()
        expect(formatted2Digit).not.toContain('NaN')

        const formattedNumeric = formatMonthYearLocalized('2024-05', locale, 'numeric')
        expect(formattedNumeric).toBeTruthy()
        expect(formattedNumeric).not.toContain('NaN')
      },
    )
  })

  describe('extensibility for new languages', () => {
    it('automatically uses new languages added to MONTH_FALLBACKS and WEEKDAY_FALLBACKS', () => {
      // Simulate registering a new custom language 'test-lang'
      const customMonthFallbacks = MONTH_FALLBACKS as Record<string, unknown>
      const customWeekdayFallbacks = WEEKDAY_FALLBACKS as Record<string, unknown>

      customMonthFallbacks['test-lang'] = {
        short: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
        long: [
          'Month1',
          'Month2',
          'Month3',
          'Month4',
          'Month5',
          'Month6',
          'Month7',
          'Month8',
          'Month9',
          'Month10',
          'Month11',
          'Month12',
        ],
      }
      customWeekdayFallbacks['test-lang'] = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']

      try {
        expect(getLocalizedMonthNames('test-lang', 'short')[0]).toBe('M1')
        expect(getLocalizedMonthNames('test-lang', 'long')[0]).toBe('Month1')
        expect(getLocalizedWeekdays('test-lang')).toEqual([
          'D1',
          'D2',
          'D3',
          'D4',
          'D5',
          'D6',
          'D7',
        ])
        expect(formatMonthYearLocalized('2024-07', 'test-lang', '2-digit')).toBe('M7 24')
        expect(formatMonthYearLocalized('2024-07', 'test-lang', 'numeric')).toBe('M7 2024')
      } finally {
        delete customMonthFallbacks['test-lang']
        delete customWeekdayFallbacks['test-lang']
      }
    })
  })
})
