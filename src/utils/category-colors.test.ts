import { describe, expect, it } from 'vitest'

import {
  adjustColor,
  CATEGORY_COLORS,
  getCategoryColor,
  ICON_COLORS,
} from './category-colors'

describe('category-colors', () => {
  describe('CATEGORY_COLORS', () => {
    it('defines hex colors for all canonical categories', () => {
      const requiredCategories = [
        'Salary',
        'Rent',
        'Groceries',
        'Dining Out',
        'DiningOut',
        'Shopping',
        'Transport',
        'Utilities',
        'Healthcare',
        'Entertainment',
        'Insurance',
        'Savings',
        'Transfers',
        'Other',
      ]

      for (const category of requiredCategories) {
        expect(CATEGORY_COLORS[category], `Color for category "${category}" must exist`).toBeDefined()
        expect(CATEGORY_COLORS[category]).toMatch(/^#[0-9a-fA-F]{6}$/)
      }
    })

    it('has identical colors for "Dining Out" and "DiningOut"', () => {
      expect(CATEGORY_COLORS['Dining Out']).toBe(CATEGORY_COLORS.DiningOut)
    })
  })

  describe('ICON_COLORS', () => {
    it('defines valid hex colors for all mapped icons', () => {
      const iconEntries = Object.entries(ICON_COLORS)
      expect(iconEntries.length).toBeGreaterThan(30)

      for (const [iconName, color] of iconEntries) {
        expect(color, `Color for icon "${iconName}" must be a 6-digit hex`).toMatch(/^#[0-9a-fA-F]{6}$/)
      }
    })

    it('aligns icon colors with corresponding canonical category colors', () => {
      expect(ICON_COLORS.Briefcase).toBe(CATEGORY_COLORS.Salary)
      expect(ICON_COLORS.Home).toBe(CATEGORY_COLORS.Rent)
      expect(ICON_COLORS.ShoppingCart).toBe(CATEGORY_COLORS.Groceries)
      expect(ICON_COLORS.Utensils).toBe(CATEGORY_COLORS['Dining Out'])
      expect(ICON_COLORS.ShoppingBag).toBe(CATEGORY_COLORS.Shopping)
      expect(ICON_COLORS.Car).toBe(CATEGORY_COLORS.Transport)
      expect(ICON_COLORS.Zap).toBe(CATEGORY_COLORS.Utilities)
      expect(ICON_COLORS.HeartPulse).toBe(CATEGORY_COLORS.Healthcare)
      expect(ICON_COLORS.Film).toBe(CATEGORY_COLORS.Entertainment)
      expect(ICON_COLORS.PiggyBank).toBe(CATEGORY_COLORS.Savings)
      expect(ICON_COLORS.CreditCard).toBe(CATEGORY_COLORS.Transfers)
      expect(ICON_COLORS.Package).toBe(CATEGORY_COLORS.Other)
    })
  })

  describe('getCategoryColor', () => {
    it('returns slate fallback color when categoryName is empty or falsy', () => {
      expect(getCategoryColor('')).toBe('#94a3b8')
      // @ts-expect-error testing invalid runtime input
      expect(getCategoryColor(null)).toBe('#94a3b8')
      // @ts-expect-error testing invalid runtime input
      expect(getCategoryColor(undefined)).toBe('#94a3b8')
    })

    it('returns exact match for canonical category keys', () => {
      expect(getCategoryColor('Salary')).toBe(CATEGORY_COLORS.Salary)
      expect(getCategoryColor('Rent')).toBe(CATEGORY_COLORS.Rent)
      expect(getCategoryColor('Groceries')).toBe(CATEGORY_COLORS.Groceries)
      expect(getCategoryColor('Dining Out')).toBe(CATEGORY_COLORS['Dining Out'])
      expect(getCategoryColor('Shopping')).toBe(CATEGORY_COLORS.Shopping)
      expect(getCategoryColor('Transport')).toBe(CATEGORY_COLORS.Transport)
      expect(getCategoryColor('Utilities')).toBe(CATEGORY_COLORS.Utilities)
      expect(getCategoryColor('Healthcare')).toBe(CATEGORY_COLORS.Healthcare)
      expect(getCategoryColor('Entertainment')).toBe(CATEGORY_COLORS.Entertainment)
      expect(getCategoryColor('Insurance')).toBe(CATEGORY_COLORS.Insurance)
      expect(getCategoryColor('Savings')).toBe(CATEGORY_COLORS.Savings)
      expect(getCategoryColor('Transfers')).toBe(CATEGORY_COLORS.Transfers)
      expect(getCategoryColor('Other')).toBe(CATEGORY_COLORS.Other)
    })

    it('returns correct category color for localized category names in all supported languages', () => {
      // Polish
      expect(getCategoryColor('Wynagrodzenie')).toBe(CATEGORY_COLORS.Salary)
      expect(getCategoryColor('Czynsz')).toBe(CATEGORY_COLORS.Rent)
      expect(getCategoryColor('Spożywcze')).toBe(CATEGORY_COLORS.Groceries)
      // Indonesian
      expect(getCategoryColor('Gaji')).toBe(CATEGORY_COLORS.Salary)
      expect(getCategoryColor('Sewa')).toBe(CATEGORY_COLORS.Rent)
      // Serbian Cyrillic
      expect(getCategoryColor('Плата')).toBe(CATEGORY_COLORS.Salary)
      expect(getCategoryColor('Станарина')).toBe(CATEGORY_COLORS.Rent)
    })

    describe('custom categories support', () => {
      it('returns icon color when custom category matches ID and has a valid icon', () => {
        const customCategories = [
          { id: 'custom-gaming', icon: 'Gamepad2' },
          { id: 'custom-crypto', icon: 'Coins' },
        ]

        expect(getCategoryColor('custom-gaming', customCategories)).toBe(ICON_COLORS.Gamepad2)
        expect(getCategoryColor('custom-crypto', customCategories)).toBe(ICON_COLORS.Coins)
      })

      it('falls back to category matching if custom category has unknown icon', () => {
        const customCategories = [{ id: 'custom-salary', icon: 'NonExistentIcon' }]
        // 'custom-salary' contains 'salary' -> matches Salary
        expect(getCategoryColor('custom-salary', customCategories)).toBe(CATEGORY_COLORS.Salary)
      })

      it('falls back to category matching if custom category has no icon', () => {
        const customCategories = [{ id: 'custom-rent' }]
        // 'custom-rent' contains 'rent' -> matches Rent
        expect(getCategoryColor('custom-rent', customCategories)).toBe(CATEGORY_COLORS.Rent)
      })

      it('ignores custom categories that do not match the ID', () => {
        const customCategories = [{ id: 'custom-hobbies', icon: 'Gamepad2' }]
        expect(getCategoryColor('Groceries', customCategories)).toBe(CATEGORY_COLORS.Groceries)
      })
    })

    describe('multilingual and fuzzy matching', () => {
      const testCases = [
        // Salary / Income
        { input: 'salary payout', expected: CATEGORY_COLORS.Salary },
        { input: 'Monthly Income', expected: CATEGORY_COLORS.Salary },
        { input: 'Monatliches Gehalt', expected: CATEGORY_COLORS.Salary },
        { input: 'Mesecna plata', expected: CATEGORY_COLORS.Salary },
        { input: 'Dodatna zarada', expected: CATEGORY_COLORS.Salary },

        // Rent / Housing
        { input: 'Apartment rent', expected: CATEGORY_COLORS.Rent },
        { input: 'House mortgage', expected: CATEGORY_COLORS.Rent },
        { input: 'Home improvement', expected: CATEGORY_COLORS.Rent },
        { input: 'Wohnungsmiete', expected: CATEGORY_COLORS.Rent },
        { input: 'Placanje stanarina', expected: CATEGORY_COLORS.Rent },
        { input: 'Kirija za stan', expected: CATEGORY_COLORS.Rent },

        // Groceries
        { input: 'Local supermarket', expected: CATEGORY_COLORS.Groceries },
        { input: 'Fresh grocery store', expected: CATEGORY_COLORS.Groceries },
        { input: 'Lebensmitteleinkauf', expected: CATEGORY_COLORS.Groceries },
        { input: 'Svjeze namirnice', expected: CATEGORY_COLORS.Groceries },

        // Dining Out
        { input: 'Italian restaurant dinner', expected: CATEGORY_COLORS['Dining Out'] },
        { input: 'Dining with friends', expected: CATEGORY_COLORS['Dining Out'] },
        { input: 'Fast food burger', expected: CATEGORY_COLORS['Dining Out'] },
        { input: 'Abendessen im Cafe', expected: CATEGORY_COLORS['Dining Out'] },
        { input: 'Tradicionalni restoran', expected: CATEGORY_COLORS['Dining Out'] },

        // Shopping
        { input: 'Online shopping haul', expected: CATEGORY_COLORS.Shopping },
        { input: 'Clothing store Zara', expected: CATEGORY_COLORS.Shopping },
        { input: 'Neue Kleidung', expected: CATEGORY_COLORS.Shopping },
        { input: 'Kupovina odece', expected: CATEGORY_COLORS.Shopping },

        // Transport
        { input: 'Public transport ticket', expected: CATEGORY_COLORS.Transport },
        { input: 'Taxi car ride', expected: CATEGORY_COLORS.Transport },
        { input: 'Fuel station petrol', expected: CATEGORY_COLORS.Transport },
        { input: 'Auto servis', expected: CATEGORY_COLORS.Transport },
        { input: 'Gradski prevoz', expected: CATEGORY_COLORS.Transport },

        // Entertainment
        { input: 'Weekend entertainment', expected: CATEGORY_COLORS.Entertainment },
        { input: 'Cinema movie tickets', expected: CATEGORY_COLORS.Entertainment },
        { input: 'Video game store', expected: CATEGORY_COLORS.Entertainment },
        { input: 'Kino Unterhaltung', expected: CATEGORY_COLORS.Entertainment },
        { input: 'Zabava i igre', expected: CATEGORY_COLORS.Entertainment },

        // Insurance
        { input: 'Life insurance policy', expected: CATEGORY_COLORS.Insurance },
        { input: 'Annual property tax', expected: CATEGORY_COLORS.Insurance },
        { input: 'Allianz Versicherung', expected: CATEGORY_COLORS.Insurance },
        { input: 'Zivotno osiguranje', expected: CATEGORY_COLORS.Insurance },

        // Utilities
        { input: 'Utility bill payment', expected: CATEGORY_COLORS.Utilities },
        { input: 'Electric company bill', expected: CATEGORY_COLORS.Utilities },
        { input: 'Water supply bill', expected: CATEGORY_COLORS.Utilities },
        { input: 'Stromrechnung', expected: CATEGORY_COLORS.Utilities },
        { input: 'Mesecne rezije', expected: CATEGORY_COLORS.Utilities },
        { input: 'Komunalne usluge', expected: CATEGORY_COLORS.Utilities },

        // Healthcare
        { input: 'Health center appointment', expected: CATEGORY_COLORS.Healthcare },
        { input: 'Medical clinic checkup', expected: CATEGORY_COLORS.Healthcare },
        { input: 'Pharmacy medicine', expected: CATEGORY_COLORS.Healthcare },
        { input: 'Gesundheitspflege', expected: CATEGORY_COLORS.Healthcare },
        { input: 'Zdravstveni pregled', expected: CATEGORY_COLORS.Healthcare },

        // Savings
        { input: 'Emergency savings account', expected: CATEGORY_COLORS.Savings },
        { input: 'Index fund investment', expected: CATEGORY_COLORS.Savings },
        { input: 'Monatliches Sparen', expected: CATEGORY_COLORS.Savings },
        { input: 'Bankarska stednja', expected: CATEGORY_COLORS.Savings },

        // Transfers
        { input: 'Wire transfer between accounts', expected: CATEGORY_COLORS.Transfers },
        { input: 'Bank uberweisung', expected: CATEGORY_COLORS.Transfers },
        { input: 'Prenos sredstava', expected: CATEGORY_COLORS.Transfers },

        // Other / Misc
        { input: 'other expenses', expected: CATEGORY_COLORS.Other },
        { input: 'misc supplies', expected: CATEGORY_COLORS.Other },
        { input: 'Sonstige Ausgaben', expected: CATEGORY_COLORS.Other },
        { input: 'Ostalo i nepredvidjeno', expected: CATEGORY_COLORS.Other },
      ]

      it('matches categories based on localized keywords and substrings', () => {
        for (const { input, expected } of testCases) {
          expect(
            getCategoryColor(input),
            `Input "${input}" should match expected category color`
          ).toBe(expected)
        }
      })

      it('respects matching priority when multiple keywords are present', () => {
        // 'salary' is checked before 'grocer' -> returns Salary color
        expect(getCategoryColor('Salary spent on groceries')).toBe(CATEGORY_COLORS.Salary)
        // 'shop' is checked before 'car' -> returns Shopping color
        expect(getCategoryColor('Car parts shop')).toBe(CATEGORY_COLORS.Shopping)
      })
    })

    it('falls back to Other color for completely unrecognized categories', () => {
      expect(getCategoryColor('RandomUnrecognizedCategory42')).toBe(CATEGORY_COLORS.Other)
      expect(getCategoryColor('XYZ12345')).toBe(CATEGORY_COLORS.Other)
    })
  })

  describe('adjustColor', () => {
    it('lightens a hex color with a positive amount', () => {
      // #808080 is (128, 128, 128)
      // +20 makes it (148, 148, 148) -> 148 in hex is 94
      expect(adjustColor('#808080', 20)).toBe('#949494')
    })

    it('darkens a hex color with a negative amount', () => {
      // #808080 is (128, 128, 128)
      // -20 makes it (108, 108, 108) -> 108 in hex is 6c
      expect(adjustColor('#808080', -20)).toBe('#6c6c6c')
    })

    it('clamps RGB values to a maximum of 255', () => {
      expect(adjustColor('#ffffff', 50)).toBe('#ffffff')
      // R=250, G=10, B=10 + 20 => R=255, G=30, B=30
      expect(adjustColor('#fa0a0a', 20)).toBe('#ff1e1e')
    })

    it('clamps RGB values to a minimum of 0', () => {
      expect(adjustColor('#000000', -50)).toBe('#000000')
      // R=10, G=100, B=200 - 30 => R=0, G=70, B=170
      expect(adjustColor('#0a64c8', -30)).toBe('#0046aa')
    })

    it('handles hex colors without a leading "#"', () => {
      expect(adjustColor('808080', 20)).toBe('#949494')
    })

    it('handles 3-digit shorthand hex colors', () => {
      // #888 -> #888888 (136, 136, 136)
      // +10 -> (146, 146, 146) -> 146 is 92 in hex
      expect(adjustColor('#888', 10)).toBe('#929292')
      expect(adjustColor('#000', 16)).toBe('#101010')
    })

    it('returns the input unchanged if hex is empty or not a string', () => {
      expect(adjustColor('', 20)).toBe('')
      // @ts-expect-error testing invalid runtime input
      expect(adjustColor(null, 20)).toBe(null)
      // @ts-expect-error testing invalid runtime input
      expect(adjustColor(undefined, 20)).toBe(undefined)
    })

    it('returns the input unchanged if string is not a valid hex color', () => {
      expect(adjustColor('not-a-color', 20)).toBe('not-a-color')
      expect(adjustColor('xyz', 20)).toBe('xyz')
    })

    it('returns the same color when amount is 0', () => {
      expect(adjustColor('#10b981', 0)).toBe('#10b981')
      expect(adjustColor('#6366f1', 0)).toBe('#6366f1')
    })
  })
})
