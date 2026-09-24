import React, { useState } from 'react'
import { Copy, Ghost, Sliders } from 'lucide-react'

import { useLanguageStore } from '../../../store/useLanguageStore'
import type { CustomCategory, Transaction } from '../../../types'
import { getCategoryColor } from '../../../utils/category-colors'
import { getCategoryIcon } from '../../../utils/category-icons'
import { getCategoryLabel } from '../../../utils/category-utils'
import { CategorySelect } from '../../shared/CategorySelect'

import styles from './TransactionItem.module.css'

interface TransactionItemProps {
  tx: Transaction
  customCategories: CustomCategory[]
  formatDate: (d: string) => string
  formatCurrency: (n: number) => string
  onCategoryChange: (tx: Transaction, newCategory: string) => void
}

export const TransactionItem = React.memo<TransactionItemProps>(({
  tx,
  customCategories,
  formatDate,
  formatCurrency,
  onCategoryChange,
}) => {
  const t = useLanguageStore((s) => s.t)
  const locale = useLanguageStore((s) => s.locale)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const categoryColor = getCategoryColor(tx.category || 'Other', customCategories)
  const isModifiedTx = Boolean(tx.isModified)
  const isDuplicateTx = Boolean(tx.isDuplicate || tx.forceImport || tx.importedByRuleId)

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
          {getCategoryIcon(tx.category || 'Other', 20, customCategories, tx.description)}
        </div>
        <div className={styles.txDetails}>
          <p className={styles.txDesc} title={tx.description}>
            {tx.description}
          </p>
          <p className={styles.txMeta}>
            <span className={styles.txMetaText}>
              {formatDate(tx.date)} • {tx.institution}
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
            className={
              tx.type === 'income' ? styles.amountPositive : styles.amountNegative
            }
          >
            {tx.type === 'income' ? '+' : ''}
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
