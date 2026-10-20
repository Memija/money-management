import React, { useCallback, useMemo, useRef, useState } from 'react'

import { useLanguageStore } from '../../../store/useLanguageStore'

import styles from './TimelineSlider.module.css'

export interface MonthSummary {
  month: string
  total: number
}

export interface TimelineSliderProps {
  data: MonthSummary[]
  startIndex: number
  endIndex: number
  minWindow?: number
  formatMonth?: (rawMonth: string) => string
  onRangeChange: (startIndex: number, endIndex: number) => void
  onScrub?: (ratio: number) => void
  'data-testid'?: string
}

type DragMode = 'start' | 'end' | 'pan'

interface DragState {
  mode: DragMode
  startX: number
  initialStart: number
  initialEnd: number
}

interface MicroBar {
  key: string
  height: string
}

/** Minimum visual height (in %) of a micro-bar so empty months stay visible. */
const MIN_BAR_HEIGHT_PCT = 10

/**
 * Renders a static row of micro-bars. The output only depends on the dataset, so it can be
 * memoized and reused across drag frames without React reconciling every bar.
 * @param bars - Precomputed bar keys and heights
 * @param variantClass - Visual variant applied to every bar in the layer
 * @returns Array of bar elements
 */
const renderMicroBars = (bars: MicroBar[], variantClass: string): React.ReactElement[] =>
  bars.map((bar) => (
    <div
      key={bar.key}
      className={`${styles.microBar} ${variantClass}`}
      style={{ '--bar-height': bar.height } as React.CSSProperties}
    />
  ))

/**
 * Ultra-responsive, hardware-accelerated timeline scrubber for timeline datasets.
 * Features an illuminated selection lens, frosted boundary curtains, tactile grip handles,
 * and adaptive floating date badges.
 */
