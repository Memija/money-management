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

const getDaysBetween = (d1: string, d2: string): number => {
  const date1 = new Date(d1)
  const date2 = new Date(d2)
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const useRecurringTransactions = (
  allRawTransactions: Transaction[],
): RecurringData => {
  const { customKeywords, manualCategories } = useAppStore()

  return useMemo(() => {
    // 1. Filter for non-ghost expenses and categorize
    const expenses = allRawTransactions
      .filter((t) => t.type === 'expense' && !t.isGhost)
      .map((t) => ({ ...t, category: getTransactionCategory(t, customKeywords, manualCategories) }))

    // 2. Group by normalized description
    const groups: Record<string, Transaction[]> = {}
    expenses.forEach((t) => {
      const norm = normalizeDescription(t.description)
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

      // Sort by date ascending
      txs.sort((a, b) => a.date.localeCompare(b.date))

      let totalDays = 0
      for (let i = 1; i < txs.length; i++) {
        totalDays += getDaysBetween(txs[i - 1].date, txs[i].date)
      }
      
      const avgDays = totalDays / (txs.length - 1)

      // Check if it's a monthly recurring expense (avg between 25 and 35 days)
      if (avgDays >= 25 && avgDays <= 35) {
        // Calculate average amount
        const totalAmount = txs.reduce((sum, t) => sum + Math.abs(t.amount), 0)
        const avgAmount = totalAmount / txs.length
        
        // Ensure the variance in amount isn't too high (e.g., max 20% variance from avg)
        // This prevents grouping random varying expenses (like 'grocery store' visits that happen ~monthly)
        const maxDev = Math.max(...txs.map((t) => Math.abs(Math.abs(t.amount) - avgAmount)))
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
