import { describe, expect, it } from 'vitest'

import type { MonthlyCategoryEntry } from '../hooks/useAnalytics'
import { computeCategoryTrendStats } from './category-trend-stats'

describe('computeCategoryTrendStats', () => {
  it('should return empty stats for no data', () => {
    expect(computeCategoryTrendStats([])).toEqual({
      categories: [],
      monthlyAverage: 0,
      peakMonth: { month: '', amount: 0 },
      monthSummaries: [],
    })
  })

  it('should aggregate categories, average, peak month and month totals in one pass', () => {
    const data: MonthlyCategoryEntry[] = [
      { month: '2025-01', rawMonth: '2025-01', food: 100, rent: 500 },
      { month: '2025-02', rawMonth: '2025-02', food: 300, rent: 500, fun: 50 },
      { month: '2025-03', rawMonth: '2025-03', food: 200 },
    ]

    const stats = computeCategoryTrendStats(data)

    expect(stats.categories).toEqual(['rent', 'food', 'fun'])
    expect(stats.monthlyAverage).toBeCloseTo((600 + 850 + 200) / 3)
    expect(stats.peakMonth).toEqual({ month: '2025-02', amount: 850 })
    expect(stats.monthSummaries).toEqual([
      { month: '2025-01', total: 600 },
      { month: '2025-02', total: 850 },
      { month: '2025-03', total: 200 },
    ])
  })
})
