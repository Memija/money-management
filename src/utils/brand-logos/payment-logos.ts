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
}

