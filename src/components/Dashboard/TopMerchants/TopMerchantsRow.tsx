import React from 'react'

import type { MerchantEntry } from '../../../hooks/useAnalytics'
import { useFormatters } from '../../../hooks/useFormatters'
import type { TranslationStrings } from '../../../i18n/types'
import type { CustomCategory } from '../../../types'
import { getCategoryColor } from '../../../utils/category-colors'
import type { MerchantBrandInfo } from '../../../utils/category-icons'
import { getCategoryLabel } from '../../../utils/category-utils'
import { CategoryIcon } from '../../shared/CategoryIcon'
import { MerchantLogo } from './MerchantLogo'

import styles from './TopMerchantsRow.module.css'

interface TopMerchantsRowProps {
  merchant: MerchantEntry
  brand: MerchantBrandInfo
  idx: number
  totalTopSpend: number
  customCategories: CustomCategory[]
  t: TranslationStrings
  onMerchantClick?: (merchantName: string) => void
}

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

export const TopMerchantsRow: React.FC<TopMerchantsRowProps> = React.memo(
  ({ merchant, brand, idx, totalTopSpend, customCategories, t, onMerchantClick }) => {
    const { formatCurrency, formatChargesCount } = useFormatters()
    const category = merchant.category || brand.suggestedCategory || 'Other'
    const categoryColor = getCategoryColor(category, customCategories)
    const categoryLabel = getCategoryLabel(category, t)
    const shareOfTopNum = totalTopSpend > 0 ? (merchant.amount / totalTopSpend) * 100 : 0
    const shareOfTop = shareOfTopNum.toFixed(0)
    const avgPerTx = merchant.count > 0 ? merchant.amount / merchant.count : merchant.amount
    const isClickable = Boolean(onMerchantClick)

    return (
      <div
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
        title={
          isClickable
            ? `${merchant.name} - ${t.allTransactions || 'View transactions'}`
            : merchant.name
        }
        style={
          {
            '--brand-color': brand.brandColor,
            '--progress-width': `${Math.max(MIN_PROGRESS_PCT, shareOfTopNum)}%`,
          } as React.CSSProperties
        }
      >
        <div className={styles.rowMain}>
          <div className={styles.rowLeft}>
            <div className={`${styles.rankBadge} ${getRankClass(idx)}`}>{idx + 1}</div>

            <div className={styles.logoBox}>
              <MerchantLogo
                brand={brand}
                size={ROW_LOGO_SIZE}
                initialsClassName={styles.initialsAvatar}
              />
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
                  {merchant.count > 1
                    ? `~${formatCurrency(avgPerTx)}`
                    : formatCurrency(merchant.amount)}{' '}
                  {t.perTransactionShort || '/ tx'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.rowRight}>
            <span className={`${styles.merchantAmount} privacy-blur`}>
              {formatCurrency(merchant.amount)}
            </span>
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
  },
)

TopMerchantsRow.displayName = 'TopMerchantsRow'
