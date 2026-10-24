import React from 'react'
import { Link2Off, Receipt } from 'lucide-react'

import styles from './TransactionListHeader.module.css'

export interface StatPillInfo {
  countLabel: string
  countValue: number | string
  amountLabel: string
  formattedAmount: string
  amountClass: string
}

export interface TransactionListHeaderProps {
  title: string
  countSubtitle: string
  detachTransactionsFromDashboard?: boolean
  detachedBadgeTooltip?: string
  detachedBadgeText?: string
  statPillInfo: StatPillInfo
}

export const TransactionListHeader: React.FC<TransactionListHeaderProps> = ({
  title,
  countSubtitle,
  detachTransactionsFromDashboard,
  detachedBadgeTooltip,
  detachedBadgeText,
  statPillInfo,
}) => {
  return (
    <div className={styles.header}>
      <div className={styles.titleArea}>
        <div className={styles.iconBadge} aria-hidden="true">
          <Receipt size={22} />
        </div>
        <div className={styles.titleTextContainer}>
          <div className={styles.titleWithBadge}>
            <h3 className={styles.title}>{title}</h3>
            {detachTransactionsFromDashboard && (
              <span
                className={styles.detachedBadge}
                title={
                  detachedBadgeTooltip ||
                  'Filters in this list do not affect dashboard charts or metrics'
                }
                data-testid="transactions-detached-badge"
              >
                <Link2Off size={11} aria-hidden="true" />
                {detachedBadgeText || 'Detached'}
              </span>
            )}
          </div>
          <p className={styles.subtitle}>{countSubtitle}</p>
        </div>
      </div>

      <div className={styles.statPillsGroup}>
        <div className={styles.statPill}>
          <span className={styles.statLabel}>{statPillInfo.countLabel}</span>
          <span className={styles.statValue}>{statPillInfo.countValue}</span>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statLabel}>{statPillInfo.amountLabel}</span>
          <span className={`${styles.statValue} ${statPillInfo.amountClass} privacy-blur`}>
            {statPillInfo.formattedAmount}
          </span>
        </div>
      </div>
    </div>
  )
}
