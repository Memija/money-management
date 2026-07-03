import { create } from 'zustand'

import { type Locale, translations, type TranslationStrings } from '../i18n/translations'

const STORAGE_KEY = 'mm-language-preference'

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored in translations) {
      return stored as Locale
    }
  } catch (e) {
    console.debug('localStorage not available:', e)
  }
  // Try to detect from browser
  try {
    const browserLang = navigator.language.split('-')[0].toLowerCase()
    if (browserLang in translations) {
      return browserLang as Locale
    }
  } catch (e) {
    console.debug('navigator not available:', e)
  }
  return 'en'
}

export interface LanguageState {
  locale: Locale
  t: TranslationStrings
  setLocale: (locale: Locale) => void
}

export const useLanguageStore = create<LanguageState>((set) => {
  const initialLocale = getStoredLocale()

  return {
    locale: initialLocale,
    t: translations[initialLocale],
    setLocale: (locale: Locale) => {
      try {
        localStorage.setItem(STORAGE_KEY, locale)
      } catch (e) {
        console.warn('Failed to save locale to localStorage:', e)
      }
      set({ locale, t: translations[locale] })
    },
  }
})
