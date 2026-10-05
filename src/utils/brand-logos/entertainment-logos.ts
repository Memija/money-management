import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** Disney+ — global subscription video-on-demand streaming service by The Walt Disney Company. */
export const DisneyPlusLogo = createImageLogo({
  src: '/brands/disneyplus.png',
  label: 'Disney+',
  displayName: 'DisneyPlusLogo',
})

export const ENTERTAINMENT_LOGOS: Record<string, IconComponent> = {
  DisneyPlusLogo,
  disneyPlusLogo: DisneyPlusLogo,
  DisneyLogo: DisneyPlusLogo,
  DisneyStreamingLogo: DisneyPlusLogo,
}
