/**
 * Index-independent timeline selections. A selection is stored as a preset or as calendar keys
 * (`'YYYY-MM'`), so several charts with different month lists (e.g. one with gaps, one continuous)
 * can share a single selection and still show the same calendar window.
 */

import {
  clampWindow,
  detectPreset,
  getPresetRange,
  type TimelinePreset,
  type TimelineRange,
} from './timeline-window'

export type TimelineSelection =
  | { kind: 'preset'; preset: TimelinePreset }
  | {
      kind: 'custom'
      startKey: string
      endKey: string
      span: number
      isEndAnchored: boolean
    }

export const DEFAULT_TIMELINE_SELECTION: TimelineSelection = { kind: 'preset', preset: 'All' }

const INDEX_KEY_LENGTH = 8

/**
 * Builds sortable fallback keys (`'00000000'`, `'00000001'`, …) for month lists without calendar keys.
 * @param count - Number of entries
 */
export const buildIndexKeys = (count: number): string[] =>
  Array.from({ length: count }, (_, index) => String(index).padStart(INDEX_KEY_LENGTH, '0'))

/** Whether every key sorts strictly after its predecessor. */
const isStrictlyAscending = (keys: readonly string[]): boolean =>
  keys.every((key, index) => index === 0 || keys[index - 1] < key)

/**
 * Returns keys usable for selection resolution: the given calendar keys when they match the
 * month count and sort strictly ascending (`'YYYY-MM'`), otherwise index-based fallback keys.
 * @param monthKeys - Optional calendar keys of the month list
 * @param totalCount - Number of months
 */
export const getSortableTimelineKeys = (
  monthKeys: readonly string[] | undefined,
  totalCount: number,
): readonly string[] =>
  monthKeys && monthKeys.length === totalCount && isStrictlyAscending(monthKeys)
    ? monthKeys
    : buildIndexKeys(totalCount)

/**
 * Converts an index window into a selection: a preset when the window matches one, otherwise
 * calendar keys plus span and end anchoring (so "the latest N months" follows new data).
 * @param startIndex - Window start (assumed clamped)
 * @param endIndex - Window end (assumed clamped)
 * @param keys - Sortable keys of the month list the indices refer to
 */
export const createTimelineSelection = (
  startIndex: number,
  endIndex: number,
  keys: readonly string[],
): TimelineSelection => {
  const preset = detectPreset(startIndex, endIndex, keys.length)
  if (preset) {
    return { kind: 'preset', preset }
  }
  return {
    kind: 'custom',
    startKey: keys[startIndex] ?? '',
    endKey: keys[endIndex] ?? '',
    span: endIndex - startIndex + 1,
    isEndAnchored: endIndex === keys.length - 1,
  }
}

/** Widens a window around its center until it covers at least `minWindow` entries. */
const ensureMinSpan = (
  startIndex: number,
  endIndex: number,
  totalCount: number,
  minWindow: number,
): TimelineRange => {
  const span = endIndex - startIndex + 1
  const targetSpan = Math.min(Math.max(1, minWindow), totalCount)
  if (span >= targetSpan) {
    return { startIndex, endIndex }
  }
  const newStart = startIndex - Math.floor((targetSpan - span) / 2)
  const [start, end] = clampWindow(newStart, newStart + targetSpan - 1, totalCount)
  return { startIndex: start, endIndex: end }
}

/** Window of `span` entries ending at the latest month. */
const getTailRange = (span: number, totalCount: number): TimelineRange => {
  const lastIndex = totalCount - 1
  return { startIndex: Math.max(0, lastIndex - span + 1), endIndex: lastIndex }
}

/** Index of the first key `>= key`, or -1. */
const findFirstAtOrAfter = (keys: readonly string[], key: string): number =>
  keys.findIndex((candidate) => candidate >= key)

/** Index of the last key `<= key`, or -1. */
const findLastAtOrBefore = (keys: readonly string[], key: string): number => {
  for (let index = keys.length - 1; index >= 0; index -= 1) {
    if (keys[index] <= key) {
      return index
    }
  }
  return -1
}

/**
 * Resolves a selection against a concrete month list.
 * @param selection - Shared selection
 * @param keys - Sortable keys of the month list (ascending)
 * @param minWindow - Smallest allowed span
 * @returns The index window for this month list
 */
export const resolveTimelineSelection = (
  selection: TimelineSelection,
  keys: readonly string[],
  minWindow: number,
): TimelineRange => {
  const totalCount = keys.length
  if (totalCount <= 0) {
    return { startIndex: 0, endIndex: 0 }
  }
  if (selection.kind === 'preset') {
    return getPresetRange(selection.preset, totalCount)
  }

  const span = Math.min(Math.max(1, selection.span), totalCount)
  // "Latest N months" follows the data when newer months appear or disappear
  if (selection.isEndAnchored && keys[totalCount - 1] !== selection.endKey) {
    return ensureMinSpan(
      getTailRange(span, totalCount).startIndex,
      totalCount - 1,
      totalCount,
      minWindow,
    )
  }

  const start = findFirstAtOrAfter(keys, selection.startKey)
  const end = findLastAtOrBefore(keys, selection.endKey)
  if (start === -1) {
    const tail = getTailRange(span, totalCount)
    return ensureMinSpan(tail.startIndex, tail.endIndex, totalCount, minWindow)
  }
  if (end === -1) {
    return ensureMinSpan(0, span - 1, totalCount, minWindow)
  }
  // A window falling entirely into a gap snaps to the neighbouring months
  return ensureMinSpan(Math.min(start, end), Math.max(start, end), totalCount, minWindow)
}

/** Structural equality for selections (avoids redundant store updates). */
export const isSameTimelineSelection = (a: TimelineSelection, b: TimelineSelection): boolean => {
  if (a.kind === 'preset') {
    return b.kind === 'preset' && a.preset === b.preset
  }
  if (b.kind === 'preset') {
    return false
  }
  return (
    a.startKey === b.startKey &&
    a.endKey === b.endKey &&
    a.span === b.span &&
    a.isEndAnchored === b.isEndAnchored
  )
}
