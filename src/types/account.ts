import type { Transaction } from './transaction';

export interface ImportedAccount {
  institutionId: string;
  institutionName: string;
  transactions: Transaction[];
  importedAt: string;
}

export type ImportMethod = 'excel' | 'csv' | 'pdf' | 'paste';
