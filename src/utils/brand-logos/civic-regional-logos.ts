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

/** Udemy — leading global open online learning and skills platform. */
export const UdemyLogo = createImageLogo({
  src: '/brands/udemy.png',
  label: 'Udemy',
  displayName: 'UdemyLogo',
})

/** Škola Studium — specialized educational, tutoring, and course instruction provider. */
export const SkolaStudiumLogo = createImageLogo({
  src: '/brands/skola-studium.png',
  label: 'Škola Studium',
  displayName: 'SkolaStudiumLogo',
})

/** Cerebrum IQ — online cognitive assessment and brain training platform. */
export const CerebrumIqLogo = createImageLogo({
  src: '/brands/cerebrum-iq.png',
  label: 'Cerebrum IQ',
  displayName: 'CerebrumIqLogo',
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
  UdemyLogo,
  udemyLogo: UdemyLogo,
  'udemy': UdemyLogo,
  'udemy-courses': UdemyLogo,
  SkolaStudiumLogo,
  skolaStudiumLogo: SkolaStudiumLogo,
  'skola-studium': SkolaStudiumLogo,
  'skola': SkolaStudiumLogo,
  CerebrumIqLogo,
  cerebrumIqLogo: CerebrumIqLogo,
  'cerebrum-iq': CerebrumIqLogo,
  'cerebrum': CerebrumIqLogo,
  'cerebrumiq': CerebrumIqLogo,
}
