import { fireEvent, render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { BankAccountSummary } from '../../../hooks/useAccountBalances'
import type { TranslationStrings } from '../../../i18n/translations'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { StickyAccountSwitcher } from './StickyAccountSwitcher'

// Mock useDropdownPosition
vi.mock('../../../hooks/useDropdownPosition', () => ({
  useDropdownPosition: vi.fn(),
}))

const mockAccounts: BankAccountSummary[] = [
  {
    id: 'bank-1',
    name: 'Sparkasse',
    logo: '/logos/sparkasse.png',
    balance: 2500,
    income: 3000,
    expenses: 500,
    transactionCount: 15,
    accountIbans: ['DE123456'],
    subAccounts: [
      {
        name: 'Main Space',
        balance: 2000,
        income: 2500,
        expenses: 500,
        transactionCount: 10,
      },
      {
        name: 'Vacation',
        balance: 500,
        income: 500,
        expenses: 0,
        transactionCount: 5,
      },
    ],
  },
  {
    id: 'bank-2',
    name: 'N26',
    balance: 1200,
    income: 1500,
    expenses: 300,
    transactionCount: 8,
    accountIbans: ['DE654321'],
    subAccounts: [],
  },
]

describe('StickyAccountSwitcher', () => {
  const onSelectInstitution = vi.fn()
  const onSelectSubAccount = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useLanguageStore.setState({
      locale: 'en',
      t: {
        totalBalance: 'Total Balance',
        bankAccounts: 'Bank Accounts',
        allAccounts: 'All Accounts',
        allSubAccounts: 'All Spaces',
        institutions: 'Accounts',
      } as unknown as TranslationStrings,
    })
  })

  it('renders non-interactive static item when hasMultipleAccounts is false', () => {
    render(
      <StickyAccountSwitcher
        accounts={[mockAccounts[0]]}
        totalBalance={2500}
        totalTransactionCount={15}
        selectedInstitution="Sparkasse"
        onSelectInstitution={onSelectInstitution}
        selectedSubAccount="all"
        onSelectSubAccount={onSelectSubAccount}
        selectedAccountInfo={mockAccounts[0]}
        displayBalance={2500}
        hasMultipleAccounts={false}
      />,
    )

    expect(screen.queryByTestId('sticky-account-switcher-trigger')).not.toBeInTheDocument()
    expect(screen.getByText(/Sparkasse:/i)).toBeInTheDocument()
    expect(screen.getByText(/2,500/i)).toBeInTheDocument()
  })

  it('renders single account name and logo in static item even when selectedInstitution is all', () => {
    render(
      <StickyAccountSwitcher
        accounts={[mockAccounts[0]]}
        totalBalance={2500}
        totalTransactionCount={15}
        selectedInstitution="all"
        onSelectInstitution={onSelectInstitution}
        selectedSubAccount="all"
        onSelectSubAccount={onSelectSubAccount}
        selectedAccountInfo={null}
        displayBalance={2500}
        hasMultipleAccounts={false}
      />,
    )

    const staticContainer = screen.getByTestId('sticky-account-switcher-static')
    expect(staticContainer).toBeInTheDocument()
    expect(screen.getByText(/Sparkasse:/i)).toBeInTheDocument()
    const img = staticContainer.querySelector('img')
    expect(img).toHaveAttribute('src', '/logos/sparkasse.png')
    expect(screen.getByText(/2,500/i)).toBeInTheDocument()
  })

  it('renders interactive trigger when hasMultipleAccounts is true', () => {
    render(
      <StickyAccountSwitcher
        accounts={mockAccounts}
        totalBalance={3700}
        totalTransactionCount={23}
        selectedInstitution="all"
        onSelectInstitution={onSelectInstitution}
        selectedSubAccount="all"
        onSelectSubAccount={onSelectSubAccount}
        selectedAccountInfo={null}
        displayBalance={3700}
        hasMultipleAccounts={true}
      />,
    )

    const trigger = screen.getByTestId('sticky-account-switcher-trigger')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    expect(screen.getByText(/Total Balance:/i)).toBeInTheDocument()
    expect(screen.getByText(/3,700/i)).toBeInTheDocument()
  })

  it('opens dropdown on click and displays all accounts and individual institutions', () => {
    render(
      <StickyAccountSwitcher
        accounts={mockAccounts}
        totalBalance={3700}
        totalTransactionCount={23}
        selectedInstitution="all"
        onSelectInstitution={onSelectInstitution}
        selectedSubAccount="all"
        onSelectSubAccount={onSelectSubAccount}
        selectedAccountInfo={null}
        displayBalance={3700}
        hasMultipleAccounts={true}
      />,
    )

    const trigger = screen.getByTestId('sticky-account-switcher-trigger')
    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const dropdown = screen.getByTestId('sticky-account-switcher-dropdown')
    expect(dropdown).toBeInTheDocument()

    expect(screen.getByTestId('sticky-account-option-all')).toBeInTheDocument()
    expect(screen.getByTestId('sticky-account-option-bank-1')).toBeInTheDocument()
    expect(screen.getByTestId('sticky-account-option-bank-2')).toBeInTheDocument()
  })

  it('calls onSelectInstitution and closes dropdown when an institution is clicked', async () => {
    render(
      <StickyAccountSwitcher
        accounts={mockAccounts}
        totalBalance={3700}
        totalTransactionCount={23}
        selectedInstitution="all"
        onSelectInstitution={onSelectInstitution}
        selectedSubAccount="all"
        onSelectSubAccount={onSelectSubAccount}
        selectedAccountInfo={null}
        displayBalance={3700}
        hasMultipleAccounts={true}
      />,
    )

    const trigger = screen.getByTestId('sticky-account-switcher-trigger')
    fireEvent.click(trigger)
    fireEvent.click(screen.getByTestId('sticky-account-option-bank-1'))

    expect(onSelectInstitution).toHaveBeenCalledWith('Sparkasse')
    expect(onSelectSubAccount).toHaveBeenCalledWith('all')
    await waitForElementToBeRemoved(() => screen.queryByTestId('sticky-account-switcher-dropdown'))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders sub-accounts when bank with subaccounts is selected, and allows subaccount selection', async () => {
    render(
      <StickyAccountSwitcher
        accounts={mockAccounts}
        totalBalance={3700}
        totalTransactionCount={23}
        selectedInstitution="Sparkasse"
        onSelectInstitution={onSelectInstitution}
        selectedSubAccount="all"
        onSelectSubAccount={onSelectSubAccount}
        selectedAccountInfo={mockAccounts[0]}
        displayBalance={2500}
        hasMultipleAccounts={true}
      />,
    )

    const trigger = screen.getByTestId('sticky-account-switcher-trigger')
    fireEvent.click(trigger)

    // Sub-accounts should be visible because Sparkasse is the selected institution
    expect(screen.getByTestId('sticky-subaccount-option-Main Space')).toBeInTheDocument()
    expect(screen.getByTestId('sticky-subaccount-option-Vacation')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('sticky-subaccount-option-Vacation'))

    expect(onSelectSubAccount).toHaveBeenCalledWith('Vacation')
    await waitForElementToBeRemoved(() => screen.queryByTestId('sticky-account-switcher-dropdown'))
  })

  it('closes dropdown when Escape key is pressed', async () => {
    render(
      <StickyAccountSwitcher
        accounts={mockAccounts}
        totalBalance={3700}
        totalTransactionCount={23}
        selectedInstitution="all"
        onSelectInstitution={onSelectInstitution}
        selectedSubAccount="all"
        onSelectSubAccount={onSelectSubAccount}
        selectedAccountInfo={null}
        displayBalance={3700}
        hasMultipleAccounts={true}
      />,
    )

    fireEvent.click(screen.getByTestId('sticky-account-switcher-trigger'))
    expect(screen.getByTestId('sticky-account-switcher-dropdown')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitForElementToBeRemoved(() => screen.queryByTestId('sticky-account-switcher-dropdown'))
  })
})
