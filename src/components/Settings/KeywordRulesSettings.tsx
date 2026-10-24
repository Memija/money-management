import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Info,
  Plus,
  Tag,
  Type,
  X,
} from 'lucide-react'

import { POPULAR_MERCHANTS } from '../../data/merchants'
import { DEFAULT_CATEGORY_KEYS } from '../../i18n/categories'
import { useAppStore } from '../../store/useAppStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import { ICON_COLORS } from '../../utils/category-colors'
import { AVAILABLE_ICONS, MERCHANT_LOGOS } from '../../utils/category-icons'
import { getCategoryLabel } from '../../utils/category-utils'
import { CategoryIcon } from '../shared/CategoryIcon'
import { CategorySelect } from '../shared/CategorySelect'

import styles from './KeywordRulesSettings.module.css'

export const KeywordRulesSettings: React.FC = () => {
  const t = useLanguageStore((s) => s.t)
  const currentLocale = useLanguageStore((s) => s.locale)
  const {
    customKeywords,
    customCategories,
    setCustomKeywords,
  } = useAppStore()

  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_CATEGORY_KEYS[0])
  const [newKeyword, setNewKeyword] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyword.trim()) {
      return
    }
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
      categoryKeywords.filter((k) => k !== keyword),
    )
  }

  const handleRemoveCategoryRules = (category: string) => {
    setCustomKeywords(category, [])
  }

  const hasKeywords = Object.values(customKeywords).some(
    (keywords) => keywords && keywords.length > 0,
  )

  const filteredMerchants = newKeyword.trim()
    ? POPULAR_MERCHANTS.filter(
        (m) =>
          m.name.toLowerCase().includes(newKeyword.toLowerCase()) ||
          m.keyword.toLowerCase().includes(newKeyword.toLowerCase()),
      ).filter((m) => {
        const catKeys = customKeywords[m.category] || []
        return !catKeys.includes(m.keyword)
      })
    : []

  const handleSelectMerchant = (merchant: (typeof POPULAR_MERCHANTS)[0]) => {
    setSelectedCategory(merchant.category)
    setNewKeyword(merchant.keyword)
    setShowSuggestions(false)
  }

  return (
    <div className={styles.contentGrid}>
      {/* Left Column: Form */}
      <div className={styles.formSection}>
        <div className={`glass-card ${styles.formCard}`}>
          <div className={styles.cardHeader}>
            <h3>{t.createCustomRule}</h3>
            <p className={styles.description}>{t.createCustomRuleDesc}</p>
          </div>

          <div className={styles.rulesForm}>
            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.labelWithIcon}`}>
                <Tag size={14} className={styles.labelIcon} />
                {t.targetCategory}
              </label>
              <CategorySelect value={selectedCategory} onChange={setSelectedCategory} />
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
                  <button
                    type="submit"
                    className={styles.addButton}
                    disabled={!newKeyword.trim()}
                  >
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
                      {filteredMerchants.map((merchant) => {
                        const LogoComp = merchant.logo ? MERCHANT_LOGOS[merchant.logo] : null
                        const IconComp =
                          AVAILABLE_ICONS[merchant.icon as keyof typeof AVAILABLE_ICONS]

                        return (
                          <div
                            key={merchant.id}
                            className={styles.autocompleteItem}
                            onClick={() => handleSelectMerchant(merchant)}
                          >
                            <div className={styles.merchantIconWrapper}>
                              {LogoComp ? (
                                <LogoComp
                                  size={16}
                                  color={merchant.brandColor || 'var(--text-main)'}
                                />
                              ) : (
                                IconComp && (
                                  <IconComp
                                    size={16}
                                    color={
                                      merchant.brandColor ||
                                      ICON_COLORS[merchant.icon] ||
                                      'var(--primary)'
                                    }
                                  />
                                )
                              )}
                            </div>
                            <div className={styles.merchantItemInfo}>
                              <span className={styles.merchantItemName}>{merchant.name}</span>
                              <span className={styles.merchantItemCategory}>
                                {getCategoryLabel(
                                  merchant.category,
                                  t,
                                  currentLocale,
                                  customCategories,
                                )}
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
            {t.rulesTotal.replace(
              '{count}',
              Object.values(customKeywords)
                .reduce((acc, curr) => acc + (curr?.length || 0), 0)
                .toString(),
            )}
          </span>
        </div>

        {!hasKeywords ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <Tag size={32} />
            </div>
            <h4>{t.noCustomRules}</h4>
            <p>{t.noCustomRulesDesc}</p>
          </div>
        ) : (
          <div className={styles.keywordsGrid}>
            {Object.entries(customKeywords).map(([category, keywords]) => {
              if (!keywords || keywords.length === 0) {
                return null
              }

              return (
                <div key={category} className={`glass-card ${styles.keywordCard}`}>
                  <div className={styles.keywordCardHeader}>
                    <div className={styles.keywordGroupTitle}>
                      <CategoryIcon
                        category={category}
                        size={20}
                        customCategories={customCategories}
                      />
                      <span className={styles.keywordGroupLabel}>
                        {getCategoryLabel(category, t, currentLocale, customCategories)}
                      </span>
                    </div>
                    <div className={styles.keywordCardActions}>
                      <span className={styles.countBadge}>{keywords.length}</span>
                      <button
                        className={styles.removeCategoryBtn}
                        onClick={() => handleRemoveCategoryRules(category)}
                        title={`${t.deleteCategory || 'Delete'} ${getCategoryLabel(category, t, currentLocale, customCategories)}`}
                        aria-label={`${t.deleteCategory || 'Delete'} ${getCategoryLabel(category, t, currentLocale, customCategories)}`}
                        data-testid={`remove-category-rules-${category}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.tags}>
                    {keywords.map((kw) => (
                      <span key={kw} className={styles.tag}>
                        <span className={styles.tagText}>{kw}</span>
                        <button
                          className={styles.removeTagBtn}
                          onClick={() => handleRemoveKeyword(category, kw)}
                          title={`${t.deleteCategory || 'Remove'} ${kw}`}
                          aria-label={`${t.deleteCategory || 'Remove'} ${kw}`}
                          data-testid={`remove-rule-btn-${kw}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
