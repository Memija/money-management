import { useMemo, useState } from 'react'

import { useAppStore } from '../store/useAppStore'
import type { Transaction } from '../types'
import { getTransactionCategory } from '../utils/category-utils'
import { filterByPeriod, type PeriodFilter } from './useAnalytics'

export function useTransactions(period?: PeriodFilter) {
  const importedAccounts = useAppStore((s) => s.importedAccounts)
  const customKeywords = useAppStore((s) => s.customKeywords)
  const manualCategories = useAppStore((s) => s.manualCategories)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')
  const [showGhost, setShowGhost] = useState(false)

  const allTransactions: Transaction[] = useMemo(() => {
    return importedAccounts.flatMap((a) =>
      [
        ...(a.transactions || []).map((t) => ({
          ...t,
          isDuplicate: Boolean(t.isDuplicate || t.forceImport || t.importedByRuleId),
          isModified: Boolean(t.isModified),
        })),
        ...(a.duplicateTransactions || []).map((t) => ({ ...t, isDuplicate: true, isModified: false })),
        ...(a.modifiedTransactions || []).map((t) => ({ ...t, isDuplicate: true, isModified: true })),
      ].map((t) => ({
        ...t,
        category: getTransactionCategory(t, customKeywords, manualCategories),
      })),
    )
  }, [importedAccounts, customKeywords, manualCategories])

  const ghostCount = useMemo(() => {
    let txs = allTransactions
    if (period && period.mode !== 'all') {
      txs = filterByPeriod(txs, period)
    }
    if (selectedInstitution !== 'all') {
      txs = txs.filter((t) => t.institution === selectedInstitution)
    }
    return txs.filter((t) => t.isGhost).length
  }, [allTransactions, period, selectedInstitution])

  const filteredTx = useMemo(() => {
    let txs = allTransactions
    if (!showGhost) {
      txs = txs.filter((t) => !t.isGhost)
    }
    if (period && period.mode !== 'all') {
      txs = filterByPeriod(txs, period)
    }
    if (selectedInstitution !== 'all') {
      txs = txs.filter((t) => t.institution === selectedInstitution)
    }
    const term = searchTerm.trim().toLowerCase()
    if (term) {
      txs = txs.filter(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          (t.category && t.category.toLowerCase().includes(term)),
      )
    }
    switch (sortOrder) {
      case 'newest':
        txs = [...txs].sort((a, b) => (b.date < a.date ? -1 : b.date > a.date ? 1 : 0))
        break
      case 'oldest':
        txs = [...txs].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
        break
      case 'highest':
        txs = [...txs].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
        break
      case 'lowest':
        txs = [...txs].sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount))
        break
    }
    return txs
  }, [allTransactions, showGhost, selectedInstitution, searchTerm, sortOrder, period])

  return {
    allTransactions,
    filteredTx,
    searchTerm,
    setSearchTerm,
    selectedInstitution,
    setSelectedInstitution,
    sortOrder,
    setSortOrder,
    showGhost,
    setShowGhost,
    ghostCount,
  }
}
