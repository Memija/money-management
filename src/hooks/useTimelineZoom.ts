import { useCallback, useMemo, useState } from 'react'

import { useTimelineSelectionStore } from '../store/useTimelineSelectionStore'
import {
  createTimelineSelection,
  DEFAULT_TIMELINE_SELECTION,
  getSortableTimelineKeys,
  isSameTimelineSelection,
  resolveTimelineSelection,
  type TimelineSelection,
} from '../utils/timeline-selection'
import {
  clampWindow,
  detectPreset,
  getPresetRange,
  type TimelinePreset,
  type TimelineRange,
  zoomWindow,
} from '../utils/timeline-window'

export type { TimelinePreset, TimelineRange } from '../utils/timeline-window'

export const MIN_MONTHS_ZOOM_MOBILE = 12
export const MIN_MONTHS_ZOOM_DESKTOP = 24

export interface UseTimelineZoomOptions {
  totalCount: number
  isLotsOfData: boolean
  minWindow?: number
  /** Sortable calendar keys (`'YYYY-MM'`) used to keep the window aligned when data changes. */
  monthKeys?: string[]
  minCount?: number
  /**
   * Charts with the same sync key share one calendar window (e.g. all dashboard charts).
   * Without it, the hook keeps its own local selection.
   */
  syncKey?: string
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

/**
 * Selection state: local by default, or shared through the timeline selection store when a
 * sync key is given. Updates with an identical selection are skipped to avoid re-renders.
 */
const useTimelineSelection = (
  syncKey: string | undefined,
): [TimelineSelection, (next: TimelineSelection) => void] => {
  const [localSelection, setLocalSelection] = useState<TimelineSelection>(
    DEFAULT_TIMELINE_SELECTION,
  )
  const sharedSelection = useTimelineSelectionStore((state) =>
    syncKey ? state.selections[syncKey] : undefined,
  )
  const setSharedSelection = useTimelineSelectionStore((state) => state.setSelection)

  const updateSelection = useCallback(
    (next: TimelineSelection) => {
      if (syncKey) {
        setSharedSelection(syncKey, next)
        return
      }
      setLocalSelection((prev) => (isSameTimelineSelection(prev, next) ? prev : next))
    },
    [syncKey, setSharedSelection],
  )

  const selection = syncKey ? (sharedSelection ?? DEFAULT_TIMELINE_SELECTION) : localSelection
  return [selection, updateSelection]
}

export function useTimelineZoom({
  totalCount,
  isLotsOfData,
  minWindow = DEFAULT_MIN_WINDOW,
  monthKeys,
  minCount = 5,
  syncKey,
}: UseTimelineZoomOptions): UseTimelineZoomReturn {
  // Timeline zooming and navigation is enabled when data volume criteria and minimum threshold are met
  const canZoomAndNavigate = isLotsOfData && totalCount >= minCount
  const effectiveMin = Math.min(minWindow, Math.max(1, totalCount))

  const [selection, updateSelection] = useTimelineSelection(syncKey)

  const keys = useMemo(
    () => getSortableTimelineKeys(monthKeys, totalCount),
    [monthKeys, totalCount],
  )

  // The window is derived from the (calendar based) selection, so presets, custom windows and
  // shared windows automatically follow dataset changes without extra reconciliation state.
  // A synced chart without zoom UI always shows everything instead of a window it can't control.
  const range = useMemo<TimelineRange>(
    () =>
      syncKey && !canZoomAndNavigate
        ? getPresetRange('All', totalCount)
        : resolveTimelineSelection(selection, keys, effectiveMin),
    [syncKey, canZoomAndNavigate, totalCount, selection, keys, effectiveMin],
  )

  // Clamp current indices safely within [0, totalCount - 1]
  const startIndex = Math.max(0, Math.min(range.startIndex, totalCount - 1))
  const endIndex = Math.max(startIndex, Math.min(range.endIndex, totalCount - 1))
  const visibleCount = totalCount > 0 ? endIndex - startIndex + 1 : 0

  const isZoomed = totalCount > 0 && (startIndex > 0 || endIndex < totalCount - 1)
  const isAtStart = startIndex <= 0
  const isAtEnd = endIndex >= totalCount - 1
  const isAtMinZoom = visibleCount <= effectiveMin
  const isAtMaxZoom = !isZoomed

  const activePreset = useMemo<TimelinePreset | null>(
    () => detectPreset(startIndex, endIndex, totalCount),
    [startIndex, endIndex, totalCount],
  )

  const setRangeIndices = useCallback(
    (newStart: number, newEnd: number) => {
      if (totalCount <= 0) {
        return
      }
      const start = Math.max(0, Math.min(newStart, totalCount - 1))
      const end = Math.max(start, Math.min(newEnd, totalCount - 1))
      updateSelection(createTimelineSelection(start, end, keys))
    },
    [totalCount, keys, updateSelection],
  )

  const zoomIn = useCallback(() => {
    const [start, end] = zoomWindow(startIndex, endIndex, totalCount, effectiveMin, 'in')
    setRangeIndices(start, end)
  }, [startIndex, endIndex, totalCount, effectiveMin, setRangeIndices])

  const zoomOut = useCallback(() => {
    const [start, end] = zoomWindow(startIndex, endIndex, totalCount, effectiveMin, 'out')
    setRangeIndices(start, end)
  }, [startIndex, endIndex, totalCount, effectiveMin, setRangeIndices])

  const panEarlier = useCallback(() => {
    const [start, end] = clampWindow(startIndex - 1, endIndex - 1, totalCount)
    setRangeIndices(start, end)
  }, [startIndex, endIndex, totalCount, setRangeIndices])

  const panLater = useCallback(() => {
    const [start, end] = clampWindow(startIndex + 1, endIndex + 1, totalCount)
    setRangeIndices(start, end)
  }, [startIndex, endIndex, totalCount, setRangeIndices])

  const setPreset = useCallback(
    (preset: TimelinePreset) => updateSelection({ kind: 'preset', preset }),
    [updateSelection],
  )

  const resetZoom = useCallback(() => setPreset('All'), [setPreset])

  const handleBrushChange = useCallback(
    (newRange: { startIndex?: number; endIndex?: number } | null | undefined) => {
      if (typeof newRange?.startIndex === 'number' && typeof newRange.endIndex === 'number') {
        setRangeIndices(newRange.startIndex, newRange.endIndex)
      }
    },
    [setRangeIndices],
  )

  const scrubToRatio = useCallback(
    (ratio: number) => {
      if (totalCount <= 0) {
        return
      }
      const clampedRatio = Math.max(0, Math.min(1, ratio))
      const targetCenter = Math.round(clampedRatio * (totalCount - 1))
      const newStart = targetCenter - Math.floor(visibleCount / 2)
      const [start, end] = clampWindow(newStart, newStart + visibleCount - 1, totalCount)
      setRangeIndices(start, end)
    },
    [totalCount, visibleCount, setRangeIndices],
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
