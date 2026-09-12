import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Info, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { MonthlyEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { Modal } from '../../shared/Modal'

import styles from './SavingsTrendModal.module.css'

interface SavingsTrendModalProps {
  isOpen: boolean
  onClose: () => void
  monthlyData: MonthlyEntry[]
  totalIncome: number
  totalExpenses: number
  savingsRate: number
}

interface MonthRowProps {
  month: string
  income: number
  expenses: number
  saved: number
  rate: number
  delay: number
  formatCurrency: (n: number) => string
  formatSavingsRate: (n: number) => string
  tooltipLabel?: string
}

const MonthRow: React.FC<MonthRowProps> = ({ month, income, expenses, saved, rate, delay, formatCurrency, formatSavingsRate, tooltipLabel }) => {
  const isPositive = saved >= 0
  return (
    <motion.tr
      className={styles['month-row']}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25, ease: 'easeOut' }}
    >
      <td className={styles['month-name']}>{month}</td>
      <td className={styles['month-income']}>{formatCurrency(income)}</td>
      <td className={styles['month-expenses']}>{formatCurrency(expenses)}</td>
      <td className={`${styles['month-saved']} ${isPositive ? styles['saved-positive'] : styles['saved-negative']}`}>
        {isPositive ? '+' : ''}{formatCurrency(saved)}
      </td>
      <td className={`${styles['month-rate']} ${isPositive ? styles['rate-positive'] : styles['rate-negative']}`}>
        <div className={styles['rate-cell']}>
          <span>{formatSavingsRate(rate)}</span>
          {rate <= -100 && tooltipLabel && (
            <span className={styles['info-tooltip-wrapper']}>
              <Info size={12} className={styles['info-icon']} />
              <span className={styles['info-tooltip-bubble']}>
                {tooltipLabel}
              </span>
            </span>
          )}
        </div>
      </td>
    </motion.tr>
  )
}

// Custom tooltip for the chart
const ChartTooltip = ({ active, payload, label, formatCurrency }: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
  formatCurrency: (n: number) => string
}) => {
  if (!active || !payload?.length) {
    return null
  }
  const saved = payload[0]?.value ?? 0
  const isPositive = saved >= 0
  return (
    <div className={styles['chart-tooltip']}>
      <p className={styles['chart-tooltip-label']}>{label}</p>
      <p className={`${styles['chart-tooltip-value']} ${isPositive ? styles['saved-positive'] : styles['saved-negative']}`}>
        {isPositive ? '+' : ''}{formatCurrency(saved)}
      </p>
    </div>
  )
}

