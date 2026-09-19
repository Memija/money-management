import React, { useEffect, useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Ghost,
  Layers,
  Plus,
  RotateCcw,
  Search,
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
  onUnlockDuplicateTransaction?: (tx: Transaction) => void
  onRelockDuplicateTransaction?: (tx: Transaction) => void
  title?: string
  variant?: 'income' | 'expense'
  showInstitution?: boolean
}

export const TransactionPreviewModal: React.FC<TransactionPreviewModalProps> = ({
  isOpen,
  onClose,
  transactions,
  duplicateIds = new Set(),
  unlockedDuplicateIds,
  internalTransferIds = new Set(),
  discardedSpaceCount = 0,
  excludedSpaceTransactions = [],
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
}) => {
  const t = useLanguageStore((s) => s.t)
  const locale = useLanguageStore((s) => s.locale)
  const customCategories = useAppStore((s) => s.customCategories)
  const { formatCurrency, formatDate, formatTransactionCount } = useFormatters()

  const ROW_HEIGHT = 64 // Standardized row height for Virtuoso virtualization

  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>(initialFilter)
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions)
  const [localExcludedSpaceTransactions, setLocalExcludedSpaceTransactions] = useState<Transaction[]>(
    excludedSpaceTransactions || [],
  )
  const [manuallyIncludedIds, setManuallyIncludedIds] = useState<Set<string>>(new Set())
  const [localUnlockedDuplicateIds, setLocalUnlockedDuplicateIds] = useState<Set<string>>(new Set())
  const [unlockedTxToWarn, setUnlockedTxToWarn] = useState<Transaction | null>(null)

  useEffect(() => {
    setLocalTransactions(transactions)
  }, [transactions])

  useEffect(() => {
    setLocalExcludedSpaceTransactions(excludedSpaceTransactions || [])
  }, [excludedSpaceTransactions])

  useEffect(() => {
    if (isOpen) {
      setScopeFilter(initialFilter)
      setManuallyIncludedIds(new Set())
      setLocalUnlockedDuplicateIds(new Set())
      setUnlockedTxToWarn(null)
    }
  }, [isOpen, initialFilter])

  const effectiveUnlockedIds = useMemo(() => {
    if (unlockedDuplicateIds) {
      return new Set([...unlockedDuplicateIds, ...localUnlockedDuplicateIds])
    }
    return localUnlockedDuplicateIds
  }, [unlockedDuplicateIds, localUnlockedDuplicateIds])

  const handleRequestUnlockDuplicate = (tx: Transaction) => {
    setUnlockedTxToWarn(tx)
  }

  const handleConfirmUnlockDuplicate = (tx: Transaction) => {
    setLocalUnlockedDuplicateIds((prev) => new Set(prev).add(tx.id))
    onUnlockDuplicateTransaction?.(tx)
  }

  const handleRelockDuplicate = (tx: Transaction) => {
    setLocalUnlockedDuplicateIds((prev) => {
      const next = new Set(prev)
      next.delete(tx.id)
      return next
    })
    onRelockDuplicateTransaction?.(tx)
  }

  const activeTransactions = onIncludeSpaceTransaction ? transactions : localTransactions
  const activeExcluded = onIncludeSpaceTransaction
    ? excludedSpaceTransactions
    : localExcludedSpaceTransactions

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

  const scopedTransactions = useMemo(() => {
    if (scopeFilter === 'duplicates') {
      return activeTransactions.filter((tx) => duplicateIds.has(tx.id) || effectiveUnlockedIds.has(tx.id))
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
    internalTransferIds,
    spaceTransferIds,
    formatCurrency,
    t,
  })

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
      onRelockDuplicateTransaction,
  )

  const rowContent = (index: number, tx: Transaction) => {
    const isTxUnlockedDuplicate = effectiveUnlockedIds.has(tx.id)
    const isTxDuplicate = duplicateIds.has(tx.id) || isTxUnlockedDuplicate
    return (
      <TransactionPreviewRow
        key={tx.id}
        index={index}
        tx={tx}
        isDuplicate={isTxDuplicate}
        isUnlockedDuplicate={isTxUnlockedDuplicate}
        hideDuplicateBadge={scopeFilter === 'duplicates'}
        isInternalTransfer={!isTxDuplicate && (tx.isGhost || internalTransferIds.has(tx.id))}
        isSpaceTransfer={!isTxDuplicate && spaceTransferIds.has(tx.id)}
        isManuallyIncludedSpaceTransfer={!isTxDuplicate && manuallyIncludedIds.has(tx.id)}
        showInstitution={showInstitution}
        customCategories={customCategories}
        t={t}
        locale={locale}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        onUpdateTransaction={onUpdateTransaction}
        onRemoveTransaction={onRemoveTransaction}
        onToggleSpaceTransferInclude={handleToggleSpaceTransferInclude}
        onUnlockDuplicate={handleRequestUnlockDuplicate}
        onRelockDuplicate={handleRelockDuplicate}
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
        isFilterActive={isFilterActive}
        handleClearFilters={handleClearFilters}
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
            {isFilterActive && (
              <button
                className={styles['clear-filters-btn']}
                onClick={handleClearFilters}
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
        onClose={() => setUnlockedTxToWarn(null)}
        onConfirmUnlock={handleConfirmUnlockDuplicate}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </Modal>
  )
}
