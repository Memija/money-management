import React from 'react'
import { Coffee, ImageOff, Package } from 'lucide-react'

import type { MerchantSuggestion } from '../data/merchants'
import type { CustomCategory } from '../types'
import { memoizeStringFn } from './bounded-cache'
import { MERCHANT_LOGOS } from './brand-logos/merchant-logos'
import {
  extractMerchantKeyword,
  isPaymentProcessorIntermediary,
  NON_RETAIL_OTTO_REGEX,
  repairBrokenWords,
} from './categorizer/description-cleaning'
import { getCategoryColor, ICON_COLORS } from './category-colors'
import {
  AVAILABLE_ICONS,
  CANONICAL_CATEGORY_ICONS,
  COFFEE_REGEX,
} from './category-icon-definitions'
import { resolveCanonicalCategory } from './category-utils'
import { getCandidateMerchants, type IndexedMerchant } from './merchant-index'
import { matchesLowercaseTerm } from './regex-utils'

export { MERCHANT_LOGOS } from './brand-logos/merchant-logos'
export type { IconComponent } from './brand-logos/types'
export {
  AVAILABLE_ICONS,
  CANONICAL_CATEGORY_ICONS,
  COFFEE_REGEX,
  ICON_GROUPS,
} from './category-icon-definitions'
export { getMerchantBrandInfo, type MerchantBrandInfo } from './merchant-brand-info'

