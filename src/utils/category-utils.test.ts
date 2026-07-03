import { describe, expect, it } from 'vitest'

import { type TranslationStrings } from '../i18n/translations'
import { categorize, getCategoryLabel } from './category-utils'

describe('category-utils', () => {
  describe('categorize', () => {
    it('categorizes salary-related descriptions correctly', () => {
      expect(categorize('Monthly salary payment')).toBe('Salary')
      expect(categorize('Lohn')).toBe('Salary') // German
    })

    it('categorizes dining out descriptions correctly', () => {
      expect(categorize('McDonalds')).toBe('Dining Out')
      expect(categorize('Starbucks')).toBe('Dining Out')
    })

    it('categorizes transport descriptions correctly', () => {
      expect(categorize('Uber trip')).toBe('Transport')
      expect(categorize('bolt receipt')).toBe('Transport')
    })

    it('falls back to "Other" for unknown descriptions', () => {
      expect(categorize('Random unknown transaction 12345')).toBe('Other')
    })

    it('handles case insensitivity', () => {
      expect(categorize('UBER')).toBe('Transport')
      expect(categorize('mcdonalds')).toBe('Dining Out')
    })

    it('handles empty or invalid descriptions', () => {
      expect(categorize('')).toBe('Other')
      expect(categorize('   ')).toBe('Other')
      // @ts-expect-error Testing runtime invalid input
      expect(categorize(null)).toBe('Other')
      // @ts-expect-error Testing runtime invalid input
      expect(categorize(undefined)).toBe('Other')
    })

    it('respects category priority order', () => {
      // 'Salary' is higher priority than 'Dining Out' (e.g., 'McDonalds')
      expect(categorize('Salary spent at McDonalds')).toBe('Salary')
    })
  })

  describe('getCategoryLabel', () => {
    const mockT = {
      catSalary: 'Gehalt', // e.g. German
      catOther: 'Sonstiges',
      catTransport: 'Verkehr',
    } as unknown as TranslationStrings

    it('returns translated label if key and translation exist', () => {
      expect(getCategoryLabel('Salary', mockT)).toBe('Gehalt')
      expect(getCategoryLabel('Other', mockT)).toBe('Sonstiges')
    })

    it('returns raw key if translation does not exist', () => {
      // 'Dining Out' doesn't have a translation in mockT
      expect(getCategoryLabel('Dining Out', mockT)).toBe('Dining Out')
    })

    it('handles unrecognized category keys gracefully', () => {
      expect(getCategoryLabel('UnknownCategory', mockT)).toBe('UnknownCategory')
      expect(getCategoryLabel('', mockT)).toBe('')
    })
  })
})
