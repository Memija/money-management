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
