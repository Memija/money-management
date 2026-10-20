import { useMemo } from 'react'

import { useAppStore } from '../store/useAppStore'
import type { Transaction } from '../types'
import { getCategoryColor } from '../utils/category-colors'
import {
  getTransactionCategory,
  getTransactionMerchant,
  isInformativeTransaction,
  propagateLoanCategories,
} from '../utils/category-utils'
import {
  filterByPeriod,
  getAvailablePeriods,
  getMonthsForPeriod,
  type PeriodFilter,
} from '../utils/period-utils'

export type { PeriodFilter, PeriodMode } from '../utils/period-utils'
export {
  filterByPeriod,
  getAvailablePeriods,
  getMonthsForPeriod,
  matchesPeriod,
} from '../utils/period-utils'

const TOP_CATEGORIES_LIMIT = 2

const sortCategories = (a: [string, number], b: [string, number]) => {
  if (a[0] === 'Other' && b[0] !== 'Other') return 1
  if (b[0] === 'Other' && a[0] !== 'Other') return -1
  if (b[1] !== a[1]) return b[1] - a[1]
  return a[0].localeCompare(b[0])
}

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

export interface MerchantEntry {
  name: string
  amount: number
  count: number
  category?: string
}

export interface MonthlyCategoryEntry {
  month: string
  rawMonth?: string
  [category: string]: number | string | undefined
}

const CATEGORY_COLORS = [
  '#10b981',
  '#6366f1',
  '#f59e0b',
  '#ec4899',
  '#3b82f6',
  '#8b5cf6',
  '#14b8a6',
  '#f43f5e',
  '#84cc16',
  '#06b6d4',
  '#a855f7',
  '#eab308',
]

/**
 * Returns a consistent color index for a category name.
 */
export const getCategoryColorIndex = (categoryName: string) => {
  let hash = 0
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % CATEGORY_COLORS.length
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
  } = useMemo(() => {
    let income = 0
    let expenses = 0
    const incomesArr: number[] = []
    const expensesArr: number[] = []
    const allArr: number[] = []

    periodTransactions.forEach((t) => {
      const amt = Math.abs(t.amount)
      allArr.push(amt)
      if (t.type === 'income') {
        income += t.amount
        incomesArr.push(amt)
      } else {
        expenses += amt
        expensesArr.push(amt)
      }
    })

    const getMedian = (arr: number[]) => {
      if (arr.length === 0) return 0
      arr.sort((a, b) => a - b)
      const mid = Math.floor(arr.length / 2)
      return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2
    }

    const iCount = incomesArr.length
    const eCount = expensesArr.length
    const totalCount = allArr.length

    const avgE = eCount > 0 ? expenses / eCount : 0
    const avgI = iCount > 0 ? income / iCount : 0
    const avgAll = totalCount > 0 ? (income + expenses) / totalCount : 0
    const rate = income > 0 ? ((income - expenses) / income) * 100 : 0

    // Calculate true net balance across all transactions in the period (including internal transfers)
    // to ensure total balance and single-institution balances remain ledger-accurate
    const periodAllRaw = filterByPeriod(allRawTransactions, period)
    const netBalance = periodAllRaw.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: Math.round(netBalance * 100) / 100,
      incomeCount: iCount,
      expenseCount: eCount,
      avgExpense: Math.round(avgE * 100) / 100,
      avgIncome: Math.round(avgI * 100) / 100,
      avgTransaction: Math.round(avgAll * 100) / 100,
      medianExpense: Math.round(getMedian(expensesArr) * 100) / 100,
      medianIncome: Math.round(getMedian(incomesArr) * 100) / 100,
      medianTransaction: Math.round(getMedian(allArr) * 100) / 100,
      savingsRate: Math.round(rate * 10) / 10,
    }
  }, [periodTransactions, allRawTransactions, period])

  // Expense totals per category, sorted — computed once and shared by top category,
  // top categories and the category breakdown
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
  const topMerchants = useMemo(() => {
    const map: Record<
      string,
      { displayName: string; amount: number; count: number; categoryCounts: Record<string, number> }
    > = {}

    periodTransactions
      .filter((t) => t.type === 'expense' && !isInformativeTransaction(t))
      .forEach((t) => {
        const merchant = getTransactionMerchant(t)
        const key = merchant.toLowerCase()
        if (!map[key]) {
          map[key] = { displayName: merchant, amount: 0, count: 0, categoryCounts: {} }
        } else {
          // If the new name has more natural casing (e.g. "Anel o. Biljana Memic" over "Anel O. Biljana Memic" or ALL-CAPS),
          // update displayName to the more natural variant
          const current = map[key].displayName
          const currentLower = (current.match(/[a-z]/g) || []).length
          const newLower = (merchant.match(/[a-z]/g) || []).length
          if (newLower > currentLower || (merchant.includes('o.') && !current.includes('o.'))) {
            map[key].displayName = merchant
          }
        }
        map[key].amount += Math.abs(t.amount)
        map[key].count++
        const cat = t.category || 'Other'
        map[key].categoryCounts[cat] = (map[key].categoryCounts[cat] || 0) + 1
      })

    return Object.values(map)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map((data) => {
        let topCategory = 'Other'
        let maxCount = -1
        Object.entries(data.categoryCounts).forEach(([cat, count]) => {
          if (count > maxCount) {
            maxCount = count
            topCategory = cat
          }
        })

        return {
          name: data.displayName,
          amount: Math.round(data.amount * 100) / 100,
          count: data.count,
          category: topCategory,
        }
      })
  }, [periodTransactions])

  // Monthly category stacked data
  const monthlyCategoryData = useMemo(() => {
    const map: Record<string, Record<string, number>> = {}
    const categoriesFound = new Set<string>()

    periodTransactions
      .filter((t) => t.type === 'expense' && !isInformativeTransaction(t))
      .forEach((t) => {
        const month = t.date.substring(0, 7)
        const cat = t.category || 'Other'
        if (!map[month]) {
          map[month] = {}
        }
        map[month][cat] = (map[month][cat] || 0) + Math.abs(t.amount)
        categoriesFound.add(cat)
      })

    // Determine continuous sequence of months for the active period
    let monthsList: string[] = []
    if (targetMonthRange && targetMonthRange.length > 0) {
      monthsList = targetMonthRange
    } else {
      monthsList = getMonthsForPeriod(period, Object.keys(map).sort())
    }

    if (monthsList.length === 0) {
      monthsList = Object.keys(map).sort()
    }

    return monthsList.map((month) => {
      const entry: MonthlyCategoryEntry = {
        month: formatMonthYear ? formatMonthYear(month) : month,
        rawMonth: month,
      }
      const cats = map[month] || {}
      for (const cat of categoriesFound) {
        entry[cat] = Math.round(cats[cat] || 0)
      }
      return entry
    })
  }, [periodTransactions, formatMonthYear, targetMonthRange, period])

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
