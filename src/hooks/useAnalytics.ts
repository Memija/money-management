import { useMemo } from 'react'

import { useAppStore } from '../store/useAppStore'
import type { Transaction } from '../types'
import {
  computeKpiMetrics,
  computeMonthlyCategoryData,
  computeTopMerchants,
  getCategoryColorIndex,
  type MerchantEntry,
  type MonthlyCategoryEntry,
  sortCategories,
} from '../utils/analytics-utils'
import { getCategoryColor } from '../utils/category-colors'
import {
  getTransactionCategory,
  isInformativeTransaction,
  propagateLoanCategories,
} from '../utils/category-utils'
import { filterByPeriod, getAvailablePeriods, type PeriodFilter } from '../utils/period-utils'

export type { MerchantEntry, MonthlyCategoryEntry } from '../utils/analytics-utils'
export { getCategoryColorIndex } from '../utils/analytics-utils'
export type { PeriodFilter, PeriodMode } from '../utils/period-utils'
export {
  filterByPeriod,
  getAvailablePeriods,
  getMonthsForPeriod,
  matchesPeriod,
} from '../utils/period-utils'

const TOP_CATEGORIES_LIMIT = 2

export interface AnalyticsData {
  /** Transactions filtered by the active period */
  periodTransactions: Transaction[]

  /** KPI metrics */
  totalIncome: number
  totalExpenses: number
  balance: number
  transactionCount: number
  incomeCount: number
  expenseCount: number
  avgExpense: number
  avgIncome: number
  avgTransaction: number
  medianExpense: number
  medianIncome: number
  medianTransaction: number
  topCategory: { name: string; amount: number; percent: number } | null
  topCategories: Array<{ name: string; amount: number; percent: number }>
  savingsRate: number

  /** Category breakdown for pie chart */
  categoryBreakdown: CategoryEntry[]

  /** Monthly data for income vs expenses bar chart */
  monthlyData: MonthlyEntry[]

  /** Top merchants by total spend */
  topMerchants: MerchantEntry[]

  /** Monthly category stacked data */
  monthlyCategoryData: MonthlyCategoryEntry[]

  /** Available periods for filter dropdowns */
  availableYears: string[]
  availableQuarters: string[]
  availableMonths: string[]
}

export interface CategoryEntry {
  name: string
  value: number
  color: string
  colorClass: string
}

export interface MonthlyEntry {
  name: string
  rawMonth: string
  income: number
  expenses: number
}

/**
 * Central analytics hook that computes all derived metrics from transactions.
 * All computations are memoized for performance.
 */
