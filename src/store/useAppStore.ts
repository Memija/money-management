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
    if (!txDesc.includes(modDesc) && modDesc !== txDesc) {
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
  return txDesc.includes(origPattern) || origPattern === txDesc
}

export const sanitizeDuplicateOverrideRules = (
  rules?: DuplicateOverrideRule[],
): DuplicateOverrideRule[] => {
  if (!Array.isArray(rules)) return []
  const seenIds = new Set<string>()
  return rules
    .filter((r): r is DuplicateOverrideRule => Boolean(r && typeof r === 'object'))
    .map((rule, idx) => {
      let id = typeof rule.id === 'string' && rule.id.trim().length > 0 ? rule.id.trim() : ''
      if (!id || seenIds.has(id)) {
        id = `drule_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`
      }
      seenIds.add(id)
      return {
        ...rule,
        id,
        descriptionPattern: (rule.descriptionPattern || '').trim(),
        createdAt:
          rule.createdAt && !isNaN(new Date(rule.createdAt).getTime())
            ? rule.createdAt
            : new Date().toISOString(),
        applyCount: typeof rule.applyCount === 'number' && rule.applyCount > 0 ? rule.applyCount : 1,
      }
    })
}

export const countDuplicateTransactionsInAccounts = (
  importedAccounts: ImportedAccount[],
  duplicateOverrideRules: DuplicateOverrideRule[] = [],
): number => {
  let count = 0
  for (const account of importedAccounts) {
    if (account.duplicateTransactions?.length) {
      count += account.duplicateTransactions.length
    }
    if (account.modifiedTransactions?.length) {
      count += account.modifiedTransactions.length
    }
    for (const tx of account.transactions) {
      if (tx.forceImport || tx.isDuplicate) {
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
          const currentRules = sanitizeDuplicateOverrideRules(state.duplicateOverrideRules)
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
            const existingId =
              existing.id ||
              (typeof rule.id === 'string' && rule.id.trim().length > 0 ? rule.id.trim() : '') ||
              `drule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
            updated[existingIdx] = {
              ...existing,
              id: existingId,
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
            return { duplicateOverrideRules: sanitizeDuplicateOverrideRules(updated) }
          }

          const newRule: DuplicateOverrideRule = {
            id:
              typeof rule.id === 'string' && rule.id.trim().length > 0
                ? rule.id.trim()
                : `drule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            institutionId: rule.institutionId,
            institutionName: rule.institutionName,
            descriptionPattern: pattern,
            amount: rule.amount,
            createdAt:
              rule.createdAt && !isNaN(new Date(rule.createdAt).getTime())
                ? rule.createdAt
                : new Date().toISOString(),
            lastAppliedAt:
              rule.lastAppliedAt && !isNaN(new Date(rule.lastAppliedAt).getTime())
                ? rule.lastAppliedAt
                : new Date().toISOString(),
            applyCount: rule.applyCount ?? 1,
            modifications: rule.modifications,
          }

          return {
            duplicateOverrideRules: sanitizeDuplicateOverrideRules([newRule, ...currentRules]),
          }
        }),

      removeDuplicateOverrideRule: (id, mode = 'both') =>
        set((state) => {
          if (!id || typeof id !== 'string' || !id.trim()) {
            return state
          }
          const targetId = id.trim()
          const currentRules = sanitizeDuplicateOverrideRules(state.duplicateOverrideRules)
          const ruleToDelete = currentRules.find((r) => r.id === targetId)
          if (!ruleToDelete) return state

          const shouldDeleteRule = mode === 'rule_only' || mode === 'both' || mode === false || mode === true
          const shouldDeleteTransactions = mode === 'data_only' || mode === 'both' || mode === true

          const newRules = shouldDeleteRule
            ? currentRules.filter((r) => r.id !== targetId)
            : currentRules

          if (!shouldDeleteTransactions) {
            return { duplicateOverrideRules: newRules }
          }

          const updatedAccounts = state.importedAccounts.map((account) => {
            const isTargetAccount =
              !ruleToDelete.institutionId ||
              ruleToDelete.institutionId === 'unknown' ||
              account.institutionId === 'unknown' ||
              account.institutionId === ruleToDelete.institutionId

            if (!isTargetAccount) {
              return account
            }

            const shouldDeleteTx = (tx: Transaction): boolean => {
              if (tx.importedByRuleId === targetId) {
                return true
              }
              if (tx.importedByRuleId && tx.importedByRuleId !== targetId) {
                return false
              }
              if (tx.isDuplicate || tx.forceImport) {
                if (isModifiedTransactionForRule(ruleToDelete, tx, account.institutionId)) {
                  return true
                }
                if (isOriginalTransactionMatchForRule(ruleToDelete, tx, account.institutionId)) {
                  return true
                }
              }
              return false
            }

            // Completely remove matching transactions from duplicateTransactions (no trash)
            const filteredDuplicates = (account.duplicateTransactions || []).filter(
              (tx) => !shouldDeleteTx(tx),
            )

            const filteredModified = (account.modifiedTransactions || []).filter(
              (tx) => !shouldDeleteTx(tx),
            )

            // Clean any legacy duplicates in account.transactions if present
            const filteredClean = account.transactions.filter((tx) => !shouldDeleteTx(tx))

            return {
              ...account,
              transactions: filteredClean,
              duplicateTransactions: filteredDuplicates.length > 0 ? filteredDuplicates : undefined,
              modifiedTransactions: filteredModified.length > 0 ? filteredModified : undefined,
            }
          })

          const reconciled = reconcileCrossAccountTransfers(updatedAccounts)
          return {
            duplicateOverrideRules: newRules,
            importedAccounts: reconciled,
          }
        }),

      clearDuplicateOverrideRules: (mode = 'both') =>
        set((state) => {
          const shouldDeleteRules = mode === 'rule_only' || mode === 'both' || mode === false || mode === true
          const shouldDeleteTransactions = mode === 'data_only' || mode === 'both' || mode === true

          const newRules = shouldDeleteRules ? [] : sanitizeDuplicateOverrideRules(state.duplicateOverrideRules)

          if (!shouldDeleteTransactions) {
            return { duplicateOverrideRules: newRules }
          }

          const rules = sanitizeDuplicateOverrideRules(state.duplicateOverrideRules)
          const updatedAccounts = state.importedAccounts.map((account) => {
            const shouldDeleteTx = (tx: Transaction): boolean => {
              if (tx.importedByRuleId && rules.some((r) => r.id === tx.importedByRuleId)) {
                return true
              }
              if (tx.isDuplicate || tx.forceImport) {
                if (rules.some((r) => isModifiedTransactionForRule(r, tx, account.institutionId))) {
                  return true
                }
                if (rules.some((r) => isOriginalTransactionMatchForRule(r, tx, account.institutionId))) {
                  return true
                }
              }
              return false
            }

            const filteredDuplicates = (account.duplicateTransactions || []).filter(
              (tx) => !shouldDeleteTx(tx),
            )

            const filteredModified = (account.modifiedTransactions || []).filter(
              (tx) => !shouldDeleteTx(tx),
            )

            const filteredClean = account.transactions.filter((tx) => !shouldDeleteTx(tx))

            return {
              ...account,
              transactions: filteredClean,
              duplicateTransactions: filteredDuplicates.length > 0 ? filteredDuplicates : undefined,
              modifiedTransactions: filteredModified.length > 0 ? filteredModified : undefined,
            }
          })
          const reconciled = reconcileCrossAccountTransfers(updatedAccounts)
          return {
            duplicateOverrideRules: newRules,
            importedAccounts: reconciled,
          }
        }),

      resetDuplicateTransactions: () => {
        let removedCount = 0
        set((state) => {
          const rules = state.duplicateOverrideRules || []
          const updatedAccounts = state.importedAccounts.map((account) => {
            const dups = account.duplicateTransactions || []
            const modified = account.modifiedTransactions || []
            removedCount += dups.length + modified.length
            const seenKeys = new Map<string, number>()
            const filteredTxs = account.transactions.filter((tx) => {
              if (tx.forceImport || tx.isDuplicate) {
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
              duplicateTransactions: [],
              modifiedTransactions: [],
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
            const cleanTxs: Transaction[] = []
            const dupTxs: Transaction[] = []
            const modTxs: Transaction[] = []
            const seenIds = new Set<string>()

            const ensureUniqueId = (tx: Transaction): Transaction => {
              if (seenIds.has(tx.id)) {
                const uniqueId = `${tx.id}_dup_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
                seenIds.add(uniqueId)
                return { ...tx, id: uniqueId }
              }
              seenIds.add(tx.id)
              return tx
            }

            account.transactions.forEach((t) => {
              if (t.forceImport || t.isDuplicate) {
                if (t.isModified) {
                  modTxs.push(ensureUniqueId({ ...t, isDuplicate: true, isModified: true }))
                } else {
                  dupTxs.push(ensureUniqueId({ ...t, isDuplicate: true, isModified: false }))
                }
                return
              }
              cleanTxs.push(ensureUniqueId(t))
            })

            ;(account.duplicateTransactions || []).forEach((t) => {
              if (t.isModified) {
                modTxs.push(ensureUniqueId({ ...t, isDuplicate: true, isModified: true }))
              } else {
                dupTxs.push(ensureUniqueId({ ...t, isDuplicate: true, isModified: false }))
              }
            })

            ;(account.modifiedTransactions || []).forEach((t) => {
              modTxs.push(ensureUniqueId({ ...t, isDuplicate: true, isModified: true }))
            })

            updatedList = [
              ...state.importedAccounts,
              {
                ...account,
                transactions: cleanTxs,
                duplicateTransactions: dupTxs.length > 0 ? dupTxs : undefined,
                modifiedTransactions: modTxs.length > 0 ? modTxs : undefined,
              },
            ]
          } else {
            // Same institution already has data — merge transactions.
            const existing = state.importedAccounts[existingIdx]
            const existingCleanKeys = new Set(
              existing.transactions.map(toCanonicalTransactionKey),
            )
            const existingDupKeys = new Set([
              ...(existing.duplicateTransactions || []).map(toCanonicalTransactionKey),
              ...(existing.modifiedTransactions || []).map(toCanonicalTransactionKey),
            ])

            const seenIds = new Set<string>([
              ...existing.transactions.map((t) => t.id),
              ...(existing.duplicateTransactions || []).map((t) => t.id),
              ...(existing.modifiedTransactions || []).map((t) => t.id),
            ])

            const ensureUniqueId = (tx: Transaction): Transaction => {
              if (seenIds.has(tx.id)) {
                const uniqueId = `${tx.id}_dup_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
                seenIds.add(uniqueId)
                return { ...tx, id: uniqueId }
              }
              seenIds.add(tx.id)
              return tx
            }

            const newClean: Transaction[] = []
            const newDups: Transaction[] = [...(existing.duplicateTransactions || [])]
            const newModified: Transaction[] = [...(existing.modifiedTransactions || [])]

            // 1. Incorporate incoming duplicateTransactions
            if (account.duplicateTransactions) {
              account.duplicateTransactions.forEach((t) => {
                const rule = duplicateRules.find((r) =>
                  matchesDuplicateOverrideRule(r, t, account.institutionId),
                )
                if (rule) {
                  matchedRuleIds.add(rule.id)
                }
                const item = ensureUniqueId({
                  ...t,
                  isDuplicate: true,
                  isModified: t.isModified ?? false,
                  ...(rule && !t.importedByRuleId ? { importedByRuleId: rule.id } : {}),
                })
                if (item.isModified) {
                  newModified.push(item)
                } else {
                  newDups.push(item)
                }
              })
            }

            // 2. Incorporate incoming modifiedTransactions
            if (account.modifiedTransactions) {
              account.modifiedTransactions.forEach((t) => {
                const rule = duplicateRules.find((r) =>
                  matchesDuplicateOverrideRule(r, t, account.institutionId),
                )
                if (rule) {
                  matchedRuleIds.add(rule.id)
                }
                newModified.push(
                  ensureUniqueId({
                    ...t,
                    isDuplicate: true,
                    isModified: true,
                    ...(rule && !t.importedByRuleId ? { importedByRuleId: rule.id } : {}),
                  }),
                )
              })
            }

            // 3. Incorporate incoming account.transactions
            account.transactions.forEach((t) => {
              const isDuplicateOfExisting =
                existingCleanKeys.has(toCanonicalTransactionKey(t)) ||
                existingDupKeys.has(toCanonicalTransactionKey(t))

              if (isDuplicateOfExisting || t.isDuplicate || t.forceImport) {
                const rule = duplicateRules.find((r) =>
                  matchesDuplicateOverrideRule(r, t, account.institutionId),
                )
                if (rule) {
                  matchedRuleIds.add(rule.id)
                }
                const item = ensureUniqueId({
                  ...t,
                  isDuplicate: true,
                  isModified: t.isModified ?? false,
                  ...(rule && !t.importedByRuleId ? { importedByRuleId: rule.id } : {}),
                })
                if (item.isModified) {
                  newModified.push(item)
                } else {
                  newDups.push(item)
                }
                return
              }

              // Unique non-duplicate clean transaction
              newClean.push(ensureUniqueId(t))
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
              transactions: [...existing.transactions, ...newClean],
              duplicateTransactions: newDups.length > 0 ? newDups : undefined,
              modifiedTransactions: newModified.length > 0 ? newModified : undefined,
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
          if (account.duplicateTransactions) {
            for (const tx of account.duplicateTransactions) {
              existingKeys.add(toCanonicalTransactionKey(tx))
            }
          }
          if (account.modifiedTransactions) {
            for (const tx of account.modifiedTransactions) {
              existingKeys.add(toCanonicalTransactionKey(tx))
            }
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
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.duplicateOverrideRules)) {
          state.duplicateOverrideRules = sanitizeDuplicateOverrideRules(state.duplicateOverrideRules)
        }
      },
    },
  ),
)
