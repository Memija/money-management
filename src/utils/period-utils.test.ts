import { describe, expect, it } from 'vitest'

import type { Transaction } from '../types'
import {
  getAvailablePeriods,
  getDateBounds,
  getMonthsForPeriod,
  matchesPeriod,
} from './period-utils'

const tx = (id: string, date: string, isGhost = false): Transaction =>
  ({
    id,
    date,
    description: `Tx ${id}`,
    amount: -10,
    type: 'expense',
    isGhost,
  }) as Transaction

describe('getAvailablePeriods', () => {
  const txs = [
    tx('1', '2024-02-10'),
    tx('2', '2025-11-03'),
    tx('3', '2025-05-20'),
    tx('4', '2023-12-31', true),
  ]

  it('should return distinct years, quarters and months sorted newest first', () => {
    const result = getAvailablePeriods(txs)
    expect(result.availableYears).toEqual(['2025', '2024', '2023'])
    expect(result.availableQuarters).toEqual(['2025-Q4', '2025-Q2', '2024-Q1', '2023-Q4'])
    expect(result.availableMonths).toEqual(['2025-11', '2025-05', '2024-02', '2023-12'])
  })

  it('should skip ghost transactions when includeGhosts is false', () => {
    const result = getAvailablePeriods(txs, false)
    expect(result.availableYears).toEqual(['2025', '2024'])
    expect(result.availableMonths).not.toContain('2023-12')
  })

  it('should return empty lists for no transactions', () => {
    expect(getAvailablePeriods([])).toEqual({
      availableYears: [],
      availableQuarters: [],
      availableMonths: [],
    })
  })
})

describe('matchesPeriod', () => {
  it('should match custom ranges using start and end bounds inclusively', () => {
    const period = {
      mode: 'custom' as const,
      value: '',
      startDate: '2025-01-10',
      endDate: '2025-01-20',
    }
    expect(matchesPeriod('2025-01-10', period)).toBe(true)
    expect(matchesPeriod('2025-01-20T12:00:00', period)).toBe(true)
    expect(matchesPeriod('2025-01-21', period)).toBe(false)
  })

  it('should fall back to the value string for custom ranges without explicit bounds', () => {
    const period = { mode: 'custom' as const, value: '2025-03-01..2025-03-31' }
    expect(matchesPeriod('2025-03-15', period)).toBe(true)
    expect(matchesPeriod('2025-04-01', period)).toBe(false)
  })
})

describe('getMonthsForPeriod', () => {
  it('should return the three months of a quarter', () => {
    expect(getMonthsForPeriod({ mode: 'quarter', value: '2025-Q2' })).toEqual([
      '2025-04',
      '2025-05',
      '2025-06',
    ])
  })

  it('should build a continuous range for custom periods', () => {
    expect(
      getMonthsForPeriod({
        mode: 'custom',
        value: '',
        startDate: '2024-11-15',
        endDate: '2025-02-01',
      }),
    ).toEqual(['2024-11', '2024-12', '2025-01', '2025-02'])
  })
})

describe('getDateBounds', () => {
  const txs = [
    tx('1', '2024-02-10T08:00:00'),
    tx('2', '2025-11-03'),
    tx('3', '2021-01-05', true),
    tx('4', '2026-01-01', true),
  ]

  it('should ignore internal transfers by default so all-time ranges match analytics', () => {
    expect(getDateBounds(txs)).toEqual({ minDate: '2024-02-10', maxDate: '2025-11-03' })
  })

  it('should include internal transfers when requested', () => {
    expect(getDateBounds(txs, true)).toEqual({ minDate: '2021-01-05', maxDate: '2026-01-01' })
  })

  it('should fall back to internal transfers when nothing else exists', () => {
    expect(getDateBounds([tx('1', '2023-03-03', true)])).toEqual({
      minDate: '2023-03-03',
      maxDate: '2023-03-03',
    })
  })

  it('should return empty bounds for no transactions', () => {
    expect(getDateBounds([])).toEqual({ minDate: '', maxDate: '' })
  })
})
