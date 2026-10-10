import { createElement } from 'react'

import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** PAYONE GmbH (BS PAYONE / Sparkassen-Finanzgruppe & Worldline) — leading payment processor in DACH. */
export const PayoneLogo = createImageLogo({
  src: '/brands/payone.png',
  label: 'PAYONE',
  displayName: 'PayoneLogo',
})

/** Official PayPal dual-tone monogram tile. */
export const PaypalLogo = createImageLogo({
  src: '/brands/paypal.svg',
  label: 'PayPal',
  displayName: 'PaypalLogo',
})

/** Official Google Pay brand logo tile. */
export const GooglePayLogo = createImageLogo({
  src: '/brands/google-pay.svg',
  label: 'Google Pay',
  displayName: 'GooglePayLogo',
})

/** Official Western Union money transfer brand tile. */
export const WesternUnionLogo: IconComponent = ({ size = 16, className }) =>
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
      'aria-label': 'Western Union',
      role: 'img',
    },
    createElement('rect', { width: '48', height: '48', fill: '#000000' }),
    createElement(
      'g',
      { transform: 'translate(4.2, 5.0) scale(1.65)', fill: '#FFDD00' },
      createElement('path', {
        d: 'M15.799 5.188h5.916L24 9.155l-4.643 8.043c-1.246 2.153-3.28 2.153-4.526 0L7.893 5.188h5.919l4.273 7.39a1.127 1.127 0 0 0 1.981.002l-4.267-7.392ZM0 5.188h5.921l6.237 10.802-.697 1.204c-1.246 2.153-3.285 2.153-4.531 0L0 5.188Z',
      }),
    ),
  )
WesternUnionLogo.displayName = 'WesternUnionLogo'

export const PAYMENT_LOGOS: Record<string, IconComponent> = {
  PayoneLogo,
  'payone': PayoneLogo,
  PAYONELogo: PayoneLogo,
  PaypalLogo,
  PayPalLogo: PaypalLogo,
  SiPaypal: PaypalLogo,
  'paypal': PaypalLogo,
  GooglePayLogo,
  GooglepayLogo: GooglePayLogo,
  GPayLogo: GooglePayLogo,
  SiGooglepay: GooglePayLogo,
  'google-pay': GooglePayLogo,
  'google pay': GooglePayLogo,
  'gpay': GooglePayLogo,
  'GPay': GooglePayLogo,
  WesternUnionLogo,
  westernUnionLogo: WesternUnionLogo,
  'western-union': WesternUnionLogo,
  SiWesternunion: WesternUnionLogo,
}

