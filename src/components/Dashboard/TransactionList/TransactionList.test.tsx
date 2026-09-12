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
})
