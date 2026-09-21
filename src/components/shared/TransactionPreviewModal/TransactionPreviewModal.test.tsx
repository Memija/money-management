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
        filterDuplicates: 'Duplicates',
        duplicatesSkippedNotice: 'Duplicates notice',
        allDates: 'All dates',
        showingOf: 'Showing {shown} of {total} transactions',
        fromDate: 'From date',
        toDate: 'To date',
        transactionCountSingular: '{count} transaction',
        transactionCountPlural: '{count} transactions',
        spaceTransfersExcluded: '{count} transactions between spaces were automatically excluded.',
        spaceTransfersExcludedSingular: '1 transaction between spaces was automatically excluded.',
        inflows: 'Inflows',
        outflows: 'Outflows',
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

  it('does not display institution by default when importing, but displays when showInstitution is true', () => {
    const { rerender } = render(<TransactionPreviewModal {...defaultProps} />)
    expect(screen.queryByText('Sparkasse')).not.toBeInTheDocument()

    rerender(<TransactionPreviewModal {...defaultProps} showInstitution={true} />)
    expect(screen.getAllByText('Sparkasse').length).toBeGreaterThan(0)
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

  it('highlights internal transfer transactions with internal transfer badge', () => {
    render(
      <TransactionPreviewModal
        {...defaultProps}
        internalTransferIds={new Set(['tx-2'])}
      />,
    )
    expect(screen.queryByTestId('preview-internal-transfers-banner')).not.toBeInTheDocument()
    expect(screen.getByText('Internal Transfer')).toBeInTheDocument()
  })

  it('renders space transfers notice when filtered to space transfers', () => {
    render(
      <TransactionPreviewModal
        {...defaultProps}
        initialFilter="space-transfers"
        discardedSpaceCount={4}
        excludedSpaceTransactions={mockTransactions}
      />,
    )
    expect(screen.queryByTestId('preview-space-transfers-banner')).not.toBeInTheDocument()
    expect(screen.getByTestId('space-transfers-notice')).toBeInTheDocument()
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

  it('renders both inflow and outflow chips for mixed transactions', () => {
    render(<TransactionPreviewModal {...defaultProps} />)
    const inflowChip = screen.getByTestId('modal-total-inflow')
    const outflowChip = screen.getByTestId('modal-total-outflow')

    expect(inflowChip).toBeInTheDocument()
    expect(inflowChip).toHaveTextContent(/3,500/)
    expect(inflowChip).toHaveAttribute('title', expect.stringContaining('Inflows'))

    expect(outflowChip).toBeInTheDocument()
    expect(outflowChip).toHaveTextContent(/45.90/)
    expect(outflowChip).toHaveAttribute('title', expect.stringContaining('Outflows'))
  })

  it('renders only inflow chip when variant is income', () => {
    render(<TransactionPreviewModal {...defaultProps} variant="income" />)
    expect(screen.getByTestId('modal-total-income')).toBeInTheDocument()
    expect(screen.queryByTestId('modal-total-outflow')).not.toBeInTheDocument()
    expect(screen.queryByTestId('modal-total-expense')).not.toBeInTheDocument()
  })

  it('renders only outflow chip when variant is expense', () => {
    render(<TransactionPreviewModal {...defaultProps} variant="expense" />)
    expect(screen.getByTestId('modal-total-expense')).toBeInTheDocument()
    expect(screen.queryByTestId('modal-total-inflow')).not.toBeInTheDocument()
    expect(screen.queryByTestId('modal-total-income')).not.toBeInTheDocument()
  })

  it('excludes internal transfers from inflow/outflow chips and renders them as read-only', () => {
    const mockOnUpdate = vi.fn()
    const mockOnRemove = vi.fn()

    const transactionsWithTransfer: Transaction[] = [
      {
        id: 'tx-real-income',
        date: '2024-01-15',
        description: 'Salary',
        amount: 2000,
        currency: 'EUR',
        type: 'income',
        category: 'Income',
        institution: 'Bank A',
      },
      {
        id: 'tx-internal-transfer',
        date: '2024-01-16',
        description: 'Transfer to N26',
        amount: -500,
        currency: 'EUR',
        type: 'expense',
        institution: 'Bank A',
        isGhost: true,
      },
    ]

    render(
      <TransactionPreviewModal
        {...defaultProps}
        transactions={transactionsWithTransfer}
        internalTransferIds={new Set(['tx-internal-transfer'])}
        onUpdateTransaction={mockOnUpdate}
        onRemoveTransaction={mockOnRemove}
      />,
    )

    // Inflow should be 2000, Outflow should be 0 (the -500 transfer is excluded)
    const inflowChip = screen.getByTestId('modal-total-inflow')
    const outflowChip = screen.getByTestId('modal-total-outflow')
    expect(inflowChip).toHaveTextContent(/2,000/)
    expect(outflowChip).toHaveTextContent(/0\.00/)

    // The real transaction is editable
    expect(screen.getByLabelText('Description', { selector: '#tx-desc-tx-real-income' })).toBeInTheDocument()

    // The internal transfer is read-only (rendered as static text, not an input)
    expect(screen.queryByLabelText('Description', { selector: '#tx-desc-tx-internal-transfer' })).not.toBeInTheDocument()
    expect(screen.getByText('Transfer to N26')).toBeInTheDocument()

    // Remove button should NOT exist for internal transfer
    expect(screen.getAllByRole('button', { name: 'Remove transaction' })).toHaveLength(1)
  })

  it('renders duplicate preview rows with standard layout, standard inputs, and no secondary transfer badges or include buttons', () => {
    const mockOnUpdate = vi.fn()
    const mockOnRemove = vi.fn()

    const duplicateTx: Transaction = {
      id: 'tx-dup-1',
      date: '2026-03-01',
      description: 'Duplicate Salary',
      amount: 2500,
      currency: 'EUR',
      type: 'income',
      category: 'salary',
      institution: 'Sparkasse',
      isGhost: true, // even if marked isGhost previously, duplicate exclusivity must suppress it!
    }

    render(
      <TransactionPreviewModal
        {...defaultProps}
        transactions={[duplicateTx, mockTransactions[1]]}
        duplicateIds={new Set(['tx-dup-1'])}
        internalTransferIds={new Set(['tx-dup-1'])} // even if passed in internalTransferIds, duplicate must take precedence!
        excludedSpaceTransactions={[]}
        initialFilter="duplicates"
        onUpdateTransaction={mockOnUpdate}
        onRemoveTransaction={mockOnRemove}
      />,
    )

    // Duplicates notice inside table container is removed
    expect(screen.queryByTestId('duplicates-notice')).not.toBeInTheDocument()

    // Redundant top duplicate-banner should NOT be shown in duplicates view
    expect(screen.queryByText(/1 duplicate transaction detected and will be skipped/i)).not.toBeInTheDocument()

    // No type navigation tabs in toolbar
    expect(screen.queryByTestId('filter-tab-duplicates')).not.toBeInTheDocument()
    expect(screen.queryByTestId('filter-tab-all')).not.toBeInTheDocument()

    // The duplicate row is read-only in this view (static text, not editable inputs)
    expect(screen.queryByLabelText('Description', { selector: '#tx-desc-tx-dup-1' })).not.toBeInTheDocument()
    expect(screen.getByText('Duplicate Salary')).toBeInTheDocument()

    // Amount is read-only text, not editable input
    expect(screen.queryByLabelText('Amount', { selector: '#tx-amount-tx-dup-1' })).not.toBeInTheDocument()

    // No remove trash button for duplicate transactions
    expect(screen.queryByRole('button', { name: 'Remove transaction' })).not.toBeInTheDocument()

    // Must NOT have internal transfer pill or space transfer pill or include button
    expect(screen.queryByText('Internal Transfer')).not.toBeInTheDocument()
    expect(screen.queryByText('Space Transfer')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /include/i })).not.toBeInTheDocument()
  })

  it('orders unlocked duplicate transactions to the top of the list', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-first', description: 'Standard Tx 1' }
    const tx2 = { ...mockTransactions[1], id: 'tx-second', description: 'Duplicate Tx 2' }

    render(
      <TransactionPreviewModal
        {...defaultProps}
        transactions={[tx1, tx2]}
        duplicateIds={new Set(['tx-second'])}
        unlockedDuplicateIds={new Set(['tx-second'])}
      />,
    )

    // Items are in Virtuoso items
    const item0 = screen.getByTestId('virtuoso-item-0')
    const item1 = screen.getByTestId('virtuoso-item-1')

    // tx-second (unlocked) must be ordered to the top (index 0)
    expect(item0).toHaveTextContent('Duplicate Tx 2')
    expect(item1).toHaveTextContent('Standard Tx 1')
  })

  it('filters transactions when the Unlocked filter button is clicked', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-std', description: 'Normal Transaction' }
    const tx2 = { ...mockTransactions[1], id: 'tx-unlocked', description: 'Unlocked Duplicate' }

    render(
      <TransactionPreviewModal
        {...defaultProps}
        transactions={[tx1, tx2]}
        duplicateIds={new Set(['tx-unlocked'])}
        unlockedDuplicateIds={new Set(['tx-unlocked'])}
      />,
    )

    // Unlocked filter button is visible in the toolbar with count 1
    const filterBtn = screen.getByTestId('filter-unlocked-btn')
    expect(filterBtn).toBeInTheDocument()
    expect(filterBtn).toHaveTextContent('1')

    // Initially both are rendered
    expect(screen.getByText('Normal Transaction')).toBeInTheDocument()
    expect(screen.getByText('Unlocked Duplicate')).toBeInTheDocument()

    // Click Unlocked filter
    fireEvent.click(filterBtn)

    // Now only unlocked duplicate is shown
    expect(screen.getByText('Unlocked Duplicate')).toBeInTheDocument()
    expect(screen.queryByText('Normal Transaction')).not.toBeInTheDocument()

    // Clicking again toggles back to all
    fireEvent.click(filterBtn)
    expect(screen.getByText('Normal Transaction')).toBeInTheDocument()
    expect(screen.getByText('Unlocked Duplicate')).toBeInTheDocument()
  })

  it('filters transactions when the duplicate filter button is clicked and toggles back', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-normal', description: 'Normal Transaction' }
    const tx2 = { ...mockTransactions[1], id: 'tx-duplicate', description: 'Duplicate Transaction' }

    render(
      <TransactionPreviewModal
        {...defaultProps}
        transactions={[tx1, tx2]}
        duplicateIds={new Set(['tx-duplicate'])}
      />,
    )

    // Duplicates filter button is visible in the toolbar with count 1
    const filterBtn = screen.getByTestId('filter-duplicates-btn')
    expect(filterBtn).toBeInTheDocument()
    expect(filterBtn).toHaveTextContent('1')

    // Initially both are rendered
    expect(screen.getByText('Normal Transaction')).toBeInTheDocument()
    expect(screen.getByText('Duplicate Transaction')).toBeInTheDocument()

    // Click Duplicates filter
    fireEvent.click(filterBtn)

    // Now only duplicate is shown
    expect(screen.getByText('Duplicate Transaction')).toBeInTheDocument()
    expect(screen.queryByText('Normal Transaction')).not.toBeInTheDocument()

    // Clicking again toggles back to all
    fireEvent.click(filterBtn)
    expect(screen.getByText('Normal Transaction')).toBeInTheDocument()
    expect(screen.getByText('Duplicate Transaction')).toBeInTheDocument()
  })

  it('offers to bulk apply changes when an unlocked transaction is edited and matching identical transactions exist', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-dup-1', description: 'Gym Membership', amount: -45 }
    const tx2 = { ...mockTransactions[1], id: 'tx-dup-2', description: 'Gym Membership', amount: -45 }
    const tx3 = { ...mockTransactions[0], id: 'tx-other', description: 'Coffee', amount: -5 }
    const onUpdate = vi.fn()
    const onUnlock = vi.fn()

    render(
      <TransactionPreviewModal
        {...defaultProps}
        transactions={[tx1, tx2, tx3]}
        duplicateIds={new Set(['tx-dup-1', 'tx-dup-2'])}
        unlockedDuplicateIds={new Set(['tx-dup-1'])}
        onUpdateTransaction={onUpdate}
        onUnlockDuplicateTransaction={onUnlock}
      />,
    )

    // tx-dup-1 is unlocked, so it has editable description input
    const input = screen.getByDisplayValue('Gym Membership')
    fireEvent.change(input, { target: { value: 'Gym Membership Updated' } })

    // Bulk apply banner appears offering to apply to 1 other identical transaction
    expect(screen.getByTestId('bulk-apply-banner')).toBeInTheDocument()
    expect(screen.getByText(/Apply this change to 1 other identical transaction/i)).toBeInTheDocument()

    // Clicking "Apply to all"
    const applyBtn = screen.getByTestId('apply-bulk-changes-btn')
    fireEvent.click(applyBtn)

    // Verify onUpdateTransaction was called for matching tx-dup-2 with the new description
    expect(onUpdate).toHaveBeenCalledWith('tx-dup-2', { description: 'Gym Membership Updated' })
    expect(onUnlock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'tx-dup-2', description: 'Gym Membership Updated' }),
      true,
    )

    // Banner is dismissed
    expect(screen.queryByTestId('bulk-apply-banner')).not.toBeInTheDocument()
  })

  it('unlocks ALL identical transactions in bulk even if not in duplicateIds set', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-dup-1', description: 'Loan Repayment', amount: -502.58 }
    const tx2 = { ...mockTransactions[1], id: 'tx-dup-2', description: 'Loan Repayment', amount: -502.58 }
    const tx3 = { ...mockTransactions[0], id: 'tx-dup-3', description: 'Loan Repayment', amount: -502.58 }
    const onUpdate = vi.fn()
    const onUnlock = vi.fn()

    render(
      <TransactionPreviewModal
        {...defaultProps}
        transactions={[tx1, tx2, tx3]}
        // Note: tx-dup-2 and tx-dup-3 might be excluded from duplicateIds because a rule matched them
        duplicateIds={new Set(['tx-dup-1'])}
        unlockedDuplicateIds={new Set(['tx-dup-1'])}
        onUpdateTransaction={onUpdate}
        onUnlockDuplicateTransaction={onUnlock}
      />,
    )

    // Initial unlocked count in toolbar is 1
    const filterUnlockedBtn = screen.getByTestId('filter-unlocked-btn')
    expect(filterUnlockedBtn).toHaveTextContent('1')

    // Modify tx-dup-1 amount from -502.58 to 502.58
    const amountInput = screen.getAllByDisplayValue('-502.58')[0]
    fireEvent.change(amountInput, { target: { value: '502.58' } })

    // Bulk apply banner appears offering to apply to 2 other identical transactions
    expect(screen.getByTestId('bulk-apply-banner')).toBeInTheDocument()
    expect(screen.getByText(/Apply this change to 2 other identical transaction/i)).toBeInTheDocument()

    // Click "Apply to all"
    const applyBtn = screen.getByTestId('apply-bulk-changes-btn')
    fireEvent.click(applyBtn)

    // Both identical transactions are updated
    expect(onUpdate).toHaveBeenCalledWith('tx-dup-2', expect.objectContaining({ amount: 502.58 }))
    expect(onUpdate).toHaveBeenCalledWith('tx-dup-3', expect.objectContaining({ amount: 502.58 }))

    // BOTH identical transactions are unlocked via onUnlock callback
    expect(onUnlock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'tx-dup-2', amount: 502.58 }),
      true,
    )
    expect(onUnlock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'tx-dup-3', amount: 502.58 }),
      true,
    )

    // Unlocked count in toolbar now shows all 3 transactions as unlocked!
    expect(filterUnlockedBtn).toHaveTextContent('3')
  })

  it('offers to apply changes to all other unlocked transactions when an unlocked transaction is modified', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-dup-1', description: 'Credit Rate Loan', amount: -1000 }
    const tx2 = { ...mockTransactions[1], id: 'tx-dup-2', description: 'Gym Membership', amount: -45 }
    const onUpdate = vi.fn()

    render(
      <TransactionPreviewModal
        {...defaultProps}
        transactions={[tx1, tx2]}
        duplicateIds={new Set(['tx-dup-1', 'tx-dup-2'])}
        unlockedDuplicateIds={new Set(['tx-dup-1', 'tx-dup-2'])}
        onUpdateTransaction={onUpdate}
      />,
    )

    // Modify tx-dup-1 description
    const input = screen.getByDisplayValue('Credit Rate Loan')
    fireEvent.change(input, { target: { value: 'Credit Rate Loan Paid' } })

    // Bulk apply banner offers to apply to 1 other unlocked transaction
    expect(screen.getByTestId('bulk-apply-banner')).toBeInTheDocument()
    expect(screen.getByTestId('apply-to-all-unlocked-btn')).toBeInTheDocument()

    // Clicking "Apply to all unlocked"
    fireEvent.click(screen.getByTestId('apply-to-all-unlocked-btn'))

    // Expect onUpdate called for tx-dup-2 with the modified description
    expect(onUpdate).toHaveBeenCalledWith('tx-dup-2', { description: 'Credit Rate Loan Paid' })
    expect(screen.queryByTestId('bulk-apply-banner')).not.toBeInTheDocument()
  })

  it('allows granular bulk adjustments via modal selecting specific fields and target transactions', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-1', description: 'Monthly Retainer', amount: 2000, date: '2026-03-01' }
    const tx2 = { ...mockTransactions[1], id: 'tx-2', description: 'Consulting Fee', amount: 1500, date: '2026-03-02' }
    const tx3 = { ...mockTransactions[0], id: 'tx-3', description: 'Advisory Fee', amount: 800, date: '2026-03-03' }
    const onUpdate = vi.fn()

    render(
      <TransactionPreviewModal
        {...defaultProps}
        transactions={[tx1, tx2, tx3]}
        duplicateIds={new Set(['tx-1', 'tx-2', 'tx-3'])}
        unlockedDuplicateIds={new Set(['tx-1', 'tx-2', 'tx-3'])}
        onUpdateTransaction={onUpdate}
      />,
    )

    // Edit tx-1 description
    const input = screen.getByDisplayValue('Monthly Retainer')
    fireEvent.change(input, { target: { value: 'Shared Retainer' } })

    // Banner is visible
    expect(screen.getByTestId('bulk-apply-banner')).toBeInTheDocument()

    // Click "Adjust in bulk..." button
    const adjustBtn = screen.getByTestId('adjust-unlocked-bulk-btn')
    fireEvent.click(adjustBtn)

    // Adjust modal opens
    expect(screen.getByText('Adjust Unlocked Transactions in Bulk')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-custom-adjust-btn')).toBeInTheDocument()

    // Deselect tx-3 so only tx-2 is targeted
    const tx3Checkbox = screen.getByTestId('adjust-target-checkbox-tx-3')
    fireEvent.click(tx3Checkbox)

    // Confirm bulk adjustment
    fireEvent.click(screen.getByTestId('confirm-custom-adjust-btn'))

    // Verify onUpdate called for tx-2 with 'Shared Retainer' but NOT for tx-3
    expect(onUpdate).toHaveBeenCalledWith('tx-2', { description: 'Shared Retainer' })
    expect(onUpdate).not.toHaveBeenCalledWith('tx-3', { description: 'Shared Retainer' })

    // Banner is dismissed
    expect(screen.queryByTestId('bulk-apply-banner')).not.toBeInTheDocument()
  })

  it('restores bulk apply offer when modal is closed and reopened with a modified unlocked transaction', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-dup-1', description: 'Netflix Subscription', amount: -15 }
    const tx2 = { ...mockTransactions[1], id: 'tx-dup-2', description: 'Netflix Subscription', amount: -15 }
    const onUpdate = vi.fn()

    const { rerender } = render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1, tx2]}
        duplicateIds={new Set(['tx-dup-1', 'tx-dup-2'])}
        unlockedDuplicateIds={new Set(['tx-dup-1'])}
        onUpdateTransaction={onUpdate}
      />,
    )

    // Modify tx-dup-1 description
    const input = screen.getByDisplayValue('Netflix Subscription')
    fireEvent.change(input, { target: { value: 'Netflix Premium 4K' } })

    // Bulk apply banner appears
    expect(screen.getByTestId('bulk-apply-banner')).toBeInTheDocument()

    // Close the modal
    rerender(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={false}
        transactions={[{ ...tx1, description: 'Netflix Premium 4K' }, tx2]}
        duplicateIds={new Set(['tx-dup-1', 'tx-dup-2'])}
        unlockedDuplicateIds={new Set(['tx-dup-1'])}
        onUpdateTransaction={onUpdate}
      />,
    )

    expect(screen.queryByTestId('bulk-apply-banner')).not.toBeInTheDocument()

    // Reopen the modal
    rerender(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[{ ...tx1, description: 'Netflix Premium 4K' }, tx2]}
        duplicateIds={new Set(['tx-dup-1', 'tx-dup-2'])}
        unlockedDuplicateIds={new Set(['tx-dup-1'])}
        onUpdateTransaction={onUpdate}
      />,
    )

    // Banner is restored upon reopening!
    expect(screen.getByTestId('bulk-apply-banner')).toBeInTheDocument()
    expect(screen.getByTestId('apply-bulk-changes-btn')).toBeInTheDocument()
    expect(screen.getByTestId('adjust-unlocked-bulk-btn')).toBeInTheDocument()
  })

  it('opens adjust modal from banner adjust button and verifies Select All orange style', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-dup-1', description: 'Monthly Cloud Storage', amount: -9.99 }
    const tx2 = { ...mockTransactions[1], id: 'tx-dup-2', description: 'Monthly Cloud Storage', amount: -9.99 }
    const onUpdate = vi.fn()

    render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1, tx2]}
        duplicateIds={new Set(['tx-dup-1', 'tx-dup-2'])}
        unlockedDuplicateIds={new Set(['tx-dup-1'])}
        onUpdateTransaction={onUpdate}
      />,
    )

    // Modify tx-dup-1
    const input = screen.getByDisplayValue('Monthly Cloud Storage')
    fireEvent.change(input, { target: { value: 'Google One 2TB' } })

    // Clicking banner adjust button opens adjust modal
    const bannerAdjustBtn = screen.getByTestId('adjust-unlocked-bulk-btn')
    fireEvent.click(bannerAdjustBtn)
    expect(screen.getByText('Adjust Unlocked Transactions in Bulk')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-custom-adjust-btn')).toBeInTheDocument()

    // Select all / Deselect all button check
    const selectAllBtn = screen.getByTestId('adjust-select-all-btn')
    expect(selectAllBtn).toHaveTextContent('Deselect all')
    expect(selectAllBtn.className).not.toContain('adjust-select-all-btn-orange')

    // Click Deselect all -> button text changes to Select all and turns orange
    fireEvent.click(selectAllBtn)
    expect(selectAllBtn).toHaveTextContent('Select all')
    expect(selectAllBtn.className).toContain('adjust-select-all-btn-orange')
  })

  it('does not mark target transactions as duplicate in Adjust Unlocked Transactions in Bulk modal', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-dup-1', description: 'Web Hosting', amount: -20 }
    const tx2 = { ...mockTransactions[1], id: 'tx-dup-2', description: 'Web Hosting', amount: -20 }
    const onUpdate = vi.fn()

    render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1, tx2]}
        duplicateIds={new Set(['tx-dup-1', 'tx-dup-2'])}
        unlockedDuplicateIds={new Set(['tx-dup-1'])}
        onUpdateTransaction={onUpdate}
      />,
    )

    // Modify tx-dup-1
    const input = screen.getByDisplayValue('Web Hosting')
    fireEvent.change(input, { target: { value: 'Dedicated Server' } })

    // Open Adjust modal
    const adjustBtn = screen.getByTestId('adjust-unlocked-bulk-btn')
    fireEvent.click(adjustBtn)

    expect(screen.getByText('Adjust Unlocked Transactions in Bulk')).toBeInTheDocument()

    // The target item should be visible with description and amount, but NO duplicate pill
    const targetItem = screen.getByTestId('adjust-target-item-tx-dup-2')
    expect(targetItem).toBeInTheDocument()
    expect(targetItem).not.toHaveTextContent('Duplicate')
  })

  it('prompts to reset single or all modified transactions when multiple transactions have been modified', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-1', description: 'Item 1', amount: -10 }
    const tx2 = { ...mockTransactions[1], id: 'tx-2', description: 'Item 2', amount: -20 }
    const onUpdate = vi.fn()

    render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1, tx2]}
        onUpdateTransaction={onUpdate}
      />,
    )

    // Modify tx-1
    const input1 = screen.getByDisplayValue('Item 1')
    fireEvent.change(input1, { target: { value: 'Item 1 Modified' } })

    // Modify tx-2
    const input2 = screen.getByDisplayValue('Item 2')
    fireEvent.change(input2, { target: { value: 'Item 2 Modified' } })

    // Click reset button on tx-1
    const resetBtn1 = screen.getByTestId('reset-tx-btn-tx-1')
    fireEvent.click(resetBtn1)

    // Confirmation modal should appear offering single or bulk reset
    expect(screen.getByText('Reset Transactions')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-reset-single-btn')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-reset-all-btn')).toHaveTextContent('Reset all (2) in bulk')

    // Click "Reset only this"
    fireEvent.click(screen.getByTestId('confirm-reset-single-btn'))

    // onUpdate should be called for tx-1 to reset, but tx-2 should not be reset
    expect(onUpdate).toHaveBeenCalledWith('tx-1', {
      description: 'Item 1',
      date: tx1.date,
      amount: -10,
      type: 'expense',
    })
    expect(onUpdate).not.toHaveBeenCalledWith('tx-2', {
      description: 'Item 2',
      date: tx2.date,
      amount: -20,
      type: 'expense',
    })
  })

  it('resets all modified transactions when choosing Reset All in confirmation modal', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-1', description: 'Coffee', amount: -4 }
    const tx2 = { ...mockTransactions[1], id: 'tx-2', description: 'Lunch', amount: -15 }
    const onUpdate = vi.fn()

    render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1, tx2]}
        onUpdateTransaction={onUpdate}
      />,
    )

    // Modify tx-1 and tx-2
    fireEvent.change(screen.getByDisplayValue('Coffee'), { target: { value: 'Espresso' } })
    fireEvent.change(screen.getByDisplayValue('Lunch'), { target: { value: 'Steak Lunch' } })

    // Click reset on tx-2
    fireEvent.click(screen.getByTestId('reset-tx-btn-tx-2'))

    // Click "Reset all (2) in bulk"
    fireEvent.click(screen.getByTestId('confirm-reset-all-btn'))

    expect(onUpdate).toHaveBeenCalledWith('tx-1', {
      description: 'Coffee',
      date: tx1.date,
      amount: -4,
      type: 'expense',
    })
    expect(onUpdate).toHaveBeenCalledWith('tx-2', {
      description: 'Lunch',
      date: tx2.date,
      amount: -15,
      type: 'expense',
    })
  })

  it('allows bulk resetting modified transactions from the banner button', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-dup-1', description: 'Gym Membership', amount: -50 }
    const tx2 = { ...mockTransactions[1], id: 'tx-dup-2', description: 'Gym Membership', amount: -50 }
    const onUpdate = vi.fn()

    render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1, tx2]}
        duplicateIds={new Set(['tx-dup-1', 'tx-dup-2'])}
        unlockedDuplicateIds={new Set(['tx-dup-1', 'tx-dup-2'])}
        onUpdateTransaction={onUpdate}
      />,
    )

    // Modify tx-dup-1 and tx-dup-2
    const inputs = screen.getAllByDisplayValue('Gym Membership')
    fireEvent.change(inputs[0], { target: { value: 'Gym Membership Premium' } })
    fireEvent.change(inputs[1], { target: { value: 'Gym Membership VIP' } })

    // Banner shows bulk reset button
    const bannerResetBtn = screen.getByTestId('bulk-reset-all-banner-btn')
    expect(bannerResetBtn).toBeInTheDocument()

    // Clicking it opens confirmation modal
    fireEvent.click(bannerResetBtn)
    expect(screen.getByText('Reset Transactions')).toBeInTheDocument()

    // Confirm bulk reset
    fireEvent.click(screen.getByTestId('confirm-reset-all-btn'))

    expect(onUpdate).toHaveBeenCalledWith('tx-dup-1', {
      description: 'Gym Membership',
      date: tx1.date,
      amount: -50,
      type: 'expense',
    })
    expect(onUpdate).toHaveBeenCalledWith('tx-dup-2', {
      description: 'Gym Membership',
      date: tx2.date,
      amount: -50,
      type: 'expense',
    })
  })

  it('unlocks all identical duplicates when user chooses to unlock all in UnlockDuplicateModal', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-dup-1', description: 'Monthly Netflix', amount: -15.99 }
    const tx2 = { ...mockTransactions[1], id: 'tx-dup-2', description: 'Monthly Netflix', amount: -15.99 }
    const onUnlock = vi.fn()

    render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1, tx2]}
        duplicateIds={new Set(['tx-dup-1', 'tx-dup-2'])}
        unlockedDuplicateIds={new Set()}
        onUnlockDuplicateTransaction={onUnlock}
      />,
    )

    // Click unlock on tx-dup-1
    fireEvent.click(screen.getByTestId('unlock-duplicate-btn-tx-dup-1'))

    // The modal should detect 2 identical duplicates
    expect(screen.getByTestId('identical-duplicates-notice')).toBeInTheDocument()
    const unlockAllBtn = screen.getByTestId('confirm-unlock-all-btn')
    expect(unlockAllBtn).toBeInTheDocument()

    // Click unlock all
    fireEvent.click(unlockAllBtn)

    // onUnlock should be called for both tx-dup-1 and tx-dup-2
    expect(onUnlock).toHaveBeenCalledWith(expect.objectContaining({ id: 'tx-dup-1' }), true)
    expect(onUnlock).toHaveBeenCalledWith(expect.objectContaining({ id: 'tx-dup-2' }), true)
  })

  it('resets and locks a modified duplicate when "Also lock as duplicate" is selected', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-dup-1', description: 'Monthly Gym', amount: -50 }
    const onUpdate = vi.fn()
    const onRelock = vi.fn()

    render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1]}
        duplicateIds={new Set(['tx-dup-1'])}
        unlockedDuplicateIds={new Set(['tx-dup-1'])}
        onUpdateTransaction={onUpdate}
        onRelockDuplicateTransaction={onRelock}
      />,
    )

    // Modify tx-dup-1
    fireEvent.change(screen.getByDisplayValue('Monthly Gym'), { target: { value: 'Annual Gym' } })

    // Reset button should be visible
    const resetBtn = screen.getByTestId('reset-tx-btn-tx-dup-1')
    fireEvent.click(resetBtn)

    // Confirmation modal appears with "Also lock as duplicate" checked by default
    expect(screen.getByTestId('reset-also-lock-checkbox')).toBeChecked()
    const confirmBtn = screen.getByTestId('confirm-reset-single-btn')
    expect(confirmBtn).toHaveTextContent('Reset and lock')

    // Confirm reset and lock
    fireEvent.click(confirmBtn)

    expect(onUpdate).toHaveBeenCalledWith('tx-dup-1', {
      description: 'Monthly Gym',
      date: tx1.date,
      amount: -50,
      type: 'expense',
    })
    expect(onRelock).toHaveBeenCalledWith(expect.objectContaining({ id: 'tx-dup-1' }))
  })

  it('resets and locks all modified duplicates in bulk when "Also lock as duplicate" is selected', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-dup-1', description: 'Coffee', amount: -4 }
    const tx2 = { ...mockTransactions[1], id: 'tx-dup-2', description: 'Lunch', amount: -15 }
    const onUpdate = vi.fn()
    const onRelock = vi.fn()

    render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1, tx2]}
        duplicateIds={new Set(['tx-dup-1', 'tx-dup-2'])}
        unlockedDuplicateIds={new Set(['tx-dup-1', 'tx-dup-2'])}
        onUpdateTransaction={onUpdate}
        onRelockDuplicateTransaction={onRelock}
      />,
    )

    // Modify both
    fireEvent.change(screen.getByDisplayValue('Coffee'), { target: { value: 'Latte' } })
    fireEvent.change(screen.getByDisplayValue('Lunch'), { target: { value: 'Dinner' } })

    // Click reset on tx-dup-1
    fireEvent.click(screen.getByTestId('reset-tx-btn-tx-dup-1'))

    // Checkbox is checked
    expect(screen.getByTestId('reset-also-lock-checkbox')).toBeChecked()
    const bulkResetBtn = screen.getByTestId('confirm-reset-all-btn')
    expect(bulkResetBtn).toHaveTextContent('Reset and lock all (2)')

    // Click bulk reset and lock
    fireEvent.click(bulkResetBtn)

    expect(onUpdate).toHaveBeenCalledWith('tx-dup-1', {
      description: 'Coffee',
      date: tx1.date,
      amount: -4,
      type: 'expense',
    })
    expect(onUpdate).toHaveBeenCalledWith('tx-dup-2', {
      description: 'Lunch',
      date: tx2.date,
      amount: -15,
      type: 'expense',
    })
    expect(onRelock).toHaveBeenCalledWith(expect.objectContaining({ id: 'tx-dup-1' }))
    expect(onRelock).toHaveBeenCalledWith(expect.objectContaining({ id: 'tx-dup-2' }))
  })

  it('renders duplicate filter button in toolbar and filters duplicates on click', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-1', description: 'Salary', isDuplicate: false }
    const tx2 = { ...mockTransactions[1], id: 'tx-2', description: 'Groceries Dup', isDuplicate: true }

    render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1, tx2]}
        duplicateIds={new Set(['tx-2'])}
      />,
    )

    // Button should be visible with badge '1'
    const dupFilterBtn = screen.getByTestId('filter-duplicates-btn')
    expect(dupFilterBtn).toBeInTheDocument()
    expect(dupFilterBtn).toHaveTextContent('1')

    // Both should initially be rendered
    expect(screen.getByText('Salary')).toBeInTheDocument()
    expect(screen.getByText('Groceries Dup')).toBeInTheDocument()

    // Click duplicate filter button
    fireEvent.click(dupFilterBtn)

    // Only duplicate transaction should remain
    expect(screen.getByText('Groceries Dup')).toBeInTheDocument()
    expect(screen.queryByText('Salary')).not.toBeInTheDocument()

    // Click duplicate filter button again to show all
    fireEvent.click(dupFilterBtn)
    expect(screen.getByText('Salary')).toBeInTheDocument()
    expect(screen.getByText('Groceries Dup')).toBeInTheDocument()
  })

  it('allows toggling between duplicates and all transactions when opened with initialFilter="duplicates"', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-1', description: 'Normal Transaction' }
    const tx2 = { ...mockTransactions[1], id: 'tx-2', description: 'Duplicate Transaction', isDuplicate: true }

    render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1, tx2]}
        initialFilter="duplicates"
        duplicateIds={new Set(['tx-2'])}
      />,
    )

    // Should only show duplicate initially
    expect(screen.getByText('Duplicate Transaction')).toBeInTheDocument()
    expect(screen.queryByText('Normal Transaction')).not.toBeInTheDocument()

    // Filter button is active and displays count 1
    const dupFilterBtn = screen.getByTestId('filter-duplicates-btn')
    expect(dupFilterBtn).toBeInTheDocument()
    expect(dupFilterBtn).toHaveAttribute('aria-pressed', 'true')

    // Click to toggle to all
    fireEvent.click(dupFilterBtn)

    // Both should now be visible
    expect(screen.getByText('Duplicate Transaction')).toBeInTheDocument()
    expect(screen.getByText('Normal Transaction')).toBeInTheDocument()
  })

  it('does not render Unlocked filter button when isImport is false, even if duplicate transactions exist', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-1', description: 'Salary', isDuplicate: false }
    const tx2 = { ...mockTransactions[1], id: 'tx-2', description: 'Groceries Dup', isDuplicate: true }

    render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1, tx2]}
        isImport={false}
      />,
    )

    // Duplicates filter button is visible because duplicates exist
    expect(screen.getByTestId('filter-duplicates-btn')).toBeInTheDocument()

    // Unlocked filter button must NOT appear on dashboard-related generic modal view
    expect(screen.queryByTestId('filter-unlocked-btn')).not.toBeInTheDocument()
  })

  it('renders Unlocked filter button during import when duplicates exist', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-1', description: 'Salary', isDuplicate: false }
    const tx2 = { ...mockTransactions[1], id: 'tx-2', description: 'Groceries Dup', isDuplicate: true }

    render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1, tx2]}
        isImport={true}
        duplicateIds={new Set(['tx-2'])}
      />,
    )

    // During import, Unlocked button should appear
    expect(screen.getByTestId('filter-unlocked-btn')).toBeInTheDocument()
  })

  it('renders Modified filter button and filters to modified duplicates', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-1', description: 'Salary', isDuplicate: false }
    const tx2 = { ...mockTransactions[1], id: 'tx-2', description: 'Groceries Dup', isDuplicate: true, isModified: false }
    const tx3 = { ...mockTransactions[1], id: 'tx-3', description: 'Groceries Modified', isDuplicate: true, isModified: true }

    render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1, tx2, tx3]}
        duplicateIds={new Set(['tx-2', 'tx-3'])}
      />,
    )

    // Modified filter button appears
    const modBtn = screen.getByTestId('filter-modified-btn')
    expect(modBtn).toBeInTheDocument()
    expect(modBtn).toHaveTextContent('1')

    // Click to filter by modified
    fireEvent.click(modBtn)

    expect(screen.getByText('Groceries Modified')).toBeInTheDocument()
    expect(screen.queryByText('Salary')).not.toBeInTheDocument()
    expect(screen.queryByText('Groceries Dup')).not.toBeInTheDocument()
  })

  it('renders duplicate pill on transaction level when filtered by duplicates, matching modified pill in modified view', () => {
    const tx1 = { ...mockTransactions[0], id: 'tx-1', description: 'Salary', isDuplicate: false }
    const tx2 = { ...mockTransactions[1], id: 'tx-2', description: 'Groceries Dup', isDuplicate: true, isModified: false }
    const tx3 = { ...mockTransactions[1], id: 'tx-3', description: 'Groceries Modified', isDuplicate: true, isModified: true }

    render(
      <TransactionPreviewModal
        {...defaultProps}
        isOpen={true}
        transactions={[tx1, tx2, tx3]}
        duplicateIds={new Set(['tx-2', 'tx-3'])}
      />,
    )

    // Click to filter by duplicates
    const dupBtn = screen.getByTestId('filter-duplicates-btn')
    fireEvent.click(dupBtn)

    // Purely duplicated transaction has the duplicate badge on the row level
    const dupBadge = screen.getByTestId('preview-duplicate-badge-tx-2')
    expect(dupBadge).toBeInTheDocument()
    expect(dupBadge).toHaveTextContent('Duplicate')

    // Click to filter by modified
    const modBtn = screen.getByTestId('filter-modified-btn')
    fireEvent.click(modBtn)

    // Modified transaction has the modified badge on the row level
    const modBadge = screen.getByTestId('preview-modified-badge-tx-3')
    expect(modBadge).toBeInTheDocument()
    expect(modBadge).toHaveTextContent('Modified')
  })
})



