import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** AurumTours GmbH — German dynamic tour operator (Leipzig). */
export const AurumToursLogo = createImageLogo({
  src: '/brands/aurumtours.png',
  label: 'AurumTours',
  displayName: 'AurumToursLogo',
})

/** Last Minute Express (Lastminute.com Group) — European package and flight booking specialist. */
export const LastMinuteExpressLogo = createImageLogo({
  src: '/brands/lastminute.png',
  label: 'Last Minute Express',
  displayName: 'LastMinuteExpressLogo',
})

/** l'tur (TUI Group) — Europe's leading last minute tour operator. */
export const LturLogo = createImageLogo({
  src: '/brands/ltur.png',
  label: "l'tur",
  displayName: 'LturLogo',
})

/** FTI Touristik — major German travel and tour operator group. */
export const FtiLogo = createImageLogo({
  src: '/brands/fti.png',
  label: 'FTI Touristik',
  displayName: 'FtiLogo',
})

export const TOUR_OPERATOR_LOGOS: Record<string, IconComponent> = {
  AurumToursLogo,
  'aurumtours': AurumToursLogo,
  LastMinuteExpressLogo,
  'last-minute-express': LastMinuteExpressLogo,
  'lastminute': LastMinuteExpressLogo,
  LastminuteLogo: LastMinuteExpressLogo,
  LturLogo,
  'ltur': LturLogo,
  FtiLogo,
  'fti': FtiLogo,
}
