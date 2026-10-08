import { createImageLogo } from './logo-factory'
import { CaLogo, CAndALogo } from './retail-logos'
import type { IconComponent } from './types'

/** majo Markenschuhe — German footwear retailer chain in the Rhine-Main area (Kelkheim, Eschborn, etc.). */
export const MajoSchuheLogo = createImageLogo({
  src: '/brands/majo-schuhe.png',
  label: 'majo Markenschuhe',
  displayName: 'MajoSchuheLogo',
})

/** DEICHMANN — Europe's largest footwear retailer. */
export const DeichmannLogo = createImageLogo({
  src: '/brands/deichmann.png',
  label: 'DEICHMANN',
  displayName: 'DeichmannLogo',
})

/** SNIPES — major streetwear and sneaker retailer. */
export const SnipesLogo = createImageLogo({
  src: '/brands/snipes.png',
  label: 'SNIPES',
  displayName: 'SnipesLogo',
})

/** OTTO (Otto Group) — leading German e-commerce platform and marketplace. */
export const OttoLogo = createImageLogo({
  src: '/brands/otto.png',
  label: 'OTTO',
  displayName: 'OttoLogo',
})

/** MyShoes (Deichmann Group) — German footwear retail chain. */
export const MyShoesLogo = createImageLogo({
  src: '/brands/myshoes.png',
  label: 'myShoes',
  displayName: 'MyShoesLogo',
})

/** STONES Baustoffe GmbH — German natural stone, landscaping, and building materials retailer (stones-baustoffe.de). */
export const StonesLogo = createImageLogo({
  src: '/brands/stones.png',
  label: 'STONES Baustoffe',
  displayName: 'StonesLogo',
})
export { StonesLogo as StonesBaustoffeLogo }

export const FASHION_LOGOS: Record<string, IconComponent> = {
  MajoSchuheLogo,
  'majo-schuhe': MajoSchuheLogo,
  DeichmannLogo,
  'deichmann': DeichmannLogo,
  SnipesLogo,
  'snipes': SnipesLogo,
  OttoLogo,
  'otto': OttoLogo,
  MyShoesLogo,
  myShoesLogo: MyShoesLogo,
  'myshoes': MyShoesLogo,
  'my-shoes': MyShoesLogo,
  StonesLogo,
  stonesLogo: StonesLogo,
  StonesBaustoffeLogo: StonesLogo,
  'stones': StonesLogo,
  'stones-baustoffe': StonesLogo,
  'stones-gmbh': StonesLogo,
  'stones-menswear': StonesLogo,
  CaLogo,
  CAndALogo,
  'c-and-a': CaLogo,
  'c&a': CaLogo,
}
