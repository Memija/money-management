import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { BankAccountSummary } from '../../../hooks/useAccountBalances'
import { AccountSelector } from './AccountSelector'

// Mock useFormatters
vi.mock('../../../hooks/useFormatters', () => ({
  useFormatters: () => ({
    formatCurrency: (n: number) => `${n.toFixed(2)} €`,
    formatTransactionCount: (n: number) => `${n} transactions`,
  }),
}))

// Mock useLanguageStore
vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: (selector?: (s: any) => any) => {
    const state = {
      t: {
        allAccounts: 'All Accounts',
        allSubAccounts: 'All Sub-accounts',
        subAccounts: 'Sub-accounts',
        bankAccounts: 'Bank Accounts',
        institutions: 'Accounts',
      },
    }
    return selector ? selector(state) : state
  },
}))

describe('AccountSelector', () => {
  const mockAccounts: BankAccountSummary[] = [
    {
      id: 'n26',
      name: 'N26',
      logo: '/banks/n26.png',
      balance: 1500,
      income: 3000,
      expenses: 1500,
      transactionCount: 25,
      accountIbans: ['DE12345'],
      subAccounts: [
        {
          name: 'Investment fund',
          balance: 800,
          income: 1000,
          expenses: 200,
          transactionCount: 10,
        },
        {
          name: 'Main account',
          balance: 700,
          income: 2000,
          expenses: 1300,
          transactionCount: 15,
        },
      ],
    },
    {
      id: 'commerzbank',
      name: 'Commerzbank',
      logo: '/banks/commerzbank.png',
      balance: 2400,
      income: 5000,
      expenses: 2600,
      transactionCount: 40,
      accountIbans: ['DE67890'],
      subAccounts: [],
    },
  ]

  it('renders nothing when accounts array is empty', () => {
    const { container } = render(
      <AccountSelector
        accounts={[]}
        totalBalance={0}
        totalTransactionCount={0}
        selectedInstitution="all"
        onSelectInstitution={vi.fn()}
        selectedSubAccount="all"
        onSelectSubAccount={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders All Accounts and individual bank cards with balances and badges', () => {
    render(
      <AccountSelector
        accounts={mockAccounts}
        totalBalance={3900}
        totalTransactionCount={65}
        selectedInstitution="all"
        onSelectInstitution={vi.fn()}
        selectedSubAccount="all"
        onSelectSubAccount={vi.fn()}
      />,
    )

    expect(screen.getByText('All Accounts')).toBeInTheDocument()
    expect(screen.getByText('3900.00 €')).toBeInTheDocument()
    expect(screen.getByText('65 transactions')).toBeInTheDocument()

    expect(screen.getByText('N26')).toBeInTheDocument()
    expect(screen.getByText('1500.00 €')).toBeInTheDocument()
    expect(screen.getByText('25 transactions')).toBeInTheDocument()

    expect(screen.getByText('Commerzbank')).toBeInTheDocument()
    expect(screen.getByText('2400.00 €')).toBeInTheDocument()
    expect(screen.getByText('40 transactions')).toBeInTheDocument()
  })

  it('fires onSelectInstitution when a card is clicked', () => {
    const onSelectInstitution = vi.fn()
    render(
      <AccountSelector
        accounts={mockAccounts}
        totalBalance={3900}
        totalTransactionCount={65}
        selectedInstitution="all"
        onSelectInstitution={onSelectInstitution}
        selectedSubAccount="all"
        onSelectSubAccount={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByTestId('account-card-n26'))
    expect(onSelectInstitution).toHaveBeenCalledWith('N26')
  })

  it('shows sub-account space pills when a bank with sub-accounts is selected', () => {
    const onSelectSubAccount = vi.fn()
    render(
      <AccountSelector
        accounts={mockAccounts}
        totalBalance={3900}
        totalTransactionCount={65}
        selectedInstitution="N26"
        onSelectInstitution={vi.fn()}
        selectedSubAccount="all"
        onSelectSubAccount={onSelectSubAccount}
      />,
    )

    expect(screen.getByText('All Sub-accounts')).toBeInTheDocument()
    expect(screen.getByText('Investment fund')).toBeInTheDocument()
    expect(screen.getByText('800.00 €')).toBeInTheDocument()
    expect(screen.getByText('Main account')).toBeInTheDocument()
    expect(screen.getByText('700.00 €')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('subaccount-pill-Investment fund'))
    expect(onSelectSubAccount).toHaveBeenCalledWith('Investment fund')
  })

  it('does NOT render Institutions section at all when only one bank is present', () => {
    const singleAccount = [mockAccounts[0]] // N26 only
    const { container } = render(
      <AccountSelector
        accounts={singleAccount}
        totalBalance={1500}
        totalTransactionCount={25}
        selectedInstitution="all"
        onSelectInstitution={vi.fn()}
        selectedSubAccount="all"
        onSelectSubAccount={vi.fn()}
      />,
    )

    // Entire section should NOT render at all
    expect(container.firstChild).toBeNull()
  })
})
