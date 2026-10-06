import { createElement, type CSSProperties } from 'react'

import type { IconComponent } from './types'

const SYSTEM_FONT_STACK =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
const LOGO_VIEWBOX_SIZE = 48
const DEFAULT_LOGO_SIZE = 16

const toCssSize = (size: number | string): string =>
  typeof size === 'number' ? `${size}px` : size

const toAttrSize = (size: number | string): number | undefined =>
  typeof size === 'number' ? size : undefined

const getTileStyle = (size: number | string, borderRadius: string): CSSProperties => ({
  width: toCssSize(size),
  height: toCssSize(size),
  display: 'inline-block',
  verticalAlign: 'middle',
  borderRadius,
  flexShrink: 0,
})

interface ImageLogoOptions {
  /** Public asset path, e.g. '/brands/poco.png' */
  src: string
  /** Accessible brand name used for alt text and aria-label */
  label: string
  displayName: string
}

/**
 * Creates a brand logo component that renders a square image tile from `public/brands`.
 * Use for official logos downloaded as assets (keeps markup consistent across brands).
 */
export const createImageLogo = ({ src, label, displayName }: ImageLogoOptions): IconComponent => {
  const ImageLogo: IconComponent = ({ size = DEFAULT_LOGO_SIZE, className }) =>
    createElement('img', {
      src,
      alt: label,
      role: 'img',
      'aria-label': label,
      'data-brand-logo': 'true',
      width: toAttrSize(size),
      height: toAttrSize(size),
      className: ['brand-logo-full', className].filter(Boolean).join(' '),
      style: { ...getTileStyle(size, 'inherit'), objectFit: 'cover' },
    })
  ImageLogo.displayName = displayName
  return ImageLogo
}

interface WordmarkLogoOptions {
  /** Accessible brand name used for aria-label */
  label: string
  /** Short wordmark rendered inside the tile */
  text: string
  background: string
  textColor: string
  /** Optional underline accent bar colour */
  accentColor?: string
  fontSize?: number
  displayName: string
}

/**
 * Creates a compact SVG wordmark tile for brands without a freely available vector logo.
 */
export const createWordmarkLogo = ({
  label,
  text,
  background,
  textColor,
  accentColor,
  fontSize = 13,
  displayName,
}: WordmarkLogoOptions): IconComponent => {
  const WordmarkLogo: IconComponent = ({ size = DEFAULT_LOGO_SIZE, className }) =>
    createElement(
      'svg',
      {
        viewBox: `0 0 ${LOGO_VIEWBOX_SIZE} ${LOGO_VIEWBOX_SIZE}`,
        width: toAttrSize(size),
        height: toAttrSize(size),
        style: getTileStyle(size, 'inherit'),
        className: ['brand-logo-full', className].filter(Boolean).join(' '),
        'data-brand-logo': 'true',
        role: 'img',
        'aria-label': label,
      },
      createElement('rect', {
        width: LOGO_VIEWBOX_SIZE,
        height: LOGO_VIEWBOX_SIZE,
        fill: background,
      }),
      accentColor &&
        createElement('rect', { x: 10, y: 33, width: 28, height: 3.5, rx: 1.75, fill: accentColor }),
      createElement(
        'text',
        {
          x: LOGO_VIEWBOX_SIZE / 2,
          y: accentColor ? 22 : LOGO_VIEWBOX_SIZE / 2,
          dominantBaseline: 'central',
          textAnchor: 'middle',
          fill: textColor,
          fontWeight: 900,
          fontSize,
          letterSpacing: '-0.3px',
          fontFamily: SYSTEM_FONT_STACK,
        },
        text,
      ),
    )
  WordmarkLogo.displayName = displayName
  return WordmarkLogo
}
