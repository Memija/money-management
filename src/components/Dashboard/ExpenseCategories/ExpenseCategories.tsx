import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PieChart as PieChartIcon } from 'lucide-react'

import type { CategoryEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { getCategoryLabel } from '../../../utils/category-utils'
import { CategoryIcon } from '../../shared/CategoryIcon'
import { RenderWhenVisible } from '../../shared/RenderWhenVisible'
import { ExpenseCategoriesDonut } from './ExpenseCategoriesDonut'

import styles from './ExpenseCategories.module.css'

interface ExpenseCategoriesProps {
  categoryBreakdown: CategoryEntry[]
  totalExpenses: number
  onCategoryClick: (categoryName: string) => void
}

const CATEGORY_ICON_SIZE = 16

const getRankBadgeClass = (index: number) => {
  if (index === 0) return styles.rankGold
  if (index === 1) return styles.rankSilver
  if (index === 2) return styles.rankBronze
  return styles.rankDefault
}

export const ExpenseCategories: React.FC<ExpenseCategoriesProps> = React.memo(
  ({ categoryBreakdown, totalExpenses, onCategoryClick }) => {
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

    const hoveredCategory =
      activeIndex !== null && sortedCategories[activeIndex] ? sortedCategories[activeIndex] : null

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
          <div className={styles.emptyState}>
            {t.noTransactionsMatch || 'No expenses for this period'}
          </div>
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
                <span className="privacy-blur">{formatCurrency(totalExpenses)}</span>
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
                <span className={`${styles.statValue} privacy-blur`}>
                  {formatCurrency(avgExpensePerCategory)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {/* Donut Chart Container with Center Stats & Glass Disc */}
          <div className={styles.chartWrapper}>
            <RenderWhenVisible>
              <ExpenseCategoriesDonut
                categories={sortedCategories}
                totalExpenses={totalExpenses}
                activeIndex={activeIndex}
                onActiveIndexChange={setActiveIndex}
                onCategoryClick={onCategoryClick}
              />
            </RenderWhenVisible>

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
                      <CategoryIcon
                        category={hoveredCategory.name}
                        size={CATEGORY_ICON_SIZE}
                        customCategories={customCategories}
                      />
                    </div>
                    <p className={styles.centerCategoryLabel}>
                      {getCategoryLabel(hoveredCategory.name, t, locale, customCategories)}
                    </p>
                    <p className={`${styles.centerAmount} privacy-blur`}>
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
                    <p className={`${styles.centerTotalAmount} privacy-blur`}>
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
              const percentage = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0

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
                        <CategoryIcon
                          category={cat.name}
                          size={CATEGORY_ICON_SIZE}
                          customCategories={customCategories}
                        />
                      </div>
                      <span
                        className={styles.categoryName}
                        title={getCategoryLabel(cat.name, t, locale, customCategories)}
                      >
                        {getCategoryLabel(cat.name, t, locale, customCategories)}
                      </span>
                    </div>
                    <span className={`${styles.cardValue} privacy-blur`}>
                      {formatCurrency(cat.value)}
                    </span>
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
  },
)

ExpenseCategories.displayName = 'ExpenseCategories'
