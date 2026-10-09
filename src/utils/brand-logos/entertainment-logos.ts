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

/** Tipico (Tipico Co. Ltd.) — leading sports betting and gaming operator. */
export const TipicoLogo = createImageLogo({
  src: '/brands/tipico.png',
  label: 'Tipico',
  displayName: 'TipicoLogo',
})

/** eXaring AG (waipu.tv) — German IP television and digital entertainment platform. */
export const ExaringLogo = createImageLogo({
  src: '/brands/exaring.png',
  label: 'eXaring (waipu.tv)',
  displayName: 'ExaringLogo',
})

/** Heise Medien (Heise Medien GmbH + Co. KG) — German tech media publisher (c't, iX, heise online). */
export const HeiseMedienLogo = createImageLogo({
  src: '/brands/heise.png',
  label: 'Heise Medien',
  displayName: 'HeiseMedienLogo',
})

/** SSG BW (Staatliche Schlösser und Gärten Baden-Württemberg) — state heritage, castles, and historic monuments authority (e.g. Schloss Heidelberg). */
export const SsgBwLogo = createImageLogo({
  src: '/brands/ssg-bw.png',
  label: 'SSG BW',
  displayName: 'SsgBwLogo',
})

/** Taunus Wunderland (Taunus Wunderland e.K. Otto Barth) — family amusement and theme park in Schlangenbad / Taunus (taunuswunderland.de). */
export const TaunusWunderlandLogo = createImageLogo({
  src: '/brands/taunus-wunderland.png',
  label: 'Taunus Wunderland',
  displayName: 'TaunusWunderlandLogo',
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
  TipicoLogo,
  tipicoLogo: TipicoLogo,
  'tipico': TipicoLogo,
  'tipico-sportwetten': TipicoLogo,
  ExaringLogo,
  exaringLogo: ExaringLogo,
  'exaring': ExaringLogo,
  'waipu': ExaringLogo,
  'waipu.tv': ExaringLogo,
  HeiseMedienLogo,
  heiseMedienLogo: HeiseMedienLogo,
  'heise-medien': HeiseMedienLogo,
  'heise': HeiseMedienLogo,
  SsgBwLogo,
  ssgBwLogo: SsgBwLogo,
  'ssg-bw': SsgBwLogo,
  'ssg': SsgBwLogo,
  TaunusWunderlandLogo,
  taunusWunderlandLogo: TaunusWunderlandLogo,
  'taunus-wunderland': TaunusWunderlandLogo,
  'taunuswunderland': TaunusWunderlandLogo,
}


