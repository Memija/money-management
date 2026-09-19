import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AppStep, Country, CustomCategory, DuplicateOverrideRule, FinancialInstitution, ImportedAccount, Transaction } from '../types'
import { reconcileCrossAccountTransfers } from '../utils/account-transfers'

export interface AppState {
  currentStep: AppStep
  selectedCountry: Country | null
  selectedInstitution: FinancialInstitution | null
  importedAccounts: ImportedAccount[]

  customKeywords: Record<string, string[]>
  manualCategories: Record<string, string>
  customCategories: CustomCategory[]
  duplicateOverrideRules: DuplicateOverrideRule[]

  setCustomKeywords: (category: string, keywords: string[]) => void
  setManualCategory: (transactionId: string, category: string) => void
  setManualCategoriesBulk: (mapping: Record<string, string>) => void
  addCustomCategory: (category: CustomCategory) => void
  updateCustomCategory: (category: CustomCategory) => void
  deleteCustomCategory: (id: string) => void

  addDuplicateOverrideRule: (
    rule: Omit<DuplicateOverrideRule, 'id' | 'createdAt' | 'applyCount'> & {
      id?: string
      createdAt?: string
      applyCount?: number
    },
  ) => void
  removeDuplicateOverrideRule: (id: string) => void
  clearDuplicateOverrideRules: () => void

  setStep: (step: AppStep) => void
  selectCountry: (country: Country) => void
  selectInstitution: (institution: FinancialInstitution) => void
  addImportedAccount: (account: ImportedAccount) => void
  replaceImportedAccount: (account: ImportedAccount) => void
  resetImport: () => void
  cancelImport: () => void
  startNewInstitution: () => void
  /**
   * Permanently clears all stored user data and returns the app to the initial state.
   */
  clearAllData: (resetPreferences?: boolean) => void
  /**
   * Returns the count of duplicate and new transactions for the given institution.
   */
  getDuplicateTransactionStats: (institutionId: string, transactions: Transaction[]) => { duplicateCount: number; newCount: number; duplicateIds: string[] }
}

