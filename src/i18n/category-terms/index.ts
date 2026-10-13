import type { Locale } from '../types'
import { bs } from './bs'
import { de } from './de'
import { en } from './en'
import { id } from './id'
import { pl } from './pl'
import { sr } from './sr'
import type { CategoryTerms } from './types'

export type { CategoryLabelKey, CategoryTerms } from './types'

/**
 * Category labels and keywords for every supported locale. Always bundled (unlike the full
 * translations) because categorization and category-name matching work across all languages.
 */
export const categoryTermsByLocale: Record<Locale, CategoryTerms> = {
  en,
  id,
  pl,
  bs,
  sr,
  de,
}
