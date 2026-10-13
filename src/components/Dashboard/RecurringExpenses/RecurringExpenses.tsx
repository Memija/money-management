import React, { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, RefreshCw, TrendingUp } from 'lucide-react'

import { useFormatters } from '../../../hooks/useFormatters'
import type { RecurringExpense } from '../../../hooks/useRecurringTransactions'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { normalizeDescription } from '../../../utils/category-utils'
import { RecurringExpenseCard } from './RecurringExpenseCard'

import styles from './RecurringExpenses.module.css'

interface RecurringExpensesProps {
  recurringExpenses: RecurringExpense[]
  totalMonthly: number
}

const MONTHS_PER_YEAR = 12
/** Shortest normalized name that is learned as a custom keyword. */
const MIN_KEYWORD_LENGTH = 3

export const RecurringExpenses: React.FC<RecurringExpensesProps> = React.memo(
  ({ recurringExpenses, totalMonthly }) => {
    const t = useLanguageStore((s) => s.t)
    const customCategories = useAppStore((s) => s.customCategories)
    const setManualCategoriesBulk = useAppStore((s) => s.setManualCategoriesBulk)
    const customKeywords = useAppStore((s) => s.customKeywords)
    const setCustomKeywords = useAppStore((s) => s.setCustomKeywords)
    const { formatCurrency } = useFormatters()

    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

    const totalYearly = useMemo(() => totalMonthly * MONTHS_PER_YEAR, [totalMonthly])

    const handleCategoryChange = useCallback(
      (expense: RecurringExpense, newCategory: string) => {
        if (!newCategory) {
          return
        }
        const mapping: Record<string, string> = {}
        ;(expense.transactionIds || []).forEach((txId) => {
          mapping[txId] = newCategory
        })
        setManualCategoriesBulk(mapping)

        const norm = normalizeDescription(expense.name)
        if (norm.length >= MIN_KEYWORD_LENGTH) {
          const existingKeywords = customKeywords[newCategory] || []
          if (!existingKeywords.some((kw) => kw.toLowerCase() === norm.toLowerCase())) {
            setCustomKeywords(newCategory, [...existingKeywords, norm])
          }
        }
      },
      [customKeywords, setCustomKeywords, setManualCategoriesBulk],
    )

    const handleDropdownOpenChange = useCallback((expenseId: string, isOpen: boolean) => {
      // Only clear when the card that owns the open dropdown closes it
      setOpenDropdownId((current) => (isOpen ? expenseId : current === expenseId ? null : current))
    }, [])

    if (recurringExpenses.length === 0) {
      return null
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`glass-card ${styles.container} ${openDropdownId ? styles.containerWithOpenDropdown : ''}`}
        data-testid="recurring-expenses-container"
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
                  ? t.activeSubscriptionsSingular || t.activeSubscriptions.replace('{count}', '1')
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
                <span className={`${styles.statAmountMonthly} privacy-blur`}>
                  {formatCurrency(totalMonthly)}
                </span>
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
                <span className={`${styles.statAmountYearly} privacy-blur`}>
                  {formatCurrency(totalYearly)}
                </span>
                <span className={styles.statFreq}>{t.perYear}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid of Recurring Cards */}
        <div className={styles.grid}>
          {recurringExpenses.map((expense) => (
            <RecurringExpenseCard
              key={expense.id}
              expense={expense}
              totalMonthly={totalMonthly}
              customCategories={customCategories}
              isDropdownOpen={openDropdownId === expense.id}
              onCategoryChange={handleCategoryChange}
              onDropdownOpenChange={handleDropdownOpenChange}
            />
          ))}
        </div>
      </motion.div>
    )
  },
)

RecurringExpenses.displayName = 'RecurringExpenses'
