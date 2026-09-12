import { useMemo, useState } from 'react'

import { useAppStore } from '../store/useAppStore'
import type { Transaction } from '../types'
import { getTransactionCategory } from '../utils/category-utils'
import { filterByPeriod, type PeriodFilter } from './useAnalytics'

export function useTransactions(period?: PeriodFilter) {
  const { importedAccounts, customKeywords, manualCategories } = useAppStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')

  const allTransactions: Transaction[] = useMemo(() => {
    return importedAccounts.flatMap((a) =>
      a.transactions.map((t) => ({ ...t, category: getTransactionCategory(t, customKeywords, manualCategories) })),
    )
  }, [importedAccounts, customKeywords, manualCategories])

  const filteredTx = useMemo(() => {
    let txs = allTransactions
    if (period && period.mode !== 'all') {
      txs = filterByPeriod(txs, period)
    }
    if (selectedInstitution !== 'all') {
      txs = txs.filter((t) => t.institution === selectedInstitution)
    }
    if (searchTerm) {
      txs = txs.filter(
        (t) =>
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    switch (sortOrder) {
      case 'newest':
        txs = [...txs].sort((a, b) => b.date.localeCompare(a.date))
        break
      case 'oldest':
        txs = [...txs].sort((a, b) => a.date.localeCompare(b.date))
        break
      case 'highest':
        txs = [...txs].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
        break
      case 'lowest':
        txs = [...txs].sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount))
        break
    }
    return txs
  }, [allTransactions, selectedInstitution, searchTerm, sortOrder, period])

  return {
    allTransactions,
    filteredTx,
    searchTerm,
    setSearchTerm,
    selectedInstitution,
    setSelectedInstitution,
    sortOrder,
    setSortOrder,
  }
}
