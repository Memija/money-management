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
  isPaymentProcessorIntermediary,
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
      expect(
        categorize(
          'COMMERZBANK AG ZENTRALE FRANKFURT REISESP.09.05.2023/03700093 End-to-End-Ref.: NOTPROVIDED Kundenreferenz: 0003461317',
        ),
      ).toBe('Salary')
      expect(
        categorize(
          'COMMERZBANK AG ZENTRALE FRANKFURT REISESP.09.05.2023/03700093 End-to-End-Ref.: NOTPROVIDED Kundenreferenz: 0003461317',
          { type: 'expense', amount: -150 },
        ),
      ).toBe('Salary')
      expect(categorize('Reisespesen Abrechnung')).toBe('Salary')
      expect(categorize('Reisekostenvergütung Geschäftsreise')).toBe('Salary')
      expect(categorize('Spesenabrechnung Mai')).toBe('Salary')
      expect(
        categorize(
          'Commerzbank AG Rücküberweisung von Karte Nr.   5232 2XXXXXX07296   Anel Memic Card-ID:  5520009001872996 End-to-End-Ref.: null Kundenreferenz: a9d752972a1043a18e7805b6647ed5fa',
        ),
      ).toBe('Salary')
      expect(
        categorize(
          'Commerzbank AG Rücküberweisung von Karte Nr.   5232 2XXXXXX07296   Anel Memic Card-ID:  5520009001872996 End-to-End-Ref.: null Kundenreferenz: a9d752972a1043a18e7805b6647ed5fa',
          { type: 'expense', amount: -150 },
        ),
      ).toBe('Salary')
      expect(
        categorize(
          'Commerzbank AG Rueckueberweisung von Karte Nr. 5232 2XXXXXX07296 Anel Memic Card-ID: 5520009001872996',
        ),
      ).toBe('Salary')
    })

    it('categorizes dining out descriptions correctly', () => {
      expect(categorize('McDonalds')).toBe('Dining Out')
      expect(categorize('Starbucks')).toBe('Dining Out')
      expect(
        categorize(
          'Okka Turkish Bakery, Frankfurt am DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Ca'
        )
      ).toBe('Dining Out')
      expect(
        categorize(
          'Baeckerei Moos Bad Homburg DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card Baeckerei Moos'
        )
      ).toBe('Dining Out')
      expect(
        categorize(
          'MAXI RESTORAN DESETKA  ORASJE BA Karte Nr. 5355 3100 0931 8380 Virtual Debit Card MAXI RESTORAN DESETKA    ORASJE    BIH 2024-08-05T15:41:57 Kartenzahlung Original 29,00BAM 1EUR=1,9458000BAM Entgelt Auslandseinsatz 0,22EUR'
        )
      ).toBe('Dining Out')
      expect(
        categorize(
          'MAXI RESTORAN DESETKA  ORASJE BA Karte Nr. 5355 3100 0931 8380 Virtual Debit Card MAXI RESTORAN DESETKA    ORASJE    BIH 2024-08-05T15:41:57 Kartenzahlung Original 29,00BAM 1EUR=1,9458000BAM Entgelt Auslandseinsatz 0,22EUR',
          { amount: -14.9, type: 'expense' }
        )
      ).toBe('Dining Out')
    })

    it('categorizes transport descriptions correctly', () => {
      expect(categorize('Uber')).toBe('Transport')
      expect(categorize('Uber BV')).toBe('Transport')
      expect(categorize('UBER * TRIP 1234 HELP.UBER.COM')).toBe('Transport')
      expect(
        categorize(
          'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1052983422516 . PAYPAL-ZAHLUNG UBE R LASTSCHRIFT an mc'
        )
      ).toBe('Transport')
      expect(
        categorize(
          'PayPal Europe S.a.r.l. et Cie S.C.A 1052983422516/PP.4585.PP/. Uber BV, Ihr Einkauf bei Uber'
        )
      ).toBe('Transport')
      expect(categorize('Uber trip')).toBe('Transport')
      expect(categorize('bolt receipt')).toBe('Transport')
      expect(categorize('HVV Ticket Hamburg')).toBe('Transport')
      expect(categorize('VRR Ticket Düsseldorf')).toBe('Transport')
      expect(categorize('VVS Mobil Stuttgart')).toBe('Transport')
      expect(categorize('VRS Ticket Köln')).toBe('Transport')
      expect(categorize('ÖBB Nightjet Wien')).toBe('Transport')
      expect(categorize('SBB Fahrkarte Zürich')).toBe('Transport')
      expect(categorize('TIER Scooter Fahrt')).toBe('Transport')
      expect(
        categorize(
          'Mercedes-Benz AG DEUTDEFFXXX DE20500700100092001700 Bitte geben Sie bei Bezahlung Ihre'
        )
      ).toBe('Transport')
      expect(categorize('BMW Bank Leasingrate')).toBe('Transport')
      expect(categorize('Volkswagen Leasing GmbH')).toBe('Transport')
      expect(categorize('Audi Zentrum Berlin')).toBe('Transport')
      expect(categorize('Porsche Zentrum Stuttgart')).toBe('Transport')
    })

    it('categorizes travel descriptions correctly', () => {
      expect(categorize('Hotel booking reservation')).toBe('Travel')
      expect(categorize('Lufthansa flight ticket')).toBe('Travel')
      expect(categorize('Airbnb stay')).toBe('Travel')
      expect(
        categorize(
          'holidays.ch GmbH Ihre Reisebuchung/Eurowings Holiday s/0022241300/41122589/20230818Anel Mem'
        )
      ).toBe('Travel')
    })

    it('categorizes communication and internet descriptions correctly', () => {
      expect(categorize('Vodafone bill')).toBe('Communication')
      expect(categorize('Telekom internet flat')).toBe('Communication')
      expect(categorize('O2 mobile data')).toBe('Communication')
      expect(categorize('Internet pretplata')).toBe('Communication')
      expect(categorize('freenet Funk mobile')).toBe('Communication')
      expect(categorize('congstar Mobilfunk')).toBe('Communication')
      expect(categorize('ALDI TALK Aufladung')).toBe('Communication')
    })

    it('categorizes SumUp card payments at retail merchants as Shopping', () => {
      expect(
        categorize(
          'SumUp .Metzgerei Enk/Louisenstrass 2024-10-26T12:41:33 KFN 0 VJ 2412 Kartenzahlung'
        )
      ).toBe('Shopping')
      expect(categorize('Kartenzahlung Metzgerei Schmidt')).toBe('Shopping')
    })

    it('categorizes Tchibo retail transactions as Shopping', () => {
      expect(
        categorize(
          'TCHIBO GMBH DRESDEFF200 DE14200800000816170700 20319230661010 End-to-End-Ref.: MOB.'
        )
      ).toBe('Shopping')
      expect(categorize('Tchibo Filiale Hamburg')).toBe('Shopping')
      expect(categorize('Tchibo.de Online Shop')).toBe('Shopping')
    })

    it('categorizes C&A retail transactions as Shopping', () => {
      expect(
        categorize(
          'CA//Sulzbach/DE 2022-05-05T13:28:17 KFN 0  VJ 2412 Kartenzahlung'
        )
      ).toBe('Shopping')
      expect(categorize('C&A Mode Filiale Frankfurt')).toBe('Shopping')
      expect(categorize('C&A Online Shop')).toBe('Shopping')
    })

    it('categorizes Dell retail and hardware transactions as Shopping (not ordinary Transfers)', () => {
      expect(
        categorize(
          'Dell GmbH CITIDEFFXXX DE33502109000209865076 40308324 End-to-End-Ref.: CCB.147.UE.361421'
        )
      ).toBe('Shopping')
      expect(
        categorize(
          'GERMANY rel CITIDEFFXXX DE11502109000209865084 40233251 End-to-End-Ref.: CCB.119.UE.569708'
        )
      ).toBe('Shopping')
      expect(categorize('Dell Technologies Online Store')).toBe('Shopping')
      expect(categorize('Dell.com Hardware Purchase')).toBe('Shopping')
    })

    it('categorizes tech hardware and electronics brands as Shopping', () => {
      expect(categorize('Acer Computer Store')).toBe('Shopping')
      expect(categorize('HP Store Online Purchase')).toBe('Shopping')
      expect(categorize('Logitech G Official Store')).toBe('Shopping')
      expect(categorize('Razer Store Europe')).toBe('Shopping')
      expect(categorize('Sony Electronics Direct')).toBe('Shopping')
    })

    it('categorizes INTRA-TEC building supplies and hardware transactions as Shopping', () => {
      expect(
        categorize(
          'INTRA-TEC GmbH COKSDE33XXX DE32370502990312020901 Order 589490 End-to-End-Ref.: CCB.',
        ),
      ).toBe('Shopping')
      expect(categorize('INTRA-TEC Online Shop')).toBe('Shopping')
      expect(categorize('Schrauben-Hammer.de')).toBe('Shopping')
    })

    it('categorizes cadooz shopping transactions as Shopping', () => {
      expect(
        categorize(
          'cadooz GmbH DEUTDEHHXXX DE30200700000070730703 230503-663021 End-to-End-Ref.: CCB.123',
        ),
      ).toBe('Shopping')
      expect(categorize('cadooz rewards Gutschein')).toBe('Shopping')
      expect(categorize('BestChoice Gutschein cadooz')).toBe('Shopping')
    })

    it('categorizes Lothar Braun door installations and carpentry transactions as Shopping', () => {
      expect(
        categorize('Lothar Braun GmbH PBNKDEFFXXX DE82500100600255577603 Rechnung'),
      ).toBe('Shopping')
      expect(categorize('Schreinerei Lothar Braun')).toBe('Shopping')
      expect(categorize('Schreinerei Braun Türeneinbau')).toBe('Shopping')
    })

    it('categorizes Commerzbank Rueckverguetung fee refund transaction as Bank Fees with type income', () => {
      const desc =
        'Commerzbank AG Rueckverguetung fuer 2024/KDNR: 400 6462931/PERSNR: 6832901 End-to-End-Ref.: 2024-1-0035357 Kundenreferenz: 2024-1'
      expect(categorize(desc, { type: 'income', amount: 25 })).toBe('Bank Fees')
      expect(categorize(desc)).toBe('Bank Fees')
      expect(categorize('Rückvergütung von Entgelten')).toBe('Bank Fees')
      expect(categorize('Gebührenerstattung')).toBe('Bank Fees')
    })

    it('categorizes FA Nidda tax return transactions as Taxes', () => {
      expect(
        categorize(
          'FA NIDDA ERSTATT.00345234717 EST-VERANL. 21 End-to-End-Ref.: 00345234717 EST-VEG0404202',
        ),
      ).toBe('Taxes')
      expect(categorize('FA Nidda Einkommensteuer')).toBe('Taxes')
      expect(categorize('Finanzamt Nidda Erstattung')).toBe('Taxes')
      expect(categorize('FA Frankfurt am Main Steuererstattung')).toBe('Taxes')
    })

    it('categorizes fair parken and parking transactions as Transport', () => {
      expect(
        categorize(
          'FAIR PARKEN GMBH WELADED1KSD DE19301502000002120590 AKTENZEICHEN: 30362484 End-to-'
        )
      ).toBe('Transport')
      expect(categorize('fair parken Parkplatz')).toBe('Transport')
      expect(categorize('Parkhaus Hauptbahnhof Parkgebühr')).toBe('Transport')
      expect(categorize('EasyPark Parking Fee')).toBe('Transport')
    })

    it('categorizes wundertax and tax filing platforms as Taxes', () => {
      expect(
        categorize(
          'wundertax GmbH Rueckzahlung Lizenzgebuehr Wunderta x GmbH End-to-End-Ref.: 4306669553-00'
        )
      ).toBe('Taxes')
      expect(categorize('wundertax Steuererklärung 2026')).toBe('Taxes')
      expect(categorize('Taxfix SE Servicegebühr')).toBe('Taxes')
      expect(categorize('smartsteuer GmbH Steuererklärung')).toBe('Taxes')
      expect(categorize('ELSTER Online Steuerübermittlung')).toBe('Taxes')
      expect(categorize('WISO Steuer Buhl Data Service')).toBe('Taxes')
    })

    it('categorizes guardarian and cryptocurrency gateways as Crypto', () => {
      expect(
        categorize(
          'GUARDARIAN OÜ CLJUGB21XXX GB33CLJU04130729903054 6154171893446142 End-to-End-Ref.: CCB'
        )
      ).toBe('Crypto')
      expect(categorize('Guardarian Crypto Purchase')).toBe('Crypto')
      expect(categorize('Coinbase Ireland Limited')).toBe('Crypto')
      expect(categorize('Binance Card Payment')).toBe('Crypto')
      expect(categorize('Kraken Payward Ireland')).toBe('Crypto')
      expect(categorize('Bitpanda GmbH')).toBe('Crypto')
    })

    it('categorizes Süwag electricity and utility transactions as Utilities (not Transfers)', () => {
      const suewagRaw =
        'Süwag COBADEFFXXX DE69500400000257744300 Kunden-Nr.: 263614738 Rechnungsnr:'
      expect(categorize(suewagRaw)).toBe('Utilities')
      expect(categorize('Süwag Energie AG Strom')).toBe('Utilities')
      expect(categorize('E.ON Energie Deutschland')).toBe('Utilities')
      expect(categorize('Vattenfall Europe Stromrechnung')).toBe('Utilities')
    })

    it('categorizes Heroku cloud hosting and platform transactions as Utilities', () => {
      expect(categorize('HEROKU* JUL-106945945')).toBe('Utilities')
      expect(categorize('Heroku Cloud Hosting')).toBe('Utilities')
      expect(categorize('Heroku Dynos Subscription')).toBe('Utilities')
      expect(categorize('Heroku Inc')).toBe('Utilities')
    })

    it('categorizes major cloud and hosting platforms (AWS, DigitalOcean, Hetzner, Cloudflare, Vercel, IONOS, Netcup, OVHcloud) as Utilities', () => {
      expect(categorize('AWS EMEA SARL')).toBe('Utilities')
      expect(categorize('Amazon Web Services Cloud')).toBe('Utilities')
      expect(categorize('DigitalOcean LLC')).toBe('Utilities')
      expect(categorize('Hetzner Online GmbH')).toBe('Utilities')
      expect(categorize('Cloudflare Inc')).toBe('Utilities')
      expect(categorize('Vercel Inc')).toBe('Utilities')
      expect(categorize('IONOS SE Webhosting')).toBe('Utilities')
      expect(categorize('netcup GmbH vServer')).toBe('Utilities')
      expect(categorize('OVH SAS Cloud')).toBe('Utilities')
    })

    it('categorizes Tomorrow bank transactions as Transfers', () => {
      const desc =
        'ANEL MEMIC - TOMORROW SOBKDEBBXXX DE58110101002097425357 FÜR DIE ZUKUNFT End-to-End-'
      expect(categorize(desc)).toBe('Transfers')
      expect(categorize('Tomorrow Bank Überweisung')).toBe('Transfers')
    })

    it('categorizes Revolut and Revolt bank transactions as Transfers', () => {
      const desc =
        'Anel Memic REVOLT21XXX LT153250000292115687 End-to-End-Ref.: MOB.147.UE.32306'
      expect(categorize(desc)).toBe('Transfers')
      expect(categorize('Revolut Bank Überweisung')).toBe('Transfers')
      expect(categorize('Revolt Money Transfer')).toBe('Transfers')
    })

    it('categorizes PAYBACK and Paymorrow transactions as Shopping', () => {
      const desc =
        'PAYBACK PAY / PAYMORROW WELADEDDXXX DE85300500000071013312 PAYBACK PAY End-to-En'
      expect(categorize(desc)).toBe('Shopping')
      expect(categorize('PAYBACK PAY Rewe')).toBe('Shopping')
      expect(categorize('PAYBACK GmbH Punkte')).toBe('Shopping')
      expect(categorize('Paymorrow Rechnung')).toBe('Shopping')
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

    it('cleans SumUp card terminal transactions, ISO timestamps, and terminal codes', () => {
      const desc =
        'SumUp .Metzgerei Enk/Louisenstrass 2024-10-26T12:41:33 KFN 0 VJ 2412 Kartenzahlung'
      expect(extractCleanDescription(desc)).toBe('SumUp .Metzgerei Enk Louisenstrass')
      expect(extractMerchantKeyword(desc)).toBe('Metzgerei Enk Louisenstrass')
    })

    it('cleans Süwag utility transaction stripping customer ref, IBAN, and BIC', () => {
      const desc =
        'Süwag COBADEFFXXX DE69500400000257744300 Kunden-Nr.: 263614738 Rechnungsnr:'
      expect(extractCleanDescription(desc)).toBe('Süwag')
      expect(extractMerchantKeyword(desc)).toBe('Süwag')
    })

    it('cleans Tchibo retail transaction stripping corporate form, IBAN, BIC, and reference', () => {
      const desc =
        'TCHIBO GMBH DRESDEFF200 DE14200800000816170700 20319230661010 End-to-End-Ref.: MOB.'
      expect(extractCleanDescription(desc)).toBe('TCHIBO GMBH')
      expect(extractMerchantKeyword(desc)).toBe('TCHIBO')
    })

    it('cleans Mercedes-Benz transaction stripping BIC, IBAN, and German remittance instructions', () => {
      const desc =
        'Mercedes-Benz AG DEUTDEFFXXX DE20500700100092001700 Bitte geben Sie bei Bezahlung Ihre '
      expect(extractCleanDescription(desc)).toBe('Mercedes-Benz AG')
      expect(extractMerchantKeyword(desc)).toBe('Mercedes-Benz')
    })

    it('cleans Tomorrow bank transaction stripping BIC, IBAN, and End-to-End reference prefix', () => {
      const desc =
        'ANEL MEMIC - TOMORROW SOBKDEBBXXX DE58110101002097425357 FÜR DIE ZUKUNFT End-to-End-'
      expect(extractCleanDescription(desc)).toBe('ANEL MEMIC - TOMORROW FÜR DIE ZUKUNFT')
    })

    it('cleans Dell transaction stripping corporate form, BIC, IBAN, and End-to-End reference', () => {
      const desc =
        'Dell GmbH CITIDEFFXXX DE33502109000209865076 40308324 End-to-End-Ref.: CCB.147.UE.361421'
      expect(extractCleanDescription(desc)).toBe('Dell GmbH')
      expect(extractMerchantKeyword(desc)).toBe('Dell')

      const truncatedDesc =
        'GERMANY rel CITIDEFFXXX DE11502109000209865084 40233251 End-to-End-Ref.: CCB.119.UE.569708'
      expect(extractCleanDescription(truncatedDesc)).toBe('Dell Germany')
      expect(extractMerchantKeyword(truncatedDesc)).toBe('Dell')
    })

    it('cleans Commerzbank Reisespesen business trip reimbursement transaction', () => {
      const desc =
        'COMMERZBANK AG ZENTRALE FRANKFURT REISESP.09.05.2023/03700093 End-to-End-Ref.: NOTPROVIDED Kundenreferenz: 0003461317'
      expect(extractCleanDescription(desc)).toBe('COMMERZBANK AG ZENTRALE FRANKFURT Reisespesen')
      expect(extractMerchantKeyword(desc)).toBe('COMMERZBANK ZENTRALE')
    })

    it('cleans Commerzbank Rueckverguetung fee refund transaction', () => {
      const desc =
        'Commerzbank AG Rueckverguetung fuer 2024/KDNR: 400 6462931/PERSNR: 6832901 End-to-End-Ref.: 2024-1-0035357 Kundenreferenz: 2024-1'
      expect(extractCleanDescription(desc)).toBe('Commerzbank AG Rueckverguetung fuer 2024')
      expect(extractMerchantKeyword(desc)).toBe('Commerzbank')
    })

    it('cleans Commerzbank Rueckueberweisung card reversal transaction and extracts Commerzbank keyword', () => {
      const desc =
        'Commerzbank AG Rücküberweisung von Karte Nr.   5232 2XXXXXX07296   Anel Memic Card-ID:  5520009001872996 End-to-End-Ref.: null Kundenreferenz: a9d752972a1043a18e7805b6647ed5fa'
      expect(extractCleanDescription(desc)).toBe('Commerzbank AG Rücküberweisung')
      expect(extractMerchantKeyword(desc)).toBe('Commerzbank')
    })

    it('cleans fair parken transaction stripping BIC, IBAN, Aktenzeichen, and End-to- reference', () => {
      const desc =
        'FAIR PARKEN GMBH WELADED1KSD DE19301502000002120590 AKTENZEICHEN: 30362484 End-to-'
      expect(extractCleanDescription(desc)).toBe('FAIR PARKEN GMBH')
      expect(extractMerchantKeyword(desc)).toBe('FAIR PARKEN')
    })

    it('cleans wundertax transaction repairing broken words and extracting merchant keyword', () => {
      const desc =
        'wundertax GmbH Rueckzahlung Lizenzgebuehr Wunderta x GmbH End-to-End-Ref.: 4306669553-00'
      expect(extractCleanDescription(desc)).toBe(
        'wundertax GmbH Rueckzahlung Lizenzgebuehr Wundertax GmbH'
      )
      expect(extractMerchantKeyword(desc)).toBe('wundertax')
    })

    it('cleans Guardarian crypto transaction stripping BIC, IBAN, and card reference numbers', () => {
      const desc =
        'GUARDARIAN OÜ CLJUGB21XXX GB33CLJU04130729903054 6154171893446142 End-to-End-Ref.: CCB'
      expect(extractCleanDescription(desc)).toBe('GUARDARIAN OÜ')
      expect(extractMerchantKeyword(desc)).toBe('GUARDARIAN')
    })

    it('cleans Stadtverwaltung Bad Homburg municipal transfer stripping BIC, IBAN, and numeric references', () => {
      const desc =
        'Stadtverwaltung Bad Homburg HELADEF1TSK DE81512500000001085662 0181776005 End-to-End-Ref.'
      expect(extractCleanDescription(desc)).toBe('Stadtverwaltung Bad Homburg')
      expect(extractMerchantKeyword(desc)).toBe('Stadtverwaltung Bad Homburg')
    })

    it('cleans Gemeinde Schmitten municipal transfer stripping BIC, IBAN, and numeric references', () => {
      const desc =
        'Gemeinde Schmitten HELADEF1TSK DE58512500000059004000 0561196907 End-to-End-Ref.: CCB.'
      expect(extractCleanDescription(desc)).toBe('Gemeinde Schmitten')
      expect(extractMerchantKeyword(desc)).toBe('Gemeinde Schmitten')
    })

    it('cleans Stadtkasse Kelkheim municipal transfer stripping BIC, IBAN, and AZ reference', () => {
      const desc =
        'STADTKASSE KELKHEIM (TAUNUS) HELADEF1TSK DE34512500000005211530 AZ: 40004836'
      expect(extractCleanDescription(desc)).toBe('STADTKASSE KELKHEIM TAUNUS')
      expect(extractMerchantKeyword(desc)).toBe('STADTKASSE KELKHEIM TAUNUS')
    })

    it('cleans PayPal corporate prefix and extracts Booking.com merchant keyword', () => {
      const desc =
        'PayPal (Europe) S.a r.l. et Cie, S. C.A. . Booking.com BV, Ihr Einkauf bei B ooking.com BV ABBUCHUNG'
      expect(extractMerchantKeyword(desc)).toBe('Booking.com')
      expect(categorize(desc)).toBe('Travel')
    })

    it('cleans klarmobil telecom transaction stripping customer number, greeting, invoice number, and amounts', () => {
      const desc =
        'klarmobil GmbH Kd.1059561719 Wir sagen Danke. RG-N r.F25035684584 15,99 EUR End-to-End-Ref.'
      expect(extractCleanDescription(desc)).toBe('klarmobil GmbH')
      expect(extractMerchantKeyword(desc)).toBe('klarmobil')
      expect(categorize(desc)).toBe('Communication')
    })

    it('cleans Heroku card hosting transactions stripping billing reference and categorizes as Utilities', () => {
      const desc = 'HEROKU* JUL-106945945'
      expect(extractCleanDescription(desc)).toBe('HEROKU')
      expect(extractMerchantKeyword(desc)).toBe('HEROKU')
      expect(categorize(desc)).toBe('Utilities')
    })

    it('cleans freenet, congstar, and ALDI TALK transaction descriptions', () => {
      expect(extractCleanDescription('freenet DLS GmbH')).toBe('freenet DLS GmbH')
      expect(extractMerchantKeyword('freenet DLS GmbH')).toBe('freenet DLS')
      expect(extractCleanDescription('congstar GmbH')).toBe('congstar GmbH')
      expect(extractMerchantKeyword('congstar GmbH')).toBe('congstar')
      expect(extractCleanDescription('MEDIONmobile ALDI TALK')).toBe('MEDIONmobile ALDI TALK')
    })

    it('cleans tenancy Kautionsabrechnung rental transaction stripping GbR and memo noise', () => {
      const desc =
        'Heinz Otto, Annette, Alexander u. C hrista Christoph GbR Kautionsabrechnung Eschborn / An de r Grue'
      expect(extractCleanDescription(desc)).toBe(
        'Heinz Otto Annette Alexander u. Christa Christoph GbR Kautionsabrechnung Eschborn An der Grue',
      )
      expect(extractMerchantKeyword(desc)).toBe(
        'Heinz Otto Annette Alexander u. Christa Christoph',
      )
    })

    it('cleans Gerichtkasse court fee transaction description and extracts merchant', () => {
      const desc =
        'Gerichtkasse HELADEFFXXX DE73500500000001006030 X046833902021X End-to-End-Ref.: CCB.'
      expect(extractCleanDescription(desc)).toBe('Gerichtkasse')
      expect(extractMerchantKeyword(desc)).toBe('Gerichtkasse')
    })

    it('cleans Färber und Hutzel notary transaction description and extracts merchant', () => {
      const desc =
        'Färber und Hutzel HELADEF1TSK DE29512500000001058274 01571/21 End-to-End-Ref.: CCB.269.UE.'
      expect(extractCleanDescription(desc)).toBe('Färber und Hutzel')
      expect(extractMerchantKeyword(desc)).toBe('Färber und Hutzel')
    })

    it('cleans INTRA-TEC retail transaction description and extracts merchant', () => {
      const desc =
        'INTRA-TEC GmbH COKSDE33XXX DE32370502990312020901 Order 589490 End-to-End-Ref.: CCB.'
      expect(extractCleanDescription(desc)).toBe('INTRA-TEC GmbH')
      expect(extractMerchantKeyword(desc)).toBe('INTRA-TEC')
    })

    it('cleans FA Nidda tax return transaction description and extracts merchant', () => {
      const desc =
        'FA NIDDA ERSTATT.00345234717 EST-VERANL. 21 End-to-End-Ref.: 00345234717 EST-VEG0404202'
      expect(extractCleanDescription(desc)).toBe('Finanzamt Nidda Erstattung EST-Veranlagung 21')
      expect(extractMerchantKeyword(desc)).toBe('Finanzamt Nidda')
    })

    it('cleans cadooz retail transaction description and extracts merchant', () => {
      const desc =
        'cadooz GmbH DEUTDEHHXXX DE30200700000070730703 230503-663021 End-to-End-Ref.: CCB.123'
      expect(extractCleanDescription(desc)).toBe('cadooz GmbH')
      expect(extractMerchantKeyword(desc)).toBe('cadooz')
    })

    it('cleans Lothar Braun door installations transaction description and extracts merchant', () => {
      const desc =
        'Lothar Braun GmbH PBNKDEFFXXX DE82500100600255577603 Rechnung'
      expect(extractCleanDescription(desc)).toBe('Lothar Braun GmbH')
      expect(extractMerchantKeyword(desc)).toBe('Lothar Braun')
    })

    it('cleans Revolut transfer transaction description and extracts recipient', () => {
      const desc =
        'Anel Memic REVOLT21XXX LT153250000292115687 End-to-End-Ref.: MOB.147.UE.32306'
      expect(extractCleanDescription(desc)).toBe('Anel Memic')
      expect(extractMerchantKeyword(desc)).toBe('Anel Memic')
    })

    it('accurately cleans and extracts core merchant from PayPal intermediary transactions and direct account debits', () => {
      // 1. eToro (Europe) Limited via yPal
      const etoroTx =
        'yPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . Etoro (Europe) Limited , Ihr Einkauf bei Etoro (Euro'
      expect(isPaymentProcessorIntermediary(etoroTx)).toBe(true)
      expect(extractMerchantKeyword(etoroTx)).toBe('Etoro')

      // 2. Xsolla HK Limited
      const xsollaTx =
        'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . Xsolla HK Limited, Ihr Einkauf bei Xsolla HK Limite'
      expect(isPaymentProcessorIntermediary(xsollaTx)).toBe(true)
      expect(extractMerchantKeyword(xsollaTx)).toBe('Xsolla')

      // 3. Avaaz Foundation
      const avaazTx =
        'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . Avaaz Foundation, Ihr Einkauf bei Avaaz Foundatio'
      expect(isPaymentProcessorIntermediary(avaazTx)).toBe(true)
      expect(extractMerchantKeyword(avaazTx)).toBe('Avaaz')

      // 4. Direct PayPal account debit (ABBUCHUNG VOM PAYPAL-KO NTO)
      const paypalDebitTx =
        'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP ABBUCHUNG VOM PAYPAL-KO NTO End-to-End-Ref'
      expect(isPaymentProcessorIntermediary(paypalDebitTx)).toBe(false)
      expect(extractMerchantKeyword(paypalDebitTx)).toBe('PayPal')

      // 5. Kalea GmbH
      const kaleaTx =
        'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . Kalea GmbH, Ihr Einkau f bei Kalea GmbH End-to-E'
      expect(isPaymentProcessorIntermediary(kaleaTx)).toBe(true)
      expect(extractMerchantKeyword(kaleaTx)).toBe('Kalea')

      // 6. Cyberport GmbH
      const cyberportTx =
        'PayPal Europe S.a.r.l. et Cie S.C.A 1026469639646 . Cyberport GmbH, Ih r Einkauf bei Cyberport GmbH'
      expect(isPaymentProcessorIntermediary(cyberportTx)).toBe(true)
      expect(extractMerchantKeyword(cyberportTx)).toBe('Cyberport')

      // 7. Unknown online merchant via PayPal
      const unknownShopTx =
        'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . UnknownShop123, Ihr Einkauf bei UnknownShop123'
      expect(isPaymentProcessorIntermediary(unknownShopTx)).toBe(true)
      expect(extractMerchantKeyword(unknownShopTx)).toBe('UnknownShop123')
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
        expect(
          categorize(
            'ALDI SE U. CO. KG//ESCHBORN/DE 2022-04-08T12:48:20 KFN 0  VJ 2412 Kartenzahlung'
          )
        ).toBe('Groceries')
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
        expect(
          categorize(
            'BILJANA JOSIC Tax End-to-End-Ref.: CCB.321.UE.328580 Kundenreferenz: CCB.321.UE.328580',
          ),
        ).toBe('Transfers')
        expect(
          categorize(
            'BILJANA JOSIC End-to-End-Ref.: CCB.321.UE.328580 Kundenreferenz: CCB.321.UE.328580',
          ),
        ).toBe('Transfers')
        expect(
          categorize(
            'BILJANA MEMIC COBADEHD001 DE49200411330781112800 End-to-End-Ref.: MOB.210.EE.POS00026333 Kundenreferenz: 0bfc47b3f3b04db2a3c8afbfc142e184',
          ),
        ).toBe('Transfers')
        expect(
          categorize(
            'BILJANA MEMIC DE49200411330781112800 End-to-End-Ref.: MOB.210.EE.POS00026333',
          ),
        ).toBe('Transfers')
        expect(
          categorize(
            'ANEL MEMIC COBADEHD001 DE12345678901234567890 End-to-End-Ref.: MOB.123.EE.POS00012345',
          ),
        ).toBe('Transfers')
        expect(
          categorize(
            'Anel Memic Money back End-to-End-Ref.: 20250627-YVZ9IU-OP Kundenreferenz: SI25062724092194',
          ),
        ).toBe('Transfers')
        expect(
          categorize(
            'Anel Memic End-to-End-Ref.: 20250627-YVZ9IU-OP Kundenreferenz: SI25062724092194',
          ),
        ).toBe('Transfers')
        expect(
          categorize('Anel Memic Money back Kundenreferenz: SI25062724092194'),
        ).toBe('Transfers')
        expect(categorize('Anel Memic Money back')).toBe('Transfers')
        expect(categorize('Anel Memic Geld zurück')).toBe('Transfers')
        expect(categorize('CD-SCT-20260401-12345 Max Mustermann')).toBe('Transfers')
        expect(categorize('SEPA-Überweisung an Max Mustermann')).toBe('Transfers')

        // Joint account / family transfers
        expect(categorize('Anel o. Biljana Memic')).toBe('Transfers')
        expect(categorize('ANEL O. BILJANA MEMIC')).toBe('Transfers')
        expect(categorize('Anel oder Biljana Memic')).toBe('Transfers')
        expect(categorize('Biljana o. Anel Memic')).toBe('Transfers')
        expect(categorize('Anel / Biljana Memic')).toBe('Transfers')
        expect(categorize('Anel & Biljana Memic')).toBe('Transfers')
        expect(categorize('Anel Memic o. Biljana Memic')).toBe('Transfers')
        expect(
          categorize('Finanzamt Frankfurt am Main End-to-End-Ref.: CCB.321.UE.998877'),
        ).toBe('Taxes')
        expect(categorize('Einkommensteuer Vorauszahlung CCB.321.UE.112233')).toBe('Taxes')

        // Edukativni Centar Rani Razvoj foreign payment
        expect(
          categorize(
            'ZAHLUNG IN DAS AUSLAND UNS. REF:  AZNA3191009197 00 IHRE REF:  NONREF RS35200354683010198808 AUFTRAGGEBER LT. AUFTRAG: ANEL MEMIC BANK DES BEGUENSTIGTEN: BEGUENSTIGTER: EDUKATIVNI CENTAR RANI RAZVOJ CRKVENA 70G 11400 MLADENOVAC RS RS35200354683010198808 ZAHLUNGSGRUND: ARTUR MEMIC',
          ),
        ).toBe('Education')
        expect(categorize('Edukativni centar radionica za decu')).toBe('Education')
        expect(categorize('Edukativni program')).toBe('Education')
        expect(categorize('Rani razvoj dece')).toBe('Education')
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
        expect(
          categorize(
            'PayPal (Europe) S.a r.l. et Cie, S. C.A. . Booking.com BV, Ihr Einkauf bei B ooking.com BV ABBUCHUNG',
          ),
        ).toBe('Travel')

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
        expect(repairBrokenWords('Kautions abrechnung')).toBe('Kautionsabrechnung')
        expect(repairBrokenWords('Mietkautions abrechnung')).toBe('Mietkautionsabrechnung')
        expect(repairBrokenWords('C hrista Christoph')).toBe('Christa Christoph')
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
      it('categorizes Aeguron and AeguronRisikoLV bank bookings as Insurance', () => {
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

    describe('municipal and civic payments categorization', () => {
      it('categorizes municipal administration payments as Taxes', () => {
        expect(
          categorize(
            'Stadtverwaltung Bad Homburg HELADEF1TSK DE81512500000001085662 0181776005 End-to-End-Ref.',
          ),
        ).toBe('Taxes')
        expect(categorize('Stadtverwaltung Bad Homburg')).toBe('Taxes')
      })

      it('categorizes Gemeinde Schmitten municipal payments as Taxes', () => {
        expect(
          categorize(
            'Gemeinde Schmitten HELADEF1TSK DE58512500000059004000 0561196907 End-to-End-Ref.: CCB.',
          ),
        ).toBe('Taxes')
        expect(categorize('Gemeinde Schmitten')).toBe('Taxes')
        expect(categorize('Gemeindeverwaltung Schmitten')).toBe('Taxes')
      })

      it('categorizes Stadtkasse Kelkheim municipal payments as Taxes', () => {
        expect(
          categorize(
            'STADTKASSE KELKHEIM (TAUNUS) HELADEF1TSK DE34512500000005211530 AZ: 40004836',
          ),
        ).toBe('Taxes')
        expect(categorize('Stadtkasse Kelkheim')).toBe('Taxes')
        expect(categorize('Stadt Kelkheim')).toBe('Taxes')
        expect(categorize('Stadt Kelkheim (Taunus)')).toBe('Taxes')
      })

      it('categorizes generic municipal treasuries and levies as Taxes, even via SEPA transfer', () => {
        expect(categorize('Stadtkasse Frankfurt am Main Grundbesitzabgaben')).toBe('Taxes')
        expect(categorize('Gemeindekasse Glashütten Hundesteuer 2026')).toBe('Taxes')
        expect(categorize('Abfallgebühren 1. Quartal')).toBe('Taxes')
        expect(categorize('Stadtkasse Oberursel End-to-End-Ref.: CCB.321.UE.998877')).toBe('Taxes')
      })

      it('does not categorize shops located in municipal towns as Taxes', () => {
        expect(categorize('REWE Markt Kelkheim')).not.toBe('Taxes')
        expect(categorize('EDEKA Schmitten im Taunus')).not.toBe('Taxes')
        expect(categorize('Kaufland Bad Homburg vor der Höhe')).not.toBe('Taxes')
      })

      it('categorizes municipal childcare fees as Education instead of Taxes', () => {
        expect(
          categorize(
            'Stadt Bad Homburg v.d.H. 506582 KINDERTAGESSTAETTENBEITRAG End-to-End-Ref.: DTA-22-00801',
          ),
        ).toBe('Education')
        expect(categorize('Stadtkasse Kelkheim Kita-Gebühr März')).toBe('Education')
        expect(categorize('Gemeinde Schmitten Hortbeitrag')).toBe('Education')
        expect(categorize('Gemeindekasse Glashütten Krippenbeitrag')).toBe('Education')
        expect(categorize('Stadt Bad Homburg Grundsteuer')).toBe('Taxes')
      })

      it('categorizes Hochtaunuskreis school care and childcare transactions as Education', () => {
        expect(
          categorize(
            'Hochtaunuskreis Betreuung fuer Memic, Artur End-to-End-Ref.: 9600074123 Mandatsref',
          ),
        ).toBe('Education')
        expect(categorize('Schulkindbetreuung Hochtaunuskreis')).toBe('Education')
        expect(categorize('Betreuung Grundschule')).toBe('Education')
        expect(categorize('Kindergartenbeitrag')).toBe('Education')
        expect(categorize('Kita Gebühren')).toBe('Education')
        expect(categorize('University tuition fee')).toBe('Education')
      })
    })

    describe('grid operators, auto clubs, furniture stores and sports clubs', () => {
      it('categorizes Syna grid operator and sibling grid operators as Utilities', () => {
        expect(
          categorize(
            'Syna GmbH KUNDENNUMMER 483029022 End-to-End-Ref.: Beleg: 312004778285 Mandatsref: 0085',
          ),
        ).toBe('Utilities')
        expect(categorize('Westnetz GmbH Netzentgelt')).toBe('Utilities')
        expect(categorize('NRM Netzdienste Rhein-Main GmbH')).toBe('Utilities')
        expect(categorize('Synaptics Treiber Download')).not.toBe('Utilities')
      })

      it('categorizes ADAC membership and other automobile clubs as Transport', () => {
        expect(
          categorize(
            'Allg.Deutscher Automobil-Club ADAC e.V. ADAC E.V. MEMIC ANEL MEMIC BILJANA BEITRAG: 01.01.22-',
          ),
        ).toBe('Transport')
        expect(categorize('ACE Auto Club Europa e.V. Mitgliedsbeitrag')).toBe('Transport')
        expect(categorize('AvD Automobilclub von Deutschland Beitrag')).toBe('Transport')
      })

      it('categorizes POCO and other furniture stores as Shopping', () => {
        expect(
          categorize(
            'POCO Einrichtungsmarkte GmbH ELV54203406 19.02 13.01 ME0 End-to-End-Ref.: T0220219542034',
          ),
        ).toBe('Shopping')
        expect(categorize('XXXLutz KG Wiesbaden')).toBe('Shopping')
        expect(categorize('moemax Frankfurt')).toBe('Shopping')
        expect(categorize('Möbel Höffner Eschborn')).toBe('Shopping')
        expect(categorize('Daenisches Bettenlager GmbH')).toBe('Shopping')
        expect(categorize('Möbelhaus Schmidt')).toBe('Shopping')
      })

      it('categorizes the Stones GmbH card payment as Shopping', () => {
        expect(
          categorize(
            'STONES GMBH 260410190023798241253413150 ELV6534 1315 26.04 10.19 ME0 End-to-End-Ref.: 26',
          ),
        ).toBe('Shopping')
      })

      it('categorizes Turnverein Dornholzhausen and other sports clubs as Healthcare', () => {
        expect(
          categorize(
            'Turnverein Dornholzhausen 1918 e.V. Sammelbuchung TV Dornholzhausen/Ts. 1918 e.V., Memic Anel',
          ),
        ).toBe('Healthcare')
        expect(categorize('TSV Sportverein Oberursel Beitrag')).toBe('Healthcare')
      })
    })

    describe('rent and tenancy deposit categorization', () => {
      it('categorizes Kautionsabrechnung and rental deposit settlements as Rent', () => {
        expect(
          categorize(
            'Heinz Otto, Annette, Alexander u. C hrista Christoph GbR Kautionsabrechnung Eschborn / An de r Grue',
          ),
        ).toBe('Rent')
        expect(categorize('Kautionsabrechnung Eschborn')).toBe('Rent')
        expect(categorize('Mietkautionsabrechnung')).toBe('Rent')
        expect(categorize('Mietkautionsrückzahlung')).toBe('Rent')
        expect(categorize('Kaution Mietwohnung')).toBe('Rent')
        expect(categorize('Tenancy deposit refund')).toBe('Rent')
        expect(categorize('Rozliczenie kaucji mieszkaniowej')).toBe('Rent')
        expect(categorize('Povrat depozita za stan')).toBe('Rent')
      })
    })

    describe('judicial treasury and property acquisition tax categorization', () => {
      it('categorizes Gerichtskasse / Gerichtkasse court and apartment registry fee transfers as Taxes', () => {
        expect(
          categorize(
            'Gerichtkasse HELADEFFXXX DE73500500000001006030 X046833902021X End-to-End-Ref.: CCB.',
          ),
        ).toBe('Taxes')
        expect(categorize('Gerichtskasse Frankfurt am Main')).toBe('Taxes')
        expect(categorize('Justizkasse Hessen')).toBe('Taxes')
        expect(categorize('Zentrale Gerichtskasse Grunderwerbsteuer')).toBe('Taxes')
        expect(categorize('Grundbuchamt Eigentumsumschreibung')).toBe('Taxes')
      })

      it('categorizes Färber und Hutzel notary fee transactions as Taxes', () => {
        expect(
          categorize(
            'Färber und Hutzel HELADEF1TSK DE29512500000001058274 01571/21 End-to-End-Ref.: CCB.269.UE.',
          ),
        ).toBe('Taxes')
        expect(categorize('Notariat Dr. Hutzel Bad Homburg')).toBe('Taxes')
        expect(categorize('Notarkosten Kaufvertrag Eigentumswohnung')).toBe('Taxes')
        expect(categorize('Notargebühren Grundschuldbestellung')).toBe('Taxes')
      })
    })

    describe('bank, transfer, and investment platform categorization', () => {
      it('categorizes Revolut, Sparkasse, 1822direkt, HVB, Santander, Norisbank, GLS, and apoBank as Transfers', () => {
        expect(
          categorize(
            'Anel Memic REVOLT21XXX LT153250000292115687 End-to-End-Ref.: MOB.147.UE.32306',
          ),
        ).toBe('Transfers')
        expect(categorize('Sparkasse KölnBonn Überweisung')).toBe('Transfers')
        expect(categorize('1822direkt Frankfurter Sparkasse')).toBe('Transfers')
        expect(categorize('HypoVereinsbank UniCredit Bank AG')).toBe('Transfers')
        expect(categorize('Santander Consumer Bank AG')).toBe('Transfers')
        expect(categorize('norisbank GmbH')).toBe('Transfers')
        expect(categorize('GLS Gemeinschaftsbank')).toBe('Transfers')
        expect(categorize('apoBank Apotheker- und Ärztebank')).toBe('Transfers')
        expect(categorize('Vivid Money GmbH')).toBe('Transfers')
      })

      it('categorizes flatex and DEGIRO as Savings', () => {
        expect(categorize('flatex Bank Depot')).toBe('Savings')
        expect(categorize('DEGIRO B.V. Transaktion')).toBe('Savings')
      })
    })

    describe('insurers, travel portals, hostels, registry offices, identity services, and consulates', () => {
      it('categorizes Die Haftpflichtkasse and other German insurers as Insurance', () => {
        expect(
          categorize(
            'Die Haftpflichtkasse VVaG 60603542 / Unfall Beitrag 23.01.25 - meine-hk.de - Jetzt anmelden und Re',
          ),
        ).toBe('Insurance')
        expect(categorize('Haftpflichtkasse Darmstadt Beitrag')).toBe('Insurance')
        expect(categorize('Debeka Versicherung a.G.')).toBe('Insurance')
        expect(categorize('ERGO Versicherung AG')).toBe('Insurance')
        expect(categorize('AXA Konzern AG Beitrag')).toBe('Insurance')
        expect(
          categorize(
            'AXA Versicherung Aktiengesellschaft Kfz-Versicherung 88331191217 MTK-BA  117 BTR. 04/22 89,52 EUR End-to-End-Ref.: 580024561334/0001 Mandatsref: 21054199212 Gläubiger-ID: DE23G0100000066097 SEPA-BASISLASTSCHRIFT wiederholend',
          ),
        ).toBe('Insurance')
        expect(categorize('AXA Kfz-Versicherung')).toBe('Insurance')
        expect(categorize('Kfz-Versicherung Beitrag')).toBe('Insurance')
        expect(categorize('Generali Deutschland Versicherung')).toBe('Insurance')
        expect(categorize('R+V Allgemeine Versicherung AG')).toBe('Insurance')
        expect(categorize('Signal Iduna Gruppe')).toBe('Insurance')
        expect(categorize('HanseMerkur Versicherung')).toBe('Insurance')
        expect(categorize('Barmenia Versicherung')).toBe('Insurance')
        expect(categorize('Gothaer Allgemeine Versicherung')).toBe('Insurance')
        expect(categorize('ARAG SE Rechtsschutz')).toBe('Insurance')
        expect(categorize('DEVK Versicherungen')).toBe('Insurance')
        expect(categorize('HDI Versicherung AG')).toBe('Insurance')
        expect(categorize('VHV Versicherungen')).toBe('Insurance')
        expect(categorize('CosmosDirekt Versicherung')).toBe('Insurance')

        // CHECK24 Gutscheinauszahlung / Cashback with vehicle/general insurance context
        expect(
          categorize(
            'CHECK24 CHECK24 Gutscheinauszahlung - Antra g 1444-2533-2410-18 - fuer Ihre neu e KFZ Versicherung End-to-End-Ref.: 22233743- 4451322143 Kundenreferenz: a62a9c9cd0f048cb80de71590f93fac6c70',
          ),
        ).toBe('Insurance')
        expect(categorize('CHECK24 KFZ-Versicherung Gutschein')).toBe('Insurance')
        expect(categorize('CHECK24 Kfz Versicherung Auszahlung')).toBe('Insurance')
        expect(categorize('CHECK24 Haftpflichtversicherung Cashback')).toBe('Insurance')

        // CHECK24 Auszahlung Guthaben / Reise booking context
        expect(
          categorize(
            'CHECK24 CHECK24 Auszahlung Guthaben - Exago n Park, Mallorca, 17.08.2023 - 24.0 8.2023, Buchungsnr. 2896131 - fuer Ihre Reise End-to-End-Ref.: 24734301- 4t2byobilb1gjrjm Kundenreferenz: f621846439897af9602534c88adb2af87db',
          ),
        ).toBe('Travel')
        expect(categorize('CHECK24 Reise Guthaben')).toBe('Travel')
        expect(categorize('CHECK24 Reisen Auszahlung')).toBe('Travel')
        expect(categorize('CHECK24 Pauschalreise Mallorca')).toBe('Travel')
        expect(categorize('CHECK24 Hotelbuchung')).toBe('Travel')
        expect(categorize('CHECK24 Flugbuchung')).toBe('Travel')
      })

      it('categorizes byebye tour operator and hostels (DJH, a&o, MEININGER) as Travel', () => {
        expect(
          categorize(
            'ByeBye PBNKDEFFXXX DE93440100460095667464 2110630491421 End-to-End-Ref.: CCB.109.UE.P',
          ),
        ).toBe('Travel')
        expect(categorize('BYE.bye GmbH Buchung')).toBe('Travel')
        expect(
          categorize(
            'Deutsches Jugendherbergswerk Hauptv erband e. V. 22,50 Beitrag-25 31492804 End-to-End-Ref.: N',
          ),
        ).toBe('Travel')
        expect(categorize('DJH Jugendherberge Frankfurt')).toBe('Travel')
        expect(categorize('Hostelling International Membership')).toBe('Travel')
        expect(categorize('a&o Hostels Berlin')).toBe('Travel')
        expect(categorize('MEININGER Hotel Frankfurt')).toBe('Travel')
      })

      it('categorizes Standesamt Bad Soden am Taunus and Main-Taunus-Kreis as Taxes', () => {
        expect(
          categorize(
            'Standesamt Bad Soden am Taunus NASSDE55XXX DE84510500150197000325 Internationale Geburts',
          ),
        ).toBe('Taxes')
        expect(categorize('Stadtkasse Bad Soden am Taunus Grundbesitzabgaben')).toBe('Taxes')
        expect(categorize('Main-Taunus-Kreis Kreiskasse Gebühren')).toBe('Taxes')
      })

      it('categorizes AXA Krankenversicherung, Krankenvers., and other health insurance as Healthcare', () => {
        expect(
          categorize(
            'AXA Krankenversicherung Aktiengesel Krankenvers. 493886204X ERSTBTR 10/ 21 9,17 EUR End-to-End-Ref.: 545020471096/0003 Mandatsref: 21054199212 Gläubiger-ID: DE23G0100000066097 SEPA-BASISLASTSCHRIFT wiederholend',
          ),
        ).toBe('Healthcare')
        expect(categorize('AXA Krankenversicherung')).toBe('Healthcare')
        expect(categorize('Krankenvers. 493886204X ERSTBTR 10/ 21')).toBe('Healthcare')
        expect(categorize('Krankenvers Beitrag')).toBe('Healthcare')
        expect(categorize('Debeka Krankenversicherung a.G.')).toBe('Healthcare')
        expect(categorize('Barmenia Krankenversicherung')).toBe('Healthcare')
        expect(
          categorize(
            'Muenchener VEREIN Krankenversicheru ng a. Kundennummer S88063 KV1003 17,46 End-to-End-Ref.',
          ),
        ).toBe('Healthcare')
        expect(categorize('Münchener Verein Krankenversicherung a.G.')).toBe('Healthcare')
        expect(categorize('Techniker Krankenkasse Beitrag')).toBe('Healthcare')
        expect(categorize('Barmer Krankenkasse')).toBe('Healthcare')
        expect(
          categorize(
            'CHECK24 Vergleichsportal für Kranke nversicherungen GmbH CHECK24 Cashback - fuer Ihre Zahnzu satzversicherung: 10338717 End-to-End-Ref.: 235790923429 Kundenreferenz: 617207769488',
          ),
        ).toBe('Healthcare')
      })

      it('categorizes WebID Solutions, IDnow, POSTIDENT, and Verimi as Bank Fees', () => {
        expect(
          categorize(
            'WebID Solutions GmbH HYVEDEMM488 DE22100208900035900527 TWMDO WebID Ident 643-572-',
          ),
        ).toBe('Bank Fees')
        expect(categorize('WebID Ident Legitimation')).toBe('Bank Fees')
        expect(categorize('IDnow GmbH VideoIdent')).toBe('Bank Fees')
        expect(categorize('POSTIDENT Verfahren Deutsche Post')).toBe('Bank Fees')
        expect(categorize('Verimi ID Prüfung')).toBe('Bank Fees')
      })

      it('categorizes Generalkonsulat von Bosnien und Herzegowina as Taxes', () => {
        expect(
          categorize(
            'GENERALKOSULAT VON BOSNIENHERZEGOW. DRESDEFFXXX DE71500800000262721801 Anel Mem',
          ),
        ).toBe('Taxes')
        expect(categorize('Generalkonsulat von Bosnien und Herzegowina Frankfurt')).toBe('Taxes')
        expect(categorize('Konsulat Bosnien Passgebühr')).toBe('Taxes')
        expect(categorize('Botschaft Visagebühr')).toBe('Taxes')
      })

      it('categorizes Swiss Life as Savings (ETF-based retirement insurance) and related providers', () => {
        expect(
          categorize(
            'Swiss Life SE VS 9667224-1/819491326 Beitrag 02/2 026 Ihr Beitrag fur ein selbstbesti mmtes Leben',
          ),
        ).toBe('Savings')
        expect(categorize('Swiss Life SE Beitrag')).toBe('Savings')
        expect(categorize('Swiss Life Select Vorsorge')).toBe('Savings')
        expect(categorize('Canada Life Generation Private')).toBe('Savings')
        expect(categorize('Alte Leipziger Lebensversicherung')).toBe('Savings')
      })

      it('categorizes Aeguron, WGV and related community/term life insurers as Insurance', () => {
        expect(
          categorize(
            'Aeguron Risiko-Lebensversicherung AeguronRisikoLV 02/26 6267061-P End-to-End-Ref.: 89c9c867',
          ),
        ).toBe('Insurance')
        expect(
          categorize(
            'iptiQ Life SA AeguronRisikoLV 04/26 6267061-P End-to-End-Ref.: de3e4c7022094659943152a87c2',
          ),
        ).toBe('Insurance')
        expect(
          categorize(
            'WGV-Wuertt. Gemeinde-Versicherung MTK-BA 117 V90092776488 01.06.2025- 01.07.2025 End-to-E',
          ),
        ).toBe('Insurance')
        expect(categorize('WGV Versicherung AG')).toBe('Insurance')
        expect(categorize('Hannoversche Lebensversicherung Direkt')).toBe('Insurance')
        expect(categorize('Provinzial Versicherung Rheinland')).toBe('Insurance')
        expect(categorize('SV SparkassenVersicherung Gebäude')).toBe('Insurance')
        expect(categorize('BGV Badische Gemeinde-Versicherung')).toBe('Insurance')
        expect(categorize('Versicherungskammer Bayern')).toBe('Insurance')
        expect(categorize('Swiss Re Reinsurance')).toBe('Insurance')
      })

      it('categorizes Austrian regional, fiber broadband, green utilities, and streaming transactions correctly', () => {
        // 1. GVG Glasfaser -> Communication
        expect(
          categorize(
            'GVG Glasfaser GmbH RG.23565869/KD.10250177 End-to-End-Ref.: 00000023565869102501774490',
          ),
        ).toBe('Communication')
        expect(categorize('GVG Glasfaser GmbH')).toBe('Communication')
        expect(categorize('teranet broadband glasfaser')).toBe('Communication')

        // 2. Grünwelt Wärmestrom -> Utilities
        expect(
          categorize(
            'Grünwelt Wärmestrom GmbH ABSCHLAG Strom 08/26 VK: 1210005133 32 Gruenwelt Waermestrom',
          ),
        ).toBe('Utilities')
        expect(categorize('Gruenwelt Energie Strom')).toBe('Utilities')

        // 3. Disney+ under PayPal -> Entertainment
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1052099636248/PP.4585.PP/. DisneyPl us, Ihr Einkauf bei DisneyPl',
          ),
        ).toBe('Entertainment')
        expect(categorize('Disney+ Abo Monatsbeitrag')).toBe('Entertainment')

        // 4. Café Restaurant Mosshammer Zell am See -> Dining Out
        expect(
          categorize(
            'CAFE RESTAURANT MOSS, ZELL AM SEE AT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual DB',
          ),
        ).toBe('Dining Out')
        expect(categorize('Café Mosshammer Zell am See')).toBe('Dining Out')

        // 5. BILLA supermarket Zell am See -> Groceries
        expect(
          categorize(
            'BILLA DANKT 0005128, ZELL AM SEE A T Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debi',
          ),
        ).toBe('Groceries')
        expect(categorize('BILLA PLUS Supermarkt')).toBe('Groceries')

        // 6. Salzburger Jugendherbergen (Junge Hotels) -> Travel
        expect(
          categorize(
            'Salzburger Jugendherbe, Zell am See AT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit',
          ),
        ).toBe('Travel')
        expect(categorize('Junge Hotels Salzburg Übernachtung')).toBe('Travel')
        expect(categorize('ÖJHW Jugendherberge Zell am See')).toBe('Travel')

        // 7. Alpe-Panon (McDonald's Slovenia) -> Dining Out
        expect(
          categorize(
            'ALPE PANON PE PTUJ, PTUJ SI Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card 20',
          ),
        ).toBe('Dining Out')
        expect(categorize('Alpe-Panon McDonald\'s Slovenia')).toBe('Dining Out')

        // 8. Hallenbad & Freizeitzentrum Zell am See -> Entertainment
        expect(
          categorize(
            'HALLENBAD ZELL AM SEE, ZELL SEE AT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit',
          ),
        ).toBe('Entertainment')
        expect(categorize('Freizeitzentrum Zell am See Eintritt')).toBe('Entertainment')
      })

      it('correctly categorizes batch 10 real-world transaction statements', () => {
        // 1. Janitos Versicherung AG -> Insurance
        expect(
          categorize(
            'Janitos Versicherung AG Vertrags-Nr. 6100113945 HR 15.10.20 25-15.10.2026 End-to-End-Ref.: 17602',
          ),
        ).toBe('Insurance')
        expect(categorize('Janitos Versicherung AG')).toBe('Insurance')

        // 2. Raststätte Spessart Nord (Serways / Tank & Rast) -> Dining Out
        expect(
          categorize(
            'Raststaette Spessart N, Rohrbrunn DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit C',
          ),
        ).toBe('Dining Out')
        expect(categorize('Raststätte Spessart Nord Autobahn')).toBe('Dining Out')
        expect(categorize('Serways Raststätte')).toBe('Dining Out')

        // 3. toom Baumarkt Oberursel -> Shopping
        expect(
          categorize(
            'toom BM Oberursel, OBERURSEL DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Car',
          ),
        ).toBe('Shopping')
        expect(categorize('toom Baumarkt Baustoffe')).toBe('Shopping')

        // 4. SPAR Supermarket Cabanas de Tavira -> Groceries
        expect(
          categorize(
            'SPAR CABANAS TAVIRA 1, CABANAS TAVI R PT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtu',
          ),
        ).toBe('Groceries')
        expect(categorize('SPAR Supermarket Cabanas')).toBe('Groceries')

        // 5. Argumento da Lua, Lda (Algarve Boutique) -> Shopping
        expect(
          categorize(
            'ARGUMENTO DA LUA,LDA, FARO PT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card',
          ),
        ).toBe('Shopping')
        expect(categorize('Argumento da Lua Lda Faro')).toBe('Shopping')

        // 6. Delhi's Belly Indian Restaurant -> Dining Out
        expect(
          categorize(
            'DELHIS BELLY, UNIPES, FARO PT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card 25 ',
          ),
        ).toBe('Dining Out')
        expect(categorize("Delhi's Belly Indian Restaurant")).toBe('Dining Out')

        // 7. Sites Cabanas SA (Golden Club Cabanas Resort) -> Travel
        expect(
          categorize(
            'SITES CABANAS SA, FARO PT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card 20',
          ),
        ).toBe('Travel')
        expect(categorize('Golden Club Cabanas Resort Faro')).toBe('Travel')

        // 8. Pizza Hut Store #822 Eschborn -> Dining Out
        expect(
          categorize(
            'PH 822 ESCHBORN DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card PH 822 ESCHBORN DEU 20',
          ),
        ).toBe('Dining Out')
        expect(categorize('Pizza Hut Eschborn')).toBe('Dining Out')
      })

      it('correctly categorizes batch 11 real-world transaction statements', () => {
        // 1. rhenag (Rheinische Elektrizitäts- und Gasversorgungsgesellschaft) -> Utilities
        expect(
          categorize(
            'Rheinische Elektrizitäts- und Gasve rsorgungsgesellscha Vertragsnummer 21810010775 1089385- 108',
          ),
        ).toBe('Utilities')
        expect(categorize('rhenag Gasversorgung')).toBe('Utilities')

        // 2. Rats-Apotheke -> Healthcare
        expect(
          categorize(
            'RATS APOTHEKE sagt Danke GIR 799135 2022-03-12T09:28:55 KFN 0 VJ 2412 Kartenzahlung',
          ),
        ).toBe('Healthcare')
        expect(categorize('Rats-Apotheke Medikamente')).toBe('Healthcare')

        // 3. Thong Thai Thai Restaurant -> Dining Out
        expect(
          categorize(
            'Thong Thai GmbH Co. KG/Rödelheimer 2022-03-26T13:28:44 KFN 0 VJ 2412 Kartenzahlung',
          ),
        ).toBe('Dining Out')
        expect(categorize('Thong Thai Restaurant')).toBe('Dining Out')

        // 4. Reifen-Diehl Eschborn -> Transport
        expect(
          categorize(
            'REIFEN-DIEHL.ESCHBORN//Eschborn/DE 2022-04-30T12:41:00 KFN 0 VJ 2412 Kartenzahlung',
          ),
        ).toBe('Transport')
        expect(categorize('Reifen Diehl Reifenwechsel')).toBe('Transport')

        // 5. STONES Baustoffe -> Shopping
        expect(
          categorize(
            'STONES GMBH 120510420024424241253413150 ELV6534 1315 12.05 10.42 ME0 End-to-End-Ref.: 12',
          ),
        ).toBe('Shopping')
        expect(categorize('STONES Baustoffe Store')).toBe('Shopping')

        // 6. Liebig-Apotheke Bad Homburg -> Healthcare
        expect(
          categorize(
            'LIEBIG-APOTHEKE//BAD HOMBURG/DE 2022-05-24T10:32:50 KFN 0 VJ 2412 Kartenzahlung',
          ),
        ).toBe('Healthcare')
        expect(categorize('Liebig Apotheke Bad Homburg')).toBe('Healthcare')

        // 7. BabyOne Baby- & Kinderausstattung -> Shopping
        expect(
          categorize(
            'BabyOne B+K Nr.45 GmbH Fil 015 GIR 2022-07-08T12:50:27 KFN 0 VJ 2412 Kartenzahlung',
          ),
        ).toBe('Shopping')
        expect(categorize('BabyOne Kinderwagen')).toBe('Shopping')

        // 8. Anadolu Supermarkt -> Groceries
        expect(
          categorize(
            'ANADOLU SUPERMARKT GIR 69287732//BA 2022-07-09T12:24:08 KFN 0 VJ 2412 Kartenzahlung',
          ),
        ).toBe('Groceries')
        expect(categorize('Anadolu Supermarkt Lebensmittel')).toBe('Groceries')

        // 9. ebase (European Bank for Financial Services) -> Savings
        expect(
          categorize(
            'European Bank for Financial Service s GmbH 9914335757302 Kauf 0,074908 Ant am 06.09.2022 zu 3',
          ),
        ).toBe('Savings')
        expect(categorize('ebase Fondsdepot Kauf')).toBe('Savings')

        // 10. MyShoes SE -> Shopping
        expect(
          categorize(
            'MyShoes SE//Friedrichsdorf/DE 2022-09-03T13:20:44 KFN 0 VJ 2412 Kartenzahlung',
          ),
        ).toBe('Shopping')
        expect(categorize('MyShoes Schuhe')).toBe('Shopping')

        // 11. TEDi Filiale -> Shopping
        expect(
          categorize(
            'TEDi Fil. 4912//Bad Homburg/DE 2022-11-08T16:06:57 KFN 0 VJ 2412 Kartenzahlung',
          ),
        ).toBe('Shopping')
        expect(categorize('TEDi Haushaltswaren')).toBe('Shopping')

        // 12. Kontoführung Commerzbank -> Bank Fees
        expect(
          categorize(
            'Kontoführung Konto 646293100 EUR BLZ 500 400 00 vom 01.02.2023 bis 28.02.2023 Kontoführung',
          ),
        ).toBe('Bank Fees')

        // 13. Commerzbank SEPA transfer (BIC COBADEFFXXX) -> Transfers
        expect(
          categorize(
            'ANEL MEMIC COBADEFFXXX DE13500400000931368501 5232249017507296 End-to-End-Ref.: MO',
          ),
        ).toBe('Transfers')

        // 14. KMK Immobilienverwaltung / WEG Landwehrweg -> Rent
        expect(
          categorize(
            'WEG Landwehrweg 1, 61350 z. Hd. KMK   Immobilienverw. GmbH 556.101701 Memic Biljana Lastschrif t 12/2024 End-to-End-Ref.: 556/101701 Mandatsref: cc8047803f024820a564798436fd3d31 Gläubiger-ID: DE13ZZZ00000579310 SEPA-BASISLASTSCHRIFT wiederholend',
          ),
        ).toBe('Rent')
        expect(categorize('KMK Immobilienverwaltung Hausgeld')).toBe('Rent')
        expect(
          categorize(
            'WEG Landwehrweg 1, 61350 Bad Hombur g Monatliches Hausgeld Landwehrweg End-to-End-Ref.: NOTPROVIDED Mandatsref: LANDWEHRCC25 Gläubiger-ID: DE85ZZZ00002471357 SEPA-BASISLASTSCHRIFT wiederholend',
          ),
        ).toBe('Rent')

        // 15. FNZ Bank AG (ehemals ebase AG) -> Savings
        expect(
          categorize(
            'FNZ Bank AG (ehemals ebase AG) 9914335757302 Kauf 0,077528 Ant am 05.10.2023 zu 322,465500',
          ),
        ).toBe('Savings')
        expect(categorize('FNZ Bank Wertpapierdepot')).toBe('Savings')

        // 16. Ratsstube Restaurant Rothenburg -> Dining Out
        expect(
          categorize(
            'Ratsstube Restaurant Rothenburg ob DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card Ratsstube R',
          ),
        ).toBe('Dining Out')
        expect(categorize('Ratsstube Rothenburg')).toBe('Dining Out')

        // 17. sander Hotel Koblenz -> Travel
        expect(
          categorize(
            'sander Hotel Koblenz DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card sander Hotel Koblenz DEU 2',
          ),
        ).toBe('Travel')
        expect(categorize('sander Hotel Übernachtung')).toBe('Travel')

        // 18. Smoothie Bar Antalya -> Dining Out
        expect(
          categorize(
            'SMOOTHIE BAR ANTALYA TR Karte Nr. 5355 3100 0931 8380 Virtual Debit Card SMOOTHIE BAR ANTI',
          ),
        ).toBe('Dining Out')
        expect(categorize('Smoothie Bar Antalya')).toBe('Dining Out')

        // 19. ICTUR Antalya Airport Dining -> Dining Out
        expect(
          categorize(
            'ICTUR YIYECEK VE ICECE ANTALYA TR Karte Nr. 5355 3100 0931 8380 Virtual Debit Card ICTUR YIYE',
          ),
        ).toBe('Dining Out')
        expect(categorize('ICTUR Yiyecek ve İçecek')).toBe('Dining Out')

        // 20. Hrvatske autoceste (HAC A3 Velika Kopanica) -> Transport
        expect(
          categorize(
            'AUTOCESTA A3 V.KOPANIC VELIKA KOPA N HR Karte Nr. 5355 3100 0931 8380 Virtual Debit Card AU',
          ),
        ).toBe('Transport')
        expect(categorize('Hrvatske autoceste Maut')).toBe('Transport')

        // 21. Wasserpalast Graz-Liebenau -> Dining Out
        expect(
          categorize(
            'WASSERPALAST GRAZ-LIEBENAU AT Karte Nr. 5355 3100 0931 8380 Virtual Debit Card WASSERPAL',
          ),
        ).toBe('Dining Out')
        expect(categorize('Wasserpalast Graz')).toBe('Dining Out')

        // Batch 12:
        // 1. mobilezone GmbH / HIGH mobile -> Communication
        expect(
          categorize(
            'mobilezone GmbH 3243033328 End-to-End-Ref.: 0077110000ZV2612446Z Mandatsref: HIGH-16540',
          ),
        ).toBe('Communication')
        expect(categorize('mobilezone GmbH HIGH mobile')).toBe('Communication')

        // 2. Kontoführung Commerzbank -> Bank Fees
        expect(
          categorize(
            'Kontoführung Konto 646293100 EUR BLZ 500 400 00 vom 01.06.2026 bis 30.06.2026 Kontoführung',
          ),
        ).toBe('Bank Fees')

        // 3. Stadtkasse Bad Nauheim -> Taxes
        expect(
          categorize(
            'STADTKASSE BAD NAUHEIM PBNKDEFFXXX DE34440100460141202460 0298350131 End-to-End-R',
          ),
        ).toBe('Taxes')
        expect(categorize('Stadtkasse Bad Nauheim Grundsteuer')).toBe('Taxes')

        // 4. Kronberg Talstation Jakobsbad CH -> Entertainment
        expect(
          categorize(
            'Kronberg Talstation, Jakobsbad CH Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card',
          ),
        ).toBe('Entertainment')
        expect(categorize('Erlebniswelt Kronberg Talstation')).toBe('Entertainment')

        // 5. SEA LIFE Konstanz GmbH -> Entertainment
        expect(
          categorize(
            'SEA LIFE Konstanz GmbH, Hamburg DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit',
          ),
        ).toBe('Entertainment')
        expect(categorize('SEA LIFE Konstanz')).toBe('Entertainment')

        // 6. Hotel Neckarlux Heidelberg -> Travel
        expect(
          categorize(
            'HOTEL NECKARLUX INH. CUENE//HEIDELB 2026-04-18T15:59:01 KFN 0 VJ 2812 Kartenzahlung',
          ),
        ).toBe('Travel')
        expect(categorize('Hotel Neckarlux Heidelberg')).toBe('Travel')

        // 7. authentic play GmbH -> Shopping
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1048027847722/PP.4585.PP/. authenti c play GmbH, Ihr Einkauf bei',
          ),
        ).toBe('Shopping')
        expect(categorize('authentic play Spielwaren')).toBe('Shopping')

        // 8. Chidoba Mexican Grill -> Dining Out
        expect(
          categorize(
            'Chidoba Mexican Grill, Sulzbach DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Car',
          ),
        ).toBe('Dining Out')
        expect(categorize('Chidoba Mexican Grill MTZ')).toBe('Dining Out')

        // 9. Store 3798 Bad Homburg -> Dining Out
        expect(
          categorize(
            '3798 Bad Homburg von d, Bad Homburg v DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual',
          ),
        ).toBe('Dining Out')

        // 10. CPC Parkhaus Nürnberg -> Transport
        expect(
          categorize(
            'CPC Parkhaus Nuernberg, Nuernberg DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debi',
          ),
        ).toBe('Transport')
        expect(categorize('CPC Parkhaus Nürnberg Contipark')).toBe('Transport')

        // 11. FAO Eating Point Faro Airport -> Dining Out
        expect(
          categorize(
            'FAO EATING POINT, FARO PT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card 2025',
          ),
        ).toBe('Dining Out')
        expect(categorize('FAO Eating Point Faro')).toBe('Dining Out')

        // 12. DJH Jugendherberge Nürnberg Kaiserburg -> Travel
        expect(
          categorize(
            'Jugendherberge Nuernbe, Nuernberg DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit',
          ),
        ).toBe('Travel')
        expect(categorize('DJH Jugendherberge Nürnberg')).toBe('Travel')

        // 13. Volkshochschule Bad Homburg -> Education
        expect(
          categorize(
            'VOLKSHOCHSCHULE//BAD HOMBURG/DE 2024-11-19T09:28:16 KFN 0 VJ 2412 Kartenzahlung',
          ),
        ).toBe('Education')
        expect(categorize('Volkshochschule Bad Homburg Kurs')).toBe('Education')

        // 14. Rasthaus Göttingen Ost Rosdorf -> Dining Out
        expect(
          categorize(
            'Rasthaus Goettingen Os Rosdorf DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card Rasthaus Goetti',
          ),
        ).toBe('Dining Out')
        expect(categorize('Rasthaus Göttingen Ost')).toBe('Dining Out')

        // 15. Burger King Rosdorf (BK 31590 SOT Rosdorf) -> Dining Out
        expect(
          categorize(
            'BK 31590 SOT ROSDORF DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card BK 31590 SOT ROSDO',
          ),
        ).toBe('Dining Out')
        expect(categorize('Burger King Rosdorf')).toBe('Dining Out')

        // 16. Wiener Feinbäckerei Heberer -> Dining Out
        expect(
          categorize(
            'WIENER FEINBACKEREI 1 Muhlheim am M DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card WIENE',
          ),
        ).toBe('Dining Out')
        expect(categorize('Wiener Feinbäckerei Heberer')).toBe('Dining Out')

        // 17. Köschinger Forst Ost Hepberg -> Dining Out
        expect(
          categorize(
            'Koeschinger Forst Ost Hepberg DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card Koeschinger For',
          ),
        ).toBe('Dining Out')
        expect(categorize('Köschinger Forst Ost')).toBe('Dining Out')
      })

      it('categorizes PayPal transactions correctly: assigns underlying merchants for intermediary checkouts and Transfers only for genuine direct debits', () => {
        // 1. eToro (Europe) Limited -> Savings
        expect(
          categorize(
            'yPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . Etoro (Europe) Limited , Ihr Einkauf bei Etoro (Euro',
          ),
        ).toBe('Savings')

        // 2. Xsolla HK Limited -> Entertainment
        expect(
          categorize(
            'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . Xsolla HK Limited, Ihr Einkauf bei Xsolla HK Limite',
          ),
        ).toBe('Entertainment')

        // 3. Avaaz Foundation -> Donations
        expect(
          categorize(
            'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . Avaaz Foundation, Ihr Einkauf bei Avaaz Foundatio',
          ),
        ).toBe('Donations')

        // 3b. Exact statement: Avaaz Foundation donation via PayPal SEPA Direct Debit -> Donations
        expect(
          categorize(
            'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . Avaaz Foundation, Ihr Einkauf bei Avaaz Foundation End-to-End-Ref.: 1016748328387 PP.4585.PP PAYPAL Mandatsref: 58V2224W7NHK6 Gläubiger-ID: LU96ZZZ0000000000000000058 SEPA-BASISLASTSCHRIFT wiederholend',
          ),
        ).toBe('Donations')

        // 4. Direct PayPal account debit (ABBUCHUNG VOM PAYPAL-KO NTO) -> Transfers
        expect(
          categorize(
            'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP ABBUCHUNG VOM PAYPAL-KO NTO End-to-End-Ref',
          ),
        ).toBe('Transfers')

        // 5. Kalea GmbH -> Shopping
        expect(
          categorize(
            'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . Kalea GmbH, Ihr Einkau f bei Kalea GmbH End-to-E',
          ),
        ).toBe('Shopping')

        // 6. Cyberport GmbH -> Shopping
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1026469639646 . Cyberport GmbH, Ih r Einkauf bei Cyberport GmbH',
          ),
        ).toBe('Shopping')

        // 7. Unknown online merchant via PayPal -> Shopping (NOT Transfers!)
        expect(
          categorize(
            'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . UnknownShop123, Ihr Einkauf bei UnknownShop123',
          ),
        ).toBe('Shopping')
      })

      it('categorizes the 25 real European PayPal and debit card transactions accurately', () => {
        // 1. Anonymous PayPal checkout with no merchant name -> falls back to Shopping (NOT Transfers)
        expect(
          categorize(
            'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . , Ihr Einkauf bei End-to-End-Ref.: 1016591806959',
          ),
        ).toBe('Shopping')

        // 2. RDPTS GmbH -> Shopping
        expect(
          categorize(
            'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . RDPTS GmbH, Ihr Einkau f bei RDPTS GmbH End-t',
          ),
        ).toBe('Shopping')

        // 3. DM Bad Homburg -> Shopping
        expect(
          categorize(
            'DM FIL.2146 H:65251//BAD HOMBURG/DE 2022-05-23T10:55:48 KFN 0 VJ 2412 Kartenzahlung',
          ),
        ).toBe('Shopping')

        // 4. DM Eschborn -> Shopping
        expect(
          categorize(
            'DM FIL.1434 H:65371//ESCHBORN/DE 2022-10-05T14:20:43 KFN 0 VJ 2412 Kartenzahlung',
          ),
        ).toBe('Shopping')

        // 5. Thalia Bücher GmbH -> Shopping
        expect(
          categorize(
            'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1025047888741 . Thalia Bucher GmbH , Ihr Einkauf bei Thalia Buc',
          ),
        ).toBe('Shopping')

        // 6. Housses Auto DBS -> Transport
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1026468143168 PP.4585.PP . Housses Auto DBS, Ihr Einkauf bei Hou',
          ),
        ).toBe('Transport')

        // 7. MANOMANO -> Shopping
        expect(
          categorize(
            'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1026451079456 PP.4585.PP . MANOMANO , Ihr Einkauf bei MAN',
          ),
        ).toBe('Shopping')

        // 8. DPD Deutschland GmbH -> Shopping
        expect(
          categorize(
            'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1026474255469 PP.4585.PP . DPD Deut schland GmbH, Ihr Eink',
          ),
        ).toBe('Shopping')

        // 9 & 10. Schiller Onlinehandel GbR -> Shopping
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1029282103452 PP.4585.PP . Schiller Onlinehandel GbR, Ihr Einkauf ',
          ),
        ).toBe('Shopping')

        // 11. Früchte und Feinkost Rothenburg -> Groceries
        expect(
          categorize(
            'Fruechte und Feinkost Rothenburg o b DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card Fruechte u',
          ),
        ).toBe('Groceries')

        // 12. BrotHaus GmbH Rothenburg -> Dining Out
        expect(
          categorize(
            'BROTHAUS GMBH - CO. KG Rothenburg DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card BROTHA',
          ),
        ).toBe('Dining Out')

        // 13. bella me -> Shopping
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1034830377254/PP.4585.PP/. bella me , Ihr Einkauf bei bella me En',
          ),
        ).toBe('Shopping')

        // 14. Tipico Co. Ltd. -> Entertainment
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1035468977249/PP.4585.PP/. Tipico C o. Ltd., Ihr Einkauf bei Tipic',
          ),
        ).toBe('Entertainment')

        // 15. AZM Zaprešić -> Transport
        expect(
          categorize(
            'AZM ZAPRESIC ZAPRESIC HR Karte Nr. 5355 3100 0931 8380 Virtual Debit Card AZM ZAPRESIC ZAPRE',
          ),
        ).toBe('Transport')

        // 16. ASFINAG (Autobahnen und Schnellstraßen-Finanzierungs-AG) -> Transport
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1036302132232/PP.4585.PP/. Autobahn en und Schnellstrasen-Fina',
          ),
        ).toBe('Transport')

        // 17. Škola Studium -> Education
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1038367465824/PP.4585.PP/. Skola St udium, Ihr Einkauf bei Skola S',
          ),
        ).toBe('Education')

        // 18. Deutscher Caritasverband e. V. -> Donations
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1038041208163/PP.4585.PP/. Deutsche r Caritasverband e. V. / Cari',
          ),
        ).toBe('Donations')

        // 19. NAGA Markets Europe Ltd -> Savings
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1040254264400/PP.4585.PP/. NAGA Mar kets Europe Ltd, Ihr Einkau',
          ),
        ).toBe('Savings')

        // 20. Mega-Holz GmbH -> Shopping
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1041226383723/PP.4585.PP/. Mega-Hol z GmbH + Co. KG, Ihr Einka',
          ),
        ).toBe('Shopping')

        // 21. Thalia Buchhandlung Sulzbach -> Shopping
        expect(
          categorize(
            'THALIA BUCHHANDLUNG N Sulzbach DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card THALIA B',
          ),
        ).toBe('Shopping')

        // 22. eXaring AG (waipu.tv) -> Entertainment
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1043655690631/PP.4585.PP/. eXaring AG, Ihr Einkauf bei eXaring AG',
          ),
        ).toBe('Entertainment')

        // 23. ZET Zagreb (MOJ.ZET.HR) -> Transport
        expect(
          categorize(
            'MOJ.ZET.HR, ZAGREB HR Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card 2025-08-0',
          ),
        ).toBe('Transport')

        // 24. Udemy -> Education
        expect(
          categorize(
            'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1045442438693 PP.4585.PP . Udemy, I hr Einkauf bei Udemy End',
          ),
        ).toBe('Education')

        // 25. Transgourmet Eschborn -> Groceries
        expect(
          categorize(
            'TRANSGOURMET DEUTSC//ESCHBORN/DE 2022-07-30T12:53:26 KFN 0 VJ 2412 Kartenzahlung',
          ),
        ).toBe('Groceries')

        // 26. PDF Converter Guru -> Utilities
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1045487095428/PP.4585.PP/. PDF Conv erter Guru, Ihr Einkauf bei ',
          ),
        ).toBe('Utilities')

        // 27. Cerebrum IQ -> Education
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1046113189247/. Cerebrum IQ, Ihr Ei nkauf bei Cerebrum IQ End-to-',
          ),
        ).toBe('Education')

        // 28. Heise Medien -> Entertainment
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1047663016839/PP.4585.PP/. Heise Me dien GmbH + Co. KG, Ihr Ein',
          ),
        ).toBe('Entertainment')

        // 29. Raj Toys -> Shopping
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1048027734591/PP.4585.PP/. Raj Toys s.r.o., Ihr Einkauf bei Raj Toy',
          ),
        ).toBe('Shopping')

        // 30. Fahrerlaubnisbehörde Bad Homburg -> Taxes
        expect(
          categorize(
            'FAHRERLAUBNISBEHOERDE//Bad Homburg 2026-03-27T09:57:32 KFN 0 VJ 2812 Kartenzahlung',
          ),
        ).toBe('Taxes')

        // 31. Kinderplanet GmbH -> Entertainment
        expect(
          categorize(
            'NYA*Kinderplanet GmbH, Berlin DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card 20',
          ),
        ).toBe('Entertainment')

        // 32. VSPO Bern -> Shopping
        expect(
          categorize(
            'VSPO 0FF06d850afAbFc, Bern CH Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card ',
          ),
        ).toBe('Shopping')

        // 33. Stadt Bad Homburg / Rathaus -> Taxes
        expect(
          categorize(
            'KARTENZAHL. STADT BAD HOMBG/Rathaus 2026-06-24T09:14:25 KFN 0 VJ 2812 Kartenzahlung',
          ),
        ).toBe('Taxes')

        // 34. shop portraitnet -> Shopping
        expect(
          categorize(
            'NNT*shop portraitnet o, 490203 3150 95 DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual ',
          ),
        ).toBe('Shopping')

        // 35. dedicom GmbH -> Shopping
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1045440836467/PP.4585.PP/. dedicom GmbH, Ihr Einkauf bei dedic',
          ),
        ).toBe('Shopping')

        // 36. PayPal with omitted merchant name -> Shopping
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1047407084871/PP.4585.PP/. , Ihr Ei nkauf bei End-to-End-Ref.: 10',
          ),
        ).toBe('Shopping')

        // 37. Direct transaction with PayPal itself -> Transfers
        expect(
          categorize(
            'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1049039954031 PP.4585.PP . PayPal ( Europe) S.a r.l. et Cie, SC',
          ),
        ).toBe('Transfers')

        // 38. Uber via PayPal direct debit -> Transport
        expect(
          categorize(
            'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1052983422516 . PAYPAL-ZAHLUNG UBE R LASTSCHRIFT an mc',
          ),
        ).toBe('Transport')

        // 39. home24 SE -> Shopping
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1053020146591/PP.4585.PP/. home24 S E, Ihr Einkauf bei home24',
          ),
        ).toBe('Shopping')

        // 40. SSG BW (Staatliche Schlösser und Gärten Baden-Württemberg) -> Entertainment
        expect(
          categorize(
            'SSG BW sagt Danke, Heidelberg DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card',
          ),
        ).toBe('Entertainment')

        // 41. DARS d.d. (Slovenian Motorway Company) -> Transport
        expect(
          categorize(
            'PayPal Europe S.a.r.l. et Cie S.C.A 1043667601270/PP.4585.PP/. DARS, d. d., Ihr Einkauf bei DARS, d.d.',
          ),
        ).toBe('Transport')
      })

    })
  })
})


