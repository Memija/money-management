import React, { startTransition, useCallback, useMemo, useRef, useState } from 'react'
import { AnimatePresence,motion, useInView } from 'framer-motion'
import { Share2, TrendingDown, TrendingUp } from 'lucide-react'

import { useAccountBalances } from '../../hooks/useAccountBalances'
import type { PeriodFilter as PeriodFilterType } from '../../hooks/useAnalytics'
import { useAnalytics } from '../../hooks/useAnalytics'
import { useFormatters } from '../../hooks/useFormatters'
import { useRecurringTransactions } from '../../hooks/useRecurringTransactions'
import { useTransactions } from '../../hooks/useTransactions'
import { useAppStore } from '../../store/useAppStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import { getCategoryLabel, hasExtensiveCategoryData } from '../../utils/category-utils'
import { TransactionPreviewModal } from '../shared/TransactionPreviewModal'
import { AvgDetailModal } from './AvgDetailModal/AvgDetailModal'
import { CategoryTrend } from './CategoryTrend'
import { ExpenseCategories } from './ExpenseCategories'
import { IncomeVsExpensesChart } from './IncomeVsExpensesChart'
import { InsightCards } from './InsightCards'
import { PeriodFilter } from './PeriodFilter'
import { RecurringExpenses } from './RecurringExpenses'
import { SavingsTrendModal } from './SavingsTrendModal/SavingsTrendModal'
import { ShareSnapshotModal } from './ShareSnapshotModal'
import { StickyAccountSwitcher } from './StickyAccountSwitcher'
import { TopMerchants } from './TopMerchants'
import { TransactionList } from './TransactionList'

import styles from './Dashboard.module.css'

