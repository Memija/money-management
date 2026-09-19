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
  onConfirmUnlock: (transaction: Transaction) => void
  formatCurrency?: (amount: number) => string
  formatDate?: (date: string) => string
}

export const UnlockDuplicateModal: React.FC<UnlockDuplicateModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onConfirmUnlock,
  formatCurrency = (amt) => String(amt),
  formatDate = (date) => date,
}) => {
  const t = useLanguageStore((s) => s.t)

  if (!transaction) return null

  const handleConfirm = () => {
    onConfirmUnlock(transaction)
    onClose()
  }

  const isIncome = transaction.type === 'income' || transaction.amount > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.unlockDuplicateTitle || 'Unlock Duplicate Transaction'}
      maxWidth="480px"
      footer={
        <>
          <button
            type="button"
            className={`secondary-button ${styles.cancelButton}`}
            onClick={onClose}
            title={t.duplicateImportCancel || 'Cancel'}
            aria-label={t.duplicateImportCancel || 'Cancel'}
          >
            {t.duplicateImportCancel || 'Cancel'}
          </button>
          <button
            type="button"
            className={`primary-button ${styles.unlockButton}`}
            onClick={handleConfirm}
            id="confirm-unlock-duplicate-btn"
            data-testid="confirm-unlock-duplicate-btn"
            title={t.unlockDuplicateConfirm || 'Unlock & Edit'}
            aria-label={t.unlockDuplicateConfirm || 'Unlock & Edit'}
          >
            <Unlock size={15} aria-hidden="true" />
            <span>{t.unlockDuplicateConfirm || 'Unlock & Edit'}</span>
          </button>
        </>
      }
    >
      <div className={styles.contentContainer}>
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
      </div>
    </Modal>
  )
}
