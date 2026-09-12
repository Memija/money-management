import type { TranslationStrings } from './translations'

export const DEFAULT_CATEGORY_KEYS = [
  'Salary',
  'Rent',
  'Groceries',
  'Dining Out',
  'Shopping',
  'Transport',
  'Entertainment',
  'Insurance',
  'Utilities',
  'Healthcare',
  'Savings',
  'Transfers',
  'Other',
] as const

export const categoryI18nKeys: Record<string, keyof TranslationStrings> = {
  Salary: 'catSalary',
  Rent: 'catRent',
  Groceries: 'catGroceries',
  'Dining Out': 'catDiningOut',
  DiningOut: 'catDiningOut',
  Shopping: 'catShopping',
  Transport: 'catTransport',
  Entertainment: 'catEntertainment',
  Insurance: 'catInsurance',
  Utilities: 'catUtilities',
  Healthcare: 'catHealthcare',
  Savings: 'catSavings',
  Transfers: 'catTransfers',
  Other: 'catOther',
}