export const TimelineSlider: React.FC<TimelineSliderProps> = React.memo(
  ({
    data,
    startIndex,
    endIndex,
    minWindow = 3,
    formatMonth,
    onRangeChange,
    onScrub,
    'data-testid': testId = 'timeline-brush',
  }) => {
    const t = useLanguageStore((s) => s.t)
    const trackRef = useRef<HTMLDivElement>(null)
    const [activeDragMode, setActiveDragMode] = useState<DragMode | null>(null)
    const [hoveredTarget, setHoveredTarget] = useState<'start' | 'end' | null>(null)
    const dragStateRef = useRef<DragState | null>(null)

    const totalCount = data.length
    const effectiveMin = Math.min(minWindow, Math.max(1, totalCount))

    const maxSpend = useMemo(() => {
      let max = 0
      for (let i = 0; i < data.length; i++) {
        if (data[i].total > max) {
          max = data[i].total
        }
      }
      return max > 0 ? max : 1
    }, [data])

    const microBars = useMemo<MicroBar[]>(
      () =>
        data.map((item, idx) => ({
          key: `mb-${item.month}-${idx}`,
          height: `${Math.max(MIN_BAR_HEIGHT_PCT, Math.round((item.total / maxSpend) * 100))}%`,
        })),
      [data, maxSpend],
    )
    const inactiveBars = useMemo(
      () => renderMicroBars(microBars, styles.microBarInactive),
      [microBars],
    )
    const activeBars = useMemo(() => renderMicroBars(microBars, styles.microBarActive), [microBars])

    const startPct = totalCount > 0 ? (startIndex / totalCount) * 100 : 0
    const widthPct = totalCount > 0 ? ((endIndex - startIndex + 1) / totalCount) * 100 : 100
    const endPct = startPct + widthPct

    const startDrag = useCallback(
      (e: React.PointerEvent<HTMLDivElement>, mode: DragMode) => {
        e.preventDefault()
        e.stopPropagation()
        e.currentTarget.setPointerCapture(e.pointerId)
        dragStateRef.current = {
          mode,
          startX: e.clientX,
          initialStart: startIndex,
          initialEnd: endIndex,
        }
        setActiveDragMode(mode)
      },
      [startIndex, endIndex],
    )

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        const state = dragStateRef.current
        const track = trackRef.current
        if (!state || !track || totalCount <= 0) {
          return
        }

        const rect = track.getBoundingClientRect()
        if (rect.width <= 0) {
          return
        }

        const currentX = e.clientX

        if (state.mode === 'start') {
          const ratio = Math.max(0, Math.min(1, (currentX - rect.left) / rect.width))
          const targetIndex = Math.round(ratio * (totalCount - 1))
          const maxStart = state.initialEnd - effectiveMin + 1
          const newStart = Math.max(0, Math.min(targetIndex, maxStart))
          if (newStart !== startIndex) {
            onRangeChange(newStart, state.initialEnd)
          }
        } else if (state.mode === 'end') {
          const ratio = Math.max(0, Math.min(1, (currentX - rect.left) / rect.width))
          const targetIndex = Math.round(ratio * (totalCount - 1))
          const minEnd = state.initialStart + effectiveMin - 1
          const newEnd = Math.min(totalCount - 1, Math.max(targetIndex, minEnd))
          if (newEnd !== endIndex) {
            onRangeChange(state.initialStart, newEnd)
          }
        } else if (state.mode === 'pan') {
          const deltaX = currentX - state.startX
          const deltaMonths = Math.round((deltaX / rect.width) * totalCount)
          const span = state.initialEnd - state.initialStart
          let newStart = state.initialStart + deltaMonths
          let newEnd = newStart + span

          if (newStart < 0) {
            newStart = 0
            newEnd = span
          }
          if (newEnd > totalCount - 1) {
            newEnd = totalCount - 1
            newStart = Math.max(0, newEnd - span)
          }

          if (newStart !== startIndex || newEnd !== endIndex) {
            onRangeChange(newStart, newEnd)
          }
        }
      },
      [totalCount, effectiveMin, startIndex, endIndex, onRangeChange],
    )

    const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // Pointer capture release
      }
      dragStateRef.current = null
      setActiveDragMode(null)
    }, [])

    const handleTrackClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement
        if (target.closest(`.${styles.selectionWindow}`) || target.closest(`.${styles.handle}`)) {
          return
        }
        const track = trackRef.current
        if (!track || !onScrub) {
          return
        }
        const rect = track.getBoundingClientRect()
        if (rect.width > 0) {
          const ratio = (e.clientX - rect.left) / rect.width
          onScrub(ratio)
        }
      },
      [onScrub],
    )

    const handleStartKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          onRangeChange(Math.max(0, startIndex - 1), endIndex)
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          onRangeChange(Math.min(endIndex - effectiveMin + 1, startIndex + 1), endIndex)
        } else if (e.key === 'Home') {
          e.preventDefault()
          onRangeChange(0, endIndex)
        }
      },
      [startIndex, endIndex, effectiveMin, onRangeChange],
    )

    const handleEndKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          onRangeChange(startIndex, Math.max(startIndex + effectiveMin - 1, endIndex - 1))
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          onRangeChange(startIndex, Math.min(totalCount - 1, endIndex + 1))
        } else if (e.key === 'End') {
          e.preventDefault()
          onRangeChange(startIndex, totalCount - 1)
        }
      },
      [startIndex, endIndex, effectiveMin, totalCount, onRangeChange],
    )

    const formatLabel = useCallback(
      (rawMonth: string) => (formatMonth ? formatMonth(rawMonth) : rawMonth),
      [formatMonth],
    )

    if (totalCount <= 1) {
      return null
    }

    const startLabel = formatLabel(data[startIndex]?.month ?? '')
    const endLabel = formatLabel(data[endIndex]?.month ?? '')
    const firstLabel = formatLabel(data[0]?.month ?? '')
    const lastLabel = formatLabel(data[totalCount - 1]?.month ?? '')
    const timelineLabel = t.timelineRange || 'Timeline'
    const showStartBadge =
      activeDragMode === 'start' || (hoveredTarget === 'start' && !activeDragMode)
    const showEndBadge = activeDragMode === 'end' || (hoveredTarget === 'end' && !activeDragMode)
    const showPanBadge = activeDragMode === 'pan'
    const selectedMonthCount = endIndex - startIndex + 1
    const monthsTrackedTemplate = t.monthsTracked || '{count} Monate'
    const monthsTrackedText = monthsTrackedTemplate.includes('{count}')
      ? monthsTrackedTemplate.replace('{count}', String(selectedMonthCount))
      : `${selectedMonthCount} ${monthsTrackedTemplate}`

    return (
      <div
        data-testid={testId}
        data-start={startIndex}
        data-end={endIndex}
        className={styles.sliderContainer}
      >
        <div
          ref={trackRef}
          data-testid="timeline-track"
          className={styles.track}
          onClick={handleTrackClick}
          style={
            {
              '--window-left': `${startPct}%`,
              '--window-width': `${widthPct}%`,
            } as React.CSSProperties
          }
        >
          {/* Micro-bars silhouette: static base layer + active layer clipped to the window */}
          <div className={styles.microBarsTrack}>
            <div className={styles.microBarsLayer}>{inactiveBars}</div>
            <div className={`${styles.microBarsLayer} ${styles.microBarsLayerActive}`}>
              {activeBars}
            </div>
          </div>

          {/* Boundary curtains over unselected regions */}
          <div className={styles.curtainLeft} />
          <div className={styles.curtainRight} />

          {/* Draggable Selection Lens Window */}
          <div
            className={`${styles.selectionWindow} ${activeDragMode === 'pan' ? styles.selectionWindowDragging : ''}`}
            onPointerDown={(e) => startDrag(e, 'pan')}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {/* Center pan grab indicator */}
            <div className={styles.panGripIndicator}>
              <span className={styles.panDot} />
              <span className={styles.panDot} />
              <span className={styles.panDot} />
            </div>

            {showPanBadge && (
              <span className={styles.floatingBadge}>
                {startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`}
              </span>
            )}

            {/* Left Traveller Handle */}
            <div
              role="slider"
              tabIndex={0}
              aria-label={`${timelineLabel} Start (${startLabel})`}
              aria-valuemin={0}
              aria-valuemax={endIndex - effectiveMin + 1}
              aria-valuenow={startIndex}
              aria-valuetext={startLabel}
              className={`${styles.handle} ${styles.handleStart} ${activeDragMode === 'start' ? styles.handleActive : ''}`}
              onPointerDown={(e) => startDrag(e, 'start')}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onMouseEnter={() => setHoveredTarget('start')}
              onMouseLeave={() => setHoveredTarget(null)}
              onKeyDown={handleStartKeyDown}
            >
              {showStartBadge && (
                <span
                  className={`${styles.floatingBadge} ${startPct < 12 ? styles.floatingBadgeClampLeft : ''}`}
                >
                  {startLabel}
                </span>
              )}
              <div className={styles.handleGrip}>
                <span className={styles.handleGripBar} />
                <span className={styles.handleGripBar} />
              </div>
            </div>

            {/* Right Traveller Handle */}
            <div
              role="slider"
              tabIndex={0}
              aria-label={`${timelineLabel} End (${endLabel})`}
              aria-valuemin={startIndex + effectiveMin - 1}
              aria-valuemax={totalCount - 1}
              aria-valuenow={endIndex}
              aria-valuetext={endLabel}
              className={`${styles.handle} ${styles.handleEnd} ${activeDragMode === 'end' ? styles.handleActive : ''}`}
              onPointerDown={(e) => startDrag(e, 'end')}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onMouseEnter={() => setHoveredTarget('end')}
              onMouseLeave={() => setHoveredTarget(null)}
              onKeyDown={handleEndKeyDown}
            >
              {showEndBadge && (
                <span
                  className={`${styles.floatingBadge} ${endPct > 88 ? styles.floatingBadgeClampRight : ''}`}
                >
                  {endLabel}
                </span>
              )}
              <div className={styles.handleGrip}>
                <span className={styles.handleGripBar} />
                <span className={styles.handleGripBar} />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Bounds & Range Footer */}
        <div className={styles.timelineFooter}>
          <div className={styles.footerBound}>
            <span className={styles.footerDot} />
            <span className={styles.footerLabel}>{firstLabel}</span>
          </div>

          <div className={styles.footerRangeBadge}>
            <span className={styles.footerRangeText}>
              {startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`}
            </span>
            <span className={styles.footerRangeCount}>{`(${monthsTrackedText})`}</span>
          </div>

          <div className={styles.footerBound}>
            <span className={styles.footerLabel}>{lastLabel}</span>
            <span className={styles.footerDot} />
          </div>
        </div>
      </div>
    )
  },
)

TimelineSlider.displayName = 'TimelineSlider'
