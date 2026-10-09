import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

// REWE
const RawReweLogo = createImageLogo({
  src: '/brands/rewe.svg',
  label: 'REWE',
  displayName: 'ReweLogo',
})
export const ReweLogo: IconComponent = (props) => <RawReweLogo {...props} />
ReweLogo.displayName = 'ReweLogo'

// Lidl
const RawLidlLogo = createImageLogo({
  src: '/brands/lidl.svg',
  label: 'Lidl',
  displayName: 'LidlLogo',
})
export const LidlLogo: IconComponent = (props) => <RawLidlLogo {...props} />
LidlLogo.displayName = 'LidlLogo'

// ALDI SÜD
const RawAldiSudLogo = createImageLogo({
  src: '/brands/aldi-sud.svg',
  label: 'ALDI SÜD',
  displayName: 'AldiSudLogo',
})
export const AldiSudLogo: IconComponent = (props) => <RawAldiSudLogo {...props} />
AldiSudLogo.displayName = 'AldiSudLogo'

// ALDI Nord
const RawAldiNordLogo = createImageLogo({
  src: '/brands/aldi-nord.svg',
  label: 'ALDI Nord',
  displayName: 'AldiNordLogo',
})
export const AldiNordLogo: IconComponent = (props) => <RawAldiNordLogo {...props} />
AldiNordLogo.displayName = 'AldiNordLogo'

/** Unified ALDI fallback pointing to ALDI SÜD by default. */
export const AldiLogo = AldiSudLogo

// EDEKA
const RawEdekaLogo = createImageLogo({
  src: '/brands/edeka.svg',
  label: 'EDEKA',
  displayName: 'EdekaLogo',
})
export const EdekaLogo: IconComponent = (props) => <RawEdekaLogo {...props} />
EdekaLogo.displayName = 'EdekaLogo'

// Kaufland
const RawKauflandLogo = createImageLogo({
  src: '/brands/kaufland.svg',
  label: 'Kaufland',
  displayName: 'KauflandLogo',
})
export const KauflandLogo: IconComponent = (props) => <RawKauflandLogo {...props} />
KauflandLogo.displayName = 'KauflandLogo'

// PENNY
const RawPennyLogo = createImageLogo({
  src: '/brands/penny.svg',
  label: 'PENNY',
  displayName: 'PennyLogo',
})
export const PennyLogo: IconComponent = (props) => <RawPennyLogo {...props} />
PennyLogo.displayName = 'PennyLogo'

// Netto Marken-Discount
const RawNettoLogo = createImageLogo({
  src: '/brands/netto.svg',
  label: 'Netto Marken-Discount',
  displayName: 'NettoLogo',
})
export const NettoLogo: IconComponent = (props) => <RawNettoLogo {...props} />
NettoLogo.displayName = 'NettoLogo'

// GLOBUS / Globus Markthalle
const RawGlobusLogo = createImageLogo({
  src: '/brands/globus.svg',
  label: 'GLOBUS',
  displayName: 'GlobusLogo',
})
export const GlobusLogo: IconComponent = (props) => <RawGlobusLogo {...props} />
GlobusLogo.displayName = 'GlobusLogo'

// BILLA
const RawBillaLogo = createImageLogo({
  src: '/brands/billa.svg',
  label: 'BILLA',
  displayName: 'BillaLogo',
})
export const BillaLogo: IconComponent = (props) => <RawBillaLogo {...props} />
BillaLogo.displayName = 'BillaLogo'

// BILLA PLUS
const RawBillaPlusLogo = createImageLogo({
  src: '/brands/billa-plus.png',
  label: 'BILLA PLUS',
  displayName: 'BillaPlusLogo',
})
export const BillaPlusLogo: IconComponent = (props) => <RawBillaPlusLogo {...props} />
BillaPlusLogo.displayName = 'BillaPlusLogo'

