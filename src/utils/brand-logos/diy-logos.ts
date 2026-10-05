import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** toom Baumarkt — major German home improvement and DIY hardware store chain (REWE Group). */
export const ToomLogo = createImageLogo({
  src: '/brands/toom.png',
  label: 'toom Baumarkt',
  displayName: 'ToomLogo',
})

export const DIY_LOGOS: Record<string, IconComponent> = {
  ToomLogo,
  toomLogo: ToomLogo,
  ToomBaumarktLogo: ToomLogo,
  'toom': ToomLogo,
  'toom-baumarkt': ToomLogo,
}
