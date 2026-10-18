import { useMemo } from 'react'

import { useAppStore } from '../store/useAppStore'
import type { Transaction } from '../types'
import {
  extractCleanDescription,
  formatMerchantDisplayName,
  getTransactionCategory,
  getTransactionMerchant,
  isInformativeTransaction,
  normalizeDescription,
} from '../utils/category-utils'
import { filterByPeriod, type PeriodFilter } from './useAnalytics'

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

const isGenericPaymentDesc = (desc?: string): boolean => {
  if (!desc) return true
  return /^(?:sepa[- ]?)?(?:credit[- ]?transfer|ueberweisung|überweisung|dauerauftrag|bank[- ]?transfer|wire[- ]?transfer|money[- ]?transfer|standing[- ]?order|direct[- ]?debit|lastschrift|payment|zahlung|abbuchung|umbuchung|transfer|online[- ]?banking)\b/i.test(
    desc.trim(),
  )
}

export const cleanDisplayName = (tx: Transaction): string => {
  // 1. If description is generic payment type and partner is available, use partner
  if (isGenericPaymentDesc(tx.description) && tx.partner && tx.partner.trim()) {
    return formatMerchantDisplayName(extractCleanDescription(tx.partner) || tx.partner)
  }

  // 2. If description has heavy SEPA / bank reference noise, resolve clean merchant
  const hasBankNoise =
    /\b(?:end[-\s]?to[-\s]?end|ccb\.\d|eref|kref|mref|svwz|iban|bic|genodef\w*|[a-z]{2}\d{2}[a-z0-9]{11,30})\b/i.test(
      tx.description,
    )
  if (hasBankNoise) {
    const merchant = getTransactionMerchant(tx)
    if (merchant && merchant.length >= 3) {
      return merchant
    }
  }

  // 3. Preserve existing clean description while removing dates, rates/months, & long numbers
  let cleaned = extractCleanDescription(tx.description) || tx.description
  cleaned = cleaned
    .replace(
      /^(?:(?:sepa[- ]?)?(?:credit[- ]?transfer|ueberweisung|überweisung|dauerauftrag|bank[- ]?transfer|wire[- ]?transfer|money[- ]?transfer|standing[- ]?order)(?:\s+(?:an|to|f[uü]r|for))?\s*[:.-]?\s*)+/i,
      '',
    )
    .replace(
      /\b(?:rate|rata|raten|instalment|installment|annuit[aä]t|monatsrate)\s*[:#.-]?\s*\d{1,3}\b/gi,
      ' ',
    )
    .replace(
      /\b(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec|januar|februar|m[aä]rz|mai|juni|juli|oktober|dezember|mrz)\b/gi,
      ' ',
    )
    .replace(/\b\d{1,2}[-./]\d{1,2}([-./]\d{2,4})?\b/g, '')
    .replace(/\b\d{4,}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned || tx.description
}

export const getRecurrenceGroupingKey = (t: Transaction): string => {
  // 1. If transaction has partner and description is generic, group by partner
  if (t.partner && t.partner.trim() && isGenericPaymentDesc(t.description)) {
    const cleanPartner = normalizeDescription(t.partner)
    if (cleanPartner.length >= 2) {
      return cleanPartner
    }
  }

  // 2. If transaction description has bank noise (IBAN, BIC, End-to-End-Ref, EREF, CCB), resolve merchant
  const hasBankNoise =
    /\b(?:end[-\s]?to[-\s]?end|ccb\.\d|eref\+|kref\+|mref\+|svwz\+|genodef\w*|[a-z]{2}\d{2}[a-z0-9]{11,30})\b/i.test(
      t.description,
    )
  if (hasBankNoise) {
    const merchant = getTransactionMerchant(t)
    if (merchant && merchant.length >= 3) {
      return normalizeDescription(merchant)
    }
  }

  // 3. Strip credit transfer prefixes, rate/installment counters, month names, and reference tags
  let cleaned = extractCleanDescription(t.description) || t.description
  cleaned = cleaned
    .replace(
      /^(?:(?:sepa[- ]?)?(?:credit[- ]?transfer|ueberweisung|überweisung|dauerauftrag|bank[- ]?transfer|wire[- ]?transfer|money[- ]?transfer|standing[- ]?order)(?:\s+(?:an|to|f[uü]r|for))?\s*[:.-]?\s*)+/i,
      '',
    )
    .replace(
      /\b(?:rate|rata|raten|instalment|installment|annuit[aä]t|monatsrate)\s*[:#.-]?\s*\d{1,3}\b/gi,
      ' ',
    )
    .replace(
      /\b(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec|januar|februar|m[aä]rz|mai|juni|juli|oktober|dezember|mrz)\b/gi,
      ' ',
    )

  let norm = normalizeDescription(cleaned)

  // 4. If the normalized string is purely a generic payment description (e.g. "credit transfer", "ueberweisung"),
  // bucket with rounded amount so distinct credit transfers without recipient info don't collide
  if (isGenericPaymentDesc(norm)) {
    norm = `${norm}_${Math.round(Math.abs(t.amount))}`
  }

  return norm
}

const recurrenceKeyCache = new Map<string, string>()
const getCachedRecurrenceKey = (t: Transaction): string => {
  const cacheKey = `${t.description}__${t.partner || ''}__${Math.round(Math.abs(t.amount))}`
  let cached = recurrenceKeyCache.get(cacheKey)
  if (cached === undefined) {
    if (recurrenceKeyCache.size > 1000) {
      recurrenceKeyCache.clear()
    }
    cached = getRecurrenceGroupingKey(t)
    recurrenceKeyCache.set(cacheKey, cached)
  }
  return cached
}

interface RecurrenceResult {
  isRecurring: boolean
  avgAmount: number
  displayName: string
}

export const evaluateMonthlyRecurrence = (txs: Transaction[]): RecurrenceResult => {
  if (txs.length < 2) {
    return { isRecurring: false, avgAmount: 0, displayName: '' }
  }

  let totalDays = 0
  let prevTime = Date.parse(txs[0].date)
  for (let i = 1; i < txs.length; i++) {
    const currTime = Date.parse(txs[i].date)
    const diffTime = Math.abs(currTime - prevTime)
    totalDays += Math.ceil(diffTime / 86400000)
    prevTime = currTime
  }

  const avgDays = totalDays / (txs.length - 1)
  if (avgDays < 20 || avgDays > 40) {
    return { isRecurring: false, avgAmount: 0, displayName: '' }
  }

  let totalAmount = 0
  for (let i = 0; i < txs.length; i++) {
    totalAmount += Math.abs(txs[i].amount)
  }
  const avgAmount = totalAmount / txs.length

  let maxDev = 0
  for (let i = 0; i < txs.length; i++) {
    const dev = Math.abs(Math.abs(txs[i].amount) - avgAmount)
    if (dev > maxDev) {
      maxDev = dev
    }
  }

  if (maxDev / avgAmount > 0.2) {
    return { isRecurring: false, avgAmount: 0, displayName: '' }
  }

  const recentTx = txs[txs.length - 1]
  const displayName = cleanDisplayName(recentTx)

  return { isRecurring: true, avgAmount, displayName }
}

interface AmountCluster {
  avgAmount: number
  txs: Transaction[]
}

export const clusterTxsByAmount = (items: Transaction[]): Transaction[][] => {
  if (items.length <= 1) return [items]
  const clusters: AmountCluster[] = []
  // Sort by amount descending to establish primary amount anchors
  const sorted = [...items].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
  for (const t of sorted) {
    const amt = Math.abs(t.amount)
    if (amt === 0) continue
    let bestCluster: AmountCluster | null = null
    let bestDiff = Infinity
    for (const c of clusters) {
      const diffPct = Math.abs(amt - c.avgAmount) / c.avgAmount
      if (diffPct <= 0.2 && diffPct < bestDiff) {
        bestDiff = diffPct
        bestCluster = c
      }
    }
    if (bestCluster) {
      bestCluster.txs.push(t)
      const sum = bestCluster.txs.reduce((acc, curr) => acc + Math.abs(curr.amount), 0)
      bestCluster.avgAmount = sum / bestCluster.txs.length
    } else {
      clusters.push({ avgAmount: amt, txs: [t] })
    }
  }
  return clusters.map((c) => c.txs)
}

export const useRecurringTransactions = (
  allRawTransactions: Transaction[],
  period?: PeriodFilter,
): RecurringData => {
  const customKeywords = useAppStore((s) => s.customKeywords)
  const manualCategories = useAppStore((s) => s.manualCategories)

  return useMemo(() => {
    // 1. Filter for non-ghost expenses and ensure category is present
    const expenses = allRawTransactions
      .filter((t) => t.type === 'expense' && !t.isGhost && !isInformativeTransaction(t))
      .map((t) => ({
        ...t,
        category: getTransactionCategory(t, customKeywords, manualCategories),
      }))

    if (expenses.length === 0) {
      return { recurringExpenses: [], totalMonthly: 0 }
    }

    // Determine overall dataset timeframe boundaries for multi-year checks
    let minTime = Infinity
    let maxTime = -Infinity
    for (let i = 0; i < expenses.length; i++) {
      const time = Date.parse(expenses[i].date)
      if (time < minTime) minTime = time
      if (time > maxTime) maxTime = time
    }
    const totalTimeframeDays =
      minTime !== Infinity && maxTime !== -Infinity ? Math.ceil((maxTime - minTime) / 86400000) : 0

    // 2. Group by recurrence grouping key
    const groups: Record<string, Transaction[]> = {}
    expenses.forEach((t) => {
      const key = getCachedRecurrenceKey(t)
      // Only group if the key is meaningful (e.g., at least 3 chars)
      if (key.length >= 3) {
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(t)
      }
    })

    const recurringExpenses: RecurringExpense[] = []
    const isAllPeriod = !period || period.mode === 'all'

    // 3. Analyze each group and its amount clusters
    for (const [normName, allTxs] of Object.entries(groups)) {
      if (allTxs.length < 2) continue

      const clusters = clusterTxsByAmount(allTxs)
      const recurringInGroup: RecurringExpense[] = []

      for (let clusterIdx = 0; clusterIdx < clusters.length; clusterIdx++) {
        const cluster = clusters[clusterIdx]
        if (cluster.length < 2) continue

        // Sort by date ascending (fast ASCII comparison for YYYY-MM-DD)
        cluster.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

        // Filter transactions that fall into the selected period
        const txsInPeriod = isAllPeriod ? cluster : filterByPeriod(cluster, period)
        if (txsInPeriod.length === 0) continue

        if (isAllPeriod) {
          // Multi-year rule: If the dataset spans a few years (>= 365 days) and an expense
          // only had a few recurring transactions at the start and then stopped long ago (> 90 days before end),
          // exclude it as it was only a temporary past occurrence, not an active recurring expense across the timeframe.
          const firstTxTime = Date.parse(cluster[0].date)
          const lastTxTime = Date.parse(cluster[cluster.length - 1].date)
          const spanDays = Math.ceil((lastTxTime - firstTxTime) / 86400000)
          const daysSinceLastTx = Math.ceil((maxTime - lastTxTime) / 86400000)

          if (
            totalTimeframeDays >= 365 &&
            cluster.length <= 4 &&
            spanDays <= 120 &&
            daysSinceLastTx > 90
          ) {
            continue
          }

          const evaluation = evaluateMonthlyRecurrence(cluster)
          if (!evaluation.isRecurring) continue

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
            if (!evaluation.isRecurring) continue

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
            // Exactly 1 transaction occurred in this selected period (typical for single month views)
            // Verify that this transaction belongs to an ongoing monthly recurrence in this cluster
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

            if (!isRecurringMonthly) continue

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
        // Merge multiple recurring streams for the same counterparty/merchant
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
  }, [allRawTransactions, period, customKeywords, manualCategories])
}
