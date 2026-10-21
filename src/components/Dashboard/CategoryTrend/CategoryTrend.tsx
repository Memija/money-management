import React, { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, Maximize2, TrendingUp } from 'lucide-react'

import type { MonthlyCategoryEntry } from '../../../hooks/useAnalytics'
import { useDeferredTimelineSlice } from '../../../hooks/useDeferredTimelineSlice'
import { useFormatters } from '../../../hooks/useFormatters'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { DASHBOARD_TIMELINE_SYNC_KEY } from '../../../store/useTimelineSelectionStore'
import { computeCategoryTrendStats } from '../../../utils/category-trend-stats'
import { hasExtensiveCategoryData } from '../../../utils/category-utils'
import { RenderWhenVisible } from '../../shared/RenderWhenVisible'
import { TimelinePositionIndicator } from '../../shared/TimelineSlider'
import { CategoryTimelineSlider } from './CategoryTimelineSlider'
import { CategoryTimelineToolbar } from './CategoryTimelineToolbar'
import { CategoryTrendChart } from './CategoryTrendChart'
import { CategoryTrendFullscreenModal } from './CategoryTrendFullscreenModal'
import { CategoryTrendLegend } from './CategoryTrendLegend'
import { useChartTimelineGestures } from './useChartTimelineGestures'
import { MIN_MONTHS_ZOOM_DESKTOP, MIN_MONTHS_ZOOM_MOBILE, useTimelineZoom } from './useTimelineZoom'

import styles from './CategoryTrend.module.css'

export { CustomTrendTooltip } from './CategoryTrendTooltip'
export { MIN_MONTHS_ZOOM_DESKTOP, MIN_MONTHS_ZOOM_MOBILE } from './useTimelineZoom'

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
    const isMobile = useIsMobile(640)

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

    const handleClearCategorySelect = useCallback(() => setSelectedCategory(null), [])
    const handleOpenFullscreen = useCallback(() => setIsFullscreen(true), [])
    const handleCloseFullscreen = useCallback(() => setIsFullscreen(false), [])

    // Sorted categories, monthly average, peak month and slider silhouette totals in a single pass
    const { categories, monthlyAverage, peakMonth, monthSummaries } = useMemo(
      () => computeCategoryTrendStats(data),
      [data],
    )

    // High data volume flag to automatically expand card
    const isExtensive = useMemo(
      () => hasExtensiveCategoryData(data, categories.length),
      [data, categories.length],
    )
    const isFullWidth = fullWidth ?? isExtensive

    const monthKeys = useMemo(() => data.map((d) => d.rawMonth || d.month), [data])

    // Offer timeline zooming only with at least 12 months on mobile and 24 on desktop
    const minMonthsForZoom = isMobile ? MIN_MONTHS_ZOOM_MOBILE : MIN_MONTHS_ZOOM_DESKTOP
    const canZoomAndNavigate = data.length >= minMonthsForZoom

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
    } = useTimelineZoom({
      totalCount: data.length,
      isLotsOfData: canZoomAndNavigate,
      minCount: minMonthsForZoom,
      minWindow: 3,
      monthKeys,
      syncKey: DASHBOARD_TIMELINE_SYNC_KEY,
    })

    // The chart renders a deferred window so zoom/pan controls stay instant while the
    // Recharts canvas catches up in the background
    const { data: chartSourceData, visibleData } = useDeferredTimelineSlice(
      data,
      startIndex,
      endIndex,
    )

    const startMonthLabel = formatMonthYear(data[startIndex]?.month ?? '')
    const endMonthLabel = formatMonthYear(data[endIndex]?.month ?? '')

    // Direct manipulation on the chart: touch pan/pinch on mobile, drag and Ctrl+wheel on desktop
    const chartGesturesRef = useChartTimelineGestures({
      enabled: canZoomAndNavigate,
      totalCount: data.length,
      startIndex,
      endIndex,
      minWindow: 3,
      onRangeChange: setRangeIndices,
      onZoomIn: zoomIn,
      onResetZoom: resetZoom,
    })

    if (data.length === 0) {
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
              onClick={handleOpenFullscreen}
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

        {/* Chart Canvas */}
        <div
          ref={chartGesturesRef}
          className={`${styles.chartContainer} ${canZoomAndNavigate ? styles.chartContainerInteractive : ''}`}
        >
          {categories.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p className={styles.emptyText}>
                {t.noTransactionsInPeriod || 'No transactions of this type in this period.'}
              </p>
            </div>
          ) : (
            // Paused while fullscreen: the modal renders its own copy on top of this one
            <RenderWhenVisible isPaused={isFullscreen}>
              <CategoryTrendChart
                data={visibleData}
                animationKey={chartSourceData}
                categories={categories}
                customCategories={customCategories}
                viewMode={viewMode}
                activeCategory={activeCategory}
                onCategoryHover={setHoveredCategory}
                onCategorySelect={handleCategorySelect}
                disableTooltip={isMobile}
              />
            </RenderWhenVisible>
          )}
        </div>

        {/* Timeline overview: full slider on desktop, slim position indicator on mobile */}
        {canZoomAndNavigate &&
          (isMobile ? (
            <TimelinePositionIndicator
              startIndex={startIndex}
              endIndex={endIndex}
              totalCount={data.length}
              startMonthLabel={startMonthLabel}
              endMonthLabel={endMonthLabel}
            />
          ) : (
            <CategoryTimelineSlider
              data={monthSummaries}
              startIndex={startIndex}
              endIndex={endIndex}
              minWindow={3}
              formatMonth={formatMonthYear}
              onRangeChange={setRangeIndices}
              onScrub={scrubToRatio}
            />
          ))}

        {/* Interactive Category Legend with Spotlight Filter */}
        {categories.length > 0 && (
          <CategoryTrendLegend
            categories={categories}
            customCategories={customCategories}
            selectedCategory={selectedCategory}
            hoveredCategory={hoveredCategory}
            activeCategory={activeCategory}
            onCategoryHover={setHoveredCategory}
            onCategorySelect={handleCategorySelect}
            onClearCategorySelect={handleClearCategorySelect}
          />
        )}

        {/* Fullscreen Expanded View Modal */}
        <CategoryTrendFullscreenModal
          isOpen={isFullscreen}
          onClose={handleCloseFullscreen}
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
          onClearCategorySelect={handleClearCategorySelect}
        />
      </motion.div>
    )
  },
)

CategoryTrend.displayName = 'CategoryTrend'
