import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Transaction } from '../../../types'
import { TransactionPreviewModal } from './TransactionPreviewModal'

// Mock dependencies
vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: (
    selector: (state: { locale: string; t: Record<string, string> }) => unknown,
  ) => {
    const state = {
      locale: 'en',
      t: {
        transactions: 'Transactions',
        date: 'Date',
        description: 'Description',
        amount: 'Amount',
        done: 'Done',
        noTransactionsLeft: 'No transactions left.',
        noTransactionsMatch: 'No transactions match your search.',
        removeTransaction: 'Remove transaction',
        searchTransactionsPlaceholder: 'Search description, merchant, amount…',
        clearFilters: 'Clear filters',
        duplicate: 'Duplicate',
        allDates: 'All dates',
        showingOf: 'Showing {shown} of {total} transactions',
        fromDate: 'From date',
        toDate: 'To date',
        transactionCountSingular: '{count} transaction',
        transactionCountPlural: '{count} transactions',
      },
    }
    return selector ? selector(state) : state
  },
}))

vi.mock('../DatePicker', () => ({
  DatePicker: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string
    onChange: (date: string) => void
    placeholder?: string
  }) => (
    <input
      data-testid={`mock-datepicker-${placeholder?.toLowerCase().replace(/\s+/g, '-') || 'default'}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

vi.mock('../../../store/useAppStore', () => ({
  useAppStore: (selector: (state: { customCategories: unknown[] }) => unknown) => {
    const state = { customCategories: [] }
    return selector ? selector(state) : state
  },
}))

vi.mock('../Modal', () => ({
  Modal: ({
    isOpen,
    children,
    title,
    footer,
  }: {
    isOpen: boolean
    children: React.ReactNode
    title: React.ReactNode
    footer: React.ReactNode
  }) => {
    if (!isOpen) return null
    return (
      <div data-testid="mock-modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
      </div>
    )
  },
}))

vi.mock('react-virtuoso', () => ({
  Virtuoso: ({
    data,
    itemContent,
  }: {
    data: Transaction[]
    itemContent: (index: number, item: Transaction) => React.ReactNode
  }) => (
    <div data-testid="mock-virtuoso">
      {data.map((item: Transaction, index: number) => (
        <div key={item.id} data-testid={`virtuoso-item-${index}`}>
          {itemContent(index, item)}
        </div>
      ))}
    </div>
  ),
}))

describe('TransactionPreviewModal (Shared)', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      date: '2026-03-01',
      description: 'Salary Employer',
      amount: 3500,
      type: 'income',
      category: 'salary',
      currency: 'EUR',
      institution: 'Sparkasse',
    },
    {
      id: 'tx-2',
      date: '2026-03-02',
      description: 'Supermarket Groceries',
      amount: -45.9,
      type: 'expense',
      category: 'groceries',
      currency: 'EUR',
      institution: 'Sparkasse',
    },
  ]

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    transactions: mockTransactions,
  }

  it('renders modal with title and transaction items', () => {
    render(<TransactionPreviewModal {...defaultProps} />)
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument()
    expect(screen.getByText('Salary Employer')).toBeInTheDocument()
    expect(screen.getByText('Supermarket Groceries')).toBeInTheDocument()
  })

  it('filters transactions when user types into the search box', () => {
    render(<TransactionPreviewModal {...defaultProps} />)
    const searchInput = screen.getByPlaceholderText('Search description, merchant, amount…')

    fireEvent.change(searchInput, { target: { value: 'Groceries' } })

    expect(screen.getByText('Supermarket Groceries')).toBeInTheDocument()
    expect(screen.queryByText('Salary Employer')).not.toBeInTheDocument()
  })

  it('shows clear filters button when search is active and resets when clicked', () => {
    render(<TransactionPreviewModal {...defaultProps} />)
    const searchInput = screen.getByPlaceholderText('Search description, merchant, amount…')

    fireEvent.change(searchInput, { target: { value: 'Groceries' } })
    const clearBtn = screen.getByRole('button', { name: /clear filters/i })
    expect(clearBtn).toBeInTheDocument()

    fireEvent.click(clearBtn)
    expect(screen.getByText('Salary Employer')).toBeInTheDocument()
    expect(screen.getByText('Supermarket Groceries')).toBeInTheDocument()
  })

  it('highlights duplicate transactions with a duplicate badge', () => {
    render(<TransactionPreviewModal {...defaultProps} duplicateIds={new Set(['tx-2'])} />)
    expect(screen.getByText('Duplicate')).toBeInTheDocument()
  })

  it('renders inline editable inputs when onUpdateTransaction is provided', () => {
    const onUpdate = vi.fn()
    render(<TransactionPreviewModal {...defaultProps} onUpdateTransaction={onUpdate} />)

    const descInput1 = screen.getByDisplayValue('Salary Employer')
    expect(descInput1).toBeInTheDocument()

    fireEvent.change(descInput1, { target: { value: 'New Salary' } })
    expect(onUpdate).toHaveBeenCalledWith('tx-1', { description: 'New Salary' })
  })

  it('calls onRemoveTransaction when delete button is clicked in edit mode', () => {
    const onRemove = vi.fn()
    render(<TransactionPreviewModal {...defaultProps} onRemoveTransaction={onRemove} />)

    const removeButtons = screen.getAllByRole('button', { name: /remove transaction/i })
    expect(removeButtons.length).toBe(2)

    // With default incoming order, tx-1 is first
    fireEvent.click(removeButtons[0])
    expect(onRemove).toHaveBeenCalledWith('tx-1')
  })

  it('filters transactions between startDate and endDate', () => {
    render(<TransactionPreviewModal {...defaultProps} />)
    const fromInput = screen.getByTestId('mock-datepicker-from-date')
    const toInput = screen.getByTestId('mock-datepicker-to-date')

    // Filter to only 2026-03-02
    fireEvent.change(fromInput, { target: { value: '2026-03-02' } })
    fireEvent.change(toInput, { target: { value: '2026-03-02' } })

    expect(screen.getByText('Supermarket Groceries')).toBeInTheDocument()
    expect(screen.queryByText('Salary Employer')).not.toBeInTheDocument()
  })

  it('clears date range filters when clear filters is clicked', () => {
    render(<TransactionPreviewModal {...defaultProps} />)
    const fromInput = screen.getByTestId('mock-datepicker-from-date')
    fireEvent.change(fromInput, { target: { value: '2026-03-02' } })

    expect(screen.queryByText('Salary Employer')).not.toBeInTheDocument()

    const clearBtn = screen.getByRole('button', { name: /clear filters/i })
    fireEvent.click(clearBtn)

    expect(screen.getByText('Salary Employer')).toBeInTheDocument()
    expect(screen.getByText('Supermarket Groceries')).toBeInTheDocument()
  })

  it('formats transaction count with proper pluralization', () => {
    // 2 transactions -> plural
    const { rerender } = render(<TransactionPreviewModal {...defaultProps} />)
    expect(screen.getByText('2 transactions')).toBeInTheDocument()

    // 1 transaction -> singular
    rerender(<TransactionPreviewModal {...defaultProps} transactions={[mockTransactions[0]]} />)
    expect(screen.getByText('1 transaction')).toBeInTheDocument()
  })

  it('does not render toolbar or sorting controls when only one transaction is present', () => {
    render(<TransactionPreviewModal {...defaultProps} transactions={[mockTransactions[0]]} />)

    // Toolbar elements should not be present
    expect(
      screen.queryByPlaceholderText('Search description, merchant, amount…'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-datepicker-from-date')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-datepicker-to-date')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Sort transactions')).not.toBeInTheDocument()

    // Single transaction item is still displayed cleanly
    expect(screen.getByText('Salary Employer')).toBeInTheDocument()
  })
})
