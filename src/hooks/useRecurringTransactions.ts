import { useMemo } from 'react'

import { useAppStore } from '../store/useAppStore'
import type { Transaction } from '../types'
import { getTransactionCategory, normalizeDescription } from '../utils/category-utils'

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

const normDescCache = new Map<string, string>()
const getCachedNormalizedDescription = (desc: string): string => {
  let cached = normDescCache.get(desc)
  if (cached === undefined) {
    cached = normalizeDescription(desc)
    normDescCache.set(desc, cached)
  }
  return cached
}

export const useRecurringTransactions = (
  allRawTransactions: Transaction[],
): RecurringData => {
  const customKeywords = useAppStore((s) => s.customKeywords)
  const manualCategories = useAppStore((s) => s.manualCategories)

  return useMemo(() => {
    // 1. Filter for non-ghost expenses and ensure category is present
    const expenses = allRawTransactions
      .filter((t) => t.type === 'expense' && !t.isGhost)
      .map((t) => ({
        ...t,
        category: t.category || getTransactionCategory(t, customKeywords, manualCategories),
      }))

    // 2. Group by normalized description
    const groups: Record<string, Transaction[]> = {}
    expenses.forEach((t) => {
      const norm = getCachedNormalizedDescription(t.description)
      // Only group if the normalized name is meaningful (e.g., at least 3 chars)
      if (norm.length >= 3) {
        if (!groups[norm]) {
          groups[norm] = []
        }
        groups[norm].push(t)
      }
    })

    const recurringExpenses: RecurringExpense[] = []
    let totalMonthly = 0

    // 3. Analyze each group
    for (const [normName, txs] of Object.entries(groups)) {
      if (txs.length < 2) continue

      // Sort by date ascending (fast ASCII comparison for YYYY-MM-DD)
      txs.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

      let totalDays = 0
      let prevTime = Date.parse(txs[0].date)
      for (let i = 1; i < txs.length; i++) {
        const currTime = Date.parse(txs[i].date)
        const diffTime = Math.abs(currTime - prevTime)
        totalDays += Math.ceil(diffTime / 86400000)
        prevTime = currTime
      }

      const avgDays = totalDays / (txs.length - 1)

      // Check if it's a monthly recurring expense (avg between 25 and 35 days)
      if (avgDays >= 25 && avgDays <= 35) {
        // Calculate average amount
        let totalAmount = 0
        for (let i = 0; i < txs.length; i++) {
          totalAmount += Math.abs(txs[i].amount)
        }
        const avgAmount = totalAmount / txs.length

        // Ensure the variance in amount isn't too high (e.g., max 20% variance from avg)
        // This prevents grouping random varying expenses (like 'grocery store' visits that happen ~monthly)
        let maxDev = 0
        for (let i = 0; i < txs.length; i++) {
          const dev = Math.abs(Math.abs(txs[i].amount) - avgAmount)
          if (dev > maxDev) {
            maxDev = dev
          }
        }
        if (maxDev / avgAmount > 0.2) continue

        // Use the original casing of the most recent transaction for display
        const recentTx = txs[txs.length - 1]

        // Remove the same patterns from display name to make it look clean, but keep original case
        const displayName = recentTx.description
          .replace(/\b\d{1,2}[-./]\d{1,2}([-./]\d{2,4})?\b/g, '')
          .replace(/\b\d{4,}\b/g, '')
          .replace(/\s+/g, ' ')
          .trim()

        const amount = Math.round(avgAmount * 100) / 100

        recurringExpenses.push({
          id: normName,
          name: displayName,
          amount,
          category: recentTx.category || 'Other',
          frequency: 'monthly',
          transactionCount: txs.length,
          transactionIds: txs.map((t) => t.id),
        })

        totalMonthly += amount
      }
    }

    recurringExpenses.sort((a, b) => b.amount - a.amount)

    return {
      recurringExpenses,
      totalMonthly: Math.round(totalMonthly * 100) / 100,
    }
  }, [allRawTransactions, customKeywords, manualCategories])
}
