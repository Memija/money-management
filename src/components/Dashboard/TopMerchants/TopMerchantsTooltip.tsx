import React, { useMemo } from 'react'

import type { MerchantEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { getMerchantBrandInfo } from '../../../utils/category-icons'
import { getCategoryLabel } from '../../../utils/category-utils'
import { CategoryIcon } from '../../shared/CategoryIcon'
import { MerchantLogo } from './MerchantLogo'

import styles from './TopMerchants.module.css'

const TOOLTIP_LOGO_SIZE = 16
const TOOLTIP_CATEGORY_ICON_SIZE = 10

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

  if (!data || !brand) {
    return null
  }

  const category = data.category || brand.suggestedCategory || 'Other'
  const share = totalExpenses && totalExpenses > 0 ? ((data.amount / totalExpenses) * 100).toFixed(1) : null
  const avgLabel =
    data.count === 1
      ? t.perTransaction || 'Per transaction'
      : isMobile
        ? t.perTransactionShort || 'Avg. / tx'
        : t.avgPerTransaction || 'Avg. / Transaction'

  return (
    <div className={styles.tooltipContainer}>
      <div className={styles.tooltipHeader}>
        <div className={styles.tooltipLogoBox}>
          <MerchantLogo brand={brand} size={TOOLTIP_LOGO_SIZE} initialsClassName={styles.tooltipInitialsAvatar} />
        </div>
        <div>
          <p className={styles.tooltipTitle}>{data.name}</p>
          <span className={styles.tooltipCategoryBadge}>
            <CategoryIcon category={category} size={TOOLTIP_CATEGORY_ICON_SIZE} customCategories={customCategories} />
            <span>{getCategoryLabel(category, t)}</span>
          </span>
        </div>
      </div>
      <div className={styles.tooltipRow}>
        <span>{t.amount || 'Total Spent'}</span>
        <span className={`${styles.tooltipValue} privacy-blur`}>{formatCurrency(data.amount)}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span>{t.numTransactions || 'Transactions'}</span>
        <span className={styles.tooltipValue}>{formatChargesCount(data.count)}</span>
      </div>
      {data.count > 0 && (
        <div className={styles.tooltipRow}>
          <span>{avgLabel}</span>
          <span className={`${styles.tooltipValue} privacy-blur`}>{formatCurrency(data.amount / data.count)}</span>
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
