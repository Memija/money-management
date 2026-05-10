import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore } from './useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.clearAllMocks();

    // Reset store state
    useThemeStore.setState({
      theme: 'system'
    });
  });

  it('should have initial system theme', () => {
    expect(useThemeStore.getState().theme).toBe('system');
  });

  it('should set theme and update localStorage and DOM', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    useThemeStore.getState().setTheme('dark');

    expect(useThemeStore.getState().theme).toBe('dark');
    expect(setItemSpy).toHaveBeenCalledWith('mm-theme-preference', 'dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should set light theme', () => {
    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should resolve system theme to light by default (based on setup.ts mock)', () => {
    useThemeStore.getState().setTheme('system');
    // setup.ts mocks matchMedia to return matches: false
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should handle localStorage failure gracefully', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full');
    });

    expect(() => useThemeStore.getState().setTheme('dark')).not.toThrow();
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    setItemSpy.mockRestore();
  });
});