function getMerchantMatchScore(
  { keywordLower: kw, aliasesLower }: IndexedMerchant,
  textLower: string,
): number {
  let best = 0
  if (kw.length <= 4) {
    if (matchesLowercaseTerm(textLower, kw)) {
      best = Math.max(best, kw.length)
    }
  } else if (textLower.includes(kw)) {
    best = Math.max(best, kw.length)
  }

  for (const a of aliasesLower) {
    if (a.length <= 4) {
      if (matchesLowercaseTerm(textLower, a)) {
        best = Math.max(best, a.length)
      }
    } else if (textLower.includes(a)) {
      best = Math.max(best, a.length)
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
  'volksbank',
])

/** Processors whose logo is shown when the underlying merchant has no logo of its own. */
const PROCESSOR_IDS_BRANDED_WITHOUT_MERCHANT_LOGO = new Set<string>(['klarna'])

/** Generic English statement words that contain merchant keywords (e.g. "Purchase" contains "chase"). */
const GENERIC_STATEMENT_WORDS_REGEX = /\bpurchases?\b/g

/**
 * Finds the most specific matching popular merchant for a given text
 * by checking its keyword, aliases, and display name.
 * Prioritizes the underlying merchant over payment processors/intermediaries (e.g. Booking.com over PayPal).
 * Results are memoized since this scans every popular merchant and is called for each rendered row.
 */
export function findMatchingMerchant(text: string): MerchantSuggestion | undefined {
  if (!text) {
    return undefined
  }
  return memoizedFindMatchingMerchant(text)
}

function computeMatchingMerchant(text: string): MerchantSuggestion | undefined {
  const repaired = repairBrokenWords(text)
  const textLower = repaired
    .toLowerCase()
    .replace(GENERIC_STATEMENT_WORDS_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  let bestDirectMerchant: MerchantSuggestion | undefined
  let bestDirectScore = 0
  let bestProcessorMerchant: MerchantSuggestion | undefined
  let bestProcessorScore = 0

  // Only merchants whose terms occur in the text (or whose name contains the text) can score above zero
  const candidates = getCandidateMerchants(textLower, { includeNamesContainingText: true })
  for (const indexed of candidates) {
    const { merchant, nameLower } = indexed
    let score = getMerchantMatchScore(indexed, textLower)
    if (nameLower.length <= 3) {
      if (matchesLowercaseTerm(textLower, nameLower) && nameLower.length > score) {
        score = nameLower.length
      }
    } else {
      if (
        (textLower.length >= 3
          ? nameLower.includes(textLower)
          : matchesLowercaseTerm(nameLower, textLower)) &&
        textLower.length > score
      ) {
        score = textLower.length
      } else if (textLower.includes(nameLower) && nameLower.length > score) {
        score = nameLower.length
      }
    }

    // Exact matches must beat partial substring inclusions (e.g. 'Uber' must match 'Uber', not 'Uber Eats')
    if (merchant.keyword === textLower || nameLower === textLower) {
      score += 1000
    }

    // Reject false-positive matches for OTTO on personal names or rental transactions
    if (merchant.id === 'otto' && NON_RETAIL_OTTO_REGEX.test(textLower)) {
      score = 0
    }

    // Prioritize WEG Landwehrweg 1 over KMK property management when condo association is specified
    if (merchant.id === 'kmk-immobilien' && /\blandwehrweg\b/i.test(textLower)) {
      score = 0
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
  if (bestDirectMerchant) {
    return bestDirectMerchant
  }

  // If this is an intermediary payment processor transaction (e.g. PayPal / Klarna purchase for an online merchant)
  // but an underlying merchant was discovered from the text (e.g. via extractMerchantKeyword),
  // do NOT fall back to the processor (e.g. PayPal) because the display should represent the underlying store.
  // HOWEVER, if no underlying merchant can be discovered from the transaction text,
  // fall back to the processor (e.g. PayPal logo) so the transaction is branded with PayPal.
  if (isPaymentProcessorIntermediary(repaired)) {
    const extracted = extractMerchantKeyword(repaired)
    const keepsProcessorLogo =
      bestProcessorMerchant !== undefined &&
      PROCESSOR_IDS_BRANDED_WITHOUT_MERCHANT_LOGO.has(bestProcessorMerchant.id)
    if (extracted && !PAYMENT_PROCESSOR_IDS.has(extracted.toLowerCase()) && !keepsProcessorLogo) {
      return undefined
    }
  }

  return bestProcessorMerchant
}

const memoizedFindMatchingMerchant = memoizeStringFn(computeMatchingMerchant)

/**
 * Checks whether a given transaction matches a merchant that has an assigned brand logo.
 * Inspects description, and falls back to counterparty IBAN if no brand logo matches the description.
 */
export function hasMerchantLogo(description?: string, counterpartyIban?: string): boolean {
  if (!description && !counterpartyIban) {
    return false
  }
  let merchant = description ? findMatchingMerchant(description) : undefined
  if ((!merchant || !merchant.logo) && counterpartyIban) {
    const ibanMerchant = findMatchingMerchant(counterpartyIban)
    if (ibanMerchant?.logo) {
      merchant = ibanMerchant
    }
  }
  return Boolean(merchant?.logo && MERCHANT_LOGOS[merchant.logo])
}

export function getCategoryIcon(
  categoryName: string,
  size = 16,
  customCategories?: CustomCategory[],
  description?: string,
  counterpartyIban?: string,
): React.ReactNode {
  if (categoryName === 'without-logos') {
    return React.createElement(ImageOff, { size, color: 'var(--text-muted)' })
  }

  // 1. Check if it's a custom category with a selected icon
  if (customCategories) {
    const customMatch = customCategories.find((c) => c.id === categoryName)
    if (
      customMatch &&
      customMatch.icon &&
      AVAILABLE_ICONS[customMatch.icon as keyof typeof AVAILABLE_ICONS]
    ) {
      const IconComp = AVAILABLE_ICONS[customMatch.icon as keyof typeof AVAILABLE_ICONS]
      const color =
        ICON_COLORS[customMatch.icon] || getCategoryColor(categoryName, customCategories)
      return React.createElement(IconComp, { size, color })
    }
  }

  // 1.5. Check if it matches a popular merchant based on description or counterpartyIban (prioritize most specific match)
  let merchant = description ? findMatchingMerchant(description) : undefined
  if ((!merchant || !merchant.logo) && counterpartyIban) {
    const ibanMerchant = findMatchingMerchant(counterpartyIban)
    if (ibanMerchant?.logo || !merchant) {
      merchant = ibanMerchant
    }
  }

  if (merchant) {
    if (merchant.logo && MERCHANT_LOGOS[merchant.logo]) {
      const LogoComp = MERCHANT_LOGOS[merchant.logo]
      return React.createElement(LogoComp, {
        size,
        color: merchant.brandColor || 'var(--text-main)',
      })
    }
    if (AVAILABLE_ICONS[merchant.icon]) {
      const IconComp = AVAILABLE_ICONS[merchant.icon]
      const color =
        merchant.brandColor ||
        ICON_COLORS[merchant.icon] ||
        getCategoryColor(categoryName, customCategories)
      return React.createElement(IconComp, { size, color })
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
