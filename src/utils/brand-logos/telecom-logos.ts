import { createImageLogo } from './logo-factory'
import type { IconComponent } from './types'

/** GVG Glasfaser GmbH — German fiber-to-the-home (FTTH) telecommunications provider. */
export const GvgGlasfaserLogo = createImageLogo({
  src: '/brands/gvg-glasfaser.png',
  label: 'GVG Glasfaser',
  displayName: 'GvgGlasfaserLogo',
})

/** teranet — high-speed fiber broadband brand by GVG Glasfaser. */
export const TeranetLogo = createImageLogo({
  src: '/brands/teranet.png',
  label: 'teranet',
  displayName: 'TeranetLogo',
})

export const TELECOM_LOGOS: Record<string, IconComponent> = {
  GvgGlasfaserLogo,
  gvgGlasfaserLogo: GvgGlasfaserLogo,
  GVGGlasfaserLogo: GvgGlasfaserLogo,
  TeranetLogo,
  teranetLogo: TeranetLogo,
}
