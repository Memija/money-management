/** Corner radii in clockwise order: top-left, top-right, bottom-right, bottom-left. */
export type CornerRadii = readonly [number, number, number, number]

const PATH_PRECISION = 100

const round = (n: number): number => Math.round(n * PATH_PRECISION) / PATH_PRECISION

const arc = (r: number, toX: number, toY: number): string =>
  r > 0 ? `A${r},${r} 0 0 1 ${round(toX)},${round(toY)}` : ''

/**
 * Builds an SVG path for a rectangle with individually rounded corners.
 * Negative sizes are normalised and radii are clamped to half the shortest side.
 * @param x - Left edge
 * @param y - Top edge
 * @param width - Rectangle width (may be negative)
 * @param height - Rectangle height (may be negative)
 * @param radii - Corner radii (top-left, top-right, bottom-right, bottom-left)
 * @returns SVG path `d` attribute
 */
export const getRoundedRectPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radii: CornerRadii,
): string => {
  const left = width < 0 ? x + width : x
  const top = height < 0 ? y + height : y
  const w = Math.abs(width)
  const h = Math.abs(height)
  const maxRadius = Math.min(w, h) / 2
  const [tl, tr, br, bl] = radii.map((r) => round(Math.max(0, Math.min(r, maxRadius))))
  const right = left + w
  const bottom = top + h

  return (
    `M${round(left + tl)},${round(top)}` +
    `H${round(right - tr)}${arc(tr, right, top + tr)}` +
    `V${round(bottom - br)}${arc(br, right - br, bottom)}` +
    `H${round(left + bl)}${arc(bl, left, bottom - bl)}` +
    `V${round(top + tl)}${arc(tl, left + tl, top)}Z`
  )
}
