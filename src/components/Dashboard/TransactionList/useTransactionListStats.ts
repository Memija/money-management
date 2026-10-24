import { useMemo } from 'react'

import type { TranslationStrings } from '../../../i18n/types'
import type { CustomCategory, Transaction } from '../../../types'
import { hasMerchantLogo } from '../../../utils/category-icons'
import { getCategoryLabel } from '../../../utils/category-utils'
import type { StatPillInfo } from './TransactionListHeader'

import headerStyles from './TransactionListHeader.module.css'

export type TypeFilter = 'all' | 'income' | 'expense' | 'transfers' | 'duplicates' | 'modified'

interface UseTransactionListStatsParams {
  filteredTx: Transaction[]
  categoryFilter: string
  typeFilter: TypeFilter
  ghostCount: number
  t: TranslationStrings
  locale: string
  customCategories: CustomCategory[]
  formatCurrency: (amount: number) => string
}

export interface TransactionListStatsResult {
  normalTx: Transaction[]
  ghostTx: Transaction[]
  duplicateTx: Transaction[]
  modifiedTx: Transaction[]
  duplicateCount: number
  modifiedCount: number
  incomeCount: number
  expenseCount: number
  hasGhosts: boolean
  effectiveGhostCount: number
  statPillInfo: StatPillInfo
}

export function useTransactionListStats({
  filteredTx,
  categoryFilter,
  typeFilter,
  ghostCount,
  t,
  locale,
  customCategories,
  formatCurrency,
}: UseTransactionListStatsParams): TransactionListStatsResult {
  // Single-pass computation for filtered categories, types, counts, and financial totals
  const {
    normalTx,
    ghostTx,
    duplicateTx,
    modifiedTx,
    duplicateCount,
    modifiedCount,
    incomeCount,
    expenseCount,
    incomeTotal,
    expenseTotal,
    netBalance,
    totalGhostCount,
  } = useMemo(() => {
    const isAllCat = categoryFilter === 'all'
    const isWithoutLogos = categoryFilter === 'without-logos'
    const normal: Transaction[] = []
    const ghost: Transaction[] = []
    const duplicate: Transaction[] = []
    const modified: Transaction[] = []

    let incCount = 0
    let expCount = 0
    let incTot = 0
    let expTot = 0
    let totalGhosts = 0

    for (let i = 0; i < filteredTx.length; i++) {
      const tx = filteredTx[i]
      if (tx.isGhost) {
        totalGhosts++
        if (isAllCat) {
          ghost.push(tx)
        }
        continue
      }

      if (isWithoutLogos) {
        if (hasMerchantLogo(tx.description, tx.counterpartyIban)) {
          continue
        }
      } else if (!isAllCat) {
        if (!tx.category || tx.category !== categoryFilter) {
          continue
        }
      }

      normal.push(tx)
      const isMod = Boolean(tx.isModified)
      const isDup = Boolean(tx.isDuplicate || tx.forceImport || tx.importedByRuleId)

      if (isMod) {
        modified.push(tx)
      } else if (isDup) {
        duplicate.push(tx)
      }

      const amt = Math.abs(tx.amount)
      if (tx.type === 'income') {
        incCount++
        incTot += amt
      } else {
        expCount++
        expTot += amt
      }
    }

    return {
      normalTx: normal,
      ghostTx: ghost,
      duplicateTx: duplicate,
      modifiedTx: modified,
      duplicateCount: duplicate.length,
      modifiedCount: modified.length,
      incomeCount: incCount,
      expenseCount: expCount,
      incomeTotal: incTot,
      expenseTotal: expTot,
      netBalance: incTot - expTot,
      totalGhostCount: totalGhosts,
    }
  }, [filteredTx, categoryFilter])

  const hasGhosts = ghostCount > 0 || totalGhostCount > 0
  const effectiveGhostCount = categoryFilter === 'all' ? ghostCount || totalGhostCount : 0

  // Dynamic stat pills reflecting active category and type filters
  const statPillInfo = useMemo<StatPillInfo>(() => {
    let countLabel: string
    let countValue: number

    if (typeFilter === 'transfers') {
      countLabel = t.internalTransfers || 'Transfers'
    } else if (categoryFilter !== 'all') {
      countLabel = getCategoryLabel(categoryFilter, t, locale, customCategories)
    } else if (typeFilter === 'duplicates') {
      countLabel = t.duplicate || 'Duplicates'
    } else if (typeFilter === 'modified') {
      countLabel = t.modified || 'Modified'
    } else if (typeFilter === 'income') {
      countLabel = t.income || 'Income'
    } else if (typeFilter === 'expense') {
      countLabel = t.expenses || 'Expenses'
    } else {
      countLabel = t.all || 'All'
    }

    if (typeFilter === 'transfers') {
      countValue = effectiveGhostCount
    } else if (typeFilter === 'duplicates') {
      countValue = duplicateCount
    } else if (typeFilter === 'modified') {
      countValue = modifiedCount
    } else if (typeFilter === 'income') {
      countValue = incomeCount
    } else if (typeFilter === 'expense') {
      countValue = expenseCount
    } else {
      countValue = normalTx.length
    }

    let amountLabel: string
    let amountClass: string
    let formattedAmount: string

    if (typeFilter === 'transfers') {
      amountLabel = `${t.totalBalance || 'Total Balance'} (0 impact)`
      amountClass = headerStyles.statNeutral
      formattedAmount = formatCurrency(0)
    } else if (typeFilter === 'income') {
      amountLabel = t.totalIncome || t.income || 'Income'
      amountClass = headerStyles.statIncome
      formattedAmount = `${incomeTotal > 0 ? '+' : ''}${formatCurrency(incomeTotal)}`
    } else if (typeFilter === 'expense') {
      amountLabel = t.totalExpenses || t.expenses || 'Expenses'
      amountClass = headerStyles.statExpense
      formattedAmount = `${expenseTotal > 0 ? '-' : ''}${formatCurrency(expenseTotal)}`
    } else if (categoryFilter !== 'all') {
      amountLabel = t.categoryBalance || 'Category Balance'
      amountClass = netBalance >= 0 ? headerStyles.statIncome : headerStyles.statExpense
      formattedAmount = `${netBalance >= 0 ? '+' : ''}${formatCurrency(netBalance)}`
    } else {
      amountLabel = t.totalBalance || 'Total Balance'
      amountClass = netBalance >= 0 ? headerStyles.statIncome : headerStyles.statExpense
      formattedAmount = `${netBalance >= 0 ? '+' : ''}${formatCurrency(netBalance)}`
    }

    return {
      countLabel,
      countValue,
      amountLabel,
      formattedAmount,
      amountClass,
    }
  }, [
    categoryFilter,
    typeFilter,
    t,
    locale,
    customCategories,
    effectiveGhostCount,
    duplicateCount,
    modifiedCount,
    incomeCount,
    expenseCount,
    normalTx.length,
    incomeTotal,
    expenseTotal,
    netBalance,
    formatCurrency,
  ])

  return {
    normalTx,
    ghostTx,
    duplicateTx,
    modifiedTx,
    duplicateCount,
    modifiedCount,
    incomeCount,
    expenseCount,
    hasGhosts,
    effectiveGhostCount,
    statPillInfo,
  }
}
