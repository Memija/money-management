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

  it('zooms in and out symmetrically back to the original span', () => {
    const { result } = renderHook(() => useTimelineZoom({ totalCount: 24, isLotsOfData: true }))

    act(() => {
      result.current.zoomIn()
    })
    expect(result.current.visibleCount).toBe(18)

    act(() => {
      result.current.zoomOut()
    })
    expect(result.current.visibleCount).toBe(24)
    expect(result.current.activePreset).toBe('All')
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

  it('preserves active preset (6M) when totalCount changes', () => {
    let count = 24
    const { result, rerender } = renderHook(() =>
      useTimelineZoom({ totalCount: count, isLotsOfData: true }),
    )

    act(() => {
      result.current.setPreset('6M')
    })
    expect(result.current.activePreset).toBe('6M')
    expect(result.current.visibleCount).toBe(6)
    expect(result.current.startIndex).toBe(18)
    expect(result.current.endIndex).toBe(23)

    // Simulate dataset change (e.g. changing transaction category or category filter from 24 to 20 months)
    count = 20
    rerender()

    expect(result.current.activePreset).toBe('6M')
    expect(result.current.visibleCount).toBe(6)
    expect(result.current.startIndex).toBe(14)
    expect(result.current.endIndex).toBe(19)

    // Simulate clearing filter (from 20 back to 24 months)
    count = 24
    rerender()

    expect(result.current.activePreset).toBe('6M')
    expect(result.current.visibleCount).toBe(6)
    expect(result.current.startIndex).toBe(18)
    expect(result.current.endIndex).toBe(23)
  })

  it('preserves active preset (3M) when totalCount changes', () => {
    let count = 12
    const { result, rerender } = renderHook(() =>
      useTimelineZoom({ totalCount: count, isLotsOfData: true }),
    )

    act(() => {
      result.current.setPreset('3M')
    })
    expect(result.current.activePreset).toBe('3M')
    expect(result.current.visibleCount).toBe(3)
    expect(result.current.startIndex).toBe(9)
    expect(result.current.endIndex).toBe(11)

    // Total count increases
    count = 15
    rerender()

    expect(result.current.activePreset).toBe('3M')
    expect(result.current.visibleCount).toBe(3)
    expect(result.current.startIndex).toBe(12)
    expect(result.current.endIndex).toBe(14)
  })

  it('preserves custom zoom window span when totalCount changes', () => {
    let count = 20
    const { result, rerender } = renderHook(() =>
      useTimelineZoom({ totalCount: count, isLotsOfData: true }),
    )

    // Set custom 5-month window in the middle
    act(() => {
      result.current.setRangeIndices(6, 10)
    })
    expect(result.current.visibleCount).toBe(5)
    expect(result.current.startIndex).toBe(6)
    expect(result.current.endIndex).toBe(10)

    // totalCount shifts slightly
    count = 18
    rerender()

    expect(result.current.visibleCount).toBe(5)
    expect(result.current.startIndex).toBe(6)
    expect(result.current.endIndex).toBe(10)
  })

  it('preserves end-anchored custom window when totalCount changes', () => {
    let count = 20
    const { result, rerender } = renderHook(() =>
      useTimelineZoom({ totalCount: count, isLotsOfData: true }),
    )

    // Set custom 5-month window anchored at the end (indices 15 to 19)
    act(() => {
      result.current.setRangeIndices(15, 19)
    })
    expect(result.current.visibleCount).toBe(5)
    expect(result.current.isAtEnd).toBe(true)

    // totalCount changes to 16
    count = 16
    rerender()

    expect(result.current.visibleCount).toBe(5)
    expect(result.current.startIndex).toBe(11)
    expect(result.current.endIndex).toBe(15)
    expect(result.current.isAtEnd).toBe(true)
  })

  it('reconciles custom date window using monthKeys when dataset keys shift', () => {
    let keys = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06']
    const { result, rerender } = renderHook(() =>
      useTimelineZoom({ totalCount: keys.length, isLotsOfData: true, monthKeys: keys }),
    )

    // Select custom window: 2025-02 to 2025-04 (indices 1 to 3)
    act(() => {
      result.current.setRangeIndices(1, 3)
    })
    expect(result.current.startIndex).toBe(1)
    expect(result.current.endIndex).toBe(3)

    // Dataset prepends earlier months (e.g. 2024-11, 2024-12)
    keys = ['2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06']
    rerender()

    // 2025-02 is now index 3, and 2025-04 is index 5
    expect(result.current.startIndex).toBe(3)
    expect(result.current.endIndex).toBe(5)
  })

  describe('with a shared syncKey', () => {
    const CONTINUOUS = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06']
    const WITH_GAPS = ['2025-01', '2025-03', '2025-04', '2025-05', '2025-06']

    const renderSynced = (keys: string[]) =>
      renderHook(() =>
        useTimelineZoom({
          totalCount: keys.length,
          isLotsOfData: true,
          minWindow: 1,
          monthKeys: keys,
          syncKey: 'test',
        }),
      )

    it('should keep two charts on the same calendar window', () => {
      const { result: first } = renderSynced(CONTINUOUS)
      const { result: second } = renderSynced(WITH_GAPS)

      act(() => {
        first.current.setRangeIndices(2, 3) // 2025-03 … 2025-04
      })

      expect(second.current.startIndex).toBe(1)
      expect(second.current.endIndex).toBe(2)

      act(() => {
        second.current.setPreset('3M')
      })

      expect(first.current.activePreset).toBe('3M')
      expect(first.current.startIndex).toBe(3)
      expect(first.current.endIndex).toBe(5)
    })

    it('should show the full range when the synced chart cannot zoom', () => {
      const { result: zoomable } = renderSynced(CONTINUOUS)
      const { result: locked } = renderHook(() =>
        useTimelineZoom({ totalCount: 3, isLotsOfData: false, syncKey: 'test' }),
      )

      act(() => {
        zoomable.current.setPreset('3M')
      })

      expect(locked.current.startIndex).toBe(0)
      expect(locked.current.endIndex).toBe(2)
    })
  })
})
