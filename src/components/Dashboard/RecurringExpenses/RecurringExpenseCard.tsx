import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'

import { useFormatters } from '../../../hooks/useFormatters'
import type { RecurringExpense } from '../../../hooks/useRecurringTransactions'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { CustomCategory } from '../../../types'
import { getCategoryColor } from '../../../utils/category-colors'
import { CategoryIcon } from '../../shared/CategoryIcon'
import { CategorySelect } from '../../shared/CategorySelect/CategorySelect'

import styles from './RecurringExpenses.module.css'

const MONTHS_PER_YEAR = 12
const BRAND_ICON_SIZE = 20
const MIN_WEIGHT_BAR_PCT = 3
const MAX_WEIGHT_BAR_PCT = 100
const HOVER_LIFT = { y: -2 }
const HOVER_TRANSITION = { duration: 0.15 }

interface RecurringExpenseCardProps {
  expense: RecurringExpense
  totalMonthly: number
  customCategories: CustomCategory[]
  isDropdownOpen: boolean
  onCategoryChange: (expense: RecurringExpense, newCategory: string) => void
  onDropdownOpenChange: (expenseId: string, isOpen: boolean) => void
}

/**
 * A single recurring expense card. Memoized with stable callbacks so opening one card's
 * category dropdown doesn't re-render every other card.
 */
export const RecurringExpenseCard: React.FC<RecurringExpenseCardProps> = React.memo(({
  expense,
  totalMonthly,
  customCategories,
  isDropdownOpen,
  onCategoryChange,
  onDropdownOpenChange,
}) => {
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency, formatChargesCount } = useFormatters()

  const categoryColor = getCategoryColor(expense.category, customCategories)
  const weightPct = totalMonthly > 0 ? (expense.amount / totalMonthly) * 100 : 0
  const yearlyAmount = expense.amount * MONTHS_PER_YEAR

  const handleCategoryChange = useCallback(
    (newCategory: string) => onCategoryChange(expense, newCategory),
    [expense, onCategoryChange],
  )
  const handleOpenChange = useCallback(
    (isOpen: boolean) => onDropdownOpenChange(expense.id, isOpen),
    [expense.id, onDropdownOpenChange],
  )

  return (
    <motion.div
      whileHover={HOVER_LIFT}
      transition={HOVER_TRANSITION}
      className={`${styles.card} ${isDropdownOpen ? styles.cardWithOpenDropdown : ''}`}
      style={{
        '--card-accent-color': categoryColor,
      } as React.CSSProperties}
    >
      {/* Card Top: Brand Icon + Title + Category Dropdown + Frequency */}
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <div className={styles.brandIconBox}>
            <CategoryIcon
              category={expense.category}
              size={BRAND_ICON_SIZE}
              customCategories={customCategories}
              description={expense.name}
            />
          </div>
          <div className={styles.nameBlock}>
            <h4 className={`${styles.itemName} privacy-blur`} title={expense.name}>
              {expense.name}
            </h4>
            <div className={styles.categorySelectWrapper}>
              <CategorySelect
                value={expense.category || 'Other'}
                onChange={handleCategoryChange}
                variant="badge"
                align="left"
                onOpenChange={handleOpenChange}
              />
            </div>
          </div>
        </div>

        <span className={styles.frequencyTag}>
          <Calendar size={11} className={styles.frequencyIcon} />
          {t.monthlyFrequency}
        </span>
      </div>

      {/* Card Middle: Amount & History */}
      <div className={styles.cardPricing}>
        <div className={styles.amountDisplay}>
          <span className={`${styles.amountValue} privacy-blur`}>
            {formatCurrency(expense.amount)}
          </span>
          <span className={styles.amountPeriod}>{t.perMonth}</span>
        </div>
        <div className={styles.projectionMeta}>
          <span className={`${styles.yearlyEst} privacy-blur`}>
            ~{formatCurrency(yearlyAmount)}{t.perYear}
          </span>
          <span className={styles.bulletDot}>•</span>
          <span className={styles.chargesCount}>
            {formatChargesCount(expense.transactionCount)}
          </span>
        </div>
      </div>

      {/* Card Bottom: Budget Weight Bar (with interactive hover effects) */}
      <div className={styles.cardFooter}>
        <div
          className={styles.weightBarContainer}
          title={`${weightPct.toFixed(1)}%`}
        >
          <div className={styles.weightBarBg}>
            <div
              className={styles.weightBarFill}
              style={{
                width: `${Math.min(MAX_WEIGHT_BAR_PCT, Math.max(MIN_WEIGHT_BAR_PCT, weightPct))}%`,
              }}
            />
          </div>
          <span className={styles.weightPctText}>
            {weightPct.toFixed(1)}%
          </span>
        </div>
      </div>
    </motion.div>
  )
})

RecurringExpenseCard.displayName = 'RecurringExpenseCard'
