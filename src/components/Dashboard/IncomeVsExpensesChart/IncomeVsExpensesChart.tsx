import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { MonthlyEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'

import styles from './IncomeVsExpensesChart.module.css'

interface IncomeVsExpensesChartProps {
  monthlyData: MonthlyEntry[]
  totalIncome?: number
  totalExpenses?: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
  label?: string
  formatCurrency: (n: number) => string
  formatSavingsRate: (n: number) => string
  t: Record<string, string>
  viewMode: 'monthly' | 'cumulative'
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  formatCurrency,
  formatSavingsRate,
  t,
  viewMode,
}) => {
  if (!active || !payload?.length) {
    return null
  }

  if (viewMode === 'cumulative') {
    const cumulativeNet = Number(payload.find((p) => p.dataKey === 'cumulativeNet')?.value ?? 0)
    const isPositive = cumulativeNet >= 0
    return (
      <div className={styles.tooltipContainer}>
        <p className={styles.tooltipHeader}>{label}</p>
        <div className={styles.tooltipRow}>
          <div className={styles.tooltipLabelGroup}>
            <span className={`${styles.tooltipDot} ${isPositive ? styles.pillDotIncome : styles.pillDotExpense}`} />
            <span>{t.cumulativeBalance || 'Cumulative Balance'}</span>
          </div>
          <span className={`${styles.tooltipValue} ${isPositive ? styles.tooltipIncomeValue : styles.tooltipExpenseValue}`}>
            {isPositive ? '+' : ''}{formatCurrency(cumulativeNet)}
          </span>
        </div>
      </div>
    )
  }

  const income = Number(payload.find((p) => p.dataKey === 'income')?.value ?? 0)
  const expenses = Number(payload.find((p) => p.dataKey === 'expenses')?.value ?? 0)
  const net = income - expenses
  const isPositive = net >= 0
  const monthlyRate = income > 0 ? Math.round((net / income) * 100) : (expenses > 0 ? -100 : 0)

  return (
    <div className={styles.tooltipContainer}>
      <p className={styles.tooltipHeader}>{label}</p>

      {/* Income Row */}
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabelGroup}>
          <span className={`${styles.tooltipDot} ${styles.pillDotIncome}`} />
          <span>{t.income || 'Income'}</span>
        </div>
        <span className={`${styles.tooltipValue} ${styles.tooltipIncomeValue}`}>
          +{formatCurrency(income)}
        </span>
      </div>

      {/* Expenses Row */}
      <div className={styles.tooltipRow}>
        <div className={styles.tooltipLabelGroup}>
          <span className={`${styles.tooltipDot} ${styles.pillDotExpense}`} />
          <span>{t.expenses || 'Expenses'}</span>
        </div>
        <span className={`${styles.tooltipValue} ${styles.tooltipExpenseValue}`}>
          -{formatCurrency(expenses)}
        </span>
      </div>

      <div className={styles.tooltipDivider} />

      {/* Net Row */}
      <div className={styles.tooltipNetRow}>
        <span className={styles.tooltipNetLabel}>
          {isPositive ? (t.netSavedLabel || 'Net Saved') : (t.netDeficitLabel || 'Net Deficit')}
        </span>
        <span className={`${styles.tooltipValue} ${isPositive ? styles.netPositive : styles.netNegative}`}>
          {isPositive ? '+' : ''}{formatCurrency(net)} ({formatSavingsRate(monthlyRate)})
        </span>
      </div>
    </div>
  )
}

