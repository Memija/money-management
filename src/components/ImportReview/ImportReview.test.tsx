import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TranslationStrings } from '../../i18n/translations'
import { type AppState } from '../../store/useAppStore'
import { type LanguageState } from '../../store/useLanguageStore'
import ImportReview from './ImportReview'

const { mockStartNewInstitution, mockSetStep, mockState } = vi.hoisted(() => ({
  mockStartNewInstitution: vi.fn(),
  mockSetStep: vi.fn(),
  mockState: {
    importedAccounts: [] as AppState['importedAccounts'],
  },
}))

vi.mock('../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      importedAccounts: mockState.importedAccounts,
      duplicateOverrideRules: [],
      startNewInstitution: mockStartNewInstitution,
      setStep: mockSetStep,
    } as unknown as AppState
    return typeof selector === 'function' ? selector(state) : state
  }),
  countDuplicateTransactionsInAccounts: vi.fn(() => 0),
}))

vi.mock('../../hooks/useFormatters', () => ({
  useFormatters: vi.fn(() => ({
    formatCurrency: (amount: number) => `€${amount}`,
    formatTransactionCount: (count: number) =>
      count === 1 ? `${count} transaction` : `${count} transactions`,
  })),
}))

vi.mock('../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      t: {
        importSuccessTitle: 'Success!',
        importSuccessSubtitle: 'Review your imports',
        institutions: 'Institutions',
        transactions: 'Transactions',
        totalIncome: 'Total Income',
        totalExpenses: 'Total Expenses',
        imported: 'Imported',
        addAnotherInstitution: 'Add Another',
        proceedToAnalysis: 'Proceed',
        internalTransfersReconciledTitle: 'Internal Transfers Reconciled',
        internalTransfersReconciledDesc: '{count} transfers between your accounts were recognized, excluded from income and expenses, and hidden from standard views.',
        internalTransfersReconciledDescSingular: '1 transfer between your accounts was recognized, excluded from income and expenses, and hidden from standard views.',
        accountInternalTransfers: '{count} internal transfers',
        accountInternalTransfersSingular: '1 internal transfer',
      } as unknown as TranslationStrings,
    }
    return typeof selector === 'function' ? selector(state as LanguageState) : state
  }),
}))

