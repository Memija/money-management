import React from 'react'

import { useAppStore } from '../../store/useAppStore'
import type { ImportedAccount, RuleModifications, Transaction } from '../../types'
import { reconcileCrossAccountTransfers } from '../../utils/account-transfers'

interface UseTransactionImporterScopingParams {
  transactions: Transaction[]
  institutionName: string
  detectedAccountIbans: string[]
  importFingerprint: string
  unlockedDuplicateIds: Set<string>
  pendingOverrideRules: Map<string, Transaction>
  originalTransactionsRef: React.MutableRefObject<Map<string, Transaction>>
  isSubmitted: boolean
  setIsSubmitted: (submitted: boolean) => void
  setShowDuplicateWarning: (show: boolean) => void
}

export function useTransactionImporterScoping({
  transactions,
  institutionName,
  detectedAccountIbans,
  importFingerprint,
  unlockedDuplicateIds,
  pendingOverrideRules,
  originalTransactionsRef,
  isSubmitted,
  setIsSubmitted,
  setShowDuplicateWarning,
}: UseTransactionImporterScopingParams) {
  const selectedInstitution = useAppStore((s) => s.selectedInstitution)
  const addImportedAccount = useAppStore((s) => s.addImportedAccount)
  const addDuplicateOverrideRule = useAppStore((s) => s.addDuplicateOverrideRule)
  const getDuplicateTransactionStats = useAppStore((s) => s.getDuplicateTransactionStats)
  const importedAccounts = useAppStore((s) => s.importedAccounts)

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
      return {
        count: 0,
        transferTxIds: new Set<string>(),
        existingAccountTransfers: [] as Transaction[],
      }
    }

    const draftAccount: ImportedAccount = {
      institutionId: selectedInstitution?.id ?? 'draft',
      institutionName,
      transactions: nonDuplicateTransactions,
      importedAt: new Date().toISOString(),
      importedFingerprints: [],
      accountIbans: detectedAccountIbans,
    }

    const existingOriginalGhostIds = new Set<string>()
    for (const acc of otherImportedAccounts) {
      for (const tx of acc.transactions) {
        if (tx.isGhost) {
          existingOriginalGhostIds.add(tx.id)
        }
      }
    }

    const reconciled = reconcileCrossAccountTransfers([...otherImportedAccounts, draftAccount])
    const reconciledDraft = reconciled[reconciled.length - 1]
    const ghostTxs = reconciledDraft.transactions.filter((tx) => tx.isGhost)
    const transferTxIds = new Set(ghostTxs.map((tx) => tx.id))

    const existingAccountTransfers: Transaction[] = []
    for (let i = 0; i < otherImportedAccounts.length; i++) {
      const origAcc = otherImportedAccounts[i]
      const reconciledAcc = reconciled[i]
      for (const tx of reconciledAcc.transactions) {
        if (tx.isGhost && !existingOriginalGhostIds.has(tx.id)) {
          existingAccountTransfers.push({
            ...tx,
            institution: tx.institution || origAcc.institutionName || origAcc.institutionId,
          })
        }
      }
    }

    return { count: transferTxIds.size, transferTxIds, existingAccountTransfers }
  }, [
    nonDuplicateTransactions,
    otherImportedAccounts,
    selectedInstitution?.id,
    institutionName,
    detectedAccountIbans,
  ])

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
      if (tx.type === 'income' || tx.amount > 0) {
        inflows += amt
      } else {
        outflows += amt
      }
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
      if (current.isModified) {
        return true
      }
      if (!original) {
        return false
      }
      if (current.description !== original.description) {
        return true
      }
      if (Math.abs(current.amount - original.amount) >= 0.005) {
        return true
      }
      if (current.date !== original.date) {
        return true
      }
      if (current.category !== original.category) {
        return true
      }
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
      if (
        finalTx.amount !== undefined &&
        origTx.amount !== undefined &&
        Math.abs(finalTx.amount - origTx.amount) >= 0.005
      ) {
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

  return {
    rawDuplicateStats,
    duplicateStats,
    isAllDuplicates,
    isPartialDuplicates,
    internalTransferStats,
    importFlows,
    isDuplicateFlow,
    handleConfirmImport,
    handleProceedDespiteDuplicate,
  }
}
