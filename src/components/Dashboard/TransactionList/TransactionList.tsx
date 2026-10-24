import React, { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Ghost, ImageOff, RotateCcw, SearchX, X } from 'lucide-react'

import { useFormatters } from '../../../hooks/useFormatters'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { Transaction } from '../../../types'
import { isLocalEnvironment } from '../../../utils/env-utils'
import { getVisiblePages } from '../../../utils/pagination-utils'
import { BatchCategoryModal } from '../../shared/BatchCategoryModal'
import { TransactionItem } from './TransactionItem'
import { TransactionListHeader } from './TransactionListHeader'
import { TransactionListPagination } from './TransactionListPagination'
import { TransactionListToolbar } from './TransactionListToolbar'
import { useTransactionBatchCategory } from './useTransactionBatchCategory'
import { useTransactionCategoryOptions } from './useTransactionCategoryOptions'
import { useTransactionListStats } from './useTransactionListStats'

import styles from './TransactionList.module.css'

export type TypeFilter = 'all' | 'income' | 'expense' | 'transfers' | 'duplicates' | 'modified'

interface TransactionListProps {
  filteredTx: Transaction[]
  allTransactions?: Transaction[]
  institutionNames: string[]
  searchTerm: string
  setSearchTerm: (val: string) => void
  selectedCategory?: string
  setSelectedCategory?: (val: string) => void
  typeFilter?: TypeFilter
  setTypeFilter?: (val: TypeFilter) => void
  selectedInstitution?: string
  setSelectedInstitution?: (val: string) => void
  sortOrder?: 'newest' | 'oldest' | 'highest' | 'lowest'
  setSortOrder?: (val: 'newest' | 'oldest' | 'highest' | 'lowest') => void
  showGhost?: boolean
  setShowGhost?: (val: boolean) => void
  ghostCount?: number
  showBankName?: boolean
  detachTransactionsFromDashboard?: boolean
  setDetachTransactionsFromDashboard?: (val: boolean) => void
}

const DEFAULT_PAGE_SIZE = 10

