import { describe, expect, it } from 'vitest'

import { localeOrder, translations, type TranslationStrings } from '../i18n/translations'
import {
  categorize,
  formatCategoryCount,
  formatCategoryPercent,
  formatChargesCount,
  formatPopularMerchantsCount,
  formatTransactionCount,
  getCategoryLabel,
  resolveCanonicalCategory,
  resolvePluralTemplate,
} from './category-utils'

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

  describe('resolveCanonicalCategory', () => {
    it('resolves exact canonical category keys', () => {
      expect(resolveCanonicalCategory('Salary')).toBe('Salary')
      expect(resolveCanonicalCategory('Rent')).toBe('Rent')
      expect(resolveCanonicalCategory('Groceries')).toBe('Groceries')
      expect(resolveCanonicalCategory('Dining Out')).toBe('Dining Out')
      expect(resolveCanonicalCategory('DiningOut')).toBe('Dining Out')
      expect(resolveCanonicalCategory('Shopping')).toBe('Shopping')
      expect(resolveCanonicalCategory('Transport')).toBe('Transport')
      expect(resolveCanonicalCategory('Entertainment')).toBe('Entertainment')
      expect(resolveCanonicalCategory('Insurance')).toBe('Insurance')
      expect(resolveCanonicalCategory('Utilities')).toBe('Utilities')
      expect(resolveCanonicalCategory('Healthcare')).toBe('Healthcare')
      expect(resolveCanonicalCategory('Savings')).toBe('Savings')
      expect(resolveCanonicalCategory('Transfers')).toBe('Transfers')
      expect(resolveCanonicalCategory('Other')).toBe('Other')
    })

    it('resolves localized category labels across all supported languages', () => {
      // Polish
      expect(resolveCanonicalCategory('Wynagrodzenie')).toBe('Salary')
      expect(resolveCanonicalCategory('Czynsz')).toBe('Rent')
      expect(resolveCanonicalCategory('Spożywcze')).toBe('Groceries')
      // Indonesian
      expect(resolveCanonicalCategory('Gaji')).toBe('Salary')
      expect(resolveCanonicalCategory('Sewa')).toBe('Rent')
      // German
      expect(resolveCanonicalCategory('Gehalt')).toBe('Salary')
      expect(resolveCanonicalCategory('Miete')).toBe('Rent')
      expect(resolveCanonicalCategory('Lebensmittel')).toBe('Groceries')
      // Bosnian / Croatian / Serbian
      expect(resolveCanonicalCategory('Plata')).toBe('Salary')
      expect(resolveCanonicalCategory('Stanarina')).toBe('Rent')
      expect(resolveCanonicalCategory('Namirnice')).toBe('Groceries')
      // Serbian Cyrillic
      expect(resolveCanonicalCategory('Плата')).toBe('Salary')
      expect(resolveCanonicalCategory('Станарина')).toBe('Rent')
      expect(resolveCanonicalCategory('Намирнице')).toBe('Groceries')
    })

    it('resolves categories from transaction keywords and descriptions', () => {
      expect(resolveCanonicalCategory('Biedronka zakupy')).toBe('Groceries')
      expect(resolveCanonicalCategory('Rewe Supermarkt')).toBe('Groceries')
      expect(resolveCanonicalCategory('Monthly salary payroll')).toBe('Salary')
      expect(resolveCanonicalCategory('Uber ride to airport')).toBe('Transport')
    })

    it('falls back to "Other" for unknown, whitespace, or falsy inputs', () => {
      expect(resolveCanonicalCategory('')).toBe('Other')
      expect(resolveCanonicalCategory('   ')).toBe('Other')
      expect(resolveCanonicalCategory('RandomUnknownCategoryXYZ')).toBe('Other')
      // @ts-expect-error testing invalid runtime input
      expect(resolveCanonicalCategory(null)).toBe('Other')
      // @ts-expect-error testing invalid runtime input
      expect(resolveCanonicalCategory(undefined)).toBe('Other')
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

  describe('formatCategoryCount', () => {
    it('correctly formats English counts (singular & plural)', () => {
      const t = {
        categoryCountSingular: '{count} category',
        categoryCountFew: '{count} categories',
        categoryCountPlural: '{count} categories',
      } as unknown as TranslationStrings

      expect(formatCategoryCount(1, t, 'en')).toBe('1 category')
      expect(formatCategoryCount(2, t, 'en')).toBe('2 categories')
      expect(formatCategoryCount(11, t, 'en')).toBe('11 categories')
    })

    it('correctly formats German counts (singular & plural)', () => {
      const t = {
        categoryCountSingular: '{count} Kategorie',
        categoryCountFew: '{count} Kategorien',
        categoryCountPlural: '{count} Kategorien',
      } as unknown as TranslationStrings

      expect(formatCategoryCount(1, t, 'de')).toBe('1 Kategorie')
      expect(formatCategoryCount(11, t, 'de')).toBe('11 Kategorien')
    })

    it('correctly formats Serbian Cyrillic counts (including 11 категорија)', () => {
      const t = {
        categoryCountSingular: '{count} категорија',
        categoryCountFew: '{count} категорије',
        categoryCountPlural: '{count} категорија',
      } as unknown as TranslationStrings

      expect(formatCategoryCount(1, t, 'sr')).toBe('1 категорија')
      expect(formatCategoryCount(2, t, 'sr')).toBe('2 категорије')
      expect(formatCategoryCount(4, t, 'sr')).toBe('4 категорије')
      expect(formatCategoryCount(5, t, 'sr')).toBe('5 категорија')
      expect(formatCategoryCount(11, t, 'sr')).toBe('11 категорија')
      expect(formatCategoryCount(21, t, 'sr')).toBe('21 категорија')
      expect(formatCategoryCount(22, t, 'sr')).toBe('22 категорије')
      expect(formatCategoryCount(25, t, 'sr')).toBe('25 категорија')
    })

    it('correctly formats Bosnian counts (including 11 kategorija)', () => {
      const t = {
        categoryCountSingular: '{count} kategorija',
        categoryCountFew: '{count} kategorije',
        categoryCountPlural: '{count} kategorija',
      } as unknown as TranslationStrings

      expect(formatCategoryCount(1, t, 'bs')).toBe('1 kategorija')
      expect(formatCategoryCount(2, t, 'bs')).toBe('2 kategorije')
      expect(formatCategoryCount(11, t, 'bs')).toBe('11 kategorija')
    })

    it('correctly formats Polish counts (including 11 kategorii)', () => {
      const t = {
        categoryCountSingular: '{count} kategoria',
        categoryCountFew: '{count} kategorie',
        categoryCountPlural: '{count} kategorii',
      } as unknown as TranslationStrings

      expect(formatCategoryCount(1, t, 'pl')).toBe('1 kategoria')
      expect(formatCategoryCount(2, t, 'pl')).toBe('2 kategorie')
      expect(formatCategoryCount(5, t, 'pl')).toBe('5 kategorii')
      expect(formatCategoryCount(11, t, 'pl')).toBe('11 kategorii')
      expect(formatCategoryCount(22, t, 'pl')).toBe('22 kategorie')
    })

    it('falls back gracefully when translation strings are missing', () => {
      expect(formatCategoryCount(1, undefined, 'en')).toBe('1 category')
      expect(formatCategoryCount(11, undefined, 'en')).toBe('11 categories')
    })
  })

  describe('formatChargesCount', () => {
    it('correctly formats English counts (singular and plural)', () => {
      const t = {
        chargesCountSingular: '{count} charge',
        chargesCountPlural: '{count} charges',
      } as unknown as TranslationStrings

      expect(formatChargesCount(1, t, 'en')).toBe('1 charge')
      expect(formatChargesCount(2, t, 'en')).toBe('2 charges')
      expect(formatChargesCount(3, t, 'en')).toBe('3 charges')
      expect(formatChargesCount(11, t, 'en')).toBe('11 charges')
    })

    it('correctly formats Serbian Cyrillic counts (e.g. 3 наплате instead of 3 наплата)', () => {
      const t = {
        chargesCountSingular: '{count} наплата',
        chargesCountFew: '{count} наплате',
        chargesCountPlural: '{count} наплата',
      } as unknown as TranslationStrings

      expect(formatChargesCount(1, t, 'sr')).toBe('1 наплата')
      expect(formatChargesCount(2, t, 'sr')).toBe('2 наплате')
      expect(formatChargesCount(3, t, 'sr')).toBe('3 наплате')
      expect(formatChargesCount(4, t, 'sr')).toBe('4 наплате')
      expect(formatChargesCount(5, t, 'sr')).toBe('5 наплата')
      expect(formatChargesCount(11, t, 'sr')).toBe('11 наплата')
      expect(formatChargesCount(21, t, 'sr')).toBe('21 наплата')
      expect(formatChargesCount(23, t, 'sr')).toBe('23 наплате')
    })

    it('correctly formats Bosnian counts (e.g. 3 naplate instead of 3 naplata)', () => {
      const t = {
        chargesCountSingular: '{count} naplata',
        chargesCountFew: '{count} naplate',
        chargesCountPlural: '{count} naplata',
      } as unknown as TranslationStrings

      expect(formatChargesCount(1, t, 'bs')).toBe('1 naplata')
      expect(formatChargesCount(2, t, 'bs')).toBe('2 naplate')
      expect(formatChargesCount(3, t, 'bs')).toBe('3 naplate')
      expect(formatChargesCount(4, t, 'bs')).toBe('4 naplate')
      expect(formatChargesCount(5, t, 'bs')).toBe('5 naplata')
      expect(formatChargesCount(11, t, 'bs')).toBe('11 naplata')
      expect(formatChargesCount(23, t, 'bs')).toBe('23 naplate')
    })

    it('correctly formats Polish counts', () => {
      const t = {
        chargesCountSingular: '{count} płatność',
        chargesCountFew: '{count} płatności',
        chargesCountPlural: '{count} płatności',
      } as unknown as TranslationStrings

      expect(formatChargesCount(1, t, 'pl')).toBe('1 płatność')
      expect(formatChargesCount(2, t, 'pl')).toBe('2 płatności')
      expect(formatChargesCount(3, t, 'pl')).toBe('3 płatności')
      expect(formatChargesCount(5, t, 'pl')).toBe('5 płatności')
      expect(formatChargesCount(11, t, 'pl')).toBe('11 płatności')
    })

    it('falls back gracefully when translation strings are missing', () => {
      expect(formatChargesCount(1, undefined, 'en')).toBe('1 charge')
      expect(formatChargesCount(3, undefined, 'en')).toBe('3 charges')
    })
  })

  describe('formatPopularMerchantsCount', () => {
    it('correctly formats English counts (singular and plural)', () => {
      const t = {
        popularMerchantsCountSingular: '{count} popular merchant',
        popularMerchantsCountFew: '{count} popular merchants',
        popularMerchantsCountPlural: '{count} popular merchants',
      } as unknown as TranslationStrings

      expect(formatPopularMerchantsCount(1, t, 'en')).toBe('1 popular merchant')
      expect(formatPopularMerchantsCount(2, t, 'en')).toBe('2 popular merchants')
      expect(formatPopularMerchantsCount(10, t, 'en')).toBe('10 popular merchants')
    })

    it('correctly formats Bosnian counts (fixes 10 popularni trgovci -> 10 popularnih trgovaca)', () => {
      const t = {
        popularMerchantsCountSingular: '{count} popularan trgovac',
        popularMerchantsCountFew: '{count} popularna trgovca',
        popularMerchantsCountPlural: '{count} popularnih trgovaca',
      } as unknown as TranslationStrings

      expect(formatPopularMerchantsCount(1, t, 'bs')).toBe('1 popularan trgovac')
      expect(formatPopularMerchantsCount(2, t, 'bs')).toBe('2 popularna trgovca')
      expect(formatPopularMerchantsCount(3, t, 'bs')).toBe('3 popularna trgovca')
      expect(formatPopularMerchantsCount(4, t, 'bs')).toBe('4 popularna trgovca')
      expect(formatPopularMerchantsCount(5, t, 'bs')).toBe('5 popularnih trgovaca')
      expect(formatPopularMerchantsCount(10, t, 'bs')).toBe('10 popularnih trgovaca')
      expect(formatPopularMerchantsCount(21, t, 'bs')).toBe('21 popularan trgovac')
      expect(formatPopularMerchantsCount(23, t, 'bs')).toBe('23 popularna trgovca')
    })

    it('correctly formats Serbian counts', () => {
      const t = {
        popularMerchantsCountSingular: '{count} популаран трговац',
        popularMerchantsCountFew: '{count} популарна трговца',
        popularMerchantsCountPlural: '{count} популарних трговаца',
      } as unknown as TranslationStrings

      expect(formatPopularMerchantsCount(1, t, 'sr')).toBe('1 популаран трговац')
      expect(formatPopularMerchantsCount(2, t, 'sr')).toBe('2 популарна трговца')
      expect(formatPopularMerchantsCount(10, t, 'sr')).toBe('10 популарних трговаца')
    })

    it('correctly formats German counts with capitalized noun', () => {
      const t = {
        popularMerchantsCountSingular: '{count} beliebter Händler',
        popularMerchantsCountFew: '{count} beliebte Händler',
        popularMerchantsCountPlural: '{count} beliebte Händler',
      } as unknown as TranslationStrings

      expect(formatPopularMerchantsCount(1, t, 'de')).toBe('1 beliebter Händler')
      expect(formatPopularMerchantsCount(10, t, 'de')).toBe('10 beliebte Händler')
    })

    it('correctly formats Polish counts (e.g. 10 popularnych sprzedawców)', () => {
      const t = {
        popularMerchantsCountSingular: '{count} popularny sprzedawca',
        popularMerchantsCountFew: '{count} popularni sprzedawcy',
        popularMerchantsCountPlural: '{count} popularnych sprzedawców',
      } as unknown as TranslationStrings

      expect(formatPopularMerchantsCount(1, t, 'pl')).toBe('1 popularny sprzedawca')
      expect(formatPopularMerchantsCount(2, t, 'pl')).toBe('2 popularni sprzedawcy')
      expect(formatPopularMerchantsCount(10, t, 'pl')).toBe('10 popularnych sprzedawców')
    })

    it('falls back gracefully when translation strings are missing', () => {
      expect(formatPopularMerchantsCount(1, undefined, 'en')).toBe('1 popular merchant')
      expect(formatPopularMerchantsCount(10, undefined, 'en')).toBe('10 popular merchants')
    })
  })

  describe('formatTransactionCount', () => {
    it('correctly formats English counts', () => {
      const t = {
        transactionCountSingular: '{count} transaction',
        transactionCountFew: '{count} transactions',
        transactionCountPlural: '{count} transactions',
      } as unknown as TranslationStrings

      expect(formatTransactionCount(1, t, 'en')).toBe('1 transaction')
      expect(formatTransactionCount(2, t, 'en')).toBe('2 transactions')
      expect(formatTransactionCount(8, t, 'en')).toBe('8 transactions')
    })

    it('correctly formats German counts with capitalized noun', () => {
      const t = {
        transactionCountSingular: '{count} Transaktion',
        transactionCountFew: '{count} Transaktionen',
        transactionCountPlural: '{count} Transaktionen',
      } as unknown as TranslationStrings

      expect(formatTransactionCount(1, t, 'de')).toBe('1 Transaktion')
      expect(formatTransactionCount(2, t, 'de')).toBe('2 Transaktionen')
      expect(formatTransactionCount(8, t, 'de')).toBe('8 Transaktionen')
    })

    it('correctly formats Bosnian counts (e.g. 1 transakcija, 2 transakcije, 8 transakcija)', () => {
      const t = {
        transactionCountSingular: '{count} transakcija',
        transactionCountFew: '{count} transakcije',
        transactionCountPlural: '{count} transakcija',
      } as unknown as TranslationStrings

      expect(formatTransactionCount(1, t, 'bs')).toBe('1 transakcija')
      expect(formatTransactionCount(2, t, 'bs')).toBe('2 transakcije')
      expect(formatTransactionCount(3, t, 'bs')).toBe('3 transakcije')
      expect(formatTransactionCount(4, t, 'bs')).toBe('4 transakcije')
      expect(formatTransactionCount(5, t, 'bs')).toBe('5 transakcija')
      expect(formatTransactionCount(8, t, 'bs')).toBe('8 transakcija')
      expect(formatTransactionCount(11, t, 'bs')).toBe('11 transakcija')
      expect(formatTransactionCount(21, t, 'bs')).toBe('21 transakcija')
      expect(formatTransactionCount(22, t, 'bs')).toBe('22 transakcije')
      expect(formatTransactionCount(140, t, 'bs')).toBe('140 transakcija')
    })

    it('correctly formats Serbian Cyrillic counts (e.g. 1 трансакција, 2 трансакције, 8 трансакција)', () => {
      const t = {
        transactionCountSingular: '{count} трансакција',
        transactionCountFew: '{count} трансакције',
        transactionCountPlural: '{count} трансакција',
      } as unknown as TranslationStrings

      expect(formatTransactionCount(1, t, 'sr')).toBe('1 трансакција')
      expect(formatTransactionCount(2, t, 'sr')).toBe('2 трансакције')
      expect(formatTransactionCount(8, t, 'sr')).toBe('8 трансакција')
      expect(formatTransactionCount(11, t, 'sr')).toBe('11 трансакција')
      expect(formatTransactionCount(21, t, 'sr')).toBe('21 трансакција')
      expect(formatTransactionCount(22, t, 'sr')).toBe('22 трансакције')
      expect(formatTransactionCount(140, t, 'sr')).toBe('140 трансакција')
    })

    it('correctly formats Polish counts (e.g. 1 transakcja, 2 transakcje, 8 transakcji)', () => {
      const t = {
        transactionCountSingular: '{count} transakcja',
        transactionCountFew: '{count} transakcje',
        transactionCountPlural: '{count} transakcji',
      } as unknown as TranslationStrings

      expect(formatTransactionCount(1, t, 'pl')).toBe('1 transakcja')
      expect(formatTransactionCount(2, t, 'pl')).toBe('2 transakcje')
      expect(formatTransactionCount(4, t, 'pl')).toBe('4 transakcje')
      expect(formatTransactionCount(5, t, 'pl')).toBe('5 transakcji')
      expect(formatTransactionCount(8, t, 'pl')).toBe('8 transakcji')
      expect(formatTransactionCount(11, t, 'pl')).toBe('11 transakcji')
      expect(formatTransactionCount(22, t, 'pl')).toBe('22 transakcje')
      expect(formatTransactionCount(140, t, 'pl')).toBe('140 transakcji')
    })

    it('falls back gracefully when translation strings are missing', () => {
      expect(formatTransactionCount(1, undefined, 'en')).toBe('1 transaction')
      expect(formatTransactionCount(8, undefined, 'en')).toBe('8 transactions')
    })
  })

  describe('formatCategoryPercent', () => {
    it('returns 0% when amount is 0 or negative', () => {
      expect(formatCategoryPercent(0, 1000)).toBe('0%')
      expect(formatCategoryPercent(-10, 1000)).toBe('0%')
    })

    it('returns 0% when total is 0 or negative', () => {
      expect(formatCategoryPercent(100, 0)).toBe('0%')
      expect(formatCategoryPercent(100, -500)).toBe('0%')
    })

    it('returns <0.1% when spend is positive but less than 0.05%', () => {
      expect(formatCategoryPercent(0.1, 1000)).toBe('<0.1%') // 0.01%
      expect(formatCategoryPercent(0.01, 100)).toBe('<0.1%') // 0.01%
    })

    it('returns 0.n% or 0,n% when spend is between 0.05% and 0.95%', () => {
      expect(formatCategoryPercent(5, 1000)).toBe('0.5%') // 0.5% in en
      expect(formatCategoryPercent(5, 1000, 'de')).toBe('0,5%') // 0,5% in de
      expect(formatCategoryPercent(5, 1000, 'bs')).toBe('0,5%') // 0,5% in bs
      expect(formatCategoryPercent(6.4, 1000)).toBe('0.6%') // 0.6%
      expect(formatCategoryPercent(6.4, 1000, 'sr')).toBe('0,6%') // 0,6%
    })

    it('never represents positive spend as 0%', () => {
      // Very small values like €0.10 out of €2,300
      expect(formatCategoryPercent(0.1, 2300)).not.toBe('0%')
      expect(formatCategoryPercent(0.1, 2300)).toBe('<0.1%')
      // €10 out of €2,300 (~0.43%)
      expect(formatCategoryPercent(10, 2300)).not.toBe('0%')
      expect(formatCategoryPercent(10, 2300)).toBe('0.4%')
    })

    it('returns rounded percentage for values >= 1%', () => {
      expect(formatCategoryPercent(10, 1000)).toBe('1%') // 1.0%
      expect(formatCategoryPercent(12, 1000)).toBe('1%') // 1.2%
      expect(formatCategoryPercent(18, 1000)).toBe('2%') // 1.8%
      expect(formatCategoryPercent(490, 1000)).toBe('49%')
      expect(formatCategoryPercent(1100, 2225)).toBe('49%')
    })
  })

  describe('resolvePluralTemplate', () => {
    const defaultEng = { singular: '{count} item', plural: '{count} items' }

    it('falls back to default English when templates are missing', () => {
      expect(resolvePluralTemplate(1, 'en', {}, defaultEng)).toBe('1 item')
      expect(resolvePluralTemplate(5, 'en', {}, defaultEng)).toBe('5 items')
    })

    it('handles invalid locale gracefully', () => {
      expect(resolvePluralTemplate(1, 'invalid-locale-xyz', {}, defaultEng)).toBe('1 item')
      expect(resolvePluralTemplate(5, 'invalid-locale-xyz', {}, defaultEng)).toBe('5 items')
    })

    it('handles negative numbers using absolute value', () => {
      const templates = { singular: '{count} item', plural: '{count} items' }
      expect(resolvePluralTemplate(-1, 'en', templates, defaultEng)).toBe('-1 item')
      expect(resolvePluralTemplate(-5, 'en', templates, defaultEng)).toBe('-5 items')
    })
  })

  describe('guardrail: all registered locales in i18n format counts accurately', () => {
    it.each(localeOrder)(
      'locale "%s" has valid formatting for all count functions across count sizes',
      (locale) => {
        const t = translations[locale]
        const sampleCounts = [1, 2, 5, 11, 21, 22, 100]

        for (const count of sampleCounts) {
          const categoryCount = formatCategoryCount(count, t, locale)
          expect(categoryCount).toContain(String(count))
          expect(categoryCount).not.toContain('{count}')
          expect(categoryCount).not.toContain('undefined')

          const chargesCount = formatChargesCount(count, t, locale)
          expect(chargesCount).toContain(String(count))
          expect(chargesCount).not.toContain('{count}')
          expect(chargesCount).not.toContain('undefined')

          const merchantsCount = formatPopularMerchantsCount(count, t, locale)
          expect(merchantsCount).toContain(String(count))
          expect(merchantsCount).not.toContain('{count}')
          expect(merchantsCount).not.toContain('undefined')

          const txCount = formatTransactionCount(count, t, locale)
          expect(txCount).toContain(String(count))
          expect(txCount).not.toContain('{count}')
          expect(txCount).not.toContain('undefined')
        }
      },
    )
  })
})
