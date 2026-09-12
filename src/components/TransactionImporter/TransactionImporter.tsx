import React, { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardPaste,
  FileSpreadsheet,
  FileType,
  Info,
  Loader2,
  Upload,
  X,
} from 'lucide-react'

import { useAppStore } from '../../store/useAppStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import type { ImportedAccount, ImportMethod } from '../../types'
import { DeleteConfirmationModal } from '../shared/DeleteConfirmationModal'
import { DuplicateImportWarningModal } from './DuplicateImportWarningModal'
import { TransactionPreviewModal } from './TransactionPreviewModal'
import { useTransactionImport } from './useTransactionImport'

import styles from './TransactionImporter.module.css'

/* ─── component ─── */
const TransactionImporter: React.FC = () => {
  const { selectedInstitution, addImportedAccount, setStep, getDuplicateTransactionStats, importedAccounts, cancelImport } = useAppStore()
  const t = useLanguageStore((s) => s.t)
  const institutionName = selectedInstitution?.name ?? 'Unknown'

  const [method, setMethod] = useState<ImportMethod | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    transactions,
    loading,
    error,
    fileName,
    pasteText,
    importFingerprint,
    setPasteText,
    setError,
    setFileName,
    handleFileChange,
    handlePaste,
    handleRemoveTransaction,
    handleUpdateTransaction,
    handleClearAll,
  } = useTransactionImport(institutionName, method, t)

  const duplicateStats = React.useMemo(() => {
    return getDuplicateTransactionStats(selectedInstitution?.id ?? 'unknown', transactions || [])
  }, [selectedInstitution?.id, transactions, getDuplicateTransactionStats])

  /* ─── import method cards ─── */
  const importMethods: { key: ImportMethod; label: string; icon: React.ReactNode; desc: string }[] =
    [
      {
        key: 'spreadsheet',
        label: t.spreadsheetFile,
        icon: <FileSpreadsheet size={24} />,
        desc: t.spreadsheetFileDesc,
      },
      {
        key: 'pdf',
        label: t.pdfStatement,
        icon: <FileType size={24} />,
        desc: t.pdfStatementDesc,
      },
      {
        key: 'paste',
        label: t.copyPaste,
        icon: <ClipboardPaste size={24} />,
        desc: t.copyPasteDesc,
      },
    ]

  /* ─── file handlers ─── */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileChange(file)
    },
    [handleFileChange],
  )

  const buildAccount = (): ImportedAccount => ({
    institutionId: selectedInstitution?.id ?? 'unknown',
    institutionName,
    transactions,
    importedAt: new Date().toISOString(),
    importedFingerprints: [importFingerprint],
  })

  const handleConfirmImport = () => {
    if (duplicateStats.duplicateCount > 0) {
      setShowDuplicateWarning(true)
      return
    }
    addImportedAccount(buildAccount())
  }

  const handleProceedDespiteDuplicate = () => {
    // addImportedAccount automatically deduplicates transactions internally
    addImportedAccount(buildAccount())
  }

  const onClearAll = useCallback(() => {
    handleClearAll()
    setShowClearConfirmation(false)
  }, [handleClearAll])

  const acceptTypes: Record<ImportMethod, string> = {
    spreadsheet: '.xlsx,.xls,.csv',
    pdf: '.pdf',
    paste: '',
  }

  /* ─── render ─── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="onboarding-container"
    >
      <div className={styles['nav-actions-wrapper']}>
        <button
          className={`back-button ${styles['back-button-clean']}`}
          onClick={() => setStep('institution')}
          id="back-to-institution"
        >
          <ArrowLeft size={18} />
          <span>{t.back}</span>
        </button>
        {(importedAccounts || []).length > 0 && (
          <button className={`back-button ${styles['back-button-clean']}`} onClick={() => cancelImport?.()} id="cancel-import">
            <ArrowLeft size={18} />
            <span>{t.cancel}</span>
          </button>
        )}
      </div>

      <div className="onboarding-header">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="onboarding-icon upload-icon"
        >
          <Upload size={32} />
        </motion.div>
        <h1 className="onboarding-title">{t.importTransactionsTitle}</h1>
        <p className="onboarding-subtitle">
          {t.importTransactionsSubtitle.replace('{institution}', institutionName)}
          <br />
          <span className="info-text">
            <Info size={14} />
            {t.importPsd2Notice}
          </span>
        </p>
      </div>

      {/* Step 1: Choose method */}
      {!method && (
        <div className={styles['import-methods-grid']}>
          {importMethods.map((m, idx) => (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={styles['import-method-card']}
              onClick={() => setMethod(m.key)}
              id={`import-method-${m.key}`}
            >
              <div className={styles['import-method-icon']}>{m.icon}</div>
              <div>
                <p className={styles['import-method-label']}>{m.label}</p>
                <p className={styles['import-method-desc']}>{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Step 2: Upload area / Paste */}
      {method && transactions.length === 0 && !loading && (
        <div className={styles['import-upload-area']}>
          <button
            className={`back-button ${styles['back-button-aligned']}`}
            onClick={() => {
              setMethod(null)
              setError(null)
              setFileName(null)
            }}
          >
            <ArrowLeft size={18} />
            <span>{t.chooseDifferentFormat}</span>
          </button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles['import-error']}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          {method !== 'paste' ? (
            <div
              className={`${styles['drop-zone']} ${dragOver ? styles['drag-over'] : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              id="drop-zone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptTypes[method]}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileChange(file)
                }}
                className={styles['hidden']}
                id="file-input"
                name="file-input"
                aria-label={t.dragDropFile}
                title={t.dragDropFile}
              />
              <Upload size={40} className={styles['drop-zone-icon']} />
              <p className={styles['drop-zone-title']}>{dragOver ? t.dropHere : t.dragDropFile}</p>
              <p className={styles['drop-zone-subtitle']}>{t.orClickToBrowse}</p>
              <p className={`${styles['drop-zone-subtitle']} ${styles['drop-zone-formats']}`}>
                {t.acceptedFormats.replace('{accepted}', acceptTypes[method])}
              </p>
              {fileName && <p className={styles['file-name-label']}>{fileName}</p>}
            </div>
          ) : (
            <div className={styles['paste-area-wrapper']}>
              <textarea
                className={styles['paste-textarea']}
                placeholder={t.pasteDataPlaceholder}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={10}
                id="paste-area"
                name="paste-area"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`primary-button ${!pasteText.trim() ? 'disabled' : ''}`}
                onClick={handlePaste}
                disabled={!pasteText.trim()}
                id="parse-paste-button"
              >
                {t.parseTransactions}
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className={styles['import-loading']}>
          <Loader2 size={32} className={styles.spinner} />
          <p>{t.processingData}</p>
        </div>
      )}

      {/* Step 3: Preview transactions */}
      {transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={styles['import-preview']}
        >
          <div className={styles['import-preview-header']}>
            <div className={styles['import-preview-info']}>
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
            <button
              className={styles['clear-button']}
              onClick={() => setShowClearConfirmation(true)}
              id="clear-import"
            >
              <X size={14} />
              {t.clear}
            </button>
          </div>

          <div className={styles['action-buttons-container']}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`secondary-button ${styles['no-margin-top']}`}
              onClick={() => setIsPreviewOpen(true)}
            >
              {t.reviewTransactions}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`primary-button ${styles['no-margin-top']}`}
              onClick={handleConfirmImport}
              id="confirm-import"
              disabled={loading || transactions.length === 0}
            >
              <CheckCircle2 size={18} />
              {t.confirmImport}
            </motion.button>
          </div>
        </motion.div>
      )}

      <TransactionPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        transactions={transactions}
        duplicateIds={new Set(duplicateStats.duplicateIds)}
        onRemoveTransaction={handleRemoveTransaction}
        onUpdateTransaction={handleUpdateTransaction}
      />

      <DeleteConfirmationModal
        isOpen={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={onClearAll}
        title={t.clearAllTransactionsTitle}
        message={t.clearAllTransactionsMessage}
        confirmText={t.clearAll}
        cancelText={t.cancel}
      />

      <DuplicateImportWarningModal
        isOpen={showDuplicateWarning}
        onClose={() => setShowDuplicateWarning(false)}
        onProceed={handleProceedDespiteDuplicate}
        title={t.duplicateImportTitle}
        message={
          duplicateStats?.newCount === 0
            ? t.duplicateImportMessageAll.replace('{duplicateCount}', String(duplicateStats.duplicateCount))
            : t.duplicateImportMessagePartial
                .replace('{duplicateCount}', String(duplicateStats?.duplicateCount))
                .replace('{newCount}', String(duplicateStats?.newCount))
        }
        proceedText={
          duplicateStats?.newCount === 0
            ? t.duplicateImportOk
            : t.duplicateImportProceed.replace('{newCount}', String(duplicateStats?.newCount))
        }
        cancelText={t.duplicateImportCancel}
        showProceedButton={duplicateStats?.newCount !== 0}
      />
    </motion.div>
  )
}

export default TransactionImporter
