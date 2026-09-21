import React, { useEffect, useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  CopyCheck,
  Ghost,
  Layers,
  Lock,
  Plus,
  RotateCcw,
  Search,
  Sliders,
  X,
} from 'lucide-react'

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
import { usePreviewTransactionsFilter } from './usePreviewTransactionsFilter'

import styles from './TransactionPreviewModal.module.css'

export interface TransactionPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction[]
  duplicateIds?: Set<string>
  unlockedDuplicateIds?: Set<string>
  internalTransferIds?: Set<string>
  discardedSpaceCount?: number
  excludedSpaceTransactions?: Transaction[]
  initialFilter?: ScopeFilter
  onRemoveTransaction?: (id: string) => void
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void
  onIncludeSpaceTransaction?: (tx: Transaction) => void
  onExcludeSpaceTransaction?: (tx: Transaction) => void
  onIncludeAllSpaceTransactions?: () => void
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
  duplicateIds = new Set(),
  unlockedDuplicateIds,
  internalTransferIds = new Set(),
  discardedSpaceCount = 0,
  excludedSpaceTransactions,
  initialFilter = 'all',
  onRemoveTransaction,
  onUpdateTransaction,
  onIncludeSpaceTransaction,
  onExcludeSpaceTransaction,
  onIncludeAllSpaceTransactions,
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
        unlockedDuplicateIds !== undefined ||
        onIncludeSpaceTransaction ||
        onExcludeSpaceTransaction,
    )
  const t = useLanguageStore((s) => s.t)
  const locale = useLanguageStore((s) => s.locale)
  const customCategories = useAppStore((s) => s.customCategories)
  const { formatCurrency, formatDate, formatTransactionCount } = useFormatters()

  const ROW_HEIGHT = 64 // Standardized row height for Virtuoso virtualization

  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>(initialFilter)
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions)
  const [localExcludedSpaceTransactions, setLocalExcludedSpaceTransactions] = useState<
    Transaction[]
  >(excludedSpaceTransactions || [])
  const [manuallyIncludedIds, setManuallyIncludedIds] = useState<Set<string>>(new Set())
  const [localUnlockedDuplicateIds, setLocalUnlockedDuplicateIds] = useState<Set<string>>(new Set())
  const [unlockedTxToWarn, setUnlockedTxToWarn] = useState<Transaction | null>(null)
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

  useEffect(() => {
    setLocalExcludedSpaceTransactions(excludedSpaceTransactions || [])
  }, [excludedSpaceTransactions])

  const effectiveUnlockedIds = useMemo(() => {
    if (unlockedDuplicateIds) {
      return new Set([...unlockedDuplicateIds, ...localUnlockedDuplicateIds])
    }
    return localUnlockedDuplicateIds
  }, [unlockedDuplicateIds, localUnlockedDuplicateIds])

  const activeTransactions = useMemo(
    () => (onIncludeSpaceTransaction ? transactions : localTransactions),
    [onIncludeSpaceTransaction, transactions, localTransactions],
  )

  const activeExcluded = useMemo(
    () => (onIncludeSpaceTransaction ? excludedSpaceTransactions : localExcludedSpaceTransactions) ?? [],
    [onIncludeSpaceTransaction, excludedSpaceTransactions, localExcludedSpaceTransactions],
  )

  const modifiedTransactions = useMemo(() => {
    return activeTransactions.filter((tx) => getIsModified(tx))
  }, [activeTransactions, getIsModified])

  const executeResetTransaction = (id: string, alsoLock: boolean = false) => {
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
        .filter((tx) => effectiveUnlockedIds.has(tx.id))
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
        if (other.id === txId || effectiveUnlockedIds.has(other.id)) return false
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
    [activeTransactions, effectiveUnlockedIds],
  )

  useEffect(() => {
    if (isOpen) {
      setScopeFilter(initialFilter)
      setManuallyIncludedIds(new Set())
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
      (txId) => bulkApplyOffer.identicalTargetIds.includes(txId) || !effectiveUnlockedIds.has(txId),
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
      const otherOrig = initialTransactionsRef.current.get(other.id) || other
      return (
        otherOrig.description.trim().toLowerCase() === origDesc &&
        Math.abs(otherOrig.amount - origAmt) < 0.005
      )
    })
  }, [unlockedTxToWarn, activeTransactions, effectiveUnlockedIds, duplicateIds])

  const handleConfirmUnlockDuplicate = (
    tx: Transaction,
    rememberRule?: boolean,
    unlockAllIdentical?: boolean,
  ) => {
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

  const handleToggleSpaceTransferInclude = (tx: Transaction) => {
    if (manuallyIncludedIds.has(tx.id)) {
      if (onExcludeSpaceTransaction) {
        onExcludeSpaceTransaction(tx)
      } else {
        setLocalTransactions((prev) => prev.filter((t) => t.id !== tx.id))
        setLocalExcludedSpaceTransactions((prev) => [...prev, tx])
      }
      setManuallyIncludedIds((prev) => {
        const next = new Set(prev)
        next.delete(tx.id)
        return next
      })
    } else {
      if (onIncludeSpaceTransaction) {
        onIncludeSpaceTransaction(tx)
      } else {
        setLocalExcludedSpaceTransactions((prev) => prev.filter((t) => t.id !== tx.id))
        setLocalTransactions((prev) => [...prev, tx])
      }
      setManuallyIncludedIds((prev) => new Set(prev).add(tx.id))
    }
  }

  const handleIncludeAllSpaceTransfers = () => {
    if (onIncludeAllSpaceTransactions) {
      onIncludeAllSpaceTransactions()
    } else {
      setLocalTransactions((prev) => [...prev, ...localExcludedSpaceTransactions])
      setLocalExcludedSpaceTransactions([])
    }
    const newlyIncluded = new Set(manuallyIncludedIds)
    activeExcluded.forEach((tx) => newlyIncluded.add(tx.id))
    setManuallyIncludedIds(newlyIncluded)
  }

  const spaceTransferIds = useMemo(() => {
    return new Set(activeExcluded.map((tx) => tx.id))
  }, [activeExcluded])

  const hasSpaceTransfers = Boolean(
    activeExcluded.length > 0 || manuallyIncludedIds.size > 0 || discardedSpaceCount > 0,
  )

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

  const hasDuplicates = duplicateCount > 0 || duplicateIds.size > 0

  const scopedTransactions = useMemo(() => {
    if (scopeFilter === 'unlocked') {
      return activeTransactions.filter((tx) => effectiveUnlockedIds.has(tx.id))
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
    if (scopeFilter === 'space-transfers') return activeExcluded
    if (scopeFilter === 'internal-transfers') {
      return activeTransactions.filter(
        (tx) =>
          !duplicateIds.has(tx.id) &&
          !effectiveUnlockedIds.has(tx.id) &&
          (tx.isGhost || internalTransferIds.has(tx.id)),
      )
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
    combinedTransactions,
    internalTransferIds,
    duplicateIds,
    effectiveUnlockedIds,
    getIsModified,
  ])

  const hasMultipleTransactions = combinedTransactions.length > 1

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

  const effectiveIsFilterActive = isFilterActive || scopeFilter !== initialFilter

  const handleClearAllFilters = () => {
    handleClearFilters()
    if (scopeFilter !== initialFilter) {
      setScopeFilter(initialFilter)
    }
  }

  const renderSortIcon = (key: SortColumn) => {
    if (sortConfig?.key !== key) return <ArrowUpDown size={14} className={styles['sort-icon']} />
    const Icon = sortConfig.direction === 'asc' ? ArrowUp : ArrowDown
    return <Icon size={14} className={`${styles['sort-icon']} ${styles['sort-icon-active']}`} />
  }

  const effectiveTitle = title ?? t.transactions

  const hasActions = Boolean(
    onRemoveTransaction ||
      hasSpaceTransfers ||
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
    const isTxModified = getIsModified(tx) || Boolean(tx.isModified)
    return (
      <TransactionPreviewRow
        key={tx.id}
        index={index}
        tx={tx}
        isDuplicate={isTxDuplicate}
        isUnlockedDuplicate={isTxUnlockedDuplicate}
        isModified={isTxModified}
        hideDuplicateBadge={false}
        isInternalTransfer={!isTxDuplicate && (tx.isGhost || internalTransferIds.has(tx.id))}
        isSpaceTransfer={!isTxDuplicate && spaceTransferIds.has(tx.id)}
        isManuallyIncludedSpaceTransfer={!isTxDuplicate && manuallyIncludedIds.has(tx.id)}
        showInstitution={showInstitution}
        customCategories={customCategories}
        t={t}
        locale={locale}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        onUpdateTransaction={handleUpdateTransaction}
        onRemoveTransaction={onRemoveTransaction}
        onResetTransaction={handleResetTransaction}
        onToggleSpaceTransferInclude={handleToggleSpaceTransferInclude}
        onUnlockDuplicate={onUnlockDuplicateTransaction ? handleRequestUnlockDuplicate : undefined}
        onRelockDuplicate={onRelockDuplicateTransaction ? handleRelockDuplicate : undefined}
        hasActions={hasActions}
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
      {duplicateIds.size > effectiveUnlockedIds.size && scopeFilter !== 'duplicates' && (
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
        scopeFilter={scopeFilter}
        onScopeFilterChange={setScopeFilter}
        unlockedCount={effectiveUnlockedIds.size}
        hasDuplicates={hasDuplicates}
        duplicateCount={duplicateCount}
        modifiedCount={modifiedDuplicateCount}
        isImport={isImportMode}
        t={t}
      />

      {/* Transactions Table */}
      <div className={styles['table-container']}>
        {scopeFilter === 'space-transfers' && (
          <div className={styles['space-transfers-notice']} data-testid="space-transfers-notice">
            <Layers size={15} aria-hidden="true" />
            <span>
              {t.spaceTransfersExcludedNotice ||
                'These transactions were automatically excluded to prevent double counting and will not be imported.'}
            </span>
            {activeExcluded.length > 0 && (
              <button
                type="button"
                className={styles['include-all-btn']}
                onClick={handleIncludeAllSpaceTransfers}
                data-testid="include-all-space-transfers-btn"
              >
                <Plus size={13} aria-hidden="true" />
                <span>{t.includeAllInImport || 'Include all in import'}</span>
              </button>
            )}
          </div>
        )}

        {scopeFilter === 'internal-transfers' && (
          <div className={styles['internal-transfers-notice']} data-testid="internal-transfers-notice">
            <Ghost size={15} aria-hidden="true" />
            <span>
              {t.internalTransfersNotice ||
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
