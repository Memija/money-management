import React from 'react'
import { RefreshCw } from 'lucide-react'

import { useLanguageStore } from '../../../store/useLanguageStore'
import type { ValidatedBackupResult } from '../../../utils/backup/backup-utils'
import { Modal } from '../Modal'

import styles from './RestoreBackupModal.module.css'

export interface RestoreBackupModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  pendingRestore: ValidatedBackupResult | null
  isRestoring?: boolean
}

export const RestoreBackupModal: React.FC<RestoreBackupModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  pendingRestore,
  isRestoring = false,
}) => {
  const t = useLanguageStore((s) => s.t)

  if (!pendingRestore) return null

  const accountsCount = pendingRestore.summary.accountsCount ?? 0
  const txCount = pendingRestore.summary.transactionsCount ?? 0

  const accountsText = (t.deleteDataAccountsCount || '{count} accounts').replace(
    '{count}',
    String(accountsCount),
  )
  const txText = (t.deleteDataTransactionsCount || '{count} transactions').replace(
    '{count}',
    String(txCount),
  )

  const confirmMessage = (
    t.restoreBackupConfirmMessage ||
    'This backup contains {accounts} and {transactions}. Restoring it will replace your current data. Are you sure you want to proceed?'
  )
    .replace('{accounts}', accountsText)
    .replace('{transactions}', txText)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.restoreBackupConfirmTitle || 'Restore Backup'}
      maxWidth="480px"
      footer={
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={`secondary-button ${styles.modalCancelButton}`}
            onClick={onClose}
            disabled={isRestoring}
          >
            {t.cancel || 'Cancel'}
          </button>
          <button
            type="button"
            className={`primary-button ${styles.modalConfirmButton}`}
            onClick={onConfirm}
            disabled={isRestoring}
            data-testid="confirm-restore-button"
          >
            {isRestoring ? (
              <>
                <RefreshCw size={14} className={styles.spinnerIcon} aria-hidden="true" />
                <span>{t.loading || 'Loading...'}</span>
              </>
            ) : (
              <span>{t.restoreBackupConfirmButton || 'Restore Data'}</span>
            )}
          </button>
        </div>
      }
    >
      <div className={styles.modalContent} data-testid="restore-backup-modal-content">
        <p className={styles.modalMessage}>{confirmMessage}</p>
        {pendingRestore.summary.exportedAt && (
          <div className={styles.exportMeta}>
            <span>Backup timestamp:</span>{' '}
            <strong>
              {new Date(pendingRestore.summary.exportedAt).toLocaleString()}
            </strong>
          </div>
        )}
      </div>
    </Modal>
  )
}
