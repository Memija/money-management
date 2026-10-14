import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { MonthlyCategoryEntry } from '../../../hooks/useAnalytics'
import { useChartAnimation } from '../../../hooks/useChartAnimation'
import type { CustomCategory } from '../../../types'
import { adjustColor, getCategoryColor } from '../../../utils/category-colors'
import { MonthYearAxisTick } from '../../shared/ChartAxisTicks'
import { LocalizedTrendTooltip } from './CategoryTrendTooltip'

import styles from './CategoryTrend.module.css'

const CHART_ANIMATION_MS = 350
const AXIS_TICK_STYLE = { fill: 'var(--text-dim)', fontSize: 11 }
const MONTH_TICK = <MonthYearAxisTick fill="var(--text-dim)" fontSize={11} />
const STACKED_MARGIN = { top: 16, right: 12, left: -10, bottom: 4 }
const AREA_MARGIN = { top: 12, right: 10, left: -14, bottom: 0 }
const STACKED_CURSOR = { fill: 'rgba(255, 255, 255, 0.08)', radius: 10 }
const TOOLTIP_WRAPPER_STYLE = { pointerEvents: 'auto' as const, zIndex: 100 }

const formatEuroThousands = (v: number): string => {
  if (v === 0) {
    return '€0'
  }
  const inK = v / 1000
  return Number.isInteger(inK) ? `€${inK}k` : `€${inK.toFixed(1)}k`
}

const toGradientId = (prefix: string, cat: string): string =>
  `${prefix}-${cat.replace(/\s+/g, '-')}`

interface BarShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: Record<string, unknown>
  dataKey?: string
}

interface CategoryTrendChartProps {
  data: MonthlyCategoryEntry[]
  /** Categories sorted by total spend, descending */
  categories: string[]
  customCategories: CustomCategory[]
  viewMode: 'stacked' | 'area'
  activeCategory: string | null
  onCategoryHover: (catKey: string | null) => void
  onCategorySelect: (catKey: string) => void
  /**
   * Identity that replays the entrance animation when changed. Pass the full dataset so
   * timeline navigation (which only slices `data`) never restarts the tween.
   */
  animationKey?: unknown
}

/**
 * Recharts canvas for the category trend card. Renders the visible data slice with
 * ultra-fast responsiveness. Deliberately receives no locale-dependent props: month
 * labels and tooltips localize themselves, so a language switch never re-renders the bars.
 */
