import React, { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Building2, LayoutList } from 'lucide-react'

import type { MerchantEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useIsMobile } from '../../../hooks/useIsMobile'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { getMerchantBrandInfo, type MerchantBrandInfo } from '../../../utils/category-icons'
import { TopMerchantsChart } from './TopMerchantsChart'
import { TopMerchantsRow } from './TopMerchantsRow'

import styles from './TopMerchants.module.css'

interface TopMerchantsProps {
  merchants: MerchantEntry[]
  totalExpenses?: number
  onMerchantClick?: (merchantName: string) => void
  fullWidth?: boolean
}

const MOBILE_BREAKPOINT_PX = 640

export const TopMerchants: React.FC<TopMerchantsProps> = React.memo(
  ({ merchants, totalExpenses = 0, onMerchantClick, fullWidth }) => {
    const t = useLanguageStore((s) => s.t)
    const customCategories = useAppStore((s) => s.customCategories)
    const { formatCurrency, formatPopularMerchantsCount } = useFormatters()
    const [viewMode, setViewMode] = useState<'list' | 'chart'>('list')
    const isMobile = useIsMobile(MOBILE_BREAKPOINT_PX)

    // Brand matching is regex-heavy; compute once per merchant list, not on every render
    const brandInfos = useMemo(
      () =>
        new Map<string, MerchantBrandInfo>(
          merchants.map((m) => [m.name, getMerchantBrandInfo(m.name)]),
        ),
      [merchants],
    )

    const totalTopSpend = useMemo(() => {
      return merchants.reduce((acc, m) => acc + m.amount, 0)
    }, [merchants])

    const topSharePct = useMemo(() => {
      if (!totalExpenses || totalExpenses <= 0) {
        return null
      }
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
              <p className={styles.subtitle}>{formatPopularMerchantsCount(merchants.length)}</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.statPillsGroup}>
              <div className={styles.statPill}>
                <span className={styles.statLabel}>{t.total || 'Total'}</span>
                <span className={`${styles.statValue} privacy-blur`}>
                  {formatCurrency(totalTopSpend)}
                </span>
              </div>
              {topSharePct && (
                <div className={styles.statPill}>
                  <span className={styles.statLabel}>{t.topMerchantsShare || 'Share'}</span>
                  <span className={`${styles.statValue} ${styles.statValueShare}`}>
                    {topSharePct}%
                  </span>
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
            {merchants.map((merchant, idx) => (
              <TopMerchantsRow
                key={merchant.name}
                merchant={merchant}
                brand={brandInfos.get(merchant.name) ?? getMerchantBrandInfo(merchant.name)}
                idx={idx}
                totalTopSpend={totalTopSpend}
                customCategories={customCategories}
                t={t}
                onMerchantClick={onMerchantClick}
              />
            ))}
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
  },
)

TopMerchants.displayName = 'TopMerchants'
