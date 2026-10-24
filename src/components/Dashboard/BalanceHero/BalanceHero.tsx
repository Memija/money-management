import React from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'

import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'

import styles from './BalanceHero.module.css'

export interface BalanceHeroProps {
  displayBalance: number
  totalIncome: number
  totalExpenses: number
}

export const BalanceHero = React.forwardRef<HTMLElement, BalanceHeroProps>(
  ({ displayBalance, totalIncome, totalExpenses }, ref) => {
    const t = useLanguageStore((s) => s.t)
    const { formatCurrency } = useFormatters()

    return (
      <motion.section
        ref={ref}
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
                {formatCurrency(totalIncome)}
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
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    )
  },
)

BalanceHero.displayName = 'BalanceHero'
