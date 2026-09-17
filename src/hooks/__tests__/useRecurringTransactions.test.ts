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
    expect(
      result.current.recurringExpenses.some((r) => r.name.toLowerCase().includes('n26')),
    ).toBe(false)
  })
})
