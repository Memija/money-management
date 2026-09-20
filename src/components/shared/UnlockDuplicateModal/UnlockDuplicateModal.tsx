import React from 'react'
import { AlertTriangle, Unlock } from 'lucide-react'

import { useLanguageStore } from '../../../store/useLanguageStore'
import type { Transaction } from '../../../types'
import { Modal } from '../Modal'

import styles from './UnlockDuplicateModal.module.css'

export interface UnlockDuplicateModalProps {
  isOpen: boolean
  transaction: Transaction | null
  onClose: () => void
  onConfirmUnlock: (
    transaction: Transaction,
    rememberRule?: boolean,
    unlockAllIdentical?: boolean,
  ) => void
  sameDuplicateCount?: number
  formatCurrency?: (amount: number) => string
  formatDate?: (date: string) => string
}

export const UnlockDuplicateModal: React.FC<UnlockDuplicateModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onConfirmUnlock,
  sameDuplicateCount = 0,
  formatCurrency = (amt) => String(amt),
  formatDate = (date) => date,
}) => {
  const t = useLanguageStore((s) => s.t)
  const [rememberRule, setRememberRule] = React.useState(true)

  if (!transaction) return null

  const handleConfirm = (unlockAll = false) => {
    if (unlockAll) {
      onConfirmUnlock(transaction, rememberRule, true)
    } else {
      onConfirmUnlock(transaction, rememberRule)
    }
    onClose()
  }

  const isIncome = transaction.type === 'income' || transaction.amount > 0
  const hasMultipleIdentical = Boolean(sameDuplicateCount && sameDuplicateCount > 1)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.unlockDuplicateTitle || 'Unlock Duplicate Transaction'}
      maxWidth="480px"
      footer={
        <div className={styles.modalFooterActions}>
          <button
            type="button"
            className={`secondary-button ${styles.cancelButton}`}
            onClick={onClose}
            title={t.duplicateImportCancel || 'Cancel'}
            aria-label={t.duplicateImportCancel || 'Cancel'}
          >
            {t.duplicateImportCancel || 'Cancel'}
          </button>
          {hasMultipleIdentical ? (
            <>
              <button
                type="button"
                className={`secondary-button ${styles.unlockSingleButton}`}
                onClick={() => handleConfirm(false)}
                id="confirm-unlock-duplicate-btn"
                data-testid="confirm-unlock-single-btn"
                title={t.unlockOnlyThis || 'Unlock only this'}
                aria-label={t.unlockOnlyThis || 'Unlock only this'}
              >
                <span>{t.unlockOnlyThis || 'Unlock only this'}</span>
              </button>
              <button
                type="button"
                className={styles.unlockButton}
                onClick={() => handleConfirm(true)}
                id="confirm-unlock-all-btn"
                data-testid="confirm-unlock-all-btn"
                title={(t.unlockAllIdenticalCount || 'Unlock all {count} identical transactions').replace(
                  '{count}',
                  String(sameDuplicateCount),
                )}
                aria-label={(t.unlockAllIdenticalCount || 'Unlock all {count} identical transactions').replace(
                  '{count}',
                  String(sameDuplicateCount),
                )}
              >
                <Unlock size={15} aria-hidden="true" />
                <span>
                  {(t.unlockAllIdenticalCount || 'Unlock all {count} identical transactions').replace(
                    '{count}',
                    String(sameDuplicateCount),
                  )}
                </span>
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.unlockButton}
              onClick={() => handleConfirm(false)}
              id="confirm-unlock-duplicate-btn"
              data-testid="confirm-unlock-duplicate-btn"
              title={t.unlockDuplicateConfirm || 'Unlock & Edit'}
              aria-label={t.unlockDuplicateConfirm || 'Unlock & Edit'}
            >
              <Unlock size={15} aria-hidden="true" />
              <span>{t.unlockDuplicateConfirm || 'Unlock & Edit'}</span>
            </button>
          )}
        </div>
      }
    >
      <div className={styles.contentContainer}>
        {hasMultipleIdentical && (
          <div className={styles.identicalNotice} data-testid="identical-duplicates-notice">
            <span>
              {(t.identicalDuplicatesDetected || 'Found {count} identical duplicate transactions.').replace(
                '{count}',
                String(sameDuplicateCount),
              )}
            </span>
          </div>
        )}
        <div className={styles.headerRow}>
          <div className={styles.iconContainer} aria-hidden="true">
            <AlertTriangle size={24} />
          </div>
          <p className={styles.messageText}>
            {t.unlockDuplicateMessage ||
              'This transaction was flagged as a duplicate of an existing record. Unlocking it will allow you to edit its details and include it in the import. Are you sure you want to unlock it?'}
          </p>
        </div>

        <div className={styles.txDetailsCard} data-testid="unlock-tx-details">
          <div className={styles.txLeft}>
            <span className={styles.txDescription} title={transaction.description}>
              {transaction.description}
            </span>
            <span className={styles.txDate}>{formatDate(transaction.date)}</span>
          </div>
          <div
            className={`${styles.txAmount} ${isIncome ? styles.amountIncome : styles.amountExpense}`}
          >
            {isIncome ? '+' : ''}
            {formatCurrency(transaction.amount)}
          </div>
        </div>

        <label
          className={styles.rememberCheckboxLabel}
          data-testid="remember-duplicate-rule-label"
          htmlFor="remember-duplicate-rule-checkbox"
        >
          <input
            type="checkbox"
            checked={rememberRule}
            onChange={(e) => setRememberRule(e.target.checked)}
            className={styles.rememberCheckbox}
            id="remember-duplicate-rule-checkbox"
            data-testid="remember-duplicate-rule-checkbox"
          />
          <span className={styles.rememberCheckboxText}>
            {t.rememberDuplicateRule || 'Remember this override for future imports'}
          </span>
        </label>
      </div>
    </Modal>
  )
}
