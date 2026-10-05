import React from 'react'
import { Coffee, Package } from 'lucide-react'

import { type MerchantSuggestion, POPULAR_MERCHANTS } from '../data/merchants'
import type { CustomCategory } from '../types'
import { MERCHANT_LOGOS } from './brand-logos/merchant-logos'
import type { IconComponent } from './brand-logos/types'
import { repairBrokenWords } from './categorizer/description-cleaning'
import { getCategoryColor, ICON_COLORS } from './category-colors'
import {
  AVAILABLE_ICONS,
  CANONICAL_CATEGORY_ICONS,
  COFFEE_REGEX,
} from './category-icon-definitions'
import { resolveCanonicalCategory } from './category-utils'

export { MERCHANT_LOGOS } from './brand-logos/merchant-logos'
export type { IconComponent } from './brand-logos/types'
export {
  AVAILABLE_ICONS,
  CANONICAL_CATEGORY_ICONS,
  COFFEE_REGEX,
  ICON_GROUPS,
} from './category-icon-definitions'

export interface MerchantBrandInfo {
  merchant?: MerchantSuggestion
  logoComponent?: IconComponent
  brandColor: string
  suggestedCategory?: string
  initials: string
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function matchesTerm(text: string, term: string): boolean {
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}([^a-z0-9]|$)`, 'i')
  return pattern.test(text)
}

function getMerchantMatchScore(merchant: MerchantSuggestion, textLower: string): number {
  let best = 0
  const kw = merchant.keyword.toLowerCase()
  if (kw.length <= 4) {
    if (matchesTerm(textLower, kw)) {
      best = Math.max(best, kw.length)
    }
  } else if (textLower.includes(kw)) {
    best = Math.max(best, kw.length)
  }

  if (merchant.aliases) {
    for (const alias of merchant.aliases) {
      const a = alias.toLowerCase()
      if (a.length <= 4) {
        if (matchesTerm(textLower, a)) {
          best = Math.max(best, a.length)
        }
      } else if (textLower.includes(a)) {
        best = Math.max(best, a.length)
      }
    }
  }
  return best
}

const PAYMENT_PROCESSOR_IDS = new Set<string>([
  'paypal',
  'klarna',
  'stripe',
  'sumup',
  'payoneer',
  'payone',
  'commerzbank',
])

/**
 * Finds the most specific matching popular merchant for a given text
 * by checking its keyword, aliases, and display name.
 * Prioritizes the underlying merchant over payment processors/intermediaries (e.g. Booking.com over PayPal).
 */
export function findMatchingMerchant(text: string): MerchantSuggestion | undefined {
  if (!text) return undefined
  const repaired = repairBrokenWords(text)
  const textLower = repaired.trim().toLowerCase()
  let bestDirectMerchant: MerchantSuggestion | undefined
  let bestDirectScore = 0
  let bestProcessorMerchant: MerchantSuggestion | undefined
  let bestProcessorScore = 0

  for (const merchant of POPULAR_MERCHANTS) {
    let score = getMerchantMatchScore(merchant, textLower)
    const nameLower = merchant.name.toLowerCase()
    if (nameLower.length <= 3) {
      if (matchesTerm(textLower, nameLower) && nameLower.length > score) {
        score = nameLower.length
      }
    } else {
      if (nameLower.includes(textLower) && textLower.length > score) {
        score = textLower.length
      } else if (textLower.includes(nameLower) && nameLower.length > score) {
        score = nameLower.length
      }
    }

    if (score > 0) {
      if (PAYMENT_PROCESSOR_IDS.has(merchant.id)) {
        if (score > bestProcessorScore) {
          bestProcessorScore = score
          bestProcessorMerchant = merchant
        }
      } else {
        if (score > bestDirectScore) {
          bestDirectScore = score
          bestDirectMerchant = merchant
        }
      }
    }
  }

  // Prioritize the actual underlying retail / service / travel merchant over payment intermediaries
  return bestDirectMerchant || bestProcessorMerchant
}

export function getCategoryIcon(
  categoryName: string,
  size = 16,
  customCategories?: CustomCategory[],
  description?: string,
): React.ReactNode {
  // 1. Check if it's a custom category with a selected icon
  if (customCategories) {
    const customMatch = customCategories.find((c) => c.id === categoryName)
    if (customMatch && customMatch.icon && AVAILABLE_ICONS[customMatch.icon as keyof typeof AVAILABLE_ICONS]) {
      const IconComp = AVAILABLE_ICONS[customMatch.icon as keyof typeof AVAILABLE_ICONS]
      const color = ICON_COLORS[customMatch.icon] || getCategoryColor(categoryName, customCategories)
      return React.createElement(IconComp, { size, color })
    }
  }

  // 1.5. Check if it matches a popular merchant based on description (prioritize most specific match)
  if (description) {
    const merchant = findMatchingMerchant(description)
    if (merchant) {
      if (merchant.logo && MERCHANT_LOGOS[merchant.logo]) {
        const LogoComp = MERCHANT_LOGOS[merchant.logo]
        return React.createElement(LogoComp, { size, color: merchant.brandColor || 'var(--text-main)' })
      }
      if (AVAILABLE_ICONS[merchant.icon]) {
        const IconComp = AVAILABLE_ICONS[merchant.icon]
        const color = merchant.brandColor || ICON_COLORS[merchant.icon] || getCategoryColor(categoryName, customCategories)
        return React.createElement(IconComp, { size, color })
      }
    }
  }

  // 2. Canonical category color
  const categoryColor = getCategoryColor(categoryName, customCategories)

  // Special sub-case for coffee / cafe (derived dynamically from all registered locales)
  if (COFFEE_REGEX.test(categoryName)) {
    return React.createElement(Coffee, { size, color: ICON_COLORS['Coffee'] })
  }

  // 3. Dynamically resolve canonical category across all supported languages
  const canonical = resolveCanonicalCategory(categoryName)
  const IconComponent = CANONICAL_CATEGORY_ICONS[canonical] || Package
  return React.createElement(IconComponent, { size, color: categoryColor })
}

export function getMerchantBrandInfo(name: string): MerchantBrandInfo {
  const nameTrimmed = name.trim()
  const merchant = findMatchingMerchant(nameTrimmed)

  const words = nameTrimmed.split(/\s+/)
  const initials =
    words.length > 1
      ? `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase()
      : (nameTrimmed.slice(0, 2) || 'TX').toUpperCase()

  if (merchant) {
    const logoComponent =
      merchant.logo && MERCHANT_LOGOS[merchant.logo]
        ? MERCHANT_LOGOS[merchant.logo]
        : merchant.icon && AVAILABLE_ICONS[merchant.icon]
          ? AVAILABLE_ICONS[merchant.icon]
          : undefined
    const brandColor =
      merchant.brandColor ||
      (merchant.icon ? ICON_COLORS[merchant.icon] : undefined) ||
      '#6366f1'

    return {
      merchant,
      logoComponent,
      brandColor,
      suggestedCategory: merchant.category,
      initials,
    }
  }

  // Generate deterministic dynamic brand color from merchant name
  const fallbackPalette = [
    '#6366f1',
    '#10b981',
    '#f59e0b',
    '#ec4899',
    '#3b82f6',
    '#8b5cf6',
    '#06b6d4',
    '#14b8a6',
    '#f43f5e',
    '#a855f7',
  ]
  let hash = 0
  for (let i = 0; i < nameTrimmed.length; i++) {
    hash = nameTrimmed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const brandColor = fallbackPalette[Math.abs(hash) % fallbackPalette.length]

  return {
    brandColor,
    initials,
  }
}
