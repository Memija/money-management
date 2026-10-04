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
    }, 15000)

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
      expect(bunqInfo.logoComponent).toBe(MERCHANT_LOGOS.SiBunq)

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
