import React, { useMemo, useState } from 'react'
import { Check, ShieldAlert, Trash2 } from 'lucide-react'

import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { DeleteConfirmationModal } from '../../shared/DeleteConfirmationModal'

import styles from './DataManagement.module.css'

export interface DataManagementProps {
  className?: string
}

export const DataManagement: React.FC<DataManagementProps> = ({ className }) => {
  const t = useLanguageStore((s) => s.t)
  const { importedAccounts, customCategories, customKeywords, clearAllData } = useAppStore()

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [resetPreferences, setResetPreferences] = useState(false)

  const accountsCount = (importedAccounts || []).length
  const transactionsCount = useMemo(
    () =>
      (importedAccounts || []).reduce(
        (sum, acc) =>
          sum + (acc.transactions?.length || 0) + (acc.duplicateTransactions?.length || 0),
        0,
      ),
    [importedAccounts],
  )
  const categoriesCount = (customCategories || []).length
  const rulesCount = useMemo(
    () =>
      Object.values(customKeywords || {}).reduce(
        (sum, keywords) => sum + (keywords?.length || 0),
        0,
      ),
    [customKeywords],
  )

  const handleConfirmDelete = () => {
    clearAllData?.(resetPreferences)
    setIsConfirmOpen(false)
  }

  return (
    <section
      className={`${styles.container} ${className || ''}`}
      aria-labelledby="data-management-heading"
      id="data-management-section"
    >
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <ShieldAlert size={22} className={styles.titleIcon} aria-hidden="true" />
          <h3 id="data-management-heading" className={styles.title}>
            {t.dataManagementTitle || 'Data Management'}
          </h3>
        </div>
        <span className={styles.dangerBadge}>{t.dangerZone || 'Danger Zone'}</span>
      </div>

      <p className={styles.description}>{t.deleteAllDataDesc}</p>

      <div className={styles.summarySection}>
        <div className={styles.summaryTitle}>{t.storedDataSummary || 'Stored Data'}</div>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{accountsCount}</span>
            <span className={styles.statLabel}>
              {(t.deleteDataAccountsCount || '{count} accounts').replace('{count}', String(accountsCount))}
            </span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statValue}>{transactionsCount}</span>
            <span className={styles.statLabel}>
              {(t.deleteDataTransactionsCount || '{count} transactions').replace(
                '{count}',
                String(transactionsCount),
              )}
            </span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statValue}>{categoriesCount}</span>
            <span className={styles.statLabel}>
              {(t.deleteDataCategoriesCount || '{count} custom categories').replace(
                '{count}',
                String(categoriesCount),
              )}
            </span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statValue}>{rulesCount}</span>
            <span className={styles.statLabel}>
              {(t.deleteDataRulesCount || '{count} custom rules').replace('{count}', String(rulesCount))}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          id="delete-all-data-button"
          className={styles.deleteButton}
          onClick={() => setIsConfirmOpen(true)}
          aria-label={t.deleteAllDataButton || 'Delete All Data'}
        >
          <Trash2 size={16} aria-hidden="true" />
          <span>{t.deleteAllDataButton || 'Delete All Data'}</span>
        </button>
      </div>

      <DeleteConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t.deleteAllDataTitle || 'Delete All Data'}
        message={
          t.deleteAllDataConfirmMessage ||
          'Are you sure you want to completely delete all of your data?'
        }
        confirmText={t.deleteAllDataButton || 'Delete All Data'}
        cancelText={t.cancel || 'Cancel'}
      >
        <label
          className={`${styles.selectionCard} ${resetPreferences ? styles.selectionCardActive : ''}`}
        >
          <div className={styles.selectionCardContent}>
            <span className={styles.selectionTitle}>
              {t.resetPreferencesOption || 'Also reset theme and language preferences'}
            </span>
            <span className={styles.selectionSubtitle}>
              {t.resetPreferencesDesc || 'Revert display language and theme back to default settings'}
            </span>
          </div>
          <div className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              checked={resetPreferences}
              onChange={(e) => setResetPreferences(e.target.checked)}
              className={styles.hiddenCheckbox}
            />
            <div
              className={`${styles.customCheckbox} ${resetPreferences ? styles.customCheckboxChecked : ''}`}
              aria-hidden="true"
            >
              {resetPreferences && <Check size={12} strokeWidth={3} />}
            </div>
          </div>
        </label>
      </DeleteConfirmationModal>
    </section>
  )
}
