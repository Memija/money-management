import React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Ghost,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import { useFormatters } from '../../hooks/useFormatters'
import { useAppStore } from '../../store/useAppStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import type { ImportedAccount } from '../../types'

import styles from './ImportReview.module.css'

const ImportReview: React.FC = () => {
  const importedAccounts = useAppStore((s) => s.importedAccounts)
  const startNewInstitution = useAppStore((s) => s.startNewInstitution)
  const setStep = useAppStore((s) => s.setStep)
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency, formatTransactionCount, locale } = useFormatters()
  // Map bs/sr to de-DE consistent with useFormatters (Chromium stripped ICU data for these)
  const intlLocale = locale === 'bs' || locale === 'sr' ? 'de-DE' : locale

  const getAllAccountTransactions = (acc: ImportedAccount) => [
    ...(acc.transactions || []),
    ...(acc.duplicateTransactions || []),
    ...(acc.modifiedTransactions || []),
  ]

  const hasDuplicateTransactions = React.useMemo(() => {
    return importedAccounts.some(
      (acc) =>
        Boolean(acc.duplicateTransactions && acc.duplicateTransactions.length > 0) ||
        Boolean(acc.modifiedTransactions && acc.modifiedTransactions.length > 0) ||
        acc.transactions.some(
          (tx) =>
            Boolean(tx.forceImport) || Boolean(tx.isDuplicate) || Boolean(tx.importedByRuleId),
        ),
    )
  }, [importedAccounts])

  const totalTransactions = React.useMemo(
    () =>
      importedAccounts.reduce(
        (sum, acc) =>
          sum +
          acc.transactions.length +
          (acc.duplicateTransactions?.length || 0) +
          (acc.modifiedTransactions?.length || 0),
        0,
      ),
    [importedAccounts],
  )

  const { totalIncome, totalExpenses } = React.useMemo(() => {
    let inc = 0
    let exp = 0
    for (const acc of importedAccounts) {
      const all = [
        ...(acc.transactions || []),
        ...(acc.duplicateTransactions || []),
        ...(acc.modifiedTransactions || []),
      ]
      for (const t of all) {
        if (t.isGhost) continue
        if (t.type === 'income') inc += t.amount
        else if (t.type === 'expense') exp += Math.abs(t.amount)
      }
    }
    return { totalIncome: inc, totalExpenses: exp }
  }, [importedAccounts])

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="onboarding-icon"
        >
          <CheckCircle2 size={32} />
        </motion.div>
        <h1 className="onboarding-title">{t.importSuccessTitle}</h1>
        <p className="onboarding-subtitle">{t.importSuccessSubtitle}</p>
      </div>

      {/* Summary Cards */}
      <div className={styles['review-stats-grid']}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles['review-stat-card']}
        >
          <div className={`${styles['review-stat-icon']} ${styles['icon-institutions']}`}>
            <Building2 size={20} />
          </div>
          <div className={styles['review-stat-value']}>{importedAccounts.length}</div>
          <div className={styles['review-stat-label']}>{t.institutions}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={styles['review-stat-card']}
        >
          <div className={`${styles['review-stat-icon']} ${styles['icon-transactions']}`}>
            <Calendar size={20} />
          </div>
          <div className={styles['review-stat-value']}>{totalTransactions}</div>
          <div className={styles['review-stat-label']}>{t.transactions}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={styles['review-stat-card']}
        >
          <div className={`${styles['review-stat-icon']} ${styles['icon-income']}`}>
            <TrendingUp size={20} />
          </div>
          <div className={styles['review-stat-value']}>{formatCurrency(totalIncome, 0)}</div>
          <div className={styles['review-stat-label']}>{t.totalIncome}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={styles['review-stat-card']}
        >
          <div className={`${styles['review-stat-icon']} ${styles['icon-expenses']}`}>
            <TrendingDown size={20} />
          </div>
          <div className={styles['review-stat-value']}>{formatCurrency(totalExpenses, 0)}</div>
          <div className={styles['review-stat-label']}>{t.totalExpenses}</div>
        </motion.div>
      </div>

      {/* Imported Accounts List */}
      <div className={styles['imported-accounts-list']}>
        {importedAccounts.map((acc, idx) => {
          const allTxs = getAllAccountTransactions(acc)
          const internalCount = allTxs.filter((tx) => tx.isGhost).length

          return (
            <motion.div
              key={acc.institutionId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className={styles['imported-account-card']}
            >
              <div className={styles['imported-account-left']}>
                <div className={styles['imported-account-icon']}>
                  <Building2 size={18} />
                </div>
                <div>
                  <p className={styles['imported-account-name']}>{acc.institutionName}</p>
                  <p className={styles['imported-account-meta']}>
                    {formatTransactionCount(allTxs.length)} • {t.imported}{' '}
                    {new Date(acc.importedAt).toLocaleTimeString(intlLocale, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {internalCount > 0 && (
                      <span className={styles['account-internal-badge']}>
                        • <Ghost size={11} aria-hidden="true" />
                        {internalCount === 1
                          ? t.accountInternalTransfersSingular
                          : t.accountInternalTransfers.replace('{count}', String(internalCount))}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <CheckCircle2 size={18} className={styles['imported-check']} />
            </motion.div>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className={styles['review-actions']}>
        <button
          className="secondary-button"
          onClick={startNewInstitution}
          id="add-another-institution"
        >
          <Plus size={18} />
          {t.addAnotherInstitution}
        </button>

        <button
          className={`primary-button ${hasDuplicateTransactions ? styles['button-warning-orange'] : styles['button-clean-green']}`}
          onClick={() => setStep('dashboard')}
          id="proceed-to-dashboard"
          data-testid="proceed-to-dashboard-btn"
        >
          {t.proceedToAnalysis}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}

export default ImportReview
