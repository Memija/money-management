import { createElement } from 'react'

import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** GVG Glasfaser GmbH — German fiber-to-the-home (FTTH) telecommunications provider. */
export const GvgGlasfaserLogo = createImageLogo({
  src: '/brands/gvg-glasfaser.png',
  label: 'GVG Glasfaser',
  displayName: 'GvgGlasfaserLogo',
})

/** teranet — high-speed fiber broadband brand by GVG Glasfaser. */
export const TeranetLogo = createImageLogo({
  src: '/brands/teranet.png',
  label: 'teranet',
  displayName: 'TeranetLogo',
})

/** mobilezone GmbH / HIGH mobile — leading telecommunications retailer and MVNO provider. */
export const MobilezoneLogo = createImageLogo({
  src: '/brands/mobilezone.png',
  label: 'mobilezone',
  displayName: 'MobilezoneLogo',
})

/** Official Vodafone brand tile with iconic white speechmark on red background. */
export const VodafoneLogo: IconComponent = ({ size = 16, className }) =>
  createElement(
    'svg',
    {
      viewBox: '0 0 48 48',
      width: typeof size === 'number' ? size : undefined,
      height: typeof size === 'number' ? size : undefined,
      style: {
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: 'inherit',
        overflow: 'hidden',
        flexShrink: 0,
      },
      className: ['brand-logo-full', className].filter(Boolean).join(' '),
      'data-brand-logo': 'true',
      'aria-label': 'Vodafone',
      role: 'img',
    },
    createElement('rect', { width: '48', height: '48', fill: '#E60000' }),
    createElement(
      'g',
      { transform: 'translate(4.29, 7.69) scale(1.65)', fill: '#FFFFFF' },
      createElement('path', {
        d: 'M16.25 1.12C16.57 1.12 16.9 1.15 17.11 1.22C14.94 1.67 13.21 3.69 13.22 6C13.22 6.05 13.22 6.11 13.23 6.17C16.87 7.06 18.5 9.25 18.5 12.28C18.54 15.31 16.14 18.64 12.09 18.65C8.82 18.66 5.41 15.86 5.39 11.37C5.38 8.4 7 5.54 9.04 3.85C11.04 2.19 13.77 1.13 16.25 1.12Z',
      }),
    ),
  )
VodafoneLogo.displayName = 'VodafoneLogo'

/** Official O2 telecommunications brand tile with blue background. */
export const O2Logo: IconComponent = ({ size = 16, className }) =>
  createElement(
    'svg',
    {
      viewBox: '0 0 48 48',
      width: typeof size === 'number' ? size : undefined,
      height: typeof size === 'number' ? size : undefined,
      style: {
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: 'inherit',
        overflow: 'hidden',
        flexShrink: 0,
      },
      className: ['brand-logo-full', className].filter(Boolean).join(' '),
      'data-brand-logo': 'true',
      'aria-label': 'O2',
      role: 'img',
    },
    createElement('rect', { width: '48', height: '48', fill: '#0019A5' }),
    createElement(
      'g',
      { transform: 'translate(7.2, 7.4) scale(1.4)', fill: '#FFFFFF' },
      createElement('path', {
        d: 'M9.473.191C3.827.191 0 4.271 0 9.917c0 5.317 3.86 9.726 9.472 9.726 5.61 0 9.433-4.409 9.433-9.726C18.905 4.27 15.116.19 9.473.19zm-.002 2.77c3.677 0 5.79 3.422 5.79 6.956 0 3.314-1.785 6.956-5.79 6.956-4.007 0-5.827-3.642-5.827-6.956 0-3.534 2.148-6.956 5.827-6.956zm11.69 12.48a5.47 5.47 0 0 0-2.44.588l.13 1.367c.543-.353 1.204-.66 1.9-.66.695 0 1.34.355 1.34 1.11 0 1.509-2.791 3.84-3.558 4.584v1.38H24v-1.298h-3.36c1.344-1.32 3.1-2.924 3.1-4.668 0-1.614-1.013-2.403-2.58-2.403z',
      }),
    ),
  )
O2Logo.displayName = 'O2Logo'

export const TELECOM_LOGOS: Record<string, IconComponent> = {
  GvgGlasfaserLogo,
  gvgGlasfaserLogo: GvgGlasfaserLogo,
  GVGGlasfaserLogo: GvgGlasfaserLogo,
  TeranetLogo,
  teranetLogo: TeranetLogo,
  MobilezoneLogo,
  mobilezoneLogo: MobilezoneLogo,
  'mobilezone': MobilezoneLogo,
  'high-mobile': MobilezoneLogo,
  VodafoneLogo,
  vodafoneLogo: VodafoneLogo,
  'vodafone': VodafoneLogo,
  SiVodafone: VodafoneLogo,
  O2Logo,
  o2Logo: O2Logo,
  'o2': O2Logo,
  SiO2: O2Logo,
}

