import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppStore } from '../../../store/useAppStore'
import { isLocalEnvironment } from '../../../utils/env-utils'
import { AdvancedSettings } from './AdvancedSettings'

vi.mock('../../../utils/env-utils', () => ({
  isLocalEnvironment: vi.fn(() => true),
}))

// Mock useLanguageStore
vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      locale: 'en',
      t: {
        advancedSettingsTitle: 'Advanced Settings',
        advancedSettingsDesc: 'Configure advanced preferences and specialized transaction filters.',
        filterWithoutLogosTitle: 'Filter transactions without logos',
        filterWithoutLogosDesc:
          'Applies only to All Transactions at the bottom of the dashboard and displays transactions without logos.',
        filterWithoutLogosInfo:
          'This option helps you identify transactions and merchants that do not yet have an assigned brand logo.',
        filterWithoutLogosBadge: 'Without logos',
        detachTransactionsTitle: 'Detach all transactions from dashboard',
        detachTransactionsDesc:
          'Keep filters in All Transactions independent so changes do not affect charts, balances, and metrics.',
        active: 'Active',
        inactive: 'Inactive',
        transactions: 'transactions',
        allAccounts: 'All Accounts',
      },
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

describe('AdvancedSettings', () => {
  beforeEach(() => {
    vi.mocked(isLocalEnvironment).mockReturnValue(true)
    useAppStore.setState({
      filterTransactionsWithoutLogos: false,
      detachTransactionsFromDashboard: false,
      importedAccounts: [],
    })
  })

  it('renders header, title, description, and toggle option in inactive state by default', () => {
    render(<AdvancedSettings />)

    expect(screen.getByText('Advanced Settings')).toBeInTheDocument()
    expect(
      screen.getByText('Configure advanced preferences and specialized transaction filters.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Filter transactions without logos')).toBeInTheDocument()
    expect(screen.getByText('Detach all transactions from dashboard')).toBeInTheDocument()
    expect(screen.getAllByText('Inactive').length).toBe(2)

    const toggle = screen.getByRole('switch', { name: 'Filter transactions without logos' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles filterTransactionsWithoutLogos when clicked', () => {
    render(<AdvancedSettings />)

    const toggle = screen.getByTestId('toggle-filter-without-logos')
    fireEvent.click(toggle)

    expect(useAppStore.getState().filterTransactionsWithoutLogos).toBe(true)

    // Re-render with new state
    render(<AdvancedSettings />)
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
  })

  it('toggles detachTransactionsFromDashboard when clicked', () => {
    render(<AdvancedSettings />)

    const toggle = screen.getByTestId('toggle-detach-transactions-setting')
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(toggle)
    expect(useAppStore.getState().detachTransactionsFromDashboard).toBe(true)
  })

  it('hides filterTransactionsWithoutLogos option and its infoBox when not in local environment', () => {
    vi.mocked(isLocalEnvironment).mockReturnValue(false)
    render(<AdvancedSettings />)

    expect(screen.queryByText('Filter transactions without logos')).not.toBeInTheDocument()
    expect(screen.queryByTestId('toggle-filter-without-logos')).not.toBeInTheDocument()
    expect(
      screen.queryByText(
        'This option helps you identify transactions and merchants that do not yet have an assigned brand logo.',
      ),
    ).not.toBeInTheDocument()
    // Other settings (e.g. detachTransactionsFromDashboard) are still shown
    expect(screen.getByText('Detach all transactions from dashboard')).toBeInTheDocument()
  })

  it('displays transaction stats when accounts have imported transactions', () => {
    useAppStore.setState({
      importedAccounts: [
        {
          institutionId: 'bank-1',
          institutionName: 'Test Bank',
          importedAt: '2026-04-01T00:00:00.000Z',
          importedFingerprints: [],
          transactions: [
            {
              id: 'tx-1',
              date: '2026-04-01',
              amount: -12.99,
              description: 'Netflix subscription',
              currency: 'EUR',
              type: 'expense',
              institution: 'Test Bank',
            },
            {
              id: 'tx-2',
              date: '2026-04-02',
              amount: -50.0,
              description: 'Local bakery without logo',
              currency: 'EUR',
              type: 'expense',
              institution: 'Test Bank',
            },
          ],
        },
      ],
    })

    render(<AdvancedSettings />)

    // 1 transaction has logo (Netflix), 1 without logo (Local bakery)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText(/\/ 2 transactions without logos/i)).toBeInTheDocument()
  })

  it('excludes internal transfer (ghost) transactions from without-logo counts', () => {
    useAppStore.setState({
      importedAccounts: [
        {
          institutionId: 'bank-1',
          institutionName: 'Test Bank',
          importedAt: '2026-04-01T00:00:00.000Z',
          importedFingerprints: [],
          transactions: [
            {
              id: 'tx-1',
              date: '2026-04-01',
              amount: -100.0,
              description: 'Internal transfer to savings',
              currency: 'EUR',
              type: 'expense',
              institution: 'Test Bank',
              isGhost: true, // Ghost transactions should NOT be counted as without-logo
            },
            {
              id: 'tx-2',
              date: '2026-04-02',
              amount: -25.0,
              description: 'Local bakery without logo',
              currency: 'EUR',
              type: 'expense',
              institution: 'Test Bank',
            },
          ],
        },
      ],
    })

    render(<AdvancedSettings />)

    // Only 1 eligible transaction (Local bakery), ghost is excluded from both numerator and denominator
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText(/\/ 1 transactions without logos/i)).toBeInTheDocument()
  })

  it('displays (All Accounts) notice when multiple accounts are imported', () => {
    useAppStore.setState({
      importedAccounts: [
        {
          institutionId: 'bank-1',
          institutionName: 'Bank A',
          importedAt: '2026-04-01T00:00:00.000Z',
          importedFingerprints: [],
          transactions: [
            {
              id: 'tx-1',
              date: '2026-04-01',
              amount: -50.0,
              description: 'No logo expense A',
              currency: 'EUR',
              type: 'expense',
              institution: 'Bank A',
            },
          ],
        },
        {
          institutionId: 'bank-2',
          institutionName: 'Bank B',
          importedAt: '2026-04-01T00:00:00.000Z',
          importedFingerprints: [],
          transactions: [
            {
              id: 'tx-2',
              date: '2026-04-02',
              amount: -30.0,
              description: 'No logo expense B',
              currency: 'EUR',
              type: 'expense',
              institution: 'Bank B',
            },
          ],
        },
      ],
    })

    render(<AdvancedSettings />)

    expect(screen.getByText('(All Accounts)')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText(/\/ 2 transactions without logos/i)).toBeInTheDocument()
  })
})
