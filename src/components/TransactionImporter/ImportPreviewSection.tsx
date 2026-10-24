import React from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Ghost,
  Layers,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'

import { useFormatters } from '../../hooks/useFormatters'
import type { TranslationStrings } from '../../i18n/types'
import type { Transaction } from '../../types'
import type { ScopeFilter } from '../shared/TransactionPreviewModal'

import styles from './ImportPreviewSection.module.css'

interface ImportPreviewSectionProps {
  transactions: Transaction[]
  importFlows: { inflows: number; outflows: number }
  duplicateStats: {
    duplicateCount: number
    newCount: number
    duplicateIds: string[]
  }
  isAllDuplicates: boolean
  isPartialDuplicates: boolean
  isDuplicateFlow: boolean
  unlockedDuplicateIds: Set<string>
  discardedSpaceCount: number
  internalTransferStats: {
    count: number
    existingAccountTransfers: Transaction[]
  }
  isSubmitted: boolean
  loading: boolean
  t: TranslationStrings
  onClear: () => void
  onOpenPreview: (filter: ScopeFilter) => void
  onConfirmImport: () => void
}

export const ImportPreviewSection: React.FC<ImportPreviewSectionProps> = React.memo(
  ({
    transactions,
    importFlows,
    duplicateStats,
    isAllDuplicates,
    isPartialDuplicates,
    isDuplicateFlow,
    unlockedDuplicateIds,
    discardedSpaceCount,
    internalTransferStats,
    isSubmitted,
    loading,
    t,
    onClear,
    onOpenPreview,
    onConfirmImport,
  }) => {
    const { formatCurrency } = useFormatters()

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles['import-preview']}
      >
        <div className={styles['import-preview-header']}>
          <div className={styles['import-preview-info']}>
            <div className={styles['import-preview-title-row']}>
              <CheckCircle2 size={20} className={styles['success-icon']} />
              <span>
                {t.transactionsFound.includes('{count}') ? (
                  (() => {
                    const [before, after] = t.transactionsFound.split('{count}')
                    return (
                      <>
                        {before}
                        <strong>{transactions.length}</strong>
                        {after}
                      </>
                    )
                  })()
                ) : (
                  <>
                    <strong>{transactions.length}</strong> {t.transactionsFound}
                  </>
                )}
              </span>
            </div>
            <div className={styles['import-preview-flows']}>
              <span
                className={styles['flow-badge-inflow']}
                title={`${t.inflows || 'Inflows'}: +${formatCurrency(importFlows.inflows)}`}
                data-testid="import-inflow-badge"
              >
                <TrendingUp size={13} aria-hidden="true" />+{formatCurrency(importFlows.inflows)}
              </span>
              <span
                className={styles['flow-badge-outflow']}
                title={`${t.outflows || 'Outflows'}: -${formatCurrency(importFlows.outflows)}`}
                data-testid="import-outflow-badge"
              >
                <TrendingDown size={13} aria-hidden="true" />-{formatCurrency(importFlows.outflows)}
              </span>
            </div>
          </div>
          <button className={styles['clear-button']} onClick={onClear} id="clear-import">
            <X size={14} />
            {t.clear}
          </button>
        </div>

        {/* First check: duplicate detection */}
        {isAllDuplicates && (
          <div className={styles['duplicate-all-banner']} data-testid="duplicate-all-banner">
            <div className={styles['duplicate-banner-content']}>
              <AlertTriangle size={18} className={styles['duplicate-banner-icon']} />
              <span>
                {duplicateStats.duplicateCount === 1
                  ? t.duplicateImportAllBannerSingular ||
                    '1 duplicate transaction detected. This transaction has already been imported.'
                  : (
                      t.duplicateImportAllBanner ||
                      'All {count} transactions in this file have already been imported (duplicates).'
                    ).replace('{count}', String(duplicateStats.duplicateCount))}
              </span>
            </div>
            <button
              type="button"
              className={styles['duplicate-banner-action-btn']}
              onClick={() => onOpenPreview('duplicates')}
              data-testid="view-duplicates-button"
              title={t.viewDuplicates || 'View duplicates'}
            >
              <AlertTriangle size={13} aria-hidden="true" />
              <span>{t.viewDuplicates || 'View duplicates'}</span>
            </button>
          </div>
        )}

        {isPartialDuplicates && (
          <div className={styles['duplicate-partial-banner']} data-testid="duplicate-partial-banner">
            <div className={styles['duplicate-banner-content']}>
              <AlertTriangle size={18} className={styles['duplicate-banner-icon']} />
              <span>
                {(
                  t.duplicateImportPartialBanner ||
                  '{duplicateCount} duplicate transactions detected and will be skipped. {newCount} new transactions will be imported.'
                )
                  .replace('{duplicateCount}', String(duplicateStats.duplicateCount))
                  .replace('{newCount}', String(duplicateStats.newCount))}
              </span>
            </div>
            <button
              type="button"
              className={styles['duplicate-banner-action-btn']}
              onClick={() => onOpenPreview('duplicates')}
              data-testid="view-duplicates-button"
              title={t.viewDuplicates || 'View duplicates'}
            >
              <AlertTriangle size={13} aria-hidden="true" />
              <span>{t.viewDuplicates || 'View duplicates'}</span>
            </button>
          </div>
        )}

        {!isSubmitted && !isAllDuplicates && discardedSpaceCount > 0 && (
          <div
            className={`${styles['transfer-info-banner']} ${styles['space-transfers-banner']}`}
            data-testid="space-transfers-banner"
            role="button"
            tabIndex={0}
            onClick={() => onOpenPreview('space-transfers')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpenPreview('space-transfers')
              }
            }}
            title={t.viewExcludedSpaceTransfers || 'View excluded'}
          >
            <div className={styles['transfer-info-content']}>
              <Layers size={16} className={styles['space-transfers-banner-icon']} aria-hidden="true" />
              <span>
                {discardedSpaceCount === 1
                  ? t.spaceTransfersExcludedSingular
                  : t.spaceTransfersExcluded.replace('{count}', String(discardedSpaceCount))}
              </span>
            </div>
            <button
              type="button"
              className={`${styles['banner-action-btn']} ${styles['space-banner-action-btn']}`}
              onClick={(e) => {
                e.stopPropagation()
                onOpenPreview('space-transfers')
              }}
              data-testid="view-space-transfers-button"
              title={t.viewExcludedSpaceTransfers || 'View excluded'}
            >
              <Layers size={13} aria-hidden="true" />
              <span>{t.viewExcludedSpaceTransfers || 'View excluded'}</span>
            </button>
          </div>
        )}

        {!isSubmitted &&
          !isAllDuplicates &&
          (internalTransferStats.count > 0 ||
            internalTransferStats.existingAccountTransfers.length > 0) && (
            <div
              className={styles['transfer-info-banner']}
              data-testid="internal-transfers-banner"
              role="button"
              tabIndex={0}
              onClick={() => onOpenPreview('internal-transfers')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpenPreview('internal-transfers')
                }
              }}
              title={t.viewInternalTransfers || 'View transfers'}
            >
              <div className={styles['transfer-info-content']}>
                <Ghost size={16} className={styles['transfer-info-icon']} />
                <span>
                  {internalTransferStats.existingAccountTransfers.length > 0
                    ? (
                        t.internalTransfersWithExistingDetected ||
                        '{count} internal transfer(s) detected • {existingCount} already imported transaction(s) will also be excluded.'
                      )
                        .replace('{count}', String(internalTransferStats.count))
                        .replace(
                          '{existingCount}',
                          String(internalTransferStats.existingAccountTransfers.length),
                        )
                    : internalTransferStats.count === 1
                      ? t.internalTransfersDetectedSingular ||
                        '1 internal transfer with your other accounts detected.'
                      : (
                          t.internalTransfersDetected ||
                          '{count} internal transfers with your other accounts detected.'
                        ).replace('{count}', String(internalTransferStats.count))}
                </span>
              </div>
              <button
                type="button"
                className={styles['banner-action-btn']}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenPreview('internal-transfers')
                }}
                data-testid="view-internal-transfers-button"
                title={t.viewInternalTransfers || 'View transfers'}
              >
                <Ghost size={13} aria-hidden="true" />
                <span>{t.viewInternalTransfers || 'View transfers'}</span>
              </button>
            </div>
          )}

        <div className={styles['action-buttons-container']}>
          <button
            className={`secondary-button ${styles['no-margin-top']}`}
            onClick={() => onOpenPreview('all')}
          >
            {t.reviewTransactions}
          </button>

          <button
            className={`primary-button ${styles['no-margin-top']} ${
              isDuplicateFlow ? styles['button-warning-orange'] : styles['button-clean-green']
            }`}
            onClick={onConfirmImport}
            id="confirm-import"
            disabled={
              loading ||
              transactions.length === 0 ||
              (isAllDuplicates && unlockedDuplicateIds.size === 0)
            }
            title={
              isAllDuplicates && unlockedDuplicateIds.size === 0
                ? t.allTransactionsAlreadyImported
                : isPartialDuplicates
                  ? t.importNewTransactions.replace('{count}', String(duplicateStats.newCount))
                  : t.confirmImport
            }
          >
            <CheckCircle2 size={18} />
            {isAllDuplicates && unlockedDuplicateIds.size === 0
              ? t.allTransactionsAlreadyImported
              : isPartialDuplicates
                ? t.importNewTransactions.replace('{count}', String(duplicateStats.newCount))
                : t.confirmImport}
          </button>
        </div>
      </motion.div>
    )
  },
)

ImportPreviewSection.displayName = 'ImportPreviewSection'
