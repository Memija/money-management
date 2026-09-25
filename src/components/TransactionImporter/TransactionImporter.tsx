import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle, ArrowLeft, CheckCircle2,
  Ghost, Info, Layers, Loader2, TrendingDown, TrendingUp, Upload, X,
} from 'lucide-react'

import { useFormatters } from '../../hooks/useFormatters'
import { useAppStore } from '../../store/useAppStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import type { ImportedAccount, ImportMethod, RuleModifications, Transaction } from '../../types'
import { reconcileCrossAccountTransfers } from '../../utils/account-transfers'
import { DeleteConfirmationModal } from '../shared/DeleteConfirmationModal'
import { type ScopeFilter, TransactionPreviewModal } from '../shared/TransactionPreviewModal'
import { DuplicateImportWarningModal } from './DuplicateImportWarningModal'
import { ImportMethodSelector } from './ImportMethodSelector'
import { ImportUploadArea } from './ImportUploadArea'
import { useTransactionImport } from './useTransactionImport'

import styles from './TransactionImporter.module.css'

/* ─── component ─── */
const TransactionImporter: React.FC = () => {
  const selectedInstitution = useAppStore((s) => s.selectedInstitution)
  const addImportedAccount = useAppStore((s) => s.addImportedAccount)
  const addDuplicateOverrideRule = useAppStore((s) => s.addDuplicateOverrideRule)
  const setStep = useAppStore((s) => s.setStep)
  const getDuplicateTransactionStats = useAppStore((s) => s.getDuplicateTransactionStats)
  const importedAccounts = useAppStore((s) => s.importedAccounts)
  const cancelImport = useAppStore((s) => s.cancelImport)
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency } = useFormatters()
  const institutionName = selectedInstitution?.name ?? 'Unknown'

  const [method, setMethod] = useState<ImportMethod | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewFilter, setPreviewFilter] = useState<ScopeFilter>('all')
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [unlockedDuplicateIds, setUnlockedDuplicateIds] = useState<Set<string>>(new Set())
  const [pendingOverrideRules, setPendingOverrideRules] = useState<Map<string, Transaction>>(new Map())
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
      for (const t of transactions) {
        if (!originalTransactionsRef.current.has(t.id)) {
          originalTransactionsRef.current.set(t.id, { ...t })
        }
      }
    }
  }, [transactions])

  const rawDuplicateStats = React.useMemo(
    () => getDuplicateTransactionStats(selectedInstitution?.id ?? 'unknown', transactions || []),
    [selectedInstitution?.id, transactions, getDuplicateTransactionStats],
  )

  const duplicateStats = React.useMemo(() => {
    const activeDuplicateIds = rawDuplicateStats.duplicateIds.filter(
      (id) => !unlockedDuplicateIds.has(id),
    )
    const duplicateCount = activeDuplicateIds.length
    const newCount = (transactions || []).length - duplicateCount
    return {
      duplicateCount,
      newCount,
      duplicateIds: activeDuplicateIds,
      alreadyDuplicatedIds: rawDuplicateStats.alreadyDuplicatedIds || [],
    }
  }, [rawDuplicateStats, unlockedDuplicateIds, transactions])

  const isAllDuplicates = duplicateStats.duplicateCount > 0 && duplicateStats.newCount === 0
  const isPartialDuplicates = duplicateStats.duplicateCount > 0 && duplicateStats.newCount > 0

  const nonDuplicateTransactions = React.useMemo(() => {
    const duplicateIdSet = new Set(duplicateStats.duplicateIds)
    return transactions.filter((tx) => !duplicateIdSet.has(tx.id))
  }, [transactions, duplicateStats.duplicateIds])

  const otherImportedAccounts = React.useMemo(() => {
    return (importedAccounts || []).filter(
      (a) => a.institutionId !== (selectedInstitution?.id ?? ''),
    )
  }, [importedAccounts, selectedInstitution?.id])

  const internalTransferStats = React.useMemo(() => {
    if (!nonDuplicateTransactions?.length || !otherImportedAccounts?.length) {
      return { count: 0, transferTxIds: new Set<string>() }
    }

    const draftAccount: ImportedAccount = {
      institutionId: selectedInstitution?.id ?? 'draft',
      institutionName,
      transactions: nonDuplicateTransactions,
      importedAt: new Date().toISOString(),
      importedFingerprints: [],
      accountIbans: detectedAccountIbans,
    }

    const reconciled = reconcileCrossAccountTransfers([...otherImportedAccounts, draftAccount])
    const reconciledDraft = reconciled[reconciled.length - 1]
    const ghostTxs = reconciledDraft.transactions.filter((tx) => tx.isGhost)
    const transferTxIds = new Set(ghostTxs.map((tx) => tx.id))

    return { count: transferTxIds.size, transferTxIds }
  }, [nonDuplicateTransactions, otherImportedAccounts, selectedInstitution?.id, institutionName, detectedAccountIbans])

  const previewModalTitle = React.useMemo(() => {
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

  const importFlows = React.useMemo(() => {
    let inflows = 0
    let outflows = 0
    const duplicateIdsSet = new Set(duplicateStats.duplicateIds)
    for (const tx of transactions) {
      if (
        tx.isGhost ||
        internalTransferStats.transferTxIds.has(tx.id) ||
        duplicateIdsSet.has(tx.id)
      ) {
        continue
      }
      const amt = Math.abs(tx.amount)
      if (tx.type === 'income' || tx.amount > 0) inflows += amt
      else outflows += amt
    }
    return { inflows, outflows }
  }, [transactions, internalTransferStats, duplicateStats.duplicateIds])

  const isDuplicateFlow = rawDuplicateStats.duplicateCount > 0 || unlockedDuplicateIds.size > 0

  const buildAccount = (
    ruleIdsByTxId?: Map<string, string>,
    forceImportAllDuplicates?: boolean,
  ): ImportedAccount => {
    const rawDuplicateIdSet = new Set(rawDuplicateStats.duplicateIds)
    const cleanTransactions: Transaction[] = []
    const duplicateTransactions: Transaction[] = []
    const modifiedTransactions: Transaction[] = []

    const isTxModified = (current: Transaction, original?: Transaction): boolean => {
      if (current.isModified) return true
      if (!original) return false
      if (current.description !== original.description) return true
      if (Math.abs(current.amount - original.amount) >= 0.005) return true
      if (current.date !== original.date) return true
      if (current.category !== original.category) return true
      return false
    }

    transactions.forEach((t) => {
      const isRawDup = rawDuplicateIdSet.has(t.id)
      const isUnlocked = unlockedDuplicateIds.has(t.id)
      const isMarkedDup = Boolean(t.isDuplicate) || Boolean(t.forceImport)

      const ruleId = ruleIdsByTxId?.get(t.id)

      if (isUnlocked || (forceImportAllDuplicates && isRawDup) || isMarkedDup || Boolean(ruleId)) {
        const orig = originalTransactionsRef.current.get(t.id)
        const modified = isTxModified(t, orig)
        const finalTx: Transaction = {
          ...t,
          forceImport: true,
          isDuplicate: true,
          isModified: modified,
          originalDescription: orig?.description ?? t.description,
          originalAmount: orig?.amount !== undefined ? orig.amount : t.amount,
          originalDate: orig?.date ?? t.date,
          ...(ruleId ? { importedByRuleId: ruleId } : {}),
        }
        if (modified) {
          modifiedTransactions.push(finalTx)
        } else {
          duplicateTransactions.push(finalTx)
        }
        return
      }

      if (isRawDup) {
        if (forceImportAllDuplicates || isAllDuplicates) {
          const orig = originalTransactionsRef.current.get(t.id)
          const modified = isTxModified(t, orig)
          const finalTx: Transaction = {
            ...t,
            forceImport: true,
            isDuplicate: true,
            isModified: modified,
            originalDescription: orig?.description ?? t.description,
            originalAmount: orig?.amount !== undefined ? orig.amount : t.amount,
            originalDate: orig?.date ?? t.date,
          }
          if (modified) {
            modifiedTransactions.push(finalTx)
          } else {
            duplicateTransactions.push(finalTx)
          }
          return
        }
        return
      }

      cleanTransactions.push(t)
    })

    return {
      institutionId: selectedInstitution?.id ?? 'unknown',
      institutionName,
      transactions: cleanTransactions,
      duplicateTransactions: duplicateTransactions.length > 0 ? duplicateTransactions : undefined,
      modifiedTransactions: modifiedTransactions.length > 0 ? modifiedTransactions : undefined,
      importedAt: new Date().toISOString(),
      importedFingerprints: [importFingerprint],
      accountIbans: detectedAccountIbans,
    }
  }

  const commitImport = (forceImportAllDuplicates?: boolean) => {
    setIsSubmitted(true)
    const currentTxMap = new Map((transactions || []).map((t) => [t.id, t]))
    const ruleIdsByTxId = new Map<string, string>()
    const processedTxIds = new Set<string>()

    pendingOverrideRules.forEach((origTx, txId) => {
      if (processedTxIds.has(txId)) {
        return
      }

      const finalTx = currentTxMap.get(txId) || origTx
      const mods: RuleModifications = {}
      if (finalTx.description && origTx.description && finalTx.description !== origTx.description) {
        mods.description = finalTx.description
      }
      if (finalTx.amount !== undefined && origTx.amount !== undefined && Math.abs(finalTx.amount - origTx.amount) >= 0.005) {
        mods.amount = finalTx.amount
      }
      if (finalTx.category && origTx.category && finalTx.category !== origTx.category) {
        mods.category = finalTx.category
      }
      if (finalTx.date && origTx.date && finalTx.date !== origTx.date) {
        mods.date = finalTx.date
      }

      const sameGroup = (transactions || []).filter((t) => {
        const tOrig = originalTransactionsRef.current.get(t.id) || t
        return (
          tOrig.description.trim().toLowerCase() === origTx.description.trim().toLowerCase() &&
          Math.abs(tOrig.amount - origTx.amount) < 0.005 &&
          (unlockedDuplicateIds.has(t.id) || t.id === txId)
        )
      })

      const ruleId = `drule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      sameGroup.forEach((t) => {
        processedTxIds.add(t.id)
        ruleIdsByTxId.set(t.id, ruleId)
      })
      processedTxIds.add(txId)
      ruleIdsByTxId.set(txId, ruleId)

      addDuplicateOverrideRule?.({
        id: ruleId,
        institutionId: selectedInstitution?.id,
        institutionName: selectedInstitution?.name ?? institutionName,
        descriptionPattern: origTx.description,
        amount: origTx.amount,
        createdAt: new Date().toISOString(),
        applyCount: Math.max(1, sameGroup.length),
        modifications: Object.keys(mods).length > 0 ? mods : undefined,
      })
    })
    addImportedAccount(buildAccount(ruleIdsByTxId, forceImportAllDuplicates))
  }

  const handleConfirmImport = () => {
    if (isSubmitted) {
      return
    }
    if (isPartialDuplicates) {
      setShowDuplicateWarning(true)
      return
    }
    commitImport(isAllDuplicates)
  }

  const handleProceedDespiteDuplicate = () => {
    commitImport(isAllDuplicates)
  }

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
      {!method && <ImportMethodSelector t={t} onSelectMethod={setMethod} />}

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={styles['import-preview']}
        >
          <div className={styles['import-preview-header']}>
            <div className={styles['import-preview-info']}>
              <div className={styles['import-preview-title-row']}>
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
              <div className={styles['import-preview-flows']}>
                <span
                  className={styles['flow-badge-inflow']}
                  title={`${t.inflows || 'Inflows'}: +${formatCurrency(importFlows.inflows)}`}
                  data-testid="import-inflow-badge"
                >
                  <TrendingUp size={13} aria-hidden="true" />
                  +{formatCurrency(importFlows.inflows)}
                </span>
                <span
                  className={styles['flow-badge-outflow']}
                  title={`${t.outflows || 'Outflows'}: -${formatCurrency(importFlows.outflows)}`}
                  data-testid="import-outflow-badge"
                >
                  <TrendingDown size={13} aria-hidden="true" />
                  -{formatCurrency(importFlows.outflows)}
                </span>
              </div>
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

          {/* First check: duplicate detection */}
          {isAllDuplicates && (
            <div className={styles['duplicate-all-banner']} data-testid="duplicate-all-banner">
              <div className={styles['duplicate-banner-content']}>
                <AlertTriangle size={18} className={styles['duplicate-banner-icon']} />
                <span>
                  {duplicateStats.duplicateCount === 1
                    ? t.duplicateImportAllBannerSingular || '1 duplicate transaction detected. This transaction has already been imported.'
                    : (t.duplicateImportAllBanner || 'All {count} transactions in this file have already been imported (duplicates).').replace('{count}', String(duplicateStats.duplicateCount))}
                </span>
              </div>
              <button
                type="button"
                className={styles['duplicate-banner-action-btn']}
                onClick={() => {
                  setPreviewFilter('duplicates')
                  setIsPreviewOpen(true)
                }}
                data-testid="view-duplicates-button"
                title={t.viewDuplicates || 'View duplicates'}
              >
                <AlertTriangle size={13} aria-hidden="true" />
                <span>{t.viewDuplicates || 'View duplicates'}</span>
              </button>
            </div>
          )}

          {isPartialDuplicates && (
            <div className={styles['duplicate-partial-banner']} data-testid="duplicate-partial-banner">
              <div className={styles['duplicate-banner-content']}>
                <AlertTriangle size={18} className={styles['duplicate-banner-icon']} />
                <span>
                  {(t.duplicateImportPartialBanner || '{duplicateCount} duplicate transactions detected and will be skipped. {newCount} new transactions will be imported.')
                    .replace('{duplicateCount}', String(duplicateStats.duplicateCount))
                    .replace('{newCount}', String(duplicateStats.newCount))}
                </span>
              </div>
              <button
                type="button"
                className={styles['duplicate-banner-action-btn']}
                onClick={() => {
                  setPreviewFilter('duplicates')
                  setIsPreviewOpen(true)
                }}
                data-testid="view-duplicates-button"
                title={t.viewDuplicates || 'View duplicates'}
              >
                <AlertTriangle size={13} aria-hidden="true" />
                <span>{t.viewDuplicates || 'View duplicates'}</span>
              </button>
            </div>
          )}

          {!isSubmitted && !isAllDuplicates && discardedSpaceCount > 0 && (
            <div
              className={`${styles['transfer-info-banner']} ${styles['space-transfers-banner']}`}
              data-testid="space-transfers-banner"
            >
              <div className={styles['transfer-info-content']}>
                <Layers size={16} className={styles['space-transfers-banner-icon']} aria-hidden="true" />
                <span>
                  {discardedSpaceCount === 1
                    ? t.spaceTransfersExcludedSingular
                    : t.spaceTransfersExcluded.replace('{count}', String(discardedSpaceCount))}
                </span>
              </div>
              <button
                type="button"
                className={`${styles['banner-action-btn']} ${styles['space-banner-action-btn']}`}
                onClick={() => {
                  setPreviewFilter('space-transfers')
                  setIsPreviewOpen(true)
                }}
                data-testid="view-space-transfers-button"
                title={t.viewExcludedSpaceTransfers || 'View excluded'}
              >
                <Layers size={13} aria-hidden="true" />
                <span>{t.viewExcludedSpaceTransfers || 'View excluded'}</span>
              </button>
            </div>
          )}

          {!isSubmitted && !isAllDuplicates && internalTransferStats.count > 0 && (
            <div className={styles['transfer-info-banner']} data-testid="internal-transfers-banner">
              <div className={styles['transfer-info-content']}>
                <Ghost size={16} className={styles['transfer-info-icon']} />
                <span>
                  {internalTransferStats.count === 1
                    ? t.internalTransfersDetectedSingular
                    : t.internalTransfersDetected.replace('{count}', String(internalTransferStats.count))}
                </span>
              </div>
              <button
                type="button"
                className={styles['banner-action-btn']}
                onClick={() => {
                  setPreviewFilter('internal-transfers')
                  setIsPreviewOpen(true)
                }}
                data-testid="view-internal-transfers-button"
                title={t.viewInternalTransfers || 'View transfers'}
              >
                <Ghost size={13} aria-hidden="true" />
                <span>{t.viewInternalTransfers || 'View transfers'}</span>
              </button>
            </div>
          )}

          <div className={styles['action-buttons-container']}>
            <button
              className={`secondary-button ${styles['no-margin-top']}`}
              onClick={() => {
                setPreviewFilter('all')
                setIsPreviewOpen(true)
              }}
            >
              {t.reviewTransactions}
            </button>

            <button
              className={`primary-button ${styles['no-margin-top']} ${
                isDuplicateFlow
                  ? styles['button-warning-orange']
                  : styles['button-clean-green']
              }`}
              onClick={handleConfirmImport}
              id="confirm-import"
              disabled={
                loading ||
                transactions.length === 0 ||
                (isAllDuplicates && unlockedDuplicateIds.size === 0)
              }
              title={
                isAllDuplicates && unlockedDuplicateIds.size === 0
                  ? t.allTransactionsAlreadyImported
                  : isPartialDuplicates
                  ? t.importNewTransactions.replace('{count}', String(duplicateStats.newCount))
                  : t.confirmImport
              }
            >
              <CheckCircle2 size={18} />
              {isAllDuplicates && unlockedDuplicateIds.size === 0
                ? t.allTransactionsAlreadyImported
                : isPartialDuplicates
                ? t.importNewTransactions.replace('{count}', String(duplicateStats.newCount))
                : t.confirmImport}
            </button>
          </div>
        </motion.div>
      )}

      <TransactionPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        transactions={transactions}
        isImport={true}
        duplicateIds={new Set(rawDuplicateStats.duplicateIds)}
        alreadyDuplicatedIds={new Set(rawDuplicateStats.alreadyDuplicatedIds || [])}
        unlockedDuplicateIds={unlockedDuplicateIds}
        internalTransferIds={internalTransferStats.transferTxIds}
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
            ? t.duplicateImportMessageAll.replace('{duplicateCount}', String(duplicateStats.duplicateCount))
            : t.duplicateImportMessagePartial.replace('{duplicateCount}', String(duplicateStats?.duplicateCount)).replace('{newCount}', String(duplicateStats?.newCount))
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
