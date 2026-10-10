import { useMemo, useState } from 'react'

import { useAppStore } from '../store/useAppStore'
import type { Transaction } from '../types'
import { getTransactionCategory } from '../utils/category-utils'
import type { PeriodFilter } from './useAnalytics'

function matchesPeriod(date: string, period?: PeriodFilter): boolean {
  if (!period || period.mode === 'all') return true
  switch (period.mode) {
    case 'year':
      return date.substring(0, 4) === period.value
    case 'quarter': {
      const [y, q] = period.value.split('-Q')
      const month = parseInt(date.substring(5, 7), 10)
      const qNum = parseInt(q, 10)
      const tYear = date.substring(0, 4)
      return tYear === y && month >= (qNum - 1) * 3 + 1 && month <= qNum * 3
    }
    case 'month':
      return date.substring(0, 7) === period.value
    default:
      return true
  }
}

export function useTransactions(period?: PeriodFilter) {
  const importedAccounts = useAppStore((s) => s.importedAccounts)
  const customKeywords = useAppStore((s) => s.customKeywords)
  const manualCategories = useAppStore((s) => s.manualCategories)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all')
  const [selectedSubAccount, setSelectedSubAccount] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')
  const [showGhost, setShowGhost] = useState(false)

  const handleSetSelectedInstitution = (inst: string) => {
    setSelectedInstitution(inst)
    setSelectedSubAccount('all')
  }

  const allTransactions: Transaction[] = useMemo(() => {
    const list: Transaction[] = []
    for (const a of importedAccounts) {
      const defaultInst = a.institutionName
      if (a.transactions) {
        for (const t of a.transactions) {
          list.push({
            ...t,
            institution: t.institution || defaultInst,
            isDuplicate: Boolean(t.isDuplicate || t.forceImport || t.importedByRuleId),
            isModified: Boolean(t.isModified),
            category: getTransactionCategory(t, customKeywords, manualCategories),
          })
        }
      }
      if (a.duplicateTransactions) {
        for (const t of a.duplicateTransactions) {
          list.push({
            ...t,
            institution: t.institution || defaultInst,
            isDuplicate: true,
            isModified: false,
            category: getTransactionCategory(t, customKeywords, manualCategories),
          })
        }
      }
      if (a.modifiedTransactions) {
        for (const t of a.modifiedTransactions) {
          list.push({
            ...t,
            institution: t.institution || defaultInst,
            isDuplicate: true,
            isModified: true,
            category: getTransactionCategory(t, customKeywords, manualCategories),
          })
        }
      }
    }
    return list
  }, [importedAccounts, customKeywords, manualCategories])

  const ghostCount = useMemo(() => {
    let count = 0
    for (let i = 0; i < allTransactions.length; i++) {
      const t = allTransactions[i]
      if (period && !matchesPeriod(t.date, period)) continue
      if (selectedInstitution !== 'all' && t.institution !== selectedInstitution) continue
      if (selectedSubAccount !== 'all' && t.subAccount !== selectedSubAccount) continue
      if (t.isGhost) count++
    }
    return count
  }, [allTransactions, period, selectedInstitution, selectedSubAccount])

  const filteredTx = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const result: Transaction[] = []

    for (let i = 0; i < allTransactions.length; i++) {
      const t = allTransactions[i]
      if (!showGhost && t.isGhost) continue
      if (period && !matchesPeriod(t.date, period)) continue
      if (selectedInstitution !== 'all' && t.institution !== selectedInstitution) continue
      if (selectedSubAccount !== 'all' && t.subAccount !== selectedSubAccount) continue
      if (term) {
        const descMatch = t.description.toLowerCase().includes(term)
        const catMatch = t.category ? t.category.toLowerCase().includes(term) : false
        if (!descMatch && !catMatch) continue
      }
      result.push(t)
    }

    switch (sortOrder) {
      case 'newest':
        result.sort((a, b) => (b.date < a.date ? -1 : b.date > a.date ? 1 : 0))
        break
      case 'oldest':
        result.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
        break
      case 'highest':
        result.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
        break
      case 'lowest':
        result.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount))
        break
    }
    return result
  }, [allTransactions, showGhost, selectedInstitution, selectedSubAccount, searchTerm, sortOrder, period])

  return {
    allTransactions,
    filteredTx,
    searchTerm,
    setSearchTerm,
    selectedInstitution,
    setSelectedInstitution: handleSetSelectedInstitution,
    selectedSubAccount,
    setSelectedSubAccount,
    sortOrder,
    setSortOrder,
    showGhost,
    setShowGhost,
    ghostCount,
  }
}
