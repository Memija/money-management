import { useMemo } from 'react'

import { findInstitution } from '../../../data/institutions'
import type { TranslationStrings } from '../../../i18n/types'
import type { Transaction } from '../../../types'
import type { ScopeFilter } from './TransactionPreviewToolbar'

interface UsePreviewTransactionScopingProps {
  activeTransactions: Transaction[]
  activeExcluded: Transaction[]
  discardedSpaceCount: number
  duplicateIds: Set<string>
  effectiveUnlockedIds: Set<string>
  alreadyDuplicatedIds: Set<string>
  internalTransferIds: Set<string>
  existingAccountTransfers?: Transaction[]
  currentInstitutionName?: string
  scopeFilter: ScopeFilter
  initialFilter: ScopeFilter
  accountFilter: string
  subAccountFilter: string
  title?: string
  t: TranslationStrings
  getIsModified: (tx: Transaction) => boolean
}

export function usePreviewTransactionScoping({
  activeTransactions,
  activeExcluded,
  discardedSpaceCount,
  duplicateIds,
  effectiveUnlockedIds,
  alreadyDuplicatedIds,
  internalTransferIds,
  existingAccountTransfers = [],
  currentInstitutionName,
  scopeFilter,
  initialFilter,
  accountFilter,
  subAccountFilter,
  title,
  t,
  getIsModified,
}: UsePreviewTransactionScopingProps) {
  const currentAccountName = currentInstitutionName || t.currentImport || 'Current Import'
  const currentInstLogo = useMemo(() => {
    return findInstitution(currentInstitutionName || currentAccountName)?.logo
  }, [currentInstitutionName, currentAccountName])

  const existingInstitutions = useMemo(() => {
    if (!existingAccountTransfers || existingAccountTransfers.length === 0) {
      return []
    }
    const names = new Set<string>()
    for (const tx of existingAccountTransfers) {
      if (tx.institution) {
        names.add(tx.institution)
      }
    }
    if (names.size === 0) {
      names.add(t.alreadyImported || 'Already Imported')
    }
    return Array.from(names)
  }, [existingAccountTransfers, t])

  const hasMultipleAccounts = existingInstitutions.length > 0

  const existingTransferIds = useMemo(
    () => new Set((existingAccountTransfers || []).map((tx) => tx.id)),
    [existingAccountTransfers],
  )

  const spaceTransferIds = useMemo(() => {
    return new Set(activeExcluded.map((tx) => tx.id))
  }, [activeExcluded])

  const hasSpaceTransfers = Boolean(activeExcluded.length > 0 || discardedSpaceCount > 0)

  const subAccounts = useMemo(() => {
    const names = new Set<string>()
    for (const tx of activeExcluded) {
      if (tx.subAccount) {
        names.add(tx.subAccount)
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b))
  }, [activeExcluded])

  const subAccountCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: activeExcluded.length,
    }
    for (const sa of subAccounts) {
      counts[sa] = activeExcluded.filter((tx) => tx.subAccount === sa).length
    }
    return counts
  }, [activeExcluded, subAccounts])

  const combinedTransactions = useMemo(() => {
    if (activeExcluded.length === 0) {
      return activeTransactions
    }
    return [...activeTransactions, ...activeExcluded]
  }, [activeTransactions, activeExcluded])

  const duplicateCount = useMemo(() => {
    return activeTransactions.filter((tx) => {
      const isDup =
        duplicateIds.has(tx.id) ||
        effectiveUnlockedIds.has(tx.id) ||
        Boolean(tx.isDuplicate) ||
        Boolean(tx.forceImport)
      const isMod = getIsModified(tx) || Boolean(tx.isModified)
      return isDup && !isMod
    }).length
  }, [activeTransactions, duplicateIds, effectiveUnlockedIds, getIsModified])

  const modifiedDuplicateCount = useMemo(() => {
    return activeTransactions.filter((tx) => {
      const isDup =
        duplicateIds.has(tx.id) ||
        effectiveUnlockedIds.has(tx.id) ||
        Boolean(tx.isDuplicate) ||
        Boolean(tx.forceImport)
      const isMod = getIsModified(tx) || Boolean(tx.isModified)
      return isDup && isMod
    }).length
  }, [activeTransactions, duplicateIds, effectiveUnlockedIds, getIsModified])

  const alreadyDuplicatedCount = useMemo(() => {
    return activeTransactions.filter((tx) => alreadyDuplicatedIds.has(tx.id)).length
  }, [activeTransactions, alreadyDuplicatedIds])

  const hasDuplicates = duplicateCount > 0 || duplicateIds.size > 0

  const spaceTransferCount = activeExcluded.length

  const internalTransferCount = useMemo(() => {
    const draftTransfers = activeTransactions.filter(
      (tx) =>
        !duplicateIds.has(tx.id) &&
        !effectiveUnlockedIds.has(tx.id) &&
        (tx.isGhost || internalTransferIds.has(tx.id)),
    )
    return draftTransfers.length + (existingAccountTransfers?.length || 0)
  }, [
    activeTransactions,
    duplicateIds,
    effectiveUnlockedIds,
    internalTransferIds,
    existingAccountTransfers,
  ])

  const lockedDuplicateCount = useMemo(() => {
    return activeTransactions.filter(
      (tx) =>
        (duplicateIds.has(tx.id) && !effectiveUnlockedIds.has(tx.id)) ||
        alreadyDuplicatedIds.has(tx.id),
    ).length
  }, [activeTransactions, duplicateIds, effectiveUnlockedIds, alreadyDuplicatedIds])

  const excludedCount = useMemo(() => {
    return lockedDuplicateCount + spaceTransferCount + internalTransferCount
  }, [lockedDuplicateCount, spaceTransferCount, internalTransferCount])

  const baseScopedTransactions = useMemo(() => {
    if (scopeFilter === 'unlocked') {
      return activeTransactions.filter((tx) => effectiveUnlockedIds.has(tx.id))
    }
    if (scopeFilter === 'already-duplicated') {
      return activeTransactions.filter((tx) => alreadyDuplicatedIds.has(tx.id))
    }
    if (scopeFilter === 'duplicates') {
      return activeTransactions.filter((tx) => {
        const isDup =
          duplicateIds.has(tx.id) ||
          effectiveUnlockedIds.has(tx.id) ||
          Boolean(tx.isDuplicate) ||
          Boolean(tx.forceImport)
        const isMod = getIsModified(tx) || Boolean(tx.isModified)
        return isDup && !isMod
      })
    }
    if (scopeFilter === 'modified') {
      return activeTransactions.filter((tx) => {
        const isDup =
          duplicateIds.has(tx.id) ||
          effectiveUnlockedIds.has(tx.id) ||
          Boolean(tx.isDuplicate) ||
          Boolean(tx.forceImport)
        const isMod = getIsModified(tx) || Boolean(tx.isModified)
        return isDup && isMod
      })
    }
    if (scopeFilter === 'excluded') {
      const draftExcluded = activeTransactions.filter((tx) => {
        const isLockedDuplicate =
          (duplicateIds.has(tx.id) && !effectiveUnlockedIds.has(tx.id)) ||
          alreadyDuplicatedIds.has(tx.id)
        const isInternalTransfer =
          !duplicateIds.has(tx.id) &&
          !effectiveUnlockedIds.has(tx.id) &&
          (tx.isGhost || internalTransferIds.has(tx.id))
        return isLockedDuplicate || isInternalTransfer
      })
      return [...draftExcluded, ...activeExcluded, ...(existingAccountTransfers || [])]
    }
    if (scopeFilter === 'space-transfers') {
      if (subAccountFilter === 'all') {
        return activeExcluded
      }
      return activeExcluded.filter((tx) => tx.subAccount === subAccountFilter)
    }
    if (scopeFilter === 'internal-transfers') {
      const draftTransfers = activeTransactions.filter(
        (tx) =>
          !duplicateIds.has(tx.id) &&
          !effectiveUnlockedIds.has(tx.id) &&
          (tx.isGhost || internalTransferIds.has(tx.id)),
      )
      return [...draftTransfers, ...(existingAccountTransfers || [])]
    }
    if (scopeFilter === 'included') {
      return activeTransactions.filter(
        (tx) => !duplicateIds.has(tx.id) || effectiveUnlockedIds.has(tx.id),
      )
    }
    if (hasSpaceTransfers) {
      return combinedTransactions
    }
    return activeTransactions
  }, [
    activeTransactions,
    activeExcluded,
    hasSpaceTransfers,
    scopeFilter,
    subAccountFilter,
    combinedTransactions,
    internalTransferIds,
    existingAccountTransfers,
    duplicateIds,
    alreadyDuplicatedIds,
    effectiveUnlockedIds,
    getIsModified,
  ])

  const accountCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: baseScopedTransactions.length,
      current: baseScopedTransactions.filter((tx) => !existingTransferIds.has(tx.id)).length,
    }
    for (const inst of existingInstitutions) {
      counts[inst] = baseScopedTransactions.filter(
        (tx) => (tx.institution || t.alreadyImported || 'Already Imported') === inst,
      ).length
    }
    return counts
  }, [baseScopedTransactions, existingTransferIds, existingInstitutions, t])

  const scopedTransactions = useMemo(() => {
    if (accountFilter === 'all') {
      return baseScopedTransactions
    }
    if (accountFilter === 'current' || accountFilter === currentAccountName) {
      return baseScopedTransactions.filter((tx) => !existingTransferIds.has(tx.id))
    }
    return baseScopedTransactions.filter(
      (tx) => (tx.institution || t.alreadyImported || 'Already Imported') === accountFilter,
    )
  }, [baseScopedTransactions, accountFilter, currentAccountName, existingTransferIds, t])

  const hasMultipleTransactions =
    combinedTransactions.length > 1 || (scopedTransactions && scopedTransactions.length > 1)

  const effectiveTitle = useMemo(() => {
    let base = ''
    if (scopeFilter === 'excluded') {
      base = t.filterExcluded || 'Excluded'
    } else if (scopeFilter === 'space-transfers') {
      base = t.filterSpaceTransfers || 'Sub-account Transfers'
      if (subAccountFilter !== 'all') {
        return `${base} • ${subAccountFilter}`
      }
      return base
    } else if (scopeFilter === 'internal-transfers') {
      base = t.filterInternalTransfers || 'Internal Transfers'
    } else if (scopeFilter === 'duplicates') {
      base = t.filterDuplicates || 'Duplicates'
    } else if (scopeFilter === 'already-duplicated') {
      base = t.filterAlreadyDuplicated || t.alreadyDuplicated || 'Already Duplicated'
    } else if (scopeFilter === 'modified') {
      base = t.filterModified || 'Modified'
    } else if (scopeFilter === 'unlocked') {
      base = t.filterUnlocked || 'Unlocked'
    } else if (scopeFilter === 'all' && initialFilter !== 'all') {
      base = t.transactions
    } else {
      base = title ?? t.transactions
    }

    if (
      accountFilter !== 'all' &&
      (scopeFilter === 'excluded' || scopeFilter === 'internal-transfers')
    ) {
      const accName = accountFilter === 'current' ? currentAccountName : accountFilter
      return `${base} • ${accName}`
    }
    return base
  }, [scopeFilter, initialFilter, accountFilter, subAccountFilter, currentAccountName, title, t])

  return {
    currentAccountName,
    currentInstLogo,
    existingInstitutions,
    hasMultipleAccounts,
    existingTransferIds,
    spaceTransferIds,
    hasSpaceTransfers,
    subAccounts,
    subAccountCounts,
    combinedTransactions,
    duplicateCount,
    modifiedDuplicateCount,
    alreadyDuplicatedCount,
    hasDuplicates,
    spaceTransferCount,
    internalTransferCount,
    lockedDuplicateCount,
    excludedCount,
    baseScopedTransactions,
    accountCounts,
    scopedTransactions,
    hasMultipleTransactions,
    effectiveTitle,
  }
}
