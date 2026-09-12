import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Settings } from './Settings'

// Mock language store
vi.mock('../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      locale: 'de',
      t: {
        back: 'Back',
        settingsTitle: 'Settings',
        createCustomRule: 'Create Custom Rule',
        createCustomRuleDesc: 'Add specific keywords to automatically categorize transactions.',
        targetCategory: 'Target Category',
        keywordOrMerchant: 'Keyword / Merchant Name',
        keywordPlaceholder: 'e.g. Netflix, Amazon, DB Bahn',
        addRule: 'Add Rule',
        manualOverridesInfo: 'Manual overrides take priority.',
        activeRules: 'Active Rules',
        rulesTotal: '{count} rules total',
        noCustomRules: 'No custom rules yet',
        noCustomRulesDesc: 'Add your first keyword.',
        yourCategories: 'Your Categories',
        customCount: '{count} custom',
        newCategoryNamePlaceholder: 'New category name',
        addTranslationsTitle: 'Add translations',
        noCustomCategories: 'No custom categories yet.',
        add: 'Add',
        chooseIconTitle: 'Choose icon',
        name: 'Name',
        translation: 'Translation',
        deleteCategory: 'Delete category',
        editCategory: 'Edit category',
        editCategoryTitle: 'Edit Category',
        saveChanges: 'Save Changes',
        removeIcon: 'Remove icon',
        cancel: 'Cancel',
        catDiningOut: 'Essen gehen',
        catEntertainment: 'Unterhaltung',
        catShopping: 'Einkaufen',
        catTransport: 'Transport',
        catGroceries: 'Lebensmittel',
        catUtilities: 'Nebenkosten',
        catHealthcare: 'Gesundheit',
      },
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

// Mock app store
const mockSetCustomKeywords = vi.fn()
const mockSetStep = vi.fn()

vi.mock('../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      customKeywords: {},
      customCategories: [],
      setCustomKeywords: mockSetCustomKeywords,
      setStep: mockSetStep,
      addCustomCategory: vi.fn(),
      updateCustomCategory: vi.fn(),
      deleteCustomCategory: vi.fn(),
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

describe('Settings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Target Category and Keyword / Merchant Name labels', () => {
    render(<Settings />)

    expect(screen.getByText('Target Category')).toBeInTheDocument()
    expect(screen.getByText('Keyword / Merchant Name')).toBeInTheDocument()
  })

  it('shows localized categories in merchant suggestions (e.g. Essen gehen for Dining Out)', () => {
    render(<Settings />)

    const keywordInput = screen.getByPlaceholderText('e.g. Netflix, Amazon, DB Bahn')
    fireEvent.change(keywordInput, { target: { value: 'mcdonald' } })
    fireEvent.focus(keywordInput)

    expect(screen.getByText("McDonald's")).toBeInTheDocument()
    expect(screen.getByText('Essen gehen')).toBeInTheDocument()
  })

  it('suggests regional merchants like Bingo, Biedronka, and Indomaret with localized categories', () => {
    render(<Settings />)

    const keywordInput = screen.getByPlaceholderText('e.g. Netflix, Amazon, DB Bahn')

    // Test Bingo (Bosnia)
    fireEvent.change(keywordInput, { target: { value: 'bingo' } })
    fireEvent.focus(keywordInput)
    expect(screen.getByText('Bingo')).toBeInTheDocument()
    expect(screen.getByText('Lebensmittel')).toBeInTheDocument()

    // Test Biedronka (Poland)
    fireEvent.change(keywordInput, { target: { value: 'biedronka' } })
    expect(screen.getByText('Biedronka')).toBeInTheDocument()

    // Test Indomaret (Indonesia)
    fireEvent.change(keywordInput, { target: { value: 'indomaret' } })
    expect(screen.getByText('Indomaret')).toBeInTheDocument()
  })
})
