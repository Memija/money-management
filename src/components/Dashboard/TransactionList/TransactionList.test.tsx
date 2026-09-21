import type { HTMLAttributes } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type LanguageState, useLanguageStore } from '../../../store/useLanguageStore'
import type { Transaction } from '../../../types'
import { TransactionList } from './TransactionList'

// Mock the framer-motion module
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
      <div className={className} data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
}))

// Mock lucide-react icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>()
  return {
    ...actual,
    ArrowDownLeft: () => <div data-testid="icon-arrow-down-left" />,
    ArrowUpRight: () => <div data-testid="icon-arrow-up-right" />,
    Search: () => <div data-testid="icon-search" />,
  }
})

// Mock custom hooks
vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn(),
}))

vi.mock('../../../hooks/useFormatters', () => ({
  useFormatters: () => ({
    formatDate: (date: string) => `Date: ${date}`,
    formatCurrency: (amount: number) => `$${amount}`,
    formatTransactionCount: (count: number) => `${count} transactions`,
  }),
}))

vi.mock('../../../utils/category-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../utils/category-utils')>()
  return {
    ...actual,
    getCategoryLabel: (catKey: string) => `Cat: ${catKey}`,
    normalizeDescription: (desc: string) => desc.toLowerCase().trim(),
  }
})

vi.mock('../../../utils/category-icons', () => ({
  getCategoryIcon: () => <div data-testid="category-icon" />,
  AVAILABLE_ICONS: {},
  ICON_GROUPS: [],
  ICON_COLORS: {},
}))

const mockTranslations = {
  allTransactions: 'All Transactions',
  search: 'Search',
  allInstitutions: 'All Institutions',
  newestFirst: 'Newest First',
  oldestFirst: 'Oldest First',
  highestAmount: 'Highest Amount',
  lowestAmount: 'Lowest Amount',
  showingOf: 'Showing {shown} of {total}',
  noTransactionsMatch: 'No transactions match',
  all: 'All',
  income: 'Income',
  expenses: 'Expenses',
  clear: 'Clear',
  transactions: 'Transactions',
  totalBalance: 'Total Balance',
  perPage: 'Per page:',
  internalTransfer: 'Internal Transfer',
  internalTransfers: 'Transfers',
  duplicate: 'Duplicate',
  ghostTransfersHidden: '{count} internal transfers hidden',
  ghostTransfersShown: 'Showing internal transfers',
  showInternalTransfers: 'Show internal transfers',
  hideInternalTransfers: 'Hide internal transfers',
  transfersTabNotice:
    'Internal transfers between your accounts are excluded from income and expenses (read-only).',
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2023-01-01',
    description: 'Groceries',
    amount: 50,
    currency: 'USD',
    type: 'expense',
    category: 'Food',
    institution: 'Bank A',
  },
  {
    id: '2',
    date: '2023-01-02',
    description: 'Salary',
    amount: 1000,
    currency: 'USD',
    type: 'income',
    category: 'Salary',
    institution: 'Bank B',
  },
]

