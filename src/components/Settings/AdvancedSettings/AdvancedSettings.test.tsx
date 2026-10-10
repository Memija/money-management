import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppStore } from '../../../store/useAppStore'
import { AdvancedSettings } from './AdvancedSettings'

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
        active: 'Active',
        inactive: 'Inactive',
        transactions: 'transactions',
      },
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

describe('AdvancedSettings', () => {
  beforeEach(() => {
    useAppStore.setState({
      filterTransactionsWithoutLogos: false,
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
    expect(screen.getByText('Inactive')).toBeInTheDocument()

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
})
