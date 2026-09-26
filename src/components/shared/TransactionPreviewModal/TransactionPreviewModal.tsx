import React, { useEffect, useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Ban,
  Check,
  CopyCheck,
  Ghost,
  Landmark,
  Layers,
  Lock,
  Plus,
  RotateCcw,
  Search,
  Sliders,
  X,
} from 'lucide-react'

import { findInstitution } from '../../../data/institutions'
import { useFormatters } from '../../../hooks/useFormatters'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { Transaction } from '../../../types'
import { Modal } from '../Modal'
import { UnlockDuplicateModal } from '../UnlockDuplicateModal'
import { TransactionPreviewHeader } from './TransactionPreviewHeader'
import { TransactionPreviewRow } from './TransactionPreviewRow'
import {
  type ScopeFilter,
  type SortColumn,
  TransactionPreviewToolbar,
} from './TransactionPreviewToolbar'

export type { ScopeFilter, SortColumn } from './TransactionPreviewToolbar'
import { usePreviewTransactionsFilter } from './usePreviewTransactionsFilter'

import styles from './TransactionPreviewModal.module.css'

export interface TransactionPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction[]
  currentInstitutionName?: string
  initialAccountFilter?: string
  duplicateIds?: Set<string>
  alreadyDuplicatedIds?: Set<string>
  unlockedDuplicateIds?: Set<string>
  internalTransferIds?: Set<string>
  existingAccountTransfers?: Transaction[]
  discardedSpaceCount?: number
  excludedSpaceTransactions?: Transaction[]
  initialFilter?: ScopeFilter
  onRemoveTransaction?: (id: string) => void
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void
  onUnlockDuplicateTransaction?: (tx: Transaction, rememberRule?: boolean) => void
  onRelockDuplicateTransaction?: (tx: Transaction) => void
  title?: string
  variant?: 'income' | 'expense'
  showInstitution?: boolean
  isImport?: boolean
}

