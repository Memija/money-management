import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AppStep, Country, CustomCategory, FinancialInstitution, ImportedAccount, Transaction } from '../types'

export interface AppState {
  currentStep: AppStep
  selectedCountry: Country | null
  selectedInstitution: FinancialInstitution | null
  importedAccounts: ImportedAccount[]

  customKeywords: Record<string, string[]>
  manualCategories: Record<string, string>
  customCategories: CustomCategory[]

  setCustomKeywords: (category: string, keywords: string[]) => void
  setManualCategory: (transactionId: string, category: string) => void
  setManualCategoriesBulk: (mapping: Record<string, string>) => void
  addCustomCategory: (category: CustomCategory) => void
  updateCustomCategory: (category: CustomCategory) => void
  deleteCustomCategory: (id: string) => void

  setStep: (step: AppStep) => void
  selectCountry: (country: Country) => void
  selectInstitution: (institution: FinancialInstitution) => void
  addImportedAccount: (account: ImportedAccount) => void
  replaceImportedAccount: (account: ImportedAccount) => void
  resetImport: () => void
  cancelImport: () => void
  startNewInstitution: () => void
  /**
   * Returns the count of duplicate and new transactions for the given institution.
   */
  getDuplicateTransactionStats: (institutionId: string, transactions: Transaction[]) => { duplicateCount: number; newCount: number; duplicateIds: string[] }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentStep: 'country',
      selectedCountry: null,
      selectedInstitution: null,
      importedAccounts: [],
      customKeywords: {},
      manualCategories: {},
      customCategories: [],

      addCustomCategory: (category) =>
        set((state) => ({
          customCategories: [...state.customCategories, category],
        })),

      updateCustomCategory: (category) =>
        set((state) => ({
          customCategories: state.customCategories.map((c) => (c.id === category.id ? category : c)),
        })),

      deleteCustomCategory: (id) =>
        set((state) => ({
          customCategories: state.customCategories.filter((c) => c.id !== id),
        })),

      setCustomKeywords: (category, keywords) =>
        set((state) => ({
          customKeywords: {
            ...state.customKeywords,
            [category]: keywords,
          },
        })),

      setManualCategory: (transactionId, category) =>
        set((state) => ({
          manualCategories: {
            ...state.manualCategories,
            [transactionId]: category,
          },
        })),

      setManualCategoriesBulk: (mapping) =>
        set((state) => ({
          manualCategories: {
            ...state.manualCategories,
            ...mapping,
          },
        })),

      setStep: (step) => set({ currentStep: step }),

      selectCountry: (country) => set({ selectedCountry: country, currentStep: 'institution' }),

      selectInstitution: (institution) =>
        set({ selectedInstitution: institution, currentStep: 'import' }),

      addImportedAccount: (account) =>
        set((state) => {
          const existingIdx = state.importedAccounts.findIndex(
            (a) => a.institutionId === account.institutionId,
          )

          if (existingIdx < 0) {
            // Brand-new institution — just append as-is
            return { importedAccounts: [...state.importedAccounts, account], currentStep: 'review' }
          }

          // Same institution already has data — merge transactions to avoid data loss.
          // Deduplicate by a canonical key (date|amount|description) so re-importing
          // overlapping periods doesn't create duplicates.
          const existing = state.importedAccounts[existingIdx]
          const existingKeys = new Set(
            existing.transactions.map(
              (t) => `${t.date}|${t.amount}|${t.description.trim().toLowerCase()}`,
            ),
          )
          const newUnique = account.transactions.filter(
            (t) =>
              !existingKeys.has(`${t.date}|${t.amount}|${t.description.trim().toLowerCase()}`),
          )
          // Accumulate ALL fingerprints so future re-imports of any previously seen file are detected
          const mergedFingerprints = Array.from(
            new Set([...existing.importedFingerprints, ...account.importedFingerprints]),
          )
          const merged: ImportedAccount = {
            ...existing,
            transactions: [...existing.transactions, ...newUnique],
            importedAt: account.importedAt,
            importedFingerprints: mergedFingerprints,
          }
          const updated = state.importedAccounts.map((a, i) => (i === existingIdx ? merged : a))
          return { importedAccounts: updated, currentStep: 'review' }
        }),

      // Force-replaces an existing account record — used by the "Import Anyway" path
      // when the user confirms they want to overwrite a previously imported batch.
      replaceImportedAccount: (account) =>
        set((state) => {
          const existingIdx = state.importedAccounts.findIndex(
            (a) => a.institutionId === account.institutionId,
          )
          const updated =
            existingIdx >= 0
              ? state.importedAccounts.map((a, i) => (i === existingIdx ? account : a))
              : [...state.importedAccounts, account]
          return { importedAccounts: updated, currentStep: 'review' }
        }),

      resetImport: () =>
        set({
          currentStep: 'country',
          selectedCountry: null,
          selectedInstitution: null,
        }),

      cancelImport: () =>
        set((state) => ({
          currentStep: state.importedAccounts.length > 0 ? 'dashboard' : 'country',
        })),

      startNewInstitution: () =>
        set({
          selectedInstitution: null,
          currentStep: 'institution',
        }),

      getDuplicateTransactionStats: (institutionId, transactions) => {
        const { importedAccounts } = get()
        const existingIdx = importedAccounts.findIndex((a) => a.institutionId === institutionId)
        if (existingIdx < 0) {
          return { duplicateCount: 0, newCount: transactions.length, duplicateIds: [] }
        }
        const existing = importedAccounts[existingIdx]
        const existingKeys = new Set(
          existing.transactions.map(
            (t) => `${t.date}|${t.amount}|${t.description.trim().toLowerCase()}`,
          ),
        )
        const duplicateIds: string[] = []
        for (const t of transactions) {
          if (existingKeys.has(`${t.date}|${t.amount}|${t.description.trim().toLowerCase()}`)) {
            duplicateIds.push(t.id)
          }
        }
        return { duplicateCount: duplicateIds.length, newCount: transactions.length - duplicateIds.length, duplicateIds }
      },
    }),
    {
      name: 'mm-app-storage',
    },
  ),
)
