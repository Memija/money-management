import type { Transaction } from '../types'
import { getTransactionMerchant, isInformativeTransaction } from './category-utils'
import { filterByPeriod, getMonthsForPeriod, type PeriodFilter } from './period-utils'

export const CATEGORY_COLORS = [
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

export const sortCategories = (a: [string, number], b: [string, number]) => {
  if (a[0] === 'Other' && b[0] !== 'Other') {
    return 1
  }
  if (b[0] === 'Other' && a[0] !== 'Other') {
    return -1
  }
  if (b[1] !== a[1]) {
    return b[1] - a[1]
  }
  return a[0].localeCompare(b[0])
}

export const getCategoryColorIndex = (categoryName: string) => {
  let hash = 0
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % CATEGORY_COLORS.length
}

export interface KpiMetrics {
  totalIncome: number
  totalExpenses: number
  balance: number
  incomeCount: number
  expenseCount: number
  avgExpense: number
  avgIncome: number
  avgTransaction: number
  medianExpense: number
  medianIncome: number
  medianTransaction: number
  savingsRate: number
}

export const computeKpiMetrics = (
  periodTransactions: Transaction[],
  allRawTransactions: Transaction[],
  period: PeriodFilter,
): KpiMetrics => {
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
    if (arr.length === 0) {
      return 0
    }
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
}

export interface MerchantEntry {
  name: string
  amount: number
  count: number
  category?: string
}

export const computeTopMerchants = (periodTransactions: Transaction[]): MerchantEntry[] => {
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
      let topCat = 'Other'
      let maxCount = -1
      Object.entries(data.categoryCounts).forEach(([cat, count]) => {
        if (count > maxCount) {
          maxCount = count
          topCat = cat
        }
      })

      return {
        name: data.displayName,
        amount: Math.round(data.amount * 100) / 100,
        count: data.count,
        category: topCat,
      }
    })
}

export interface MonthlyCategoryEntry {
  month: string
  rawMonth?: string
  [category: string]: number | string | undefined
}

export const computeMonthlyCategoryData = (
  periodTransactions: Transaction[],
  period: PeriodFilter,
  formatMonthYear?: (dateString: string) => string,
  targetMonthRange?: string[],
): MonthlyCategoryEntry[] => {
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
}
