import React, { useCallback } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts'

import type { CategoryEntry } from '../../../hooks/useAnalytics'
import { useChartAnimation } from '../../../hooks/useChartAnimation'
import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { getCategoryLabel } from '../../../utils/category-utils'

import styles from './ExpenseCategories.module.css'

const PIE_ANIMATION_MS = 600
const SECTOR_STROKE = 'var(--card-bg, #161821)'
const TOOLTIP_WRAPPER_STYLE = { outline: 'none', zIndex: 10 }
const CELL_STYLE = { cursor: 'pointer', outline: 'none' }
const SECTOR_GROUP_STYLE = { outline: 'none' }

interface SectorShapeProps {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill: string
}

interface CategoryShareTooltipProps {
  /** Injected by Recharts */
  active?: boolean
  /** Injected by Recharts */
  payload?: Array<{ payload?: unknown }>
  totalExpenses: number
}

/** Self-localizing tooltip so the donut can pass Recharts a locale-independent element. */
const CategoryShareTooltip: React.FC<CategoryShareTooltipProps> = ({
  active,
  payload,
  totalExpenses,
}) => {
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency } = useFormatters()

  if (!active || !payload || payload.length === 0) {
    return null
  }

  const data = payload[0].payload as CategoryEntry
  const pct = totalExpenses > 0 ? ((data.value / totalExpenses) * 100).toFixed(1) : '0'

  return (
    <div className={styles.tooltipContainer}>
      <div className={styles.tooltipHeader}>
        <div
          className={styles.tooltipDot}
          style={{ backgroundColor: data.color, color: data.color }}
        />
        <span className={styles.tooltipTitle}>{getCategoryLabel(data.name, t)}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span className={`${styles.tooltipValue} privacy-blur`}>{formatCurrency(data.value)}</span>
        <span
          className={styles.tooltipBadge}
          style={{
            color: data.color,
            backgroundColor: `${data.color}20`,
            borderColor: `${data.color}40`,
          }}
        >
          {pct}%
        </span>
      </div>
    </div>
  )
}

interface ExpenseCategoriesDonutProps {
  /** Categories sorted by amount, descending */
  categories: CategoryEntry[]
  totalExpenses: number
  activeIndex: number | null
  onActiveIndexChange: (index: number | null) => void
  onCategoryClick: (categoryName: string) => void
}

/**
 * Donut chart for the expense category card. Receives no locale-dependent props and only
 * animates on mount/data change, so language switches and hover don't replay the animation.
 */
export const ExpenseCategoriesDonut: React.FC<ExpenseCategoriesDonutProps> = React.memo(
  ({ categories, totalExpenses, activeIndex, onActiveIndexChange, onCategoryClick }) => {
    const isAnimationActive = useChartAnimation(categories, PIE_ANIMATION_MS)

    const handlePieEnter = useCallback(
      (_: unknown, index: number) => {
        onActiveIndexChange(index)
      },
      [onActiveIndexChange],
    )

    const handlePieLeave = useCallback(() => {
      onActiveIndexChange(null)
    }, [onActiveIndexChange])

    const handlePieClick = useCallback(
      (_: unknown, index: number) => {
        const cat = categories[index]
        if (cat) {
          onCategoryClick(cat.name)
        }
      },
      [categories, onCategoryClick],
    )

    // Custom Sector renderer with luminous active expansion
    const renderSector = useCallback(
      (props: unknown, index: number) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
          props as SectorShapeProps
        const angles = { cx, cy, startAngle, endAngle, fill }

        if (activeIndex === index) {
          return (
            <g key={`active-sector-${index}`} style={SECTOR_GROUP_STYLE}>
              {/* Luminous outer halo */}
              <Sector
                {...angles}
                innerRadius={outerRadius + 4}
                outerRadius={outerRadius + 10}
                opacity={0.35}
                cornerRadius={4}
              />
              {/* Main expanded active slice */}
              <Sector
                {...angles}
                innerRadius={innerRadius - 4}
                outerRadius={outerRadius + 7}
                stroke={SECTOR_STROKE}
                strokeWidth={3}
                cornerRadius={6}
              />
            </g>
          )
        }

        return (
          <g key={`sector-${index}`} style={SECTOR_GROUP_STYLE}>
            <Sector
              {...angles}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              stroke={SECTOR_STROKE}
              strokeWidth={2}
              cornerRadius={5}
            />
          </g>
        )
      },
      [activeIndex],
    )

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {categories.map((cat, idx) => (
              <linearGradient
                key={`pie-grad-${idx}`}
                id={`pie-grad-${idx}`}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor={cat.color} stopOpacity={1} />
                <stop offset="100%" stopColor={cat.color} stopOpacity={0.78} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={categories}
            innerRadius={84}
            outerRadius={128}
            minAngle={4}
            paddingAngle={3}
            dataKey="value"
            shape={renderSector}
            onMouseEnter={handlePieEnter}
            onMouseLeave={handlePieLeave}
            onClick={handlePieClick}
            isAnimationActive={isAnimationActive}
            animationDuration={PIE_ANIMATION_MS}
            animationEasing="ease-out"
          >
            {categories.map((cat, index) => (
              <Cell key={`cell-${cat.name}`} fill={`url(#pie-grad-${index})`} style={CELL_STYLE} />
            ))}
          </Pie>
          <Tooltip
            wrapperStyle={TOOLTIP_WRAPPER_STYLE}
            content={<CategoryShareTooltip totalExpenses={totalExpenses} />}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  },
)

ExpenseCategoriesDonut.displayName = 'ExpenseCategoriesDonut'
