import React from 'react'
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, Hash, Info,PiggyBank, ShoppingBag, TrendingDown, Wallet } from 'lucide-react'

import { useFormatters } from '../../../hooks/useFormatters'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { getCategoryColor } from '../../../utils/category-colors'
import { getCategoryIcon } from '../../../utils/category-icons'
import { getCategoryLabel } from '../../../utils/category-utils'

import styles from './InsightCards.module.css'

interface InsightCardsProps {
  transactionCount: number
  incomeCount: number
  expenseCount: number
  avgExpense: number
  avgIncome: number
  avgTransaction: number
  totalIncome: number
  totalExpenses: number
  balance: number
  topCategory: { name: string; amount: number; percent: number } | null
  topCategories: Array<{ name: string; amount: number; percent: number }>
  savingsRate: number
  onIncomeClick?: () => void
  onExpenseClick?: () => void
  onAllClick?: () => void
  onAvgIncomeClick?: () => void
  onAvgExpenseClick?: () => void
  onCategoryClick?: (category: string) => void
}

interface AvgRowProps {
  label: string
  value: string
  barWidth: number
  color: 'emerald' | 'rose' | 'blue' | 'amber'
  customColor?: string
  delay: number
  icon: React.ReactNode
  onClick?: () => void
}

const AvgRow: React.FC<AvgRowProps> = ({ label, value, barWidth, color, customColor, delay, icon, onClick }) => (
  <div
    className={`${styles['avg-row']} ${onClick ? styles['avg-row-clickable'] : ''}`}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    aria-label={onClick ? `View ${label} details` : undefined}
  >
    <div
      className={`${styles['avg-icon']} ${styles[`avg-icon-${color}`]}`}
      style={customColor ? { backgroundColor: `${customColor}18`, color: customColor } : undefined}
    >
      {icon}
    </div>
    <div className={styles['avg-row-content']}>
      <div className={styles['avg-row-header']}>
        <span className={styles['avg-row-label']}>{label}</span>
        <span
          className={`${styles['avg-row-value']} ${styles[`avg-value-${color}`]}`}
          style={customColor ? { color: customColor } : undefined}
        >
          {value}
        </span>
      </div>
      <div className={styles['avg-bar-track']}>
        <motion.div
          className={`${styles['avg-bar-fill']} ${styles[`avg-bar-${color}`]}`}
          style={customColor ? { backgroundColor: customColor } : undefined}
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.7, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
    {onClick && (
      <ArrowUpRight size={12} className={styles['avg-row-chevron']} />
    )}
  </div>
)

