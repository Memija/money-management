import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTimelineZoom } from './useTimelineZoom'

describe('useTimelineZoom', () => {
  it('disables zooming and navigation when data is not extensive or fewer than 5 months', () => {
    const { result: res1 } = renderHook(() =>
      useTimelineZoom({ totalCount: 3, isLotsOfData: false }),
    )
    expect(res1.current.canZoomAndNavigate).toBe(false)
    expect(res1.current.startIndex).toBe(0)
    expect(res1.current.endIndex).toBe(2)
    expect(res1.current.isZoomed).toBe(false)

    // Even if isLotsOfData is true, if totalCount is only 3, canZoomAndNavigate is false
    const { result: res2 } = renderHook(() =>
      useTimelineZoom({ totalCount: 3, isLotsOfData: true }),
    )
    expect(res2.current.canZoomAndNavigate).toBe(false)
  })

  it('enables zooming and navigation when extensive data and at least 5 months', () => {
    const { result } = renderHook(() => useTimelineZoom({ totalCount: 12, isLotsOfData: true }))
    expect(result.current.canZoomAndNavigate).toBe(true)
    expect(result.current.startIndex).toBe(0)
    expect(result.current.endIndex).toBe(11)
    expect(result.current.visibleCount).toBe(12)
    expect(result.current.isZoomed).toBe(false)
    expect(result.current.isAtMaxZoom).toBe(true)
    expect(result.current.activePreset).toBe('All')
  })

  it('zooms in and narrows the timeline window', () => {
    const { result } = renderHook(() => useTimelineZoom({ totalCount: 12, isLotsOfData: true }))

    act(() => {
      result.current.zoomIn()
    })

    expect(result.current.visibleCount).toBeLessThan(12)
    expect(result.current.visibleCount).toBeGreaterThanOrEqual(3)
    expect(result.current.isZoomed).toBe(true)
    expect(result.current.isAtMaxZoom).toBe(false)
  })

  it('respects minWindow when zooming in repeatedly', () => {
    const { result } = renderHook(() =>
      useTimelineZoom({ totalCount: 6, isLotsOfData: true, minWindow: 3 }),
    )

    act(() => {
      result.current.zoomIn()
      result.current.zoomIn()
      result.current.zoomIn()
      result.current.zoomIn()
    })

    expect(result.current.visibleCount).toBe(3)
    expect(result.current.isAtMinZoom).toBe(true)
  })

  it('zooms out to widen the timeline window back to full range', () => {
    const { result } = renderHook(() =>
      useTimelineZoom({ totalCount: 10, isLotsOfData: true, minWindow: 3 }),
    )

    act(() => {
      result.current.setPreset('3M')
    })
    expect(result.current.visibleCount).toBe(3)
    expect(result.current.startIndex).toBe(7)
    expect(result.current.endIndex).toBe(9)

    act(() => {
      result.current.zoomOut()
    })
    expect(result.current.visibleCount).toBeGreaterThan(3)

    act(() => {
      result.current.resetZoom()
    })
    expect(result.current.startIndex).toBe(0)
    expect(result.current.endIndex).toBe(9)
    expect(result.current.isZoomed).toBe(false)
  })

  it('pans earlier and later across the timeline', () => {
    const { result } = renderHook(() =>
      useTimelineZoom({ totalCount: 8, isLotsOfData: true, minWindow: 3 }),
    )

    act(() => {
      result.current.setPreset('3M') // indices 5 to 7
    })
    expect(result.current.startIndex).toBe(5)
    expect(result.current.endIndex).toBe(7)
    expect(result.current.isAtEnd).toBe(true)
    expect(result.current.isAtStart).toBe(false)

    act(() => {
      result.current.panEarlier()
    })
    expect(result.current.startIndex).toBe(4)
    expect(result.current.endIndex).toBe(6)
    expect(result.current.isAtEnd).toBe(false)

    act(() => {
      result.current.panLater()
    })
    expect(result.current.startIndex).toBe(5)
    expect(result.current.endIndex).toBe(7)
    expect(result.current.isAtEnd).toBe(true)
  })

  it('handles presets correctly', () => {
    const { result } = renderHook(() => useTimelineZoom({ totalCount: 24, isLotsOfData: true }))

    act(() => {
      result.current.setPreset('3M')
    })
    expect(result.current.visibleCount).toBe(3)
    expect(result.current.startIndex).toBe(21)
    expect(result.current.endIndex).toBe(23)
    expect(result.current.activePreset).toBe('3M')

    act(() => {
      result.current.setPreset('6M')
    })
    expect(result.current.visibleCount).toBe(6)
    expect(result.current.startIndex).toBe(18)
    expect(result.current.endIndex).toBe(23)
    expect(result.current.activePreset).toBe('6M')

    act(() => {
      result.current.setPreset('1Y')
    })
    expect(result.current.visibleCount).toBe(12)
    expect(result.current.startIndex).toBe(12)
    expect(result.current.endIndex).toBe(23)
    expect(result.current.activePreset).toBe('1Y')

    act(() => {
      result.current.setPreset('All')
    })
    expect(result.current.visibleCount).toBe(24)
    expect(result.current.startIndex).toBe(0)
    expect(result.current.endIndex).toBe(23)
    expect(result.current.activePreset).toBe('All')
  })

  it('handles brush range change updates and clamps properly', () => {
    const { result } = renderHook(() => useTimelineZoom({ totalCount: 10, isLotsOfData: true }))

    act(() => {
      result.current.handleBrushChange({ startIndex: 2, endIndex: 6 })
    })
    expect(result.current.startIndex).toBe(2)
    expect(result.current.endIndex).toBe(6)
    expect(result.current.visibleCount).toBe(5)

    // Clamps out-of-range values
    act(() => {
      result.current.handleBrushChange({ startIndex: -5, endIndex: 99 })
    })
    expect(result.current.startIndex).toBe(0)
    expect(result.current.endIndex).toBe(9)
  })

  it('scrubs to a specific ratio along the timeline and keeps current zoom span', () => {
    const { result } = renderHook(() => useTimelineZoom({ totalCount: 20, isLotsOfData: true }))

    // First narrow to 4 months span
    act(() => {
      result.current.handleBrushChange({ startIndex: 0, endIndex: 3 })
    })
    expect(result.current.visibleCount).toBe(4)

    // Scrub to midpoint (0.5)
    act(() => {
      result.current.scrubToRatio(0.5)
    })
    expect(result.current.visibleCount).toBe(4)
    // Target center is 0.5 * 19 = 10; halfSpan = 2; start = 8, end = 11
    expect(result.current.startIndex).toBe(8)
    expect(result.current.endIndex).toBe(11)
  })

  it('updates range directly via setRangeIndices with clamping', () => {
    const { result } = renderHook(() => useTimelineZoom({ totalCount: 20, isLotsOfData: true }))

    act(() => {
      result.current.setRangeIndices(5, 12)
    })
    expect(result.current.startIndex).toBe(5)
    expect(result.current.endIndex).toBe(12)
    expect(result.current.visibleCount).toBe(8)

    // Clamps out of bounds
    act(() => {
      result.current.setRangeIndices(-10, 100)
    })
    expect(result.current.startIndex).toBe(0)
    expect(result.current.endIndex).toBe(19)
  })
})
