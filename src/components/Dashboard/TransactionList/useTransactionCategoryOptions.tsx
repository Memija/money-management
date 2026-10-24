import { useMemo } from 'react'
import { ImageOff, Tag } from 'lucide-react'

import type { TranslationStrings } from '../../../i18n/types'
import type { CustomCategory, Transaction } from '../../../types'
import { getCategoryIcon } from '../../../utils/category-icons'
import { getCategoryLabel } from '../../../utils/category-utils'

interface UseTransactionCategoryOptionsProps {
  filteredTx: Transaction[]
  categoryFilter: string
  filterTransactionsWithoutLogos: boolean
  t: TranslationStrings
  locale: string
  customCategories: CustomCategory[]
}

export function useTransactionCategoryOptions({
  filteredTx,
  categoryFilter,
  filterTransactionsWithoutLogos,
  t,
  locale,
  customCategories,
}: UseTransactionCategoryOptionsProps) {
  // Collect available unique categories from unfiltered transactions in current scope (decoupled from categoryFilter)
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    for (let i = 0; i < filteredTx.length; i++) {
      if (filteredTx[i].isGhost) {
        continue
      }
      const cat = filteredTx[i].category
      if (cat) {
        set.add(cat)
      }
    }
    return Array.from(set).sort((a, b) => {
      const labelA = getCategoryLabel(a, t, locale, customCategories)
      const labelB = getCategoryLabel(b, t, locale, customCategories)
      return labelA.localeCompare(labelB)
    })
  }, [filteredTx, t, locale, customCategories])

  const categoryOptions = useMemo(() => {
    const options = [
      {
        value: 'all',
        label: t.allCategories || 'All Categories',
        icon: <Tag size={14} />,
      },
      ...(filterTransactionsWithoutLogos
        ? [
            {
              value: 'without-logos',
              label: t.filterWithoutLogosBadge || 'Without logos',
              icon: <ImageOff size={14} />,
            },
          ]
        : []),
      ...availableCategories.map((cat) => ({
        value: cat,
        label: getCategoryLabel(cat, t, locale, customCategories),
        icon: getCategoryIcon(cat, 14, customCategories),
      })),
    ]
    if (
      categoryFilter !== 'all' &&
      categoryFilter !== 'without-logos' &&
      !availableCategories.includes(categoryFilter)
    ) {
      options.push({
        value: categoryFilter,
        label: getCategoryLabel(categoryFilter, t, locale, customCategories),
        icon: getCategoryIcon(categoryFilter, 14, customCategories),
      })
    }
    return options
  }, [
    availableCategories,
    categoryFilter,
    filterTransactionsWithoutLogos,
    t,
    locale,
    customCategories,
  ])

  return {
    availableCategories,
    categoryOptions,
  }
}
