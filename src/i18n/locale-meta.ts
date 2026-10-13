import type { Locale } from './types'

/** Display labels for the language picker */
export const localeLabels: Record<Locale, { native: string; flag: string }> = {
  en: { native: 'English', flag: '/flags/gb.png' },
  id: { native: 'Bahasa Indonesia', flag: '/flags/id.png' },
  pl: { native: 'Polski', flag: '/flags/pl.png' },
  bs: { native: 'Bosanski', flag: '/flags/ba.png' },
  sr: { native: 'Српски', flag: '/flags/rs.png' },
  de: { native: 'Deutsch', flag: '/flags/de.png' },
}

/** Order in which languages are listed in the language picker */
export const localeOrder: Locale[] = ['id', 'bs', 'de', 'en', 'pl', 'sr']

/** Locale used when the preferred locale is unsupported or fails to load */
export const DEFAULT_LOCALE: Locale = 'en'

/**
 * Type guard for locale codes coming from untrusted sources (localStorage, navigator).
 * @param value - Candidate locale code
 * @returns True when the value is a supported {@link Locale}
 */
export const isSupportedLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(localeLabels, value)
