import { describe, expect, it } from 'vitest'

import { localeOrder, translations, type TranslationStrings } from '../i18n/translations'
import type { Transaction } from '../types'
import {
  categorize,
  extractCleanDescription,
  extractMerchantKeyword,
  findRelatedTransactions,
  formatCategoryCount,
  formatCategoryPercent,
  formatChargesCount,
  formatPopularMerchantsCount,
  formatTransactionCount,
  getCategoryLabel,
  getTransactionCategory,
  hasExtensiveCategoryData,
  isInformativeTransaction,
  isRelatedTransaction,
  repairBrokenWords,
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
      expect(categorize('HVV Ticket Hamburg')).toBe('Transport')
      expect(categorize('VRR Ticket Düsseldorf')).toBe('Transport')
      expect(categorize('VVS Mobil Stuttgart')).toBe('Transport')
      expect(categorize('VRS Ticket Köln')).toBe('Transport')
      expect(categorize('ÖBB Nightjet Wien')).toBe('Transport')
      expect(categorize('SBB Fahrkarte Zürich')).toBe('Transport')
      expect(categorize('TIER Scooter Fahrt')).toBe('Transport')
    })

    it('categorizes travel descriptions correctly', () => {
      expect(categorize('Hotel booking reservation')).toBe('Travel')
      expect(categorize('Lufthansa flight ticket')).toBe('Travel')
      expect(categorize('Airbnb stay')).toBe('Travel')
    })

    it('categorizes communication and internet descriptions correctly', () => {
      expect(categorize('Vodafone bill')).toBe('Communication')
      expect(categorize('Telekom internet flat')).toBe('Communication')
      expect(categorize('O2 mobile data')).toBe('Communication')
      expect(categorize('Internet pretplata')).toBe('Communication')
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
      expect(resolveCanonicalCategory('Loans')).toBe('Loans')
      expect(resolveCanonicalCategory('Groceries')).toBe('Groceries')
      expect(resolveCanonicalCategory('Dining Out')).toBe('Dining Out')
      expect(resolveCanonicalCategory('DiningOut')).toBe('Dining Out')
      expect(resolveCanonicalCategory('Shopping')).toBe('Shopping')
      expect(resolveCanonicalCategory('Transport')).toBe('Transport')
      expect(resolveCanonicalCategory('Entertainment')).toBe('Entertainment')
      expect(resolveCanonicalCategory('Insurance')).toBe('Insurance')
      expect(resolveCanonicalCategory('Utilities')).toBe('Utilities')
      expect(resolveCanonicalCategory('Communication')).toBe('Communication')
      expect(resolveCanonicalCategory('Internet')).toBe('Communication')
      expect(resolveCanonicalCategory('Healthcare')).toBe('Healthcare')
      expect(resolveCanonicalCategory('Savings')).toBe('Savings')
      expect(resolveCanonicalCategory('Cash')).toBe('Cash')
      expect(resolveCanonicalCategory('Transfers')).toBe('Transfers')
      expect(resolveCanonicalCategory('Travel')).toBe('Travel')
      expect(resolveCanonicalCategory('Crypto')).toBe('Crypto')
      expect(resolveCanonicalCategory('Bank Fees')).toBe('Bank Fees')
      expect(resolveCanonicalCategory('BankFees')).toBe('Bank Fees')
      expect(resolveCanonicalCategory('Fees')).toBe('Bank Fees')
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
      // Travel across all supported languages
      expect(resolveCanonicalCategory('Travel')).toBe('Travel')
      expect(resolveCanonicalCategory('Podróże')).toBe('Travel')
      expect(resolveCanonicalCategory('Reisen')).toBe('Travel')
      expect(resolveCanonicalCategory('Putovanja')).toBe('Travel')
      expect(resolveCanonicalCategory('Путовања')).toBe('Travel')
      expect(resolveCanonicalCategory('Perjalanan')).toBe('Travel')
      // Loans across all supported languages
      expect(resolveCanonicalCategory('Loans')).toBe('Loans')
      expect(resolveCanonicalCategory('Kredite & Darlehen')).toBe('Loans')
      expect(resolveCanonicalCategory('Krediti')).toBe('Loans')
      expect(resolveCanonicalCategory('Кредити')).toBe('Loans')
      expect(resolveCanonicalCategory('Kredyty i Pożyczki')).toBe('Loans')
      expect(resolveCanonicalCategory('Pinjaman & Kredit')).toBe('Loans')
      // Cash across all supported languages
      expect(resolveCanonicalCategory('Cash')).toBe('Cash')
      expect(resolveCanonicalCategory('Bargeld')).toBe('Cash')
      expect(resolveCanonicalCategory('Gotówka')).toBe('Cash')
      expect(resolveCanonicalCategory('Gotovina')).toBe('Cash')
      expect(resolveCanonicalCategory('Готовина')).toBe('Cash')
      expect(resolveCanonicalCategory('Tarik Tunai')).toBe('Cash')
      expect(resolveCanonicalCategory('Crypto')).toBe('Crypto')
      expect(resolveCanonicalCategory('Krypto')).toBe('Crypto')
      expect(resolveCanonicalCategory('Kripto')).toBe('Crypto')
      expect(resolveCanonicalCategory('Крипто')).toBe('Crypto')
      // Bank Fees across all supported languages
      expect(resolveCanonicalCategory('Bankgebühren')).toBe('Bank Fees')
      expect(resolveCanonicalCategory('Opłaty bankowe')).toBe('Bank Fees')
      expect(resolveCanonicalCategory('Bankarske naknade')).toBe('Bank Fees')
      expect(resolveCanonicalCategory('Банкарске накнаде')).toBe('Bank Fees')
      expect(resolveCanonicalCategory('Biaya Bank')).toBe('Bank Fees')
    })

    it('resolves categories from transaction keywords and descriptions', () => {
      expect(resolveCanonicalCategory('Biedronka zakupy')).toBe('Groceries')
      expect(resolveCanonicalCategory('Rewe Supermarkt')).toBe('Groceries')
      expect(resolveCanonicalCategory('Monthly salary payroll')).toBe('Salary')
      expect(resolveCanonicalCategory('Uber ride to airport')).toBe('Transport')
      expect(resolveCanonicalCategory('Booking.com reservation')).toBe('Travel')
      expect(resolveCanonicalCategory('Airbnb accommodation')).toBe('Travel')
      expect(resolveCanonicalCategory('Flight tickets')).toBe('Travel')
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

  describe('hasExtensiveCategoryData', () => {
    it('returns false for null, undefined, or empty data', () => {
      expect(hasExtensiveCategoryData(null)).toBe(false)
      expect(hasExtensiveCategoryData(undefined)).toBe(false)
      expect(hasExtensiveCategoryData([])).toBe(false)
    })

    it('returns false for small data sets (e.g. 1-3 months with few categories)', () => {
      const data = [
        { month: 'Jan 25', Rent: 1000, Groceries: 400, Utilities: 150 },
        { month: 'Feb 25', Rent: 1000, Groceries: 450, Utilities: 120 },
        { month: 'Mar 25', Rent: 1000, Groceries: 500, Utilities: 200 },
      ]
      expect(hasExtensiveCategoryData(data)).toBe(false)
    })

    it('returns true when there are 6 or more months', () => {
      const data = [
        { month: 'Jan 25', Rent: 1000 },
        { month: 'Feb 25', Rent: 1000 },
        { month: 'Mar 25', Rent: 1000 },
        { month: 'Apr 25', Rent: 1000 },
        { month: 'May 25', Rent: 1000 },
        { month: 'Jun 25', Rent: 1000 },
      ]
      expect(hasExtensiveCategoryData(data)).toBe(true)
    })

    it('returns true when there are 6 or more categories across months', () => {
      const data = [
        {
          month: 'Jan 25',
          Rent: 1000,
          Groceries: 400,
          Utilities: 100,
          Transport: 50,
          Entertainment: 80,
          Shopping: 120,
        },
      ]
      expect(hasExtensiveCategoryData(data)).toBe(true)
    })

    it('returns true when both months count and categories count are at least 4', () => {
      const data = [
        { month: 'Jan 25', C1: 10, C2: 20, C3: 30, C4: 40 },
        { month: 'Feb 25', C1: 10, C2: 20, C3: 30, C4: 40 },
        { month: 'Mar 25', C1: 10, C2: 20, C3: 30, C4: 40 },
        { month: 'Apr 25', C1: 10, C2: 20, C3: 30, C4: 40 },
      ]
      expect(hasExtensiveCategoryData(data)).toBe(true)
    })

    it('returns true when total data matrix points (months * categories) >= 20', () => {
      // 5 months * 4 categories = 20 points
      const data = [
        { month: 'Jan 25', A: 1, B: 2, C: 3, D: 4 },
        { month: 'Feb 25', A: 1, B: 2, C: 3, D: 4 },
        { month: 'Mar 25', A: 1, B: 2, C: 3, D: 4 },
        { month: 'Apr 25', A: 1, B: 2, C: 3, D: 4 },
        { month: 'May 25', A: 1, B: 2, C: 3, D: 4 },
      ]
      expect(hasExtensiveCategoryData(data)).toBe(true)
    })

    it('uses explicit categoriesCount parameter when provided', () => {
      const data = [{ month: 'Jan 25', A: 1 }]
      // 1 month, but categoriesCount passed as 7
      expect(hasExtensiveCategoryData(data, 7)).toBe(true)
      // 1 month, categoriesCount passed as 2
      expect(hasExtensiveCategoryData(data, 2)).toBe(false)
    })
  })

  describe('extractCleanDescription', () => {
    it('strips SEPA End-to-End reference noise cleanly', () => {
      const desc1 =
        'CHECK24 Vergleichsportal Mobilfunk GmbH Cashback Auszahlung End-to-End-Ref.: C542586686C116'
      const desc2 =
        'CHECK24 Vergleichsportal Mobilfunk GmbH Cashback Auszahlung End-to-End-Ref.: C542491879C1159'

      expect(extractCleanDescription(desc1)).toBe(
        'CHECK24 Vergleichsportal Mobilfunk GmbH Cashback Auszahlung',
      )
      expect(extractCleanDescription(desc2)).toBe(
        'CHECK24 Vergleichsportal Mobilfunk GmbH Cashback Auszahlung',
      )
      expect(extractCleanDescription(desc1)).toBe(extractCleanDescription(desc2))
    })

    it('strips truncated End-to- noise and cleans Kasino breakdown items', () => {
      const desc =
        'Commerzbank AG Kasinoabrechnung Frankfurt Plaza Ka sino: 16,50 / Cafeteria: - / Sonsti ges: - End-to-'
      expect(extractCleanDescription(desc)).toBe(
        'Commerzbank AG Kasinoabrechnung Frankfurt Plaza Kasino 16 50 Cafeteria - Sonstiges',
      )
    })

    it('strips banking prefixes such as Auftraggeber and Empfänger', () => {
      expect(extractCleanDescription('Auftraggeber: REWE Markt Koeln')).toBe('REWE Markt Koeln')
      expect(extractCleanDescription('Empfänger: Deutsche Telekom AG')).toBe('Deutsche Telekom AG')
    })

    it('strips dates, times, and long alphanumeric transaction IDs', () => {
      expect(extractCleanDescription('NETFLIX.COM 12.05.2024 14:30 TX99281726354')).toBe(
        'NETFLIX.COM',
      )
    })

    it('handles empty and invalid inputs gracefully', () => {
      expect(extractCleanDescription('')).toBe('')
      // @ts-expect-error Testing invalid runtime input
      expect(extractCleanDescription(null)).toBe('')
    })
  })

  describe('isRelatedTransaction', () => {
    it('matches user example CHECK24 transactions with differing SEPA references', () => {
      const desc1 =
        'CHECK24 Vergleichsportal Mobilfunk GmbH Cashback Auszahlung End-to-End-Ref.: C542586686C116'
      const desc2 =
        'CHECK24 Vergleichsportal Mobilfunk GmbH Cashback Auszahlung End-to-End-Ref.: C542491879C1159'

      expect(isRelatedTransaction(desc1, desc2)).toBe(true)
    })

    it('matches transactions with shared core merchant prefix on word boundary', () => {
      const desc1 = 'CHECK24 Vergleichsportal Mobilfunk GmbH'
      const desc2 = 'CHECK24 Vergleichsportal Mobilfunk GmbH Cashback Auszahlung'
      expect(isRelatedTransaction(desc1, desc2)).toBe(true)
    })

    it('does not match completely unrelated transactions', () => {
      expect(isRelatedTransaction('Telekom Deutschland GmbH', 'Vodafone West GmbH')).toBe(false)
      expect(isRelatedTransaction('Bar', 'Barclays Bank')).toBe(false)
    })
  })

  describe('findRelatedTransactions', () => {
    it('finds related transactions and excludes self, ghosts, and target category matches', () => {
      const targetTx: Transaction = {
        id: 'tx-1',
        date: '2024-03-01',
        amount: 25.5,
        currency: 'EUR',
        institution: 'Bank A',
        description:
          'CHECK24 Vergleichsportal Mobilfunk GmbH Cashback Auszahlung End-to-End-Ref.: C542586686C116',
        category: 'Other',
        type: 'income',
      }

      const allTx: Transaction[] = [
        targetTx,
        {
          id: 'tx-2',
          date: '2024-03-05',
          amount: 15.0,
          currency: 'EUR',
          institution: 'Bank A',
          description:
            'CHECK24 Vergleichsportal Mobilfunk GmbH Cashback Auszahlung End-to-End-Ref.: C542491879C1159',
          category: 'Other',
          type: 'income',
        },
        {
          id: 'tx-3',
          date: '2024-03-10',
          amount: 50.0,
          currency: 'EUR',
          institution: 'Bank A',
          description: 'CHECK24 Vergleichsportal Mobilfunk GmbH Cashback Auszahlung',
          category: 'Communication', // Already in target category
          type: 'income',
        },
        {
          id: 'tx-4',
          date: '2024-03-12',
          amount: 10.0,
          currency: 'EUR',
          institution: 'Bank A',
          description:
            'CHECK24 Vergleichsportal Mobilfunk GmbH Cashback Auszahlung End-to-End-Ref.: C111111111C111',
          category: 'Other',
          type: 'income',
          isGhost: true, // Ghost should be excluded
        },
        {
          id: 'tx-5',
          date: '2024-03-15',
          amount: 100.0,
          currency: 'EUR',
          institution: 'Bank A',
          description: 'REWE Supermarkt Muenchen',
          category: 'Groceries',
          type: 'expense',
        },
      ]

      // Filter with targetCategory = 'Communication'
      // tx-1 is self (excluded)
      // tx-2 has category 'Other' -> matches, included
      // tx-3 already has category 'Communication' -> excluded
      // tx-4 is ghost -> excluded
      // tx-5 unrelated -> excluded
      const related = findRelatedTransactions(targetTx, allTx, 'Communication')
      expect(related).toHaveLength(1)
      expect(related[0].id).toBe('tx-2')
    })

    it('excludes informative 0-euro candidate transactions', () => {
      const targetTx: Transaction = {
        id: 'tx-1',
        date: '2024-03-01',
        amount: 25.5,
        currency: 'EUR',
        institution: 'Bank A',
        description: 'Telekom Deutschland GmbH End-to-End-Ref.: REF1',
        category: 'Communication',
        type: 'expense',
      }

      const allTx: Transaction[] = [
        targetTx,
        {
          id: 'tx-2',
          date: '2024-03-05',
          amount: 0,
          currency: 'EUR',
          institution: 'Bank A',
          description: 'Telekom Deutschland GmbH End-to-End-Ref.: REF2',
          type: 'income',
        },
        {
          id: 'tx-3',
          date: '2024-03-10',
          amount: -45.0,
          currency: 'EUR',
          institution: 'Bank A',
          description: 'Telekom Deutschland GmbH End-to-End-Ref.: REF3',
          category: 'Other',
          type: 'expense',
        },
      ]

      const related = findRelatedTransactions(targetTx, allTx, 'Communication')
      expect(related).toHaveLength(1)
      expect(related[0].id).toBe('tx-3')
    })

    it('returns empty array when target transaction has 0 amount', () => {
      const targetTx: Transaction = {
        id: 'tx-zero',
        date: '2024-03-01',
        amount: 0,
        currency: 'EUR',
        institution: 'Bank A',
        description: 'Telekom Deutschland GmbH Hinweis',
        type: 'income',
      }

      const allTx: Transaction[] = [
        targetTx,
        {
          id: 'tx-1',
          date: '2024-03-05',
          amount: -45.0,
          currency: 'EUR',
          institution: 'Bank A',
          description: 'Telekom Deutschland GmbH Flatrate',
          type: 'expense',
        },
      ]

      const related = findRelatedTransactions(targetTx, allTx)
      expect(related).toEqual([])
    })
  })

  describe('isInformativeTransaction', () => {
    it('returns true when amount is 0, -0, or 0.00', () => {
      expect(isInformativeTransaction({ amount: 0 })).toBe(true)
      expect(isInformativeTransaction({ amount: -0 })).toBe(true)
      expect(isInformativeTransaction({ amount: 0.0 })).toBe(true)
    })

    it('returns false for positive or negative amounts', () => {
      expect(isInformativeTransaction({ amount: 10 })).toBe(false)
      expect(isInformativeTransaction({ amount: -0.01 })).toBe(false)
      expect(isInformativeTransaction({ amount: 100.5 })).toBe(false)
    })

    it('returns false for null, undefined, or missing amount', () => {
      expect(isInformativeTransaction(null)).toBe(false)
      expect(isInformativeTransaction(undefined)).toBe(false)
      expect(isInformativeTransaction({} as { amount: number })).toBe(false)
    })
  })

  describe('getTransactionCategory', () => {
    it('returns undefined for informative 0-euro transactions regardless of description', () => {
      const txSalary: Transaction = {
        id: 'tx-0-salary',
        date: '2024-01-01',
        amount: 0,
        currency: 'EUR',
        institution: 'Bank A',
        description: 'Monthly salary payment Lohn Gehalt',
        type: 'income',
      }
      expect(getTransactionCategory(txSalary)).toBeUndefined()

      const txGroceries: Transaction = {
        id: 'tx-0-rewe',
        date: '2024-01-01',
        amount: 0,
        currency: 'EUR',
        institution: 'Bank A',
        description: 'REWE Supermarkt Einkauf',
        type: 'expense',
      }
      expect(getTransactionCategory(txGroceries)).toBeUndefined()
    })

    it('returns undefined for 0-euro transaction even if custom keywords match', () => {
      const tx: Transaction = {
        id: 'tx-custom',
        date: '2024-01-01',
        amount: 0,
        currency: 'EUR',
        institution: 'Bank A',
        description: 'MyCustomKeyword Notice',
        type: 'income',
      }
      const customKeywords = { Groceries: ['mycustomkeyword'] }
      expect(getTransactionCategory(tx, customKeywords)).toBeUndefined()
    })

    it('returns undefined for 0-euro transaction even if manual category override is present', () => {
      const tx: Transaction = {
        id: 'tx-manual',
        date: '2024-01-01',
        amount: 0,
        currency: 'EUR',
        institution: 'Bank A',
        description: 'Informative bank message',
        type: 'income',
      }
      const manualCategories = { 'tx-manual': 'Savings' }
      expect(getTransactionCategory(tx, undefined, manualCategories)).toBeUndefined()
    })

    it('returns undefined for 0-euro transaction even if category was set on the object', () => {
      const tx: Transaction = {
        id: 'tx-with-cat',
        date: '2024-01-01',
        amount: 0,
        currency: 'EUR',
        institution: 'Bank A',
        description: 'Informative notice',
        category: 'Insurance',
        type: 'income',
      }
      expect(getTransactionCategory(tx)).toBeUndefined()
    })

    it('correctly categorizes non-zero transactions', () => {
      const txSalary: Transaction = {
        id: 'tx-salary',
        date: '2024-01-01',
        amount: 2500,
        currency: 'EUR',
        institution: 'Bank A',
        description: 'Monthly salary payment',
        type: 'income',
      }
      expect(getTransactionCategory(txSalary)).toBe('Salary')

      const txGroceries: Transaction = {
        id: 'tx-groceries',
        date: '2024-01-01',
        amount: -55.2,
        currency: 'EUR',
        institution: 'Bank A',
        description: 'REWE Markt Berlin',
        type: 'expense',
      }
      expect(getTransactionCategory(txGroceries)).toBe('Groceries')

      const txOther: Transaction = {
        id: 'tx-other',
        date: '2024-01-01',
        amount: -12,
        currency: 'EUR',
        institution: 'Bank A',
        description: 'Unrecognized payment',
        type: 'expense',
      }
      expect(getTransactionCategory(txOther)).toBe('Other')
    })
  })

  describe('improved categorization & boundary precision', () => {
    describe('boundary matching & false-positive elimination', () => {
      it('does not classify words containing "car" as Transport', () => {
        expect(categorize('Mastercard Debit Payment')).not.toBe('Transport')
        expect(categorize('Credit card payment')).not.toBe('Transport')
        expect(categorize('Healthcare Clinic')).not.toBe('Transport')
        expect(categorize('Carpet cleaning service')).not.toBe('Transport')
        expect(categorize('Oscar Wilde Books')).not.toBe('Transport')
        // But actual standalone car or Uber matches Transport
        expect(categorize('Rental car trip')).toBe('Transport')
        expect(categorize('Uber car ride')).toBe('Transport')
      })

      it('does not classify words containing "weg" as Rent', () => {
        expect(categorize('Bewegung Studio')).not.toBe('Rent')
        expect(categorize('Unterwegs Kiosk')).not.toBe('Rent')
        expect(categorize('Zahlungsweg Gebühr')).not.toBe('Rent')
        // But WEG Hausgeld or Miete matches Rent
        expect(categorize('WEG Hausgeld 01/2024')).toBe('Rent')
        expect(categorize('Monatliche Miete')).toBe('Rent')
      })

      it('does not classify words containing "auto" as Transport', () => {
        expect(categorize('Geldautomat Abhebung')).not.toBe('Transport')
        expect(categorize('Automatic transfer')).not.toBe('Transport')
        // But standalone auto matches Transport
        expect(categorize('Auto Service Werkstatt')).toBe('Transport')
      })

      it('does not classify words containing "essen" or the city Essen as Dining Out', () => {
        expect(categorize('Messer Shop')).not.toBe('Dining Out')
        expect(categorize('Interessenverband')).not.toBe('Dining Out')
        expect(categorize('Sparkasse Essen')).not.toBe('Dining Out')
        expect(categorize('Essen Hbf Reisezentrum')).not.toBe('Dining Out')
        // But dining / restaurant matches
        expect(categorize('Restaurant Essen & Trinken')).toBe('Dining Out')
        expect(categorize('McDonalds Essen')).toBe('Dining Out')
      })

      it('does not classify words containing "rent" or "tax" falsely', () => {
        expect(categorize('Current account fee')).not.toBe('Rent')
        expect(categorize('Parent company transfer')).not.toBe('Rent')
        expect(categorize('Contactless payment')).not.toBe('Taxes')
        expect(categorize('Syntax error tool')).not.toBe('Taxes')
        expect(categorize('Property tax')).toBe('Taxes')
        expect(categorize('Apartment rent')).toBe('Rent')
      })

      it('does not classify Volkswagen or Belohnung as Salary', () => {
        expect(categorize('Volkswagen Leasing')).not.toBe('Salary')
        expect(categorize('Belohnung Bonus')).not.toBe('Salary')
        expect(categorize('Monatlicher Lohn')).toBe('Salary')
        expect(categorize('Minimum wage')).toBe('Salary')
      })
    })

    describe('integrated popular merchant dictionary', () => {
      it('categorizes popular entertainment merchants correctly', () => {
        expect(categorize('Steam Games')).toBe('Entertainment')
        expect(categorize('Steampowered')).toBe('Entertainment')
        expect(categorize('PlayStation Network')).toBe('Entertainment')
        expect(categorize('Twitch Interactive')).toBe('Entertainment')
        expect(categorize('Spotify AB')).toBe('Entertainment')
        expect(categorize('Netflix.com')).toBe('Entertainment')
      })

      it('categorizes popular retail & shopping merchants correctly', () => {
        expect(categorize('IKEA Deutschland')).toBe('Shopping')
        expect(categorize('Apple Store Berlin')).toBe('Shopping')
        expect(categorize('Zalando Payments')).toBe('Shopping')
        expect(categorize('Zara Filiale 123')).toBe('Shopping')
        expect(categorize('AMZN Mktp DE')).toBe('Shopping')
      })

      it('categorizes popular dining & food delivery merchants correctly', () => {
        expect(categorize('Uber Eats Order')).toBe('Dining Out')
        expect(categorize('Deliveroo London')).toBe('Dining Out')
        expect(categorize('Lieferando.de')).toBe('Dining Out')
        expect(categorize('Starbucks Coffee')).toBe('Dining Out')
        expect(categorize('Burger King')).toBe('Dining Out')
        expect(categorize('Glovo Delivery')).toBe('Dining Out')
      })

      it('categorizes popular transport & mobility merchants correctly', () => {
        expect(categorize('Shell Station 0492')).toBe('Transport')
        expect(categorize('Aral Tankstelle')).toBe('Transport')
        expect(categorize('Deutsche Bahn Vertrieb')).toBe('Transport')
        expect(categorize('DB Regio Ticket')).toBe('Transport')
        expect(
          categorize(
            'Rhein-Main-Verkehrsverbund Serviceg esellschaft mbH (rms GmbH) Treuhand RNR 2/2607/1271193',
          ),
        ).toBe('Transport')
        expect(categorize('RMV Go Ticket')).toBe('Transport')
        expect(categorize('rms GmbH Treuhand Deutschlandticket')).toBe('Transport')
        expect(categorize('BVG Fahrinfo App')).toBe('Transport')
        expect(categorize('MVG Ticket München')).toBe('Transport')
      })

      it('categorizes popular grocery merchants across countries', () => {
        expect(categorize('Lidl Dienstleistung')).toBe('Groceries')
        expect(categorize('Kaufland Berlin')).toBe('Groceries')
        expect(categorize('Aldi Süd')).toBe('Groceries')
        expect(categorize('Aldi Sued')).toBe('Groceries')
        expect(categorize('Biedronka')).toBe('Groceries')
        expect(categorize('Bingo d.o.o.')).toBe('Groceries')
      })
    })

    describe('payment processor disambiguation', () => {
      it('prioritizes specific merchant over payment processors like PayPal or Klarna', () => {
        expect(categorize('PAYPAL *SPOTIFY')).toBe('Entertainment')
        expect(categorize('PAYPAL *STEAM GAMES')).toBe('Entertainment')
        expect(categorize('PAYPAL *REWE MARKT')).toBe('Groceries')
        expect(categorize('KLARNA *ZALANDO')).toBe('Shopping')
        expect(categorize('PAYPAL *UBER EATS')).toBe('Dining Out')
      })

      it('falls back to Transfers when PayPal is a direct transfer without known retail merchant', () => {
        expect(categorize('PAYPAL *JOHN DOE')).toBe('Transfers')
        expect(categorize('PayPal Guthaben')).toBe('Transfers')
        expect(categorize('Western Union Money Transfer')).toBe('Transfers')
        expect(categorize('Westernunion International')).toBe('Transfers')
        expect(categorize('MoneyGram Transfer Ref: 9812')).toBe('Transfers')
        expect(categorize('Stripe Payments Payout')).toBe('Transfers')
        expect(categorize('Payoneer Inc Payout')).toBe('Transfers')
        expect(categorize('Venmo Transfer')).toBe('Transfers')
        expect(categorize('Coinbase Ireland Deposit')).toBe('Crypto')
        expect(categorize('Übertrag comdirect Bank')).toBe('Transfers')
        expect(categorize('DKB Überweisung')).toBe('Transfers')
      })

      it('categorizes payment processor transactions with purchase phrases as Shopping across all languages', () => {
        // User example: German with broken line-wrap word "Ei nkauf"
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1052883197217/PP.4585.PP/. , Ihr Ei nkauf bei End-to-End-Ref.: 1052',
          ),
        ).toBe('Shopping')

        // German standard purchase phrases and word splits
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A, Ihr Einkauf bei End-to-End-Ref.: 1052',
          ),
        ).toBe('Shopping')
        expect(
          categorize(
            'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1046262432022 PP.4585.PP . PayPal ( Europe) S.a r.l. et Cie, SCA, Ihr E inkauf bei PayPal (Europe) S.a r.l. et Cie, SCA End-to-End-Ref.: 1046262432022 PP.4585.PP PAYPAL Mandatsref: 58V2224W7NHK6 Gläubiger-ID: LU96ZZZ0000000000000000058 SEPA-BASISLASTSCHRIFT wiederholend19.11.2025 •',
          ),
        ).toBe('Shopping')
        expect(categorize('PayPal * Ihr Einkauf bei StoreX')).toBe('Shopping')
        expect(categorize('PayPal * Ihr E inkauf bei StoreX')).toBe('Shopping')
        expect(categorize('PayPal * Ihr Eink auf bei StoreY')).toBe('Shopping')
        expect(categorize('PayPal * Ihr E in kauf bei StoreZ')).toBe('Shopping')
        expect(categorize('Klarna * Ihr Einkauf bei Modewelt')).toBe('Shopping')
        expect(categorize('SumUp * Ihr Ein kauf bei Modehaus')).toBe('Shopping')

        // English purchase phrases and broken words
        expect(categorize('PayPal Pte. Ltd. Your purchase at TechGadgets')).toBe('Shopping')
        expect(categorize('PayPal Pte. Ltd. Your pur chase at End-to-End-Ref: 8812')).toBe('Shopping')
        expect(categorize('POS Purchase at Main Street')).toBe('Shopping')

        // Polish purchase phrases and broken words
        expect(categorize('PayPal Europe Twój zakup w Sklep')).toBe('Shopping')
        expect(categorize('PayPal Europe Twój za kup w End-to-End-Ref: 9912')).toBe('Shopping')
        expect(categorize('Płatność za zakupy w Galerii')).toBe('Shopping')

        // Bosnian purchase phrases and broken words
        expect(categorize('PayPal Europe Vaša kupovina kod Trgovina')).toBe('Shopping')
        expect(categorize('PayPal Europe Vaša kupo vina kod Ref: 1052')).toBe('Shopping')
        expect(categorize('Plaćanje kupovine karticom')).toBe('Shopping')

        // Serbian purchase phrases (Cyrillic and Latin)
        expect(categorize('PayPal Europe Ваша куповина код Трговина')).toBe('Shopping')
        expect(categorize('PayPal Europe Ваша купо вина код Реф: 1052')).toBe('Shopping')
        expect(categorize('Плаћање куповине картицом')).toBe('Shopping')

        // Indonesian purchase phrases and broken words
        expect(categorize('PayPal Pembelian Anda di Toko')).toBe('Shopping')
        expect(categorize('PayPal Pem belian Anda di Ref: 1052')).toBe('Shopping')
        expect(categorize('Transaksi pembelian di Mall')).toBe('Shopping')

        // Corporate canteens, cafeterias, and staff dining (e.g. Kasinoabrechnung, Cafeteria)
        expect(
          categorize(
            'Commerzbank AG Kasinoabrechnung Frankfurt Plaza Ka sino: 16,50 / Cafeteria: - / Sonsti ges: - End-to-',
          ),
        ).toBe('Dining Out')
        expect(categorize('Commerzbank AG Cafeteria Mittagessen')).toBe('Dining Out')
        expect(categorize('Mitarbeiter Kasinoabrechnung')).toBe('Dining Out')
        expect(categorize('Betriebskantine Essen')).toBe('Dining Out')
        expect(categorize('Uni Mensa Cafeteria')).toBe('Dining Out')
      })
    })

    describe('repairBrokenWords', () => {
      it('repairs broken words across multiple languages', () => {
        expect(repairBrokenWords('Ihr E inkauf bei')).toBe('Ihr Einkauf bei')
        expect(repairBrokenWords('Ihr Ei nkauf bei')).toBe('Ihr Einkauf bei')
        expect(repairBrokenWords('Ihr Ein kauf bei')).toBe('Ihr Einkauf bei')
        expect(repairBrokenWords('Ihr Eink auf bei')).toBe('Ihr Einkauf bei')
        expect(repairBrokenWords('Ihr E in kauf bei')).toBe('Ihr Einkauf bei')
        expect(repairBrokenWords('Ihr Ei- nkauf bei')).toBe('Ihr Einkauf bei')
        expect(repairBrokenWords('Ihr E- inkauf bei')).toBe('Ihr Einkauf bei')
        expect(repairBrokenWords('Waren e inkauf')).toBe('Wareneinkauf')
        expect(repairBrokenWords('Bar geld auszahlung')).toBe('Bargeldauszahlung')
        expect(repairBrokenWords('Bargeld auszahlung')).toBe('Bargeldauszahlung')
        expect(repairBrokenWords('Ka sino: 16,50')).toBe('Kasino: 16,50')
        expect(repairBrokenWords('Sonsti ges: -')).toBe('Sonstiges: -')
        expect(repairBrokenWords('Cafe teria: -')).toBe('Cafeteria: -')
        expect(repairBrokenWords('Steuer belastung')).toBe('Steuerbelastung')
        expect(repairBrokenWords('Vorab pauschale')).toBe('Vorabpauschale')
        expect(repairBrokenWords('Steuer abzug')).toBe('Steuerabzug')
        expect(repairBrokenWords('Kapital ertragsteuer')).toBe('Kapitalertragsteuer')
        expect(repairBrokenWords('Your pur chase at')).toBe('Your Purchase at')
        expect(repairBrokenWords('Twój za kup w')).toBe('Twój Zakup w')
        expect(repairBrokenWords('Vaša kupo vina kod')).toBe('Vaša Kupovina kod')
        expect(repairBrokenWords('Ваша купо вина код')).toBe('Ваша Куповина код')
        expect(repairBrokenWords('Pem belian Anda di')).toBe('Pembelian Anda di')
        expect(repairBrokenWords('Co inbase Identifizierung')).toBe('Coinbase Identifizierung')
        expect(repairBrokenWords('Coin base')).toBe('Coinbase')
        expect(repairBrokenWords('Bi nance Pay')).toBe('Binance Pay')
        expect(repairBrokenWords('Kra ken exchange')).toBe('Kraken exchange')
        expect(repairBrokenWords('Bit panda GmbH')).toBe('Bitpanda GmbH')
        expect(repairBrokenWords('Account verifi cation')).toBe('Account Verification')
        expect(repairBrokenWords('Rechnungs abschluss')).toBe('Rechnungsabschluss')
        expect(repairBrokenWords('Soll zinsen')).toBe('Sollzinsen')
        expect(repairBrokenWords('Haben zinsen')).toBe('Habenzinsen')
        expect(repairBrokenWords('Dispo zinsen')).toBe('Dispozinsen')
        expect(repairBrokenWords('Konto führung')).toBe('Kontoführung')
        expect(repairBrokenWords('Bank gebühren')).toBe('Bankgebühren')
        expect(repairBrokenWords('Serviceg esellschaft')).toBe('Servicegesellschaft')
        expect(repairBrokenWords('Verkehrs verbund')).toBe('Verkehrsverbund')
      })
    })

    describe('tax and investment tax categorization', () => {
      it('categorizes German Vorabpauschale and investment tax bookings as Taxes', () => {
        expect(
          categorize(
            'Steuerbelastung auf Vorabpauschale gem. § 18 InvStG Depotbestand: 000000000000005,211 ISHSV-',
          ),
        ).toBe('Taxes')
        expect(categorize('Vorabpauschale 2026 gem. § 18 InvStG')).toBe('Taxes')
        expect(categorize('Steuerabzug Vorabpauschale comdirect')).toBe('Taxes')
        expect(categorize('Trade Republic Steuerabrechnung')).toBe('Taxes')
        expect(categorize('Kapitalertragsteuer und Solidaritätszuschlag')).toBe('Taxes')
        expect(categorize('Finanzamt Vorauszahlung Q1')).toBe('Taxes')
        expect(categorize('Quellensteuer Dividende')).toBe('Taxes')
      })

      it('categorizes international investment and capital taxes as Taxes', () => {
        expect(categorize('Advance Tax Payment')).toBe('Taxes')
        expect(categorize('Investment fund tax charge')).toBe('Taxes')
        expect(categorize('Podatek Belki od zysków kapitałowych')).toBe('Taxes')
        expect(categorize('Porez na kapitalnu dobit')).toBe('Taxes')
        expect(categorize('Порез на капиталну добит')).toBe('Taxes')
        expect(categorize('PPh final pajak dividen')).toBe('Taxes')
      })
    })

    describe('context-aware categorization', () => {
      it('prevents expenses from being categorized as Salary', () => {
        const expenseTx: Transaction = {
          id: 'tx-exp-salary',
          date: '2024-01-01',
          amount: -50,
          currency: 'EUR',
          institution: 'Bank A',
          description: 'Salary software subscription',
          type: 'expense',
        }
        expect(getTransactionCategory(expenseTx)).not.toBe('Salary')

        const incomeTx: Transaction = {
          id: 'tx-inc-salary',
          date: '2024-01-01',
          amount: 3000,
          currency: 'EUR',
          institution: 'Bank A',
          description: 'Monthly salary payment',
          type: 'income',
        }
        expect(getTransactionCategory(incomeTx)).toBe('Salary')
      })

      it('incorporates partner column when present in transaction', () => {
        const txWithPartner: Transaction = {
          id: 'tx-partner',
          date: '2024-01-01',
          amount: -45.5,
          currency: 'EUR',
          institution: 'Bank A',
          partner: 'REWE Markt',
          description: 'Kartenzahlung vom 12.03. Terminal 49102',
          type: 'expense',
        }
        expect(getTransactionCategory(txWithPartner)).toBe('Groceries')
      })
    })

    describe('extractMerchantKeyword', () => {
      it('extracts clean merchant keywords by stripping legal entity forms and noise', () => {
        expect(extractMerchantKeyword('Rewe Markt GmbH & Co. KG Filiale 481')).toBe('Rewe Markt')
        expect(extractMerchantKeyword('Kaufland 4912 Berlin')).toBe('Kaufland')
        expect(extractMerchantKeyword('Deutsche Telekom AG')).toBe('Deutsche Telekom')
        expect(extractMerchantKeyword('Zalando Payments GmbH')).toBe('Zalando Payments')
      })
    })

    describe('loan payment categorization', () => {
      it('categorizes German KREDITRATE bank bookings as Loans', () => {
        expect(
          categorize(
            'ANEL O. BILJANA MEMIC GENODEF1S01 DE36550905000003696413 KREDITRATE End-to-End-Ref',
          ),
        ).toBe('Loans')
        expect(categorize('KREDITRATE 502')).toBe('Loans')
        expect(categorize('Monatliche Tilgungsrate Darlehen')).toBe('Loans')
        expect(categorize('Baufinanzierung Annuität')).toBe('Loans')
      })

      it('categorizes English, Bosnian, and other loan keywords as Loans', () => {
        expect(categorize('Personal loan installment')).toBe('Loans')
        expect(categorize('Car loan repayment')).toBe('Loans')
        expect(categorize('Rata kredita za stan')).toBe('Loans')
        expect(categorize('Otplata kredita')).toBe('Loans')
        expect(categorize('Spłata raty kredytu')).toBe('Loans')
        expect(categorize('Cicilan pinjaman bank')).toBe('Loans')
      })
    })

    describe('insurance provider and camelCase policy categorization', () => {
      it('categorizes iptiQ and AeguronRisikoLV bank bookings as Insurance', () => {
        expect(
          categorize(
            'IPTIQ LIFE SA NIEDERLASSUNG DEUTSCH LAND AeguronRisikoLV 09/26 6267061-P End-to-End-R',
          ),
        ).toBe('Insurance')
        expect(categorize('AeguronRisikoLV 09/26')).toBe('Insurance')
        expect(categorize('HUK-Coburg Haftpflicht')).toBe('Insurance')
        expect(categorize('Allianz Lebensversicherung')).toBe('Insurance')
        expect(categorize('CosmosDirekt Hausrat')).toBe('Insurance')
      })
    })

    describe('travel, tour operator, and airline categorization across countries', () => {
      it('categorizes German TUI booking strings as Travel', () => {
        expect(
          categorize(
            'TUI Deutschland GmbH VG.80319110 03.10.2026-HER End-to-End-Ref.: 000220030170552026 Manda',
          ),
        ).toBe('Travel')
        expect(categorize('TUIfly Buchung 49102')).toBe('Travel')
        expect(categorize('Dertour Pauschalreise Mallorca')).toBe('Travel')
        expect(categorize('Alltours Flug & Hotel')).toBe('Travel')
        expect(categorize('AIDA Cruises Kreuzfahrt')).toBe('Travel')
      })

      it('categorizes global and multi-country travel providers as Travel', () => {
        expect(categorize('TUI UK Holidays')).toBe('Travel')
        expect(categorize('Ryanair flight Dublin-Berlin')).toBe('Travel')
        expect(categorize('easyJet airline booking')).toBe('Travel')
        expect(categorize('Wizz Air flight ticket')).toBe('Travel')
        expect(categorize('Expedia hotel reservation')).toBe('Travel')
        expect(categorize('ITAKA biuro podróży')).toBe('Travel')
        expect(categorize('Wakacje.pl rezerwacja')).toBe('Travel')
        expect(categorize('Centrotours ljetovanje Turska')).toBe('Travel')
        expect(categorize('Filip Travel aranžman Grčka')).toBe('Travel')
        expect(categorize('Traveloka tiket pesawat')).toBe('Travel')
      })

      it('categorizes rest-of-the-world airlines across Americas, Asia, Oceania, Middle East, and Africa as Travel', () => {
        // North America
        expect(categorize('Delta Air Lines Flight 204')).toBe('Travel')
        expect(categorize('American Airlines Ticket')).toBe('Travel')
        expect(categorize('United Airlines Reservation')).toBe('Travel')
        expect(categorize('Southwest Airlines Flight')).toBe('Travel')
        expect(categorize('Air Canada Montreal-Paris')).toBe('Travel')

        // Latin America
        expect(categorize('LATAM Airlines Santiago-Lima')).toBe('Travel')
        expect(categorize('Avianca Bogota')).toBe('Travel')
        expect(categorize('Aeromexico CDMX')).toBe('Travel')

        // Asia & Oceania
        expect(categorize('Singapore Airlines Changi-Frankfurt')).toBe('Travel')
        expect(categorize('Cathay Pacific Hong Kong')).toBe('Travel')
        expect(categorize('Qantas Airways Sydney')).toBe('Travel')
        expect(categorize('Japan Airlines Tokyo')).toBe('Travel')
        expect(categorize('Korean Air Seoul')).toBe('Travel')

        // Middle East & Africa
        expect(categorize('Qatar Airways Doha')).toBe('Travel')
        expect(categorize('Etihad Airways Abu Dhabi')).toBe('Travel')
        expect(categorize('Ethiopian Airlines Addis Ababa')).toBe('Travel')
      })

      it('categorizes global hotel chains and OTAs across the rest of the world as Travel', () => {
        expect(categorize('Marriott Bonvoy New York')).toBe('Travel')
        expect(categorize('Hilton Honors Tokyo')).toBe('Travel')
        expect(categorize('Grand Hyatt Dubai')).toBe('Travel')
        expect(categorize('Holiday Inn Express London')).toBe('Travel')
        expect(categorize('AccorHotels Sofitel Paris')).toBe('Travel')
        expect(categorize('Trip.com Flight & Hotel')).toBe('Travel')
        expect(categorize('Priceline Car & Hotel')).toBe('Travel')
        expect(categorize('Kayak Vacation Booking')).toBe('Travel')
        expect(categorize('Vrbo Beachfront Villa')).toBe('Travel')
      })

      it('categorizes global car rental providers as Transport', () => {
        expect(categorize('Sixt Rent a Car')).toBe('Transport')
        expect(categorize('Hertz Rent a Car Munich Airport')).toBe('Transport')
        expect(categorize('Avis Rent a Car')).toBe('Transport')
        expect(categorize('Enterprise Rent-A-Car')).toBe('Transport')
      })
    })

    describe('tax payments and fiscal obligations categorization', () => {
      it('categorizes German tax authority bookings and advance payments as Taxes', () => {
        expect(
          categorize(
            'Finanzkasse Nidda HELADEFF DE98500500000001000439 Steuernummer 00345234717 Vorauszahl',
          ),
        ).toBe('Taxes')
        expect(categorize('Finanzamt Frankfurt am Main')).toBe('Taxes')
        expect(categorize('Einkommensteuer-Vorauszahlung Q3')).toBe('Taxes')
        expect(categorize('Gewerbesteuer Stadt Bad Homburg')).toBe('Taxes')
        expect(categorize('Umsatzsteuer-Vorauszahlung 08/2026')).toBe('Taxes')
        expect(categorize('Bundeskasse Steuern')).toBe('Taxes')
      })

      it('categorizes international tax payments across countries as Taxes', () => {
        expect(categorize('IRS US Tax Payment')).toBe('Taxes')
        expect(categorize('HMRC Income Tax')).toBe('Taxes')
        expect(categorize('Property tax assessment')).toBe('Taxes')
        expect(categorize('Porezna uprava uplata poreza')).toBe('Taxes')
        expect(categorize('Poreska uprava doprinosi')).toBe('Taxes')
        expect(categorize('Urząd Skarbowy zapłata podatku')).toBe('Taxes')
        expect(categorize('Dirjen Pajak SPT Tahunan')).toBe('Taxes')
      })

      it('categorizes worldwide tax authorities and revenue agencies as Taxes', () => {
        // North America
        expect(categorize('Canada Revenue Agency CRA Payment')).toBe('Taxes')
        expect(categorize('CRA Tax / ARC')).toBe('Taxes')
        expect(categorize('California Franchise Tax Board')).toBe('Taxes')
        expect(categorize('US Treasury Tax Refund')).toBe('Taxes')
        expect(categorize('Servicio de Administracion Tributaria Impuestos')).toBe('Taxes')

        // Europe
        expect(categorize('DGFiP Prelevement Impots')).toBe('Taxes')
        expect(categorize('Direction Generale des Finances Publiques')).toBe('Taxes')
        expect(categorize('Tresor Public Taxe Fonciere')).toBe('Taxes')
        expect(categorize('Agenzia delle Entrate Modello F24')).toBe('Taxes')
        expect(categorize('Agencia Tributaria AEAT IRPF')).toBe('Taxes')
        expect(categorize('Hacienda Publica Retenciones')).toBe('Taxes')
        expect(categorize('Belastingdienst Inkomstenbelasting')).toBe('Taxes')
        expect(categorize('Eidgenössische Steuerverwaltung ESTV')).toBe('Taxes')
        expect(categorize('Finanzamt Österreich Vorauszahlung')).toBe('Taxes')
        expect(categorize('Autoridade Tributaria e Aduaneira')).toBe('Taxes')
        expect(categorize('Skatteverket Skatt')).toBe('Taxes')
        expect(categorize('Skatteetaten Innbetaling')).toBe('Taxes')
        expect(categorize('Skattestyrelsen Restskat')).toBe('Taxes')
        expect(categorize('Revenue Commissioners Ireland')).toBe('Taxes')

        // Latin America
        expect(categorize('Receita Federal Imposto de Renda')).toBe('Taxes')
        expect(categorize('Pagamento IPTU Municipio')).toBe('Taxes')
        expect(categorize('AFIP Pago de Impuestos')).toBe('Taxes')
        expect(categorize('SII Impuestos Internos')).toBe('Taxes')
        expect(categorize('DIAN Impuestos')).toBe('Taxes')
        expect(categorize('SUNAT Tributos')).toBe('Taxes')

        // Asia & Pacific
        expect(categorize('Australian Taxation Office ATO Payment')).toBe('Taxes')
        expect(categorize('Inland Revenue Department IRD Tax')).toBe('Taxes')
        expect(categorize('Income Tax Department CBDT Advance Tax')).toBe('Taxes')
        expect(categorize('Inland Revenue Authority IRAS')).toBe('Taxes')
        expect(categorize('Lembaga Hasil Dalam Negeri LHDN')).toBe('Taxes')
        expect(categorize('National Tax Agency Zeimusho')).toBe('Taxes')

        // Middle East & Africa
        expect(categorize('South African Revenue Service SARS Tax')).toBe('Taxes')
        expect(categorize('Federal Tax Authority VAT')).toBe('Taxes')
        expect(categorize('ZATCA Tax Payment')).toBe('Taxes')
        expect(categorize('Federal Inland Revenue Service FIRS')).toBe('Taxes')
        expect(categorize('Kenya Revenue Authority KRA')).toBe('Taxes')
      })
    })

    describe('cash withdrawal categorization', () => {
      it('categorizes cash withdrawals and ATM transactions as Cash', () => {
        expect(
          categorize(
            'Deutsche Bank//Bad Homburg/DE 2026-07-06T12:49:30 KFN 0 VJ 2812 Bargeldauszahlung',
          ),
        ).toBe('Cash')
        expect(categorize('ATM Cash Withdrawal')).toBe('Cash')
        expect(categorize('Geldautomat Abhebung')).toBe('Cash')
        expect(categorize('Bargeldabhebung')).toBe('Cash')
        expect(categorize('Wypłata z bankomatu')).toBe('Cash')
        expect(categorize('Podizanje gotovine na bankomatu')).toBe('Cash')
        expect(categorize('Исплата на банкомату')).toBe('Cash')
        expect(categorize('Tarik tunai ATM')).toBe('Cash')
      })
    })

    describe('crypto categorization', () => {
      it('categorizes crypto exchange and verification transactions as Crypto', () => {
        expect(
          categorize(
            'Coinbase Identifizierung Account verification return from Co inbase Identifizierung End-to',
          ),
        ).toBe('Crypto')
        expect(categorize('Coinbase Ireland Limited')).toBe('Crypto')
        expect(categorize('Binance Pay crypto transfer')).toBe('Crypto')
        expect(categorize('Kraken Bitcoin purchase')).toBe('Crypto')
        expect(categorize('Bitpanda GmbH crypto buy')).toBe('Crypto')
        expect(categorize('Crypto.com Visa card top up')).toBe('Crypto')
        expect(categorize('Kauf von Bitcoin BTC')).toBe('Crypto')
        expect(categorize('Ethereum ETH transfer')).toBe('Crypto')
        expect(categorize('Solana SOL stake')).toBe('Crypto')
      })
    })

    describe('bank fees and charges categorization', () => {
      it('categorizes account settlements, debit interest, and maintenance fees as Bank Fees', () => {
        // User example: Rechnungsabschluss with Sollzinsen
        expect(
          categorize(
            'Rechnungsabschluss Konto 646293100 EUR BLZ 500 400 00 vom 31.03.2026 bis 30.06.2026 Sollzinsen',
          ),
        ).toBe('Bank Fees')
        expect(categorize('Sollzinsen Q1')).toBe('Bank Fees')
        expect(categorize('Dispozinsen Girokonto')).toBe('Bank Fees')
        expect(categorize('Kontoführungsgebühr')).toBe('Bank Fees')
        expect(categorize('Rechnungsabschlussgebühr')).toBe('Bank Fees')
        expect(categorize('Monthly account maintenance fee')).toBe('Bank Fees')
        expect(categorize('Opłata za prowadzenie konta')).toBe('Bank Fees')
        expect(categorize('Naknada za vođenje računa')).toBe('Bank Fees')
        expect(categorize('Накнада за вођење рачуна')).toBe('Bank Fees')
        expect(categorize('Biaya administrasi bank')).toBe('Bank Fees')
      })

      it('categorizes positive credit interest income as Savings', () => {
        expect(
          categorize('Habenzinsen Tagesgeldkonto', undefined, { type: 'income', amount: 15.2 }),
        ).toBe('Savings')
        expect(
          categorize('Zinsgutschrift Sparkonto', undefined, { type: 'income', amount: 50.0 }),
        ).toBe('Savings')
      })
    })
  })
})


