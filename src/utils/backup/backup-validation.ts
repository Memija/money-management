import type {
  AppStep,
  Country,
  CustomCategory,
  DuplicateOverrideRule,
  FinancialInstitution,
  ImportedAccount,
} from '../../types'

export interface BackupPayloadData {
  importedAccounts: ImportedAccount[]
  customKeywords?: Record<string, string[]>
  manualCategories?: Record<string, string>
  customCategories?: CustomCategory[]
  duplicateOverrideRules?: DuplicateOverrideRule[]
  selectedCountry?: Country | null
  selectedInstitution?: FinancialInstitution | null
  currentStep?: AppStep
}

export interface SaldioBackupFile {
  version: number
  app: 'saldio'
  exportedAt: string
  data: BackupPayloadData
}

export interface ValidatedBackupResult {
  valid: true
  data: BackupPayloadData
  summary: {
    accountsCount: number
    transactionsCount: number
    exportedAt?: string
  }
}

export type BackupValidationErrorCode =
  | 'INVALID_JSON'
  | 'ROOT_NOT_OBJECT'
  | 'MISSING_ACCOUNTS'
  | 'ACCOUNT_NOT_OBJECT'
  | 'ACCOUNT_MISSING_ID'
  | 'ACCOUNT_MISSING_NAME'
  | 'ACCOUNT_MISSING_TRANSACTIONS'
  | 'ACCOUNT_INVALID_LIST'
  | 'TRANSACTION_NOT_OBJECT'
  | 'TRANSACTION_MISSING_ID'
  | 'TRANSACTION_MISSING_DATE'
  | 'TRANSACTION_INVALID_AMOUNT'
  | 'TRANSACTION_INVALID_DESCRIPTION'
  | 'TRANSACTION_MISSING_CURRENCY'
  | 'TRANSACTION_INVALID_TYPE'
  | 'CUSTOM_CATEGORIES_INVALID'
  | 'DUPLICATE_RULES_INVALID'

export interface BackupValidationErrorDetail {
  code: BackupValidationErrorCode
  params?: Record<string, string | number>
}

export interface InvalidBackupResult {
  valid: false
  error: string
  errorDetail?: BackupValidationErrorDetail
}

export type BackupValidationResult = ValidatedBackupResult | InvalidBackupResult

export interface ValidationErrorInfo {
  message: string
  detail: BackupValidationErrorDetail
}

export const validateTransaction = (
  rawTx: unknown,
  accountName: string,
  txIndex: number,
  listName: string = 'transactions',
): ValidationErrorInfo | null => {
  if (!rawTx || typeof rawTx !== 'object') {
    return {
      message: `Transaction #${txIndex + 1} in "${accountName}" (${listName}) is not a valid object.`,
      detail: {
        code: 'TRANSACTION_NOT_OBJECT',
        params: { index: txIndex + 1, account: accountName, list: listName },
      },
    }
  }

  const tx = rawTx as Record<string, unknown>

  if (typeof tx.id !== 'string' || !tx.id.trim()) {
    return {
      message: `Transaction #${txIndex + 1} in "${accountName}" (${listName}) is missing a valid 'id'.`,
      detail: {
        code: 'TRANSACTION_MISSING_ID',
        params: { index: txIndex + 1, account: accountName, list: listName },
      },
    }
  }

  const id = tx.id

  if (typeof tx.date !== 'string' || !tx.date.trim()) {
    return {
      message: `Transaction "${id}" in "${accountName}" is missing a valid 'date'.`,
      detail: { code: 'TRANSACTION_MISSING_DATE', params: { id, account: accountName } },
    }
  }

  if (typeof tx.amount !== 'number' || !Number.isFinite(tx.amount)) {
    return {
      message: `Transaction "${id}" in "${accountName}" has an invalid 'amount'.`,
      detail: { code: 'TRANSACTION_INVALID_AMOUNT', params: { id, account: accountName } },
    }
  }

  if (typeof tx.description !== 'string') {
    return {
      message: `Transaction "${id}" in "${accountName}" has an invalid 'description'.`,
      detail: { code: 'TRANSACTION_INVALID_DESCRIPTION', params: { id, account: accountName } },
    }
  }

  if (typeof tx.currency !== 'string' || !tx.currency.trim()) {
    return {
      message: `Transaction "${id}" in "${accountName}" is missing a valid 'currency'.`,
      detail: { code: 'TRANSACTION_MISSING_CURRENCY', params: { id, account: accountName } },
    }
  }

  if (tx.type !== 'income' && tx.type !== 'expense') {
    return {
      message: `Transaction "${id}" in "${accountName}" has an invalid 'type' (must be 'income' or 'expense').`,
      detail: { code: 'TRANSACTION_INVALID_TYPE', params: { id, account: accountName } },
    }
  }

  return null
}

