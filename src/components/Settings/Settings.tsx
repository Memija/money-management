import React, { useState } from 'react'
import { AnimatePresence,motion } from 'framer-motion'
import { ArrowLeft, Info, Plus, Settings as SettingsIcon, Tag, Type,X } from 'lucide-react'

import { POPULAR_MERCHANTS } from '../../data/merchants'
import { DEFAULT_CATEGORY_KEYS } from '../../i18n/categories'
import { useAppStore } from '../../store/useAppStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import { ICON_COLORS } from '../../utils/category-colors'
import { AVAILABLE_ICONS, getCategoryIcon, MERCHANT_LOGOS } from '../../utils/category-icons'
import { getCategoryLabel } from '../../utils/category-utils'
import { CategorySelect } from '../shared/CategorySelect'
import { CustomCategoriesSettings } from './CustomCategoriesSettings'

import styles from './Settings.module.css'

export const Settings: React.FC = () => {
  const t = useLanguageStore((s) => s.t)
  const currentLocale = useLanguageStore((s) => s.locale)
  const { customKeywords, customCategories, setCustomKeywords, setStep } = useAppStore()
  
  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_CATEGORY_KEYS[0])
  const [newKeyword, setNewKeyword] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyword.trim()) return
    const categoryKeywords = customKeywords[selectedCategory] || []
    if (categoryKeywords.includes(newKeyword.trim().toLowerCase())) {
      setNewKeyword('')
      return
    }
    setCustomKeywords(selectedCategory, [...categoryKeywords, newKeyword.trim().toLowerCase()])
    setNewKeyword('')
  }

  const handleRemoveKeyword = (category: string, keyword: string) => {
    const categoryKeywords = customKeywords[category] || []
    setCustomKeywords(
      category,
      categoryKeywords.filter((k) => k !== keyword)
    )
  }

  const hasKeywords = Object.values(customKeywords).some(keywords => keywords && keywords.length > 0)

  const filteredMerchants = newKeyword.trim() 
    ? POPULAR_MERCHANTS.filter(m => 
        m.name.toLowerCase().includes(newKeyword.toLowerCase()) || 
        m.keyword.toLowerCase().includes(newKeyword.toLowerCase())
      ).filter(m => {
        const catKeys = customKeywords[m.category] || []
        return !catKeys.includes(m.keyword)
      })
    : []

  const handleSelectMerchant = (merchant: typeof POPULAR_MERCHANTS[0]) => {
    setSelectedCategory(merchant.category)
    setNewKeyword(merchant.keyword)
    setShowSuggestions(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.container}
    >
      <div className={styles.header}>
        <button className={`back-button ${styles.backButtonClean}`} onClick={() => setStep('dashboard')}>
          <ArrowLeft size={16} className={styles.backButtonIcon} />
          <span>{t.back}</span>
        </button>
        <div className={styles.titleWrapper}>
          <SettingsIcon size={24} className={styles.titleIcon} />
          <h2>{t.settingsTitle}</h2>
        </div>
      </div>

      <CustomCategoriesSettings />

      <div className={styles.sectionSpacer} />

      <div className={styles.contentGrid}>
        {/* Left Column: Form */}
        <div className={styles.formSection}>

          <div className={styles.sectionSpacer} />

          <div className={`glass-card ${styles.formCard}`}>
            <div className={styles.cardHeader}>
              <h3>{t.createCustomRule}</h3>
              <p className={styles.description}>
                {t.createCustomRuleDesc}
              </p>
            </div>

            <div className={styles.rulesForm}>
              <div className={styles.formGroup}>
                <label className={`${styles.label} ${styles.labelWithIcon}`}>
                  <Tag size={14} className={styles.labelIcon} />
                  {t.targetCategory}
                </label>
                <CategorySelect 
                  value={selectedCategory} 
                  onChange={setSelectedCategory} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={`${styles.label} ${styles.labelWithIcon}`}>
                  <Type size={14} className={styles.labelIcon} />
                  {t.keywordOrMerchant}
                </label>
                <div className={styles.autocompleteWrapper}>
                  <form onSubmit={handleAddKeyword} className={styles.addKeywordForm}>
                    <input
                      type="text"
                      placeholder={t.keywordPlaceholder}
                      value={newKeyword}
                      onChange={(e) => {
                        setNewKeyword(e.target.value)
                        setShowSuggestions(true)
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className={styles.inputKeyword}
                    />
                    <button type="submit" className={styles.addButton} disabled={!newKeyword.trim()}>
                      <Plus size={18} /> {t.addRule}
                    </button>
                  </form>
                  
                  <AnimatePresence>
                    {showSuggestions && filteredMerchants.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={styles.autocompleteDropdown}
                      >
                        {filteredMerchants.map(merchant => {
                          const LogoComp = merchant.logo ? MERCHANT_LOGOS[merchant.logo] : null
                          const IconComp = AVAILABLE_ICONS[merchant.icon as keyof typeof AVAILABLE_ICONS]
                          
                          return (
                            <div 
                              key={merchant.id} 
                              className={styles.autocompleteItem}
                              onClick={() => handleSelectMerchant(merchant)}
                            >
                              <div className={styles.merchantIconWrapper}>
                                {LogoComp ? (
                                  <LogoComp size={16} color={merchant.brandColor || 'var(--text-main)'} />
                                ) : (
                                  IconComp && <IconComp size={16} color={merchant.brandColor || ICON_COLORS[merchant.icon] || 'var(--primary)'} />
                                )}
                              </div>
                              <div className={styles.merchantItemInfo}>
                                <span className={styles.merchantItemName}>{merchant.name}</span>
                                <span className={styles.merchantItemCategory}>
                                  {getCategoryLabel(merchant.category, t, currentLocale, customCategories)}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className={styles.infoBox}>
              <Info size={16} />
              <p>{t.manualOverridesInfo}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Existing Rules List */}
        <div className={styles.rulesListSection}>
          <div className={styles.sectionTitle}>
            <h3>{t.activeRules}</h3>
            <span className={styles.badge}>
              {t.rulesTotal.replace('{count}', String(Object.values(customKeywords).flat().length))}
            </span>
          </div>

          {!hasKeywords && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrapper}>
                <Tag size={32} />
              </div>
              <h4>{t.noCustomRules}</h4>
              <p>{t.noCustomRulesDesc}</p>
            </div>
          )}

          <div className={styles.keywordsGrid}>
            <AnimatePresence>
              {Object.entries(customKeywords).map(([catKey, keywords]) => {
                if (!keywords || keywords.length === 0) return null
                return (
                  <motion.div 
                    key={catKey}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`glass-card ${styles.keywordCard}`}
                  >
                    <div className={styles.keywordCardHeader}>
                      <div className={styles.keywordGroupTitle}>
                        {(() => {
                          const IconComp = getCategoryIcon(catKey, 20)
                          return IconComp
                        })()}
                        <span className={styles.keywordGroupLabel}>
                          {getCategoryLabel(catKey, t, currentLocale, customCategories)}
                        </span>
                      </div>
                      <span className={styles.countBadge}>{keywords.length}</span>
                    </div>
                    <div className={styles.tags}>
                      <AnimatePresence>
                        {keywords.map((kw) => (
                          <motion.div 
                            key={kw} 
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className={styles.tag}
                          >
                            <span className={styles.tagText}>{kw}</span>
                            <button onClick={() => handleRemoveKeyword(catKey, kw)} aria-label="Remove keyword">
                              <X size={14} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
