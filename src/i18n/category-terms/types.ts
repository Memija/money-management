import type { CategoryKeywords, TranslationStrings } from '../types'

/** Translation keys holding the localized names of the built-in categories. */
export type CategoryLabelKey =
  | 'catSalary'
  | 'catRent'
  | 'catLoans'
  | 'catTaxes'
  | 'catGroceries'
  | 'catDiningOut'
  | 'catShopping'
  | 'catTransport'
  | 'catEntertainment'
  | 'catInsurance'
  | 'catUtilities'
  | 'catCommunication'
  | 'catHealthcare'
  | 'catEducation'
  | 'catSavings'
  | 'catCash'
  | 'catTransfers'
  | 'catTravel'
  | 'catCrypto'
  | 'catBankFees'
  | 'catDonations'
  | 'catOther'

/**
 * Locale data that must be available for EVERY locale at all times (not just the active one):
 * auto-categorization keywords and category names are matched against transactions in any
 * language. Kept separate from the full translation files so those can be lazy-loaded.
 */
export interface CategoryTerms {
  /** Localized names of the built-in categories */
  labels: Pick<TranslationStrings, CategoryLabelKey>
  /** Localized word for "coffee", used for the coffee icon heuristic */
  coffee: string
  /** Auto-categorization keywords per category */
  keywords: CategoryKeywords
}
