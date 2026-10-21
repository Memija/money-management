import React from 'react'
import { Calendar, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

import type { TimelinePreset } from '../../../hooks/useTimelineZoom'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { formatMonthRange } from '../../../utils/timeline-window'

import styles from './TimelineToolbar.module.css'

/** Presets with the minimum number of months required before they are offered. */
const PRESET_MIN_MONTHS: Array<{ preset: Exclude<TimelinePreset, 'All'>; minMonths: number }> = [
  { preset: '3M', minMonths: 4 },
  { preset: '6M', minMonths: 7 },
  { preset: '1Y', minMonths: 13 },
]

export interface TimelineToolbarProps {
  visibleCount: number
  totalCount: number
  startMonthLabel: string
  endMonthLabel: string
  isAtStart: boolean
  isAtEnd: boolean
  isAtMinZoom: boolean
  isAtMaxZoom: boolean
  activePreset: TimelinePreset | null
  /**
   * When true, a `TimelineSlider` is rendered alongside the chart. The slider already shows the
   * selected range and supports panning/resizing, so the toolbar reduces to the quick presets.
   */
  hasOverview?: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onPanEarlier: () => void
  onPanLater: () => void
  onSelectPreset: (preset: TimelinePreset) => void
}

export const TimelineToolbar: React.FC<TimelineToolbarProps> = React.memo(
  ({
    visibleCount,
    totalCount,
    startMonthLabel,
    endMonthLabel,
    isAtStart,
    isAtEnd,
    isAtMinZoom,
    isAtMaxZoom,
    activePreset,
    hasOverview = false,
    onZoomIn,
    onZoomOut,
    onPanEarlier,
    onPanLater,
    onSelectPreset,
  }) => {
    const t = useLanguageStore((s) => s.t)

    const presetLabels: Record<TimelinePreset, string> = {
      '3M': t.preset3M || '3M',
      '6M': t.preset6M || '6M',
      '1Y': t.preset1Y || '1Y',
      All: t.presetAll || 'All',
    }
    const availablePresets: TimelinePreset[] = [
      ...PRESET_MIN_MONTHS.filter(({ minMonths }) => totalCount >= minMonths).map(
        ({ preset }) => preset,
      ),
      'All',
    ]

    const showingText = (t.showingMonths || '{visible} of {total} months')
      .replace('{visible}', String(visibleCount))
      .replace('{total}', String(totalCount))

    return (
      <div
        className={`${styles.toolbar} ${hasOverview ? styles.toolbarCompact : ''}`}
        role="region"
        aria-label={t.timelineRange || 'Timeline'}
      >
        {!hasOverview && (
          <div className={styles.infoRow}>
            <div className={styles.rangeBadge}>
              <Calendar size={13} className={styles.calendarIcon} aria-hidden="true" />
              <span>{formatMonthRange(startMonthLabel, endMonthLabel)}</span>
            </div>

            <span className={styles.countPill}>{showingText}</span>
          </div>
        )}

        <div className={styles.controlsRow}>
          {/* Quick window presets */}
          <div
            className={styles.presetsGroup}
            role="group"
            aria-label={t.timelineRange || 'Timeline'}
          >
            {availablePresets.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`${styles.presetBtn} ${activePreset === preset ? styles.presetBtnActive : ''}`}
                onClick={() => onSelectPreset(preset)}
                title={presetLabels[preset]}
                aria-label={presetLabels[preset]}
                aria-pressed={activePreset === preset}
              >
                {presetLabels[preset]}
              </button>
            ))}
          </div>

          {/* Step controls (the slider covers these when it is shown) */}
          {!hasOverview && (
            <div className={styles.actionsGroup}>
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
            </div>
          )}
        </div>
      </div>
    )
  },
)

TimelineToolbar.displayName = 'TimelineToolbar'
