export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  currency: string
  category?: string
  type: 'income' | 'expense'
  institution: string
  /** True if this transaction is an internal transfer between the user's own accounts. */
  isGhost?: boolean
  /** ID of the paired reciprocal transaction in the other account. */
  linkedTransactionId?: string
  /** Counterparty IBAN if present in the statement/row (e.g. Partner IBAN). */
  counterpartyIban?: string
  /** Own account IBAN if present in the statement/row (e.g. IBAN Kontoinhaber). */
  ownIban?: string
  /** True if the user manually unlocked this duplicate to force its import. */
  forceImport?: boolean
}

export interface DuplicateOverrideRule {
  id: string
  /** Specific institution this rule applies to, or undefined for all institutions. */
  institutionId?: string
  /** Institution display name if known, for readable UI badges. */
  institutionName?: string
  /** Description pattern or exact description from the transaction. */
  descriptionPattern: string
  /** Optional amount to match; if omitted, matches any amount with this description pattern. */
  amount?: number
  /** ISO date string when this rule was learned/created. */
  createdAt: string
  /** ISO date string when this rule was most recently matched and applied. */
  lastAppliedAt?: string
  /** Total number of times this rule was applied. */
  applyCount: number
}