export const InsightCards: React.FC<InsightCardsProps> = ({
  transactionCount,
  incomeCount,
  expenseCount,
  avgExpense,
  avgIncome,
  avgTransaction,
  totalIncome,
  totalExpenses,
  balance,
  topCategory,
  topCategories,
  savingsRate,
  onIncomeClick,
  onExpenseClick,
  onAllClick,
  onAvgIncomeClick,
  onAvgExpenseClick,
  onCategoryClick,
}) => {
  const t = useLanguageStore((s) => s.t)
  const currentLocale = useLanguageStore((s) => s.locale)
  const customCategories = useAppStore((s) => s.customCategories)
  const { formatCurrency, formatSavingsRate } = useFormatters()

  const incomeRatio = transactionCount > 0 ? Math.round((incomeCount / transactionCount) * 100) : 0

  // Compute bar widths relative to max avg so bars are always meaningful
  const maxAvg = Math.max(avgIncome, avgExpense, avgTransaction, 0.01)
  const incomeBarW = Math.round((avgIncome / maxAvg) * 100)
  const expenseBarW = Math.round((avgExpense / maxAvg) * 100)

  // Ratio of avg expense to avg income (shows if spending > earning per tx)
  const ratioLabel =
    avgIncome > 0 ? (t.ofAvgIncome || '{percent}%').replace('{percent}', Math.round((avgExpense / avgIncome) * 100).toString()) : null

  const cards = [
    {
      icon: <Hash size={18} />,
      label: t.insightTransactions,
      value: transactionCount.toLocaleString(),
      accent: 'blue' as const,
      extra: (
        <div className={styles['tx-breakdown']}>
          <div className={styles['tx-pills']}>
            <button
              type="button"
              className={`${styles['pill-income']} ${onIncomeClick ? styles['pill-clickable'] : ''}`}
              onClick={(e) => { e.stopPropagation(); onIncomeClick?.() }}
              title={onIncomeClick ? t.income : undefined}
              aria-label={onIncomeClick ? `View ${incomeCount} income transactions` : undefined}
            >
              {incomeCount} {t.income}
            </button>
            <button
              type="button"
              className={`${styles['pill-expense']} ${onExpenseClick ? styles['pill-clickable'] : ''}`}
              onClick={(e) => { e.stopPropagation(); onExpenseClick?.() }}
              title={onExpenseClick ? t.expenses : undefined}
              aria-label={onExpenseClick ? `View ${expenseCount} expense transactions` : undefined}
            >
              {expenseCount} {t.expenses}
            </button>
          </div>
          <div className={styles['tx-bar-track']}>
            <motion.div
              className={styles['tx-bar-fill']}
              initial={{ width: 0 }}
              animate={{ width: `${incomeRatio}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      ),
    },
    {
      icon: <TrendingDown size={18} />,
      label: t.insightAvgTransaction,
      value: formatCurrency(avgExpense),
      accent: 'rose' as const,
      extra: (
        <div className={styles['avg-breakdown']}>
          <AvgRow
            label={t.avgIncomeLabel}
            value={formatCurrency(avgIncome)}
            barWidth={incomeBarW}
            color="emerald"
            delay={0.35}
            icon={<ArrowUpRight size={10} />}
            onClick={onAvgIncomeClick}
          />
          <AvgRow
            label={t.avgExpenseLabel}
            value={formatCurrency(avgExpense)}
            barWidth={expenseBarW}
            color="rose"
            delay={0.45}
            icon={<ArrowDownLeft size={10} />}
            onClick={onAvgExpenseClick}
          />
          {ratioLabel && (
            <p className={styles['avg-ratio']}>{ratioLabel}</p>
          )}
        </div>
      ),
    },
    {
      icon: <ShoppingBag size={18} />,
      label: t.insightTopCategory,
      value: topCategory ? getCategoryLabel(topCategory.name, t, currentLocale, customCategories) : '—',
      accent: 'amber' as const,
      extra: topCategories && topCategories.length > 0 ? (
        <div className={styles['avg-breakdown']}>
          {topCategories.map((cat, idx) => {
            const maxAmount = Math.max(topCategories[0].amount, 0.01)
            const barW = Math.round((cat.amount / maxAmount) * 100)
            const catColor = getCategoryColor(cat.name, customCategories)
            return (
              <AvgRow
                key={`${cat.name}-${idx}`}
                label={getCategoryLabel(cat.name, t, currentLocale, customCategories)}
                value={`${formatCurrency(cat.amount)} (${cat.percent}%)`}
                barWidth={barW}
                color="amber"
                customColor={catColor}
                delay={0.35 + idx * 0.1}
                icon={getCategoryIcon(cat.name, 10, customCategories)}
                onClick={onCategoryClick ? () => onCategoryClick(cat.name) : undefined}
              />
            )
          })}
          <p className={styles['avg-ratio']}>
            {(t.ofTotal || '{percent}% of total expenses').replace('{percent}', String(topCategories.reduce((sum, c) => sum + c.percent, 0)))}
          </p>
        </div>
      ) : (
        <p className={styles.detail}>{t.noExpenseData}</p>
      ),
    },
    {
      icon: <PiggyBank size={18} />,
      label: savingsRate >= 0 ? t.insightSavingsRate : t.deficitRateTitle,
      value: formatSavingsRate(savingsRate),
      tooltip: savingsRate <= -100 ? t.multiplierInfo || 'You spent much more than you earned. For example, a value of 2x means your expenses were twice your income.' : undefined,
      accent: savingsRate >= 0 ? ('emerald' as const) : ('rose' as const),
      extra: totalIncome > 0 ? (
        <div className={styles['avg-breakdown']}>
          <AvgRow
            label={t.totalIncomeLabel}
            value={formatCurrency(totalIncome)}
            barWidth={100}
            color="emerald"
            delay={0.35}
            icon={<ArrowUpRight size={10} />}
            onClick={onIncomeClick}
          />
          <AvgRow
            label={t.totalExpensesLabel}
            value={formatCurrency(totalExpenses)}
            barWidth={totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}
            color="rose"
            delay={0.45}
            icon={<ArrowDownLeft size={10} />}
            onClick={onExpenseClick}
          />
          <AvgRow
            label={balance >= 0 ? t.netSavedLabel : t.netDeficitLabel}
            value={formatCurrency(balance)}
            barWidth={totalIncome > 0 ? Math.min(Math.round((Math.abs(balance) / totalIncome) * 100), 100) : 0}
            color={balance >= 0 ? 'emerald' : 'rose'}
            delay={0.55}
            icon={<Wallet size={10} />}
            onClick={onAllClick}
          />
          <p className={styles['avg-ratio']}>{savingsRate >= 0 ? t.savingsRateLabel : t.deficitRateLabel}</p>
        </div>
      ) : (
        <p className={styles.detail}>{t.noExpenseData}</p>
      ),
    },
  ]

  return (
    <div className={styles.grid}>
      {cards.map((card, i) => (
        <motion.div
          key={`card-${i}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.06 }}
          className={`glass-card ${styles.card} ${styles[`card-${card.accent}`]}`}
        >
          <div className={styles['card-top']}>
            <div className={`${styles.iconBox} ${styles[`accent-${card.accent}`]}`}>
              {card.icon}
            </div>
            <div className={styles['card-text']}>
              <p className={styles.label}>{card.label}</p>
              <div className={styles['value-row']}>
                <p className={styles.value}>{card.value}</p>
                {card.tooltip && (
                  <span className={styles['info-tooltip-wrapper']}>
                    <Info size={14} className={styles['tooltip-icon']} />
                    <span className={styles['info-tooltip-bubble']}>
                      {card.tooltip}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className={styles['card-bottom']}>{card.extra}</div>
        </motion.div>
      ))}
    </div>
  )
}
