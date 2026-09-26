import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DataManagement } from './DataManagement'

const mockClearAllData = vi.fn()
const mockRemoveImportedAccount = vi.fn()

// Mock useAppStore
vi.mock('../../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      importedAccounts: [
        {
          institutionId: 'de_commerzbank',
          institutionName: 'Commerzbank',
          transactions: [
            { id: 'tx-1', amount: -10, date: '2026-01-01', description: 'Coffee' },
            { id: 'tx-2', amount: 50, date: '2026-01-02', description: 'Salary' },
          ],
        },
      ],
      customCategories: [{ id: 'cat-1', translations: { en: 'Pets' } }],
      customKeywords: { Groceries: ['lidl', 'aldi'] },
      clearAllData: mockClearAllData,
      removeImportedAccount: mockRemoveImportedAccount,
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

// Mock useLanguageStore
vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      locale: 'en',
      t: {
        dataManagementTitle: 'Data Management',
        dataManagementDesc: 'Permanently erase all data.',
        deleteAllDataDesc: 'Permanently erase all data.',
        dangerZone: 'Danger Zone',
        deleteAllDataTitle: 'Delete All Data',
        deleteAllDataConfirmMessage: 'Are you sure you want to delete all data?',
        deleteAllDataButton: 'Delete All Data',
        resetPreferencesOption: 'Also reset theme and language preferences',
        storedDataSummary: 'Stored Data',
        deleteDataAccountsCount: '{count} accounts',
        deleteDataTransactionsCount: '{count} transactions',
        deleteDataCategoriesCount: '{count} custom categories',
        deleteDataRulesCount: '{count} custom rules',
        connectedBanksTitle: 'Connected Accounts & Banks',
        noConnectedBanks: 'No accounts imported yet',
        deleteBankTransactions: 'Delete Transactions',
        deleteBankTransactionsTitle: 'Delete {bank} Transactions',
        deleteBankTransactionsConfirm: 'Are you sure you want to delete all transactions and data for {bank}?',
        cancel: 'Cancel',
      },
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

describe('DataManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders data management section with stored data counts', () => {
    render(<DataManagement />)

    expect(screen.getByText('Data Management')).toBeInTheDocument()
    expect(screen.getByText('Danger Zone')).toBeInTheDocument()
    expect(screen.getByText('Permanently erase all data.')).toBeInTheDocument()

    // 1 account, 2 transactions, 1 custom category, 2 custom rules
    expect(screen.getByText('1 accounts')).toBeInTheDocument()
    expect(screen.getAllByText('2 transactions').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('1 custom categories')).toBeInTheDocument()
    expect(screen.getByText('2 custom rules')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Delete All Data' })).toBeInTheDocument()
  })

  it('opens confirmation modal when clicking Delete All Data button', () => {
    render(<DataManagement />)

    expect(screen.queryByText('Are you sure you want to delete all data?')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete All Data' }))

    expect(screen.getByText('Are you sure you want to delete all data?')).toBeInTheDocument()
    expect(screen.getByText('Also reset theme and language preferences')).toBeInTheDocument()
  })

  it('closes confirmation modal when clicking Cancel without calling clearAllData', async () => {
    render(<DataManagement />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete All Data' }))
    expect(screen.getByText('Are you sure you want to delete all data?')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByText('Are you sure you want to delete all data?')).not.toBeInTheDocument()
    })
    expect(mockClearAllData).not.toHaveBeenCalled()
  })

  it('calls clearAllData(false) when confirming deletion without checking preferences', () => {
    render(<DataManagement />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete All Data' }))

    // Inside modal, click confirm button
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete All Data' })
    // The second one is inside the modal footer
    fireEvent.click(deleteButtons[deleteButtons.length - 1])

    expect(mockClearAllData).toHaveBeenCalledTimes(1)
    expect(mockClearAllData).toHaveBeenCalledWith(false)
  })

  it('calls clearAllData(true) when checking reset preferences option and confirming', () => {
    render(<DataManagement />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete All Data' }))

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete All Data' })
    fireEvent.click(deleteButtons[deleteButtons.length - 1])

    expect(mockClearAllData).toHaveBeenCalledTimes(1)
    expect(mockClearAllData).toHaveBeenCalledWith(true)
  })

  it('renders connected bank with its name, logo, and transaction count', () => {
    render(<DataManagement />)

    expect(screen.getByText('Connected Accounts & Banks')).toBeInTheDocument()
    expect(screen.getByText('Commerzbank')).toBeInTheDocument()

    // 2 transactions for Commerzbank
    const txCountElements = screen.getAllByText('2 transactions')
    expect(txCountElements.length).toBeGreaterThanOrEqual(1)

    // Check bank logo is rendered with clean borderless class and correct src
    const bankCard = screen.getByTestId('bank-card-de_commerzbank')
    expect(bankCard).toBeInTheDocument()
    const logoImg = bankCard.querySelector('img')
    expect(logoImg).toBeInTheDocument()
    expect(logoImg).toHaveAttribute('src', '/banks/commerzbank.png')

    // Delete button for this specific bank
    const deleteBankBtn = screen.getByRole('button', {
      name: 'Delete Transactions - Commerzbank',
    })
    expect(deleteBankBtn).toBeInTheDocument()
  })

  it('opens confirmation modal when clicking Delete Transactions on a bank', () => {
    render(<DataManagement />)

    const deleteBankBtn = screen.getByRole('button', {
      name: 'Delete Transactions - Commerzbank',
    })
    fireEvent.click(deleteBankBtn)

    expect(screen.getByText('Delete Commerzbank Transactions')).toBeInTheDocument()
    expect(
      screen.getByText('Are you sure you want to delete all transactions and data for Commerzbank?'),
    ).toBeInTheDocument()
  })

  it('calls removeImportedAccount when confirming bank deletion', () => {
    render(<DataManagement />)

    const deleteBankBtn = screen.getByRole('button', {
      name: 'Delete Transactions - Commerzbank',
    })
    fireEvent.click(deleteBankBtn)

    // The modal confirm button has text 'Delete Transactions'
    const modalDeleteButtons = screen.getAllByRole('button', { name: 'Delete Transactions' })
    fireEvent.click(modalDeleteButtons[modalDeleteButtons.length - 1])

    expect(mockRemoveImportedAccount).toHaveBeenCalledTimes(1)
    expect(mockRemoveImportedAccount).toHaveBeenCalledWith('de_commerzbank')
  })

  it('closes bank confirmation modal without deleting when Cancel is clicked', async () => {
    render(<DataManagement />)

    const deleteBankBtn = screen.getByRole('button', {
      name: 'Delete Transactions - Commerzbank',
    })
    fireEvent.click(deleteBankBtn)

    expect(screen.getByText('Delete Commerzbank Transactions')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByText('Delete Commerzbank Transactions')).not.toBeInTheDocument()
    })
    expect(mockRemoveImportedAccount).not.toHaveBeenCalled()
  })
})
