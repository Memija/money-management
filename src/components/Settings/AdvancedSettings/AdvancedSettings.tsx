import React, { useMemo } from 'react'
import { ImageOff, Info, SlidersHorizontal } from 'lucide-react'

import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { hasMerchantLogo } from '../../../utils/category-icons'

import styles from './AdvancedSettings.module.css'

export const AdvancedSettings: React.FC = () => {
  const t = useLanguageStore((s) => s.t)
  const importedAccounts = useAppStore((s) => s.importedAccounts)
  const filterTransactionsWithoutLogos = useAppStore((s) => s.filterTransactionsWithoutLogos)
  const setFilterTransactionsWithoutLogos = useAppStore((s) => s.setFilterTransactionsWithoutLogos)

  // Calculate live statistics across imported transactions
  const { totalTxs, withoutLogoCount } = useMemo(() => {
    const allTxs = importedAccounts.flatMap((a) => a.transactions || [])
    let withoutLogo = 0
    for (let i = 0; i < allTxs.length; i++) {
      if (!hasMerchantLogo(allTxs[i].description, allTxs[i].counterpartyIban)) {
        withoutLogo++
      }
    }
    return {
      totalTxs: allTxs.length,
      withoutLogoCount: withoutLogo,
    }
  }, [importedAccounts])

  const handleToggle = () => {
    setFilterTransactionsWithoutLogos(!filterTransactionsWithoutLogos)
  }

  return (
    <div className={styles.container}>
      <div className={`glass-card ${styles.card}`}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <SlidersHorizontal size={22} className={styles.headerIcon} aria-hidden="true" />
            <h3 className={styles.title}>{t.advancedSettingsTitle || 'Advanced Settings'}</h3>
          </div>
          <p className={styles.description}>
            {t.advancedSettingsDesc || 'Configure advanced options and specialized transaction filters.'}
          </p>
        </div>

        <div className={styles.optionsList}>
          <div
            className={`${styles.optionCard} ${
              filterTransactionsWithoutLogos ? styles.optionCardActive : ''
            }`}
          >
            <div className={styles.optionLeft}>
              <div className={styles.optionIconWrapper} aria-hidden="true">
                <ImageOff size={20} />
              </div>
              <div className={styles.optionText}>
                <h4 className={styles.optionTitle}>
                  {t.filterWithoutLogosTitle || 'Filter transactions without logos'}
                </h4>
                <p className={styles.optionDesc}>
                  {t.filterWithoutLogosDesc ||
                    "Applies only to 'All Transactions' at the bottom of the dashboard and displays transactions without logos."}
                </p>
                {totalTxs > 0 && (
                  <div className={styles.statsRow}>
                    <span className={styles.statPill}>
                      <span className={styles.statHighlight}>{withoutLogoCount}</span>
                      <span>
                        / {totalTxs} {t.transactions || 'transactions'} {t.filterWithoutLogosBadge?.toLowerCase() || 'without logos'}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.optionRight}>
              <span
                className={`${styles.statusBadge} ${
                  filterTransactionsWithoutLogos ? styles.statusActive : styles.statusInactive
                }`}
              >
                {filterTransactionsWithoutLogos ? (t.active || 'Active') : (t.inactive || 'Inactive')}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={filterTransactionsWithoutLogos}
                aria-label={t.filterWithoutLogosTitle || 'Filter transactions without logos'}
                onClick={handleToggle}
                className={`${styles.switchButton} ${
                  filterTransactionsWithoutLogos ? styles.switchButtonActive : ''
                }`}
                data-testid="toggle-filter-without-logos"
              >
                <span
                  className={`${styles.switchKnob} ${
                    filterTransactionsWithoutLogos ? styles.switchKnobActive : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.infoBox}>
          <Info size={16} aria-hidden="true" />
          <p>
            {t.filterWithoutLogosInfo ||
              'This option helps you identify transactions and merchants that do not yet have an assigned brand logo. It only filters the All Transactions list at the bottom of the dashboard.'}
          </p>
        </div>
      </div>
    </div>
  )
}