export const validateAccount = (rawAcc: unknown, accIndex: number): ValidationErrorInfo | null => {
  if (!rawAcc || typeof rawAcc !== 'object') {
    return {
      message: `Account #${accIndex + 1} is not a valid object.`,
      detail: { code: 'ACCOUNT_NOT_OBJECT', params: { index: accIndex + 1 } },
    }
  }

  const acc = rawAcc as Record<string, unknown>
  const name =
    typeof acc.institutionName === 'string' && acc.institutionName.trim()
      ? acc.institutionName
      : `Account #${accIndex + 1}`

  if (typeof acc.institutionId !== 'string' || !acc.institutionId.trim()) {
    return {
      message: `Account "${name}" is missing a valid 'institutionId'.`,
      detail: { code: 'ACCOUNT_MISSING_ID', params: { account: name } },
    }
  }

  if (typeof acc.institutionName !== 'string' || !acc.institutionName.trim()) {
    return {
      message: `Account #${accIndex + 1} is missing a valid 'institutionName'.`,
      detail: { code: 'ACCOUNT_MISSING_NAME', params: { index: accIndex + 1 } },
    }
  }

  if (!Array.isArray(acc.transactions)) {
    return {
      message: `Account "${name}" is missing a 'transactions' list.`,
      detail: { code: 'ACCOUNT_MISSING_TRANSACTIONS', params: { account: name } },
    }
  }

  for (let i = 0; i < acc.transactions.length; i++) {
    const err = validateTransaction(acc.transactions[i], name, i, 'transactions')
    if (err) {
      return err
    }
  }

  if (acc.duplicateTransactions !== undefined) {
    if (!Array.isArray(acc.duplicateTransactions)) {
      return {
        message: `Account "${name}" has an invalid 'duplicateTransactions' list.`,
        detail: {
          code: 'ACCOUNT_INVALID_LIST',
          params: { account: name, list: 'duplicateTransactions' },
        },
      }
    }
    for (let i = 0; i < acc.duplicateTransactions.length; i++) {
      const err = validateTransaction(
        acc.duplicateTransactions[i],
        name,
        i,
        'duplicateTransactions',
      )
      if (err) {
        return err
      }
    }
  }

  if (acc.modifiedTransactions !== undefined) {
    if (!Array.isArray(acc.modifiedTransactions)) {
      return {
        message: `Account "${name}" has an invalid 'modifiedTransactions' list.`,
        detail: {
          code: 'ACCOUNT_INVALID_LIST',
          params: { account: name, list: 'modifiedTransactions' },
        },
      }
    }
    for (let i = 0; i < acc.modifiedTransactions.length; i++) {
      const err = validateTransaction(acc.modifiedTransactions[i], name, i, 'modifiedTransactions')
      if (err) {
        return err
      }
    }
  }

  return null
}

/**
 * Validates whether an uploaded string is a valid Saldio JSON backup.
 * Strictly verifies accounts and transactions schemas to prevent corrupted state.
 */
export const parseAndValidateBackup = (jsonString: string): BackupValidationResult => {
  try {
    const parsed = JSON.parse(jsonString) as unknown

    if (!parsed || typeof parsed !== 'object') {
      return {
        valid: false,
        error: 'Invalid JSON payload: root must be an object',
        errorDetail: { code: 'ROOT_NOT_OBJECT' },
      }
    }

    const candidate = parsed as Record<string, unknown>
    let dataPayload: BackupPayloadData | null = null
    let exportedAt: string | undefined

    if (candidate.app === 'saldio' && candidate.data && typeof candidate.data === 'object') {
      dataPayload = candidate.data as BackupPayloadData
      if (typeof candidate.exportedAt === 'string') {
        exportedAt = candidate.exportedAt
      }
    } else if (Array.isArray(candidate.importedAccounts)) {
      dataPayload = candidate as unknown as BackupPayloadData
    }

    if (!dataPayload || !Array.isArray(dataPayload.importedAccounts)) {
      return {
        valid: false,
        error: 'Missing or invalid "importedAccounts" array',
        errorDetail: { code: 'MISSING_ACCOUNTS' },
      }
    }

    for (let i = 0; i < dataPayload.importedAccounts.length; i++) {
      const accErr = validateAccount(dataPayload.importedAccounts[i], i)
      if (accErr) {
        return { valid: false, error: accErr.message, errorDetail: accErr.detail }
      }
    }

    if (dataPayload.customCategories !== undefined) {
      if (!Array.isArray(dataPayload.customCategories)) {
        return {
          valid: false,
          error: '"customCategories" must be an array',
          errorDetail: { code: 'CUSTOM_CATEGORIES_INVALID' },
        }
      }
      for (let i = 0; i < dataPayload.customCategories.length; i++) {
        const cat = dataPayload.customCategories[i] as unknown
        if (
          !cat ||
          typeof cat !== 'object' ||
          typeof (cat as Record<string, unknown>).id !== 'string'
        ) {
          return {
            valid: false,
            error: `Custom category #${i + 1} is missing a valid 'id'`,
            errorDetail: { code: 'CUSTOM_CATEGORIES_INVALID', params: { index: i + 1 } },
          }
        }
      }
    }

    if (dataPayload.duplicateOverrideRules !== undefined) {
      if (!Array.isArray(dataPayload.duplicateOverrideRules)) {
        return {
          valid: false,
          error: '"duplicateOverrideRules" must be an array',
          errorDetail: { code: 'DUPLICATE_RULES_INVALID' },
        }
      }
      for (let i = 0; i < dataPayload.duplicateOverrideRules.length; i++) {
        const rule = dataPayload.duplicateOverrideRules[i] as unknown
        if (
          !rule ||
          typeof rule !== 'object' ||
          typeof (rule as Record<string, unknown>).id !== 'string'
        ) {
          return {
            valid: false,
            error: `Duplicate override rule #${i + 1} is missing a valid 'id'`,
            errorDetail: { code: 'DUPLICATE_RULES_INVALID', params: { index: i + 1 } },
          }
        }
      }
    }

    const accountsCount = dataPayload.importedAccounts.length
    const transactionsCount = dataPayload.importedAccounts.reduce(
      (sum, acc) =>
        sum +
        (acc.transactions?.length || 0) +
        (acc.duplicateTransactions?.length || 0) +
        (acc.modifiedTransactions?.length || 0),
      0,
    )

    return {
      valid: true,
      data: dataPayload,
      summary: {
        accountsCount,
        transactionsCount,
        exportedAt,
      },
    }
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Invalid JSON file',
      errorDetail: { code: 'INVALID_JSON' },
    }
  }
}
