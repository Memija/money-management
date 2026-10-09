import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** HAC (Hrvatske autoceste d.o.o.) — Croatian national motorway and toll authority. */
export const HacAutocesteLogo = createImageLogo({
  src: '/brands/hac-autoceste.png',
  label: 'Hrvatske autoceste (HAC)',
  displayName: 'HacAutocesteLogo',
})

/** Reifen-Diehl — tire, wheel, and automotive repair service center in Eschborn. */
export const ReifenDiehlLogo = createImageLogo({
  src: '/brands/reifen-diehl.png',
  label: 'Reifen-Diehl Eschborn',
  displayName: 'ReifenDiehlLogo',
})

/** CPC Parkhaus / Contipark — parking garages and mobility hubs across Germany (including Nürnberg). */
export const CpcParkhausLogo = createImageLogo({
  src: '/brands/cpc-parkhaus.png',
  label: 'CPC Parkhaus',
  displayName: 'CpcParkhausLogo',
})

/** AZM (Autocesta Zagreb-Macelj) — Croatian motorway and toll concessionaire. */
export const AzmLogo = createImageLogo({
  src: '/brands/azm.png',
  label: 'AZM Zaprešić',
  displayName: 'AzmLogo',
})

/** ZET (Zagrebački električni tramvaj) — Zagreb public transit operator (trams, buses, ticketing). */
export const ZetLogo = createImageLogo({
  src: '/brands/zet.png',
  label: 'ZET Zagreb',
  displayName: 'ZetLogo',
})

/** DARS (Družba za avtoceste v Republiki Sloveniji d.d.) — Slovenian motorway operator and vignette toll authority. */
export const DarsLogo = createImageLogo({
  src: '/brands/dars.png',
  label: 'DARS d.d.',
  displayName: 'DarsLogo',
})

/** VSPO (Via Strassenabgaben Portal Online / Via Portal - E-Vignette Schweiz) — Swiss federal electronic motorway vignette & road user charge portal (via.admin.ch / BAZG). */
export const VspoLogo = createImageLogo({
  src: '/brands/vspo.svg',
  label: 'VSPO',
  displayName: 'VspoLogo',
})
export { VspoLogo as ViaPortalLogo }

export const MOTORWAY_LOGOS: Record<string, IconComponent> = {
  HacAutocesteLogo,
  hacAutocesteLogo: HacAutocesteLogo,
  'hac-autoceste': HacAutocesteLogo,
  'hac': HacAutocesteLogo,
  'autocesta': HacAutocesteLogo,
  ReifenDiehlLogo,
  reifenDiehlLogo: ReifenDiehlLogo,
  'reifen-diehl': ReifenDiehlLogo,
  'reifen-diehl-eschborn': ReifenDiehlLogo,
  CpcParkhausLogo,
  cpcParkhausLogo: CpcParkhausLogo,
  'cpc-parkhaus': CpcParkhausLogo,
  'cpc-parkhaus-nuernberg': CpcParkhausLogo,
  AzmLogo,
  azmLogo: AzmLogo,
  'azm': AzmLogo,
  'azm-zapresic': AzmLogo,
  'autocesta-zagreb-macelj': AzmLogo,
  ZetLogo,
  zetLogo: ZetLogo,
  'zet': ZetLogo,
  'zet-zagreb': ZetLogo,
  'moj-zet': ZetLogo,
  'moj.zet.hr': ZetLogo,
  DarsLogo,
  darsLogo: DarsLogo,
  'dars': DarsLogo,
  'dars-dd': DarsLogo,
  'dars-d-d': DarsLogo,
  'dars-e-vinjeta': DarsLogo,
  VspoLogo,
  vspoLogo: VspoLogo,
  'vspo': VspoLogo,
  'vspo-bern': VspoLogo,
  'via-portal': VspoLogo,
  'via-portal-e-vignette': VspoLogo,
  ViaPortalLogo: VspoLogo,
}

