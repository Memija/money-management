import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** SPAR — multinational supermarket, hypermarket, and retail grocery franchise. */
export const SparLogo = createImageLogo({
  src: '/brands/spar.png',
  label: 'SPAR',
  displayName: 'SparLogo',
})

/** Anadolu Supermarkt — Turkish grocery supermarket and fresh market specialist. */
export const AnadoluSupermarktLogo = createImageLogo({
  src: '/brands/anadolu.png',
  label: 'Anadolu Supermarkt',
  displayName: 'AnadoluSupermarktLogo',
})

export const GROCERY_LOGOS: Record<string, IconComponent> = {
  SparLogo,
  sparLogo: SparLogo,
  SPARLogo: SparLogo,
  'spar': SparLogo,
  'spar-portugal': SparLogo,
  AnadoluSupermarktLogo,
  anadoluSupermarktLogo: AnadoluSupermarktLogo,
  'anadolu': AnadoluSupermarktLogo,
  'anadolu-supermarkt': AnadoluSupermarktLogo,
}
