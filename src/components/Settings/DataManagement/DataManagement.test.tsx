import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DataManagement } from './DataManagement'

const mockClearAllData = vi.fn()

// Mock useAppStore
vi.mock('../../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      importedAccounts: [
        {
          institutionId: 'bank-1',
          institutionName: 'Bank 1',
          transactions: [
            { id: 'tx-1', amount: -10, date: '2026-01-01', description: 'Coffee' },
            { id: 'tx-2', amount: 50, date: '2026-01-02', description: 'Salary' },
          ],
        },
      ],
      customCategories: [{ id: 'cat-1', translations: { en: 'Pets' } }],
      customKeywords: { Groceries: ['lidl', 'aldi'] },
      clearAllData: mockClearAllData,
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
    expect(screen.getByText('2 transactions')).toBeInTheDocument()
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
})
