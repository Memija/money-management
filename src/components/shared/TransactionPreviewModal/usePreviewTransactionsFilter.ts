import { useMemo, useState } from 'react'

import type { TranslationStrings } from '../../../i18n/types'
import type { Transaction } from '../../../types'
import type { SelectOption } from '../Select'
import type { SortColumn, SortDirection } from './TransactionPreviewToolbar'

export interface UsePreviewTransactionsFilterProps {
  scopedTransactions: Transaction[]
  hasMultipleTransactions: boolean
  duplicateIds?: Set<string>
  unlockedDuplicateIds?: Set<string>
  internalTransferIds: Set<string>
  spaceTransferIds: Set<string>
  formatCurrency: (amount: number) => string
  t: TranslationStrings
}

export function usePreviewTransactionsFilter({
  scopedTransactions,
  hasMultipleTransactions,
  duplicateIds,
  unlockedDuplicateIds,
  internalTransferIds,
  spaceTransferIds,
  formatCurrency,
  t,
}: UsePreviewTransactionsFilterProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortColumn; direction: SortDirection } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const isFilterActive =
    searchQuery.trim().length > 0 ||
    startDate.length > 0 ||
    endDate.length > 0

  const handleClearFilters = () => {
    setSearchQuery('')
    setStartDate('')
    setEndDate('')
  }

  const handleSort = (key: SortColumn) => {
    if (!hasMultipleTransactions) return
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: key === 'description' ? 'asc' : 'desc' }
    })
  }

  const sortOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'default', label: t.sortOrder || 'Default' },
      { value: 'date-desc', label: t.newestFirst || 'Newest First' },
      { value: 'date-asc', label: t.oldestFirst || 'Oldest First' },
      { value: 'amount-desc', label: t.highestAmount || 'Highest Amount' },
      { value: 'amount-asc', label: t.lowestAmount || 'Lowest Amount' },
      { value: 'description-asc', label: 'A – Z' },
      { value: 'description-desc', label: 'Z – A' },
    ],
    [t],
  )

  const handleSortChange = (val: string) => {
    if (val === 'default') {
      setSortConfig(null)
      return
    }
    const [key, direction] = val.split('-') as [SortColumn, SortDirection]
    setSortConfig({ key, direction })
  }

  const filteredAndSortedTransactions = useMemo(() => {
    if (
      !hasMultipleTransactions &&
      !startDate &&
      !endDate &&
      !searchQuery &&
      sortConfig === null &&
      (!unlockedDuplicateIds || unlockedDuplicateIds.size === 0)
    ) {
      return scopedTransactions
    }

    let result = [...scopedTransactions]

    if (startDate && endDate) {
      const [from, to] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate]
      result = result.filter((tx) => tx.date >= from && tx.date <= to)
    } else if (startDate) {
      result = result.filter((tx) => tx.date >= startDate)
    } else if (endDate) {
      result = result.filter((tx) => tx.date <= endDate)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((tx) => {
        const descMatch = tx.description.toLowerCase().includes(q)
        const instMatch = tx.institution?.toLowerCase().includes(q) ?? false
        const catMatch = (tx.category ?? '').toLowerCase().includes(q)
        const formattedAmount = formatCurrency(tx.amount).toLowerCase()
        const amountMatch = formattedAmount.includes(q) || tx.amount.toString().includes(q)
        return descMatch || instMatch || catMatch || amountMatch
      })
    }

    if (sortConfig !== null) {
      const { key, direction } = sortConfig
      const factor = direction === 'asc' ? 1 : -1
      result.sort((a, b) => {
        const aUnlocked = unlockedDuplicateIds?.has(a.id) ?? false
        const bUnlocked = unlockedDuplicateIds?.has(b.id) ?? false
        if (aUnlocked !== bUnlocked) {
          return aUnlocked ? -1 : 1
        }
        if (key === 'date') return (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) * factor
        if (key === 'description') return a.description.localeCompare(b.description) * factor
        if (key === 'amount') return (a.amount - b.amount) * factor
        return 0
      })
    } else if (unlockedDuplicateIds && unlockedDuplicateIds.size > 0) {
      result.sort((a, b) => {
        const aUnlocked = unlockedDuplicateIds.has(a.id)
        const bUnlocked = unlockedDuplicateIds.has(b.id)
        if (aUnlocked !== bUnlocked) {
          return aUnlocked ? -1 : 1
        }
        return 0
      })
    }

    return result
  }, [
    scopedTransactions,
    hasMultipleTransactions,
    startDate,
    endDate,
    searchQuery,
    sortConfig,
    formatCurrency,
    unlockedDuplicateIds,
  ])

  const { totalInflows, totalOutflows } = useMemo(() => {
    let inflows = 0
    let outflows = 0
    for (const tx of filteredAndSortedTransactions) {
      if (
        tx.isGhost ||
        internalTransferIds.has(tx.id) ||
        spaceTransferIds.has(tx.id) ||
        duplicateIds?.has(tx.id)
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
    return {
      totalInflows: inflows,
      totalOutflows: outflows,
    }
  }, [filteredAndSortedTransactions, internalTransferIds, spaceTransferIds, duplicateIds])

  return {
    sortConfig,
    searchQuery,
    setSearchQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isFilterActive,
    handleClearFilters,
    handleSort,
    handleSortChange,
    sortOptions,
    filteredAndSortedTransactions,
    totalInflows,
    totalOutflows,
  }
}
