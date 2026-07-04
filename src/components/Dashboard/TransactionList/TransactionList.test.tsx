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
vi.mock('lucide-react', () => ({
  ArrowDownLeft: () => <div data-testid="icon-arrow-down-left" />,
  ArrowUpRight: () => <div data-testid="icon-arrow-up-right" />,
  Search: () => <div data-testid="icon-search" />,
}))

// Mock custom hooks
vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn(),
}))

vi.mock('../../../hooks/useFormatters', () => ({
  useFormatters: () => ({
    formatDate: (date: string) => `Date: ${date}`,
    formatCurrency: (amount: number) => `$${amount}`,
  }),
}))

vi.mock('../../../utils/category-utils', () => ({
  getCategoryLabel: (catKey: string) => `Cat: ${catKey}`,
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
    (useLanguageStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(<T,>(selector: (state: LanguageState) => T) =>
      selector({ t: mockTranslations } as unknown as LanguageState)
    )
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

    // Check title
    expect(screen.getByText('All Transactions')).toBeInTheDocument()

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
})
