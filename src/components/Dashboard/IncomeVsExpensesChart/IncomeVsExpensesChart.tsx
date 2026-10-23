import React, { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'

import type { MonthlyEntry } from '../../../hooks/useAnalytics'
import { useChartTimelineGestures } from '../../../hooks/useChartTimelineGestures'
import { useDeferredTimelineSlice } from '../../../hooks/useDeferredTimelineSlice'
import { useFormatters } from '../../../hooks/useFormatters'
import { useIsMobile } from '../../../hooks/useIsMobile'
import {
  MIN_MONTHS_ZOOM_DESKTOP,
  MIN_MONTHS_ZOOM_MOBILE,
  useTimelineZoom,
} from '../../../hooks/useTimelineZoom'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { DASHBOARD_TIMELINE_SYNC_KEY } from '../../../store/useTimelineSelectionStore'
import { RenderWhenVisible } from '../../shared/RenderWhenVisible'
import { TimelinePositionIndicator, TimelineSlider } from '../../shared/TimelineSlider'
import { TimelineToolbar } from '../../shared/TimelineToolbar'
import { type IncomeChartEntry, IncomeVsExpensesPlot } from './IncomeVsExpensesPlot'
import type { IncomeChartViewMode } from './IncomeVsExpensesTooltip'

import styles from './IncomeVsExpensesChart.module.css'

export { MIN_MONTHS_ZOOM_DESKTOP, MIN_MONTHS_ZOOM_MOBILE } from '../../../hooks/useTimelineZoom'

interface IncomeVsExpensesChartProps {
  monthlyData: MonthlyEntry[]
  totalIncome?: number
  totalExpenses?: number
}

export const IncomeVsExpensesChart: React.FC<IncomeVsExpensesChartProps> = React.memo(
  ({ monthlyData, totalIncome: propIncome, totalExpenses: propExpenses }) => {
    const t = useLanguageStore((s) => s.t)
    const { formatCurrency, formatSavingsRate, formatMonthYear } = useFormatters()
    const isMobile = useIsMobile(640)
    const [viewMode, setViewMode] = useState<IncomeChartViewMode>('monthly')
    const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({})
    const hasNetLine = monthlyData.length > 1

    // Offer timeline zooming only with at least 12 months on mobile and 24 on desktop
    const minMonthsForZoom = isMobile ? MIN_MONTHS_ZOOM_MOBILE : MIN_MONTHS_ZOOM_DESKTOP
    const canZoom = monthlyData.length >= minMonthsForZoom
    const monthKeys = useMemo(() => monthlyData.map((m) => m.rawMonth || m.name), [monthlyData])

    const {
      startIndex,
      endIndex,
      visibleCount,
      isZoomed,
      isAtStart,
      isAtEnd,
      isAtMinZoom,
      isAtMaxZoom,
      activePreset,
      zoomIn,
      zoomOut,
      panEarlier,
      panLater,
      resetZoom,
      setPreset,
      setRangeIndices,
      scrubToRatio,
    } = useTimelineZoom({
      totalCount: monthlyData.length,
      isLotsOfData: canZoom,
      minCount: minMonthsForZoom,
      minWindow: 3,
      monthKeys,
      syncKey: DASHBOARD_TIMELINE_SYNC_KEY,
    })

    // Deferred visible window: controls update instantly, the plot catches up in the background
    const {
      data: chartSourceData,
      visibleData,
      isZoomed: isChartZoomed,
    } = useDeferredTimelineSlice(monthlyData, startIndex, endIndex)

    const startMonthLabel = formatMonthYear(
      monthlyData[startIndex]?.rawMonth || monthlyData[startIndex]?.name || '',
    )
    const endMonthLabel = formatMonthYear(
      monthlyData[endIndex]?.rawMonth || monthlyData[endIndex]?.name || '',
    )

    // Pre-calculate monthly activity for the mini-map scrubber
    const monthSummaries = useMemo(() => {
      return monthlyData.map((m) => ({
        month: m.rawMonth || m.name,
        total: Math.max(m.income, m.expenses),
      }))
    }, [monthlyData])

    // Direct manipulation on the chart: touch pan/pinch on mobile, drag and Ctrl+wheel on desktop
    const chartGesturesRef = useChartTimelineGestures({
      enabled: canZoom,
      totalCount: monthlyData.length,
      startIndex,
      endIndex,
      minWindow: 3,
      onRangeChange: setRangeIndices,
      onZoomIn: zoomIn,
      onResetZoom: resetZoom,
    })

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
            const visibleActiveCount = activeKeys.filter((key) => !nextHidden[key]).length

            if (visibleActiveCount === 0) {
              return prev
            }
          }

          return { ...prev, [dataKey]: !prev[dataKey] }
        })
      },
      [hasNetLine],
    )

    // Derive sums: dynamically re-evaluate for visible slice when zoomed (kept in sync with the plot)
    const { netSaved, savingsRate, isNetPositive, avgIncome, avgExpenses } = useMemo(() => {
      const dataForMetrics = isChartZoomed ? visibleData : chartSourceData
      const income =
        !isChartZoomed && propIncome !== undefined
          ? propIncome
          : dataForMetrics.reduce((acc, m) => acc + m.income, 0)
      const expenses =
        !isChartZoomed && propExpenses !== undefined
          ? propExpenses
          : dataForMetrics.reduce((acc, m) => acc + m.expenses, 0)
      const net = income - expenses
      const rate = income > 0 ? Math.round((net / income) * 100) : expenses > 0 ? -100 : 0
      const count = dataForMetrics.length || 1
      return {
        netSaved: net,
        savingsRate: rate,
        isNetPositive: net >= 0,
        avgIncome: income / count,
        avgExpenses: expenses / count,
      }
    }, [isChartZoomed, visibleData, chartSourceData, propIncome, propExpenses])

    const chartData = useMemo(() => {
      const result: IncomeChartEntry[] = []
      let runningTotal = 0
      for (const m of visibleData) {
        const net = m.income - m.expenses
        runningTotal += net
        result.push({ ...m, net, cumulativeNet: runningTotal })
      }
      return result
    }, [visibleData])

    const gradientOffset = useMemo(() => {
      if (chartData.length === 0) return 0

      let dataMax = -Infinity
      let dataMin = Infinity
      for (const d of chartData) {
        if (d.cumulativeNet > dataMax) dataMax = d.cumulativeNet
        if (d.cumulativeNet < dataMin) dataMin = d.cumulativeNet
      }

      if (dataMax <= 0) return 0
      if (dataMin >= 0) return 1
      if (dataMax === dataMin) return 0

      return dataMax / (dataMax - dataMin)
    }, [chartData])

    const subtitleText = useMemo(() => {
      if (monthlyData.length === 0) return ''
      if (isZoomed) {
        const template = t.showingMonths || '{visible} of {total} months'
        const countText = template
          .replace('{visible}', String(visibleCount))
          .replace('{total}', String(monthlyData.length))
        return startMonthLabel === endMonthLabel
          ? `${countText} • ${startMonthLabel}`
          : `${countText} • ${startMonthLabel} – ${endMonthLabel}`
      }
      return monthlyData.length === 1 ? startMonthLabel : `${startMonthLabel} – ${endMonthLabel}`
    }, [
      monthlyData.length,
      isZoomed,
      t.showingMonths,
      visibleCount,
      startMonthLabel,
      endMonthLabel,
    ])

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
              {monthlyData.length > 0 && <p className={styles.subtitle}>{subtitleText}</p>}
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
                  <span className={`${styles.pillLabel} privacy-blur`}>
                    ({formatSavingsRate(savingsRate)})
                  </span>
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

        {/* Timeline Navigation & Zoom Toolbar (when zooming is enabled) */}
        {canZoom && (
          <TimelineToolbar
            visibleCount={visibleCount}
            totalCount={monthlyData.length}
            startMonthLabel={startMonthLabel}
            endMonthLabel={endMonthLabel}
            isAtStart={isAtStart}
            isAtEnd={isAtEnd}
            isAtMinZoom={isAtMinZoom}
            isAtMaxZoom={isAtMaxZoom}
            activePreset={activePreset}
            hasOverview={!isMobile}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onPanEarlier={panEarlier}
            onPanLater={panLater}
            onSelectPreset={setPreset}
          />
        )}

        {/* Chart container */}
        <div
          ref={chartGesturesRef}
          className={`${styles.chartContainer} ${canZoom ? styles.chartContainerInteractive : ''}`}
        >
          {monthlyData.length > 0 ? (
            <RenderWhenVisible>
              <IncomeVsExpensesPlot
                chartData={chartData}
                viewMode={viewMode}
                gradientOffset={gradientOffset}
                avgIncome={avgIncome}
                avgExpenses={avgExpenses}
                showNetLine={hasNetLine}
                hiddenSeries={hiddenSeries}
                onLegendClick={handleLegendClick}
                animationKey={chartSourceData}
              />
            </RenderWhenVisible>
          ) : (
            <div className={styles.emptyState}>
              <p>{t.noTransactionsInPeriod || 'No data available for this period.'}</p>
            </div>
          )}
        </div>

        {/* Timeline overview: full slider on desktop, slim position indicator on mobile */}
        {canZoom &&
          (isMobile ? (
            <TimelinePositionIndicator
              startIndex={startIndex}
              endIndex={endIndex}
              totalCount={monthlyData.length}
              startMonthLabel={startMonthLabel}
              endMonthLabel={endMonthLabel}
            />
          ) : (
            <TimelineSlider
              data={monthSummaries}
              startIndex={startIndex}
              endIndex={endIndex}
              minWindow={3}
              formatMonth={formatMonthYear}
              onRangeChange={setRangeIndices}
              onScrub={scrubToRatio}
            />
          ))}
      </motion.div>
    )
  },
)

IncomeVsExpensesChart.displayName = 'IncomeVsExpensesChart'
