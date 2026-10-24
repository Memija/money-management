import React, { useMemo, useState } from 'react'

import type { Transaction } from '../../../types'

interface UsePreviewDuplicateHandlingProps {
  alreadyDuplicatedIds: Set<string>
  duplicateIds: Set<string>
  effectiveUnlockedIds: Set<string>
  activeTransactions: Transaction[]
  setLocalUnlockedDuplicateIds: React.Dispatch<React.SetStateAction<Set<string>>>
  getOriginalTransaction: (
    id: string,
  ) => { description: string; date: string; amount: number } | undefined
  getIsModified: (tx: Transaction) => boolean
  onUnlockDuplicateTransaction?: (tx: Transaction, rememberRule?: boolean) => void
  onRelockDuplicateTransaction?: (tx: Transaction) => void
}

export function usePreviewDuplicateHandling({
  alreadyDuplicatedIds,
  duplicateIds,
  effectiveUnlockedIds,
  activeTransactions,
  setLocalUnlockedDuplicateIds,
  getOriginalTransaction,
  getIsModified,
  onUnlockDuplicateTransaction,
  onRelockDuplicateTransaction,
}: UsePreviewDuplicateHandlingProps) {
  const [unlockedTxToWarn, setUnlockedTxToWarn] = useState<Transaction | null>(null)

  const handleRequestUnlockDuplicate = (tx: Transaction) => {
    if (alreadyDuplicatedIds.has(tx.id)) {
      return
    }
    setUnlockedTxToWarn(tx)
  }

  const sameLockedDuplicates = useMemo(() => {
    if (!unlockedTxToWarn) {
      return []
    }
    const orig = getOriginalTransaction(unlockedTxToWarn.id) || unlockedTxToWarn
    const origDesc = orig.description.trim().toLowerCase()
    const origAmt = orig.amount

    return activeTransactions.filter((other) => {
      if (other.id !== unlockedTxToWarn.id && effectiveUnlockedIds.has(other.id)) {
        return false
      }
      if (!duplicateIds.has(other.id) && other.id !== unlockedTxToWarn.id) {
        return false
      }
      if (alreadyDuplicatedIds.has(other.id)) {
        return false
      }
      const otherOrig = getOriginalTransaction(other.id) || other
      return (
        otherOrig.description.trim().toLowerCase() === origDesc &&
        Math.abs(otherOrig.amount - origAmt) < 0.005
      )
    })
  }, [
    unlockedTxToWarn,
    activeTransactions,
    effectiveUnlockedIds,
    duplicateIds,
    alreadyDuplicatedIds,
    getOriginalTransaction,
  ])

  const handleConfirmUnlockDuplicate = (
    tx: Transaction,
    rememberRule?: boolean,
    unlockAllIdentical?: boolean,
  ) => {
    if (alreadyDuplicatedIds.has(tx.id)) {
      return
    }
    if (unlockAllIdentical && sameLockedDuplicates.length > 1) {
      const idsToUnlock = sameLockedDuplicates.map((t) => t.id)
      setLocalUnlockedDuplicateIds((prev) => {
        const next = new Set(prev)
        idsToUnlock.forEach((id) => next.add(id))
        return next
      })
      sameLockedDuplicates.forEach((item) => {
        onUnlockDuplicateTransaction?.(item, rememberRule)
      })
    } else {
      setLocalUnlockedDuplicateIds((prev) => new Set(prev).add(tx.id))
      onUnlockDuplicateTransaction?.(tx, rememberRule)
    }
  }

  const handleRelockDuplicate = (tx: Transaction) => {
    // Prevent relocking if the transaction has been modified away from original values
    if (getIsModified(tx)) {
      return
    }
    setLocalUnlockedDuplicateIds((prev) => {
      const next = new Set(prev)
      next.delete(tx.id)
      return next
    })
    onRelockDuplicateTransaction?.(tx)
  }

  return {
    unlockedTxToWarn,
    setUnlockedTxToWarn,
    sameLockedDuplicates,
    handleRequestUnlockDuplicate,
    handleConfirmUnlockDuplicate,
    handleRelockDuplicate,
  }
}
