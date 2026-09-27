import React from 'react'
import { AlertCircle, CheckCircle2, Download, FileJson, Upload } from 'lucide-react'

import { useBackupRestore } from '../../../hooks/useBackupRestore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { RestoreBackupModal } from '../../shared/RestoreBackupModal'

import styles from './BackupRestore.module.css'

export interface BackupRestoreProps {
  className?: string
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ className }) => {
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
    exportBackup,
  } = useBackupRestore()

  return (
    <div className={`${styles.container} ${className || ''}`} data-testid="backup-restore-section">
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <FileJson size={22} className={styles.titleIcon} aria-hidden="true" />
          <h3 className={styles.title}>{t.backupRestoreTitle || 'Backup & Restore'}</h3>
        </div>
      </div>

      <p className={styles.description}>
        {t.backupRestoreDesc ||
          'Save a secure backup copy of your financial data or restore a previous backup.'}
      </p>

      {feedback && (
        <div
          className={`${styles.feedbackBanner} ${
            feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError
          }`}
          role="status"
          data-testid={`backup-feedback-${feedback.type}`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={16} className={styles.feedbackIcon} aria-hidden="true" />
          ) : (
            <AlertCircle size={16} className={styles.feedbackIcon} aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className={styles.cardsGrid}>
        {/* Export Card */}
        <div className={styles.actionCard} data-testid="export-backup-card">
          <div className={styles.cardHeader}>
            <div className={styles.cardIconWrapper}>
              <Download size={20} className={styles.cardIcon} aria-hidden="true" />
            </div>
            <div className={styles.cardInfo}>
              <h4 className={styles.cardTitle}>{t.exportBackup || 'Export Backup'}</h4>
              <p className={styles.cardSubtitle}>
                {t.exportBackupDesc ||
                  'Download all your accounts, transactions, categories, and custom rules as a JSON file.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={`primary-button ${styles.actionButton}`}
            onClick={exportBackup}
            data-testid="export-backup-button"
            aria-label={t.exportBackupButton || 'Export Backup (.json)'}
          >
            <Download size={16} aria-hidden="true" />
            <span>{t.exportBackupButton || 'Export Backup (.json)'}</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className={styles.actionCard} data-testid="restore-backup-card">
          <div className={styles.cardHeader}>
            <div className={styles.cardIconWrapper}>
              <Upload size={20} className={styles.cardIcon} aria-hidden="true" />
            </div>
            <div className={styles.cardInfo}>
              <h4 className={styles.cardTitle}>{t.restoreBackup || 'Restore Backup'}</h4>
              <p className={styles.cardSubtitle}>
                {t.restoreBackupDesc ||
                  'Load a previously saved Saldio backup JSON file into this browser.'}
              </p>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className={styles.hiddenFileInput}
            data-testid="restore-file-input"
            aria-label={t.restoreBackupButton || 'Restore Backup'}
          />
          <button
            type="button"
            className={`secondary-button ${styles.actionButton}`}
            onClick={triggerFilePicker}
            data-testid="restore-backup-button"
            aria-label={t.restoreBackupButton || 'Restore Backup'}
          >
            <Upload size={16} aria-hidden="true" />
            <span>{t.restoreBackupButton || 'Restore Backup'}</span>
          </button>
        </div>
      </div>

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
