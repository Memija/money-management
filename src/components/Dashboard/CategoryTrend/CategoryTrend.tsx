import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, RotateCcw, TrendingUp } from 'lucide-react'
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
import { useFormatters } from '../../../hooks/useFormatters'
import type { TranslationStrings } from '../../../i18n/translations'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { CustomCategory } from '../../../types'
import { adjustColor, getCategoryColor } from '../../../utils/category-colors'
import {
  formatCategoryPercent,
  getCategoryLabel,
  hasExtensiveCategoryData,
} from '../../../utils/category-utils'

import styles from './CategoryTrend.module.css'

interface CategoryTrendProps {
  data: MonthlyCategoryEntry[]
  onCategoryClick?: (categoryName: string) => void
  fullWidth?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    dataKey: string
  }>
  label?: string
  formatCurrency: (val: number) => string
  t: TranslationStrings
  customCategories: CustomCategory[]
  locale?: string
  activeCategory?: string | null
  onCategoryHover?: (catKey: string | null) => void
  onCategoryClick?: (catKey: string) => void
}

export const CustomTrendTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  formatCurrency,
  t,
  customCategories,
  locale,
  activeCategory,
  onCategoryHover,
  onCategoryClick,
}) => {
  if (!active || !payload || !payload.length) return null

  // Calculate total spend for this specific month
  const totalMonth = payload.reduce((acc, item) => acc + (Number(item.value) || 0), 0)

  // Sort categories by spend descending for this month
  const sortedItems = [...payload]
    .filter((item) => Number(item.value) > 0)
    .sort((a, b) => Number(b.value) - Number(a.value))

  return (
    <div className={styles.tooltipContainer}>
      <div className={styles.tooltipHeader}>
        <span className={styles.tooltipMonth}>{label}</span>
        <span className={styles.tooltipTotalBadge}>{formatCurrency(totalMonth)}</span>
      </div>
      <div className={styles.tooltipList}>
        {sortedItems.map((item) => {
          const val = Number(item.value)
          const catKey = item.dataKey || item.name
          const catColor = getCategoryColor(catKey, customCategories)
          const pct = formatCategoryPercent(val, totalMonth, locale)
          const isRowActive = activeCategory === catKey
          const isRowDimmed = activeCategory !== null && !isRowActive

          return (
            <div
              key={item.dataKey}
              role="button"
              tabIndex={0}
              className={`${styles.tooltipRow} ${isRowActive ? styles.tooltipRowActive : ''} ${isRowDimmed ? styles.tooltipRowDimmed : ''}`}
              style={
                {
                  '--cat-accent': catColor,
                } as React.CSSProperties
              }
              onMouseEnter={() => onCategoryHover?.(catKey)}
              onMouseLeave={() => onCategoryHover?.(null)}
              onClick={() => onCategoryClick?.(catKey)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onCategoryClick?.(catKey)
                }
              }}
              aria-label={`${getCategoryLabel(catKey, t, locale, customCategories)}: ${formatCurrency(val)} (${pct})`}
            >
              <div className={styles.tooltipCatInfo}>
                <span
                  className={styles.tooltipDot}
                  style={{ backgroundColor: catColor }}
                />
                <span className={styles.tooltipCatName}>
                  {getCategoryLabel(catKey, t, locale, customCategories)}
                </span>
              </div>
              <span className={styles.tooltipAmount}>{formatCurrency(val)}</span>
              <span className={styles.tooltipCatPct}>({pct})</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const CategoryTrend: React.FC<CategoryTrendProps> = ({
  data,
  onCategoryClick,
  fullWidth,
}) => {
  const t = useLanguageStore((s) => s.t)
  const locale = useLanguageStore((s) => s.locale)
  const customCategories = useAppStore((s) => s.customCategories)
  const { formatCurrency, formatCategoryCount } = useFormatters()

  const [viewMode, setViewMode] = useState<'stacked' | 'area'>('stacked')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null)

  const activeCategory = hoveredCategory || selectedCategory

  const handleCategorySelect = (catKey: string) => {
    setSelectedCategory((prev) => (prev === catKey ? null : catKey))
    if (onCategoryClick) {
      onCategoryClick(catKey)
    }
  }

  // Collect all unique categories across all months and sort by overall spend descending
  const { categories, monthlyAverage, peakMonth } = useMemo(() => {
    const categoryTotals: Record<string, number> = {}
    let peak = { month: '', amount: 0 }
    let sumTotal = 0

    data.forEach((entry) => {
      let monthSum = 0
      Object.entries(entry).forEach(([key, val]) => {
        if (key !== 'month' && typeof val === 'number') {
          categoryTotals[key] = (categoryTotals[key] || 0) + val
          monthSum += val
        }
      })
      sumTotal += monthSum
      if (monthSum > peak.amount) {
        peak = { month: String(entry.month), amount: monthSum }
      }
    })

    const sortedCats = Object.keys(categoryTotals).sort(
      (a, b) => categoryTotals[b] - categoryTotals[a]
    )

    const avg = data.length > 0 ? sumTotal / data.length : 0

    return {
      categories: sortedCats,
      monthlyAverage: avg,
      peakMonth: peak,
    }
  }, [data])

  const isLotsOfData = useMemo(() => {
    return hasExtensiveCategoryData(data, categories.length)
  }, [data, categories.length])

  const isFullWidth = fullWidth !== undefined ? fullWidth : isLotsOfData

  const formatYAxis = (v: number) => {
    if (v === 0) return '€0'
    const inK = v / 1000
    return Number.isInteger(inK) ? `€${inK}k` : `€${inK.toFixed(1)}k`
  }

  // Custom shape for stacked bars: renders each category as a refined floating capsule segment with rounded corners, subtle gap, and glass sheen
  const renderStackedBar = (barProps: unknown) => {
    const p = barProps as {
      x?: number
      y?: number
      width?: number
      height?: number
      payload?: Record<string, unknown>
      dataKey?: string
    }
    if (!p || !p.height || p.height <= 0 || !p.width || p.width <= 0) return null

    // Determine topmost and bottommost non-zero categories in this month's stack
    let topCategory = ''
    let bottomCategory = ''
    for (let i = categories.length - 1; i >= 0; i--) {
      const cat = categories[i]
      if (p.payload && Number(p.payload[cat]) > 0) {
        topCategory = cat
        break
      }
    }
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i]
      if (p.payload && Number(p.payload[cat]) > 0) {
        bottomCategory = cat
        break
      }
    }

    const isTop = p.dataKey === topCategory
    const isBottom = p.dataKey === bottomCategory

    // Calculate rounded corner radius: [topLeft, topRight, bottomRight, bottomLeft]
    let radius: [number, number, number, number]
    if (isTop && isBottom) {
      radius = [8, 8, 8, 8]
    } else if (isTop) {
      radius = [8, 8, 3, 3]
    } else if (isBottom) {
      radius = [3, 3, 8, 8]
    } else {
      radius = [3, 3, 3, 3]
    }

    const rawX = p.x ?? 0
    const rawY = p.y ?? 0
    const rawWidth = p.width ?? 0
    const rawHeight = p.height ?? 0

    // Check if this month's column is currently hovered
    const isMonthHovered = hoveredMonth !== null && String(p.payload?.month) === hoveredMonth
    const isAnyMonthHovered = hoveredMonth !== null
    const isDimmedByMonth = isAnyMonthHovered && !isMonthHovered

    // Active column expands slightly (+3px) when hovered over
    const hoverExpand = isMonthHovered ? 3 : 0
    const width = rawWidth + hoverExpand
    const x = rawX - hoverExpand / 2

    // Provide a crisp vertical gap separation between segments so they float as elegant capsules
    const gap = rawHeight > 10 ? 2.5 : rawHeight > 4 ? 1.5 : 0.5
    const y = rawY + gap / 2
    const height = Math.max(1.5, rawHeight - gap)

    const adjustedProps = {
      ...(barProps as Record<string, unknown>),
      x,
      y,
      width,
      height,
      radius,
    }

    return (
      <g
        className={`${styles.barSegmentGroup} ${isMonthHovered ? styles.barSegmentHovered : ''} ${isDimmedByMonth ? styles.barSegmentDimmed : ''}`}
      >
        <Rectangle {...adjustedProps} />
      </g>
    )
  }

  if (data.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className={`glass-card ${styles.container} ${isFullWidth ? styles.fullWidth : ''}`}
    >
      {/* Header with Icon, Title, Metrics and View Toggle */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconBadge}>
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className={styles.title}>{t.categoryTrend || 'Spending by Category'}</h3>
            <p className={styles.subtitle}>
              {(t.monthsTracked || '{count} months').replace('{count}', String(data.length))} •{' '}
              {formatCategoryCount(categories.length)}
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.statPillsGroup}>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>{t.monthlyAverage || 'Monthly Average'}</span>
              <span className={styles.statValue}>{formatCurrency(monthlyAverage)}</span>
            </div>
            {peakMonth.amount > 0 && (
              <div className={styles.statPill}>
                <span className={styles.statLabel}>{t.peakMonth || 'Peak Month'}</span>
                <span className={`${styles.statValue} ${styles.statValueHighlight}`}>
                  {peakMonth.month} • {formatCurrency(peakMonth.amount)}
                </span>
              </div>
            )}
          </div>

          <div className={styles.viewToggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === 'stacked' ? styles.toggleBtnActive : ''}`}
              onClick={() => setViewMode('stacked')}
              title={t.viewStackedBars || 'Stacked'}
              aria-label={t.viewStackedBars || 'Stacked'}
            >
              <Layers size={14} />
              <span>{t.viewStackedBars || 'Stacked'}</span>
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === 'area' ? styles.toggleBtnActive : ''}`}
              onClick={() => setViewMode('area')}
              title={t.viewTrendArea || 'Trend'}
              aria-label={t.viewTrendArea || 'Trend'}
            >
              <TrendingUp size={14} />
              <span>{t.viewTrendArea || 'Trend'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'stacked' ? (
            <BarChart
              data={data}
              margin={{ top: 16, right: 12, left: -10, bottom: 4 }}
              maxBarSize={44}
              onMouseMove={(state) => {
                if (state?.activeLabel) {
                  const label = String(state.activeLabel)
                  if (label !== hoveredMonth) {
                    setHoveredMonth(label)
                  }
                }
              }}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              <defs>
                {categories.map((cat) => {
                  const color = getCategoryColor(cat, customCategories)
                  const lightColor = adjustColor(color, 42)
                  const deepColor = adjustColor(color, -22)
                  return (
                    <linearGradient
                      key={`cat-bar-grad-${cat}`}
                      id={`cat-bar-grad-${cat.replace(/\s+/g, '-')}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={lightColor} stopOpacity={1} />
                      <stop offset="42%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={deepColor} stopOpacity={1} />
                    </linearGradient>
                  )
                })}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--card-border)"
                opacity={0.6}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
                tickFormatter={formatYAxis}
              />
              <Tooltip
                wrapperStyle={{ pointerEvents: 'auto' }}
                content={
                  <CustomTrendTooltip
                    formatCurrency={formatCurrency}
                    t={t}
                    customCategories={customCategories}
                    locale={locale}
                    activeCategory={activeCategory}
                    onCategoryHover={setHoveredCategory}
                    onCategoryClick={handleCategorySelect}
                  />
                }
                cursor={{ fill: 'rgba(255, 255, 255, 0.08)', radius: 10 }}
                offset={14}
              />
              {categories.map((cat) => {
                const color = getCategoryColor(cat, customCategories)
                const isCatActive = activeCategory === cat
                const isCatDimmed = activeCategory !== null && !isCatActive
                return (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    stackId="categories"
                    fill={`url(#cat-bar-grad-${cat.replace(/\s+/g, '-')})`}
                    stroke={isCatActive ? color : 'transparent'}
                    strokeWidth={isCatActive ? 2 : 0}
                    opacity={isCatDimmed ? 0.22 : 1}
                    shape={renderStackedBar}
                    animationDuration={400}
                    onMouseEnter={() => setHoveredCategory(cat)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() => handleCategorySelect(cat)}
                  />
                )
              })}
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 12, right: 10, left: -14, bottom: 0 }}>
              <defs>
                {categories.map((cat) => {
                  const color = getCategoryColor(cat, customCategories)
                  return (
                    <linearGradient
                      key={`cat-area-grad-${cat}`}
                      id={`cat-area-grad-${cat.replace(/\s+/g, '-')}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={color} stopOpacity={0.75} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.08} />
                    </linearGradient>
                  )
                })}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--card-border)"
                opacity={0.6}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
                tickFormatter={formatYAxis}
              />
              <Tooltip
                wrapperStyle={{ pointerEvents: 'auto' }}
                content={
                  <CustomTrendTooltip
                    formatCurrency={formatCurrency}
                    t={t}
                    customCategories={customCategories}
                    locale={locale}
                    activeCategory={activeCategory}
                    onCategoryHover={setHoveredCategory}
                    onCategoryClick={handleCategorySelect}
                  />
                }
              />
              {categories.map((cat) => {
                const color = getCategoryColor(cat, customCategories)
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
                    fill={`url(#cat-area-grad-${cat.replace(/\s+/g, '-')})`}
                    opacity={isCatDimmed ? 0.15 : 1}
                    animationDuration={400}
                  />
                )
              })}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Interactive Category Legend with Spotlight Filter */}
      <div className={styles.legendContainer}>
        {selectedCategory && (
          <button
            type="button"
            className={`${styles.legendPill} ${styles.resetPill}`}
            onClick={() => setSelectedCategory(null)}
            title={t.allCategories || 'All Categories'}
            aria-label={t.allCategories || 'All Categories'}
          >
            <RotateCcw size={11} />
            <span>{t.allCategories || 'All Categories'}</span>
          </button>
        )}

        {categories.map((cat) => {
          const color = getCategoryColor(cat, customCategories)
          const isSelected = selectedCategory === cat
          const isHovered = hoveredCategory === cat
          const isCatActive = isSelected || isHovered
          const isCatDimmed = activeCategory !== null && !isCatActive

          return (
            <button
              key={cat}
              type="button"
              className={`${styles.legendPill} ${isCatActive ? styles.legendPillActive : ''} ${isCatDimmed ? styles.legendPillDimmed : ''}`}
              style={
                {
                  '--pill-color': color,
                } as React.CSSProperties
              }
              onMouseEnter={() => setHoveredCategory(cat)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => handleCategorySelect(cat)}
              title={getCategoryLabel(cat, t)}
              aria-label={getCategoryLabel(cat, t)}
            >
              <span className={styles.legendDot} style={{ backgroundColor: color }} />
              <span>{getCategoryLabel(cat, t)}</span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