// Biedronka
const RawBiedronkaLogo = createImageLogo({
  src: '/brands/biedronka.png',
  label: 'Biedronka',
  displayName: 'BiedronkaLogo',
})
export const BiedronkaLogo: IconComponent = (props) => <RawBiedronkaLogo {...props} />
BiedronkaLogo.displayName = 'BiedronkaLogo'

// Żabka
const RawZabkaLogo = createImageLogo({
  src: '/brands/zabka.svg',
  label: 'Żabka',
  displayName: 'ZabkaLogo',
})
export const ZabkaLogo: IconComponent = (props) => <RawZabkaLogo {...props} />
ZabkaLogo.displayName = 'ZabkaLogo'

// Carrefour
const RawCarrefourLogo = createImageLogo({
  src: '/brands/carrefour.svg',
  label: 'Carrefour',
  displayName: 'CarrefourLogo',
})
export const CarrefourLogo: IconComponent = (props) => <RawCarrefourLogo {...props} />
CarrefourLogo.displayName = 'CarrefourLogo'

// Auchan
const RawAuchanLogo = createImageLogo({
  src: '/brands/auchan.svg',
  label: 'Auchan',
  displayName: 'AuchanLogo',
})
export const AuchanLogo: IconComponent = (props) => <RawAuchanLogo {...props} />
AuchanLogo.displayName = 'AuchanLogo'

// Coop
const RawCoopLogo = createImageLogo({
  src: '/brands/coop.svg',
  label: 'Coop',
  displayName: 'CoopLogo',
})
export const CoopLogo: IconComponent = (props) => <RawCoopLogo {...props} />
CoopLogo.displayName = 'CoopLogo'

// Tesco
const RawTescoLogo = createImageLogo({
  src: '/brands/tesco.svg',
  label: 'Tesco',
  displayName: 'TescoLogo',
})
export const TescoLogo: IconComponent = (props) => <RawTescoLogo {...props} />
TescoLogo.displayName = 'TescoLogo'

// ASDA
const RawAsdaLogo = createImageLogo({
  src: '/brands/asda.svg',
  label: 'ASDA',
  displayName: 'AsdaLogo',
})
export const AsdaLogo: IconComponent = (props) => <RawAsdaLogo {...props} />
AsdaLogo.displayName = 'AsdaLogo'

// Morrisons
const RawMorrisonsLogo = createImageLogo({
  src: '/brands/morrisons.svg',
  label: 'Morrisons',
  displayName: 'MorrisonsLogo',
})
export const MorrisonsLogo: IconComponent = (props) => <RawMorrisonsLogo {...props} />
MorrisonsLogo.displayName = 'MorrisonsLogo'

// HelloFresh
const RawHellofreshLogo = createImageLogo({
  src: '/brands/hellofresh.svg',
  label: 'HelloFresh',
  displayName: 'HellofreshLogo',
})
export const HellofreshLogo: IconComponent = (props) => <RawHellofreshLogo {...props} />
HellofreshLogo.displayName = 'HellofreshLogo'

// Dino
const RawDinoLogo = createImageLogo({
  src: '/brands/dino.svg',
  label: 'Dino',
  displayName: 'DinoLogo',
})
export const DinoLogo: IconComponent = (props) => <RawDinoLogo {...props} />
DinoLogo.displayName = 'DinoLogo'

// Bingo
const RawBingoLogo = createImageLogo({
  src: '/brands/bingo.svg',
  label: 'Bingo',
  displayName: 'BingoLogo',
})
export const BingoLogo: IconComponent = (props) => <RawBingoLogo {...props} />
BingoLogo.displayName = 'BingoLogo'

// Konzum
const RawKonzumLogo = createImageLogo({
  src: '/brands/konzum.svg',
  label: 'Konzum',
  displayName: 'KonzumLogo',
})
export const KonzumLogo: IconComponent = (props) => <RawKonzumLogo {...props} />
KonzumLogo.displayName = 'KonzumLogo'

