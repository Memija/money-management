import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Transaction } from '../../types'
import { type PeriodFilter,useAnalytics } from '../useAnalytics'

describe('useAnalytics hook', () => {
  const period: PeriodFilter = { mode: 'all', value: '' }
  const formatMonthYear = (d: string) => d.substring(0, 7)

  it('excludes ghost transactions from totalIncome, totalExpenses, and balances', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        date: '2026-08-01',
        description: 'Monthly Salary',
        amount: 3000,
        currency: 'EUR',
        type: 'income',
        category: 'Salary',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-2',
        date: '2026-08-05',
        description: 'Groceries Supermarket',
        amount: -150,
        currency: 'EUR',
        type: 'expense',
        category: 'Groceries',
        institution: 'Commerzbank',
      },
      // Ghost internal transfers between user's own accounts
      {
        id: 'tx-ghost-out',
        date: '2026-08-10',
        description: 'ANEL MEMIC N26 Transfer',
        amount: -500,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
        isGhost: true,
      },
      {
        id: 'tx-ghost-in',
        date: '2026-08-11',
        description: 'ANEL MEMIC Commerzbank Top-up',
        amount: 500,
        currency: 'EUR',
        type: 'income',
        institution: 'N26',
        isGhost: true,
      },
    ]

    const { result } = renderHook(() => useAnalytics(transactions, period, formatMonthYear))

    // Total income should only be 3000 (salary), NOT 3500
    expect(result.current.totalIncome).toBe(3000)
    expect(result.current.incomeCount).toBe(1)

    // Total expenses should only be 150 (groceries), NOT 650
    expect(result.current.totalExpenses).toBe(150)
    expect(result.current.expenseCount).toBe(1)

    // Balance should be 3000 - 150 = 2850
    expect(result.current.balance).toBe(2850)

    // Period transactions should only contain the 2 non-ghost transactions
    expect(result.current.periodTransactions).toHaveLength(2)
    expect(result.current.periodTransactions.map((t) => t.id)).toEqual(['tx-1', 'tx-2'])

    // Top merchants should not include ghost counterparties
    const merchantNames = result.current.topMerchants.map((m) => m.name)
    expect(merchantNames).not.toContain('ANEL MEMIC N26 Transfer')
  })
})
