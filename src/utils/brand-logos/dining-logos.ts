import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** Pizza Hut — American international restaurant chain and pizza franchise (Yum! Brands). */
export const PizzaHutLogo = createImageLogo({
  src: '/brands/pizza-hut.png',
  label: 'Pizza Hut',
  displayName: 'PizzaHutLogo',
})

/** Serways — leading German motorway service area and restaurant brand (Tank & Rast group). */
export const SerwaysLogo = createImageLogo({
  src: '/brands/serways.png',
  label: 'Serways Raststätte',
  displayName: 'SerwaysLogo',
})

/** Autobahn Tank & Rast — primary concessionaire for German motorway service stations, restaurants, and hotels. */
export const TankUndRastLogo = createImageLogo({
  src: '/brands/tank-und-rast.png',
  label: 'Tank & Rast',
  displayName: 'TankUndRastLogo',
})

/** Delhi's Belly — authentic Indian restaurant & culinary venue in the Algarve, Portugal. */
export const DelhisBellyLogo = createImageLogo({
  src: '/brands/delhis-belly.png',
  label: "Delhi's Belly Indian Restaurant",
  displayName: 'DelhisBellyLogo',
})

/** Thong Thai — traditional Thai restaurant & catering in Frankfurt-Rödelheim. */
export const ThongThaiLogo = createImageLogo({
  src: '/brands/thong-thai.png',
  label: 'Thong Thai Restaurant',
  displayName: 'ThongThaiLogo',
})

/** Ratsstube Restaurant — historic Franconian restaurant in Rothenburg ob der Tauber. */
export const RatsstubeLogo = createImageLogo({
  src: '/brands/ratsstube.png',
  label: 'Ratsstube Restaurant Rothenburg',
  displayName: 'RatsstubeLogo',
})

/** Smoothie Bar Antalya — fresh juice and fruit smoothie bar in Antalya. */
export const SmoothieBarAntalyaLogo = createImageLogo({
  src: '/brands/smoothie-bar-antalya.png',
  label: 'Smoothie Bar Antalya',
  displayName: 'SmoothieBarAntalyaLogo',
})

/** ICTUR — airport dining, food court, and catering concessionaire at Antalya Airport. */
export const IcturLogo = createImageLogo({
  src: '/brands/ictur.png',
  label: 'ICTUR Airport Dining',
  displayName: 'IcturLogo',
})

/** Wasserpalast Graz-Liebenau — grand Asian buffet restaurant in Graz, Austria. */
export const WasserpalastLogo = createImageLogo({
  src: '/brands/wasserpalast.png',
  label: 'Wasserpalast Graz-Liebenau',
  displayName: 'WasserpalastLogo',
})

/** Burger King — global fast-food restaurant chain. */
export const BurgerKingLogo = createImageLogo({
  src: '/brands/burger-king.png',
  label: 'Burger King',
  displayName: 'BurgerKingLogo',
})

/** Chidoba Mexican Grill — fresh fast-casual Mexican food restaurant in MTZ Sulzbach. */
export const ChidobaLogo = createImageLogo({
  src: '/brands/chidoba.png',
  label: 'Chidoba Mexican Grill',
  displayName: 'ChidobaLogo',
})

/** Eating Point — restaurant and casual dining venue at Faro Airport, Portugal. */
export const EatingPointLogo = createImageLogo({
  src: '/brands/eating-point.png',
  label: 'Eating Point Faro',
  displayName: 'EatingPointLogo',
})

/** Rasthaus Göttingen Ost — motorway service area and restaurant in Rosdorf (Tank & Rast / Serways). */
export const RasthausGoettingenLogo = createImageLogo({
  src: '/brands/rasthaus-goettingen.png',
  label: 'Rasthaus Göttingen Ost',
  displayName: 'RasthausGoettingenLogo',
})

/** Wiener Feinbäckerei Heberer — traditional artisanal bakery chain and café. */
export const WienerFeinbaeckereiLogo = createImageLogo({
  src: '/brands/wiener-feinbaeckerei.png',
  label: 'Wiener Feinbäckerei Heberer',
  displayName: 'WienerFeinbaeckereiLogo',
})

