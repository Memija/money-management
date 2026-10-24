import type { MerchantSuggestion } from '../data/merchants'
import { MERCHANT_LOGOS } from './brand-logos/merchant-logos'
import type { IconComponent } from './brand-logos/types'
import {
  BUTCHER_MEAT_SHOP_REGEX,
  CREDIT_INSURANCE_REGEX,
  DINING_ESTABLISHMENT_REGEX,
  GERMAN_COMMUNICATION_PURPOSE_REGEX,
  GERMAN_HEALTH_INSURANCE_REGEX,
  GERMAN_INSURANCE_PURPOSE_REGEX,
  GERMAN_TRAVEL_PURPOSE_REGEX,
  REMITTANCE_TRANSFER_REGEX,
} from './categorizer/categorizer'
import {
  extractMerchantKeyword,
  isPaymentProcessorIntermediary,
} from './categorizer/description-cleaning'
import { ICON_COLORS } from './category-colors'
import { AVAILABLE_ICONS } from './category-icon-definitions'
import { findMatchingMerchant } from './category-icons'

export interface MerchantBrandInfo {
  merchant?: MerchantSuggestion
  logoComponent?: IconComponent
  brandColor: string
  suggestedCategory?: string
  initials: string
}

export function getMerchantBrandInfo(name: string): MerchantBrandInfo {
  const nameTrimmed = name.trim()
  const merchant = findMatchingMerchant(nameTrimmed)

  if (merchant) {
    const cleanMerchantName = merchant.name
      .replace(/[()[\]{}]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const mWords = cleanMerchantName.split(/\s+/)
    const initials =
      mWords.length > 1
        ? mWords[0].length >= 2 &&
          mWords[0] === mWords[0].toUpperCase() &&
          merchant.name.includes('(')
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
      merchant.brandColor || (merchant.icon ? ICON_COLORS[merchant.icon] : undefined) || '#6366f1'

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
    const isCreditInsurance = CREDIT_INSURANCE_REGEX.test(nameTrimmed)
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
            : (merchant.category === 'Insurance' ||
                  merchant.id === 'check24' ||
                  merchant.category === 'Shopping' ||
                  merchant.category === 'Loans') &&
                (isGeneralInsurance || isCreditInsurance)
              ? 'Insurance'
              : (merchant.category === 'Shopping' ||
                    merchant.id === 'check24' ||
                    merchant.category === 'Services') &&
                  isTravelPurpose
                ? 'Travel'
                : (merchant.category === 'Shopping' ||
                      merchant.id === 'check24' ||
                      merchant.category === 'Services') &&
                    isCommunicationPurpose
                  ? 'Communication'
                  : (merchant.category === 'Groceries' || merchant.category === 'Shopping') &&
                      DINING_ESTABLISHMENT_REGEX.test(nameTrimmed)
                    ? 'Dining Out'
                    : (merchant.category === 'Shopping' ||
                          merchant.id === 'sumup' ||
                          merchant.category === 'Services') &&
                        BUTCHER_MEAT_SHOP_REGEX.test(nameTrimmed)
                      ? 'Groceries'
                      : (merchant.category === 'Shopping' ||
                            merchant.id === 'sumup' ||
                            merchant.category === 'Services') &&
                          REMITTANCE_TRANSFER_REGEX.test(nameTrimmed)
                        ? 'Transfers'
                        : merchant.category,
      initials,
    }
  }

  // For unrecognized transactions, derive clean display name if it went through an intermediary processor
  const isIntermediary = isPaymentProcessorIntermediary(nameTrimmed)
  const extracted = isIntermediary ? extractMerchantKeyword(nameTrimmed) : ''
  const displayLabel = isIntermediary ? extracted || 'Shopping' : nameTrimmed

  const cleanLabel = displayLabel
    .replace(/[()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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
