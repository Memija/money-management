import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFormatters } from './useFormatters';
import { useLanguageStore } from '../store/useLanguageStore';

describe('useFormatters', () => {
  beforeEach(() => {
    useLanguageStore.setState({ locale: 'en' });
  });

  it('should return the current locale', () => {
    const { result } = renderHook(() => useFormatters());
    expect(result.current.locale).toBe('en');
  });

  it('should format currency with EUR for standard locale', () => {
    const { result } = renderHook(() => useFormatters());
    const formatted = result.current.formatCurrency(1234.5);

    // en formats EUR as €1,234.50
    expect(formatted).toContain('€');
    expect(formatted).toContain('1,234.50');
  });

  it('should map "bs" locale to "de-DE" formatting', () => {
    useLanguageStore.setState({ locale: 'bs' });
    const { result } = renderHook(() => useFormatters());

    expect(result.current.locale).toBe('bs');

    const formattedDate = result.current.formatDate('2024-05-15');
    // de-DE date format: 15.05.2024
    expect(formattedDate).toBe('15.05.2024');

    const formattedCurrency = result.current.formatCurrency(1234.5);
    // de-DE currency format: 1.234,50 €
    // We check the number formatting part to avoid issues with different space characters
    expect(formattedCurrency).toContain('1.234,50');
  });

  it('should map "sr" locale to "de-DE" formatting', () => {
    useLanguageStore.setState({ locale: 'sr' });
    const { result } = renderHook(() => useFormatters());

    expect(result.current.locale).toBe('sr');

    const formattedDate = result.current.formatDate('2024-12-01');
    // de-DE date format: 01.12.2024
    expect(formattedDate).toBe('01.12.2024');
  });

  it('should format date correctly for en', () => {
    useLanguageStore.setState({ locale: 'en' });
    const { result } = renderHook(() => useFormatters());

    const formatted = result.current.formatDate('2024-05-15');
    // en date format is usually 05/15/2024
    expect(formatted).toBe('05/15/2024');
  });

  it('should format month year correctly', () => {
    useLanguageStore.setState({ locale: 'en' });
    const { result } = renderHook(() => useFormatters());

    const formatted = result.current.formatMonthYear('2024-05');
    // en format short month + 2 digit year: e.g., May 24
    expect(formatted).toMatch(/May(.*)24/);
  });
});
