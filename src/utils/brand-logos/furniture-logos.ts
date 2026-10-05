import { createImageLogo, createWordmarkLogo } from './logo-factory'
import type { IconComponent } from './types'

// XXXLutz group (POCO, XXXLutz, mömax)

/** POCO Einrichtungsmärkte — discount furniture stores of the XXXLutz group. */
export const PocoLogo = createImageLogo({
  src: '/brands/poco.png',
  label: 'POCO Einrichtungsmärkte',
  displayName: 'PocoLogo',
})

export const XxxlutzLogo = createImageLogo({
  src: '/brands/xxxlutz.png',
  label: 'XXXLutz',
  displayName: 'XxxlutzLogo',
})

export const MoemaxLogo = createImageLogo({
  src: '/brands/moemax.png',
  label: 'mömax',
  displayName: 'MoemaxLogo',
})

// Other German furniture retailers

/** Möbel Höffner and its discount sibling Sconto (Krieger group). */
export const HoeffnerLogo = createImageLogo({
  src: '/brands/hoeffner.png',
  label: 'Höffner',
  displayName: 'HoeffnerLogo',
})

export const ScontoLogo = createImageLogo({
  src: '/brands/sconto.png',
  label: 'Sconto',
  displayName: 'ScontoLogo',
})

export const SegmuellerLogo = createImageLogo({
  src: '/brands/segmueller.png',
  label: 'Segmüller',
  displayName: 'SegmuellerLogo',
})

export const PortaLogo = createImageLogo({
  src: '/brands/porta.png',
  label: 'porta Möbel',
  displayName: 'PortaLogo',
})

/** JYSK (formerly Dänisches Bettenlager). */
export const JyskLogo = createImageLogo({
  src: '/brands/jysk.png',
  label: 'JYSK',
  displayName: 'JyskLogo',
})

/** ROLLER Möbel — no freely licensed vector logo available, so rendered as a wordmark tile. */
export const RollerLogo = createWordmarkLogo({
  label: 'ROLLER',
  text: 'ROLLER',
  background: '#E30613',
  textColor: '#FFFFFF',
  accentColor: '#FFED00',
  fontSize: 10,
  displayName: 'RollerLogo',
})

export const FURNITURE_LOGOS: Record<string, IconComponent> = {
  PocoLogo,
  XxxlutzLogo,
  XXXLutzLogo: XxxlutzLogo,
  MoemaxLogo,
  MomaxLogo: MoemaxLogo,
  HoeffnerLogo,
  ScontoLogo,
  SegmuellerLogo,
  PortaLogo,
  JyskLogo,
  DaenischesBettenlagerLogo: JyskLogo,
  RollerLogo,
}
