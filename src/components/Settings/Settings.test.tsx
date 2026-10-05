import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DuplicateOverrideRule, ImportedAccount } from '../../types'
import { Settings } from './Settings'

// Mock language store
vi.mock('../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      locale: 'de',
      t: {
        back: 'Back',
        settingsTitle: 'Settings',
        categoriesAndRules: 'Categories & Rules',
        duplicateRulesTab: 'Duplicate Rules',
        dataManagementTitle: 'Data Management',
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
        catCommunication: 'Kommunikation',
        catHealthcare: 'Gesundheit',
        catTravel: 'Reisen',
        catTaxes: 'Steuern',
      },
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

// Mock app store
const mockSetCustomKeywords = vi.fn()
const mockSetStep = vi.fn()

let mockImportedAccounts: ImportedAccount[] = []
let mockCustomKeywords: Record<string, string[]> = {}
let mockDuplicateOverrideRules: DuplicateOverrideRule[] = []

vi.mock('../../store/useAppStore', () => ({
  countDuplicateTransactionsInAccounts: vi.fn(() => 0),
  matchesDuplicateOverrideRule: vi.fn(),
  useAppStore: vi.fn((selector) => {
    const state = {
      customKeywords: mockCustomKeywords,
      customCategories: [],
      setCustomKeywords: mockSetCustomKeywords,
      setStep: mockSetStep,
      addCustomCategory: vi.fn(),
      updateCustomCategory: vi.fn(),
      deleteCustomCategory: vi.fn(),
      duplicateOverrideRules: mockDuplicateOverrideRules,
      importedAccounts: mockImportedAccounts,
      resetDuplicateTransactions: vi.fn(() => ({ removedCount: 0 })),
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
    expect(screen.getAllByText('Essen gehen')[0]).toBeInTheDocument()
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

  it('switches between Categories & Rules and Data Management tabs', () => {
    render(<Settings />)

    // Initial tab is Categories & Rules
    expect(screen.getByRole('tab', { name: 'Categories & Rules' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Data Management' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByText('Target Category')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete All Data' })).not.toBeInTheDocument()

    // Switch to Data Management tab
    fireEvent.click(screen.getByRole('tab', { name: 'Data Management' }))

    expect(screen.getByRole('tab', { name: 'Data Management' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: 'Delete All Data' })).toBeInTheDocument()
    expect(screen.queryByText('Target Category')).not.toBeInTheDocument()

    // Switch back to Categories & Rules tab
    fireEvent.click(screen.getByRole('tab', { name: 'Categories & Rules' }))

    expect(screen.getByRole('tab', { name: 'Categories & Rules' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Target Category')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete All Data' })).not.toBeInTheDocument()
  })

  it('does not render Duplicate Rules tab if there are no duplicates', () => {
    mockImportedAccounts = []
    render(<Settings />)

    expect(screen.queryByRole('tab', { name: 'Duplicate Rules' })).not.toBeInTheDocument()
  })

  it('switches to dedicated Duplicate Rules tab when duplicates exist', () => {
    mockImportedAccounts = [
      {
        institutionId: 'bank-1',
        institutionName: 'Bank 1',
        importedAt: '2026-03-01T00:00:00Z',
        importedFingerprints: [],
        transactions: [],
        duplicateTransactions: [
          {
            id: 'dup-1',
            date: '2026-03-01',
            description: 'Duplicate Transfer',
            amount: -25,
            currency: 'EUR',
            type: 'expense',
            institution: 'Bank 1',
          },
        ],
      },
    ]
    render(<Settings />)

    const dupRulesTab = screen.getByRole('tab', { name: 'Duplicate Rules' })
    expect(dupRulesTab).toBeInTheDocument()
    expect(dupRulesTab).toHaveAttribute('aria-selected', 'false')

    // Switch to Duplicate Rules tab
    fireEvent.click(dupRulesTab)

    expect(screen.getByTestId('duplicate-rules-settings')).toBeInTheDocument()
    expect(screen.queryByText('Target Category')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete All Data' })).not.toBeInTheDocument()
  })

  it('renders close buttons for all active rules tags including long ones', () => {
    mockCustomKeywords = {
      Groceries: ['lidl', 'rewe', 'very long supermarket merchant name that could cause overflow'],
      DiningOut: ['mcdonalds'],
    }
    mockImportedAccounts = []
    render(<Settings />)

    // Verify all keywords are displayed
    expect(screen.getByText('lidl')).toBeInTheDocument()
    expect(screen.getByText('rewe')).toBeInTheDocument()
    expect(
      screen.getByText('very long supermarket merchant name that could cause overflow'),
    ).toBeInTheDocument()
    expect(screen.getByText('mcdonalds')).toBeInTheDocument()

    // Verify close buttons exist for every single tag
    expect(screen.getByTestId('remove-rule-btn-lidl')).toBeInTheDocument()
    expect(screen.getByTestId('remove-rule-btn-rewe')).toBeInTheDocument()
    expect(
      screen.getByTestId(
        'remove-rule-btn-very long supermarket merchant name that could cause overflow',
      ),
    ).toBeInTheDocument()
    expect(screen.getByTestId('remove-rule-btn-mcdonalds')).toBeInTheDocument()

    // Verify category header close buttons exist for each category group
    expect(screen.getByTestId('remove-category-rules-Groceries')).toBeInTheDocument()
    expect(screen.getByTestId('remove-category-rules-DiningOut')).toBeInTheDocument()
  })

  it('removes a keyword when its close button is clicked', () => {
    mockCustomKeywords = {
      Groceries: ['lidl', 'rewe'],
    }
    mockImportedAccounts = []
    render(<Settings />)

    const removeLidlBtn = screen.getByTestId('remove-rule-btn-lidl')
    fireEvent.click(removeLidlBtn)

    expect(mockSetCustomKeywords).toHaveBeenCalledWith('Groceries', ['rewe'])
  })

  it('removes all category rules when the category header close button is clicked', () => {
    mockCustomKeywords = {
      Groceries: ['lidl', 'rewe'],
    }
    mockImportedAccounts = []
    render(<Settings />)

    const removeGroceriesBtn = screen.getByTestId('remove-category-rules-Groceries')
    fireEvent.click(removeGroceriesBtn)

    expect(mockSetCustomKeywords).toHaveBeenCalledWith('Groceries', [])
  })

  it('renders Duplicate Rules tab if duplicateOverrideRules exist even without pending duplicate transactions', () => {
    mockImportedAccounts = []
    mockDuplicateOverrideRules = [
      {
        id: 'rule-1',
        descriptionPattern: 'Uber',
        createdAt: '2026-03-01T00:00:00Z',
        applyCount: 1,
      },
    ]
    render(<Settings />)

    expect(screen.getByRole('tab', { name: 'Duplicate Rules' })).toBeInTheDocument()
  })
})
