import { useMemo } from 'react'

import { useAppStore } from '../store/useAppStore'
import type { Transaction } from '../types'
import { filterByPeriod, type PeriodFilter } from '../utils/period-utils'
import {
  buildRecurrenceGroups,
  cleanDisplayName,
  evaluateMonthlyRecurrence,
} from '../utils/recurring-utils'

export {
  cleanDisplayName,
  clusterTxsByAmount,
  evaluateMonthlyRecurrence,
  getRecurrenceGroupingKey,
} from '../utils/recurring-utils'

export interface RecurringExpense {
  id: string
  name: string
  amount: number
  category: string
  frequency: 'monthly'
  transactionCount: number
  transactionIds?: string[]
}

export interface RecurringData {
  recurringExpenses: RecurringExpense[]
  totalMonthly: number
}

const MS_PER_DAY = 86400000

const isAdjacentMonthlyMatch = (
  targetTx: Transaction,
  neighborTx: Transaction,
  targetAmount: number,
): boolean => {
  const diffDays = Math.ceil(
    Math.abs(Date.parse(targetTx.date) - Date.parse(neighborTx.date)) / MS_PER_DAY,
  )
  const neighborAmount = Math.abs(neighborTx.amount)
  const dev = Math.abs(targetAmount - neighborAmount) / targetAmount
  return diffDays >= 20 && diffDays <= 40 && dev <= 0.2
}

const evaluateClusterAllTime = (
  cluster: Transaction[],
  normName: string,
  maxTime: number,
  totalTimeframeDays: number,
): RecurringExpense | null => {
  const mostRecentTxTime = Date.parse(cluster[cluster.length - 1].date)
  const daysSinceLastTx = Math.ceil((maxTime - mostRecentTxTime) / MS_PER_DAY)
  const firstTxTime = Date.parse(cluster[0].date)
  const spanDays = Math.ceil((mostRecentTxTime - firstTxTime) / MS_PER_DAY)

  if (totalTimeframeDays >= 365 && cluster.length <= 4 && spanDays <= 120 && daysSinceLastTx > 90) {
    return null
  }

  const evaluation = evaluateMonthlyRecurrence(cluster)
  if (!evaluation.isRecurring) {
    return null
  }

  const amount = Math.round(evaluation.avgAmount * 100) / 100
  const recentTx = cluster[cluster.length - 1]

  return {
    id: normName,
    name: evaluation.displayName,
    amount,
    category: recentTx.category || 'Other',
    frequency: 'monthly',
    transactionCount: cluster.length,
    transactionIds: cluster.map((t) => t.id),
  }
}

const evaluateClusterInPeriod = (
  cluster: Transaction[],
  txsInPeriod: Transaction[],
  normName: string,
): RecurringExpense | null => {
  if (txsInPeriod.length >= 2) {
    txsInPeriod.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    const evaluation = evaluateMonthlyRecurrence(txsInPeriod)
    if (!evaluation.isRecurring) {
      return null
    }

    const amount = Math.round(evaluation.avgAmount * 100) / 100
    const recentTx = txsInPeriod[txsInPeriod.length - 1]

    return {
      id: normName,
      name: evaluation.displayName,
      amount,
      category: recentTx.category || 'Other',
      frequency: 'monthly',
      transactionCount: txsInPeriod.length,
      transactionIds: txsInPeriod.map((t) => t.id),
    }
  }

  if (txsInPeriod.length !== 1) {
    return null
  }

  const targetTx = txsInPeriod[0]
  const idx = cluster.findIndex((t) => t.id === targetTx.id)
  const targetAmount = Math.abs(targetTx.amount)
  const matchesPrev = idx > 0 && isAdjacentMonthlyMatch(targetTx, cluster[idx - 1], targetAmount)
  const matchesNext =
    !matchesPrev &&
    idx < cluster.length - 1 &&
    isAdjacentMonthlyMatch(targetTx, cluster[idx + 1], targetAmount)

  if (!matchesPrev && !matchesNext) {
    return null
  }

  return {
    id: normName,
    name: cleanDisplayName(targetTx),
    amount: Math.round(targetAmount * 100) / 100,
    category: targetTx.category || 'Other',
    frequency: 'monthly',
    transactionCount: 1,
    transactionIds: [targetTx.id],
  }
}

const mergeGroupExpenses = (
  normName: string,
  recurringInGroup: RecurringExpense[],
): RecurringExpense | null => {
  if (recurringInGroup.length === 0) {
    return null
  }
  if (recurringInGroup.length === 1) {
    return recurringInGroup[0]
  }

  const combinedAmount =
    Math.round(recurringInGroup.reduce((sum, item) => sum + item.amount, 0) * 100) / 100
  const combinedCount = recurringInGroup.reduce((sum, item) => sum + item.transactionCount, 0)
  const allIds = Array.from(new Set(recurringInGroup.flatMap((item) => item.transactionIds || [])))
  const primaryItem = [...recurringInGroup].sort((a, b) => b.amount - a.amount)[0]

  return {
    id: normName,
    name: primaryItem.name,
    amount: combinedAmount,
    category: primaryItem.category,
    frequency: 'monthly',
    transactionCount: combinedCount,
    transactionIds: allIds,
  }
}

export const useRecurringTransactions = (
  allRawTransactions: Transaction[],
  period?: PeriodFilter,
): RecurringData => {
  const customKeywords = useAppStore((s) => s.customKeywords)
  const manualCategories = useAppStore((s) => s.manualCategories)

  const grouping = useMemo(() => {
    return buildRecurrenceGroups(allRawTransactions, customKeywords, manualCategories)
  }, [allRawTransactions, customKeywords, manualCategories])

  return useMemo(() => {
    if (!grouping) {
      return { recurringExpenses: [], totalMonthly: 0 }
    }

    const { groups, maxTime, totalTimeframeDays } = grouping
    const isAllTime = !period || period.mode === 'all'
    const recurringExpenses: RecurringExpense[] = []

    for (const { normName, clusters } of groups) {
      const recurringInGroup: RecurringExpense[] = []

      for (const cluster of clusters) {
        const expense = isAllTime
          ? evaluateClusterAllTime(cluster, normName, maxTime, totalTimeframeDays)
          : evaluateClusterInPeriod(cluster, filterByPeriod(cluster, period), normName)

        if (expense) {
          recurringInGroup.push(expense)
        }
      }

      const merged = mergeGroupExpenses(normName, recurringInGroup)
      if (merged) {
        recurringExpenses.push(merged)
      }
    }

    // Merge any recurring expenses that end up with the same clean display name
    const mergedByNameMap = new Map<string, RecurringExpense>()
    for (const exp of recurringExpenses) {
      const key = exp.name.trim().toLowerCase()
      const existing = mergedByNameMap.get(key)
      if (existing) {
        existing.amount = Math.round((existing.amount + exp.amount) * 100) / 100
        existing.transactionCount += exp.transactionCount
        existing.transactionIds = Array.from(
          new Set([...(existing.transactionIds || []), ...(exp.transactionIds || [])]),
        )
      } else {
        mergedByNameMap.set(key, { ...exp })
      }
    }

    const finalRecurring = Array.from(mergedByNameMap.values())
    finalRecurring.sort((a, b) => b.amount - a.amount)

    const totalMonthly =
      Math.round(finalRecurring.reduce((sum, item) => sum + item.amount, 0) * 100) / 100

    return {
      recurringExpenses: finalRecurring,
      totalMonthly,
    }
  }, [grouping, period])
}
