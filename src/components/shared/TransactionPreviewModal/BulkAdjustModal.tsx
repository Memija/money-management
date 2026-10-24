import React from 'react'
import { Check } from 'lucide-react'

import type { TranslationStrings } from '../../../i18n/types'
import type { Transaction } from '../../../types'
import { Modal } from '../Modal'

import styles from './BulkAdjustModal.module.css'

export interface BulkAdjustModalProps {
  isOpen: boolean
  onClose: () => void
  bulkApplyOffer: {
    sourceTxId: string
    originalDescription: string
    updates: Partial<Transaction>
    unlockedTargetIds: string[]
    identicalTargetIds: string[]
  } | null
  activeTransactions: Transaction[]
  selectedFieldsToApply: {
    description: boolean
    date: boolean
    amount: boolean
  }
  setSelectedFieldsToApply: React.Dispatch<
    React.SetStateAction<{
      description: boolean
      date: boolean
      amount: boolean
    }>
  >
  selectedTargetIds: Set<string>
  setSelectedTargetIds: React.Dispatch<React.SetStateAction<Set<string>>>
  onConfirmCustomAdjust: () => void
  formatDate: (date: string) => string
  formatCurrency: (amount: number) => string
  t: TranslationStrings
}

export const BulkAdjustModal: React.FC<BulkAdjustModalProps> = ({
  isOpen,
  onClose,
  bulkApplyOffer,
  activeTransactions,
  selectedFieldsToApply,
  setSelectedFieldsToApply,
  selectedTargetIds,
  setSelectedTargetIds,
  onConfirmCustomAdjust,
  formatDate,
  formatCurrency,
  t,
}) => {
  if (!bulkApplyOffer) {
    return null
  }

  const allTargetIds = [
    ...bulkApplyOffer.unlockedTargetIds,
    ...bulkApplyOffer.identicalTargetIds,
  ]
  const targetTxs = activeTransactions.filter((tx) => allTargetIds.includes(tx.id))
  const allSelected = targetTxs.length > 0 && selectedTargetIds.size === targetTxs.length

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedTargetIds(new Set())
    } else {
      setSelectedTargetIds(new Set(targetTxs.map((tx) => tx.id)))
    }
  }

  const handleToggleTarget = (txId: string) => {
    setSelectedTargetIds((prev) => {
      const next = new Set(prev)
      if (next.has(txId)) {
        next.delete(txId)
      } else {
        next.add(txId)
      }
      return next
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.adjustUnlockedModalTitle || 'Adjust Unlocked Transactions in Bulk'}
      maxWidth="580px"
      footer={
        <div className={styles['adjust-modal-footer']}>
          <button
            type="button"
            className={styles['adjust-cancel-btn']}
            onClick={onClose}
          >
            {t.cancel || 'Cancel'}
          </button>
          <button
            type="button"
            className={styles['adjust-confirm-btn']}
            onClick={onConfirmCustomAdjust}
            disabled={
              selectedTargetIds.size === 0 ||
              (!selectedFieldsToApply.description &&
                !selectedFieldsToApply.date &&
                !selectedFieldsToApply.amount)
            }
            data-testid="confirm-custom-adjust-btn"
          >
            <Check size={14} aria-hidden="true" />
            <span>
              {(t.applyToSelectedCount || 'Apply to {count} selected').replace(
                '{count}',
                String(selectedTargetIds.size),
              )}
            </span>
          </button>
        </div>
      }
    >
      <div className={styles['adjust-modal-body']}>
        <div className={styles['adjust-section']}>
          <span className={styles['adjust-section-title']}>
            {t.applyFieldsLabel || 'Modifications to apply'}
          </span>
          <div className={styles['adjust-fields-grid']}>
            {bulkApplyOffer.updates.description !== undefined && (
              <label
                className={`${styles['adjust-field-card']} ${
                  selectedFieldsToApply.description
                    ? styles['adjust-field-card-active']
                    : ''
                }`}
              >
                <input
                  type="checkbox"
                  className={styles['adjust-field-checkbox']}
                  checked={selectedFieldsToApply.description}
                  data-testid="adjust-field-checkbox-description"
                  onChange={(e) =>
                    setSelectedFieldsToApply((prev) => ({
                      ...prev,
                      description: e.target.checked,
                    }))
                  }
                />
                <div className={styles['adjust-field-info']}>
                  <span className={styles['adjust-field-name']}>
                    {t.description || 'Description'}
                  </span>
                  <span className={styles['adjust-field-val']}>
                    {bulkApplyOffer.updates.description}
                  </span>
                </div>
              </label>
            )}

            {bulkApplyOffer.updates.date !== undefined && (
              <label
                className={`${styles['adjust-field-card']} ${
                  selectedFieldsToApply.date ? styles['adjust-field-card-active'] : ''
                }`}
              >
                <input
                  type="checkbox"
                  className={styles['adjust-field-checkbox']}
                  checked={selectedFieldsToApply.date}
                  data-testid="adjust-field-checkbox-date"
                  onChange={(e) =>
                    setSelectedFieldsToApply((prev) => ({
                      ...prev,
                      date: e.target.checked,
                    }))
                  }
                />
                <div className={styles['adjust-field-info']}>
                  <span className={styles['adjust-field-name']}>{t.date || 'Date'}</span>
                  <span className={styles['adjust-field-val']}>
                    {formatDate(bulkApplyOffer.updates.date)}
                  </span>
                </div>
              </label>
            )}

            {bulkApplyOffer.updates.amount !== undefined && (
              <label
                className={`${styles['adjust-field-card']} ${
                  selectedFieldsToApply.amount ? styles['adjust-field-card-active'] : ''
                }`}
              >
                <input
                  type="checkbox"
                  className={styles['adjust-field-checkbox']}
                  checked={selectedFieldsToApply.amount}
                  data-testid="adjust-field-checkbox-amount"
                  onChange={(e) =>
                    setSelectedFieldsToApply((prev) => ({
                      ...prev,
                      amount: e.target.checked,
                    }))
                  }
                />
                <div className={styles['adjust-field-info']}>
                  <span className={styles['adjust-field-name']}>
                    {t.amount || 'Amount'}
                  </span>
                  <span className={styles['adjust-field-val']}>
                    {formatCurrency(bulkApplyOffer.updates.amount)}
                  </span>
                </div>
              </label>
            )}
          </div>
        </div>

        <div className={styles['adjust-section']}>
          <div className={styles['adjust-section-header']}>
            <span className={styles['adjust-section-title']}>
              {t.targetTransactionsLabel || 'Target transactions'} ({selectedTargetIds.size}
              /{targetTxs.length})
            </span>
            <button
              type="button"
              className={`${styles['adjust-select-all-btn']} ${
                !allSelected ? styles['adjust-select-all-btn-orange'] : ''
              }`}
              onClick={handleToggleSelectAll}
              data-testid="adjust-select-all-btn"
            >
              {allSelected ? t.deselectAll || 'Deselect all' : t.selectAll || 'Select all'}
            </button>
          </div>

          <div className={styles['adjust-tx-list']}>
            {targetTxs.map((target) => {
              const isTargetSelected = selectedTargetIds.has(target.id)
              return (
                <label
                  key={target.id}
                  className={`${styles['adjust-tx-item']} ${
                    isTargetSelected ? styles['adjust-tx-item-active'] : ''
                  }`}
                  data-testid={`adjust-target-item-${target.id}`}
                >
                  <input
                    type="checkbox"
                    className={styles['adjust-tx-checkbox']}
                    checked={isTargetSelected}
                    data-testid={`adjust-target-checkbox-${target.id}`}
                    onChange={() => handleToggleTarget(target.id)}
                  />
                  <div className={styles['adjust-tx-content']}>
                    <div className={styles['adjust-tx-main']}>
                      <span className={styles['adjust-tx-desc']} title={target.description}>
                        {target.description}
                      </span>
                      <span className={styles['adjust-tx-date']}>
                        {formatDate(target.date)}
                      </span>
                    </div>
                    <div className={styles['adjust-tx-right']}>
                      <span className={styles['adjust-tx-amount']}>
                        {formatCurrency(target.amount)}
                      </span>
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}