export const TransactionList: React.FC<TransactionListProps> = React.memo(
  ({
    filteredTx,
    allTransactions,
    institutionNames,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    typeFilter: propTypeFilter,
    setTypeFilter: propSetTypeFilter,
    selectedInstitution = 'all',
    sortOrder = 'newest',
    setSortOrder,
    setShowGhost,
    ghostCount = 0,
    showBankName,
    detachTransactionsFromDashboard: propDetach,
    setDetachTransactionsFromDashboard: propSetDetach,
  }) => {
    const t = useLanguageStore((s) => s.t)
    const locale = useLanguageStore((s) => s.locale)
    const customCategories = useAppStore((s) => s.customCategories)
    const setManualCategory = useAppStore((s) => s.setManualCategory)
    const setManualCategoriesBulk = useAppStore((s) => s.setManualCategoriesBulk)
    const customKeywords = useAppStore((s) => s.customKeywords)
    const setCustomKeywords = useAppStore((s) => s.setCustomKeywords)
    const storeFilterWithoutLogos = useAppStore((s) => s.filterTransactionsWithoutLogos)
    const isLocal = isLocalEnvironment()
    const filterTransactionsWithoutLogos = isLocal && storeFilterWithoutLogos
    const storeDetach = useAppStore((s) => s.detachTransactionsFromDashboard)
    const storeSetDetach = useAppStore((s) => s.setDetachTransactionsFromDashboard)
    const detachTransactionsFromDashboard = propDetach !== undefined ? propDetach : storeDetach
    const setDetachTransactionsFromDashboard = propSetDetach || storeSetDetach
    const { formatDate, formatCurrency, formatTransactionCount } = useFormatters()

    const shouldShowBankName =
      (showBankName !== undefined ? showBankName : institutionNames.length > 1) &&
      selectedInstitution === 'all'

    const [internalTypeFilter, setInternalTypeFilter] = useState<TypeFilter>('all')
    const [internalCategory, setInternalCategory] = useState<string>('all')
    const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
    const [currentPage, setCurrentPage] = useState<number>(1)

    const typeFilter = propTypeFilter !== undefined ? propTypeFilter : internalTypeFilter

    const handleTypeFilterChange = useCallback(
      (type: TypeFilter) => {
        if (propSetTypeFilter) {
          propSetTypeFilter(type)
        } else {
          setInternalTypeFilter(type)
        }
        setCurrentPage(1)
      },
      [propSetTypeFilter],
    )

    const rawCategory = selectedCategory !== undefined ? selectedCategory : internalCategory
    const categoryFilter =
      !filterTransactionsWithoutLogos && rawCategory === 'without-logos' ? 'all' : rawCategory

    if (!filterTransactionsWithoutLogos && internalCategory === 'without-logos') {
      setInternalCategory('all')
    }

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
      hasGhosts,
      effectiveGhostCount,
      statPillInfo,
    } = useTransactionListStats({
      filteredTx,
      categoryFilter,
      typeFilter,
      ghostCount,
      t,
      locale,
      customCategories,
      formatCurrency,
    })

    // Category options and unique available categories
    const { categoryOptions } = useTransactionCategoryOptions({
      filteredTx,
      categoryFilter,
      filterTransactionsWithoutLogos: Boolean(filterTransactionsWithoutLogos),
      t,
      locale,
      customCategories,
    })

    // Filter transactions by Type (All / Income / Expense / Transfers / Duplicates / Modified)
    // GHOST TRANSACTIONS ARE NEVER SHOWN IN 'all', 'income', 'expense', 'duplicates', or 'modified'!
    const effectiveTx = useMemo(() => {
      if (typeFilter === 'all') {
        return normalTx
      }
      if (typeFilter === 'transfers') {
        return ghostTx
      }
      if (typeFilter === 'duplicates') {
        return duplicateTx
      }
      if (typeFilter === 'modified') {
        return modifiedTx
      }
      return normalTx.filter((tx) => tx.type === typeFilter)
    }, [normalTx, ghostTx, duplicateTx, modifiedTx, typeFilter])

    // Total pages and sliced page transactions
    const totalPages = Math.max(1, Math.ceil(effectiveTx.length / pageSize))
    const safeCurrentPage = Math.min(currentPage, totalPages)

    const visiblePages = useMemo(
      () => getVisiblePages(safeCurrentPage, totalPages),
      [safeCurrentPage, totalPages],
    )

    const pagedTx = useMemo(() => {
      const start = (safeCurrentPage - 1) * pageSize
      return effectiveTx.slice(start, start + pageSize)
    }, [effectiveTx, safeCurrentPage, pageSize])

    // Batch category change handlers and state
    const {
      pendingBatchCategory,
      setPendingBatchCategory,
      handleCategoryChange,
      handleConfirmBatchOnlyThis,
      handleConfirmBatchAll,
    } = useTransactionBatchCategory({
      allTransactions,
      filteredTx,
      setManualCategory,
      setManualCategoriesBulk,
      customKeywords,
      setCustomKeywords,
    })

    const handleResetFilters = () => {
      setSearchTerm('')
      handleTypeFilterChange('all')
      handleCategoryFilterChange('all')
      setSortOrder?.('newest')
      setCurrentPage(1)
    }

    const isFilterActive =
      searchTerm.trim().length > 0 ||
      typeFilter !== 'all' ||
      categoryFilter !== 'all' ||
      sortOrder !== 'newest'

    const sortOptions = useMemo(
      () => [
        { value: 'newest', label: t.newestFirst },
        { value: 'oldest', label: t.oldestFirst },
        { value: 'highest', label: t.highestAmount },
        { value: 'lowest', label: t.lowestAmount },
      ],
      [t],
    )

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`glass-card ${styles.colSpan12}`}
      >
        {/* Header with Icon, Title, and Stat Pills */}
        <TransactionListHeader
          title={t.allTransactions}
          countSubtitle={formatTransactionCount(effectiveTx.length)}
          detachTransactionsFromDashboard={detachTransactionsFromDashboard}
          detachedBadgeTooltip={
            t.detachedBadgeTooltip ||
            'Filters in this list do not affect dashboard charts or metrics'
          }
          detachedBadgeText={t.detachedBadge || 'Detached'}
          statPillInfo={statPillInfo}
        />

        {/* Toolbar with Segmented Filter Tabs, Search, and Selects */}
        <TransactionListToolbar
          typeFilter={typeFilter}
          onTypeFilterChange={handleTypeFilterChange}
          normalCount={normalTx.length}
          incomeCount={incomeCount}
          expenseCount={expenseCount}
          hasGhosts={hasGhosts}
          effectiveGhostCount={effectiveGhostCount}
          duplicateCount={duplicateCount}
          modifiedCount={modifiedCount}
          onShowGhost={setShowGhost}
          searchTerm={searchTerm}
          onSearchTermChange={(val) => {
            setSearchTerm(val)
            setCurrentPage(1)
          }}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={handleCategoryFilterChange}
          categoryOptions={categoryOptions}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          detachTransactionsFromDashboard={detachTransactionsFromDashboard}
          onToggleDetach={() =>
            setDetachTransactionsFromDashboard(!detachTransactionsFromDashboard)
          }
          isFilterActive={isFilterActive}
          onResetFilters={handleResetFilters}
          t={t}
          sortOptions={sortOptions}
        />

        {categoryFilter === 'without-logos' && (
          <div className={styles.noLogoNotice} data-testid="without-logos-filter-badge">
            <div className={styles.noLogoNoticeLeft}>
              <ImageOff size={15} className={styles.noLogoNoticeIcon} aria-hidden="true" />
              <span className={styles.noLogoNoticeText}>
                {t.filterWithoutLogosActiveNotice || 'Showing transactions without logos'}
              </span>
            </div>
            <button
              type="button"
              className={styles.noLogoNoticeClose}
              onClick={() => handleCategoryFilterChange('all')}
              title={t.clear || 'Clear without logos filter'}
              aria-label={t.clear || 'Clear without logos filter'}
              data-testid="clear-without-logos-btn"
            >
              <X size={13} />
            </button>
          </div>
        )}

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
          <TransactionListPagination
            shownCount={pagedTx.length}
            totalCount={effectiveTx.length}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setCurrentPage(1)
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            visiblePages={visiblePages}
            onPageChange={setCurrentPage}
            showingOfText={t.showingOf}
            perPageLabel={t.perPage}
          />
        )}

        {/* Batch Category Confirmation Modal */}
        <BatchCategoryModal
          isOpen={pendingBatchCategory !== null}
          targetTransaction={pendingBatchCategory?.targetTx ?? null}
          newCategory={pendingBatchCategory?.newCategory ?? ''}
          relatedTransactions={pendingBatchCategory?.relatedTx ?? []}
          onClose={() => setPendingBatchCategory(null)}
          onConfirmOnlyThis={handleConfirmBatchOnlyThis}
          onConfirmAll={handleConfirmBatchAll}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      </motion.div>
    )
  },
)

TransactionList.displayName = 'TransactionList'
