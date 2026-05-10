import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImportReview from './ImportReview';
import { useAppStore, type AppState } from '../store/useAppStore';
import { useLanguageStore, type LanguageState } from '../store/useLanguageStore';
import type { TranslationStrings } from '../i18n/translations';

const { mockStartNewInstitution, mockSetStep } = vi.hoisted(() => ({
  mockStartNewInstitution: vi.fn(),
  mockSetStep: vi.fn(),
}));

// Mock the stores
vi.mock('../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      importedAccounts: [
        {
          institutionId: '1',
          institutionName: 'Bank A',
          importedAt: new Date().toISOString(),
          transactions: [
            { id: 't1', amount: 1000, type: 'income', date: '2024-01-01', description: 'Salary', category: 'Salary' },
            { id: 't2', amount: -500, type: 'expense', date: '2024-01-02', description: 'Rent', category: 'Rent' },
          ],
        },
      ],
      startNewInstitution: mockStartNewInstitution,
      setStep: mockSetStep,
    };
    return typeof selector === 'function' ? selector(state as unknown as AppState) : state;
  }),
}));

vi.mock('../store/useLanguageStore', () => ({
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
    vi.mocked(useLanguageStore).mockImplementation((selector) => selector({
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
    } as unknown as LanguageState));
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

  it('calculates totals correctly', () => {
    render(<ImportReview />);
    
    // totalIncome = 1000, totalExpenses = 500
    // Check for values (formatted as currency)
    // The exact formatting depends on locale, but we can check if parts of it exist
    expect(screen.getByText(/1\.000/)).toBeInTheDocument(); // Income
    expect(screen.getByText(/500/)).toBeInTheDocument(); // Expense
  });
});