// SPAR
const RawSparLogo = createImageLogo({
  src: '/brands/spar.png',
  label: 'SPAR',
  displayName: 'SparLogo',
})
export const SparLogo: IconComponent = (props) => <RawSparLogo {...props} />
SparLogo.displayName = 'SparLogo'

// Anadolu Supermarkt
const RawAnadoluSupermarktLogo = createImageLogo({
  src: '/brands/anadolu.png',
  label: 'Anadolu Supermarkt',
  displayName: 'AnadoluSupermarktLogo',
})
export const AnadoluSupermarktLogo: IconComponent = (props) => <RawAnadoluSupermarktLogo {...props} />
AnadoluSupermarktLogo.displayName = 'AnadoluSupermarktLogo'

// Transgourmet
const RawTransgourmetLogo = createImageLogo({
  src: '/brands/transgourmet.png',
  label: 'Transgourmet',
  displayName: 'TransgourmetLogo',
})
export const TransgourmetLogo: IconComponent = (props) => <RawTransgourmetLogo {...props} />
TransgourmetLogo.displayName = 'TransgourmetLogo'

// Früchte und Feinkost
const RawFruechteFeinkostLogo = createImageLogo({
  src: '/brands/fruechte-und-feinkost.png',
  label: 'Früchte und Feinkost',
  displayName: 'FruechteFeinkostLogo',
})
export const FruechteFeinkostLogo: IconComponent = (props) => <RawFruechteFeinkostLogo {...props} />
FruechteFeinkostLogo.displayName = 'FruechteFeinkostLogo'

// Rossmann
const RawRossmannLogo = createImageLogo({
  src: '/brands/rossmann.svg',
  label: 'Rossmann',
  displayName: 'RossmannLogo',
})
export const RossmannLogo: IconComponent = (props) => <RawRossmannLogo {...props} />
RossmannLogo.displayName = 'RossmannLogo'

// dm-drogerie markt
const RawDmLogo = createImageLogo({
  src: '/brands/dm.svg',
  label: 'dm-drogerie markt',
  displayName: 'DmLogo',
})
export const DmLogo: IconComponent = (props) => <RawDmLogo {...props} />
DmLogo.displayName = 'DmLogo'

