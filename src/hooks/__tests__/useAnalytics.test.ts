import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Transaction } from '../../types'
import { type PeriodFilter, useAnalytics } from '../useAnalytics'

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
        description: 'MAX MUSTERMANN N26 Transfer',
        amount: -500,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
        isGhost: true,
      },
      {
        id: 'tx-ghost-in',
        date: '2026-08-11',
        description: 'MAX MUSTERMANN Commerzbank Top-up',
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
    expect(merchantNames).not.toContain('MAX MUSTERMANN N26 Transfer')
  })

  it('includes ghost transactions when includeGhosts is true for single account view', () => {
    const commerzbankTxs: Transaction[] = [
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
      {
        id: 'tx-ghost-out',
        date: '2026-08-10',
        description: 'Transfer to N26',
        amount: -500,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
        isGhost: true,
      },
    ]

    const { result } = renderHook(() =>
      useAnalytics(commerzbankTxs, period, formatMonthYear, 'cat-color-', true),
    )

    // With includeGhosts: true, the -500 transfer out is counted for this account's cashflow & balance
    expect(result.current.totalIncome).toBe(3000)
    expect(result.current.totalExpenses).toBe(650) // 150 + 500
    expect(result.current.balance).toBe(2350) // 3000 - 650 = 2350
    expect(result.current.periodTransactions).toHaveLength(3)
  })

  it('maintains true ledger balance in total view even when ghost transfers are excluded from income and expenses', () => {
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
      {
        id: 'tx-ghost-out',
        date: '2026-08-10',
        description: 'Transfer to Savings',
        amount: -500,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
        isGhost: true,
      },
    ]

    // In total view (includeGhosts: false), income and expenses exclude internal transfers,
    // but the true ledger balance still deducts the transfer
    const { result } = renderHook(() =>
      useAnalytics(transactions, period, formatMonthYear, 'cat-color-', false),
    )

    expect(result.current.totalIncome).toBe(3000)
    expect(result.current.totalExpenses).toBe(150)
    expect(result.current.balance).toBe(2350) // 3000 - 150 - 500 = 2350
    expect(result.current.periodTransactions).toHaveLength(2)
  })

  it('generates continuous monthlyCategoryData with 0s for months without expenses', () => {
    const sparseTxs: Transaction[] = [
      {
        id: 'tx-1',
        date: '2026-01-15',
        description: 'Doctor Visit',
        amount: -100,
        currency: 'EUR',
        type: 'expense',
        category: 'Health',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-2',
        date: '2026-04-20',
        description: 'Dentist Checkup',
        amount: -200,
        currency: 'EUR',
        type: 'expense',
        category: 'Health',
        institution: 'Commerzbank',
      },
    ]

    const { result } = renderHook(() => useAnalytics(sparseTxs, period, formatMonthYear))

    // Between 2026-01 and 2026-04 there are 4 months: 01, 02, 03, 04
    expect(result.current.monthlyCategoryData).toHaveLength(4)
    expect(result.current.monthlyCategoryData.map((d) => d.month)).toEqual([
      '2026-01',
      '2026-02',
      '2026-03',
      '2026-04',
    ])
    // 2026-01 has Health: 100
    expect(result.current.monthlyCategoryData[0].Health).toBe(100)
    // 2026-02 and 2026-03 have Health: 0
    expect(result.current.monthlyCategoryData[1].Health).toBe(0)
    expect(result.current.monthlyCategoryData[2].Health).toBe(0)
    // 2026-04 has Health: 200
    expect(result.current.monthlyCategoryData[3].Health).toBe(200)
  })

  it('respects targetMonthRange parameter when provided', () => {
    const singleTx: Transaction[] = [
      {
        id: 'tx-1',
        date: '2026-03-10',
        description: 'Pharmacy',
        amount: -50,
        currency: 'EUR',
        type: 'expense',
        category: 'Health',
        institution: 'Commerzbank',
      },
    ]

    const targetMonths = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']

    const { result } = renderHook(() =>
      useAnalytics(singleTx, period, formatMonthYear, 'cat-color-', false, targetMonths),
    )

    expect(result.current.monthlyCategoryData).toHaveLength(6)
    expect(result.current.monthlyCategoryData.map((d) => d.month)).toEqual(targetMonths)
    expect(result.current.monthlyCategoryData[2].Health).toBe(50)
    expect(result.current.monthlyCategoryData[0].Health).toBe(0)
    expect(result.current.monthlyCategoryData[5].Health).toBe(0)
  })
})

