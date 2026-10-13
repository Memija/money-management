import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import { translations } from '../i18n/translations'
import type { Locale, TranslationStrings } from '../i18n/types'
import { useLanguageStore } from './useLanguageStore'

describe('useLanguageStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    // Force reset of store state since it's initialized on import
    useLanguageStore.setState({
      locale: 'en',
      t: useLanguageStore.getState().t, // Default T
    })
  })

  it('should have initial English locale by default', () => {
    const state = useLanguageStore.getState()
    expect(state.locale).toBe('en')
    expect(state.t.appName).toBeDefined()
  })

  it('should change locale and update translations', () => {
    useLanguageStore.getState().setLocale('de')

    const state = useLanguageStore.getState()
    expect(state.locale).toBe('de')
    expect(state.t.appName).toBe('Saldio')
  })

  it('should persist locale to localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    useLanguageStore.getState().setLocale('de')

    expect(setItemSpy).toHaveBeenCalledWith('mm-language-preference', 'de')
    expect(localStorage.getItem('mm-language-preference')).toBe('de')
  })

  it('should handle localStorage being unavailable', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded')
    })

    // Should not throw
    expect(() => useLanguageStore.getState().setLocale('pl')).not.toThrow()
    expect(useLanguageStore.getState().locale).toBe('pl')

    setItemSpy.mockRestore()
  })
})

describe('useLanguageStore (lazy-loaded locales)', () => {
  type Deferred = { resolve: (t: TranslationStrings) => void; reject: (e: Error) => void }
  let pendingLoads: Map<Locale, Deferred>
  let loadTranslations: Mock<(locale: Locale) => Promise<TranslationStrings>>

  const importStore = async () => {
    vi.resetModules()
    vi.doMock('../i18n/locale-loader', () => ({
      getLoadedTranslations: () => undefined,
      loadTranslations,
    }))
    return (await import('./useLanguageStore')).useLanguageStore
  }

  beforeEach(() => {
    localStorage.clear()
    pendingLoads = new Map()
    loadTranslations = vi.fn((locale: Locale) => {
      if (locale === 'en') {
        return Promise.resolve(translations.en)
      }
      return new Promise<TranslationStrings>((resolve, reject) => {
        pendingLoads.set(locale, { resolve, reject })
      })
    })
  })

  afterEach(() => {
    vi.doUnmock('../i18n/locale-loader')
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('should fall back to English when the stored locale fails to load at startup', async () => {
    localStorage.setItem('mm-language-preference', 'de')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    loadTranslations.mockImplementation((locale: Locale) =>
      locale === 'de'
        ? Promise.reject(new Error('chunk failed'))
        : Promise.resolve(translations.en),
    )

    const store = await importStore()

    expect(store.getState().locale).toBe('en')
    expect(store.getState().t).toBe(translations.en)
  })

  it('should switch only once the requested locale has loaded', async () => {
    const store = await importStore()

    store.getState().setLocale('de')
    expect(store.getState().locale).toBe('en')

    pendingLoads.get('de')?.resolve(translations.de)
    await vi.waitFor(() => {
      expect(store.getState().locale).toBe('de')
    })
    expect(store.getState().t).toBe(translations.de)
    expect(localStorage.getItem('mm-language-preference')).toBe('de')
  })

  it('should ignore a slower response for a locale that is no longer requested', async () => {
    const store = await importStore()

    store.getState().setLocale('de')
    store.getState().setLocale('pl')
    pendingLoads.get('pl')?.resolve(translations.pl)
    await vi.waitFor(() => {
      expect(store.getState().locale).toBe('pl')
    })
    pendingLoads.get('de')?.resolve(translations.de)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(store.getState().locale).toBe('pl')
  })

  it('should keep the current locale and log when loading fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = await importStore()

    store.getState().setLocale('sr')
    pendingLoads.get('sr')?.reject(new Error('offline'))

    await vi.waitFor(() => {
      expect(errorSpy).toHaveBeenCalled()
    })
    expect(store.getState().locale).toBe('en')
    expect(localStorage.getItem('mm-language-preference')).toBeNull()
  })
})
