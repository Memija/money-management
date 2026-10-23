import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { MonthlyCategoryEntry } from '../../../hooks/useAnalytics'
import { useChartAnimation } from '../../../hooks/useChartAnimation'
import { usePrivacyStore } from '../../../store/usePrivacyStore'
import type { CustomCategory } from '../../../types'
import { adjustColor, getCategoryColor } from '../../../utils/category-colors'
import type { CornerRadii } from '../../../utils/svg-paths'
import { MonthYearAxisTick } from '../../shared/ChartAxisTicks'
import { type ChartBarShapeProps, renderBarPath } from '../../shared/ChartBarShape'
import { formatCompactEuro } from './category-trend-formatters'
import { LocalizedTrendTooltip } from './CategoryTrendTooltip'

import styles from './CategoryTrend.module.css'

const CHART_ANIMATION_MS = 350
const AXIS_TICK_STYLE = { fill: 'var(--text-dim)', fontSize: 11 }
const MONTH_TICK = <MonthYearAxisTick fill="var(--text-dim)" fontSize={11} />
const STACKED_MARGIN = { top: 16, right: 12, left: -10, bottom: 4 }
const AREA_MARGIN = { top: 12, right: 10, left: -14, bottom: 0 }
const STACKED_CURSOR = { fill: 'rgba(255, 255, 255, 0.08)', radius: 10 }
const TOOLTIP_WRAPPER_STYLE = { pointerEvents: 'auto' as const, zIndex: 100 }
const SEGMENT_OUTER_RADIUS = 8
const SEGMENT_INNER_RADIUS = 3
const SEGMENT_MIN_HEIGHT = 1.5

const toGradientId = (prefix: string, cat: string): string =>
  `${prefix}-${cat.replace(/\s+/g, '-')}`

interface MonthBounds {
  top: string
  bottom: string
}

/** Gap between stacked capsules, shrinking for thin segments so they stay visible. */
const getSegmentGap = (height: number): number => (height > 10 ? 2.5 : height > 4 ? 1.5 : 0.5)

/**
 * Finds the first (bottom) and last (top) category with spend in a month entry.
 * @param entry - Month entry keyed by category
 * @param categories - Categories in stacking order
 */
const findMonthBounds = (entry: Record<string, unknown>, categories: string[]): MonthBounds => {
  let bottom = ''
  let top = ''
  for (const cat of categories) {
    if (Number(entry[cat]) > 0) {
      if (!bottom) {
        bottom = cat
      }
      top = cat
    }
  }
  return { top, bottom }
}

/**
 * Creates a bounds lookup cached by entry identity. Timeline slices reuse the same entry
 * objects, so panning never recomputes bounds.
 * @param categories - Categories in stacking order
 */
const createMonthBoundsLookup = (
  categories: string[],
): ((entry: Record<string, unknown>) => MonthBounds) => {
  const cache = new WeakMap<object, MonthBounds>()
  return (entry) => {
    let bounds = cache.get(entry)
    if (!bounds) {
      bounds = findMonthBounds(entry, categories)
      cache.set(entry, bounds)
    }
    return bounds
  }
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
  /** When true, omits the floating tooltip (e.g. on mobile card view) */
  disableTooltip?: boolean
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
    disableTooltip = false,
  }) => {
    const isPrivacyMode = usePrivacyStore((s) => s.isPrivacyMode)
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

    // Cached top/bottom category per month entry; stable while categories are unchanged,
    // so the shape callback keeps its identity during timeline navigation
    const getMonthBounds = useMemo(() => createMonthBoundsLookup(categories), [categories])

    // Custom shape: each category renders as a floating capsule segment with rounded ends.
    // Stable across navigation and hover, and renders a stateless path (see renderBarPath).
    const renderStackedBar = useCallback(
      (barProps: unknown) => {
        const p = barProps as ChartBarShapeProps
        if (!p || !p.height || p.height <= 0 || !p.width || p.width <= 0) {
          return null
        }

        const bounds = p.payload ? getMonthBounds(p.payload) : undefined
        const topRadius =
          bounds && p.dataKey === bounds.top ? SEGMENT_OUTER_RADIUS : SEGMENT_INNER_RADIUS
        const bottomRadius =
          bounds && p.dataKey === bounds.bottom ? SEGMENT_OUTER_RADIUS : SEGMENT_INNER_RADIUS
        const radius: CornerRadii = [topRadius, topRadius, bottomRadius, bottomRadius]

        return renderBarPath(p, {
          radius,
          className: styles.barSegment,
          gap: getSegmentGap(p.height),
          minHeight: SEGMENT_MIN_HEIGHT,
        })
      },
      [getMonthBounds],
    )

    // Stable per-category click handlers so bars don't receive new callbacks every render
    const categoryClickHandlers = useMemo(
      () => new Map(categories.map((cat) => [cat, () => onCategorySelect(cat)])),
      [categories, onCategorySelect],
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
      [
        customCategories,
        activeCategory,
        onCategoryHover,
        onCategorySelect,
        handleTooltipHoverChange,
      ],
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
            className="category-trend-y-axis"
            axisLine={false}
            tickLine={false}
            tick={isPrivacyMode ? false : AXIS_TICK_STYLE}
            tickFormatter={formatCompactEuro}
          />
        </>
      ),
      [isPrivacyMode],
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
              {!disableTooltip && (
                <Tooltip
                  wrapperStyle={TOOLTIP_WRAPPER_STYLE}
                  content={tooltipContent}
                  cursor={STACKED_CURSOR}
                  offset={14}
                  isAnimationActive={false}
                  active={isTooltipHovered ? true : undefined}
                />
              )}
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
                    onClick={categoryClickHandlers.get(cat)}
                  />
                )
              })}
            </BarChart>
          ) : (
            <AreaChart data={data} margin={AREA_MARGIN} onMouseMove={handleMouseMove}>
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
              {!disableTooltip && (
                <Tooltip
                  wrapperStyle={TOOLTIP_WRAPPER_STYLE}
                  content={tooltipContent}
                  offset={14}
                  isAnimationActive={false}
                  active={isTooltipHovered ? true : undefined}
                />
              )}
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
