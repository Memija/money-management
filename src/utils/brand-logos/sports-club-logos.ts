import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** Turnverein Dornholzhausen/Ts. 1918 e.V. (Bad Homburg) — official club crest. */
export const TvDornholzhausenLogo = createImageLogo({
  src: '/brands/tv-dornholzhausen.png',
  label: 'Turnverein Dornholzhausen/Ts. 1918 e.V.',
  displayName: 'TvDornholzhausenLogo',
})

export const SPORTS_CLUB_LOGOS: Record<string, IconComponent> = {
  TvDornholzhausenLogo,
  TurnvereinDornholzhausenLogo: TvDornholzhausenLogo,
}
