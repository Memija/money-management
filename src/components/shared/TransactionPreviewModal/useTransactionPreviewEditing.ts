import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { Transaction } from '../../../types'
import { usePreviewBulkApply } from './usePreviewBulkApply'

export interface BulkApplyOffer {
  sourceTxId: string
  originalDescription: string
  updates: Partial<Transaction>
  unlockedTargetIds: string[]
  identicalTargetIds: string[]
}

interface UseTransactionPreviewEditingProps {
  transactions: Transaction[]
  activeTransactions: Transaction[]
  setLocalTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
  effectiveUnlockedIds: Set<string>
  setLocalUnlockedDuplicateIds: React.Dispatch<React.SetStateAction<Set<string>>>
  alreadyDuplicatedIds: Set<string>
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void
  onUnlockDuplicateTransaction?: (tx: Transaction, rememberRule?: boolean) => void
  onRelockDuplicateTransaction?: (tx: Transaction) => void
  isOpen: boolean
}

export function useTransactionPreviewEditing({
  transactions,
  activeTransactions,
  setLocalTransactions,
  effectiveUnlockedIds,
  setLocalUnlockedDuplicateIds,
  alreadyDuplicatedIds,
  onUpdateTransaction,
  onUnlockDuplicateTransaction,
  onRelockDuplicateTransaction,
  isOpen,
}: UseTransactionPreviewEditingProps) {
  const initialTransactionsRef = useRef<
    Map<string, { description: string; date: string; amount: number }>
  >(new Map())

  const [bulkApplyOffer, setBulkApplyOffer] = useState<BulkApplyOffer | null>(null)
  const [pendingResetTxId, setPendingResetTxId] = useState<string | null>(null)
  const [alsoLockAsDuplicate, setAlsoLockAsDuplicate] = useState(true)

  const {
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
  } = usePreviewBulkApply({
    bulkApplyOffer,
    setBulkApplyOffer,
    onUpdateTransaction,
    activeTransactions,
    effectiveUnlockedIds,
    alreadyDuplicatedIds,
    setLocalUnlockedDuplicateIds,
    onUnlockDuplicateTransaction,
  })

  useEffect(() => {
    for (const tx of transactions) {
      if (!initialTransactionsRef.current.has(tx.id)) {
        initialTransactionsRef.current.set(tx.id, {
          description: tx.description,
          date: tx.date,
          amount: tx.amount,
        })
      }
    }
  }, [transactions])

  const getIsModified = useCallback((tx: Transaction): boolean => {
    const orig = initialTransactionsRef.current.get(tx.id)
    if (!orig) {
      return false
    }
    const descChanged = tx.description !== orig.description
    const dateChanged = tx.date !== orig.date
    const amountChanged = Math.abs(tx.amount - orig.amount) >= 0.005
    return descChanged || dateChanged || amountChanged
  }, [])

  const getOriginalTransaction = useCallback(
    (id: string): { description: string; date: string; amount: number } | undefined => {
      return initialTransactionsRef.current.get(id)
    },
    [],
  )

  const modifiedTransactions = useMemo(() => {
    return activeTransactions.filter((tx) => getIsModified(tx))
  }, [activeTransactions, getIsModified])

  const getBulkApplyOfferForTx = useCallback(
    (txId: string, customUpdates?: Partial<Transaction>): BulkApplyOffer | null => {
      if (!effectiveUnlockedIds.has(txId)) {
        return null
      }
      const currentTx = activeTransactions.find((t) => t.id === txId)
      if (!currentTx) {
        return null
      }
      const orig = initialTransactionsRef.current.get(txId)
      if (!orig) {
        return null
      }

      const cumulativeMods: Partial<Transaction> = customUpdates ? { ...customUpdates } : {}
      if (customUpdates?.description !== undefined) {
        cumulativeMods.description = customUpdates.description
      } else if (currentTx.description !== orig.description) {
        cumulativeMods.description = currentTx.description
      }

      if (customUpdates?.date !== undefined) {
        cumulativeMods.date = customUpdates.date
      } else if (currentTx.date !== orig.date) {
        cumulativeMods.date = currentTx.date
      }

      if (customUpdates?.amount !== undefined) {
        cumulativeMods.amount = customUpdates.amount
        cumulativeMods.type = customUpdates.amount >= 0 ? 'income' : 'expense'
      } else if (Math.abs(currentTx.amount - orig.amount) >= 0.005) {
        cumulativeMods.amount = currentTx.amount
        cumulativeMods.type = currentTx.amount >= 0 ? 'income' : 'expense'
      }

      if (
        cumulativeMods.description === undefined &&
        cumulativeMods.date === undefined &&
        cumulativeMods.amount === undefined
      ) {
        return null
      }

      // 1. Other unlocked transactions that don't already have all modifications applied
      const otherUnlockedTxs = activeTransactions.filter((other) => {
        if (other.id === txId || !effectiveUnlockedIds.has(other.id)) {
          return false
        }
        const matchesDesc =
          cumulativeMods.description === undefined ||
          other.description === cumulativeMods.description
        const matchesDate = cumulativeMods.date === undefined || other.date === cumulativeMods.date
        const matchesAmount =
          cumulativeMods.amount === undefined ||
          Math.abs(other.amount - cumulativeMods.amount) < 0.005
        return !(matchesDesc && matchesDate && matchesAmount)
      })

      // 2. Identical duplicate transactions that are not already unlocked
      const otherIdenticalTxs = activeTransactions.filter((other) => {
        if (
          other.id === txId ||
          effectiveUnlockedIds.has(other.id) ||
          alreadyDuplicatedIds.has(other.id)
        ) {
          return false
        }
        const otherOrig = initialTransactionsRef.current.get(other.id) || other
        const descMatches =
          otherOrig.description.trim().toLowerCase() === orig.description.trim().toLowerCase()
        const amountMatches = Math.abs(otherOrig.amount - orig.amount) < 0.005
        return descMatches && amountMatches
      })

      const unlockedTargetIds = otherUnlockedTxs.map((t) => t.id)
      const identicalTargetIds = otherIdenticalTxs.map((t) => t.id)

      if (unlockedTargetIds.length === 0 && identicalTargetIds.length === 0) {
        return null
      }

      return {
        sourceTxId: txId,
        originalDescription: orig.description,
        updates: cumulativeMods,
        unlockedTargetIds,
        identicalTargetIds,
      }
    },
    [activeTransactions, effectiveUnlockedIds, alreadyDuplicatedIds],
  )

  useEffect(() => {
    if (isOpen) {
      setIsAdjustModalOpen(false)

      const modifiedUnlockedTx = activeTransactions.find(
        (tx) => effectiveUnlockedIds.has(tx.id) && getIsModified(tx),
      )
      if (modifiedUnlockedTx) {
        const offer = getBulkApplyOfferForTx(modifiedUnlockedTx.id)
        setBulkApplyOffer(offer)
      } else {
        setBulkApplyOffer(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const executeResetTransaction = useCallback(
    (id: string, alsoLock: boolean = false) => {
      if (alreadyDuplicatedIds.has(id)) {
        return
      }
      const orig = initialTransactionsRef.current.get(id)
      if (orig && onUpdateTransaction) {
        const resetData = {
          description: orig.description,
          date: orig.date,
          amount: orig.amount,
          type: (orig.amount >= 0 ? 'income' : 'expense') as 'income' | 'expense',
        }
        onUpdateTransaction(id, resetData)
        setLocalTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...resetData } : t)))
        if (alsoLock && effectiveUnlockedIds.has(id)) {
          setLocalUnlockedDuplicateIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
          const targetTx = activeTransactions.find((t) => t.id === id)
          const fullResetTx = { ...(targetTx || {}), ...orig, ...resetData, id } as Transaction
          onRelockDuplicateTransaction?.(fullResetTx)
        }
      }
      setBulkApplyOffer((prev) => (prev?.sourceTxId === id ? null : prev))
    },
    [
      alreadyDuplicatedIds,
      onUpdateTransaction,
      setLocalTransactions,
      effectiveUnlockedIds,
      activeTransactions,
      onRelockDuplicateTransaction,
      setLocalUnlockedDuplicateIds,
    ],
  )

  const executeResetAllModified = useCallback(
    (alsoLock: boolean = false) => {
      if (!onUpdateTransaction) {
        return
      }
      const resetMap = new Map<string, Partial<Transaction>>()
      for (const tx of modifiedTransactions) {
        if (alreadyDuplicatedIds.has(tx.id)) {
          continue
        }
        const orig = initialTransactionsRef.current.get(tx.id)
        if (orig) {
          const resetData = {
            description: orig.description,
            date: orig.date,
            amount: orig.amount,
            type: (orig.amount >= 0 ? 'income' : 'expense') as 'income' | 'expense',
          }
          onUpdateTransaction(tx.id, resetData)
          resetMap.set(tx.id, resetData)
        }
      }
      setLocalTransactions((prev) =>
        prev.map((t) => {
          const resetData = resetMap.get(t.id)
          return resetData ? { ...t, ...resetData } : t
        }),
      )

      if (alsoLock) {
        const idsToRelock = modifiedTransactions
          .filter((tx) => !alreadyDuplicatedIds.has(tx.id) && effectiveUnlockedIds.has(tx.id))
          .map((tx) => tx.id)

        if (idsToRelock.length > 0) {
          setLocalUnlockedDuplicateIds((prev) => {
            const next = new Set(prev)
            idsToRelock.forEach((id) => next.delete(id))
            return next
          })
          for (const id of idsToRelock) {
            const orig = initialTransactionsRef.current.get(id)
            const targetTx = activeTransactions.find((t) => t.id === id)
            const resetData = resetMap.get(id) || {}
            const fullResetTx = { ...(targetTx || {}), ...orig, ...resetData, id } as Transaction
            onRelockDuplicateTransaction?.(fullResetTx)
          }
        }
      }

      setBulkApplyOffer(null)
    },
    [
      onUpdateTransaction,
      modifiedTransactions,
      alreadyDuplicatedIds,
      setLocalTransactions,
      effectiveUnlockedIds,
      activeTransactions,
      onRelockDuplicateTransaction,
      setLocalUnlockedDuplicateIds,
    ],
  )

  const handleResetTransaction = useCallback(
    (id: string) => {
      if (alreadyDuplicatedIds.has(id)) {
        return
      }
      setPendingResetTxId(id)
    },
    [alreadyDuplicatedIds],
  )

  const handleUpdateTransaction = useMemo(
    () =>
      onUpdateTransaction
        ? (id: string, updates: Partial<Transaction>) => {
            if (alreadyDuplicatedIds.has(id)) {
              return
            }
            onUpdateTransaction(id, updates)
            setLocalTransactions((prev) =>
              prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
            )

            // If an unlocked duplicate is edited, offer to adjust other unlocked and identical transactions in bulk
            if (effectiveUnlockedIds.has(id)) {
              const offer = getBulkApplyOfferForTx(id, updates)
              if (offer) {
                setBulkApplyOffer(offer)
              }
            }
          }
        : undefined,
    [
      onUpdateTransaction,
      alreadyDuplicatedIds,
      setLocalTransactions,
      effectiveUnlockedIds,
      getBulkApplyOfferForTx,
    ],
  )

  return {
    bulkApplyOffer,
    setBulkApplyOffer,
    isAdjustModalOpen,
    setIsAdjustModalOpen,
    selectedFieldsToApply,
    setSelectedFieldsToApply,
    selectedTargetIds,
    setSelectedTargetIds,
    pendingResetTxId,
    setPendingResetTxId,
    alsoLockAsDuplicate,
    setAlsoLockAsDuplicate,
    getIsModified,
    getOriginalTransaction,
    modifiedTransactions,
    executeResetTransaction,
    executeResetAllModified,
    handleResetTransaction,
    handleUpdateTransaction,
    handleApplyToAllUnlocked,
    handleConfirmBulkApply,
    handleOpenAdjustModal,
    handleConfirmCustomAdjust,
  }
}
