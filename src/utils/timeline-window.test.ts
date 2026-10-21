import { describe, expect, it } from 'vitest'

import {
  clampWindow,
  detectPreset,
  formatMonthRange,
  getNextZoomSpan,
  resizeWindowEdge,
  zoomWindow,
} from './timeline-window'

describe('timeline-window', () => {
  describe('clampWindow', () => {
    it('keeps an in-bounds window unchanged', () => {
      expect(clampWindow(2, 5, 12)).toEqual([2, 5])
    })

    it('shifts a window back inside the bounds while preserving its span', () => {
      expect(clampWindow(-2, 3, 12)).toEqual([0, 5])
      expect(clampWindow(9, 14, 12)).toEqual([6, 11])
    })

    it('shrinks a window larger than the dataset to the full range', () => {
      expect(clampWindow(-5, 20, 12)).toEqual([0, 11])
    })
  })

  describe('resizeWindowEdge', () => {
    it('moves the requested edge and keeps the other fixed', () => {
      expect(resizeWindowEdge('start', 4, 9, -2, 12, 3)).toEqual([2, 9])
      expect(resizeWindowEdge('end', 4, 9, 1, 12, 3)).toEqual([4, 10])
    })

    it('enforces the minimum window and dataset bounds', () => {
      expect(resizeWindowEdge('start', 4, 9, 10, 12, 3)).toEqual([7, 9])
      expect(resizeWindowEdge('end', 4, 9, -10, 12, 3)).toEqual([4, 6])
      expect(resizeWindowEdge('start', 4, 9, -10, 12, 3)).toEqual([0, 9])
      expect(resizeWindowEdge('end', 4, 9, 10, 12, 3)).toEqual([4, 11])
    })
  })

  describe('getNextZoomSpan', () => {
    it('steps along the calendar ladder', () => {
      expect(getNextZoomSpan(24, 'in', 60, 3)).toBe(18)
      expect(getNextZoomSpan(18, 'in', 60, 3)).toBe(12)
      expect(getNextZoomSpan(12, 'out', 60, 3)).toBe(18)
    })

    it('is symmetric: zooming in then out returns to the original span', () => {
      for (const span of [6, 12, 24, 36]) {
        const zoomedIn = getNextZoomSpan(span, 'in', 60, 3)
        expect(getNextZoomSpan(zoomedIn, 'out', 60, 3)).toBe(span)
      }
    })

    it('snaps an off-ladder span onto the ladder', () => {
      expect(getNextZoomSpan(20, 'in', 60, 3)).toBe(18)
      expect(getNextZoomSpan(20, 'out', 60, 3)).toBe(24)
    })

    it('stops at the minimum window and at the full dataset', () => {
      expect(getNextZoomSpan(3, 'in', 60, 3)).toBe(3)
      expect(getNextZoomSpan(5, 'in', 60, 4)).toBe(4)
      expect(getNextZoomSpan(27, 'out', 30, 3)).toBe(30)
      expect(getNextZoomSpan(30, 'out', 30, 3)).toBe(30)
    })
  })

  describe('zoomWindow', () => {
    it('zooms around the center by default', () => {
      expect(zoomWindow(0, 11, 24, 3, 'in')).toEqual([2, 10])
    })

    it('keeps the anchor point fixed', () => {
      // Anchored at the right edge: the latest month stays visible
      expect(zoomWindow(12, 23, 24, 3, 'in', 1)).toEqual([15, 23])
      // Anchored at the left edge
      expect(zoomWindow(0, 11, 24, 3, 'in', 0)).toEqual([0, 8])
    })

    it('clamps the zoomed-out window to the dataset', () => {
      expect(zoomWindow(18, 23, 24, 3, 'out')).toEqual([15, 23])
    })

    it('returns the same window when no further zoom is possible', () => {
      expect(zoomWindow(4, 6, 24, 3, 'in')).toEqual([4, 6])
      expect(zoomWindow(0, 23, 24, 3, 'out')).toEqual([0, 23])
    })
  })

  describe('detectPreset', () => {
    it('detects All and end-anchored fixed presets', () => {
      expect(detectPreset(0, 23, 24)).toBe('All')
      expect(detectPreset(21, 23, 24)).toBe('3M')
      expect(detectPreset(18, 23, 24)).toBe('6M')
      expect(detectPreset(12, 23, 24)).toBe('1Y')
    })

    it('returns null for custom or non-latest windows', () => {
      expect(detectPreset(20, 22, 24)).toBeNull()
      expect(detectPreset(10, 23, 24)).toBeNull()
      expect(detectPreset(0, 0, 0)).toBeNull()
    })
  })

  describe('formatMonthRange', () => {
    it('joins distinct labels and collapses identical ones', () => {
      expect(formatMonthRange('Jan 25', 'Jun 25')).toBe('Jan 25 – Jun 25')
      expect(formatMonthRange('Jan 25', 'Jan 25')).toBe('Jan 25')
      expect(formatMonthRange('', 'Jan 25')).toBe('')
    })
  })
})
