import React from 'react'
import { Coffee, ImageOff, Package } from 'lucide-react'

import type { MerchantSuggestion } from '../data/merchants'
import type { CustomCategory } from '../types'
import { memoizeStringFn } from './bounded-cache'
import { MERCHANT_LOGOS } from './brand-logos/merchant-logos'
import type { IconComponent } from './brand-logos/types'
import {
  DINING_ESTABLISHMENT_REGEX,
  GERMAN_COMMUNICATION_PURPOSE_REGEX,
  GERMAN_HEALTH_INSURANCE_REGEX,
  GERMAN_INSURANCE_PURPOSE_REGEX,
  GERMAN_TRAVEL_PURPOSE_REGEX,
} from './categorizer/categorizer'
import {
  extractMerchantKeyword,
  isPaymentProcessorIntermediary,
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

export interface MerchantBrandInfo {
  merchant?: MerchantSuggestion
  logoComponent?: IconComponent
  brandColor: string
  suggestedCategory?: string
  initials: string
}

function getMerchantMatchScore({ keywordLower: kw, aliasesLower }: IndexedMerchant, textLower: string): number {
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
  if (!text) return undefined
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
        (textLower.length >= 3 ? nameLower.includes(textLower) : matchesLowercaseTerm(nameLower, textLower)) &&
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
  if (!description && !counterpartyIban) return false
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
    if (customMatch && customMatch.icon && AVAILABLE_ICONS[customMatch.icon as keyof typeof AVAILABLE_ICONS]) {
      const IconComp = AVAILABLE_ICONS[customMatch.icon as keyof typeof AVAILABLE_ICONS]
      const color = ICON_COLORS[customMatch.icon] || getCategoryColor(categoryName, customCategories)
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
      return React.createElement(LogoComp, { size, color: merchant.brandColor || 'var(--text-main)' })
    }
    if (AVAILABLE_ICONS[merchant.icon]) {
      const IconComp = AVAILABLE_ICONS[merchant.icon]
      const color = merchant.brandColor || ICON_COLORS[merchant.icon] || getCategoryColor(categoryName, customCategories)
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

export function getMerchantBrandInfo(name: string): MerchantBrandInfo {
  const nameTrimmed = name.trim()
  const merchant = findMatchingMerchant(nameTrimmed)

  if (merchant) {
    const cleanMerchantName = merchant.name.replace(/[()[\]{}]/g, ' ').replace(/\s+/g, ' ').trim()
    const mWords = cleanMerchantName.split(/\s+/)
    const initials =
      mWords.length > 1
        ? (mWords[0].length >= 2 && mWords[0] === mWords[0].toUpperCase() && merchant.name.includes('('))
          ? mWords[0].slice(0, 2).toUpperCase()
          : `${mWords[0][0] || ''}${mWords[1][0] || ''}`.toUpperCase()
        : (cleanMerchantName.slice(0, 2) || 'TX').toUpperCase()

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

    const isSalaryOrSpesen =
      /(?:\b(?:reisesp(?:esen)?|reisekosten(?:erstattung|abrechnung)?|spesen(?:erstattung|abrechnung)?|auslagenerstattung|gehalt(?:szahlung)?|lohn(?:auszahlung)?|r[üu]ck[üu]berweisung\w*|rueckueberweisung\w*)\b)/i.test(
        nameTrimmed,
      )

    const isBankFeeOrRefund =
      /(?:\b(?:r[üu]ckverg[üu]tung\w*|rueckverguetung\w*|geb[üu]hrenerstattung\w*|gebuehrenerstattung\w*|entgelterstattung\w*|rechnungsabschluss\w*|kontoabschluss\w*|kontof[üu]hrung\w*)\b)/i.test(
        nameTrimmed,
      )

    const isHealthInsurance = GERMAN_HEALTH_INSURANCE_REGEX.test(nameTrimmed)
    const isGeneralInsurance = GERMAN_INSURANCE_PURPOSE_REGEX.test(nameTrimmed)
    const isTravelPurpose = GERMAN_TRAVEL_PURPOSE_REGEX.test(nameTrimmed)
    const isCommunicationPurpose = GERMAN_COMMUNICATION_PURPOSE_REGEX.test(nameTrimmed)

    return {
      merchant,
      logoComponent,
      brandColor,
      suggestedCategory: isSalaryOrSpesen
        ? 'Salary'
        : isBankFeeOrRefund
          ? 'Bank Fees'
          : (merchant.category === 'Insurance' || merchant.id === 'check24') && isHealthInsurance
            ? 'Healthcare'
            : (merchant.category === 'Insurance' || merchant.id === 'check24' || merchant.category === 'Shopping') &&
                isGeneralInsurance
              ? 'Insurance'
              : (merchant.category === 'Shopping' || merchant.id === 'check24' || merchant.category === 'Services') &&
                  isTravelPurpose
                ? 'Travel'
                : (merchant.category === 'Shopping' || merchant.id === 'check24' || merchant.category === 'Services') &&
                    isCommunicationPurpose
                  ? 'Communication'
                  : (merchant.category === 'Groceries' || merchant.category === 'Shopping') &&
                      DINING_ESTABLISHMENT_REGEX.test(nameTrimmed)
                    ? 'Dining Out'
                    : merchant.category,
      initials,
    }
  }

  // For unrecognized transactions, derive clean display name if it went through an intermediary processor
  const isIntermediary = isPaymentProcessorIntermediary(nameTrimmed)
  const extracted = isIntermediary ? extractMerchantKeyword(nameTrimmed) : ''
  const displayLabel = isIntermediary
    ? (extracted || 'Shopping')
    : nameTrimmed

  const cleanLabel = displayLabel.replace(/[()[\]{}]/g, ' ').replace(/\s+/g, ' ').trim()
  const words = cleanLabel.split(/\s+/)
  const initials =
    words.length > 1
      ? `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase()
      : (cleanLabel.slice(0, 2) || (isIntermediary ? 'SH' : 'TX')).toUpperCase()

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
  for (let i = 0; i < displayLabel.length; i++) {
    hash = displayLabel.charCodeAt(i) + ((hash << 5) - hash)
  }
  const brandColor = fallbackPalette[Math.abs(hash) % fallbackPalette.length]

  return {
    brandColor,
    initials,
  }
}
