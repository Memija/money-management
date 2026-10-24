import type { ImportedAccount, Transaction } from '../types'
import { calculateTransferCandidateScore, dateDiffInDays, extractIbans } from './transfer-matching'

export * from './space-transfers'
export * from './transfer-matching'

export interface MatchedTransferPair {
  txA: Transaction
  txB: Transaction
  accountAId: string
  accountBId: string
}

/**
 * Scans all imported accounts and identifies reciprocal transfers between them.
 * Links matched pairs as ghost transactions (`isGhost: true`, `linkedTransactionId`),
 * and marks single-legged transfers to known user account IBANs as ghosts (`isGhost: true`).
 */
export function reconcileCrossAccountTransfers(accounts: ImportedAccount[]): ImportedAccount[] {
  if (!accounts || accounts.length < 2) {
    // If fewer than 2 accounts, no cross-account transfers can exist; reset any ghost flags
    return (accounts || []).map((acc) => ({
      ...acc,
      transactions: acc.transactions.map((tx) =>
        tx.isGhost ? { ...tx, isGhost: false, linkedTransactionId: undefined } : tx,
      ),
      duplicateTransactions: acc.duplicateTransactions?.map((tx) =>
        tx.isGhost ? { ...tx, isGhost: false, linkedTransactionId: undefined } : tx,
      ),
      modifiedTransactions: acc.modifiedTransactions?.map((tx) =>
        tx.isGhost ? { ...tx, isGhost: false, linkedTransactionId: undefined } : tx,
      ),
    }))
  }

  // Flatten all transactions with their owning account index
  interface IndexedTx {
    accIdx: number
    tx: Transaction
  }

  const allIndexed: IndexedTx[] = []
  accounts.forEach((acc, accIdx) => {
    acc.transactions.forEach((tx) => {
      allIndexed.push({ accIdx, tx })
    })
    acc.duplicateTransactions?.forEach((tx) => {
      allIndexed.push({ accIdx, tx })
    })
    acc.modifiedTransactions?.forEach((tx) => {
      allIndexed.push({ accIdx, tx })
    })
  })

  // Map of transaction ID to paired transaction ID
  const matchedPairsMap = new Map<string, string>()
  const usedTxIds = new Set<string>()

  // Phase 1: Score-based global pairing across different accounts
  interface CandidatePair {
    itemA: IndexedTx
    itemB: IndexedTx
    score: number
    diffDays: number
  }

  const candidatePairs: CandidatePair[] = []

  // Group candidate negative transactions by absolute rounded cents for O(1) matching
  const negativeByCents = new Map<number, IndexedTx[]>()
  for (const item of allIndexed) {
    if (item.tx.amount < 0) {
      const cents = Math.abs(Math.round(item.tx.amount * 100))
      let list = negativeByCents.get(cents)
      if (!list) {
        list = []
        negativeByCents.set(cents, list)
      }
      list.push(item)
    }
  }

  for (const itemA of allIndexed) {
    if (itemA.tx.amount <= 0) {
      continue
    }
    const posCents = Math.round(itemA.tx.amount * 100)

    for (let c = posCents - 1; c <= posCents + 1; c++) {
      const candidates = negativeByCents.get(c)
      if (!candidates || candidates.length === 0) {
        continue
      }

      for (const itemB of candidates) {
        if (itemA.accIdx === itemB.accIdx) {
          continue
        }
        if (
          accounts[itemA.accIdx].institutionId &&
          accounts[itemA.accIdx].institutionId === accounts[itemB.accIdx].institutionId
        ) {
          continue
        }

        const score = calculateTransferCandidateScore(
          itemA.tx,
          accounts[itemA.accIdx],
          itemB.tx,
          accounts[itemB.accIdx],
        )
        if (score > 0) {
          candidatePairs.push({
            itemA,
            itemB,
            score,
            diffDays: dateDiffInDays(itemA.tx.date, itemB.tx.date),
          })
        }
      }
    }
  }

  // Sort candidate pairs: highest score first, then smallest date diff
  candidatePairs.sort((a, b) => b.score - a.score || a.diffDays - b.diffDays)

  for (const pair of candidatePairs) {
    if (usedTxIds.has(pair.itemA.tx.id) || usedTxIds.has(pair.itemB.tx.id)) {
      continue
    }
    usedTxIds.add(pair.itemA.tx.id)
    usedTxIds.add(pair.itemB.tx.id)
    matchedPairsMap.set(pair.itemA.tx.id, pair.itemB.tx.id)
    matchedPairsMap.set(pair.itemB.tx.id, pair.itemA.tx.id)
  }

  // Collect known IBANs for each account
  const knownAccountIbans = new Map<number, Set<string>>()
  accounts.forEach((acc, accIdx) => {
    const ibanSet = new Set<string>()
    if (acc.accountIbans) {
      acc.accountIbans.forEach((iban) => ibanSet.add(iban.toUpperCase().replace(/\s+/g, '')))
    }
    acc.transactions.forEach((tx) => {
      if (tx.ownIban) {
        ibanSet.add(tx.ownIban.toUpperCase().replace(/\s+/g, ''))
      }
    })
    acc.duplicateTransactions?.forEach((tx) => {
      if (tx.ownIban) {
        ibanSet.add(tx.ownIban.toUpperCase().replace(/\s+/g, ''))
      }
    })
    knownAccountIbans.set(accIdx, ibanSet)
  })

  // Fast O(1) map of tx.id to IndexedTx
  const txById = new Map<string, IndexedTx>()
  for (const it of allIndexed) {
    txById.set(it.tx.id, it)
  }

  // Learn IBANs from matched pairs in Phase 1
  for (const [txAId, txBId] of matchedPairsMap.entries()) {
    const itemA = txById.get(txAId)
    const itemB = txById.get(txBId)
    if (!itemA || !itemB || itemA.accIdx === itemB.accIdx) {
      continue
    }

    const ibansOfB = knownAccountIbans.get(itemB.accIdx)
    if (ibansOfB) {
      if (itemA.tx.counterpartyIban) {
        ibansOfB.add(itemA.tx.counterpartyIban.toUpperCase().replace(/\s+/g, ''))
      }
      for (const ib of extractIbans(itemA.tx.description)) {
        ibansOfB.add(ib.toUpperCase().replace(/\s+/g, ''))
      }
    }

    const ibansOfA = knownAccountIbans.get(itemA.accIdx)
    if (ibansOfA) {
      if (itemB.tx.counterpartyIban) {
        ibansOfA.add(itemB.tx.counterpartyIban.toUpperCase().replace(/\s+/g, ''))
      }
      for (const ib of extractIbans(itemB.tx.description)) {
        ibansOfA.add(ib.toUpperCase().replace(/\s+/g, ''))
      }
    }
  }

  // Phase 2: Single-legged cross-account transfers (where the other account's statement
  // has a non-overlapping date range or does not cover older dates)
  const singleLeggedGhostTxIds = new Set<string>()

  // Pre-combine other account IBANs for each account index to avoid inner loop set iteration
  const otherIbansByAccIdx = new Map<number, Set<string>>()
  accounts.forEach((_, accIdx) => {
    const combined = new Set<string>()
    for (const [otherIdx, ibans] of knownAccountIbans.entries()) {
      if (otherIdx !== accIdx) {
        for (const ib of ibans) {
          combined.add(ib)
        }
      }
    }
    otherIbansByAccIdx.set(accIdx, combined)
  })

  for (let i = 0; i < allIndexed.length; i++) {
    const itemA = allIndexed[i]
    if (matchedPairsMap.has(itemA.tx.id)) {
      continue
    }

    const otherIbans = otherIbansByAccIdx.get(itemA.accIdx)
    if (!otherIbans || otherIbans.size === 0) {
      continue
    }

    const counterIban = itemA.tx.counterpartyIban
      ? itemA.tx.counterpartyIban.toUpperCase().replace(/\s+/g, '')
      : ''
    if (counterIban && otherIbans.has(counterIban)) {
      singleLeggedGhostTxIds.add(itemA.tx.id)
      continue
    }

    const descIbans = extractIbans(itemA.tx.description)
    if (descIbans.length > 0) {
      if (descIbans.some((ib) => otherIbans.has(ib.toUpperCase().replace(/\s+/g, '')))) {
        singleLeggedGhostTxIds.add(itemA.tx.id)
      }
    }
  }

  const reconcileTx = (tx: Transaction): Transaction => {
    const linkedId = matchedPairsMap.get(tx.id)
    if (linkedId) {
      return {
        ...tx,
        isGhost: true,
        linkedTransactionId: linkedId,
      }
    }
    if (singleLeggedGhostTxIds.has(tx.id)) {
      return {
        ...tx,
        isGhost: true,
        linkedTransactionId: undefined,
      }
    }
    if (tx.isGhost) {
      return {
        ...tx,
        isGhost: false,
        linkedTransactionId: undefined,
      }
    }
    return tx
  }

  // Update all accounts with the reconciled ghost status
  return accounts.map((acc) => ({
    ...acc,
    transactions: acc.transactions.map(reconcileTx),
    duplicateTransactions: acc.duplicateTransactions?.map(reconcileTx),
    modifiedTransactions: acc.modifiedTransactions?.map(reconcileTx),
  }))
}
