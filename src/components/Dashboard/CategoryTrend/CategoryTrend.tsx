import React, { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, Maximize2, TrendingUp } from 'lucide-react'

import type { MonthlyCategoryEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { hasExtensiveCategoryData } from '../../../utils/category-utils'
import { CategoryTimelineSlider } from './CategoryTimelineSlider'
import { CategoryTimelineToolbar } from './CategoryTimelineToolbar'
import { CategoryTrendChart } from './CategoryTrendChart'
import { CategoryTrendFullscreenModal } from './CategoryTrendFullscreenModal'
import { CategoryTrendLegend } from './CategoryTrendLegend'
import { useTimelineZoom } from './useTimelineZoom'

import styles from './CategoryTrend.module.css'

export { CustomTrendTooltip } from './CategoryTrendTooltip'

interface CategoryTrendProps {
  data: MonthlyCategoryEntry[]
  onCategoryClick?: (categoryName: string) => void
  fullWidth?: boolean
}

export const CategoryTrend: React.FC<CategoryTrendProps> = React.memo(
  ({ data, onCategoryClick, fullWidth }) => {
    const t = useLanguageStore((s) => s.t)
    const customCategories = useAppStore((s) => s.customCategories)
    const { formatCurrency, formatCategoryCount, formatMonthYear } = useFormatters()

    const [viewMode, setViewMode] = useState<'stacked' | 'area'>('stacked')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)

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
    const categories = useMemo(() => {
      const categoryTotals: Record<string, number> = {}
      data.forEach((entry) => {
        Object.entries(entry).forEach(([key, val]) => {
          if (key !== 'month' && typeof val === 'number') {
            categoryTotals[key] = (categoryTotals[key] || 0) + val
          }
        })
      })

      return Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a])
    }, [data])

    // Calculate overall monthly average spend
    const monthlyAverage = useMemo(() => {
      if (data.length === 0) {
        return 0
      }
      const total = data.reduce((sum, entry) => {
        const monthSum = Object.entries(entry).reduce((s, [k, v]) => {
          return k !== 'month' && typeof v === 'number' ? s + v : s
        }, 0)
        return sum + monthSum
      }, 0)
      return total / data.length
    }, [data])

    // Detect highest spending month
    const peakMonth = useMemo(() => {
      let maxMonth = ''
      let maxAmount = 0
      data.forEach((entry) => {
        const total = Object.entries(entry).reduce((sum, [k, v]) => {
          return k !== 'month' && typeof v === 'number' ? sum + v : sum
        }, 0)
        if (total > maxAmount) {
          maxAmount = total
          maxMonth = entry.month
        }
      })
      return { month: maxMonth, amount: maxAmount }
    }, [data])

    // High data volume flag to automatically expand card and offer timeline navigation
    const isExtensive = useMemo(
      () => hasExtensiveCategoryData(data, categories.length),
      [data, categories.length],
    )
    const isFullWidth = fullWidth ?? isExtensive

    // Pre-calculate aggregate monthly sums for the timeline scrubber silhouette
    const monthSummaries = useMemo(() => {
      return data.map((entry) => {
        let total = 0
        for (const [key, val] of Object.entries(entry)) {
          if (key !== 'month' && typeof val === 'number') {
            total += val
          }
        }
        return { month: entry.month, total }
      })
    }, [data])

    // Interactive timeline zoom & pan controller
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
      setRangeIndices,
      setPreset,
      zoomIn,
      zoomOut,
      panEarlier,
      panLater,
      resetZoom,
      scrubToRatio,
    } = useTimelineZoom({ totalCount: data.length, isLotsOfData: isExtensive, minWindow: 3 })

    // Decouple rapid slider scrubbing from heavy chart DOM re-renders
    const deferredStartIndex = useDeferredValue(startIndex)
    const deferredEndIndex = useDeferredValue(endIndex)

    // Slice dataset to active viewport window
    const visibleData = useMemo(() => {
      if (data.length <= 1) {
        return data
      }
      return data.slice(deferredStartIndex, deferredEndIndex + 1)
    }, [data, deferredStartIndex, deferredEndIndex])

    const startMonthLabel = formatMonthYear(data[startIndex]?.month ?? '')
    const endMonthLabel = formatMonthYear(data[endIndex]?.month ?? '')
    const canZoomAndNavigate = isExtensive && data.length > 3

    if (data.length === 0 || categories.length === 0) {
      return null
    }

    const subtitleText = isZoomed
      ? `${(t.showingMonths || '{visible} of {total} months').replace('{visible}', String(visibleCount)).replace('{total}', String(data.length))} • ${formatCategoryCount(categories.length)}`
      : `${(t.monthsTracked || '{count} months').replace('{count}', String(data.length))} • ${formatCategoryCount(categories.length)}`

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className={`glass-card ${styles.container} ${isFullWidth ? styles.fullWidth : ''}`}
      >
        {/* Header with Icon, Title, Metrics, View Toggle, and Fullscreen Button */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.iconBadge}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className={styles.title}>{t.categoryTrend || 'Spending by Category'}</h3>
              <p className={styles.subtitle}>{subtitleText}</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.statPillsGroup}>
              <div className={styles.statPill}>
                <span className={styles.statLabel}>{t.monthlyAverage || 'Monthly Average'}</span>
                <span className={`${styles.statValue} privacy-blur`}>
                  {formatCurrency(monthlyAverage)}
                </span>
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

            <button
              type="button"
              data-testid="category-trend-fullscreen-btn"
              className={styles.fullscreenBtn}
              onClick={() => setIsFullscreen(true)}
              title={t.fullscreen || 'Full Screen'}
              aria-label={t.fullscreen || 'Full Screen'}
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        {/* Timeline Navigation & Zoom Toolbar (when extensive data points are present) */}
        {canZoomAndNavigate && (
          <CategoryTimelineToolbar
            visibleCount={visibleCount}
            totalCount={data.length}
            startMonthLabel={startMonthLabel}
            endMonthLabel={endMonthLabel}
            isZoomed={isZoomed}
            isAtStart={isAtStart}
            isAtEnd={isAtEnd}
            isAtMinZoom={isAtMinZoom}
            isAtMaxZoom={isAtMaxZoom}
            activePreset={activePreset}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onPanEarlier={panEarlier}
            onPanLater={panLater}
            onResetZoom={resetZoom}
            onSelectPreset={setPreset}
          />
        )}

        {/* Chart Canvas */}
        <div className={styles.chartContainer}>
          <CategoryTrendChart
            data={visibleData}
            animationKey={data}
            categories={categories}
            customCategories={customCategories}
            viewMode={viewMode}
            activeCategory={activeCategory}
            onCategoryHover={setHoveredCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>

        {/* Timeline Slider (when extensive data points are present) */}
        {canZoomAndNavigate && (
          <CategoryTimelineSlider
            data={monthSummaries}
            startIndex={startIndex}
            endIndex={endIndex}
            minWindow={3}
            formatMonth={formatMonthYear}
            onRangeChange={setRangeIndices}
            onScrub={scrubToRatio}
          />
        )}

        {/* Interactive Category Legend with Spotlight Filter */}
        <CategoryTrendLegend
          categories={categories}
          customCategories={customCategories}
          selectedCategory={selectedCategory}
          hoveredCategory={hoveredCategory}
          activeCategory={activeCategory}
          onCategoryHover={setHoveredCategory}
          onCategorySelect={handleCategorySelect}
          onClearCategorySelect={() => setSelectedCategory(null)}
        />

        {/* Fullscreen Expanded View Modal */}
        <CategoryTrendFullscreenModal
          isOpen={isFullscreen}
          onClose={() => setIsFullscreen(false)}
          data={data}
          visibleData={visibleData}
          monthSummaries={monthSummaries}
          categories={categories}
          customCategories={customCategories}
          startIndex={startIndex}
          endIndex={endIndex}
          visibleCount={visibleCount}
          totalCount={data.length}
          isZoomed={isZoomed}
          isAtStart={isAtStart}
          isAtEnd={isAtEnd}
          isAtMinZoom={isAtMinZoom}
          isAtMaxZoom={isAtMaxZoom}
          activePreset={activePreset}
          startMonthLabel={startMonthLabel}
          endMonthLabel={endMonthLabel}
          activeCategory={activeCategory}
          selectedCategory={selectedCategory}
          hoveredCategory={hoveredCategory}
          viewMode={viewMode}
          monthlyAverage={monthlyAverage}
          peakMonth={peakMonth}
          canZoomAndNavigate={canZoomAndNavigate}
          onRangeChange={setRangeIndices}
          onScrub={scrubToRatio}
          onSelectPreset={setPreset}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onPanEarlier={panEarlier}
          onPanLater={panLater}
          onResetZoom={resetZoom}
          onViewModeChange={setViewMode}
          onCategoryHover={setHoveredCategory}
          onCategorySelect={handleCategorySelect}
          onClearCategorySelect={() => setSelectedCategory(null)}
        />
      </motion.div>
    )
  },
)

CategoryTrend.displayName = 'CategoryTrend'
