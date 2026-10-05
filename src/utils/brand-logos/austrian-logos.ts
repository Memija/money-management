import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** BILLA — Austria's premier supermarket chain (Rewe International). */
export const BillaLogo = createImageLogo({
  src: '/brands/billa.png',
  label: 'BILLA',
  displayName: 'BillaLogo',
})

/** BILLA PLUS — Austrian hypermarket chain (formerly Merkur). */
export const BillaPlusLogo = createImageLogo({
  src: '/brands/billa-plus.png',
  label: 'BILLA PLUS',
  displayName: 'BillaPlusLogo',
})

/** BIPA — Austria's leading drugstore & perfume retailer (Rewe Group). */
export const BipaLogo = createImageLogo({
  src: '/brands/bipa.png',
  label: 'BIPA',
  displayName: 'BipaLogo',
})

/** Café Mosshammer — landmark Austrian coffeehouse and pastry café (Stadtplatz, Zell am See). */
export const CafeMossLogo = createImageLogo({
  src: '/brands/cafe-moss.png',
  label: 'Café Restaurant Mosshammer Zell am See',
  displayName: 'CafeMossLogo',
})

/** Freizeitzentrum & Hallenbad Zell am See — sports, wellness and indoor leisure pool. */
export const HallenbadZellLogo = createImageLogo({
  src: '/brands/hallenbad-zellamsee.png',
  label: 'Hallenbad & Freizeitzentrum Zell am See',
  displayName: 'HallenbadZellLogo',
})

/** Alpe-Panon — master franchisee and operator of McDonald's restaurants in Slovenia. */
export const AlpePanonLogo = createImageLogo({
  src: '/brands/alpe-panon.png',
  label: "Alpe-Panon (McDonald's Slovenia)",
  displayName: 'AlpePanonLogo',
})

export const AUSTRIAN_LOGOS: Record<string, IconComponent> = {
  BillaLogo,
  billaLogo: BillaLogo,
  BillaPlusLogo,
  billaPlusLogo: BillaPlusLogo,
  BipaLogo,
  bipaLogo: BipaLogo,
  CafeMossLogo,
  cafeMossLogo: CafeMossLogo,
  MosshammerLogo: CafeMossLogo,
  HallenbadZellLogo,
  hallenbadZellLogo: HallenbadZellLogo,
  HallenbadZellAmSeeLogo: HallenbadZellLogo,
  FreizeitzentrumZellLogo: HallenbadZellLogo,
  AlpePanonLogo,
  alpePanonLogo: AlpePanonLogo,
}
