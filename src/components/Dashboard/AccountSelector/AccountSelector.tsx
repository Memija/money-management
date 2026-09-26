import React, { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Landmark, Layers, Wallet } from 'lucide-react'

import type { BankAccountSummary } from '../../../hooks/useAccountBalances'
import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'

import styles from './AccountSelector.module.css'

export interface AccountSelectorProps {
  accounts: BankAccountSummary[]
  totalBalance: number
  totalTransactionCount: number
  selectedInstitution: string
  onSelectInstitution: (institutionIdOrName: string) => void
  selectedSubAccount: string
  onSelectSubAccount: (subAccountName: string) => void
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  totalBalance,
  totalTransactionCount,
  selectedInstitution,
  onSelectInstitution,
  selectedSubAccount,
  onSelectSubAccount,
}) => {
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency, formatTransactionCount } = useFormatters()

  // Selected bank object (if an individual institution is selected)
  const selectedAccount = useMemo(() => {
    if (selectedInstitution === 'all') return null
    return accounts.find(
      (a) => a.id === selectedInstitution || a.name === selectedInstitution,
    )
  }, [accounts, selectedInstitution])

  // Don't render anything if there are no accounts imported
  if (!accounts || accounts.length === 0) {
    return null
  }

  return (
    <section className={styles.container} aria-label={t.bankAccounts || 'Bank Accounts'}>
      <div className={styles.selectorHeader}>
        <div className={styles.titleArea}>
          <Wallet size={16} className={styles.headerIcon} aria-hidden="true" />
          <span className={styles.headerTitle}>{t.bankAccounts || 'Bank Accounts'}</span>
        </div>
        <span className={styles.totalBadge}>
          {accounts.length} {accounts.length === 1 ? t.institutions || 'Account' : t.institutions || 'Accounts'}
        </span>
      </div>

      {/* Horizontal bank cards */}
      <div className={styles.cardsTrack} role="tablist" aria-label="Accounts list">
        {/* All Accounts card */}
        <button
          type="button"
          role="tab"
          aria-selected={selectedInstitution === 'all'}
          data-testid="account-card-all"
          className={`${styles.accountCard} ${
            selectedInstitution === 'all' ? styles.accountCardActive : ''
          }`}
          onClick={() => onSelectInstitution('all')}
        >
          <div className={styles.cardTop}>
            <div className={styles.brandGroup}>
              <div className={styles.logoWrapper}>
                <Landmark size={18} className={styles.fallbackIcon} aria-hidden="true" />
              </div>
              <h4 className={styles.accountName}>{t.allAccounts}</h4>
            </div>
            <span className={styles.txBadge}>
              {formatTransactionCount(totalTransactionCount)}
            </span>
          </div>

          <div className={styles.cardBottom}>
            <p
              className={`${styles.balanceValue} ${
                totalBalance >= 0 ? styles.balancePositive : styles.balanceNegative
              }`}
            >
              {formatCurrency(totalBalance)}
            </p>
          </div>
        </button>

        {/* Per-bank cards */}
        {accounts.map((acc) => {
          const isSelected =
            selectedInstitution === acc.id || selectedInstitution === acc.name

          return (
            <button
              key={acc.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              data-testid={`account-card-${acc.id}`}
              className={`${styles.accountCard} ${
                isSelected ? styles.accountCardActive : ''
              }`}
              onClick={() => onSelectInstitution(acc.name || acc.id)}
            >
              <div className={styles.cardTop}>
                <div className={styles.brandGroup}>
                  <div className={styles.logoWrapper}>
                    {acc.logo ? (
                      <img
                        src={acc.logo}
                        alt=""
                        className={styles.bankLogo}
                        aria-hidden="true"
                        onError={(e) => {
                          ;(e.currentTarget as HTMLElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <Landmark size={18} className={styles.fallbackIcon} aria-hidden="true" />
                    )}
                  </div>
                  <h4 className={styles.accountName} title={acc.name}>
                    {acc.name}
                  </h4>
                </div>
                <span className={styles.txBadge}>
                  {formatTransactionCount(acc.transactionCount)}
                </span>
              </div>

              <div className={styles.cardBottom}>
                <p
                  className={`${styles.balanceValue} ${
                    acc.balance >= 0 ? styles.balancePositive : styles.balanceNegative
                  }`}
                >
                  {formatCurrency(acc.balance)}
                </p>
                {acc.subAccounts.length > 0 && (
                  <span className={styles.spacesCountBadge}>
                    {acc.subAccounts.length} {t.subAccounts || 'Spaces'}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Sub-account spaces row (shown when the selected bank has sub-accounts) */}
      <AnimatePresence>
        {selectedAccount && selectedAccount.subAccounts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.subAccountsBar}
            role="region"
            aria-label={t.subAccounts || 'Sub-accounts'}
          >
            <div className={styles.subAccountsLabel}>
              <Layers size={14} aria-hidden="true" />
              <span>{t.subAccounts || 'Sub-accounts'}:</span>
            </div>

            <div className={styles.subPillsTrack} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={selectedSubAccount === 'all'}
                className={`${styles.subPill} ${
                  selectedSubAccount === 'all' ? styles.subPillActive : ''
                }`}
                onClick={() => onSelectSubAccount('all')}
              >
                <span className={styles.subPillName}>{t.allSubAccounts}</span>
                <span className={styles.subPillCount}>
                  ({selectedAccount.transactionCount})
                </span>
              </button>

              {selectedAccount.subAccounts.map((sub) => (
                <button
                  key={sub.name}
                  type="button"
                  role="tab"
                  aria-selected={selectedSubAccount === sub.name}
                  data-testid={`subaccount-pill-${sub.name}`}
                  className={`${styles.subPill} ${
                    selectedSubAccount === sub.name ? styles.subPillActive : ''
                  }`}
                  onClick={() => onSelectSubAccount(sub.name)}
                >
                  <span className={styles.subPillName}>{sub.name}</span>
                  <span className={styles.subPillBalance}>
                    {formatCurrency(sub.balance)}
                  </span>
                  <span className={styles.subPillCount}>({sub.transactionCount})</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
