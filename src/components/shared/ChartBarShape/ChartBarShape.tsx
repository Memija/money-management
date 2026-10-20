import React from 'react'

import { type CornerRadii, getRoundedRectPath } from '../../../utils/svg-paths'

/** Subset of the props Recharts passes to a custom `<Bar shape>` renderer. */
export interface ChartBarShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
  stroke?: string
  strokeWidth?: number | string
  opacity?: number | string
  payload?: Record<string, unknown>
  dataKey?: string | number
}

interface RenderBarPathOptions {
  radius: CornerRadii
  className?: string
  /** Vertical gap (px) trimmed from the segment, split evenly between top and bottom */
  gap?: number
  /** Minimum rendered height (px) after trimming the gap */
  minHeight?: number
}

/**
 * Renders a bar segment as a single stateless `<path>`.
 *
 * Recharts' default `Rectangle` measures `getTotalLength()` and re-renders itself after
 * every mount. Bar segments are keyed by their pixel position, so each zoom/pan step remounts
 * every segment; with hundreds of stacked segments this made timeline navigation sluggish.
 * @param props - Shape props provided by Recharts
 * @param options - Corner radii, optional class name, gap and minimum height
 * @returns Path element, or null for empty segments
 */
export const renderBarPath = (
  props: ChartBarShapeProps,
  { radius, className, gap = 0, minHeight = 0 }: RenderBarPathOptions,
): React.ReactElement | null => {
  const { x = 0, y = 0, width = 0, height = 0, fill, stroke, strokeWidth, opacity } = props
  if (!width || !height || width <= 0 || height === 0) {
    return null
  }
  const absHeight = Math.abs(height)
  const top = (height < 0 ? y + height : y) + gap / 2
  const trimmedHeight = Math.max(minHeight, absHeight - gap)

  return (
    <path
      d={getRoundedRectPath(x, top, width, trimmedHeight, radius)}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      className={className}
    />
  )
}
