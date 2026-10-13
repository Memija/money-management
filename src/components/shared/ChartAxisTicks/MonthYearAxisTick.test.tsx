import { act, render, renderHook, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { MonthYearAxisTick } from './MonthYearAxisTick'

const MONTH_KEY = '2024-05'
const TICK_X = 40
const TICK_Y = 100
const OFFSET_Y = 6

const getExpectedLabel = (): string => {
  const { result } = renderHook(() => useFormatters())
  return result.current.formatMonthYear(MONTH_KEY)
}

const renderTick = (offsetY?: number) =>
  render(
    <svg>
      <MonthYearAxisTick x={TICK_X} y={TICK_Y} payload={{ value: MONTH_KEY }} fontSize={11} offsetY={offsetY} />
    </svg>,
  )

describe('MonthYearAxisTick', () => {
  beforeEach(() => {
    useLanguageStore.getState().setLocale('en')
  })

  it('should render the localized month label at the tick position', () => {
    const expected = getExpectedLabel()
    renderTick()

    const tick = screen.getByText(expected)
    expect(tick.getAttribute('x')).toBe(String(TICK_X))
    expect(tick.getAttribute('y')).toBe(String(TICK_Y))
    expect(tick.getAttribute('font-size')).toBe('11')
  })

  it('should apply the optional vertical offset', () => {
    renderTick(OFFSET_Y)
    expect(screen.getByText(getExpectedLabel()).getAttribute('y')).toBe(String(TICK_Y + OFFSET_Y))
  })

  it('should update its label when the language changes', () => {
    renderTick()
    const englishLabel = getExpectedLabel()
    expect(screen.getByText(englishLabel)).toBeTruthy()

    act(() => {
      useLanguageStore.getState().setLocale('de')
    })
    const germanLabel = getExpectedLabel()

    expect(germanLabel).not.toBe(englishLabel)
    expect(screen.getByText(germanLabel)).toBeTruthy()
  })
})
