import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Transaction } from '../../types'
import { useRecurringTransactions } from '../useRecurringTransactions'

describe('useRecurringTransactions hook', () => {
  it('detects recurring expenses but excludes ghost transactions', () => {
    const transactions: Transaction[] = [
      // Real recurring Netflix expense
      {
        id: 'tx-netflix-1',
        date: '2026-06-01',
        description: 'Netflix Monthly Subscription',
        amount: -15.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-netflix-2',
        date: '2026-07-01',
        description: 'Netflix Monthly Subscription',
        amount: -15.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      // Recurring internal transfer between own accounts (marked as ghost)
      {
        id: 'tx-ghost-1',
        date: '2026-06-01',
        description: 'Monthly Transfer to N26 Account',
        amount: -500,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
        isGhost: true,
      },
      {
        id: 'tx-ghost-2',
        date: '2026-07-01',
        description: 'Monthly Transfer to N26 Account',
        amount: -500,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
        isGhost: true,
      },
    ]

    const { result } = renderHook(() => useRecurringTransactions(transactions))

    // Should identify Netflix as recurring
    expect(result.current.recurringExpenses).toHaveLength(1)
    expect(result.current.recurringExpenses[0].amount).toBe(15.99)
    expect(result.current.totalMonthly).toBe(15.99)

    // Ghost transfers must be completely excluded
    expect(result.current.recurringExpenses.some((r) => r.name.toLowerCase().includes('n26'))).toBe(
      false,
    )
  })

  it('excludes recurring transactions from years ago when a later year timeframe is selected', () => {
    const transactions: Transaction[] = [
      // 3 recurring gym transactions at the start of a multi-year dataset (in 2021)
      {
        id: 'tx-gym-1',
        date: '2021-01-05',
        description: 'FitX Gym Membership',
        amount: -35.0,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-gym-2',
        date: '2021-02-05',
        description: 'FitX Gym Membership',
        amount: -35.0,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-gym-3',
        date: '2021-03-05',
        description: 'FitX Gym Membership',
        amount: -35.0,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      // Active Netflix recurring in 2024
      {
        id: 'tx-netflix-2024-1',
        date: '2024-01-15',
        description: 'Netflix Monthly',
        amount: -17.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-netflix-2024-2',
        date: '2024-02-15',
        description: 'Netflix Monthly',
        amount: -17.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-netflix-2024-3',
        date: '2024-03-15',
        description: 'Netflix Monthly',
        amount: -17.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
    ]

    // When the user selects year 2024 ("the correct timeframe")
    const { result } = renderHook(() =>
      useRecurringTransactions(transactions, { mode: 'year', value: '2024' }),
    )

    // Gym from 2021 must be excluded in 2024
    expect(result.current.recurringExpenses).toHaveLength(1)
    expect(result.current.recurringExpenses[0].name).toBe('Netflix Monthly')
    expect(result.current.recurringExpenses[0].amount).toBe(17.99)
    expect(result.current.recurringExpenses[0].transactionCount).toBe(3)
    expect(result.current.totalMonthly).toBe(17.99)
    expect(result.current.recurringExpenses.some((r) => r.name.includes('FitX'))).toBe(false)
  })

  it('excludes early recurring transactions in a multi-year timeframe when period is all', () => {
    const transactions: Transaction[] = [
      // 3 recurring transactions at the start of a 3-year timeframe (early 2021)
      {
        id: 'tx-gym-1',
        date: '2021-01-05',
        description: 'FitX Gym Membership',
        amount: -35.0,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-gym-2',
        date: '2021-02-05',
        description: 'FitX Gym Membership',
        amount: -35.0,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-gym-3',
        date: '2021-03-05',
        description: 'FitX Gym Membership',
        amount: -35.0,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      // Active Spotify subscription currently ongoing up to late 2024
      {
        id: 'tx-spotify-1',
        date: '2024-10-01',
        description: 'Spotify Premium',
        amount: -10.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-spotify-2',
        date: '2024-11-01',
        description: 'Spotify Premium',
        amount: -10.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-spotify-3',
        date: '2024-12-01',
        description: 'Spotify Premium',
        amount: -10.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
    ]

    // Multi-year dataset spanning 2021 to 2024, period mode is 'all'
    const { result } = renderHook(() =>
      useRecurringTransactions(transactions, { mode: 'all', value: '' }),
    )

    // FitX gym stopped 3 years ago at the start of the timeframe -> excluded
    // Spotify is active at the end of the timeframe -> included
    expect(result.current.recurringExpenses).toHaveLength(1)
    expect(result.current.recurringExpenses[0].name).toBe('Spotify Premium')
    expect(result.current.recurringExpenses[0].amount).toBe(10.99)
    expect(result.current.totalMonthly).toBe(10.99)
    expect(result.current.recurringExpenses.some((r) => r.name.includes('FitX'))).toBe(false)
  })

  it('adjusts correctly to a single month timeframe, including recurring charges that occurred in that month', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-netflix-apr',
        date: '2024-04-15',
        description: 'Netflix Monthly',
        amount: -15.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-netflix-may',
        date: '2024-05-15',
        description: 'Netflix Monthly',
        amount: -15.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-netflix-jun',
        date: '2024-06-15',
        description: 'Netflix Monthly',
        amount: -15.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      // Non-recurring one-off payment in May
      {
        id: 'tx-flight-may',
        date: '2024-05-02',
        description: 'Lufthansa Flight to Berlin',
        amount: -250.0,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      // Old recurring gym from 2021 (no transactions in May 2024)
      {
        id: 'tx-gym-2021-1',
        date: '2021-01-10',
        description: 'Old Gym',
        amount: -30.0,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-gym-2021-2',
        date: '2021-02-10',
        description: 'Old Gym',
        amount: -30.0,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
    ]

    // Select month May 2024
    const { result } = renderHook(() =>
      useRecurringTransactions(transactions, { mode: 'month', value: '2024-05' }),
    )

    // Should include Netflix with 1 charge in May, and exclude flight and old 2021 gym
    expect(result.current.recurringExpenses).toHaveLength(1)
    expect(result.current.recurringExpenses[0].name).toBe('Netflix Monthly')
    expect(result.current.recurringExpenses[0].amount).toBe(15.99)
    expect(result.current.recurringExpenses[0].transactionCount).toBe(1)
    expect(result.current.recurringExpenses[0].transactionIds).toEqual(['tx-netflix-may'])
    expect(result.current.totalMonthly).toBe(15.99)
  })

  it('adjusts correctly to a quarter timeframe', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-sub-jan',
        date: '2024-01-10',
        description: 'iCloud Storage',
        amount: -2.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-sub-feb',
        date: '2024-02-10',
        description: 'iCloud Storage',
        amount: -2.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-sub-mar',
        date: '2024-03-10',
        description: 'iCloud Storage',
        amount: -2.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-sub-apr',
        date: '2024-04-10',
        description: 'iCloud Storage',
        amount: -2.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
    ]

    // Select quarter 2024-Q1 (Jan-Mar)
    const { result } = renderHook(() =>
      useRecurringTransactions(transactions, { mode: 'quarter', value: '2024-Q1' }),
    )

    expect(result.current.recurringExpenses).toHaveLength(1)
    expect(result.current.recurringExpenses[0].name).toBe('iCloud Storage')
    expect(result.current.recurringExpenses[0].transactionCount).toBe(3)
    expect(result.current.totalMonthly).toBe(2.99)
  })

  it('detects monthly credit transfers with varying SEPA End-to-End-Ref across months', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-credit-1',
        date: '2026-06-01',
        description:
          'Anel o. Biljana Memic (3696413) GENODEF1S01 DE36550905000003696413 Kreditrate End-to-End-Ref.: CCB.338.UE.248923',
        amount: -350,
        currency: 'EUR',
        type: 'expense',
        institution: 'Volksbank',
      },
      {
        id: 'tx-credit-2',
        date: '2026-07-01',
        description:
          'Anel o. Biljana Memic (3696413) GENODEF1S01 DE36550905000003696413 Kreditrate End-to-End-Ref.: CCB.369.UE.251234',
        amount: -350,
        currency: 'EUR',
        type: 'expense',
        institution: 'Volksbank',
      },
    ]

    const { result } = renderHook(() => useRecurringTransactions(transactions))

    expect(result.current.recurringExpenses).toHaveLength(1)
    expect(result.current.recurringExpenses[0].name).toBe('Anel o. Biljana Memic')
    expect(result.current.recurringExpenses[0].amount).toBe(350)
    expect(result.current.recurringExpenses[0].category).toBe('Loans')
    expect(result.current.recurringExpenses[0].frequency).toBe('monthly')
    expect(result.current.totalMonthly).toBe(350)
  })

  it('detects monthly credit transfers with generic description and distinct partner, ignoring one-offs', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-ct-jun',
        date: '2026-06-15',
        description: 'Credit Transfer',
        partner: 'Santander Consumer Bank',
        amount: -250,
        currency: 'EUR',
        type: 'expense',
        institution: 'N26',
      },
      {
        id: 'tx-ct-jul',
        date: '2026-07-15',
        description: 'Credit Transfer',
        partner: 'Santander Consumer Bank',
        amount: -250,
        currency: 'EUR',
        type: 'expense',
        institution: 'N26',
      },
      // Unrelated one-off transfer with generic description
      {
        id: 'tx-ct-friend',
        date: '2026-06-20',
        description: 'Credit Transfer',
        partner: 'Alice',
        amount: -35,
        currency: 'EUR',
        type: 'expense',
        institution: 'N26',
      },
    ]

    const { result } = renderHook(() => useRecurringTransactions(transactions))

    expect(result.current.recurringExpenses).toHaveLength(1)
    expect(result.current.recurringExpenses[0].name).toBe('Santander Consumer Bank')
    expect(result.current.recurringExpenses[0].amount).toBe(250)
    expect(result.current.totalMonthly).toBe(250)
  })

  it('detects monthly credit transfer with installment numbers and calendar interval shifts', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-loan-1',
        date: '2026-01-28',
        description: 'Credit Transfer - Santander Consumer Bank Rate 01',
        amount: -220,
        currency: 'EUR',
        type: 'expense',
        institution: 'ING',
      },
      {
        id: 'tx-loan-2',
        date: '2026-02-23', // 26 days later (calendar shift due to short February)
        description: 'Credit Transfer - Santander Consumer Bank Rate 02',
        amount: -220,
        currency: 'EUR',
        type: 'expense',
        institution: 'ING',
      },
    ]

    const { result } = renderHook(() => useRecurringTransactions(transactions))

    expect(result.current.recurringExpenses).toHaveLength(1)
    expect(result.current.recurringExpenses[0].name).toBe('Santander Consumer Bank')
    expect(result.current.recurringExpenses[0].amount).toBe(220)
    expect(result.current.totalMonthly).toBe(220)
  })

  it('detects monthly credit transfers without partner by amount bucketing', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx-ct-1',
        date: '2026-05-01',
        description: 'Credit Transfer',
        amount: -200,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      {
        id: 'tx-ct-2',
        date: '2026-06-01',
        description: 'Credit Transfer',
        amount: -200,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
      // Non-recurring one-off transfer of different amount
      {
        id: 'tx-ct-diff',
        date: '2026-05-15',
        description: 'Credit Transfer',
        amount: -55,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      },
    ]

    const { result } = renderHook(() => useRecurringTransactions(transactions))

    expect(result.current.recurringExpenses).toHaveLength(1)
    expect(result.current.recurringExpenses[0].amount).toBe(200)
    expect(result.current.totalMonthly).toBe(200)
  })

  it('detects multiple concurrent recurring credit transfers and loan payments to the same payee', async () => {
    const fs = await import('fs')
    const { splitCsvLine } = await import('../../utils/parsers/helpers')
    const { rowsToTransactionsWithMeta } = await import('../../utils/parsers/csv-parser')

    const buffer = fs.readFileSync('data/DE92500400000646293100_EUR_15-09-2026_2257.csv')
    let text = new TextDecoder('utf-8').decode(buffer)
    if (text.includes('\uFFFD')) {
      text = new TextDecoder('iso-8859-1').decode(buffer)
    }
    text = text.replace(/^\uFEFF/, '')
    const rows = text
      .trim()
      .split('\n')
      .map((line) => splitCsvLine(line.replace(/\r$/, ''), ';'))
    const { transactions: txs } = rowsToTransactionsWithMeta(rows, 'Commerzbank')

    const { result } = renderHook(() => useRecurringTransactions(txs))

    const loanExpenses = result.current.recurringExpenses.filter(
      (r) => r.name.toLowerCase().includes('biljana') || r.name.toLowerCase().includes('anel o.'),
    )
    expect(loanExpenses).toHaveLength(1)
    const mergedLoan = loanExpenses[0]
    expect(mergedLoan).toBeDefined()
    expect(mergedLoan.name).toBe('Anel O. Biljana Memic')
    expect(mergedLoan.amount).toBe(1502.58)
    expect(mergedLoan.frequency).toBe('monthly')
    expect(mergedLoan.transactionCount).toBe(114) // 57 + 57

    // Single-month view (September 2026)
    const { result: monthResult } = renderHook(() =>
      useRecurringTransactions(txs, { mode: 'month', value: '2026-09' }),
    )
    const monthLoan = monthResult.current.recurringExpenses.filter(
      (r) => r.name.toLowerCase().includes('biljana') || r.name.toLowerCase().includes('anel o.'),
    )
    expect(monthLoan).toHaveLength(1)
    expect(monthLoan[0].amount).toBe(1502.58)
    expect(monthLoan[0].transactionCount).toBe(2)

    // Year view (2026)
    const { result: yearResult } = renderHook(() =>
      useRecurringTransactions(txs, { mode: 'year', value: '2026' }),
    )
    const yearLoan = yearResult.current.recurringExpenses.filter(
      (r) => r.name.toLowerCase().includes('biljana') || r.name.toLowerCase().includes('anel o.'),
    )
    expect(yearLoan).toHaveLength(1)
    expect(yearLoan[0].amount).toBe(1502.58)
    expect(yearLoan[0].transactionCount).toBe(18) // 9 + 9
  })
})
