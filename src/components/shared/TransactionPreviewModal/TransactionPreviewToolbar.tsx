import React from 'react'
import { RotateCcw, Search, Unlock, X } from 'lucide-react'

import type { TranslationStrings } from '../../../i18n/types'
import { DatePicker } from '../DatePicker'
import { Select, type SelectOption } from '../Select'

import styles from './TransactionPreviewModal.module.css'

export type SortColumn = 'date' | 'description' | 'amount'
export type SortDirection = 'asc' | 'desc'
export type ScopeFilter = 'all' | 'included' | 'space-transfers' | 'internal-transfers' | 'duplicates' | 'unlocked'

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
  scopeFilter?: ScopeFilter
  onScopeFilterChange?: (filter: ScopeFilter) => void
  unlockedCount?: number
  hasDuplicates?: boolean
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
  scopeFilter = 'all',
  onScopeFilterChange,
  unlockedCount = 0,
  hasDuplicates = false,
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

      {(hasDuplicates || unlockedCount > 0) && (
        <button
          type="button"
          className={`${styles['unlocked-filter-btn']} ${
            scopeFilter === 'unlocked' ? styles['unlocked-filter-btn-active'] : ''
          } ${unlockedCount === 0 ? styles['unlocked-filter-btn-disabled'] : ''}`}
          onClick={() => {
            if (unlockedCount === 0) return
            onScopeFilterChange?.(scopeFilter === 'unlocked' ? 'all' : 'unlocked')
          }}
          disabled={unlockedCount === 0}
          title={
            unlockedCount === 0
              ? t.filterUnlocked || 'No unlocked transactions'
              : scopeFilter === 'unlocked'
              ? t.filterAll || 'Show all'
              : t.filterUnlocked || 'Unlocked'
          }
          aria-label={t.filterUnlocked || 'Unlocked'}
          aria-pressed={scopeFilter === 'unlocked'}
          data-testid="filter-unlocked-btn"
        >
          <Unlock size={13} aria-hidden="true" />
          <span>{t.filterUnlocked || 'Unlocked'}</span>
          <span className={styles['unlocked-filter-badge']}>{unlockedCount}</span>
        </button>
      )}

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
