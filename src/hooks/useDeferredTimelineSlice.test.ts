import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDeferredTimelineSlice } from './useDeferredTimelineSlice'

const DATA = ['a', 'b', 'c', 'd', 'e', 'f']

interface Props {
  data: string[]
  start: number
  end: number
}

const renderSlice = (initial: Props) =>
  renderHook(({ data, start, end }: Props) => useDeferredTimelineSlice(data, start, end), {
    initialProps: initial,
  })

describe('useDeferredTimelineSlice', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return the initial window synchronously', () => {
    const { result } = renderSlice({ data: DATA, start: 1, end: 3 })
    expect(result.current.visibleData).toEqual(['b', 'c', 'd'])
    expect(result.current.isZoomed).toBe(true)
    expect(result.current.isPending).toBe(false)
  })

  it('should coalesce rapid window changes into one commit on the next frame', () => {
    const { result, rerender } = renderSlice({ data: DATA, start: 0, end: 2 })

    rerender({ data: DATA, start: 1, end: 3 })
    rerender({ data: DATA, start: 2, end: 4 })
    expect(result.current.visibleData).toEqual(['a', 'b', 'c'])
    expect(result.current.isPending).toBe(true)

    act(() => {
      vi.advanceTimersToNextFrame()
    })
    expect(result.current.visibleData).toEqual(['c', 'd', 'e'])
    expect(result.current.isPending).toBe(false)
  })

  it('should apply a new dataset immediately', () => {
    const { result, rerender } = renderSlice({ data: DATA, start: 3, end: 5 })
    const nextData = ['x', 'y']

    rerender({ data: nextData, start: 0, end: 1 })
    expect(result.current.data).toBe(nextData)
    expect(result.current.visibleData).toEqual(['x', 'y'])
    expect(result.current.isZoomed).toBe(false)
  })
})
