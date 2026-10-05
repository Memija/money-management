import React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { CustomCategory } from '../types'
import { ICON_COLORS } from './category-colors'
import {
  AVAILABLE_ICONS,
  getCategoryIcon,
  getMerchantBrandInfo,
  ICON_GROUPS,
  MERCHANT_LOGOS,
} from './category-icons'

interface IconProps {
  size?: number
  color?: string
}

describe('category-icons', () => {
  describe('AVAILABLE_ICONS and MERCHANT_LOGOS dictionaries', () => {
    it('contains valid React components for all available icons', () => {
      expect(Object.keys(AVAILABLE_ICONS).length).toBeGreaterThan(30)
      for (const [name, Component] of Object.entries(AVAILABLE_ICONS)) {
        expect(Component, `Icon ${name} should be a function or component`).toBeDefined()
        expect(typeof Component === 'function' || typeof Component === 'object').toBe(true)
      }
    })

    it('contains valid React components for all merchant logos', () => {
      expect(Object.keys(MERCHANT_LOGOS).length).toBeGreaterThan(20)
      for (const [name, Component] of Object.entries(MERCHANT_LOGOS)) {
        expect(Component, `Logo ${name} should be a function or component`).toBeDefined()
        expect(typeof Component === 'function' || typeof Component === 'object').toBe(true)
      }
    })

    it('ensures every icon in ICON_GROUPS exists in AVAILABLE_ICONS', () => {
      expect(ICON_GROUPS.length).toBeGreaterThan(0)
      for (const group of ICON_GROUPS) {
        expect(group.name).toBeTruthy()
        expect(group.icons.length).toBeGreaterThan(0)
        for (const iconName of group.icons) {
          expect(
            AVAILABLE_ICONS[iconName],
            `Icon "${iconName}" in group "${group.name}" must exist in AVAILABLE_ICONS`
          ).toBeDefined()
        }
      }
    })
  })

  describe('getCategoryIcon', () => {
    it('returns a valid React element with default size 16', () => {
      const icon = getCategoryIcon('Salary')
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement<IconProps>(icon)) {
        expect(icon.props.size).toBe(16)
        expect(icon.props.color).toBeTruthy()
      }
    })

    it('applies custom size when provided', () => {
      const icon = getCategoryIcon('Salary', 28)
      if (React.isValidElement<IconProps>(icon)) {
        expect(icon.props.size).toBe(28)
      }
    })

    it('matches canonical categories and their translations', () => {
      const testCases = [
        { category: 'Salary', expectedIcon: AVAILABLE_ICONS.Briefcase },
        { category: 'Monthly Income', expectedIcon: AVAILABLE_ICONS.Briefcase },
        { category: 'Gehalt', expectedIcon: AVAILABLE_ICONS.Briefcase },
        { category: 'Plata', expectedIcon: AVAILABLE_ICONS.Briefcase },
        { category: 'Wynagrodzenie', expectedIcon: AVAILABLE_ICONS.Briefcase },
        { category: 'Gaji', expectedIcon: AVAILABLE_ICONS.Briefcase },
        { category: 'Плата', expectedIcon: AVAILABLE_ICONS.Briefcase },
        { category: 'Rent', expectedIcon: AVAILABLE_ICONS.Home },
        { category: 'Mortgage payment', expectedIcon: AVAILABLE_ICONS.Home },
        { category: 'Miete', expectedIcon: AVAILABLE_ICONS.Home },
        { category: 'Kirija', expectedIcon: AVAILABLE_ICONS.Home },
        { category: 'Czynsz', expectedIcon: AVAILABLE_ICONS.Home },
        { category: 'Sewa', expectedIcon: AVAILABLE_ICONS.Home },
        { category: 'Станарина', expectedIcon: AVAILABLE_ICONS.Home },
        { category: 'Groceries', expectedIcon: AVAILABLE_ICONS.ShoppingCart },
        { category: 'Supermarket visit', expectedIcon: AVAILABLE_ICONS.ShoppingCart },
        { category: 'Lebensmittel', expectedIcon: AVAILABLE_ICONS.ShoppingCart },
        { category: 'Namirnice', expectedIcon: AVAILABLE_ICONS.ShoppingCart },
        { category: 'Spożywcze', expectedIcon: AVAILABLE_ICONS.ShoppingCart },
        { category: 'Dining Out', expectedIcon: AVAILABLE_ICONS.Utensils },
        { category: 'Restaurant dinner', expectedIcon: AVAILABLE_ICONS.Utensils },
        { category: 'Food & drinks', expectedIcon: AVAILABLE_ICONS.Utensils },
        { category: 'Essen', expectedIcon: AVAILABLE_ICONS.Utensils },
        { category: 'Restoran', expectedIcon: AVAILABLE_ICONS.Utensils },
        { category: 'Shopping', expectedIcon: AVAILABLE_ICONS.ShoppingBag },
        { category: 'Clothing store', expectedIcon: AVAILABLE_ICONS.ShoppingBag },
        { category: 'Kleidung', expectedIcon: AVAILABLE_ICONS.ShoppingBag },
        { category: 'Kupovina', expectedIcon: AVAILABLE_ICONS.ShoppingBag },
        { category: 'Transport', expectedIcon: AVAILABLE_ICONS.Car },
        { category: 'Fuel station', expectedIcon: AVAILABLE_ICONS.Car },
        { category: 'Auto', expectedIcon: AVAILABLE_ICONS.Car },
        { category: 'Prevoz', expectedIcon: AVAILABLE_ICONS.Car },
        { category: 'Entertainment', expectedIcon: AVAILABLE_ICONS.Film },
        { category: 'Movie theater', expectedIcon: AVAILABLE_ICONS.Film },
        { category: 'Game store', expectedIcon: AVAILABLE_ICONS.Film },
        { category: 'Unterhaltung', expectedIcon: AVAILABLE_ICONS.Film },
        { category: 'Zabava', expectedIcon: AVAILABLE_ICONS.Film },
        { category: 'Insurance', expectedIcon: AVAILABLE_ICONS.Building2 },
        { category: 'Versicherung', expectedIcon: AVAILABLE_ICONS.Building2 },
        { category: 'Osiguranje', expectedIcon: AVAILABLE_ICONS.Building2 },
        { category: 'Taxes', expectedIcon: AVAILABLE_ICONS.Receipt },
        { category: 'Property Tax', expectedIcon: AVAILABLE_ICONS.Receipt },
        { category: 'Steuern', expectedIcon: AVAILABLE_ICONS.Receipt },
        { category: 'Porezi', expectedIcon: AVAILABLE_ICONS.Receipt },
        { category: 'Podatki', expectedIcon: AVAILABLE_ICONS.Receipt },
        { category: 'Pajak', expectedIcon: AVAILABLE_ICONS.Receipt },
        { category: 'Taxes & Fees', expectedIcon: AVAILABLE_ICONS.Receipt },
        { category: 'Steuern & Abgaben', expectedIcon: AVAILABLE_ICONS.Receipt },
        { category: 'Porezi i takse', expectedIcon: AVAILABLE_ICONS.Receipt },
        { category: 'Utilities', expectedIcon: AVAILABLE_ICONS.Zap },
        { category: 'Electricity', expectedIcon: AVAILABLE_ICONS.Zap },
        { category: 'Water bill', expectedIcon: AVAILABLE_ICONS.Zap },
        { category: 'Crypto', expectedIcon: AVAILABLE_ICONS.Coins },
        { category: 'Krypto', expectedIcon: AVAILABLE_ICONS.Coins },
        { category: 'Kripto', expectedIcon: AVAILABLE_ICONS.Coins },
        { category: 'Крипто', expectedIcon: AVAILABLE_ICONS.Coins },
        { category: 'Bank Fees', expectedIcon: AVAILABLE_ICONS.Percent },
        { category: 'Bankgebühren', expectedIcon: AVAILABLE_ICONS.Percent },
        { category: 'Opłaty bankowe', expectedIcon: AVAILABLE_ICONS.Percent },
        { category: 'Bankarske naknade', expectedIcon: AVAILABLE_ICONS.Percent },
        { category: 'Банкарске накнаде', expectedIcon: AVAILABLE_ICONS.Percent },
        { category: 'Biaya Bank', expectedIcon: AVAILABLE_ICONS.Percent },
        { category: 'Strom', expectedIcon: AVAILABLE_ICONS.Zap },
        { category: 'Rezi', expectedIcon: AVAILABLE_ICONS.Zap },
        { category: 'Communication', expectedIcon: AVAILABLE_ICONS.Wifi },
        { category: 'Internet', expectedIcon: AVAILABLE_ICONS.Wifi },
        { category: 'Kommunikation', expectedIcon: AVAILABLE_ICONS.Wifi },
        { category: 'Komunikacja', expectedIcon: AVAILABLE_ICONS.Wifi },
        { category: 'Комуникација', expectedIcon: AVAILABLE_ICONS.Wifi },
        { category: 'Komunikasi', expectedIcon: AVAILABLE_ICONS.Wifi },
        { category: 'Broadband', expectedIcon: AVAILABLE_ICONS.Wifi },
        { category: 'Telefon', expectedIcon: AVAILABLE_ICONS.Wifi },
        { category: 'Healthcare', expectedIcon: AVAILABLE_ICONS.HeartPulse },
        { category: 'Medical checkup', expectedIcon: AVAILABLE_ICONS.HeartPulse },
        { category: 'Pharmacy prescription', expectedIcon: AVAILABLE_ICONS.HeartPulse },
        { category: 'Gesundheit', expectedIcon: AVAILABLE_ICONS.HeartPulse },
        { category: 'Zdravstvo', expectedIcon: AVAILABLE_ICONS.HeartPulse },
        { category: 'Savings', expectedIcon: AVAILABLE_ICONS.PiggyBank },
        { category: 'Investment fund', expectedIcon: AVAILABLE_ICONS.PiggyBank },
        { category: 'Sparen', expectedIcon: AVAILABLE_ICONS.PiggyBank },
        { category: 'Stednja', expectedIcon: AVAILABLE_ICONS.PiggyBank },
        { category: 'Cash', expectedIcon: AVAILABLE_ICONS.Banknote },
        { category: 'Bargeld', expectedIcon: AVAILABLE_ICONS.Banknote },
        { category: 'Gotówka', expectedIcon: AVAILABLE_ICONS.Banknote },
        { category: 'Gotovina', expectedIcon: AVAILABLE_ICONS.Banknote },
        { category: 'Готовина', expectedIcon: AVAILABLE_ICONS.Banknote },
        { category: 'Tarik Tunai', expectedIcon: AVAILABLE_ICONS.Banknote },
        { category: 'Transfers', expectedIcon: AVAILABLE_ICONS.CreditCard },
        { category: 'Bank uberweisung', expectedIcon: AVAILABLE_ICONS.CreditCard },
        { category: 'Prenos novca', expectedIcon: AVAILABLE_ICONS.CreditCard },
        { category: 'Travel', expectedIcon: AVAILABLE_ICONS.Plane },
        { category: 'Flight ticket', expectedIcon: AVAILABLE_ICONS.Plane },
        { category: 'Hotel reservation', expectedIcon: AVAILABLE_ICONS.Plane },
        { category: 'Reisen', expectedIcon: AVAILABLE_ICONS.Plane },
        { category: 'Putovanja', expectedIcon: AVAILABLE_ICONS.Plane },
        { category: 'Podróże', expectedIcon: AVAILABLE_ICONS.Plane },
        { category: 'Perjalanan', expectedIcon: AVAILABLE_ICONS.Plane },
        { category: 'Путовања', expectedIcon: AVAILABLE_ICONS.Plane },
        { category: 'Coffee', expectedIcon: AVAILABLE_ICONS.Coffee },
        { category: 'Cafe latte', expectedIcon: AVAILABLE_ICONS.Coffee },
        { category: 'Kaffee', expectedIcon: AVAILABLE_ICONS.Coffee },
        { category: 'Kafa', expectedIcon: AVAILABLE_ICONS.Coffee },
        { category: 'Kawa', expectedIcon: AVAILABLE_ICONS.Coffee },
        { category: 'Kopi', expectedIcon: AVAILABLE_ICONS.Coffee },
        { category: 'Кафа', expectedIcon: AVAILABLE_ICONS.Coffee },
      ]

      for (const { category, expectedIcon } of testCases) {
        const icon = getCategoryIcon(category)
        if (React.isValidElement(icon)) {
          expect(icon.type, `Category "${category}" should render expected icon`).toBe(expectedIcon)
        }
      }
    }, 30000)

    it('falls back to Package icon for unknown categories', () => {
      const icon = getCategoryIcon('CompletelyUnknownCategory123')
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(AVAILABLE_ICONS.Package)
      }
    })

    it('renders custom category icon and color when matched by ID', () => {
      const customCategories: CustomCategory[] = [
        {
          id: 'custom-hobbies',
          icon: 'Gamepad2',
          translations: { en: 'Hobbies' },
        },
      ]

      const icon = getCategoryIcon('custom-hobbies', 20, customCategories)
      if (React.isValidElement<IconProps>(icon)) {
        expect(icon.type).toBe(AVAILABLE_ICONS.Gamepad2)
        expect(icon.props.size).toBe(20)
        expect(icon.props.color).toBe(ICON_COLORS['Gamepad2'])
      }
    })

    it('falls back to standard matching when custom category has unknown icon', () => {
      const customCategories: CustomCategory[] = [
        {
          id: 'custom-salary',
          icon: 'NonExistentIconName',
          translations: { en: 'Custom Salary' },
        },
      ]

      const icon = getCategoryIcon('custom-salary', 16, customCategories)
      if (React.isValidElement(icon)) {
        // 'custom-salary' contains 'salary' -> Briefcase
        expect(icon.type).toBe(AVAILABLE_ICONS.Briefcase)
      }
    })

    it('matches popular merchant with custom logo from description', () => {
      // Netflix has logo SiNetflix and brandColor #E50914
      const icon = getCategoryIcon('Entertainment', 20, undefined, 'Netflix Subscription')
      if (React.isValidElement<IconProps>(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.SiNetflix)
        expect(icon.props.color).toBe('#E50914')
        expect(icon.props.size).toBe(20)
      }
    })

    it('matches popular merchant with fallback icon when logo is not present', () => {
      // Bingo has no logo property, but has icon 'ShoppingCart' and brandColor '#E30613'
      const icon = getCategoryIcon('Groceries', 18, undefined, 'Supermarket Bingo receipt')
      if (React.isValidElement<IconProps>(icon)) {
        expect(icon.type).toBe(AVAILABLE_ICONS.ShoppingCart)
        expect(icon.props.color).toBe('#E30613')
        expect(icon.props.size).toBe(18)
      }
    })

    it('matches popular merchant case-insensitively', () => {
      const icon = getCategoryIcon('Entertainment', 16, undefined, 'UBER TRIP RECEIPT')
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.SiUber)
      }
    })

    it('matches comdirect via BIC (COBADEHD077), BLZ (20041177), and Junior Depot', () => {
      const txDesc =
        'ARTUR MEMIC COBADEHD077 DE97200411770239797400 JUNIOR DEPOT End-to-End-Ref.: NO'
      const icon = getCategoryIcon('Savings', 20, undefined, txDesc)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.ComdirectLogo)
      }

      const brand = getMerchantBrandInfo(txDesc)
      expect(brand.merchant?.id).toBe('comdirect')
      expect(brand.merchant?.name).toBe('comdirect')
      expect(brand.logoComponent).toBe(MERCHANT_LOGOS.ComdirectLogo)
    })

    it('matches Commerzbank logo for employee canteen Kasinoabrechnung transactions', () => {
      const txDesc =
        'Commerzbank AG Kasinoabrechnung Frankfurt Plaza Ka sino: 16,50 / Cafeteria: - / Sonsti ges: - End-to-'
      const icon = getCategoryIcon('Dining Out', 20, undefined, txDesc)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.SiCommerzbank)
      }

      const brand = getMerchantBrandInfo(txDesc)
      expect(brand.merchant?.id).toBe('commerzbank')
      expect(brand.merchant?.name).toBe('Commerzbank')
      expect(brand.logoComponent).toBe(MERCHANT_LOGOS.SiCommerzbank)
    })

    it('matches RMV logo for Rhein-Main-Verkehrsverbund public transit transactions', () => {
      const txDesc =
        'Rhein-Main-Verkehrsverbund Serviceg esellschaft mbH (rms GmbH) Treuhand RNR 2/2607/1271193'
      const icon = getCategoryIcon('Transport', 20, undefined, txDesc)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.RmvLogo)
      }

      const brand = getMerchantBrandInfo(txDesc)
      expect(brand.merchant?.id).toBe('rmv')
      expect(brand.merchant?.name).toBe('RMV')
      expect(brand.logoComponent).toBe(MERCHANT_LOGOS.RmvLogo)
      expect(brand.brandColor).toBe('#005B9C')
      expect(brand.suggestedCategory).toBe('Transport')
    })

    it('matches BP logo for BP gas station transactions', () => {
      const txDesc =
        'BP Tankstelle, Sattledt AT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card 2026-0'
      const icon = getCategoryIcon('Transport', 20, undefined, txDesc)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.BpLogo)
      }

      const brand = getMerchantBrandInfo(txDesc)
      expect(brand.merchant?.id).toBe('bp')
      expect(brand.merchant?.name).toBe('BP')
      expect(brand.logoComponent).toBe(MERCHANT_LOGOS.BpLogo)
      expect(brand.brandColor).toBe('#007A3D')
      expect(brand.suggestedCategory).toBe('Transport')
    })

    it('matches TUI logo for TUI vacation and travel transactions', () => {
      const txDesc =
        'TUI Deutschland GmbH VG.80319110 03.10.2026-HER End-to-End-Ref.: 000220030170552026 Mand'
      const icon = getCategoryIcon('Travel', 20, undefined, txDesc)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.TuiLogo)
      }

      const brand = getMerchantBrandInfo(txDesc)
      expect(brand.merchant?.id).toBe('tui')
      expect(brand.merchant?.name).toBe('TUI')
      expect(brand.logoComponent).toBe(MERCHANT_LOGOS.TuiLogo)
      expect(brand.suggestedCategory).toBe('Travel')
    })

    it('matches Dell logo and Shopping category for Dell hardware transactions', () => {
      const txDesc =
        'Dell GmbH CITIDEFFXXX DE33502109000209865076 40308324 End-to-End-Ref.: CCB.147.UE.361421'
      const icon = getCategoryIcon('Shopping', 20, undefined, txDesc)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.DellLogo)
      }

      const brand = getMerchantBrandInfo(txDesc)
      expect(brand.merchant?.id).toBe('dell')
      expect(brand.merchant?.name).toBe('Dell')
      expect(brand.logoComponent).toBe(MERCHANT_LOGOS.DellLogo)
      expect(brand.brandColor).toBe('#007DB8')
      expect(brand.suggestedCategory).toBe('Shopping')
    })

    it('matches major tech & electronics logos (Acer, HP, Microsoft, Logitech, Canon, Philips, Sony, Nvidia, Bose)', () => {
      // Acer
      const acerInfo = getMerchantBrandInfo('Acer Computer Store Berlin')
      expect(acerInfo.merchant?.id).toBe('acer')
      expect(acerInfo.logoComponent).toBe(MERCHANT_LOGOS.SiAcer)
      expect(acerInfo.brandColor).toBe('#83B81A')
      expect(acerInfo.suggestedCategory).toBe('Shopping')

      // HP
      const hpInfo = getMerchantBrandInfo('HP Store Online Purchase')
      expect(hpInfo.merchant?.id).toBe('hp')
      expect(hpInfo.logoComponent).toBe(MERCHANT_LOGOS.HpLogo)
      expect(hpInfo.brandColor).toBe('#0096D6')
      expect(hpInfo.suggestedCategory).toBe('Shopping')

      // Microsoft
      const msInfo = getMerchantBrandInfo('Microsoft Store Surface Pro')
      expect(msInfo.merchant?.id).toBe('microsoft')
      expect(msInfo.logoComponent).toBe(MERCHANT_LOGOS.MicrosoftLogo)
      expect(msInfo.brandColor).toBe('#00A4EF')
      expect(msInfo.suggestedCategory).toBe('Shopping')

      // Logitech
      const logiInfo = getMerchantBrandInfo('Logitech G Gaming Mouse')
      expect(logiInfo.merchant?.id).toBe('logitech')
      expect(logiInfo.logoComponent).toBe(MERCHANT_LOGOS.LogitechLogo)
      expect(logiInfo.brandColor).toBe('#00B8FC')
      expect(logiInfo.suggestedCategory).toBe('Shopping')

      // Canon
      const canonInfo = getMerchantBrandInfo('Canon Camera Deutschland')
      expect(canonInfo.merchant?.id).toBe('canon')
      expect(canonInfo.logoComponent).toBe(MERCHANT_LOGOS.CanonLogo)
      expect(canonInfo.brandColor).toBe('#CC0000')
      expect(canonInfo.suggestedCategory).toBe('Shopping')

      // Philips
      const philipsInfo = getMerchantBrandInfo('Philips GmbH Electronics')
      expect(philipsInfo.merchant?.id).toBe('philips')
      expect(philipsInfo.logoComponent).toBe(MERCHANT_LOGOS.PhilipsLogo)
      expect(philipsInfo.brandColor).toBe('#0B5EAA')
      expect(philipsInfo.suggestedCategory).toBe('Shopping')

      // Sony
      const sonyInfo = getMerchantBrandInfo('Sony Electronics Center')
      expect(sonyInfo.merchant?.id).toBe('sony')
      expect(sonyInfo.logoComponent).toBe(MERCHANT_LOGOS.SiSony)
      expect(sonyInfo.brandColor).toBe('#000000')
      expect(sonyInfo.suggestedCategory).toBe('Shopping')

      // NVIDIA
      const nvidiaInfo = getMerchantBrandInfo('NVIDIA GeForce Graphics')
      expect(nvidiaInfo.merchant?.id).toBe('nvidia')
      expect(nvidiaInfo.logoComponent).toBe(MERCHANT_LOGOS.SiNvidia)
      expect(nvidiaInfo.brandColor).toBe('#76B900')
      expect(nvidiaInfo.suggestedCategory).toBe('Shopping')

      // Bose
      const boseInfo = getMerchantBrandInfo('Bose Audio Headphones')
      expect(boseInfo.merchant?.id).toBe('bose')
      expect(boseInfo.logoComponent).toBe(MERCHANT_LOGOS.SiBose)
      expect(boseInfo.brandColor).toBe('#000000')
      expect(boseInfo.suggestedCategory).toBe('Shopping')
    })

    it('matches fair parken and EasyPark logos for parking transactions', () => {
      const fairParkenTx =
        'FAIR PARKEN GMBH WELADED1KSD DE19301502000002120590 AKTENZEICHEN: 30362484 End-to-'
      const fairIcon = getCategoryIcon('Transport', 20, undefined, fairParkenTx)
      expect(React.isValidElement(fairIcon)).toBe(true)
      if (React.isValidElement(fairIcon)) {
        expect(fairIcon.type).toBe(MERCHANT_LOGOS.FairParkenLogo)
      }

      const fairInfo = getMerchantBrandInfo(fairParkenTx)
      expect(fairInfo.merchant?.id).toBe('fair-parken')
      expect(fairInfo.logoComponent).toBe(MERCHANT_LOGOS.FairParkenLogo)
      expect(fairInfo.brandColor).toBe('#002D62')
      expect(fairInfo.suggestedCategory).toBe('Transport')

      const easyParkTx = 'EasyPark Parkgebuehren Hamburg'
      const easyInfo = getMerchantBrandInfo(easyParkTx)
      expect(easyInfo.merchant?.id).toBe('easypark')
      expect(easyInfo.logoComponent).toBe(MERCHANT_LOGOS.EasyParkLogo)
      expect(easyInfo.brandColor).toBe('#E5007D')
      expect(easyInfo.suggestedCategory).toBe('Transport')
    })

    it('matches wundertax and tax software brand logos for tax transactions', () => {
      const wundertaxTx =
        'wundertax GmbH Rueckzahlung Lizenzgebuehr Wunderta x GmbH End-to-End-Ref.: 4306669553-00'
      const wundertaxIcon = getCategoryIcon('Taxes', 20, undefined, wundertaxTx)
      expect(React.isValidElement(wundertaxIcon)).toBe(true)
      if (React.isValidElement(wundertaxIcon)) {
        expect(wundertaxIcon.type).toBe(MERCHANT_LOGOS.WundertaxLogo)
      }

      const wundertaxInfo = getMerchantBrandInfo(wundertaxTx)
      expect(wundertaxInfo.merchant?.id).toBe('wundertax')
      expect(wundertaxInfo.logoComponent).toBe(MERCHANT_LOGOS.WundertaxLogo)
      expect(wundertaxInfo.brandColor).toBe('#00CB9D')
      expect(wundertaxInfo.suggestedCategory).toBe('Taxes')

      const taxfixInfo = getMerchantBrandInfo('Taxfix SE Servicegebühr')
      expect(taxfixInfo.merchant?.id).toBe('taxfix')
      expect(taxfixInfo.logoComponent).toBe(MERCHANT_LOGOS.TaxfixLogo)
      expect(taxfixInfo.brandColor).toBe('#24C875')
      expect(taxfixInfo.suggestedCategory).toBe('Taxes')

      const smartInfo = getMerchantBrandInfo('smartsteuer GmbH')
      expect(smartInfo.merchant?.id).toBe('smartsteuer')
      expect(smartInfo.logoComponent).toBe(MERCHANT_LOGOS.SmartsteuerLogo)
      expect(smartInfo.brandColor).toBe('#FF7900')

      const elsterInfo = getMerchantBrandInfo('ELSTER Online')
      expect(elsterInfo.merchant?.id).toBe('elster')
      expect(elsterInfo.logoComponent).toBe(MERCHANT_LOGOS.ElsterLogo)
      expect(elsterInfo.brandColor).toBe('#003366')

      const wisoInfo = getMerchantBrandInfo('WISO Steuer Buhl Data')
      expect(wisoInfo.merchant?.id).toBe('wiso-steuer')
      expect(wisoInfo.logoComponent).toBe(MERCHANT_LOGOS.WisoSteuerLogo)
      expect(wisoInfo.brandColor).toBe('#003B7E')
    })

    it('matches Guardarian and cryptocurrency brand logos for crypto transactions', () => {
      const guardarianTx =
        'GUARDARIAN OÜ CLJUGB21XXX GB33CLJU04130729903054 6154171893446142 End-to-End-Ref.: CCB'
      const guardarianIcon = getCategoryIcon('Crypto', 20, undefined, guardarianTx)
      expect(React.isValidElement(guardarianIcon)).toBe(true)
      if (React.isValidElement(guardarianIcon)) {
        expect(guardarianIcon.type).toBe(MERCHANT_LOGOS.GuardarianLogo)
      }

      const guardarianInfo = getMerchantBrandInfo(guardarianTx)
      expect(guardarianInfo.merchant?.id).toBe('guardarian')
      expect(guardarianInfo.logoComponent).toBe(MERCHANT_LOGOS.GuardarianLogo)
      expect(guardarianInfo.brandColor).toBe('#4C9DE8')
      expect(guardarianInfo.suggestedCategory).toBe('Crypto')

      const coinbaseInfo = getMerchantBrandInfo('Coinbase Ireland Limited')
      expect(coinbaseInfo.merchant?.id).toBe('coinbase')
      expect(coinbaseInfo.logoComponent).toBe(MERCHANT_LOGOS.SiCoinbase)
      expect(coinbaseInfo.brandColor).toBe('#0052FF')
      expect(coinbaseInfo.suggestedCategory).toBe('Crypto')

      const binanceInfo = getMerchantBrandInfo('Binance Card Payment')
      expect(binanceInfo.merchant?.id).toBe('binance')
      expect(binanceInfo.logoComponent).toBe(MERCHANT_LOGOS.SiBinance)
      expect(binanceInfo.brandColor).toBe('#F0B90B')
      expect(binanceInfo.suggestedCategory).toBe('Crypto')

      const krakenInfo = getMerchantBrandInfo('Kraken Payward')
      expect(krakenInfo.merchant?.id).toBe('kraken')
      expect(krakenInfo.logoComponent).toBe(MERCHANT_LOGOS.KrakenLogo)
      expect(krakenInfo.brandColor).toBe('#5841D8')

      const bitpandaInfo = getMerchantBrandInfo('Bitpanda Payments')
      expect(bitpandaInfo.merchant?.id).toBe('bitpanda')
      expect(bitpandaInfo.logoComponent).toBe(AVAILABLE_ICONS.Coins)
      expect(bitpandaInfo.brandColor).toBe('#00D084')
    })

    it('matches Stadtverwaltung Bad Homburg city coat of arms for municipal payments', () => {
      const badHomburgTx =
        'Stadtverwaltung Bad Homburg HELADEF1TSK DE81512500000001085662 0181776005 End-to-End-Ref.'
      const badHomburgIcon = getCategoryIcon('Taxes', 20, undefined, badHomburgTx)
      expect(React.isValidElement(badHomburgIcon)).toBe(true)
      if (React.isValidElement(badHomburgIcon)) {
        expect(badHomburgIcon.type).toBe(MERCHANT_LOGOS.BadHomburgLogo)
      }

      const info = getMerchantBrandInfo(badHomburgTx)
      expect(info.merchant?.id).toBe('stadt-bad-homburg')
      expect(info.merchant?.name).toBe('Stadtverwaltung Bad Homburg')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.BadHomburgLogo)
      expect(info.brandColor).toBe('#0F47AF')
      expect(info.suggestedCategory).toBe('Taxes')
    })

    it('renders BadHomburgLogo coat of arms successfully into the DOM', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Taxes',
            24,
            undefined,
            'Stadtverwaltung Bad Homburg HELADEF1TSK DE81512500000001085662 0181776005 End-to-End-Ref.',
          )}
        </div>,
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-label', 'Stadtverwaltung Bad Homburg vor der Höhe')
    })

    it('matches Bad Homburg coat of arms for municipal childcare fee transactions', () => {
      const kitaTx =
        'Stadt Bad Homburg v.d.H. 506582 KINDERTAGESSTAETTENBEITRAG End-to-End-Ref.: DTA-22-00801'
      const icon = getCategoryIcon('Education', 20, undefined, kitaTx)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.BadHomburgLogo)
      }
      expect(getMerchantBrandInfo(kitaTx).merchant?.id).toBe('stadt-bad-homburg')
    })

    it('matches Gemeinde Schmitten coat of arms for municipal payments', () => {
      const schmittenTx =
        'Gemeinde Schmitten HELADEF1TSK DE58512500000059004000 0561196907 End-to-End-Ref.: CCB.'
      const schmittenIcon = getCategoryIcon('Taxes', 20, undefined, schmittenTx)
      expect(React.isValidElement(schmittenIcon)).toBe(true)
      if (React.isValidElement(schmittenIcon)) {
        expect(schmittenIcon.type).toBe(MERCHANT_LOGOS.SchmittenLogo)
      }

      const info = getMerchantBrandInfo(schmittenTx)
      expect(info.merchant?.id).toBe('gemeinde-schmitten')
      expect(info.merchant?.name).toBe('Gemeinde Schmitten')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.SchmittenLogo)
      expect(info.brandColor).toBe('#0F47AF')
      expect(info.suggestedCategory).toBe('Taxes')
    })

    it('renders SchmittenLogo coat of arms successfully into the DOM', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Taxes',
            24,
            undefined,
            'Gemeinde Schmitten HELADEF1TSK DE58512500000059004000 0561196907 End-to-End-Ref.: CCB.',
          )}
        </div>,
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-label', 'Gemeinde Schmitten im Taunus')
    })

    it('matches Stadt Kelkheim coat of arms for municipal payments', () => {
      const kelkheimTx =
        'STADTKASSE KELKHEIM (TAUNUS) HELADEF1TSK DE34512500000005211530 AZ: 40004836'
      const kelkheimIcon = getCategoryIcon('Taxes', 20, undefined, kelkheimTx)
      expect(React.isValidElement(kelkheimIcon)).toBe(true)
      if (React.isValidElement(kelkheimIcon)) {
        expect(kelkheimIcon.type).toBe(MERCHANT_LOGOS.KelkheimLogo)
      }

      const info = getMerchantBrandInfo(kelkheimTx)
      expect(info.merchant?.id).toBe('stadt-kelkheim')
      expect(info.merchant?.name).toBe('Stadt Kelkheim (Taunus)')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.KelkheimLogo)
      expect(info.brandColor).toBe('#DA121A')
      expect(info.suggestedCategory).toBe('Taxes')
    })

    it('renders KelkheimLogo successfully into the DOM', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Taxes',
            24,
            undefined,
            'STADTKASSE KELKHEIM (TAUNUS) HELADEF1TSK DE34512500000005211530 AZ: 40004836',
          )}
        </div>,
      )
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/brands/kelkheim.png')
      expect(img).toHaveAttribute('alt', 'Stadt Kelkheim (Taunus)')
    })

    it('matches Hochtaunuskreis district crest and Education category for school care transactions', () => {
      const hochtaunuskreisTx =
        'Hochtaunuskreis Betreuung fuer Memic, Artur End-to-End-Ref.: 9600074123 Mandatsref'
      const icon = getCategoryIcon('Education', 20, undefined, hochtaunuskreisTx)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.HochtaunuskreisLogo)
      }

      const info = getMerchantBrandInfo(hochtaunuskreisTx)
      expect(info.merchant?.id).toBe('hochtaunuskreis')
      expect(info.merchant?.name).toBe('Hochtaunuskreis')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.HochtaunuskreisLogo)
      expect(info.brandColor).toBe('#003366')
      expect(info.suggestedCategory).toBe('Education')
    })

    it('renders HochtaunuskreisLogo successfully into the DOM', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Education',
            24,
            undefined,
            'Hochtaunuskreis Betreuung fuer Memic, Artur End-to-End-Ref.: 9600074123 Mandatsref',
          )}
        </div>,
      )
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/brands/hochtaunuskreis.png')
      expect(img).toHaveAttribute('alt', 'Hochtaunuskreis')
    })

    it.each([
      ['Syna GmbH KUNDENNUMMER 483029022 End-to-End-Ref.: Beleg: 312004778285 Mandatsref: 0085', 'syna', 'SynaLogo', 'Utilities'],
      ['Westnetz GmbH Netzentgelt', 'westnetz', 'WestnetzLogo', 'Utilities'],
      ['NRM Netzdienste Rhein-Main GmbH', 'nrm', 'NrmLogo', 'Utilities'],
      ['Allg.Deutscher Automobil-Club ADAC e.V. ADAC E.V. MEMIC ANEL MEMIC BILJANA BEITRAG: 01.01.22-', 'adac', 'AdacLogo', 'Transport'],
      ['ACE Auto Club Europa e.V.', 'ace', 'AceLogo', 'Transport'],
      ['AvD Automobilclub von Deutschland', 'avd', 'AvdLogo', 'Transport'],
      ['POCO Einrichtungsmarkte GmbH ELV54203406 19.02 13.01 ME0 End-to-End-Ref.: T0220219542034', 'poco', 'PocoLogo', 'Shopping'],
      ['XXXLutz KG Wiesbaden', 'xxxlutz', 'XxxlutzLogo', 'Shopping'],
      ['moemax Frankfurt', 'moemax', 'MoemaxLogo', 'Shopping'],
      ['Möbel Höffner Eschborn', 'hoeffner', 'HoeffnerLogo', 'Shopping'],
      ['Sconto SB Der Möbelmarkt', 'sconto', 'ScontoLogo', 'Shopping'],
      ['ROLLER GmbH & Co. KG', 'roller', 'RollerLogo', 'Shopping'],
      ['Segmüller Weiterstadt', 'segmueller', 'SegmuellerLogo', 'Shopping'],
      ['porta Möbel Frankfurt', 'porta', 'PortaLogo', 'Shopping'],
      ['JYSK GmbH', 'jysk', 'JyskLogo', 'Shopping'],
      ['Turnverein Dornholzhausen 1918 e.V. Sammelbuchung TV Dornholzhausen/Ts. 1918 e.V., Memic Anel', 'tv-dornholzhausen', 'TvDornholzhausenLogo', 'Healthcare'],
      ['Die Haftpflichtkasse VVaG 60603542 / Unfall Beitrag 23.01.25 - meine-hk.de - Jetzt anmelden und Re', 'haftpflichtkasse', 'HaftpflichtkasseLogo', 'Insurance'],
      ['Debeka Krankenversicherung', 'debeka', 'DebekaLogo', 'Insurance'],
      ['ERGO Versicherung', 'ergo', 'ErgoLogo', 'Insurance'],
      ['AXA Konzern AG', 'axa', 'AxaLogo', 'Insurance'],
      ['Generali Versicherung', 'generali', 'GeneraliLogo', 'Insurance'],
      ['R+V Versicherung AG', 'ruv', 'RuvLogo', 'Insurance'],
      ['Signal Iduna Gruppe', 'signal-iduna', 'SignalIdunaLogo', 'Insurance'],
      ['HanseMerkur Versicherung', 'hansemerkur', 'HanseMerkurLogo', 'Insurance'],
      ['Barmenia Versicherungen', 'barmenia', 'BarmeniaLogo', 'Insurance'],
      ['Gothaer Allgemeine Versicherung', 'gothaer', 'GothaerLogo', 'Insurance'],
      ['ARAG SE Rechtsschutz', 'arag', 'AragLogo', 'Insurance'],
      ['DEVK Versicherungen', 'devk', 'DevkLogo', 'Insurance'],
      ['HDI Versicherung AG', 'hdi', 'HdiLogo', 'Insurance'],
      ['VHV Versicherungen', 'vhv', 'VhvLogo', 'Insurance'],
      ['CosmosDirekt Versicherung', 'cosmosdirekt', 'CosmosDirektLogo', 'Insurance'],
      ['ByeBye PBNKDEFFXXX DE93440100460095667464 2110630491421 End-to-End-Ref.: CCB.109.UE.P', 'byebye', 'ByebyeLogo', 'Travel'],
      ['Deutsches Jugendherbergswerk Hauptv erband e. V. 22,50 Beitrag-25 31492804 End-to-End-Ref.: N', 'djh', 'DjhLogo', 'Travel'],
      ['Hostelling International membership', 'hostelling-international', 'HostellingInternationalLogo', 'Travel'],
      ['a&o Hostels Berlin', 'ao-hostels', 'AoHostelsLogo', 'Travel'],
      ['MEININGER Hotels Frankfurt', 'meininger', 'MeiningerLogo', 'Travel'],
      ['Standesamt Bad Soden am Taunus NASSDE55XXX DE84510500150197000325 Internationale Geburts', 'stadt-bad-soden', 'BadSodenLogo', 'Taxes'],
      ['Main-Taunus-Kreis Kreiskasse', 'main-taunus-kreis', 'MainTaunusKreisLogo', 'Taxes'],
      ['Muenchener VEREIN Krankenversicheru ng a. Kundennummer S88063 KV1003 17,46 End-to-End-Ref.', 'muenchener-verein', 'MuenchenerVereinLogo', 'Healthcare'],
      ['WebID Solutions GmbH HYVEDEMM488 DE22100208900035900527 TWMDO WebID Ident 643-572-', 'webid', 'WebIdLogo', 'Bank Fees'],
      ['IDnow GmbH VideoIdent', 'idnow', 'IdnowLogo', 'Bank Fees'],
      ['POSTIDENT Verfahren', 'postident', 'PostidentLogo', 'Bank Fees'],
      ['Verimi GmbH ID', 'verimi', 'VerimiLogo', 'Bank Fees'],
      ['GENERALKOSULAT VON BOSNIENHERZEGOW. DRESDEFFXXX DE71500800000262721801 Anel Mem', 'konsulat-bosnien', 'BosniaCoatOfArmsLogo', 'Taxes'],
      ['Swiss Life SE VS 9667224-1/819491326 Beitrag 02/2 026 Ihr Beitrag fur ein selbstbesti mmtes Leben', 'swiss-life', 'SwissLifeLogo', 'Savings'],
      ['Canada Life Assurance Europe', 'canada-life', 'CanadaLifeLogo', 'Savings'],
      ['Alte Leipziger Lebensversicherung', 'alte-leipziger', 'AlteLeipzigerLogo', 'Savings'],
      ['Aeguron Risiko-Lebensversicherung AeguronRisikoLV 02/26 6267061-P End-to-End-Ref.: 89c9c867', 'aeguron', 'AeguronLogo', 'Insurance'],
      ['iptiQ Life SA AeguronRisikoLV 04/26 6267061-P End-to-End-Ref.: de3e4c7022094659943152a87c2', 'iptiq', 'IptiqLogo', 'Insurance'],
      ['WGV-Wuertt. Gemeinde-Versicherung MTK-BA 117 V90092776488 01.06.2025- 01.07.2025 End-to-E', 'wgv', 'WgvLogo', 'Insurance'],
      ['Hannoversche Lebensversicherung AG', 'hannoversche', 'HannoverscheLogo', 'Insurance'],
      ['Provinzial Versicherung AG', 'provinzial', 'ProvinzialLogo', 'Insurance'],
      ['SV SparkassenVersicherung Gebäude', 'sv-sparkassenversicherung', 'SvSparkassenVersicherungLogo', 'Insurance'],
      ['BGV Badische Gemeinde-Versicherung', 'bgv', 'BgvLogo', 'Insurance'],
      ['Versicherungskammer Bayern', 'vkb', 'VkbLogo', 'Insurance'],
      ['Swiss Re Reinsurance', 'swiss-re', 'SwissReLogo', 'Insurance'],
    ])('matches %s to merchant %s with its logo', (tx, merchantId, logoKey, category) => {
      const info = getMerchantBrandInfo(tx)
      expect(info.merchant?.id).toBe(merchantId)
      expect(info.logoComponent).toBe(MERCHANT_LOGOS[logoKey])
      expect(info.suggestedCategory).toBe(category)

      const { container } = render(<div>{getCategoryIcon(category, 24, undefined, tx)}</div>)
      expect(container.querySelector('img, svg')).toBeInTheDocument()
    })

    it('matches Stones brand info and Shopping category with its brand logo', () => {
      const info = getMerchantBrandInfo(
        'STONES GMBH 260410190023798241253413150 ELV6534 1315 26.04 10.19 ME0 End-to-End-Ref.: 26',
      )
      expect(info.merchant?.id).toBe('stones')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.StonesLogo)
      expect(info.suggestedCategory).toBe('Shopping')
    })

    it('matches klarmobil brand info and Communication category for telecommunications invoice transactions', () => {
      const klarmobilTx =
        'klarmobil GmbH Kd.1059561719 Wir sagen Danke. RG-N r.F25035684584 15,99 EUR End-to-End-Ref.'
      const icon = getCategoryIcon('Communication', 20, undefined, klarmobilTx)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.KlarmobilLogo)
      }

      const info = getMerchantBrandInfo(klarmobilTx)
      expect(info.merchant?.id).toBe('klarmobil')
      expect(info.merchant?.name).toBe('klarmobil.de')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.KlarmobilLogo)
      expect(info.brandColor).toBe('#F67C16')
      expect(info.suggestedCategory).toBe('Communication')
    })

    it('renders KlarmobilLogo successfully into the DOM', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Communication',
            24,
            undefined,
            'klarmobil GmbH Kd.1059561719 Wir sagen Danke. RG-N r.F25035684584 15,99 EUR End-to-End-Ref.',
          )}
        </div>,
      )
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/brands/klarmobil.png')
      expect(img).toHaveAttribute('alt', 'klarmobil.de')
    })

    it('matches Heroku brand info and Utilities category for cloud hosting transactions', () => {
      const herokuTx = 'HEROKU* JUL-106945945'
      const icon = getCategoryIcon('Utilities', 20, undefined, herokuTx)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.HerokuLogo)
      }

      const info = getMerchantBrandInfo(herokuTx)
      expect(info.merchant?.id).toBe('heroku')
      expect(info.merchant?.name).toBe('Heroku')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.HerokuLogo)
      expect(info.brandColor).toBe('#430098')
      expect(info.suggestedCategory).toBe('Utilities')
    })

    it('renders HerokuLogo successfully into the DOM', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Utilities',
            24,
            undefined,
            'HEROKU* JUL-106945945',
          )}
        </div>,
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-label', 'Heroku')
    })

    it('matches cloud and hosting providers (AWS, Hetzner, DigitalOcean, Cloudflare, Vercel, IONOS, Netcup, OVHcloud)', () => {
      const awsInfo = getMerchantBrandInfo('AWS EMEA SARL')
      expect(awsInfo.merchant?.id).toBe('aws')
      expect(awsInfo.logoComponent).toBe(MERCHANT_LOGOS.FaAws)
      expect(awsInfo.suggestedCategory).toBe('Utilities')
      expect(awsInfo.brandColor).toBe('#FF9900')

      const hetznerInfo = getMerchantBrandInfo('Hetzner Online GmbH')
      expect(hetznerInfo.merchant?.id).toBe('hetzner')
      expect(hetznerInfo.logoComponent).toBe(MERCHANT_LOGOS.SiHetzner)
      expect(hetznerInfo.suggestedCategory).toBe('Utilities')
      expect(hetznerInfo.brandColor).toBe('#D50C2D')

      const doInfo = getMerchantBrandInfo('DigitalOcean LLC')
      expect(doInfo.merchant?.id).toBe('digitalocean')
      expect(doInfo.logoComponent).toBe(MERCHANT_LOGOS.SiDigitalocean)
      expect(doInfo.suggestedCategory).toBe('Utilities')
      expect(doInfo.brandColor).toBe('#0080FF')

      const cfInfo = getMerchantBrandInfo('Cloudflare Inc')
      expect(cfInfo.merchant?.id).toBe('cloudflare')
      expect(cfInfo.logoComponent).toBe(MERCHANT_LOGOS.SiCloudflare)
      expect(cfInfo.suggestedCategory).toBe('Utilities')
      expect(cfInfo.brandColor).toBe('#F38020')

      const vercelInfo = getMerchantBrandInfo('Vercel Inc')
      expect(vercelInfo.merchant?.id).toBe('vercel')
      expect(vercelInfo.logoComponent).toBe(MERCHANT_LOGOS.SiVercel)
      expect(vercelInfo.suggestedCategory).toBe('Utilities')

      const ionosInfo = getMerchantBrandInfo('IONOS SE')
      expect(ionosInfo.merchant?.id).toBe('ionos')
      expect(ionosInfo.logoComponent).toBe(MERCHANT_LOGOS.SiIonos)
      expect(ionosInfo.suggestedCategory).toBe('Utilities')
      expect(ionosInfo.brandColor).toBe('#003D8F')

      const netcupInfo = getMerchantBrandInfo('netcup GmbH')
      expect(netcupInfo.merchant?.id).toBe('netcup')
      expect(netcupInfo.logoComponent).toBe(MERCHANT_LOGOS.SiNetcup)
      expect(netcupInfo.suggestedCategory).toBe('Utilities')
      expect(netcupInfo.brandColor).toBe('#1E6888')

      const ovhInfo = getMerchantBrandInfo('OVH SAS')
      expect(ovhInfo.merchant?.id).toBe('ovhcloud')
      expect(ovhInfo.logoComponent).toBe(MERCHANT_LOGOS.SiOvh)
      expect(ovhInfo.suggestedCategory).toBe('Utilities')
      expect(ovhInfo.brandColor).toBe('#000E9C')
    })

    it('matches telecom providers (freenet, congstar, ALDI TALK) and renders custom logos', () => {
      const freenetInfo = getMerchantBrandInfo('freenet AG')
      expect(freenetInfo.merchant?.id).toBe('freenet')
      expect(freenetInfo.logoComponent).toBe(MERCHANT_LOGOS.SiFreenet)
      expect(freenetInfo.suggestedCategory).toBe('Communication')
      expect(freenetInfo.brandColor).toBe('#00AE65')

      const congstarInfo = getMerchantBrandInfo('congstar GmbH')
      expect(congstarInfo.merchant?.id).toBe('congstar')
      expect(congstarInfo.logoComponent).toBe(MERCHANT_LOGOS.CongstarLogo)
      expect(congstarInfo.suggestedCategory).toBe('Communication')

      const aldiTalkInfo = getMerchantBrandInfo('MEDIONmobile ALDI TALK')
      expect(aldiTalkInfo.merchant?.id).toBe('aldi-talk')
      expect(aldiTalkInfo.logoComponent).toBe(MERCHANT_LOGOS.AldiTalkLogo)
      expect(aldiTalkInfo.suggestedCategory).toBe('Communication')
      expect(aldiTalkInfo.brandColor).toBe('#00205B')

      const { container } = render(
        <div>
          {getCategoryIcon('Communication', 24, undefined, 'congstar Mobilfunk')}
          {getCategoryIcon('Communication', 24, undefined, 'ALDI TALK Guthaben')}
        </div>,
      )
      expect(container.querySelector('svg[aria-label="congstar"]')).toBeInTheDocument()
      expect(container.querySelector('svg[aria-label="ALDI TALK"]')).toBeInTheDocument()
    })

    it('matches Gerichtskasse Hessen state emblem for judicial and property purchase tax transactions', () => {
      const gerichtskasseTx =
        'Gerichtkasse HELADEFFXXX DE73500500000001006030 X046833902021X End-to-End-Ref.: CCB.'
      const icon = getCategoryIcon('Taxes', 20, undefined, gerichtskasseTx)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.HessenLogo)
      }

      const info = getMerchantBrandInfo(gerichtskasseTx)
      expect(info.merchant?.id).toBe('gerichtskasse')
      expect(info.merchant?.name).toBe('Gerichtskasse (Justiz Hessen)')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.HessenLogo)
      expect(info.brandColor).toBe('#004B93')
      expect(info.suggestedCategory).toBe('Taxes')
    })

    it('renders HessenLogo and GermanyFlagLogo civic logos successfully into the DOM', () => {
      const { container: hessenContainer } = render(
        <div>
          {getCategoryIcon(
            'Taxes',
            24,
            undefined,
            'Gerichtkasse HELADEFFXXX DE73500500000001006030 X046833902021X End-to-End-Ref.: CCB.',
          )}
        </div>,
      )
      const hessenSvg = hessenContainer.querySelector('svg')
      expect(hessenSvg).toBeInTheDocument()
      expect(hessenSvg).toHaveAttribute('aria-label', 'Land Hessen')

      const { container: deFlagContainer } = render(
        <div>
          <MERCHANT_LOGOS.GermanyFlagLogo size={24} />
        </div>,
      )
      const deFlagSvg = deFlagContainer.querySelector('svg')
      expect(deFlagSvg).toBeInTheDocument()
      expect(deFlagSvg).toHaveAttribute('aria-label', 'Bundesrepublik Deutschland')
    })

    it('matches Färber & Hutzel notary logo for property purchase notary transactions', () => {
      const faerberTx =
        'Färber und Hutzel HELADEF1TSK DE29512500000001058274 01571/21 End-to-End-Ref.: CCB.269.UE.'
      const icon = getCategoryIcon('Taxes', 20, undefined, faerberTx)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.FaerberHutzelLogo)
      }

      const info = getMerchantBrandInfo(faerberTx)
      expect(info.merchant?.id).toBe('faerber-hutzel')
      expect(info.merchant?.name).toBe('Färber & Hutzel Notare')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.FaerberHutzelLogo)
      expect(info.brandColor).toBe('#172A45')
      expect(info.suggestedCategory).toBe('Taxes')
    })

    it('renders FaerberHutzelLogo legal emblem successfully into the DOM', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Taxes',
            24,
            undefined,
            'Färber und Hutzel HELADEF1TSK DE29512500000001058274 01571/21 End-to-End-Ref.: CCB.269.UE.',
          )}
        </div>,
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-label', 'Färber & Hutzel Notare und Rechtsanwälte')
    })

    it('matches INTRA-TEC hardware logo for e-commerce shopping transactions', () => {
      const intratecTx =
        'INTRA-TEC GmbH COKSDE33XXX DE32370502990312020901 Order 589490 End-to-End-Ref.: CCB.'
      const icon = getCategoryIcon('Shopping', 20, undefined, intratecTx)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.IntratecLogo)
      }

      const info = getMerchantBrandInfo(intratecTx)
      expect(info.merchant?.id).toBe('intra-tec')
      expect(info.merchant?.name).toBe('INTRA-TEC')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.IntratecLogo)
      expect(info.brandColor).toBe('#111111')
      expect(info.suggestedCategory).toBe('Shopping')
    })

    it('renders IntratecLogo successfully into the DOM', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Shopping',
            24,
            undefined,
            'INTRA-TEC GmbH COKSDE33XXX DE32370502990312020901 Order 589490 End-to-End-Ref.: CCB.',
          )}
        </div>,
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-label', 'INTRA-TEC')
    })

    it('matches GermanyFlagLogo for Finanzamt and FA Nidda tax return transactions', () => {
      const taxTx =
        'FA NIDDA ERSTATT.00345234717 EST-VERANL. 21 End-to-End-Ref.: 00345234717 EST-VEG0404202'
      const icon = getCategoryIcon('Taxes', 20, undefined, taxTx)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.GermanyFlagLogo)
      }

      const info = getMerchantBrandInfo(taxTx)
      expect(info.merchant?.id).toBe('finanzamt')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.GermanyFlagLogo)
      expect(info.brandColor).toBe('#18181B')
      expect(info.suggestedCategory).toBe('Taxes')
    })

    it('renders GermanyFlagLogo for FA Nidda tax return successfully into the DOM', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Taxes',
            24,
            undefined,
            'FA NIDDA ERSTATT.00345234717 EST-VERANL. 21 End-to-End-Ref.: 00345234717 EST-VEG0404202',
          )}
        </div>,
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-label', 'Bundesrepublik Deutschland')
    })

    it('matches CadoozLogo for cadooz voucher and shopping transactions', () => {
      const cadoozTx =
        'cadooz GmbH DEUTDEHHXXX DE30200700000070730703 230503-663021 End-to-End-Ref.: CCB.123'
      const icon = getCategoryIcon('Shopping', 20, undefined, cadoozTx)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.CadoozLogo)
      }

      const info = getMerchantBrandInfo(cadoozTx)
      expect(info.merchant?.id).toBe('cadooz')
      expect(info.merchant?.name).toBe('cadooz')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.CadoozLogo)
      expect(info.brandColor).toBe('#2D2E83')
      expect(info.suggestedCategory).toBe('Shopping')
    })

    it('renders CadoozLogo successfully into the DOM', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Shopping',
            24,
            undefined,
            'cadooz GmbH DEUTDEHHXXX DE30200700000070730703 230503-663021 End-to-End-Ref.: CCB.123',
          )}
        </div>,
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-label', 'cadooz')
    })

    it('matches LotharBraunLogo for Lothar Braun door installations and carpentry transactions', () => {
      const lotharTx =
        'Lothar Braun GmbH PBNKDEFFXXX DE82500100600255577603 Rechnung'
      const icon = getCategoryIcon('Shopping', 20, undefined, lotharTx)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.LotharBraunLogo)
      }

      const info = getMerchantBrandInfo(lotharTx)
      expect(info.merchant?.id).toBe('lothar-braun')
      expect(info.merchant?.name).toBe('Schreinerei Lothar Braun')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.LotharBraunLogo)
      expect(info.brandColor).toBe('#843210')
      expect(info.suggestedCategory).toBe('Shopping')
    })

    it('renders LotharBraunLogo successfully into the DOM', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Shopping',
            24,
            undefined,
            'Lothar Braun GmbH PBNKDEFFXXX DE82500100600255577603 Rechnung',
          )}
        </div>,
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-label', 'Schreinerei Lothar Braun')
    })

    it('matches PaybackLogo for PAYBACK PAY and Paymorrow transactions', () => {
      const paybackTx =
        'PAYBACK PAY / PAYMORROW WELADEDDXXX DE85300500000071013312 PAYBACK PAY End-to-En'
      const icon = getCategoryIcon('Shopping', 20, undefined, paybackTx)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.PaybackLogo)
      }

      const info = getMerchantBrandInfo(paybackTx)
      expect(info.merchant?.id).toBe('payback')
      expect(info.merchant?.name).toBe('PAYBACK')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.PaybackLogo)
      expect(info.brandColor).toBe('#003EB0')
      expect(info.suggestedCategory).toBe('Shopping')
    })

    it('renders PaybackLogo successfully into the DOM', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Shopping',
            24,
            undefined,
            'PAYBACK PAY / PAYMORROW WELADEDDXXX DE85300500000071013312 PAYBACK PAY End-to-En',
          )}
        </div>,
      )
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('alt', 'PAYBACK')
      expect(img).toHaveAttribute('src', '/brands/payback.png')
    })

    it('matches Booking.com logo over PayPal for purchases processed via PayPal', () => {
      const bookingTx =
        'PayPal (Europe) S.a r.l. et Cie, S. C.A. . Booking.com BV, Ihr Einkauf bei B ooking.com BV ABBUCHUNG'
      const icon = getCategoryIcon('Travel', 20, undefined, bookingTx)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.BookingLogo)
      }

      const info = getMerchantBrandInfo(bookingTx)
      expect(info.merchant?.id).toBe('booking')
      expect(info.merchant?.name).toBe('Booking.com')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.BookingLogo)
      expect(info.suggestedCategory).toBe('Travel')
      expect(info.brandColor).toBe('#003580')
    })

    it('renders BookingLogo successfully into the DOM', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Travel',
            24,
            undefined,
            'PayPal (Europe) S.a r.l. et Cie, S. C.A. . Booking.com BV, Ihr Einkauf bei B ooking.com BV ABBUCHUNG',
          )}
        </div>,
      )
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('alt', 'Booking.com')
      expect(img).toHaveAttribute('src', '/brands/booking.png')
    })

    it('matches RevolutLogo for Revolut and Revolt bank transactions with BIC REVOLT21XXX', () => {
      const revolutTx =
        'Anel Memic REVOLT21XXX LT153250000292115687 End-to-End-Ref.: MOB.147.UE.32306'
      const icon = getCategoryIcon('Transfers', 20, undefined, revolutTx)
      expect(React.isValidElement(icon)).toBe(true)
      if (React.isValidElement(icon)) {
        expect(icon.type).toBe(MERCHANT_LOGOS.RevolutLogo)
      }

      const info = getMerchantBrandInfo(revolutTx)
      expect(info.merchant?.id).toBe('revolut')
      expect(info.merchant?.name).toBe('Revolut')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.RevolutLogo)
      expect(info.brandColor).toBe('#0075EB')
      expect(info.suggestedCategory).toBe('Transfers')
    })

    it('matches RevolutLogo via Revolt alias and direct merchant lookup', () => {
      const info = getMerchantBrandInfo('Revolt Bank Transfer')
      expect(info.merchant?.id).toBe('revolut')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.RevolutLogo)
    })

    it('renders RevolutLogo successfully into the DOM', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Transfers',
            24,
            undefined,
            'Anel Memic REVOLT21XXX LT153250000292115687 End-to-End-Ref.: MOB.147.UE.32306',
          )}
        </div>,
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-label', 'Revolut')
    })

    it('renders successfully into the DOM using @testing-library/react', () => {
      const { container } = render(<div>{getCategoryIcon('Salary', 24)}</div>)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('getMerchantBrandInfo', () => {
    it('returns brand info for a known popular merchant with a logo', () => {
      const info = getMerchantBrandInfo('Netflix')
      expect(info.merchant).toBeDefined()
      expect(info.merchant?.name).toBe('Netflix')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.SiNetflix)
      expect(info.brandColor).toBe('#E50914')
      expect(info.suggestedCategory).toBe('Entertainment')
      expect(info.initials).toBe('NE')
    })

    it('calculates multi-word initials for popular merchants', () => {
      const info = getMerchantBrandInfo('Burger King')
      expect(info.merchant).toBeDefined()
      expect(info.initials).toBe('BK')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.SiBurgerking)
    })

    it('matches merchant via description or keyword substring', () => {
      const info = getMerchantBrandInfo('Monthly Spotify Premium Family')
      expect(info.merchant).toBeDefined()
      expect(info.merchant?.id).toBe('spotify')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.SiSpotify)
    })

    it('returns brand info for Western Union with SiWesternunion logo', () => {
      const info = getMerchantBrandInfo('Western Union Money Transfer')
      expect(info.merchant).toBeDefined()
      expect(info.merchant?.name).toBe('Western Union')
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.SiWesternunion)
      expect(info.brandColor).toBe('#FFDD00')
      expect(info.suggestedCategory).toBe('Transfers')
      expect(info.initials).toBe('WU')
    })

    it('returns brand info for Deutsche Bank, Stripe, Glovo, and Apple Pay', () => {
      const dbInfo = getMerchantBrandInfo('Deutsche Bank Girokonto')
      expect(dbInfo.merchant?.name).toBe('Deutsche Bank')
      expect(dbInfo.logoComponent).toBe(MERCHANT_LOGOS.SiDeutschebank)
      expect(dbInfo.suggestedCategory).toBe('Transfers')

      const stripeInfo = getMerchantBrandInfo('Stripe Payments')
      expect(stripeInfo.merchant?.name).toBe('Stripe')
      expect(stripeInfo.logoComponent).toBe(MERCHANT_LOGOS.SiStripe)

      const glovoInfo = getMerchantBrandInfo('Glovo Delivery Beograd')
      expect(glovoInfo.merchant?.name).toBe('Glovo')
      expect(glovoInfo.logoComponent).toBe(MERCHANT_LOGOS.SiGlovo)
      expect(glovoInfo.suggestedCategory).toBe('Dining Out')

      const applePayInfo = getMerchantBrandInfo('Apple Pay Purchase')
      expect(applePayInfo.merchant?.name).toBe('Apple Pay')
      expect(applePayInfo.logoComponent).toBe(MERCHANT_LOGOS.SiApplepay)

      const comdirectInfo = getMerchantBrandInfo('Übertrag comdirect Depot')
      expect(comdirectInfo.merchant?.name).toBe('comdirect')
      expect(comdirectInfo.logoComponent).toBe(MERCHANT_LOGOS.ComdirectLogo)
      expect(comdirectInfo.brandColor).toBe('#FFE600')
      expect(comdirectInfo.suggestedCategory).toBe('Transfers')

      const coinbaseInfo = getMerchantBrandInfo(
        'Coinbase Identifizierung Account verification return from Co inbase Identifizierung End-to',
      )
      expect(coinbaseInfo.merchant?.name).toBe('Coinbase')
      expect(coinbaseInfo.logoComponent).toBe(MERCHANT_LOGOS.SiCoinbase)
      expect(coinbaseInfo.brandColor).toBe('#0052FF')
      expect(coinbaseInfo.suggestedCategory).toBe('Crypto')

      const rmvInfo = getMerchantBrandInfo(
        'Rhein-Main-Verkehrsverbund Serviceg esellschaft mbH (rms GmbH) Treuhand RNR 2/2607/1271193',
      )
      expect(rmvInfo.merchant?.id).toBe('rmv')
      expect(rmvInfo.merchant?.name).toBe('RMV')
      expect(rmvInfo.logoComponent).toBe(MERCHANT_LOGOS.RmvLogo)
      expect(rmvInfo.brandColor).toBe('#005B9C')
      expect(rmvInfo.suggestedCategory).toBe('Transport')

      const rossmannInfo = getMerchantBrandInfo('Dirk Rossmann GmbH Filiale 1234')
      expect(rossmannInfo.merchant?.id).toBe('rossmann')
      expect(rossmannInfo.logoComponent).toBe(MERCHANT_LOGOS.SiRossmann)
      expect(rossmannInfo.suggestedCategory).toBe('Shopping')

      const mediaMarktInfo = getMerchantBrandInfo('Media Markt Online Shop')
      expect(mediaMarktInfo.merchant?.id).toBe('mediamarkt')
      expect(mediaMarktInfo.logoComponent).toBe(MERCHANT_LOGOS.SiMediamarkt)
      expect(mediaMarktInfo.suggestedCategory).toBe('Shopping')

      const vintedInfo = getMerchantBrandInfo('Vinted Payments UAB')
      expect(vintedInfo.merchant?.id).toBe('vinted')
      expect(vintedInfo.logoComponent).toBe(MERCHANT_LOGOS.SiVinted)
      expect(vintedInfo.suggestedCategory).toBe('Shopping')

      const scalableInfo = getMerchantBrandInfo('Baader Bank / Scalable Capital')
      expect(scalableInfo.merchant?.id).toBe('scalable-capital')
      expect(scalableInfo.logoComponent).toBe(MERCHANT_LOGOS.ScalableCapitalLogo)

      const volksbankInfo = getMerchantBrandInfo('Frankfurter Volksbank eG')
      expect(volksbankInfo.merchant?.id).toBe('volksbank')
      expect(volksbankInfo.logoComponent).toBe(MERCHANT_LOGOS.VolksbankLogo)

      const flixInfo = getMerchantBrandInfo('FlixBus Mobility GmbH')
      expect(flixInfo.merchant?.id).toBe('flix')
      expect(flixInfo.logoComponent).toBe(MERCHANT_LOGOS.FlixLogo)

      const hvvInfo = getMerchantBrandInfo('HVV App Ticket Hamburg')
      expect(hvvInfo.merchant?.id).toBe('hvv')
      expect(hvvInfo.logoComponent).toBe(MERCHANT_LOGOS.HvvLogo)
      expect(hvvInfo.suggestedCategory).toBe('Transport')

      const vrrInfo = getMerchantBrandInfo('Verkehrsverbund Rhein-Ruhr Ticket')
      expect(vrrInfo.merchant?.id).toBe('vrr')
      expect(vrrInfo.logoComponent).toBe(MERCHANT_LOGOS.VrrLogo)
      expect(vrrInfo.suggestedCategory).toBe('Transport')

      const oebbInfo = getMerchantBrandInfo('ÖBB Ticket Wien')
      expect(oebbInfo.merchant?.id).toBe('oebb')
      expect(oebbInfo.logoComponent).toBe(MERCHANT_LOGOS.OebbLogo)
      expect(oebbInfo.suggestedCategory).toBe('Transport')

      const bunqInfo = getMerchantBrandInfo('bunq b.v. card payment')
      expect(bunqInfo.merchant?.id).toBe('bunq')
      expect(bunqInfo.logoComponent).toBe(MERCHANT_LOGOS.BunqLogo)

      const discordInfo = getMerchantBrandInfo('Discord Nitro Subscription')
      expect(discordInfo.merchant?.id).toBe('discord')
      expect(discordInfo.logoComponent).toBe(MERCHANT_LOGOS.SiDiscord)
      expect(discordInfo.suggestedCategory).toBe('Entertainment')

      const bpInfo = getMerchantBrandInfo(
        'BP Tankstelle, Sattledt AT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card 2026-0',
      )
      expect(bpInfo.merchant?.id).toBe('bp')
      expect(bpInfo.merchant?.name).toBe('BP')
      expect(bpInfo.logoComponent).toBe(MERCHANT_LOGOS.BpLogo)
      expect(bpInfo.brandColor).toBe('#007A3D')
      expect(bpInfo.suggestedCategory).toBe('Transport')

      // Short term isolation: 'bp' should not falsely match words containing 'bp' as a substring
      const subpageInfo = getMerchantBrandInfo('Subpage Web Design Studio')
      expect(subpageInfo.merchant?.id).not.toBe('bp')

      const jetInfo = getMerchantBrandInfo('JET Tankstelle Wien')
      expect(jetInfo.merchant?.id).toBe('jet')
      expect(jetInfo.logoComponent).toBe(MERCHANT_LOGOS.JetLogo)
      expect(jetInfo.suggestedCategory).toBe('Transport')

      const essoInfo = getMerchantBrandInfo('Esso Station München')
      expect(essoInfo.merchant?.id).toBe('esso')
      expect(essoInfo.logoComponent).toBe(MERCHANT_LOGOS.EssoLogo)
      expect(essoInfo.suggestedCategory).toBe('Transport')

      const aviaInfo = getMerchantBrandInfo('AVIA Tankstelle Frankfurt')
      expect(aviaInfo.merchant?.id).toBe('avia')
      expect(aviaInfo.logoComponent).toBe(MERCHANT_LOGOS.AviaLogo)
      expect(aviaInfo.suggestedCategory).toBe('Transport')

      const eniInfo = getMerchantBrandInfo('Eni Station Salzburg')
      expect(eniInfo.merchant?.id).toBe('eni')
      expect(eniInfo.logoComponent).toBe(MERCHANT_LOGOS.EniLogo)
      expect(eniInfo.suggestedCategory).toBe('Transport')

      const turmoelInfo = getMerchantBrandInfo('Turmöl Quick Linz')
      expect(turmoelInfo.merchant?.id).toBe('turmoel')
      expect(turmoelInfo.logoComponent).toBe(MERCHANT_LOGOS.TurmoelLogo)
      expect(turmoelInfo.suggestedCategory).toBe('Transport')

      const asfinagInfo = getMerchantBrandInfo('ASFINAG Maut Shop Wien')
      expect(asfinagInfo.merchant?.id).toBe('asfinag')
      expect(asfinagInfo.logoComponent).toBe(MERCHANT_LOGOS.AsfinagLogo)
      expect(asfinagInfo.suggestedCategory).toBe('Transport')

      const teslaInfo = getMerchantBrandInfo('Tesla Supercharger Salzburg')
      expect(teslaInfo.merchant?.id).toBe('tesla-supercharger')
      expect(teslaInfo.logoComponent).toBe(MERCHANT_LOGOS.SiTesla)
      expect(teslaInfo.suggestedCategory).toBe('Transport')

      const ionityInfo = getMerchantBrandInfo('IONITY HPC Charging')
      expect(ionityInfo.merchant?.id).toBe('ionity')
      expect(ionityInfo.logoComponent).toBe(MERCHANT_LOGOS.IonityLogo)
      expect(ionityInfo.suggestedCategory).toBe('Transport')

      const enbwInfo = getMerchantBrandInfo('EnBW mobility+ Ladestation')
      expect(enbwInfo.merchant?.id).toBe('enbw-mobility')
      expect(enbwInfo.logoComponent).toBe(MERCHANT_LOGOS.EnbwLogo)
      expect(enbwInfo.suggestedCategory).toBe('Transport')

      const fastnedInfo = getMerchantBrandInfo('Fastned B.V. Charging')
      expect(fastnedInfo.merchant?.id).toBe('fastned')
      expect(fastnedInfo.logoComponent).toBe(MERCHANT_LOGOS.FastnedLogo)
      expect(fastnedInfo.suggestedCategory).toBe('Transport')

      const tuiInfo = getMerchantBrandInfo(
        'TUI Deutschland GmbH VG.80319110 03.10.2026-HER End-to-End-Ref.: 000220030170552026 Mand',
      )
      expect(tuiInfo.merchant?.id).toBe('tui')
      expect(tuiInfo.merchant?.name).toBe('TUI')
      expect(tuiInfo.logoComponent).toBe(MERCHANT_LOGOS.TuiLogo)
      expect(tuiInfo.brandColor).toBe('#D40E14')
      expect(tuiInfo.suggestedCategory).toBe('Travel')

      // Short term isolation: 'tui' should not falsely match words like 'intuitiv'
      const intuitiveInfo = getMerchantBrandInfo('Intuitiv Software Systems')
      expect(intuitiveInfo.merchant?.id).not.toBe('tui')

      const lufthansaInfo = getMerchantBrandInfo('Deutsche Lufthansa Ticket')
      expect(lufthansaInfo.merchant?.id).toBe('lufthansa')
      expect(lufthansaInfo.logoComponent).toBe(MERCHANT_LOGOS.SiLufthansa)
      expect(lufthansaInfo.suggestedCategory).toBe('Travel')

      const ryanairInfo = getMerchantBrandInfo('Ryanair Flight STN')
      expect(ryanairInfo.merchant?.id).toBe('ryanair')
      expect(ryanairInfo.logoComponent).toBe(MERCHANT_LOGOS.SiRyanair)
      expect(ryanairInfo.suggestedCategory).toBe('Travel')

      const easyjetInfo = getMerchantBrandInfo('easyJet Airline Booking')
      expect(easyjetInfo.merchant?.id).toBe('easyjet')
      expect(easyjetInfo.logoComponent).toBe(MERCHANT_LOGOS.SiEasyjet)
      expect(easyjetInfo.suggestedCategory).toBe('Travel')

      const dertourInfo = getMerchantBrandInfo('DERTOUR Pauschalreise')
      expect(dertourInfo.merchant?.id).toBe('dertour')
      expect(dertourInfo.logoComponent).toBe(MERCHANT_LOGOS.DertourLogo)
      expect(dertourInfo.suggestedCategory).toBe('Travel')

      const alltoursInfo = getMerchantBrandInfo('alltours Flugreisen')
      expect(alltoursInfo.merchant?.id).toBe('alltours')
      expect(alltoursInfo.logoComponent).toBe(MERCHANT_LOGOS.AlltoursLogo)
      expect(alltoursInfo.suggestedCategory).toBe('Travel')

      const schauinslandInfo = getMerchantBrandInfo('Schauinsland-Reisen GmbH')
      expect(schauinslandInfo.merchant?.id).toBe('schauinsland')
      expect(schauinslandInfo.logoComponent).toBe(MERCHANT_LOGOS.SchauinslandLogo)
      expect(schauinslandInfo.suggestedCategory).toBe('Travel')

      const marriottInfo = getMerchantBrandInfo('Marriott Bonvoy Hotel')
      expect(marriottInfo.merchant?.id).toBe('marriott')
      expect(marriottInfo.logoComponent).toBe(MERCHANT_LOGOS.SiMarriott)
      expect(marriottInfo.suggestedCategory).toBe('Travel')

      const hiltonInfo = getMerchantBrandInfo('Hilton Honors Frankfurt')
      expect(hiltonInfo.merchant?.id).toBe('hilton')
      expect(hiltonInfo.logoComponent).toBe(MERCHANT_LOGOS.SiHilton)
      expect(hiltonInfo.suggestedCategory).toBe('Travel')

      const pennyInfo = getMerchantBrandInfo('Penny Markt Filiale')
      expect(pennyInfo.merchant?.id).toBe('penny')
      expect(pennyInfo.logoComponent).toBe(MERCHANT_LOGOS.SiPenny)
      expect(pennyInfo.suggestedCategory).toBe('Groceries')

      const nettoInfo = getMerchantBrandInfo('Netto Marken-Discount')
      expect(nettoInfo.merchant?.id).toBe('netto')
      expect(nettoInfo.logoComponent).toBe(MERCHANT_LOGOS.SiNetto)
      expect(nettoInfo.suggestedCategory).toBe('Groceries')

      const bvgInfo = getMerchantBrandInfo('BVG Ticket Berlin')
      expect(bvgInfo.merchant?.id).toBe('bvg')
      expect(bvgInfo.logoComponent).toBe(MERCHANT_LOGOS.SiBvg)
      expect(bvgInfo.suggestedCategory).toBe('Transport')

      const check24Info = getMerchantBrandInfo('CHECK24 Vergleichsportal GmbH')
      expect(check24Info.merchant?.id).toBe('check24')
      expect(check24Info.logoComponent).toBe(MERCHANT_LOGOS.Check24Logo)
      expect(check24Info.suggestedCategory).toBe('Shopping')
      expect(check24Info.brandColor).toBe('#002D72')

      const chech24Info = getMerchantBrandInfo('Chech24')
      expect(chech24Info.merchant?.id).toBe('check24')
      expect(chech24Info.logoComponent).toBe(MERCHANT_LOGOS.Check24Logo)
      expect(chech24Info.suggestedCategory).toBe('Shopping')

      const c24Info = getMerchantBrandInfo('C24 Bank GmbH')
      expect(c24Info.merchant?.id).toBe('c24')
      expect(c24Info.logoComponent).toBe(MERCHANT_LOGOS.C24Logo)
      expect(c24Info.suggestedCategory).toBe('Transfers')

      const dhlInfo = getMerchantBrandInfo('DHL Paket Delivery')
      expect(dhlInfo.merchant?.id).toBe('dhl')
      expect(dhlInfo.logoComponent).toBe(MERCHANT_LOGOS.SiDhl)
      expect(dhlInfo.suggestedCategory).toBe('Shopping')

      const postInfo = getMerchantBrandInfo('Deutsche Post Filiale')
      expect(postInfo.merchant?.id).toBe('deutsche-post')
      expect(postInfo.logoComponent).toBe(MERCHANT_LOGOS.SiDeutschepost)
      expect(postInfo.suggestedCategory).toBe('Shopping')

      const tchiboInfo = getMerchantBrandInfo(
        'TCHIBO GMBH DRESDEFF200 DE14200800000816170700 20319230661010 End-to-End-Ref.: MOB.'
      )
      expect(tchiboInfo.merchant?.id).toBe('tchibo')
      expect(tchiboInfo.logoComponent).toBe(MERCHANT_LOGOS.TchiboLogo)
      expect(tchiboInfo.suggestedCategory).toBe('Shopping')
      expect(tchiboInfo.brandColor).toBe('#072042')

      const dellInfo = getMerchantBrandInfo(
        'Dell GmbH CITIDEFFXXX DE33502109000209865076 40308324 End-to-End-Ref.: CCB.147.UE.361421'
      )
      expect(dellInfo.merchant?.id).toBe('dell')
      expect(dellInfo.logoComponent).toBe(MERCHANT_LOGOS.DellLogo)
      expect(dellInfo.suggestedCategory).toBe('Shopping')
      expect(dellInfo.brandColor).toBe('#007DB8')

      const fairParkenInfo = getMerchantBrandInfo(
        'FAIR PARKEN GMBH WELADED1KSD DE19301502000002120590 AKTENZEICHEN: 30362484 End-to-'
      )
      expect(fairParkenInfo.merchant?.id).toBe('fair-parken')
      expect(fairParkenInfo.logoComponent).toBe(MERCHANT_LOGOS.FairParkenLogo)
      expect(fairParkenInfo.suggestedCategory).toBe('Transport')
      expect(fairParkenInfo.brandColor).toBe('#002D62')

      const wundertaxInfo = getMerchantBrandInfo(
        'wundertax GmbH Rueckzahlung Lizenzgebuehr Wunderta x GmbH End-to-End-Ref.: 4306669553-00'
      )
      expect(wundertaxInfo.merchant?.id).toBe('wundertax')
      expect(wundertaxInfo.logoComponent).toBe(MERCHANT_LOGOS.WundertaxLogo)
      expect(wundertaxInfo.suggestedCategory).toBe('Taxes')
      expect(wundertaxInfo.brandColor).toBe('#00CB9D')

      const guardarianInfo = getMerchantBrandInfo(
        'GUARDARIAN OÜ CLJUGB21XXX GB33CLJU04130729903054 6154171893446142 End-to-End-Ref.: CCB'
      )
      expect(guardarianInfo.merchant?.id).toBe('guardarian')
      expect(guardarianInfo.logoComponent).toBe(MERCHANT_LOGOS.GuardarianLogo)
      expect(guardarianInfo.suggestedCategory).toBe('Crypto')
      expect(guardarianInfo.brandColor).toBe('#4C9DE8')

      const beitragInfo = getMerchantBrandInfo('ARD ZDF Deutschlandradio Beitragsservice')
      expect(beitragInfo.merchant?.id).toBe('rundfunkbeitrag')
      expect(beitragInfo.logoComponent).toBe(MERCHANT_LOGOS.BeitragsserviceLogo)
      expect(beitragInfo.suggestedCategory).toBe('Utilities')

      const tkInfo = getMerchantBrandInfo('Techniker Krankenkasse Beitrag')
      expect(tkInfo.merchant?.id).toBe('tk')
      expect(tkInfo.logoComponent).toBe(MERCHANT_LOGOS.TkLogo)
      expect(tkInfo.suggestedCategory).toBe('Healthcare')

      const aokInfo = getMerchantBrandInfo('AOK Bayern Gesundheitskasse')
      expect(aokInfo.merchant?.id).toBe('aok')
      expect(aokInfo.logoComponent).toBe(MERCHANT_LOGOS.AokLogo)
      expect(aokInfo.suggestedCategory).toBe('Healthcare')

      const einsUndEinsInfo = getMerchantBrandInfo('1&1 Telecom GmbH')
      expect(einsUndEinsInfo.merchant?.id).toBe('1und1')
      expect(einsUndEinsInfo.logoComponent).toBe(MERCHANT_LOGOS.EinsUndEinsLogo)
      expect(einsUndEinsInfo.suggestedCategory).toBe('Communication')

      const daznInfo = getMerchantBrandInfo('DAZN Subscription Dach')
      expect(daznInfo.merchant?.id).toBe('dazn')
      expect(daznInfo.logoComponent).toBe(MERCHANT_LOGOS.SiDazn)
      expect(daznInfo.suggestedCategory).toBe('Entertainment')

      const skyInfo = getMerchantBrandInfo('Sky Deutschland Abo')
      expect(skyInfo.merchant?.id).toBe('sky')
      expect(skyInfo.logoComponent).toBe(MERCHANT_LOGOS.SiSky)
      expect(skyInfo.suggestedCategory).toBe('Entertainment')

      const shopApothekeInfo = getMerchantBrandInfo('Shop-Apotheke Bestellung')
      expect(shopApothekeInfo.merchant?.id).toBe('shop-apotheke')
      expect(shopApothekeInfo.logoComponent).toBe(MERCHANT_LOGOS.ShopApothekeLogo)
      expect(shopApothekeInfo.suggestedCategory).toBe('Healthcare')
      expect(shopApothekeInfo.brandColor).toBe('#E30613')

      const sumupInfo = getMerchantBrandInfo('SumUp .Metzgerei Enk/Louisenstrass 2024-10-26T12:41:33 KFN 0 VJ 2412 Kartenzahlung')
      expect(sumupInfo.merchant?.id).toBe('sumup')
      expect(sumupInfo.logoComponent).toBe(MERCHANT_LOGOS.SumupLogo)
      expect(sumupInfo.suggestedCategory).toBe('Shopping')
      expect(sumupInfo.brandColor).toBe('#0050FF')

      const suewagInfo = getMerchantBrandInfo('Süwag COBADEFFXXX DE69500400000257744300 Kunden-Nr.: 263614738 Rechnungsnr:')
      expect(suewagInfo.merchant?.id).toBe('suewag')
      expect(suewagInfo.logoComponent).toBe(MERCHANT_LOGOS.SuewagLogo)
      expect(suewagInfo.suggestedCategory).toBe('Utilities')
      expect(suewagInfo.brandColor).toBe('#004B87')

      const eurowingsInfo = getMerchantBrandInfo('holidays.ch GmbH Ihre Reisebuchung/Eurowings Holiday s/0022241300/41122589/20230818Anel Mem')
      expect(eurowingsInfo.merchant?.id).toBe('eurowings')
      expect(eurowingsInfo.logoComponent).toBe(MERCHANT_LOGOS.EurowingsLogo)
      expect(eurowingsInfo.suggestedCategory).toBe('Travel')
      expect(eurowingsInfo.brandColor).toBe('#7A1B3B')

      const condorInfo = getMerchantBrandInfo('Condor Flugdienst DE1234 Frankfurt-Palma')
      expect(condorInfo.merchant?.id).toBe('condor')
      expect(condorInfo.logoComponent).toBe(MERCHANT_LOGOS.CondorLogo)
      expect(condorInfo.suggestedCategory).toBe('Travel')
      expect(condorInfo.brandColor).toBe('#FFB800')

      const barmerInfo = getMerchantBrandInfo('BARMER Krankenkasse Monatsbeitrag')
      expect(barmerInfo.merchant?.id).toBe('barmer')
      expect(barmerInfo.logoComponent).toBe(MERCHANT_LOGOS.BarmerLogo)
      expect(barmerInfo.suggestedCategory).toBe('Healthcare')
      expect(barmerInfo.brandColor).toBe('#007A3D')

      const dakInfo = getMerchantBrandInfo('DAK Gesundheit Beitrag')
      expect(dakInfo.merchant?.id).toBe('dak')
      expect(dakInfo.logoComponent).toBe(MERCHANT_LOGOS.DakLogo)
      expect(dakInfo.suggestedCategory).toBe('Healthcare')
      expect(dakInfo.brandColor).toBe('#E4002B')

      const docmorrisInfo = getMerchantBrandInfo('DocMorris Apotheke Bestellung')
      expect(docmorrisInfo.merchant?.id).toBe('docmorris')
      expect(docmorrisInfo.logoComponent).toBe(MERCHANT_LOGOS.DocMorrisLogo)
      expect(docmorrisInfo.suggestedCategory).toBe('Healthcare')
      expect(docmorrisInfo.brandColor).toBe('#008542')

      const obiInfo = getMerchantBrandInfo('OBI Baumarkt Frankfurt')
      expect(obiInfo.merchant?.id).toBe('obi')
      expect(obiInfo.logoComponent).toBe(MERCHANT_LOGOS.ObiLogo)
      expect(obiInfo.suggestedCategory).toBe('Shopping')
      expect(obiInfo.brandColor).toBe('#FF6600')

      const bauhausInfo = getMerchantBrandInfo('Bauhaus Fachcentrum Werkzeuge')
      expect(bauhausInfo.merchant?.id).toBe('bauhaus')
      expect(bauhausInfo.logoComponent).toBe(MERCHANT_LOGOS.BauhausLogo)
      expect(bauhausInfo.suggestedCategory).toBe('Shopping')
      expect(bauhausInfo.brandColor).toBe('#D40000')

      const hornbachInfo = getMerchantBrandInfo('Hornbach Baumarkt Baustoffe')
      expect(hornbachInfo.merchant?.id).toBe('hornbach')
      expect(hornbachInfo.logoComponent).toBe(MERCHANT_LOGOS.HornbachLogo)
      expect(hornbachInfo.suggestedCategory).toBe('Shopping')
      expect(hornbachInfo.brandColor).toBe('#F28C00')

      const allianzInfo = getMerchantBrandInfo('Allianz Versicherung Monatsbeitrag')
      expect(allianzInfo.merchant?.id).toBe('allianz')
      expect(allianzInfo.logoComponent).toBe(MERCHANT_LOGOS.AllianzLogo)
      expect(allianzInfo.suggestedCategory).toBe('Insurance')
      expect(allianzInfo.brandColor).toBe('#003780')

      const hukInfo = getMerchantBrandInfo('HUK-COBURG Haftpflichtversicherung')
      expect(hukInfo.merchant?.id).toBe('huk')
      expect(hukInfo.logoComponent).toBe(MERCHANT_LOGOS.HukLogo)
      expect(hukInfo.suggestedCategory).toBe('Insurance')
      expect(hukInfo.brandColor).toBe('#FFCC00')

      const sixtInfo = getMerchantBrandInfo('Sixt Autovermietung Muenchen Airport')
      expect(sixtInfo.merchant?.id).toBe('sixt')
      expect(sixtInfo.logoComponent).toBe(MERCHANT_LOGOS.SixtLogo)
      expect(sixtInfo.suggestedCategory).toBe('Transport')
      expect(sixtInfo.brandColor).toBe('#FF5F00')

      const mercedesInfo = getMerchantBrandInfo(
        'Mercedes-Benz AG DEUTDEFFXXX DE20500700100092001700 Bitte geben Sie bei Bezahlung Ihre'
      )
      expect(mercedesInfo.merchant?.id).toBe('mercedes')
      expect(mercedesInfo.logoComponent).toBe(MERCHANT_LOGOS.MercedesLogo)
      expect(mercedesInfo.suggestedCategory).toBe('Transport')
      expect(mercedesInfo.brandColor).toBe('#000000')

      const bmwInfo = getMerchantBrandInfo('BMW Bank Niederlassung Muenchen')
      expect(bmwInfo.merchant?.id).toBe('bmw')
      expect(bmwInfo.logoComponent).toBe(MERCHANT_LOGOS.BmwLogo)
      expect(bmwInfo.suggestedCategory).toBe('Transport')
      expect(bmwInfo.brandColor).toBe('#0066B1')

      const vwInfo = getMerchantBrandInfo('Volkswagen Leasing GmbH')
      expect(vwInfo.merchant?.id).toBe('volkswagen')
      expect(vwInfo.logoComponent).toBe(MERCHANT_LOGOS.VolkswagenLogo)
      expect(vwInfo.suggestedCategory).toBe('Transport')
      expect(vwInfo.brandColor).toBe('#001E50')

      const audiInfo = getMerchantBrandInfo('Audi Zentrum Frankfurt')
      expect(audiInfo.merchant?.id).toBe('audi')
      expect(audiInfo.logoComponent).toBe(MERCHANT_LOGOS.AudiLogo)
      expect(audiInfo.suggestedCategory).toBe('Transport')
      expect(audiInfo.brandColor).toBe('#BB0A30')

      const porscheInfo = getMerchantBrandInfo('Porsche Zentrum Stuttgart')
      expect(porscheInfo.merchant?.id).toBe('porsche')
      expect(porscheInfo.logoComponent).toBe(MERCHANT_LOGOS.PorscheLogo)
      expect(porscheInfo.suggestedCategory).toBe('Transport')
      expect(porscheInfo.brandColor).toBe('#D5001C')

      const teslaMotorsInfo = getMerchantBrandInfo('Tesla Motors Germany GmbH')
      expect(teslaMotorsInfo.merchant?.id).toBe('tesla')
      expect(teslaMotorsInfo.logoComponent).toBe(MERCHANT_LOGOS.SiTesla)
      expect(teslaMotorsInfo.suggestedCategory).toBe('Transport')
      expect(teslaMotorsInfo.brandColor).toBe('#E82127')

      const toyotaInfo = getMerchantBrandInfo('Toyota Motor Europe')
      expect(toyotaInfo.merchant?.id).toBe('toyota')
      expect(toyotaInfo.logoComponent).toBe(MERCHANT_LOGOS.SiToyota)
      expect(toyotaInfo.suggestedCategory).toBe('Transport')
      expect(toyotaInfo.brandColor).toBe('#EB0A1E')

      const fordInfo = getMerchantBrandInfo('Ford-Werke GmbH Koeln')
      expect(fordInfo.merchant?.id).toBe('ford')
      expect(fordInfo.logoComponent).toBe(MERCHANT_LOGOS.SiFord)
      expect(fordInfo.suggestedCategory).toBe('Transport')
      expect(fordInfo.brandColor).toBe('#002C6C')

      const tomorrowInfo = getMerchantBrandInfo(
        'ANEL MEMIC - TOMORROW SOBKDEBBXXX DE58110101002097425357 FÜR DIE ZUKUNFT End-to-End-'
      )
      expect(tomorrowInfo.merchant?.id).toBe('tomorrow')
      expect(tomorrowInfo.logoComponent).toBe(MERCHANT_LOGOS.TomorrowLogo)
      expect(tomorrowInfo.suggestedCategory).toBe('Transfers')
      expect(tomorrowInfo.brandColor).toBe('#FF8454')

      const revolutInfo = getMerchantBrandInfo(
        'Anel Memic REVOLT21XXX LT153250000292115687 End-to-End-Ref.: MOB.147.UE.32306'
      )
      expect(revolutInfo.merchant?.id).toBe('revolut')
      expect(revolutInfo.logoComponent).toBe(MERCHANT_LOGOS.RevolutLogo)
      expect(revolutInfo.suggestedCategory).toBe('Transfers')
      expect(revolutInfo.brandColor).toBe('#0075EB')

      const sparkasseInfo = getMerchantBrandInfo('Sparkasse KölnBonn Überweisung')
      expect(sparkasseInfo.merchant?.id).toBe('sparkasse')
      expect(sparkasseInfo.logoComponent).toBe(MERCHANT_LOGOS.SparkasseLogo)
      expect(sparkasseInfo.suggestedCategory).toBe('Transfers')
      expect(sparkasseInfo.brandColor).toBe('#FF0000')

      const direkt1822Info = getMerchantBrandInfo('1822direkt Frankfurter Sparkasse')
      expect(direkt1822Info.merchant?.id).toBe('1822direkt')
      expect(direkt1822Info.logoComponent).toBe(MERCHANT_LOGOS.Direkt1822Logo)
      expect(direkt1822Info.suggestedCategory).toBe('Transfers')
      expect(direkt1822Info.brandColor).toBe('#003A5D')

      const hvbInfo = getMerchantBrandInfo('HypoVereinsbank UniCredit Bank AG')
      expect(hvbInfo.merchant?.id).toBe('hypovereinsbank')
      expect(hvbInfo.logoComponent).toBe(MERCHANT_LOGOS.HypoVereinsbankLogo)
      expect(hvbInfo.suggestedCategory).toBe('Transfers')
      expect(hvbInfo.brandColor).toBe('#E2001A')

      const santanderInfo = getMerchantBrandInfo('Santander Consumer Bank')
      expect(santanderInfo.merchant?.id).toBe('santander')
      expect(santanderInfo.logoComponent).toBe(MERCHANT_LOGOS.SantanderLogo)
      expect(santanderInfo.suggestedCategory).toBe('Transfers')
      expect(santanderInfo.brandColor).toBe('#EC0000')

      const norisbankInfo = getMerchantBrandInfo('norisbank GmbH')
      expect(norisbankInfo.merchant?.id).toBe('norisbank')
      expect(norisbankInfo.logoComponent).toBe(MERCHANT_LOGOS.NorisbankLogo)
      expect(norisbankInfo.suggestedCategory).toBe('Transfers')
      expect(norisbankInfo.brandColor).toBe('#FF5000')

      const glsInfo = getMerchantBrandInfo('GLS Bank Gemeinschaftsbank')
      expect(glsInfo.merchant?.id).toBe('gls-bank')
      expect(glsInfo.logoComponent).toBe(MERCHANT_LOGOS.GlsBankLogo)
      expect(glsInfo.suggestedCategory).toBe('Transfers')
      expect(glsInfo.brandColor).toBe('#00D66C')

      const apobankInfo = getMerchantBrandInfo('apoBank Apotheker- und Ärztebank')
      expect(apobankInfo.merchant?.id).toBe('apobank')
      expect(apobankInfo.logoComponent).toBe(MERCHANT_LOGOS.ApoBankLogo)
      expect(apobankInfo.suggestedCategory).toBe('Transfers')
      expect(apobankInfo.brandColor).toBe('#002060')

      const vividInfo = getMerchantBrandInfo('Vivid Money GmbH')
      expect(vividInfo.merchant?.id).toBe('vivid-money')
      expect(vividInfo.logoComponent).toBe(MERCHANT_LOGOS.VividMoneyLogo)
      expect(vividInfo.suggestedCategory).toBe('Transfers')
      expect(vividInfo.brandColor).toBe('#7928CA')

      const flatexInfo = getMerchantBrandInfo('flatex Bank Depot')
      expect(flatexInfo.merchant?.id).toBe('flatex')
      expect(flatexInfo.logoComponent).toBe(MERCHANT_LOGOS.FlatexLogo)
      expect(flatexInfo.suggestedCategory).toBe('Savings')
      expect(flatexInfo.brandColor).toBe('#F36F21')

      const degiroInfo = getMerchantBrandInfo('DEGIRO B.V. Transaktion')
      expect(degiroInfo.merchant?.id).toBe('degiro')
      expect(degiroInfo.logoComponent).toBe(MERCHANT_LOGOS.DegiroLogo)
      expect(degiroInfo.suggestedCategory).toBe('Savings')
      expect(degiroInfo.brandColor).toBe('#00A4D6')

      const n26Info = getMerchantBrandInfo('N26 Bank GmbH')
      expect(n26Info.merchant?.id).toBe('n26')
      expect(n26Info.logoComponent).toBe(MERCHANT_LOGOS.N26Logo)
      expect(n26Info.suggestedCategory).toBe('Transfers')

      const wiseInfo = getMerchantBrandInfo('Wise Payments Europe')
      expect(wiseInfo.merchant?.id).toBe('wise')
      expect(wiseInfo.logoComponent).toBe(MERCHANT_LOGOS.WiseLogo)
      expect(wiseInfo.suggestedCategory).toBe('Transfers')

      const bunqBankInfo = getMerchantBrandInfo('bunq B.V. Bank')
      expect(bunqBankInfo.merchant?.id).toBe('bunq')
      expect(bunqBankInfo.logoComponent).toBe(MERCHANT_LOGOS.BunqLogo)
      expect(bunqBankInfo.suggestedCategory).toBe('Transfers')

      const paybackInfo = getMerchantBrandInfo('PAYBACK PAY / PAYMORROW WELADEDDXXX DE85300500000071013312 PAYBACK PAY End-to-En')
      expect(paybackInfo.merchant?.id).toBe('payback')
      expect(paybackInfo.logoComponent).toBe(MERCHANT_LOGOS.PaybackLogo)
      expect(paybackInfo.suggestedCategory).toBe('Shopping')
      expect(paybackInfo.brandColor).toBe('#003EB0')

      const kelkheimInfo = getMerchantBrandInfo('STADTKASSE KELKHEIM (TAUNUS) HELADEF1TSK DE34512500000005211530 AZ: 40004836')
      expect(kelkheimInfo.merchant?.id).toBe('stadt-kelkheim')
      expect(kelkheimInfo.logoComponent).toBe(MERCHANT_LOGOS.KelkheimLogo)
      expect(kelkheimInfo.suggestedCategory).toBe('Taxes')
      expect(kelkheimInfo.brandColor).toBe('#DA121A')

      const bookingInfo = getMerchantBrandInfo('PayPal (Europe) S.a r.l. et Cie, S. C.A. . Booking.com BV, Ihr Einkauf bei B ooking.com BV ABBUCHUNG')
      expect(bookingInfo.merchant?.id).toBe('booking')
      expect(bookingInfo.logoComponent).toBe(MERCHANT_LOGOS.BookingLogo)
      expect(bookingInfo.suggestedCategory).toBe('Travel')
      expect(bookingInfo.brandColor).toBe('#003580')

      const gvgInfo = getMerchantBrandInfo('GVG Glasfaser GmbH RG.23565869/KD.10250177 End-to-End-Ref.: 00000023565869102501774490')
      expect(gvgInfo.merchant?.id).toBe('gvg-glasfaser')
      expect(gvgInfo.logoComponent).toBe(MERCHANT_LOGOS.GvgGlasfaserLogo)
      expect(gvgInfo.suggestedCategory).toBe('Communication')

      const gruenweltInfo = getMerchantBrandInfo('Grünwelt Wärmestrom GmbH ABSCHLAG Strom 08/26 VK: 1210005133 32 Gruenwelt Waermestrom')
      expect(gruenweltInfo.merchant?.id).toBe('gruenwelt')
      expect(gruenweltInfo.logoComponent).toBe(MERCHANT_LOGOS.GruenweltLogo)
      expect(gruenweltInfo.suggestedCategory).toBe('Utilities')

      const disneyInfo = getMerchantBrandInfo('PayPal Europe S.a.r.l. et Cie S.C.A 1052099636248/PP.4585.PP/. DisneyPl us, Ihr Einkauf bei DisneyPl')
      expect(disneyInfo.merchant?.id).toBe('disney-plus')
      expect(disneyInfo.logoComponent).toBe(MERCHANT_LOGOS.DisneyPlusLogo)
      expect(disneyInfo.suggestedCategory).toBe('Entertainment')

      const mossInfo = getMerchantBrandInfo('CAFE RESTAURANT MOSS, ZELL AM SEE AT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual DB')
      expect(mossInfo.merchant?.id).toBe('cafe-moss')
      expect(mossInfo.logoComponent).toBe(MERCHANT_LOGOS.CafeMossLogo)
      expect(mossInfo.suggestedCategory).toBe('Dining Out')

      const billaInfo = getMerchantBrandInfo('BILLA DANKT 0005128, ZELL AM SEE A T Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debi')
      expect(billaInfo.merchant?.id).toBe('billa')
      expect(billaInfo.logoComponent).toBe(MERCHANT_LOGOS.BillaLogo)
      expect(billaInfo.suggestedCategory).toBe('Groceries')

      const jugendherbergeInfo = getMerchantBrandInfo('Salzburger Jugendherbe, Zell am See AT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit')
      expect(jugendherbergeInfo.merchant?.id).toBe('salzburger-jugendherberge')
      expect(jugendherbergeInfo.logoComponent).toBe(MERCHANT_LOGOS.SalzburgerJugendherbergeLogo)
      expect(jugendherbergeInfo.suggestedCategory).toBe('Travel')

      const alpePanonInfo = getMerchantBrandInfo('ALPE PANON PE PTUJ, PTUJ SI Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card 20')
      expect(alpePanonInfo.merchant?.id).toBe('alpe-panon')
      expect(alpePanonInfo.logoComponent).toBe(MERCHANT_LOGOS.AlpePanonLogo)
      expect(alpePanonInfo.suggestedCategory).toBe('Dining Out')

      const hallenbadInfo = getMerchantBrandInfo('HALLENBAD ZELL AM SEE, ZELL SEE AT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit')
      expect(hallenbadInfo.merchant?.id).toBe('hallenbad-zellamsee')
      expect(hallenbadInfo.logoComponent).toBe(MERCHANT_LOGOS.HallenbadZellLogo)
      expect(hallenbadInfo.suggestedCategory).toBe('Entertainment')
    })

    it('returns brand info for batch 10 real-world transaction statements', () => {
      const janitosInfo = getMerchantBrandInfo('Janitos Versicherung AG Vertrags-Nr. 6100113945 HR 15.10.20 25-15.10.2026 End-to-End-Ref.: 17602')
      expect(janitosInfo.merchant?.id).toBe('janitos')
      expect(janitosInfo.logoComponent).toBe(MERCHANT_LOGOS.JanitosLogo)
      expect(janitosInfo.suggestedCategory).toBe('Insurance')

      const serwaysInfo = getMerchantBrandInfo('Raststaette Spessart N, Rohrbrunn DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit C')
      expect(serwaysInfo.merchant?.id).toBe('serways')
      expect(serwaysInfo.logoComponent).toBe(MERCHANT_LOGOS.SerwaysLogo)
      expect(serwaysInfo.suggestedCategory).toBe('Dining Out')

      const toomInfo = getMerchantBrandInfo('toom BM Oberursel, OBERURSEL DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Car')
      expect(toomInfo.merchant?.id).toBe('toom')
      expect(toomInfo.logoComponent).toBe(MERCHANT_LOGOS.ToomLogo)
      expect(toomInfo.suggestedCategory).toBe('Shopping')

      const sparInfo = getMerchantBrandInfo('SPAR CABANAS TAVIRA 1, CABANAS TAVI R PT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtu')
      expect(sparInfo.merchant?.id).toBe('spar')
      expect(sparInfo.logoComponent).toBe(MERCHANT_LOGOS.SparLogo)
      expect(sparInfo.suggestedCategory).toBe('Groceries')

      const argumentoInfo = getMerchantBrandInfo('ARGUMENTO DA LUA,LDA, FARO PT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card')
      expect(argumentoInfo.merchant?.id).toBe('argumento-da-lua')
      expect(argumentoInfo.logoComponent).toBe(MERCHANT_LOGOS.ArgumentoDaLuaLogo)
      expect(argumentoInfo.suggestedCategory).toBe('Shopping')

      const delhisBellyInfo = getMerchantBrandInfo('DELHIS BELLY, UNIPES, FARO PT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card 25 ')
      expect(delhisBellyInfo.merchant?.id).toBe('delhis-belly')
      expect(delhisBellyInfo.logoComponent).toBe(MERCHANT_LOGOS.DelhisBellyLogo)
      expect(delhisBellyInfo.suggestedCategory).toBe('Dining Out')

      const goldenClubInfo = getMerchantBrandInfo('SITES CABANAS SA, FARO PT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card 20')
      expect(goldenClubInfo.merchant?.id).toBe('golden-club-cabanas')
      expect(goldenClubInfo.logoComponent).toBe(MERCHANT_LOGOS.GoldenClubCabanasLogo)
      expect(goldenClubInfo.suggestedCategory).toBe('Travel')

      const pizzaHutInfo = getMerchantBrandInfo('PH 822 ESCHBORN DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card PH 822 ESCHBORN DEU 20')
      expect(pizzaHutInfo.merchant?.id).toBe('pizza-hut')
      expect(pizzaHutInfo.logoComponent).toBe(MERCHANT_LOGOS.PizzaHutLogo)
      expect(pizzaHutInfo.suggestedCategory).toBe('Dining Out')
    })

    it('returns brand info for batch 11 real-world transaction statements', () => {
      // 1. rhenag (Rheinische Elektrizitäts- und Gasversorgungsgesellschaft)
      const rhenagInfo = getMerchantBrandInfo('Rheinische Elektrizitäts- und Gasve rsorgungsgesellscha Vertragsnummer 21810010775 1089385- 108')
      expect(rhenagInfo.merchant?.id).toBe('rhenag')
      expect(rhenagInfo.logoComponent).toBe(MERCHANT_LOGOS.RhenagLogo)
      expect(rhenagInfo.suggestedCategory).toBe('Utilities')

      // 2. Rats-Apotheke
      const ratsApoInfo = getMerchantBrandInfo('RATS APOTHEKE sagt Danke GIR 799135 2022-03-12T09:28:55 KFN 0 VJ 2412 Kartenzahlung')
      expect(ratsApoInfo.merchant?.id).toBe('apotheke')
      expect(ratsApoInfo.logoComponent).toBe(MERCHANT_LOGOS.ApothekeLogo)
      expect(ratsApoInfo.suggestedCategory).toBe('Healthcare')

      // 3. Thong Thai Thai Restaurant
      const thongThaiInfo = getMerchantBrandInfo('Thong Thai GmbH Co. KG/Rödelheimer 2022-03-26T13:28:44 KFN 0 VJ 2412 Kartenzahlung')
      expect(thongThaiInfo.merchant?.id).toBe('thong-thai')
      expect(thongThaiInfo.logoComponent).toBe(MERCHANT_LOGOS.ThongThaiLogo)
      expect(thongThaiInfo.suggestedCategory).toBe('Dining Out')

      // 4. Reifen-Diehl Eschborn
      const reifenDiehlInfo = getMerchantBrandInfo('REIFEN-DIEHL.ESCHBORN//Eschborn/DE 2022-04-30T12:41:00 KFN 0 VJ 2412 Kartenzahlung')
      expect(reifenDiehlInfo.merchant?.id).toBe('reifen-diehl')
      expect(reifenDiehlInfo.logoComponent).toBe(MERCHANT_LOGOS.ReifenDiehlLogo)
      expect(reifenDiehlInfo.suggestedCategory).toBe('Transport')

      // 5. STONES Menswear
      const stonesInfo = getMerchantBrandInfo('STONES GMBH 120510420024424241253413150 ELV6534 1315 12.05 10.42 ME0 End-to-End-Ref.: 12')
      expect(stonesInfo.merchant?.id).toBe('stones')
      expect(stonesInfo.logoComponent).toBe(MERCHANT_LOGOS.StonesLogo)
      expect(stonesInfo.suggestedCategory).toBe('Shopping')

      // 6. Liebig-Apotheke Bad Homburg
      const liebigApoInfo = getMerchantBrandInfo('LIEBIG-APOTHEKE//BAD HOMBURG/DE 2022-05-24T10:32:50 KFN 0 VJ 2412 Kartenzahlung')
      expect(liebigApoInfo.merchant?.id).toBe('apotheke')
      expect(liebigApoInfo.logoComponent).toBe(MERCHANT_LOGOS.ApothekeLogo)
      expect(liebigApoInfo.suggestedCategory).toBe('Healthcare')

      // 7. BabyOne Baby- & Kinderausstattung
      const babyOneInfo = getMerchantBrandInfo('BabyOne B+K Nr.45 GmbH Fil 015 GIR 2022-07-08T12:50:27 KFN 0 VJ 2412 Kartenzahlung')
      expect(babyOneInfo.merchant?.id).toBe('babyone')
      expect(babyOneInfo.logoComponent).toBe(MERCHANT_LOGOS.BabyOneLogo)
      expect(babyOneInfo.suggestedCategory).toBe('Shopping')

      // 8. Anadolu Supermarkt
      const anadoluInfo = getMerchantBrandInfo('ANADOLU SUPERMARKT GIR 69287732//BA 2022-07-09T12:24:08 KFN 0 VJ 2412 Kartenzahlung')
      expect(anadoluInfo.merchant?.id).toBe('anadolu-supermarkt')
      expect(anadoluInfo.logoComponent).toBe(MERCHANT_LOGOS.AnadoluSupermarktLogo)
      expect(anadoluInfo.suggestedCategory).toBe('Groceries')

      // 9. ebase (European Bank for Financial Services)
      const ebaseInfo = getMerchantBrandInfo('European Bank for Financial Service s GmbH 9914335757302 Kauf 0,074908 Ant am 06.09.2022 zu 3')
      expect(ebaseInfo.merchant?.id).toBe('ebase')
      expect(ebaseInfo.logoComponent).toBe(MERCHANT_LOGOS.EbaseLogo)
      expect(ebaseInfo.suggestedCategory).toBe('Savings')

      // 10. MyShoes SE
      const myShoesInfo = getMerchantBrandInfo('MyShoes SE//Friedrichsdorf/DE 2022-09-03T13:20:44 KFN 0 VJ 2412 Kartenzahlung')
      expect(myShoesInfo.merchant?.id).toBe('myshoes')
      expect(myShoesInfo.logoComponent).toBe(MERCHANT_LOGOS.MyShoesLogo)
      expect(myShoesInfo.suggestedCategory).toBe('Shopping')

      // 11. TEDi Filiale 4912 Bad Homburg
      const tediInfo = getMerchantBrandInfo('TEDi Fil. 4912//Bad Homburg/DE 2022-11-08T16:06:57 KFN 0 VJ 2412 Kartenzahlung')
      expect(tediInfo.merchant?.id).toBe('tedi')
      expect(tediInfo.logoComponent).toBe(MERCHANT_LOGOS.TediLogo)
      expect(tediInfo.suggestedCategory).toBe('Shopping')

      // 12. Kontoführung Commerzbank
      const kfInfo = getMerchantBrandInfo('Kontoführung Konto 646293100 EUR BLZ 500 400 00 vom 01.02.2023 bis 28.02.2023 Kontoführung')
      expect(kfInfo.merchant?.id).toBe('commerzbank')
      expect(kfInfo.logoComponent).toBe(MERCHANT_LOGOS.SiCommerzbank)

      // 13. Commerzbank SEPA transfer (BIC COBADEFFXXX)
      const cobadeffInfo = getMerchantBrandInfo('ANEL MEMIC COBADEFFXXX DE13500400000931368501 5232249017507296 End-to-End-Ref.: MO')
      expect(cobadeffInfo.merchant?.id).toBe('commerzbank')
      expect(cobadeffInfo.logoComponent).toBe(MERCHANT_LOGOS.SiCommerzbank)
      expect(cobadeffInfo.suggestedCategory).toBe('Transfers')

      // 14. KMK Immobilienverwaltung / WEG Landwehrweg
      const kmkInfo = getMerchantBrandInfo('WEG Landwehrweg 1, 61350 z. Hd. KMK Immobilienverw. GmbH 556.101701 Memic Biljana Lastschrif t')
      expect(kmkInfo.merchant?.id).toBe('kmk-immobilien')
      expect(kmkInfo.logoComponent).toBe(MERCHANT_LOGOS.KmkImmobilienLogo)
      expect(kmkInfo.suggestedCategory).toBe('Rent')

      // 15. FNZ Bank AG (formerly ebase)
      const fnzInfo = getMerchantBrandInfo('FNZ Bank AG (ehemals ebase AG) 9914335757302 Kauf 0,077528 Ant am 05.10.2023 zu 322,465500')
      expect(fnzInfo.merchant?.id).toBe('fnz-bank')
      expect(fnzInfo.logoComponent).toBe(MERCHANT_LOGOS.FnzBankLogo)
      expect(fnzInfo.suggestedCategory).toBe('Savings')

      // 16. Ratsstube Restaurant Rothenburg
      const ratsstubeInfo = getMerchantBrandInfo('Ratsstube Restaurant Rothenburg ob DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card Ratsstube R')
      expect(ratsstubeInfo.merchant?.id).toBe('ratsstube')
      expect(ratsstubeInfo.logoComponent).toBe(MERCHANT_LOGOS.RatsstubeLogo)
      expect(ratsstubeInfo.suggestedCategory).toBe('Dining Out')

      // 17. sander Hotel Koblenz
      const sanderInfo = getMerchantBrandInfo('sander Hotel Koblenz DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card sander Hotel Koblenz DEU 2')
      expect(sanderInfo.merchant?.id).toBe('sander-hotel')
      expect(sanderInfo.logoComponent).toBe(MERCHANT_LOGOS.SanderHotelLogo)
      expect(sanderInfo.suggestedCategory).toBe('Travel')

      // 18. Smoothie Bar Antalya
      const smoothieInfo = getMerchantBrandInfo('SMOOTHIE BAR ANTALYA TR Karte Nr. 5355 3100 0931 8380 Virtual Debit Card SMOOTHIE BAR ANTI')
      expect(smoothieInfo.merchant?.id).toBe('smoothie-bar-antalya')
      expect(smoothieInfo.logoComponent).toBe(MERCHANT_LOGOS.SmoothieBarAntalyaLogo)
      expect(smoothieInfo.suggestedCategory).toBe('Dining Out')

      // 19. ICTUR Antalya Airport Dining
      const icturInfo = getMerchantBrandInfo('ICTUR YIYECEK VE ICECE ANTALYA TR Karte Nr. 5355 3100 0931 8380 Virtual Debit Card ICTUR YIYE')
      expect(icturInfo.merchant?.id).toBe('ictur')
      expect(icturInfo.logoComponent).toBe(MERCHANT_LOGOS.IcturLogo)
      expect(icturInfo.suggestedCategory).toBe('Dining Out')

      // 20. Hrvatske autoceste (HAC A3 Velika Kopanica)
      const hacInfo = getMerchantBrandInfo('AUTOCESTA A3 V.KOPANIC VELIKA KOPA N HR Karte Nr. 5355 3100 0931 8380 Virtual Debit Card AU')
      expect(hacInfo.merchant?.id).toBe('hac-autoceste')
      expect(hacInfo.logoComponent).toBe(MERCHANT_LOGOS.HacAutocesteLogo)
      expect(hacInfo.suggestedCategory).toBe('Transport')

      // 21. Wasserpalast Graz-Liebenau
      const wasserpalastInfo = getMerchantBrandInfo('WASSERPALAST GRAZ-LIEBENAU AT Karte Nr. 5355 3100 0931 8380 Virtual Debit Card WASSERPAL')
      expect(wasserpalastInfo.merchant?.id).toBe('wasserpalast')
      expect(wasserpalastInfo.logoComponent).toBe(MERCHANT_LOGOS.WasserpalastLogo)
      expect(wasserpalastInfo.suggestedCategory).toBe('Dining Out')

      // 22. toom Baumarkt
      const toomInfo = getMerchantBrandInfo('toom BM Oberursel, OBERURSEL DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Car')
      expect(toomInfo.merchant?.id).toBe('toom')
      expect(toomInfo.logoComponent).toBe(MERCHANT_LOGOS.ToomLogo)
      expect(toomInfo.suggestedCategory).toBe('Shopping')
    })

    it('returns brand info using fallback icon for merchants without brand logos', () => {
      const info = getMerchantBrandInfo('Bingo')
      expect(info.merchant).toBeDefined()
      expect(info.logoComponent).toBe(AVAILABLE_ICONS.ShoppingCart)
      expect(info.brandColor).toBe('#E30613')
      expect(info.suggestedCategory).toBe('Groceries')
      expect(info.initials).toBe('BI')
    })

    it('generates deterministic fallback color and initials for unknown merchants', () => {
      const info1 = getMerchantBrandInfo('Corner Bakery')
      const info2 = getMerchantBrandInfo('Corner Bakery')

      expect(info1.merchant).toBeUndefined()
      expect(info1.logoComponent).toBeUndefined()
      expect(info1.suggestedCategory).toBeUndefined()
      expect(info1.initials).toBe('CB')
      expect(info1.brandColor).toMatch(/^#[0-9a-f]{6}$/i)
      // Deterministic: same name produces exact same color
      expect(info1.brandColor).toBe(info2.brandColor)
    })

    it('handles single-word unknown merchant initials', () => {
      const info = getMerchantBrandInfo('Boutique')
      expect(info.initials).toBe('BO')
    })

    it('handles empty or whitespace merchant name gracefully', () => {
      const info = getMerchantBrandInfo('   ')
      expect(info.initials).toBe('TX')
      expect(info.brandColor).toBeTruthy()
    })

    it('handles single-letter merchant name gracefully', () => {
      const info = getMerchantBrandInfo('X')
      expect(info.initials).toBe('X')
      expect(info.brandColor).toBeTruthy()
    })
  })
})
