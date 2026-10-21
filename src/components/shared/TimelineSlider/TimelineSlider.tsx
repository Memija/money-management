import React, { useCallback, useMemo, useRef, useState } from 'react'

import { useLanguageStore } from '../../../store/useLanguageStore'
import { clampWindow, formatMonthRange, resizeWindowEdge } from '../../../utils/timeline-window'
import { type TimelineHandleEdge, TimelineSliderHandle } from './TimelineSliderHandle'

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

type DragMode = TimelineHandleEdge | 'pan'

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
/** Badges closer than this (in % of the track) to an edge are pinned inside the track. */
const BADGE_CLAMP_PCT = 12

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
 * Computes the window resulting from a drag of `deltaMonths` in the given mode.
 * Drags are relative to where the pointer went down, so grabbing a handle never makes it jump.
 */
const getDraggedRange = (
  state: DragState,
  deltaMonths: number,
  totalCount: number,
  minWindow: number,
): [number, number] => {
  if (state.mode === 'pan') {
    return clampWindow(state.initialStart + deltaMonths, state.initialEnd + deltaMonths, totalCount)
  }
  return resizeWindowEdge(
    state.mode,
    state.initialStart,
    state.initialEnd,
    deltaMonths,
    totalCount,
    minWindow,
  )
}

/**
 * Maps a keyboard key to the resulting window for a handle or for the whole selection window.
 * @returns The new `[start, end]` tuple, or `null` when the key is not handled
 */
const getKeyboardRange = (
  mode: DragMode,
  key: string,
  start: number,
  end: number,
  totalCount: number,
  minWindow: number,
): [number, number] | null => {
  const span = end - start + 1
  if (mode === 'pan') {
    const shifts: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      PageUp: -span,
      PageDown: span,
      Home: -start,
      End: totalCount - 1 - end,
    }
    return key in shifts ? clampWindow(start + shifts[key], end + shifts[key], totalCount) : null
  }
  const edgeShifts: Record<string, number> = {
    ArrowLeft: -1,
    ArrowRight: 1,
    ...(mode === 'start' ? { Home: -start } : { End: totalCount - 1 - end }),
  }
  if (!(key in edgeShifts)) {
    return null
  }
  return resizeWindowEdge(mode, start, end, edgeShifts[key], totalCount, minWindow)
}

