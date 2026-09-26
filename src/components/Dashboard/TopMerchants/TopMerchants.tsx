import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Building2, LayoutList } from 'lucide-react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { MerchantEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useIsMobile } from '../../../hooks/useIsMobile'
import type { TranslationStrings } from '../../../i18n/translations'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { getCategoryColor } from '../../../utils/category-colors'
import { getCategoryIcon, getMerchantBrandInfo } from '../../../utils/category-icons'
import { getCategoryLabel } from '../../../utils/category-utils'

import styles from './TopMerchants.module.css'

interface TopMerchantsProps {
  merchants: MerchantEntry[]
  totalExpenses?: number
  onMerchantClick?: (merchantName: string) => void
  fullWidth?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: MerchantEntry }>
  coordinate?: { x: number; y: number }
  formatCurrency: (n: number) => string
  formatChargesCount: (n: number) => string
  totalExpenses?: number
  t: TranslationStrings
  isMobile?: boolean
  onMerchantClick?: (merchantName: string) => void
}

const CustomMerchantTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  formatCurrency,
  formatChargesCount,
  totalExpenses,
  t,
  isMobile = false,
  onMerchantClick,
}) => {
  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0].payload
  const brand = getMerchantBrandInfo(data.name)
  const category = data.category || brand.suggestedCategory || 'Other'
  const categoryLabel = getCategoryLabel(category, t)
  const LogoComp = brand.logoComponent
  const share = totalExpenses && totalExpenses > 0 ? ((data.amount / totalExpenses) * 100).toFixed(1) : null

  return (
    <div className={styles.tooltipContainer}>
      <div className={styles.tooltipHeader}>
        <div className={styles.tooltipLogoBox}>
          {LogoComp ? (
            <LogoComp size={16} color={brand.brandColor} />
          ) : (
            <span className={styles.tooltipInitialsAvatar}>
              {brand.initials}
            </span>
          )}
        </div>
        <div>
          <p className={styles.tooltipTitle}>{data.name}</p>
          <span className={styles.tooltipCategoryBadge}>
            {getCategoryIcon(category, 10)}
            <span>{categoryLabel}</span>
          </span>
        </div>
      </div>
      <div className={styles.tooltipRow}>
        <span>{t.amount || 'Total Spent'}</span>
        <span className={styles.tooltipValue}>{formatCurrency(data.amount)}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span>{t.numTransactions || 'Transactions'}</span>
        <span className={styles.tooltipValue}>{formatChargesCount(data.count)}</span>
      </div>
      {data.count > 0 && (
        <div className={styles.tooltipRow}>
          <span>
            {data.count === 1
              ? (t.perTransaction || 'Per transaction')
              : (isMobile ? (t.perTransactionShort || 'Avg. / tx') : (t.avgPerTransaction || 'Avg. / Transaction'))}
          </span>
          <span className={styles.tooltipValue}>{formatCurrency(data.amount / data.count)}</span>
        </div>
      )}
      {share && (
        <div className={styles.tooltipRow}>
          <span>{t.ofTotal?.replace('{percent}', share) || `${share}% of total`}</span>
        </div>
      )}
      {isMobile && onMerchantClick && (
        <button
          type="button"
          className={styles.tooltipActionBtn}
          onClick={(e) => {
            e.stopPropagation()
            onMerchantClick(data.name)
          }}
        >
          {t.allTransactions || 'View transactions'} &rarr;
        </button>
      )}
    </div>
  )
}

interface CustomYAxisTickProps {
  x?: number
  y?: number
  payload?: { value: string }
  onHoverTick?: (info: { name: string; y: number } | null) => void
  isMobile?: boolean
}

