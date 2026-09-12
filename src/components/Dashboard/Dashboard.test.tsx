import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TranslationStrings } from '../../i18n/translations'
import { type AppState, useAppStore } from '../../store/useAppStore'
import type { LanguageState } from '../../store/useLanguageStore'
import Dashboard from './Dashboard'

if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver
}

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div>Bar</div>,
  ComposedChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div>Line</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  Tooltip: () => <div>Tooltip</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: ({ children, shape, data }: { children?: React.ReactNode; shape?: (props: Record<string, unknown>, idx: number) => React.ReactNode; data?: Array<Record<string, unknown>> }) => (
    <div>
      Pie
      {data?.map((item: Record<string, unknown>, idx: number) => (
        <div key={idx}>
          {shape ? shape({ ...item, cx: 100, cy: 100, innerRadius: 50, outerRadius: 80, startAngle: 0, endAngle: 180, fill: '#fff' }, idx) : null}
        </div>
      ))}
      {children}
    </div>
  ),
  Cell: () => <div>Cell</div>,
  Sector: () => <div>Sector</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => <div>Area</div>,
  Legend: () => <div>Legend</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
}))

const { mockResetImport } = vi.hoisted(() => ({
  mockResetImport: vi.fn(),
}))

// Mock the stores
vi.mock('../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      importedAccounts: [
        {
          institutionId: '1',
          institutionName: 'Bank A',
          importedAt: '2024-01-01T12:00:00Z',
          transactions: [
            {
              id: 't1',
              amount: 3000,
              type: 'income',
              date: '2024-01-01',
              description: 'Salary',
              institution: 'Bank A',
            },
            {
              id: 't2',
              amount: -1000,
              type: 'expense',
              date: '2024-01-02',
              description: 'Rent',
              institution: 'Bank A',
            },
            {
              id: 't3',
              amount: -50,
              type: 'expense',
              date: '2024-01-03',
              description: 'Random',
              institution: 'Bank A',
            },
          ],
        },
      ],
      resetImport: mockResetImport,
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      t: {
        newImport: 'New Import',
        totalBalance: 'Total Balance',
        income: 'Income',
        expenses: 'Expenses',
        incomeVsExpenses: 'Income vs Expenses',
        expenseCategories: 'Expense Categories',
        spendingTrend: 'Spending Trend',
        allTransactions: 'All Transactions',
        search: 'Search',
        allInstitutions: 'All Institutions',
        newestFirst: 'Newest First',
        oldestFirst: 'Oldest First',
        highestAmount: 'Highest Amount',
        lowestAmount: 'Lowest Amount',
        catSalary: 'Salary',
        catRent: 'Rent',
        catOther: 'Other',
        noTransactionsMatch: 'No transactions',
        ofAvgIncome: '{percent}% of average income',
        ofTotal: '{percent}% of total expenses',
        insightTransactions: 'Transactions',
        insightAvgTransaction: 'Average Transaction',
        insightTopCategory: 'Top Category',
        insightMedian: 'Median Transaction',
        showingOf: 'Showing {shown} of {total}',
        perPage: 'Per page:',
      } as unknown as TranslationStrings,
    }
    return typeof selector === 'function' ? selector(state as LanguageState) : state
  }),
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders summary statistics correctly', () => {
    render(<Dashboard />)

    // balance = 3000 - (1000 + 50) = 1950
    expect(screen.getAllByText('Total Balance').length).toBeGreaterThan(0)
    // Use regex to be flexible with spaces and currency symbols
    expect(screen.getAllByText(/1[.,]950/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/3[.,]000/).length).toBeGreaterThan(0) // Income
    expect(screen.getAllByText(/1[.,]050/).length).toBeGreaterThan(0) // Expenses
  })

  it('filters transactions by search term', () => {
    render(<Dashboard />)

    const searchInput = screen.getByPlaceholderText('Search')
    fireEvent.change(searchInput, { target: { value: 'Rent' } })

    const txList = screen.getByTestId('transaction-list')
    expect(within(txList).getAllByText('Rent').length).toBeGreaterThan(0)
    expect(within(txList).queryByText('Random')).not.toBeInTheDocument()
  })

  it('sorts transactions correctly', () => {
    render(<Dashboard />)

    const sortSelect = screen.getByDisplayValue('Newest First')

    // Test Highest Amount sorting
    fireEvent.change(sortSelect, { target: { value: 'highest' } })

    const txList = screen.getByTestId('transaction-list')
    const salaryEl = within(txList).getAllByText('Salary')[0]
    const rentEl = within(txList).getAllByText('Rent')[0]
    const randomEl = within(txList).getByText('Random')

    // Highest abs amount should be first (3000 -> Salary, then 1000 -> Rent, then 50 -> Random)
    expect(salaryEl.compareDocumentPosition(rentEl)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(rentEl.compareDocumentPosition(randomEl)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('renders category breakdown', () => {
    render(<Dashboard />)

    expect(screen.getByText('Expense Categories')).toBeInTheDocument()
    // Use getAllByText as 'Rent' appears in both category list and transaction list
    expect(screen.getAllByText('Rent').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Other').length).toBeGreaterThan(0)
  })

  it('handles empty transactions state', () => {
    vi.mocked(useAppStore).mockImplementation((selector) => {
      const state = { importedAccounts: [], resetImport: vi.fn() }
      return typeof selector === 'function' ? selector(state as unknown as AppState) : state
    })

    render(<Dashboard />)
    expect(screen.getAllByText('No transactions').length).toBeGreaterThan(0)
  })
})