describe('ImportReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockState.importedAccounts = [
      {
        institutionId: '1',
        institutionName: 'Bank A',
        importedAt: new Date('2024-01-01T10:00:00').toISOString(),
        importedFingerprints: [],
        transactions: [
          {
            id: 't1',
            amount: 1000,
            type: 'income',
            date: '2024-01-01',
            description: 'Salary',
            category: 'Salary',
            currency: 'EUR',
            institution: 'Bank A',
          },
          {
            id: 't2',
            amount: -500,
            type: 'expense',
            date: '2024-01-02',
            description: 'Rent',
            category: 'Rent',
            currency: 'EUR',
            institution: 'Bank A',
          },
        ],
      },
    ]
  })

  it('renders correctly with summary stats', () => {
    render(<ImportReview />)

    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // Institutions count
    expect(screen.getByText('2')).toBeInTheDocument() // Transactions count
    expect(screen.getByText('Bank A')).toBeInTheDocument()
  })

  it('calls startNewInstitution when Add Another is clicked', () => {
    render(<ImportReview />)

    fireEvent.click(screen.getByText('Add Another'))
    expect(mockStartNewInstitution).toHaveBeenCalled()
  })

  it('calls setStep when Proceed is clicked', () => {
    render(<ImportReview />)

    fireEvent.click(screen.getByText('Proceed'))
    expect(mockSetStep).toHaveBeenCalledWith('dashboard')
  })

  it('calculates totals correctly with mocked formatters', () => {
    render(<ImportReview />)

    // totalIncome = 1000, totalExpenses = 500
    // Mocked formatCurrency should format as €1000 and €500
    expect(screen.getByText('€1000')).toBeInTheDocument() // Income
    expect(screen.getByText('€500')).toBeInTheDocument() // Expense
  })

  it('calculates totals correctly with multiple accounts', () => {
    mockState.importedAccounts = [
      {
        institutionId: '1',
        institutionName: 'Bank A',
        importedAt: new Date('2024-01-01T10:00:00').toISOString(),
        importedFingerprints: [],
        transactions: [
          {
            id: 't1',
            amount: 1000,
            type: 'income',
            date: '2024-01-01',
            description: 'Salary',
            category: 'Salary',
            currency: 'EUR',
            institution: 'Bank A',
          },
          {
            id: 't2',
            amount: -500,
            type: 'expense',
            date: '2024-01-02',
            description: 'Rent',
            category: 'Rent',
            currency: 'EUR',
            institution: 'Bank A',
          },
        ],
      },
      {
        institutionId: '2',
        institutionName: 'Bank B',
        importedAt: new Date('2024-01-01T11:00:00').toISOString(),
        importedFingerprints: [],
        transactions: [
          {
            id: 't3',
            amount: 2000,
            type: 'income',
            date: '2024-01-03',
            description: 'Bonus',
            category: 'Bonus',
            currency: 'EUR',
            institution: 'Bank B',
          },
          {
            id: 't4',
            amount: -100,
            type: 'expense',
            date: '2024-01-04',
            description: 'Groceries',
            category: 'Groceries',
            currency: 'EUR',
            institution: 'Bank B',
          },
        ],
      },
    ]

    render(<ImportReview />)

    expect(screen.getByText('2')).toBeInTheDocument() // Institutions count
    expect(screen.getByText('4')).toBeInTheDocument() // Total Transactions count

    // Total Income = 1000 + 2000 = 3000
    expect(screen.getByText('€3000')).toBeInTheDocument()

    // Total Expense = |-500| + |-100| = 600
    expect(screen.getByText('€600')).toBeInTheDocument()

    expect(screen.getByText('Bank A')).toBeInTheDocument()
    expect(screen.getByText('Bank B')).toBeInTheDocument()
  })

  it('renders correctly with empty accounts', () => {
    mockState.importedAccounts = []
    render(<ImportReview />)

    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2) // Institutions and Transactions
    expect(screen.getAllByText('€0').length).toBe(2) // Income and Expense
  })

  it('renders account badges and excludes internal transfers from totals when accounts have internal transfers', () => {
    mockState.importedAccounts = [
      {
        institutionId: '1',
        institutionName: 'Bank A',
        importedAt: new Date('2024-01-01T10:00:00').toISOString(),
        importedFingerprints: [],
        transactions: [
          {
            id: 't1',
            amount: -100,
            type: 'expense',
            date: '2024-01-01',
            description: 'Transfer to Bank B',
            currency: 'EUR',
            institution: 'Bank A',
            isGhost: true,
            linkedTransactionId: 't2',
          },
          {
            id: 't-normal',
            amount: 500,
            type: 'income',
            date: '2024-01-01',
            description: 'Salary',
            currency: 'EUR',
            institution: 'Bank A',
          },
        ],
      },
      {
        institutionId: '2',
        institutionName: 'Bank B',
        importedAt: new Date('2024-01-01T11:00:00').toISOString(),
        importedFingerprints: [],
        transactions: [
          {
            id: 't2',
            amount: 100,
            type: 'income',
            date: '2024-01-01',
            description: 'Transfer from Bank A',
            currency: 'EUR',
            institution: 'Bank B',
            isGhost: true,
            linkedTransactionId: 't1',
          },
        ],
      },
    ]

    render(<ImportReview />)

    // Static banner should no longer be rendered on the review screen
    expect(screen.queryByTestId('internal-transfers-reconciliation-card')).not.toBeInTheDocument()
    expect(screen.queryByText('Internal Transfers Reconciled')).not.toBeInTheDocument()

    // Both accounts should have internal transfer badges
    expect(screen.getAllByText(/1 internal transfer/i)).toHaveLength(2)

    // Income and expense calculations exclude ghost transactions:
    // Only t-normal (500 income) is counted
    expect(screen.getByText('€500')).toBeInTheDocument()
    expect(screen.getByText('€0')).toBeInTheDocument() // expenses = 0
  })

  it('correctly displays internal transfer badges across accounts', () => {
    mockState.importedAccounts = [
      {
        institutionId: '1',
        institutionName: 'Bank A',
        importedAt: new Date('2024-01-01T10:00:00').toISOString(),
        importedFingerprints: [],
        transactions: [
          {
            id: 'a1',
            amount: -100,
            type: 'expense',
            date: '2024-01-01',
            description: 'Transfer 1',
            currency: 'EUR',
            institution: 'Bank A',
            isGhost: true,
            linkedTransactionId: 'b1',
          },
          {
            id: 'a2',
            amount: -200,
            type: 'expense',
            date: '2024-01-02',
            description: 'Transfer 2',
            currency: 'EUR',
            institution: 'Bank A',
            isGhost: true,
            linkedTransactionId: 'b2',
          },
        ],
      },
      {
        institutionId: '2',
        institutionName: 'Bank B',
        importedAt: new Date('2024-01-01T11:00:00').toISOString(),
        importedFingerprints: [],
        transactions: [
          {
            id: 'b1',
            amount: 100,
            type: 'income',
            date: '2024-01-01',
            description: 'Transfer 1 inbound',
            currency: 'EUR',
            institution: 'Bank B',
            isGhost: true,
            linkedTransactionId: 'a1',
          },
          {
            id: 'b2',
            amount: 200,
            type: 'income',
            date: '2024-01-02',
            description: 'Transfer 2 inbound',
            currency: 'EUR',
            institution: 'Bank B',
            isGhost: true,
            linkedTransactionId: 'a2',
          },
        ],
      },
    ]

    render(<ImportReview />)

    expect(screen.queryByTestId('internal-transfers-reconciliation-card')).not.toBeInTheDocument()
    expect(screen.getAllByText(/2 internal transfers/i)).toHaveLength(2)
  })

  it('proceed button is green when no duplicates are imported', () => {
    render(<ImportReview />)
    const proceedBtn = screen.getByTestId('proceed-to-dashboard-btn')
    expect(proceedBtn.className).toContain('primary-button')
    expect(proceedBtn.className).toContain('button-clean-green')
    expect(proceedBtn.className).not.toContain('button-warning-orange')
  })

  it('proceed button becomes orange when duplicate transactions are imported', () => {
    mockState.importedAccounts = [
      {
        institutionId: '1',
        institutionName: 'Bank A',
        importedAt: new Date().toISOString(),
        importedFingerprints: [],
        transactions: [
          {
            id: 't1',
            amount: 1000,
            type: 'income',
            date: '2024-01-01',
            description: 'Salary',
            currency: 'EUR',
            institution: 'Bank A',
            forceImport: true,
          },
        ],
      },
    ]

    render(<ImportReview />)
    const proceedBtn = screen.getByTestId('proceed-to-dashboard-btn')
    expect(proceedBtn.className).toContain('button-warning-orange')
    expect(proceedBtn.className).not.toContain('button-clean-green')
  })
})


