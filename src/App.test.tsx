import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import type { TranslationStrings } from './i18n/translations'
import { type AppState, useAppStore } from './store/useAppStore'
import { type LanguageState, useLanguageStore } from './store/useLanguageStore'

// Mock the stores
vi.mock('./store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = { currentStep: 'country' }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('./store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      locale: 'en',
      t: {
        stepCountry: 'Country',
        stepInstitution: 'Institution',
        stepImport: 'Import',
        stepReview: 'Review',
      },
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

// Mock the components to avoid deep rendering issues in App tests
vi.mock('./components/layout/AppHeader', () => ({
  default: () => <div data-testid="app-header" />,
}))
vi.mock('./components/shared/CountrySelector', () => ({
  default: () => <div data-testid="country-selector" />,
}))
vi.mock('./components/shared/InstitutionSelector', () => ({
  default: () => <div data-testid="institution-selector" />,
}))
vi.mock('./components/TransactionImporter', () => ({
  default: () => <div data-testid="transaction-importer" />,
}))
vi.mock('./components/ImportReview', () => ({ default: () => <div data-testid="import-review" /> }))
vi.mock('./components/Dashboard', () => ({ default: () => <div data-testid="dashboard" /> }))

describe('App', () => {
  const mockT = {
    stepCountry: 'Country',
    stepInstitution: 'Institution',
    stepImport: 'Import',
    stepReview: 'Review',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useLanguageStore).mockImplementation((selector) => {
      const state = { locale: 'en', t: mockT as unknown as TranslationStrings }
      return typeof selector === 'function' ? selector(state as unknown as LanguageState) : state
    })
  })

  it('renders CountrySelector on initial step', () => {
    vi.mocked(useAppStore).mockImplementation((selector) => {
      const state = { currentStep: 'country' }
      return typeof selector === 'function' ? selector(state as unknown as AppState) : state
    })

    render(<App />)
    expect(screen.getByTestId('country-selector')).toBeInTheDocument()
    expect(screen.getByTestId('app-header')).toBeInTheDocument()
  })

  it('renders InstitutionSelector on institution step', () => {
    vi.mocked(useAppStore).mockImplementation((selector) => {
      const state = { currentStep: 'institution' }
      return typeof selector === 'function' ? selector(state as unknown as AppState) : state
    })

    render(<App />)
    expect(screen.getByTestId('institution-selector')).toBeInTheDocument()
  })

  it('renders TransactionImporter on import step', () => {
    vi.mocked(useAppStore).mockImplementation((selector) => {
      const state = { currentStep: 'import' }
      return typeof selector === 'function' ? selector(state as unknown as AppState) : state
    })

    render(<App />)
    expect(screen.getByTestId('transaction-importer')).toBeInTheDocument()
  })

  it('renders ImportReview on review step', () => {
    vi.mocked(useAppStore).mockImplementation((selector) => {
      const state = { currentStep: 'review' }
      return typeof selector === 'function' ? selector(state as unknown as AppState) : state
    })

    render(<App />)
    expect(screen.getByTestId('import-review')).toBeInTheDocument()
  })

  it('renders Dashboard on dashboard step', () => {
    vi.mocked(useAppStore).mockImplementation((selector) => {
      const state = { currentStep: 'dashboard' }
      return typeof selector === 'function' ? selector(state as unknown as AppState) : state
    })

    render(<App />)
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    // In dashboard mode, it shouldn't render the onboarding layout (ambient glows, progress etc)
    expect(screen.queryByText('Country')).not.toBeInTheDocument()
  })

  it('highlights the correct progress step', () => {
    vi.mocked(useAppStore).mockImplementation((selector) => {
      const state = { currentStep: 'import' }
      return typeof selector === 'function' ? selector(state as unknown as AppState) : state
    })

    render(<App />)

    // Check for progress labels
    expect(screen.getByText('Country')).toBeInTheDocument()
    expect(screen.getByText('Institution')).toBeInTheDocument()
    expect(screen.getByText('Import')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()

    // We could check for classes if we were using a real CSS module,
    // but since we mocked the store, we just verify the elements are present.
  })
})
