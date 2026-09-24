import { beforeEach, describe, expect, it } from 'vitest'

import type { Country, FinancialInstitution, ImportedAccount, Transaction } from '../types'
import {
  countDuplicateTransactionsInAccounts,
  sanitizeDuplicateOverrideRules,
  useAppStore,
} from './useAppStore'

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
      accountIbans: ['DE11111111111111111111'],
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
      accountIbans: ['DE22222222222222222222'],
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
    // Both account IBANs should be merged
    expect(state.importedAccounts[0].accountIbans).toEqual(
      expect.arrayContaining(['DE11111111111111111111', 'DE22222222222222222222']),
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

  it('should import duplicate transaction when forceImport is true', () => {
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
    const secondImportWithForce: ImportedAccount = {
      institutionId: 'chase',
      institutionName: 'Chase',
      transactions: [{ ...sharedTx, id: 'tx1-unlocked', forceImport: true }],
      importedAt: new Date().toISOString(),
      importedFingerprints: ['fp-2'],
    }

    useAppStore.getState().addImportedAccount(firstImport)
    useAppStore.getState().addImportedAccount(secondImportWithForce)

    const state = useAppStore.getState()
    expect(state.importedAccounts[0].transactions).toHaveLength(1)
    expect(state.importedAccounts[0].duplicateTransactions).toHaveLength(1)
    expect(state.importedAccounts[0].duplicateTransactions?.[0].id).toBe('tx1-unlocked')
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
    expect(statsChase).toEqual({ duplicateCount: 1, newCount: 1, duplicateIds: ['1a'], alreadyDuplicatedIds: [] })

    // Check whitespace normalization and amount decimal equivalence
    const whitespaceTransactions = [
      { id: '1b', date: '2023-01-01', amount: 100.00, description: 'Test   1', category: '', currency: 'USD', type: 'expense' as const, institution: 'chase' },
    ]
    const statsWhitespace = useAppStore.getState().getDuplicateTransactionStats('chase', whitespaceTransactions)
    expect(statsWhitespace).toEqual({ duplicateCount: 1, newCount: 0, duplicateIds: ['1b'], alreadyDuplicatedIds: [] })

    // Check against unknown institution (all should be new)
    const statsIng = useAppStore.getState().getDuplicateTransactionStats('ing', incomingTransactions)
    expect(statsIng).toEqual({ duplicateCount: 0, newCount: 2, duplicateIds: [], alreadyDuplicatedIds: [] })
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

  it('should automatically reconcile cross-account transfers and mark ghosts across imported accounts', () => {
    const acc1: ImportedAccount = {
      institutionId: 'cb',
      institutionName: 'Commerzbank',
      transactions: [
        {
          id: 'cb-tx-1',
          date: '2026-08-20',
          description: 'ANEL MEMIC N26 Transfer',
          amount: -500,
          currency: 'EUR',
          type: 'expense',
          institution: 'Commerzbank',
        },
      ],
      importedAt: '2026-09-15T10:00:00Z',
      importedFingerprints: ['fp-cb'],
    }

    useAppStore.getState().addImportedAccount(acc1)

    // Initially not ghost since only 1 account exists
    expect(useAppStore.getState().importedAccounts[0].transactions[0].isGhost).toBeFalsy()

    // Import 2nd account with matching reciprocal transaction
    const acc2: ImportedAccount = {
      institutionId: 'n26',
      institutionName: 'N26',
      transactions: [
        {
          id: 'n26-tx-1',
          date: '2026-08-21',
          description: 'ANEL MEMIC Commerzbank',
          amount: 500,
          currency: 'EUR',
          type: 'income',
          institution: 'N26',
        },
      ],
      importedAt: '2026-09-15T10:05:00Z',
      importedFingerprints: ['fp-n26'],
    }

    useAppStore.getState().addImportedAccount(acc2)

    const accounts = useAppStore.getState().importedAccounts
    const cbTx = accounts[0].transactions[0]
    const n26Tx = accounts[1].transactions[0]

    expect(cbTx.isGhost).toBe(true)
    expect(cbTx.linkedTransactionId).toBe('n26-tx-1')

    expect(n26Tx.isGhost).toBe(true)
    expect(n26Tx.linkedTransactionId).toBe('cb-tx-1')
  })

  describe('Duplicate Override Rules', () => {
    it('should add, remove, and clear duplicate override rules', () => {
      useAppStore.setState({ duplicateOverrideRules: [] })

      useAppStore.getState().addDuplicateOverrideRule({
        id: 'rule-gym',
        descriptionPattern: 'Gym Membership',
        amount: -45,
        institutionId: 'chase',
        institutionName: 'Chase',
      })

      let rules = useAppStore.getState().duplicateOverrideRules
      expect(rules).toHaveLength(1)
      expect(rules[0].id).toBe('rule-gym')
      expect(rules[0].descriptionPattern).toBe('Gym Membership')
      expect(rules[0].applyCount).toBe(1)

      // Adding identical rule increments applyCount instead of duplicating
      useAppStore.getState().addDuplicateOverrideRule({
        descriptionPattern: 'Gym Membership',
        amount: -45,
        institutionId: 'chase',
      })

      rules = useAppStore.getState().duplicateOverrideRules
      expect(rules).toHaveLength(1)
      expect(rules[0].applyCount).toBe(2)

      // Remove rule
      useAppStore.getState().removeDuplicateOverrideRule('rule-gym')
      expect(useAppStore.getState().duplicateOverrideRules).toHaveLength(0)

      // Add rule and then update with modifications and applyCount
      useAppStore.getState().addDuplicateOverrideRule({
        id: 'rule-kredit',
        descriptionPattern: 'KREDITRATE',
        amount: -502.58,
        institutionId: 'commerzbank',
        institutionName: 'Commerzbank',
        applyCount: 1,
      })

      useAppStore.getState().addDuplicateOverrideRule({
        descriptionPattern: 'KREDITRATE',
        amount: -502.58,
        institutionId: 'commerzbank',
        applyCount: 57,
        modifications: {
          amount: 502.58,
        },
      })

      const kreditRules = useAppStore.getState().duplicateOverrideRules
      expect(kreditRules).toHaveLength(1)
      expect(kreditRules[0].amount).toBe(-502.58) // original preserved
      expect(kreditRules[0].applyCount).toBe(57) // count updated
      expect(kreditRules[0].modifications).toEqual({ amount: 502.58 })

      // Clear all rules
      useAppStore.setState({
        duplicateOverrideRules: [
          {
            id: 'rule-1',
            descriptionPattern: 'Spotify',
            createdAt: '2026-01-01',
            applyCount: 1,
          },
        ],
      })
      useAppStore.getState().clearDuplicateOverrideRules()
      expect(useAppStore.getState().duplicateOverrideRules).toHaveLength(0)
    })

    it('should bypass duplicate detection in getDuplicateTransactionStats when matching rule exists', () => {
      const existingTx = {
        id: 'tx-1',
        date: '2026-03-01',
        description: 'Monthly Gym',
        amount: -45,
        currency: 'EUR',
        type: 'expense' as const,
        institution: 'Chase',
      }

      useAppStore.setState({
        importedAccounts: [
          {
            institutionId: 'chase',
            institutionName: 'Chase',
            transactions: [existingTx],
            importedAt: '2026-03-01T00:00:00Z',
            importedFingerprints: ['fp-1'],
          },
        ],
        duplicateOverrideRules: [],
      })

      const incomingTx = {
        id: 'tx-new-1',
        date: '2026-03-01',
        description: 'Monthly Gym',
        amount: -45,
        currency: 'EUR',
        type: 'expense' as const,
        institution: 'Chase',
      }

      // Without rule: detected as duplicate
      let stats = useAppStore.getState().getDuplicateTransactionStats('chase', [incomingTx])
      expect(stats.duplicateCount).toBe(1)
      expect(stats.duplicateIds).toEqual(['tx-new-1'])

      // With matching override rule: allowed as new transaction
      useAppStore.getState().addDuplicateOverrideRule({
        descriptionPattern: 'Monthly Gym',
        amount: -45,
        institutionId: 'chase',
      })

      stats = useAppStore.getState().getDuplicateTransactionStats('chase', [incomingTx])
      expect(stats.duplicateCount).toBe(0)
      expect(stats.newCount).toBe(1)
      expect(stats.duplicateIds).toEqual([])
    })

    it('marks transactions as already duplicated on subsequent imports when duplicates or modifies were already imported, preventing rules from bypassing them', () => {
      // Step 1: Account with initial clean transactions
      const baseCoffee = {
        id: 'tx-clean-coffee',
        date: '2026-03-01',
        description: 'Coffee Shop',
        amount: -5,
        currency: 'EUR',
        type: 'expense' as const,
        institution: 'Chase',
      }
      const baseBakery = {
        id: 'tx-clean-bakery',
        date: '2026-03-02',
        description: 'Bakery Pastry',
        amount: -10,
        currency: 'EUR',
        type: 'expense' as const,
        institution: 'Chase',
      }

      // Step 2: Account has duplicate Coffee imported (with rule) and modified Bakery imported
      const allowedDuplicateCoffee = {
        id: 'tx-dup-coffee',
        date: '2026-03-01',
        description: 'Coffee Shop',
        amount: -5,
        currency: 'EUR',
        type: 'expense' as const,
        institution: 'Chase',
        originalDescription: 'Coffee Shop',
        originalAmount: -5,
        originalDate: '2026-03-01',
      }
      const modifiedBakery = {
        id: 'tx-mod-bakery',
        date: '2026-03-02',
        description: 'Bakery Pastry (Birthday treat)',
        amount: -12.5,
        currency: 'EUR',
        type: 'expense' as const,
        institution: 'Chase',
        originalDescription: 'Bakery Pastry',
        originalAmount: -10,
        originalDate: '2026-03-02',
      }

      useAppStore.setState({
        importedAccounts: [
          {
            institutionId: 'chase',
            institutionName: 'Chase',
            transactions: [baseCoffee, baseBakery],
            duplicateTransactions: [allowedDuplicateCoffee],
            modifiedTransactions: [modifiedBakery],
            importedAt: '2026-03-02T00:00:00Z',
            importedFingerprints: ['fp-1', 'fp-2'],
          },
        ],
        duplicateOverrideRules: [
          {
            id: 'rule-coffee',
            descriptionPattern: 'Coffee Shop',
            amount: -5,
            institutionId: 'chase',
            createdAt: '2026-03-02T00:00:00Z',
            applyCount: 1,
          },
        ],
      })

      // Step 3: Re-importing original CSV containing original Coffee and Bakery rows
      const incomingRows = [
        {
          id: 'incoming-coffee-3',
          date: '2026-03-01',
          description: 'Coffee Shop',
          amount: -5,
          currency: 'EUR',
          type: 'expense' as const,
          institution: 'Chase',
        },
        {
          id: 'incoming-bakery-3',
          date: '2026-03-02',
          description: 'Bakery Pastry',
          amount: -10,
          currency: 'EUR',
          type: 'expense' as const,
          institution: 'Chase',
        },
      ]

      const stats = useAppStore.getState().getDuplicateTransactionStats('chase', incomingRows)

      // Both must be identified as duplicates
      expect(stats.duplicateCount).toBe(2)
      expect(stats.newCount).toBe(0)
      expect(stats.duplicateIds).toContain('incoming-coffee-3')
      expect(stats.duplicateIds).toContain('incoming-bakery-3')

      // Both must be flagged in alreadyDuplicatedIds
      expect(stats.alreadyDuplicatedIds).toContain('incoming-coffee-3')
      expect(stats.alreadyDuplicatedIds).toContain('incoming-bakery-3')
    })

    it('stamps importedByRuleId on transactions allowed by duplicate override rules when imported', () => {
      useAppStore.setState({
        importedAccounts: [
          {
            institutionId: 'chase',
            institutionName: 'Chase',
            transactions: [
              {
                id: 'tx-existing',
                date: '2026-03-01',
                description: 'Monthly Gym',
                amount: -45,
                currency: 'EUR',
                type: 'expense',
                institution: 'Chase',
              },
            ],
            importedAt: '2026-03-01T00:00:00Z',
            importedFingerprints: ['fp-1'],
          },
        ],
        duplicateOverrideRules: [
          {
            id: 'rule-gym',
            descriptionPattern: 'Monthly Gym',
            amount: -45,
            institutionId: 'chase',
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 0,
          },
        ],
      })

      const duplicateBatch = {
        institutionId: 'chase',
        institutionName: 'Chase',
        transactions: [
          {
            id: 'tx-dup',
            date: '2026-03-01',
            description: 'Monthly Gym',
            amount: -45,
            currency: 'EUR',
            type: 'expense' as const,
            institution: 'Chase',
          },
        ],
        importedAt: '2026-03-02T00:00:00Z',
        importedFingerprints: ['fp-2'],
      }

      useAppStore.getState().addImportedAccount(duplicateBatch)

      const accounts = useAppStore.getState().importedAccounts
      const importedTx = accounts[0].duplicateTransactions?.find((t) => t.id === 'tx-dup')
      expect(importedTx).toBeDefined()
      expect(importedTx?.importedByRuleId).toBe('rule-gym')
    })

    it('imports duplicate transactions without changes and ensures collision-free unique IDs and isDuplicate flag', () => {
      useAppStore.setState({
        importedAccounts: [
          {
            institutionId: 'chase',
            institutionName: 'Chase',
            transactions: [
              {
                id: 'tx-1',
                date: '2026-03-01',
                description: 'Grocery Store',
                amount: -50,
                currency: 'EUR',
                type: 'expense',
                institution: 'Chase',
              },
            ],
            importedAt: '2026-03-01T00:00:00Z',
            importedFingerprints: ['fp-1'],
          },
        ],
        duplicateOverrideRules: [],
      })

      // Same transaction imported as duplicate without changes
      const duplicateBatch = {
        institutionId: 'chase',
        institutionName: 'Chase',
        transactions: [],
        duplicateTransactions: [
          {
            id: 'tx-1',
            date: '2026-03-01',
            description: 'Grocery Store',
            amount: -50,
            currency: 'EUR',
            type: 'expense' as const,
            institution: 'Chase',
            forceImport: true,
          },
        ],
        importedAt: '2026-03-02T00:00:00Z',
        importedFingerprints: ['fp-2'],
      }

      useAppStore.getState().addImportedAccount(duplicateBatch)

      const account = useAppStore.getState().importedAccounts[0]
      expect(account.transactions).toHaveLength(1)
      expect(account.duplicateTransactions).toHaveLength(1)
      const dup = account.duplicateTransactions![0]
      expect(dup.isDuplicate).toBe(true)
      // Guaranteed unique ID avoiding collision with tx-1
      expect(dup.id).not.toBe('tx-1')
      expect(dup.id).toContain('tx-1_dup_')
    })

    it('does not treat fresh imports for a new institution as duplicates even if description/amount matches existing rules', () => {
      useAppStore.setState({
        importedAccounts: [],
        duplicateOverrideRules: [
          {
            id: 'rule-gym',
            descriptionPattern: 'Monthly Gym',
            amount: -45,
            institutionId: 'new-bank',
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 0,
          },
        ],
      })

      const freshBatch = {
        institutionId: 'new-bank',
        institutionName: 'New Bank',
        transactions: [
          {
            id: 'tx-clean-1',
            date: '2026-03-01',
            description: 'Monthly Gym',
            amount: -45,
            currency: 'EUR',
            type: 'expense' as const,
            institution: 'New Bank',
          },
        ],
        importedAt: '2026-03-01T00:00:00Z',
        importedFingerprints: ['fp-fresh'],
      }

      useAppStore.getState().addImportedAccount(freshBatch)

      const accounts = useAppStore.getState().importedAccounts
      expect(accounts[0].transactions).toHaveLength(1)
      expect(accounts[0].transactions[0].id).toBe('tx-clean-1')
      expect(accounts[0].transactions[0].isDuplicate).toBeFalsy()
      expect(accounts[0].duplicateTransactions).toBeUndefined()
    })

    it('removes imported transactions when revoking a rule with deleteImportedTransactions = true', () => {
      useAppStore.setState({
        importedAccounts: [
          {
            institutionId: 'chase',
            institutionName: 'Chase',
            transactions: [
              {
                id: 'tx-normal',
                date: '2026-03-01',
                description: 'Salary',
                amount: 3000,
                currency: 'EUR',
                type: 'income',
                institution: 'Chase',
              },
              {
                id: 'tx-by-rule',
                date: '2026-03-01',
                description: 'Monthly Gym',
                amount: -45,
                currency: 'EUR',
                type: 'expense',
                institution: 'Chase',
                importedByRuleId: 'rule-gym',
              },
            ],
            importedAt: '2026-03-01T00:00:00Z',
            importedFingerprints: ['fp-1'],
          },
        ],
        duplicateOverrideRules: [
          {
            id: 'rule-gym',
            descriptionPattern: 'Monthly Gym',
            amount: -45,
            institutionId: 'chase',
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 1,
          },
        ],
      })

      // Revoke rule and delete transactions imported by it (both)
      useAppStore.getState().removeDuplicateOverrideRule('rule-gym', 'both')

      const state = useAppStore.getState()
      expect(state.duplicateOverrideRules).toHaveLength(0)
      expect(state.importedAccounts[0].transactions).toHaveLength(1)
      expect(state.importedAccounts[0].transactions[0].id).toBe('tx-normal')
    })

    it('deletes imported transactions only and keeps rule when mode = "data_only"', () => {
      useAppStore.setState({
        importedAccounts: [
          {
            institutionId: 'chase',
            institutionName: 'Chase',
            transactions: [
              {
                id: 'tx-normal',
                date: '2026-03-01',
                description: 'Salary',
                amount: 3000,
                currency: 'EUR',
                type: 'income',
                institution: 'Chase',
              },
              {
                id: 'tx-by-rule',
                date: '2026-03-01',
                description: 'Monthly Gym',
                amount: -45,
                currency: 'EUR',
                type: 'expense',
                institution: 'Chase',
                importedByRuleId: 'rule-gym',
              },
            ],
            importedAt: '2026-03-01T00:00:00Z',
            importedFingerprints: ['fp-1'],
          },
        ],
        duplicateOverrideRules: [
          {
            id: 'rule-gym',
            descriptionPattern: 'Monthly Gym',
            amount: -45,
            institutionId: 'chase',
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 1,
          },
        ],
      })

      // Delete data only: keep rule, delete transactions
      useAppStore.getState().removeDuplicateOverrideRule('rule-gym', 'data_only')

      const state = useAppStore.getState()
      expect(state.duplicateOverrideRules).toHaveLength(1)
      expect(state.duplicateOverrideRules[0].id).toBe('rule-gym')
      expect(state.importedAccounts[0].transactions).toHaveLength(1)
      expect(state.importedAccounts[0].transactions[0].id).toBe('tx-normal')
    })

    it('deletes rule only and keeps transactions when mode = "rule_only"', () => {
      useAppStore.setState({
        importedAccounts: [
          {
            institutionId: 'chase',
            institutionName: 'Chase',
            transactions: [
              {
                id: 'tx-by-rule',
                date: '2026-03-01',
                description: 'Monthly Gym',
                amount: -45,
                currency: 'EUR',
                type: 'expense',
                institution: 'Chase',
                importedByRuleId: 'rule-gym',
              },
            ],
            importedAt: '2026-03-01T00:00:00Z',
            importedFingerprints: ['fp-1'],
          },
        ],
        duplicateOverrideRules: [
          {
            id: 'rule-gym',
            descriptionPattern: 'Monthly Gym',
            amount: -45,
            institutionId: 'chase',
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 1,
          },
        ],
      })

      // Delete rule only: remove rule, keep transactions
      useAppStore.getState().removeDuplicateOverrideRule('rule-gym', 'rule_only')

      const state = useAppStore.getState()
      expect(state.duplicateOverrideRules).toHaveLength(0)
      expect(state.importedAccounts[0].transactions).toHaveLength(1)
    })

    it('removes modified duplicate transactions to trash and preserves original transactions in place when revoking rule with modifications', () => {
      useAppStore.setState({
        importedAccounts: [
          {
            institutionId: 'commerzbank',
            institutionName: 'Commerzbank',
            transactions: [
              {
                id: 'tx-orig',
                date: '2026-09-20',
                description: 'ANEL O. BILJANA MEMIC KREDITRATE',
                amount: -502.58,
                currency: 'EUR',
                type: 'expense',
                institution: 'Commerzbank',
              },
            ],
            duplicateTransactions: [
              {
                id: 'tx-mod',
                date: '2026-09-20',
                description: 'ANEL O. BILJANA MEMIC KREDITRATE',
                amount: 502.58,
                currency: 'EUR',
                type: 'income',
                institution: 'Commerzbank',
                importedByRuleId: 'drule-kredit',
                isDuplicate: true,
              },
            ],
            importedAt: '2026-09-20T00:00:00Z',
            importedFingerprints: ['fp-cb'],
          },
        ],
        duplicateOverrideRules: [
          {
            id: 'drule-kredit',
            descriptionPattern: 'ANEL O. BILJANA MEMIC KREDITRATE',
            amount: -502.58,
            institutionId: 'commerzbank',
            institutionName: 'Commerzbank',
            createdAt: '2026-09-20T00:00:00Z',
            applyCount: 1,
            modifications: {
              amount: 502.58,
            },
          },
        ],
      })

      useAppStore.getState().removeDuplicateOverrideRule('drule-kredit', 'both')

      const state = useAppStore.getState()
      expect(state.duplicateOverrideRules).toHaveLength(0)
      // Original transaction must remain in place in transactions array
      expect(state.importedAccounts[0].transactions).toHaveLength(1)
      expect(state.importedAccounts[0].transactions[0].id).toBe('tx-orig')
      // Duplicate modified transaction completely removed from duplicateTransactions and not moved anywhere else
      expect(state.importedAccounts[0].duplicateTransactions ?? []).toHaveLength(0)
    })

    it('completely removes 50 duplicate transactions from duplicateTransactions array and preserves 50 original transactions in place when revoking duplicate rule', () => {
      const origTxs: Transaction[] = Array.from({ length: 50 }, (_, i) => ({
        id: `tx-orig-${i}`,
        date: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
        description: 'Monthly Salary',
        amount: 2500,
        currency: 'EUR',
        type: 'income',
        institution: 'Chase',
      }))

      const modTxs: Transaction[] = Array.from({ length: 50 }, (_, i) => ({
        id: `tx-mod-${i}`,
        date: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
        description: 'Monthly Salary',
        amount: 3000,
        currency: 'EUR',
        type: 'income',
        institution: 'Chase',
        importedByRuleId: 'rule-salary-mod',
        isDuplicate: true,
      }))

      useAppStore.setState({
        importedAccounts: [
          {
            institutionId: 'chase',
            institutionName: 'Chase',
            transactions: origTxs,
            duplicateTransactions: modTxs,
            importedAt: '2026-03-01T00:00:00Z',
            importedFingerprints: ['fp-1'],
          },
        ],
        duplicateOverrideRules: [
          {
            id: 'rule-salary-mod',
            descriptionPattern: 'Monthly Salary',
            amount: 2500,
            institutionId: 'chase',
            institutionName: 'Chase',
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 50,
            modifications: {
              amount: 3000,
            },
          },
        ],
      })

      expect(useAppStore.getState().importedAccounts[0].transactions).toHaveLength(50)
      expect(useAppStore.getState().importedAccounts[0].duplicateTransactions).toHaveLength(50)

      useAppStore.getState().removeDuplicateOverrideRule('rule-salary-mod', 'both')

      const state = useAppStore.getState()
      expect(state.duplicateOverrideRules).toHaveLength(0)
      // Original 50 transactions remain strictly in place
      expect(state.importedAccounts[0].transactions).toHaveLength(50)
      expect(state.importedAccounts[0].transactions.map((t) => t.id)).toEqual(origTxs.map((t) => t.id))
      // 50 duplicate transactions completely removed from duplicateTransactions array and not moved anywhere else
      expect(state.importedAccounts[0].duplicateTransactions ?? []).toHaveLength(0)
    })

    it('preserves original transaction in place and deletes identical duplicate when revoking allow duplicate rule', () => {
      useAppStore.setState({
        importedAccounts: [
          {
            institutionId: 'commerzbank',
            institutionName: 'Commerzbank',
            transactions: [
              {
                id: 'tx-orig-1',
                date: '2026-09-20',
                description: 'KREDITRATE 502',
                amount: -502.58,
                currency: 'EUR',
                type: 'expense',
                institution: 'Commerzbank',
              },
              {
                id: 'tx-dup-1',
                date: '2026-09-20',
                description: 'KREDITRATE 502',
                amount: -502.58,
                currency: 'EUR',
                type: 'expense',
                institution: 'Commerzbank',
                importedByRuleId: 'drule-dup',
              },
            ],
            importedAt: '2026-09-20T00:00:00Z',
            importedFingerprints: ['fp-cb'],
          },
        ],
        duplicateOverrideRules: [
          {
            id: 'drule-dup',
            descriptionPattern: 'KREDITRATE 502',
            amount: -502.58,
            institutionId: 'commerzbank',
            createdAt: '2026-09-20T00:00:00Z',
            applyCount: 1,
          },
        ],
      })

      useAppStore.getState().removeDuplicateOverrideRule('drule-dup', 'both')

      const state = useAppStore.getState()
      expect(state.duplicateOverrideRules).toHaveLength(0)
      expect(state.importedAccounts[0].transactions).toHaveLength(1)
      expect(state.importedAccounts[0].transactions[0].id).toBe('tx-orig-1')
    })

    it('imports duplicate transactions into duplicateTransactions array, and restores balance to pre-duplicate state upon rule deletion', () => {
      // Step 1: Initial import of genuine clean transactions
      const initialAccount: ImportedAccount = {
        institutionId: 'bank-1',
        institutionName: 'Bank One',
        transactions: [
          {
            id: 't-1',
            date: '2026-09-01',
            description: 'Salary',
            amount: 3000,
            currency: 'EUR',
            type: 'income',
            institution: 'Bank One',
          },
          {
            id: 't-2',
            date: '2026-09-02',
            description: 'Rent',
            amount: -1000,
            currency: 'EUR',
            type: 'expense',
            institution: 'Bank One',
          },
        ],
        importedAt: '2026-09-01T00:00:00Z',
        importedFingerprints: ['fp-1'],
      }

      useAppStore.getState().addImportedAccount(initialAccount)

      // Calculate initial pre-duplicate balance
      const initialStore = useAppStore.getState()
      const initialAllTxs = [
        ...initialStore.importedAccounts[0].transactions,
        ...(initialStore.importedAccounts[0].duplicateTransactions || []),
      ]
      const initialBalance = initialAllTxs.reduce((sum, t) => sum + t.amount, 0)
      expect(initialBalance).toBe(2000)

      // Step 2: Create a duplicate override rule (user modified amount on duplicate import)
      const ruleId = 'rule-rent-modified'
      useAppStore.getState().addDuplicateOverrideRule({
        id: ruleId,
        institutionId: 'bank-1',
        institutionName: 'Bank One',
        descriptionPattern: 'Rent',
        amount: -1000,
        createdAt: '2026-09-02T00:00:00Z',
        applyCount: 1,
        modifications: {
          amount: -1200,
        },
      })

      // Step 3: Second import with the modified duplicate transaction
      const secondAccount: ImportedAccount = {
        institutionId: 'bank-1',
        institutionName: 'Bank One',
        transactions: [],
        duplicateTransactions: [
          {
            id: 't-2-dup',
            date: '2026-09-02',
            description: 'Rent',
            amount: -1200,
            currency: 'EUR',
            type: 'expense',
            institution: 'Bank One',
            importedByRuleId: ruleId,
            isDuplicate: true,
            forceImport: true,
          },
        ],
        importedAt: '2026-09-02T00:00:00Z',
        importedFingerprints: ['fp-2'],
      }

      useAppStore.getState().addImportedAccount(secondAccount)

      const withDupStore = useAppStore.getState()
      expect(withDupStore.importedAccounts[0].transactions).toHaveLength(2)
      expect(withDupStore.importedAccounts[0].duplicateTransactions).toHaveLength(1)

      const withDupAllTxs = [
        ...withDupStore.importedAccounts[0].transactions,
        ...(withDupStore.importedAccounts[0].duplicateTransactions || []),
      ]
      const withDupBalance = withDupAllTxs.reduce((sum, t) => sum + t.amount, 0)
      expect(withDupBalance).toBe(800) // 2000 - 1200 = 800

      // Step 4: Delete the duplicate override rule from Settings
      useAppStore.getState().removeDuplicateOverrideRule(ruleId, 'both')

      const restoredStore = useAppStore.getState()
      expect(restoredStore.duplicateOverrideRules).toHaveLength(0)
      expect(restoredStore.importedAccounts[0].duplicateTransactions ?? []).toHaveLength(0)
      expect(restoredStore.importedAccounts[0].transactions).toHaveLength(2)

      // Balance and calculations are restored to exact pre-duplicate state
      const restoredAllTxs = [
        ...restoredStore.importedAccounts[0].transactions,
        ...(restoredStore.importedAccounts[0].duplicateTransactions || []),
      ]
      const restoredBalance = restoredAllTxs.reduce((sum, t) => sum + t.amount, 0)
      expect(restoredBalance).toBe(initialBalance)
      expect(restoredBalance).toBe(2000)
    })

    it('deleting one rule among multiple rules preserves all other rules in the store', () => {
      useAppStore.setState({
        duplicateOverrideRules: [
          {
            id: 'rule-1',
            descriptionPattern: 'Netflix',
            amount: -12.99,
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 2,
          },
          {
            id: 'rule-2',
            descriptionPattern: 'Spotify',
            amount: -9.99,
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 1,
          },
          {
            id: 'rule-3',
            descriptionPattern: 'Gym Membership',
            amount: -45,
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 5,
          },
        ],
      })

      expect(useAppStore.getState().duplicateOverrideRules).toHaveLength(3)

      // Delete only rule-2
      useAppStore.getState().removeDuplicateOverrideRule('rule-2')

      const state = useAppStore.getState()
      expect(state.duplicateOverrideRules).toHaveLength(2)
      expect(state.duplicateOverrideRules.map((r) => r.id)).toEqual(['rule-1', 'rule-3'])
      expect(state.duplicateOverrideRules.map((r) => r.descriptionPattern)).toEqual(['Netflix', 'Gym Membership'])
    })

    it('handles legacy rules with missing or duplicate IDs without deleting all rules', () => {
      // 1. Verify sanitizeDuplicateOverrideRules assigns unique IDs to legacy rules
      const legacyRules = [
        {
          descriptionPattern: 'Rewe Supermarkt',
          amount: -25.5,
          createdAt: '2026-03-01T00:00:00Z',
          applyCount: 1,
        } as any,
        {
          descriptionPattern: 'Aldi Sud',
          amount: -18.2,
          createdAt: '2026-03-01T00:00:00Z',
          applyCount: 2,
        } as any,
      ]
      const sanitized = sanitizeDuplicateOverrideRules(legacyRules)
      expect(sanitized).toHaveLength(2)
      expect(sanitized[0].id).toBeTruthy()
      expect(sanitized[1].id).toBeTruthy()
      expect(sanitized[0].id).not.toBe(sanitized[1].id)

      // 2. Verify state with duplicate IDs disambiguates on deletion
      useAppStore.setState({
        duplicateOverrideRules: [
          {
            id: 'rule-dup',
            descriptionPattern: 'Rewe Supermarkt',
            amount: -25.5,
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 1,
          },
          {
            id: 'rule-dup',
            descriptionPattern: 'Aldi Sud',
            amount: -18.2,
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 2,
          },
        ],
      })

      // When deleting 'rule-dup', only the first matching rule is deleted,
      // and the second rule with colliding ID gets a fresh unique ID so it is preserved!
      useAppStore.getState().removeDuplicateOverrideRule('rule-dup')

      const afterState = useAppStore.getState()
      expect(afterState.duplicateOverrideRules).toHaveLength(1)
      expect(afterState.duplicateOverrideRules[0].descriptionPattern).toBe('Aldi Sud')
      expect(afterState.duplicateOverrideRules[0].id).not.toBe('rule-dup')
    })

    it('deleting one rule with mode "both" preserves transactions belonging to other rules', () => {
      useAppStore.setState({
        duplicateOverrideRules: [
          {
            id: 'rule-netflix',
            descriptionPattern: 'Netflix',
            amount: -12.99,
            institutionId: 'bank-1',
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 1,
          },
          {
            id: 'rule-spotify',
            descriptionPattern: 'Spotify',
            amount: -9.99,
            institutionId: 'bank-1',
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 1,
          },
        ],
        importedAccounts: [
          {
            institutionId: 'bank-1',
            institutionName: 'Bank One',
            importedAt: '2026-03-01T00:00:00Z',
            importedFingerprints: ['fp-1'],
            transactions: [
              {
                id: 'tx-clean',
                date: '2026-03-01',
                description: 'Clean Salary',
                amount: 3000,
                currency: 'EUR',
                type: 'income',
                institution: 'Bank One',
              },
            ],
            duplicateTransactions: [
              {
                id: 'tx-netflix-dup',
                date: '2026-03-01',
                description: 'Netflix',
                amount: -12.99,
                currency: 'EUR',
                type: 'expense',
                institution: 'Bank One',
                importedByRuleId: 'rule-netflix',
                isDuplicate: true,
              },
              {
                id: 'tx-spotify-dup',
                date: '2026-03-01',
                description: 'Spotify',
                amount: -9.99,
                currency: 'EUR',
                type: 'expense',
                institution: 'Bank One',
                importedByRuleId: 'rule-spotify',
                isDuplicate: true,
              },
            ],
            modifiedTransactions: [
              {
                id: 'tx-netflix-mod',
                date: '2026-03-01',
                description: 'Netflix Adjusted',
                amount: -12.99,
                currency: 'EUR',
                type: 'expense',
                institution: 'Bank One',
                importedByRuleId: 'rule-netflix',
                isDuplicate: true,
                isModified: true,
              },
              {
                id: 'tx-spotify-mod',
                date: '2026-03-01',
                description: 'Spotify Adjusted',
                amount: -9.99,
                currency: 'EUR',
                type: 'expense',
                institution: 'Bank One',
                importedByRuleId: 'rule-spotify',
                isDuplicate: true,
                isModified: true,
              },
            ],
          },
        ],
      })

      // Delete only rule-netflix in mode 'both'
      useAppStore.getState().removeDuplicateOverrideRule('rule-netflix', 'both')

      const state = useAppStore.getState()
      // Rule list: only spotify remains
      expect(state.duplicateOverrideRules).toHaveLength(1)
      expect(state.duplicateOverrideRules[0].id).toBe('rule-spotify')

      const account = state.importedAccounts[0]
      // Clean transactions untouched
      expect(account.transactions).toHaveLength(1)
      expect(account.transactions[0].id).toBe('tx-clean')

      // Duplicate transactions: netflix removed, spotify preserved
      expect(account.duplicateTransactions).toHaveLength(1)
      expect(account.duplicateTransactions?.[0].id).toBe('tx-spotify-dup')

      // Modified transactions: netflix removed, spotify preserved
      expect(account.modifiedTransactions).toHaveLength(1)
      expect(account.modifiedTransactions?.[0].id).toBe('tx-spotify-mod')
    })

    it('calling removeDuplicateOverrideRule with falsy or non-existent ID does not delete any rules or transactions', () => {
      useAppStore.setState({
        duplicateOverrideRules: [
          {
            id: 'rule-a',
            descriptionPattern: 'Rule A',
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 1,
          },
          {
            id: 'rule-b',
            descriptionPattern: 'Rule B',
            createdAt: '2026-03-01T00:00:00Z',
            applyCount: 1,
          },
        ],
      })

      useAppStore.getState().removeDuplicateOverrideRule('' as any)
      useAppStore.getState().removeDuplicateOverrideRule('   ' as any)
      useAppStore.getState().removeDuplicateOverrideRule(undefined as any)
      useAppStore.getState().removeDuplicateOverrideRule('non-existent-id')

      expect(useAppStore.getState().duplicateOverrideRules).toHaveLength(2)
      expect(useAppStore.getState().duplicateOverrideRules.map((r) => r.id)).toEqual(['rule-a', 'rule-b'])
    })
  })

  describe('resetDuplicateTransactions & countDuplicateTransactionsInAccounts', () => {
    it('accurately counts duplicate transactions including forceImport, orphaned rule IDs, and duplicate content', () => {
      const accounts: ImportedAccount[] = [
        {
          institutionId: 'commerzbank',
          institutionName: 'Commerzbank',
          importedAt: '2026-09-20T10:00:00Z',
          importedFingerprints: ['fp-1'],
          transactions: [
            {
              id: 'tx-1',
              date: '2026-09-20',
              description: 'KREDITRATE',
              amount: -502.58,
              currency: 'EUR',
              type: 'expense',
              institution: 'Commerzbank',
            },
            {
              id: 'tx-2',
              date: '2026-09-20',
              description: 'KREDITRATE',
              amount: 502.58,
              currency: 'EUR',
              type: 'income',
              institution: 'Commerzbank',
              forceImport: true,
            },
            {
              id: 'tx-3',
              date: '2026-09-20',
              description: 'KREDITRATE',
              amount: -502.58,
              currency: 'EUR',
              type: 'expense',
              institution: 'Commerzbank',
              importedByRuleId: 'deleted-rule-xyz',
            },
          ],
        },
      ]

      const count = countDuplicateTransactionsInAccounts(accounts, [])
      expect(count).toBe(2) // tx-2 (forceImport) and tx-3 (orphaned rule or duplicate content)
    })

    it('resets duplicate transactions and recalculates accounts, keeping original transactions', () => {
      useAppStore.setState({
        importedAccounts: [
          {
            institutionId: 'commerzbank',
            institutionName: 'Commerzbank',
            importedAt: '2026-09-20T10:00:00Z',
            importedFingerprints: ['fp-1'],
            transactions: [
              {
                id: 'tx-original',
                date: '2026-09-20',
                description: 'KREDITRATE',
                amount: -502.58,
                currency: 'EUR',
                type: 'expense',
                institution: 'Commerzbank',
              },
              {
                id: 'tx-duplicate-forced',
                date: '2026-09-20',
                description: 'KREDITRATE',
                amount: 502.58,
                currency: 'EUR',
                type: 'income',
                institution: 'Commerzbank',
                forceImport: true,
              },
              {
                id: 'tx-duplicate-identical',
                date: '2026-09-20',
                description: 'KREDITRATE',
                amount: -502.58,
                currency: 'EUR',
                type: 'expense',
                institution: 'Commerzbank',
              },
            ],
          },
        ],
        duplicateOverrideRules: [],
      })

      const result = useAppStore.getState().resetDuplicateTransactions()
      expect(result.removedCount).toBe(2)

      const remaining = useAppStore.getState().importedAccounts[0].transactions
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe('tx-original')
    })

    it('separates pure duplicate transactions and modified duplicate transactions into their own arrays', () => {
      const pureDup: Transaction = {
        id: 'dup-pure',
        date: '2026-09-21',
        description: 'Netflix',
        amount: -15.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Sparkasse',
        isDuplicate: true,
        isModified: false,
      }
      const modDup: Transaction = {
        id: 'dup-mod',
        date: '2026-09-21',
        description: 'Netflix Family',
        amount: -19.99,
        currency: 'EUR',
        type: 'expense',
        institution: 'Sparkasse',
        isDuplicate: true,
        isModified: true,
      }

      useAppStore.getState().addImportedAccount({
        institutionId: 'inst-test',
        institutionName: 'Sparkasse',
        transactions: [],
        duplicateTransactions: [pureDup],
        modifiedTransactions: [modDup],
        importedAt: '2026-09-21T00:00:00Z',
        importedFingerprints: ['fp-dup-mod'],
      })

      const state = useAppStore.getState()
      const account = state.importedAccounts.find((a) => a.institutionId === 'inst-test')
      expect(account).toBeDefined()
      expect(account?.duplicateTransactions).toHaveLength(1)
      expect(account?.duplicateTransactions?.[0].id).toBe('dup-pure')
      expect(account?.duplicateTransactions?.[0].isModified).toBe(false)

      expect(account?.modifiedTransactions).toHaveLength(1)
      expect(account?.modifiedTransactions?.[0].id).toBe('dup-mod')
      expect(account?.modifiedTransactions?.[0].isModified).toBe(true)

      // countDuplicateTransactionsInAccounts includes both
      expect(countDuplicateTransactionsInAccounts(state.importedAccounts)).toBe(2)

      // Reset removes both
      const resetRes = useAppStore.getState().resetDuplicateTransactions()
      expect(resetRes.removedCount).toBe(2)
      const afterReset = useAppStore.getState().importedAccounts.find((a) => a.institutionId === 'inst-test')
      expect(afterReset?.duplicateTransactions).toHaveLength(0)
      expect(afterReset?.modifiedTransactions).toHaveLength(0)
    })
  })
})
