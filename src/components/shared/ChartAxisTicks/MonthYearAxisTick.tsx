import React from 'react'

import { useFormatters } from '../../../hooks/useFormatters'

/** Offset that mirrors Recharts' default `verticalAnchor="start"` tick placement. */
const TICK_BASELINE_OFFSET = '0.71em'

interface MonthYearAxisTickProps {
  /** Injected by Recharts: tick anchor position */
  x?: number
  y?: number
  /** Injected by Recharts: the raw tick value (a `YYYY-MM` month key) */
  payload?: { value?: string | number }
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit'
  fill?: string
  fontSize?: number
  /** Optional extra vertical offset in pixels */
  offsetY?: number
}

/**
 * Localized month/year label for Recharts X axes.
 *
 * Pass a stable element (e.g. `tick={MONTH_YEAR_TICK}`) instead of a `tickFormatter`
 * tied to the current locale. Because this component subscribes to the language store
 * itself, a language switch only re-renders these small labels; the chart's axis
 * configuration stays referentially stable, so Recharts doesn't recompute scales or
 * re-render (and re-animate) every series.
 */
export const MonthYearAxisTick: React.FC<MonthYearAxisTickProps> = React.memo(
  ({ x = 0, y = 0, payload, textAnchor = 'middle', fill, fontSize, offsetY = 0 }) => {
    const { formatMonthYear } = useFormatters()
    const label = formatMonthYear(String(payload?.value ?? ''))

    return (
      <text
        x={x}
        y={y + offsetY}
        dy={TICK_BASELINE_OFFSET}
        textAnchor={textAnchor}
        fill={fill}
        fontSize={fontSize}
        className="recharts-cartesian-axis-tick-value"
      >
        {label}
      </text>
    )
  },
)

MonthYearAxisTick.displayName = 'MonthYearAxisTick'
