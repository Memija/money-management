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
  /** Sub-account or space name if this transaction is associated with a sub-account (e.g. 'Investment fund', 'Notgroschen'). */
  subAccount?: string
  /** True if the user manually unlocked this duplicate to force its import. */
  forceImport?: boolean
  /** ID of the duplicate override rule that permitted importing this transaction. */
  importedByRuleId?: string
  /** True if this transaction was imported as a duplicate override. */
  isDuplicate?: boolean
  /** True if this transaction was modified compared to the original duplicate before/during import. */
  isModified?: boolean
  /** Original description before modification if this was an edited duplicate. */
  originalDescription?: string
  /** Original amount before modification if this was an edited duplicate. */
  originalAmount?: number
  /** Original date before modification if this was an edited duplicate. */
  originalDate?: string
}

export interface RuleModifications {
  description?: string
  amount?: number
  category?: string
  date?: string
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
  /** Modifications applied to matching transactions (e.g. adjusted amount, category, description). */
  modifications?: RuleModifications
}

export type DuplicateDeleteMode = 'both' | 'rule_only' | 'data_only'
