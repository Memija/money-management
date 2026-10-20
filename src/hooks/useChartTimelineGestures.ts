import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseChartTimelineGesturesOptions {
  /** Whether direct in-chart gestures (pan & zoom) are active */
  enabled: boolean
  /** Total number of months available in the entire dataset */
  totalCount: number
  /** Currently visible starting month index */
  startIndex: number
  /** Currently visible ending month index */
  endIndex: number
  /** Minimum window of months when zooming in (default: 3) */
  minWindow?: number
  /** Callback invoked when the user pans or zooms to a new range */
  onRangeChange: (startIndex: number, endIndex: number) => void
  /** Optional callback to zoom in */
  onZoomIn?: () => void
  /** Optional callback to zoom out */
  onZoomOut?: () => void
  /** Optional callback to reset zoom */
  onResetZoom?: () => void
  /** Optional callback to step back one month */
  onPanEarlier?: () => void
  /** Optional callback to step forward one month */
  onPanLater?: () => void
}

interface DragState {
  startX: number
  startY: number
  startIdx: number
  endIdx: number
  chartWidth: number
  isLocked: boolean
  isPan: boolean
}

interface PinchState {
  initialDist: number
  initialSpan: number
  initialStart: number
  initialEnd: number
  centerRatio: number
}

/**
 * Shifts a [start, end] window back inside [0, maxCount - 1] while preserving its span when possible.
 * @returns Clamped `[start, end]` tuple
 */
const clampWindow = (start: number, end: number, maxCount: number): [number, number] => {
  let newStart = start
  let newEnd = end
  if (newStart < 0) {
    newEnd = Math.min(maxCount - 1, newEnd + Math.abs(newStart))
    newStart = 0
  }
  if (newEnd > maxCount - 1) {
    newStart = Math.max(0, newStart - (newEnd - (maxCount - 1)))
    newEnd = maxCount - 1
  }
  newStart = Math.max(0, newStart)
  newEnd = Math.min(maxCount - 1, Math.max(newStart, newEnd))
  return [newStart, newEnd]
}

/**
 * Custom hook providing touch gestures (swipe-to-pan, pinch-to-zoom, double-tap)
 * and pointer drag on the chart canvas when floating tooltips are disabled on mobile.
 */