describe('TransactionList Component', () => {
  beforeEach(() => {
    (useLanguageStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = { t: mockTranslations, locale: 'en' } as unknown as LanguageState
      return typeof selector === 'function' ? selector(state) : state
    })
  })

  it('renders transactions correctly', () => {
    const setSearchTerm = vi.fn()
    const setSelectedInstitution = vi.fn()
    const setSortOrder = vi.fn()

    render(
      <TransactionList
        filteredTx={mockTransactions}
        institutionNames={['Bank A', 'Bank B']}
        searchTerm=""
        setSearchTerm={setSearchTerm}
        selectedInstitution="all"
        setSelectedInstitution={setSelectedInstitution}
        sortOrder="newest"
        setSortOrder={setSortOrder}
      />
    )

    // Check title and subtitle
    expect(screen.getByText('All Transactions')).toBeInTheDocument()
    expect(screen.getByText('2 transactions')).toBeInTheDocument()

    // Check search input
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()

    // Check transactions
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.getByText('Salary')).toBeInTheDocument()

    // Check formatting
    expect(screen.getByText('Date: 2023-01-01 • Bank A')).toBeInTheDocument()
    expect(screen.getByText('Date: 2023-01-02 • Bank B')).toBeInTheDocument()

    // Check amounts
    expect(screen.getByText('$50')).toBeInTheDocument()
    expect(screen.getByText('+$1000')).toBeInTheDocument()

    // Check categories
    expect(screen.getByText('Cat: Food')).toBeInTheDocument()
    expect(screen.getByText('Cat: Salary')).toBeInTheDocument()
  })

  it('renders empty state correctly', () => {
    render(
      <TransactionList
        filteredTx={[]}
        institutionNames={[]}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    expect(screen.getByText('No transactions match')).toBeInTheDocument()
  })

  it('handles search input change', () => {
    const setSearchTerm = vi.fn()
    render(
      <TransactionList
        filteredTx={mockTransactions}
        institutionNames={['Bank A', 'Bank B']}
        searchTerm=""
        setSearchTerm={setSearchTerm}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search')
    fireEvent.change(searchInput, { target: { value: 'gro' } })

    expect(setSearchTerm).toHaveBeenCalledWith('gro')
  })

  it('handles institution filter change', () => {
    const setSelectedInstitution = vi.fn()
    render(
      <TransactionList
        filteredTx={mockTransactions}
        institutionNames={['Bank A', 'Bank B']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={setSelectedInstitution}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    const select = screen.getByLabelText('All Institutions')
    fireEvent.change(select, { target: { value: 'Bank A' } })

    expect(setSelectedInstitution).toHaveBeenCalledWith('Bank A')
  })

  it('handles sort order change', () => {
    const setSortOrder = vi.fn()
    render(
      <TransactionList
        filteredTx={mockTransactions}
        institutionNames={['Bank A', 'Bank B']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={setSortOrder}
      />
    )

    const select = screen.getByLabelText('Sort order')
    fireEvent.change(select, { target: { value: 'highest' } })

    expect(setSortOrder).toHaveBeenCalledWith('highest')
  })

  it('does not render institution filter if less than 2 institutions exist', () => {
    render(
      <TransactionList
        filteredTx={mockTransactions}
        institutionNames={['Bank A']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    // Should not find the institution select
    expect(screen.queryByLabelText('All Institutions')).not.toBeInTheDocument()
  })

  it('filters transactions by type when clicking Income and Expenses tabs', () => {
    render(
      <TransactionList
        filteredTx={mockTransactions}
        institutionNames={['Bank A', 'Bank B']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    // Initially both Groceries and Salary are displayed
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.getByText('Salary')).toBeInTheDocument()

    // Click Income tab
    const incomeTab = screen.getByRole('tab', { name: /Income/i })
    fireEvent.click(incomeTab)

    // Only Salary (income) is shown, Groceries (expense) is hidden
    expect(screen.getByText('Salary')).toBeInTheDocument()
    expect(screen.queryByText('Groceries')).not.toBeInTheDocument()

    // Click Expenses tab
    const expensesTab = screen.getByRole('tab', { name: /Expenses/i })
    fireEvent.click(expensesTab)

    // Only Groceries is shown, Salary is hidden
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.queryByText('Salary')).not.toBeInTheDocument()

    // Click All tab
    const allTab = screen.getByRole('tab', { name: /All/i })
    fireEvent.click(allTab)

    // Both are shown again
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.getByText('Salary')).toBeInTheDocument()
  })

  it('allows clearing search term using clear button', () => {
    const setSearchTerm = vi.fn()
    render(
      <TransactionList
        filteredTx={mockTransactions}
        institutionNames={['Bank A', 'Bank B']}
        searchTerm="gro"
        setSearchTerm={setSearchTerm}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    const clearButton = screen.getByRole('button', { name: 'Clear search' })
    expect(clearButton).toBeInTheDocument()
    fireEvent.click(clearButton)

    expect(setSearchTerm).toHaveBeenCalledWith('')
  })

  it('allows resetting all filters using reset filters button', () => {
    const setSearchTerm = vi.fn()
    const setSelectedInstitution = vi.fn()
    render(
      <TransactionList
        filteredTx={mockTransactions}
        institutionNames={['Bank A', 'Bank B']}
        searchTerm="gro"
        setSearchTerm={setSearchTerm}
        selectedInstitution="Bank A"
        setSelectedInstitution={setSelectedInstitution}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    const resetBtn = screen.getByRole('button', { name: 'Reset all filters' })
    expect(resetBtn).toBeInTheDocument()
    fireEvent.click(resetBtn)

    expect(setSearchTerm).toHaveBeenCalledWith('')
    expect(setSelectedInstitution).toHaveBeenCalledWith('all')
  })

  it('displays total balance stat pill calculated from transactions', () => {
    render(
      <TransactionList
        filteredTx={mockTransactions}
        institutionNames={['Bank A', 'Bank B']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    expect(screen.getByText('Total Balance')).toBeInTheDocument()
    // Net balance: 1000 income - 50 expense = 950 -> +$950
    expect(screen.getByText('+$950')).toBeInTheDocument()
  })

  it('renders rows per page selector and changes page size', () => {
    // Generate 15 mock transactions to test paging
    const fifteenTransactions: Transaction[] = Array.from({ length: 15 }, (_, i) => ({
      id: `tx-${i + 1}`,
      date: '2023-01-01',
      description: `Tx item ${i + 1}`,
      amount: 10,
      currency: 'USD',
      type: 'expense',
      category: 'Food',
      institution: 'Bank A',
    }))

    render(
      <TransactionList
        filteredTx={fifteenTransactions}
        institutionNames={['Bank A']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    // By default pageSize is 10, so 10 items shown
    expect(screen.getByText('Showing 10 of 15')).toBeInTheDocument()
    expect(screen.getByText('Tx item 1')).toBeInTheDocument()
    expect(screen.getByText('Tx item 10')).toBeInTheDocument()
    expect(screen.queryByText('Tx item 11')).not.toBeInTheDocument()

    // Page selector is present with default 10
    const pageSizeSelect = screen.getByLabelText('Per page:')
    expect(pageSizeSelect).toBeInTheDocument()
    expect(pageSizeSelect).toHaveValue('10')

    // Change page size to 25
    fireEvent.change(pageSizeSelect, { target: { value: '25' } })

    // Now all 15 items should be shown on 1 page
    expect(screen.getByText('Showing 15 of 15')).toBeInTheDocument()
    expect(screen.getByText('Tx item 15')).toBeInTheDocument()
  })

  it('truncates page numbers with ellipsis when total pages > 7', () => {
    // Generate 140 mock transactions (14 pages at pageSize=10)
    const manyTransactions: Transaction[] = Array.from({ length: 140 }, (_, i) => ({
      id: `tx-${i + 1}`,
      date: '2023-01-01',
      description: `Tx item ${i + 1}`,
      amount: 10,
      currency: 'USD',
      type: 'expense',
      category: 'Food',
      institution: 'Bank A',
    }))

    render(
      <TransactionList
        filteredTx={manyTransactions}
        institutionNames={['Bank A']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    // On page 1: should show 1, 2, 3, 4, 5, ellipsis, 14
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 14' })).toBeInTheDocument()
    // Middle pages like 6, 7 should NOT be rendered
    expect(screen.queryByRole('button', { name: 'Page 6' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Page 7' })).not.toBeInTheDocument()

    // Click on page 5
    fireEvent.click(screen.getByRole('button', { name: 'Page 5' }))

    // On page 5 (middle): should show 1, ..., 4, 5, 6, ..., 14
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 4' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 6' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 14' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Page 2' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Page 8' })).not.toBeInTheDocument()
  })

  it('should display the ghost transfer toggle button when ghostCount > 0 and call setShowGhost on click', () => {
    const setShowGhost = vi.fn()
    render(
      <TransactionList
        filteredTx={mockTransactions}
        institutionNames={['Bank A', 'Bank B']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
        showGhost={false}
        setShowGhost={setShowGhost}
        ghostCount={5}
      />
    )

    const toggleBtn = screen.getByRole('button', { name: 'Show internal transfers' })
    expect(toggleBtn).toBeInTheDocument()
    expect(toggleBtn).toHaveTextContent('5 internal transfers hidden')

    fireEvent.click(toggleBtn)
    expect(setShowGhost).toHaveBeenCalledWith(true)
  })

  it('should display the transfers tab and ghost transactions when showGhost is true', () => {
    const transactionsWithGhost: Transaction[] = [
      ...mockTransactions,
      {
        id: 'tx-ghost-1',
        date: '2023-01-03',
        description: 'Internal Transfer to Bank B',
        amount: -200,
        currency: 'USD',
        type: 'expense',
        institution: 'Bank A',
        isGhost: true,
      },
    ]

    render(
      <TransactionList
        filteredTx={transactionsWithGhost}
        institutionNames={['Bank A', 'Bank B']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
        showGhost={true}
        setShowGhost={vi.fn()}
        ghostCount={1}
      />
    )

    // Transfers tab should be visible
    const transfersTab = screen.getByRole('tab', { name: /Transfers/i })
    expect(transfersTab).toBeInTheDocument()

    // In 'All' tab by default, ghost transactions are NOT shown!
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.queryByText('Internal Transfer to Bank B')).not.toBeInTheDocument()

    // Clicking transfers tab should filter to only ghost transactions
    fireEvent.click(transfersTab)
    expect(screen.getByText('Internal Transfer to Bank B')).toBeInTheDocument()
    expect(screen.queryByText('Groceries')).not.toBeInTheDocument()

    // In Transfers view, ghost transactions are strictly read-only
    expect(screen.getByTestId('tx-ghost-readonly-tx-ghost-1')).toBeInTheDocument()
    expect(screen.getByTestId('transfers-read-only-notice')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Internal transfers between your accounts are excluded from income and expenses (read-only).'
      )
    ).toBeInTheDocument()

    // In Transfers view, calculation impact is €0.00 / 0 impact
    expect(screen.getByText(/0 impact/i)).toBeInTheDocument()
  })

  it('never shows ghost transactions in income or expense tabs', () => {
    const transactionsWithGhost: Transaction[] = [
      ...mockTransactions,
      {
        id: 'tx-ghost-exp',
        date: '2023-01-03',
        description: 'Internal Transfer Expense',
        amount: -200,
        currency: 'USD',
        type: 'expense',
        institution: 'Bank A',
        isGhost: true,
      },
      {
        id: 'tx-ghost-inc',
        date: '2023-01-03',
        description: 'Internal Transfer Income',
        amount: 200,
        currency: 'USD',
        type: 'income',
        institution: 'Bank B',
        isGhost: true,
      },
    ]

    render(
      <TransactionList
        filteredTx={transactionsWithGhost}
        institutionNames={['Bank A', 'Bank B']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
        showGhost={true}
        setShowGhost={vi.fn()}
        ghostCount={2}
      />
    )

    // Check Income tab
    const incomeTab = screen.getByRole('tab', { name: /Income/i })
    fireEvent.click(incomeTab)
    expect(screen.queryByText('Internal Transfer Income')).not.toBeInTheDocument()

    // Check Expense tab
    const expenseTab = screen.getByRole('tab', { name: /Expenses/i })
    fireEvent.click(expenseTab)
    expect(screen.queryByText('Internal Transfer Expense')).not.toBeInTheDocument()
  })

  it('marks duplicated transactions with a duplicate badge and icon', () => {
    const transactionsWithDuplicate: Transaction[] = [
      ...mockTransactions,
      {
        id: 'tx-dup-1',
        date: '2023-01-03',
        description: 'Duplicate Subscription',
        amount: -15,
        currency: 'USD',
        type: 'expense',
        institution: 'Bank A',
        isDuplicate: true,
      },
    ]

    render(
      <TransactionList
        filteredTx={transactionsWithDuplicate}
        institutionNames={['Bank A']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    const badge = screen.getByTestId('tx-duplicate-badge-tx-dup-1')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('title', 'Duplicate')
    expect(badge).toHaveAttribute('aria-label', 'Duplicate')
  })

  it('renders duplicate badge for forceImport or importedByRuleId transactions even if isDuplicate flag is omitted', () => {
    const transactionsWithForceImport: Transaction[] = [
      ...mockTransactions,
      {
        id: 'tx-force-1',
        date: '2023-01-03',
        description: 'Force Imported Subscription',
        amount: -15,
        currency: 'USD',
        type: 'expense',
        institution: 'Bank A',
        forceImport: true,
      },
    ]

    render(
      <TransactionList
        filteredTx={transactionsWithForceImport}
        institutionNames={['Bank A']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    const badge = screen.getByTestId('tx-duplicate-badge-tx-force-1')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('title', 'Duplicate')
  })

  it('renders modified transactions with an icon-only badge having title and aria-label', () => {
    const transactionsWithModified: Transaction[] = [
      ...mockTransactions,
      {
        id: 'tx-mod-1',
        date: '2023-01-04',
        description: 'Modified Subscription',
        amount: -25,
        currency: 'USD',
        type: 'expense',
        institution: 'Bank A',
        isDuplicate: true,
        isModified: true,
      },
    ]

    render(
      <TransactionList
        filteredTx={transactionsWithModified}
        institutionNames={['Bank A']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    const badge = screen.getByTestId('tx-modified-badge-tx-mod-1')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('title', 'Modified')
    expect(badge).toHaveAttribute('aria-label', 'Modified')
  })

  it('renders Duplicates filter tab when duplicate transactions exist and filters accurately', () => {
    const transactionsWithDuplicate: Transaction[] = [
      ...mockTransactions,
      {
        id: 'tx-dup-1',
        date: '2023-01-03',
        description: 'Duplicate Subscription',
        amount: -15,
        currency: 'USD',
        type: 'expense',
        institution: 'Bank A',
        isDuplicate: true,
      },
    ]

    render(
      <TransactionList
        filteredTx={transactionsWithDuplicate}
        institutionNames={['Bank A']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    const dupTab = screen.getByTestId('filter-duplicates-tab')
    expect(dupTab).toBeInTheDocument()
    expect(dupTab).toHaveTextContent('1')

    // Click Duplicates filter tab
    fireEvent.click(dupTab)

    // Only duplicate transaction should be visible
    expect(screen.getByText('Duplicate Subscription')).toBeInTheDocument()
    expect(screen.queryByText('Groceries')).not.toBeInTheDocument()
    expect(screen.queryByText('Salary')).not.toBeInTheDocument()

    // Click All tab to return
    const allTab = screen.getByRole('tab', { name: /All/i })
    fireEvent.click(allTab)
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.getByText('Duplicate Subscription')).toBeInTheDocument()
  })

  it('does not render Duplicates filter tab when no duplicate transactions exist', () => {
    render(
      <TransactionList
        filteredTx={mockTransactions}
        institutionNames={['Bank A']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    expect(screen.queryByTestId('filter-duplicates-tab')).not.toBeInTheDocument()
  })

  it('renders Modified filter tab when modified duplicate transactions exist and filters properly', () => {
    const txWithModified: Transaction[] = [
      ...mockTransactions,
      {
        id: 'dup-mod-1',
        date: '2026-03-01',
        description: 'Modified Subscription',
        amount: -29.99,
        currency: 'EUR',
        category: 'Entertainment',
        type: 'expense',
        institution: 'Bank A',
        isDuplicate: true,
        isModified: true,
      },
    ]

    render(
      <TransactionList
        filteredTx={txWithModified}
        institutionNames={['Bank A']}
        searchTerm=""
        setSearchTerm={vi.fn()}
        selectedInstitution="all"
        setSelectedInstitution={vi.fn()}
        sortOrder="newest"
        setSortOrder={vi.fn()}
      />
    )

    const modTab = screen.getByTestId('filter-modified-tab')
    expect(modTab).toBeInTheDocument()
    expect(modTab).toHaveTextContent('1')

    // Click Modified filter tab
    fireEvent.click(modTab)

    // Only modified transaction should be visible
    expect(screen.getByText('Modified Subscription')).toBeInTheDocument()
    expect(screen.queryByText('Groceries')).not.toBeInTheDocument()
    expect(screen.queryByText('Salary')).not.toBeInTheDocument()
  })
})
