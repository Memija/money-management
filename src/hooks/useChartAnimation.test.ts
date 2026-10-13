import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useChartAnimation } from './useChartAnimation'

const ANIMATION_MS = 400
/** Comfortably longer than the animation plus its settle buffer. */
const PAST_WINDOW_MS = 1000

describe('useChartAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should animate on mount and stop after the animation window', () => {
    const { result } = renderHook(() => useChartAnimation('a', ANIMATION_MS))
    expect(result.current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(PAST_WINDOW_MS)
    })
    expect(result.current).toBe(false)
  })

  it('should stay disabled on re-render with the same trigger', () => {
    const trigger = { data: [] }
    const { result, rerender } = renderHook(({ value }) => useChartAnimation(value, ANIMATION_MS), {
      initialProps: { value: trigger },
    })
    act(() => {
      vi.advanceTimersByTime(PAST_WINDOW_MS)
    })

    rerender({ value: trigger })
    expect(result.current).toBe(false)
  })

  it('should re-enable animation when the trigger identity changes', () => {
    const { result, rerender } = renderHook(({ value }) => useChartAnimation(value, ANIMATION_MS), {
      initialProps: { value: { data: [1] } },
    })
    act(() => {
      vi.advanceTimersByTime(PAST_WINDOW_MS)
    })
    expect(result.current).toBe(false)

    rerender({ value: { data: [2] } })
    expect(result.current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(PAST_WINDOW_MS)
    })
    expect(result.current).toBe(false)
  })
})
