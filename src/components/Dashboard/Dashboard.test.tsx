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

const defaultMockAppState = {
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
  detachTransactionsFromDashboard: false,
  setDetachTransactionsFromDashboard: vi.fn((val: boolean) => {
    defaultMockAppState.detachTransactionsFromDashboard = val
  }),
}

// Mock the stores
vi.mock('../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    return typeof selector === 'function' ? selector(defaultMockAppState) : defaultMockAppState
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
        allAccounts: 'All Accounts',
        allSubAccounts: 'All Sub-accounts',
        subAccounts: 'Sub-accounts',
        bankAccounts: 'Bank Accounts',
        institutions: 'Accounts',
        detachTransactionsAction: 'Filters linked to dashboard (click to detach)',
        attachTransactionsAction: 'Filters detached from dashboard (click to link)',
        detachedBadge: 'Detached',
        detachedBadgeTooltip: 'Filters in this list do not affect dashboard charts or metrics',
      } as unknown as TranslationStrings,
    }
    return typeof selector === 'function' ? selector(state as LanguageState) : state
  }),
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    defaultMockAppState.detachTransactionsFromDashboard = false
    vi.mocked(useAppStore).mockImplementation((selector) => {
      return typeof selector === 'function'
        ? selector(defaultMockAppState as unknown as AppState)
        : (defaultMockAppState as unknown as AppState)
    })
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

  it('allows switching accounts and filtering transactions per bank and sub-account', () => {
    vi.mocked(useAppStore).mockImplementation((selector) => {
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
            ],
          },
          {
            institutionId: '2',
            institutionName: 'Bank B',
            importedAt: '2024-01-01T12:00:00Z',
            transactions: [
              {
                id: 't2',
                amount: -1000,
                type: 'expense',
                date: '2024-01-02',
                description: 'Rent',
                institution: 'Bank B',
                subAccount: 'Savings Space',
              },
              {
                id: 't3',
                amount: -200,
                type: 'expense',
                date: '2024-01-03',
                description: 'Utilities',
                institution: 'Bank B',
                subAccount: 'Bills Space',
              },
            ],
          },
        ],
        resetImport: mockResetImport,
      }
      return typeof selector === 'function' ? selector(state as unknown as AppState) : state
    })

    render(<Dashboard />)

    // Verify header switcher is rendered and open dropdown
    const switcherTrigger = screen.getByTestId('sticky-account-switcher-trigger')
    expect(switcherTrigger).toBeInTheDocument()
    fireEvent.click(switcherTrigger)

    // Verify account options in dropdown
    expect(screen.getByTestId('sticky-account-option-all')).toBeInTheDocument()
    expect(screen.getByTestId('sticky-account-option-1')).toBeInTheDocument()
    expect(screen.getByTestId('sticky-account-option-2')).toBeInTheDocument()

    // Switch to Bank B
    fireEvent.click(screen.getByTestId('sticky-account-option-2'))

    // Open dropdown again — sub-accounts for Bank B should now be visible
    fireEvent.click(screen.getByTestId('sticky-account-switcher-trigger'))
    expect(screen.getByTestId('sticky-subaccount-option-Savings Space')).toBeInTheDocument()
    expect(screen.getByTestId('sticky-subaccount-option-Bills Space')).toBeInTheDocument()

    // Filter to Savings Space
    fireEvent.click(screen.getByTestId('sticky-subaccount-option-Savings Space'))

    // Transaction list should only have Rent, not Utilities, and not show Bank B name
    const txList = screen.getByTestId('transaction-list')
    expect(within(txList).getAllByText('Rent').length).toBeGreaterThan(0)
    expect(within(txList).queryByText('Utilities')).not.toBeInTheDocument()
    expect(within(txList).queryByText('Salary')).not.toBeInTheDocument()
    expect(within(txList).queryByText(/• Bank B/)).not.toBeInTheDocument()
  })

  it('ensures complete balance in total view matches sum of institution view balances when internal transfers are present', () => {
    vi.mocked(useAppStore).mockImplementation((selector) => {
      const state = {
        importedAccounts: [
          {
            institutionId: 'bank-a',
            institutionName: 'Bank A',
            importedAt: '2024-01-01T12:00:00Z',
            transactions: [
              {
                id: 'a1',
                amount: 3000,
                type: 'income',
                date: '2024-01-01',
                description: 'Salary',
                institution: 'Bank A',
              },
              {
                id: 'a2',
                amount: -150,
                type: 'expense',
                date: '2024-01-02',
                description: 'Groceries',
                institution: 'Bank A',
              },
              // Transfer out to savings (single-legged ghost)
              {
                id: 'a3',
                amount: -500,
                type: 'expense',
                date: '2024-01-03',
                description: 'Transfer to Savings',
                institution: 'Bank A',
                isGhost: true,
              },
            ],
          },
          {
            institutionId: 'bank-b',
            institutionName: 'Bank B',
            importedAt: '2024-01-01T12:00:00Z',
            transactions: [
              {
                id: 'b1',
                amount: 1000,
                type: 'income',
                date: '2024-01-01',
                description: 'Bonus',
                institution: 'Bank B',
              },
              {
                id: 'b2',
                amount: -200,
                type: 'expense',
                date: '2024-01-02',
                description: 'Dining',
                institution: 'Bank B',
              },
            ],
          },
        ],
        resetImport: mockResetImport,
      }
      return typeof selector === 'function' ? selector(state as unknown as AppState) : state
    })

    render(<Dashboard />)

    // Bank A ledger balance = 3000 - 150 - 500 = 2350
    // Bank B ledger balance = 1000 - 200 = 800
    // Total ledger balance = 2350 + 800 = 3150

    // 1. In Total Balance view (All Accounts selected by default):
    // Hero balance and header switcher should both show 3,150
    const switcherTrigger = screen.getByTestId('sticky-account-switcher-trigger')
    expect(switcherTrigger).toHaveTextContent(/3[.,]150/)
    const heroSection = document.querySelector('section')!
    expect(heroSection).toHaveTextContent(/3[.,]150/)

    // 2. Click Bank A:
    fireEvent.click(switcherTrigger)
    fireEvent.click(screen.getByTestId('sticky-account-option-bank-a'))
    // Hero balance and switcher should both show 2,350
    expect(switcherTrigger).toHaveTextContent(/2[.,]350/)
    expect(heroSection).toHaveTextContent(/2[.,]350/)

    // 3. Click Bank B:
    fireEvent.click(switcherTrigger)
    fireEvent.click(screen.getByTestId('sticky-account-option-bank-b'))
    // Hero balance and switcher should both show 800
    expect(switcherTrigger).toHaveTextContent(/800/)
    expect(heroSection).toHaveTextContent(/800/)

    // 4. Return to All Accounts:
    fireEvent.click(switcherTrigger)
    fireEvent.click(screen.getByTestId('sticky-account-option-all'))
    expect(heroSection).toHaveTextContent(/3[.,]150/)
  })

  it('opens the social share snapshot modal on button click', () => {
    render(<Dashboard />)
    const shareBtn = screen.getByTestId('dashboard-share-snapshot-btn')
    expect(shareBtn).toBeInTheDocument()

    fireEvent.click(shareBtn)
    expect(screen.getByTestId('share-card-download-btn')).toBeInTheDocument()
  })

  it('updates dashboard analytics and balance when category filter is changed in All Transactions', () => {
    render(<Dashboard />)

    // Initially: Income = 3000, Expenses = 1050 (Rent: 1000, Random: 50), Balance = 1950
    const heroSection = document.querySelector('section')!
    expect(heroSection).toHaveTextContent(/1[.,]950/)

    // Select 'Rent' in category filter
    const categorySelect = screen.getByLabelText('Filter by category')
    fireEvent.change(categorySelect, { target: { value: 'Rent' } })

    // Now dashboard reacts to Rent filter: Expenses should be 1,000, Balance should be -1,000
    expect(heroSection).toHaveTextContent(/1[.,]000/)
  })

  it('updates dashboard analytics when type filter is changed in All Transactions', () => {
    render(<Dashboard />)

    const heroSection = document.querySelector('section')!
    expect(heroSection).toHaveTextContent(/1[.,]950/)

    // Click 'Income' tab in All Transactions
    const incomeTab = screen.getByRole('tab', { name: /Income/i })
    fireEvent.click(incomeTab)

    // Hero balance becomes 3,000
    expect(heroSection).toHaveTextContent(/3[.,]000/)

    // Click 'Expenses' tab
    const expenseTab = screen.getByRole('tab', { name: /Expenses/i })
    fireEvent.click(expenseTab)

    // Hero balance becomes -1,050
    expect(heroSection).toHaveTextContent(/1[.,]050/)
  })

  it('restores full dashboard balance and analytics when filters are reset', () => {
    render(<Dashboard />)

    const heroSection = document.querySelector('section')!
    expect(heroSection).toHaveTextContent(/1[.,]950/)

    // Apply category filter
    const categorySelect = screen.getByLabelText('Filter by category')
    fireEvent.change(categorySelect, { target: { value: 'Rent' } })

    // Reset button should now be visible
    const resetBtn = screen.getByRole('button', { name: 'Reset all filters' })
    expect(resetBtn).toBeInTheDocument()
    fireEvent.click(resetBtn)

    // Restores to 1950
    expect(heroSection).toHaveTextContent(/1[.,]950/)
  })

  it('does not impact dashboard analytics or balance when transactions are detached', () => {
    defaultMockAppState.detachTransactionsFromDashboard = true
    render(<Dashboard />)

    const heroSection = document.querySelector('section')!
    expect(heroSection).toHaveTextContent(/1[.,]950/)

    // Detached badge should be visible
    expect(screen.getByTestId('transactions-detached-badge')).toBeInTheDocument()

    // Change category filter in All Transactions to Rent
    const categorySelect = screen.getByLabelText('Filter by category')
    fireEvent.change(categorySelect, { target: { value: 'Rent' } })

    // Since transactions are detached, the Dashboard balance remains unchanged (1,950)
    expect(heroSection).toHaveTextContent(/1[.,]950/)

    // Toggle detach button in All Transactions to re-link
    const detachBtn = screen.getByTestId('toggle-detach-transactions')
    fireEvent.click(detachBtn)
    expect(defaultMockAppState.setDetachTransactionsFromDashboard).toHaveBeenCalledWith(false)
  })
})
