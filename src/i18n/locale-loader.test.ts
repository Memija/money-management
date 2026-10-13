import { afterEach, describe, expect, it, vi } from 'vitest'

import { categoryTermsByLocale } from './category-terms'
import { isSupportedLocale, localeLabels, localeOrder } from './locale-meta'
import { translations } from './translations'

const importFreshLoader = async () => {
  vi.resetModules()
  return import('./locale-loader')
}

describe('locale-loader', () => {
  afterEach(() => {
    vi.doUnmock('./locales/pl')
    vi.resetModules()
  })

  it('should load a locale on demand and cache it', async () => {
    const loader = await importFreshLoader()
    expect(loader.getLoadedTranslations('de')).toBeUndefined()

    const de = await loader.loadTranslations('de')

    expect(de.changeLanguage).toBe(translations.de.changeLanguage)
    expect(loader.getLoadedTranslations('de')).toBe(de)
    await expect(loader.loadTranslations('de')).resolves.toBe(de)
  })

  it('should share a single request between concurrent calls', async () => {
    const loader = await importFreshLoader()
    const [first, second] = await Promise.all([
      loader.loadTranslations('sr'),
      loader.loadTranslations('sr'),
    ])
    expect(first).toBe(second)
  })

  it('should reject and not cache a locale that fails to load', async () => {
    vi.doMock('./locales/pl', () => {
      throw new Error('chunk failed')
    })
    const loader = await importFreshLoader()

    await expect(loader.loadTranslations('pl')).rejects.toThrow()
    expect(loader.getLoadedTranslations('pl')).toBeUndefined()
  })

  it('should make registered translations available synchronously', async () => {
    const loader = await importFreshLoader()
    loader.registerTranslations({ bs: translations.bs })
    expect(loader.getLoadedTranslations('bs')).toBe(translations.bs)
  })

  it('should log instead of throwing when prefetching fails', async () => {
    vi.doMock('./locales/pl', () => {
      throw new Error('chunk failed')
    })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const loader = await importFreshLoader()

    loader.prefetchAllTranslations()

    await vi.waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('"pl"'), expect.anything())
    })
    warnSpy.mockRestore()
  })
})

describe('locale registry guardrail', () => {
  it('should register every locale in the loader, category terms, translations and picker', async () => {
    const { LOADABLE_LOCALES } = await import('./locale-loader')
    const expected = [...localeOrder].sort()

    expect([...LOADABLE_LOCALES].sort()).toEqual(expected)
    expect(Object.keys(categoryTermsByLocale).sort()).toEqual(expected)
    expect(Object.keys(translations).sort()).toEqual(expected)
    expect(Object.keys(localeLabels).sort()).toEqual(expected)
  })

  it('should keep locale files wired to their category terms', () => {
    for (const locale of localeOrder) {
      const terms = categoryTermsByLocale[locale]
      expect(translations[locale].categoryKeywords).toBe(terms.keywords)
      expect(translations[locale].catOther).toBe(terms.labels.catOther)
      expect(translations[locale].icons.Coffee).toBe(terms.coffee)
    }
  })

  it('should only accept supported locale codes', () => {
    expect(isSupportedLocale('de')).toBe(true)
    expect(isSupportedLocale('fr')).toBe(false)
    expect(isSupportedLocale('toString')).toBe(false)
    expect(isSupportedLocale(null)).toBe(false)
  })
})
