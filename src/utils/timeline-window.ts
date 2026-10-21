/**
 * Pure helpers for timeline window math (zoom, pan, clamping and preset detection),
 * shared by the timeline zoom hook, the in-chart gesture hook and the timeline slider.
 */

export type TimelinePreset = '3M' | '6M' | '1Y' | 'All'

export type ZoomDirection = 'in' | 'out'

/** Inclusive index window into a month list. */
export interface TimelineRange {
  startIndex: number
  endIndex: number
}

/** Number of months covered by each fixed-size preset. */
export const PRESET_SPANS: Record<Exclude<TimelinePreset, 'All'>, number> = {
  '3M': 3,
  '6M': 6,
  '1Y': 12,
}

/**
 * Computes the window for a preset, anchored at the most recent month.
 * @param preset - Preset to resolve
 * @param totalCount - Number of available months
 * @returns The preset's index window (full range for `'All'` or short datasets)
 */
export const getPresetRange = (preset: TimelinePreset, totalCount: number): TimelineRange => {
  const lastIndex = Math.max(0, totalCount - 1)
  if (preset === 'All') {
    return { startIndex: 0, endIndex: lastIndex }
  }
  const span = Math.min(PRESET_SPANS[preset], totalCount)
  return { startIndex: Math.max(0, totalCount - span), endIndex: lastIndex }
}

/**
 * Calendar-friendly window sizes used as zoom steps. Stepping along a fixed ladder keeps
 * zoom in/out symmetric (in → out returns to the same span) and lands on meaningful spans.
 */
export const ZOOM_SPAN_STEPS = [3, 6, 9, 12, 18, 24, 36, 48, 60, 84, 120, 180, 240] as const

/**
 * Shifts a [start, end] window back inside [0, totalCount - 1] while preserving its span when possible.
 * @param start - Desired start index (may be out of bounds)
 * @param end - Desired end index (may be out of bounds)
 * @param totalCount - Number of available months
 * @returns Clamped `[start, end]` tuple
 */
export const clampWindow = (start: number, end: number, totalCount: number): [number, number] => {
  const lastIndex = Math.max(0, totalCount - 1)
  let newStart = start
  let newEnd = end
  if (newStart < 0) {
    newEnd -= newStart
    newStart = 0
  }
  if (newEnd > lastIndex) {
    newStart -= newEnd - lastIndex
    newEnd = lastIndex
  }
  newStart = Math.max(0, newStart)
  newEnd = Math.min(lastIndex, Math.max(newStart, newEnd))
  return [newStart, newEnd]
}

/**
 * Moves one edge of a window by `delta` months while keeping the opposite edge fixed
 * and respecting the minimum span.
 * @param edge - Which edge to move
 * @param start - Current start index
 * @param end - Current end index
 * @param delta - Months to move the edge (negative = earlier)
 * @param totalCount - Number of available months
 * @param minWindow - Smallest allowed span
 * @returns New `[start, end]` tuple
 */
export const resizeWindowEdge = (
  edge: 'start' | 'end',
  start: number,
  end: number,
  delta: number,
  totalCount: number,
  minWindow: number,
): [number, number] => {
  const minSpan = Math.max(1, Math.min(minWindow, totalCount))
  if (edge === 'start') {
    const maxStart = Math.max(0, end - minSpan + 1)
    return [Math.max(0, Math.min(start + delta, maxStart)), end]
  }
  const minEnd = Math.min(totalCount - 1, start + minSpan - 1)
  return [start, Math.min(totalCount - 1, Math.max(end + delta, minEnd))]
}

/**
 * Returns the next window span along the zoom ladder.
 * @param span - Current visible span in months
 * @param direction - `'in'` narrows the window, `'out'` widens it
 * @param totalCount - Number of available months (upper bound)
 * @param minWindow - Smallest allowed span (lower bound)
 * @returns The new span, or the current span when no further step is possible
 */
export const getNextZoomSpan = (
  span: number,
  direction: ZoomDirection,
  totalCount: number,
  minWindow: number,
): number => {
  const minSpan = Math.max(1, Math.min(minWindow, totalCount))
  if (direction === 'in') {
    if (span <= minSpan) {
      return span
    }
    const smaller = ZOOM_SPAN_STEPS.filter((step) => step < span && step >= minSpan)
    return smaller.length > 0 ? smaller[smaller.length - 1] : minSpan
  }
  if (span >= totalCount) {
    return span
  }
  const larger = ZOOM_SPAN_STEPS.find((step) => step > span && step < totalCount)
  return larger ?? totalCount
}

/**
 * Zooms a window one ladder step in or out around an anchor point.
 * @param start - Current start index
 * @param end - Current end index
 * @param totalCount - Number of available months
 * @param minWindow - Smallest allowed span
 * @param direction - Zoom direction
 * @param anchorRatio - Position inside the window (0 = left edge, 1 = right edge) that stays fixed
 * @returns New clamped `[start, end]` tuple
 */
export const zoomWindow = (
  start: number,
  end: number,
  totalCount: number,
  minWindow: number,
  direction: ZoomDirection,
  anchorRatio = 0.5,
): [number, number] => {
  const span = end - start + 1
  const targetSpan = getNextZoomSpan(span, direction, totalCount, minWindow)
  if (targetSpan === span) {
    return [start, end]
  }
  const ratio = Math.max(0, Math.min(1, anchorRatio))
  const anchor = start + ratio * (span - 1)
  const newStart = Math.round(anchor - ratio * (targetSpan - 1))
  return clampWindow(newStart, newStart + targetSpan - 1, totalCount)
}

/**
 * Detects which preset (if any) a window corresponds to. Fixed-size presets must end at the latest month.
 * @returns The matching preset, or `null` for a custom window
 */
export const detectPreset = (
  start: number,
  end: number,
  totalCount: number,
): TimelinePreset | null => {
  if (totalCount <= 0) {
    return null
  }
  if (start === 0 && end === totalCount - 1) {
    return 'All'
  }
  if (end !== totalCount - 1) {
    return null
  }
  const span = end - start + 1
  const match = (Object.keys(PRESET_SPANS) as Array<keyof typeof PRESET_SPANS>).find(
    (preset) => PRESET_SPANS[preset] === span,
  )
  return match ?? null
}

/**
 * Formats a month range label, collapsing identical bounds into a single label.
 * @returns e.g. `"Jan 25 – Jun 25"`, `"Jan 25"` or an empty string when a bound is missing
 */
export const formatMonthRange = (startLabel: string, endLabel: string): string => {
  if (!startLabel || !endLabel) {
    return ''
  }
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`
}
