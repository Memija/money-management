import React, { useEffect, useState } from 'react'
import { ArrowRight, CheckCheck, Layers } from 'lucide-react'

import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { usePrivacyStore } from '../../../store/usePrivacyStore'
import type { Transaction } from '../../../types'
import { getCategoryColor } from '../../../utils/category-colors'
import { getCategoryIcon } from '../../../utils/category-icons'
import { getCategoryLabel } from '../../../utils/category-utils'
import { CopyButton } from '../CopyButton'
import { Modal } from '../Modal'

import styles from './BatchCategoryModal.module.css'

export interface BatchCategoryModalProps {
  isOpen: boolean
  targetTransaction: Transaction | null
  newCategory: string
  relatedTransactions: Transaction[]
  onClose: () => void
  onConfirmOnlyThis: (targetTx: Transaction, newCategory: string) => void
  onConfirmAll: (
    targetTx: Transaction,
    relatedTx: Transaction[],
    newCategory: string,
    rememberRule: boolean,
  ) => void
  formatCurrency?: (amount: number) => string
  formatDate?: (date: string) => string
}

export const BatchCategoryModal: React.FC<BatchCategoryModalProps> = ({
  isOpen,
  targetTransaction,
  newCategory,
  relatedTransactions,
  onClose,
  onConfirmOnlyThis,
  onConfirmAll,
  formatCurrency = (amt) => String(amt),
  formatDate = (date) => date,
}) => {
  const t = useLanguageStore((s) => s.t)
  const locale = useLanguageStore((s) => s.locale)
  const customCategories = useAppStore((s) => s.customCategories)
  const isPrivacyMode = usePrivacyStore((s) => s.isPrivacyMode)
  const [rememberRule, setRememberRule] = useState<boolean>(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(relatedTransactions.map((tx) => tx.id)),
  )

  useEffect(() => {
    if (isOpen && targetTransaction) {
      setSelectedIds(new Set(relatedTransactions.map((tx) => tx.id)))
    }
  }, [isOpen, targetTransaction, newCategory, relatedTransactions])

  if (!targetTransaction) return null

  const targetCategoryLabel = getCategoryLabel(newCategory, t, locale, customCategories)
  const targetCategoryColor = getCategoryColor(newCategory, customCategories)
  const currentCategory = targetTransaction.category || 'Other'
  const currentCategoryLabel = getCategoryLabel(currentCategory, t, locale, customCategories)
  const currentCategoryColor = getCategoryColor(currentCategory, customCategories)

  const isAllSelected =
    relatedTransactions.length > 0 && selectedIds.size === relatedTransactions.length
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < relatedTransactions.length
  const selectedRelatedTransactions = relatedTransactions.filter((tx) => selectedIds.has(tx.id))
  const selectedRelatedCount = selectedRelatedTransactions.length
  const totalAffectedCount = relatedTransactions.length + 1
  const totalSelectedCount = selectedRelatedCount + 1

  const handleOnlyThis = () => {
    onConfirmOnlyThis(targetTransaction, newCategory)
    onClose()
  }

  const handleUpdate = () => {
    onConfirmAll(targetTransaction, selectedRelatedTransactions, newCategory, rememberRule)
    onClose()
  }

  const handleToggleTx = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleToggleSelectAll = () => {
    if (selectedIds.size === relatedTransactions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(relatedTransactions.map((tx) => tx.id)))
    }
  }

  const promptMessage = (
    t.batchCategoryPrompt ||
    'Found {count} related transaction(s). Update the category for all of them to {category}?'
  )
    .replace('{count}', String(relatedTransactions.length))
    .replace('{category}', targetCategoryLabel)

  const updateButtonText = isAllSelected
    ? (t.batchCategoryUpdateAll || 'Update all ({count})').replace(
        '{count}',
        String(totalAffectedCount),
      )
    : (t.batchCategoryUpdateSelected || 'Update selected ({count})').replace(
        '{count}',
        String(totalSelectedCount),
      )

  const badgeText =
    selectedRelatedCount === relatedTransactions.length
      ? String(relatedTransactions.length)
      : `${selectedRelatedCount} / ${relatedTransactions.length}`

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.batchCategoryTitle || 'Update Related Transactions'}
      maxWidth="540px"
      footer={
        <div className={styles.modalFooterActions}>
          <button
            type="button"
            className={`secondary-button ${styles.footerButton}`}
            onClick={onClose}
            title={t.cancel || 'Cancel'}
            aria-label={t.cancel || 'Cancel'}
            data-testid="batch-category-cancel-btn"
          >
            {t.cancel || 'Cancel'}
          </button>
          <button
            type="button"
            className={`secondary-button ${styles.footerButton}`}
            onClick={handleOnlyThis}
            title={t.batchCategoryOnlyThis || 'Only this transaction'}
            aria-label={t.batchCategoryOnlyThis || 'Only this transaction'}
            data-testid="batch-category-only-this-btn"
          >
            <span>{t.batchCategoryOnlyThis || 'Only this transaction'}</span>
          </button>
          <button
            type="button"
            className={styles.updateAllButton}
            onClick={handleUpdate}
            title={updateButtonText}
            aria-label={updateButtonText}
            data-testid="batch-category-update-all-btn"
          >
            <CheckCheck size={16} aria-hidden="true" />
            <span>{updateButtonText}</span>
          </button>
        </div>
      }
    >
      <div className={styles.contentContainer}>
        {/* Banner with Prompt & Icon */}
        <div className={styles.headerRow}>
          <div className={styles.iconContainer} aria-hidden="true">
            <Layers size={22} />
          </div>
          <p className={styles.messageText}>{promptMessage}</p>
        </div>

        {/* Target Transaction Card showing Transition */}
        <div className={styles.targetCard}>
          <div className={styles.targetCardHeader}>
            <div className={styles.targetDescRow}>
              <span
                className={`${styles.targetDesc} ${isPrivacyMode ? 'privacy-blur' : ''}`}
                title={isPrivacyMode ? undefined : targetTransaction.description}
              >
                {targetTransaction.description}
              </span>
              <CopyButton
                text={targetTransaction.description}
                title={t.copyTransactionText || 'Copy transaction text'}
                copiedTitle={t.copied || 'Copied!'}
                variant="inline"
                testId={`copy-batch-target-text-${targetTransaction.id}`}
              />
            </div>
            <span
              className={`${styles.targetAmount} ${
                targetTransaction.type === 'income' ? styles.positiveAmount : styles.negativeAmount
              } ${isPrivacyMode ? 'privacy-blur' : ''}`}
            >
              {targetTransaction.type === 'income' ? '+' : ''}
              {formatCurrency(targetTransaction.amount)}
            </span>
          </div>

          <div className={styles.categoryTransitionRow}>
            <span className={styles.metaDate}>{formatDate(targetTransaction.date)}</span>
            <div className={styles.categoryPills}>
              <span
                className={styles.categoryPill}
                style={{ '--cat-color': currentCategoryColor } as React.CSSProperties}
              >
                {getCategoryIcon(currentCategory, 12, customCategories)}
                <span>{currentCategoryLabel}</span>
              </span>
              <ArrowRight size={13} className={styles.transitionArrow} aria-hidden="true" />
              <span
                className={styles.categoryPill}
                style={{ '--cat-color': targetCategoryColor } as React.CSSProperties}
              >
                {getCategoryIcon(newCategory, 12, customCategories)}
                <span className={styles.targetPillLabel}>{targetCategoryLabel}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Matching Related Transactions List */}
        <div className={styles.relatedSection}>
          <div className={styles.relatedSectionHeader}>
            <div className={styles.relatedHeaderLeft}>
              <label className={styles.selectAllLabel}>
                <input
                  type="checkbox"
                  id="batch-category-select-all"
                  data-testid="batch-category-select-all"
                  className={styles.checkbox}
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = isSomeSelected
                    }
                  }}
                  onChange={handleToggleSelectAll}
                  aria-label={
                    isAllSelected
                      ? t.deselectAll || 'Deselect All'
                      : t.selectAll || 'Select All'
                  }
                />
                <span className={styles.relatedSectionTitle}>
                  {t.batchCategoryMatchingTransactions || 'Matching transactions'}
                </span>
              </label>
              <span className={styles.countBadge} data-testid="batch-category-count-badge">
                {badgeText}
              </span>
            </div>
            <button
              type="button"
              className={styles.selectAllBtn}
              onClick={handleToggleSelectAll}
              data-testid="batch-category-select-all-btn"
              title={isAllSelected ? t.deselectAll || 'Deselect All' : t.selectAll || 'Select All'}
              aria-label={
                isAllSelected ? t.deselectAll || 'Deselect All' : t.selectAll || 'Select All'
              }
            >
              {isAllSelected ? t.deselectAll || 'Deselect All' : t.selectAll || 'Select All'}
            </button>
          </div>

          <div className={styles.relatedList} role="region" aria-label="Matching transactions list">
            {relatedTransactions.map((tx) => {
              const isSelected = selectedIds.has(tx.id)
              const txCat = tx.category || 'Other'
              const txCatColor = getCategoryColor(txCat, customCategories)
              const txCatLabel = getCategoryLabel(txCat, t, locale, customCategories)

              return (
                <div
                  key={tx.id}
                  className={`${styles.relatedItem} ${isSelected ? styles.relatedItemSelected : ''}`}
                  data-testid={`related-tx-${tx.id}`}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return
                    handleToggleTx(tx.id)
                  }}
                >
                  <div
                    className={styles.itemCheckboxWrapper}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      id={`batch-select-tx-${tx.id}`}
                      data-testid={`related-checkbox-${tx.id}`}
                      className={styles.checkbox}
                      checked={isSelected}
                      onChange={() => handleToggleTx(tx.id)}
                      aria-label={tx.description}
                    />
                  </div>

                  <div className={styles.relatedItemLeft}>
                    <div className={styles.relatedDescRow}>
                      <p
                        className={`${styles.relatedDesc} ${isPrivacyMode ? 'privacy-blur' : ''}`}
                        title={isPrivacyMode ? undefined : tx.description}
                      >
                        {tx.description}
                      </p>
                      <CopyButton
                        text={tx.description}
                        title={t.copyTransactionText || 'Copy transaction text'}
                        copiedTitle={t.copied || 'Copied!'}
                        className={styles.copyBtn}
                        testId={`copy-batch-related-text-${tx.id}`}
                      />
                    </div>
                    <span className={styles.relatedDate}>{formatDate(tx.date)}</span>
                  </div>

                  <div className={styles.relatedItemRight}>
                    <span
                      className={`${styles.relatedAmount} ${
                        tx.type === 'income' ? styles.positiveAmount : styles.negativeAmount
                      } ${isPrivacyMode ? 'privacy-blur' : ''}`}
                    >
                      {tx.type === 'income' ? '+' : ''}
                      {formatCurrency(tx.amount)}
                    </span>
                    <span
                      className={styles.itemCategoryPill}
                      style={{ '--cat-color': txCatColor } as React.CSSProperties}
                      title={txCatLabel}
                    >
                      {getCategoryIcon(txCat, 11, customCategories)}
                      <span className={styles.itemCategoryLabel}>{txCatLabel}</span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Remember Rule Checkbox */}
        <div className={styles.checkboxContainer}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              id="batch-category-remember-rule"
              data-testid="batch-category-remember-rule"
              className={styles.checkbox}
              checked={rememberRule}
              onChange={(e) => setRememberRule(e.target.checked)}
            />
            <span className={styles.checkboxText}>
              {t.batchCategoryRememberRule || 'Remember this rule for future imports'}
            </span>
          </label>
        </div>
      </div>
    </Modal>
  )
}
