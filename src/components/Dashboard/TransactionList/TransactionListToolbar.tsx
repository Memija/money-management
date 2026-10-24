import React from 'react'
import { Copy, Link2, Link2Off, RotateCcw, Search, Sliders, X } from 'lucide-react'

import type { TranslationStrings } from '../../../i18n/types'
import type { SelectOption } from '../../shared/Select'
import { Select } from '../../shared/Select'
import type { TypeFilter } from './TransactionList'

import styles from './TransactionListToolbar.module.css'

export interface TransactionListToolbarProps {
  typeFilter: TypeFilter
  onTypeFilterChange: (type: TypeFilter) => void
  normalCount: number
  incomeCount: number
  expenseCount: number
  hasGhosts: boolean
  effectiveGhostCount: number
  duplicateCount: number
  modifiedCount: number
  onShowGhost?: (show: boolean) => void
  searchTerm: string
  onSearchTermChange: (term: string) => void
  categoryFilter: string
  onCategoryFilterChange: (cat: string) => void
  categoryOptions: SelectOption[]
  sortOrder: 'newest' | 'oldest' | 'highest' | 'lowest'
  onSortOrderChange?: (sort: 'newest' | 'oldest' | 'highest' | 'lowest') => void
  detachTransactionsFromDashboard: boolean
  onToggleDetach: () => void
  isFilterActive: boolean
  onResetFilters: () => void
  t: TranslationStrings
  sortOptions: SelectOption[]
}

export const TransactionListToolbar: React.FC<TransactionListToolbarProps> = ({
  typeFilter,
  onTypeFilterChange,
  normalCount,
  incomeCount,
  expenseCount,
  hasGhosts,
  effectiveGhostCount,
  duplicateCount,
  modifiedCount,
  onShowGhost,
  searchTerm,
  onSearchTermChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  sortOrder,
  onSortOrderChange,
  detachTransactionsFromDashboard,
  onToggleDetach,
  isFilterActive,
  onResetFilters,
  t,
  sortOptions,
}) => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.typeFilters} role="tablist" aria-label="Transaction Type">
        <button
          type="button"
          role="tab"
          aria-selected={typeFilter === 'all'}
          onClick={() => onTypeFilterChange('all')}
          className={`${styles.typeFilterBtn} ${
            typeFilter === 'all' ? styles.typeFilterBtnActive : ''
          }`}
        >
          {t.all || 'All'}
          <span className={styles.typeBadge}>{normalCount}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={typeFilter === 'income'}
          onClick={() => onTypeFilterChange('income')}
          className={`${styles.typeFilterBtn} ${
            typeFilter === 'income' ? styles.typeFilterBtnActive : ''
          }`}
        >
          {t.income || 'Income'}
          <span className={styles.typeBadge}>{incomeCount}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={typeFilter === 'expense'}
          onClick={() => onTypeFilterChange('expense')}
          className={`${styles.typeFilterBtn} ${
            typeFilter === 'expense' ? styles.typeFilterBtnActive : ''
          }`}
        >
          {t.expenses || 'Expenses'}
          <span className={styles.typeBadge}>{expenseCount}</span>
        </button>
        {hasGhosts && (
          <button
            type="button"
            role="tab"
            aria-selected={typeFilter === 'transfers'}
            onClick={() => {
              onShowGhost?.(true)
              onTypeFilterChange('transfers')
            }}
            className={`${styles.typeFilterBtn} ${
              typeFilter === 'transfers' ? styles.typeFilterBtnActive : ''
            }`}
          >
            {t.internalTransfers || 'Transfers'}
            <span className={styles.typeBadge}>{effectiveGhostCount}</span>
          </button>
        )}
        {duplicateCount > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={typeFilter === 'duplicates'}
            onClick={() => onTypeFilterChange('duplicates')}
            className={`${styles.typeFilterBtn} ${
              typeFilter === 'duplicates' ? styles.typeFilterBtnActive : ''
            } ${styles.duplicateFilterBtn}`}
            data-testid="filter-duplicates-tab"
          >
            <Copy size={13} aria-hidden="true" />
            {t.duplicate || 'Duplicates'}
            <span className={`${styles.typeBadge} ${styles.duplicateTypeBadge}`}>
              {duplicateCount}
            </span>
          </button>
        )}
        {modifiedCount > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={typeFilter === 'modified'}
            onClick={() => onTypeFilterChange('modified')}
            className={`${styles.typeFilterBtn} ${
              typeFilter === 'modified' ? styles.typeFilterBtnActive : ''
            } ${styles.modifiedFilterBtn}`}
            data-testid="filter-modified-tab"
          >
            <Sliders size={13} aria-hidden="true" />
            {t.modified || 'Modified'}
            <span className={`${styles.typeBadge} ${styles.modifiedTypeBadge}`}>
              {modifiedCount}
            </span>
          </button>
        )}
      </div>

      <div className={styles.controlsRight}>
        <div className={styles.txSearchWrapper}>
          <Search size={15} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            placeholder={t.search}
            aria-label={t.search}
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className={styles.txSearchInput}
            id="tx-search"
            name="tx-search"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchTermChange('')}
              className={styles.searchClearBtn}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <Select
          id="category-filter"
          name="category-filter"
          value={categoryFilter}
          onChange={(val) => onCategoryFilterChange(val as string)}
          className={`${styles.txFilterSelectWrapper} ${styles.categorySelectWrapper}`}
          aria-label={t.filterByCategory || 'Filter by category'}
          options={categoryOptions}
        />

        <Select
          id="sort-order"
          name="sort-order"
          value={sortOrder}
          onChange={(val) => onSortOrderChange?.(val as 'newest' | 'oldest' | 'highest' | 'lowest')}
          className={`${styles.txFilterSelectWrapper} ${styles.sortSelectWrapper}`}
          aria-label="Sort order"
          options={sortOptions}
        />

        <button
          type="button"
          onClick={onToggleDetach}
          className={`${styles.detachBtn} ${
            detachTransactionsFromDashboard ? styles.detachBtnActive : styles.detachBtnLinked
          }`}
          title={
            detachTransactionsFromDashboard
              ? t.attachTransactionsAction || 'Filters detached from dashboard (click to link)'
              : t.detachTransactionsAction || 'Filters linked to dashboard (click to detach)'
          }
          aria-label={
            detachTransactionsFromDashboard
              ? t.attachTransactionsAction || 'Filters detached from dashboard (click to link)'
              : t.detachTransactionsAction || 'Filters linked to dashboard (click to detach)'
          }
          data-testid="toggle-detach-transactions"
        >
          {detachTransactionsFromDashboard ? <Link2Off size={15} /> : <Link2 size={15} />}
        </button>

        {isFilterActive && (
          <button
            type="button"
            onClick={onResetFilters}
            className={styles.resetBtn}
            title={t.clear || 'Reset filters'}
            aria-label="Reset all filters"
          >
            <RotateCcw size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