export const TransactionPreviewModal: React.FC<TransactionPreviewModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currentInstitutionName,
  initialAccountFilter = 'all',
  duplicateIds = new Set(),
  alreadyDuplicatedIds = new Set(),
  unlockedDuplicateIds,
  internalTransferIds = new Set(),
  existingAccountTransfers = [],
  discardedSpaceCount = 0,
  excludedSpaceTransactions,
  initialFilter = 'all',
  onRemoveTransaction,
  onUpdateTransaction,
  onUnlockDuplicateTransaction,
  onRelockDuplicateTransaction,
  title,
  variant,
  showInstitution = false,
  isImport,
}) => {
  const isImportMode =
    isImport ??
    Boolean(
      onUnlockDuplicateTransaction ||
        onRelockDuplicateTransaction ||
        unlockedDuplicateIds !== undefined,
    )
  const t = useLanguageStore((s) => s.t)
  const locale = useLanguageStore((s) => s.locale)
  const customCategories = useAppStore((s) => s.customCategories)
  const { formatCurrency, formatDate, formatTransactionCount } = useFormatters()

  const ROW_HEIGHT = 64 // Standardized row height for Virtuoso virtualization

  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>(initialFilter)
  const [accountFilter, setAccountFilter] = useState<string>(initialAccountFilter)
  const [subAccountFilter, setSubAccountFilter] = useState<string>('all')
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions)
  const [localUnlockedDuplicateIds, setLocalUnlockedDuplicateIds] = useState<Set<string>>(new Set())
  const [unlockedTxToWarn, setUnlockedTxToWarn] = useState<Transaction | null>(null)

  const currentAccountName = currentInstitutionName || t.currentImport || 'Current Import'
  const currentInstLogo = useMemo(() => {
    return findInstitution(currentInstitutionName || currentAccountName)?.logo
  }, [currentInstitutionName, currentAccountName])

  const existingInstitutions = useMemo(() => {
    if (!existingAccountTransfers || existingAccountTransfers.length === 0) return []
    const names = new Set<string>()
    for (const tx of existingAccountTransfers) {
      if (tx.institution) {
        names.add(tx.institution)
      }
    }
    if (names.size === 0) {
      names.add(t.alreadyImported || 'Already Imported')
    }
    return Array.from(names)
  }, [existingAccountTransfers, t])

  const hasMultipleAccounts = existingInstitutions.length > 0

  const existingTransferIds = useMemo(
    () => new Set((existingAccountTransfers || []).map((t) => t.id)),
    [existingAccountTransfers],
  )
  const [bulkApplyOffer, setBulkApplyOffer] = useState<{
    sourceTxId: string
    originalDescription: string
    updates: Partial<Transaction>
    unlockedTargetIds: string[]
    identicalTargetIds: string[]
  } | null>(null)

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [selectedFieldsToApply, setSelectedFieldsToApply] = useState<{
    description: boolean
    date: boolean
    amount: boolean
  }>({ description: true, date: true, amount: true })
  const [selectedTargetIds, setSelectedTargetIds] = useState<Set<string>>(new Set())
  const [pendingResetTxId, setPendingResetTxId] = useState<string | null>(null)
  const [alsoLockAsDuplicate, setAlsoLockAsDuplicate] = useState(true)

  const initialTransactionsRef = React.useRef<
    Map<string, { description: string; date: string; amount: number }>
  >(new Map())

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

  const getIsModified = React.useCallback((tx: Transaction): boolean => {
    const orig = initialTransactionsRef.current.get(tx.id)
    if (!orig) return false
    const descChanged = tx.description !== orig.description
    const dateChanged = tx.date !== orig.date
    const amountChanged = Math.abs(tx.amount - orig.amount) >= 0.005
    return descChanged || dateChanged || amountChanged
  }, [])

  useEffect(() => {
    setLocalTransactions(transactions)
  }, [transactions])

  const effectiveUnlockedIds = useMemo(() => {
    const raw = unlockedDuplicateIds
      ? new Set([...unlockedDuplicateIds, ...localUnlockedDuplicateIds])
      : new Set(localUnlockedDuplicateIds)
    if (alreadyDuplicatedIds && alreadyDuplicatedIds.size > 0) {
      for (const id of alreadyDuplicatedIds) {
        raw.delete(id)
      }
    }
    return raw
  }, [unlockedDuplicateIds, localUnlockedDuplicateIds, alreadyDuplicatedIds])

  const activeTransactions = localTransactions
  const activeExcluded = excludedSpaceTransactions ?? []

  const modifiedTransactions = useMemo(() => {
    return activeTransactions.filter((tx) => getIsModified(tx))
  }, [activeTransactions, getIsModified])

  const executeResetTransaction = (id: string, alsoLock: boolean = false) => {
    if (alreadyDuplicatedIds.has(id)) return
    const orig = initialTransactionsRef.current.get(id)
    if (orig && onUpdateTransaction) {
      const resetData = {
        description: orig.description,
        date: orig.date,
        amount: orig.amount,
        type: (orig.amount >= 0 ? 'income' : 'expense') as 'income' | 'expense',
      }
      onUpdateTransaction(id, resetData)
      setLocalTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...resetData } : t)),
      )
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
  }

  const executeResetAllModified = (alsoLock: boolean = false) => {
    if (!onUpdateTransaction) return
    const resetMap = new Map<string, Partial<Transaction>>()
    for (const tx of modifiedTransactions) {
      if (alreadyDuplicatedIds.has(tx.id)) continue
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
  }

  const handleResetTransaction = (id: string) => {
    if (alreadyDuplicatedIds.has(id)) return
    setPendingResetTxId(id)
  }

  const getBulkApplyOfferForTx = React.useCallback(
    (
      txId: string,
      customUpdates?: Partial<Transaction>,
    ): {
      sourceTxId: string
      originalDescription: string
      updates: Partial<Transaction>
      unlockedTargetIds: string[]
      identicalTargetIds: string[]
    } | null => {
      if (!effectiveUnlockedIds.has(txId)) return null
      const currentTx = activeTransactions.find((t) => t.id === txId)
      if (!currentTx) return null
      const orig = initialTransactionsRef.current.get(txId)
      if (!orig) return null

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
        if (other.id === txId || !effectiveUnlockedIds.has(other.id)) return false
        const matchesDesc =
          cumulativeMods.description === undefined || other.description === cumulativeMods.description
        const matchesDate =
          cumulativeMods.date === undefined || other.date === cumulativeMods.date
        const matchesAmount =
          cumulativeMods.amount === undefined || Math.abs(other.amount - cumulativeMods.amount) < 0.005
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
      setScopeFilter(initialFilter)
      setAccountFilter(initialAccountFilter ?? 'all')
      setSubAccountFilter('all')
      setLocalUnlockedDuplicateIds(new Set())
      setUnlockedTxToWarn(null)
      setIsAdjustModalOpen(false)

      // Restore bulk apply offer on modal open if any unlocked transaction is modified and has pending targets
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
  }, [isOpen, initialFilter])

  const handleUpdateTransaction = onUpdateTransaction
    ? (id: string, updates: Partial<Transaction>) => {
        if (alreadyDuplicatedIds.has(id)) return
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
    : undefined

  const handleApplyToAllUnlocked = () => {
    if (!bulkApplyOffer) return
    const { updates, unlockedTargetIds } = bulkApplyOffer
    for (const txId of unlockedTargetIds) {
      onUpdateTransaction?.(txId, updates)
    }
    setBulkApplyOffer(null)
  }

  const handleConfirmBulkApply = () => {
    if (!bulkApplyOffer) return
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
  }

  const handleOpenAdjustModal = () => {
    if (!bulkApplyOffer) return
    setSelectedFieldsToApply({
      description: bulkApplyOffer.updates.description !== undefined,
      date: bulkApplyOffer.updates.date !== undefined,
      amount: bulkApplyOffer.updates.amount !== undefined,
    })
    const allTargets = [
      ...bulkApplyOffer.unlockedTargetIds,
      ...bulkApplyOffer.identicalTargetIds,
    ]
    setSelectedTargetIds(new Set(allTargets))
    setIsAdjustModalOpen(true)
  }

  const handleConfirmCustomAdjust = () => {
    if (!bulkApplyOffer) return
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
        bulkApplyOffer.updates.type ??
        (bulkApplyOffer.updates.amount >= 0 ? 'income' : 'expense')
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
  }

  const handleRequestUnlockDuplicate = (tx: Transaction) => {
    if (alreadyDuplicatedIds.has(tx.id)) return
    setUnlockedTxToWarn(tx)
  }

  const sameLockedDuplicates = useMemo(() => {
    if (!unlockedTxToWarn) return []
    const orig = initialTransactionsRef.current.get(unlockedTxToWarn.id) || unlockedTxToWarn
    const origDesc = orig.description.trim().toLowerCase()
    const origAmt = orig.amount

    return activeTransactions.filter((other) => {
      if (other.id !== unlockedTxToWarn.id && effectiveUnlockedIds.has(other.id)) return false
      if (!duplicateIds.has(other.id) && other.id !== unlockedTxToWarn.id) return false
      if (alreadyDuplicatedIds.has(other.id)) return false
      const otherOrig = initialTransactionsRef.current.get(other.id) || other
      return (
        otherOrig.description.trim().toLowerCase() === origDesc &&
        Math.abs(otherOrig.amount - origAmt) < 0.005
      )
    })
  }, [unlockedTxToWarn, activeTransactions, effectiveUnlockedIds, duplicateIds, alreadyDuplicatedIds])

  const handleConfirmUnlockDuplicate = (
    tx: Transaction,
    rememberRule?: boolean,
    unlockAllIdentical?: boolean,
  ) => {
    if (alreadyDuplicatedIds.has(tx.id)) return
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

  const spaceTransferIds = useMemo(() => {
    return new Set(activeExcluded.map((tx) => tx.id))
  }, [activeExcluded])

  const hasSpaceTransfers = Boolean(
    activeExcluded.length > 0 || discardedSpaceCount > 0,
  )

  const subAccounts = useMemo(() => {
    const names = new Set<string>()
    for (const tx of activeExcluded) {
      if (tx.subAccount) {
        names.add(tx.subAccount)
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b))
  }, [activeExcluded])

  const subAccountCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: activeExcluded.length,
    }
    for (const sa of subAccounts) {
      counts[sa] = activeExcluded.filter((tx) => tx.subAccount === sa).length
    }
    return counts
  }, [activeExcluded, subAccounts])

  const combinedTransactions = useMemo(() => {
    if (activeExcluded.length === 0) {
      return activeTransactions
    }
    return [...activeTransactions, ...activeExcluded]
  }, [activeTransactions, activeExcluded])

  const duplicateCount = useMemo(() => {
    return activeTransactions.filter((tx) => {
      const isDup =
        duplicateIds.has(tx.id) ||
        effectiveUnlockedIds.has(tx.id) ||
        Boolean(tx.isDuplicate) ||
        Boolean(tx.forceImport)
      const isMod = getIsModified(tx) || Boolean(tx.isModified)
      return isDup && !isMod
    }).length
  }, [activeTransactions, duplicateIds, effectiveUnlockedIds, getIsModified])

  const modifiedDuplicateCount = useMemo(() => {
    return activeTransactions.filter((tx) => {
      const isDup =
        duplicateIds.has(tx.id) ||
        effectiveUnlockedIds.has(tx.id) ||
        Boolean(tx.isDuplicate) ||
        Boolean(tx.forceImport)
      const isMod = getIsModified(tx) || Boolean(tx.isModified)
      return isDup && isMod
    }).length
  }, [activeTransactions, duplicateIds, effectiveUnlockedIds, getIsModified])

  const alreadyDuplicatedCount = useMemo(() => {
    return activeTransactions.filter((tx) => alreadyDuplicatedIds.has(tx.id)).length
  }, [activeTransactions, alreadyDuplicatedIds])

  const hasDuplicates = duplicateCount > 0 || duplicateIds.size > 0

  const spaceTransferCount = activeExcluded.length

  const internalTransferCount = useMemo(() => {
    const draftTransfers = activeTransactions.filter(
      (tx) =>
        !duplicateIds.has(tx.id) &&
        !effectiveUnlockedIds.has(tx.id) &&
        (tx.isGhost || internalTransferIds.has(tx.id)),
    )
    return draftTransfers.length + (existingAccountTransfers?.length || 0)
  }, [
    activeTransactions,
    duplicateIds,
    effectiveUnlockedIds,
    internalTransferIds,
    existingAccountTransfers,
  ])

  const lockedDuplicateCount = useMemo(() => {
    return activeTransactions.filter(
      (tx) =>
        (duplicateIds.has(tx.id) && !effectiveUnlockedIds.has(tx.id)) ||
        alreadyDuplicatedIds.has(tx.id),
    ).length
  }, [activeTransactions, duplicateIds, effectiveUnlockedIds, alreadyDuplicatedIds])

  const excludedCount = useMemo(() => {
    return lockedDuplicateCount + spaceTransferCount + internalTransferCount
  }, [lockedDuplicateCount, spaceTransferCount, internalTransferCount])

  const baseScopedTransactions = useMemo(() => {
    if (scopeFilter === 'unlocked') {
      return activeTransactions.filter((tx) => effectiveUnlockedIds.has(tx.id))
    }
    if (scopeFilter === 'already-duplicated') {
      return activeTransactions.filter((tx) => alreadyDuplicatedIds.has(tx.id))
    }
    if (scopeFilter === 'duplicates') {
      return activeTransactions.filter((tx) => {
        const isDup =
          duplicateIds.has(tx.id) ||
          effectiveUnlockedIds.has(tx.id) ||
          Boolean(tx.isDuplicate) ||
          Boolean(tx.forceImport)
        const isMod = getIsModified(tx) || Boolean(tx.isModified)
        return isDup && !isMod
      })
    }
    if (scopeFilter === 'modified') {
      return activeTransactions.filter((tx) => {
        const isDup =
          duplicateIds.has(tx.id) ||
          effectiveUnlockedIds.has(tx.id) ||
          Boolean(tx.isDuplicate) ||
          Boolean(tx.forceImport)
        const isMod = getIsModified(tx) || Boolean(tx.isModified)
        return isDup && isMod
      })
    }
    if (scopeFilter === 'excluded') {
      const draftExcluded = activeTransactions.filter((tx) => {
        const isLockedDuplicate =
          (duplicateIds.has(tx.id) && !effectiveUnlockedIds.has(tx.id)) ||
          alreadyDuplicatedIds.has(tx.id)
        const isInternalTransfer =
          !duplicateIds.has(tx.id) &&
          !effectiveUnlockedIds.has(tx.id) &&
          (tx.isGhost || internalTransferIds.has(tx.id))
        return isLockedDuplicate || isInternalTransfer
      })
      return [...draftExcluded, ...activeExcluded, ...(existingAccountTransfers || [])]
    }
    if (scopeFilter === 'space-transfers') {
      if (subAccountFilter === 'all') return activeExcluded
      return activeExcluded.filter((tx) => tx.subAccount === subAccountFilter)
    }
    if (scopeFilter === 'internal-transfers') {
      const draftTransfers = activeTransactions.filter(
        (tx) =>
          !duplicateIds.has(tx.id) &&
          !effectiveUnlockedIds.has(tx.id) &&
          (tx.isGhost || internalTransferIds.has(tx.id)),
      )
      return [...draftTransfers, ...(existingAccountTransfers || [])]
    }
    if (scopeFilter === 'included') {
      return activeTransactions.filter(
        (tx) => !duplicateIds.has(tx.id) || effectiveUnlockedIds.has(tx.id),
      )
    }
    if (hasSpaceTransfers) return combinedTransactions
    return activeTransactions
  }, [
    activeTransactions,
    activeExcluded,
    hasSpaceTransfers,
    scopeFilter,
    subAccountFilter,
    combinedTransactions,
    internalTransferIds,
    existingAccountTransfers,
    duplicateIds,
    alreadyDuplicatedIds,
    effectiveUnlockedIds,
    getIsModified,
  ])

  const accountCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: baseScopedTransactions.length,
      current: baseScopedTransactions.filter((tx) => !existingTransferIds.has(tx.id)).length,
    }
    for (const inst of existingInstitutions) {
      counts[inst] = baseScopedTransactions.filter(
        (tx) => (tx.institution || t.alreadyImported || 'Already Imported') === inst,
      ).length
    }
    return counts
  }, [baseScopedTransactions, existingTransferIds, existingInstitutions, t])

  const scopedTransactions = useMemo(() => {
    if (accountFilter === 'all') {
      return baseScopedTransactions
    }
    if (accountFilter === 'current' || accountFilter === currentAccountName) {
      return baseScopedTransactions.filter((tx) => !existingTransferIds.has(tx.id))
    }
    return baseScopedTransactions.filter(
      (tx) => (tx.institution || t.alreadyImported || 'Already Imported') === accountFilter,
    )
  }, [baseScopedTransactions, accountFilter, currentAccountName, existingTransferIds, t])

  const hasMultipleTransactions =
    combinedTransactions.length > 1 || (scopedTransactions && scopedTransactions.length > 1)

  const {
    sortConfig,
    searchQuery,
    setSearchQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isFilterActive,
    handleClearFilters,
    handleSort,
    handleSortChange,
    sortOptions,
    filteredAndSortedTransactions,
    totalInflows,
    totalOutflows,
  } = usePreviewTransactionsFilter({
    scopedTransactions,
    hasMultipleTransactions,
    duplicateIds,
    unlockedDuplicateIds: effectiveUnlockedIds,
    internalTransferIds,
    spaceTransferIds,
    formatCurrency,
    t,
  })

  const effectiveIsFilterActive =
    isFilterActive ||
    scopeFilter !== initialFilter ||
    accountFilter !== 'all' ||
    (scopeFilter === 'space-transfers' && subAccountFilter !== 'all')

  const handleClearAllFilters = () => {
    handleClearFilters()
    if (scopeFilter !== initialFilter) {
      setScopeFilter(initialFilter)
    }
    if (accountFilter !== 'all') {
      setAccountFilter('all')
    }
    if (subAccountFilter !== 'all') {
      setSubAccountFilter('all')
    }
  }

  const handleScopeFilterChange = (newScope: ScopeFilter) => {
    if (initialFilter === 'space-transfers' || initialFilter === 'internal-transfers') {
      return
    }
    setScopeFilter(newScope)
    if (newScope !== 'excluded' && newScope !== 'internal-transfers' && newScope !== 'all') {
      setAccountFilter('all')
    }
    if (newScope !== 'space-transfers') {
      setSubAccountFilter('all')
    }
  }

  const renderSortIcon = (key: SortColumn) => {
    if (sortConfig?.key !== key) return <ArrowUpDown size={14} className={styles['sort-icon']} />
    const Icon = sortConfig.direction === 'asc' ? ArrowUp : ArrowDown
    return <Icon size={14} className={`${styles['sort-icon']} ${styles['sort-icon-active']}`} />
  }

  const effectiveTitle = useMemo(() => {
    let base = ''
    if (scopeFilter === 'excluded') base = t.filterExcluded || 'Excluded'
    else if (scopeFilter === 'space-transfers') {
      base = t.filterSpaceTransfers || 'Sub-account Transfers'
      if (subAccountFilter !== 'all') {
        return `${base} • ${subAccountFilter}`
      }
      return base
    } else if (scopeFilter === 'internal-transfers') base = t.filterInternalTransfers || 'Internal Transfers'
    else if (scopeFilter === 'duplicates') base = t.filterDuplicates || 'Duplicates'
    else if (scopeFilter === 'already-duplicated')
      base = t.filterAlreadyDuplicated || t.alreadyDuplicated || 'Already Duplicated'
    else if (scopeFilter === 'modified') base = t.filterModified || 'Modified'
    else if (scopeFilter === 'unlocked') base = t.filterUnlocked || 'Unlocked'
    else if (scopeFilter === 'all' && initialFilter !== 'all') base = t.transactions
    else base = title ?? t.transactions

    if (
      accountFilter !== 'all' &&
      (scopeFilter === 'excluded' || scopeFilter === 'internal-transfers')
    ) {
      const accName = accountFilter === 'current' ? currentAccountName : accountFilter
      return `${base} • ${accName}`
    }
    return base
  }, [scopeFilter, initialFilter, accountFilter, subAccountFilter, currentAccountName, title, t])

  const hasActions = Boolean(
    onRemoveTransaction ||
      onUnlockDuplicateTransaction ||
      onRelockDuplicateTransaction ||
      effectiveUnlockedIds.size > 0 ||
      modifiedTransactions.length > 0,
  )

  const rowContent = (index: number, tx: Transaction) => {
    const isTxUnlockedDuplicate = effectiveUnlockedIds.has(tx.id)
    const isTxDuplicate =
      duplicateIds.has(tx.id) ||
      isTxUnlockedDuplicate ||
      Boolean(tx.isDuplicate) ||
      Boolean(tx.forceImport)
    const isTxAlreadyDuplicated = Boolean(alreadyDuplicatedIds?.has(tx.id))
    const isTxModified = getIsModified(tx) || Boolean(tx.isModified)
    const isTxExistingAccountTransfer = existingTransferIds.has(tx.id)
    return (
      <TransactionPreviewRow
        key={tx.id}
        index={index}
        tx={tx}
        isDuplicate={isTxDuplicate}
        isAlreadyDuplicated={isTxAlreadyDuplicated}
        isUnlockedDuplicate={isTxUnlockedDuplicate}
        isModified={isTxModified}
        hideDuplicateBadge={false}
        isInternalTransfer={!isTxDuplicate && (tx.isGhost || internalTransferIds.has(tx.id) || isTxExistingAccountTransfer)}
        isSpaceTransfer={!isTxDuplicate && spaceTransferIds.has(tx.id)}
        isExistingAccountTransfer={isTxExistingAccountTransfer}
        showInstitution={showInstitution}
        customCategories={customCategories}
        t={t}
        locale={locale}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        onUpdateTransaction={isTxExistingAccountTransfer ? undefined : handleUpdateTransaction}
        onRemoveTransaction={isTxExistingAccountTransfer ? undefined : onRemoveTransaction}
        onResetTransaction={isTxExistingAccountTransfer ? undefined : handleResetTransaction}
        onUnlockDuplicate={
          onUnlockDuplicateTransaction && !isTxAlreadyDuplicated && !isTxExistingAccountTransfer
            ? handleRequestUnlockDuplicate
            : undefined
        }
        onRelockDuplicate={onRelockDuplicateTransaction && !isTxExistingAccountTransfer ? handleRelockDuplicate : undefined}
        hasActions={hasActions && !isTxExistingAccountTransfer}
      />
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <TransactionPreviewHeader
          effectiveTitle={effectiveTitle}
          variant={variant}
          totalCount={filteredAndSortedTransactions.length}
          totalInflows={totalInflows}
          totalOutflows={totalOutflows}
          formatCurrency={formatCurrency}
          formatTransactionCount={formatTransactionCount}
          t={t}
        />
      }
      maxWidth="880px"
      footer={
        <div className={styles['modal-footer']}>
          <span className={styles['footer-count-text']}>
            {(t.showingOf || 'Showing {shown} of {total} transactions')
              .replace('{shown}', String(filteredAndSortedTransactions.length))
              .replace('{total}', String(scopedTransactions.length))}
          </span>
          <button
            className={`primary-button ${styles['done-button']}`}
            onClick={onClose}
            title={t.done}
          >
            <Check size={16} />
            <span>{t.done}</span>
          </button>
        </div>
      }
    >
      {duplicateIds.size > effectiveUnlockedIds.size &&
        scopeFilter !== 'duplicates' &&
        scopeFilter !== 'already-duplicated' &&
        scopeFilter !== 'space-transfers' &&
        scopeFilter !== 'internal-transfers' && (
        <div className={styles['duplicate-banner']}>
          <AlertTriangle size={18} />
          <span>
            {duplicateIds.size - effectiveUnlockedIds.size === 1
              ? t.duplicateTransactionsDetectedSingular || '1 duplicate transaction detected.'
              : (t.duplicateTransactionsDetected || '{count} duplicate transactions detected.').replace(
                  '{count}',
                  String(duplicateIds.size - effectiveUnlockedIds.size),
                )}
          </span>
        </div>
      )}

      {bulkApplyOffer &&
        (bulkApplyOffer.unlockedTargetIds.length > 0 ||
          bulkApplyOffer.identicalTargetIds.length > 0) && (
          <div className={styles['bulk-apply-banner']} data-testid="bulk-apply-banner">
            <div className={styles['bulk-apply-info']}>
              <CopyCheck size={18} className={styles['bulk-apply-icon']} aria-hidden="true" />
              <span>
                {bulkApplyOffer.unlockedTargetIds.length > 0
                  ? bulkApplyOffer.unlockedTargetIds.length === 1
                    ? t.bulkApplyUnlockedOfferSingular || 'Apply changes to 1 other unlocked transaction?'
                    : (t.bulkApplyUnlockedOffer || 'Apply changes to {count} other unlocked transactions?').replace(
                        '{count}',
                        String(bulkApplyOffer.unlockedTargetIds.length),
                      )
                  : (t.bulkApplyOffer || 'Apply this change to {count} other identical transaction(s)?').replace(
                      '{count}',
                      String(bulkApplyOffer.identicalTargetIds.length),
                    )}
              </span>
            </div>
            <div className={styles['bulk-apply-actions']}>
              {bulkApplyOffer.unlockedTargetIds.length > 0 ? (
                <button
                  type="button"
                  className={styles['bulk-apply-btn']}
                  onClick={handleApplyToAllUnlocked}
                  data-testid="apply-to-all-unlocked-btn"
                  title={t.applyToAllUnlocked || 'Apply to all unlocked'}
                  aria-label={t.applyToAllUnlocked || 'Apply to all unlocked'}
                >
                  <Check size={14} aria-hidden="true" />
                  <span>{t.applyToAllUnlocked || 'Apply to all unlocked'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className={styles['bulk-apply-btn']}
                  onClick={handleConfirmBulkApply}
                  data-testid="apply-bulk-changes-btn"
                  title={t.applyToAll || 'Apply to all'}
                  aria-label={t.applyToAll || 'Apply to all'}
                >
                  <Check size={14} aria-hidden="true" />
                  <span>{t.applyToAll || 'Apply to all'}</span>
                </button>
              )}
              <button
                type="button"
                className={styles['bulk-adjust-btn']}
                onClick={handleOpenAdjustModal}
                data-testid="adjust-unlocked-bulk-btn"
                title={t.adjustUnlockedOptions || 'Adjust in bulk...'}
                aria-label={t.adjustUnlockedOptions || 'Adjust in bulk...'}
              >
                <Sliders size={13} aria-hidden="true" />
                <span>{t.adjustUnlockedOptions || 'Adjust in bulk...'}</span>
              </button>
              {modifiedTransactions.length > 1 && (
                <button
                  type="button"
                  className={styles['bulk-reset-all-btn']}
                  onClick={() => setPendingResetTxId(bulkApplyOffer.sourceTxId)}
                  data-testid="bulk-reset-all-banner-btn"
                  title={t.resetAllModified || 'Reset all modified transactions'}
                  aria-label={(t.resetAllModifiedCount || 'Reset all ({count}) in bulk').replace(
                    '{count}',
                    String(modifiedTransactions.length),
                  )}
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  <span>
                    {(t.resetAllModifiedCount || 'Reset all ({count}) in bulk').replace(
                      '{count}',
                      String(modifiedTransactions.length),
                    )}
                  </span>
                </button>
              )}
              <button
                type="button"
                className={styles['bulk-apply-dismiss-btn']}
                onClick={() => setBulkApplyOffer(null)}
                aria-label={t.dismiss || 'Dismiss'}
                title={t.dismiss || 'Dismiss'}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

      {/* Modern Filter & Search Toolbar */}
      <TransactionPreviewToolbar
        hasMultipleTransactions={hasMultipleTransactions}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        sortConfig={sortConfig}
        handleSortChange={handleSortChange}
        sortOptions={sortOptions}
        isFilterActive={effectiveIsFilterActive}
        handleClearFilters={handleClearAllFilters}
        initialFilter={initialFilter}
        scopeFilter={scopeFilter}
        onScopeFilterChange={handleScopeFilterChange}
        unlockedCount={effectiveUnlockedIds.size}
        hasDuplicates={hasDuplicates}
        duplicateCount={duplicateCount}
        alreadyDuplicatedCount={alreadyDuplicatedCount}
        modifiedCount={modifiedDuplicateCount}
        excludedCount={excludedCount}
        spaceTransferCount={spaceTransferCount}
        internalTransferCount={internalTransferCount}
        isImport={isImportMode}
        t={t}
      />

      {/* Account Filter Bar for Cross-Account Transfers */}
      {hasMultipleAccounts &&
        (scopeFilter === 'excluded' ||
          scopeFilter === 'internal-transfers' ||
          scopeFilter === 'all') && (
          <div className={styles['account-filter-bar']} data-testid="account-filter-bar">
            <div className={styles['account-filter-label']}>
              <Landmark size={14} aria-hidden="true" />
              <span>{t.filterByAccount || 'Account:'}</span>
            </div>
            <div className={styles['account-filter-pills']}>
              <button
                type="button"
                className={`${styles['account-pill']} ${
                  accountFilter === 'all' ? styles['account-pill-active'] : ''
                }`}
                onClick={() => setAccountFilter('all')}
                aria-pressed={accountFilter === 'all'}
                data-testid="account-filter-pill-all"
                title={t.allAccounts || 'All Accounts'}
              >
                <span>{t.allAccounts || 'All Accounts'}</span>
                <span className={styles['account-pill-badge']}>{accountCounts.all ?? 0}</span>
              </button>

              <button
                type="button"
                className={`${styles['account-pill']} ${
                  accountFilter === 'current' || accountFilter === currentAccountName
                    ? styles['account-pill-active']
                    : ''
                }`}
                onClick={() => setAccountFilter('current')}
                aria-pressed={
                  accountFilter === 'current' || accountFilter === currentAccountName
                }
                data-testid="account-filter-pill-current"
                title={currentAccountName}
              >
                {currentInstLogo ? (
                  <img
                    src={currentInstLogo}
                    alt=""
                    className={styles['account-pill-logo']}
                    aria-hidden="true"
                    data-testid="account-pill-logo-current"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <Landmark size={13} className={styles['account-pill-icon']} aria-hidden="true" />
                )}
                <span className={styles['account-pill-name']}>{currentAccountName}</span>
                <span className={styles['account-pill-badge']}>
                  {accountCounts.current ?? 0}
                </span>
              </button>

              {existingInstitutions.map((inst) => {
                const instLogo = findInstitution(inst)?.logo
                const instTestIdKey = inst.toLowerCase().replace(/\s+/g, '-')
                return (
                  <button
                    key={inst}
                    type="button"
                    className={`${styles['account-pill']} ${
                      accountFilter === inst ? styles['account-pill-active'] : ''
                    }`}
                    onClick={() => setAccountFilter(inst)}
                    aria-pressed={accountFilter === inst}
                    data-testid={`account-filter-pill-${instTestIdKey}`}
                    title={inst}
                  >
                    {instLogo ? (
                      <img
                        src={instLogo}
                        alt=""
                        className={styles['account-pill-logo']}
                        aria-hidden="true"
                        data-testid={`account-pill-logo-${instTestIdKey}`}
                        onError={(e) => {
                          ;(e.currentTarget as HTMLElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <Landmark size={13} className={styles['account-pill-icon']} aria-hidden="true" />
                    )}
                    <span className={styles['account-pill-name']}>{inst}</span>
                    <span className={styles['account-pill-badge']}>
                      {accountCounts[inst] ?? 0}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

      {/* Sub-account Filter Bar for Sub-account Transfers */}
      {scopeFilter === 'space-transfers' && subAccounts.length > 1 && (
        <div className={styles['subaccount-filter-bar']} data-testid="subaccount-filter-bar">
          <div className={styles['subaccount-filter-label']}>
            <Layers size={14} aria-hidden="true" />
            <span>{t.filterBySubAccount || 'Sub-account:'}</span>
          </div>
          <div className={styles['subaccount-filter-pills']}>
            <button
              type="button"
              className={`${styles['subaccount-pill']} ${
                subAccountFilter === 'all' ? styles['subaccount-pill-active'] : ''
              }`}
              onClick={() => setSubAccountFilter('all')}
              aria-pressed={subAccountFilter === 'all'}
              data-testid="subaccount-filter-pill-all"
              title={t.allSubAccounts || 'All Sub-accounts'}
            >
              <span>{t.allSubAccounts || 'All Sub-accounts'}</span>
              <span className={styles['subaccount-pill-badge']}>{subAccountCounts.all ?? 0}</span>
            </button>

            {subAccounts.map((sa) => (
              <button
                key={sa}
                type="button"
                className={`${styles['subaccount-pill']} ${
                  subAccountFilter === sa ? styles['subaccount-pill-active'] : ''
                }`}
                onClick={() => setSubAccountFilter(sa)}
                aria-pressed={subAccountFilter === sa}
                data-testid={`subaccount-filter-pill-${sa.toLowerCase().replace(/\s+/g, '-')}`}
                title={sa}
              >
                <span className={styles['subaccount-pill-name']}>{sa}</span>
                <span className={styles['subaccount-pill-badge']}>
                  {subAccountCounts[sa] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className={styles['table-container']}>
        {scopeFilter === 'excluded' && (
          <div className={styles['excluded-items-notice']} data-testid="excluded-items-notice">
            <Ban size={15} aria-hidden="true" />
            <span>
              {accountFilter === 'current' || accountFilter === currentAccountName
                ? (
                    t.excludedItemsCurrentNotice ||
                    'These items from {account} are excluded from import.'
                  ).replace('{account}', currentAccountName)
                : accountFilter !== 'all'
                  ? (
                      t.excludedItemsExistingNotice ||
                      'These already imported items from {account} will now be excluded from calculations.'
                    ).replace('{account}', accountFilter)
                  : t.excludedItemsNotice ||
                    'These items are excluded from import or calculations (sub-account transfers, internal transfers, and duplicates).'}
            </span>
          </div>
        )}
        {scopeFilter === 'already-duplicated' && (
          <div
            className={styles['already-duplicated-notice']}
            data-testid="already-duplicated-notice"
          >
            <Lock size={15} aria-hidden="true" />
            <span>
              {t.alreadyDuplicatedFilterNotice ||
                'These duplicate transactions were already imported previously and cannot be modified or unlocked again.'}
            </span>
          </div>
        )}
        {scopeFilter === 'space-transfers' && (
          <div className={styles['space-transfers-notice']} data-testid="space-transfers-notice">
            <Layers size={15} aria-hidden="true" />
            <span>
              {subAccountFilter !== 'all'
                ? (
                    t.spaceTransfersExcludedForSubAccountNotice ||
                    'Sub-account transfers for {subAccount} are automatically excluded to prevent double counting.'
                  ).replace('{subAccount}', subAccountFilter)
                : t.spaceTransfersExcludedNotice ||
                  'Sub-account transfers are automatically excluded to prevent double counting.'}
            </span>
          </div>
        )}

        {scopeFilter === 'internal-transfers' && (
          <div className={styles['internal-transfers-notice']} data-testid="internal-transfers-notice">
            <Ghost size={15} aria-hidden="true" />
            <span>
              {accountFilter === 'current' || accountFilter === currentAccountName
                ? (
                    t.internalTransfersCurrentAccountNotice ||
                    'These internal transfers from {account} are excluded from income and expenses and hidden from the transaction list.'
                  ).replace('{account}', currentAccountName)
                : accountFilter !== 'all'
                  ? (
                      t.internalTransfersExistingAccountNotice ||
                      'These internal transfers from {account} were already imported and will now also be excluded from income and expenses and hidden from the transaction list.'
                    ).replace('{account}', accountFilter)
                  : existingAccountTransfers && existingAccountTransfers.length > 0
                    ? (
                        t.internalTransfersWithExistingNotice ||
                        'These transactions are internal transfers between your own accounts. {existingCount} already imported transaction(s) will also be excluded from income/expenses and hidden from the transaction list.'
                      ).replace('{existingCount}', String(existingAccountTransfers.length))
                    : t.internalTransfersNotice ||
                      'These transactions are internal transfers between your own accounts. They are excluded from income and expenses and hidden from standard views.'}
            </span>
          </div>
        )}

        <div className={styles['table-header']}>
          <div
            className={`${styles['col-main']} ${
              !hasMultipleTransactions ? styles['col-header-static'] : ''
            }`}
            onClick={hasMultipleTransactions ? () => handleSort('description') : undefined}
            title={t.description}
          >
            <span>{t.description}</span>
            {hasMultipleTransactions && renderSortIcon('description')}
          </div>

          <div
            className={`${styles['col-date']} ${
              !hasMultipleTransactions ? styles['col-header-static'] : ''
            }`}
            onClick={hasMultipleTransactions ? () => handleSort('date') : undefined}
            title={t.date}
          >
            <span>{t.date}</span>
            {hasMultipleTransactions && renderSortIcon('date')}
          </div>

          <div
            className={`${styles['col-amount']} ${
              !hasMultipleTransactions ? styles['col-header-static'] : ''
            }`}
            onClick={hasMultipleTransactions ? () => handleSort('amount') : undefined}
            title={t.amount}
          >
            <span>{t.amount}</span>
            {hasMultipleTransactions && renderSortIcon('amount')}
          </div>

          {hasActions && <div className={styles['col-actions']} />}
        </div>

        {filteredAndSortedTransactions.length === 0 ? (
          <div className={styles['empty-state']}>
            <Search size={32} className={styles['empty-icon']} />
            <p className={styles['empty-text']}>
              {transactions.length === 0 && (excludedSpaceTransactions || []).length === 0
                ? t.noTransactionsLeft
                : t.noTransactionsMatch}
            </p>
            {effectiveIsFilterActive && (
              <button
                className={styles['clear-filters-btn']}
                onClick={handleClearAllFilters}
                title={t.clearFilters || 'Clear filters'}
              >
                <RotateCcw size={13} />
                <span>{t.clearFilters || 'Clear filters'}</span>
              </button>
            )}
          </div>
        ) : (
          (() => {
            const maxH = Math.min(typeof window !== 'undefined' ? window.innerHeight * 0.52 : 520, 520)
            const totalH = filteredAndSortedTransactions.length * ROW_HEIGHT
            const isScrollable = totalH > maxH
            const listHeight = isScrollable ? maxH : totalH

            return (
              <Virtuoso
                className={`${styles['virtuoso-list']} ${
                  !isScrollable ? styles['virtuoso-no-scroll'] : ''
                }`}
                style={{ height: listHeight }}
                totalCount={filteredAndSortedTransactions.length}
                data={filteredAndSortedTransactions}
                itemContent={rowContent}
              />
            )
          })()
        )}
      </div>

      <UnlockDuplicateModal
        isOpen={Boolean(unlockedTxToWarn)}
        transaction={unlockedTxToWarn}
        sameDuplicateCount={sameLockedDuplicates.length > 1 ? sameLockedDuplicates.length : undefined}
        onClose={() => setUnlockedTxToWarn(null)}
        onConfirmUnlock={handleConfirmUnlockDuplicate}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />

      {/* Bulk Adjust Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={t.adjustUnlockedModalTitle || 'Adjust Unlocked Transactions in Bulk'}
        maxWidth="580px"
        footer={
          <div className={styles['adjust-modal-footer']}>
            <button
              type="button"
              className={styles['adjust-cancel-btn']}
              onClick={() => setIsAdjustModalOpen(false)}
            >
              {t.cancel || 'Cancel'}
            </button>
            <button
              type="button"
              className={styles['adjust-confirm-btn']}
              onClick={handleConfirmCustomAdjust}
              disabled={
                selectedTargetIds.size === 0 ||
                (!selectedFieldsToApply.description &&
                  !selectedFieldsToApply.date &&
                  !selectedFieldsToApply.amount)
              }
              data-testid="confirm-custom-adjust-btn"
            >
              <Check size={14} aria-hidden="true" />
              <span>
                {(t.applyToSelectedCount || 'Apply to {count} selected').replace(
                  '{count}',
                  String(selectedTargetIds.size),
                )}
              </span>
            </button>
          </div>
        }
      >
        {bulkApplyOffer && (() => {
          const allTargetIds = [
            ...bulkApplyOffer.unlockedTargetIds,
            ...bulkApplyOffer.identicalTargetIds,
          ]
          const targetTxs = activeTransactions.filter((t) => allTargetIds.includes(t.id))
          const allSelected = targetTxs.length > 0 && selectedTargetIds.size === targetTxs.length

          const handleToggleSelectAll = () => {
            if (allSelected) {
              setSelectedTargetIds(new Set())
            } else {
              setSelectedTargetIds(new Set(targetTxs.map((t) => t.id)))
            }
          }

          const handleToggleTarget = (txId: string) => {
            setSelectedTargetIds((prev) => {
              const next = new Set(prev)
              if (next.has(txId)) next.delete(txId)
              else next.add(txId)
              return next
            })
          }

          return (
            <div className={styles['adjust-modal-body']}>
              <div className={styles['adjust-section']}>
                <span className={styles['adjust-section-title']}>
                  {t.applyFieldsLabel || 'Modifications to apply'}
                </span>
                <div className={styles['adjust-fields-grid']}>
                  {bulkApplyOffer.updates.description !== undefined && (
                    <label
                      className={`${styles['adjust-field-card']} ${
                        selectedFieldsToApply.description ? styles['adjust-field-card-active'] : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        className={styles['adjust-field-checkbox']}
                        checked={selectedFieldsToApply.description}
                        data-testid="adjust-field-checkbox-description"
                        onChange={(e) =>
                          setSelectedFieldsToApply((prev) => ({
                            ...prev,
                            description: e.target.checked,
                          }))
                        }
                      />
                      <div className={styles['adjust-field-info']}>
                        <span className={styles['adjust-field-name']}>{t.description || 'Description'}</span>
                        <span className={styles['adjust-field-val']}>
                          {bulkApplyOffer.updates.description}
                        </span>
                      </div>
                    </label>
                  )}

                  {bulkApplyOffer.updates.date !== undefined && (
                    <label
                      className={`${styles['adjust-field-card']} ${
                        selectedFieldsToApply.date ? styles['adjust-field-card-active'] : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        className={styles['adjust-field-checkbox']}
                        checked={selectedFieldsToApply.date}
                        data-testid="adjust-field-checkbox-date"
                        onChange={(e) =>
                          setSelectedFieldsToApply((prev) => ({
                            ...prev,
                            date: e.target.checked,
                          }))
                        }
                      />
                      <div className={styles['adjust-field-info']}>
                        <span className={styles['adjust-field-name']}>{t.date || 'Date'}</span>
                        <span className={styles['adjust-field-val']}>
                          {formatDate(bulkApplyOffer.updates.date)}
                        </span>
                      </div>
                    </label>
                  )}

                  {bulkApplyOffer.updates.amount !== undefined && (
                    <label
                      className={`${styles['adjust-field-card']} ${
                        selectedFieldsToApply.amount ? styles['adjust-field-card-active'] : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        className={styles['adjust-field-checkbox']}
                        checked={selectedFieldsToApply.amount}
                        data-testid="adjust-field-checkbox-amount"
                        onChange={(e) =>
                          setSelectedFieldsToApply((prev) => ({
                            ...prev,
                            amount: e.target.checked,
                          }))
                        }
                      />
                      <div className={styles['adjust-field-info']}>
                        <span className={styles['adjust-field-name']}>{t.amount || 'Amount'}</span>
                        <span className={styles['adjust-field-val']}>
                          {formatCurrency(bulkApplyOffer.updates.amount)}
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div className={styles['adjust-section']}>
                <div className={styles['adjust-section-header']}>
                  <span className={styles['adjust-section-title']}>
                    {t.targetTransactionsLabel || 'Target transactions'} ({selectedTargetIds.size}/{targetTxs.length})
                  </span>
                  <button
                    type="button"
                    className={`${styles['adjust-select-all-btn']} ${
                      !allSelected ? styles['adjust-select-all-btn-orange'] : ''
                    }`}
                    onClick={handleToggleSelectAll}
                    data-testid="adjust-select-all-btn"
                  >
                    {allSelected ? t.deselectAll || 'Deselect all' : t.selectAll || 'Select all'}
                  </button>
                </div>

                <div className={styles['adjust-tx-list']}>
                  {targetTxs.map((target) => {
                    const isTargetSelected = selectedTargetIds.has(target.id)
                    return (
                      <label
                        key={target.id}
                        className={`${styles['adjust-tx-item']} ${
                          isTargetSelected ? styles['adjust-tx-item-active'] : ''
                        }`}
                        data-testid={`adjust-target-item-${target.id}`}
                      >
                        <input
                          type="checkbox"
                          className={styles['adjust-tx-checkbox']}
                          checked={isTargetSelected}
                          data-testid={`adjust-target-checkbox-${target.id}`}
                          onChange={() => handleToggleTarget(target.id)}
                        />
                        <div className={styles['adjust-tx-content']}>
                          <div className={styles['adjust-tx-main']}>
                            <span className={styles['adjust-tx-desc']} title={target.description}>
                              {target.description}
                            </span>
                            <span className={styles['adjust-tx-date']}>
                              {formatDate(target.date)}
                            </span>
                          </div>
                          <div className={styles['adjust-tx-right']}>
                            <span className={styles['adjust-tx-amount']}>
                              {formatCurrency(target.amount)}
                            </span>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={Boolean(pendingResetTxId)}
        onClose={() => setPendingResetTxId(null)}
        title={t.resetTransactionModalTitle || 'Reset Transactions'}
        maxWidth="540px"
        footer={
          <div className={styles['reset-modal-footer']}>
            <button
              type="button"
              className={`${styles['reset-dialog-btn']} ${styles['reset-cancel-btn']}`}
              onClick={() => setPendingResetTxId(null)}
              data-testid="cancel-reset-modal-btn"
            >
              {t.cancel || 'Cancel'}
            </button>
            <button
              type="button"
              className={`${styles['reset-dialog-btn']} ${styles['reset-single-btn']}`}
              onClick={() => {
                if (pendingResetTxId) {
                  executeResetTransaction(pendingResetTxId, alsoLockAsDuplicate)
                }
                setPendingResetTxId(null)
              }}
              data-testid="confirm-reset-single-btn"
            >
              {alsoLockAsDuplicate && (pendingResetTxId ? effectiveUnlockedIds.has(pendingResetTxId) : false)
                ? t.resetAndLockSingle || 'Reset and lock'
                : modifiedTransactions.length > 1
                ? t.resetOnlyThis || 'Reset only this'
                : t.resetToOriginal || 'Reset'}
            </button>
            {modifiedTransactions.length > 1 && (
              <button
                type="button"
                className={`${styles['reset-dialog-btn']} ${styles['reset-all-btn']}`}
                onClick={() => {
                  executeResetAllModified(alsoLockAsDuplicate)
                  setPendingResetTxId(null)
                }}
                data-testid="confirm-reset-all-btn"
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>
                  {alsoLockAsDuplicate && modifiedTransactions.some((t) => effectiveUnlockedIds.has(t.id))
                    ? (t.resetAndLockBulkCount || 'Reset and lock all ({count})').replace(
                        '{count}',
                        String(modifiedTransactions.length),
                      )
                    : (t.resetAllModifiedCount || 'Reset all ({count}) in bulk').replace(
                        '{count}',
                        String(modifiedTransactions.length),
                      )}
                </span>
              </button>
            )}
          </div>
        }
      >
        {pendingResetTxId && (() => {
          const targetTx = activeTransactions.find((t) => t.id === pendingResetTxId)
          const isTargetUnlockedDuplicate = effectiveUnlockedIds.has(pendingResetTxId)
          const hasAnyUnlockedDuplicates = modifiedTransactions.some((t) =>
            effectiveUnlockedIds.has(t.id),
          )
          const showLockCheckbox = isTargetUnlockedDuplicate || hasAnyUnlockedDuplicates

          return (
            <div className={styles['reset-modal-body']}>
              <div className={styles['reset-modal-icon-wrap']}>
                <RotateCcw size={22} aria-hidden="true" />
              </div>
              <div className={styles['reset-modal-text']}>
                <p className={styles['reset-modal-message']}>
                  {modifiedTransactions.length > 1
                    ? (
                        t.resetBulkPrompt ||
                        'You have modified {count} transactions. Would you like to reset only this transaction or reset all modified transactions in bulk back to their original values?'
                      ).replace('{count}', String(modifiedTransactions.length))
                    : t.resetSinglePrompt ||
                      'Are you sure you want to reset this transaction back to its original values?'}
                </p>
                {targetTx && (
                  <div className={styles['reset-modal-tx-preview']}>
                    <span className={styles['reset-modal-tx-desc']} title={targetTx.description}>
                      {targetTx.description}
                    </span>
                    <span className={styles['reset-modal-tx-amount']}>
                      {formatCurrency(targetTx.amount)}
                    </span>
                  </div>
                )}
                {showLockCheckbox && (
                  <label
                    className={styles['reset-lock-checkbox-label']}
                    data-testid="reset-also-lock-checkbox-label"
                  >
                    <input
                      type="checkbox"
                      className={styles['reset-lock-checkbox']}
                      checked={alsoLockAsDuplicate}
                      onChange={(e) => setAlsoLockAsDuplicate(e.target.checked)}
                      data-testid="reset-also-lock-checkbox"
                    />
                    <Lock size={14} className={styles['reset-lock-icon']} aria-hidden="true" />
                    <span className={styles['reset-lock-checkbox-text']}>
                      {t.alsoLockAsDuplicate || 'Also lock as duplicate'}
                    </span>
                  </label>
                )}
              </div>
            </div>
          )
        })()}
      </Modal>
    </Modal>
  )
}
