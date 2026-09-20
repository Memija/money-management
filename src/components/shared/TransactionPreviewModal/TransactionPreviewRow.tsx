import React from 'react'
import { Ghost, Layers, Lock, Minus, Plus, RotateCcw, Trash2, Unlock } from 'lucide-react'

import type { TranslationStrings } from '../../../i18n/types'
import type { CustomCategory, Transaction } from '../../../types'
import { getCategoryColor } from '../../../utils/category-colors'
import { getCategoryIcon } from '../../../utils/category-icons'
import { getCategoryLabel } from '../../../utils/category-utils'
import { DatePicker } from '../DatePicker'

import styles from './TransactionPreviewModal.module.css'

export interface TransactionPreviewRowProps {
  index: number
  tx: Transaction
  isDuplicate: boolean
  isUnlockedDuplicate?: boolean
  isModified?: boolean
  hideDuplicateBadge?: boolean
  isInternalTransfer: boolean
  isSpaceTransfer: boolean
  isManuallyIncludedSpaceTransfer?: boolean
  showInstitution?: boolean
  customCategories: CustomCategory[]
  t: TranslationStrings
  locale: string
  formatCurrency: (amount: number) => string
  formatDate: (date: string) => string
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void
  onRemoveTransaction?: (id: string) => void
  onResetTransaction?: (id: string) => void
  onToggleSpaceTransferInclude?: (tx: Transaction) => void
  onUnlockDuplicate?: (tx: Transaction) => void
  onRelockDuplicate?: (tx: Transaction) => void
}

