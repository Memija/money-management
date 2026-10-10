import { createElement } from 'react'

import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** Netflix (Netflix, Inc.) — global subscription video streaming service. */
export const NetflixLogo: IconComponent = ({ size = 16, className }) =>
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
        flexShrink: 0,
      },
      className: ['brand-logo-full', className].filter(Boolean).join(' '),
      'data-brand-logo': 'true',
      'aria-label': 'Netflix',
      role: 'img',
    },
    createElement('rect', { width: '48', height: '48', fill: '#141414' }),
    createElement(
      'g',
      { transform: 'translate(5.4, 5.4) scale(1.55)', fill: '#E50914' },
      createElement('path', {
        d: 'm5.398 0 8.348 23.602c2.346.059 4.856.398 4.856.398L10.113 0H5.398zm8.489 0v9.172l4.715 13.33V0h-4.715zM5.398 1.5V24c1.873-.225 2.81-.312 4.715-.398V14.83L5.398 1.5z',
      }),
    ),
  )
NetflixLogo.displayName = 'NetflixLogo'

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
  NetflixLogo,
  netflixLogo: NetflixLogo,
  'netflix': NetflixLogo,
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


