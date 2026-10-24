import React from 'react'
import { Ban, Ghost, Layers, Lock } from 'lucide-react'

import type { TranslationStrings } from '../../../i18n/types'
import type { Transaction } from '../../../types'
import type { ScopeFilter } from './TransactionPreviewToolbar'

import styles from './TransactionScopeNotices.module.css'

export interface TransactionScopeNoticesProps {
  scopeFilter: ScopeFilter
  accountFilter: string
  currentAccountName: string
  subAccountFilter: string
  existingAccountTransfers?: Transaction[]
  t: TranslationStrings
}

export const TransactionScopeNotices: React.FC<TransactionScopeNoticesProps> = ({
  scopeFilter,
  accountFilter,
  currentAccountName,
  subAccountFilter,
  existingAccountTransfers,
  t,
}) => {
  if (scopeFilter === 'excluded') {
    return (
      <div className={styles['excluded-items-notice']} data-testid="excluded-items-notice">
        <Ban size={15} aria-hidden="true" />
        <span>
          {accountFilter === 'current' || accountFilter === currentAccountName
            ? (
                t.excludedItemsCurrentNotice ||
                'These items from {account} are excluded from import.'
              ).replace('{account}', currentAccountName)
            : accountFilter !== 'all'
              ? (
                  t.excludedItemsExistingNotice ||
                  'These already imported items from {account} will now be excluded from calculations.'
                ).replace('{account}', accountFilter)
              : t.excludedItemsNotice ||
                'These items are excluded from import or calculations (sub-account transfers, internal transfers, and duplicates).'}
        </span>
      </div>
    )
  }

  if (scopeFilter === 'already-duplicated') {
    return (
      <div className={styles['already-duplicated-notice']} data-testid="already-duplicated-notice">
        <Lock size={15} aria-hidden="true" />
        <span>
          {t.alreadyDuplicatedFilterNotice ||
            'These duplicate transactions were already imported previously and cannot be modified or unlocked again.'}
        </span>
      </div>
    )
  }

  if (scopeFilter === 'space-transfers') {
    return (
      <div className={styles['space-transfers-notice']} data-testid="space-transfers-notice">
        <Layers size={15} aria-hidden="true" />
        <span>
          {subAccountFilter !== 'all'
            ? (
                t.spaceTransfersExcludedForSubAccountNotice ||
                'Sub-account transfers for {subAccount} are automatically excluded to prevent double counting.'
              ).replace('{subAccount}', subAccountFilter)
            : t.spaceTransfersExcludedNotice ||
              'Sub-account transfers are automatically excluded to prevent double counting.'}
        </span>
      </div>
    )
  }

  if (scopeFilter === 'internal-transfers') {
    return (
      <div className={styles['internal-transfers-notice']} data-testid="internal-transfers-notice">
        <Ghost size={15} aria-hidden="true" />
        <span>
          {accountFilter === 'current' || accountFilter === currentAccountName
            ? (
                t.internalTransfersCurrentAccountNotice ||
                'These internal transfers from {account} are excluded from income and expenses and hidden from the transaction list.'
              ).replace('{account}', currentAccountName)
            : accountFilter !== 'all'
              ? (
                  t.internalTransfersExistingAccountNotice ||
                  'These internal transfers from {account} were already imported and will now also be excluded from income and expenses and hidden from the transaction list.'
                ).replace('{account}', accountFilter)
              : existingAccountTransfers && existingAccountTransfers.length > 0
                ? (
                    t.internalTransfersWithExistingNotice ||
                    'These transactions are internal transfers between your own accounts. {existingCount} already imported transaction(s) will also be excluded from income/expenses and hidden from the transaction list.'
                  ).replace('{existingCount}', String(existingAccountTransfers.length))
                : t.internalTransfersNotice ||
                  'These transactions are internal transfers between your own accounts. They are excluded from income and expenses and hidden from standard views.'}
        </span>
      </div>
    )
  }

  return null
}
