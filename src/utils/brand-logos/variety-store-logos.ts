import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** TEDi — leading European non-food variety and discount retail store chain. */
export const TediLogo = createImageLogo({
  src: '/brands/tedi.png',
  label: 'TEDi',
  displayName: 'TediLogo',
})

/** BabyOne — leading German specialist retail superstore for baby and toddler supplies. */
export const BabyOneLogo = createImageLogo({
  src: '/brands/babyone.png',
  label: 'BabyOne',
  displayName: 'BabyOneLogo',
})

export const VARIETY_STORE_LOGOS: Record<string, IconComponent> = {
  TediLogo,
  tediLogo: TediLogo,
  'tedi': TediLogo,
  'tedi-filiale': TediLogo,
  BabyOneLogo,
  babyOneLogo: BabyOneLogo,
  'babyone': BabyOneLogo,
  'baby-one': BabyOneLogo,
}
