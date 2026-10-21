import React from 'react'

import styles from './TimelineSlider.module.css'

export type TimelineHandleEdge = 'start' | 'end'

export interface TimelineSliderHandleProps {
  edge: TimelineHandleEdge
  ariaLabel: string
  valueMin: number
  valueMax: number
  valueNow: number
  valueText: string
  isActive: boolean
  showBadge: boolean
  isBadgeClamped: boolean
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, edge: TimelineHandleEdge) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void
  onHoverChange: (edge: TimelineHandleEdge | null) => void
}

/**
 * Draggable, keyboard-operable boundary handle of the timeline slider.
 */
export const TimelineSliderHandle: React.FC<TimelineSliderHandleProps> = ({
  edge,
  ariaLabel,
  valueMin,
  valueMax,
  valueNow,
  valueText,
  isActive,
  showBadge,
  isBadgeClamped,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
  onHoverChange,
}) => {
  const edgeClass = edge === 'start' ? styles.handleStart : styles.handleEnd
  const clampClass =
    edge === 'start' ? styles.floatingBadgeClampLeft : styles.floatingBadgeClampRight

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={valueMin}
      aria-valuemax={valueMax}
      aria-valuenow={valueNow}
      aria-valuetext={valueText}
      className={`${styles.handle} ${edgeClass} ${isActive ? styles.handleActive : ''}`}
      onPointerDown={(e) => onPointerDown(e, edge)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={() => onHoverChange(edge)}
      onMouseLeave={() => onHoverChange(null)}
      onKeyDown={onKeyDown}
    >
      {showBadge && (
        <span className={`${styles.floatingBadge} ${isBadgeClamped ? clampClass : ''}`}>
          {valueText}
        </span>
      )}
      <div className={styles.handleGrip}>
        <span className={styles.handleGripBar} />
        <span className={styles.handleGripBar} />
      </div>
    </div>
  )
}
