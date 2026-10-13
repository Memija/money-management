import React from 'react'

/** Offset that mirrors Recharts' default `verticalAnchor="start"` tick placement. */
const TICK_BASELINE_OFFSET = '0.71em'

/** Props Recharts injects into custom tick elements, plus shared styling options. */
export interface AxisTickProps {
  /** Injected by Recharts: tick anchor position */
  x?: number
  y?: number
  /** Injected by Recharts: the raw tick value */
  payload?: { value?: string | number }
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit'
  fill?: string
  fontSize?: number
  /** Optional extra vertical offset in pixels */
  offsetY?: number
}

interface AxisTickTextProps extends Omit<AxisTickProps, 'payload'> {
  /** Already formatted label */
  label: string
}

/**
 * Shared SVG text used by the localized axis ticks so they match Recharts' default tick
 * markup and styling.
 */
export const AxisTickText: React.FC<AxisTickTextProps> = ({
  x = 0,
  y = 0,
  textAnchor = 'middle',
  fill,
  fontSize,
  offsetY = 0,
  label,
}) => (
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
