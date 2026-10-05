import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** KMK Immobilienverwaltung GmbH — condominium and property management (WEG-Verwaltung). */
export const KmkImmobilienLogo = createImageLogo({
  src: '/brands/kmk-immobilien.png',
  label: 'KMK Immobilienverwaltung',
  displayName: 'KmkImmobilienLogo',
})

export const PROPERTY_LOGOS: Record<string, IconComponent> = {
  KmkImmobilienLogo,
  kmkImmobilienLogo: KmkImmobilienLogo,
  'kmk-immobilien': KmkImmobilienLogo,
  'kmk-immobilienverwaltung': KmkImmobilienLogo,
  'weg-landwehrweg': KmkImmobilienLogo,
}
