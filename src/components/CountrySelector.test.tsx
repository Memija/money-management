import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CountrySelector from './CountrySelector';
import { useAppStore, type AppState } from '../store/useAppStore';
import { useLanguageStore, type LanguageState } from '../store/useLanguageStore';
import type { TranslationStrings } from '../i18n/translations';

const { mockSelectCountry } = vi.hoisted(() => ({
  mockSelectCountry: vi.fn(),
}));

// Mock the stores
vi.mock('../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = { selectCountry: mockSelectCountry };
    return typeof selector === 'function' ? selector(state as unknown as AppState) : state;
  }),
}));

vi.mock('../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      t: {
        welcomeTitle: 'Welcome',
        welcomeSubtitle: 'Subtitle',
        selectCountryPlaceholder: 'Select country',
        searchCountries: 'Search',
        noCountriesFound: 'No countries',
        soon: 'Soon',
        continue: 'Continue',
      } as unknown as TranslationStrings
    };
    return typeof selector === 'function' ? selector(state as LanguageState) : state;
  }),
}));

describe('CountrySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLanguageStore).mockImplementation((selector) => selector({
      t: {
        welcomeTitle: 'Welcome',
        welcomeSubtitle: 'Subtitle',
        selectCountryPlaceholder: 'Select country',
        searchCountries: 'Search',
        noCountriesFound: 'No countries',
        soon: 'Soon',
        continue: 'Continue',
      } as unknown as TranslationStrings
    } as unknown as LanguageState));
  });

  it('renders initial state correctly', () => {
    render(<CountrySelector />);
    
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Select country')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('opens dropdown when clicked', () => {
    render(<CountrySelector />);
    
    const trigger = screen.getByText('Select country');
    fireEvent.click(trigger);
    
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('filters countries when searching', () => {
    render(<CountrySelector />);
    
    fireEvent.click(screen.getByText('Select country'));
    const input = screen.getByPlaceholderText('Search');
    
    fireEvent.change(input, { target: { value: 'Germany' } });
    
    expect(screen.getByText('Germany')).toBeInTheDocument();
    // Assuming 'France' is in the data but doesn't match 'Germany'
    expect(screen.queryByText('France')).not.toBeInTheDocument();
  });

  it('shows no countries found message', () => {
    render(<CountrySelector />);
    
    fireEvent.click(screen.getByText('Select country'));
    const input = screen.getByPlaceholderText('Search');
    
    fireEvent.change(input, { target: { value: 'NonExistentCountry' } });
    
    expect(screen.getByText('No countries')).toBeInTheDocument();
  });

  it('selects a country and enables continue button', () => {
    render(<CountrySelector />);
    
    fireEvent.click(screen.getByText('Select country'));
    const germany = screen.getByText('Germany');
    fireEvent.click(germany);
    
    expect(screen.getAllByText('Germany').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled();
  });

  it('does not select unsupported countries', () => {
    render(<CountrySelector />);
    
    fireEvent.click(screen.getByText('Select country'));
    // Assuming Switzerland is unsupported based on usual data mockups
    const switzerland = screen.getByText('Switzerland');
    fireEvent.click(switzerland);
    
    // It should still show placeholder or the list if not selected
    expect(screen.queryByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('calls selectCountry on continue click', () => {
    render(<CountrySelector />);
    
    fireEvent.click(screen.getByText('Select country'));
    fireEvent.click(screen.getByText('Germany'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    
    expect(mockSelectCountry).toHaveBeenCalledWith(expect.objectContaining({ name: 'Germany' }));
  });
});
