import React, { useMemo, useRef, useState } from 'react'
import { AnimatePresence,motion, useInView } from 'framer-motion'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'

import type { PeriodFilter as PeriodFilterType } from '../../hooks/useAnalytics'
import { useAnalytics } from '../../hooks/useAnalytics'
import { useFormatters } from '../../hooks/useFormatters'
import { useRecurringTransactions } from '../../hooks/useRecurringTransactions'
import { useTransactions } from '../../hooks/useTransactions'
import { useAppStore } from '../../store/useAppStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import { getCategoryLabel } from '../../utils/category-utils'
import { TransactionPreviewModal } from '../shared/TransactionPreviewModal'
import { AvgDetailModal } from './AvgDetailModal/AvgDetailModal'
import { CategoryTrend } from './CategoryTrend'
import { ExpenseCategories } from './ExpenseCategories'
import { IncomeVsExpensesChart } from './IncomeVsExpensesChart'
import { InsightCards } from './InsightCards'
import { PeriodFilter } from './PeriodFilter'
import { RecurringExpenses } from './RecurringExpenses'
import { SavingsTrendModal } from './SavingsTrendModal/SavingsTrendModal'
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

  // Transactions with active period filter applied
  const {
    allTransactions,
    filteredTx,
    searchTerm,
    setSearchTerm,
    selectedInstitution,
    setSelectedInstitution,
    sortOrder,
    setSortOrder,
    showGhost,
    setShowGhost,
    ghostCount,
  } = useTransactions(period)

  // Analytics — all derived data from one centralized hook
  const analytics = useAnalytics(allTransactions, period, formatMonthYear)

  const { recurringExpenses, totalMonthly: recurringMonthlyTotal } = useRecurringTransactions(allTransactions)

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


  return (
    <div className={styles['dashboard-outer']}>
      {/* Subheader — plain flex item above the scroll area, no position tricks needed */}
      <div className={styles['subheader-bar']}>
        <div className={styles['subheader-inner']}>
          <PeriodFilter
            period={period}
            onPeriodChange={setPeriod}
            availableYears={analytics.availableYears}
            availableQuarters={analytics.availableQuarters}
            availableMonths={analytics.availableMonths}
          />

          <AnimatePresence>
            {!isHeroInView && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className={styles['sticky-stats']}
              >
                <div className={styles['sticky-stat-item']}>
                  <Wallet size={14} className={styles['text-muted']} />
                  <span className={styles['sticky-stat-label']}>{t.totalBalance}:</span>
                  <span
                    className={`${styles['sticky-stat-value']} ${
                      analytics.balance >= 0 ? styles['text-primary'] : styles['text-danger']
                    }`}
                  >
                    {formatCurrency(analytics.balance)}
                  </span>
                </div>
                <div className={styles['sticky-stat-divider']} />
                <div className={styles['sticky-stat-item']}>
                  <TrendingUp size={14} className={styles['text-primary']} />
                  <span className={styles['sticky-stat-label']}>{t.income}:</span>
                  <span className={styles['sticky-stat-value']}>{formatCurrency(analytics.totalIncome)}</span>
                </div>
                <div className={styles['sticky-stat-divider']} />
                <div className={styles['sticky-stat-item']}>
                  <TrendingDown size={14} className={styles['text-danger']} />
                  <span className={styles['sticky-stat-label']}>{t.expenses}:</span>
                  <span className={styles['sticky-stat-value']}>{formatCurrency(analytics.totalExpenses)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            className={`${styles['balance-hero']} ${analytics.balance < 0 ? styles.negative : ''}`}
          >
          <p className={styles['balance-label']}>{t.totalBalance}</p>
          <h1 className={styles['balance-amount']}>{formatCurrency(analytics.balance)}</h1>
          <div className={styles['balance-stats']}>
            <div className={styles['stat-item']}>
              <div className={`${styles['icon-box']} ${styles['icon-income']}`}>
                <TrendingUp size={18} />
              </div>
              <div className={styles['stat-text-container']}>
                <p className={styles['stat-label']}>{t.income}</p>
                <p className={styles['stat-value']}>{formatCurrency(analytics.totalIncome)}</p>
              </div>
            </div>
            <div className={styles['stat-item']}>
              <div className={`${styles['icon-box']} ${styles['icon-expense']}`}>
                <TrendingDown size={18} />
              </div>
              <div className={styles['stat-text-container']}>
                <p className={styles['stat-label']}>{t.expenses}</p>
                <p className={styles['stat-value']}>{formatCurrency(analytics.totalExpenses)}</p>
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
          balance={analytics.balance}
          topCategory={analytics.topCategory}
          topCategories={analytics.topCategories}
          savingsRate={analytics.savingsRate}
          onIncomeClick={() => setActiveDetailModal({ type: 'filter', filter: 'income' })}
          onExpenseClick={() => setActiveDetailModal({ type: 'filter', filter: 'expense' })}
          onAllClick={() => setIsSavingsTrendOpen(true)}
          onAvgIncomeClick={() => setAvgDetailType('income')}
          onAvgExpenseClick={() => setAvgDetailType('expense')}
          onCategoryClick={(cat) => setActiveDetailModal({ type: 'category', category: cat })}
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
            onCategoryClick={(cat) => setActiveDetailModal({ type: 'category', category: cat })}
          />

          {/* Recurring Expenses */}
          <RecurringExpenses
            recurringExpenses={recurringExpenses}
            totalMonthly={recurringMonthlyTotal}
          />

          {/* Top Merchants + Category Trend side by side */}
          <TopMerchants
            merchants={analytics.topMerchants}
            totalExpenses={analytics.totalExpenses}
            onMerchantClick={(merchant) => setActiveDetailModal({ type: 'merchant', merchant })}
          />
          <CategoryTrend
            data={analytics.monthlyCategoryData}
          />


          {/* Transactions Table */}
          <TransactionList
            filteredTx={filteredTx}
            institutionNames={institutionNames}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedInstitution={selectedInstitution}
            setSelectedInstitution={setSelectedInstitution}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            showGhost={showGhost}
            setShowGhost={setShowGhost}
            ghostCount={ghostCount}
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
        showInstitution={true}
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
    </div>
  )
}

export default Dashboard
