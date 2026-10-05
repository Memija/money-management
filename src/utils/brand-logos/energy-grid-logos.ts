import { createImageLogo, createWordmarkLogo } from './logo-factory'
import type { IconComponent } from './types'

/** Syna GmbH — electricity/gas grid operator of the Süwag group (Frankfurt/Rhein-Main). */
export const SynaLogo = createImageLogo({
  src: '/brands/syna.png',
  label: 'Syna GmbH',
  displayName: 'SynaLogo',
})

/** Westnetz GmbH — largest German distribution grid operator (Westenergie / E.ON group). */
export const WestnetzLogo = createImageLogo({
  src: '/brands/westnetz.png',
  label: 'Westnetz',
  displayName: 'WestnetzLogo',
})

/** NRM Netzdienste Rhein-Main — grid operator of the Mainova group (Frankfurt am Main). */
export const NrmLogo = createWordmarkLogo({
  label: 'NRM Netzdienste Rhein-Main',
  text: 'NRM',
  background: '#003366',
  textColor: '#FFFFFF',
  accentColor: '#00A0E1',
  fontSize: 14,
  displayName: 'NrmLogo',
})

/** Grünwelt Energie / Wärmestrom — German renewable electricity and eco-gas supplier. */
export const GruenweltLogo = createImageLogo({
  src: '/brands/gruenwelt.png',
  label: 'Grünwelt Energie',
  displayName: 'GruenweltLogo',
})

export const ENERGY_GRID_LOGOS: Record<string, IconComponent> = {
  SynaLogo,
  SynaGmbhLogo: SynaLogo,
  WestnetzLogo,
  NrmLogo,
  NrmNetzdiensteLogo: NrmLogo,
  GruenweltLogo,
  gruenweltLogo: GruenweltLogo,
  GruenweltEnergieLogo: GruenweltLogo,
}