export const useAnalytics = (
  allRawTransactions: Transaction[],
  period: PeriodFilter,
  formatMonthYear?: (dateString: string) => string,
  catColorClassPrefix: string = 'cat-color-',
  includeGhosts: boolean = false,
  targetMonthRange?: string[],
): AnalyticsData => {
  const customKeywords = useAppStore((s) => s.customKeywords)
  const manualCategories = useAppStore((s) => s.manualCategories)
  const customCategories = useAppStore((s) => s.customCategories)

  // Exclude ghost transactions (internal transfers between own accounts) from financial analytics unless explicitly requested
  const activeRawTransactions = useMemo(
    () => (includeGhosts ? allRawTransactions : allRawTransactions.filter((t) => !t.isGhost)),
    [allRawTransactions, includeGhosts],
  )

  // Categorize all active transactions once if not already categorized
  const allTransactions = useMemo(() => {
    const allAlreadyCategorized = activeRawTransactions.every((t) =>
      isInformativeTransaction(t) ? t.category === undefined : typeof t.category === 'string',
    )
    if (allAlreadyCategorized) {
      return propagateLoanCategories(activeRawTransactions, manualCategories)
    }
    const categorized = activeRawTransactions.map((t) => ({
      ...t,
      category: getTransactionCategory(t, customKeywords, manualCategories),
    }))
    return propagateLoanCategories(categorized, manualCategories)
  }, [activeRawTransactions, customKeywords, manualCategories])

  // Available periods for filter
  const { availableYears, availableQuarters, availableMonths } = useMemo(
    () => getAvailablePeriods(allTransactions),
    [allTransactions],
  )

  // Period-filtered transactions
  const periodTransactions = useMemo(
    () => filterByPeriod(allTransactions, period),
    [allTransactions, period],
  )

  // KPI metrics
  const {
    totalIncome,
    totalExpenses,
    balance,
    incomeCount,
    expenseCount,
    avgExpense,
    avgIncome,
    avgTransaction,
    medianExpense,
    medianIncome,
    medianTransaction,
    savingsRate,
  } = useMemo(
    () => computeKpiMetrics(periodTransactions, allRawTransactions, period),
    [periodTransactions, allRawTransactions, period],
  )

  // Expense totals per category, sorted
  const sortedExpenseCategories = useMemo(() => {
    const map: Record<string, number> = {}
    for (const t of periodTransactions) {
      if (t.type !== 'expense' || isInformativeTransaction(t)) {
        continue
      }
      const cat = t.category || 'Other'
      map[cat] = (map[cat] || 0) + Math.abs(t.amount)
    }
    return Object.entries(map).sort(sortCategories)
  }, [periodTransactions])

  // Top categories (top 2 for insight card breakdown); the first entry is the top category
  const topCategories = useMemo(
    () =>
      sortedExpenseCategories.slice(0, TOP_CATEGORIES_LIMIT).map(([name, amount]) => ({
        name,
        amount,
        percent: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      })),
    [sortedExpenseCategories, totalExpenses],
  )

  const topCategory = topCategories.length > 0 ? topCategories[0] : null

  // Category breakdown (for pie chart)
  const categoryBreakdown = useMemo(
    () =>
      sortedExpenseCategories.map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
        color: getCategoryColor(name, customCategories),
        colorClass: `${catColorClassPrefix}${getCategoryColorIndex(name)}`,
      })),
    [sortedExpenseCategories, catColorClassPrefix, customCategories],
  )

  // Monthly income vs expenses
  const monthlyData = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {}
    periodTransactions.forEach((t) => {
      const month = t.date.substring(0, 7)
      if (!map[month]) {
        map[month] = { income: 0, expense: 0 }
      }
      if (t.type === 'income') {
        map[month].income += t.amount
      } else {
        map[month].expense += Math.abs(t.amount)
      }
    })

    return Object.entries(map)
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
      .map(([month, data]) => ({
        name: formatMonthYear ? formatMonthYear(month) : month,
        rawMonth: month,
        income: Math.round(data.income),
        expenses: Math.round(data.expense),
      }))
  }, [periodTransactions, formatMonthYear])

  // Top merchants
  const topMerchants = useMemo(() => computeTopMerchants(periodTransactions), [periodTransactions])

  // Monthly category stacked data
  const monthlyCategoryData = useMemo(
    () => computeMonthlyCategoryData(periodTransactions, period, formatMonthYear, targetMonthRange),
    [periodTransactions, formatMonthYear, targetMonthRange, period],
  )

  return useMemo(
    () => ({
      periodTransactions,
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: periodTransactions.length,
      incomeCount,
      expenseCount,
      avgExpense,
      avgIncome,
      avgTransaction,
      medianExpense,
      medianIncome,
      medianTransaction,
      topCategory,
      topCategories,
      savingsRate,
      categoryBreakdown,
      monthlyData,
      topMerchants,
      monthlyCategoryData,
      availableYears,
      availableQuarters,
      availableMonths,
    }),
    [
      periodTransactions,
      totalIncome,
      totalExpenses,
      balance,
      incomeCount,
      expenseCount,
      avgExpense,
      avgIncome,
      avgTransaction,
      medianExpense,
      medianIncome,
      medianTransaction,
      topCategory,
      topCategories,
      savingsRate,
      categoryBreakdown,
      monthlyData,
      topMerchants,
      monthlyCategoryData,
      availableYears,
      availableQuarters,
      availableMonths,
    ],
  )
}