export function useChartTimelineGestures({
  enabled,
  totalCount,
  startIndex,
  endIndex,
  minWindow = 3,
  onRangeChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPanEarlier,
  onPanLater,
}: UseChartTimelineGesturesOptions) {
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setElement(node)
  }, [])

  // Keep latest values in a ref so native event listeners never suffer from stale closures
  const latestRef = useRef({
    totalCount,
    startIndex,
    endIndex,
    minWindow,
    onRangeChange,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    onPanEarlier,
    onPanLater,
  })

  useEffect(() => {
    latestRef.current = {
      totalCount,
      startIndex,
      endIndex,
      minWindow,
      onRangeChange,
      onZoomIn,
      onZoomOut,
      onResetZoom,
      onPanEarlier,
      onPanLater,
    }
  })

  useEffect(() => {
    const el = element
    if (!el || !enabled || totalCount <= 0) {
      return
    }

    const dragRef = { current: null as DragState | null }
    const pinchRef = { current: null as PinchState | null }
    const lastTapRef = { current: { time: 0, x: 0, y: 0 } }
    // Last range emitted during the active gesture; move events that resolve to the same
    // month window are dropped so the charts don't re-render for sub-month finger movement
    const lastEmitted = { start: -1, end: -1 }

    const resetEmitted = () => {
      lastEmitted.start = latestRef.current.startIndex
      lastEmitted.end = latestRef.current.endIndex
    }

    const emitRange = (start: number, end: number) => {
      const [newStart, newEnd] = clampWindow(start, end, latestRef.current.totalCount)
      if (newStart === lastEmitted.start && newEnd === lastEmitted.end) {
        return
      }
      lastEmitted.start = newStart
      lastEmitted.end = newEnd
      latestRef.current.onRangeChange(newStart, newEnd)
    }

    const handleTouchStart = (e: TouchEvent) => {
      const rect = el.getBoundingClientRect()
      const chartWidth = Math.max(1, rect.width)
      resetEmitted()

      if (e.touches.length === 1) {
        const touch = e.touches[0]
        dragRef.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          startIdx: latestRef.current.startIndex,
          endIdx: latestRef.current.endIndex,
          chartWidth,
          isLocked: false,
          isPan: false,
        }

        // Double-tap detection
        const now = Date.now()
        const lastTap = lastTapRef.current
        if (
          now - lastTap.time < 320 &&
          Math.hypot(touch.clientX - lastTap.x, touch.clientY - lastTap.y) < 30
        ) {
          lastTapRef.current = { time: 0, x: 0, y: 0 }
          const currentSpan = latestRef.current.endIndex - latestRef.current.startIndex + 1
          if (currentSpan < latestRef.current.totalCount) {
            latestRef.current.onResetZoom?.()
          } else {
            latestRef.current.onZoomIn?.()
          }
          return
        }
        lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY }
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
        const centerX = (t1.clientX + t2.clientX) / 2
        const centerRatio = Math.max(0, Math.min(1, (centerX - rect.left) / chartWidth))

        pinchRef.current = {
          initialDist: Math.max(10, dist),
          initialSpan: latestRef.current.endIndex - latestRef.current.startIndex + 1,
          initialStart: latestRef.current.startIndex,
          initialEnd: latestRef.current.endIndex,
          centerRatio,
        }

        if (dragRef.current) {
          dragRef.current.isPan = false
          dragRef.current.isLocked = true
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      // 2-finger pinch-to-zoom
      if (e.touches.length === 2 && pinchRef.current) {
        if (e.cancelable) e.preventDefault()
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
        const p = pinchRef.current
        const scale = dist / p.initialDist
        if (scale <= 0) return

        const targetSpan = Math.round(p.initialSpan / scale)
        const minWin = latestRef.current.minWindow ?? 3
        const maxCount = latestRef.current.totalCount
        const clampedSpan = Math.max(minWin, Math.min(maxCount, targetSpan))

        const anchor = p.initialStart + p.centerRatio * (p.initialSpan - 1)
        const newStart = Math.round(anchor - p.centerRatio * (clampedSpan - 1))
        emitRange(newStart, newStart + clampedSpan - 1)
        return
      }

      // 1-finger horizontal pan (preserving vertical page scroll)
      if (e.touches.length === 1 && dragRef.current) {
        const drag = dragRef.current
        const touch = e.touches[0]
        const dx = touch.clientX - drag.startX
        const dy = touch.clientY - drag.startY

        if (!drag.isLocked) {
          // If vertical displacement is greater, lock out pan to let page scroll
          if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
            drag.isLocked = true
            drag.isPan = false
            return
          }
          if (Math.abs(dx) >= Math.abs(dy) && Math.abs(dx) > 8) {
            drag.isLocked = true
            drag.isPan = true
          }
        }

        if (drag.isPan) {
          if (e.cancelable) e.preventDefault()
          const span = drag.endIdx - drag.startIdx + 1
          const deltaMonths = -Math.round((dx / drag.chartWidth) * span)
          emitRange(drag.startIdx + deltaMonths, drag.endIdx + deltaMonths)
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchRef.current = null
      }
      if (e.touches.length === 0) {
        dragRef.current = null
      }
    }

    // Pointer events for desktop testing / mouse drag
    let mouseDragState: {
      startX: number
      startIdx: number
      endIdx: number
      chartWidth: number
      isDragging: boolean
    } | null = null

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      const rect = el.getBoundingClientRect()
      resetEmitted()
      mouseDragState = {
        startX: e.clientX,
        startIdx: latestRef.current.startIndex,
        endIdx: latestRef.current.endIndex,
        chartWidth: Math.max(1, rect.width),
        isDragging: false,
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!mouseDragState) return
      const dx = e.clientX - mouseDragState.startX
      if (!mouseDragState.isDragging && Math.abs(dx) > 5) {
        mouseDragState.isDragging = true
        try {
          el.setPointerCapture(e.pointerId)
        } catch {
          // ignore pointer capture errors in testing/synthetic environments
        }
      }

      if (mouseDragState.isDragging) {
        const span = mouseDragState.endIdx - mouseDragState.startIdx + 1
        const deltaMonths = -Math.round((dx / mouseDragState.chartWidth) * span)
        emitRange(mouseDragState.startIdx + deltaMonths, mouseDragState.endIdx + deltaMonths)
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (mouseDragState?.isDragging) {
        try {
          el.releasePointerCapture(e.pointerId)
        } catch {
          // ignore
        }
      }
      mouseDragState = null
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.cancelable) e.preventDefault()
        if (e.deltaY < 0) {
          latestRef.current.onZoomIn?.()
        } else if (e.deltaY > 0) {
          latestRef.current.onZoomOut?.()
        }
      } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 12) {
        if (e.cancelable) e.preventDefault()
        if (e.deltaX > 0) {
          latestRef.current.onPanLater?.()
        } else if (e.deltaX < 0) {
          latestRef.current.onPanEarlier?.()
        }
      }
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true })
    el.addEventListener('pointerdown', handlePointerDown)
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerup', handlePointerUp)
    el.addEventListener('pointercancel', handlePointerUp)
    el.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
      el.removeEventListener('touchcancel', handleTouchEnd)
      el.removeEventListener('pointerdown', handlePointerDown)
      el.removeEventListener('pointermove', handlePointerMove)
      el.removeEventListener('pointerup', handlePointerUp)
      el.removeEventListener('pointercancel', handlePointerUp)
      el.removeEventListener('wheel', handleWheel)
    }
  }, [element, enabled, totalCount])

  return containerRef
}
