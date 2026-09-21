import type { Transaction } from './transaction'

export interface ImportedAccount {
  institutionId: string
  institutionName: string
  transactions: Transaction[]
  /** Duplicated transactions imported under override rules or manual unlock without modifications. */
  duplicateTransactions?: Transaction[]
  /** Duplicated transactions that were modified before or during import. */
  modifiedTransactions?: Transaction[]
  importedAt: string
  /** All fingerprints ever imported for this institution (used for duplicate detection). */
  importedFingerprints: string[]
  /** Known IBAN(s) for this account. */
  accountIbans?: string[]
}

export type ImportMethod = 'spreadsheet' | 'pdf' | 'paste'
