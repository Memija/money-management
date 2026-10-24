import React from 'react'
import { Virtuoso } from 'react-virtuoso'
import { ArrowDown, ArrowUp, ArrowUpDown, RotateCcw, Search } from 'lucide-react'

import type { TranslationStrings } from '../../../i18n/types'
import type { CustomCategory, Transaction } from '../../../types'
import { TransactionPreviewRow } from './TransactionPreviewRow'
import type { ScopeFilter, SortColumn } from './TransactionPreviewToolbar'
import { TransactionScopeNotices } from './TransactionScopeNotices'

import styles from './TransactionPreviewTable.module.css'

export interface TransactionPreviewTableProps {
  filteredAndSortedTransactions: Transaction[]
  hasMultipleTransactions: boolean
  sortConfig: { key: SortColumn; direction: 'asc' | 'desc' } | null
  handleSort: (key: SortColumn) => void
  hasActions: boolean
  effectiveIsFilterActive: boolean
  handleClearAllFilters: () => void
  totalOriginalTransactionsCount: number
  excludedSpaceTransactionsCount: number
  scopeFilter: ScopeFilter
  accountFilter: string
  currentAccountName: string
  subAccountFilter: string
  existingAccountTransfers?: Transaction[]
  t: TranslationStrings
  duplicateIds: Set<string>
  effectiveUnlockedIds: Set<string>
  alreadyDuplicatedIds?: Set<string>
  getIsModified: (tx: Transaction) => boolean
  existingTransferIds: Set<string>
  internalTransferIds: Set<string>
  spaceTransferIds: Set<string>
  showInstitution: boolean
  customCategories: CustomCategory[]
  locale: string
  formatCurrency: (val: number) => string
  formatDate: (val: string) => string
  handleUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void
  onRemoveTransaction?: (id: string) => void
  handleResetTransaction: (id: string) => void
  onUnlockDuplicateTransaction?: (tx: Transaction, rememberRule?: boolean) => void
  handleRequestUnlockDuplicate: (tx: Transaction) => void
  onRelockDuplicateTransaction?: (tx: Transaction) => void
  handleRelockDuplicate: (tx: Transaction) => void
}

const ROW_HEIGHT = 64 // Standardized row height for Virtuoso virtualization

export const TransactionPreviewTable: React.FC<TransactionPreviewTableProps> = ({
  filteredAndSortedTransactions,
  hasMultipleTransactions,
  sortConfig,
  handleSort,
  hasActions,
  effectiveIsFilterActive,
  handleClearAllFilters,
  totalOriginalTransactionsCount,
  excludedSpaceTransactionsCount,
  scopeFilter,
  accountFilter,
  currentAccountName,
  subAccountFilter,
  existingAccountTransfers,
  t,
  duplicateIds,
  effectiveUnlockedIds,
  alreadyDuplicatedIds,
  getIsModified,
  existingTransferIds,
  internalTransferIds,
  spaceTransferIds,
  showInstitution,
  customCategories,
  locale,
  formatCurrency,
  formatDate,
  handleUpdateTransaction,
  onRemoveTransaction,
  handleResetTransaction,
  onUnlockDuplicateTransaction,
  handleRequestUnlockDuplicate,
  onRelockDuplicateTransaction,
  handleRelockDuplicate,
}) => {
  const renderSortIcon = (key: SortColumn) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown size={14} className={styles['sort-icon']} />
    }
    const Icon = sortConfig.direction === 'asc' ? ArrowUp : ArrowDown
    return <Icon size={14} className={`${styles['sort-icon']} ${styles['sort-icon-active']}`} />
  }

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
        isInternalTransfer={
          !isTxDuplicate &&
          (tx.isGhost || internalTransferIds.has(tx.id) || isTxExistingAccountTransfer)
        }
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
        onRelockDuplicate={
          onRelockDuplicateTransaction && !isTxExistingAccountTransfer
            ? handleRelockDuplicate
            : undefined
        }
        hasActions={hasActions && !isTxExistingAccountTransfer}
      />
    )
  }

  return (
    <div className={styles['table-container']}>
      <TransactionScopeNotices
        scopeFilter={scopeFilter}
        accountFilter={accountFilter}
        currentAccountName={currentAccountName}
        subAccountFilter={subAccountFilter}
        existingAccountTransfers={existingAccountTransfers}
        t={t}
      />

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
            {totalOriginalTransactionsCount === 0 && excludedSpaceTransactionsCount === 0
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
          const maxH = Math.min(
            typeof window !== 'undefined' ? window.innerHeight * 0.52 : 520,
            520,
          )
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
  )
}
