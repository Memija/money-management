import React, { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PieChart as PieChartIcon } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts'

import type { CategoryEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { getCategoryIcon } from '../../../utils/category-icons'
import { getCategoryLabel } from '../../../utils/category-utils'

import styles from './ExpenseCategories.module.css'

interface ExpenseCategoriesProps {
  categoryBreakdown: CategoryEntry[]
  totalExpenses: number
  onCategoryClick: (categoryName: string) => void
}

interface SectorShapeProps {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill: string
  index: number
}

const getRankBadgeClass = (index: number) => {
  if (index === 0) return styles.rankGold
  if (index === 1) return styles.rankSilver
  if (index === 2) return styles.rankBronze
  return styles.rankDefault
}

export const ExpenseCategories: React.FC<ExpenseCategoriesProps> = ({
  categoryBreakdown,
  totalExpenses,
  onCategoryClick,
}) => {
  const t = useLanguageStore((s) => s.t)
  const locale = useLanguageStore((s) => s.locale)
  const customCategories = useAppStore((s) => s.customCategories)
  const { formatCurrency, formatCategoryCount, formatCategoryPercent } = useFormatters()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Sort categories strictly by expense amount descending (largest to smallest)
  const sortedCategories = useMemo(() => {
    return [...categoryBreakdown].sort((a, b) => b.value - a.value)
  }, [categoryBreakdown])

  const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null
  const avgExpensePerCategory =
    sortedCategories.length > 0 ? totalExpenses / sortedCategories.length : 0

  const handlePieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index)
  }, [])

  const handlePieLeave = useCallback(() => {
    setActiveIndex(null)
  }, [])

  const hoveredCategory =
    activeIndex !== null && sortedCategories[activeIndex]
      ? sortedCategories[activeIndex]
      : null

  // Custom Sector renderer with luminous active expansion
  const renderSector = (props: unknown, index: number) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
    } = props as SectorShapeProps

    const isHovered = activeIndex === index

    if (isHovered) {
      return (
        <g key={`active-sector-${index}`} style={{ outline: 'none' }}>
          {/* Luminous outer halo */}
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={outerRadius + 4}
            outerRadius={outerRadius + 10}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            opacity={0.35}
            cornerRadius={4}
          />
          {/* Main expanded active slice */}
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius - 4}
            outerRadius={outerRadius + 7}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            stroke="var(--card-bg, #161821)"
            strokeWidth={3}
            cornerRadius={6}
          />
        </g>
      )
    }

    return (
      <g key={`sector-${index}`} style={{ outline: 'none' }}>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="var(--card-bg, #161821)"
          strokeWidth={2}
          cornerRadius={5}
        />
      </g>
    )
  }

  if (sortedCategories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`glass-card ${styles.container}`}
      >
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.iconBadge}>
              <PieChartIcon size={20} />
            </div>
            <h3 className={styles.title}>{t.expenseCategories}</h3>
          </div>
        </div>
        <div className={styles.emptyState}>{t.noTransactionsMatch || 'No expenses for this period'}</div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`glass-card ${styles.container}`}
    >
      {/* Header with Title, Icon Badge and Summary Stat Pills */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconBadge}>
            <PieChartIcon size={20} />
          </div>
          <div>
            <h3 className={styles.title}>{t.expenseCategories}</h3>
            <p className={styles.subtitle}>
              {formatCategoryCount(sortedCategories.length)} •{' '}
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.statPillsGroup}>
            {topCategory && (
              <button
                type="button"
                className={`${styles.statPill} ${styles.statPillClickable}`}
                onClick={() => onCategoryClick(topCategory.name)}
                title={getCategoryLabel(topCategory.name, t, locale, customCategories)}
                aria-label={`${t.insightTopCategory}: ${getCategoryLabel(topCategory.name, t, locale, customCategories)}`}
              >
                <span className={styles.statLabel}>{t.insightTopCategory}</span>
                <span className={styles.statValue}>
                  <span
                    className={styles.statDot}
                    style={{ backgroundColor: topCategory.color }}
                  />
                  {`${getCategoryLabel(topCategory.name, t, locale, customCategories)} (${formatCategoryPercent(topCategory.value, totalExpenses)})`}
                </span>
              </button>
            )}

            <div className={styles.statPill}>
              <span className={styles.statLabel}>{t.avgPerCategory}</span>
              <span className={styles.statValue}>{formatCurrency(avgExpensePerCategory)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Donut Chart Container with Center Stats & Glass Disc */}
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {sortedCategories.map((cat, idx) => (
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
                data={sortedCategories}
                innerRadius={84}
                outerRadius={128}
                minAngle={4}
                paddingAngle={3}
                dataKey="value"
                shape={renderSector}
                onMouseEnter={handlePieEnter}
                onMouseLeave={handlePieLeave}
                onClick={(_, index) => {
                  const cat = sortedCategories[index]
                  if (cat) {
                    onCategoryClick(cat.name)
                  }
                }}
                animationDuration={600}
                animationEasing="ease-out"
              >
                {sortedCategories.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#pie-grad-${index})`}
                    style={{ cursor: 'pointer', outline: 'none' }}
                  />
                ))}
              </Pie>
              <Tooltip
                wrapperStyle={{ outline: 'none', zIndex: 10 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as CategoryEntry
                    const pct =
                      totalExpenses > 0
                        ? ((data.value / totalExpenses) * 100).toFixed(1)
                        : '0'
                    return (
                      <div className={styles.tooltipContainer}>
                        <div className={styles.tooltipHeader}>
                          <div
                            className={styles.tooltipDot}
                            style={{
                              backgroundColor: data.color,
                              color: data.color,
                            }}
                          />
                          <span className={styles.tooltipTitle}>
                            {getCategoryLabel(data.name, t)}
                          </span>
                        </div>
                        <div className={styles.tooltipRow}>
                          <span className={styles.tooltipValue}>
                            {formatCurrency(data.value)}
                          </span>
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
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Interactive Center Donut Display with Frosted Glass Disc */}
          <div className={styles.centerStats}>
            <div className={styles.centerGlassDisc} />
            <AnimatePresence mode="wait">
              {hoveredCategory ? (
                <motion.div
                  key={hoveredCategory.name}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className={styles.centerContent}
                >
                  <div
                    className={styles.centerIconBox}
                    style={
                      {
                        '--hovered-color': hoveredCategory.color,
                      } as React.CSSProperties
                    }
                  >
                    {getCategoryIcon(hoveredCategory.name, 16, customCategories)}
                  </div>
                  <p className={styles.centerCategoryLabel}>
                    {getCategoryLabel(hoveredCategory.name, t, locale, customCategories)}
                  </p>
                  <p className={styles.centerAmount}>
                    {formatCurrency(hoveredCategory.value)}
                  </p>
                  <div className={styles.centerBadgesRow}>
                    <span
                      className={styles.centerPercentBadge}
                      style={{
                        color: hoveredCategory.color,
                        backgroundColor: `${hoveredCategory.color}18`,
                        borderColor: `${hoveredCategory.color}35`,
                      }}
                    >
                      {totalExpenses > 0
                        ? (hoveredCategory.value / totalExpenses) * 100 < 0.1
                          ? '<0.1%'
                          : `${((hoveredCategory.value / totalExpenses) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                    <span className={styles.centerRankTag}>
                      #{activeIndex !== null ? activeIndex + 1 : 1}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="default-center"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className={styles.centerContent}
                >
                  <p className={styles.centerDefaultLabel}>{t.expenses || 'Total'}</p>
                  <p className={styles.centerTotalAmount}>
                    {formatCurrency(totalExpenses)}
                  </p>
                  <p className={styles.centerCategoryCount}>
                    {formatCategoryCount(sortedCategories.length)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Category Cards Grid with Rank Badges */}
        <div className={styles.categoryGrid}>
          {sortedCategories.map((cat, index) => {
            const isHovered = activeIndex === index
            const percentage =
              totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0

            return (
              <button
                key={cat.name}
                type="button"
                className={`${styles.categoryCard} ${isHovered ? styles.activeCard : ''}`}
                style={
                  {
                    '--active-card-color': cat.color,
                    '--active-card-glow': `${cat.color}35`,
                  } as React.CSSProperties
                }
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => onCategoryClick(cat.name)}
                aria-label={`${getCategoryLabel(cat.name, t, locale, customCategories)}: ${formatCurrency(cat.value)}`}
              >
                <div className={styles.cardTop}>
                  <div className={styles.cardCategoryInfo}>
                    <span className={`${styles.rankPill} ${getRankBadgeClass(index)}`}>
                      #{index + 1}
                    </span>
                    <div className={styles.iconBox}>
                      {getCategoryIcon(cat.name, 16, customCategories)}
                    </div>
                    <span
                      className={styles.categoryName}
                      title={getCategoryLabel(cat.name, t, locale, customCategories)}
                    >
                      {getCategoryLabel(cat.name, t, locale, customCategories)}
                    </span>
                  </div>
                  <span className={styles.cardValue}>{formatCurrency(cat.value)}</span>
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
          })}
        </div>
      </div>
    </motion.div>
  )
}
