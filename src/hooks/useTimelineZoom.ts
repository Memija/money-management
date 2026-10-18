import { useCallback, useMemo, useState } from 'react'

export type TimelinePreset = '3M' | '6M' | '1Y' | 'All'

export const MIN_MONTHS_ZOOM_MOBILE = 12
export const MIN_MONTHS_ZOOM_DESKTOP = 24

export interface UseTimelineZoomOptions {
  totalCount: number
  isLotsOfData: boolean
  minWindow?: number
  monthKeys?: string[]
  minCount?: number
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
  monthKeys,
  minCount = 5,
}: UseTimelineZoomOptions): UseTimelineZoomReturn {
  // Timeline zooming and navigation is enabled when data volume criteria and minimum threshold are met
  const canZoomAndNavigate = isLotsOfData && totalCount >= minCount
  const effectiveMin = Math.min(minWindow, Math.max(1, totalCount))

  const [selectedPreset, setSelectedPreset] = useState<TimelinePreset | null>('All')
  const [prevTotalCount, setPrevTotalCount] = useState(totalCount)
  const [prevMonthKeys, setPrevMonthKeys] = useState<string[] | undefined>(monthKeys)
  const [range, setRange] = useState<TimelineRange>(() => ({
    startIndex: 0,
    endIndex: Math.max(0, totalCount - 1),
  }))

  const keysChanged =
    monthKeys && prevMonthKeys
      ? monthKeys.length !== prevMonthKeys.length ||
        monthKeys[0] !== prevMonthKeys[0] ||
        monthKeys[monthKeys.length - 1] !== prevMonthKeys[prevMonthKeys.length - 1]
      : false

  // Synchronize range when totalCount or monthKeys change while preserving active preset or custom zoom span
  if (prevTotalCount !== totalCount || keysChanged) {
    const oldKeys = prevMonthKeys
    setPrevTotalCount(totalCount)
    setPrevMonthKeys(monthKeys)

    if (totalCount <= 0) {
      setRange({ startIndex: 0, endIndex: 0 })
    } else if (selectedPreset === 'All') {
      setRange({
        startIndex: 0,
        endIndex: Math.max(0, totalCount - 1),
      })
    } else if (selectedPreset === '3M' || selectedPreset === '6M' || selectedPreset === '1Y') {
      const targetSpan = selectedPreset === '3M' ? 3 : selectedPreset === '6M' ? 6 : 12
      const span = Math.min(targetSpan, totalCount)
      setRange({
        startIndex: Math.max(0, totalCount - span),
        endIndex: Math.max(0, totalCount - 1),
      })
    } else {
      // Custom range: attempt calendar reconciliation using date keys first
      let matchedByDate = false
      if (oldKeys && monthKeys && oldKeys[range.startIndex] && oldKeys[range.endIndex]) {
        const startKey = oldKeys[range.startIndex]
        const endKey = oldKeys[range.endIndex]
        const newStart = monthKeys.indexOf(startKey)
        const newEnd = monthKeys.indexOf(endKey)
        if (newStart !== -1 && newEnd !== -1 && newStart <= newEnd) {
          setRange({ startIndex: newStart, endIndex: newEnd })
          matchedByDate = true
        }
      }

      if (!matchedByDate) {
        // Fall back to preserving window size and anchor position
        setRange((prev) => {
          const prevSpan = prev.endIndex - prev.startIndex + 1
          const span = Math.min(Math.max(effectiveMin, prevSpan), totalCount)
          const wasAtEnd = prevTotalCount > 0 && prev.endIndex >= prevTotalCount - 1

          if (wasAtEnd) {
            const end = Math.max(0, totalCount - 1)
            const start = Math.max(0, end - span + 1)
            return { startIndex: start, endIndex: end }
          }

          const start = Math.max(0, Math.min(prev.startIndex, totalCount - span))
          const end = Math.min(totalCount - 1, start + span - 1)
          return { startIndex: start, endIndex: end }
        })
      }
    }
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
    if (selectedPreset === '6M' && visibleCount === 6 && isAtEnd) return '6M'
    if (selectedPreset === '3M' && visibleCount === 3 && isAtEnd) return '3M'
    if (selectedPreset === '1Y' && visibleCount === 12 && isAtEnd) return '1Y'
    if (startIndex === 0 && endIndex === totalCount - 1) return 'All'
    if (isAtEnd && visibleCount === 3) return '3M'
    if (isAtEnd && visibleCount === 6) return '6M'
    if (isAtEnd && visibleCount === 12) return '1Y'
    return null
  }, [totalCount, startIndex, endIndex, isAtEnd, visibleCount, selectedPreset])

  const zoomIn = useCallback(() => {
    if (totalCount <= effectiveMin) return
    setSelectedPreset(null)

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
  }, [totalCount, effectiveMin])

  const zoomOut = useCallback(() => {
    if (totalCount <= 0) return

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

      const clampedStart = Math.max(0, newStart)
      const clampedEnd = Math.min(totalCount - 1, newEnd)

      if (clampedStart === 0 && clampedEnd === totalCount - 1) {
        setSelectedPreset('All')
      } else {
        setSelectedPreset(null)
      }

      return {
        startIndex: clampedStart,
        endIndex: clampedEnd,
      }
    })
  }, [totalCount])

  const panEarlier = useCallback(() => {
    setSelectedPreset(null)
    setRange((prev) => {
      if (prev.startIndex <= 0) return prev
      const span = prev.endIndex - prev.startIndex
      const newStart = Math.max(0, prev.startIndex - 1)
      const newEnd = newStart + span
      return { startIndex: newStart, endIndex: newEnd }
    })
  }, [])

  const panLater = useCallback(() => {
    setSelectedPreset(null)
    setRange((prev) => {
      if (prev.endIndex >= totalCount - 1) return prev
      const span = prev.endIndex - prev.startIndex
      const newEnd = Math.min(totalCount - 1, prev.endIndex + 1)
      const newStart = Math.max(0, newEnd - span)
      return { startIndex: newStart, endIndex: newEnd }
    })
  }, [totalCount])

  const resetZoom = useCallback(() => {
    setSelectedPreset('All')
    setRange({
      startIndex: 0,
      endIndex: Math.max(0, totalCount - 1),
    })
  }, [totalCount])

  const setPreset = useCallback(
    (preset: TimelinePreset) => {
      setSelectedPreset(preset)
      if (preset === 'All') {
        setRange({ startIndex: 0, endIndex: Math.max(0, totalCount - 1) })
        return
      }

      const targetSpan = preset === '3M' ? 3 : preset === '6M' ? 6 : 12
      const span = Math.min(targetSpan, totalCount)
      const start = Math.max(0, totalCount - span)
      const end = Math.max(0, totalCount - 1)
      setRange({ startIndex: start, endIndex: end })
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

        const isEnd = end >= totalCount - 1
        const span = end - start + 1
        if (start === 0 && end === totalCount - 1) {
          setSelectedPreset('All')
        } else if (isEnd && span === 6) {
          setSelectedPreset('6M')
        } else if (isEnd && span === 3) {
          setSelectedPreset('3M')
        } else if (isEnd && span === 12) {
          setSelectedPreset('1Y')
        } else {
          setSelectedPreset(null)
        }

        setRange((prev) => {
          if (prev.startIndex === start && prev.endIndex === end) {
            return prev
          }
          return { startIndex: start, endIndex: end }
        })
      }
    },
    [totalCount],
  )

  const setRangeIndices = useCallback(
    (newStart: number, newEnd: number) => {
      const start = Math.max(0, Math.min(newStart, totalCount - 1))
      const end = Math.max(start, Math.min(newEnd, totalCount - 1))

      const isEnd = end >= totalCount - 1
      const span = end - start + 1
      if (start === 0 && end === totalCount - 1) {
        setSelectedPreset('All')
      } else if (isEnd && span === 6) {
        setSelectedPreset('6M')
      } else if (isEnd && span === 3) {
        setSelectedPreset('3M')
      } else if (isEnd && span === 12) {
        setSelectedPreset('1Y')
      } else {
        setSelectedPreset(null)
      }

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
      setSelectedPreset(null)
      const clampedRatio = Math.max(0, Math.min(1, ratio))
      const targetCenter = Math.round(clampedRatio * (totalCount - 1))

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

        if (newStart === 0 && newEnd === totalCount - 1) {
          setSelectedPreset('All')
        }

        if (prev.startIndex === newStart && prev.endIndex === newEnd) {
          return prev
        }
        return { startIndex: newStart, endIndex: newEnd }
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