export const SavingsTrendModal: React.FC<SavingsTrendModalProps> = ({
  isOpen,
  onClose,
  monthlyData,
  totalIncome,
  totalExpenses,
  savingsRate,
}) => {
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency, formatSavingsRate } = useFormatters()

  const enriched = useMemo(() =>
    monthlyData.map((m) => ({
      ...m,
      saved: m.income - m.expenses,
      rate: m.income > 0 ? Math.round(((m.income - m.expenses) / m.income) * 100) : 0,
    })),
    [monthlyData]
  )

  const totalSaved = totalIncome - totalExpenses
  const bestMonth = useMemo(() =>
    enriched.length > 0 ? enriched.reduce((best, m) => m.saved > best.saved ? m : best) : null,
    [enriched]
  )
  const worstMonth = useMemo(() =>
    enriched.length > 0 ? enriched.reduce((worst, m) => m.saved < worst.saved ? m : worst) : null,
    [enriched]
  )

  const isPositive = totalSaved >= 0
  const heroAccent = isPositive ? styles['hero-emerald'] : styles['hero-rose']

  const gradientOffset = useMemo(() => {
    if (enriched.length === 0) return 0
    const dataMax = Math.max(...enriched.map((m) => m.saved))
    const dataMin = Math.min(...enriched.map((m) => m.saved))
    
    if (dataMax <= 0) return 0
    if (dataMin >= 0) return 1
    return dataMax / (dataMax - dataMin)
  }, [enriched])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.savingsTrendTitle || 'Savings Trend'} maxWidth="620px">
      <div className={styles.content}>

        {/* Hero summary */}
        <div className={`${styles.hero} ${heroAccent}`}>
          <div className={styles['hero-icon']}>
            <PiggyBank size={22} />
          </div>
          <div className={styles['hero-text']}>
            <p className={styles['hero-label']}>{isPositive ? (t.netSavedLabel || 'Net Saved') : (t.netDeficitLabel || 'Net Deficit')}</p>
            <p className={styles['hero-value']}>
              {isPositive ? '+' : ''}{formatCurrency(totalSaved)}
            </p>
          </div>
          <div className={`${styles['hero-rate']} ${isPositive ? styles['rate-positive'] : styles['rate-negative']}`}>
            {formatSavingsRate(savingsRate)}
            {savingsRate <= -100 && (
              <span className={styles['info-tooltip-wrapper']}>
                <Info size={14} className={styles['info-icon']} />
                <span className={styles['info-tooltip-bubble']}>
                  {t.multiplierInfo}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Best / worst month pills */}
        {enriched.length > 1 && (
          <div className={styles['highlight-row']}>
            {bestMonth && (
              <div className={styles['highlight-pill-emerald']}>
                <TrendingUp size={12} />
                <span>{t.savingsBestMonth || 'Best'}: <strong>{bestMonth.name}</strong> (+{formatCurrency(bestMonth.saved)})</span>
              </div>
            )}
            {worstMonth && worstMonth.name !== bestMonth?.name && (
               <div className={styles['highlight-pill-rose']}>
                <TrendingDown size={12} />
                <span>{t.savingsWorstMonth || 'Worst'}: <strong>{worstMonth.name}</strong> ({formatCurrency(worstMonth.saved)})</span>
              </div>
            )}
          </div>
        )}

        {/* Trend chart */}
        {enriched.length > 1 && (
          <div className={styles['chart-wrapper']}>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={enriched} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={1} />
                    <stop offset={gradientOffset} stopColor="#f43f5e" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="splitFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={0.02} />
                    <stop offset={gradientOffset} stopColor="#f43f5e" stopOpacity={0.02} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.35} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--text-dim)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--text-dim)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(v)}
                  width={70}
                />
                <Tooltip
                  content={<ChartTooltip formatCurrency={formatCurrency} />}
                />
                <Area
                  type="monotone"
                  dataKey="saved"
                  stroke="url(#splitStroke)"
                  strokeWidth={2}
                  fill="url(#splitFill)"
                  dot={(props: { cx?: number; cy?: number; payload?: { saved: number }; key?: React.Key | null }) => {
                    const { cx, cy, payload, key } = props
                    if (!payload || cx === undefined || cy === undefined) return null
                    return (
                      <circle
                        key={key ?? undefined}
                        cx={cx}
                        cy={cy}
                        r={3}
                        fill={payload.saved >= 0 ? '#10b981' : '#f43f5e'}
                        stroke="none"
                      />
                    )
                  }}
                  activeDot={(props: { cx?: number; cy?: number; payload?: { saved: number }; key?: React.Key | null }) => {
                    const { cx, cy, payload, key } = props
                    if (!payload || cx === undefined || cy === undefined) return null
                    return (
                      <circle
                        key={key ? `active-${key}` : undefined}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill={payload.saved >= 0 ? '#10b981' : '#f43f5e'}
                        stroke="none"
                      />
                    )
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Month-by-month table */}
        {enriched.length > 0 && (
          <div className={styles['table-container']}>
            <table className={styles.table}>
              <thead className={styles['table-header']}>
                <tr>
                  <th>{t.periodMonth || 'Month'}</th>
                  <th>{t.totalIncomeLabel || 'Income'}</th>
                  <th>{t.totalExpensesLabel || 'Expenses'}</th>
                  <th>{isPositive ? (t.netSavedLabel || 'Net Saved') : (t.netDeficitLabel || 'Net Deficit')}</th>
                  <th>{isPositive ? (t.insightSavingsRate || 'Rate') : (t.deficitRateTitle || 'Rate')}</th>
                </tr>
              </thead>
              <tbody className={styles['table-body']}>
                {enriched.map((m, i) => (
                  <MonthRow
                    key={m.rawMonth}
                    month={m.name}
                    income={m.income}
                    expenses={m.expenses}
                    saved={m.saved}
                    rate={m.rate}
                    delay={i * 0.04}
                    formatCurrency={formatCurrency}
                    formatSavingsRate={formatSavingsRate}
                    tooltipLabel={t.multiplierInfo}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {enriched.length === 0 && (
          <p className={styles.empty}>{t.noTransactionsInPeriod || 'No data available.'}</p>
        )}
      </div>
    </Modal>
  )
}
