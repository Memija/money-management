import type { StateCreator } from 'zustand'

import type { DuplicateOverrideRule, ImportedAccount, Transaction } from '../../types'
import { reconcileCrossAccountTransfers } from '../../utils/account-transfers'
import {
  isModifiedTransactionForRule,
  isOriginalTransactionMatchForRule,
  matchesDuplicateOverrideRule,
  sanitizeDuplicateOverrideRules,
  toCanonicalTransactionKey,
} from '../duplicate-helpers'
import type { AppState, DuplicateRuleSlice } from './types'

export const createDuplicateRuleSlice: StateCreator<AppState, [], [], DuplicateRuleSlice> = (
  set,
  get,
) => ({
  duplicateOverrideRules: [],

  addDuplicateOverrideRule: (rule) =>
    set((state) => {
      const currentRules = sanitizeDuplicateOverrideRules(state.duplicateOverrideRules)
      const pattern = (rule.descriptionPattern || '').trim()
      if (!pattern) {
        return state
      }

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
      if (!ruleToDelete) {
        return state
      }

      const shouldDeleteRule =
        mode === 'rule_only' || mode === 'both' || mode === false || mode === true
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
      const shouldDeleteRules =
        mode === 'rule_only' || mode === 'both' || mode === false || mode === true
      const shouldDeleteTransactions = mode === 'data_only' || mode === 'both' || mode === true

      const newRules = shouldDeleteRules
        ? []
        : sanitizeDuplicateOverrideRules(state.duplicateOverrideRules)

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
            if (
              rules.some((r) => isOriginalTransactionMatchForRule(r, tx, account.institutionId))
            ) {
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
      const ruleIdSet = new Set(rules.map((r) => r.id))
      const updatedAccounts = state.importedAccounts.map((account) => {
        const dups = account.duplicateTransactions || []
        const modified = account.modifiedTransactions || []
        removedCount += dups.length + modified.length
        const seenKeys = new Set<string>()
        const filteredTxs = account.transactions.filter((tx) => {
          if (tx.forceImport || tx.isDuplicate) {
            removedCount++
            return false
          }
          if (tx.importedByRuleId && !ruleIdSet.has(tx.importedByRuleId)) {
            removedCount++
            return false
          }
          const key = toCanonicalTransactionKey(tx)
          if (seenKeys.has(key)) {
            removedCount++
            return false
          }
          seenKeys.add(key)
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

  getDuplicateTransactionStats: (institutionId, transactions) => {
    const { importedAccounts, duplicateOverrideRules } = get()
    const targetAccounts =
      institutionId && institutionId !== 'unknown'
        ? importedAccounts.filter((a) => a.institutionId === institutionId)
        : importedAccounts

    if (targetAccounts.length === 0) {
      return {
        duplicateCount: 0,
        newCount: transactions.length,
        duplicateIds: [],
        alreadyDuplicatedIds: [],
      }
    }

    const cleanMatchCache = new Map<string, Transaction | null>()
    const getOriginalKeyForTx = (tx: Transaction, account: ImportedAccount): string => {
      if (
        tx.originalDescription !== undefined ||
        tx.originalAmount !== undefined ||
        tx.originalDate !== undefined
      ) {
        return toCanonicalTransactionKey({
          date: tx.originalDate ?? tx.date,
          amount: tx.originalAmount !== undefined ? tx.originalAmount : tx.amount,
          description: tx.originalDescription ?? tx.description,
        })
      }
      if (tx.importedByRuleId) {
        const rule = duplicateOverrideRules?.find((r) => r.id === tx.importedByRuleId)
        if (rule) {
          const cacheKey = `${account.institutionId || ''}|${rule.id}`
          let matchedClean = cleanMatchCache.get(cacheKey)
          if (matchedClean === undefined) {
            matchedClean =
              account.transactions.find((ct) =>
                isOriginalTransactionMatchForRule(rule, ct, account.institutionId),
              ) ?? null
            cleanMatchCache.set(cacheKey, matchedClean)
          }
          if (matchedClean) {
            return toCanonicalTransactionKey(matchedClean)
          }
          if (rule.descriptionPattern && rule.amount !== undefined) {
            return toCanonicalTransactionKey({
              date: tx.date,
              amount: rule.amount,
              description: rule.descriptionPattern,
            })
          }
        }
      }
      return toCanonicalTransactionKey(tx)
    }

    const cleanCounts = new Map<string, number>()
    const duplicateCounts = new Map<string, number>()
    const modifiedCounts = new Map<string, number>()

    for (const account of targetAccounts) {
      for (const tx of account.transactions) {
        const key = toCanonicalTransactionKey(tx)
        cleanCounts.set(key, (cleanCounts.get(key) || 0) + 1)
      }
      if (account.duplicateTransactions) {
        for (const tx of account.duplicateTransactions) {
          const key = getOriginalKeyForTx(tx, account)
          duplicateCounts.set(key, (duplicateCounts.get(key) || 0) + 1)
        }
      }
      if (account.modifiedTransactions) {
        for (const tx of account.modifiedTransactions) {
          const key = getOriginalKeyForTx(tx, account)
          modifiedCounts.set(key, (modifiedCounts.get(key) || 0) + 1)
        }
      }
    }

    const rules = duplicateOverrideRules || []
    const applicableRules = rules.filter(
      (r) =>
        !r.institutionId ||
        !institutionId ||
        r.institutionId === 'unknown' ||
        institutionId === 'unknown' ||
        r.institutionId === institutionId,
    )
    const duplicateIds: string[] = []
    const alreadyDuplicatedIds: string[] = []

    const remainingCleanCounts = new Map(cleanCounts)
    const remainingDupCounts = new Map(duplicateCounts)
    const remainingModCounts = new Map(modifiedCounts)

    for (const t of transactions) {
      const key = toCanonicalTransactionKey(t)
      const dupAvail = (remainingDupCounts.get(key) || 0) > 0
      const modAvail = (remainingModCounts.get(key) || 0) > 0
      const cleanAvail = (remainingCleanCounts.get(key) || 0) > 0

      if (dupAvail) {
        remainingDupCounts.set(key, remainingDupCounts.get(key)! - 1)
        duplicateIds.push(t.id)
        alreadyDuplicatedIds.push(t.id)
      } else if (modAvail) {
        remainingModCounts.set(key, remainingModCounts.get(key)! - 1)
        duplicateIds.push(t.id)
        alreadyDuplicatedIds.push(t.id)
      } else if (cleanAvail) {
        const isOverridden =
          applicableRules.length > 0 &&
          applicableRules.some((r) => matchesDuplicateOverrideRule(r, t, institutionId))
        if (!isOverridden) {
          duplicateIds.push(t.id)
        }
        remainingCleanCounts.set(key, remainingCleanCounts.get(key)! - 1)
      }
    }

    return {
      duplicateCount: duplicateIds.length,
      newCount: transactions.length - duplicateIds.length,
      duplicateIds,
      alreadyDuplicatedIds,
    }
  },
})
