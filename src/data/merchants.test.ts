import { describe, expect, it } from 'vitest'

import { DEFAULT_CATEGORY_KEYS } from '../i18n/categories'
import { AVAILABLE_ICONS, MERCHANT_LOGOS } from '../utils/category-icons'
import { POPULAR_MERCHANTS } from './merchants'

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

describe('merchants data', () => {
  describe('structure and uniqueness', () => {
    it('contains a non-empty list of popular merchants', () => {
      expect(POPULAR_MERCHANTS.length).toBeGreaterThan(0)
    })

    it('has globally unique merchant IDs', () => {
      const ids = POPULAR_MERCHANTS.map((m) => m.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('has non-empty names and keywords for all merchants', () => {
      for (const merchant of POPULAR_MERCHANTS) {
        expect(merchant.name.trim().length).toBeGreaterThan(0)
        expect(merchant.keyword.trim().length).toBeGreaterThan(0)
        expect(
          merchant.keyword,
          `Merchant "${merchant.id}" keyword must be lowercase`,
        ).toBe(merchant.keyword.toLowerCase())
      }
    })
  })

  describe('category alignment', () => {
    it('uses only canonical category keys defined in DEFAULT_CATEGORY_KEYS', () => {
      const validCategories = new Set<string>(DEFAULT_CATEGORY_KEYS)

      const invalidMerchants: { id: string; category: string }[] = []
      for (const merchant of POPULAR_MERCHANTS) {
        if (!validCategories.has(merchant.category)) {
          invalidMerchants.push({ id: merchant.id, category: merchant.category })
        }
      }

      expect(
        invalidMerchants,
        `Merchants must use canonical categories from DEFAULT_CATEGORY_KEYS: ${JSON.stringify(invalidMerchants)}`,
      ).toEqual([])
    })
  })

  describe('icons and logos resolution', () => {
    it('maps every merchant logo to a known component in MERCHANT_LOGOS', () => {
      for (const merchant of POPULAR_MERCHANTS) {
        if (merchant.logo) {
          expect(
            MERCHANT_LOGOS[merchant.logo],
            `Merchant "${merchant.id}" has logo "${merchant.logo}" which does not exist in MERCHANT_LOGOS`,
          ).toBeDefined()
        }
      }
    })

    it('maps every merchant fallback icon to a known component in AVAILABLE_ICONS', () => {
      for (const merchant of POPULAR_MERCHANTS) {
        expect(
          AVAILABLE_ICONS[merchant.icon],
          `Merchant "${merchant.id}" has icon "${merchant.icon}" which does not exist in AVAILABLE_ICONS`,
        ).toBeDefined()
      }
    })

    it('has valid 6-digit hex color format when brandColor is provided', () => {
      for (const merchant of POPULAR_MERCHANTS) {
        if (merchant.brandColor) {
          expect(
            merchant.brandColor,
            `Merchant "${merchant.id}" brandColor "${merchant.brandColor}" must match hex format #RRGGBB`,
          ).toMatch(HEX_COLOR_REGEX)
        }
      }
    })
  })
})
