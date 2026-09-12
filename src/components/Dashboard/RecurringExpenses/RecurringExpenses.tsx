import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, RefreshCw, TrendingUp } from 'lucide-react'

import { useFormatters } from '../../../hooks/useFormatters'
import type { RecurringExpense } from '../../../hooks/useRecurringTransactions'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { getCategoryColor } from '../../../utils/category-colors'
import { getCategoryIcon } from '../../../utils/category-icons'
import { normalizeDescription } from '../../../utils/category-utils'
import { CategorySelect } from '../../shared/CategorySelect/CategorySelect'

import styles from './RecurringExpenses.module.css'

interface RecurringExpensesProps {
  recurringExpenses: RecurringExpense[]
  totalMonthly: number
}

export const RecurringExpenses: React.FC<RecurringExpensesProps> = ({
  recurringExpenses,
  totalMonthly,
}) => {
  const t = useLanguageStore((s) => s.t)
  const customCategories = useAppStore((s) => s.customCategories)
  const setManualCategoriesBulk = useAppStore((s) => s.setManualCategoriesBulk)
  const customKeywords = useAppStore((s) => s.customKeywords)
  const setCustomKeywords = useAppStore((s) => s.setCustomKeywords)
  const { formatCurrency, formatChargesCount } = useFormatters()

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  const totalYearly = useMemo(() => totalMonthly * 12, [totalMonthly])

  const handleCategoryChange = (expense: RecurringExpense, newCategory: string) => {
    if (!newCategory) return
    const mapping: Record<string, string> = {}
    ;(expense.transactionIds || []).forEach((txId) => {
      mapping[txId] = newCategory
    })
    setManualCategoriesBulk(mapping)

    const norm = normalizeDescription(expense.name)
    if (norm.length >= 3) {
      const existingKeywords = customKeywords[newCategory] || []
      if (!existingKeywords.some((kw) => kw.toLowerCase() === norm.toLowerCase())) {
        setCustomKeywords(newCategory, [...existingKeywords, norm])
      }
    }
  }

  if (recurringExpenses.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`glass-card ${styles.container}`}
    >
      {/* Header Section with Title & Key Financial Metrics */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconBadge}>
            <RefreshCw size={20} className={styles.spinIcon} />
          </div>
          <div>
            <h3 className={styles.title}>{t.recurringTitle}</h3>
            <p className={styles.subtitle}>
              {recurringExpenses.length === 1
                ? (t.activeSubscriptionsSingular || t.activeSubscriptions.replace('{count}', '1'))
                : t.activeSubscriptions.replace('{count}', String(recurringExpenses.length))}
            </p>
          </div>
        </div>

        {/* Top Summary Stat Pills (Vibrant & Colorful) */}
        <div className={styles.summaryStats}>
          <div className={`${styles.statPill} ${styles.statPillMonthly}`}>
            <div className={styles.statPillHeader}>
              <div className={styles.statIconBadgeMonthly}>
                <Calendar size={13} />
              </div>
              <span className={styles.statLabelMonthly}>{t.monthlyTotal}</span>
            </div>
            <div className={styles.statValue}>
              <span className={styles.statAmountMonthly}>{formatCurrency(totalMonthly)}</span>
              <span className={styles.statFreq}>{t.perMonth}</span>
            </div>
          </div>

          <div className={`${styles.statPill} ${styles.statPillYearly}`}>
            <div className={styles.statPillHeader}>
              <div className={styles.statIconBadgeYearly}>
                <TrendingUp size={13} />
              </div>
              <span className={styles.statLabelYearly}>{t.yearlyTotal}</span>
            </div>
            <div className={styles.statValue}>
              <span className={styles.statAmountYearly}>{formatCurrency(totalYearly)}</span>
              <span className={styles.statFreq}>{t.perYear}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Recurring Cards */}
      <div className={styles.grid}>
        {recurringExpenses.map((expense) => {
          const categoryColor = getCategoryColor(expense.category, customCategories)
          const weightPct = totalMonthly > 0 ? (expense.amount / totalMonthly) * 100 : 0
          const yearlyAmount = expense.amount * 12
          const isDropdownOpen = openDropdownId === expense.id

          return (
            <motion.div
              key={expense.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className={`${styles.card} ${isDropdownOpen ? styles.cardWithOpenDropdown : ''}`}
              style={{
                '--card-accent-color': categoryColor,
              } as React.CSSProperties}
            >
              {/* Card Top: Brand Icon + Title + Category Dropdown + Frequency */}
              <div className={styles.cardHeader}>
                <div className={styles.cardInfo}>
                  <div className={styles.brandIconBox}>
                    {getCategoryIcon(expense.category, 20, customCategories, expense.name)}
                  </div>
                  <div className={styles.nameBlock}>
                    <h4 className={styles.itemName} title={expense.name}>
                      {expense.name}
                    </h4>
                    <div className={styles.categorySelectWrapper}>
                      <CategorySelect
                        value={expense.category || 'Other'}
                        onChange={(newCat) => handleCategoryChange(expense, newCat)}
                        variant="badge"
                        align="left"
                        onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? expense.id : null)}
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
                  <span className={styles.amountValue}>
                    {formatCurrency(expense.amount)}
                  </span>
                  <span className={styles.amountPeriod}>{t.perMonth}</span>
                </div>
                <div className={styles.projectionMeta}>
                  <span className={styles.yearlyEst}>
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
                        width: `${Math.min(100, Math.max(3, weightPct))}%`,
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
        })}
      </div>
    </motion.div>
  )
}
