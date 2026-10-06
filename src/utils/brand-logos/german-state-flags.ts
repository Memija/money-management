import React from 'react'

import type { IconComponent } from './types'

export type GermanStateCode =
  | 'bw'
  | 'by'
  | 'be'
  | 'bb'
  | 'hb'
  | 'hh'
  | 'he'
  | 'mv'
  | 'ni'
  | 'nw'
  | 'rp'
  | 'sl'
  | 'sn'
  | 'st'
  | 'sh'
  | 'th'

export interface GermanStateMetadata {
  code: GermanStateCode
  name: string
  nameDe: string
  flagSvg: string
  flagPng: string
}

export const GERMAN_STATES: Record<GermanStateCode, GermanStateMetadata> = {
  bw: {
    code: 'bw',
    name: 'Baden-Württemberg',
    nameDe: 'Baden-Württemberg',
    flagSvg: '/flags/de/de-bw.svg',
    flagPng: '/flags/de/de-bw.png',
  },
  by: {
    code: 'by',
    name: 'Bavaria',
    nameDe: 'Bayern',
    flagSvg: '/flags/de/de-by.svg',
    flagPng: '/flags/de/de-by.png',
  },
  be: {
    code: 'be',
    name: 'Berlin',
    nameDe: 'Berlin',
    flagSvg: '/flags/de/de-be.svg',
    flagPng: '/flags/de/de-be.png',
  },
  bb: {
    code: 'bb',
    name: 'Brandenburg',
    nameDe: 'Brandenburg',
    flagSvg: '/flags/de/de-bb.svg',
    flagPng: '/flags/de/de-bb.png',
  },
  hb: {
    code: 'hb',
    name: 'Bremen',
    nameDe: 'Freie Hansestadt Bremen',
    flagSvg: '/flags/de/de-hb.svg',
    flagPng: '/flags/de/de-hb.png',
  },
  hh: {
    code: 'hh',
    name: 'Hamburg',
    nameDe: 'Freie und Hansestadt Hamburg',
    flagSvg: '/flags/de/de-hh.svg',
    flagPng: '/flags/de/de-hh.png',
  },
  he: {
    code: 'he',
    name: 'Hesse',
    nameDe: 'Hessen',
    flagSvg: '/flags/de/de-he.svg',
    flagPng: '/flags/de/de-he.png',
  },
  mv: {
    code: 'mv',
    name: 'Mecklenburg-Western Pomerania',
    nameDe: 'Mecklenburg-Vorpommern',
    flagSvg: '/flags/de/de-mv.svg',
    flagPng: '/flags/de/de-mv.png',
  },
  ni: {
    code: 'ni',
    name: 'Lower Saxony',
    nameDe: 'Niedersachsen',
    flagSvg: '/flags/de/de-ni.svg',
    flagPng: '/flags/de/de-ni.png',
  },
  nw: {
    code: 'nw',
    name: 'North Rhine-Westphalia',
    nameDe: 'Nordrhein-Westfalen',
    flagSvg: '/flags/de/de-nw.svg',
    flagPng: '/flags/de/de-nw.png',
  },
  rp: {
    code: 'rp',
    name: 'Rhineland-Palatinate',
    nameDe: 'Rheinland-Pfalz',
    flagSvg: '/flags/de/de-rp.svg',
    flagPng: '/flags/de/de-rp.png',
  },
  sl: {
    code: 'sl',
    name: 'Saarland',
    nameDe: 'Saarland',
    flagSvg: '/flags/de/de-sl.svg',
    flagPng: '/flags/de/de-sl.png',
  },
  sn: {
    code: 'sn',
    name: 'Saxony',
    nameDe: 'Freistaat Sachsen',
    flagSvg: '/flags/de/de-sn.svg',
    flagPng: '/flags/de/de-sn.png',
  },
  st: {
    code: 'st',
    name: 'Saxony-Anhalt',
    nameDe: 'Sachsen-Anhalt',
    flagSvg: '/flags/de/de-st.svg',
    flagPng: '/flags/de/de-st.png',
  },
  sh: {
    code: 'sh',
    name: 'Schleswig-Holstein',
    nameDe: 'Schleswig-Holstein',
    flagSvg: '/flags/de/de-sh.svg',
    flagPng: '/flags/de/de-sh.png',
  },
  th: {
    code: 'th',
    name: 'Thuringia',
    nameDe: 'Freistaat Thüringen',
    flagSvg: '/flags/de/de-th.svg',
    flagPng: '/flags/de/de-th.png',
  },
}

/**
 * Normalizes an arbitrary state name or code to a 2-letter German state code.
 */
