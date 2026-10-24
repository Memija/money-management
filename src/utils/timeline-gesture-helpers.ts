export interface DragState {
  startX: number
  startY: number
  startIdx: number
  endIdx: number
  chartWidth: number
  isLocked: boolean
  isPan: boolean
}

export interface PinchState {
  initialDist: number
  initialSpan: number
  initialStart: number
  initialEnd: number
  centerRatio: number
}

export interface MouseDragState {
  startX: number
  startIdx: number
  endIdx: number
  chartWidth: number
  isDragging: boolean
}

/** Pixels of finger/mouse travel before a gesture is classified as a pan */
export const DRAG_THRESHOLD_PX = 8
export const MOUSE_DRAG_THRESHOLD_PX = 5
export const DOUBLE_TAP_MS = 320
export const DOUBLE_TAP_RADIUS_PX = 30
/** Accumulated Ctrl+wheel delta required for one zoom step (one mouse-wheel notch ≈ 100) */
export const WHEEL_ZOOM_THRESHOLD = 50
/** Pixel size of one "line" when the browser reports wheel deltas in lines (Firefox) */
export const WHEEL_LINE_HEIGHT_PX = 16

/**
 * Normalizes wheel deltas to pixels regardless of the browser's delta mode.
 */
export const toPixels = (delta: number, deltaMode: number, pageSize: number): number => {
  if (deltaMode === 1) {
    return delta * WHEEL_LINE_HEIGHT_PX
  }
  if (deltaMode === 2) {
    return delta * pageSize
  }
  return delta
}

/**
 * Computes new window range from pinch gesture scaling.
 */
export function computePinchRange(
  p: PinchState,
  scale: number,
  minWin: number,
  maxCount: number,
): [number, number] {
  const targetSpan = Math.round(p.initialSpan / scale)
  const clampedSpan = Math.max(minWin, Math.min(maxCount, targetSpan))
  const anchor = p.initialStart + p.centerRatio * (p.initialSpan - 1)
  const newStart = Math.round(anchor - p.centerRatio * (clampedSpan - 1))
  return [newStart, newStart + clampedSpan - 1]
}