/**
 * Overview + detail timeline scrubber. A silhouette of monthly activity sits underneath a
 * draggable selection window with resize handles; clicking the track recenters the window.
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
    const [hoveredTarget, setHoveredTarget] = useState<TimelineHandleEdge | null>(null)
    const dragStateRef = useRef<DragState | null>(null)

    const totalCount = data.length
    const effectiveMin = Math.min(minWindow, Math.max(1, totalCount))

    const microBars = useMemo<MicroBar[]>(() => {
      const maxSpend = data.reduce((max, item) => Math.max(max, item.total), 0) || 1
      return data.map((item, idx) => ({
        key: `mb-${item.month}-${idx}`,
        height: `${Math.max(MIN_BAR_HEIGHT_PCT, Math.round((item.total / maxSpend) * 100))}%`,
      }))
    }, [data])
    const inactiveBars = useMemo(
      () => renderMicroBars(microBars, styles.microBarInactive),
      [microBars],
    )
    const activeBars = useMemo(() => renderMicroBars(microBars, styles.microBarActive), [microBars])

    const startPct = totalCount > 0 ? (startIndex / totalCount) * 100 : 0
    const widthPct = totalCount > 0 ? ((endIndex - startIndex + 1) / totalCount) * 100 : 100
    const endPct = startPct + widthPct

    const applyRange = useCallback(
      ([newStart, newEnd]: [number, number]) => {
        if (newStart !== startIndex || newEnd !== endIndex) {
          onRangeChange(newStart, newEnd)
        }
      },
      [startIndex, endIndex, onRangeChange],
    )

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
        const width = trackRef.current?.getBoundingClientRect().width ?? 0
        if (!state || width <= 0 || totalCount <= 0) {
          return
        }
        const deltaMonths = Math.round(((e.clientX - state.startX) / width) * totalCount)
        applyRange(getDraggedRange(state, deltaMonths, totalCount, effectiveMin))
      },
      [totalCount, effectiveMin, applyRange],
    )

    const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // Pointer capture may already be released
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
        const rect = trackRef.current?.getBoundingClientRect()
        if (rect && rect.width > 0 && onScrub) {
          onScrub((e.clientX - rect.left) / rect.width)
        }
      },
      [onScrub],
    )

    const createKeyHandler = useCallback(
      (mode: DragMode) => (e: React.KeyboardEvent<HTMLDivElement>) => {
        const next = getKeyboardRange(mode, e.key, startIndex, endIndex, totalCount, effectiveMin)
        if (next) {
          e.preventDefault()
          applyRange(next)
        }
      },
      [startIndex, endIndex, totalCount, effectiveMin, applyRange],
    )

    if (totalCount <= 1) {
      return null
    }

    const formatLabel = (rawMonth: string) => (formatMonth ? formatMonth(rawMonth) : rawMonth)
    const startLabel = formatLabel(data[startIndex]?.month ?? '')
    const endLabel = formatLabel(data[endIndex]?.month ?? '')
    const rangeLabel = formatMonthRange(startLabel, endLabel)
    const timelineLabel = t.timelineRange || 'Timeline'
    const isBadgeVisible = (edge: TimelineHandleEdge) =>
      activeDragMode === edge || (hoveredTarget === edge && !activeDragMode)
    const selectedMonthCount = endIndex - startIndex + 1
    const monthsTrackedTemplate = t.monthsTracked || '{count} months'
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

          <TimelineSliderHandle
            edge="start"
            ariaLabel={`${timelineLabel} Start (${startLabel})`}
            valueMin={0}
            valueMax={endIndex - effectiveMin + 1}
            valueNow={startIndex}
            valueText={startLabel}
            isActive={activeDragMode === 'start'}
            showBadge={isBadgeVisible('start')}
            isBadgeClamped={startPct < BADGE_CLAMP_PCT}
            onPointerDown={startDrag}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onKeyDown={createKeyHandler('start')}
            onHoverChange={setHoveredTarget}
          />
          <TimelineSliderHandle
            edge="end"
            ariaLabel={`${timelineLabel} End (${endLabel})`}
            valueMin={startIndex + effectiveMin - 1}
            valueMax={totalCount - 1}
            valueNow={endIndex}
            valueText={endLabel}
            isActive={activeDragMode === 'end'}
            showBadge={isBadgeVisible('end')}
            isBadgeClamped={endPct > 100 - BADGE_CLAMP_PCT}
            onPointerDown={startDrag}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onKeyDown={createKeyHandler('end')}
            onHoverChange={setHoveredTarget}
          />

          {/* Draggable selection window (arrow keys / PageUp / PageDown / Home / End pan it) */}
          <div
            role="slider"
            tabIndex={0}
            aria-label={`${timelineLabel} (${monthsTrackedText})`}
            aria-valuemin={0}
            aria-valuemax={totalCount - selectedMonthCount}
            aria-valuenow={startIndex}
            aria-valuetext={rangeLabel}
            className={`${styles.selectionWindow} ${activeDragMode === 'pan' ? styles.selectionWindowDragging : ''}`}
            onPointerDown={(e) => startDrag(e, 'pan')}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={createKeyHandler('pan')}
          >
            <div className={styles.panGripIndicator}>
              <span className={styles.panDot} />
              <span className={styles.panDot} />
              <span className={styles.panDot} />
            </div>

            {activeDragMode === 'pan' && <span className={styles.floatingBadge}>{rangeLabel}</span>}
          </div>
        </div>

        {/* Timeline Bounds & Range Footer */}
        <div className={styles.timelineFooter}>
          <div className={styles.footerBound}>
            <span className={styles.footerDot} />
            <span className={styles.footerLabel}>{formatLabel(data[0]?.month ?? '')}</span>
          </div>

          <div className={styles.footerRangeBadge}>
            <span className={styles.footerRangeText}>{rangeLabel}</span>
            <span className={styles.footerRangeCount}>{`(${monthsTrackedText})`}</span>
          </div>

          <div className={styles.footerBound}>
            <span className={styles.footerLabel}>
              {formatLabel(data[totalCount - 1]?.month ?? '')}
            </span>
            <span className={styles.footerDot} />
          </div>
        </div>
      </div>
    )
  },
)

TimelineSlider.displayName = 'TimelineSlider'