// eslint-disable-next-line react-refresh/only-export-components
export const GROCERY_LOGOS: Record<string, IconComponent> = {
  // Rossmann
  RossmannLogo,
  rossmannLogo: RossmannLogo,
  rossmann: RossmannLogo,
  Rossmann: RossmannLogo,
  SiRossmann: RossmannLogo,

  // dm-drogerie markt
  DmLogo,
  dmLogo: DmLogo,
  dm: DmLogo,
  'dm-drogerie': DmLogo,
  'dm-drogerie markt': DmLogo,
  SiDm: DmLogo,

  // REWE
  ReweLogo,
  reweLogo: ReweLogo,
  REWELogo: ReweLogo,
  rewe: ReweLogo,
  REWE: ReweLogo,
  SiRewe: ReweLogo,

  // Lidl
  LidlLogo,
  lidlLogo: LidlLogo,
  lidl: LidlLogo,
  Lidl: LidlLogo,
  SiLidl: LidlLogo,

  // ALDI
  AldiLogo,
  aldiLogo: AldiLogo,
  ALDI: AldiLogo,
  aldi: AldiLogo,
  AldiSudLogo,
  aldiSudLogo: AldiSudLogo,
  'aldi-sued': AldiSudLogo,
  'aldi-süd': AldiSudLogo,
  AldiNordLogo,
  aldiNordLogo: AldiNordLogo,
  'aldi-nord': AldiNordLogo,
  SiAldisud: AldiSudLogo,
  SiAldinord: AldiNordLogo,

  // EDEKA
  EdekaLogo,
  edekaLogo: EdekaLogo,
  EDEKA: EdekaLogo,
  edeka: EdekaLogo,
  SiEdeka: EdekaLogo,

  // Kaufland
  KauflandLogo,
  kauflandLogo: KauflandLogo,
  kaufland: KauflandLogo,
  Kaufland: KauflandLogo,
  SiKaufland: KauflandLogo,

  // Penny
  PennyLogo,
  pennyLogo: PennyLogo,
  penny: PennyLogo,
  Penny: PennyLogo,
  SiPenny: PennyLogo,

  // Netto
  NettoLogo,
  nettoLogo: NettoLogo,
  netto: NettoLogo,
  Netto: NettoLogo,
  SiNetto: NettoLogo,

  // SPAR
  SparLogo,
  sparLogo: SparLogo,
  SPARLogo: SparLogo,
  spar: SparLogo,
  SPAR: SparLogo,
  'spar-portugal': SparLogo,

  // GLOBUS / Globus Markthalle
  GlobusLogo,
  globusLogo: GlobusLogo,
  globus: GlobusLogo,
  GLOBUS: GlobusLogo,
  'globus-markthalle': GlobusLogo,
  'globus markthalle': GlobusLogo,
  'globus-handelshof': GlobusLogo,
  'globus-holding': GlobusLogo,

  // BILLA
  BillaLogo,
  billaLogo: BillaLogo,
  billa: BillaLogo,
  BILLA: BillaLogo,

  // BILLA PLUS
  BillaPlusLogo,
  billaPlusLogo: BillaPlusLogo,
  'billa-plus': BillaPlusLogo,
  'billa plus': BillaPlusLogo,

  // Biedronka
  BiedronkaLogo,
  biedronkaLogo: BiedronkaLogo,
  biedronka: BiedronkaLogo,
  Biedronka: BiedronkaLogo,

  // Żabka
  ZabkaLogo,
  zabkaLogo: ZabkaLogo,
  zabka: ZabkaLogo,
  'żabka': ZabkaLogo,
  SiZabka: ZabkaLogo,

  // Carrefour
  CarrefourLogo,
  carrefourLogo: CarrefourLogo,
  carrefour: CarrefourLogo,
  SiCarrefour: CarrefourLogo,

  // Auchan
  AuchanLogo,
  auchanLogo: AuchanLogo,
  auchan: AuchanLogo,
  SiAuchan: AuchanLogo,

  // Coop
  CoopLogo,
  coopLogo: CoopLogo,
  coop: CoopLogo,
  SiCoop: CoopLogo,

  // Tesco
  TescoLogo,
  tescoLogo: TescoLogo,
  tesco: TescoLogo,
  SiTesco: TescoLogo,

  // ASDA
  AsdaLogo,
  asdaLogo: AsdaLogo,
  asda: AsdaLogo,
  SiAsda: AsdaLogo,

  // Morrisons
  MorrisonsLogo,
  morrisonsLogo: MorrisonsLogo,
  morrisons: MorrisonsLogo,
  SiMorrisons: MorrisonsLogo,

  // HelloFresh
  HellofreshLogo,
  hellofreshLogo: HellofreshLogo,
  hellofresh: HellofreshLogo,
  SiHellofresh: HellofreshLogo,

  // Dino
  DinoLogo,
  dinoLogo: DinoLogo,
  dino: DinoLogo,

  // Bingo
  BingoLogo,
  bingoLogo: BingoLogo,
  bingo: BingoLogo,

  // Konzum
  KonzumLogo,
  konzumLogo: KonzumLogo,
  konzum: KonzumLogo,

  // Anadolu Supermarkt
  AnadoluSupermarktLogo,
  anadoluSupermarktLogo: AnadoluSupermarktLogo,
  anadolu: AnadoluSupermarktLogo,
  'anadolu-supermarkt': AnadoluSupermarktLogo,

  // Transgourmet
  TransgourmetLogo,
  transgourmetLogo: TransgourmetLogo,
  transgourmet: TransgourmetLogo,

  // Früchte und Feinkost
  FruechteFeinkostLogo,
  fruechteFeinkostLogo: FruechteFeinkostLogo,
  'fruechte-und-feinkost': FruechteFeinkostLogo,
}
