import type { Transaction } from '../types'
import { generateMonthRange } from './date-utils'

export type PeriodMode = 'all' | 'year' | 'quarter' | 'month' | 'custom'

export interface PeriodFilter {
  mode: PeriodMode
  /** e.g. '2025', '2025-Q1', '2025-01', or for custom '2025-01-01..2025-06-30' */
  value: string
  startDate?: string
  endDate?: string
}

export interface AvailablePeriods {
  availableYears: string[]
  availableQuarters: string[]
  availableMonths: string[]
}

const MONTHS_PER_QUARTER = 3

const sortDescending = (a: string, b: string): number => (b < a ? -1 : b > a ? 1 : 0)

/**
 * Resolves the start/end bounds of a custom period, falling back to the `start..end` value string.
 */
const resolveCustomBounds = (period: PeriodFilter): { start?: string; end?: string } => {
  let start = period.startDate
  let end = period.endDate
  if (!start && !end && period.value.includes('..')) {
    const [vStart, vEnd] = period.value.split('..')
    start = vStart || undefined
    end = vEnd || undefined
  }
  return { start, end }
}

/**
 * Checks whether a transaction date matches the specified period filter.
 */
export const matchesPeriod = (date: string, period?: PeriodFilter): boolean => {
  if (!period || period.mode === 'all') return true
  const dateStr = date.substring(0, 10)
  switch (period.mode) {
    case 'year':
      return date.substring(0, 4) === period.value
    case 'quarter': {
      const [y, q] = period.value.split('-Q')
      const month = parseInt(date.substring(5, 7), 10)
      const qNum = parseInt(q, 10)
      const tYear = date.substring(0, 4)
      return (
        tYear === y &&
        month >= (qNum - 1) * MONTHS_PER_QUARTER + 1 &&
        month <= qNum * MONTHS_PER_QUARTER
      )
    }
    case 'month':
      return date.substring(0, 7) === period.value
    case 'custom': {
      const { start, end } = resolveCustomBounds(period)
      const s = start ? start.substring(0, 10) : ''
      const e = end ? end.substring(0, 10) : ''
      if (s && dateStr < s) return false
      if (e && dateStr > e) return false
      return true
    }
    default:
      return true
  }
}

/**
 * Filters transactions by the given period.
 */
export const filterByPeriod = (txs: Transaction[], period: PeriodFilter): Transaction[] => {
  if (period.mode === 'all') {
    return txs
  }
  return txs.filter((t) => matchesPeriod(t.date, period))
}

/**
 * Computes the continuous list of 'YYYY-MM' strings representing the period.
 */
export const getMonthsForPeriod = (
  period: PeriodFilter,
  fallbackMonths: string[] = [],
): string[] => {
  if (period.mode === 'year') {
    return Array.from({ length: 12 }, (_, i) => `${period.value}-${String(i + 1).padStart(2, '0')}`)
  }
  if (period.mode === 'quarter') {
    const [y, q] = period.value.split('-Q')
    const qNum = parseInt(q, 10)
    const startM = (qNum - 1) * MONTHS_PER_QUARTER + 1
    return [
      `${y}-${String(startM).padStart(2, '0')}`,
      `${y}-${String(startM + 1).padStart(2, '0')}`,
      `${y}-${String(startM + 2).padStart(2, '0')}`,
    ]
  }
  if (period.mode === 'month') {
    return [period.value]
  }
  if (period.mode === 'custom') {
    const { start, end } = resolveCustomBounds(period)
    const startM = start ? start.substring(0, 7) : ''
    const endM = end ? end.substring(0, 7) : ''
    if (startM && endM) {
      return generateMonthRange(startM, endM)
    }
    const validFallback = fallbackMonths.filter(Boolean).sort()
    const firstM = startM || (validFallback.length > 0 ? validFallback[0] : '')
    const lastM = endM || (validFallback.length > 0 ? validFallback[validFallback.length - 1] : '')
    if (firstM && lastM) {
      return generateMonthRange(firstM, lastM)
    }
    if (firstM) return [firstM]
    if (lastM) return [lastM]
    return []
  }

  // mode === 'all'
  const validFallback = fallbackMonths.filter(Boolean).sort()
  if (validFallback.length > 0) {
    return generateMonthRange(validFallback[0], validFallback[validFallback.length - 1])
  }
  return []
}

/**
 * Collects the distinct years, quarters and months (newest first) present in a transaction list.
 * Cheap single pass — use this instead of running full analytics just for period picker options.
 * @param txs - Transactions to scan
 * @param includeGhosts - Whether internal transfers should contribute to the available periods
 */
export const getAvailablePeriods = (
  txs: Transaction[],
  includeGhosts: boolean = true,
): AvailablePeriods => {
  const years = new Set<string>()
  const quarters = new Set<string>()
  const months = new Set<string>()

  for (const t of txs) {
    if (!includeGhosts && t.isGhost) {
      continue
    }
    const y = t.date.substring(0, 4)
    const m = parseInt(t.date.substring(5, 7), 10)
    years.add(y)
    quarters.add(`${y}-Q${Math.ceil(m / MONTHS_PER_QUARTER)}`)
    months.add(t.date.substring(0, 7))
  }

  return {
    availableYears: [...years].sort(sortDescending),
    availableQuarters: [...quarters].sort(sortDescending),
    availableMonths: [...months].sort(sortDescending),
  }
}

export interface DateBounds {
  /** Earliest 'YYYY-MM-DD' date, or '' when there are no transactions */
  minDate: string
  /** Latest 'YYYY-MM-DD' date, or '' when there are no transactions */
  maxDate: string
}

/**
 * Single pass min/max scan over transaction dates (YYYY-MM-DD lexical comparison).
 */
const scanDateBounds = (txs: Transaction[], includeGhosts: boolean): DateBounds => {
  let minDate = ''
  let maxDate = ''
  for (const t of txs) {
    if (!t.date || (!includeGhosts && t.isGhost)) {
      continue
    }
    const d = t.date.substring(0, 10)
    if (!minDate || d < minDate) {
      minDate = d
    }
    if (!maxDate || d > maxDate) {
      maxDate = d
    }
  }
  return { minDate, maxDate }
}

/**
 * Finds the dataset date domain used by the period filter. Internal transfers (ghosts) are
 * excluded by default — matching the analytics — so "All" and a custom "All time" range start
 * on the same day. Falls back to including transfers if the dataset has nothing else.
 * @param txs - Transactions to scan
 * @param includeGhosts - Whether internal transfers should widen the domain
 */
export const getDateBounds = (txs: Transaction[], includeGhosts: boolean = false): DateBounds => {
  const bounds = scanDateBounds(txs, includeGhosts)
  if (!bounds.minDate && !includeGhosts) {
    return scanDateBounds(txs, true)
  }
  return bounds
}