export const CategoryTrendChart: React.FC<CategoryTrendChartProps> = React.memo(
  ({
    data,
    categories,
    customCategories,
    viewMode,
    activeCategory,
    onCategoryHover,
    onCategorySelect,
    animationKey,
  }) => {
    const [isTooltipHovered, setIsTooltipHovered] = useState(false)
    const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
      return () => {
        if (leaveTimerRef.current) {
          clearTimeout(leaveTimerRef.current)
        }
      }
    }, [])

    const handleTooltipHoverChange = useCallback((hovered: boolean) => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current)
        leaveTimerRef.current = null
      }
      if (hovered) {
        setIsTooltipHovered(true)
      } else {
        leaveTimerRef.current = setTimeout(() => {
          setIsTooltipHovered(false)
          leaveTimerRef.current = null
        }, 160)
      }
    }, [])

    const animationSource = animationKey ?? data
    const animationTrigger = useMemo(
      () => ({ animationSource, viewMode }),
      [animationSource, viewMode],
    )
    const isAnimationActive = useChartAnimation(animationTrigger, CHART_ANIMATION_MS)

    const categoryColors = useMemo(
      () => categories.map((cat) => ({ cat, color: getCategoryColor(cat, customCategories) })),
      [categories, customCategories],
    )

    // Precompute top/bottom category per month to avoid O(N*M) loops in renderStackedBar
    const monthBoundsMap = useMemo(() => {
      const map = new Map<string, { top: string; bottom: string }>()
      const reversed = [...categories].reverse()
      for (const entry of data) {
        const top = reversed.find((cat) => Number(entry[cat]) > 0) ?? ''
        const bottom = categories.find((cat) => Number(entry[cat]) > 0) ?? ''
        map.set(String(entry.month), { top, bottom })
      }
      return map
    }, [data, categories])

    // Custom shape: each category renders as a floating capsule segment with rounded ends.
    // Memoized with stable reference so mouse movement across data points incurs zero DOM re-creations.
    const renderStackedBar = useCallback(
      (barProps: unknown) => {
        const p = barProps as BarShapeProps
        if (!p || !p.height || p.height <= 0 || !p.width || p.width <= 0) {
          return null
        }

        const monthKey = String(p.payload?.month ?? '')
        const bounds = monthBoundsMap.get(monthKey)
        const isTop = bounds ? p.dataKey === bounds.top : false
        const isBottom = bounds ? p.dataKey === bounds.bottom : false
        const outer = 8
        const inner = 3
        const radius: [number, number, number, number] = [
          isTop ? outer : inner,
          isTop ? outer : inner,
          isBottom ? outer : inner,
          isBottom ? outer : inner,
        ]

        const rawHeight = p.height
        const gap = rawHeight > 10 ? 2.5 : rawHeight > 4 ? 1.5 : 0.5

        return (
          <Rectangle
            {...(barProps as Record<string, unknown>)}
            x={p.x ?? 0}
            y={(p.y ?? 0) + gap / 2}
            width={p.width}
            height={Math.max(1.5, rawHeight - gap)}
            radius={radius}
            className={styles.barSegment}
          />
        )
      },
      [monthBoundsMap],
    )

    const handleMouseMove = useCallback(() => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current)
        leaveTimerRef.current = null
      }
      setIsTooltipHovered((prev) => (prev ? false : prev))
    }, [])

    const tooltipContent = useMemo(
      () => (
        <LocalizedTrendTooltip
          customCategories={customCategories}
          activeCategory={activeCategory}
          onCategoryHover={onCategoryHover}
          onCategoryClick={onCategorySelect}
          onTooltipHoverChange={handleTooltipHoverChange}
        />
      ),
      [customCategories, activeCategory, onCategoryHover, onCategorySelect, handleTooltipHoverChange],
    )

    const sharedAxes = useMemo(
      () => (
        <>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--card-border)"
            opacity={0.6}
          />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={MONTH_TICK} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            tickFormatter={formatEuroThousands}
          />
        </>
      ),
      [],
    )

    return (
      <div className={styles.chartInnerWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'stacked' ? (
            <BarChart
              data={data}
              margin={STACKED_MARGIN}
              maxBarSize={44}
              onMouseMove={handleMouseMove}
            >
              <defs>
                {categoryColors.map(({ cat, color }) => (
                  <linearGradient
                    key={`cat-bar-grad-${cat}`}
                    id={toGradientId('cat-bar-grad', cat)}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={adjustColor(color, 42)} stopOpacity={1} />
                    <stop offset="42%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={adjustColor(color, -22)} stopOpacity={1} />
                  </linearGradient>
                ))}
              </defs>
              {sharedAxes}
              <Tooltip
                wrapperStyle={TOOLTIP_WRAPPER_STYLE}
                content={tooltipContent}
                cursor={STACKED_CURSOR}
                offset={14}
                isAnimationActive={false}
                active={isTooltipHovered ? true : undefined}
              />
              {categoryColors.map(({ cat, color }) => {
                const isCatActive = activeCategory === cat
                const isCatDimmed = activeCategory !== null && !isCatActive
                return (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    stackId="categories"
                    fill={`url(#${toGradientId('cat-bar-grad', cat)})`}
                    stroke={isCatActive ? color : 'transparent'}
                    strokeWidth={isCatActive ? 2 : 0}
                    opacity={isCatDimmed ? 0.22 : 1}
                    shape={renderStackedBar}
                    isAnimationActive={isAnimationActive}
                    animationDuration={CHART_ANIMATION_MS}
                    onClick={() => onCategorySelect(cat)}
                  />
                )
              })}
            </BarChart>
          ) : (
            <AreaChart
              data={data}
              margin={AREA_MARGIN}
              onMouseMove={handleMouseMove}
            >
              <defs>
                {categoryColors.map(({ cat, color }) => (
                  <linearGradient
                    key={`cat-area-grad-${cat}`}
                    id={toGradientId('cat-area-grad', cat)}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={0.75} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.08} />
                  </linearGradient>
                ))}
              </defs>
              {sharedAxes}
              <Tooltip
                wrapperStyle={TOOLTIP_WRAPPER_STYLE}
                content={tooltipContent}
                offset={14}
                isAnimationActive={false}
                active={isTooltipHovered ? true : undefined}
              />
              {categoryColors.map(({ cat, color }) => {
                const isCatActive = activeCategory === cat
                const isCatDimmed = activeCategory !== null && !isCatActive
                return (
                  <Area
                    key={cat}
                    type="monotone"
                    dataKey={cat}
                    stackId="categories"
                    stroke={color}
                    strokeWidth={isCatActive ? 2.5 : 1.5}
                    fill={`url(#${toGradientId('cat-area-grad', cat)})`}
                    opacity={isCatDimmed ? 0.15 : 1}
                    isAnimationActive={isAnimationActive}
                    animationDuration={CHART_ANIMATION_MS}
                  />
                )
              })}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  },
)

CategoryTrendChart.displayName = 'CategoryTrendChart'
