import React from 'react'

import { useLanguageStore } from '../../../store/useLanguageStore'
import { formatMonthRange } from '../../../utils/timeline-window'

import styles from './TimelinePositionIndicator.module.css'

export interface TimelinePositionIndicatorProps {
  startIndex: number
  endIndex: number
  totalCount: number
  startMonthLabel: string
  endMonthLabel: string
}

/**
 * Slim, display-only bar showing where the visible window sits within the full timeline.
 * Used on mobile, where the chart itself is panned/zoomed by touch and the full slider is hidden.
 */
export const TimelinePositionIndicator: React.FC<TimelinePositionIndicatorProps> = React.memo(
  ({ startIndex, endIndex, totalCount, startMonthLabel, endMonthLabel }) => {
    const t = useLanguageStore((s) => s.t)

    if (totalCount <= 1) {
      return null
    }

    const leftPct = (startIndex / totalCount) * 100
    const widthPct = ((endIndex - startIndex + 1) / totalCount) * 100
    const label = `${t.timelineRange || 'Timeline'}: ${formatMonthRange(startMonthLabel, endMonthLabel)}`

    return (
      <div
        className={styles.indicator}
        role="img"
        aria-label={label}
        data-testid="timeline-position-indicator"
        style={
          {
            '--window-left': `${leftPct}%`,
            '--window-width': `${widthPct}%`,
          } as React.CSSProperties
        }
      >
        <div className={styles.window} />
      </div>
    )
  },
)

TimelinePositionIndicator.displayName = 'TimelinePositionIndicator'
