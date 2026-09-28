import React, { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Ghost,
  Receipt,
  RotateCcw,
  Search,
  SearchX,
  Sliders,
  Tag,
  X,
} from 'lucide-react'

import { useFormatters } from '../../../hooks/useFormatters'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { Transaction } from '../../../types'
import { getCategoryIcon } from '../../../utils/category-icons'
import { getCategoryLabel, normalizeDescription } from '../../../utils/category-utils'
import { getVisiblePages } from '../../../utils/pagination-utils'
import { Select } from '../../shared/Select'
import { TransactionItem } from './TransactionItem'

import styles from './TransactionList.module.css'

interface TransactionListProps {
  filteredTx: Transaction[]
  institutionNames: string[]
  searchTerm: string
  setSearchTerm: (val: string) => void
  selectedCategory?: string
  setSelectedCategory?: (val: string) => void
  selectedInstitution?: string
  setSelectedInstitution?: (val: string) => void
  sortOrder?: 'newest' | 'oldest' | 'highest' | 'lowest'
  setSortOrder?: (val: 'newest' | 'oldest' | 'highest' | 'lowest') => void
  showGhost?: boolean
  setShowGhost?: (val: boolean) => void
  ghostCount?: number
  showBankName?: boolean
}

type TypeFilter = 'all' | 'income' | 'expense' | 'transfers' | 'duplicates' | 'modified'

const DEFAULT_PAGE_SIZE = 10

