import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Layers, Minimize2, TrendingUp } from 'lucide-react'

import type { MonthlyCategoryEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { CustomCategory } from '../../../types'
import { CategoryTimelineSlider, type MonthSummary } from './CategoryTimelineSlider'
import { CategoryTimelineToolbar } from './CategoryTimelineToolbar'
import { CategoryTrendChart } from './CategoryTrendChart'
import { CategoryTrendLegend } from './CategoryTrendLegend'
import { useChartTimelineGestures } from './useChartTimelineGestures'
import type { TimelinePreset } from './useTimelineZoom'

import styles from './CategoryTrendFullscreenModal.module.css'

export interface CategoryTrendFullscreenModalProps {
  isOpen: boolean
  onClose: () => void
  data: MonthlyCategoryEntry[]
  visibleData: MonthlyCategoryEntry[]
  monthSummaries: MonthSummary[]
  categories: string[]
  customCategories: CustomCategory[]
  startIndex: number
  endIndex: number
  visibleCount: number
  totalCount: number
  isZoomed: boolean
  isAtStart: boolean
  isAtEnd: boolean
  isAtMinZoom: boolean
  isAtMaxZoom: boolean
  activePreset: TimelinePreset | null
  startMonthLabel: string
  endMonthLabel: string
  activeCategory: string | null
  selectedCategory: string | null
  hoveredCategory: string | null
  viewMode: 'stacked' | 'area'
  monthlyAverage: number
  peakMonth: { month: string; amount: number }
  canZoomAndNavigate: boolean
  onRangeChange: (start: number, end: number) => void
  onScrub: (ratio: number) => void
  onSelectPreset: (preset: TimelinePreset) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onPanEarlier: () => void
  onPanLater: () => void
  onResetZoom: () => void
  onViewModeChange: (mode: 'stacked' | 'area') => void
  onCategoryHover: (cat: string | null) => void
  onCategorySelect: (cat: string) => void
  onClearCategorySelect: () => void
}

export const CategoryTrendFullscreenModal: React.FC<CategoryTrendFullscreenModalProps> = ({
  isOpen,
  onClose,
  data,
  visibleData,
  monthSummaries,
  categories,
  customCategories,
  startIndex,
  endIndex,
  visibleCount,
  totalCount,
  isZoomed,
  isAtStart,
  isAtEnd,
  isAtMinZoom,
  isAtMaxZoom,
  activePreset,
  startMonthLabel,
  endMonthLabel,
  activeCategory,
  selectedCategory,
  hoveredCategory,
  viewMode,
  monthlyAverage,
  peakMonth,
  canZoomAndNavigate,
  onRangeChange,
  onScrub,
  onSelectPreset,
  onZoomIn,
  onZoomOut,
  onPanEarlier,
  onPanLater,
  onResetZoom,
  onViewModeChange,
  onCategoryHover,
  onCategorySelect,
  onClearCategorySelect,
}) => {
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency, formatCategoryCount, formatMonthYear } = useFormatters()
  const modalRef = useRef<HTMLDivElement>(null)

  const chartGesturesRef = useChartTimelineGestures({
    enabled: isOpen && canZoomAndNavigate,
    totalCount,
    startIndex,
    endIndex,
    minWindow: 3,
    onRangeChange,
    onZoomIn,
    onResetZoom,
  })

  // Escape key listener to close fullscreen
  useEffect(() => {
    if (!isOpen) {
      return
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (typeof document === 'undefined') {
    return null
  }

  const subtitleText = isZoomed
    ? `${(t.showingMonths || '{visible} of {total} months').replace('{visible}', String(visibleCount)).replace('{total}', String(data.length))} • ${formatCategoryCount(categories.length)}`
    : `${(t.monthsTracked || '{count} months').replace('{count}', String(data.length))} • ${formatCategoryCount(categories.length)}`

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={t.categoryTrend || 'Spending by Category'}
          className={styles.overlay}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <div className={styles.modalContent}>
            {/* Header with Title, Stats, View Toggle, and Exit Fullscreen Button */}
            <div className={styles.header}>
              <div className={styles.titleArea}>
                <div className={styles.iconBadge}>
                  <TrendingUp size={22} />
                </div>
                <div>
                  <h2 className={styles.title}>{t.categoryTrend || 'Spending by Category'}</h2>
                  <p className={styles.subtitle}>{subtitleText}</p>
                </div>
              </div>

              <div className={styles.headerActions}>
                <div className={styles.statPillsGroup}>
                  <div className={styles.statPill}>
                    <span className={styles.statLabel}>
                      {t.monthlyAverage || 'Monthly Average'}
                    </span>
                    <span className={`${styles.statValue} privacy-blur`}>
                      {formatCurrency(monthlyAverage)}
                    </span>
                  </div>
                  {peakMonth.amount > 0 && (
                    <div className={styles.statPill}>
                      <span className={styles.statLabel}>{t.peakMonth || 'Peak Month'}</span>
                      <span
                        className={`${styles.statValue} ${styles.statValueHighlight} privacy-blur`}
                      >
                        {formatMonthYear(peakMonth.month)} • {formatCurrency(peakMonth.amount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.viewToggle}>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${viewMode === 'stacked' ? styles.toggleBtnActive : ''}`}
                    onClick={() => onViewModeChange('stacked')}
                    title={t.viewStackedBars || 'Stacked'}
                    aria-label={t.viewStackedBars || 'Stacked'}
                  >
                    <Layers size={14} />
                    <span>{t.viewStackedBars || 'Stacked'}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${viewMode === 'area' ? styles.toggleBtnActive : ''}`}
                    onClick={() => onViewModeChange('area')}
                    title={t.viewTrendArea || 'Trend'}
                    aria-label={t.viewTrendArea || 'Trend'}
                  >
                    <TrendingUp size={14} />
                    <span>{t.viewTrendArea || 'Trend'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.exitFullscreenBtn}
                  onClick={onClose}
                  title={t.exitFullscreen || 'Exit Full Screen'}
                  aria-label={t.exitFullscreen || 'Exit Full Screen'}
                >
                  <Minimize2 size={15} />
                  <span>{t.exitFullscreen || 'Exit Full Screen'}</span>
                  <kbd className={styles.kbdBadge}>ESC</kbd>
                </button>
              </div>
            </div>

            {/* Timeline Navigation & Zoom Toolbar */}
            {canZoomAndNavigate && (
              <CategoryTimelineToolbar
                visibleCount={visibleCount}
                totalCount={totalCount}
                startMonthLabel={startMonthLabel}
                endMonthLabel={endMonthLabel}
                isAtStart={isAtStart}
                isAtEnd={isAtEnd}
                isAtMinZoom={isAtMinZoom}
                isAtMaxZoom={isAtMaxZoom}
                activePreset={activePreset}
                hasOverview
                onZoomIn={onZoomIn}
                onZoomOut={onZoomOut}
                onPanEarlier={onPanEarlier}
                onPanLater={onPanLater}
                onSelectPreset={onSelectPreset}
              />
            )}

            {/* Chart Area */}
            <div
              ref={chartGesturesRef}
              className={`${styles.chartContainer} ${canZoomAndNavigate ? styles.chartContainerInteractive : ''}`}
            >
              <CategoryTrendChart
                data={visibleData}
                animationKey={data}
                categories={categories}
                customCategories={customCategories}
                viewMode={viewMode}
                activeCategory={activeCategory}
                onCategoryHover={onCategoryHover}
                onCategorySelect={onCategorySelect}
              />
            </div>

            {/* Timeline Scrubber */}
            {canZoomAndNavigate && (
              <CategoryTimelineSlider
                data={monthSummaries}
                startIndex={startIndex}
                endIndex={endIndex}
                minWindow={3}
                formatMonth={formatMonthYear}
                onRangeChange={onRangeChange}
                onScrub={onScrub}
              />
            )}

            {/* Interactive Category Legend */}
            <CategoryTrendLegend
              categories={categories}
              customCategories={customCategories}
              selectedCategory={selectedCategory}
              hoveredCategory={hoveredCategory}
              activeCategory={activeCategory}
              onCategoryHover={onCategoryHover}
              onCategorySelect={onCategorySelect}
              onClearCategorySelect={onClearCategorySelect}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
