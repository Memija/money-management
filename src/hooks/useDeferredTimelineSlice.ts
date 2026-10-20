import { useEffect, useMemo, useRef, useState } from 'react'

interface TimelineWindow<T> {
  data: T[]
  startIndex: number
  endIndex: number
}

export interface DeferredTimelineSlice<T> {
  /** Full dataset matching `visibleData` (use as chart animation key) */
  data: T[]
  /** Visible slice of the committed window, ready for the chart */
  visibleData: T[]
  /** Committed window start index */
  startIndex: number
  /** Committed window end index */
  endIndex: number
  /** Whether the committed window covers less than the full dataset */
  isZoomed: boolean
  /** Whether the chart is still catching up with the latest window */
  isPending: boolean
}

const isSameWindow = <T>(a: TimelineWindow<T>, b: TimelineWindow<T>): boolean =>
  a.data === b.data && a.startIndex === b.startIndex && a.endIndex === b.endIndex

/**
 * Frame-coalesces the visible timeline window of a chart. Zoom/pan controls (toolbar, slider,
 * labels) keep using the live indices, while the chart receives at most one new window per
 * animation frame. Unlike `useDeferredValue`, a continuous drag can't starve the chart: every
 * frame commits the latest position, so the chart follows the slider instead of jumping at the end.
 * A new dataset (e.g. period change) is applied immediately to keep data and indices consistent.
 * @param data - Full chart dataset
 * @param startIndex - Live window start index
 * @param endIndex - Live window end index
 */
export const useDeferredTimelineSlice = <T>(
  data: T[],
  startIndex: number,
  endIndex: number,
): DeferredTimelineSlice<T> => {
  const liveWindow = useMemo<TimelineWindow<T>>(
    () => ({ data, startIndex, endIndex }),
    [data, startIndex, endIndex],
  )
  const [committedWindow, setCommittedWindow] = useState(liveWindow)
  const latestWindowRef = useRef(liveWindow)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    latestWindowRef.current = liveWindow
    if (frameRef.current !== null) {
      return
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      const latest = latestWindowRef.current
      setCommittedWindow((prev) => (isSameWindow(prev, latest) ? prev : latest))
    })
  }, [liveWindow])

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    },
    [],
  )

  // Dataset swaps bypass the frame queue so a stale window never indexes into new data
  const effectiveWindow = committedWindow.data === data ? committedWindow : liveWindow
  const { data: windowData, startIndex: windowStart, endIndex: windowEnd } = effectiveWindow

  const visibleData = useMemo(() => {
    if (windowData.length <= 1) {
      return windowData
    }
    return windowData.slice(windowStart, windowEnd + 1)
  }, [windowData, windowStart, windowEnd])

  return {
    data: windowData,
    visibleData,
    startIndex: windowStart,
    endIndex: windowEnd,
    isZoomed: visibleData.length < windowData.length,
    isPending: !isSameWindow(effectiveWindow, liveWindow),
  }
}
