import type { CustomCategory, ImportedAccount, Transaction } from '../types'
import {
  categorize,
  extractCleanDescription,
  isInformativeTransaction,
  isPaymentProcessorOnly,
  propagateLoanCategories,
} from '../utils/category-utils'

export const sanitizeCustomKeywords = (
  keywords?: Record<string, string[]>,
): Record<string, string[]> => {
  if (!keywords || typeof keywords !== 'object') {
    return {}
  }
  const sanitized: Record<string, string[]> = {}
  for (const [category, words] of Object.entries(keywords)) {
    if (!Array.isArray(words)) {
      continue
    }
    const cleaned = words.filter(
      (w) => typeof w === 'string' && w.trim().length >= 2 && !isPaymentProcessorOnly(w),
    )
    if (cleaned.length > 0) {
      sanitized[category] = cleaned
    }
  }
  return sanitized
}

export const sanitizeManualCategories = (
  manualCategories?: Record<string, string>,
  importedAccounts?: ImportedAccount[],
): Record<string, string> => {
  if (!manualCategories || typeof manualCategories !== 'object') {
    return {}
  }
  if (!importedAccounts || !Array.isArray(importedAccounts) || importedAccounts.length === 0) {
    return manualCategories
  }

  const txMap = new Map<string, Transaction>()
  for (const acc of importedAccounts) {
    for (const tx of acc.transactions || []) {
      txMap.set(tx.id, tx)
    }
    for (const tx of acc.duplicateTransactions || []) {
      txMap.set(tx.id, tx)
    }
    for (const tx of acc.modifiedTransactions || []) {
      txMap.set(tx.id, tx)
    }
  }

  const cleaned: Record<string, string> = {}
  for (const [txId, cat] of Object.entries(manualCategories)) {
    const tx = txMap.get(txId)
    if (tx) {
      const cleanDesc = extractCleanDescription(tx.description)
      if (cat === 'Transport' && isPaymentProcessorOnly(cleanDesc)) {
        continue
      }
    }
    cleaned[txId] = cat
  }
  return cleaned
}

/**
 * Automatically re-evaluates all stored unedited transactions against the latest
 * categorization rules, strictly preserving all manual user category overrides.
 */
export function recategorizeAccounts(
  accounts: ImportedAccount[],
  manualCategories?: Record<string, string>,
  customKeywords?: Record<string, string[]>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _customCategories?: CustomCategory[],
): { accounts: ImportedAccount[]; changed: boolean } {
  let changed = false
  const updatedAccounts = accounts.map((account) => {
    let accountChanged = false
    const recatList = (txs?: Transaction[]) => {
      if (!txs) {
        return txs
      }
      return txs.map((tx) => {
        if (isInformativeTransaction(tx)) {
          return tx
        }
        // Preserve manual user categories
        if (manualCategories && manualCategories[tx.id]) {
          return tx
        }
        // Preserve user-modified items with explicit category
        if (tx.isModified && tx.category) {
          return tx
        }

        const newCategory = categorize(tx.description, {
          customKeywords,
          amount: tx.amount,
          type: tx.type,
          partner: tx.partner,
        })

        if (newCategory !== tx.category) {
          accountChanged = true
          changed = true
          return { ...tx, category: newCategory }
        }
        return tx
      })
    }

    const rawTxs = recatList(account.transactions) || []
    const newTransactions = propagateLoanCategories(rawTxs, manualCategories)
    if (newTransactions !== rawTxs) {
      accountChanged = true
      changed = true
    }

    const rawDups = recatList(account.duplicateTransactions)
    const newDuplicates = rawDups ? propagateLoanCategories(rawDups, manualCategories) : undefined
    if (newDuplicates && newDuplicates !== rawDups) {
      accountChanged = true
      changed = true
    }

    const rawMod = recatList(account.modifiedTransactions)
    const newModified = rawMod ? propagateLoanCategories(rawMod, manualCategories) : undefined
    if (newModified && newModified !== rawMod) {
      accountChanged = true
      changed = true
    }

    if (!accountChanged) {
      return account
    }
    return {
      ...account,
      transactions: newTransactions,
      duplicateTransactions: newDuplicates,
      modifiedTransactions: newModified,
    }
  })

  return { accounts: changed ? updatedAccounts : accounts, changed }
}

/**
 * Backwards-compatible delegate for historical migrations.
 */
export function migrateHealthInsuranceCategories(accounts: ImportedAccount[]): ImportedAccount[] {
  return recategorizeAccounts(accounts).accounts
}
