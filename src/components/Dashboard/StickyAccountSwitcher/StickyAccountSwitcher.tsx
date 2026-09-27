import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Landmark, Layers, Wallet } from 'lucide-react'

import type { BankAccountSummary } from '../../../hooks/useAccountBalances'
import { useDropdownPosition } from '../../../hooks/useDropdownPosition'
import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { usePrivacyStore } from '../../../store/usePrivacyStore'

import styles from './StickyAccountSwitcher.module.css'

export interface StickyAccountSwitcherProps {
  accounts: BankAccountSummary[]
  totalBalance: number
  totalTransactionCount: number
  selectedInstitution: string
  onSelectInstitution: (institutionIdOrName: string) => void
  selectedSubAccount: string
  onSelectSubAccount: (subAccountName: string) => void
  selectedAccountInfo?: BankAccountSummary | null
  displayBalance: number
  hasMultipleAccounts: boolean
}

export const StickyAccountSwitcher: React.FC<StickyAccountSwitcherProps> = ({
  accounts,
  totalBalance,
  totalTransactionCount,
  selectedInstitution,
  onSelectInstitution,
  selectedSubAccount,
  onSelectSubAccount,
  selectedAccountInfo,
  displayBalance,
  hasMultipleAccounts,
}) => {
  const t = useLanguageStore((s) => s.t)
  const isPrivacyMode = usePrivacyStore((s) => s.isPrivacyMode)
  const { formatCurrency, formatTransactionCount } = useFormatters()
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  useDropdownPosition({
    isOpen,
    triggerRef,
    dropdownRef,
    padding: 12,
    estimatedHeight: 320,
    usePortal: true,
    align: 'left',
  })

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: Event) => {
      const target = event.target as Node
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const singleAccount = accounts.length === 1 ? accounts[0] : null
  const activeAccount = selectedAccountInfo || singleAccount

  const labelText = useMemo(() => {
    if (accounts.length === 1 && activeAccount) {
      if (selectedSubAccount !== 'all') {
        return `${activeAccount.name} • ${selectedSubAccount}`
      }
      return activeAccount.name
    }
    if (selectedInstitution === 'all') {
      return t.totalBalance || 'Total Balance'
    }
    if (selectedSubAccount !== 'all') {
      return `${activeAccount?.name || selectedInstitution} • ${selectedSubAccount}`
    }
    return activeAccount?.name || selectedInstitution
  }, [accounts.length, activeAccount, selectedInstitution, selectedSubAccount, t])

  const currentLogo =
    selectedInstitution === 'all' && accounts.length > 1
      ? undefined
      : activeAccount?.logo

  // Non-interactive fallback when there is only 1 account imported
  if (!hasMultipleAccounts) {
    return (
      <div className={styles.staticItem} data-testid="sticky-account-switcher-static">
        {currentLogo ? (
          <img
            src={currentLogo}
            alt=""
            className={styles.bankLogo}
            aria-hidden="true"
            onError={(e) => {
              ;(e.currentTarget as HTMLElement).style.display = 'none'
            }}
          />
        ) : activeAccount ? (
          <Landmark size={14} className={styles.textPrimary} aria-hidden="true" />
        ) : (
          <Wallet size={14} className={styles.textMuted} aria-hidden="true" />
        )}
        <span className={styles.statLabel}>{labelText}:</span>
        <span
          className={`${styles.statValue} ${
            displayBalance >= 0 ? styles.textPrimary : styles.textDanger
          } privacy-blur`}
        >
          {formatCurrency(displayBalance)}
        </span>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={`${t.bankAccounts || 'Bank Accounts'}: ${labelText}${isPrivacyMode ? '' : `, ${formatCurrency(displayBalance)}`}`}
        title={isPrivacyMode ? labelText : `${labelText}: ${formatCurrency(displayBalance)}`}
        data-testid="sticky-account-switcher-trigger"
      >
        {currentLogo ? (
          <img
            src={currentLogo}
            alt=""
            className={styles.bankLogo}
            aria-hidden="true"
            onError={(e) => {
              ;(e.currentTarget as HTMLElement).style.display = 'none'
            }}
          />
        ) : selectedInstitution === 'all' ? (
          <Landmark size={14} className={styles.textPrimary} aria-hidden="true" />
        ) : (
          <Wallet size={14} className={styles.textMuted} aria-hidden="true" />
        )}
        <span className={styles.statLabel}>{labelText}:</span>
        <span
          className={`${styles.statValue} ${
            displayBalance >= 0 ? styles.textPrimary : styles.textDanger
          } privacy-blur`}
        >
          {formatCurrency(displayBalance)}
        </span>
        <ChevronDown
          size={12}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          aria-hidden="true"
        />
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                id={listboxId}
                ref={dropdownRef}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className={styles.dropdown}
                role="listbox"
                aria-label={t.bankAccounts || 'Bank Accounts'}
                data-testid="sticky-account-switcher-dropdown"
              >
                <div className={styles.dropdownHeader}>
                  <div className={styles.headerTitleArea}>
                    <Wallet size={13} className={styles.headerIcon} aria-hidden="true" />
                    <span>{t.bankAccounts || 'Bank Accounts'}</span>
                  </div>
                  <span className={styles.headerBadge}>
                    {accounts.length} {accounts.length === 1 ? t.institutions || 'Account' : t.institutions || 'Accounts'}
                  </span>
                </div>

                <div className={styles.dropdownList}>
                  {/* All Accounts Option */}
                  {accounts.length > 1 && (
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedInstitution === 'all'}
                      className={`${styles.optionItem} ${
                        selectedInstitution === 'all' ? styles.optionItemActive : ''
                      }`}
                      onClick={() => {
                        onSelectInstitution('all')
                        onSelectSubAccount('all')
                        setIsOpen(false)
                      }}
                      data-testid="sticky-account-option-all"
                    >
                      <div className={styles.optionLeft}>
                        <div className={styles.iconCircle}>
                          <Landmark size={14} className={styles.fallbackIcon} aria-hidden="true" />
                        </div>
                        <div className={styles.nameBlock}>
                          <span className={styles.accountName}>{t.allAccounts}</span>
                          <span className={styles.txCount}>
                            {formatTransactionCount(totalTransactionCount)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.optionRight}>
                        <span
                          className={`${styles.balanceText} ${
                            totalBalance >= 0 ? styles.balancePositive : styles.balanceNegative
                          } privacy-blur`}
                        >
                          {formatCurrency(totalBalance)}
                        </span>
                        {selectedInstitution === 'all' && (
                          <Check size={14} className={styles.checkIcon} aria-hidden="true" />
                        )}
                      </div>
                    </button>
                  )}

                  {accounts.length > 1 && <div className={styles.divider} role="separator" />}

                  {/* Individual Account Options */}
                  {accounts.map((acc) => {
                    const isBankSelected =
                      selectedInstitution === acc.id || selectedInstitution === acc.name
                    const hasSubs = acc.subAccounts && acc.subAccounts.length > 0

                    return (
                      <div key={acc.id} className={styles.bankGroup}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={
                            isBankSelected && (!hasSubs || selectedSubAccount === 'all')
                          }
                          className={`${styles.optionItem} ${
                            isBankSelected ? styles.optionItemActive : ''
                          }`}
                          onClick={() => {
                            onSelectInstitution(acc.name || acc.id)
                            onSelectSubAccount('all')
                            setIsOpen(false)
                          }}
                          data-testid={`sticky-account-option-${acc.id}`}
                        >
                          <div className={styles.optionLeft}>
                            <div className={styles.iconCircle}>
                              {acc.logo ? (
                                <img
                                  src={acc.logo}
                                  alt=""
                                  className={styles.bankLogoSmall}
                                  aria-hidden="true"
                                  onError={(e) => {
                                    ;(e.currentTarget as HTMLElement).style.display = 'none'
                                  }}
                                />
                              ) : (
                                <Landmark
                                  size={14}
                                  className={styles.fallbackIcon}
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                            <div className={styles.nameBlock}>
                              <span className={styles.accountName} title={acc.name}>
                                {acc.name}
                              </span>
                              <span className={styles.txCount}>
                                {formatTransactionCount(acc.transactionCount)}
                              </span>
                            </div>
                          </div>

                          <div className={styles.optionRight}>
                            <span
                              className={`${styles.balanceText} ${
                                acc.balance >= 0 ? styles.balancePositive : styles.balanceNegative
                              } privacy-blur`}
                            >
                              {formatCurrency(acc.balance)}
                            </span>
                            {hasSubs && (
                              <span className={styles.spacesBadge}>
                                {acc.subAccounts.length}
                              </span>
                            )}
                            {isBankSelected && (!hasSubs || selectedSubAccount === 'all') && (
                              <Check size={14} className={styles.checkIcon} aria-hidden="true" />
                            )}
                          </div>
                        </button>

                        {/* Sub-accounts when bank is selected */}
                        {hasSubs && isBankSelected && (
                          <div className={styles.subAccountsList}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={selectedSubAccount === 'all'}
                              className={`${styles.subOptionItem} ${
                                selectedSubAccount === 'all' ? styles.subOptionActive : ''
                              }`}
                              onClick={() => {
                                onSelectSubAccount('all')
                                setIsOpen(false)
                              }}
                            >
                              <div className={styles.subOptionLeft}>
                                <Layers size={11} className={styles.subIcon} aria-hidden="true" />
                                <span className={styles.subName}>{t.allSubAccounts}</span>
                              </div>
                              <div className={styles.subOptionRight}>
                                <span className={`${styles.subBalance} privacy-blur`}>
                                  {formatCurrency(acc.balance)}
                                </span>
                                {selectedSubAccount === 'all' && (
                                  <Check size={12} className={styles.checkIcon} aria-hidden="true" />
                                )}
                              </div>
                            </button>

                            {acc.subAccounts.map((sub) => {
                              const isSubSelected = selectedSubAccount === sub.name
                              return (
                                <button
                                  key={sub.name}
                                  type="button"
                                  role="option"
                                  aria-selected={isSubSelected}
                                  className={`${styles.subOptionItem} ${
                                    isSubSelected ? styles.subOptionActive : ''
                                  }`}
                                  onClick={() => {
                                    onSelectSubAccount(sub.name)
                                    setIsOpen(false)
                                  }}
                                  data-testid={`sticky-subaccount-option-${sub.name}`}
                                >
                                  <div className={styles.subOptionLeft}>
                                    <Layers size={11} className={styles.subIcon} aria-hidden="true" />
                                    <span className={styles.subName}>{sub.name}</span>
                                  </div>
                                  <div className={styles.subOptionRight}>
                                    <span className={`${styles.subBalance} privacy-blur`}>
                                      {formatCurrency(sub.balance)}
                                    </span>
                                    {isSubSelected && (
                                      <Check size={12} className={styles.checkIcon} aria-hidden="true" />
                                    )}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  )
}
