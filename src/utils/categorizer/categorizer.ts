import type { CategoryKeywords } from '../../i18n/types'
import { createBoundedCache } from '../bounded-cache'
import {
  AI_AND_SOFTWARE_SUBSCRIPTION_REGEX,
  BUTCHER_MEAT_SHOP_REGEX,
  CAR_OR_EQUIPMENT_RENTAL_REGEX,
  CARD_OR_BANK_FEE_REGEX,
  categoryRegexes,
  CHILDCARE_FEE_REGEX,
  COMMERCIAL_SEPA_REGEX,
  CREDIT_INSURANCE_REGEX,
  DINING_ESTABLISHMENT_REGEX,
  EXPLICIT_TAX_AUTHORITY_OR_DUTY_REGEX,
  findPopularMerchantCategory,
  GERMAN_CITY_ESSEN_REGEX,
  GERMAN_COMMUNICATION_PURPOSE_REGEX,
  GERMAN_HEALTH_INSURANCE_REGEX,
  GERMAN_INSURANCE_PURPOSE_REGEX,
  GERMAN_TRAVEL_PURPOSE_REGEX,
  INCOME_TAX_REGEX,
  POLISH_ATM_WITHDRAWAL_REGEX,
  REMITTANCE_TRANSFER_REGEX,
  SEPA_TRANSFER_REGEX,
  transferMerchantsRegex,
} from './category-patterns'
import { isPaymentProcessorIntermediary, repairBrokenWords } from './description-cleaning'
import { matchCustomKeywords, toDisplayCategory } from './keyword-compiler'

export * from './category-patterns'
export * from './keyword-compiler'

export interface CategorizeOptions {
  customKeywords?: Record<string, string[]>
  amount?: number
  type?: 'income' | 'expense'
  partner?: string
}

/**
 * Version integer of the categorization engine.
 * Bump this number whenever new merchants, regexes, keywords, or categorization priorities are updated.
 * When bumped, the app automatically re-evaluates all unedited stored transactions on startup.
 */
export const CATEGORIZER_RULES_VERSION = 5

const defaultCategoryCache = createBoundedCache<string>()

/**
 * Infers a category from a transaction description and context.
 * Returns one of the standardized canonical category keys (e.g. 'Salary', 'Groceries', 'Dining Out').
 */
