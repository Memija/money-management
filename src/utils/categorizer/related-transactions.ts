import type { Transaction } from '../../types'
import { isPaymentProcessorOnly } from './merchant-extraction'

export interface RelatedCleaningHelpers {
  extractCleanDescription: (desc: string) => string
  normalizeDescription: (desc: string) => string
}

let relatedHelpers: RelatedCleaningHelpers = {
  extractCleanDescription: (d) => d,
  normalizeDescription: (d) => d,
}

export function registerRelatedCleaningHelpers(h: RelatedCleaningHelpers) {
  relatedHelpers = h
}

/**
 * Determines whether two transaction descriptions are related
 * (e.g., same core merchant or recurring charge with different SEPA/card reference IDs).
 */
export function isRelatedTransaction(descA: string, descB: string): boolean {
  if (!descA || !descB) {
    return false
  }

  const cleanA = relatedHelpers.extractCleanDescription(descA).toLowerCase()
  const cleanB = relatedHelpers.extractCleanDescription(descB).toLowerCase()

  // 1. Exact match on clean description (if length >= 3)
  if (cleanA.length >= 3 && cleanA === cleanB) {
    if (!isPaymentProcessorOnly(cleanA)) {
      return true
    }
  }

  // 2. Normalized description fallback
  const normA = relatedHelpers.normalizeDescription(descA)
  const normB = relatedHelpers.normalizeDescription(descB)
  if (normA.length >= 3 && normA === normB) {
    if (!isPaymentProcessorOnly(normA)) {
      return true
    }
  }

  // 3. Prefix matching: if one clean string starts with the other on a word boundary
  if (cleanA.length >= 8 && cleanB.length >= 8) {
    const shorter = cleanA.length <= cleanB.length ? cleanA : cleanB
    const longer = cleanA.length <= cleanB.length ? cleanB : cleanA
    if (!isPaymentProcessorOnly(shorter)) {
      if (longer.startsWith(shorter)) {
        const nextChar = longer.charAt(shorter.length)
        if (nextChar === '' || nextChar === ' ' || nextChar === '-' || nextChar === '/') {
          return true
        }
      }
    }
  }

  return false
}

function isInformativeTx(tx?: { amount?: number } | null): boolean {
  return !tx || typeof tx.amount !== 'number' ? false : tx.amount === 0
}

/**
 * Finds all non-ghost transactions in a collection that are related to the target transaction.
 * If targetCategory is specified, filters only candidates whose category is different from targetCategory.
 */
export function findRelatedTransactions(
  targetTx: Transaction,
  allTransactions: Transaction[],
  targetCategory?: string,
): Transaction[] {
  if (!targetTx || !allTransactions || allTransactions.length === 0 || isInformativeTx(targetTx)) {
    return []
  }

  const seenIds = new Set<string>()
  const results: Transaction[] = []

  for (const candidate of allTransactions) {
    if (
      !candidate ||
      candidate.id === targetTx.id ||
      candidate.isGhost ||
      isInformativeTx(candidate)
    ) {
      continue
    }

    if (seenIds.has(candidate.id)) {
      continue
    }

    // If targetCategory is specified, only include transactions that don't already have that category
    if (targetCategory !== undefined && candidate.category === targetCategory) {
      continue
    }

    if (isRelatedTransaction(targetTx.description, candidate.description)) {
      seenIds.add(candidate.id)
      results.push(candidate)
    }
  }

  return results
}
