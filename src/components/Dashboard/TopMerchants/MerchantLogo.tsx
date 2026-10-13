import React from 'react'

import type { MerchantBrandInfo } from '../../../utils/category-icons'

interface MerchantLogoProps {
  /** Brand info from `getMerchantBrandInfo` (keep the reference stable for memoization) */
  brand: MerchantBrandInfo
  /** Logo size in pixels */
  size: number
  /** Class applied to the initials fallback avatar */
  initialsClassName: string
}

/**
 * Memoized merchant brand logo with an initials fallback. Skips re-rendering the logo SVG
 * when its parent re-renders for unrelated reasons (e.g. a language switch).
 */
export const MerchantLogo: React.FC<MerchantLogoProps> = React.memo(({ brand, size, initialsClassName }) => {
  const LogoComp = brand.logoComponent
  if (LogoComp) {
    return <LogoComp size={size} color={brand.brandColor} />
  }
  return <span className={initialsClassName}>{brand.initials}</span>
})

MerchantLogo.displayName = 'MerchantLogo'
