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
}
