import { createElement } from 'react'

import { FruechteFeinkostLogo, TransgourmetLogo } from './grocery-logos'
import { createImageLogo, createWordmarkLogo } from './logo-factory'
import type { IconComponent } from './types'

/** Official McDonald's fast-food brand tile with golden arches on red background. */
export const McdonaldsLogo: IconComponent = ({ size = 16, className }) =>
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
        overflow: 'hidden',
        flexShrink: 0,
      },
      className: ['brand-logo-full', className].filter(Boolean).join(' '),
      'data-brand-logo': 'true',
      'aria-label': "McDonald's",
      role: 'img',
    },
    createElement('rect', { width: '48', height: '48', fill: '#DA291C' }),
    createElement(
      'g',
      { transform: 'translate(6, 6) scale(1.5)', fill: '#FFC72C' },
      createElement('path', {
        d: 'M17.243 3.006c2.066 0 3.742 8.714 3.742 19.478H24c0-11.588-3.042-20.968-6.766-20.968-2.127 0-4.007 2.81-5.248 7.227-1.242-4.417-3.12-7.227-5.248-7.227C3.013 1.516 0 10.896 0 22.484h3.015c0-10.764 1.676-19.478 3.742-19.478 2.067 0 3.743 8.714 3.743 19.478h3.001c0-10.764 1.675-19.478 3.742-19.478Z',
      }),
    ),
  )
McdonaldsLogo.displayName = 'McdonaldsLogo'

/** Restoran Desetka — traditional restaurant, grill and cafe in Orašje, Bosnia and Herzegovina. */
export const RestoranDesetkaLogo = createWordmarkLogo({
  label: 'Restoran Desetka Orašje',
  text: 'DESETKA',
  background: '#881337',
  textColor: '#FFFFFF',
  accentColor: '#F59E0B',
  fontSize: 9.5,
  displayName: 'RestoranDesetkaLogo',
})

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

/** BrotHaus (BrotHaus GmbH & Co. KG) — Franconian artisanal bakery and cafe chain based in Rothenburg. */
export const BrotHausLogo = createImageLogo({
  src: '/brands/brothaus.png',
  label: 'BrotHaus',
  displayName: 'BrotHausLogo',
})


/** Bäckerei Moos — traditional artisan bakery & cafe chain across Central Hesse and Bad Homburg. */
export const BaeckereiMoosLogo = createImageLogo({
  src: '/brands/baeckerei-moos.png',
  label: 'Bäckerei Moos',
  displayName: 'BaeckereiMoosLogo',
})

/** Okka Turkish Bakery — authentic Turkish bakery, pastry, and cafe specialist in Frankfurt am Main. */
export const OkkaBakeryLogo = createImageLogo({
  src: '/brands/okka-bakery.png',
  label: 'Okka Turkish Bakery',
  displayName: 'OkkaBakeryLogo',
})

/** Brötchenmacher Frankfurt — artisanal bakery, cafe & breakfast delivery service (broetchenmacher-ffm.de). */
export const BrotchenmacherLogo = createImageLogo({
  src: '/brands/brotchenmacher.png',
  label: 'Brötchenmacher Frankfurt',
  displayName: 'BrotchenmacherLogo',
})

/** Thai Snack Gastronomie — authentic Thai cuisine & catering in Frankfurt am Main (thaisnack.de). */
export const ThaiSnackLogo = createImageLogo({
  src: '/brands/thai-snack.png',
  label: 'Thai Snack Gastronomie',
  displayName: 'ThaiSnackLogo',
})

/** FCS Feinkost Catering Strahmann — artisanal deli, focaccia & event catering in Frankfurt (strahmann.shop). */
export const FeinkostStrahmannLogo = createWordmarkLogo({
  label: 'Feinkost Catering Strahmann',
  text: 'FCS',
  background: '#781D26',
  textColor: '#FFFFFF',
  accentColor: '#D4AF37',
  fontSize: 14,
  displayName: 'FeinkostStrahmannLogo',
})
export { FeinkostStrahmannLogo as FcsFeinkostLogo }


export const DINING_LOGOS: Record<string, IconComponent> = {
  BaeckereiMoosLogo,
  baeckereiMoosLogo: BaeckereiMoosLogo,
  'baeckerei-moos': BaeckereiMoosLogo,
  'baeckerei-moos-bad-homburg': BaeckereiMoosLogo,
  OkkaBakeryLogo,
  okkaBakeryLogo: OkkaBakeryLogo,
  'okka-bakery': OkkaBakeryLogo,
  'okka-turkish-bakery': OkkaBakeryLogo,
  BrotHausLogo,
  brotHausLogo: BrotHausLogo,
  'brothaus': BrotHausLogo,
  'brothaus-gmbh': BrotHausLogo,
  TransgourmetLogo,
  transgourmetLogo: TransgourmetLogo,
  'transgourmet': TransgourmetLogo,
  'transgourmet-deutschland': TransgourmetLogo,
  FruechteFeinkostLogo,
  fruechteFeinkostLogo: FruechteFeinkostLogo,
  'fruechte-und-feinkost': FruechteFeinkostLogo,
  'feinkost-rothenburg': FruechteFeinkostLogo,
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
  RestoranDesetkaLogo,
  restoranDesetkaLogo: RestoranDesetkaLogo,
  'restoran-desetka': RestoranDesetkaLogo,
  'maxi-restoran-desetka': RestoranDesetkaLogo,
  'desetka': RestoranDesetkaLogo,
  BrotchenmacherLogo,
  brotchenmacherLogo: BrotchenmacherLogo,
  'brotchenmacher': BrotchenmacherLogo,
  'broetchenmacher': BrotchenmacherLogo,
  ThaiSnackLogo,
  thaiSnackLogo: ThaiSnackLogo,
  'thai-snack': ThaiSnackLogo,
  FeinkostStrahmannLogo,
  feinkostStrahmannLogo: FeinkostStrahmannLogo,
  'feinkost-strahmann': FeinkostStrahmannLogo,
  'fcs-feinkost': FeinkostStrahmannLogo,
  'fcs-feinkost-catering': FeinkostStrahmannLogo,
  McdonaldsLogo,
  mcdonaldsLogo: McdonaldsLogo,
  'mcdonalds': McdonaldsLogo,
  "mcdonald's": McdonaldsLogo,
  SiMcdonalds: McdonaldsLogo,
}


