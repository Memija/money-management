import React, { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'

import type { MonthlyEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { type IncomeChartEntry, IncomeVsExpensesPlot } from './IncomeVsExpensesPlot'
import type { IncomeChartViewMode } from './IncomeVsExpensesTooltip'

import styles from './IncomeVsExpensesChart.module.css'

interface IncomeVsExpensesChartProps {
  monthlyData: MonthlyEntry[]
  totalIncome?: number
  totalExpenses?: number
}

export const IncomeVsExpensesChart: React.FC<IncomeVsExpensesChartProps> = React.memo(
  ({ monthlyData, totalIncome: propIncome, totalExpenses: propExpenses }) => {
    const t = useLanguageStore((s) => s.t)
    const { formatCurrency, formatSavingsRate, formatMonthYear } = useFormatters()
    const [viewMode, setViewMode] = useState<IncomeChartViewMode>('monthly')
    const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({})
    const hasNetLine = monthlyData.length > 1

    const handleLegendClick = useCallback(
      (e: { dataKey?: unknown }) => {
        const dataKey = typeof e.dataKey === 'string' ? e.dataKey : undefined
        if (!dataKey) return

        setHiddenSeries((prev) => {
          const isCurrentlyHidden = prev[dataKey]

          if (!isCurrentlyHidden) {
            const activeKeys = ['income', 'expenses']
            if (hasNetLine) {
              activeKeys.push('net')
            }

            const nextHidden: Record<string, boolean> = { ...prev, [dataKey]: true }
            const visibleCount = activeKeys.filter((key) => !nextHidden[key]).length

            if (visibleCount === 0) {
              return prev
            }
          }

          return { ...prev, [dataKey]: !prev[dataKey] }
        })
      },
      [hasNetLine],
    )

    // Derive sums if not passed
    const { netSaved, savingsRate, isNetPositive, avgIncome, avgExpenses } = useMemo(() => {
      const income = propIncome ?? monthlyData.reduce((acc, m) => acc + m.income, 0)
      const expenses = propExpenses ?? monthlyData.reduce((acc, m) => acc + m.expenses, 0)
      const net = income - expenses
      const rate = income > 0 ? Math.round((net / income) * 100) : expenses > 0 ? -100 : 0
      const count = monthlyData.length || 1
      return {
        netSaved: net,
        savingsRate: rate,
        isNetPositive: net >= 0,
        avgIncome: income / count,
        avgExpenses: expenses / count,
      }
    }, [monthlyData, propIncome, propExpenses])

    const chartData = useMemo(() => {
      const result: IncomeChartEntry[] = []
      let runningTotal = 0
      for (const m of monthlyData) {
        const net = m.income - m.expenses
        runningTotal += net
        result.push({ ...m, net, cumulativeNet: runningTotal })
      }
      return result
    }, [monthlyData])

    const gradientOffset = useMemo(() => {
      if (chartData.length === 0) return 0

      const dataMax = Math.max(...chartData.map((d) => d.cumulativeNet))
      const dataMin = Math.min(...chartData.map((d) => d.cumulativeNet))

      if (dataMax <= 0) return 0
      if (dataMin >= 0) return 1
      if (dataMax === dataMin) return 0

      return dataMax / (dataMax - dataMin)
    }, [chartData])

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className={`glass-card ${styles.container}`}
      >
        {/* Header with Title, Timeline Subtitle, Info Metric Pill, and View Toggle */}
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.titleGroup}>
              <h3 className={styles.title}>{t.incomeVsExpenses || 'Income vs Expenses'}</h3>
              {monthlyData.length > 0 && (
                <p className={styles.subtitle}>
                  {monthlyData.length === 1
                    ? formatMonthYear(monthlyData[0].rawMonth || monthlyData[0].name)
                    : `${formatMonthYear(monthlyData[0].rawMonth || monthlyData[0].name)} – ${formatMonthYear(monthlyData[monthlyData.length - 1].rawMonth || monthlyData[monthlyData.length - 1].name)}`}
                </p>
              )}
            </div>

            {/* Live summary pill */}
            {monthlyData.length > 0 && (
              <div className={styles.metricsGroup}>
                <div
                  className={`${styles.metricPill} ${isNetPositive ? styles.netPillPositive : styles.netPillNegative}`}
                  title={
                    isNetPositive
                      ? t.netSavedLabel || 'Net Saved'
                      : t.netDeficitLabel || 'Net Deficit'
                  }
                >
                  {isNetPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span className="privacy-blur">
                    {isNetPositive ? '+' : ''}
                    {formatCurrency(netSaved)}
                  </span>
                  <span className={styles.pillLabel}>({formatSavingsRate(savingsRate)})</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.viewToggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === 'monthly' ? styles.toggleBtnActive : ''}`}
              onClick={() => setViewMode('monthly')}
            >
              {t.viewMonthly || 'Monthly'}
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === 'cumulative' ? styles.toggleBtnActive : ''}`}
              onClick={() => setViewMode('cumulative')}
            >
              {t.viewCumulative || 'Cumulative'}
            </button>
          </div>
        </div>

        {/* Chart container — memoized and locale-independent so language switches skip it */}
        <div className={styles.chartContainer}>
          {monthlyData.length > 0 ? (
            <IncomeVsExpensesPlot
              chartData={chartData}
              viewMode={viewMode}
              gradientOffset={gradientOffset}
              avgIncome={avgIncome}
              avgExpenses={avgExpenses}
              showNetLine={hasNetLine}
              hiddenSeries={hiddenSeries}
              onLegendClick={handleLegendClick}
            />
          ) : (
            <div className={styles.emptyState}>
              <p>{t.noTransactionsInPeriod || 'No data available for this period.'}</p>
            </div>
          )}
        </div>
      </motion.div>
    )
  },
)

IncomeVsExpensesChart.displayName = 'IncomeVsExpensesChart'
