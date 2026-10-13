import type { Locale, TranslationStrings } from './types'

type TranslationsLoader = () => Promise<TranslationStrings>

/** One dynamic import per locale, so each locale becomes its own lazily loaded chunk. */
const LOADERS: Record<Locale, TranslationsLoader> = {
  en: () => import('./locales/en').then((m) => m.en),
  id: () => import('./locales/id').then((m) => m.id),
  pl: () => import('./locales/pl').then((m) => m.pl),
  bs: () => import('./locales/bs').then((m) => m.bs),
  sr: () => import('./locales/sr').then((m) => m.sr),
  de: () => import('./locales/de').then((m) => m.de),
}

const loaded = new Map<Locale, TranslationStrings>()
const pending = new Map<Locale, Promise<TranslationStrings>>()

/** Locales that have a loader registered. */
export const LOADABLE_LOCALES = Object.keys(LOADERS) as Locale[]

/**
 * Returns translations that are already in memory, without triggering a load.
 * @param locale - Locale to look up
 * @returns The translations, or undefined if the locale hasn't been loaded yet
 */
export const getLoadedTranslations = (locale: Locale): TranslationStrings | undefined =>
  loaded.get(locale)

/**
 * Loads the translations for a locale (once). Concurrent calls share the same request and a
 * failed request is not cached, so it can be retried.
 * @param locale - Locale to load
 * @returns The locale's translations
 */
export const loadTranslations = (locale: Locale): Promise<TranslationStrings> => {
  const cached = loaded.get(locale)
  if (cached) {
    return Promise.resolve(cached)
  }
  const inFlight = pending.get(locale)
  if (inFlight) {
    return inFlight
  }
  const request = LOADERS[locale]()
    .then((strings) => {
      loaded.set(locale, strings)
      return strings
    })
    .finally(() => {
      pending.delete(locale)
    })
  pending.set(locale, request)
  return request
}

/**
 * Warms the cache for all locales (e.g. when the language menu opens) so switching is instant.
 * Failures are logged and otherwise ignored — `loadTranslations` retries on demand.
 */
export const prefetchAllTranslations = (): void => {
  for (const locale of LOADABLE_LOCALES) {
    loadTranslations(locale).catch((error: unknown) => {
      console.warn(`Failed to prefetch translations for "${locale}":`, error)
    })
  }
}

/**
 * Seeds the cache with already-available translations (used by the test setup so locale
 * switches stay synchronous).
 * @param entries - Translations keyed by locale
 */
export const registerTranslations = (
  entries: Partial<Record<Locale, TranslationStrings>>,
): void => {
  for (const [locale, strings] of Object.entries(entries) as [Locale, TranslationStrings][]) {
    loaded.set(locale, strings)
  }
}
