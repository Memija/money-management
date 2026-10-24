import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CopyCheck,
  Database,
  Settings as SettingsIcon,
  Sliders,
  SlidersHorizontal,
} from 'lucide-react'

import { useAppStore } from '../../store/useAppStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import { AdvancedSettings } from './AdvancedSettings'
import { CustomCategoriesSettings } from './CustomCategoriesSettings'
import { DataManagement } from './DataManagement'
import { DuplicateRulesSettings } from './DuplicateRulesSettings'
import { KeywordRulesSettings } from './KeywordRulesSettings'

import styles from './Settings.module.css'

export const Settings: React.FC = () => {
  const t = useLanguageStore((s) => s.t)
  const { importedAccounts, duplicateOverrideRules, setStep } = useAppStore()

  const [activeTab, setActiveTab] = useState<
    'categories' | 'duplicate-rules' | 'advanced' | 'data'
  >('categories')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.container}
    >
      <div className={styles.header}>
        <button
          className={`back-button ${styles.backButtonClean}`}
          onClick={() => setStep(importedAccounts.length > 0 ? 'dashboard' : 'country')}
        >
          <ArrowLeft size={16} className={styles.backButtonIcon} />
          <span>{t.back}</span>
        </button>
        <div className={styles.titleWrapper}>
          <SettingsIcon size={24} className={styles.titleIcon} />
          <h2>{t.settingsTitle}</h2>
        </div>
      </div>

      <div className={styles.tabNav} role="tablist" aria-label={t.settingsTitle}>
        <button
          type="button"
          role="tab"
          id="tab-categories"
          aria-selected={activeTab === 'categories'}
          aria-controls="tabpanel-categories"
          className={`${styles.tabButton} ${activeTab === 'categories' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Sliders size={16} aria-hidden="true" />
          <span>{t.categoriesAndRules || 'Categories & Rules'}</span>
        </button>

        {((duplicateOverrideRules?.length ?? 0) > 0 ||
          importedAccounts.some((a) => (a.duplicateTransactions?.length ?? 0) > 0)) && (
          <button
            type="button"
            role="tab"
            id="tab-duplicate-rules"
            aria-selected={activeTab === 'duplicate-rules'}
            aria-controls="tabpanel-duplicate-rules"
            className={`${styles.tabButton} ${activeTab === 'duplicate-rules' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('duplicate-rules')}
            data-testid="tab-duplicate-rules"
          >
            <CopyCheck size={16} aria-hidden="true" />
            <span>{t.duplicateRulesTab || 'Duplicate Rules'}</span>
          </button>
        )}

        <button
          type="button"
          role="tab"
          id="tab-advanced"
          aria-selected={activeTab === 'advanced'}
          aria-controls="tabpanel-advanced"
          className={`${styles.tabButton} ${activeTab === 'advanced' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('advanced')}
          data-testid="tab-advanced"
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          <span>{t.advancedTab || 'Advanced'}</span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-data"
          aria-selected={activeTab === 'data'}
          aria-controls="tabpanel-data"
          className={`${styles.tabButton} ${activeTab === 'data' ? `${styles.tabButtonActive} ${styles.tabButtonDangerActive}` : ''}`}
          onClick={() => setActiveTab('data')}
        >
          <Database size={16} aria-hidden="true" />
          <span>{t.dataManagementTitle || 'Data Management'}</span>
        </button>
      </div>

      {activeTab === 'categories' && (
        <div role="tabpanel" id="tabpanel-categories" aria-labelledby="tab-categories">
          <CustomCategoriesSettings />
          <div className={styles.sectionSpacer} />
          <KeywordRulesSettings />
        </div>
      )}

      {activeTab === 'duplicate-rules' && (
        <div role="tabpanel" id="tabpanel-duplicate-rules" aria-labelledby="tab-duplicate-rules">
          <DuplicateRulesSettings />
        </div>
      )}

      {activeTab === 'advanced' && (
        <div role="tabpanel" id="tabpanel-advanced" aria-labelledby="tab-advanced">
          <AdvancedSettings />
        </div>
      )}

      {activeTab === 'data' && (
        <div role="tabpanel" id="tabpanel-data" aria-labelledby="tab-data">
          <DataManagement />
        </div>
      )}
    </motion.div>
  )
}
