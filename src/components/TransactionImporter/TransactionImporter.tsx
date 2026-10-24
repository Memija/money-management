import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Info, Loader2, Upload } from 'lucide-react'

import { useAppStore } from '../../store/useAppStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import type { ImportMethod, Transaction } from '../../types'
import { DeleteConfirmationModal } from '../shared/DeleteConfirmationModal'
import { RestoreBackupPrompt } from '../shared/RestoreBackupPrompt'
import { type ScopeFilter, TransactionPreviewModal } from '../shared/TransactionPreviewModal'
import { DuplicateImportWarningModal } from './DuplicateImportWarningModal'
import { ImportMethodSelector } from './ImportMethodSelector'
import { ImportPreviewSection } from './ImportPreviewSection'
import { ImportUploadArea } from './ImportUploadArea'
import { useTransactionImport } from './useTransactionImport'
import { useTransactionImporterScoping } from './useTransactionImporterScoping'

import styles from './TransactionImporter.module.css'

/* ─── component ─── */
const TransactionImporter: React.FC = () => {
  const selectedInstitution = useAppStore((s) => s.selectedInstitution)
  const setStep = useAppStore((s) => s.setStep)
  const importedAccounts = useAppStore((s) => s.importedAccounts)
  const cancelImport = useAppStore((s) => s.cancelImport)
  const t = useLanguageStore((s) => s.t)
  const institutionName = selectedInstitution?.name ?? 'Unknown'

  const [method, setMethod] = useState<ImportMethod | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewFilter, setPreviewFilter] = useState<ScopeFilter>('all')
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [unlockedDuplicateIds, setUnlockedDuplicateIds] = useState<Set<string>>(new Set())
  const [pendingOverrideRules, setPendingOverrideRules] = useState<Map<string, Transaction>>(
    new Map(),
  )
  const originalTransactionsRef = React.useRef<Map<string, Transaction>>(new Map())

  const {
    transactions,
    discardedSpaceCount,
    excludedSpaceTransactions,
    detectedAccountIbans,
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

  const onUpdateTransaction = useCallback(
    (id: string, updates: Partial<Transaction>) => {
      handleUpdateTransaction(id, updates)
    },
    [handleUpdateTransaction],
  )

  // Cache original transactions and reset unlocked duplicates if transactions are cleared
  React.useEffect(() => {
    if (!transactions?.length) {
      setUnlockedDuplicateIds(new Set())
      originalTransactionsRef.current.clear()
    } else {
      for (const tx of transactions) {
        if (!originalTransactionsRef.current.has(tx.id)) {
          originalTransactionsRef.current.set(tx.id, { ...tx })
        }
      }
    }
  }, [transactions])

  const {
    rawDuplicateStats,
    duplicateStats,
    isAllDuplicates,
    isPartialDuplicates,
    internalTransferStats,
    importFlows,
    isDuplicateFlow,
    handleConfirmImport,
    handleProceedDespiteDuplicate,
  } = useTransactionImporterScoping({
    transactions: transactions || [],
    institutionName,
    detectedAccountIbans,
    importFingerprint,
    unlockedDuplicateIds,
    pendingOverrideRules,
    originalTransactionsRef,
    isSubmitted,
    setIsSubmitted,
    setShowDuplicateWarning,
  })

  const previewModalTitle = React.useMemo(() => {
    if (previewFilter === 'excluded') {
      return t.filterExcluded || 'Excluded'
    }
    if (previewFilter === 'duplicates') {
      return t.filterDuplicates || 'Duplicates'
    }
    if (previewFilter === 'already-duplicated') {
      return t.filterAlreadyDuplicated || t.alreadyDuplicated || 'Already Duplicated'
    }
    if (previewFilter === 'space-transfers') {
      return t.filterSpaceTransfers || 'Sub-account Transfers'
    }
    if (previewFilter === 'internal-transfers') {
      return t.filterInternalTransfers || 'Internal Transfers'
    }
    return t.transactions
  }, [previewFilter, t])

  const onClearAll = useCallback(() => {
    handleClearAll()
    setUnlockedDuplicateIds(new Set())
    setPendingOverrideRules(new Map())
    originalTransactionsRef.current.clear()
    setShowClearConfirmation(false)
  }, [handleClearAll])

  // Cleanup on unmount if import is not completed/submitted
  React.useEffect(() => {
    const origMap = originalTransactionsRef.current
    return () => {
      if (!isSubmitted) {
        handleClearAll()
        setUnlockedDuplicateIds(new Set())
        setPendingOverrideRules(new Map())
        origMap.clear()
      }
    }
  }, [isSubmitted, handleClearAll])

  const handleOpenPreview = useCallback((filter: ScopeFilter) => {
    setPreviewFilter(filter)
    setIsPreviewOpen(true)
  }, [])

  /* ─── render ─── */
  return (
    <div className="onboarding-container">
      <div className={styles['nav-actions-wrapper']}>
        <button
          className={`back-button ${styles['back-button-clean']}`}
          onClick={() => {
            onClearAll()
            setStep('institution')
          }}
          id="back-to-institution"
        >
          <ArrowLeft size={18} />
          <span>{t.back}</span>
        </button>
        {(importedAccounts || []).length > 0 && (
          <button
            className={`back-button ${styles['back-button-clean']}`}
            onClick={() => {
              onClearAll()
              cancelImport?.()
            }}
            id="cancel-import"
          >
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
        <>
          <ImportMethodSelector t={t} onSelectMethod={setMethod} />
          <RestoreBackupPrompt idPrefix="importer" buttonLabel={t.restoreBackupPrompt} />
        </>
      )}

      {/* Step 2: Upload area / Paste */}
      {method && transactions.length === 0 && !loading && (
        <ImportUploadArea
          method={method}
          error={error}
          fileName={fileName}
          pasteText={pasteText}
          t={t}
          onBack={() => {
            onClearAll()
            setMethod(null)
            setError(null)
            setFileName(null)
          }}
          onFileChange={handleFileChange}
          onPasteTextChange={setPasteText}
          onPasteSubmit={handlePaste}
        />
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
        <ImportPreviewSection
          transactions={transactions}
          importFlows={importFlows}
          duplicateStats={duplicateStats}
          isAllDuplicates={isAllDuplicates}
          isPartialDuplicates={isPartialDuplicates}
          isDuplicateFlow={isDuplicateFlow}
          unlockedDuplicateIds={unlockedDuplicateIds}
          discardedSpaceCount={discardedSpaceCount}
          internalTransferStats={internalTransferStats}
          isSubmitted={isSubmitted}
          loading={loading}
          t={t}
          onClear={() => setShowClearConfirmation(true)}
          onOpenPreview={handleOpenPreview}
          onConfirmImport={handleConfirmImport}
        />
      )}

      <TransactionPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        transactions={transactions}
        currentInstitutionName={institutionName}
        isImport={true}
        duplicateIds={new Set(rawDuplicateStats.duplicateIds)}
        alreadyDuplicatedIds={new Set(rawDuplicateStats.alreadyDuplicatedIds || [])}
        unlockedDuplicateIds={unlockedDuplicateIds}
        internalTransferIds={internalTransferStats.transferTxIds}
        existingAccountTransfers={internalTransferStats.existingAccountTransfers}
        discardedSpaceCount={discardedSpaceCount}
        excludedSpaceTransactions={excludedSpaceTransactions}
        initialFilter={previewFilter}
        onRemoveTransaction={handleRemoveTransaction}
        onUpdateTransaction={onUpdateTransaction}
        onUnlockDuplicateTransaction={(tx, rememberRule) => {
          if (rawDuplicateStats.alreadyDuplicatedIds?.includes(tx.id)) {
            return
          }
          setUnlockedDuplicateIds((prev) => new Set(prev).add(tx.id))
          if (rememberRule) {
            const orig = originalTransactionsRef.current.get(tx.id) || tx
            setPendingOverrideRules((prev) => new Map(prev).set(tx.id, orig))
          }
        }}
        onRelockDuplicateTransaction={(tx) => {
          setUnlockedDuplicateIds((prev) => {
            const next = new Set(prev)
            next.delete(tx.id)
            return next
          })
          setPendingOverrideRules((prev) => {
            const next = new Map(prev)
            next.delete(tx.id)
            return next
          })
        }}
        title={previewModalTitle}
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
            ? t.duplicateImportMessageAll.replace(
                '{duplicateCount}',
                String(duplicateStats.duplicateCount),
              )
            : t.duplicateImportMessagePartial
                .replace('{duplicateCount}', String(duplicateStats?.duplicateCount))
                .replace('{newCount}', String(duplicateStats?.newCount))
        }
        proceedText={
          duplicateStats?.newCount === 0
            ? t.confirmImport
            : t.duplicateImportProceed.replace('{newCount}', String(duplicateStats?.newCount))
        }
        cancelText={t.duplicateImportCancel}
        showProceedButton={true}
      />
    </div>
  )
}

export default TransactionImporter
