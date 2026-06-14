import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImportReview from './ImportReview';
import { type AppState } from '../../store/useAppStore';
import { type LanguageState } from '../../store/useLanguageStore';
import type { TranslationStrings } from '../../i18n/translations';

const { mockStartNewInstitution, mockSetStep, mockState } = vi.hoisted(() => ({
  mockStartNewInstitution: vi.fn(),
  mockSetStep: vi.fn(),
  mockState: {
    importedAccounts: [] as AppState['importedAccounts'],
  },
}));

vi.mock('../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      importedAccounts: mockState.importedAccounts,
      startNewInstitution: mockStartNewInstitution,
      setStep: mockSetStep,
    } as unknown as AppState;
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));

vi.mock('../../hooks/useFormatters', () => ({
  useFormatters: vi.fn(() => ({
    formatCurrency: (amount: number) => `€${amount}`,
  })),
}));

vi.mock('../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      t: {
        importSuccessTitle: 'Success!',
        importSuccessSubtitle: 'Review your imports',
        institutions: 'Institutions',
        transactions: 'Transactions',
        totalIncome: 'Total Income',
        totalExpenses: 'Total Expenses',
        imported: 'Imported',
        addAnotherInstitution: 'Add Another',
        proceedToAnalysis: 'Proceed',
      } as unknown as TranslationStrings
    };
    return typeof selector === 'function' ? selector(state as LanguageState) : state;
  }),
}));

describe('ImportReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.importedAccounts = [
      {
        institutionId: '1',
        institutionName: 'Bank A',
        importedAt: new Date('2024-01-01T10:00:00').toISOString(),
        transactions: [
          { id: 't1', amount: 1000, type: 'income', date: '2024-01-01', description: 'Salary', category: 'Salary', currency: 'EUR', institution: 'Bank A' },
          { id: 't2', amount: -500, type: 'expense', date: '2024-01-02', description: 'Rent', category: 'Rent', currency: 'EUR', institution: 'Bank A' },
        ],
      },
    ];
  });

  it('renders correctly with summary stats', () => {
    render(<ImportReview />);

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Institutions count
    expect(screen.getByText('2')).toBeInTheDocument(); // Transactions count
    expect(screen.getByText('Bank A')).toBeInTheDocument();
  });

  it('calls startNewInstitution when Add Another is clicked', () => {
    render(<ImportReview />);

    fireEvent.click(screen.getByText('Add Another'));
    expect(mockStartNewInstitution).toHaveBeenCalled();
  });

  it('calls setStep when Proceed is clicked', () => {
    render(<ImportReview />);

    fireEvent.click(screen.getByText('Proceed'));
    expect(mockSetStep).toHaveBeenCalledWith('dashboard');
  });

  it('calculates totals correctly with mocked formatters', () => {
    render(<ImportReview />);

    // totalIncome = 1000, totalExpenses = 500
    // Mocked formatCurrency should format as €1000 and €500
    expect(screen.getByText('€1000')).toBeInTheDocument(); // Income
    expect(screen.getByText('€500')).toBeInTheDocument(); // Expense
  });

  it('calculates totals correctly with multiple accounts', () => {
    mockState.importedAccounts = [
      {
        institutionId: '1',
        institutionName: 'Bank A',
        importedAt: new Date('2024-01-01T10:00:00').toISOString(),
        transactions: [
          { id: 't1', amount: 1000, type: 'income', date: '2024-01-01', description: 'Salary', category: 'Salary', currency: 'EUR', institution: 'Bank A' },
          { id: 't2', amount: -500, type: 'expense', date: '2024-01-02', description: 'Rent', category: 'Rent', currency: 'EUR', institution: 'Bank A' },
        ],
      },
      {
        institutionId: '2',
        institutionName: 'Bank B',
        importedAt: new Date('2024-01-01T11:00:00').toISOString(),
        transactions: [
          { id: 't3', amount: 2000, type: 'income', date: '2024-01-03', description: 'Bonus', category: 'Bonus', currency: 'EUR', institution: 'Bank B' },
          { id: 't4', amount: -100, type: 'expense', date: '2024-01-04', description: 'Groceries', category: 'Groceries', currency: 'EUR', institution: 'Bank B' },
        ],
      },
    ];

    render(<ImportReview />);

    expect(screen.getByText('2')).toBeInTheDocument(); // Institutions count
    expect(screen.getByText('4')).toBeInTheDocument(); // Total Transactions count

    // Total Income = 1000 + 2000 = 3000
    expect(screen.getByText('€3000')).toBeInTheDocument();

    // Total Expense = |-500| + |-100| = 600
    expect(screen.getByText('€600')).toBeInTheDocument();

    expect(screen.getByText('Bank A')).toBeInTheDocument();
    expect(screen.getByText('Bank B')).toBeInTheDocument();
  });

  it('renders correctly with empty accounts', () => {
    mockState.importedAccounts = [];
    render(<ImportReview />);

    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2); // Institutions and Transactions
    expect(screen.getAllByText('€0').length).toBe(2); // Income and Expense
  });
});