export const TransactionList: React.FC<TransactionListProps> = React.memo(({
  filteredTx,
  institutionNames,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedInstitution = 'all',
  sortOrder = 'newest',
  setSortOrder,
  setShowGhost,
  ghostCount = 0,
  showBankName,
}) => {
  const t = useLanguageStore((s) => s.t)
  const locale = useLanguageStore((s) => s.locale)
  const customCategories = useAppStore((s) => s.customCategories)
  const setManualCategory = useAppStore((s) => s.setManualCategory)
  const customKeywords = useAppStore((s) => s.customKeywords)
  const setCustomKeywords = useAppStore((s) => s.setCustomKeywords)
  const { formatDate, formatCurrency, formatTransactionCount } = useFormatters()

  const shouldShowBankName =
    (showBankName !== undefined ? showBankName : institutionNames.length > 1) &&
    selectedInstitution === 'all'

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [internalCategory, setInternalCategory] = useState<string>('all')
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const categoryFilter = selectedCategory !== undefined ? selectedCategory : internalCategory

  const handleCategoryFilterChange = useCallback(
    (cat: string) => {
      if (setSelectedCategory) {
        setSelectedCategory(cat)
      } else {
        setInternalCategory(cat)
      }
      setCurrentPage(1)
    },
    [setSelectedCategory],
  )

  // Single-pass computation for filtered categories, types, counts, and financial totals
  const {
    normalTx,
    ghostTx,
    duplicateTx,
    modifiedTx,
    duplicateCount,
    modifiedCount,
    incomeCount,
    expenseCount,
    netBalance,
    visibleGhostCount,
  } = useMemo(() => {
    const isAllCat = categoryFilter === 'all'
    const normal: Transaction[] = []
    const ghost: Transaction[] = []
    const duplicate: Transaction[] = []
    const modified: Transaction[] = []

    let incCount = 0
    let expCount = 0
    let incTot = 0
    let expTot = 0
    let ghosts = 0

    for (let i = 0; i < filteredTx.length; i++) {
      const tx = filteredTx[i]
      if (!isAllCat && (tx.category || 'Other') !== categoryFilter) {
        continue
      }

      if (tx.isGhost) {
        ghosts++
        ghost.push(tx)
        continue
      }

      normal.push(tx)
      const isMod = Boolean(tx.isModified)
      const isDup = Boolean(tx.isDuplicate || tx.forceImport || tx.importedByRuleId)

      if (isMod) {
        modified.push(tx)
      } else if (isDup) {
        duplicate.push(tx)
      }

      const amt = Math.abs(tx.amount)
      if (tx.type === 'income') {
        incCount++
        incTot += amt
      } else {
        expCount++
        expTot += amt
      }
    }

    return {
      normalTx: normal,
      ghostTx: ghost,
      duplicateTx: duplicate,
      modifiedTx: modified,
      duplicateCount: duplicate.length,
      modifiedCount: modified.length,
      incomeCount: incCount,
      expenseCount: expCount,
      incomeTotal: incTot,
      expenseTotal: expTot,
      netBalance: incTot - expTot,
      visibleGhostCount: ghosts,
    }
  }, [filteredTx, categoryFilter])

  // Collect available unique categories from unfiltered transactions in current scope (decoupled from categoryFilter)
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    for (let i = 0; i < filteredTx.length; i++) {
      const cat = filteredTx[i].category
      if (cat) {
        set.add(cat)
      }
    }
    return Array.from(set).sort((a, b) => {
      const labelA = getCategoryLabel(a, t, locale, customCategories)
      const labelB = getCategoryLabel(b, t, locale, customCategories)
      return labelA.localeCompare(labelB)
    })
  }, [filteredTx, t, locale, customCategories])

  const categoryOptions = useMemo(() => {
    const options = [
      {
        value: 'all',
        label: t.allCategories || 'All Categories',
        icon: <Tag size={14} />,
      },
      ...availableCategories.map((cat) => ({
        value: cat,
        label: getCategoryLabel(cat, t, locale, customCategories),
        icon: getCategoryIcon(cat, 14, customCategories),
      })),
    ]
    if (categoryFilter !== 'all' && !availableCategories.includes(categoryFilter)) {
      options.push({
        value: categoryFilter,
        label: getCategoryLabel(categoryFilter, t, locale, customCategories),
        icon: getCategoryIcon(categoryFilter, 14, customCategories),
      })
    }
    return options
  }, [availableCategories, categoryFilter, t, locale, customCategories])

  // Filter transactions by Type (All / Income / Expense / Transfers / Duplicates / Modified)
  // GHOST TRANSACTIONS ARE NEVER SHOWN IN 'all', 'income', 'expense', 'duplicates', or 'modified'!
  const effectiveTx = useMemo(() => {
    if (typeFilter === 'all') return normalTx
    if (typeFilter === 'transfers') return ghostTx
    if (typeFilter === 'duplicates') return duplicateTx
    if (typeFilter === 'modified') return modifiedTx
    return normalTx.filter((tx) => tx.type === typeFilter)
  }, [normalTx, ghostTx, duplicateTx, modifiedTx, typeFilter])

  // Total pages and sliced page transactions
  const totalPages = Math.max(1, Math.ceil(effectiveTx.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const visiblePages = useMemo(
    () => getVisiblePages(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages]
  )

  const pagedTx = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return effectiveTx.slice(start, start + pageSize)
  }, [effectiveTx, safeCurrentPage, pageSize])

  const handleCategoryChange = useCallback(
    (tx: Transaction, newCategory: string) => {
      setManualCategory(tx.id, newCategory)
      const norm = normalizeDescription(tx.description)
      if (norm.length >= 3) {
        const existingKeywords = customKeywords[newCategory] || []
        if (!existingKeywords.some((kw) => kw.toLowerCase() === norm.toLowerCase())) {
          setCustomKeywords(newCategory, [...existingKeywords, norm])
        }
      }
    },
    [setManualCategory, customKeywords, setCustomKeywords],
  )

  const handleResetFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    handleCategoryFilterChange('all')
    setSortOrder?.('newest')
    setCurrentPage(1)
  }

  const isFilterActive =
    searchTerm.trim().length > 0 ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    sortOrder !== 'newest'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`glass-card ${styles.colSpan12}`}
    >
      {/* Header with Icon, Title, and Stat Pills */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconBadge} aria-hidden="true">
            <Receipt size={22} />
          </div>
          <div className={styles.titleTextContainer}>
            <h3 className={styles.title}>{t.allTransactions}</h3>
            <p className={styles.subtitle}>
              {formatTransactionCount(effectiveTx.length)}
            </p>
          </div>
        </div>

        <div className={styles.statPillsGroup}>
          <div className={styles.statPill}>
            <span className={styles.statLabel}>
              {typeFilter === 'transfers'
                ? (t.internalTransfers || 'Transfers')
                : typeFilter === 'duplicates'
                  ? (t.duplicate || 'Duplicates')
                  : t.all}
            </span>
            <span className={styles.statValue}>
              {typeFilter === 'transfers'
                ? (ghostCount || visibleGhostCount)
                : typeFilter === 'duplicates'
                  ? duplicateCount
                  : normalTx.length}
            </span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.statLabel}>
              {typeFilter === 'transfers'
                ? `${t.totalBalance || 'Total Balance'} (0 impact)`
                : (t.totalBalance || 'Total Balance')}
            </span>
            <span
              className={`${styles.statValue} ${
                typeFilter === 'transfers'
                  ? styles.statNeutral
                  : netBalance >= 0
                    ? styles.statIncome
                    : styles.statExpense
              } privacy-blur`}
            >
              {typeFilter === 'transfers'
                ? formatCurrency(0)
                : `${netBalance >= 0 ? '+' : ''}${formatCurrency(netBalance)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar with Segmented Filter Tabs, Search, and Selects */}
      <div className={styles.toolbar}>
        <div className={styles.typeFilters} role="tablist" aria-label="Transaction Type">
          <button
            type="button"
            role="tab"
            aria-selected={typeFilter === 'all'}
            onClick={() => {
              setTypeFilter('all')
              setCurrentPage(1)
            }}
            className={`${styles.typeFilterBtn} ${
              typeFilter === 'all' ? styles.typeFilterBtnActive : ''
            }`}
          >
            {t.all || 'All'}
            <span className={styles.typeBadge}>{normalTx.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={typeFilter === 'income'}
            onClick={() => {
              setTypeFilter('income')
              setCurrentPage(1)
            }}
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
            onClick={() => {
              setTypeFilter('expense')
              setCurrentPage(1)
            }}
            className={`${styles.typeFilterBtn} ${
              typeFilter === 'expense' ? styles.typeFilterBtnActive : ''
            }`}
          >
            {t.expenses || 'Expenses'}
            <span className={styles.typeBadge}>{expenseCount}</span>
          </button>
          {(ghostCount > 0 || visibleGhostCount > 0) && (
            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === 'transfers'}
              onClick={() => {
                setShowGhost?.(true)
                setTypeFilter('transfers')
                setCurrentPage(1)
              }}
              className={`${styles.typeFilterBtn} ${
                typeFilter === 'transfers' ? styles.typeFilterBtnActive : ''
              }`}
            >
              {t.internalTransfers || 'Transfers'}
              <span className={styles.typeBadge}>{ghostCount || visibleGhostCount}</span>
            </button>
          )}
          {duplicateCount > 0 && (
            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === 'duplicates'}
              onClick={() => {
                setTypeFilter('duplicates')
                setCurrentPage(1)
              }}
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
              onClick={() => {
                setTypeFilter('modified')
                setCurrentPage(1)
              }}
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
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className={styles.txSearchInput}
              id="tx-search"
              name="tx-search"
            />
            {searchTerm.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
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
            onChange={(val) => handleCategoryFilterChange(val as string)}
            className={styles.txFilterSelectWrapper}
            aria-label={t.filterByCategory || 'Filter by category'}
            options={categoryOptions}
          />

          <Select
            id="sort-order"
            name="sort-order"
            value={sortOrder}
            onChange={(val) =>
              setSortOrder?.(val as 'newest' | 'oldest' | 'highest' | 'lowest')
            }
            className={styles.txFilterSelectWrapper}
            aria-label="Sort order"
            options={[
              { value: 'newest', label: t.newestFirst },
              { value: 'oldest', label: t.oldestFirst },
              { value: 'highest', label: t.highestAmount },
              { value: 'lowest', label: t.lowestAmount },
            ]}
          />

          {isFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className={styles.resetBtn}
              title={t.clear || 'Reset filters'}
              aria-label="Reset all filters"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className={styles.transactionList} data-testid="transaction-list">
        {typeFilter === 'transfers' && (
          <div className={styles.transfersNotice} data-testid="transfers-read-only-notice">
            <Ghost size={16} aria-hidden="true" />
            <span>
              {t.transfersTabNotice ||
                'Internal transfers between your accounts are excluded from income and expenses (read-only).'}
            </span>
          </div>
        )}

        {pagedTx.map((tx) => (
          <TransactionItem
            key={tx.id}
            tx={tx}
            customCategories={customCategories}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            onCategoryChange={handleCategoryChange}
            showBankName={shouldShowBankName}
          />
        ))}

        {/* Empty State */}
        {effectiveTx.length === 0 && (
          <div className={styles.emptyStateCard}>
            <div className={styles.emptyIconBox} aria-hidden="true">
              <SearchX size={26} />
            </div>
            <p className={styles.emptyText}>{t.noTransactionsMatch}</p>
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className={styles.clearFiltersBtn}
              >
                <RotateCcw size={14} />
                {t.clear || 'Clear filters'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {effectiveTx.length > 0 && (
        <div className={styles.paginationBar}>
          <div className={styles.paginationLeft}>
            <p className={styles.moreRows}>
              {(t.showingOf || 'Showing {shown} of {total}')
                .replace('{shown}', String(pagedTx.length))
                .replace('{total}', String(effectiveTx.length))}
            </p>
            <div className={styles.pageSizeWrapper}>
              <label htmlFor="tx-page-size-select" className={styles.pageSizeLabel}>
                {t.perPage || 'Per page:'}
              </label>
              <Select
                id="tx-page-size-select"
                name="tx-page-size-select"
                value={pageSize}
                onChange={(val) => {
                  setPageSize(Number(val))
                  setCurrentPage(1)
                }}
                size="sm"
                className={styles.pageSizeSelectWrapper}
                aria-label={t.perPage || 'Per page:'}
                options={[
                  { value: 10, label: '10' },
                  { value: 25, label: '25' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                ]}
              />
            </div>
          </div>

          {totalPages > 1 && (
            <div className={styles.pageControls}>
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={styles.pageBtn}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              {visiblePages.map((pageItem, index) =>
                pageItem === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className={styles.pageEllipsis}
                    aria-hidden="true"
                  >
                    &hellip;
                  </span>
                ) : (
                  <button
                    key={pageItem}
                    type="button"
                    onClick={() => setCurrentPage(pageItem)}
                    className={`${styles.pageBtn} ${
                      safeCurrentPage === pageItem ? styles.pageBtnActive : ''
                    }`}
                    aria-label={`Page ${pageItem}`}
                    aria-current={safeCurrentPage === pageItem ? 'page' : undefined}
                  >
                    {pageItem}
                  </button>
                )
              )}
              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={styles.pageBtn}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
})

TransactionList.displayName = 'TransactionList'
