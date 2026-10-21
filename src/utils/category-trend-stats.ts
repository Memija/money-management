import type { MonthlyCategoryEntry } from '../hooks/useAnalytics'

export interface CategoryTrendMonthSummary {
  month: string
  total: number
}

export interface CategoryTrendStats {
  /** Category keys sorted by overall spend (descending). */
  categories: string[]
  /** Average total spend per month. */
  monthlyAverage: number
  /** Month with the highest total spend (`amount` is 0 when nothing was spent). */
  peakMonth: { month: string; amount: number }
  /** Total spend per month, used for the timeline slider silhouette. */
  monthSummaries: CategoryTrendMonthSummary[]
}

/**
 * Computes all category trend aggregates in a single pass over the monthly data
 * (previously four separate passes over every month and category).
 * @param data - Monthly category breakdown; numeric fields are category amounts
 * @returns Sorted categories, monthly average, peak month and per-month totals
 */
export const computeCategoryTrendStats = (data: MonthlyCategoryEntry[]): CategoryTrendStats => {
  const categoryTotals = new Map<string, number>()
  const monthSummaries: CategoryTrendMonthSummary[] = []
  const peakMonth = { month: '', amount: 0 }
  let grandTotal = 0

  for (const entry of data) {
    let monthTotal = 0
    for (const key of Object.keys(entry)) {
      const value = entry[key]
      if (key === 'month' || typeof value !== 'number') {
        continue
      }
      monthTotal += value
      categoryTotals.set(key, (categoryTotals.get(key) ?? 0) + value)
    }
    monthSummaries.push({ month: entry.month, total: monthTotal })
    grandTotal += monthTotal
    if (monthTotal > peakMonth.amount) {
      peakMonth.month = entry.month
      peakMonth.amount = monthTotal
    }
  }

  const categories = [...categoryTotals.keys()].sort(
    (a, b) => (categoryTotals.get(b) ?? 0) - (categoryTotals.get(a) ?? 0),
  )

  return {
    categories,
    monthlyAverage: data.length > 0 ? grandTotal / data.length : 0,
    peakMonth,
    monthSummaries,
  }
}