export const TransactionPreviewRow: React.FC<TransactionPreviewRowProps> = ({
  index,
  tx,
  isDuplicate,
  isUnlockedDuplicate = false,
  isModified = false,
  hideDuplicateBadge = false,
  isInternalTransfer,
  isSpaceTransfer,
  isManuallyIncludedSpaceTransfer,
  showInstitution = false,
  customCategories,
  t,
  locale,
  formatCurrency,
  formatDate,
  onUpdateTransaction,
  onRemoveTransaction,
  onResetTransaction,
  onToggleSpaceTransferInclude,
  onUnlockDuplicate,
  onRelockDuplicate,
}) => {
  // When a transaction is marked as a duplicate, do not mark it as anything else
  // If it was explicitly unlocked by the user, it is no longer an effective duplicate
  const effectiveIsDuplicate = isDuplicate && !isUnlockedDuplicate
  const effectiveIsInternalTransfer = !effectiveIsDuplicate && isInternalTransfer
  const effectiveIsSpaceTransfer = !effectiveIsDuplicate && isSpaceTransfer
  const effectiveIsManuallyIncludedSpaceTransfer =
    !effectiveIsDuplicate && isManuallyIncludedSpaceTransfer

  const isEditable = Boolean(
    onUpdateTransaction &&
    !effectiveIsDuplicate &&
    !effectiveIsInternalTransfer &&
    (!effectiveIsSpaceTransfer || effectiveIsManuallyIncludedSpaceTransfer),
  )
  const categoryColor = getCategoryColor(tx.category || 'Other', customCategories)
  const isTxIncome = tx.type === 'income'

  return (
    <div
      className={`${styles['tx-row']} ${index % 2 === 0 ? styles['tx-row-even'] : ''
        } ${effectiveIsSpaceTransfer ? styles['tx-row-space-transfer'] : ''}`}
      data-testid={`preview-tx-row-${tx.id}`}
    >
      <div className={styles['row-main']}>
        <div
          className={styles['icon-avatar']}
          style={{ '--cat-color': categoryColor } as React.CSSProperties}
          aria-hidden="true"
        >
          {getCategoryIcon(tx.category || 'Other', 18, customCategories, tx.description)}
        </div>

        <div className={styles['row-text']}>
          {isEditable ? (
            <input
              id={`tx-desc-${tx.id}`}
              name={`tx-desc-${tx.id}`}
              type="text"
              aria-label={t.description || 'Description'}
              className={styles['inline-input-desc']}
              value={tx.description}
              onChange={(e) => onUpdateTransaction?.(tx.id, { description: e.target.value })}
              title={tx.description}
            />
          ) : (
            <p className={styles['row-description']} title={tx.description}>
              {tx.description}
            </p>
          )}

          <div className={styles['row-meta']}>
            {showInstitution && tx.institution && <span>{tx.institution}</span>}
            {showInstitution && tx.institution && tx.category && <span>•</span>}
            {tx.category && (
              <span>{getCategoryLabel(tx.category, t, locale, customCategories)}</span>
            )}
            {effectiveIsDuplicate && !hideDuplicateBadge && (
              <span className={styles['duplicate-pill']}>{t.duplicate || 'Duplicate'}</span>
            )}
            {effectiveIsInternalTransfer && (
              <span className={styles['internal-transfer-pill']}>
                <Ghost size={11} aria-hidden="true" />
                {t.internalTransfer || 'Internal Transfer'}
              </span>
            )}
            {effectiveIsSpaceTransfer && (
              <span
                className={styles['space-transfer-pill']}
                data-testid={`space-transfer-badge-${tx.id}`}
              >
                <Layers size={11} aria-hidden="true" />
                <span>{t.spaceTransfer || 'Space Transfer'}</span>
                <span className={styles['excluded-sub-pill']}>
                  • {t.spaceTransferExcludedBadge || 'Excluded'}
                </span>
              </span>
            )}
            {effectiveIsManuallyIncludedSpaceTransfer && (
              <span
                className={`${styles['space-transfer-pill']} ${styles['space-transfer-pill-included']}`}
                data-testid={`space-transfer-included-badge-${tx.id}`}
              >
                <Layers size={11} aria-hidden="true" />
                <span>{t.spaceTransfer || 'Space Transfer'}</span>
                <span className={styles['included-sub-pill']}>
                  • {t.includeInImport || 'Included'}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles['row-date']}>
        {isEditable ? (
          <div className={styles['inline-datepicker-wrapper']}>
            <DatePicker
              value={tx.date}
              clearable={false}
              onChange={(date) => onUpdateTransaction?.(tx.id, { date })}
            />
          </div>
        ) : (
          <span>{formatDate(tx.date)}</span>
        )}
      </div>

      <div
        className={`${styles['row-amount']} ${isTxIncome ? styles['amount-positive'] : styles['amount-negative']
          }`}
      >
        {isEditable ? (
          <input
            id={`tx-amount-${tx.id}`}
            name={`tx-amount-${tx.id}`}
            type="number"
            step="0.01"
            aria-label={t.amount || 'Amount'}
            className={styles['inline-input-amount']}
            value={tx.amount === 0 ? '' : tx.amount}
            onChange={(e) => {
              const val = e.target.value
              const num = val === '' ? 0 : parseFloat(val)
              onUpdateTransaction?.(tx.id, {
                amount: isNaN(num) ? 0 : num,
                type: (isNaN(num) ? 0 : num) >= 0 ? 'income' : 'expense',
              })
            }}
            title={formatCurrency(tx.amount)}
          />
        ) : (
          <span title={`${isTxIncome ? '+' : ''}${formatCurrency(tx.amount)}`}>
            {isTxIncome ? '+' : ''}
            {formatCurrency(tx.amount)}
          </span>
        )}
      </div>

      {Boolean(
        onRemoveTransaction ||
        onToggleSpaceTransferInclude ||
        onUnlockDuplicate ||
        onRelockDuplicate ||
        onResetTransaction,
      ) && (
          <div className={styles['row-actions']}>
            {effectiveIsDuplicate && onUnlockDuplicate && (
              <button
                type="button"
                className={styles['unlock-duplicate-btn']}
                onClick={() => onUnlockDuplicate(tx)}
                aria-label={t.unlockDuplicate || 'Unlock'}
                title={t.unlockDuplicate || 'Unlock'}
                data-testid={`unlock-duplicate-btn-${tx.id}`}
              >
                <Lock size={15} aria-hidden="true" />
              </button>
            )}

            {isModified && onResetTransaction ? (
              <button
                type="button"
                className={styles['reset-tx-btn']}
                onClick={() => onResetTransaction(tx.id)}
                aria-label={t.resetToOriginal || 'Reset to original values'}
                title={t.resetToOriginal || 'Reset to original values'}
                data-testid={`reset-tx-btn-${tx.id}`}
              >
                <RotateCcw size={14} aria-hidden="true" />
              </button>
            ) : isUnlockedDuplicate && onRelockDuplicate ? (
              <button
                type="button"
                className={`${styles['relock-duplicate-btn']} ${
                  isModified ? styles['relock-duplicate-btn-disabled'] : ''
                }`}
                onClick={isModified ? undefined : () => onRelockDuplicate(tx)}
                disabled={isModified}
                aria-disabled={isModified}
                aria-label={
                  isModified
                    ? t.cannotRelockModified ||
                      'Cannot relock modified transaction. Reset to original values to relock.'
                    : t.relockDuplicate || 'Lock'
                }
                title={
                  isModified
                    ? t.cannotRelockModified ||
                      'Cannot relock modified transaction. Reset to original values to relock.'
                    : t.relockDuplicate || 'Lock'
                }
                data-testid={`relock-duplicate-btn-${tx.id}`}
              >
                <Unlock size={15} aria-hidden="true" />
              </button>
            ) : null}

            {effectiveIsSpaceTransfer && onToggleSpaceTransferInclude && (
              <button
                type="button"
                className={styles['include-space-btn']}
                onClick={() => onToggleSpaceTransferInclude(tx)}
                aria-label={t.includeInImport || 'Include in import'}
                title={t.includeInImport || 'Include in import'}
                data-testid={`include-space-btn-${tx.id}`}
              >
                <Plus size={13} aria-hidden="true" />
                <span>{t.include || 'Include'}</span>
              </button>
            )}

            {effectiveIsManuallyIncludedSpaceTransfer && onToggleSpaceTransferInclude && (
              <button
                type="button"
                className={styles['exclude-space-btn']}
                onClick={() => onToggleSpaceTransferInclude(tx)}
                aria-label={t.excludeFromImport || 'Exclude from import'}
                title={t.excludeFromImport || 'Exclude from import'}
                data-testid={`exclude-space-btn-${tx.id}`}
              >
                <Minus size={13} aria-hidden="true" />
                <span>{t.exclude || 'Exclude'}</span>
              </button>
            )}

            {onRemoveTransaction &&
              !isDuplicate &&
              !effectiveIsInternalTransfer &&
              !effectiveIsSpaceTransfer && (
                <button
                  className={styles['remove-button']}
                  onClick={() => onRemoveTransaction(tx.id)}
                  aria-label={t.removeTransaction}
                  title={t.removeTransaction}
                >
                  <Trash2 size={15} />
                </button>
              )}
          </div>
        )}
    </div>
  )
}
