import { useMemo } from 'react'

import { findInstitution } from '../data/institutions'
import { useAppStore } from '../store/useAppStore'
import type { Transaction } from '../types'

export interface SubAccountSummary {
  name: string
  balance: number
  income: number
  expenses: number
  transactionCount: number
}

export interface BankAccountSummary {
  id: string
  name: string
  logo?: string
  balance: number
  income: number
  expenses: number
  transactionCount: number
  accountIbans: string[]
  subAccounts: SubAccountSummary[]
}

export interface AccountBalancesResult {
  accounts: BankAccountSummary[]
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  totalTransactionCount: number
  hasMultipleAccounts: boolean
}

/**
 * Calculates real-time ledger balances, income, expenses, and transaction counts
 * per bank institution and per sub-account, as well as global aggregated totals.
 */
export function useAccountBalances(): AccountBalancesResult {
  const importedAccounts = useAppStore((s) => s.importedAccounts)

  return useMemo(() => {
    if (!importedAccounts || importedAccounts.length === 0) {
      return {
        accounts: [],
        totalBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        totalTransactionCount: 0,
        hasMultipleAccounts: false,
      }
    }

    let globalBalance = 0
    let globalIncome = 0
    let globalExpenses = 0
    let globalTxCount = 0

    const accounts: BankAccountSummary[] = importedAccounts.map((account) => {
      const allTxs: Transaction[] = [
        ...(account.transactions || []),
        ...(account.duplicateTransactions || []),
        ...(account.modifiedTransactions || []),
      ]

      let accBalance = 0
      let accIncome = 0
      let accExpenses = 0

      const subAccountMap = new Map<
        string,
        { balance: number; income: number; expenses: number; count: number }
      >()

      for (const tx of allTxs) {
        const amt = Number(tx.amount) || 0
        accBalance += amt

        if (amt > 0) {
          accIncome += amt
        } else if (amt < 0) {
          accExpenses += Math.abs(amt)
        }

        // Global income/expenses exclude ghost internal transfers to prevent double counting
        if (!tx.isGhost) {
          if (amt > 0) {
            globalIncome += amt
          } else if (amt < 0) {
            globalExpenses += Math.abs(amt)
          }
        }

        // Sub-account tracking
        const subName = (tx.subAccount || '').trim()
        if (subName) {
          const existing = subAccountMap.get(subName) || {
            balance: 0,
            income: 0,
            expenses: 0,
            count: 0,
          }
          existing.balance += amt
          if (amt > 0) {
            existing.income += amt
          } else if (amt < 0) {
            existing.expenses += Math.abs(amt)
          }
          existing.count += 1
          subAccountMap.set(subName, existing)
        }
      }

      globalBalance += accBalance
      globalTxCount += allTxs.length

      const subAccounts: SubAccountSummary[] = Array.from(subAccountMap.entries())
        .map(([name, data]) => ({
          name,
          balance: Math.round(data.balance * 100) / 100,
          income: Math.round(data.income * 100) / 100,
          expenses: Math.round(data.expenses * 100) / 100,
          transactionCount: data.count,
        }))
        .sort((a, b) => b.transactionCount - a.transactionCount)

      const institutionData = findInstitution(account.institutionName || account.institutionId)

      return {
        id: account.institutionId || account.institutionName,
        name: account.institutionName,
        logo: institutionData?.logo,
        balance: Math.round(accBalance * 100) / 100,
        income: Math.round(accIncome * 100) / 100,
        expenses: Math.round(accExpenses * 100) / 100,
        transactionCount: allTxs.length,
        accountIbans: account.accountIbans || [],
        subAccounts,
      }
    })

    return {
      accounts,
      totalBalance: Math.round(globalBalance * 100) / 100,
      totalIncome: Math.round(globalIncome * 100) / 100,
      totalExpenses: Math.round(globalExpenses * 100) / 100,
      totalTransactionCount: globalTxCount,
      hasMultipleAccounts: accounts.length > 1,
    }
  }, [importedAccounts])
}
