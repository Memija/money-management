import { createImageLogo, createWordmarkLogo } from './logo-factory'
import type { IconComponent } from './types'

/** ADAC — Allgemeiner Deutscher Automobil-Club e.V. (membership, roadside assistance). */
export const AdacLogo = createImageLogo({
  src: '/brands/adac.png',
  label: 'ADAC',
  displayName: 'AdacLogo',
})

/** ACE Auto Club Europa e.V. */
export const AceLogo = createImageLogo({
  src: '/brands/ace.png',
  label: 'ACE Auto Club Europa',
  displayName: 'AceLogo',
})

/** AvD — Automobilclub von Deutschland e.V. */
export const AvdLogo = createWordmarkLogo({
  label: 'AvD Automobilclub von Deutschland',
  text: 'AvD',
  background: '#003C7E',
  textColor: '#FFFFFF',
  accentColor: '#E30613',
  fontSize: 15,
  displayName: 'AvdLogo',
})

export const AUTO_CLUB_LOGOS: Record<string, IconComponent> = {
  AdacLogo,
  AdacEvLogo: AdacLogo,
  AceLogo,
  AutoClubEuropaLogo: AceLogo,
  AvdLogo,
}
