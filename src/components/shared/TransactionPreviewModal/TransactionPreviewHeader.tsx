import React from 'react'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'

import type { TranslationStrings } from '../../../i18n/types'

import styles from './TransactionPreviewModal.module.css'

export interface TransactionPreviewHeaderProps {
  title?: string
  effectiveTitle: string
  variant?: 'income' | 'expense'
  totalCount: number
  totalInflows: number
  totalOutflows: number
  formatCurrency: (amount: number) => string
  formatTransactionCount: (count: number) => string
  t: TranslationStrings
}

export const TransactionPreviewHeader: React.FC<TransactionPreviewHeaderProps> = ({
  effectiveTitle,
  variant,
  totalCount,
  totalInflows,
  totalOutflows,
  formatCurrency,
  formatTransactionCount,
  t,
}) => {
  const isIncome = variant === 'income'
  const isExpense = variant === 'expense'

  return (
    <div className={styles['modal-header-custom']}>
      <div className={styles['header-left']}>
        <div
          className={`${styles['header-icon-box']} ${
            isIncome ? styles['header-icon-income'] : isExpense ? styles['header-icon-expense'] : ''
          }`}
        >
          {isIncome ? (
            <TrendingUp size={20} />
          ) : isExpense ? (
            <TrendingDown size={20} />
          ) : (
            <Wallet size={20} />
          )}
        </div>
        <div className={styles['header-titles']}>
          <h2 className={styles['modal-title']} title={effectiveTitle}>
            {effectiveTitle}
          </h2>
          <div className={styles['summary-chips']}>
            <span className={styles['summary-chip']}>
              {formatTransactionCount(totalCount)}
            </span>
            {isIncome ? (
              <span
                className={`${styles['summary-chip']} ${styles['summary-amount-chip']} ${styles['summary-chip-income']}`}
                data-testid="modal-total-income"
              >
                <TrendingUp size={12} aria-hidden="true" />
                +{formatCurrency(totalInflows)}
              </span>
            ) : isExpense ? (
              <span
                className={`${styles['summary-chip']} ${styles['summary-amount-chip']} ${styles['summary-chip-expense']}`}
                data-testid="modal-total-expense"
              >
                <TrendingDown size={12} aria-hidden="true" />
                -{formatCurrency(totalOutflows)}
              </span>
            ) : (
              <>
                <span
                  className={`${styles['summary-chip']} ${styles['summary-amount-chip']} ${styles['summary-chip-income']}`}
                  title={`${t.inflows || 'Inflows'}: +${formatCurrency(totalInflows)}`}
                  data-testid="modal-total-inflow"
                >
                  <TrendingUp size={12} aria-hidden="true" />
                  +{formatCurrency(totalInflows)}
                </span>
                <span
                  className={`${styles['summary-chip']} ${styles['summary-amount-chip']} ${styles['summary-chip-expense']}`}
                  title={`${t.outflows || 'Outflows'}: -${formatCurrency(totalOutflows)}`}
                  data-testid="modal-total-outflow"
                >
                  <TrendingDown size={12} aria-hidden="true" />
                  -{formatCurrency(totalOutflows)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
