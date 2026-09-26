import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ImportedAccount } from '../../types'
import { useAccountBalances } from '../useAccountBalances'

const mockImportedAccounts: ImportedAccount[] = [
  {
    institutionId: 'n26',
    institutionName: 'N26',
    importedAt: '2026-03-01T10:00:00Z',
    importedFingerprints: [],
    accountIbans: ['DE89370400440532013000'],
    transactions: [
      {
        id: 'tx-n26-1',
        date: '2026-03-01',
        description: 'Salary Employer',
        amount: 3200,
        currency: 'EUR',
        type: 'income',
        category: 'Salary',
        institution: 'N26',
      },
      {
        id: 'tx-n26-2',
        date: '2026-03-02',
        description: 'Supermarket',
        amount: -120,
        currency: 'EUR',
        type: 'expense',
        category: 'Groceries',
        institution: 'N26',
      },
      // Internal transfer out to Commerzbank
      {
        id: 'tx-n26-transfer-out',
        date: '2026-03-05',
        description: 'Transfer to Commerzbank',
        amount: -500,
        currency: 'EUR',
        type: 'expense',
        category: 'Transfers',
        institution: 'N26',
        isGhost: true,
      },
      // Sub-account transactions
      {
        id: 'tx-n26-space-1',
        date: '2026-03-06',
        description: 'Investment ETF',
        amount: -300,
        currency: 'EUR',
        type: 'expense',
        category: 'Savings',
        institution: 'N26',
        subAccount: 'Investment fund',
      },
      {
        id: 'tx-n26-space-2',
        date: '2026-03-07',
        description: 'Car maintenance',
        amount: -80,
        currency: 'EUR',
        type: 'expense',
        category: 'Transport',
        institution: 'N26',
        subAccount: 'Wohnung und Auto',
      },
    ],
  },
  {
    institutionId: 'commerzbank',
    institutionName: 'Commerzbank',
    importedAt: '2026-03-02T10:00:00Z',
    importedFingerprints: [],
    transactions: [
      // Internal transfer in from N26
      {
        id: 'tx-cb-transfer-in',
        date: '2026-03-05',
        description: 'Transfer from N26',
        amount: 500,
        currency: 'EUR',
        type: 'income',
        category: 'Transfers',
        institution: 'Commerzbank',
        isGhost: true,
      },
      {
        id: 'tx-cb-1',
        date: '2026-03-08',
        description: 'Restaurant Dinner',
        amount: -60,
        currency: 'EUR',
        type: 'expense',
        category: 'Dining Out',
        institution: 'Commerzbank',
      },
    ],
  },
]

vi.mock('../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      importedAccounts: mockImportedAccounts,
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

describe('useAccountBalances', () => {
  it('calculates individual bank ledger balances, income, expenses, and logos correctly', () => {
    const { result } = renderHook(() => useAccountBalances())

    expect(result.current.hasMultipleAccounts).toBe(true)
    expect(result.current.accounts).toHaveLength(2)

    // N26: 3200 (salary) - 120 (groceries) - 500 (transfer out) - 300 (etf) - 80 (car) = 2200
    const n26 = result.current.accounts.find((a) => a.name === 'N26')!
    expect(n26).toBeDefined()
    expect(n26.balance).toBe(2200)
    expect(n26.income).toBe(3200)
    expect(n26.expenses).toBe(1000)
    expect(n26.transactionCount).toBe(5)
    expect(n26.logo).toBe('/banks/n26.png')

    // Commerzbank: +500 (transfer in) - 60 (dinner) = 440
    const cb = result.current.accounts.find((a) => a.name === 'Commerzbank')!
    expect(cb).toBeDefined()
    expect(cb.balance).toBe(440)
    expect(cb.income).toBe(500)
    expect(cb.expenses).toBe(60)
    expect(cb.transactionCount).toBe(2)
    expect(cb.logo).toBe('/banks/commerzbank.png')

    // Global Net Total: 2200 (N26) + 440 (Commerzbank) = 2640
    expect(result.current.totalBalance).toBe(2640)
    expect(result.current.totalTransactionCount).toBe(7)

    // Global income & expenses exclude internal transfer ghosts (3200 salary, 120 + 300 + 80 + 60 = 560 expenses)
    expect(result.current.totalIncome).toBe(3200)
    expect(result.current.totalExpenses).toBe(560)
    // 3200 - 560 = 2640
    expect(result.current.totalIncome - result.current.totalExpenses).toBe(2640)
  })

  it('correctly groups and calculates sub-accounts for institutions that have them', () => {
    const { result } = renderHook(() => useAccountBalances())
    const n26 = result.current.accounts.find((a) => a.name === 'N26')!

    expect(n26.subAccounts).toHaveLength(2)
    const investment = n26.subAccounts.find((s) => s.name === 'Investment fund')!
    expect(investment).toBeDefined()
    expect(investment.balance).toBe(-300)
    expect(investment.transactionCount).toBe(1)

    const auto = n26.subAccounts.find((s) => s.name === 'Wohnung und Auto')!
    expect(auto).toBeDefined()
    expect(auto.balance).toBe(-80)
    expect(auto.transactionCount).toBe(1)
  })
})
