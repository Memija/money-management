import { createImageLogo } from './logo-factory'
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

/** STONES — German menswear, tailored suits, and casual fashion brand. */
export const StonesLogo = createImageLogo({
  src: '/brands/stones.png',
  label: 'STONES Menswear',
  displayName: 'StonesLogo',
})

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
  'stones': StonesLogo,
  'stones-gmbh': StonesLogo,
  'stones-menswear': StonesLogo,
}
