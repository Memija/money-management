import type { Transaction } from '../types'
import {
  extractCleanDescription,
  getTransactionMerchant,
  isInformativeTransaction,
  isPaymentProcessorOnly,
  isRelatedTransaction,
} from './categorizer/description-cleaning'

/**
 * Propagates high-confidence loan categories across related transactions sharing the same merchant or payee.
 * If one transaction contains an explicit loan keyword (e.g. 'Kreditrate', 'Darlehen', 'Tilgung', loan account memo)
 * and is categorized as 'Loans', sibling transactions sharing the same cleaned merchant or payee prefix whose
 * category would otherwise default to 'Transfers' or 'Other' (because the bank stripped the remittance memo)
 * are also correctly classified as 'Loans'.
 */
export function propagateLoanCategories<T extends Transaction>(
  transactions: T[],
  manualCategories?: Record<string, string>,
): T[] {
  if (!transactions || transactions.length === 0) {
    return transactions
  }

  // 1. Identify all merchants / payees associated with explicit loan payments
  const loanMerchants = new Set<string>()
  const loanCleanDescriptions = new Set<string>()
  const loanRawDescriptions: string[] = []

  for (const tx of transactions) {
    if (isInformativeTransaction(tx)) {
      continue
    }
    const cat = tx.category
    const desc = tx.description || ''
    const isExplicitLoan =
      cat === 'Loans' || /\b(?:kreditrate|kredit-rate|darlehen|tilgung|annuit[aä]t)\b/i.test(desc)

    if (isExplicitLoan) {
      loanRawDescriptions.push(desc)
      const merchant = getTransactionMerchant(tx)
      if (merchant && !isPaymentProcessorOnly(merchant)) {
        loanMerchants.add(merchant.toLowerCase())
      }
      const cleanDesc = extractCleanDescription(desc)
      if (cleanDesc && !isPaymentProcessorOnly(cleanDesc)) {
        loanCleanDescriptions.add(cleanDesc.toLowerCase())
      }
    }
  }

  if (loanMerchants.size === 0 && loanCleanDescriptions.size === 0) {
    return transactions
  }

  // 2. Propagate 'Loans' to sibling transactions with stripped memos
  let hasChanges = false
  const updated = transactions.map((tx) => {
    if (isInformativeTransaction(tx)) {
      return tx
    }
    if (manualCategories && manualCategories[tx.id]) {
      return tx
    }
    if (tx.isModified && tx.category) {
      return tx
    }
    if (tx.category === 'Loans') {
      return tx
    }

    // Only update transactions that defaulted to 'Transfers', 'Other', or unassigned
    if (tx.category && tx.category !== 'Transfers' && tx.category !== 'Other') {
      return tx
    }

    const merchant = getTransactionMerchant(tx).toLowerCase()
    const cleanDesc = extractCleanDescription(tx.description || '').toLowerCase()

    const matchesMerchant = merchant && loanMerchants.has(merchant)
    const matchesCleanDesc = cleanDesc && loanCleanDescriptions.has(cleanDesc)
    const matchesRelated =
      !matchesMerchant &&
      !matchesCleanDesc &&
      loanRawDescriptions.some((rawDesc) => isRelatedTransaction(rawDesc, tx.description || ''))

    if (matchesMerchant || matchesCleanDesc || matchesRelated) {
      hasChanges = true
      return { ...tx, category: 'Loans' }
    }

    return tx
  })

  return hasChanges ? updated : transactions
}
