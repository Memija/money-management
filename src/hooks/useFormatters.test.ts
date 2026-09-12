import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useLanguageStore } from '../store/useLanguageStore'
import { useFormatters } from './useFormatters'

describe('useFormatters', () => {
  beforeEach(() => {
    useLanguageStore.setState({ locale: 'en' })
  })

  it('should return the current locale', () => {
    const { result } = renderHook(() => useFormatters())
    expect(result.current.locale).toBe('en')
  })

  it('should format currency with EUR for standard locale', () => {
    const { result } = renderHook(() => useFormatters())
    const formatted = result.current.formatCurrency(1234.5)

    // en formats EUR as €1,234.50
    expect(formatted).toContain('€')
    expect(formatted).toContain('1,234.50')
  })

  it('should map "bs" locale to "de-DE" formatting', () => {
    useLanguageStore.setState({ locale: 'bs' })
    const { result } = renderHook(() => useFormatters())

    expect(result.current.locale).toBe('bs')

    const formattedDate = result.current.formatDate('2024-05-15')
    // de-DE date format: 15.05.2024
    expect(formattedDate).toBe('15.05.2024')

    const formattedCurrency = result.current.formatCurrency(1234.5)
    // de-DE currency format: 1.234,50 €
    // We check the number formatting part to avoid issues with different space characters
    expect(formattedCurrency).toContain('1.234,50')
  })

  it('should map "sr" locale to "de-DE" formatting', () => {
    useLanguageStore.setState({ locale: 'sr' })
    const { result } = renderHook(() => useFormatters())

    expect(result.current.locale).toBe('sr')

    const formattedDate = result.current.formatDate('2024-12-01')
    // de-DE date format: 01.12.2024
    expect(formattedDate).toBe('01.12.2024')
  })

  it('should format date correctly for en', () => {
    useLanguageStore.setState({ locale: 'en' })
    const { result } = renderHook(() => useFormatters())

    const formatted = result.current.formatDate('2024-05-15')
    // en date format is usually 05/15/2024
    expect(formatted).toBe('05/15/2024')
  })

  it('should format month year correctly', () => {
    useLanguageStore.setState({ locale: 'en' })
    const { result } = renderHook(() => useFormatters())

    const formatted = result.current.formatMonthYear('2024-05')
    // en format short month + 2 digit year: e.g., May 24
    expect(formatted).toMatch(/May(.*)24/)
  })

  it('should format month year properly for bs and sr without falling back to de-DE month names', () => {
    useLanguageStore.setState({ locale: 'bs' })
    const { result: resultBs } = renderHook(() => useFormatters())
    expect(resultBs.current.formatMonthYear('2024-03')).toBe('Mar 24')

    useLanguageStore.setState({ locale: 'sr' })
    const { result: resultSr } = renderHook(() => useFormatters())
    expect(resultSr.current.formatMonthYear('2024-08')).toBe('Авг 24')
  })

  it('should format category counts correctly based on current locale in store', () => {
    useLanguageStore.setState({ locale: 'en' })
    const { result: resultEn } = renderHook(() => useFormatters())
    expect(resultEn.current.formatCategoryCount(1)).toBe('1 category')
    expect(resultEn.current.formatCategoryCount(11)).toBe('11 categories')

    useLanguageStore.setState({ locale: 'sr' })
    const { result: resultSr } = renderHook(() => useFormatters())
    expect(resultSr.current.formatCategoryCount(1)).toBe('1 категорија')
    expect(resultSr.current.formatCategoryCount(2)).toBe('2 категорије')
    expect(resultSr.current.formatCategoryCount(11)).toBe('11 категорија')
  })

  it('should format charges counts correctly based on current locale in store', () => {
    useLanguageStore.setState({ locale: 'en' })
    const { result: resultEn } = renderHook(() => useFormatters())
    expect(resultEn.current.formatChargesCount(1)).toBe('1 charge')
    expect(resultEn.current.formatChargesCount(3)).toBe('3 charges')

    useLanguageStore.setState({ locale: 'bs' })
    const { result: resultBs } = renderHook(() => useFormatters())
    expect(resultBs.current.formatChargesCount(1)).toBe('1 naplata')
    expect(resultBs.current.formatChargesCount(3)).toBe('3 naplate')
    expect(resultBs.current.formatChargesCount(5)).toBe('5 naplata')

    useLanguageStore.setState({ locale: 'sr' })
    const { result: resultSr } = renderHook(() => useFormatters())
    expect(resultSr.current.formatChargesCount(1)).toBe('1 наплата')
    expect(resultSr.current.formatChargesCount(3)).toBe('3 наплате')
    expect(resultSr.current.formatChargesCount(11)).toBe('11 наплата')
  })
})
