import React from 'react'
import { Ghost, Layers, Lock, RotateCcw, Trash2, Unlock } from 'lucide-react'

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
  isAlreadyDuplicated?: boolean
  isUnlockedDuplicate?: boolean
  isModified?: boolean
  hideDuplicateBadge?: boolean
  isInternalTransfer: boolean
  isSpaceTransfer: boolean
  showInstitution?: boolean
  customCategories: CustomCategory[]
  t: TranslationStrings
  locale: string
  formatCurrency: (amount: number) => string
  formatDate: (date: string) => string
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void
  onRemoveTransaction?: (id: string) => void
  onResetTransaction?: (id: string) => void
  onUnlockDuplicate?: (tx: Transaction) => void
  onRelockDuplicate?: (tx: Transaction) => void
  hasActions?: boolean
}

export const TransactionPreviewRow: React.FC<TransactionPreviewRowProps> = ({
  index,
  tx,
  isDuplicate,
  isAlreadyDuplicated = false,
  isUnlockedDuplicate = false,
  isModified = false,
  hideDuplicateBadge = false,
  isInternalTransfer,
  isSpaceTransfer,
  showInstitution = false,
  customCategories,
  t,
  locale,
  formatCurrency,
  formatDate,
  onUpdateTransaction,
  onRemoveTransaction,
  onResetTransaction,
  onUnlockDuplicate,
  onRelockDuplicate,
  hasActions = Boolean(
    onRemoveTransaction ||
      onUnlockDuplicate ||
      onRelockDuplicate ||
      onResetTransaction,
  ),
}) => {
  // When a transaction is marked as a duplicate, do not mark it as anything else
  // If it was explicitly unlocked by the user, it is no longer an effective duplicate
  const effectiveIsDuplicate = isDuplicate && !isUnlockedDuplicate
  const effectiveIsInternalTransfer = !effectiveIsDuplicate && isInternalTransfer
  const effectiveIsSpaceTransfer = !effectiveIsDuplicate && isSpaceTransfer

  const isEditable = Boolean(
    onUpdateTransaction &&
    !effectiveIsDuplicate &&
    !effectiveIsInternalTransfer &&
    !effectiveIsSpaceTransfer,
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
              isAlreadyDuplicated ? (
                <span
                  className={`${styles['duplicate-pill']} ${styles['already-duplicated-pill']}`}
                  data-testid={`preview-duplicate-badge-${tx.id}`}
                >
                  {t.alreadyDuplicated || t.duplicate || 'Duplicate'}
                </span>
              ) : isModified ? (
                <span className={styles['modified-pill']} data-testid={`preview-modified-badge-${tx.id}`}>
                  {t.modified || 'Modified'}
                </span>
              ) : (
                <span className={styles['duplicate-pill']} data-testid={`preview-duplicate-badge-${tx.id}`}>
                  {t.duplicate || 'Duplicate'}
                </span>
              )
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
                <span>{t.spaceTransfer || 'Sub-account'}</span>
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

      {hasActions && (
        <div className={styles['row-actions']}>
            {effectiveIsDuplicate && (onUnlockDuplicate || isAlreadyDuplicated) && (
              isAlreadyDuplicated ? (
                <button
                  type="button"
                  className={`${styles['unlock-duplicate-btn']} ${styles['unlock-duplicate-btn-disabled']}`}
                  disabled={true}
                  aria-disabled="true"
                  aria-label={t.alreadyDuplicatedNotice || 'This duplicate was already imported and cannot be unlocked again.'}
                  title={t.alreadyDuplicatedNotice || 'This duplicate was already imported and cannot be unlocked again.'}
                  data-testid={`already-duplicated-lock-${tx.id}`}
                >
                  <Lock size={15} aria-hidden="true" />
                </button>
              ) : onUnlockDuplicate ? (
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
              ) : null
            )}

            {!isAlreadyDuplicated && isModified && onResetTransaction ? (
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
            ) : !isAlreadyDuplicated && isUnlockedDuplicate && onRelockDuplicate ? (
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
