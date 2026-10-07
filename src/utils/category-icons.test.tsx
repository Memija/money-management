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
    }, 60000)

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

      const truncatedTxDesc =
        'GERMANY rel CITIDEFFXXX DE11502109000209865084 40233251 End-to-End-Ref.: CCB.119.UE.569708'
      const truncatedBrand = getMerchantBrandInfo(truncatedTxDesc)
      expect(truncatedBrand.merchant?.id).toBe('dell')
      expect(truncatedBrand.merchant?.name).toBe('Dell')
      expect(truncatedBrand.logoComponent).toBe(MERCHANT_LOGOS.DellLogo)
      expect(truncatedBrand.brandColor).toBe('#007DB8')
      expect(truncatedBrand.suggestedCategory).toBe('Shopping')
    })

    it('matches Commerzbank brand and suggests Salary for business trip expense reimbursement', () => {
      const txDesc =
        'COMMERZBANK AG ZENTRALE FRANKFURT REISESP.09.05.2023/03700093 End-to-End-Ref.: NOTPROVIDED Kundenreferenz: 0003461317'
      const brand = getMerchantBrandInfo(txDesc)
      expect(brand.merchant?.id).toBe('commerzbank')
      expect(brand.merchant?.name).toBe('Commerzbank')
      expect(brand.logoComponent).toBe(MERCHANT_LOGOS.SiCommerzbank)
      expect(brand.brandColor).toBe('#FFD700')
      expect(brand.suggestedCategory).toBe('Salary')
    })

    it('matches Commerzbank brand and suggests Bank Fees for fee refund / return of previously charged banking transactions', () => {
      const txDesc =
        'Commerzbank AG Rueckverguetung fuer 2024/KDNR: 400 6462931/PERSNR: 6832901 End-to-End-Ref.: 2024-1-0035357 Kundenreferenz: 2024-1'
      const brand = getMerchantBrandInfo(txDesc)
      expect(brand.merchant?.id).toBe('commerzbank')
      expect(brand.merchant?.name).toBe('Commerzbank')
      expect(brand.logoComponent).toBe(MERCHANT_LOGOS.SiCommerzbank)
      expect(brand.brandColor).toBe('#FFD700')
      expect(brand.suggestedCategory).toBe('Bank Fees')
    })

    it('matches Commerzbank brand and suggests Salary for card return (Rücküberweisung) for business travel', () => {
      const txDesc =
        'Commerzbank AG Rücküberweisung von Karte Nr.   5232 2XXXXXX07296   Anel Memic Card-ID:  5520009001872996 End-to-End-Ref.: null Kundenreferenz: a9d752972a1043a18e7805b6647ed5fa'
      const brand = getMerchantBrandInfo(txDesc)
      expect(brand.merchant?.id).toBe('commerzbank')
      expect(brand.merchant?.name).toBe('Commerzbank')
      expect(brand.logoComponent).toBe(MERCHANT_LOGOS.CommerzbankLogo)
      expect(brand.brandColor).toBe('#FFD700')
      expect(brand.suggestedCategory).toBe('Salary')
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
      ['Debeka Versicherung', 'debeka', 'DebekaLogo', 'Insurance'],
      ['AXA Krankenversicherung Aktiengesel Krankenvers. 493886204X ERSTBTR 10/ 21 9,17 EUR End-to-End-Ref.: 545020471096/0003 Mandatsref: 21054199212 Gläubiger-ID: DE23G0100000066097 SEPA-BASISLASTSCHRIFT wiederholend', 'axa', 'AxaLogo', 'Healthcare'],
      ['Debeka Krankenversicherung a.G.', 'debeka', 'DebekaLogo', 'Healthcare'],
      ['ERGO Versicherung', 'ergo', 'ErgoLogo', 'Insurance'],
      ['AXA Konzern AG', 'axa', 'AxaLogo', 'Insurance'],
      ['AXA Versicherung Aktiengesellschaft Kfz-Versicherung 88331191217 MTK-BA  117 BTR. 04/22 89,52 EUR End-to-End-Ref.: 580024561334/0001 Mandatsref: 21054199212 Gläubiger-ID: DE23G0100000066097 SEPA-BASISLASTSCHRIFT wiederholend', 'axa', 'AxaLogo', 'Insurance'],
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
      ['iptiQ Life SA AeguronRisikoLV 04/26 6267061-P End-to-End-Ref.: de3e4c7022094659943152a87c2', 'aeguron', 'AeguronLogo', 'Insurance'],
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
      const userGerichtskasseTx =
        'Gerichtkasse HELADEFFXXX DE73500500000001006030 X046135102025X End-to-End-Ref.: CCB.281.UE.280744'

      for (const tx of [gerichtskasseTx, userGerichtskasseTx]) {
        const icon = getCategoryIcon('Taxes', 20, undefined, tx)
        expect(React.isValidElement(icon)).toBe(true)
        if (React.isValidElement(icon)) {
          expect(icon.type).toBe(MERCHANT_LOGOS.HessenLogo)
        }

        const info = getMerchantBrandInfo(tx)
        expect(info.merchant?.id).toBe('gerichtskasse')
        expect(info.merchant?.name).toBe('Gerichtskasse (Justiz Hessen)')
        expect(info.logoComponent).toBe(MERCHANT_LOGOS.HessenLogo)
        expect(info.brandColor).toBe('#004B93')
        expect(info.suggestedCategory).toBe('Taxes')
      }
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
      expect(svg).toHaveAttribute('data-brand-logo', 'true')
      expect(svg?.classList.contains('brand-logo-full')).toBe(true)
    })

    it('renders CommerzbankLogo successfully into the DOM using BankImage', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Salary',
            24,
            undefined,
            'Commerzbank AG Rücküberweisung von Karte Nr.   5232 2XXXXXX07296   Anel Memic Card-ID:  5520009001872996 End-to-End-Ref.: null Kundenreferenz: a9d752972a1043a18e7805b6647ed5fa',
          )}
        </div>,
      )
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('alt', 'Commerzbank')
      expect(img).toHaveAttribute('src', '/banks/commerzbank.png')
    })

    it('renders TomorrowLogo with brand-logo-full and data-brand-logo attributes', () => {
      const { container } = render(
        <div>{getCategoryIcon('Transfers', 24, undefined, 'Tomorrow Bank')}</div>,
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-label', 'Tomorrow Bank')
      expect(svg).toHaveAttribute('data-brand-logo', 'true')
      expect(svg?.classList.contains('brand-logo-full')).toBe(true)
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
      expect(info.logoComponent).toBe(MERCHANT_LOGOS.BurgerKingLogo)
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

      // 14. KMK Immobilienverwaltung (with KMK in name -> belongs to KMK Immobilienverwaltung)
      const kmkInfo = getMerchantBrandInfo('WEG Landwehrweg 1, 61350 z. Hd. KMK   Immobilienverw. GmbH 556.101701 Memic Biljana Lastschrif t 12/2024 End-to-End-Ref.: 556/101701 Mandatsref: cc8047803f024820a564798436fd3d31 Gläubiger-ID: DE13ZZZ00000579310 SEPA-BASISLASTSCHRIFT wiederholend')
      expect(kmkInfo.merchant?.id).toBe('kmk-immobilien')
      expect(kmkInfo.merchant?.name).toBe('KMK Immobilienverwaltung')
      expect(kmkInfo.logoComponent).toBe(MERCHANT_LOGOS.KmkImmobilienLogo)
      expect(kmkInfo.suggestedCategory).toBe('Rent')

      // 14b. WEG Landwehrweg 1 (without KMK in name -> no custom brand merchant, uses default category icons)
      const wegInfo = getMerchantBrandInfo('WEG Landwehrweg 1, 61350 Bad Hombur g Monatliches Hausgeld Landwehrweg End-to-End-Ref.: NOTPROVIDED Mandatsref: LANDWEHRCC25 Gläubiger-ID: DE85ZZZ00002471357 SEPA-BASISLASTSCHRIFT wiederholend')
      expect(wegInfo.merchant).toBeUndefined()
      expect(wegInfo.logoComponent).toBeUndefined()
      expect(wegInfo.initials).toBeTruthy()
      expect(wegInfo.brandColor).toBeTruthy()

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

      // Batch 12:
      // 1. mobilezone GmbH / HIGH mobile
      const mobilezoneInfo = getMerchantBrandInfo('mobilezone GmbH 3243033328 End-to-End-Ref.: 0077110000ZV2612446Z Mandatsref: HIGH-16540')
      expect(mobilezoneInfo.merchant?.id).toBe('mobilezone')
      expect(mobilezoneInfo.logoComponent).toBe(MERCHANT_LOGOS.MobilezoneLogo)
      expect(mobilezoneInfo.suggestedCategory).toBe('Communication')

      // 2. Kontoführung Commerzbank
      const kf2026Info = getMerchantBrandInfo('Kontoführung Konto 646293100 EUR BLZ 500 400 00 vom 01.06.2026 bis 30.06.2026 Kontoführung')
      expect(kf2026Info.merchant?.id).toBe('commerzbank')
      expect(kf2026Info.logoComponent).toBe(MERCHANT_LOGOS.SiCommerzbank)

      // 3. Stadtkasse Bad Nauheim
      const badNauheimInfo = getMerchantBrandInfo('STADTKASSE BAD NAUHEIM PBNKDEFFXXX DE34440100460141202460 0298350131 End-to-End-R')
      expect(badNauheimInfo.merchant?.id).toBe('stadt-bad-nauheim')
      expect(badNauheimInfo.logoComponent).toBe(MERCHANT_LOGOS.BadNauheimLogo)
      expect(badNauheimInfo.suggestedCategory).toBe('Taxes')

      // 4. Kronberg Talstation Jakobsbad CH
      const kronbergInfo = getMerchantBrandInfo('Kronberg Talstation, Jakobsbad CH Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card')
      expect(kronbergInfo.merchant?.id).toBe('kronberg')
      expect(kronbergInfo.logoComponent).toBe(MERCHANT_LOGOS.KronbergLogo)
      expect(kronbergInfo.suggestedCategory).toBe('Entertainment')

      // 5. SEA LIFE Konstanz GmbH
      const seaLifeInfo = getMerchantBrandInfo('SEA LIFE Konstanz GmbH, Hamburg DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit')
      expect(seaLifeInfo.merchant?.id).toBe('sea-life')
      expect(seaLifeInfo.logoComponent).toBe(MERCHANT_LOGOS.SeaLifeLogo)
      expect(seaLifeInfo.suggestedCategory).toBe('Entertainment')

      // 6. Hotel Neckarlux Heidelberg
      const neckarluxInfo = getMerchantBrandInfo('HOTEL NECKARLUX INH. CUENE//HEIDELB 2026-04-18T15:59:01 KFN 0 VJ 2812 Kartenzahlung')
      expect(neckarluxInfo.merchant?.id).toBe('hotel-neckarlux')
      expect(neckarluxInfo.logoComponent).toBe(MERCHANT_LOGOS.HotelNeckarluxLogo)
      expect(neckarluxInfo.suggestedCategory).toBe('Travel')

      // 7. authentic play GmbH (PayPal)
      const authenticPlayInfo = getMerchantBrandInfo('PayPal Europe S.a.r.l. et Cie S.C.A 1048027847722/PP.4585.PP/. authenti c play GmbH, Ihr Einkauf bei')
      expect(authenticPlayInfo.merchant?.id).toBe('authentic-play')
      expect(authenticPlayInfo.logoComponent).toBe(MERCHANT_LOGOS.AuthenticPlayLogo)
      expect(authenticPlayInfo.suggestedCategory).toBe('Shopping')

      // 8. Chidoba Mexican Grill Sulzbach
      const chidobaInfo = getMerchantBrandInfo('Chidoba Mexican Grill, Sulzbach DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Car')
      expect(chidobaInfo.merchant?.id).toBe('chidoba')
      expect(chidobaInfo.logoComponent).toBe(MERCHANT_LOGOS.ChidobaLogo)
      expect(chidobaInfo.suggestedCategory).toBe('Dining Out')

      // 9. Store 3798 Bad Homburg
      const badHomburgStoreInfo = getMerchantBrandInfo('3798 Bad Homburg von d, Bad Homburg v DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual')
      expect(badHomburgStoreInfo.merchant?.id).toBe('bad-homburg-store')
      expect(badHomburgStoreInfo.logoComponent).toBe(MERCHANT_LOGOS.BadHomburgRetailLogo)
      expect(badHomburgStoreInfo.suggestedCategory).toBe('Dining Out')

      // 10. CPC Parkhaus Nürnberg
      const cpcInfo = getMerchantBrandInfo('CPC Parkhaus Nuernberg, Nuernberg DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debi')
      expect(cpcInfo.merchant?.id).toBe('cpc-parkhaus')
      expect(cpcInfo.logoComponent).toBe(MERCHANT_LOGOS.CpcParkhausLogo)
      expect(cpcInfo.suggestedCategory).toBe('Transport')

      // 11. FAO Eating Point Faro Airport
      const eatingPointInfo = getMerchantBrandInfo('FAO EATING POINT, FARO PT Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card 2025')
      expect(eatingPointInfo.merchant?.id).toBe('eating-point')
      expect(eatingPointInfo.logoComponent).toBe(MERCHANT_LOGOS.EatingPointLogo)
      expect(eatingPointInfo.suggestedCategory).toBe('Dining Out')

      // 12. DJH Jugendherberge Nürnberg Kaiserburg
      const jhInfo = getMerchantBrandInfo('Jugendherberge Nuernbe, Nuernberg DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit')
      expect(jhInfo.merchant?.id).toBe('jugendherberge-nuernberg')
      expect(jhInfo.logoComponent).toBe(MERCHANT_LOGOS.JugendherbergeNuernbergLogo)
      expect(jhInfo.suggestedCategory).toBe('Travel')

      // 13. Volkshochschule Bad Homburg
      const vhsInfo = getMerchantBrandInfo('VOLKSHOCHSCHULE//BAD HOMBURG/DE 2024-11-19T09:28:16 KFN 0 VJ 2412 Kartenzahlung')
      expect(vhsInfo.merchant?.id).toBe('vhs-bad-homburg')
      expect(vhsInfo.logoComponent).toBe(MERCHANT_LOGOS.VhsBadHomburgLogo)
      expect(vhsInfo.suggestedCategory).toBe('Education')

      // 14. Rasthaus Göttingen Ost Rosdorf
      const rasthausInfo = getMerchantBrandInfo('Rasthaus Goettingen Os Rosdorf DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card Rasthaus Goetti')
      expect(rasthausInfo.merchant?.id).toBe('rasthaus-goettingen')
      expect(rasthausInfo.logoComponent).toBe(MERCHANT_LOGOS.RasthausGoettingenLogo)
      expect(rasthausInfo.suggestedCategory).toBe('Dining Out')

      // 15. Burger King Rosdorf (BK 31590 SOT Rosdorf)
      const bkInfo = getMerchantBrandInfo('BK 31590 SOT ROSDORF DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card BK 31590 SOT ROSDO')
      expect(bkInfo.merchant?.id).toBe('burgerking')
      expect(bkInfo.logoComponent).toBe(MERCHANT_LOGOS.BurgerKingLogo)
      expect(bkInfo.suggestedCategory).toBe('Dining Out')

      // 16. Wiener Feinbäckerei Heberer Mühlheim
      const wienerInfo = getMerchantBrandInfo('WIENER FEINBACKEREI 1 Muhlheim am M DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card WIENE')
      expect(wienerInfo.merchant?.id).toBe('wiener-feinbaeckerei')
      expect(wienerInfo.logoComponent).toBe(MERCHANT_LOGOS.WienerFeinbaeckereiLogo)
      expect(wienerInfo.suggestedCategory).toBe('Dining Out')

      // 17. Köschinger Forst Ost Hepberg
      const koeschingerInfo = getMerchantBrandInfo('Koeschinger Forst Ost Hepberg DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card Koeschinger For')
      expect(koeschingerInfo.merchant?.id).toBe('koeschinger-forst')
      expect(koeschingerInfo.logoComponent).toBe(MERCHANT_LOGOS.KoeschingerForstLogo)
      expect(koeschingerInfo.suggestedCategory).toBe('Dining Out')
    })

    it('accurately resolves brand logos and categories for PayPal intermediary purchases and direct account debits', () => {
      // 1. eToro (Europe) Limited -> eToro (Savings, EtoroLogo)
      const etoroTx =
        'yPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . Etoro (Europe) Limited , Ihr Einkauf bei Etoro (Euro'
      const etoroInfo = getMerchantBrandInfo(etoroTx)
      expect(etoroInfo.merchant?.id).toBe('etoro')
      expect(etoroInfo.merchant?.name).toBe('eToro')
      expect(etoroInfo.logoComponent).toBe(MERCHANT_LOGOS.EtoroLogo)
      expect(etoroInfo.suggestedCategory).toBe('Savings')
      expect(etoroInfo.initials).toBe('ET')

      // 2. Xsolla HK Limited -> Xsolla (Entertainment, XsollaLogo)
      const xsollaTx =
        'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . Xsolla HK Limited, Ihr Einkauf bei Xsolla HK Limite'
      const xsollaInfo = getMerchantBrandInfo(xsollaTx)
      expect(xsollaInfo.merchant?.id).toBe('xsolla')
      expect(xsollaInfo.merchant?.name).toBe('Xsolla')
      expect(xsollaInfo.logoComponent).toBe(MERCHANT_LOGOS.XsollaLogo)
      expect(xsollaInfo.suggestedCategory).toBe('Entertainment')
      expect(xsollaInfo.initials).toBe('XS')

      // 3. Avaaz Foundation -> Avaaz (Shopping, AvaazLogo)
      const avaazTx =
        'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . Avaaz Foundation, Ihr Einkauf bei Avaaz Foundatio'
      const avaazInfo = getMerchantBrandInfo(avaazTx)
      expect(avaazInfo.merchant?.id).toBe('avaaz')
      expect(avaazInfo.merchant?.name).toBe('Avaaz')
      expect(avaazInfo.logoComponent).toBe(MERCHANT_LOGOS.AvaazLogo)
      expect(avaazInfo.suggestedCategory).toBe('Shopping')
      expect(avaazInfo.initials).toBe('AV')

      // 4. Direct PayPal account debit (ABBUCHUNG VOM PAYPAL-KO NTO) -> PayPal (Transfers, SiPaypal)
      const paypalDebitTx =
        'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP ABBUCHUNG VOM PAYPAL-KO NTO End-to-End-Ref'
      const paypalDebitInfo = getMerchantBrandInfo(paypalDebitTx)
      expect(paypalDebitInfo.merchant?.id).toBe('paypal')
      expect(paypalDebitInfo.merchant?.name).toBe('PayPal')
      expect(paypalDebitInfo.logoComponent).toBe(MERCHANT_LOGOS.SiPaypal)
      expect(paypalDebitInfo.suggestedCategory).toBe('Transfers')
      expect(paypalDebitInfo.initials).toBe('PA')

      // 5. Kalea GmbH -> Kalea (Shopping, KaleaLogo)
      const kaleaTx =
        'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . Kalea GmbH, Ihr Einkau f bei Kalea GmbH End-to-E'
      const kaleaInfo = getMerchantBrandInfo(kaleaTx)
      expect(kaleaInfo.merchant?.id).toBe('kalea')
      expect(kaleaInfo.merchant?.name).toBe('Kalea')
      expect(kaleaInfo.logoComponent).toBe(MERCHANT_LOGOS.KaleaLogo)
      expect(kaleaInfo.brandColor).toBe('#1C2536')
      expect(kaleaInfo.suggestedCategory).toBe('Shopping')
      expect(kaleaInfo.initials).toBe('KA')

      // 6. Cyberport GmbH -> Cyberport (Shopping, CyberportLogo)
      const cyberportTx =
        'PayPal Europe S.a.r.l. et Cie S.C.A 1026469639646 . Cyberport GmbH, Ih r Einkauf bei Cyberport GmbH'
      const cyberportInfo = getMerchantBrandInfo(cyberportTx)
      expect(cyberportInfo.merchant?.id).toBe('cyberport')
      expect(cyberportInfo.merchant?.name).toBe('Cyberport')
      expect(cyberportInfo.logoComponent).toBe(MERCHANT_LOGOS.CyberportLogo)
      expect(cyberportInfo.suggestedCategory).toBe('Shopping')
      expect(cyberportInfo.initials).toBe('CY')

      // 7. Unknown online merchant via PayPal -> NOT assigned to PayPal!
      const unknownShopTx =
        'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . UnknownShop123, Ihr Einkauf bei UnknownShop123'
      const unknownInfo = getMerchantBrandInfo(unknownShopTx)
      expect(unknownInfo.merchant).toBeUndefined()
      expect(unknownInfo.logoComponent).toBeUndefined()
      // Initials derived from the actual merchant 'UnknownShop123', NOT 'PayPal' or 'PE'
      expect(unknownInfo.initials).toBe('UN')
    })

    it('renders the 5 new brand logos into the DOM via getCategoryIcon', () => {
      // 1. EtoroLogo
      const { container: c1 } = render(
        <div>{getCategoryIcon('Savings', 24, undefined, 'Etoro (Europe) Limited Trading')}</div>,
      )
      const img1 = c1.querySelector('img')
      expect(img1).toBeInTheDocument()
      expect(img1).toHaveAttribute('aria-label', 'eToro')

      // 2. XsollaLogo
      const { container: c2 } = render(
        <div>{getCategoryIcon('Entertainment', 24, undefined, 'Xsolla HK Limited Game Checkout')}</div>,
      )
      const img2 = c2.querySelector('img')
      expect(img2).toBeInTheDocument()
      expect(img2).toHaveAttribute('aria-label', 'Xsolla')

      // 3. AvaazLogo
      const { container: c3 } = render(
        <div>{getCategoryIcon('Shopping', 24, undefined, 'Avaaz Foundation Donation')}</div>,
      )
      const img3 = c3.querySelector('img')
      expect(img3).toBeInTheDocument()
      expect(img3).toHaveAttribute('aria-label', 'Avaaz')

      // 4. KaleaLogo
      const { container: c4 } = render(
        <div>{getCategoryIcon('Shopping', 24, undefined, 'Kalea GmbH Bier-Abo')}</div>,
      )
      const img4 = c4.querySelector('img')
      expect(img4).toBeInTheDocument()
      expect(img4).toHaveAttribute('aria-label', 'Kalea')

      // 5. CyberportLogo
      const { container: c5 } = render(
        <div>{getCategoryIcon('Shopping', 24, undefined, 'Cyberport GmbH Electronics')}</div>,
      )
      const img5 = c5.querySelector('img')
      expect(img5).toBeInTheDocument()
      expect(img5).toHaveAttribute('aria-label', 'Cyberport')
    })

    it('correctly resolves merchant brand info and logos for the 25 European transactions', () => {
      // 1. Anonymous PayPal checkout -> merchant cannot be discovered, falls back to PayPal logo
      const anonInfo = getMerchantBrandInfo(
        'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . , Ihr Einkauf bei End-to-End-Ref.: 1016591806959',
      )
      expect(anonInfo.merchant?.id).toBe('paypal')
      expect(anonInfo.logoComponent).toBe(MERCHANT_LOGOS.SiPaypal)
      expect(anonInfo.initials).toBe('PA')

      // 2. RDPTS GmbH
      const rdptsInfo = getMerchantBrandInfo(
        'PayPal (Europe) S.a.r.l. et Cie., S .C.A. PP.4585.PP . RDPTS GmbH, Ihr Einkau f bei RDPTS GmbH End-t',
      )
      expect(rdptsInfo.merchant?.name).toBe('RDPTS')
      expect(rdptsInfo.logoComponent).toBe(MERCHANT_LOGOS.RdptsLogo)
      expect(rdptsInfo.suggestedCategory).toBe('Shopping')
      expect(rdptsInfo.initials).toBe('RD')

      // 3. DM Bad Homburg
      const dmInfo = getMerchantBrandInfo(
        'DM FIL.2146 H:65251//BAD HOMBURG/DE 2022-05-23T10:55:48 KFN 0 VJ 2412 Kartenzahlung',
      )
      expect(dmInfo.merchant?.name).toBe('dm-drogerie markt')
      expect(dmInfo.logoComponent).toBe(MERCHANT_LOGOS.SiDm)
      expect(dmInfo.suggestedCategory).toBe('Shopping')

      // 5. Thalia
      const thaliaInfo = getMerchantBrandInfo(
        'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1025047888741 . Thalia Bucher GmbH , Ihr Einkauf bei Thalia Buc',
      )
      expect(thaliaInfo.merchant?.name).toBe('Thalia')
      expect(thaliaInfo.logoComponent).toBe(MERCHANT_LOGOS.ThaliaLogo)
      expect(thaliaInfo.suggestedCategory).toBe('Shopping')

      // 6. Housses Auto DBS
      const houssesInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1026468143168 PP.4585.PP . Housses Auto DBS, Ihr Einkauf bei Hou',
      )
      expect(houssesInfo.merchant?.name).toBe('Housses Auto DBS')
      expect(houssesInfo.logoComponent).toBe(MERCHANT_LOGOS.HoussesAutoDbsLogo)
      expect(houssesInfo.suggestedCategory).toBe('Transport')

      // 7. ManoMano
      const manoInfo = getMerchantBrandInfo(
        'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1026451079456 PP.4585.PP . MANOMANO , Ihr Einkauf bei MAN',
      )
      expect(manoInfo.merchant?.name).toBe('ManoMano')
      expect(manoInfo.logoComponent).toBe(MERCHANT_LOGOS.ManoManoLogo)
      expect(manoInfo.suggestedCategory).toBe('Shopping')

      // 8. DPD
      const dpdInfo = getMerchantBrandInfo(
        'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1026474255469 PP.4585.PP . DPD Deut schland GmbH, Ihr Eink',
      )
      expect(dpdInfo.merchant?.name).toBe('DPD')
      expect(dpdInfo.logoComponent).toBe(MERCHANT_LOGOS.DpdLogo)
      expect(dpdInfo.suggestedCategory).toBe('Shopping')

      // 9. Schiller Onlinehandel
      const schillerInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1029282103452 PP.4585.PP . Schiller Onlinehandel GbR, Ihr Einkauf ',
      )
      expect(schillerInfo.merchant?.name).toBe('Schiller Onlinehandel')
      expect(schillerInfo.logoComponent).toBe(MERCHANT_LOGOS.SchillerOnlinehandelLogo)
      expect(schillerInfo.suggestedCategory).toBe('Shopping')

      // 11. Früchte und Feinkost
      const ffInfo = getMerchantBrandInfo(
        'Fruechte und Feinkost Rothenburg o b DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card Fruechte u',
      )
      expect(ffInfo.merchant?.name).toBe('Früchte und Feinkost')
      expect(ffInfo.logoComponent).toBe(MERCHANT_LOGOS.FruechteFeinkostLogo)
      expect(ffInfo.suggestedCategory).toBe('Groceries')

      // 12. BrotHaus
      const brotInfo = getMerchantBrandInfo(
        'BROTHAUS GMBH - CO. KG Rothenburg DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card BROTHA',
      )
      expect(brotInfo.merchant?.name).toBe('BrotHaus')
      expect(brotInfo.logoComponent).toBe(MERCHANT_LOGOS.BrotHausLogo)
      expect(brotInfo.suggestedCategory).toBe('Dining Out')

      // 13. bella me
      const bellaInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1034830377254/PP.4585.PP/. bella me , Ihr Einkauf bei bella me En',
      )
      expect(bellaInfo.merchant?.name).toBe('bella me')
      expect(bellaInfo.logoComponent).toBe(MERCHANT_LOGOS.BellaMeLogo)
      expect(bellaInfo.suggestedCategory).toBe('Shopping')

      // 14. Tipico
      const tipicoInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1035468977249/PP.4585.PP/. Tipico C o. Ltd., Ihr Einkauf bei Tipic',
      )
      expect(tipicoInfo.merchant?.name).toBe('Tipico')
      expect(tipicoInfo.logoComponent).toBe(MERCHANT_LOGOS.TipicoLogo)
      expect(tipicoInfo.suggestedCategory).toBe('Entertainment')

      // 15. AZM
      const azmInfo = getMerchantBrandInfo(
        'AZM ZAPRESIC ZAPRESIC HR Karte Nr. 5355 3100 0931 8380 Virtual Debit Card AZM ZAPRESIC ZAPRE',
      )
      expect(azmInfo.merchant?.name).toBe('AZM (Autocesta Zagreb-Macelj)')
      expect(azmInfo.logoComponent).toBe(MERCHANT_LOGOS.AzmLogo)
      expect(azmInfo.suggestedCategory).toBe('Transport')
      expect(azmInfo.initials).toBe('AZ')

      // 16. ASFINAG
      const asfinagInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1036302132232/PP.4585.PP/. Autobahn en und Schnellstrasen-Fina',
      )
      expect(asfinagInfo.merchant?.name).toBe('ASFINAG')
      expect(asfinagInfo.logoComponent).toBe(MERCHANT_LOGOS.AsfinagLogo)
      expect(asfinagInfo.suggestedCategory).toBe('Transport')
      expect(asfinagInfo.initials).toBe('AS')

      // 17. Škola Studium
      const skolaInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1038367465824/PP.4585.PP/. Skola St udium, Ihr Einkauf bei Skola S',
      )
      expect(skolaInfo.merchant?.name).toBe('Škola Studium')
      expect(skolaInfo.logoComponent).toBe(MERCHANT_LOGOS.SkolaStudiumLogo)
      expect(skolaInfo.suggestedCategory).toBe('Education')
      expect(skolaInfo.initials).toBe('ŠS')

      // 18. Caritas
      const caritasInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1038041208163/PP.4585.PP/. Deutsche r Caritasverband e. V. / Cari',
      )
      expect(caritasInfo.merchant?.name).toBe('Caritas')
      expect(caritasInfo.logoComponent).toBe(MERCHANT_LOGOS.CaritasLogo)
      expect(caritasInfo.suggestedCategory).toBe('Shopping')

      // 19. NAGA
      const nagaInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1040254264400/PP.4585.PP/. NAGA Mar kets Europe Ltd, Ihr Einkau',
      )
      expect(nagaInfo.merchant?.name).toBe('NAGA')
      expect(nagaInfo.logoComponent).toBe(MERCHANT_LOGOS.NagaLogo)
      expect(nagaInfo.suggestedCategory).toBe('Savings')

      // 20. Mega-Holz
      const megaInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1041226383723/PP.4585.PP/. Mega-Hol z GmbH + Co. KG, Ihr Einka',
      )
      expect(megaInfo.merchant?.name).toBe('Mega-Holz')
      expect(megaInfo.logoComponent).toBe(MERCHANT_LOGOS.MegaHolzLogo)
      expect(megaInfo.suggestedCategory).toBe('Shopping')

      // 22. eXaring
      const exaringInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1043655690631/PP.4585.PP/. eXaring AG, Ihr Einkauf bei eXaring AG',
      )
      expect(exaringInfo.merchant?.name).toBe('eXaring (waipu.tv)')
      expect(exaringInfo.logoComponent).toBe(MERCHANT_LOGOS.ExaringLogo)
      expect(exaringInfo.suggestedCategory).toBe('Entertainment')
      expect(exaringInfo.initials).toBe('EW')

      // 23. ZET Zagreb
      const zetInfo = getMerchantBrandInfo(
        'MOJ.ZET.HR, ZAGREB HR Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card 2025-08-0',
      )
      expect(zetInfo.merchant?.name).toBe('ZET Zagreb')
      expect(zetInfo.logoComponent).toBe(MERCHANT_LOGOS.ZetLogo)
      expect(zetInfo.suggestedCategory).toBe('Transport')
      expect(zetInfo.initials).toBe('ZZ')

      // 24. Udemy
      const udemyInfo = getMerchantBrandInfo(
        'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1045442438693 PP.4585.PP . Udemy, I hr Einkauf bei Udemy End',
      )
      expect(udemyInfo.merchant?.name).toBe('Udemy')
      expect(udemyInfo.logoComponent).toBe(MERCHANT_LOGOS.UdemyLogo)
      expect(udemyInfo.suggestedCategory).toBe('Education')

      // 25. Transgourmet
      const transInfo = getMerchantBrandInfo(
        'TRANSGOURMET DEUTSC//ESCHBORN/DE 2022-07-30T12:53:26 KFN 0 VJ 2412 Kartenzahlung',
      )
      expect(transInfo.merchant?.name).toBe('Transgourmet')
      expect(transInfo.logoComponent).toBe(MERCHANT_LOGOS.TransgourmetLogo)
      expect(transInfo.suggestedCategory).toBe('Groceries')

      // 26. PDF Converter Guru
      const pdfInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1045487095428/PP.4585.PP/. PDF Conv erter Guru, Ihr Einkauf bei ',
      )
      expect(pdfInfo.merchant?.name).toBe('PDF Converter Guru')
      expect(pdfInfo.logoComponent).toBe(MERCHANT_LOGOS.PdfGuruLogo)
      expect(pdfInfo.suggestedCategory).toBe('Utilities')

      // 27. Cerebrum IQ
      const cerebrumInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1046113189247/. Cerebrum IQ, Ihr Ei nkauf bei Cerebrum IQ End-to-',
      )
      expect(cerebrumInfo.merchant?.name).toBe('Cerebrum IQ')
      expect(cerebrumInfo.logoComponent).toBe(AVAILABLE_ICONS.GraduationCap)
      expect(cerebrumInfo.suggestedCategory).toBe('Education')

      // 28. Heise Medien
      const heiseInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1047663016839/PP.4585.PP/. Heise Me dien GmbH + Co. KG, Ihr Ein',
      )
      expect(heiseInfo.merchant?.name).toBe('Heise Medien')
      expect(heiseInfo.logoComponent).toBe(MERCHANT_LOGOS.HeiseMedienLogo)
      expect(heiseInfo.suggestedCategory).toBe('Entertainment')

      // 29. Raj Toys
      const rajInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1048027734591/PP.4585.PP/. Raj Toys s.r.o., Ihr Einkauf bei Raj Toy',
      )
      expect(rajInfo.merchant?.name).toBe('Raj Toys')
      expect(rajInfo.logoComponent).toBe(AVAILABLE_ICONS.Gamepad2)
      expect(rajInfo.suggestedCategory).toBe('Shopping')

      // 30. Fahrerlaubnisbehörde Bad Homburg
      const fahrerInfo = getMerchantBrandInfo(
        'FAHRERLAUBNISBEHOERDE//Bad Homburg 2026-03-27T09:57:32 KFN 0 VJ 2812 Kartenzahlung',
      )
      expect(fahrerInfo.merchant?.name).toBe('Fahrerlaubnisbehörde Bad Homburg')
      expect(fahrerInfo.logoComponent).toBe(MERCHANT_LOGOS.BadHomburgLogo)
      expect(fahrerInfo.suggestedCategory).toBe('Taxes')

      // 31. Kinderplanet GmbH
      const kinderInfo = getMerchantBrandInfo(
        'NYA*Kinderplanet GmbH, Berlin DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card 20',
      )
      expect(kinderInfo.merchant?.name).toBe('Kinderplanet')
      expect(kinderInfo.logoComponent).toBe(AVAILABLE_ICONS.Gamepad2)
      expect(kinderInfo.suggestedCategory).toBe('Entertainment')

      // 32. VSPO Bern
      const vspoInfo = getMerchantBrandInfo(
        'VSPO 0FF06d850afAbFc, Bern CH Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card ',
      )
      expect(vspoInfo.merchant?.name).toBe('VSPO')
      expect(vspoInfo.logoComponent).toBe(AVAILABLE_ICONS.ShoppingBag)
      expect(vspoInfo.suggestedCategory).toBe('Shopping')

      // 33. Stadt Bad Homburg / Rathaus
      const rathausInfo = getMerchantBrandInfo(
        'KARTENZAHL. STADT BAD HOMBG/Rathaus 2026-06-24T09:14:25 KFN 0 VJ 2812 Kartenzahlung',
      )
      expect(rathausInfo.merchant?.name).toBe('Stadtverwaltung Bad Homburg')
      expect(rathausInfo.logoComponent).toBe(MERCHANT_LOGOS.BadHomburgLogo)
      expect(rathausInfo.suggestedCategory).toBe('Taxes')

      // 34. shop portraitnet
      const portraitInfo = getMerchantBrandInfo(
        'NNT*shop portraitnet o, 490203 3150 95 DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual ',
      )
      expect(portraitInfo.merchant?.name).toBe('shop portraitnet')
      expect(portraitInfo.logoComponent).toBe(AVAILABLE_ICONS.ShoppingBag)
      expect(portraitInfo.suggestedCategory).toBe('Shopping')

      // 35. dedicom GmbH
      const dedicomInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1045440836467/PP.4585.PP/. dedicom GmbH, Ihr Einkauf bei dedic',
      )
      expect(dedicomInfo.merchant?.name).toBe('dedicom')
      expect(dedicomInfo.logoComponent).toBe(MERCHANT_LOGOS.DedicomLogo)
      expect(dedicomInfo.suggestedCategory).toBe('Shopping')

      // 36. PayPal with omitted merchant name -> falls back to PayPal logo
      const omittedInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1047407084871/PP.4585.PP/. , Ihr Ei nkauf bei End-to-End-Ref.: 10',
      )
      expect(omittedInfo.merchant?.id).toBe('paypal')
      expect(omittedInfo.logoComponent).toBe(MERCHANT_LOGOS.SiPaypal)
      expect(omittedInfo.initials).toBe('PA')

      // 37. Direct transaction with PayPal itself
      const paypalDirectInfo = getMerchantBrandInfo(
        'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1049039954031 PP.4585.PP . PayPal ( Europe) S.a r.l. et Cie, SC',
      )
      expect(paypalDirectInfo.merchant?.id).toBe('paypal')
      expect(paypalDirectInfo.merchant?.name).toBe('PayPal')
      expect(paypalDirectInfo.logoComponent).toBe(MERCHANT_LOGOS.SiPaypal)
      expect(paypalDirectInfo.suggestedCategory).toBe('Transfers')

      // 38. Uber via PayPal direct debit
      const uberInfo = getMerchantBrandInfo(
        'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1052983422516 . PAYPAL-ZAHLUNG UBE R LASTSCHRIFT an mc',
      )
      expect(uberInfo.merchant?.name).toBe('Uber')
      expect(uberInfo.logoComponent).toBe(MERCHANT_LOGOS.SiUber)
      expect(uberInfo.suggestedCategory).toBe('Transport')

      // 39. home24 SE via PayPal
      const home24Info = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1053020146591/PP.4585.PP/. home24 S E, Ihr Einkauf bei home24',
      )
      expect(home24Info.merchant?.name).toBe('home24')
      expect(home24Info.logoComponent).toBe(MERCHANT_LOGOS.Home24Logo)
      expect(home24Info.suggestedCategory).toBe('Shopping')

      // 40. SSG BW (Staatliche Schlösser und Gärten Baden-Württemberg)
      const ssgInfo = getMerchantBrandInfo(
        'SSG BW sagt Danke, Heidelberg DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Card',
      )
      expect(ssgInfo.merchant?.name).toBe('SSG BW')
      expect(ssgInfo.logoComponent).toBe(MERCHANT_LOGOS.SsgBwLogo)
      expect(ssgInfo.suggestedCategory).toBe('Entertainment')

      // 41. DARS d.d. via PayPal
      const darsInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1043667601270/PP.4585.PP/. DARS, d. d., Ihr Einkauf bei DARS, d.d.',
      )
      expect(darsInfo.merchant?.name).toBe('DARS')
      expect(darsInfo.logoComponent).toBe(MERCHANT_LOGOS.DarsLogo)
      expect(darsInfo.suggestedCategory).toBe('Transport')

      // 42. Okka Turkish Bakery
      const okkaInfo = getMerchantBrandInfo(
        'Okka Turkish Bakery, Frankfurt am DE Karte Nr. 5355 31XX XXXX 8380 Kartenzahlung Virtual Debit Ca',
      )
      expect(okkaInfo.merchant?.name).toBe('Okka Turkish Bakery')
      expect(okkaInfo.logoComponent).toBe(MERCHANT_LOGOS.OkkaBakeryLogo)
      expect(okkaInfo.suggestedCategory).toBe('Dining Out')

      // 43. Bäckerei Moos
      const moosInfo = getMerchantBrandInfo(
        'Baeckerei Moos Bad Homburg DE Karte Nr. 5355 3100 0931 8380 Virtual Debit Card Baeckerei Moos',
      )
      expect(moosInfo.merchant?.name).toBe('Bäckerei Moos')
      expect(moosInfo.logoComponent).toBe(MERCHANT_LOGOS.BaeckereiMoosLogo)
      expect(moosInfo.suggestedCategory).toBe('Dining Out')

      // 44. Rossmann via PayPal with line-wrap broken word Ros smann
      const rossmannBrokenInfo = getMerchantBrandInfo(
        'PayPal Europe S.a.r.l. et Cie S.C.A 1035399972253/PP.4585.PP/. Dirk Ros smann GmbH, Ihr Einkauf b',
      )
      expect(rossmannBrokenInfo.merchant?.name).toBe('Rossmann')
      expect(rossmannBrokenInfo.logoComponent).toBe(MERCHANT_LOGOS.SiRossmann)
      expect(rossmannBrokenInfo.suggestedCategory).toBe('Shopping')

      // 45. PayPal transaction without discoverable merchant (falls back to PayPal logo)
      const paypalUndiscoveredInfo = getMerchantBrandInfo(
        'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1021831388305 PP.4585.PP End-to-End-Ref.: 1021831388305 PP',
      )
      expect(paypalUndiscoveredInfo.merchant?.id).toBe('paypal')
      expect(paypalUndiscoveredInfo.merchant?.name).toBe('PayPal')
      expect(paypalUndiscoveredInfo.logoComponent).toBe(MERCHANT_LOGOS.SiPaypal)
      expect(paypalUndiscoveredInfo.brandColor).toBe('#00457C')
      expect(paypalUndiscoveredInfo.initials).toBe('PA')

      // 46. PayPal transaction ending with truncated purchase phrase fragment (e.g. ", I")
      const paypalTruncatedInfo = getMerchantBrandInfo(
        'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1049039954031 PP.4585.PP . PayPal ( Europe) S.a r.l. et Cie, SCA, I',
      )
      expect(paypalTruncatedInfo.merchant?.id).toBe('paypal')
      expect(paypalTruncatedInfo.merchant?.name).toBe('PayPal')
      expect(paypalTruncatedInfo.logoComponent).toBe(MERCHANT_LOGOS.SiPaypal)
      expect(paypalTruncatedInfo.brandColor).toBe('#00457C')
      const icon = getCategoryIcon('Shopping', 20, undefined, 'PayPal (Europe) S.a r.l. et Cie, S. C.A. 1049039954031 PP.4585.PP . PayPal ( Europe) S.a r.l. et Cie, SCA, I')
      expect(React.isValidElement(icon) && icon.type === MERCHANT_LOGOS.SiPaypal).toBe(true)

      // 47. Edukativni Centar Rani Razvoj (Mladenovac)
      const edukativniInfo = getMerchantBrandInfo(
        'ZAHLUNG IN DAS AUSLAND UNS. REF:  AZNA3191009197 00 IHRE REF:  NONREF RS35200354683010198808 AUFTRAGGEBER LT. AUFTRAG: ANEL MEMIC BANK DES BEGUENSTIGTEN: BEGUENSTIGTER: EDUKATIVNI CENTAR RANI RAZVOJ CRKVENA 70G 11400 MLADENOVAC RS RS35200354683010198808 ZAHLUNGSGRUND: ARTUR MEMIC',
      )
      expect(edukativniInfo.merchant?.name).toBe('Edukativni Centar Rani Razvoj')
      expect(edukativniInfo.logoComponent).toBe(MERCHANT_LOGOS.EdukativniCentarLogo)
      expect(edukativniInfo.suggestedCategory).toBe('Education')
      expect(edukativniInfo.brandColor).toBe('#2563EB')
      expect(edukativniInfo.initials).toBe('EC')
    })

    it('renders Edukativni Centar Rani Razvoj SVG logo into the DOM via getCategoryIcon', () => {
      const { container } = render(
        <div>
          {getCategoryIcon(
            'Education',
            24,
            undefined,
            'EDUKATIVNI CENTAR RANI RAZVOJ CRKVENA 70G 11400 MLADENOVAC RS RS35200354683010198808',
          )}
        </div>,
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('aria-label', 'Edukativni Centar Rani Razvoj')
    })

    it('renders the 22 new batch brand logos into the DOM via getCategoryIcon', () => {
      const logos = [
        { desc: 'Thalia Bucher', label: 'Thalia' },
        { desc: 'DPD Deutschland', label: 'DPD' },
        { desc: 'Tipico Co. Ltd.', label: 'Tipico' },
        { desc: 'Udemy Online Learning', label: 'Udemy' },
        { desc: 'NAGA Markets Europe', label: 'NAGA' },
        { desc: 'Deutscher Caritasverband', label: 'Caritas' },
        { desc: 'BROTHAUS GMBH', label: 'BrotHaus' },
        { desc: 'MANOMANO Shopping', label: 'ManoMano' },
        { desc: 'eXaring AG waipu.tv', label: 'eXaring (waipu.tv)' },
        { desc: 'AZM ZAPRESIC', label: 'AZM Zaprešić' },
        { desc: 'MOJ.ZET.HR Zagreb', label: 'ZET Zagreb' },
        { desc: 'TRANSGOURMET DEUTSCHLAND', label: 'Transgourmet' },
        { desc: 'Fruechte und Feinkost Rothenburg', label: 'Früchte und Feinkost' },
        { desc: 'RDPTS GmbH', label: 'RDPTS' },
        { desc: 'Schiller Onlinehandel GbR', label: 'Schiller Onlinehandel' },
        { desc: 'bella me Kosmetik', label: 'bella me' },
        { desc: 'Mega-Holz GmbH', label: 'Mega-Holz' },
        { desc: 'Housses Auto DBS', label: 'Housses Auto DBS' },
        { desc: 'Skola Studium Online', label: 'Škola Studium' },
        { desc: 'PDF Converter Guru', label: 'PDF Converter Guru' },
        { desc: 'Heise Medien GmbH', label: 'Heise Medien' },
        { desc: 'dedicom GmbH', label: 'dedicom' },
        { desc: 'home24 SE Möbel', label: 'home24' },
        { desc: 'DARS d.d. e-vinjeta', label: 'DARS d.d.' },
        { desc: 'SSG BW sagt Danke', label: 'SSG BW' },
        { desc: 'Okka Turkish Bakery Frankfurt', label: 'Okka Turkish Bakery' },
        { desc: 'Baeckerei Moos Bad Homburg', label: 'Bäckerei Moos' },
      ]

      for (const item of logos) {
        const { container } = render(<div>{getCategoryIcon('Shopping', 24, undefined, item.desc)}</div>)
        const img = container.querySelector('img')
        expect(img, `Logo image for ${item.label} should render`).toBeInTheDocument()
        expect(img).toHaveAttribute('aria-label', item.label)
      }
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

    it('renders transport brand logos with full-bleed attributes (Mercedes, ADAC, RMV, Aral, DB, Shell)', () => {
      const { MercedesLogo, BmwLogo, AudiLogo, VolkswagenLogo, PorscheLogo } = MERCHANT_LOGOS
      const { RmvLogo, DbLogo, BvgLogo } = MERCHANT_LOGOS
      const { AralLogo, ShellLogo, JetLogo } = MERCHANT_LOGOS
      const { AdacLogo, AceLogo } = MERCHANT_LOGOS

      expect(BmwLogo).toBeTruthy()
      expect(AudiLogo).toBeTruthy()
      expect(VolkswagenLogo).toBeTruthy()
      expect(PorscheLogo).toBeTruthy()
      expect(BvgLogo).toBeTruthy()
      expect(JetLogo).toBeTruthy()
      expect(AceLogo).toBeTruthy()

      // Render MercedesLogo
      const { container: mercContainer } = render(React.createElement(MercedesLogo, { size: 20 }))
      const mercSvg = mercContainer.querySelector('svg')
      expect(mercSvg).toBeTruthy()
      expect(mercSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(mercSvg?.classList.contains('brand-logo-full')).toBe(true)

      // Render AdacLogo
      const { container: adacContainer } = render(React.createElement(AdacLogo, { size: 20 }))
      const adacSvg = adacContainer.querySelector('svg')
      expect(adacSvg).toBeTruthy()
      expect(adacSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(adacSvg?.classList.contains('brand-logo-full')).toBe(true)
      expect(adacSvg?.textContent).toContain('ADAC')

      // Render RmvLogo
      const { container: rmvContainer } = render(React.createElement(RmvLogo, { size: 20 }))
      const rmvSvg = rmvContainer.querySelector('svg')
      expect(rmvSvg).toBeTruthy()
      expect(rmvSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(rmvSvg?.classList.contains('brand-logo-full')).toBe(true)

      // Render AralLogo
      const { container: aralContainer } = render(React.createElement(AralLogo, { size: 20 }))
      const aralSvg = aralContainer.querySelector('svg')
      expect(aralSvg).toBeTruthy()
      expect(aralSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(aralSvg?.classList.contains('brand-logo-full')).toBe(true)

      // Render DbLogo
      const { container: dbContainer } = render(React.createElement(DbLogo, { size: 20 }))
      const dbSvg = dbContainer.querySelector('svg')
      expect(dbSvg).toBeTruthy()
      expect(dbSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(dbSvg?.classList.contains('brand-logo-full')).toBe(true)

      // Render ShellLogo
      const { container: shellContainer } = render(React.createElement(ShellLogo, { size: 20 }))
      const shellSvg = shellContainer.querySelector('svg')
      expect(shellSvg).toBeTruthy()
      expect(shellSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(shellSvg?.classList.contains('brand-logo-full')).toBe(true)

      // Brand info resolution
      expect(getMerchantBrandInfo('Mercedes-Benz AG').logoComponent).toBe(MercedesLogo)
      expect(getMerchantBrandInfo('Allg.Deutscher Automobil-Club ADAC e.V.').logoComponent).toBe(AdacLogo)
      expect(getMerchantBrandInfo('RMV Ticket Service').logoComponent).toBe(RmvLogo)
      expect(getMerchantBrandInfo('Aral Tankstelle').logoComponent).toBe(AralLogo)
      expect(getMerchantBrandInfo('Deutsche Bahn DB Fernverkehr').logoComponent).toBe(DbLogo)
      expect(getMerchantBrandInfo('Shell Station').logoComponent).toBe(ShellLogo)
    })

    it('renders travel brand logos with full-bleed attributes (TUI, Eurowings, Holidays, DERTOUR, alltours, Condor)', () => {
      const {
        TuiLogo,
        EurowingsLogo,
        HolidaysLogo,
        EurowingsHolidaysLogo,
        DertourLogo,
        AlltoursLogo,
        SchauinslandLogo,
        CondorLogo,
      } = MERCHANT_LOGOS

      expect(TuiLogo).toBeTruthy()
      expect(EurowingsLogo).toBeTruthy()
      expect(HolidaysLogo).toBeTruthy()
      expect(HolidaysLogo).toBe(EurowingsLogo)
      expect(EurowingsHolidaysLogo).toBe(EurowingsLogo)

      // Render TuiLogo
      const { container: tuiContainer } = render(React.createElement(TuiLogo, { size: 20 }))
      const tuiSvg = tuiContainer.querySelector('svg')
      expect(tuiSvg).toBeTruthy()
      expect(tuiSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(tuiSvg?.classList.contains('brand-logo-full')).toBe(true)
      expect(tuiSvg?.getAttribute('aria-label')).toBe('TUI')

      // Render EurowingsLogo
      const { container: eurowingsContainer } = render(React.createElement(EurowingsLogo, { size: 20 }))
      const eurowingsSvg = eurowingsContainer.querySelector('svg')
      expect(eurowingsSvg).toBeTruthy()
      expect(eurowingsSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(eurowingsSvg?.classList.contains('brand-logo-full')).toBe(true)
      expect(eurowingsSvg?.getAttribute('aria-label')).toBe('Eurowings')

      // Render DertourLogo
      const { container: dertourContainer } = render(React.createElement(DertourLogo, { size: 20 }))
      const dertourSvg = dertourContainer.querySelector('svg')
      expect(dertourSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(dertourSvg?.classList.contains('brand-logo-full')).toBe(true)

      // Render AlltoursLogo
      const { container: alltoursContainer } = render(React.createElement(AlltoursLogo, { size: 20 }))
      const alltoursSvg = alltoursContainer.querySelector('svg')
      expect(alltoursSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(alltoursSvg?.classList.contains('brand-logo-full')).toBe(true)

      // Render SchauinslandLogo
      const { container: schauContainer } = render(React.createElement(SchauinslandLogo, { size: 20 }))
      const schauSvg = schauContainer.querySelector('svg')
      expect(schauSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(schauSvg?.classList.contains('brand-logo-full')).toBe(true)

      // Render CondorLogo
      const { container: condorContainer } = render(React.createElement(CondorLogo, { size: 20 }))
      const condorSvg = condorContainer.querySelector('svg')
      expect(condorSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(condorSvg?.classList.contains('brand-logo-full')).toBe(true)

      // Brand info resolution
      expect(getMerchantBrandInfo('TUI Deutschland GmbH').logoComponent).toBe(TuiLogo)
      expect(
        getMerchantBrandInfo('holidays.ch GmbH Ihre Reisebuchung/Eurowings Holiday s/0022241300/41122589/20230818Anel Mem')
          .logoComponent
      ).toBe(EurowingsLogo)
      expect(getMerchantBrandInfo('DERTOUR Reisebüro').logoComponent).toBe(DertourLogo)
      expect(getMerchantBrandInfo('alltours flugreisen').logoComponent).toBe(AlltoursLogo)
    })

    it('renders tax category logos (wundertax, Taxfix, smartsteuer, ELSTER, WISO, Finanzamt, Faerber & Hutzel, civic tax entities) with full-bleed brand logo attributes', () => {
      const {
        WundertaxLogo,
        TaxfixLogo,
        SmartsteuerLogo,
        ElsterLogo,
        WisoSteuerLogo,
        FaerberHutzelLogo,
        FinanzamtLogo,
        GermanyFlagLogo,
        BadHomburgLogo,
        SchmittenLogo,
        HessenLogo,
        KelkheimLogo,
        HochtaunuskreisLogo,
      } = MERCHANT_LOGOS

      expect(WundertaxLogo).toBeTruthy()
      expect(TaxfixLogo).toBeTruthy()
      expect(SmartsteuerLogo).toBeTruthy()
      expect(ElsterLogo).toBeTruthy()
      expect(WisoSteuerLogo).toBeTruthy()
      expect(FaerberHutzelLogo).toBeTruthy()
      expect(FinanzamtLogo).toBe(GermanyFlagLogo)

      // Render WundertaxLogo
      const { container: wundertaxContainer } = render(React.createElement(WundertaxLogo, { size: 20 }))
      const wundertaxSvg = wundertaxContainer.querySelector('svg')
      expect(wundertaxSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(wundertaxSvg?.classList.contains('brand-logo-full')).toBe(true)
      expect(wundertaxSvg?.style.borderRadius).toBe('inherit')

      // Render TaxfixLogo
      const { container: taxfixContainer } = render(React.createElement(TaxfixLogo, { size: 20 }))
      const taxfixSvg = taxfixContainer.querySelector('svg')
      expect(taxfixSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(taxfixSvg?.classList.contains('brand-logo-full')).toBe(true)
      expect(taxfixSvg?.style.borderRadius).toBe('inherit')

      // Render SmartsteuerLogo
      const { container: smartsteuerContainer } = render(React.createElement(SmartsteuerLogo, { size: 20 }))
      const smartsteuerSvg = smartsteuerContainer.querySelector('svg')
      expect(smartsteuerSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(smartsteuerSvg?.classList.contains('brand-logo-full')).toBe(true)
      expect(smartsteuerSvg?.style.borderRadius).toBe('inherit')

      // Render ElsterLogo
      const { container: elsterContainer } = render(React.createElement(ElsterLogo, { size: 20 }))
      const elsterSvg = elsterContainer.querySelector('svg')
      expect(elsterSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(elsterSvg?.classList.contains('brand-logo-full')).toBe(true)
      expect(elsterSvg?.style.borderRadius).toBe('inherit')

      // Render WisoSteuerLogo
      const { container: wisoContainer } = render(React.createElement(WisoSteuerLogo, { size: 20 }))
      const wisoSvg = wisoContainer.querySelector('svg')
      expect(wisoSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(wisoSvg?.classList.contains('brand-logo-full')).toBe(true)
      expect(wisoSvg?.style.borderRadius).toBe('inherit')

      // Render FaerberHutzelLogo
      const { container: faerberContainer } = render(React.createElement(FaerberHutzelLogo, { size: 20 }))
      const faerberSvg = faerberContainer.querySelector('svg')
      expect(faerberSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(faerberSvg?.classList.contains('brand-logo-full')).toBe(true)
      expect(faerberSvg?.style.borderRadius).toBe('inherit')

      // Render FinanzamtLogo (GermanyFlagLogo)
      const { container: finanzamtContainer } = render(React.createElement(FinanzamtLogo, { size: 20 }))
      const finanzamtSvg = finanzamtContainer.querySelector('svg')
      expect(finanzamtSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(finanzamtSvg?.classList.contains('brand-logo-full')).toBe(true)
      expect(finanzamtSvg?.style.borderRadius).toBe('inherit')

      // Render BadHomburgLogo
      const { container: badHomburgContainer } = render(React.createElement(BadHomburgLogo, { size: 20 }))
      const badHomburgSvg = badHomburgContainer.querySelector('svg')
      expect(badHomburgSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(badHomburgSvg?.classList.contains('brand-logo-full')).toBe(true)
      expect(badHomburgSvg?.style.borderRadius).toBe('inherit')

      // Render SchmittenLogo
      const { container: schmittenContainer } = render(React.createElement(SchmittenLogo, { size: 20 }))
      const schmittenSvg = schmittenContainer.querySelector('svg')
      expect(schmittenSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(schmittenSvg?.classList.contains('brand-logo-full')).toBe(true)
      expect(schmittenSvg?.style.borderRadius).toBe('inherit')

      // Render HessenLogo
      const { container: hessenContainer } = render(React.createElement(HessenLogo, { size: 20 }))
      const hessenSvg = hessenContainer.querySelector('svg')
      expect(hessenSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(hessenSvg?.classList.contains('brand-logo-full')).toBe(true)
      expect(hessenSvg?.style.borderRadius).toBe('inherit')

      // Render KelkheimLogo (img)
      const { container: kelkheimContainer } = render(React.createElement(KelkheimLogo, { size: 20 }))
      const kelkheimImg = kelkheimContainer.querySelector('img')
      expect(kelkheimImg?.getAttribute('data-brand-logo')).toBe('true')
      expect(kelkheimImg?.classList.contains('brand-logo-full')).toBe(true)
      expect(kelkheimImg?.style.borderRadius).toBe('inherit')

      // Render HochtaunuskreisLogo (img)
      const { container: htkContainer } = render(React.createElement(HochtaunuskreisLogo, { size: 20 }))
      const htkImg = htkContainer.querySelector('img')
      expect(htkImg?.getAttribute('data-brand-logo')).toBe('true')
      expect(htkImg?.classList.contains('brand-logo-full')).toBe(true)
      expect(htkImg?.style.borderRadius).toBe('inherit')
    })

    it('renders Check24Logo with full-bleed attributes and matches CHECK24 cashback transactions', () => {
      const { Check24Logo } = MERCHANT_LOGOS
      expect(Check24Logo).toBeTruthy()

      // Render Check24Logo directly
      const { container: c24Container } = render(React.createElement(Check24Logo, { size: 20 }))
      const c24Svg = c24Container.querySelector('svg')
      expect(c24Svg).toBeTruthy()
      expect(c24Svg?.getAttribute('data-brand-logo')).toBe('true')
      expect(c24Svg?.classList.contains('brand-logo-full')).toBe(true)
      expect(c24Svg?.style.borderRadius).toBe('inherit')
      expect(c24Svg?.getAttribute('aria-label')).toBe('CHECK24')

      // Render via getCategoryIcon with user transaction description
      const txDesc =
        'CHECK24 Vergleichsportal für Kranke nversicherungen GmbH CHECK24 Cashback - fuer Ihre Zahnzu satzversicherung: 10338717 End-to-End-Ref.: 235790923429 Kundenreferenz: 617207769488'
      const { container: txContainer } = render(
        <div>{getCategoryIcon('Shopping', 20, undefined, txDesc)}</div>,
      )
      const txSvg = txContainer.querySelector('svg')
      expect(txSvg).toBeTruthy()
      expect(txSvg?.getAttribute('data-brand-logo')).toBe('true')
      expect(txSvg?.classList.contains('brand-logo-full')).toBe(true)
      expect(txSvg?.style.borderRadius).toBe('inherit')
      expect(txSvg?.getAttribute('aria-label')).toBe('CHECK24')
    })
  })
})

