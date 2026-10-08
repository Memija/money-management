import { StonesBaustoffeLogo, StonesLogo } from './fashion-logos'
import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** toom Baumarkt — major German home improvement and DIY hardware store chain (REWE Group). */
export const ToomLogo = createImageLogo({
  src: '/brands/toom.png',
  label: 'toom Baumarkt',
  displayName: 'ToomLogo',
})

export { StonesBaustoffeLogo, StonesLogo }

export const DIY_LOGOS: Record<string, IconComponent> = {
  ToomLogo,
  toomLogo: ToomLogo,
  ToomBaumarktLogo: ToomLogo,
  'toom': ToomLogo,
  'toom-baumarkt': ToomLogo,
  StonesLogo,
  stonesLogo: StonesLogo,
  StonesBaustoffeLogo,
  'stones': StonesLogo,
  'stones-baustoffe': StonesLogo,
  'stones-gmbh': StonesLogo,
}
