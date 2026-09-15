import React, { useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  RotateCcw,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'

import { useFormatters } from '../../../hooks/useFormatters'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { Transaction } from '../../../types'
import { getCategoryColor } from '../../../utils/category-colors'
import { getCategoryIcon } from '../../../utils/category-icons'
import { getCategoryLabel } from '../../../utils/category-utils'
import { DatePicker } from '../DatePicker'
import { Modal } from '../Modal'
import { Select, type SelectOption } from '../Select'

import styles from './TransactionPreviewModal.module.css'

export interface TransactionPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction[]
  duplicateIds?: Set<string>
  onRemoveTransaction?: (id: string) => void
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void
  title?: string
  variant?: 'income' | 'expense'
}

type SortColumn = 'date' | 'description' | 'amount'
type SortDirection = 'asc' | 'desc'

export const TransactionPreviewModal: React.FC<TransactionPreviewModalProps> = ({
  isOpen,
  onClose,
  transactions,
  duplicateIds = new Set(),
  onRemoveTransaction,
  onUpdateTransaction,
  title,
  variant,
}) => {
  const t = useLanguageStore((s) => s.t)
  const locale = useLanguageStore((s) => s.locale)
  const customCategories = useAppStore((s) => s.customCategories)
  const { formatCurrency, formatDate, formatTransactionCount } = useFormatters()

  const ROW_HEIGHT = 64 // Standardized row height for Virtuoso virtualization

  const hasMultipleTransactions = transactions.length > 1

  const [sortConfig, setSortConfig] = useState<{ key: SortColumn; direction: SortDirection } | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const isFilterActive =
    hasMultipleTransactions &&
    (searchQuery.trim().length > 0 || startDate.length > 0 || endDate.length > 0)

  const handleClearFilters = () => {
    setSearchQuery('')
    setStartDate('')
    setEndDate('')
  }

  const handleSort = (key: SortColumn) => {
    if (!hasMultipleTransactions) return
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: key === 'description' ? 'asc' : 'desc' }
    })
  }

  const sortOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'default', label: t.sortOrder || 'Default' },
      { value: 'date-desc', label: t.newestFirst || 'Newest First' },
      { value: 'date-asc', label: t.oldestFirst || 'Oldest First' },
      { value: 'amount-desc', label: t.highestAmount || 'Highest Amount' },
      { value: 'amount-asc', label: t.lowestAmount || 'Lowest Amount' },
      { value: 'description-asc', label: 'A – Z' },
      { value: 'description-desc', label: 'Z – A' },
    ],
    [t],
  )

  const handleSortChange = (val: string) => {
    if (val === 'default') {
      setSortConfig(null)
      return
    }
    const [key, direction] = val.split('-') as [SortColumn, SortDirection]
    setSortConfig({ key, direction })
  }

  const filteredAndSortedTransactions = useMemo(() => {
    if (!hasMultipleTransactions) {
      return transactions
    }

    let result = [...transactions]

    if (startDate && endDate) {
      const [from, to] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate]
      result = result.filter((tx) => tx.date >= from && tx.date <= to)
    } else if (startDate) {
      result = result.filter((tx) => tx.date >= startDate)
    } else if (endDate) {
      result = result.filter((tx) => tx.date <= endDate)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((tx) => {
        const descMatch = tx.description.toLowerCase().includes(q)
        const instMatch = tx.institution?.toLowerCase().includes(q) ?? false
        const catMatch = (tx.category ?? '').toLowerCase().includes(q)
        const formattedAmount = formatCurrency(tx.amount).toLowerCase()
        const amountMatch = formattedAmount.includes(q) || tx.amount.toString().includes(q)
        return descMatch || instMatch || catMatch || amountMatch
      })
    }

    if (sortConfig !== null) {
      const { key, direction } = sortConfig
      const factor = direction === 'asc' ? 1 : -1
      result.sort((a, b) => {
        if (key === 'date') return a.date.localeCompare(b.date) * factor
        if (key === 'description') return a.description.localeCompare(b.description) * factor
        if (key === 'amount') return (a.amount - b.amount) * factor
        return 0
      })
    }

    return result
  }, [transactions, hasMultipleTransactions, startDate, endDate, searchQuery, sortConfig, formatCurrency])

  const filteredTotal = useMemo(
    () => filteredAndSortedTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
    [filteredAndSortedTransactions],
  )

  const renderSortIcon = (key: SortColumn) => {
    if (sortConfig?.key !== key) return <ArrowUpDown size={14} className={styles['sort-icon']} />
    const Icon = sortConfig.direction === 'asc' ? ArrowUp : ArrowDown
    return <Icon size={14} className={`${styles['sort-icon']} ${styles['sort-icon-active']}`} />
  }

  const effectiveTitle = title ?? t.transactions
  const isIncome = variant === 'income'
  const isExpense = variant === 'expense'

  const customHeader = (
    <div className={styles['modal-header-custom']}>
      <div className={styles['header-left']}>
        <div
          className={`${styles['header-icon-box']} ${
            isIncome ? styles['header-icon-income'] : isExpense ? styles['header-icon-expense'] : ''
          }`}
        >
          {isIncome ? (
            <TrendingUp size={20} />
          ) : isExpense ? (
            <TrendingDown size={20} />
          ) : (
            <Wallet size={20} />
          )}
        </div>
        <div className={styles['header-titles']}>
          <h2 className={styles['modal-title']} title={effectiveTitle}>
            {effectiveTitle}
          </h2>
          <div className={styles['summary-chips']}>
            <span className={styles['summary-chip']}>
              {formatTransactionCount(filteredAndSortedTransactions.length)}
            </span>
            <span
              className={`${styles['summary-chip']} ${styles['summary-amount-chip']} ${
                isIncome
                  ? styles['summary-chip-income']
                  : isExpense
                    ? styles['summary-chip-expense']
                    : ''
              }`}
            >
              {isIncome ? '+' : isExpense ? '-' : ''}
              {formatCurrency(filteredTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const rowContent = (index: number, tx: Transaction) => {
    const isDuplicate = duplicateIds.has(tx.id)
    const categoryColor = getCategoryColor(tx.category || 'Other', customCategories)
    const isTxIncome = tx.type === 'income'

    return (
      <div
        className={`${styles['tx-row']} ${
          index % 2 === 0 ? styles['tx-row-even'] : ''
        } ${isDuplicate ? styles['tx-row-duplicate'] : ''}`}
      >
        <div className={styles['row-main']}>
          <div
            className={styles['icon-avatar']}
            style={{ '--cat-color': categoryColor } as React.CSSProperties}
            aria-hidden="true"
          >
            {getCategoryIcon(tx.category || 'Other', 18, customCategories, tx.description)}
          </div>

          <div className={styles['row-text']}>
            {onUpdateTransaction ? (
              <input
                id={`tx-desc-${tx.id}`}
                name={`tx-desc-${tx.id}`}
                type="text"
                aria-label={t.description || 'Description'}
                className={styles['inline-input-desc']}
                value={tx.description}
                onChange={(e) => onUpdateTransaction(tx.id, { description: e.target.value })}
                title={tx.description}
              />
            ) : (
              <p className={styles['row-description']} title={tx.description}>
                {tx.description}
              </p>
            )}

            <div className={styles['row-meta']}>
              {tx.institution && <span>{tx.institution}</span>}
              {tx.institution && tx.category && <span>•</span>}
              {tx.category && (
                <span>{getCategoryLabel(tx.category, t, locale, customCategories)}</span>
              )}
              {isDuplicate && (
                <span className={styles['duplicate-pill']}>{t.duplicate || 'Duplicate'}</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles['row-date']}>
          {onUpdateTransaction ? (
            <div className={styles['inline-datepicker-wrapper']}>
              <DatePicker
                value={tx.date}
                onChange={(date) => onUpdateTransaction(tx.id, { date })}
              />
            </div>
          ) : (
            <span>{formatDate(tx.date)}</span>
          )}
        </div>

        <div
          className={`${styles['row-amount']} ${
            isTxIncome ? styles['amount-positive'] : styles['amount-negative']
          }`}
        >
          {onUpdateTransaction ? (
            <input
              id={`tx-amount-${tx.id}`}
              name={`tx-amount-${tx.id}`}
              type="number"
              step="0.01"
              aria-label={t.amount || 'Amount'}
              className={styles['inline-input-amount']}
              value={tx.amount === 0 ? '' : tx.amount}
              onChange={(e) => {
                const val = e.target.value
                const num = val === '' ? 0 : parseFloat(val)
                onUpdateTransaction(tx.id, {
                  amount: isNaN(num) ? 0 : num,
                  type: (isNaN(num) ? 0 : num) >= 0 ? 'income' : 'expense',
                })
              }}
              title={formatCurrency(tx.amount)}
            />
          ) : (
            <span>
              {isTxIncome ? '+' : ''}
              {formatCurrency(tx.amount)}
            </span>
          )}
        </div>

        {onRemoveTransaction && (
          <div className={styles['row-actions']}>
            <button
              className={styles['remove-button']}
              onClick={() => onRemoveTransaction(tx.id)}
              aria-label={t.removeTransaction}
              title={t.removeTransaction}
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customHeader}
      maxWidth="880px"
      footer={
        <div className={styles['modal-footer']}>
          <span className={styles['footer-count-text']}>
            {(t.showingOf || 'Showing {shown} of {total} transactions')
              .replace('{shown}', String(filteredAndSortedTransactions.length))
              .replace('{total}', String(transactions.length))}
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
      {duplicateIds.size > 0 && (
        <div className={styles['duplicate-banner']}>
          <AlertTriangle size={18} />
          <span>
            {duplicateIds.size === 1
              ? t.duplicateTransactionsDetectedSingular
              : t.duplicateTransactionsDetected.replace('{count}', String(duplicateIds.size))}
          </span>
        </div>
      )}

      {/* Modern Filter & Search Toolbar (only when multiple transactions exist) */}
      {hasMultipleTransactions && (
        <div className={styles.toolbar}>
          <div className={styles['search-box']}>
            <Search size={15} className={styles['search-icon']} />
            <input
              id="tx-modal-search"
              name="tx-modal-search"
              type="text"
              className={styles['search-input']}
              placeholder={t.searchTransactionsPlaceholder || 'Search description, merchant, amount…'}
              title={t.searchTransactionsPlaceholder || 'Search description, merchant, amount…'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles['search-clear-btn']}
                onClick={() => setSearchQuery('')}
                title={t.clear || 'Clear'}
                aria-label={t.clear || 'Clear'}
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className={styles['date-range-container']}>
            <div className={styles['date-filter-wrapper']}>
              <DatePicker
                className={styles['date-filter-input']}
                value={startDate}
                onChange={setStartDate}
                placeholder={t.fromDate || 'From date'}
              />
            </div>
            <div className={styles['date-filter-wrapper']}>
              <DatePicker
                className={styles['date-filter-input']}
                value={endDate}
                onChange={setEndDate}
                placeholder={t.toDate || 'To date'}
              />
            </div>
          </div>

          <Select
            id="tx-modal-sort"
            name="tx-modal-sort"
            className={styles['sort-select-wrapper']}
            value={sortConfig ? `${sortConfig.key}-${sortConfig.direction}` : 'default'}
            onChange={handleSortChange}
            options={sortOptions}
            aria-label="Sort transactions"
          />

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
      )}

      {/* Transactions Table */}
      <div className={styles['table-container']}>
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

          {onRemoveTransaction && <div className={styles['col-actions']} />}
        </div>

        {filteredAndSortedTransactions.length === 0 ? (
          <div className={styles['empty-state']}>
            <Search size={32} className={styles['empty-icon']} />
            <p className={styles['empty-text']}>
              {transactions.length === 0 ? t.noTransactionsLeft : t.noTransactionsMatch}
            </p>
            {hasMultipleTransactions && isFilterActive && (
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
    </Modal>
  )
}