export const toCanonicalTransactionKey = (t: { date: string; amount: number; description: string }) => {
  const normDesc = (t.description || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const normAmount = Number(t.amount).toFixed(2)
  return `${t.date}|${normAmount}|${normDesc}`
}

export const matchesDuplicateOverrideRule = (
  rule: DuplicateOverrideRule,
  tx: { description?: string; amount?: number },
  institutionId?: string,
): boolean => {
  if (rule.institutionId && institutionId && rule.institutionId !== institutionId) {
    return false
  }
  if (rule.amount !== undefined && tx.amount !== undefined && Math.abs(Number(tx.amount) - Number(rule.amount)) >= 0.005) {
    return false
  }
  const txDesc = (tx.description || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const rulePattern = (rule.descriptionPattern || '').trim().toLowerCase().replace(/\s+/g, ' ')
  if (!rulePattern) return false
  return txDesc.includes(rulePattern) || rulePattern.includes(txDesc)
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
      duplicateOverrideRules: [],

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

      addDuplicateOverrideRule: (rule) =>
        set((state) => {
          const currentRules = state.duplicateOverrideRules || []
          // Check if an identical pattern already exists
          const existingIdx = currentRules.findIndex(
            (r) =>
              r.descriptionPattern.trim().toLowerCase() === rule.descriptionPattern.trim().toLowerCase() &&
              (rule.amount === undefined || r.amount === rule.amount) &&
              (rule.institutionId === undefined || r.institutionId === rule.institutionId),
          )

          if (existingIdx >= 0) {
            // Update existing rule
            const updated = [...currentRules]
            updated[existingIdx] = {
              ...updated[existingIdx],
              applyCount: (updated[existingIdx].applyCount || 1) + 1,
              lastAppliedAt: new Date().toISOString(),
            }
            return { duplicateOverrideRules: updated }
          }

          const newRule: DuplicateOverrideRule = {
            id: rule.id || `drule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            institutionId: rule.institutionId,
            institutionName: rule.institutionName,
            descriptionPattern: rule.descriptionPattern.trim(),
            amount: rule.amount,
            createdAt: rule.createdAt || new Date().toISOString(),
            lastAppliedAt: rule.lastAppliedAt || new Date().toISOString(),
            applyCount: rule.applyCount ?? 1,
          }
          return {
            duplicateOverrideRules: [newRule, ...currentRules],
          }
        }),

      removeDuplicateOverrideRule: (id) =>
        set((state) => ({
          duplicateOverrideRules: (state.duplicateOverrideRules || []).filter((r) => r.id !== id),
        })),

      clearDuplicateOverrideRules: () =>
        set({ duplicateOverrideRules: [] }),

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

          const duplicateRules = state.duplicateOverrideRules || []
          const matchedRuleIds = new Set<string>()

          let updatedList: ImportedAccount[]
          if (existingIdx < 0) {
            // Brand-new institution — append
            // Also check if any duplicate rules were matched
            account.transactions.forEach((t) => {
              const rule = duplicateRules.find((r) => matchesDuplicateOverrideRule(r, t, account.institutionId))
              if (rule) matchedRuleIds.add(rule.id)
            })
            updatedList = [...state.importedAccounts, account]
          } else {
            // Same institution already has data — merge transactions to avoid data loss.
            // Deduplicate by canonical key (date|amount|normalized description) so re-importing
            // overlapping periods or duplicate files doesn't create duplicates.
            const existing = state.importedAccounts[existingIdx]
            const existingKeys = new Set(
              existing.transactions.map(toCanonicalTransactionKey),
            )
            const newUnique = account.transactions.filter((t) => {
              if (t.forceImport) return true
              if (!existingKeys.has(toCanonicalTransactionKey(t))) return true
              const rule = duplicateRules.find((r) => matchesDuplicateOverrideRule(r, t, account.institutionId))
              if (rule) {
                matchedRuleIds.add(rule.id)
                return true
              }
              return false
            })
            // Accumulate ALL fingerprints so future re-imports of any previously seen file are detected
            const mergedFingerprints = Array.from(
              new Set([...existing.importedFingerprints, ...account.importedFingerprints]),
            )
            const mergedIbans = Array.from(
              new Set([...(existing.accountIbans || []), ...(account.accountIbans || [])]),
            )
            const merged: ImportedAccount = {
              ...existing,
              accountIbans: mergedIbans,
              transactions: [...existing.transactions, ...newUnique],
              importedAt: account.importedAt,
              importedFingerprints: mergedFingerprints,
            }
            updatedList = state.importedAccounts.map((a, i) => (i === existingIdx ? merged : a))
          }

          const updatedRules = duplicateRules.map((r) => {
            if (matchedRuleIds.has(r.id)) {
              return {
                ...r,
                applyCount: (r.applyCount || 0) + 1,
                lastAppliedAt: new Date().toISOString(),
              }
            }
            return r
          })

          const reconciled = reconcileCrossAccountTransfers(updatedList)
          return {
            importedAccounts: reconciled,
            duplicateOverrideRules: updatedRules,
            currentStep: 'review',
          }
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
          const reconciled = reconcileCrossAccountTransfers(updated)
          return { importedAccounts: reconciled, currentStep: 'review' }
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

      clearAllData: (resetPreferences = false) => {
        set({
          currentStep: 'country',
          selectedCountry: null,
          selectedInstitution: null,
          importedAccounts: [],
          customKeywords: {},
          manualCategories: {},
          customCategories: [],
          duplicateOverrideRules: [],
        })
        try {
          useAppStore.persist?.clearStorage()
        } catch (e) {
          console.warn('Failed to clear persisted app storage:', e)
        }
        if (resetPreferences) {
          try {
            localStorage.removeItem('mm-theme-preference')
            localStorage.removeItem('mm-language-preference')
          } catch (e) {
            console.warn('Failed to clear preferences:', e)
          }
        }
      },

      getDuplicateTransactionStats: (institutionId, transactions) => {
        const { importedAccounts, duplicateOverrideRules } = get()
        const targetAccounts =
          institutionId && institutionId !== 'unknown'
            ? importedAccounts.filter((a) => a.institutionId === institutionId)
            : importedAccounts

        if (targetAccounts.length === 0) {
          return { duplicateCount: 0, newCount: transactions.length, duplicateIds: [] }
        }

        const existingKeys = new Set<string>()
        for (const account of targetAccounts) {
          for (const tx of account.transactions) {
            existingKeys.add(toCanonicalTransactionKey(tx))
          }
        }

        const rules = duplicateOverrideRules || []
        const duplicateIds: string[] = []
        for (const t of transactions) {
          if (existingKeys.has(toCanonicalTransactionKey(t))) {
            const isOverridden = rules.some((r) => matchesDuplicateOverrideRule(r, t, institutionId))
            if (!isOverridden) {
              duplicateIds.push(t.id)
            }
          }
        }

        return {
          duplicateCount: duplicateIds.length,
          newCount: transactions.length - duplicateIds.length,
          duplicateIds,
        }
      },
    }),
    {
      name: 'mm-app-storage',
    },
  ),
)
