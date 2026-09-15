import { act,renderHook } from '@testing-library/react'
import { afterEach,beforeEach, describe, expect, it } from 'vitest'

import { useIsMobile } from './useIsMobile'

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    window.innerWidth = 1024
  })

  afterEach(() => {
    window.innerWidth = originalInnerWidth
  })

  it('returns false when window width is greater than default breakpoint (640px)', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true when window width is less than or equal to default breakpoint (640px)', () => {
    window.innerWidth = 375
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('respects a custom breakpoint', () => {
    window.innerWidth = 500
    const { result } = renderHook(() => useIsMobile(480))
    expect(result.current).toBe(false)

    window.innerWidth = 480
    const { result: result2 } = renderHook(() => useIsMobile(480))
    expect(result2.current).toBe(true)
  })

  it('updates when window resize event is triggered', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => {
      window.innerWidth = 375
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toBe(true)

    act(() => {
      window.innerWidth = 800
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toBe(false)
  })
})
