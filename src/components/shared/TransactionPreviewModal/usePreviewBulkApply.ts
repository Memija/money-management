import React, { useCallback, useState } from 'react'

import type { Transaction } from '../../../types'
import type { BulkApplyOffer } from './useTransactionPreviewEditing'

interface UsePreviewBulkApplyProps {
  bulkApplyOffer: BulkApplyOffer | null
  setBulkApplyOffer: React.Dispatch<React.SetStateAction<BulkApplyOffer | null>>
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void
  activeTransactions: Transaction[]
  effectiveUnlockedIds: Set<string>
  alreadyDuplicatedIds: Set<string>
  setLocalUnlockedDuplicateIds: React.Dispatch<React.SetStateAction<Set<string>>>
  onUnlockDuplicateTransaction?: (tx: Transaction, rememberRule?: boolean) => void
}

export function usePreviewBulkApply({
  bulkApplyOffer,
  setBulkApplyOffer,
  onUpdateTransaction,
  activeTransactions,
  effectiveUnlockedIds,
  alreadyDuplicatedIds,
  setLocalUnlockedDuplicateIds,
  onUnlockDuplicateTransaction,
}: UsePreviewBulkApplyProps) {
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [selectedFieldsToApply, setSelectedFieldsToApply] = useState<{
    description: boolean
    date: boolean
    amount: boolean
  }>({ description: true, date: true, amount: true })
  const [selectedTargetIds, setSelectedTargetIds] = useState<Set<string>>(new Set())

  const handleApplyToAllUnlocked = useCallback(() => {
    if (!bulkApplyOffer) {
      return
    }
    const { updates, unlockedTargetIds } = bulkApplyOffer
    for (const txId of unlockedTargetIds) {
      onUpdateTransaction?.(txId, updates)
    }
    setBulkApplyOffer(null)
  }, [bulkApplyOffer, onUpdateTransaction, setBulkApplyOffer])

  const handleConfirmBulkApply = useCallback(() => {
    if (!bulkApplyOffer) {
      return
    }
    const { updates, unlockedTargetIds, identicalTargetIds } = bulkApplyOffer
    const allTargets = [...unlockedTargetIds, ...identicalTargetIds]
    for (const txId of allTargets) {
      onUpdateTransaction?.(txId, updates)
    }

    if (identicalTargetIds.length > 0) {
      setLocalUnlockedDuplicateIds((prev) => {
        const next = new Set(prev)
        for (const id of identicalTargetIds) {
          next.add(id)
        }
        return next
      })
      for (const txId of identicalTargetIds) {
        const matchingTx = activeTransactions.find((t) => t.id === txId)
        if (matchingTx) {
          onUnlockDuplicateTransaction?.({ ...matchingTx, ...updates }, true)
        }
      }
    }
    setBulkApplyOffer(null)
  }, [
    bulkApplyOffer,
    onUpdateTransaction,
    setLocalUnlockedDuplicateIds,
    activeTransactions,
    onUnlockDuplicateTransaction,
    setBulkApplyOffer,
  ])

  const handleOpenAdjustModal = useCallback(() => {
    if (!bulkApplyOffer) {
      return
    }
    setSelectedFieldsToApply({
      description: bulkApplyOffer.updates.description !== undefined,
      date: bulkApplyOffer.updates.date !== undefined,
      amount: bulkApplyOffer.updates.amount !== undefined,
    })
    const allTargets = [...bulkApplyOffer.unlockedTargetIds, ...bulkApplyOffer.identicalTargetIds]
    setSelectedTargetIds(new Set(allTargets))
    setIsAdjustModalOpen(true)
  }, [bulkApplyOffer])

  const handleConfirmCustomAdjust = useCallback(() => {
    if (!bulkApplyOffer) {
      return
    }
    const filteredUpdates: Partial<Transaction> = {}
    if (selectedFieldsToApply.description && bulkApplyOffer.updates.description !== undefined) {
      filteredUpdates.description = bulkApplyOffer.updates.description
    }
    if (selectedFieldsToApply.date && bulkApplyOffer.updates.date !== undefined) {
      filteredUpdates.date = bulkApplyOffer.updates.date
    }
    if (selectedFieldsToApply.amount && bulkApplyOffer.updates.amount !== undefined) {
      filteredUpdates.amount = bulkApplyOffer.updates.amount
      filteredUpdates.type =
        bulkApplyOffer.updates.type ?? (bulkApplyOffer.updates.amount >= 0 ? 'income' : 'expense')
    }

    for (const txId of selectedTargetIds) {
      onUpdateTransaction?.(txId, filteredUpdates)
    }

    const targetsToUnlock = [...selectedTargetIds].filter(
      (txId) =>
        !alreadyDuplicatedIds.has(txId) &&
        (bulkApplyOffer.identicalTargetIds.includes(txId) || !effectiveUnlockedIds.has(txId)),
    )

    if (targetsToUnlock.length > 0) {
      setLocalUnlockedDuplicateIds((prev) => {
        const next = new Set(prev)
        for (const id of targetsToUnlock) {
          next.add(id)
        }
        return next
      })
      for (const txId of targetsToUnlock) {
        const matchingTx = activeTransactions.find((t) => t.id === txId)
        if (matchingTx) {
          onUnlockDuplicateTransaction?.({ ...matchingTx, ...filteredUpdates }, true)
        }
      }
    }

    setIsAdjustModalOpen(false)
    setBulkApplyOffer(null)
  }, [
    bulkApplyOffer,
    selectedFieldsToApply,
    selectedTargetIds,
    onUpdateTransaction,
    alreadyDuplicatedIds,
    effectiveUnlockedIds,
    setLocalUnlockedDuplicateIds,
    activeTransactions,
    onUnlockDuplicateTransaction,
    setBulkApplyOffer,
  ])

  return {
    isAdjustModalOpen,
    setIsAdjustModalOpen,
    selectedFieldsToApply,
    setSelectedFieldsToApply,
    selectedTargetIds,
    setSelectedTargetIds,
    handleApplyToAllUnlocked,
    handleConfirmBulkApply,
    handleOpenAdjustModal,
    handleConfirmCustomAdjust,
  }
}