/** Köschinger Forst Ost — motorway service station and restaurant near Hepberg (Tank & Rast / Serways). */
export const KoeschingerForstLogo = createImageLogo({
  src: '/brands/koeschinger-forst.png',
  label: 'Köschinger Forst Ost',
  displayName: 'KoeschingerForstLogo',
})

/** Bad Homburg Retail / Store 3798 — local shop and food store in Bad Homburg vor der Höhe. */
export const BadHomburgRetailLogo = createImageLogo({
  src: '/brands/bad-homburg-retail.png',
  label: 'Bad Homburg Retail',
  displayName: 'BadHomburgRetailLogo',
})

/** Kalea (Kalea GmbH) — craft beer discovery boxes, advent calendars, and beer tasting community. */
export const KaleaLogo = createImageLogo({
  src: '/brands/kalea.png',
  label: 'Kalea',
  displayName: 'KaleaLogo',
})

export const DINING_LOGOS: Record<string, IconComponent> = {
  KaleaLogo,
  kaleaLogo: KaleaLogo,
  'kalea': KaleaLogo,
  PizzaHutLogo,
  pizzaHutLogo: PizzaHutLogo,
  'pizza-hut': PizzaHutLogo,
  SerwaysLogo,
  serwaysLogo: SerwaysLogo,
  'serways': SerwaysLogo,
  'raststaette-spessart': SerwaysLogo,
  TankUndRastLogo,
  tankUndRastLogo: TankUndRastLogo,
  'tank-und-rast': TankUndRastLogo,
  DelhisBellyLogo,
  delhisBellyLogo: DelhisBellyLogo,
  'delhis-belly': DelhisBellyLogo,
  ThongThaiLogo,
  thongThaiLogo: ThongThaiLogo,
  'thong-thai': ThongThaiLogo,
  RatsstubeLogo,
  ratsstubeLogo: RatsstubeLogo,
  'ratsstube': RatsstubeLogo,
  'ratsstube-restaurant': RatsstubeLogo,
  SmoothieBarAntalyaLogo,
  smoothieBarAntalyaLogo: SmoothieBarAntalyaLogo,
  'smoothie-bar': SmoothieBarAntalyaLogo,
  'smoothie-bar-antalya': SmoothieBarAntalyaLogo,
  IcturLogo,
  icturLogo: IcturLogo,
  'ictur': IcturLogo,
  'ictur-yiyecek': IcturLogo,
  WasserpalastLogo,
  wasserpalastLogo: WasserpalastLogo,
  'wasserpalast': WasserpalastLogo,
  'wasserpalast-graz': WasserpalastLogo,
  BurgerKingLogo,
  burgerKingLogo: BurgerKingLogo,
  'burgerking': BurgerKingLogo,
  'burger-king': BurgerKingLogo,
  ChidobaLogo,
  chidobaLogo: ChidobaLogo,
  'chidoba': ChidobaLogo,
  'chidoba-mexican-grill': ChidobaLogo,
  EatingPointLogo,
  eatingPointLogo: EatingPointLogo,
  'eating-point': EatingPointLogo,
  'fao-eating-point': EatingPointLogo,
  RasthausGoettingenLogo,
  rasthausGoettingenLogo: RasthausGoettingenLogo,
  'rasthaus-goettingen': RasthausGoettingenLogo,
  'rasthaus-goettingen-ost': RasthausGoettingenLogo,
  WienerFeinbaeckereiLogo,
  wienerFeinbaeckereiLogo: WienerFeinbaeckereiLogo,
  'wiener-feinbaeckerei': WienerFeinbaeckereiLogo,
  'wiener-feinbackerei': WienerFeinbaeckereiLogo,
  KoeschingerForstLogo,
  koeschingerForstLogo: KoeschingerForstLogo,
  'koeschinger-forst': KoeschingerForstLogo,
  'koeschinger-forst-ost': KoeschingerForstLogo,
  BadHomburgRetailLogo,
  badHomburgRetailLogo: BadHomburgRetailLogo,
  'bad-homburg-store': BadHomburgRetailLogo,
  'bad-homburg-retail': BadHomburgRetailLogo,
}