const CustomYAxisTick: React.FC<CustomYAxisTickProps> = ({
  x = 0,
  y = 0,
  payload,
  onHoverTick,
  isMobile = false,
}) => {
  const fullName = payload?.value ?? ''
  const maxChars = isMobile ? 10 : 18
  const truncateLength = isMobile ? 8 : 16
  const isTruncated = fullName.length > maxChars
  const displayName = isTruncated ? `${fullName.substring(0, truncateLength)}…` : fullName

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={isMobile ? -80 : -136}
        y={0}
        dy={4}
        textAnchor="start"
        className={`${styles.yAxisTick} ${isTruncated ? styles.yAxisTickTruncated : ''}`}
        onMouseEnter={() => {
          if (isTruncated && !isMobile) {
            onHoverTick?.({ name: fullName, y })
          }
        }}
        onMouseLeave={() => {
          if (isTruncated && !isMobile) {
            onHoverTick?.(null)
          }
        }}
      >
        {displayName}
        {isTruncated && <title>{fullName}</title>}
      </text>
    </g>
  )
}

export const TopMerchants: React.FC<TopMerchantsProps> = ({
  merchants,
  totalExpenses = 0,
  onMerchantClick,
  fullWidth,
}) => {
  const t = useLanguageStore((s) => s.t)
  const customCategories = useAppStore((s) => s.customCategories)
  const { formatCurrency, formatChargesCount, formatPopularMerchantsCount } = useFormatters()
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list')
  const [hoveredLabel, setHoveredLabel] = useState<{ name: string; y: number } | null>(null)
  const isMobile = useIsMobile(640)

  const totalTopSpend = useMemo(() => {
    return merchants.reduce((acc, m) => acc + m.amount, 0)
  }, [merchants])

  const topSharePct = useMemo(() => {
    if (!totalExpenses || totalExpenses <= 0) return null
    return ((totalTopSpend / totalExpenses) * 100).toFixed(1)
  }, [totalTopSpend, totalExpenses])

  if (merchants.length === 0) {
    return null
  }

  const getRankClass = (idx: number) => {
    if (idx === 0) return styles.rankGold
    if (idx === 1) return styles.rankSilver
    if (idx === 2) return styles.rankBronze
    return styles.rankDefault
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`glass-card ${styles.container} ${fullWidth ? styles.fullWidth : ''}`}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconBadge}>
            <Building2 size={20} />
          </div>
          <div>
            <h3 className={styles.title}>{t.topMerchants}</h3>
            <p className={styles.subtitle}>
              {formatPopularMerchantsCount(merchants.length)}
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.statPillsGroup}>
            <div className={styles.statPill}>
              <span className={styles.statLabel}>{t.total || 'Total'}</span>
              <span className={styles.statValue}>{formatCurrency(totalTopSpend)}</span>
            </div>
            {topSharePct && (
              <div className={styles.statPill}>
                <span className={styles.statLabel}>{t.topMerchantsShare || 'Share'}</span>
                <span className={`${styles.statValue} ${styles.statValueShare}`}>{topSharePct}%</span>
              </div>
            )}
          </div>

          <div className={styles.viewToggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.toggleBtnActive : ''}`}
              onClick={() => {
                setViewMode('list')
                setHoveredLabel(null)
              }}
              title={t.viewRankedList || 'Ranked list'}
              aria-label={t.viewRankedList || 'Ranked list'}
            >
              <LayoutList size={14} />
              <span>{t.viewRankedList || 'Ranked'}</span>
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === 'chart' ? styles.toggleBtnActive : ''}`}
              onClick={() => setViewMode('chart')}
              title={t.viewBarChart || 'Chart view'}
              aria-label={t.viewBarChart || 'Chart view'}
            >
              <BarChart2 size={14} />
              <span>{t.viewBarChart || 'Chart'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      {viewMode === 'list' ? (
        <div className={styles.listContainer}>
          {merchants.map((merchant, idx) => {
            const brand = getMerchantBrandInfo(merchant.name)
            const LogoComp = brand.logoComponent
            const category = merchant.category || brand.suggestedCategory || 'Other'
            const categoryLabel = getCategoryLabel(category, t)
            const shareOfTopNum = totalTopSpend > 0 ? (merchant.amount / totalTopSpend) * 100 : 0
            const shareOfTop = shareOfTopNum.toFixed(0)
            const avgPerTx = merchant.count > 0 ? merchant.amount / merchant.count : merchant.amount
            const isClickable = Boolean(onMerchantClick)

            return (
              <div
                key={merchant.name}
                className={`${styles.merchantRow} ${isClickable ? styles.merchantRowClickable : ''}`}
                onClick={() => onMerchantClick?.(merchant.name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onMerchantClick?.(merchant.name)
                  }
                }}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                title={isClickable ? `${merchant.name} - ${t.allTransactions || 'View transactions'}` : merchant.name}
                style={{
                  '--brand-color': brand.brandColor,
                  '--progress-width': `${Math.max(2, shareOfTopNum)}%`,
                } as React.CSSProperties}
              >
                <div className={styles.rowMain}>
                  <div className={styles.rowLeft}>
                    <div className={`${styles.rankBadge} ${getRankClass(idx)}`}>
                      {idx + 1}
                    </div>

                    <div className={styles.logoBox}>
                      {LogoComp ? (
                        <LogoComp size={18} color={brand.brandColor} />
                      ) : (
                        <span className={styles.initialsAvatar}>{brand.initials}</span>
                      )}
                    </div>

                    <div className={styles.merchantInfo}>
                      <div className={styles.nameCategoryRow}>
                        <span className={styles.merchantName} title={merchant.name}>
                          {merchant.name}
                        </span>
                        <span
                          className={styles.categoryBadge}
                          style={{
                            borderColor: `${getCategoryColor(category, customCategories)}40`,
                            backgroundColor: `${getCategoryColor(category, customCategories)}12`,
                          }}
                        >
                          {getCategoryIcon(category, 11, customCategories, merchant.name)}
                          <span>{categoryLabel}</span>
                        </span>
                      </div>

                      <div className={styles.metaRow}>
                        <span>{formatChargesCount(merchant.count)}</span>
                        <span className={styles.bulletDot}>•</span>
                        <span>
                          {merchant.count > 1 ? `~${formatCurrency(avgPerTx)}` : formatCurrency(merchant.amount)}{' '}
                          {t.perTransactionShort || '/ tx'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.rowRight}>
                    <span className={styles.merchantAmount}>{formatCurrency(merchant.amount)}</span>
                    <span
                      className={styles.shareBadge}
                      title={`${shareOfTop}% ${t.ofTopSpend || 'of top spend'}`}
                    >
                      {shareOfTop}%
                    </span>
                  </div>
                </div>

                {/* Dedicated progress bar below row content */}
                <div
                  className={styles.progressBarWrapper}
                  title={`${shareOfTop}% ${t.ofTopSpend || 'of top spend'}`}
                >
                  <div className={styles.progressBarTrack}>
                    <div className={styles.progressBarFill} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div
          className={styles.chartContainer}
          onMouseLeave={() => setHoveredLabel(null)}
        >
          {!isMobile && hoveredLabel && (
            <div
              className={styles.axisTooltip}
              style={{ '--tooltip-top': `${hoveredLabel.y}px` } as React.CSSProperties}
            >
              {hoveredLabel.name}
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={merchants}
              layout="vertical"
              margin={{ left: 8, right: isMobile ? 12 : 20, top: 4, bottom: 4 }}
            >
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
                tickFormatter={(v: number) => formatCurrency(v, 0)}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                width={isMobile ? 85 : 140}
                tick={<CustomYAxisTick onHoverTick={setHoveredLabel} isMobile={isMobile} />}
              />
              <Tooltip
                wrapperStyle={{ zIndex: 9999, pointerEvents: isMobile ? 'auto' : 'none' }}
                allowEscapeViewBox={{ x: false, y: true }}
                animationDuration={150}
                content={
                  <CustomMerchantTooltip
                    formatCurrency={formatCurrency}
                    formatChargesCount={formatChargesCount}
                    totalExpenses={totalExpenses}
                    t={t}
                    isMobile={isMobile}
                    onMerchantClick={onMerchantClick}
                  />
                }
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar
                dataKey="amount"
                radius={[0, 6, 6, 0]}
                onClick={(entry) => {
                  if (isMobile) return
                  const m = entry as unknown as { name?: string }
                  if (m?.name) onMerchantClick?.(m.name)
                }}
                className={!isMobile && onMerchantClick ? styles.merchantRowClickable : undefined}
              >
                {merchants.map((entry) => {
                  const brand = getMerchantBrandInfo(entry.name)
                  return <Cell key={entry.name} fill={brand.brandColor} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}
