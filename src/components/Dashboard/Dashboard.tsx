import React, { useCallback, useDeferredValue, useMemo, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

import { useAccountBalances } from '../../hooks/useAccountBalances'
import {
  getAvailablePeriods,
  getMonthsForPeriod,
  type PeriodFilter as PeriodFilterType,
  useAnalytics,
} from '../../hooks/useAnalytics'
import { useRecurringTransactions } from '../../hooks/useRecurringTransactions'
import { useTransactions } from '../../hooks/useTransactions'
import { useAppStore } from '../../store/useAppStore'
import { hasMerchantLogo } from '../../utils/category-icons'
import { hasExtensiveCategoryData } from '../../utils/category-utils'
import { getDateBounds } from '../../utils/period-utils'
import { BalanceHero } from './BalanceHero'
import { CategoryTrend } from './CategoryTrend'
import { type AvgDetailType, DashboardModals, type DetailModalState } from './DashboardModals'
import { DashboardSubheader } from './DashboardSubheader'
import { ExpenseCategories } from './ExpenseCategories'
import { IncomeVsExpensesChart } from './IncomeVsExpensesChart'
import { InsightCards } from './InsightCards'
import { RecurringExpenses } from './RecurringExpenses'
import { TopMerchants } from './TopMerchants'
import { TransactionList } from './TransactionList'

import styles from './Dashboard.module.css'

const Dashboard: React.FC = () => {
  const importedAccounts = useAppStore((s) => s.importedAccounts)

  // Period filter state. `period` drives the filter UI immediately, while `deferredPeriod`
  // feeds the heavy analytics so React can recompute them in the background without
  // blocking the pills or the custom date picker.
  const [period, setPeriod] = useState<PeriodFilterType>({ mode: 'all', value: '' })
  const deferredPeriod = useDeferredValue(period)

  // Detail modal state (consolidates filter, category, and merchant drilldowns)
  const [activeDetailModal, setActiveDetailModal] = useState<DetailModalState>(null)

  // Avg detail modal
  const [avgDetailType, setAvgDetailType] = useState<AvgDetailType>(null)

  // Savings trend modal
  const [isSavingsTrendOpen, setIsSavingsTrendOpen] = useState(false)

  const handleIncomeDetailClick = useCallback(() => {
    setActiveDetailModal({ type: 'filter', filter: 'income' })
  }, [])

  const handleExpenseDetailClick = useCallback(() => {
    setActiveDetailModal({ type: 'filter', filter: 'expense' })
  }, [])

  const handleSavingsTrendOpen = useCallback(() => {
    setIsSavingsTrendOpen(true)
  }, [])

  const handleAvgIncomeClick = useCallback(() => {
    setAvgDetailType('income')
  }, [])

  const handleAvgExpenseClick = useCallback(() => {
    setAvgDetailType('expense')
  }, [])

  const handleCategoryDetailClick = useCallback((cat: string) => {
    setActiveDetailModal({ type: 'category', category: cat })
  }, [])

  const handleMerchantDetailClick = useCallback((merchant: string) => {
    setActiveDetailModal({ type: 'merchant', merchant })
  }, [])

  const handleDetailModalClose = useCallback(() => {
    setActiveDetailModal(null)
  }, [])

  const handleSavingsTrendClose = useCallback(() => {
    setIsSavingsTrendOpen(false)
  }, [])

  const handleAvgDetailClose = useCallback(() => {
    setAvgDetailType(null)
  }, [])

  const {
    accounts: bankAccounts,
    totalBalance: allAccountsBalance,
    totalTransactionCount: allAccountsTxCount,
    hasMultipleAccounts,
  } = useAccountBalances()

  // Transactions with active period filter applied
  const {
    allTransactions,
    filteredTx,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    typeFilter,
    setTypeFilter,
    selectedInstitution,
    setSelectedInstitution,
    selectedSubAccount,
    setSelectedSubAccount,
    sortOrder,
    setSortOrder,
    setShowGhost,
    ghostCount,
  } = useTransactions(deferredPeriod)

  // Search drives the input immediately; analytics follow the deferred value
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const isAnalyticsStale = period !== deferredPeriod || searchTerm !== deferredSearchTerm

  const detachTransactionsFromDashboard = useAppStore((s) => s.detachTransactionsFromDashboard)
  const setDetachTransactionsFromDashboard = useAppStore(
    (s) => s.setDetachTransactionsFromDashboard,
  )

  const isSingleAccountView = selectedInstitution !== 'all'

  // Transactions filtered by institution and sub-account for accurate per-bank analytics
  const dashboardTransactions = useMemo(() => {
    let txs = allTransactions
    if (selectedInstitution !== 'all') {
      txs = txs.filter((t) => t.institution === selectedInstitution)
    }
    if (selectedSubAccount !== 'all') {
      txs = txs.filter((t) => t.subAccount === selectedSubAccount)
    }
    return txs
  }, [allTransactions, selectedInstitution, selectedSubAccount])

  // Transactions with all active filters (search term, category, type) applied for dashboard analytics
  const filteredDashboardTransactions = useMemo(() => {
    let txs = dashboardTransactions

    const term = deferredSearchTerm.trim().toLowerCase()
    if (term) {
      txs = txs.filter((t) => {
        const descMatch = t.description.toLowerCase().includes(term)
        const catMatch = t.category ? t.category.toLowerCase().includes(term) : false
        return descMatch || catMatch
      })
    }

    if (selectedCategory && selectedCategory !== 'all') {
      if (selectedCategory === 'without-logos') {
        txs = txs.filter((t) => !hasMerchantLogo(t.description, t.counterpartyIban))
      } else {
        txs = txs.filter((t) => t.category === selectedCategory)
      }
    }

    if (typeFilter && typeFilter !== 'all') {
      if (typeFilter === 'transfers') {
        txs = txs.filter((t) => t.isGhost)
      } else if (typeFilter === 'duplicates') {
        txs = txs.filter((t) => Boolean(t.isDuplicate || t.forceImport || t.importedByRuleId))
      } else if (typeFilter === 'modified') {
        txs = txs.filter((t) => Boolean(t.isModified))
      } else {
        txs = txs.filter((t) => t.type === typeFilter && !t.isGhost)
      }
    }

    return txs
  }, [dashboardTransactions, deferredSearchTerm, selectedCategory, typeFilter])

  const isAnyFilterActive =
    !detachTransactionsFromDashboard &&
    (deferredSearchTerm.trim().length > 0 ||
      (Boolean(selectedCategory) && selectedCategory !== 'all') ||
      (Boolean(typeFilter) && typeFilter !== 'all'))

  const effectiveDashboardTransactions = detachTransactionsFromDashboard
    ? dashboardTransactions
    : filteredDashboardTransactions

  // Internal transfers count as real activity in single-account views or when explicitly filtered
  const shouldIncludeGhosts =
    isSingleAccountView || (!detachTransactionsFromDashboard && typeFilter === 'transfers')

  // Single dataset domain shared by the "All" period, the custom picker bounds and its
  // "All time" preset, so every all-time view starts and ends on the same month
  const { minDate, maxDate } = useMemo(
    () => getDateBounds(dashboardTransactions, shouldIncludeGhosts),
    [dashboardTransactions, shouldIncludeGhosts],
  )

  // Complete continuous month sequence for the active period/account domain
  const fullPeriodMonths = useMemo(
    () => getMonthsForPeriod(deferredPeriod, [minDate.substring(0, 7), maxDate.substring(0, 7)]),
    [deferredPeriod, minDate, maxDate],
  )

  // Analytics — all derived data from one centralized hook
  const analytics = useAnalytics(
    effectiveDashboardTransactions,
    deferredPeriod,
    undefined,
    'cat-color-',
    shouldIncludeGhosts,
    fullPeriodMonths,
  )

  // Period picker options always reflect the full account range (cheap scan, no full analytics)
  const periodOptions = useMemo(
    () => getAvailablePeriods(dashboardTransactions, isSingleAccountView),
    [dashboardTransactions, isSingleAccountView],
  )

  // Allow Spending by Category (and Top Merchants) to occupy full row on desktop when lots of data are present
  const isCategoryTrendFullWidth = useMemo(() => {
    if (!analytics.monthlyCategoryData || analytics.monthlyCategoryData.length === 0) {
      return false
    }
    if (analytics.topMerchants.length === 0) {
      return true
    }
    return hasExtensiveCategoryData(analytics.monthlyCategoryData)
  }, [analytics.monthlyCategoryData, analytics.topMerchants.length])

  const { recurringExpenses, totalMonthly: recurringMonthlyTotal } = useRecurringTransactions(
    effectiveDashboardTransactions,
    deferredPeriod,
  )

  const selectedAccountInfo = useMemo(() => {
    if (selectedInstitution === 'all') {
      if (bankAccounts.length === 1) {
        return bankAccounts[0]
      }
      return null
    }
    return bankAccounts.find((a) => a.id === selectedInstitution || a.name === selectedInstitution)
  }, [bankAccounts, selectedInstitution])

  // Determines if the active period encompasses the entire dataset domain
  const isPeriodAllTime = useMemo(() => {
    if (deferredPeriod.mode === 'all') {
      return true
    }
    if (deferredPeriod.mode === 'custom') {
      const { startDate, endDate } = deferredPeriod
      const hasNoBounds = !startDate && !endDate
      const coversMin = !startDate || (minDate && startDate <= minDate)
      const coversMax = !endDate || (maxDate && endDate >= maxDate)
      return Boolean(hasNoBounds || (coversMin && coversMax))
    }
    return false
  }, [deferredPeriod, minDate, maxDate])

  // Current display balance: ensures complete ledger balance for 'all' period matches StickyAccountSwitcher exactly

  const displayBalance = useMemo(() => {
    if (isAnyFilterActive || !isPeriodAllTime) {
      return analytics.balance
    }
    if (selectedInstitution === 'all') {
      return allAccountsBalance
    }
    if (selectedSubAccount !== 'all') {
      const sub = selectedAccountInfo?.subAccounts?.find((s) => s.name === selectedSubAccount)
      return sub ? sub.balance : analytics.balance
    }
    return selectedAccountInfo ? selectedAccountInfo.balance : analytics.balance
  }, [
    isAnyFilterActive,
    isPeriodAllTime,
    selectedInstitution,
    selectedSubAccount,
    analytics.balance,
    allAccountsBalance,
    selectedAccountInfo,
  ])

  const heroRef = useRef<HTMLElement>(null)
  const isHeroInView = useInView(heroRef, { margin: '-60px 0px 0px 0px' })

  const institutionNames = useMemo(
    () => [...new Set(importedAccounts.map((a) => a.institutionName))],
    [importedAccounts],
  )

  return (
    <div className={styles['dashboard-outer']}>
      <DashboardSubheader
        period={period}
        onPeriodChange={setPeriod}
        availableYears={periodOptions.availableYears}
        availableQuarters={periodOptions.availableQuarters}
        availableMonths={periodOptions.availableMonths}
        minDate={minDate}
        maxDate={maxDate}
        bankAccounts={bankAccounts}
        allAccountsBalance={allAccountsBalance}
        allAccountsTxCount={allAccountsTxCount}
        selectedInstitution={selectedInstitution}
        onSelectInstitution={setSelectedInstitution}
        selectedSubAccount={selectedSubAccount}
        onSelectSubAccount={setSelectedSubAccount}
        selectedAccountInfo={selectedAccountInfo}
        displayBalance={displayBalance}
        hasMultipleAccounts={hasMultipleAccounts}
        isHeroInView={isHeroInView}
        totalIncome={analytics.totalIncome}
        totalExpenses={analytics.totalExpenses}
      />

      {/* Main content area */}
      <div className={styles['scroll-area']}>
        {/* Ambient decorative orbs — purely visual, no interaction */}
        <div className={styles['ambient-orbs']} aria-hidden="true">
          <div className={styles['orb-1']} />
          <div className={styles['orb-2']} />
          <div className={styles['orb-3']} />
        </div>
        <main
          className={`container ${isAnalyticsStale ? styles.stale : ''}`}
          aria-busy={isAnalyticsStale}
        >
          <BalanceHero
            ref={heroRef}
            displayBalance={displayBalance}
            totalIncome={analytics.totalIncome}
            totalExpenses={analytics.totalExpenses}
          />

          {/* Insight Cards */}
          <InsightCards
            transactionCount={analytics.transactionCount}
            incomeCount={analytics.incomeCount}
            expenseCount={analytics.expenseCount}
            avgExpense={analytics.avgExpense}
            avgIncome={analytics.avgIncome}
            avgTransaction={analytics.avgTransaction}
            totalIncome={analytics.totalIncome}
            totalExpenses={analytics.totalExpenses}
            balance={displayBalance}
            topCategory={analytics.topCategory}
            topCategories={analytics.topCategories}
            savingsRate={analytics.savingsRate}
            onIncomeClick={handleIncomeDetailClick}
            onExpenseClick={handleExpenseDetailClick}
            onAllClick={handleSavingsTrendOpen}
            onAvgIncomeClick={handleAvgIncomeClick}
            onAvgExpenseClick={handleAvgExpenseClick}
            onCategoryClick={handleCategoryDetailClick}
          />

          {/* Charts Grid */}
          <div className={styles['dashboard-grid']}>
            {/* Income vs Expenses Chart */}
            <IncomeVsExpensesChart
              monthlyData={analytics.monthlyData}
              totalIncome={analytics.totalIncome}
              totalExpenses={analytics.totalExpenses}
            />

            {/* Expense Categories full-row interactive breakdown */}
            <ExpenseCategories
              categoryBreakdown={analytics.categoryBreakdown}
              totalExpenses={analytics.totalExpenses}
              onCategoryClick={handleCategoryDetailClick}
            />

            {/* Recurring Expenses */}
            <RecurringExpenses
              recurringExpenses={recurringExpenses}
              totalMonthly={recurringMonthlyTotal}
            />

            {/* Top Merchants + Category Trend (side-by-side or full row when lots of data are present) */}
            <TopMerchants
              merchants={analytics.topMerchants}
              totalExpenses={analytics.totalExpenses}
              onMerchantClick={handleMerchantDetailClick}
              fullWidth={isCategoryTrendFullWidth}
            />
            <CategoryTrend
              data={analytics.monthlyCategoryData}
              fullWidth={isCategoryTrendFullWidth}
            />

            {/* Transactions Table */}
            <TransactionList
              filteredTx={filteredTx}
              allTransactions={allTransactions}
              institutionNames={institutionNames}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              selectedInstitution={selectedInstitution}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              setShowGhost={setShowGhost}
              ghostCount={ghostCount}
              showBankName={hasMultipleAccounts && selectedInstitution === 'all'}
              detachTransactionsFromDashboard={detachTransactionsFromDashboard}
              setDetachTransactionsFromDashboard={setDetachTransactionsFromDashboard}
            />
          </div>
        </main>
      </div>

      <DashboardModals
        periodTransactions={analytics.periodTransactions}
        monthlyData={analytics.monthlyData}
        totalIncome={analytics.totalIncome}
        totalExpenses={analytics.totalExpenses}
        savingsRate={analytics.savingsRate}
        showInstitution={hasMultipleAccounts && selectedInstitution === 'all'}
        activeDetailModal={activeDetailModal}
        onDetailModalClose={handleDetailModalClose}
        avgDetailType={avgDetailType}
        onAvgDetailClose={handleAvgDetailClose}
        isSavingsTrendOpen={isSavingsTrendOpen}
        onSavingsTrendClose={handleSavingsTrendClose}
      />
    </div>
  )
}

export default React.memo(Dashboard)