export const IncomeVsExpensesChart: React.FC<IncomeVsExpensesChartProps> = ({
  monthlyData,
  totalIncome: propIncome,
  totalExpenses: propExpenses,
}) => {
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency, formatSavingsRate } = useFormatters()
  const [viewMode, setViewMode] = useState<'monthly' | 'cumulative'>('monthly')
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({})

  const handleLegendClick = (e: { dataKey?: unknown }) => {
    const dataKey = typeof e.dataKey === 'string' ? e.dataKey : undefined
    if (!dataKey) return

    setHiddenSeries((prev) => {
      const isCurrentlyHidden = prev[dataKey]
      
      if (!isCurrentlyHidden) {
        const activeKeys = ['income', 'expenses']
        if (monthlyData.length > 1) {
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
  }

  const renderLegendText = (value: string, entry: { dataKey?: unknown }) => {
    const isHidden = typeof entry.dataKey === 'string' ? hiddenSeries[entry.dataKey] : false
    return (
      <span className={isHidden ? styles.legendTextHidden : styles.legendText}>
        {value}
      </span>
    )
  }

  // Derive sums if not passed
  const { netSaved, savingsRate, isNetPositive, avgIncome, avgExpenses } = useMemo(() => {
    const income = propIncome ?? monthlyData.reduce((acc, m) => acc + m.income, 0)
    const expenses = propExpenses ?? monthlyData.reduce((acc, m) => acc + m.expenses, 0)
    const net = income - expenses
    const rate = income > 0 ? Math.round((net / income) * 100) : (expenses > 0 ? -100 : 0)
    const count = monthlyData.length || 1
    return {
      sumIncome: income,
      sumExpenses: expenses,
      netSaved: net,
      savingsRate: rate,
      isNetPositive: net >= 0,
      avgIncome: income / count,
      avgExpenses: expenses / count,
    }
  }, [monthlyData, propIncome, propExpenses])

  const chartData = useMemo(() => {
    const result: Array<MonthlyEntry & { net: number; cumulativeNet: number }> = []
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

  const formatYAxis = (v: number) => {
    if (v === 0) return '0'
    const abs = Math.abs(v)
    const sign = v < 0 ? '-' : ''
    if (abs >= 1_000_000) {
      const num = abs / 1_000_000
      const formatted = num >= 100 ? num.toFixed(0) : num.toFixed(1).replace(/\.0$/, '')
      return `${sign}${formatted}M`
    }
    if (abs >= 1_000) {
      const num = abs / 1_000
      const formatted = num >= 100 ? num.toFixed(0) : num.toFixed(1).replace(/\.0$/, '')
      return `${sign}${formatted}k`
    }
    return `${sign}${Math.round(abs)}`
  }

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
                  ? monthlyData[0].name
                  : `${monthlyData[0].name} – ${monthlyData[monthlyData.length - 1].name}`}
              </p>
            )}
          </div>

          {/* Live summary pill */}
          {monthlyData.length > 0 && (
            <div className={styles.metricsGroup}>
              <div
                className={`${styles.metricPill} ${isNetPositive ? styles.netPillPositive : styles.netPillNegative}`}
                title={isNetPositive ? (t.netSavedLabel || 'Net Saved') : (t.netDeficitLabel || 'Net Deficit')}
              >
                {isNetPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{isNetPositive ? '+' : ''}{formatCurrency(netSaved)}</span>
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

      {/* Chart container */}
      <div className={styles.chartContainer}>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'monthly' ? (
              <ComposedChart
                data={chartData}
                barGap={6}
                barCategoryGap="22%"
                margin={{ top: 12, right: 8, left: -16, bottom: 4 }}
              >
                <defs>
                  {/* Income Gradient */}
                  <linearGradient id="chartIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.35} />
                  </linearGradient>
                  {/* Expense Gradient */}
                  <linearGradient id="chartExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.35} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--card-border)"
                  opacity={0.6}
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
                  dy={6}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
                  tickFormatter={formatYAxis}
                />

                <Tooltip
                  content={
                    <CustomTooltip
                      formatCurrency={formatCurrency}
                      formatSavingsRate={formatSavingsRate}
                      t={t as unknown as Record<string, string>}
                      viewMode={viewMode}
                    />
                  }
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)', radius: 8 }}
                />

                <Legend
                  onClick={handleLegendClick}
                  formatter={renderLegendText}
                  wrapperStyle={{ paddingTop: '10px', cursor: 'pointer' }}
                />

                <Bar
                  dataKey="income"
                  name={t.income || 'Income'}
                  fill="url(#chartIncomeGrad)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={36}
                  hide={hiddenSeries['income']}
                />

                <Bar
                  dataKey="expenses"
                  name={t.expenses || 'Expenses'}
                  fill="url(#chartExpenseGrad)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={36}
                  hide={hiddenSeries['expenses']}
                />

                {monthlyData.length > 1 && (
                  <>
                    <ReferenceLine
                      y={avgIncome}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      opacity={0.3}
                    />
                    <ReferenceLine
                      y={avgExpenses}
                      stroke="#f43f5e"
                      strokeDasharray="4 4"
                      opacity={0.3}
                    />
                    <Line
                      type="monotone"
                      dataKey="net"
                      name={t.netSavedLabel || 'Net Saved'}
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      hide={hiddenSeries['net']}
                    />
                  </>
                )}
              </ComposedChart>
            ) : (
              <AreaChart
                data={chartData}
                margin={{ top: 12, right: 8, left: -16, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="splitColorLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={1} />
                    <stop offset={gradientOffset} stopColor="#f43f5e" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="splitColorFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={0.05} />
                    <stop offset={gradientOffset} stopColor="#f43f5e" stopOpacity={0.05} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--card-border)"
                  opacity={0.6}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
                  tickFormatter={formatYAxis}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      formatCurrency={formatCurrency}
                      formatSavingsRate={formatSavingsRate}
                      t={t as unknown as Record<string, string>}
                      viewMode={viewMode}
                    />
                  }
                />
                <ReferenceLine
                  y={0}
                  stroke="var(--card-border)"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeNet"
                  stroke="url(#splitColorLine)"
                  strokeWidth={3}
                  fill="url(#splitColorFill)"
                  name={t.cumulativeBalance || 'Cumulative Balance'}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className={styles.emptyState}>
            <p>{t.noTransactionsInPeriod || 'No data available for this period.'}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
