import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import { useAppStore, type AppState } from '../../store/useAppStore';
import type { LanguageState } from '../../store/useLanguageStore';
import type { TranslationStrings } from '../../i18n/translations';

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  Tooltip: () => <div>Tooltip</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => <div>Pie</div>,
  Cell: () => <div>Cell</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => <div>Area</div>,
}));

const { mockResetImport } = vi.hoisted(() => ({
  mockResetImport: vi.fn(),
}));

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
            { id: 't1', amount: 3000, type: 'income', date: '2024-01-01', description: 'Salary', institution: 'Bank A' },
            { id: 't2', amount: -1000, type: 'expense', date: '2024-01-02', description: 'Rent', institution: 'Bank A' },
            { id: 't3', amount: -50, type: 'expense', date: '2024-01-03', description: 'Random', institution: 'Bank A' },
          ],
        },
      ],
      resetImport: mockResetImport,
    };
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));

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
      } as unknown as TranslationStrings
    };
    return typeof selector === 'function' ? selector(state as LanguageState) : state;
  }),
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders summary statistics correctly', () => {
    render(<Dashboard />);

    // balance = 3000 - (1000 + 50) = 1950
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    // Use regex to be flexible with spaces and currency symbols
    expect(screen.getAllByText(/1[.,]950/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3[.,]000/).length).toBeGreaterThan(0); // Income
    expect(screen.getAllByText(/1[.,]050/).length).toBeGreaterThan(0); // Expenses
  });

  it('calls resetImport when New Import button is clicked', () => {
    render(<Dashboard />);

    fireEvent.click(screen.getByText('New Import'));
    expect(mockResetImport).toHaveBeenCalled();
  });

  it('filters transactions by search term', () => {
    render(<Dashboard />);

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'Rent' } });

    // Should find 'Rent' in the transaction list (and maybe category, but that's fine for filter test)
    expect(screen.getAllByText('Rent').length).toBeGreaterThan(0);
    expect(screen.queryByText('Random')).not.toBeInTheDocument();
  });

  it('sorts transactions correctly', () => {
    render(<Dashboard />);

    const sortSelect = screen.getByDisplayValue('Newest First');

    // Test Highest Amount sorting
    fireEvent.change(sortSelect, { target: { value: 'highest' } });

    const amounts = screen.getAllByText(/€/).map(el => el.textContent);
    // The first 3 '€' elements are in the Balance Hero (Total, Income, Expenses)
    // The next 2 are in the Category Breakdown (Rent, Other)
    // The transactions start after that.
    const txAmounts = amounts.slice(5);

    // Highest abs amount should be first (3000 then 1000 then 50)
    expect(txAmounts[0]).toContain('3.000');
    expect(txAmounts[1]).toContain('1.000');
    expect(txAmounts[2]).toContain('50');
  });

  it('renders category breakdown', () => {
    render(<Dashboard />);

    expect(screen.getByText('Expense Categories')).toBeInTheDocument();
    // Use getAllByText as 'Rent' appears in both category list and transaction list
    expect(screen.getAllByText('Rent').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Other').length).toBeGreaterThan(0);
  });

  it('handles empty transactions state', () => {
    vi.mocked(useAppStore).mockImplementation((selector) => {
      const state = { importedAccounts: [], resetImport: vi.fn() };
      return typeof selector === 'function' ? selector(state as unknown as AppState) : state;
    });

    render(<Dashboard />);
    expect(screen.getByText('No transactions')).toBeInTheDocument();
  });
});
