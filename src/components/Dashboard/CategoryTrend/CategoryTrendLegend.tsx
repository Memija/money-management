import React from 'react'
import { RotateCcw } from 'lucide-react'

import { useLanguageStore } from '../../../store/useLanguageStore'
import type { CustomCategory } from '../../../types'
import { getCategoryColor } from '../../../utils/category-colors'
import { getCategoryLabel } from '../../../utils/category-utils'
import { CategoryIcon } from '../../shared/CategoryIcon'

import styles from './CategoryTrendLegend.module.css'

export interface CategoryTrendLegendProps {
  categories: string[]
  customCategories: CustomCategory[]
  selectedCategory: string | null
  hoveredCategory: string | null
  activeCategory: string | null
  onCategoryHover: (catKey: string | null) => void
  onCategorySelect: (catKey: string) => void
  onClearCategorySelect: () => void
}

export const CategoryTrendLegend: React.FC<CategoryTrendLegendProps> = React.memo(
  ({
    categories,
    customCategories,
    selectedCategory,
    hoveredCategory,
    activeCategory,
    onCategoryHover,
    onCategorySelect,
    onClearCategorySelect,
  }) => {
    const t = useLanguageStore((s) => s.t)

    return (
      <div className={styles.legendContainer}>
        {selectedCategory && (
          <button
            type="button"
            className={`${styles.legendPill} ${styles.resetPill}`}
            onClick={onClearCategorySelect}
            title={t.allCategories || 'All Categories'}
            aria-label={t.allCategories || 'All Categories'}
          >
            <RotateCcw size={11} />
            <span>{t.allCategories || 'All Categories'}</span>
          </button>
        )}

        {categories.map((cat) => {
          const color = getCategoryColor(cat, customCategories)
          const isSelected = selectedCategory === cat
          const isHovered = hoveredCategory === cat
          const isCatActive = isSelected || isHovered
          const isCatDimmed = activeCategory !== null && !isCatActive

          return (
            <button
              key={cat}
              type="button"
              className={`${styles.legendPill} ${isCatActive ? styles.legendPillActive : ''} ${isCatDimmed ? styles.legendPillDimmed : ''}`}
              style={{ '--pill-color': color } as React.CSSProperties}
              onMouseEnter={() => onCategoryHover(cat)}
              onMouseLeave={() => onCategoryHover(null)}
              onClick={() => onCategorySelect(cat)}
              title={getCategoryLabel(cat, t)}
              aria-label={getCategoryLabel(cat, t)}
            >
              <span className={styles.legendIconWrapper}>
                <CategoryIcon category={cat} size={12} customCategories={customCategories} />
              </span>
              <span>{getCategoryLabel(cat, t)}</span>
            </button>
          )
        })}
      </div>
    )
  },
)

CategoryTrendLegend.displayName = 'CategoryTrendLegend'
