import { bs } from './locales/bs'
import { de } from './locales/de'
import { en } from './locales/en'
import { id } from './locales/id'
import { pl } from './locales/pl'
import { sr } from './locales/sr'
import type { Locale, TranslationStrings } from './types'

export { localeLabels, localeOrder } from './locale-meta'
export * from './types'

/**
 * All locales, statically bundled. Intended for tests and tooling only — runtime code must use
 * `useLanguageStore` (backed by `locale-loader`) so that inactive locales stay lazy-loaded.
 */
export const translations: Record<Locale, TranslationStrings> = {
  en,
  id,
  pl,
  bs,
  sr,
  de,
}