export function categorize(
  desc: string,
  customKeywordsOrOptions?: Record<string, string[]> | CategorizeOptions,
  maybeOptions?: CategorizeOptions,
): string {
  if (!desc || typeof desc !== 'string') {
    return 'Other'
  }

  // Normalize options
  let customKeywords: Record<string, string[]> | undefined
  let options: CategorizeOptions | undefined

  if (customKeywordsOrOptions) {
    if (
      'customKeywords' in customKeywordsOrOptions ||
      'amount' in customKeywordsOrOptions ||
      'type' in customKeywordsOrOptions ||
      'partner' in customKeywordsOrOptions
    ) {
      options = customKeywordsOrOptions as CategorizeOptions
      customKeywords = options.customKeywords
    } else {
      customKeywords = customKeywordsOrOptions as Record<string, string[]>
      options = maybeOptions
    }
  }

  // Combine partner and description if partner is available, repairing broken line-wrap words
  const rawText = options?.partner ? `${options.partner} ${desc}`.trim() : desc.trim()

  const fullText = repairBrokenWords(rawText)
  const d = fullText.toLowerCase()

  // 1. First evaluate user's custom keywords (highest priority)
  if (customKeywords) {
    const customMatch = matchCustomKeywords(d, customKeywords)
    if (customMatch) {
      return customMatch
    }
  }

  // Check cache for default evaluations
  const isExpense =
    options?.type === 'expense' || (typeof options?.amount === 'number' && options.amount < 0)
  const isIncome =
    options?.type === 'income' || (typeof options?.amount === 'number' && options.amount > 0)
  const cacheKey = `${d}:${isExpense ? 'exp' : isIncome ? 'inc' : 'any'}`

  const cachedCategory = defaultCategoryCache.get(cacheKey)
  if (cachedCategory !== undefined) {
    return cachedCategory
  }

  // 2. High-priority structural commitments: Salary, Rent, Loans, Taxes
  const structuralCategories: (keyof CategoryKeywords)[] = ['Salary', 'Rent', 'Loans', 'Taxes']
  for (const cat of structuralCategories) {
    if (cat === 'Salary') {
      if (INCOME_TAX_REGEX.test(d)) {
        continue
      }
      if (POLISH_ATM_WITHDRAWAL_REGEX.test(d)) {
        continue
      }
      const isExplicitSalaryPayment =
        /\b(?:salary\s+payment|monthly\s+salary|gehaltszahlung|lohnauszahlung|reisespesen|reisesp|reisekosten|spesenabrechnung|spesenerstattung|auslagenerstattung|r[uü]ck[uü]berweisung\w*|rueckueberweisung\w*)\b/i.test(
          d,
        )
      if (isExpense && !isExplicitSalaryPayment) {
        continue
      }
      if (!isExplicitSalaryPayment && CARD_OR_BANK_FEE_REGEX.test(d)) {
        continue
      }
    }
    if (cat === 'Rent' && CAR_OR_EQUIPMENT_RENTAL_REGEX.test(d)) {
      continue
    }
    if (cat === 'Taxes' && CHILDCARE_FEE_REGEX.test(d)) {
      defaultCategoryCache.set(cacheKey, 'Education')
      return 'Education'
    }
    if (cat === 'Taxes' && SEPA_TRANSFER_REGEX.test(d)) {
      if (!EXPLICIT_TAX_AUTHORITY_OR_DUTY_REGEX.test(d)) {
        continue
      }
    }
    const rx = categoryRegexes[cat]
    if (rx?.test(d)) {
      if (cat === 'Loans') {
        if (GERMAN_HEALTH_INSURANCE_REGEX.test(d)) {
          defaultCategoryCache.set(cacheKey, 'Healthcare')
          return 'Healthcare'
        }
        if (CREDIT_INSURANCE_REGEX.test(d) || GERMAN_INSURANCE_PURPOSE_REGEX.test(d)) {
          defaultCategoryCache.set(cacheKey, 'Insurance')
          return 'Insurance'
        }
      }
      defaultCategoryCache.set(cacheKey, cat)
      return cat
    }
  }

  // 3. Specific brand/merchant matching
  const popularCat = findPopularMerchantCategory(d.toLowerCase())
  if (popularCat) {
    if (popularCat === 'Dining Out' && GERMAN_CITY_ESSEN_REGEX.test(d)) {
      // Ignore false positives from city of Essen
    } else if (popularCat === 'Insurance' && GERMAN_HEALTH_INSURANCE_REGEX.test(d)) {
      defaultCategoryCache.set(cacheKey, 'Healthcare')
      return 'Healthcare'
    } else if (
      (popularCat === 'Groceries' || popularCat === 'Shopping') &&
      DINING_ESTABLISHMENT_REGEX.test(d)
    ) {
      defaultCategoryCache.set(cacheKey, 'Dining Out')
      return 'Dining Out'
    } else if (
      (popularCat === 'Shopping' || popularCat === 'Services' || popularCat === 'Other') &&
      BUTCHER_MEAT_SHOP_REGEX.test(d)
    ) {
      defaultCategoryCache.set(cacheKey, 'Groceries')
      return 'Groceries'
    } else if (
      (popularCat === 'Shopping' || popularCat === 'Services' || popularCat === 'Other') &&
      REMITTANCE_TRANSFER_REGEX.test(d)
    ) {
      defaultCategoryCache.set(cacheKey, 'Transfers')
      return 'Transfers'
    } else if (popularCat === 'Shopping' && GERMAN_HEALTH_INSURANCE_REGEX.test(d)) {
      defaultCategoryCache.set(cacheKey, 'Healthcare')
      return 'Healthcare'
    } else if (
      (popularCat === 'Shopping' || popularCat === 'Loans' || popularCat === 'Services') &&
      (CREDIT_INSURANCE_REGEX.test(d) || GERMAN_INSURANCE_PURPOSE_REGEX.test(d))
    ) {
      defaultCategoryCache.set(cacheKey, 'Insurance')
      return 'Insurance'
    } else if (
      (popularCat === 'Shopping' || popularCat === 'Services' || popularCat === 'Insurance') &&
      GERMAN_TRAVEL_PURPOSE_REGEX.test(d)
    ) {
      defaultCategoryCache.set(cacheKey, 'Travel')
      return 'Travel'
    } else if (
      (popularCat === 'Shopping' ||
        popularCat === 'Services' ||
        popularCat === 'Insurance' ||
        popularCat === 'Other') &&
      GERMAN_COMMUNICATION_PURPOSE_REGEX.test(d)
    ) {
      defaultCategoryCache.set(cacheKey, 'Communication')
      return 'Communication'
    } else if (
      (popularCat === 'Shopping' || popularCat === 'Transfers' || popularCat === 'Other') &&
      AI_AND_SOFTWARE_SUBSCRIPTION_REGEX.test(d)
    ) {
      defaultCategoryCache.set(cacheKey, 'Utilities')
      return 'Utilities'
    } else {
      defaultCategoryCache.set(cacheKey, popularCat)
      return popularCat
    }
  }

  // Health insurance priority check
  if (GERMAN_HEALTH_INSURANCE_REGEX.test(d)) {
    defaultCategoryCache.set(cacheKey, 'Healthcare')
    return 'Healthcare'
  }

  // General/vehicle/credit insurance priority check
  if (CREDIT_INSURANCE_REGEX.test(d) || GERMAN_INSURANCE_PURPOSE_REGEX.test(d)) {
    defaultCategoryCache.set(cacheKey, 'Insurance')
    return 'Insurance'
  }

  // Travel priority check
  if (GERMAN_TRAVEL_PURPOSE_REGEX.test(d)) {
    defaultCategoryCache.set(cacheKey, 'Travel')
    return 'Travel'
  }

  // Telecommunication / mobile / broadband priority check
  if (GERMAN_COMMUNICATION_PURPOSE_REGEX.test(d)) {
    defaultCategoryCache.set(cacheKey, 'Communication')
    return 'Communication'
  }

  // Explicit dining establishment venue indicators
  if (DINING_ESTABLISHMENT_REGEX.test(d) && !GERMAN_CITY_ESSEN_REGEX.test(d)) {
    defaultCategoryCache.set(cacheKey, 'Dining Out')
    return 'Dining Out'
  }

  // Explicit butcher and meat market venue indicators
  if (BUTCHER_MEAT_SHOP_REGEX.test(d)) {
    defaultCategoryCache.set(cacheKey, 'Groceries')
    return 'Groceries'
  }

  // Explicit remittance and money transfer providers
  if (REMITTANCE_TRANSFER_REGEX.test(d)) {
    defaultCategoryCache.set(cacheKey, 'Transfers')
    return 'Transfers'
  }

  // Explicit AI and cloud software subscriptions
  if (AI_AND_SOFTWARE_SUBSCRIPTION_REGEX.test(d)) {
    defaultCategoryCache.set(cacheKey, 'Utilities')
    return 'Utilities'
  }

  // 4. General category matching
  let order: (keyof CategoryKeywords)[] = [
    'Cash',
    'BankFees',
    'Crypto',
    'Groceries',
    'DiningOut',
    'Shopping',
    'Transport',
    'Travel',
    'Entertainment',
    'Insurance',
    'Communication',
    'Utilities',
    'Healthcare',
    'Education',
    'Savings',
  ]

  if (isIncome) {
    order = [
      'Savings',
      'BankFees',
      'Crypto',
      'Cash',
      'Groceries',
      'Shopping',
      'DiningOut',
      'Transport',
      'Travel',
      'Entertainment',
      'Insurance',
      'Communication',
      'Utilities',
      'Healthcare',
      'Education',
    ]
  }

  for (const cat of order) {
    const rx = categoryRegexes[cat]
    if (rx?.test(d)) {
      if (cat === 'DiningOut' && GERMAN_CITY_ESSEN_REGEX.test(d)) {
        continue
      }

      const result = toDisplayCategory(cat)
      defaultCategoryCache.set(cacheKey, result)
      return result
    }
  }

  // 5. Transfers & Payment processor fallback
  if (isPaymentProcessorIntermediary(d)) {
    defaultCategoryCache.set(cacheKey, 'Shopping')
    return 'Shopping'
  }

  if (
    transferMerchantsRegex?.test(d) ||
    categoryRegexes.Transfers?.test(d) ||
    (SEPA_TRANSFER_REGEX.test(d) && !COMMERCIAL_SEPA_REGEX.test(d))
  ) {
    defaultCategoryCache.set(cacheKey, 'Transfers')
    return 'Transfers'
  }

  defaultCategoryCache.set(cacheKey, 'Other')
  return 'Other'
}
