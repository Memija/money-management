import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** Disney+ — global subscription video-on-demand streaming service by The Walt Disney Company. */
export const DisneyPlusLogo = createImageLogo({
  src: '/brands/disneyplus.png',
  label: 'Disney+',
  displayName: 'DisneyPlusLogo',
})

/** Kronberg Erlebniswelt / Luftseilbahn Jakobsbad-Kronberg AG — Swiss alpine adventure mountain and cable car in Appenzell. */
export const KronbergLogo = createImageLogo({
  src: '/brands/kronberg.png',
  label: 'Erlebniswelt Kronberg',
  displayName: 'KronbergLogo',
})

/** SEA LIFE Konstanz — marine aquarium and visitor attraction at Lake Constance (Merlin Entertainments). */
export const SeaLifeLogo = createImageLogo({
  src: '/brands/sea-life.png',
  label: 'SEA LIFE Konstanz',
  displayName: 'SeaLifeLogo',
})

/** Xsolla (Xsolla HK Limited / Xsolla Inc.) — global video game commerce company and payment engine. */
export const XsollaLogo = createImageLogo({
  src: '/brands/xsolla.png',
  label: 'Xsolla',
  displayName: 'XsollaLogo',
})

export const ENTERTAINMENT_LOGOS: Record<string, IconComponent> = {
  DisneyPlusLogo,
  disneyPlusLogo: DisneyPlusLogo,
  DisneyLogo: DisneyPlusLogo,
  DisneyStreamingLogo: DisneyPlusLogo,
  KronbergLogo,
  kronbergLogo: KronbergLogo,
  'kronberg': KronbergLogo,
  'kronberg-erlebniswelt': KronbergLogo,
  SeaLifeLogo,
  seaLifeLogo: SeaLifeLogo,
  'sea-life': SeaLifeLogo,
  'sealife': SeaLifeLogo,
  XsollaLogo,
  xsollaLogo: XsollaLogo,
  'xsolla': XsollaLogo,
}

