import type { StateCreator } from 'zustand'

import type { ImportedAccount, Transaction } from '../../types'
import { reconcileCrossAccountTransfers } from '../../utils/account-transfers'
import { matchesDuplicateOverrideRule, toCanonicalTransactionKey } from '../duplicate-helpers'
import type { AccountSlice, AppState } from './types'

export const createAccountSlice: StateCreator<AppState, [], [], AccountSlice> = (set) => ({
  currentStep: 'country',
  selectedCountry: null,
  selectedInstitution: null,
  importedAccounts: [],

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
        const existingCleanKeys = new Set(existing.transactions.map(toCanonicalTransactionKey))
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

  removeImportedAccount: (institutionIdOrName: string) =>
    set((state) => {
      const updated = state.importedAccounts.filter(
        (a) => a.institutionId !== institutionIdOrName && a.institutionName !== institutionIdOrName,
      )
      const reconciled = reconcileCrossAccountTransfers(updated)
      const hasRemainingAccounts = reconciled.length > 0
      const shouldResetStep =
        !hasRemainingAccounts &&
        (state.currentStep === 'dashboard' || state.currentStep === 'review')

      return {
        importedAccounts: reconciled,
        currentStep: shouldResetStep ? 'country' : state.currentStep,
        selectedCountry: shouldResetStep ? null : state.selectedCountry,
        selectedInstitution:
          shouldResetStep ||
          (state.selectedInstitution &&
            (state.selectedInstitution.id === institutionIdOrName ||
              state.selectedInstitution.name === institutionIdOrName))
            ? null
            : state.selectedInstitution,
      }
    }),
})
