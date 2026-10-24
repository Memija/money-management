import React from 'react'
import { Landmark, Layers } from 'lucide-react'

import { findInstitution } from '../../../data/institutions'
import type { TranslationStrings } from '../../../i18n/types'
import type { ScopeFilter } from './TransactionPreviewToolbar'

import styles from './CrossAccountFilterBar.module.css'

export interface CrossAccountFilterBarProps {
  hasMultipleAccounts: boolean
  scopeFilter: ScopeFilter
  accountFilter: string
  setAccountFilter: (val: string) => void
  currentAccountName: string
  currentInstLogo?: string
  existingInstitutions: string[]
  accountCounts: Record<string, number>
  subAccounts: string[]
  subAccountFilter: string
  setSubAccountFilter: (val: string) => void
  subAccountCounts: Record<string, number>
  t: TranslationStrings
}

export const CrossAccountFilterBar: React.FC<CrossAccountFilterBarProps> = ({
  hasMultipleAccounts,
  scopeFilter,
  accountFilter,
  setAccountFilter,
  currentAccountName,
  currentInstLogo,
  existingInstitutions,
  accountCounts,
  subAccounts,
  subAccountFilter,
  setSubAccountFilter,
  subAccountCounts,
  t,
}) => {
  const showAccountFilter =
    hasMultipleAccounts &&
    (scopeFilter === 'excluded' ||
      scopeFilter === 'internal-transfers' ||
      scopeFilter === 'all')

  const showSubAccountFilter = scopeFilter === 'space-transfers' && subAccounts.length > 1

  if (!showAccountFilter && !showSubAccountFilter) {
    return null
  }

  return (
    <>
      {/* Account Filter Bar for Cross-Account Transfers */}
      {showAccountFilter && (
        <div className={styles['account-filter-bar']} data-testid="account-filter-bar">
          <div className={styles['account-filter-label']}>
            <Landmark size={14} aria-hidden="true" />
            <span>{t.filterByAccount || 'Account:'}</span>
          </div>
          <div className={styles['account-filter-pills']}>
            <button
              type="button"
              className={`${styles['account-pill']} ${
                accountFilter === 'all' ? styles['account-pill-active'] : ''
              }`}
              onClick={() => setAccountFilter('all')}
              aria-pressed={accountFilter === 'all'}
              data-testid="account-filter-pill-all"
              title={t.allAccounts || 'All Accounts'}
            >
              <span>{t.allAccounts || 'All Accounts'}</span>
              <span className={styles['account-pill-badge']}>{accountCounts.all ?? 0}</span>
            </button>

            <button
              type="button"
              className={`${styles['account-pill']} ${
                accountFilter === 'current' || accountFilter === currentAccountName
                  ? styles['account-pill-active']
                  : ''
              }`}
              onClick={() => setAccountFilter('current')}
              aria-pressed={accountFilter === 'current' || accountFilter === currentAccountName}
              data-testid="account-filter-pill-current"
              title={currentAccountName}
            >
              {currentInstLogo ? (
                <img
                  src={currentInstLogo}
                  alt=""
                  className={styles['account-pill-logo']}
                  aria-hidden="true"
                  data-testid="account-pill-logo-current"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLElement).style.display = 'none'
                  }}
                />
              ) : (
                <Landmark size={13} className={styles['account-pill-icon']} aria-hidden="true" />
              )}
              <span className={styles['account-pill-name']}>{currentAccountName}</span>
              <span className={styles['account-pill-badge']}>{accountCounts.current ?? 0}</span>
            </button>

            {existingInstitutions.map((inst) => {
              const instLogo = findInstitution(inst)?.logo
              const instTestIdKey = inst.toLowerCase().replace(/\s+/g, '-')
              return (
                <button
                  key={inst}
                  type="button"
                  className={`${styles['account-pill']} ${
                    accountFilter === inst ? styles['account-pill-active'] : ''
                  }`}
                  onClick={() => setAccountFilter(inst)}
                  aria-pressed={accountFilter === inst}
                  data-testid={`account-filter-pill-${instTestIdKey}`}
                  title={inst}
                >
                  {instLogo ? (
                    <img
                      src={instLogo}
                      alt=""
                      className={styles['account-pill-logo']}
                      aria-hidden="true"
                      data-testid={`account-pill-logo-${instTestIdKey}`}
                      onError={(e) => {
                        ;(e.currentTarget as HTMLElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <Landmark
                      size={13}
                      className={styles['account-pill-icon']}
                      aria-hidden="true"
                    />
                  )}
                  <span className={styles['account-pill-name']}>{inst}</span>
                  <span className={styles['account-pill-badge']}>{accountCounts[inst] ?? 0}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Sub-account Filter Bar for Sub-account Transfers */}
      {showSubAccountFilter && (
        <div className={styles['subaccount-filter-bar']} data-testid="subaccount-filter-bar">
          <div className={styles['subaccount-filter-label']}>
            <Layers size={14} aria-hidden="true" />
            <span>{t.filterBySubAccount || 'Sub-account:'}</span>
          </div>
          <div className={styles['subaccount-filter-pills']}>
            <button
              type="button"
              className={`${styles['subaccount-pill']} ${
                subAccountFilter === 'all' ? styles['subaccount-pill-active'] : ''
              }`}
              onClick={() => setSubAccountFilter('all')}
              aria-pressed={subAccountFilter === 'all'}
              data-testid="subaccount-filter-pill-all"
              title={t.allSubAccounts || 'All Sub-accounts'}
            >
              <span>{t.allSubAccounts || 'All Sub-accounts'}</span>
              <span className={styles['subaccount-pill-badge']}>{subAccountCounts.all ?? 0}</span>
            </button>

            {subAccounts.map((sa) => (
              <button
                key={sa}
                type="button"
                className={`${styles['subaccount-pill']} ${
                  subAccountFilter === sa ? styles['subaccount-pill-active'] : ''
                }`}
                onClick={() => setSubAccountFilter(sa)}
                aria-pressed={subAccountFilter === sa}
                data-testid={`subaccount-filter-pill-${sa.toLowerCase().replace(/\s+/g, '-')}`}
                title={sa}
              >
                <span className={styles['subaccount-pill-name']}>{sa}</span>
                <span className={styles['subaccount-pill-badge']}>{subAccountCounts[sa] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
