import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InstitutionSelector from './InstitutionSelector';
import { useAppStore, type AppState } from '../../../store/useAppStore';
import { useLanguageStore, type LanguageState } from '../../../store/useLanguageStore';
import type { TranslationStrings } from '../../../i18n/translations';

const { mockSelectInstitution, mockSetStep } = vi.hoisted(() => ({
  mockSelectInstitution: vi.fn(),
  mockSetStep: vi.fn(),
}));

// Mock the stores
vi.mock('../../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => selector({
    selectedCountry: { code: 'DE', name: 'Germany', flag: 'de-flag' },
    selectInstitution: mockSelectInstitution,
    setStep: mockSetStep,
  })),
}));

vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => selector({
    t: {
      back: 'Back',
      selectInstitutionTitle: 'Select Institution',
      selectInstitutionSubtitle: 'Select your bank',
      searchInstitutions: 'Search',
      all: 'All',
      catTraditional: 'Traditional',
      catNeobank: 'Neobank',
      noInstitutionsFound: 'No institutions',
      countries: { DE: 'Germany' },
    } as unknown as TranslationStrings
  })),
}));

// Mock the data
vi.mock('../../../data/institutions', () => ({
  institutionsByCountry: {
    DE: [
      { id: '1', name: 'Deutsche Bank', type: 'bank', category: 'traditional', supported: true },
      { id: '2', name: 'N26', type: 'neobank', category: 'neobank', supported: true },
    ],
  },
  categoryOrder: ['traditional', 'neobank'],
}));

describe('InstitutionSelector', () => {
  const mockT = {
    back: 'Back',
    selectInstitutionTitle: 'Select Institution',
    selectInstitutionSubtitle: 'Select your bank',
    searchInstitutions: 'Search',
    all: 'All',
    catTraditional: 'Traditional',
    catNeobank: 'Neobank',
    noInstitutionsFound: 'No institutions',
    countries: { DE: 'Germany' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppStore).mockImplementation(() => ({
      selectedCountry: { code: 'DE', name: 'Germany', flag: 'de-flag' },
      selectInstitution: mockSelectInstitution,
      setStep: mockSetStep,
    } as unknown as AppState));

    vi.mocked(useLanguageStore).mockImplementation(<T,>(selector?: (state: LanguageState) => T) => {
      const state = {
        t: mockT as unknown as TranslationStrings,
      } as unknown as LanguageState;
      return selector ? selector(state) : state as unknown as T;
    });
  });

  it('renders correctly with institutions', () => {
    render(<InstitutionSelector />);

    expect(screen.getByText('Select Institution')).toBeInTheDocument();
    expect(screen.getByText('Deutsche Bank')).toBeInTheDocument();
    expect(screen.getByText('N26')).toBeInTheDocument();
  });

  it('calls setStep when back button is clicked', () => {
    render(<InstitutionSelector />);

    fireEvent.click(screen.getByText('Back'));
    expect(mockSetStep).toHaveBeenCalledWith('country');
  });

  it('filters institutions by search', () => {
    render(<InstitutionSelector />);

    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'N26' } });

    expect(screen.getByText('N26')).toBeInTheDocument();
    expect(screen.queryByText('Deutsche Bank')).not.toBeInTheDocument();
  });

  it('filters institutions by category', () => {
    render(<InstitutionSelector />);

    // Click on Neobank category tag using ID to avoid matching the badge
    const neobankFilter = document.getElementById('filter-neobank');
    if (neobankFilter) fireEvent.click(neobankFilter);

    expect(screen.getByText('N26')).toBeInTheDocument();
    expect(screen.queryByText('Deutsche Bank')).not.toBeInTheDocument();
  });

  it('calls selectInstitution when an institution is clicked', () => {
    render(<InstitutionSelector />);

    fireEvent.click(screen.getByText('Deutsche Bank'));
    expect(mockSelectInstitution).toHaveBeenCalledWith(expect.objectContaining({ name: 'Deutsche Bank' }));
  });

  it('shows empty state when no matches', () => {
    render(<InstitutionSelector />);

    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'NonExistent' } });

    expect(screen.getByText('No institutions')).toBeInTheDocument();
  });
});
