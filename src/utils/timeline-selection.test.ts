import { describe, expect, it } from 'vitest'

import {
  buildIndexKeys,
  createTimelineSelection,
  DEFAULT_TIMELINE_SELECTION,
  getSortableTimelineKeys,
  isSameTimelineSelection,
  resolveTimelineSelection,
} from './timeline-selection'

const CONTINUOUS = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07']
// Same period, but without transactions in March and April
const WITH_GAPS = ['2025-01', '2025-02', '2025-05', '2025-06', '2025-07']

describe('timeline-selection', () => {
  describe('buildIndexKeys', () => {
    it('should create sortable keys for each index', () => {
      const keys = buildIndexKeys(12)
      expect(keys).toHaveLength(12)
      expect([...keys].sort()).toEqual(keys)
    })
  })

  describe('getSortableTimelineKeys', () => {
    it('should keep ascending calendar keys', () => {
      expect(getSortableTimelineKeys(CONTINUOUS, CONTINUOUS.length)).toBe(CONTINUOUS)
    })

    it('should fall back to index keys for unsorted or mismatched keys', () => {
      expect(getSortableTimelineKeys(['Jan 24', 'Feb 24', 'Mar 24'], 3)).toEqual(buildIndexKeys(3))
      expect(getSortableTimelineKeys(CONTINUOUS, 3)).toEqual(buildIndexKeys(3))
      expect(getSortableTimelineKeys(undefined, 2)).toEqual(buildIndexKeys(2))
    })
  })

  describe('createTimelineSelection', () => {
    it('should create a preset selection when the window matches a preset', () => {
      expect(createTimelineSelection(0, 6, CONTINUOUS)).toEqual({ kind: 'preset', preset: 'All' })
      expect(createTimelineSelection(4, 6, CONTINUOUS)).toEqual({ kind: 'preset', preset: '3M' })
    })

    it('should create a custom selection with calendar keys otherwise', () => {
      expect(createTimelineSelection(1, 3, CONTINUOUS)).toEqual({
        kind: 'custom',
        startKey: '2025-02',
        endKey: '2025-04',
        span: 3,
        isEndAnchored: false,
      })
      expect(createTimelineSelection(3, 6, CONTINUOUS)).toMatchObject({ isEndAnchored: true })
    })
  })

  describe('resolveTimelineSelection', () => {
    it('should resolve presets relative to the latest month', () => {
      expect(resolveTimelineSelection(DEFAULT_TIMELINE_SELECTION, CONTINUOUS, 3)).toEqual({
        startIndex: 0,
        endIndex: 6,
      })
      expect(resolveTimelineSelection({ kind: 'preset', preset: '6M' }, CONTINUOUS, 3)).toEqual({
        startIndex: 1,
        endIndex: 6,
      })
    })

    it('should keep the same calendar window across month lists with gaps', () => {
      const selection = createTimelineSelection(1, 4, CONTINUOUS) // 2025-02 … 2025-05
      expect(resolveTimelineSelection(selection, WITH_GAPS, 1)).toEqual({
        startIndex: 1,
        endIndex: 2,
      })
    })

    it('should widen a window to the minimum span', () => {
      const selection = createTimelineSelection(1, 4, CONTINUOUS)
      const range = resolveTimelineSelection(selection, WITH_GAPS, 3)
      expect(range.endIndex - range.startIndex + 1).toBe(3)
    })

    it('should snap a window that falls into a gap to the neighbouring months', () => {
      const selection = createTimelineSelection(2, 3, CONTINUOUS) // 2025-03 … 2025-04
      expect(resolveTimelineSelection(selection, WITH_GAPS, 1)).toEqual({
        startIndex: 1,
        endIndex: 2,
      })
    })

    it('should keep an end-anchored window at the latest month when newer data appears', () => {
      const selection = createTimelineSelection(4, 5, CONTINUOUS.slice(0, 6))
      expect(resolveTimelineSelection(selection, CONTINUOUS, 1)).toEqual({
        startIndex: 5,
        endIndex: 6,
      })
    })

    it('should fall back to the edges when the window is outside the data', () => {
      const late = createTimelineSelection(0, 1, ['2030-01', '2030-02', '2030-03'])
      expect(resolveTimelineSelection(late, CONTINUOUS, 1)).toEqual({ startIndex: 5, endIndex: 6 })

      const early = createTimelineSelection(0, 1, ['2020-01', '2020-02', '2020-03'])
      expect(resolveTimelineSelection(early, CONTINUOUS, 1)).toEqual({ startIndex: 0, endIndex: 1 })
    })

    it('should return an empty range for empty data', () => {
      expect(resolveTimelineSelection(DEFAULT_TIMELINE_SELECTION, [], 3)).toEqual({
        startIndex: 0,
        endIndex: 0,
      })
    })
  })

  describe('isSameTimelineSelection', () => {
    it('should compare selections structurally', () => {
      const custom = createTimelineSelection(1, 3, CONTINUOUS)
      expect(isSameTimelineSelection(custom, createTimelineSelection(1, 3, CONTINUOUS))).toBe(true)
      expect(isSameTimelineSelection(custom, createTimelineSelection(1, 4, CONTINUOUS))).toBe(false)
      expect(isSameTimelineSelection(custom, DEFAULT_TIMELINE_SELECTION)).toBe(false)
      expect(
        isSameTimelineSelection(DEFAULT_TIMELINE_SELECTION, { kind: 'preset', preset: 'All' }),
      ).toBe(true)
    })
  })
})
