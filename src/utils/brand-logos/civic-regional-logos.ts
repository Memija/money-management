import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** Stadt Bad Nauheim / Stadtkasse Bad Nauheim — official coat of arms & municipal administration of the Hessian spa town. */
export const BadNauheimLogo = createImageLogo({
  src: '/brands/bad-nauheim.png',
  label: 'Stadt Bad Nauheim',
  displayName: 'BadNauheimLogo',
})

/** Volkshochschule Bad Homburg — municipal community adult education center in Bad Homburg vor der Höhe. */
export const VhsBadHomburgLogo = createImageLogo({
  src: '/brands/vhs-bad-homburg.png',
  label: 'vhs Bad Homburg',
  displayName: 'VhsBadHomburgLogo',
})

export const CIVIC_REGIONAL_LOGOS: Record<string, IconComponent> = {
  BadNauheimLogo,
  badNauheimLogo: BadNauheimLogo,
  'bad-nauheim': BadNauheimLogo,
  'stadtkasse-bad-nauheim': BadNauheimLogo,
  'stadt-bad-nauheim': BadNauheimLogo,
  VhsBadHomburgLogo,
  vhsBadHomburgLogo: VhsBadHomburgLogo,
  'vhs-bad-homburg': VhsBadHomburgLogo,
  'volkshochschule-bad-homburg': VhsBadHomburgLogo,
  'volkshochschule': VhsBadHomburgLogo,
}