export function normalizeGermanStateCode(input: string): GermanStateCode | undefined {
  if (!input || typeof input !== 'string') return undefined
  const cleaned = input.toLowerCase().trim().replace(/^de-?/, '')
  if (cleaned in GERMAN_STATES) {
    return cleaned as GermanStateCode
  }

  for (const [code, meta] of Object.entries(GERMAN_STATES)) {
    if (
      cleaned === meta.name.toLowerCase() ||
      cleaned === meta.nameDe.toLowerCase()
    ) {
      return code as GermanStateCode
    }
  }
  return undefined
}

/**
 * Creates a standard IconComponent for a German federal state flag.
 */
export function createGermanStateFlag(
  code: GermanStateCode,
  displayName: string,
): IconComponent {
  const FlagIcon: IconComponent = ({ size = 16, className }) => {
    const stateMeta = GERMAN_STATES[code]
    return React.createElement('img', {
      src: stateMeta.flagSvg,
      alt: stateMeta.nameDe,
      width: typeof size === 'number' ? size : undefined,
      height: typeof size === 'number' ? size : undefined,
      style: {
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        display: 'inline-block',
        verticalAlign: 'middle',
        borderRadius: 'inherit',
        objectFit: 'cover',
        flexShrink: 0,
      },
      className: ['brand-logo-full', className].filter(Boolean).join(' '),
      'data-brand-logo': 'true',
      role: 'img',
      'aria-label': stateMeta.nameDe,
    })
  }
  FlagIcon.displayName = displayName
  return FlagIcon
}

// 16 German federal states individual icon components
export const BadenWuerttembergFlagLogo = createGermanStateFlag('bw', 'BadenWuerttembergFlagLogo')
export const BayernFlagLogo = createGermanStateFlag('by', 'BayernFlagLogo')
export const BerlinFlagLogo = createGermanStateFlag('be', 'BerlinFlagLogo')
export const BrandenburgFlagLogo = createGermanStateFlag('bb', 'BrandenburgFlagLogo')
export const BremenFlagLogo = createGermanStateFlag('hb', 'BremenFlagLogo')
export const HamburgFlagLogo = createGermanStateFlag('hh', 'HamburgFlagLogo')
export const HessenStateFlagLogo = createGermanStateFlag('he', 'HessenStateFlagLogo')
export const MecklenburgVorpommernFlagLogo = createGermanStateFlag('mv', 'MecklenburgVorpommernFlagLogo')
export const NiedersachsenFlagLogo = createGermanStateFlag('ni', 'NiedersachsenFlagLogo')
export const NordrheinWestfalenFlagLogo = createGermanStateFlag('nw', 'NordrheinWestfalenFlagLogo')
export const RheinlandPfalzFlagLogo = createGermanStateFlag('rp', 'RheinlandPfalzFlagLogo')
export const SaarlandFlagLogo = createGermanStateFlag('sl', 'SaarlandFlagLogo')
export const SachsenFlagLogo = createGermanStateFlag('sn', 'SachsenFlagLogo')
export const SachsenAnhaltFlagLogo = createGermanStateFlag('st', 'SachsenAnhaltFlagLogo')
export const SchleswigHolsteinFlagLogo = createGermanStateFlag('sh', 'SchleswigHolsteinFlagLogo')
export const ThueringenFlagLogo = createGermanStateFlag('th', 'ThueringenFlagLogo')

/**
 * Generic German state flag component accepting any state code or name.
 */
export const GermanStateFlag: React.FC<{
  state: GermanStateCode | string
  size?: number | string
  className?: string
}> = ({ state, size = 16, className }) => {
  const code = normalizeGermanStateCode(state) || 'he'
  const FlagComp = GERMAN_STATE_LOGOS[code] || HessenStateFlagLogo
  return React.createElement(FlagComp, { size, className })
}

export const GERMAN_STATE_LOGOS: Record<GermanStateCode, IconComponent> = {
  bw: BadenWuerttembergFlagLogo,
  by: BayernFlagLogo,
  be: BerlinFlagLogo,
  bb: BrandenburgFlagLogo,
  hb: BremenFlagLogo,
  hh: HamburgFlagLogo,
  he: HessenStateFlagLogo,
  mv: MecklenburgVorpommernFlagLogo,
  ni: NiedersachsenFlagLogo,
  nw: NordrheinWestfalenFlagLogo,
  rp: RheinlandPfalzFlagLogo,
  sl: SaarlandFlagLogo,
  sn: SachsenFlagLogo,
  st: SachsenAnhaltFlagLogo,
  sh: SchleswigHolsteinFlagLogo,
  th: ThueringenFlagLogo,
}
