import React, { useMemo } from 'react'

import type { MerchantEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { getCategoryColor } from '../../../utils/category-colors'
import { getMerchantBrandInfo } from '../../../utils/category-icons'
import { getCategoryLabel } from '../../../utils/category-utils'
import { CategoryIcon } from '../../shared/CategoryIcon'
import { MerchantLogo } from './MerchantLogo'

import styles from './TopMerchants.module.css'

const TOOLTIP_LOGO_SIZE = 18
const TOOLTIP_CATEGORY_ICON_SIZE = 11

interface TopMerchantsTooltipProps {
  /** Injected by Recharts */
  active?: boolean
  payload?: Array<{ value: number; payload: MerchantEntry }>
  totalExpenses?: number
  isMobile?: boolean
  onMerchantClick?: (merchantName: string) => void
}

/**
 * Bar chart tooltip for Top Merchants. Reads translations and formatters itself, so the
 * chart can pass a stable `content` element that doesn't change on a language switch.
 */
export const TopMerchantsTooltip: React.FC<TopMerchantsTooltipProps> = ({
  active,
  payload,
  totalExpenses,
  isMobile = false,
  onMerchantClick,
}) => {
  const t = useLanguageStore((s) => s.t)
  const customCategories = useAppStore((s) => s.customCategories)
  const { formatCurrency, formatChargesCount } = useFormatters()
  const data = active ? payload?.[0]?.payload : undefined
  const brand = useMemo(() => (data ? getMerchantBrandInfo(data.name) : null), [data])

  const category = data?.category || brand?.suggestedCategory || 'Other'
  const categoryColor = useMemo(
    () => getCategoryColor(category, customCategories),
    [category, customCategories],
  )
  const categoryLabel = useMemo(() => getCategoryLabel(category, t), [category, t])

  const share = useMemo(() => {
    if (!data || !totalExpenses || totalExpenses <= 0) {
      return null
    }
    return ((data.amount / totalExpenses) * 100).toFixed(1)
  }, [data, totalExpenses])

  const shareLabel = useMemo(() => {
    if (!t.ofTotal) {
      return 'of total expenses'
    }
    const cleaned = t.ofTotal
      .replace('{percent}%', '')
      .replace('{percent}', '')
      .replace(/^\s*[•·-]\s*/, '')
      .trim()
    return cleaned
      ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
      : t.topMerchantsShare || 'Share'
  }, [t.ofTotal, t.topMerchantsShare])

  const avgLabel = useMemo(() => {
    if (!data) {
      return ''
    }
    if (data.count === 1) {
      return t.perTransaction || 'Per transaction'
    }
    if (isMobile) {
      return t.insightAvgTransaction || t.avgPerTransaction || 'Avg. Transaction'
    }
    return t.avgPerTransaction || 'Average per transaction'
  }, [data, isMobile, t])

  if (!data || !brand) {
    return null
  }

  const brandAccentColor = brand.brandColor || categoryColor || 'var(--primary)'

  return (
    <div className={styles.tooltipContainer}>
      <div className={styles.tooltipHeader}>
        <div className={styles.tooltipLogoBox}>
          <MerchantLogo
            brand={brand}
            size={TOOLTIP_LOGO_SIZE}
            initialsClassName={styles.tooltipInitialsAvatar}
          />
        </div>
        <div className={styles.tooltipHeaderInfo}>
          <p className={styles.tooltipTitle} title={data.name}>
            {data.name}
          </p>
          <span
            className={styles.tooltipCategoryBadge}
            style={{
              borderColor: `${categoryColor}40`,
              backgroundColor: `${categoryColor}14`,
            }}
          >
            <CategoryIcon
              category={category}
              size={TOOLTIP_CATEGORY_ICON_SIZE}
              customCategories={customCategories}
              description={data.name}
            />
            <span>{categoryLabel}</span>
          </span>
        </div>
      </div>

      <div className={styles.tooltipBody}>
        <div className={styles.tooltipRow}>
          <span className={styles.tooltipLabel}>{t.total || t.amount || 'Total'}</span>
          <span className={`${styles.tooltipValue} privacy-blur`}>
            {formatCurrency(data.amount)}
          </span>
        </div>

        <div className={styles.tooltipRow}>
          <span className={styles.tooltipLabel}>{t.numTransactions || 'Transactions'}</span>
          <span className={styles.tooltipValue}>{formatChargesCount(data.count)}</span>
        </div>

        {data.count > 0 && (
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>{avgLabel}</span>
            <span className={`${styles.tooltipValue} privacy-blur`}>
              {formatCurrency(data.amount / data.count)}
            </span>
          </div>
        )}
      </div>

      {share && (
        <div className={styles.tooltipShareBox}>
          <div className={styles.tooltipShareHeader}>
            <span className={styles.tooltipShareLabel}>{shareLabel}</span>
            <span className={styles.tooltipShareBadge}>{share}%</span>
          </div>
          <div className={styles.tooltipShareTrack}>
            <div
              className={styles.tooltipShareFill}
              style={{
                width: `${Math.min(100, Math.max(2, Number(share)))}%`,
                backgroundColor: brandAccentColor,
              }}
            />
          </div>
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
