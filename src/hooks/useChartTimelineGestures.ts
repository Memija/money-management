import { useCallback, useEffect, useRef, useState } from 'react'

import { clampWindow, zoomWindow } from '../utils/timeline-window'

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
  /** Optional callback to zoom in (double-tap on a fully zoomed-out chart) */
  onZoomIn?: () => void
  /** Optional callback to reset zoom (double-tap on a zoomed chart) */
  onResetZoom?: () => void
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

interface MouseDragState {
  startX: number
  startIdx: number
  endIdx: number
  chartWidth: number
  isDragging: boolean
}

/** Pixels of finger/mouse travel before a gesture is classified as a pan */
const DRAG_THRESHOLD_PX = 8
const MOUSE_DRAG_THRESHOLD_PX = 5
const DOUBLE_TAP_MS = 320
const DOUBLE_TAP_RADIUS_PX = 30
/** Accumulated Ctrl+wheel delta required for one zoom step (one mouse-wheel notch ≈ 100) */
const WHEEL_ZOOM_THRESHOLD = 50
/** Pixel size of one "line" when the browser reports wheel deltas in lines (Firefox) */
const WHEEL_LINE_HEIGHT_PX = 16

/**
 * Normalizes wheel deltas to pixels regardless of the browser's delta mode.
 */
const toPixels = (delta: number, deltaMode: number, pageSize: number): number => {
  if (deltaMode === 1) {
    return delta * WHEEL_LINE_HEIGHT_PX
  }
  if (deltaMode === 2) {
    return delta * pageSize
  }
  return delta
}

/**
 * Custom hook providing direct manipulation of the visible timeline window on the chart canvas:
 * - Touch: swipe-to-pan, pinch-to-zoom, double-tap to zoom in / reset
 * - Mouse: click-drag to pan, Ctrl/⌘ + wheel to zoom around the cursor
 * - Trackpad: horizontal scroll to pan
 */
