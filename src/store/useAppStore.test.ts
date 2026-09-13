import { beforeEach, describe, expect, it } from 'vitest'

import type { Country, FinancialInstitution, ImportedAccount } from '../types'
import { useAppStore } from './useAppStore'

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      currentStep: 'country',
      selectedCountry: null,
      selectedInstitution: null,
      importedAccounts: [],
    })
  })

  it('should have initial state', () => {
    const state = useAppStore.getState()
    expect(state.currentStep).toBe('country')
    expect(state.selectedCountry).toBeNull()
    expect(state.selectedInstitution).toBeNull()
    expect(state.importedAccounts).toEqual([])
  })

  it('should set step', () => {
    useAppStore.getState().setStep('import')
    expect(useAppStore.getState().currentStep).toBe('import')
  })

  it('should select country and move to institution step', () => {
    const mockCountry: Country = { code: 'us', name: 'USA', flag: '🇺🇸', supported: true }
    useAppStore.getState().selectCountry(mockCountry)

    const state = useAppStore.getState()
    expect(state.selectedCountry).toEqual(mockCountry)
    expect(state.currentStep).toBe('institution')
  })

  it('should select institution and move to import step', () => {
    const mockInstitution: FinancialInstitution = {
      id: 'chase',
      name: 'Chase',
      type: 'bank',
      category: 'traditional',
      logo: 'chase.png',
    }
    useAppStore.getState().selectInstitution(mockInstitution)

    const state = useAppStore.getState()
    expect(state.selectedInstitution).toEqual(mockInstitution)
    expect(state.currentStep).toBe('import')
  })

  it('should add imported account and move to review step', () => {
    const mockAccount: ImportedAccount = {
      institutionId: 'chase',
      institutionName: 'Chase',
      transactions: [],
      importedAt: new Date().toISOString(),
      importedFingerprints: ['fp-a'],
    }
    useAppStore.getState().addImportedAccount(mockAccount)

    const state = useAppStore.getState()
    expect(state.importedAccounts).toContainEqual(mockAccount)
    expect(state.currentStep).toBe('review')
  })

  it('should merge transactions when re-importing the same institution with new data', () => {
    const firstImport: ImportedAccount = {
      institutionId: 'chase',
      institutionName: 'Chase',
      transactions: [
        {
          id: 'tx1',
          date: '2026-01-01',
          description: 'Old transaction',
          amount: -10,
          currency: 'EUR',
          type: 'expense',
          institution: 'Chase',
        },
      ],
      importedAt: new Date().toISOString(),
      importedFingerprints: ['fp-jan'],
    }
    const secondImport: ImportedAccount = {
      institutionId: 'chase',
      institutionName: 'Chase',
      transactions: [
        {
          id: 'tx2',
          date: '2026-01-02',
          description: 'New transaction',
          amount: -20,
          currency: 'EUR',
          type: 'expense',
          institution: 'Chase',
        },
      ],
      importedAt: new Date().toISOString(),
      importedFingerprints: ['fp-feb'],
    }

    useAppStore.getState().addImportedAccount(firstImport)
    useAppStore.getState().addImportedAccount(secondImport)

    const state = useAppStore.getState()
    expect(state.importedAccounts).toHaveLength(1)
    expect(state.importedAccounts[0].transactions).toHaveLength(2)
    expect(state.importedAccounts[0].transactions.map((t) => t.description)).toEqual(
      expect.arrayContaining(['Old transaction', 'New transaction']),
    )
    // Both fingerprints should be tracked
    expect(state.importedAccounts[0].importedFingerprints).toEqual(
      expect.arrayContaining(['fp-jan', 'fp-feb']),
    )
  })

  it('should deduplicate transactions when re-importing overlapping data', () => {
    const sharedTx = {
      id: 'tx1',
      date: '2026-01-01',
      description: 'Shared transaction',
      amount: -10,
      currency: 'EUR',
      type: 'expense' as const,
      institution: 'Chase',
    }
    const firstImport: ImportedAccount = {
      institutionId: 'chase',
      institutionName: 'Chase',
      transactions: [sharedTx],
      importedAt: new Date().toISOString(),
      importedFingerprints: ['fp-1'],
    }
    const secondImport: ImportedAccount = {
      institutionId: 'chase',
      institutionName: 'Chase',
      transactions: [{ ...sharedTx, id: 'tx1-reimport' }],
      importedAt: new Date().toISOString(),
      importedFingerprints: ['fp-2'],
    }

    useAppStore.getState().addImportedAccount(firstImport)
    useAppStore.getState().addImportedAccount(secondImport)

    const state = useAppStore.getState()
    expect(state.importedAccounts[0].transactions).toHaveLength(1)
  })

  it('should fully replace existing account when replaceImportedAccount is called', () => {
    const firstImport: ImportedAccount = {
      institutionId: 'chase',
      institutionName: 'Chase',
      transactions: [
        {
          id: 'tx1',
          date: '2026-01-01',
          description: 'Old',
          amount: -10,
          currency: 'EUR',
          type: 'expense',
          institution: 'Chase',
        },
      ],
      importedAt: new Date().toISOString(),
      importedFingerprints: ['fp-old'],
    }
    const replacement: ImportedAccount = {
      institutionId: 'chase',
      institutionName: 'Chase',
      transactions: [
        {
          id: 'tx2',
          date: '2026-01-02',
          description: 'New',
          amount: -20,
          currency: 'EUR',
          type: 'expense',
          institution: 'Chase',
        },
      ],
      importedAt: new Date().toISOString(),
      importedFingerprints: ['fp-new'],
    }

    useAppStore.getState().addImportedAccount(firstImport)
    useAppStore.getState().replaceImportedAccount(replacement)

    const state = useAppStore.getState()
    expect(state.importedAccounts).toHaveLength(1)
    expect(state.importedAccounts[0].transactions).toHaveLength(1)
    expect(state.importedAccounts[0].transactions[0].description).toBe('New')
    expect(state.importedAccounts[0].importedFingerprints).toEqual(['fp-new'])
  })

  it('should return correct stats when checking duplicate transactions', () => {
    const existingTransactions = [
      { id: '1', date: '2023-01-01', amount: 100, description: 'Test 1', category: 'cat1', currency: 'USD', type: 'expense' as const, institution: 'chase' },
      { id: '2', date: '2023-01-02', amount: 200, description: 'Test 2', category: 'cat2', currency: 'USD', type: 'expense' as const, institution: 'chase' },
    ]
    const account: ImportedAccount = {
      institutionId: 'chase',
      institutionName: 'Chase',
      transactions: existingTransactions,
      importedAt: new Date().toISOString(),
      importedFingerprints: ['fp-jan'],
    }
    useAppStore.getState().addImportedAccount(account)

    const incomingTransactions = [
      // Exact duplicate
      { id: '1a', date: '2023-01-01', amount: 100, description: 'test 1 ', category: '', currency: 'USD', type: 'expense' as const, institution: 'chase' },
      // New transaction
      { id: '3', date: '2023-01-03', amount: 300, description: 'Test 3', category: '', currency: 'USD', type: 'expense' as const, institution: 'chase' },
    ]

    // Check against 'chase'
    const statsChase = useAppStore.getState().getDuplicateTransactionStats('chase', incomingTransactions)
    expect(statsChase).toEqual({ duplicateCount: 1, newCount: 1, duplicateIds: ['1a'] })

    // Check against unknown institution (all should be new)
    const statsIng = useAppStore.getState().getDuplicateTransactionStats('ing', incomingTransactions)
    expect(statsIng).toEqual({ duplicateCount: 0, newCount: 2, duplicateIds: [] })
  })

  it('should reset import state', () => {
    // Set some non-initial state
    useAppStore.setState({
      currentStep: 'review',
      selectedCountry: { code: 'us', name: 'USA', flag: '🇺🇸', supported: true },
      selectedInstitution: { id: 'chase', name: 'Chase', type: 'bank', category: 'traditional' },
      importedAccounts: [
        {
          institutionId: '1',
          institutionName: 'test',
          transactions: [],
          importedAt: '',
          importedFingerprints: [],
        },
      ],
    })

    useAppStore.getState().resetImport()

    const state = useAppStore.getState()
    expect(state.currentStep).toBe('country')
    expect(state.selectedCountry).toBeNull()
    expect(state.selectedInstitution).toBeNull()
    expect(state.importedAccounts).toHaveLength(1)
  })

  it('should start new institution flow', () => {
    useAppStore.setState({
      currentStep: 'import',
      selectedInstitution: { id: 'chase', name: 'Chase', type: 'bank', category: 'traditional' },
    })

    useAppStore.getState().startNewInstitution()

    const state = useAppStore.getState()
    expect(state.selectedInstitution).toBeNull()
    expect(state.currentStep).toBe('institution')
  })

  it('should bulk set manual categories', () => {
    useAppStore.setState({
      manualCategories: { 'tx-1': 'Groceries' },
    })

    useAppStore.getState().setManualCategoriesBulk({
      'tx-2': 'Entertainment',
      'tx-3': 'Entertainment',
    })

    const state = useAppStore.getState()
    expect(state.manualCategories).toEqual({
      'tx-1': 'Groceries',
      'tx-2': 'Entertainment',
      'tx-3': 'Entertainment',
    })
  })

  it('should completely clear all user data and reset to initial country step', () => {
    useAppStore.setState({
      currentStep: 'dashboard',
      selectedCountry: { code: 'de', name: 'Germany', flag: '🇩🇪', supported: true },
      selectedInstitution: { id: 'sparkasse', name: 'Sparkasse', type: 'bank', category: 'sparkasse' },
      importedAccounts: [
        {
          institutionId: 'sparkasse',
          institutionName: 'Sparkasse',
          transactions: [
            {
              id: 'tx-1',
              date: '2026-03-01',
              description: 'Supermarket',
              amount: -45.5,
              currency: 'EUR',
              type: 'expense',
              institution: 'Sparkasse',
            },
          ],
          importedAt: '2026-03-01T10:00:00.000Z',
          importedFingerprints: ['fp-1'],
        },
      ],
      customKeywords: { Groceries: ['edeka'] },
      manualCategories: { 'tx-1': 'Groceries' },
      customCategories: [
        {
          id: 'custom-pets',
          icon: 'PawPrint',
          translations: { en: 'Pets' },
        },
      ],
    })

    useAppStore.getState().clearAllData()

    const state = useAppStore.getState()
    expect(state.currentStep).toBe('country')
    expect(state.selectedCountry).toBeNull()
    expect(state.selectedInstitution).toBeNull()
    expect(state.importedAccounts).toEqual([])
    expect(state.customKeywords).toEqual({})
    expect(state.manualCategories).toEqual({})
    expect(state.customCategories).toEqual([])
  })

  it('should clear preference localStorage items when clearAllData(true) is requested', () => {
    localStorage.setItem('mm-theme-preference', 'dark')
    localStorage.setItem('mm-language-preference', 'de')

    useAppStore.getState().clearAllData(true)

    expect(localStorage.getItem('mm-theme-preference')).toBeNull()
    expect(localStorage.getItem('mm-language-preference')).toBeNull()
  })
})
