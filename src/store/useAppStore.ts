import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AppStep, Country, CustomCategory, DuplicateDeleteMode, DuplicateOverrideRule, FinancialInstitution, ImportedAccount, Transaction } from '../types'
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
  trashedTransactions: Transaction[]

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
  removeDuplicateOverrideRule: (id: string, mode?: boolean | DuplicateDeleteMode) => void
  clearDuplicateOverrideRules: (mode?: boolean | DuplicateDeleteMode) => void
  emptyTrash: () => void
  restoreFromTrash: (ids: string[]) => void

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
  /**
   * Cleans up duplicate transactions in imported accounts and recalculates balances.
   */
  resetDuplicateTransactions: () => { removedCount: number }
}

export const toCanonicalTransactionKey = (t: { date: string; amount: number; description: string }) => {
  const normDesc = (t.description || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const normAmount = Number(t.amount).toFixed(2)
  return `${t.date}|${normAmount}|${normDesc}`
}

export const matchesDuplicateOverrideRule = (
  rule: DuplicateOverrideRule,
  tx: { description?: string; amount?: number; importedByRuleId?: string },
  institutionId?: string,
): boolean => {
  if (tx.importedByRuleId && tx.importedByRuleId === rule.id) {
    return true
  }
  if (
    rule.institutionId &&
    institutionId &&
    rule.institutionId !== 'unknown' &&
    institutionId !== 'unknown' &&
    rule.institutionId !== institutionId
  ) {
    return false
  }

  const amountsToMatch: number[] = []
  if (rule.amount !== undefined) {
    amountsToMatch.push(Number(rule.amount))
    amountsToMatch.push(-Number(rule.amount))
  }
  if (rule.modifications?.amount !== undefined) {
    amountsToMatch.push(Number(rule.modifications.amount))
    amountsToMatch.push(-Number(rule.modifications.amount))
  }

  if (amountsToMatch.length > 0 && tx.amount !== undefined) {
    const matchesAnyAmount = amountsToMatch.some(
      (a) => Math.abs(Number(tx.amount) - a) < 0.005,
    )
    if (!matchesAnyAmount) return false
  }

  const txDesc = (tx.description || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const rulePattern = (rule.descriptionPattern || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const modPattern = (rule.modifications?.description || '').trim().toLowerCase().replace(/\s+/g, ' ')

  if (!rulePattern && !modPattern) return false

  const matchesDesc =
    (rulePattern && (txDesc.includes(rulePattern) || rulePattern.includes(txDesc))) ||
    (modPattern && (txDesc.includes(modPattern) || modPattern.includes(txDesc)))

  return Boolean(matchesDesc)
}

export const isModifiedTransactionForRule = (
  rule: DuplicateOverrideRule,
  tx: { description?: string; amount?: number; date?: string; importedByRuleId?: string },
  institutionId?: string,
): boolean => {
  if (!rule.modifications) return false
  if (
    rule.institutionId &&
    institutionId &&
    rule.institutionId !== 'unknown' &&
    institutionId !== 'unknown' &&
    rule.institutionId !== institutionId
  ) {
    return false
  }

  const mods = rule.modifications
  if (mods.amount !== undefined) {
    if (tx.amount === undefined) return false
    const modAmt = Number(mods.amount)
    if (Math.abs(Number(tx.amount) - modAmt) >= 0.005) {
      return false
    }
  }

  if (mods.description !== undefined) {
    const modDesc = mods.description.trim().toLowerCase().replace(/\s+/g, ' ')
    const txDesc = (tx.description || '').trim().toLowerCase().replace(/\s+/g, ' ')
    if (!txDesc.includes(modDesc) && !modDesc.includes(txDesc)) {
      return false
    }
  }

  if (mods.amount === undefined && mods.description === undefined) {
    if (tx.importedByRuleId === rule.id) return true
    return false
  }

  return true
}

export const isOriginalTransactionMatchForRule = (
  rule: DuplicateOverrideRule,
  tx: { description?: string; amount?: number; date?: string },
  institutionId?: string,
): boolean => {
  if (
    rule.institutionId &&
    institutionId &&
    rule.institutionId !== 'unknown' &&
    institutionId !== 'unknown' &&
    rule.institutionId !== institutionId
  ) {
    return false
  }

  if (rule.amount !== undefined && tx.amount !== undefined) {
    const origAmt = Number(rule.amount)
    const matchesOrigAmt =
      Math.abs(Number(tx.amount) - origAmt) < 0.005 ||
      Math.abs(Number(tx.amount) - -origAmt) < 0.005
    if (!matchesOrigAmt) return false
  }

  const origPattern = (rule.descriptionPattern || '').trim().toLowerCase().replace(/\s+/g, ' ')
  if (!origPattern) return false
  const txDesc = (tx.description || '').trim().toLowerCase().replace(/\s+/g, ' ')
  return txDesc.includes(origPattern) || origPattern.includes(txDesc)
}

export const countDuplicateTransactionsInAccounts = (
  importedAccounts: ImportedAccount[],
  duplicateOverrideRules: DuplicateOverrideRule[] = [],
): number => {
  let count = 0
  for (const account of importedAccounts) {
    const seenKeys = new Map<string, number>()
    for (const tx of account.transactions) {
      if (tx.forceImport) {
        count++
        continue
      }
      if (tx.importedByRuleId) {
        const ruleExists = duplicateOverrideRules.some((r) => r.id === tx.importedByRuleId)
        if (!ruleExists) {
          count++
          continue
        }
      }
      const key = toCanonicalTransactionKey(tx)
      const c = seenKeys.get(key) || 0
      seenKeys.set(key, c + 1)
      if (c > 0) {
        count++
      }
    }
  }
  return count
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
      trashedTransactions: [],

      emptyTrash: () => set({ trashedTransactions: [] }),

      restoreFromTrash: (ids) =>
        set((state) => {
          const idSet = new Set(ids)
          const toRestore = (state.trashedTransactions || []).filter((t) => idSet.has(t.id))
          const remainingTrash = (state.trashedTransactions || []).filter((t) => !idSet.has(t.id))
          if (toRestore.length === 0) return state

          const updatedAccounts = state.importedAccounts.map((account) => {
            const matchingTxs = toRestore
              .filter((t) => t.institution === account.institutionName || !t.institution)
              .map((tx) => {
                const copy = { ...tx }
                delete copy.deletedAt
                return copy
              })
            if (matchingTxs.length === 0) return account
            return {
              ...account,
              transactions: [...account.transactions, ...matchingTxs],
            }
          })

          return {
            importedAccounts: reconcileCrossAccountTransfers(updatedAccounts),
            trashedTransactions: remainingTrash,
          }
        }),

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
          const pattern = (rule.descriptionPattern || '').trim()
          if (!pattern) return state

          const patternLower = pattern.toLowerCase()
          const existingIdx = currentRules.findIndex(
            (r) =>
              (r.descriptionPattern || '').trim().toLowerCase() === patternLower &&
              (rule.amount === undefined ||
                r.amount === undefined ||
                Math.abs(Number(r.amount) - Number(rule.amount)) < 0.005) &&
              (!rule.institutionId || !r.institutionId || r.institutionId === rule.institutionId),
          )

          if (existingIdx >= 0) {
            // Update existing rule
            const updated = [...currentRules]
            const existing = updated[existingIdx]
            updated[existingIdx] = {
              ...existing,
              institutionName: rule.institutionName || existing.institutionName,
              amount: rule.amount !== undefined ? rule.amount : existing.amount,
              applyCount:
                rule.applyCount !== undefined
                  ? Math.max(existing.applyCount || 1, rule.applyCount)
                  : (existing.applyCount || 1) + 1,
              modifications:
                rule.modifications !== undefined ? rule.modifications : existing.modifications,
              lastAppliedAt: rule.lastAppliedAt || new Date().toISOString(),
            }
            return { duplicateOverrideRules: updated }
          }

          const newRule: DuplicateOverrideRule = {
            id: rule.id || `drule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            institutionId: rule.institutionId,
            institutionName: rule.institutionName,
            descriptionPattern: pattern,
            amount: rule.amount,
            createdAt: rule.createdAt && !isNaN(new Date(rule.createdAt).getTime()) ? rule.createdAt : new Date().toISOString(),
            lastAppliedAt: rule.lastAppliedAt && !isNaN(new Date(rule.lastAppliedAt).getTime()) ? rule.lastAppliedAt : new Date().toISOString(),
            applyCount: rule.applyCount ?? 1,
            modifications: rule.modifications,
          }

          return {
            duplicateOverrideRules: [newRule, ...currentRules],
          }
        }),

      removeDuplicateOverrideRule: (id, mode = 'both') =>
        set((state) => {
          const ruleToDelete = (state.duplicateOverrideRules || []).find((r) => r.id === id)
          if (!ruleToDelete) return state

          const shouldDeleteRule = mode === 'rule_only' || mode === 'both' || mode === false || mode === true
          const shouldDeleteTransactions = mode === 'data_only' || mode === 'both' || mode === true

          const newRules = shouldDeleteRule
            ? (state.duplicateOverrideRules || []).filter((r) => r.id !== id)
            : (state.duplicateOverrideRules || [])

          if (!shouldDeleteTransactions) {
            return { duplicateOverrideRules: newRules }
          }

          const removedTransactions: Transaction[] = []
          const now = new Date().toISOString()
          const updatedAccounts = state.importedAccounts.map((account) => {
            const seenRuleKeys = new Map<string, number>()
            const filteredTxs = account.transactions.filter((tx) => {
              // 1. Delete if imported specifically by this rule
              if (tx.importedByRuleId === id) {
                removedTransactions.push({ ...tx, deletedAt: now })
                return false
              }

              // 2. Delete if modified by this rule (and was imported as duplicate/override)
              if (isModifiedTransactionForRule(ruleToDelete, tx, account.institutionId)) {
                removedTransactions.push({ ...tx, deletedAt: now })
                return false
              }

              // 3. Delete if orphaned by an already deleted rule
              if (tx.importedByRuleId && !newRules.some((r) => r.id === tx.importedByRuleId)) {
                removedTransactions.push({ ...tx, deletedAt: now })
                return false
              }

              // 4. If transaction matches original criteria of this rule:
              if (isOriginalTransactionMatchForRule(ruleToDelete, tx, account.institutionId)) {
                // If explicitly stamped as a duplicate or force imported, move to trash!
                if (tx.isDuplicate || tx.forceImport || tx.importedByRuleId === id) {
                  removedTransactions.push({ ...tx, deletedAt: now })
                  return false
                }

                // If legacy duplicate without flags, keep first occurrence and remove subsequent copies
                const key = toCanonicalTransactionKey(tx)
                const count = seenRuleKeys.get(key) || 0
                seenRuleKeys.set(key, count + 1)
                if (count > 0 && tx.importedByRuleId) {
                  removedTransactions.push({ ...tx, deletedAt: now })
                  return false
                }
                return true
              }

              return true
            })
            return {
              ...account,
              transactions: filteredTxs,
            }
          })

          const reconciled = reconcileCrossAccountTransfers(updatedAccounts)
          return {
            duplicateOverrideRules: newRules,
            importedAccounts: reconciled,
            trashedTransactions: [...(state.trashedTransactions || []), ...removedTransactions],
          }
        }),

      clearDuplicateOverrideRules: (mode = 'both') =>
        set((state) => {
          const shouldDeleteRules = mode === 'rule_only' || mode === 'both' || mode === false || mode === true
          const shouldDeleteTransactions = mode === 'data_only' || mode === 'both' || mode === true

          const newRules = shouldDeleteRules ? [] : (state.duplicateOverrideRules || [])

          if (!shouldDeleteTransactions) {
            return { duplicateOverrideRules: newRules }
          }

          const rules = state.duplicateOverrideRules || []
          const removedTransactions: Transaction[] = []
          const now = new Date().toISOString()
          const updatedAccounts = state.importedAccounts.map((account) => {
            const seenRuleKeys = new Map<string, number>()
            const filteredTxs = account.transactions.filter((tx) => {
              // 1. Delete if modified by any rule being cleared
              if (rules.some((r) => isModifiedTransactionForRule(r, tx, account.institutionId))) {
                removedTransactions.push({ ...tx, deletedAt: now })
                return false
              }

              // 2. Delete if imported by any rule being cleared
              if (tx.importedByRuleId && rules.some((r) => r.id === tx.importedByRuleId)) {
                removedTransactions.push({ ...tx, deletedAt: now })
                return false
              }

              // 3. Delete if orphaned
              if (tx.importedByRuleId && !newRules.some((r) => r.id === tx.importedByRuleId)) {
                removedTransactions.push({ ...tx, deletedAt: now })
                return false
              }

              // 4. If matching original pattern of any rule being cleared:
              const matchingRule = rules.find((r) =>
                isOriginalTransactionMatchForRule(r, tx, account.institutionId),
              )
              if (matchingRule) {
                if (tx.isDuplicate || tx.forceImport || tx.importedByRuleId) {
                  removedTransactions.push({ ...tx, deletedAt: now })
                  return false
                }
                const key = toCanonicalTransactionKey(tx)
                const count = seenRuleKeys.get(key) || 0
                seenRuleKeys.set(key, count + 1)
                if (count > 0 && tx.importedByRuleId) {
                  removedTransactions.push({ ...tx, deletedAt: now })
                  return false
                }
                return true
              }

              return true
            })
            return {
              ...account,
              transactions: filteredTxs,
            }
          })
          const reconciled = reconcileCrossAccountTransfers(updatedAccounts)
          return {
            duplicateOverrideRules: newRules,
            importedAccounts: reconciled,
            trashedTransactions: [...(state.trashedTransactions || []), ...removedTransactions],
          }
        }),

      resetDuplicateTransactions: () => {
        let removedCount = 0
        set((state) => {
          const rules = state.duplicateOverrideRules || []
          const updatedAccounts = state.importedAccounts.map((account) => {
            const seenKeys = new Map<string, number>()
            const filteredTxs = account.transactions.filter((tx) => {
              if (tx.forceImport) {
                removedCount++
                return false
              }
              if (tx.importedByRuleId) {
                const ruleExists = rules.some((r) => r.id === tx.importedByRuleId)
                if (!ruleExists) {
                  removedCount++
                  return false
                }
              }
              const key = toCanonicalTransactionKey(tx)
              const count = seenKeys.get(key) || 0
              seenKeys.set(key, count + 1)
              if (count > 0) {
                removedCount++
                return false
              }
              return true
            })
            return {
              ...account,
              transactions: filteredTxs,
            }
          })
          const reconciled = reconcileCrossAccountTransfers(updatedAccounts)
          return { importedAccounts: reconciled }
        })
        return { removedCount }
      },

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
            const stampedTxs = account.transactions.map((t) => {
              const rule = duplicateRules.find((r) => matchesDuplicateOverrideRule(r, t, account.institutionId))
              if (rule) {
                matchedRuleIds.add(rule.id)
                return { ...t, importedByRuleId: rule.id, isDuplicate: true }
              }
              if (t.forceImport) {
                return { ...t, isDuplicate: true }
              }
              return t
            })
            updatedList = [...state.importedAccounts, { ...account, transactions: stampedTxs }]
          } else {
            // Same institution already has data — merge transactions to avoid data loss.
            // Deduplicate by canonical key (date|amount|normalized description) so re-importing
            // overlapping periods or duplicate files doesn't create duplicates.
            const existing = state.importedAccounts[existingIdx]
            const existingKeys = new Set(
              existing.transactions.map(toCanonicalTransactionKey),
            )
            const newUnique: Transaction[] = []
            account.transactions.forEach((t) => {
              const rule = duplicateRules.find((r) => matchesDuplicateOverrideRule(r, t, account.institutionId))
              const isDup = Boolean(t.isDuplicate || t.forceImport || rule)
              const stampedTx: Transaction = {
                ...t,
                ...(isDup ? { isDuplicate: true } : {}),
                ...(rule ? { importedByRuleId: rule.id } : {}),
              }
              if (rule) {
                matchedRuleIds.add(rule.id)
              }
              if (t.forceImport) {
                newUnique.push(stampedTx)
                return
              }
              if (!existingKeys.has(toCanonicalTransactionKey(t))) {
                newUnique.push(stampedTx)
                return
              }
              if (rule) {
                newUnique.push(stampedTx)
              }
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
          trashedTransactions: [],
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
