import React, { useMemo, useState } from 'react'
import { Building2, Check, ShieldAlert, Trash2 } from 'lucide-react'

import { findInstitution } from '../../../data/institutions'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { ImportedAccount } from '../../../types'
import { DeleteConfirmationModal } from '../../shared/DeleteConfirmationModal'
import { BackupRestore } from '../BackupRestore'

import styles from './DataManagement.module.css'

export interface DataManagementProps {
  className?: string
}

export const DataManagement: React.FC<DataManagementProps> = ({ className }) => {
  const t = useLanguageStore((s) => s.t)
  const { importedAccounts, customCategories, customKeywords, clearAllData, removeImportedAccount } =
    useAppStore()

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [resetPreferences, setResetPreferences] = useState(false)
  const [bankToDelete, setBankToDelete] = useState<ImportedAccount | null>(null)
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({})

  const accountsCount = (importedAccounts || []).length
  const transactionsCount = useMemo(
    () =>
      (importedAccounts || []).reduce(
        (sum, acc) =>
          sum +
          (acc.transactions?.length || 0) +
          (acc.duplicateTransactions?.length || 0) +
          (acc.modifiedTransactions?.length || 0),
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
    <div className={className}>
      <BackupRestore />

      <section
        className={styles.container}
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

      <div className={styles.banksSection}>
        <div className={styles.summaryTitle}>
          {t.connectedBanksTitle || 'Connected Accounts & Banks'}
        </div>

        {importedAccounts.length === 0 ? (
          <div className={styles.emptyAccounts}>
            <p>{t.noConnectedBanks || 'No accounts imported yet'}</p>
          </div>
        ) : (
          <div className={styles.bankList}>
            {importedAccounts.map((account) => {
              const institution = findInstitution(account.institutionName || account.institutionId)
              const hasLogo = Boolean(
                institution?.logo && !failedLogos[account.institutionId || account.institutionName],
              )
              const txCount =
                (account.transactions?.length || 0) +
                (account.duplicateTransactions?.length || 0) +
                (account.modifiedTransactions?.length || 0)

              return (
                <div
                  key={account.institutionId}
                  className={styles.bankCard}
                  data-testid={`bank-card-${account.institutionId}`}
                >
                  <div className={styles.bankInfo}>
                    <div className={styles.bankLogoWrapper}>
                      {hasLogo ? (
                        <img
                          src={institution!.logo}
                          alt=""
                          className={styles.bankLogo}
                          aria-hidden="true"
                          onError={() => {
                            setFailedLogos((prev) => ({
                              ...prev,
                              [account.institutionId || account.institutionName]: true,
                            }))
                          }}
                        />
                      ) : (
                        <Building2 size={20} className={styles.fallbackIcon} aria-hidden="true" />
                      )}
                    </div>
                    <div className={styles.bankDetails}>
                      <span className={styles.bankName}>
                        {account.institutionName || institution?.name || 'Bank'}
                      </span>
                      <span className={styles.bankMeta}>
                        {(t.deleteDataTransactionsCount || '{count} transactions').replace(
                          '{count}',
                          String(txCount),
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.deleteBankButton}
                    onClick={() => setBankToDelete(account)}
                    aria-label={`${t.deleteBankTransactions || 'Delete Transactions'} - ${account.institutionName}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    <span>{t.deleteBankTransactions || 'Delete Transactions'}</span>
                  </button>
                </div>
              )
            })}
          </div>
        )}
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

      {bankToDelete && (
        <DeleteConfirmationModal
          isOpen={Boolean(bankToDelete)}
          onClose={() => setBankToDelete(null)}
          onConfirm={() => {
            if (bankToDelete) {
              removeImportedAccount?.(bankToDelete.institutionId || bankToDelete.institutionName)
              setBankToDelete(null)
            }
          }}
          title={(t.deleteBankTransactionsTitle || 'Delete {bank} Transactions').replace(
            '{bank}',
            bankToDelete.institutionName || 'Bank',
          )}
          message={(
            t.deleteBankTransactionsConfirm ||
            'Are you sure you want to delete all transactions and data for {bank}? This action cannot be undone.'
          ).replace('{bank}', bankToDelete.institutionName || 'Bank')}
          confirmText={t.deleteBankTransactions || 'Delete Transactions'}
          cancelText={t.cancel || 'Cancel'}
        />
      )}
    </section>
  </div>
  )
}
