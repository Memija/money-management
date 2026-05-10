import type { Locale, TranslationStrings } from './types';
import { en } from './locales/en';
import { id } from './locales/id';
import { pl } from './locales/pl';
import { bs } from './locales/bs';
import { sr } from './locales/sr';
import { de } from './locales/de';

export * from './types';

export const translations: Record<Locale, TranslationStrings> = {
  en,
  id,
  pl,
  bs,
  sr,
  de,
};

/** Display labels for the language picker */
export const localeLabels: Record<Locale, { native: string; flag: string }> = {
  en: { native: 'English', flag: '/flags/gb.png' },
  id: { native: 'Bahasa Indonesia', flag: '/flags/id.png' },
  pl: { native: 'Polski', flag: '/flags/pl.png' },
  bs: { native: 'Bosanski', flag: '/flags/ba.png' },
  sr: { native: 'Српски', flag: '/flags/rs.png' },
  de: { native: 'Deutsch', flag: '/flags/de.png' },
};

export const localeOrder: Locale[] = ['id', 'bs', 'de', 'en', 'pl', 'sr'];
