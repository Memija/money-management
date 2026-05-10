import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Plus,
  ArrowRight,
  Building2,
  Calendar,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useLanguageStore } from '../store/useLanguageStore';
import styles from './ImportReview.module.css';

const ImportReview: React.FC = () => {
  const { importedAccounts, startNewInstitution, setStep } = useAppStore();
  const t = useLanguageStore((s) => s.t);

  const totalTransactions = importedAccounts.reduce(
    (sum, acc) => sum + acc.transactions.length,
    0
  );
  const totalIncome = importedAccounts.reduce(
    (sum, acc) =>
      sum + acc.transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    0
  );
  const totalExpenses = importedAccounts.reduce(
    (sum, acc) =>
      sum +
      acc.transactions
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + Math.abs(t.amount), 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="onboarding-container"
    >
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
        <p className="onboarding-subtitle">
          {t.importSuccessSubtitle}
        </p>
      </div>

      {/* Summary Cards */}
      <div className={styles['review-stats-grid']}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles['review-stat-card']}
        >
          <div className={styles['review-stat-icon']} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
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
          <div className={styles['review-stat-icon']} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
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
          <div className={styles['review-stat-icon']} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
            <TrendingUp size={20} />
          </div>
          <div className={styles['review-stat-value']}>
            {totalIncome.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </div>
          <div className={styles['review-stat-label']}>{t.totalIncome}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={styles['review-stat-card']}
        >
          <div className={styles['review-stat-icon']} style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#fb7185' }}>
            <TrendingDown size={20} />
          </div>
          <div className={styles['review-stat-value']}>
            {totalExpenses.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </div>
          <div className={styles['review-stat-label']}>{t.totalExpenses}</div>
        </motion.div>
      </div>

      {/* Imported Accounts List */}
      <div className={styles['imported-accounts-list']}>
        {importedAccounts.map((acc, idx) => (
          <motion.div
            key={idx}
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
                  {acc.transactions.length} {t.transactions.toLowerCase()} • {t.imported}{' '}
                  {new Date(acc.importedAt).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <CheckCircle2 size={18} className={styles['imported-check']} />
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className={styles['review-actions']}>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="secondary-button"
          onClick={startNewInstitution}
          id="add-another-institution"
        >
          <Plus size={18} />
          {t.addAnotherInstitution}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-button"
          onClick={() => setStep('dashboard')}
          id="proceed-to-dashboard"
        >
          {t.proceedToAnalysis}
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ImportReview;
