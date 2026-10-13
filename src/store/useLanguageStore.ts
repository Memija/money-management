import { create } from 'zustand'

import { getLoadedTranslations, loadTranslations } from '../i18n/locale-loader'
import { DEFAULT_LOCALE, isSupportedLocale } from '../i18n/locale-meta'
import type { Locale, TranslationStrings } from '../i18n/types'

const STORAGE_KEY = 'mm-language-preference'

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isSupportedLocale(stored)) {
      return stored
    }
  } catch (e) {
    console.debug('localStorage not available:', e)
  }
  // Try to detect from browser
  try {
    const browserLang = navigator.language.split('-')[0].toLowerCase()
    if (isSupportedLocale(browserLang)) {
      return browserLang
    }
  } catch (e) {
    console.debug('navigator not available:', e)
  }
  return DEFAULT_LOCALE
}

function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch (e) {
    console.warn('Failed to save locale to localStorage:', e)
  }
}

/**
 * Loads the preferred locale, falling back to the default locale if its chunk fails to load.
 * @param preferred - Locale chosen by the user or detected from the browser
 * @returns The locale that was actually loaded together with its translations
 */
async function loadInitialLocale(
  preferred: Locale,
): Promise<{ locale: Locale; t: TranslationStrings }> {
  try {
    return { locale: preferred, t: await loadTranslations(preferred) }
  } catch (error) {
    if (preferred === DEFAULT_LOCALE) {
      throw error
    }
    console.error(`Failed to load translations for "${preferred}", falling back:`, error)
    return { locale: DEFAULT_LOCALE, t: await loadTranslations(DEFAULT_LOCALE) }
  }
}

// Only the active locale is downloaded before the app renders; the rest load on demand.
const initial = await loadInitialLocale(getStoredLocale())

/** Most recently requested locale — guards against out-of-order async loads. */
let requestedLocale: Locale = initial.locale

export interface LanguageState {
  locale: Locale
  t: TranslationStrings
  /** Switches language. Applies immediately if the locale is cached, otherwise once it loads. */
  setLocale: (locale: Locale) => void
}

export const useLanguageStore = create<LanguageState>((set) => {
  const apply = (locale: Locale, t: TranslationStrings): void => {
    persistLocale(locale)
    set({ locale, t })
  }

  return {
    locale: initial.locale,
    t: initial.t,
    setLocale: (locale: Locale) => {
      requestedLocale = locale
      const cached = getLoadedTranslations(locale)
      if (cached) {
        apply(locale, cached)
        return
      }
      loadTranslations(locale)
        .then((t) => {
          if (requestedLocale === locale) {
            apply(locale, t)
          }
        })
        .catch((error: unknown) => {
          console.error(`Failed to load translations for "${locale}":`, error)
        })
    },
  }
})
