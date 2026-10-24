import React from 'react'
import { Lock, RotateCcw } from 'lucide-react'

import type { TranslationStrings } from '../../../i18n/types'
import type { Transaction } from '../../../types'
import { Modal } from '../Modal'

import styles from './ResetTransactionsModal.module.css'

export interface ResetTransactionsModalProps {
  isOpen: boolean
  pendingResetTxId: string | null
  onClose: () => void
  activeTransactions: Transaction[]
  modifiedTransactions: Transaction[]
  effectiveUnlockedIds: Set<string>
  alsoLockAsDuplicate: boolean
  setAlsoLockAsDuplicate: React.Dispatch<React.SetStateAction<boolean>>
  onConfirmResetSingle: (id: string, alsoLock: boolean) => void
  onConfirmResetAll: (alsoLock: boolean) => void
  formatCurrency: (amount: number) => string
  t: TranslationStrings
}

export const ResetTransactionsModal: React.FC<ResetTransactionsModalProps> = ({
  isOpen,
  pendingResetTxId,
  onClose,
  activeTransactions,
  modifiedTransactions,
  effectiveUnlockedIds,
  alsoLockAsDuplicate,
  setAlsoLockAsDuplicate,
  onConfirmResetSingle,
  onConfirmResetAll,
  formatCurrency,
  t,
}) => {
  if (!pendingResetTxId) {
    return null
  }

  const targetTx = activeTransactions.find((t) => t.id === pendingResetTxId)
  const isTargetUnlockedDuplicate = effectiveUnlockedIds.has(pendingResetTxId)
  const hasAnyUnlockedDuplicates = modifiedTransactions.some((t) => effectiveUnlockedIds.has(t.id))
  const showLockCheckbox = isTargetUnlockedDuplicate || hasAnyUnlockedDuplicates

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.resetTransactionModalTitle || 'Reset Transactions'}
      maxWidth="540px"
      footer={
        <div className={styles['reset-modal-footer']}>
          <button
            type="button"
            className={`${styles['reset-dialog-btn']} ${styles['reset-cancel-btn']}`}
            onClick={onClose}
            data-testid="cancel-reset-modal-btn"
          >
            {t.cancel || 'Cancel'}
          </button>
          <button
            type="button"
            className={`${styles['reset-dialog-btn']} ${styles['reset-single-btn']}`}
            onClick={() => {
              onConfirmResetSingle(pendingResetTxId, alsoLockAsDuplicate)
              onClose()
            }}
            data-testid="confirm-reset-single-btn"
          >
            {alsoLockAsDuplicate && effectiveUnlockedIds.has(pendingResetTxId)
              ? t.resetAndLockSingle || 'Reset and lock'
              : modifiedTransactions.length > 1
                ? t.resetOnlyThis || 'Reset only this'
                : t.resetToOriginal || 'Reset'}
          </button>
          {modifiedTransactions.length > 1 && (
            <button
              type="button"
              className={`${styles['reset-dialog-btn']} ${styles['reset-all-btn']}`}
              onClick={() => {
                onConfirmResetAll(alsoLockAsDuplicate)
                onClose()
              }}
              data-testid="confirm-reset-all-btn"
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>
                {alsoLockAsDuplicate &&
                modifiedTransactions.some((t) => effectiveUnlockedIds.has(t.id))
                  ? (t.resetAndLockBulkCount || 'Reset and lock all ({count})').replace(
                      '{count}',
                      String(modifiedTransactions.length),
                    )
                  : (t.resetAllModifiedCount || 'Reset all ({count}) in bulk').replace(
                      '{count}',
                      String(modifiedTransactions.length),
                    )}
              </span>
            </button>
          )}
        </div>
      }
    >
      <div className={styles['reset-modal-body']}>
        <div className={styles['reset-modal-icon-wrap']}>
          <RotateCcw size={22} aria-hidden="true" />
        </div>
        <div className={styles['reset-modal-text']}>
          <p className={styles['reset-modal-message']}>
            {modifiedTransactions.length > 1
              ? (
                  t.resetBulkPrompt ||
                  'You have modified {count} transactions. Would you like to reset only this transaction or reset all modified transactions in bulk back to their original values?'
                ).replace('{count}', String(modifiedTransactions.length))
              : t.resetSinglePrompt ||
                'Are you sure you want to reset this transaction back to its original values?'}
          </p>
          {targetTx && (
            <div className={styles['reset-modal-tx-preview']}>
              <span className={styles['reset-modal-tx-desc']} title={targetTx.description}>
                {targetTx.description}
              </span>
              <span className={styles['reset-modal-tx-amount']}>
                {formatCurrency(targetTx.amount)}
              </span>
            </div>
          )}
          {showLockCheckbox && (
            <label
              className={styles['reset-lock-checkbox-label']}
              data-testid="reset-also-lock-checkbox-label"
            >
              <input
                type="checkbox"
                className={styles['reset-lock-checkbox']}
                checked={alsoLockAsDuplicate}
                onChange={(e) => setAlsoLockAsDuplicate(e.target.checked)}
                data-testid="reset-also-lock-checkbox"
              />
              <Lock size={14} className={styles['reset-lock-icon']} aria-hidden="true" />
              <span className={styles['reset-lock-checkbox-text']}>
                {t.alsoLockAsDuplicate || 'Also lock as duplicate'}
              </span>
            </label>
          )}
        </div>
      </div>
    </Modal>
  )
}
