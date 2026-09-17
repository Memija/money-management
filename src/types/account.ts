import type { Transaction } from './transaction'

export interface ImportedAccount {
  institutionId: string
  institutionName: string
  transactions: Transaction[]
  importedAt: string
  /** All fingerprints ever imported for this institution (used for duplicate detection). */
  importedFingerprints: string[]
  /** Known IBAN(s) for this account. */
  accountIbans?: string[]
}

export type ImportMethod = 'spreadsheet' | 'pdf' | 'paste'
