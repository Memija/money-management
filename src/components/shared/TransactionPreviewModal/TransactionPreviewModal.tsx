import React, { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Check } from 'lucide-react'

import { useFormatters } from '../../../hooks/useFormatters'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { Transaction } from '../../../types'
import { Modal } from '../Modal'
import { UnlockDuplicateModal } from '../UnlockDuplicateModal'
import { BulkAdjustModal } from './BulkAdjustModal'
import { BulkApplyBanner } from './BulkApplyBanner'
import { CrossAccountFilterBar } from './CrossAccountFilterBar'
import { ResetTransactionsModal } from './ResetTransactionsModal'
import { TransactionPreviewHeader } from './TransactionPreviewHeader'
import { TransactionPreviewTable } from './TransactionPreviewTable'
import { type ScopeFilter, TransactionPreviewToolbar } from './TransactionPreviewToolbar'
import { usePreviewDuplicateHandling } from './usePreviewDuplicateHandling'
import { usePreviewTransactionScoping } from './usePreviewTransactionScoping'
import { usePreviewTransactionsFilter } from './usePreviewTransactionsFilter'
import { useTransactionPreviewEditing } from './useTransactionPreviewEditing'

export type { ScopeFilter, SortColumn } from './TransactionPreviewToolbar'

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

