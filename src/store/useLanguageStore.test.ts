import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLanguageStore } from './useLanguageStore';

describe('useLanguageStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Force reset of store state since it's initialized on import
    useLanguageStore.setState({
      locale: 'en',
      t: useLanguageStore.getState().t, // Default T
    });
  });

  it('should have initial English locale by default', () => {
    const state = useLanguageStore.getState();
    expect(state.locale).toBe('en');
    expect(state.t.appName).toBeDefined();
  });

  it('should change locale and update translations', () => {
    useLanguageStore.getState().setLocale('de');

    const state = useLanguageStore.getState();
    expect(state.locale).toBe('de');
    expect(state.t.appName).toBe('Money Management');
  });

  it('should persist locale to localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    useLanguageStore.getState().setLocale('de');

    expect(setItemSpy).toHaveBeenCalledWith('mm-language-preference', 'de');
    expect(localStorage.getItem('mm-language-preference')).toBe('de');
  });

  it('should handle localStorage being unavailable', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    // Should not throw
    expect(() => useLanguageStore.getState().setLocale('pl')).not.toThrow();
    expect(useLanguageStore.getState().locale).toBe('pl');

    setItemSpy.mockRestore();
  });
});
