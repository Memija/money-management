import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** PAYONE GmbH (BS PAYONE / Sparkassen-Finanzgruppe & Worldline) — leading payment processor in DACH. */
export const PayoneLogo = createImageLogo({
  src: '/brands/payone.png',
  label: 'PAYONE',
  displayName: 'PayoneLogo',
})

export const PAYMENT_LOGOS: Record<string, IconComponent> = {
  PayoneLogo,
  'payone': PayoneLogo,
  PAYONELogo: PayoneLogo,
}
