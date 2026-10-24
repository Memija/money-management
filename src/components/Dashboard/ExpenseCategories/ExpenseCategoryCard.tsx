import React from 'react'

import type { CategoryEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { CustomCategory } from '../../../types'
import { getCategoryLabel } from '../../../utils/category-utils'
import { CategoryIcon } from '../../shared/CategoryIcon'

import styles from './ExpenseCategoryCard.module.css'

const CATEGORY_ICON_SIZE = 16

const getRankBadgeClass = (index: number): string => {
  if (index === 0) {
    return styles.rankGold
  }
  if (index === 1) {
    return styles.rankSilver
  }
  if (index === 2) {
    return styles.rankBronze
  }
  return styles.rankDefault
}

interface ExpenseCategoryCardProps {
  category: CategoryEntry
  index: number
  totalExpenses: number
  isHovered: boolean
  customCategories: CustomCategory[]
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}

export const ExpenseCategoryCard: React.FC<ExpenseCategoryCardProps> = React.memo(
  ({
    category: cat,
    index,
    totalExpenses,
    isHovered,
    customCategories,
    onMouseEnter,
    onMouseLeave,
    onClick,
  }) => {
    const t = useLanguageStore((s) => s.t)
    const locale = useLanguageStore((s) => s.locale)
    const { formatCurrency } = useFormatters()

    const percentage = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0
    const label = getCategoryLabel(cat.name, t, locale, customCategories)

    return (
      <button
        type="button"
        className={`${styles.categoryCard} ${isHovered ? styles.activeCard : ''}`}
        style={
          {
            '--active-card-color': cat.color,
            '--active-card-glow': `${cat.color}35`,
          } as React.CSSProperties
        }
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        aria-label={`${label}: ${formatCurrency(cat.value)}`}
      >
        <div className={styles.cardTop}>
          <div className={styles.cardCategoryInfo}>
            <span className={`${styles.rankPill} ${getRankBadgeClass(index)}`}>#{index + 1}</span>
            <div className={styles.iconBox}>
              <CategoryIcon
                category={cat.name}
                size={CATEGORY_ICON_SIZE}
                customCategories={customCategories}
              />
            </div>
            <span className={styles.categoryName} title={label}>
              {label}
            </span>
          </div>
          <span className={`${styles.cardValue} privacy-blur`}>{formatCurrency(cat.value)}</span>
        </div>

        <div className={styles.cardBottom}>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{
                width: `${Math.min(100, Math.max(2, percentage))}%`,
              }}
            />
          </div>
          <span className={styles.percentText}>
            {percentage > 0 && percentage < 0.1 ? '<0.1%' : `${percentage.toFixed(1)}%`}
          </span>
        </div>
      </button>
    )
  },
)

ExpenseCategoryCard.displayName = 'ExpenseCategoryCard'
