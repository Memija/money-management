import React from 'react'
import { Check, CopyCheck, RotateCcw, Sliders, X } from 'lucide-react'

import type { TranslationStrings } from '../../../i18n/types'
import type { Transaction } from '../../../types'

import styles from './BulkApplyBanner.module.css'

export interface BulkApplyBannerProps {
  bulkApplyOffer: {
    sourceTxId: string
    originalDescription: string
    updates: Partial<Transaction>
    unlockedTargetIds: string[]
    identicalTargetIds: string[]
  }
  modifiedCount: number
  onApplyToAllUnlocked: () => void
  onConfirmBulkApply: () => void
  onOpenAdjustModal: () => void
  onResetAll: (sourceTxId: string) => void
  onDismiss: () => void
  t: TranslationStrings
}

export const BulkApplyBanner: React.FC<BulkApplyBannerProps> = ({
  bulkApplyOffer,
  modifiedCount,
  onApplyToAllUnlocked,
  onConfirmBulkApply,
  onOpenAdjustModal,
  onResetAll,
  onDismiss,
  t,
}) => {
  if (
    bulkApplyOffer.unlockedTargetIds.length === 0 &&
    bulkApplyOffer.identicalTargetIds.length === 0
  ) {
    return null
  }

  const isUnlockedTarget = bulkApplyOffer.unlockedTargetIds.length > 0

  return (
    <div className={styles['bulk-apply-banner']} data-testid="bulk-apply-banner">
      <div className={styles['bulk-apply-info']}>
        <CopyCheck size={18} className={styles['bulk-apply-icon']} aria-hidden="true" />
        <span>
          {isUnlockedTarget
            ? bulkApplyOffer.unlockedTargetIds.length === 1
              ? t.bulkApplyUnlockedOfferSingular ||
                'Apply changes to 1 other unlocked transaction?'
              : (
                  t.bulkApplyUnlockedOffer ||
                  'Apply changes to {count} other unlocked transactions?'
                ).replace('{count}', String(bulkApplyOffer.unlockedTargetIds.length))
            : (
                t.bulkApplyOffer ||
                'Apply this change to {count} other identical transaction(s)?'
              ).replace('{count}', String(bulkApplyOffer.identicalTargetIds.length))}
        </span>
      </div>
      <div className={styles['bulk-apply-actions']}>
        {isUnlockedTarget ? (
          <button
            type="button"
            className={styles['bulk-apply-btn']}
            onClick={onApplyToAllUnlocked}
            data-testid="apply-to-all-unlocked-btn"
            title={t.applyToAllUnlocked || 'Apply to all unlocked'}
            aria-label={t.applyToAllUnlocked || 'Apply to all unlocked'}
          >
            <Check size={14} aria-hidden="true" />
            <span>{t.applyToAllUnlocked || 'Apply to all unlocked'}</span>
          </button>
        ) : (
          <button
            type="button"
            className={styles['bulk-apply-btn']}
            onClick={onConfirmBulkApply}
            data-testid="apply-bulk-changes-btn"
            title={t.applyToAll || 'Apply to all'}
            aria-label={t.applyToAll || 'Apply to all'}
          >
            <Check size={14} aria-hidden="true" />
            <span>{t.applyToAll || 'Apply to all'}</span>
          </button>
        )}
        <button
          type="button"
          className={styles['bulk-adjust-btn']}
          onClick={onOpenAdjustModal}
          data-testid="adjust-unlocked-bulk-btn"
          title={t.adjustUnlockedOptions || 'Adjust in bulk...'}
          aria-label={t.adjustUnlockedOptions || 'Adjust in bulk...'}
        >
          <Sliders size={13} aria-hidden="true" />
          <span>{t.adjustUnlockedOptions || 'Adjust in bulk...'}</span>
        </button>
        {modifiedCount > 1 && (
          <button
            type="button"
            className={styles['bulk-reset-all-btn']}
            onClick={() => onResetAll(bulkApplyOffer.sourceTxId)}
            data-testid="bulk-reset-all-banner-btn"
            title={t.resetAllModified || 'Reset all modified transactions'}
            aria-label={(t.resetAllModifiedCount || 'Reset all ({count}) in bulk').replace(
              '{count}',
              String(modifiedCount),
            )}
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>
              {(t.resetAllModifiedCount || 'Reset all ({count}) in bulk').replace(
                '{count}',
                String(modifiedCount),
              )}
            </span>
          </button>
        )}
        <button
          type="button"
          className={styles['bulk-apply-dismiss-btn']}
          onClick={onDismiss}
          aria-label={t.dismiss || 'Dismiss'}
          title={t.dismiss || 'Dismiss'}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
