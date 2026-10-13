import React, { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, RotateCcw, TrendingUp } from 'lucide-react'

import type { MonthlyCategoryEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { getCategoryColor } from '../../../utils/category-colors'
import { getCategoryLabel, hasExtensiveCategoryData } from '../../../utils/category-utils'
import { CategoryTrendChart } from './CategoryTrendChart'

import styles from './CategoryTrend.module.css'

export { CustomTrendTooltip } from './CategoryTrendTooltip'

interface CategoryTrendProps {
  data: MonthlyCategoryEntry[]
  onCategoryClick?: (categoryName: string) => void
  fullWidth?: boolean
}

export const CategoryTrend: React.FC<CategoryTrendProps> = React.memo(({
  data,
  onCategoryClick,
  fullWidth,
}) => {
  const t = useLanguageStore((s) => s.t)
  const customCategories = useAppStore((s) => s.customCategories)
  const { formatCurrency, formatCategoryCount, formatMonthYear } = useFormatters()

  const [viewMode, setViewMode] = useState<'stacked' | 'area'>('stacked')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const activeCategory = hoveredCategory || selectedCategory

  const handleCategorySelect = useCallback(
    (catKey: string) => {
      setSelectedCategory((prev) => (prev === catKey ? null : catKey))
      if (onCategoryClick) {
        onCategoryClick(catKey)
      }
    },
    [onCategoryClick],
  )

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
              <span className={`${styles.statValue} privacy-blur`}>{formatCurrency(monthlyAverage)}</span>
            </div>
            {peakMonth.amount > 0 && (
              <div className={styles.statPill}>
                <span className={styles.statLabel}>{t.peakMonth || 'Peak Month'}</span>
                <span className={`${styles.statValue} ${styles.statValueHighlight} privacy-blur`}>
                  {formatMonthYear(peakMonth.month)} • {formatCurrency(peakMonth.amount)}
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

      {/* Chart Canvas — memoized and locale-independent so language switches skip it */}
      <div className={styles.chartContainer}>
        <CategoryTrendChart
          data={data}
          categories={categories}
          customCategories={customCategories}
          viewMode={viewMode}
          activeCategory={activeCategory}
          onCategoryHover={setHoveredCategory}
          onCategorySelect={handleCategorySelect}
        />
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
})

CategoryTrend.displayName = 'CategoryTrend'
