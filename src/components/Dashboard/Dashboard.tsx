import React, { startTransition, useCallback, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'

import { useAccountBalances } from '../../hooks/useAccountBalances'
import { getMonthsForPeriod, type PeriodFilter as PeriodFilterType } from '../../hooks/useAnalytics'
import { useAnalytics } from '../../hooks/useAnalytics'
import { useFormatters } from '../../hooks/useFormatters'
import { useRecurringTransactions } from '../../hooks/useRecurringTransactions'
import { useTransactions } from '../../hooks/useTransactions'
import { useAppStore } from '../../store/useAppStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import { hasMerchantLogo } from '../../utils/category-icons'
import { hasExtensiveCategoryData } from '../../utils/category-utils'
import { CategoryTrend } from './CategoryTrend'
import { type AvgDetailType, DashboardModals, type DetailModalState } from './DashboardModals'
import { ExpenseCategories } from './ExpenseCategories'
import { IncomeVsExpensesChart } from './IncomeVsExpensesChart'
import { InsightCards } from './InsightCards'
import { PeriodFilter } from './PeriodFilter'
import { RecurringExpenses } from './RecurringExpenses'
import { StickyAccountSwitcher } from './StickyAccountSwitcher'
import { TopMerchants } from './TopMerchants'
import { TransactionList } from './TransactionList'

import styles from './Dashboard.module.css'

const Dashboard: React.FC = () => {
  const importedAccounts = useAppStore((s) => s.importedAccounts)
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency } = useFormatters()

  // Period filter state
  const [period, setPeriod] = useState<PeriodFilterType>({ mode: 'all', value: '' })

  // Detail modal state (consolidates filter, category, and merchant drilldowns)
  const [activeDetailModal, setActiveDetailModal] = useState<DetailModalState>(null)

  // Avg detail modal
  const [avgDetailType, setAvgDetailType] = useState<AvgDetailType>(null)

  // Savings trend modal
  const [isSavingsTrendOpen, setIsSavingsTrendOpen] = useState(false)

  const handlePeriodChange = useCallback((nextPeriod: PeriodFilterType) => {
    startTransition(() => {
      setPeriod(nextPeriod)
    })
  }, [])

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
  } = useTransactions(period)

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

    const term = searchTerm.trim().toLowerCase()
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
  }, [dashboardTransactions, searchTerm, selectedCategory, typeFilter])

  const isAnyFilterActive =
    !detachTransactionsFromDashboard &&
    (searchTerm.trim().length > 0 ||
      (Boolean(selectedCategory) && selectedCategory !== 'all') ||
      (Boolean(typeFilter) && typeFilter !== 'all'))

  const effectiveDashboardTransactions = detachTransactionsFromDashboard
    ? dashboardTransactions
    : filteredDashboardTransactions

  // Complete continuous month sequence for the active period/account domain
  const fullPeriodMonths = useMemo(() => {
    const rawMonths: string[] = []
    for (const t of dashboardTransactions) {
      if (t.isGhost) continue
      rawMonths.push(t.date.substring(0, 7))
    }
    return getMonthsForPeriod(period, rawMonths)
  }, [dashboardTransactions, period])

  // Dataset timeframe boundaries for custom range picker
  const { minDate, maxDate } = useMemo(() => {
    let min = ''
    let max = ''
    for (const t of dashboardTransactions) {
      const d = t.date ? t.date.substring(0, 10) : ''
      if (!d) continue
      if (!min || d < min) min = d
      if (!max || d > max) max = d
    }
    return { minDate: min, maxDate: max }
  }, [dashboardTransactions])

  // Analytics — all derived data from one centralized hook
  const analytics = useAnalytics(
    effectiveDashboardTransactions,
    period,
    undefined,
    'cat-color-',
    isSingleAccountView || (!detachTransactionsFromDashboard && typeFilter === 'transfers'),
    fullPeriodMonths,
  )

  // Full bank analytics for period picker options (so period options always show full account range)
  const fullBankAnalytics = useAnalytics(
    dashboardTransactions,
    period,
    undefined,
    'cat-color-',
    isSingleAccountView,
    fullPeriodMonths,
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
    period,
  )

  const selectedAccountInfo = useMemo(() => {
    if (selectedInstitution === 'all') {
      if (bankAccounts.length === 1) return bankAccounts[0]
      return null
    }
    return bankAccounts.find((a) => a.id === selectedInstitution || a.name === selectedInstitution)
  }, [bankAccounts, selectedInstitution])

  // Determines if the active period encompasses the entire dataset domain
  const isPeriodAllTime = useMemo(() => {
    if (period.mode === 'all') return true
    if (period.mode === 'custom') {
      const hasNoBounds = !period.startDate && !period.endDate
      const coversMin = !period.startDate || (minDate && period.startDate <= minDate)
      const coversMax = !period.endDate || (maxDate && period.endDate >= maxDate)
      return Boolean(hasNoBounds || (coversMin && coversMax))
    }
    return false
  }, [period.mode, period.startDate, period.endDate, minDate, maxDate])

  // Current display balance: ensures complete ledger balance for 'all' period matches AccountSelector exactly
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
      {/* Subheader — plain flex item above the scroll area, no position tricks needed */}
      <div className={styles['subheader-bar']}>
        <div className={styles['subheader-inner']}>
          <div className={styles['subheader-left']}>
            <PeriodFilter
              period={period}
              onPeriodChange={handlePeriodChange}
              availableYears={fullBankAnalytics.availableYears}
              availableQuarters={fullBankAnalytics.availableQuarters}
              availableMonths={fullBankAnalytics.availableMonths}
              minDate={minDate}
              maxDate={maxDate}
            />
          </div>

          {bankAccounts.length > 0 && (
            <div className={styles['sticky-stats']}>
              <StickyAccountSwitcher
                accounts={bankAccounts}
                totalBalance={allAccountsBalance}
                totalTransactionCount={allAccountsTxCount}
                selectedInstitution={selectedInstitution}
                onSelectInstitution={setSelectedInstitution}
                selectedSubAccount={selectedSubAccount}
                onSelectSubAccount={setSelectedSubAccount}
                selectedAccountInfo={selectedAccountInfo}
                displayBalance={displayBalance}
                hasMultipleAccounts={hasMultipleAccounts}
              />

              <AnimatePresence>
                {!isHeroInView && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className={styles['sticky-metrics-group']}
                  >
                    <div className={styles['sticky-stat-divider']} />
                    <div className={styles['sticky-stat-item']}>
                      <TrendingUp size={14} className={styles['text-primary']} />
                      <span className={styles['sticky-stat-label']}>{t.income}:</span>
                      <span className={`${styles['sticky-stat-value']} privacy-blur`}>
                        {formatCurrency(analytics.totalIncome)}
                      </span>
                    </div>
                    <div className={styles['sticky-stat-divider']} />
                    <div className={styles['sticky-stat-item']}>
                      <TrendingDown size={14} className={styles['text-danger']} />
                      <span className={styles['sticky-stat-label']}>{t.expenses}:</span>
                      <span className={`${styles['sticky-stat-value']} privacy-blur`}>
                        {formatCurrency(analytics.totalExpenses)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className={styles['scroll-area']}>
        {/* Ambient decorative orbs — purely visual, no interaction */}
        <div className={styles['ambient-orbs']} aria-hidden="true">
          <div className={styles['orb-1']} />
          <div className={styles['orb-2']} />
          <div className={styles['orb-3']} />
        </div>
        <main className="container">
          <motion.section
            ref={heroRef}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`${styles['balance-hero']} ${displayBalance < 0 ? styles.negative : ''}`}
          >
            <h1 className={`${styles['balance-amount']} privacy-blur`}>
              {formatCurrency(displayBalance)}
            </h1>
            <div className={styles['balance-stats']}>
              <div className={styles['stat-item']}>
                <div className={`${styles['icon-box']} ${styles['icon-income']}`}>
                  <TrendingUp size={18} />
                </div>
                <div className={styles['stat-text-container']}>
                  <p className={styles['stat-label']}>{t.income}</p>
                  <p className={`${styles['stat-value']} privacy-blur`}>
                    {formatCurrency(analytics.totalIncome)}
                  </p>
                </div>
              </div>
              <div className={styles['stat-item']}>
                <div className={`${styles['icon-box']} ${styles['icon-expense']}`}>
                  <TrendingDown size={18} />
                </div>
                <div className={styles['stat-text-container']}>
                  <p className={styles['stat-label']}>{t.expenses}</p>
                  <p className={`${styles['stat-value']} privacy-blur`}>
                    {formatCurrency(analytics.totalExpenses)}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

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
