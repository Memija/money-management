import { create } from 'zustand';
import { translations, type Locale, type TranslationStrings } from '../i18n/translations';

const STORAGE_KEY = 'mm-language-preference';

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in translations) {
      return stored as Locale;
    }
  } catch {
    // localStorage not available
  }
  // Try to detect from browser
  try {
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (browserLang in translations) {
      return browserLang as Locale;
    }
  } catch {
    // navigator not available
  }
  return 'en';
}

export interface LanguageState {
  locale: Locale;
  t: TranslationStrings;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageState>((set) => {
  const initialLocale = getStoredLocale();

  return {
    locale: initialLocale,
    t: translations[initialLocale],
    setLocale: (locale: Locale) => {
      try {
        localStorage.setItem(STORAGE_KEY, locale);
      } catch {
        // localStorage not available
      }
      set({ locale, t: translations[locale] });
    },
  };
});