const Dashboard: React.FC = () => {
  const importedAccounts = useAppStore((s) => s.importedAccounts)
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency, formatMonthYear } = useFormatters()

  // Period filter state
  const [period, setPeriod] = useState<PeriodFilterType>({ mode: 'all', value: '' })

  // Detail modal state (consolidates filter, category, and merchant drilldowns)
  type DetailModalState =
    | { type: 'filter'; filter: 'all' | 'income' | 'expense' }
    | { type: 'category'; category: string }
    | { type: 'merchant'; merchant: string }
    | null

  const [activeDetailModal, setActiveDetailModal] = useState<DetailModalState>(null)

  // Avg detail modal
  const [avgDetailType, setAvgDetailType] = useState<'income' | 'expense' | null>(null)

  // Savings trend modal
  const [isSavingsTrendOpen, setIsSavingsTrendOpen] = useState(false)

  // Social share snapshot modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

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
    selectedInstitution,
    setSelectedInstitution,
    selectedSubAccount,
    setSelectedSubAccount,
    sortOrder,
    setSortOrder,
    setShowGhost,
    ghostCount,
  } = useTransactions(period)

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

  // Analytics — all derived data from one centralized hook
  const analytics = useAnalytics(
    dashboardTransactions,
    period,
    formatMonthYear,
    'cat-color-',
    isSingleAccountView,
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

  const { recurringExpenses, totalMonthly: recurringMonthlyTotal } = useRecurringTransactions(dashboardTransactions)

  const selectedAccountInfo = useMemo(() => {
    if (selectedInstitution === 'all') {
      if (bankAccounts.length === 1) return bankAccounts[0]
      return null
    }
    return bankAccounts.find(
      (a) => a.id === selectedInstitution || a.name === selectedInstitution,
    )
  }, [bankAccounts, selectedInstitution])

  // Current display balance: ensures complete ledger balance for 'all' period matches AccountSelector exactly
  const displayBalance = useMemo(() => {
    if (period.mode !== 'all') {
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
    period.mode,
    selectedInstitution,
    selectedSubAccount,
    analytics.balance,
    allAccountsBalance,
    selectedAccountInfo,
  ])

  // Consolidated modal configuration
  const detailModalConfig = useMemo(() => {
    if (!activeDetailModal) return null

    if (activeDetailModal.type === 'filter') {
      const { filter } = activeDetailModal
      const title =
        filter === 'income'
          ? t.income
          : filter === 'expense'
            ? t.expenses
            : t.allTransactions
      const variant: 'expense' | 'income' = filter === 'expense' ? 'expense' : 'income'
      const transactions = analytics.periodTransactions.filter(
        (tx) => filter === 'all' || tx.type === filter,
      )
      return { title, variant, transactions }
    }

    if (activeDetailModal.type === 'category') {
      const { category } = activeDetailModal
      const title = getCategoryLabel(category, t)
      const variant = 'expense' as const
      const transactions = analytics.periodTransactions.filter(
        (tx) => tx.type === 'expense' && (tx.category || 'Other') === category,
      )
      return { title, variant, transactions }
    }

    if (activeDetailModal.type === 'merchant') {
      const { merchant } = activeDetailModal
      const title = merchant || t.topMerchants
      const variant = 'expense' as const
      const normalizedMerchant = merchant.trim().replace(/\s+/g, ' ').toLowerCase()
      const transactions = analytics.periodTransactions.filter(
        (tx) =>
          tx.type === 'expense' &&
          tx.description.trim().replace(/\s+/g, ' ').toLowerCase() === normalizedMerchant,
      )
      return { title, variant, transactions }
    }

    return null
  }, [activeDetailModal, analytics.periodTransactions, t])

  const heroRef = useRef<HTMLElement>(null)
  const isHeroInView = useInView(heroRef, { margin: '-60px 0px 0px 0px' })

  const institutionNames = useMemo(
    () => [...new Set(importedAccounts.map((a) => a.institutionName))],
    [importedAccounts],
  )

  const periodLabel = useMemo(() => {
    if (period.mode === 'all') return t.periodAll || 'All'
    if (period.mode === 'year') return period.value
    if (period.mode === 'quarter') {
      const [year, quarter] = period.value.split('-Q')
      return `Q${quarter} ${year}`
    }
    if (period.mode === 'month') {
      return formatMonthYear(period.value)
    }
    return period.value
  }, [period, formatMonthYear, t])

  const shareCardCategories = useMemo(() => {
    return analytics.categoryBreakdown.slice(0, 4).map((c) => ({
      name: getCategoryLabel(c.name, t),
      amount: c.value,
      percent:
        analytics.totalExpenses > 0 ? Math.round((c.value / analytics.totalExpenses) * 100) : 0,
      color: c.color,
    }))
  }, [analytics.categoryBreakdown, analytics.totalExpenses, t])

  return (
    <div className={styles['dashboard-outer']}>
      {/* Subheader — plain flex item above the scroll area, no position tricks needed */}
      <div className={styles['subheader-bar']}>
        <div className={styles['subheader-inner']}>
          <div className={styles['subheader-left']}>
            <PeriodFilter
              period={period}
              onPeriodChange={handlePeriodChange}
              availableYears={analytics.availableYears}
              availableQuarters={analytics.availableQuarters}
              availableMonths={analytics.availableMonths}
            />

            <button
              type="button"
              className={styles['share-snapshot-btn']}
              onClick={() => setIsShareModalOpen(true)}
              title={t.shareSnapshot || 'Share Snapshot'}
              aria-label={t.shareSnapshot || 'Share Snapshot'}
              data-testid="dashboard-share-snapshot-btn"
            >
              <Share2 size={15} />
              <span className={styles['share-btn-text']}>{t.shareSnapshot || 'Share Snapshot'}</span>
            </button>
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
                      <span className={`${styles['sticky-stat-value']} privacy-blur`}>{formatCurrency(analytics.totalIncome)}</span>
                    </div>
                    <div className={styles['sticky-stat-divider']} />
                    <div className={styles['sticky-stat-item']}>
                      <TrendingDown size={14} className={styles['text-danger']} />
                      <span className={styles['sticky-stat-label']}>{t.expenses}:</span>
                      <span className={`${styles['sticky-stat-value']} privacy-blur`}>{formatCurrency(analytics.totalExpenses)}</span>
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
            <h1 className={`${styles['balance-amount']} privacy-blur`}>{formatCurrency(displayBalance)}</h1>
          <div className={styles['balance-stats']}>
            <div className={styles['stat-item']}>
              <div className={`${styles['icon-box']} ${styles['icon-income']}`}>
                <TrendingUp size={18} />
              </div>
              <div className={styles['stat-text-container']}>
                <p className={styles['stat-label']}>{t.income}</p>
                <p className={`${styles['stat-value']} privacy-blur`}>{formatCurrency(analytics.totalIncome)}</p>
              </div>
            </div>
            <div className={styles['stat-item']}>
              <div className={`${styles['icon-box']} ${styles['icon-expense']}`}>
                <TrendingDown size={18} />
              </div>
              <div className={styles['stat-text-container']}>
                <p className={styles['stat-label']}>{t.expenses}</p>
                <p className={`${styles['stat-value']} privacy-blur`}>{formatCurrency(analytics.totalExpenses)}</p>
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
            selectedInstitution={selectedInstitution}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            setShowGhost={setShowGhost}
            ghostCount={ghostCount}
            showBankName={hasMultipleAccounts && selectedInstitution === 'all'}
          />
        </div>
        </main>
      </div>

      {/* Consolidated Transaction detail modal */}
      <TransactionPreviewModal
        isOpen={activeDetailModal !== null}
        onClose={() => setActiveDetailModal(null)}
        title={detailModalConfig?.title ?? ''}
        variant={detailModalConfig?.variant ?? 'expense'}
        transactions={detailModalConfig?.transactions ?? []}
        showInstitution={hasMultipleAccounts && selectedInstitution === 'all'}
        isImport={false}
      />

      {/* Avg detail modal — opened from Avg. Transaction card rows */}
      {avgDetailType !== null && (
        <AvgDetailModal
          isOpen
          onClose={() => setAvgDetailType(null)}
          type={avgDetailType}
          transactions={analytics.periodTransactions}
        />
      )}

      {/* Savings trend modal — opened from Net Saved row */}
      <SavingsTrendModal
        isOpen={isSavingsTrendOpen}
        onClose={() => setIsSavingsTrendOpen(false)}
        monthlyData={analytics.monthlyData}
        totalIncome={analytics.totalIncome}
        totalExpenses={analytics.totalExpenses}
        savingsRate={analytics.savingsRate}
      />

      {/* Social Share Snapshot Modal */}
      <ShareSnapshotModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        periodLabel={periodLabel}
        totalIncome={analytics.totalIncome}
        totalExpenses={analytics.totalExpenses}
        netSavings={analytics.balance}
        savingsRate={analytics.savingsRate}
        topCategories={shareCardCategories}
      />
    </div>
  )
}

export default Dashboard
