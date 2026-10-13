import React, { useMemo } from 'react'

import type { CustomCategory } from '../../../types'
import { getCategoryIcon } from '../../../utils/category-icons'

interface CategoryIconProps {
  /** Category key (canonical, localized or custom `custom_*` id) */
  category: string
  /** Icon size in pixels */
  size?: number
  /** Custom categories used to resolve custom icons and colours */
  customCategories?: CustomCategory[]
  /** Transaction description / merchant name used for brand-logo matching */
  description?: string
  /** Counterparty IBAN used as a fallback for brand-logo matching */
  counterpartyIban?: string
}

/** Default icon size, matching `getCategoryIcon`. */
const DEFAULT_ICON_SIZE = 16

/**
 * Memoized category / merchant icon.
 *
 * Wraps `getCategoryIcon` so that brand logos and icons only re-render when their own
 * inputs change. Parents that re-render for unrelated reasons (language switch, hover,
 * dropdown state) no longer re-render every SVG in their lists.
 */
export const CategoryIcon: React.FC<CategoryIconProps> = React.memo(
  ({ category, size = DEFAULT_ICON_SIZE, customCategories, description, counterpartyIban }) => {
    const icon = useMemo(
      () => getCategoryIcon(category, size, customCategories, description, counterpartyIban),
      [category, size, customCategories, description, counterpartyIban],
    )
    return <>{icon}</>
  },
)

CategoryIcon.displayName = 'CategoryIcon'