const EMPTY_EXCLUDED_TRANSACTIONS: Transaction[] = []

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
  excludedSpaceTransactions = EMPTY_EXCLUDED_TRANSACTIONS,
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

  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>(initialFilter)
  const [accountFilter, setAccountFilter] = useState<string>(initialAccountFilter)
  const [subAccountFilter, setSubAccountFilter] = useState<string>('all')
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions)
  const [localUnlockedDuplicateIds, setLocalUnlockedDuplicateIds] = useState<Set<string>>(new Set())

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
  const activeExcluded = excludedSpaceTransactions ?? EMPTY_EXCLUDED_TRANSACTIONS

  // Custom editing and reset logic
  const {
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
  } = useTransactionPreviewEditing({
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
  })

  // Duplicate unlocking and relocking logic
  const {
    unlockedTxToWarn,
    setUnlockedTxToWarn,
    sameLockedDuplicates,
    handleRequestUnlockDuplicate,
    handleConfirmUnlockDuplicate,
    handleRelockDuplicate,
  } = usePreviewDuplicateHandling({
    alreadyDuplicatedIds,
    duplicateIds,
    effectiveUnlockedIds,
    activeTransactions,
    setLocalUnlockedDuplicateIds,
    getOriginalTransaction,
    getIsModified,
    onUnlockDuplicateTransaction,
    onRelockDuplicateTransaction,
  })

  // Scoping, duplicate/transfer counting, and title computation
  const {
    currentAccountName,
    currentInstLogo,
    existingInstitutions,
    hasMultipleAccounts,
    existingTransferIds,
    spaceTransferIds,
    subAccounts,
    subAccountCounts,
    duplicateCount,
    modifiedDuplicateCount,
    alreadyDuplicatedCount,
    hasDuplicates,
    spaceTransferCount,
    internalTransferCount,
    excludedCount,
    accountCounts,
    scopedTransactions,
    hasMultipleTransactions,
    effectiveTitle,
  } = usePreviewTransactionScoping({
    activeTransactions,
    activeExcluded,
    discardedSpaceCount,
    duplicateIds,
    effectiveUnlockedIds,
    alreadyDuplicatedIds,
    internalTransferIds,
    existingAccountTransfers,
    currentInstitutionName,
    scopeFilter,
    initialFilter,
    accountFilter,
    subAccountFilter,
    title,
    t,
    getIsModified,
  })

  useEffect(() => {
    if (isOpen) {
      setScopeFilter(initialFilter)
      setAccountFilter(initialAccountFilter ?? 'all')
      setSubAccountFilter('all')
      setLocalUnlockedDuplicateIds(new Set())
      setUnlockedTxToWarn(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialFilter])

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

  const hasActions = Boolean(
    onRemoveTransaction ||
    onUnlockDuplicateTransaction ||
    onRelockDuplicateTransaction ||
    effectiveUnlockedIds.size > 0 ||
    modifiedTransactions.length > 0,
  )

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
                : (
                    t.duplicateTransactionsDetected || '{count} duplicate transactions detected.'
                  ).replace('{count}', String(duplicateIds.size - effectiveUnlockedIds.size))}
            </span>
          </div>
        )}

      {bulkApplyOffer && (
        <BulkApplyBanner
          bulkApplyOffer={bulkApplyOffer}
          modifiedCount={modifiedTransactions.length}
          onApplyToAllUnlocked={handleApplyToAllUnlocked}
          onConfirmBulkApply={handleConfirmBulkApply}
          onOpenAdjustModal={handleOpenAdjustModal}
          onResetAll={(sourceTxId) => setPendingResetTxId(sourceTxId)}
          onDismiss={() => setBulkApplyOffer(null)}
          t={t}
        />
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

      {/* Account & Sub-account Filter Bar */}
      <CrossAccountFilterBar
        hasMultipleAccounts={hasMultipleAccounts}
        scopeFilter={scopeFilter}
        accountFilter={accountFilter}
        setAccountFilter={setAccountFilter}
        currentAccountName={currentAccountName}
        currentInstLogo={currentInstLogo}
        existingInstitutions={existingInstitutions}
        accountCounts={accountCounts}
        subAccounts={subAccounts}
        subAccountFilter={subAccountFilter}
        setSubAccountFilter={setSubAccountFilter}
        subAccountCounts={subAccountCounts}
        t={t}
      />

      {/* Transactions Table */}
      <TransactionPreviewTable
        filteredAndSortedTransactions={filteredAndSortedTransactions}
        hasMultipleTransactions={hasMultipleTransactions}
        sortConfig={sortConfig}
        handleSort={handleSort}
        hasActions={hasActions}
        effectiveIsFilterActive={effectiveIsFilterActive}
        handleClearAllFilters={handleClearAllFilters}
        totalOriginalTransactionsCount={transactions.length}
        excludedSpaceTransactionsCount={(excludedSpaceTransactions || []).length}
        scopeFilter={scopeFilter}
        accountFilter={accountFilter}
        currentAccountName={currentAccountName}
        subAccountFilter={subAccountFilter}
        existingAccountTransfers={existingAccountTransfers}
        t={t}
        duplicateIds={duplicateIds}
        effectiveUnlockedIds={effectiveUnlockedIds}
        alreadyDuplicatedIds={alreadyDuplicatedIds}
        getIsModified={getIsModified}
        existingTransferIds={existingTransferIds}
        internalTransferIds={internalTransferIds}
        spaceTransferIds={spaceTransferIds}
        showInstitution={showInstitution}
        customCategories={customCategories}
        locale={locale}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        handleUpdateTransaction={handleUpdateTransaction}
        onRemoveTransaction={onRemoveTransaction}
        handleResetTransaction={handleResetTransaction}
        onUnlockDuplicateTransaction={onUnlockDuplicateTransaction}
        handleRequestUnlockDuplicate={handleRequestUnlockDuplicate}
        onRelockDuplicateTransaction={onRelockDuplicateTransaction}
        handleRelockDuplicate={handleRelockDuplicate}
      />

      <UnlockDuplicateModal
        isOpen={Boolean(unlockedTxToWarn)}
        transaction={unlockedTxToWarn}
        sameDuplicateCount={
          sameLockedDuplicates.length > 1 ? sameLockedDuplicates.length : undefined
        }
        onClose={() => setUnlockedTxToWarn(null)}
        onConfirmUnlock={handleConfirmUnlockDuplicate}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />

      {/* Bulk Adjust Modal */}
      <BulkAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        bulkApplyOffer={bulkApplyOffer}
        activeTransactions={activeTransactions}
        selectedFieldsToApply={selectedFieldsToApply}
        setSelectedFieldsToApply={setSelectedFieldsToApply}
        selectedTargetIds={selectedTargetIds}
        setSelectedTargetIds={setSelectedTargetIds}
        onConfirmCustomAdjust={handleConfirmCustomAdjust}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        t={t}
      />

      {/* Reset Confirmation Modal */}
      <ResetTransactionsModal
        isOpen={Boolean(pendingResetTxId)}
        pendingResetTxId={pendingResetTxId}
        onClose={() => setPendingResetTxId(null)}
        activeTransactions={activeTransactions}
        modifiedTransactions={modifiedTransactions}
        effectiveUnlockedIds={effectiveUnlockedIds}
        alsoLockAsDuplicate={alsoLockAsDuplicate}
        setAlsoLockAsDuplicate={setAlsoLockAsDuplicate}
        onConfirmResetSingle={executeResetTransaction}
        onConfirmResetAll={executeResetAllModified}
        formatCurrency={formatCurrency}
        t={t}
      />
    </Modal>
  )
}
