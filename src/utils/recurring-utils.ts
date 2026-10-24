import type { Transaction } from '../types'
import { createBoundedCache } from './bounded-cache'
import {
  extractCleanDescription,
  formatMerchantDisplayName,
  getTransactionCategory,
  getTransactionMerchant,
  isInformativeTransaction,
  normalizeDescription,
} from './category-utils'

export interface RecurrenceResult {
  isRecurring: boolean
  avgAmount: number
  displayName: string
}

export interface AmountCluster {
  avgAmount: number
  txs: Transaction[]
}

export interface RecurrenceGroup {
  normName: string
  /** Amount clusters with at least 2 transactions, each sorted by date ascending */
  clusters: Transaction[][]
}

export interface RecurrenceGroupingResult {
  groups: RecurrenceGroup[]
  maxTime: number
  totalTimeframeDays: number
}

const isGenericPaymentDesc = (desc?: string): boolean => {
  if (!desc) {
    return true
  }
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

const recurrenceKeyCache = createBoundedCache<string>()
export const getCachedRecurrenceKey = (t: Transaction): string => {
  const cacheKey = `${t.description}__${t.partner || ''}__${Math.round(Math.abs(t.amount))}`
  let cached = recurrenceKeyCache.get(cacheKey)
  if (cached === undefined) {
    cached = getRecurrenceGroupingKey(t)
    recurrenceKeyCache.set(cacheKey, cached)
  }
  return cached
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

export const clusterTxsByAmount = (items: Transaction[]): Transaction[][] => {
  if (items.length <= 1) {
    return [items]
  }
  const clusters: AmountCluster[] = []
  // Sort by amount descending to establish primary amount anchors
  const sorted = [...items].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
  for (const t of sorted) {
    const amt = Math.abs(t.amount)
    if (amt === 0) {
      continue
    }
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

/** Minimum length of a grouping key to be considered meaningful. */
const MIN_GROUP_KEY_LENGTH = 3

/**
 * Period-independent preparation: categorizes expenses, groups them by recurrence key
 * and splits each group into date-sorted amount clusters.
 */
export const buildRecurrenceGroups = (
  allRawTransactions: Transaction[],
  customKeywords: Record<string, string[]>,
  manualCategories: Record<string, string>,
): RecurrenceGroupingResult | null => {
  const expenses = allRawTransactions
    .filter((t) => t.type === 'expense' && !t.isGhost && !isInformativeTransaction(t))
    .map((t) => ({
      ...t,
      category: getTransactionCategory(t, customKeywords, manualCategories),
    }))

  if (expenses.length === 0) {
    return null
  }

  let minTime = Infinity
  let maxTime = -Infinity
  for (const t of expenses) {
    const time = Date.parse(t.date)
    if (time < minTime) {
      minTime = time
    }
    if (time > maxTime) {
      maxTime = time
    }
  }
  const totalTimeframeDays = Math.ceil((maxTime - minTime) / 86400000)

  const groupsMap = new Map<string, Transaction[]>()
  for (const t of expenses) {
    const key = getCachedRecurrenceKey(t)
    if (!key || key.length < MIN_GROUP_KEY_LENGTH) {
      continue
    }
    const existing = groupsMap.get(key)
    if (existing) {
      existing.push(t)
    } else {
      groupsMap.set(key, [t])
    }
  }

  const groups: RecurrenceGroup[] = []
  for (const [normName, items] of groupsMap) {
    if (items.length < 2) {
      continue
    }
    const clusters = clusterTxsByAmount(items)
      .filter((cluster) => cluster.length >= 2)
      .map((cluster) => cluster.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)))

    if (clusters.length > 0) {
      groups.push({ normName, clusters })
    }
  }

  return { groups, maxTime, totalTimeframeDays }
}
