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
        const txsInPeriod = isAllTime ? cluster : filterByPeriod(cluster, period)

        if (isAllTime) {
          const mostRecentTxTime = Date.parse(cluster[cluster.length - 1].date)
          const daysSinceLastTx = Math.ceil((maxTime - mostRecentTxTime) / 86400000)
          const firstTxTime = Date.parse(cluster[0].date)
          const spanDays = Math.ceil((mostRecentTxTime - firstTxTime) / 86400000)

          if (
            totalTimeframeDays >= 365 &&
            cluster.length <= 4 &&
            spanDays <= 120 &&
            daysSinceLastTx > 90
          ) {
            continue
          }

          const evaluation = evaluateMonthlyRecurrence(cluster)
          if (!evaluation.isRecurring) {
            continue
          }

          const amount = Math.round(evaluation.avgAmount * 100) / 100
          const recentTx = cluster[cluster.length - 1]

          recurringInGroup.push({
            id: normName,
            name: evaluation.displayName,
            amount,
            category: recentTx.category || 'Other',
            frequency: 'monthly',
            transactionCount: cluster.length,
            transactionIds: cluster.map((t) => t.id),
          })
        } else {
          // A specific timeframe is selected (year, quarter, month)
          if (txsInPeriod.length >= 2) {
            txsInPeriod.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
            const evaluation = evaluateMonthlyRecurrence(txsInPeriod)
            if (!evaluation.isRecurring) {
              continue
            }

            const amount = Math.round(evaluation.avgAmount * 100) / 100
            const recentTx = txsInPeriod[txsInPeriod.length - 1]

            recurringInGroup.push({
              id: normName,
              name: evaluation.displayName,
              amount,
              category: recentTx.category || 'Other',
              frequency: 'monthly',
              transactionCount: txsInPeriod.length,
              transactionIds: txsInPeriod.map((t) => t.id),
            })
          } else if (txsInPeriod.length === 1) {
            const targetTx = txsInPeriod[0]
            const idx = cluster.findIndex((t) => t.id === targetTx.id)
            const targetAmount = Math.abs(targetTx.amount)
            let isRecurringMonthly = false

            // Check predecessor
            if (idx > 0) {
              const prevTx = cluster[idx - 1]
              const diffPrev = Math.ceil(
                Math.abs(Date.parse(targetTx.date) - Date.parse(prevTx.date)) / 86400000,
              )
              const prevAmount = Math.abs(prevTx.amount)
              const dev = Math.abs(targetAmount - prevAmount) / targetAmount
              if (diffPrev >= 20 && diffPrev <= 40 && dev <= 0.2) {
                isRecurringMonthly = true
              }
            }

            // Check successor
            if (!isRecurringMonthly && idx < cluster.length - 1) {
              const nextTx = cluster[idx + 1]
              const diffNext = Math.ceil(
                Math.abs(Date.parse(nextTx.date) - Date.parse(targetTx.date)) / 86400000,
              )
              const nextAmount = Math.abs(nextTx.amount)
              const dev = Math.abs(targetAmount - nextAmount) / targetAmount
              if (diffNext >= 20 && diffNext <= 40 && dev <= 0.2) {
                isRecurringMonthly = true
              }
            }

            if (!isRecurringMonthly) {
              continue
            }

            const displayName = cleanDisplayName(targetTx)
            const amount = Math.round(targetAmount * 100) / 100

            recurringInGroup.push({
              id: normName,
              name: displayName,
              amount,
              category: targetTx.category || 'Other',
              frequency: 'monthly',
              transactionCount: 1,
              transactionIds: [targetTx.id],
            })
          }
        }
      }

      if (recurringInGroup.length === 1) {
        recurringExpenses.push(recurringInGroup[0])
      } else if (recurringInGroup.length > 1) {
        const combinedAmount =
          Math.round(recurringInGroup.reduce((sum, item) => sum + item.amount, 0) * 100) / 100
        const combinedCount = recurringInGroup.reduce((sum, item) => sum + item.transactionCount, 0)
        const allIds = Array.from(
          new Set(recurringInGroup.flatMap((item) => item.transactionIds || [])),
        )
        const primaryItem = [...recurringInGroup].sort((a, b) => b.amount - a.amount)[0]

        recurringExpenses.push({
          id: normName,
          name: primaryItem.name,
          amount: combinedAmount,
          category: primaryItem.category,
          frequency: 'monthly',
          transactionCount: combinedCount,
          transactionIds: allIds,
        })
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
