import React from 'react'
import { Calendar, ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

import type { TimelinePreset } from '../../../hooks/useTimelineZoom'
import { useLanguageStore } from '../../../store/useLanguageStore'

import styles from './TimelineToolbar.module.css'

export interface TimelineToolbarProps {
  visibleCount: number
  totalCount: number
  startMonthLabel: string
  endMonthLabel: string
  isZoomed: boolean
  isAtStart: boolean
  isAtEnd: boolean
  isAtMinZoom: boolean
  isAtMaxZoom: boolean
  activePreset: TimelinePreset | null
  onZoomIn: () => void
  onZoomOut: () => void
  onPanEarlier: () => void
  onPanLater: () => void
  onResetZoom: () => void
  onSelectPreset: (preset: TimelinePreset) => void
}

export const TimelineToolbar: React.FC<TimelineToolbarProps> = React.memo(
  ({
    visibleCount,
    totalCount,
    startMonthLabel,
    endMonthLabel,
    isZoomed,
    isAtStart,
    isAtEnd,
    isAtMinZoom,
    isAtMaxZoom,
    activePreset,
    onZoomIn,
    onZoomOut,
    onPanEarlier,
    onPanLater,
    onResetZoom,
    onSelectPreset,
  }) => {
    const t = useLanguageStore((s) => s.t)

    const rangeText =
      startMonthLabel && endMonthLabel
        ? startMonthLabel === endMonthLabel
          ? startMonthLabel
          : `${startMonthLabel} – ${endMonthLabel}`
        : ''

    const showingText = (t.showingMonths || '{visible} of {total} months')
      .replace('{visible}', String(visibleCount))
      .replace('{total}', String(totalCount))

    return (
      <div className={styles.toolbar} role="region" aria-label={t.timelineRange || 'Timeline'}>
        <div className={styles.infoRow}>
          <div className={styles.rangeBadge}>
            <Calendar size={13} className={styles.calendarIcon} aria-hidden="true" />
            <span>{rangeText}</span>
          </div>

          <span className={styles.countPill}>{showingText}</span>
        </div>

        <div className={styles.controlsRow}>
          {/* Quick window presets */}
          <div
            className={styles.presetsGroup}
            role="group"
            aria-label={t.timelineRange || 'Timeline'}
          >
            {totalCount >= 4 && (
              <button
                type="button"
                className={`${styles.presetBtn} ${activePreset === '3M' ? styles.presetBtnActive : ''}`}
                onClick={() => onSelectPreset('3M')}
                title={t.preset3M || '3M'}
                aria-label={t.preset3M || '3M'}
              >
                {t.preset3M || '3M'}
              </button>
            )}
            {totalCount >= 7 && (
              <button
                type="button"
                className={`${styles.presetBtn} ${activePreset === '6M' ? styles.presetBtnActive : ''}`}
                onClick={() => onSelectPreset('6M')}
                title={t.preset6M || '6M'}
                aria-label={t.preset6M || '6M'}
              >
                {t.preset6M || '6M'}
              </button>
            )}
            {totalCount >= 13 && (
              <button
                type="button"
                className={`${styles.presetBtn} ${activePreset === '1Y' ? styles.presetBtnActive : ''}`}
                onClick={() => onSelectPreset('1Y')}
                title={t.preset1Y || '1Y'}
                aria-label={t.preset1Y || '1Y'}
              >
                {t.preset1Y || '1Y'}
              </button>
            )}
            <button
              type="button"
              className={`${styles.presetBtn} ${activePreset === 'All' ? styles.presetBtnActive : ''}`}
              onClick={() => onSelectPreset('All')}
              title={t.presetAll || 'All'}
              aria-label={t.presetAll || 'All'}
            >
              {t.presetAll || 'All'}
            </button>
          </div>

          <div className={styles.actionsGroup}>
            {/* Pan Navigation Buttons */}
            <div className={styles.buttonCluster}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={onPanEarlier}
                disabled={isAtStart}
                title={t.panEarlier || 'Previous months'}
                aria-label={t.panEarlier || 'Previous months'}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={onPanLater}
                disabled={isAtEnd}
                title={t.panLater || 'Next months'}
                aria-label={t.panLater || 'Next months'}
              >
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Zoom In & Zoom Out Buttons */}
            <div className={styles.buttonCluster}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={onZoomIn}
                disabled={isAtMinZoom}
                title={t.zoomIn || 'Zoom in'}
                aria-label={t.zoomIn || 'Zoom in'}
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={onZoomOut}
                disabled={isAtMaxZoom}
                title={t.zoomOut || 'Zoom out'}
                aria-label={t.zoomOut || 'Zoom out'}
              >
                <ZoomOut size={14} />
              </button>
            </div>

            {/* Reset Zoom Button */}
            {isZoomed && (
              <button
                type="button"
                className={styles.resetBtn}
                onClick={onResetZoom}
                title={t.resetZoom || 'Reset zoom'}
                aria-label={t.resetZoom || 'Reset zoom'}
              >
                <RotateCcw size={12} />
                <span className={styles.resetBtnLabel}>{t.resetZoom || 'Reset'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  },
)

TimelineToolbar.displayName = 'TimelineToolbar'
