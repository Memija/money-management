import type { TranslationStrings } from '../../i18n/types'
import type { InvalidBackupResult } from './backup-validation'

export * from './backup-validation'

/**
 * Localizes a backup validation error using the provided translation strings.
 */
export const formatBackupError = (result: InvalidBackupResult, t?: TranslationStrings): string => {
  if (!t || !result.errorDetail) {
    return result.error
  }

  const { code, params = {} } = result.errorDetail

  let template: string | undefined
  switch (code) {
    case 'INVALID_JSON':
      template = t.restoreBackupErrorInvalidJson
      break
    case 'ROOT_NOT_OBJECT':
      template = t.restoreBackupErrorRootObject
      break
    case 'MISSING_ACCOUNTS':
      template = t.restoreBackupErrorMissingAccounts
      break
    case 'ACCOUNT_NOT_OBJECT':
      template = t.restoreBackupErrorAccountInvalid
      break
    case 'ACCOUNT_MISSING_ID':
      template = t.restoreBackupErrorAccountMissingId
      break
    case 'ACCOUNT_MISSING_NAME':
      template = t.restoreBackupErrorAccountMissingName
      break
    case 'ACCOUNT_MISSING_TRANSACTIONS':
      template = t.restoreBackupErrorAccountMissingTransactions
      break
    case 'ACCOUNT_INVALID_LIST':
      template = t.restoreBackupErrorAccountInvalidList
      break
    case 'TRANSACTION_NOT_OBJECT':
      template = t.restoreBackupErrorTxInvalid
      break
    case 'TRANSACTION_MISSING_ID':
      template = t.restoreBackupErrorTxMissingId
      break
    case 'TRANSACTION_MISSING_DATE':
      template = t.restoreBackupErrorTxMissingDate
      break
    case 'TRANSACTION_INVALID_AMOUNT':
      template = t.restoreBackupErrorTxInvalidAmount
      break
    case 'TRANSACTION_INVALID_DESCRIPTION':
      template = t.restoreBackupErrorTxInvalidDescription
      break
    case 'TRANSACTION_MISSING_CURRENCY':
      template = t.restoreBackupErrorTxMissingCurrency
      break
    case 'TRANSACTION_INVALID_TYPE':
      template = t.restoreBackupErrorTxInvalidType
      break
    case 'CUSTOM_CATEGORIES_INVALID':
      template = t.restoreBackupErrorCustomCategories
      break
    case 'DUPLICATE_RULES_INVALID':
      template = t.restoreBackupErrorDuplicateRules
      break
  }

  if (!template) {
    return result.error
  }

  let formatted = template
  for (const [key, val] of Object.entries(params)) {
    formatted = formatted.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val))
  }

  return formatted
}
