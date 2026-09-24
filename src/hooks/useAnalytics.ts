import { useMemo } from 'react'

import { useAppStore } from '../store/useAppStore'
import type { Transaction } from '../types'
import { getCategoryColor } from '../utils/category-colors'
import { getTransactionCategory } from '../utils/category-utils'

const sortCategories = (a: [string, number], b: [string, number]) => {
  if (a[0] === 'Other' && b[0] !== 'Other') return 1
  if (b[0] === 'Other' && a[0] !== 'Other') return -1
  if (b[1] !== a[1]) return b[1] - a[1]
  return a[0].localeCompare(b[0])
}

export type PeriodMode = 'all' | 'year' | 'quarter' | 'month'

export interface PeriodFilter {
  mode: PeriodMode
  /** e.g. '2025', '2025-Q1', '2025-01' */
  value: string
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
  [category: string]: number | string
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
 * Filters transactions by the given period.
 */
export const filterByPeriod = (txs: Transaction[], period: PeriodFilter): Transaction[] => {
  if (period.mode === 'all') {
    return txs
  }

  return txs.filter((t) => {
    switch (period.mode) {
      case 'year':
        return t.date.substring(0, 4) === period.value
      case 'quarter': {
        const [y, q] = period.value.split('-Q')
        const month = parseInt(t.date.substring(5, 7), 10)
        const qNum = parseInt(q, 10)
        const tYear = t.date.substring(0, 4)
        return tYear === y && month >= (qNum - 1) * 3 + 1 && month <= qNum * 3
      }
      case 'month':
        return t.date.substring(0, 7) === period.value
      default:
        return true
    }
  })
}

/**
 * Central analytics hook that computes all derived metrics from transactions.
 * All computations are memoized for performance.
 */
export const useAnalytics = (
  allRawTransactions: Transaction[],
  period: PeriodFilter,
  formatMonthYear: (dateString: string) => string,
  catColorClassPrefix: string = 'cat-color-',
): AnalyticsData => {
  const customKeywords = useAppStore((s) => s.customKeywords)
  const manualCategories = useAppStore((s) => s.manualCategories)
  const customCategories = useAppStore((s) => s.customCategories)

  // Exclude ghost transactions (internal transfers between own accounts) from financial analytics
  const activeRawTransactions = useMemo(
    () => allRawTransactions.filter((t) => !t.isGhost),
    [allRawTransactions],
  )

  // Categorize all active transactions once if not already categorized
  const allTransactions = useMemo(() => {
    const allAlreadyCategorized = activeRawTransactions.every((t) => typeof t.category === 'string')
    if (allAlreadyCategorized) {
      return activeRawTransactions
    }
    return activeRawTransactions.map((t) => ({
      ...t,
      category: t.category || getTransactionCategory(t, customKeywords, manualCategories),
    }))
  }, [activeRawTransactions, customKeywords, manualCategories])

  // Available periods for filter
  const { availableYears, availableQuarters, availableMonths } = useMemo(() => {
    const years = new Set<string>()
    const quarters = new Set<string>()
    const months = new Set<string>()

    allTransactions.forEach((t) => {
      const y = t.date.substring(0, 4)
      const m = parseInt(t.date.substring(5, 7), 10)
      const q = Math.ceil(m / 3)
      years.add(y)
      quarters.add(`${y}-Q${q}`)
      months.add(t.date.substring(0, 7))
    })

    return {
      availableYears: [...years].sort((a, b) => (b < a ? -1 : b > a ? 1 : 0)),
      availableQuarters: [...quarters].sort((a, b) => (b < a ? -1 : b > a ? 1 : 0)),
      availableMonths: [...months].sort((a, b) => (b < a ? -1 : b > a ? 1 : 0)),
    }
  }, [allTransactions])

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

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
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
  }, [periodTransactions])

  // Top category
  const topCategory = useMemo(() => {
    const map: Record<string, number> = {}
    periodTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.category || 'Other'
        map[cat] = (map[cat] || 0) + Math.abs(t.amount)
      })

    const entries = Object.entries(map).sort(sortCategories)
    if (entries.length === 0) {
      return null
    }

    const [name, amount] = entries[0]
    const percent = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
    return { name, amount, percent }
  }, [periodTransactions, totalExpenses])

  // Top categories (top 2 for insight card breakdown)
  const topCategories = useMemo(() => {
    const map: Record<string, number> = {}
    periodTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.category || 'Other'
        map[cat] = (map[cat] || 0) + Math.abs(t.amount)
      })

    return Object.entries(map)
      .sort(sortCategories)
      .slice(0, 2)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      }))
  }, [periodTransactions, totalExpenses])

  // Category breakdown (for pie chart)
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    periodTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.category || 'Other'
        map[cat] = (map[cat] || 0) + Math.abs(t.amount)
      })

    return Object.entries(map)
      .sort(sortCategories)
      .map(([name, value]) => {
        const colorIdx = getCategoryColorIndex(name)
        return {
          name,
          value: Math.round(value * 100) / 100,
          color: getCategoryColor(name, customCategories),
          colorClass: `${catColorClassPrefix}${colorIdx}`,
        }
      })
  }, [periodTransactions, catColorClassPrefix, customCategories])

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
        name: formatMonthYear(month),
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
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const name = t.description.trim().replace(/\s+/g, ' ')
        const key = name.toLowerCase()
        if (!map[key]) {
          map[key] = { displayName: name, amount: 0, count: 0, categoryCounts: {} }
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
    periodTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const month = t.date.substring(0, 7)
        const cat = t.category || 'Other'
        if (!map[month]) {
          map[month] = {}
        }
        map[month][cat] = (map[month][cat] || 0) + Math.abs(t.amount)
      })

    return Object.entries(map)
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
      .map(([month, cats]) => {
        const entry: MonthlyCategoryEntry = { month: formatMonthYear(month) }
        for (const [cat, val] of Object.entries(cats)) {
          entry[cat] = Math.round(val)
        }
        return entry
      })
  }, [periodTransactions, formatMonthYear])

  return {
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
  }
}
