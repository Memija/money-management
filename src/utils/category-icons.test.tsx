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
        { category: 'Property Tax', expectedIcon: AVAILABLE_ICONS.Building2 },
        { category: 'Versicherung', expectedIcon: AVAILABLE_ICONS.Building2 },
        { category: 'Osiguranje', expectedIcon: AVAILABLE_ICONS.Building2 },
        { category: 'Utilities', expectedIcon: AVAILABLE_ICONS.Zap },
        { category: 'Electricity', expectedIcon: AVAILABLE_ICONS.Zap },
        { category: 'Water bill', expectedIcon: AVAILABLE_ICONS.Zap },
        { category: 'Strom', expectedIcon: AVAILABLE_ICONS.Zap },
        { category: 'Rezi', expectedIcon: AVAILABLE_ICONS.Zap },
        { category: 'Healthcare', expectedIcon: AVAILABLE_ICONS.HeartPulse },
        { category: 'Medical checkup', expectedIcon: AVAILABLE_ICONS.HeartPulse },
        { category: 'Pharmacy prescription', expectedIcon: AVAILABLE_ICONS.HeartPulse },
        { category: 'Gesundheit', expectedIcon: AVAILABLE_ICONS.HeartPulse },
        { category: 'Zdravstvo', expectedIcon: AVAILABLE_ICONS.HeartPulse },
        { category: 'Savings', expectedIcon: AVAILABLE_ICONS.PiggyBank },
        { category: 'Investment fund', expectedIcon: AVAILABLE_ICONS.PiggyBank },
        { category: 'Sparen', expectedIcon: AVAILABLE_ICONS.PiggyBank },
        { category: 'Stednja', expectedIcon: AVAILABLE_ICONS.PiggyBank },
        { category: 'Transfers', expectedIcon: AVAILABLE_ICONS.CreditCard },
        { category: 'Bank uberweisung', expectedIcon: AVAILABLE_ICONS.CreditCard },
        { category: 'Prenos novca', expectedIcon: AVAILABLE_ICONS.CreditCard },
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
    })

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
