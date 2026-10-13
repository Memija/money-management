import React from 'react'

import { useFormatters } from '../../../hooks/useFormatters'
import type { TranslationStrings } from '../../../i18n/translations'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { CustomCategory } from '../../../types'
import { getCategoryColor } from '../../../utils/category-colors'
import { formatCategoryPercent, getCategoryLabel } from '../../../utils/category-utils'

import styles from './CategoryTrend.module.css'

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
  dataKey: string
}

interface TrendTooltipInteractionProps {
  /** Injected by Recharts */
  active?: boolean
  /** Injected by Recharts */
  payload?: TooltipPayloadItem[]
  /** Injected by Recharts */
  label?: string
  customCategories: CustomCategory[]
  activeCategory?: string | null
  onCategoryHover?: (catKey: string | null) => void
  onCategoryClick?: (catKey: string) => void
}

interface CustomTooltipProps extends TrendTooltipInteractionProps {
  formatCurrency: (val: number) => string
  formatMonthYear?: (dateString: string) => string
  t: TranslationStrings
  locale?: string
}

export const CustomTrendTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  formatCurrency,
  formatMonthYear,
  t,
  customCategories,
  locale,
  activeCategory,
  onCategoryHover,
  onCategoryClick,
}) => {
  if (!active || !payload || !payload.length) return null

  // Calculate total spend for this specific month
  const totalMonth = payload.reduce((acc, item) => acc + (Number(item.value) || 0), 0)

  // Sort categories by spend descending for this month
  const sortedItems = [...payload]
    .filter((item) => Number(item.value) > 0)
    .sort((a, b) => Number(b.value) - Number(a.value))

  return (
    <div className={styles.tooltipContainer}>
      <div className={styles.tooltipHeader}>
        <span className={styles.tooltipMonth}>
          {formatMonthYear ? formatMonthYear(label ?? '') : label}
        </span>
        <span className={`${styles.tooltipTotalBadge} privacy-blur`}>
          {formatCurrency(totalMonth)}
        </span>
      </div>
      <div className={styles.tooltipList}>
        {sortedItems.map((item) => {
          const val = Number(item.value)
          const catKey = item.dataKey || item.name
          const catColor = getCategoryColor(catKey, customCategories)
          const pct = formatCategoryPercent(val, totalMonth, locale)
          const isRowActive = activeCategory === catKey
          const isRowDimmed = activeCategory !== null && !isRowActive

          return (
            <div
              key={item.dataKey}
              role="button"
              tabIndex={0}
              className={`${styles.tooltipRow} ${isRowActive ? styles.tooltipRowActive : ''} ${isRowDimmed ? styles.tooltipRowDimmed : ''}`}
              style={
                {
                  '--cat-accent': catColor,
                } as React.CSSProperties
              }
              onMouseEnter={() => onCategoryHover?.(catKey)}
              onMouseLeave={() => onCategoryHover?.(null)}
              onClick={() => onCategoryClick?.(catKey)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onCategoryClick?.(catKey)
                }
              }}
              aria-label={`${getCategoryLabel(catKey, t, locale, customCategories)}: ${formatCurrency(val)} (${pct})`}
            >
              <div className={styles.tooltipCatInfo}>
                <span className={styles.tooltipDot} style={{ backgroundColor: catColor }} />
                <span className={styles.tooltipCatName}>
                  {getCategoryLabel(catKey, t, locale, customCategories)}
                </span>
              </div>
              <span className={`${styles.tooltipAmount} privacy-blur`}>{formatCurrency(val)}</span>
              <span className={styles.tooltipCatPct}>({pct})</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Tooltip content that reads translations and formatters from the language store itself,
 * so the chart can pass a locale-independent element to Recharts' `<Tooltip content>`.
 */
export const LocalizedTrendTooltip: React.FC<TrendTooltipInteractionProps> = (props) => {
  const t = useLanguageStore((s) => s.t)
  const locale = useLanguageStore((s) => s.locale)
  const { formatCurrency, formatMonthYear } = useFormatters()

  return (
    <CustomTrendTooltip
      {...props}
      t={t}
      locale={locale}
      formatCurrency={formatCurrency}
      formatMonthYear={formatMonthYear}
    />
  )
}
