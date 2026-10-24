import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { BankAccountSummary } from '../../../hooks/useAccountBalances'
import { DashboardSubheader } from './DashboardSubheader'

describe('DashboardSubheader', () => {
  const mockBankAccount: BankAccountSummary = {
    id: '1',
    name: 'Sparkasse',
    transactionCount: 10,
    balance: 1000,
    income: 2000,
    expenses: 1000,
    accountIbans: [],
    subAccounts: [],
  }

  const defaultProps = {
    period: { mode: 'all' as const, value: '' },
    onPeriodChange: vi.fn(),
    availableYears: ['2024'],
    availableQuarters: ['2024-Q1'],
    availableMonths: ['2024-01'],
    minDate: '2024-01-01',
    maxDate: '2024-01-31',
    bankAccounts: [mockBankAccount],
    allAccountsBalance: 1000,
    allAccountsTxCount: 10,
    selectedInstitution: 'all',
    onSelectInstitution: vi.fn(),
    selectedSubAccount: 'all',
    onSelectSubAccount: vi.fn(),
    selectedAccountInfo: null,
    displayBalance: 1000,
    hasMultipleAccounts: false,
    isHeroInView: true,
    totalIncome: 2000,
    totalExpenses: 1000,
  }

  it('renders period filter and sticky account switcher', () => {
    render(<DashboardSubheader {...defaultProps} />)
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
  })

  it('renders sticky stats metrics when hero is out of view', () => {
    render(<DashboardSubheader {...defaultProps} isHeroInView={false} />)
    expect(screen.getByText(/2,000\.00/)).toBeInTheDocument()
    expect(screen.getAllByText(/1,000\.00/).length).toBeGreaterThan(0)
  })
})
