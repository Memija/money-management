import React, { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Building2, LayoutList } from 'lucide-react'

import type { MerchantEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { getCategoryColor } from '../../../utils/category-colors'
import { getMerchantBrandInfo, type MerchantBrandInfo } from '../../../utils/category-icons'
import { getCategoryLabel } from '../../../utils/category-utils'
import { CategoryIcon } from '../../shared/CategoryIcon'
import { MerchantLogo } from './MerchantLogo'
import { TopMerchantsChart } from './TopMerchantsChart'

import styles from './TopMerchants.module.css'

interface TopMerchantsProps {
  merchants: MerchantEntry[]
  totalExpenses?: number
  onMerchantClick?: (merchantName: string) => void
  fullWidth?: boolean
}

const MOBILE_BREAKPOINT_PX = 640
const ROW_LOGO_SIZE = 18
const ROW_CATEGORY_ICON_SIZE = 11
const MIN_PROGRESS_PCT = 2

const getRankClass = (idx: number): string => {
  if (idx === 0) {
    return styles.rankGold
  }
  if (idx === 1) {
    return styles.rankSilver
  }
  if (idx === 2) {
    return styles.rankBronze
  }
  return styles.rankDefault
}

export const TopMerchants: React.FC<TopMerchantsProps> = React.memo(({
  merchants,
  totalExpenses = 0,
  onMerchantClick,
  fullWidth,
}) => {
  const t = useLanguageStore((s) => s.t)
  const customCategories = useAppStore((s) => s.customCategories)
  const { formatCurrency, formatChargesCount, formatPopularMerchantsCount } = useFormatters()
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list')
  const isMobile = useIsMobile(MOBILE_BREAKPOINT_PX)

  // Brand matching is regex-heavy; compute once per merchant list, not on every render
  const brandInfos = useMemo(
    () => new Map<string, MerchantBrandInfo>(merchants.map((m) => [m.name, getMerchantBrandInfo(m.name)])),
    [merchants],
  )

  const totalTopSpend = useMemo(() => {
    return merchants.reduce((acc, m) => acc + m.amount, 0)
  }, [merchants])

  const topSharePct = useMemo(() => {
    if (!totalExpenses || totalExpenses <= 0) return null
    return ((totalTopSpend / totalExpenses) * 100).toFixed(1)
  }, [totalTopSpend, totalExpenses])

  const showList = useCallback(() => setViewMode('list'), [])
  const showChart = useCallback(() => setViewMode('chart'), [])

  if (merchants.length === 0) {
    return null
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
              <span className={`${styles.statValue} privacy-blur`}>{formatCurrency(totalTopSpend)}</span>
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
              onClick={showList}
              title={t.viewRankedList || 'Ranked list'}
              aria-label={t.viewRankedList || 'Ranked list'}
            >
              <LayoutList size={14} />
              <span>{t.viewRankedList || 'Ranked'}</span>
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === 'chart' ? styles.toggleBtnActive : ''}`}
              onClick={showChart}
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
            const brand = brandInfos.get(merchant.name) ?? getMerchantBrandInfo(merchant.name)
            const category = merchant.category || brand.suggestedCategory || 'Other'
            const categoryColor = getCategoryColor(category, customCategories)
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
                  '--progress-width': `${Math.max(MIN_PROGRESS_PCT, shareOfTopNum)}%`,
                } as React.CSSProperties}
              >
                <div className={styles.rowMain}>
                  <div className={styles.rowLeft}>
                    <div className={`${styles.rankBadge} ${getRankClass(idx)}`}>
                      {idx + 1}
                    </div>

                    <div className={styles.logoBox}>
                      <MerchantLogo brand={brand} size={ROW_LOGO_SIZE} initialsClassName={styles.initialsAvatar} />
                    </div>

                    <div className={styles.merchantInfo}>
                      <div className={styles.nameCategoryRow}>
                        <span className={`${styles.merchantName} privacy-blur`} title={merchant.name}>
                          {merchant.name}
                        </span>
                        <span
                          className={styles.categoryBadge}
                          style={{
                            borderColor: `${categoryColor}40`,
                            backgroundColor: `${categoryColor}12`,
                          }}
                        >
                          <CategoryIcon
                            category={category}
                            size={ROW_CATEGORY_ICON_SIZE}
                            customCategories={customCategories}
                            description={merchant.name}
                          />
                          <span>{categoryLabel}</span>
                        </span>
                      </div>

                      <div className={styles.metaRow}>
                        <span>{formatChargesCount(merchant.count)}</span>
                        <span className={styles.bulletDot}>•</span>
                        <span className="privacy-blur">
                          {merchant.count > 1 ? `~${formatCurrency(avgPerTx)}` : formatCurrency(merchant.amount)}{' '}
                          {t.perTransactionShort || '/ tx'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.rowRight}>
                    <span className={`${styles.merchantAmount} privacy-blur`}>{formatCurrency(merchant.amount)}</span>
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
        <TopMerchantsChart
          merchants={merchants}
          brandInfos={brandInfos}
          totalExpenses={totalExpenses}
          isMobile={isMobile}
          onMerchantClick={onMerchantClick}
        />
      )}
    </motion.div>
  )
})

TopMerchants.displayName = 'TopMerchants'