export function useChartTimelineGestures({
  enabled,
  totalCount,
  startIndex,
  endIndex,
  minWindow = 3,
  onRangeChange,
  onZoomIn,
  onResetZoom,
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
    onResetZoom,
  })

  useEffect(() => {
    latestRef.current = {
      totalCount,
      startIndex,
      endIndex,
      minWindow,
      onRangeChange,
      onZoomIn,
      onResetZoom,
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
    let mouseDrag: MouseDragState | null = null
    let shouldSuppressClick = false
    let wheelZoomAccumulator = 0
    let wheelPanAccumulator = 0
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

    const handleDoubleTap = (touch: Touch): boolean => {
      const now = Date.now()
      const lastTap = lastTapRef.current
      const isDoubleTap =
        now - lastTap.time < DOUBLE_TAP_MS &&
        Math.hypot(touch.clientX - lastTap.x, touch.clientY - lastTap.y) < DOUBLE_TAP_RADIUS_PX
      if (!isDoubleTap) {
        lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY }
        return false
      }
      lastTapRef.current = { time: 0, x: 0, y: 0 }
      const { startIndex: start, endIndex: end, totalCount: total } = latestRef.current
      if (end - start + 1 < total) {
        latestRef.current.onResetZoom?.()
      } else {
        latestRef.current.onZoomIn?.()
      }
      return true
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
        handleDoubleTap(touch)
      } else if (e.touches.length === 2) {
        const [t1, t2] = [e.touches[0], e.touches[1]]
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
        const centerX = (t1.clientX + t2.clientX) / 2
        pinchRef.current = {
          initialDist: Math.max(10, dist),
          initialSpan: latestRef.current.endIndex - latestRef.current.startIndex + 1,
          initialStart: latestRef.current.startIndex,
          initialEnd: latestRef.current.endIndex,
          centerRatio: Math.max(0, Math.min(1, (centerX - rect.left) / chartWidth)),
        }
        if (dragRef.current) {
          dragRef.current.isPan = false
          dragRef.current.isLocked = true
        }
      }
    }

    const handlePinchMove = (e: TouchEvent, p: PinchState) => {
      if (e.cancelable) {
        e.preventDefault()
      }
      const [t1, t2] = [e.touches[0], e.touches[1]]
      const scale = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY) / p.initialDist
      if (scale <= 0) {
        return
      }

      const { minWindow: minWin, totalCount: maxCount } = latestRef.current
      const targetSpan = Math.round(p.initialSpan / scale)
      const clampedSpan = Math.max(minWin ?? 3, Math.min(maxCount, targetSpan))
      const anchor = p.initialStart + p.centerRatio * (p.initialSpan - 1)
      const newStart = Math.round(anchor - p.centerRatio * (clampedSpan - 1))
      emitRange(newStart, newStart + clampedSpan - 1)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        handlePinchMove(e, pinchRef.current)
        return
      }

      // 1-finger horizontal pan (preserving vertical page scroll)
      const drag = dragRef.current
      if (e.touches.length !== 1 || !drag) {
        return
      }
      const touch = e.touches[0]
      const dx = touch.clientX - drag.startX
      const dy = touch.clientY - drag.startY

      if (!drag.isLocked) {
        // If vertical displacement is greater, lock out pan to let page scroll
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > DRAG_THRESHOLD_PX) {
          drag.isLocked = true
          drag.isPan = false
          return
        }
        if (Math.abs(dx) >= Math.abs(dy) && Math.abs(dx) > DRAG_THRESHOLD_PX) {
          drag.isLocked = true
          drag.isPan = true
        }
      }

      if (drag.isPan) {
        if (e.cancelable) {
          e.preventDefault()
        }
        const span = drag.endIdx - drag.startIdx + 1
        const deltaMonths = -Math.round((dx / drag.chartWidth) * span)
        emitRange(drag.startIdx + deltaMonths, drag.endIdx + deltaMonths)
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

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) {
        return
      }
      shouldSuppressClick = false
      resetEmitted()
      mouseDrag = {
        startX: e.clientX,
        startIdx: latestRef.current.startIndex,
        endIdx: latestRef.current.endIndex,
        chartWidth: Math.max(1, el.getBoundingClientRect().width),
        isDragging: false,
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!mouseDrag) {
        return
      }
      const dx = e.clientX - mouseDrag.startX
      if (!mouseDrag.isDragging && Math.abs(dx) > MOUSE_DRAG_THRESHOLD_PX) {
        mouseDrag.isDragging = true
        try {
          el.setPointerCapture(e.pointerId)
        } catch {
          // ignore pointer capture errors in testing/synthetic environments
        }
      }

      if (mouseDrag.isDragging) {
        const span = mouseDrag.endIdx - mouseDrag.startIdx + 1
        const deltaMonths = -Math.round((dx / mouseDrag.chartWidth) * span)
        emitRange(mouseDrag.startIdx + deltaMonths, mouseDrag.endIdx + deltaMonths)
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (mouseDrag?.isDragging) {
        // The click that follows a drag must not select a bar/category underneath the cursor
        shouldSuppressClick = true
        try {
          el.releasePointerCapture(e.pointerId)
        } catch {
          // ignore
        }
      }
      mouseDrag = null
    }

    const handleClickCapture = (e: MouseEvent) => {
      if (!shouldSuppressClick) {
        return
      }
      shouldSuppressClick = false
      e.stopPropagation()
      e.preventDefault()
    }

    const handleWheelZoom = (e: WheelEvent, rect: DOMRect) => {
      if (e.cancelable) {
        e.preventDefault()
      }
      const deltaY = toPixels(e.deltaY, e.deltaMode, rect.height)
      // Restart accumulation when the scroll direction flips
      if (Math.sign(deltaY) !== Math.sign(wheelZoomAccumulator)) {
        wheelZoomAccumulator = 0
      }
      wheelZoomAccumulator += deltaY
      if (Math.abs(wheelZoomAccumulator) < WHEEL_ZOOM_THRESHOLD) {
        return
      }

      const direction = wheelZoomAccumulator < 0 ? 'in' : 'out'
      wheelZoomAccumulator = 0
      const { startIndex: start, endIndex: end, totalCount: total } = latestRef.current
      const anchorRatio = (e.clientX - rect.left) / Math.max(1, rect.width)
      const [newStart, newEnd] = zoomWindow(
        start,
        end,
        total,
        latestRef.current.minWindow ?? 3,
        direction,
        anchorRatio,
      )
      emitRange(newStart, newEnd)
    }

    const handleWheelPan = (e: WheelEvent, rect: DOMRect) => {
      if (e.cancelable) {
        e.preventDefault()
      }
      const chartWidth = Math.max(1, rect.width)
      const { startIndex: start, endIndex: end } = latestRef.current
      const span = end - start + 1
      wheelPanAccumulator += toPixels(e.deltaX, e.deltaMode, chartWidth)
      const deltaMonths = Math.trunc((wheelPanAccumulator / chartWidth) * span)
      if (deltaMonths === 0) {
        return
      }
      wheelPanAccumulator -= (deltaMonths * chartWidth) / span
      emitRange(start + deltaMonths, end + deltaMonths)
    }

    const handleWheel = (e: WheelEvent) => {
      const isZoomGesture = e.ctrlKey || e.metaKey
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
      if (!isZoomGesture && !isHorizontal) {
        return
      }

      resetEmitted()
      const rect = el.getBoundingClientRect()
      if (isZoomGesture) {
        handleWheelZoom(e, rect)
      } else {
        handleWheelPan(e, rect)
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
    el.addEventListener('click', handleClickCapture, { capture: true })
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
      el.removeEventListener('click', handleClickCapture, { capture: true })
      el.removeEventListener('wheel', handleWheel)
    }
  }, [element, enabled, totalCount])

  return containerRef
}
