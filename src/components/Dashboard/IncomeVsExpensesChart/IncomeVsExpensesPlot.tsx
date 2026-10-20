import React, { useCallback, useMemo } from 'react'
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
import { useChartAnimation } from '../../../hooks/useChartAnimation'
import type { CornerRadii } from '../../../utils/svg-paths'
import { MonthYearAxisTick } from '../../shared/ChartAxisTicks'
import { type ChartBarShapeProps, renderBarPath } from '../../shared/ChartBarShape'
import {
  type IncomeChartViewMode,
  LocalizedIncomeTooltip,
  SeriesLegendLabel,
} from './IncomeVsExpensesTooltip'

/** Matches Recharts' default Line/Area animation so the gate never cuts an animation short. */
const CHART_ANIMATION_MS = 1500
const X_TICK_OFFSET_PX = 6
const AXIS_TICK_STYLE = { fill: 'var(--text-dim)', fontSize: 11 }
const MONTH_TICK = (
  <MonthYearAxisTick fill="var(--text-dim)" fontSize={11} offsetY={X_TICK_OFFSET_PX} />
)
const CHART_MARGIN = { top: 12, right: 8, left: -16, bottom: 4 }
const BAR_RADIUS: CornerRadii = [5, 5, 0, 0]
const MONTHLY_CURSOR = { fill: 'rgba(255, 255, 255, 0.04)', radius: 8 }
const LEGEND_WRAPPER_STYLE = { paddingTop: '10px', cursor: 'pointer' }
const NET_DOT = { r: 4, strokeWidth: 2 }
const NET_ACTIVE_DOT = { r: 6, strokeWidth: 0 }

/** Stateless rounded bar (avoids Recharts' Rectangle remount cost while panning). */
const renderMonthlyBar = (barProps: unknown): React.ReactElement | null =>
  renderBarPath(barProps as ChartBarShapeProps, { radius: BAR_RADIUS })

/** Compact axis label: 1.2k, 3M, -450 */
const formatCompactAxis = (v: number): string => {
  if (v === 0) {
    return '0'
  }
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  const compact = (num: number): string =>
    num >= 100 ? num.toFixed(0) : num.toFixed(1).replace(/\.0$/, '')
  if (abs >= 1_000_000) {
    return `${sign}${compact(abs / 1_000_000)}M`
  }
  if (abs >= 1_000) {
    return `${sign}${compact(abs / 1_000)}k`
  }
  return `${sign}${Math.round(abs)}`
}

export type IncomeChartEntry = MonthlyEntry & { net: number; cumulativeNet: number }

interface IncomeVsExpensesPlotProps {
  chartData: IncomeChartEntry[]
  viewMode: IncomeChartViewMode
  gradientOffset: number
  avgIncome: number
  avgExpenses: number
  showNetLine: boolean
  hiddenSeries: Record<string, boolean>
  onLegendClick: (entry: { dataKey?: unknown }) => void
  animationKey?: unknown
}

/**
 * Recharts canvas for the income vs expenses card. Receives no locale-dependent props:
 * axis ticks, legend labels and tooltips localize themselves, so switching language
 * doesn't rebuild or re-animate the chart.
 */
export const IncomeVsExpensesPlot: React.FC<IncomeVsExpensesPlotProps> = React.memo(
  ({
    chartData,
    viewMode,
    gradientOffset,
    avgIncome,
    avgExpenses,
    showNetLine,
    hiddenSeries,
    onLegendClick,
    animationKey,
  }) => {
    const animationTrigger = useMemo(
      () => ({ data: animationKey ?? chartData, viewMode }),
      [animationKey, chartData, viewMode],
    )
    const isAnimationActive = useChartAnimation(animationTrigger, CHART_ANIMATION_MS)

    const renderLegendText = useCallback(
      (_value: string, entry: { dataKey?: unknown }) => {
        const dataKey = typeof entry.dataKey === 'string' ? entry.dataKey : ''
        return <SeriesLegendLabel dataKey={dataKey} isHidden={Boolean(hiddenSeries[dataKey])} />
      },
      [hiddenSeries],
    )

    const tooltipContent = <LocalizedIncomeTooltip viewMode={viewMode} />

    const sharedAxes = (
      <>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="var(--card-border)"
          opacity={0.6}
        />
        <XAxis dataKey="rawMonth" axisLine={false} tickLine={false} tick={MONTH_TICK} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={AXIS_TICK_STYLE}
          tickFormatter={formatCompactAxis}
        />
      </>
    )

    return (
      <ResponsiveContainer width="100%" height="100%">
        {viewMode === 'monthly' ? (
          <ComposedChart data={chartData} barGap={6} barCategoryGap="22%" margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="chartIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.35} />
              </linearGradient>
              <linearGradient id="chartExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.35} />
              </linearGradient>
            </defs>
            {sharedAxes}
            <Tooltip content={tooltipContent} cursor={MONTHLY_CURSOR} isAnimationActive={false} />
            <Legend
              onClick={onLegendClick}
              formatter={renderLegendText}
              wrapperStyle={LEGEND_WRAPPER_STYLE}
            />
            <Bar
              dataKey="income"
              name="income"
              fill="url(#chartIncomeGrad)"
              shape={renderMonthlyBar}
              maxBarSize={36}
              hide={hiddenSeries['income']}
              isAnimationActive={isAnimationActive}
            />
            <Bar
              dataKey="expenses"
              name="expenses"
              fill="url(#chartExpenseGrad)"
              shape={renderMonthlyBar}
              maxBarSize={36}
              hide={hiddenSeries['expenses']}
              isAnimationActive={isAnimationActive}
            />
            {showNetLine && (
              <>
                <ReferenceLine y={avgIncome} stroke="#10b981" strokeDasharray="4 4" opacity={0.3} />
                <ReferenceLine
                  y={avgExpenses}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  opacity={0.3}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  name="net"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={NET_DOT}
                  activeDot={NET_ACTIVE_DOT}
                  hide={hiddenSeries['net']}
                  isAnimationActive={isAnimationActive}
                />
              </>
            )}
          </ComposedChart>
        ) : (
          <AreaChart data={chartData} margin={CHART_MARGIN}>
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
            {sharedAxes}
            <Tooltip content={tooltipContent} isAnimationActive={false} />
            <ReferenceLine
              y={0}
              stroke="var(--card-border)"
              strokeDasharray="3 3"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="cumulativeNet"
              name="cumulativeNet"
              stroke="url(#splitColorLine)"
              strokeWidth={3}
              fill="url(#splitColorFill)"
              isAnimationActive={isAnimationActive}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    )
  },
)

IncomeVsExpensesPlot.displayName = 'IncomeVsExpensesPlot'
