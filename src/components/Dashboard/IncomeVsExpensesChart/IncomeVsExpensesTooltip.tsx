import React from 'react'

import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'

import styles from './IncomeVsExpensesChart.module.css'

export type IncomeChartViewMode = 'monthly' | 'cumulative'

interface TooltipInjectedProps {
  /** Injected by Recharts */
  active?: boolean
  /** Injected by Recharts */
  payload?: Array<{ value: number; dataKey: string }>
  /** Injected by Recharts */
  label?: string
  viewMode: IncomeChartViewMode
}

interface CustomTooltipProps extends TooltipInjectedProps {
  formatCurrency: (n: number) => string
  formatSavingsRate: (n: number) => string
  formatMonthYear: (d: string) => string
  t: Record<string, string>
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  formatCurrency,
  formatSavingsRate,
  formatMonthYear,
  t,
  viewMode,
}) => {
  if (!active || !payload?.length) {
    return null
  }

  const formattedLabel = formatMonthYear ? formatMonthYear(label ?? '') : label

  if (viewMode === 'cumulative') {
    const cumulativeNet = Number(payload.find((p) => p.dataKey === 'cumulativeNet')?.value ?? 0)
    const isPositive = cumulativeNet >= 0
    return (
      <div className={styles.tooltipContainer}>
        <p className={styles.tooltipHeader}>{formattedLabel}</p>
        <div className={styles.tooltipRow}>
          <div className={styles.tooltipLabelGroup}>
            <span
              className={`${styles.tooltipDot} ${isPositive ? styles.pillDotIncome : styles.pillDotExpense}`}
            />
            <span>{t.cumulativeBalance || 'Cumulative Balance'}</span>
          </div>
          <span
            className={`${styles.tooltipValue} ${isPositive ? styles.tooltipIncomeValue : styles.tooltipExpenseValue}`}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(cumulativeNet)}
          </span>
        </div>
      </div>
    )
  }

  const income = Number(payload.find((p) => p.dataKey === 'income')?.value ?? 0)
  const expenses = Number(payload.find((p) => p.dataKey === 'expenses')?.value ?? 0)
  const net = income - expenses
  const isPositive = net >= 0
  const monthlyRate = income > 0 ? Math.round((net / income) * 100) : expenses > 0 ? -100 : 0

  return (
    <div className={styles.tooltipContainer}>
      <p className={styles.tooltipHeader}>{formattedLabel}</p>

      {/* Income Row */}
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabelGroup}>
          <span className={`${styles.tooltipDot} ${styles.pillDotIncome}`} />
          <span>{t.income || 'Income'}</span>
        </div>
        <span className={`${styles.tooltipValue} ${styles.tooltipIncomeValue} privacy-blur`}>
          +{formatCurrency(income)}
        </span>
      </div>

      {/* Expenses Row */}
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabelGroup}>
          <span className={`${styles.tooltipDot} ${styles.pillDotExpense}`} />
          <span>{t.expenses || 'Expenses'}</span>
        </div>
        <span className={`${styles.tooltipValue} ${styles.tooltipExpenseValue} privacy-blur`}>
          -{formatCurrency(expenses)}
        </span>
      </div>

      <div className={styles.tooltipDivider} />

      {/* Net Row */}
      <div className={styles.tooltipNetRow}>
        <span className={styles.tooltipNetLabel}>
          {isPositive ? t.netSavedLabel || 'Net Saved' : t.netDeficitLabel || 'Net Deficit'}
        </span>
        <span
          className={`${styles.tooltipValue} ${isPositive ? styles.netPositive : styles.netNegative} privacy-blur`}
        >
          {isPositive ? '+' : ''}
          {formatCurrency(net)} ({formatSavingsRate(monthlyRate)})
        </span>
      </div>
    </div>
  )
}

/**
 * Tooltip content that reads translations and formatters from the language store itself,
 * so the chart can hand Recharts a locale-independent `content` element.
 */
export const LocalizedIncomeTooltip: React.FC<TooltipInjectedProps> = (props) => {
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency, formatSavingsRate, formatMonthYear } = useFormatters()

  return (
    <CustomTooltip
      {...props}
      t={t as unknown as Record<string, string>}
      formatCurrency={formatCurrency}
      formatSavingsRate={formatSavingsRate}
      formatMonthYear={formatMonthYear}
    />
  )
}

const SERIES_LABELS: Record<string, { key: string; fallback: string }> = {
  income: { key: 'income', fallback: 'Income' },
  expenses: { key: 'expenses', fallback: 'Expenses' },
  net: { key: 'netSavedLabel', fallback: 'Net Saved' },
  cumulativeNet: { key: 'cumulativeBalance', fallback: 'Cumulative Balance' },
}

interface SeriesLegendLabelProps {
  dataKey: string
  isHidden: boolean
}

/** Self-localizing legend label keyed by series `dataKey`. */
export const SeriesLegendLabel: React.FC<SeriesLegendLabelProps> = ({ dataKey, isHidden }) => {
  const t = useLanguageStore((s) => s.t) as unknown as Record<string, string | undefined>
  const config = SERIES_LABELS[dataKey]
  const label = config ? t[config.key] || config.fallback : dataKey

  return <span className={isHidden ? styles.legendTextHidden : styles.legendText}>{label}</span>
}
