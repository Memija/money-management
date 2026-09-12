import type { Transaction } from '../types'

/**
 * Produces a stable djb2 hash string from an arbitrary input string.
 * Pure function — no external deps, no crypto API required.
 */
const djb2Hash = (input: string): string => {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i)
    // Keep within 32-bit signed integer range
    hash = hash >>> 0
  }
  return hash.toString(36)
}

/**
 * Computes a stable fingerprint for a list of transactions.
 *
 * The fingerprint is derived from the sorted canonical representation of each
 * transaction (date + amount + description), so:
 * - The same file imported twice always produces the same fingerprint.
 * - Import order / generated IDs do not affect the result.
 * - A different file produces a different fingerprint (with high probability).
 */
export const computeImportFingerprint = (transactions: Transaction[]): string => {
  if (transactions.length === 0) {
    return 'empty'
  }

  const canonical = transactions
    .map((t) => `${t.date}|${t.amount}|${t.description.trim().toLowerCase()}`)
    .sort()
    .join('\n')

  return djb2Hash(canonical)
}
