import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDeferredUnmount } from './useDeferredUnmount'

const DELAY_MS = 300

describe('useDeferredUnmount', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not render while initially closed', () => {
    const { result } = renderHook(() => useDeferredUnmount(false, DELAY_MS))
    expect(result.current).toBe(false)
  })

  it('should render immediately when opened', () => {
    const { result, rerender } = renderHook(({ open }) => useDeferredUnmount(open, DELAY_MS), {
      initialProps: { open: false },
    })
    rerender({ open: true })
    expect(result.current).toBe(true)
  })

  it('should keep rendering during the exit delay and unmount afterwards', () => {
    const { result, rerender } = renderHook(({ open }) => useDeferredUnmount(open, DELAY_MS), {
      initialProps: { open: true },
    })
    rerender({ open: false })
    expect(result.current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(DELAY_MS - 1)
    })
    expect(result.current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe(false)
  })

  it('should stay mounted when reopened during the exit delay', () => {
    const { result, rerender } = renderHook(({ open }) => useDeferredUnmount(open, DELAY_MS), {
      initialProps: { open: true },
    })
    rerender({ open: false })
    rerender({ open: true })

    act(() => {
      vi.advanceTimersByTime(DELAY_MS * 2)
    })
    expect(result.current).toBe(true)
  })
})
