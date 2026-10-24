import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'

import type { BankAccountSummary } from '../../../hooks/useAccountBalances'
import type { PeriodFilter as PeriodFilterType } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { PeriodFilter } from '../PeriodFilter'
import { StickyAccountSwitcher } from '../StickyAccountSwitcher'

import styles from './DashboardSubheader.module.css'

export interface DashboardSubheaderProps {
  period: PeriodFilterType
  onPeriodChange: (period: PeriodFilterType) => void
  availableYears: string[]
  availableQuarters: string[]
  availableMonths: string[]
  minDate: string
  maxDate: string
  bankAccounts: BankAccountSummary[]
  allAccountsBalance: number
  allAccountsTxCount: number
  selectedInstitution: string
  onSelectInstitution: (id: string) => void
  selectedSubAccount: string
  onSelectSubAccount: (id: string) => void
  selectedAccountInfo?: BankAccountSummary | null
  displayBalance: number
  hasMultipleAccounts: boolean
  isHeroInView: boolean
  totalIncome: number
  totalExpenses: number
}

export const DashboardSubheader: React.FC<DashboardSubheaderProps> = ({
  period,
  onPeriodChange,
  availableYears,
  availableQuarters,
  availableMonths,
  minDate,
  maxDate,
  bankAccounts,
  allAccountsBalance,
  allAccountsTxCount,
  selectedInstitution,
  onSelectInstitution,
  selectedSubAccount,
  onSelectSubAccount,
  selectedAccountInfo,
  displayBalance,
  hasMultipleAccounts,
  isHeroInView,
  totalIncome,
  totalExpenses,
}) => {
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency } = useFormatters()

  return (
    <div className={styles['subheader-bar']}>
      <div className={styles['subheader-inner']}>
        <div className={styles['subheader-left']}>
          <PeriodFilter
            period={period}
            onPeriodChange={onPeriodChange}
            availableYears={availableYears}
            availableQuarters={availableQuarters}
            availableMonths={availableMonths}
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
              onSelectInstitution={onSelectInstitution}
              selectedSubAccount={selectedSubAccount}
              onSelectSubAccount={onSelectSubAccount}
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
                      {formatCurrency(totalIncome)}
                    </span>
                  </div>
                  <div className={styles['sticky-stat-divider']} />
                  <div className={styles['sticky-stat-item']}>
                    <TrendingDown size={14} className={styles['text-danger']} />
                    <span className={styles['sticky-stat-label']}>{t.expenses}:</span>
                    <span className={`${styles['sticky-stat-value']} privacy-blur`}>
                      {formatCurrency(totalExpenses)}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

DashboardSubheader.displayName = 'DashboardSubheader'
