import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** Swiss Life SE — life insurer and provider of pension/retirement ETF-based investments. */
export const SwissLifeLogo = createImageLogo({
  src: '/brands/swiss-life.png',
  label: 'Swiss Life',
  displayName: 'SwissLifeLogo',
})

/** Canada Life — leading provider of unit-linked retirement and pension investment plans. */
export const CanadaLifeLogo = createImageLogo({
  src: '/brands/canada-life.png',
  label: 'Canada Life',
  displayName: 'CanadaLifeLogo',
})

/** Alte Leipziger — provider of ETF-based retirement provisions and occupational pensions (bAV). */
export const AlteLeipzigerLogo = createImageLogo({
  src: '/brands/alte-leipziger.png',
  label: 'Alte Leipziger',
  displayName: 'AlteLeipzigerLogo',
})

export const PENSION_LOGOS: Record<string, IconComponent> = {
  SwissLifeLogo,
  'swiss-life': SwissLifeLogo,
  CanadaLifeLogo,
  'canada-life': CanadaLifeLogo,
  AlteLeipzigerLogo,
  'alte-leipziger': AlteLeipzigerLogo,
}
