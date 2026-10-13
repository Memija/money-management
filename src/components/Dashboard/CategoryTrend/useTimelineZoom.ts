import { startTransition, useCallback, useMemo, useState } from 'react'

export type TimelinePreset = '3M' | '6M' | '1Y' | 'All'

export interface UseTimelineZoomOptions {
  totalCount: number
  isLotsOfData: boolean
  minWindow?: number
}

export interface TimelineRange {
  startIndex: number
  endIndex: number
}

export interface UseTimelineZoomReturn {
  canZoomAndNavigate: boolean
  startIndex: number
  endIndex: number
  visibleCount: number
  isZoomed: boolean
  isAtStart: boolean
  isAtEnd: boolean
  isAtMinZoom: boolean
  isAtMaxZoom: boolean
  activePreset: TimelinePreset | null
  zoomIn: () => void
  zoomOut: () => void
  panEarlier: () => void
  panLater: () => void
  resetZoom: () => void
  setPreset: (preset: TimelinePreset) => void
  handleBrushChange: (range: { startIndex?: number; endIndex?: number } | null | undefined) => void
  setRangeIndices: (startIndex: number, endIndex: number) => void
  scrubToRatio: (ratio: number) => void
}

const DEFAULT_MIN_WINDOW = 3

export function useTimelineZoom({
  totalCount,
  isLotsOfData,
  minWindow = DEFAULT_MIN_WINDOW,
}: UseTimelineZoomOptions): UseTimelineZoomReturn {
  // Timeline zooming and navigation is enabled when there is extensive category data and at least 5 months
  const canZoomAndNavigate = isLotsOfData && totalCount >= 5
  const effectiveMin = Math.min(minWindow, Math.max(1, totalCount))

  const [prevTotalCount, setPrevTotalCount] = useState(totalCount)
  const [range, setRange] = useState<TimelineRange>(() => ({
    startIndex: 0,
    endIndex: Math.max(0, totalCount - 1),
  }))

  // Synchronize/reset range when totalCount changes
  if (prevTotalCount !== totalCount) {
    setPrevTotalCount(totalCount)
    setRange({
      startIndex: 0,
      endIndex: Math.max(0, totalCount - 1),
    })
  }

  // Clamp current indices safely within [0, totalCount - 1]
  const startIndex = Math.max(0, Math.min(range.startIndex, totalCount - 1))
  const endIndex = Math.max(startIndex, Math.min(range.endIndex, totalCount - 1))
  const visibleCount = totalCount > 0 ? endIndex - startIndex + 1 : 0

  const isZoomed = totalCount > 0 && (startIndex > 0 || endIndex < totalCount - 1)
  const isAtStart = startIndex <= 0
  const isAtEnd = endIndex >= totalCount - 1
  const isAtMinZoom = visibleCount <= effectiveMin
  const isAtMaxZoom = !isZoomed

  const activePreset = useMemo<TimelinePreset | null>(() => {
    if (totalCount === 0) return null
    if (startIndex === 0 && endIndex === totalCount - 1) return 'All'
    if (isAtEnd && visibleCount === 3) return '3M'
    if (isAtEnd && visibleCount === 6) return '6M'
    if (isAtEnd && visibleCount === 12) return '1Y'
    return null
  }, [totalCount, startIndex, endIndex, isAtEnd, visibleCount])

  const zoomIn = useCallback(() => {
    if (totalCount <= effectiveMin) return

    startTransition(() => {
      setRange((prev) => {
        const curSpan = prev.endIndex - prev.startIndex + 1
        if (curSpan <= effectiveMin) return prev

        const step = Math.max(1, Math.round(curSpan * 0.25))
        const targetSpan = Math.max(effectiveMin, curSpan - step)
        const diff = curSpan - targetSpan

        const trimStart = Math.floor(diff / 2)
        const trimEnd = diff - trimStart

        const newStart = Math.min(prev.startIndex + trimStart, totalCount - targetSpan)
        const newEnd = Math.max(prev.endIndex - trimEnd, newStart + targetSpan - 1)

        return {
          startIndex: Math.max(0, newStart),
          endIndex: Math.min(totalCount - 1, newEnd),
        }
      })
    })
  }, [totalCount, effectiveMin])

  const zoomOut = useCallback(() => {
    if (totalCount <= 0) return

    startTransition(() => {
      setRange((prev) => {
        if (prev.startIndex <= 0 && prev.endIndex >= totalCount - 1) return prev

        const curSpan = prev.endIndex - prev.startIndex + 1
        if (curSpan >= totalCount) return prev

        const step = Math.max(1, Math.round(curSpan * 0.3))
        const addStart = Math.ceil(step / 2)
        const addEnd = step - addStart

        let newStart = prev.startIndex - addStart
        let newEnd = prev.endIndex + addEnd

        if (newStart < 0) {
          newEnd += Math.abs(newStart)
          newStart = 0
        }
        if (newEnd > totalCount - 1) {
          newStart -= newEnd - (totalCount - 1)
          newEnd = totalCount - 1
        }

        return {
          startIndex: Math.max(0, newStart),
          endIndex: Math.min(totalCount - 1, newEnd),
        }
      })
    })
  }, [totalCount])

  const panEarlier = useCallback(() => {
    startTransition(() => {
      setRange((prev) => {
        if (prev.startIndex <= 0) return prev
        const span = prev.endIndex - prev.startIndex
        const newStart = Math.max(0, prev.startIndex - 1)
        const newEnd = newStart + span
        return { startIndex: newStart, endIndex: newEnd }
      })
    })
  }, [])

  const panLater = useCallback(() => {
    startTransition(() => {
      setRange((prev) => {
        if (prev.endIndex >= totalCount - 1) return prev
        const span = prev.endIndex - prev.startIndex
        const newEnd = Math.min(totalCount - 1, prev.endIndex + 1)
        const newStart = Math.max(0, newEnd - span)
        return { startIndex: newStart, endIndex: newEnd }
      })
    })
  }, [totalCount])

  const resetZoom = useCallback(() => {
    startTransition(() => {
      setRange({
        startIndex: 0,
        endIndex: Math.max(0, totalCount - 1),
      })
    })
  }, [totalCount])

  const setPreset = useCallback(
    (preset: TimelinePreset) => {
      if (preset === 'All') {
        startTransition(() => {
          setRange({ startIndex: 0, endIndex: Math.max(0, totalCount - 1) })
        })
        return
      }

      const targetSpan = preset === '3M' ? 3 : preset === '6M' ? 6 : 12
      const span = Math.min(targetSpan, totalCount)
      const start = Math.max(0, totalCount - span)
      const end = Math.max(0, totalCount - 1)
      startTransition(() => {
        setRange({ startIndex: start, endIndex: end })
      })
    },
    [totalCount],
  )

  const handleBrushChange = useCallback(
    (newRange: { startIndex?: number; endIndex?: number } | null | undefined) => {
      if (
        newRange &&
        typeof newRange.startIndex === 'number' &&
        typeof newRange.endIndex === 'number'
      ) {
        const start = Math.max(0, Math.min(newRange.startIndex, totalCount - 1))
        const end = Math.max(start, Math.min(newRange.endIndex, totalCount - 1))

        startTransition(() => {
          setRange((prev) => {
            if (prev.startIndex === start && prev.endIndex === end) {
              return prev
            }
            return { startIndex: start, endIndex: end }
          })
        })
      }
    },
    [totalCount],
  )

  const setRangeIndices = useCallback(
    (newStart: number, newEnd: number) => {
      const start = Math.max(0, Math.min(newStart, totalCount - 1))
      const end = Math.max(start, Math.min(newEnd, totalCount - 1))

      setRange((prev) => {
        if (prev.startIndex === start && prev.endIndex === end) {
          return prev
        }
        return { startIndex: start, endIndex: end }
      })
    },
    [totalCount],
  )

  const scrubToRatio = useCallback(
    (ratio: number) => {
      if (totalCount <= 0) return
      const clampedRatio = Math.max(0, Math.min(1, ratio))
      const targetCenter = Math.round(clampedRatio * (totalCount - 1))

      startTransition(() => {
        setRange((prev) => {
          const currentSpan = prev.endIndex - prev.startIndex + 1
          const halfSpan = Math.floor(currentSpan / 2)

          let newStart = targetCenter - halfSpan
          let newEnd = newStart + currentSpan - 1

          if (newStart < 0) {
            newEnd = Math.min(totalCount - 1, newEnd + Math.abs(newStart))
            newStart = 0
          }
          if (newEnd > totalCount - 1) {
            newStart = Math.max(0, newStart - (newEnd - (totalCount - 1)))
            newEnd = totalCount - 1
          }

          if (prev.startIndex === newStart && prev.endIndex === newEnd) {
            return prev
          }
          return { startIndex: newStart, endIndex: newEnd }
        })
      })
    },
    [totalCount],
  )

  return {
    canZoomAndNavigate,
    startIndex,
    endIndex,
    visibleCount,
    isZoomed,
    isAtStart,
    isAtEnd,
    isAtMinZoom,
    isAtMaxZoom,
    activePreset,
    zoomIn,
    zoomOut,
    panEarlier,
    panLater,
    resetZoom,
    setPreset,
    handleBrushChange,
    setRangeIndices,
    scrubToRatio,
  }
}
