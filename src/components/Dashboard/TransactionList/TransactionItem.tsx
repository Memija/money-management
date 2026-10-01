import React, { useState } from 'react'
import { Copy, Ghost, Info, Sliders } from 'lucide-react'

import { findInstitution } from '../../../data/institutions'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { usePrivacyStore } from '../../../store/usePrivacyStore'
import type { CustomCategory, Transaction } from '../../../types'
import { getCategoryColor } from '../../../utils/category-colors'
import { getCategoryIcon } from '../../../utils/category-icons'
import { getCategoryLabel, isInformativeTransaction } from '../../../utils/category-utils'
import { CategorySelect } from '../../shared/CategorySelect'

import styles from './TransactionItem.module.css'

interface TransactionItemProps {
  tx: Transaction
  customCategories: CustomCategory[]
  formatDate: (d: string) => string
  formatCurrency: (n: number) => string
  onCategoryChange: (tx: Transaction, newCategory: string) => void
  showBankName?: boolean
}

export const TransactionItem = React.memo<TransactionItemProps>(({
  tx,
  customCategories,
  formatDate,
  formatCurrency,
  onCategoryChange,
  showBankName = true,
}) => {
  const t = useLanguageStore((s) => s.t)
  const locale = useLanguageStore((s) => s.locale)
  const isPrivacyMode = usePrivacyStore((s) => s.isPrivacyMode)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const isZeroAmount = isInformativeTransaction(tx)
  const categoryColor = isZeroAmount
    ? 'var(--text-dim)'
    : getCategoryColor(tx.category || 'Other', customCategories)
  const isModifiedTx = Boolean(tx.isModified)
  const isDuplicateTx = Boolean(tx.isDuplicate || tx.forceImport || tx.importedByRuleId)
  const institutionLogo =
    showBankName && tx.institution ? findInstitution(tx.institution)?.logo : undefined

  return (
    <div
      className={`${styles.transactionItem} ${tx.isGhost ? styles.ghostItem : ''} ${
        isModifiedTx ? styles.modifiedItem : isDuplicateTx ? styles.duplicateItem : ''
      } ${
        isDropdownOpen ? styles.itemWithOpenDropdown : ''
      }`}
      style={{ '--cat-color': categoryColor } as React.CSSProperties}
    >
      <div className={styles.txLeft}>
        <div
          className={styles.iconBox}
          aria-hidden="true"
        >
          {isZeroAmount ? (
            <Info size={20} color="var(--text-dim)" aria-hidden="true" />
          ) : (
            getCategoryIcon(tx.category || 'Other', 20, customCategories, tx.description)
          )}
        </div>
        <div className={styles.txDetails}>
          <p className={`${styles.txDesc} privacy-blur`} title={isPrivacyMode ? undefined : tx.description}>
            {tx.description}
          </p>
          <p className={styles.txMeta}>
            <span className={styles.txMetaText}>
              {formatDate(tx.date)}
              {showBankName && tx.institution && (
                <>
                  {' • '}
                  {institutionLogo && (
                    <img
                      src={institutionLogo}
                      alt=""
                      className={styles.institutionLogo}
                      aria-hidden="true"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLElement).style.display = 'none'
                      }}
                    />
                  )}
                  {tx.institution}
                </>
              )}
              {tx.subAccount && ` • ${tx.subAccount}`}
            </span>
            {tx.isGhost && (
              <span className={styles.ghostBadge}>
                <Ghost size={11} aria-hidden="true" />
                {t.internalTransfer || 'Internal Transfer'}
              </span>
            )}
            {isModifiedTx ? (
              <span
                className={styles.modifiedBadge}
                data-testid={`tx-modified-badge-${tx.id}`}
                title={t.modified || 'Modified'}
                aria-label={t.modified || 'Modified'}
              >
                <Sliders size={11} aria-hidden="true" />
              </span>
            ) : isDuplicateTx ? (
              <span
                className={styles.duplicateBadge}
                data-testid={`tx-duplicate-badge-${tx.id}`}
                title={t.duplicate || 'Duplicate'}
                aria-label={t.duplicate || 'Duplicate'}
              >
                <Copy size={11} aria-hidden="true" />
              </span>
            ) : null}
          </p>
        </div>
      </div>
      <div className={styles.txRight}>
        <div className={styles.amountCol}>
          <p
            className={`${
              isZeroAmount
                ? styles.amountNeutral
                : tx.type === 'income'
                  ? styles.amountPositive
                  : styles.amountNegative
            } privacy-blur`}
          >
            {!isZeroAmount && tx.type === 'income' ? '+' : ''}
            {formatCurrency(tx.amount)}
          </p>
        </div>
        <div className={styles.categoryBadgeWrapper}>
          {tx.isGhost ? (
            <span
              className={styles.readOnlyBadge}
              data-testid={`tx-ghost-readonly-${tx.id}`}
              title={t.internalTransfer || 'Internal Transfer'}
            >
              {getCategoryLabel(tx.category || 'Other', t, locale, customCategories)}
            </span>
          ) : isZeroAmount ? (
            <span
              className={styles.readOnlyBadge}
              data-testid={`tx-informative-readonly-${tx.id}`}
              title={t.informative || 'Informative'}
            >
              {t.informative || 'Informative'}
            </span>
          ) : (
            <CategorySelect
              value={tx.category || 'Other'}
              onChange={(val) => onCategoryChange(tx, val)}
              variant="badge"
              align="right"
              onOpenChange={setIsDropdownOpen}
            />
          )}
        </div>
      </div>
    </div>
  )
})

TransactionItem.displayName = 'TransactionItem'
