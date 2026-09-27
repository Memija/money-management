import React from 'react'
import { AlertCircle, FolderArchive } from 'lucide-react'

import { useBackupRestore } from '../../../hooks/useBackupRestore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { RestoreBackupModal } from '../RestoreBackupModal'

import styles from './RestoreBackupPrompt.module.css'

export interface RestoreBackupPromptProps {
  className?: string
  buttonLabel?: string
  idPrefix?: string
  showDivider?: boolean
}

export const RestoreBackupPrompt: React.FC<RestoreBackupPromptProps> = ({
  className,
  buttonLabel,
  idPrefix = 'restore',
  showDivider = true,
}) => {
  const t = useLanguageStore((s) => s.t)
  const {
    fileInputRef,
    feedback,
    pendingRestore,
    isRestoring,
    triggerFilePicker,
    handleFileChange,
    confirmRestore,
    cancelRestore,
  } = useBackupRestore()

  const resolvedLabel = buttonLabel || t.restoreFromBackup || 'Restore from backup'

  return (
    <div className={`${styles.container} ${className || ''}`} data-testid={`${idPrefix}-prompt-container`}>
      {showDivider && (
        <div className={styles.divider} role="separator" aria-label="Divider">
          <span>{t.orDivider || 'or'}</span>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className={styles.hiddenFileInput}
        id={`${idPrefix}-restore-file-input`}
        data-testid={`${idPrefix}-restore-file-input`}
        aria-label={resolvedLabel}
      />

      <button
        type="button"
        className={styles.restoreButton}
        onClick={triggerFilePicker}
        id={`${idPrefix}-restore-button`}
        data-testid={`${idPrefix}-restore-button`}
        aria-label={resolvedLabel}
      >
        <FolderArchive size={17} className={styles.restoreIcon} aria-hidden="true" />
        <span>{resolvedLabel}</span>
      </button>

      {feedback && feedback.type === 'error' && (
        <div
          className={styles.errorBanner}
          role="alert"
          data-testid={`${idPrefix}-restore-error`}
        >
          <AlertCircle size={16} className={styles.errorIcon} aria-hidden="true" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      <RestoreBackupModal
        isOpen={Boolean(pendingRestore)}
        onClose={cancelRestore}
        onConfirm={confirmRestore}
        pendingRestore={pendingRestore}
        isRestoring={isRestoring}
      />
    </div>
  )
}
