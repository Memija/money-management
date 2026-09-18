import React from 'react'
import { RotateCcw, Search, X } from 'lucide-react'

import type { TranslationStrings } from '../../../i18n/types'
import { DatePicker } from '../DatePicker'
import { Select, type SelectOption } from '../Select'

import styles from './TransactionPreviewModal.module.css'

export type SortColumn = 'date' | 'description' | 'amount'
export type SortDirection = 'asc' | 'desc'
export type ScopeFilter = 'all' | 'included' | 'space-transfers' | 'internal-transfers' | 'duplicates'

export interface TransactionPreviewToolbarProps {
  hasMultipleTransactions: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  startDate: string
  setStartDate: (date: string) => void
  endDate: string
  setEndDate: (date: string) => void
  sortConfig: { key: SortColumn; direction: SortDirection } | null
  handleSortChange: (val: string) => void
  sortOptions: SelectOption[]
  isFilterActive: boolean
  handleClearFilters: () => void
  t: TranslationStrings
}

export const TransactionPreviewToolbar: React.FC<TransactionPreviewToolbarProps> = ({
  hasMultipleTransactions,
  searchQuery,
  setSearchQuery,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sortConfig,
  handleSortChange,
  sortOptions,
  isFilterActive,
  handleClearFilters,
  t,
}) => {
  if (!hasMultipleTransactions) {
    return null
  }

  return (
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
  )
}
