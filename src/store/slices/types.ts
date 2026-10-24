import type {
  AppStep,
  Country,
  CustomCategory,
  DuplicateDeleteMode,
  DuplicateOverrideRule,
  FinancialInstitution,
  ImportedAccount,
  Transaction,
} from '../../types'

export interface AccountSlice {
  currentStep: AppStep
  selectedCountry: Country | null
  selectedInstitution: FinancialInstitution | null
  importedAccounts: ImportedAccount[]

  setStep: (step: AppStep) => void
  selectCountry: (country: Country) => void
  selectInstitution: (institution: FinancialInstitution) => void
  addImportedAccount: (account: ImportedAccount) => void
  replaceImportedAccount: (account: ImportedAccount) => void
  resetImport: () => void
  cancelImport: () => void
  startNewInstitution: () => void
  removeImportedAccount: (institutionIdOrName: string) => void
}

export interface DuplicateRuleSlice {
  duplicateOverrideRules: DuplicateOverrideRule[]

  addDuplicateOverrideRule: (
    rule: Omit<DuplicateOverrideRule, 'id' | 'createdAt' | 'applyCount'> & {
      id?: string
      createdAt?: string
      applyCount?: number
    },
  ) => void
  removeDuplicateOverrideRule: (id: string, mode?: boolean | DuplicateDeleteMode) => void
  clearDuplicateOverrideRules: (mode?: boolean | DuplicateDeleteMode) => void
  getDuplicateTransactionStats: (
    institutionId: string,
    transactions: Transaction[],
  ) => {
    duplicateCount: number
    newCount: number
    duplicateIds: string[]
    alreadyDuplicatedIds: string[]
  }
  resetDuplicateTransactions: () => { removedCount: number }
}

export interface CategorySlice {
  customKeywords: Record<string, string[]>
  manualCategories: Record<string, string>
  customCategories: CustomCategory[]
  appliedCategorizerVersion?: number

  setCustomKeywords: (category: string, keywords: string[]) => void
  setManualCategory: (transactionId: string, category: string) => void
  setManualCategoriesBulk: (mapping: Record<string, string>) => void
  addCustomCategory: (category: CustomCategory) => void
  updateCustomCategory: (category: CustomCategory) => void
  deleteCustomCategory: (id: string) => void
  autoRecategorizeUneditedTransactions: (force?: boolean) => void
  migrateHealthInsurance: () => void
}

export interface UISlice {
  filterTransactionsWithoutLogos: boolean
  detachTransactionsFromDashboard: boolean

  setFilterTransactionsWithoutLogos: (enabled: boolean) => void
  setDetachTransactionsFromDashboard: (detach: boolean) => void
  clearAllData: (resetPreferences?: boolean) => void
}

export type AppState = AccountSlice & DuplicateRuleSlice & CategorySlice & UISlice
