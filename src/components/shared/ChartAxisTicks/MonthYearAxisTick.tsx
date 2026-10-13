import React from 'react'

import { useFormatters } from '../../../hooks/useFormatters'
import { type AxisTickProps, AxisTickText } from './AxisTickText'

/**
 * Localized month/year label for Recharts X axes.
 *
 * Pass a stable element (e.g. `tick={MONTH_YEAR_TICK}`) instead of a `tickFormatter`
 * tied to the current locale. Because this component subscribes to the language store
 * itself, a language switch only re-renders these small labels; the chart's axis
 * configuration stays referentially stable, so Recharts doesn't recompute scales or
 * re-render (and re-animate) every series.
 */
export const MonthYearAxisTick: React.FC<AxisTickProps> = React.memo(({ payload, ...textProps }) => {
  const { formatMonthYear } = useFormatters()
  return <AxisTickText {...textProps} label={formatMonthYear(String(payload?.value ?? ''))} />
})

MonthYearAxisTick.displayName = 'MonthYearAxisTick'
