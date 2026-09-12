import React, { useState } from 'react'
import { AnimatePresence,motion } from 'framer-motion'
import { Globe, Pencil,Plus, Tag, X } from 'lucide-react'

import { localeLabels } from '../../i18n/translations'
import { useAppStore } from '../../store/useAppStore'
import { useLanguageStore } from '../../store/useLanguageStore'
import type { CustomCategory } from '../../types'
import { ICON_COLORS } from '../../utils/category-colors'
import { AVAILABLE_ICONS, getCategoryIcon } from '../../utils/category-icons'
import { EditCategoryModal } from './EditCategoryModal'
import { IconPickerModal } from './IconPickerModal'
import { TranslationsModal } from './TranslationsModal'

import styles from './CustomCategoriesSettings.module.css'

export const CustomCategoriesSettings: React.FC = () => {
  const t = useLanguageStore((s) => s.t)
  const currentLocale = useLanguageStore((s) => s.locale)
  const {
    customCategories,
    addCustomCategory,
    updateCustomCategory,
    deleteCustomCategory,
  } = useAppStore()

  const [newCatName, setNewCatName] = useState('')
  const [newIcon, setNewIcon] = useState<string>('')
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false)
  const [showTranslations, setShowTranslations] = useState(false)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null)

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    const id = `custom_${Date.now()}`

    // Auto-fill the default locale if not explicitly set in translations
    const finalTranslations = { ...translations }
    if (!finalTranslations[currentLocale]) {
      finalTranslations[currentLocale] = newCatName.trim()
    }
    // Set 'en' as fallback just in case
    if (!finalTranslations['en']) {
      finalTranslations['en'] = newCatName.trim()
    }

    addCustomCategory({
      id,
      icon: newIcon || undefined,
      translations: finalTranslations,
    })

    setNewCatName('')
    setNewIcon('')
    setTranslations({})
    setShowTranslations(false)
  }

  const handleTranslationChange = (locale: string, value: string) => {
    if (locale === currentLocale) {
      setNewCatName(value)
    } else {
      setTranslations((prev) => ({
        ...prev,
        [locale]: value,
      }))
    }
  }

  return (
    <div className={`glass-card ${styles.container}`}>
      <div className={styles.header}>
        <h3 className={styles.sectionTitle}>
          <Tag size={18} />
          {t.yourCategories}
        </h3>
        <span className={styles.badge}>
          {t.customCount.replace('{count}', String(customCategories.length))}
        </span>
      </div>

      {/* Add New Form */}
      <div className={styles.addFormContainer}>
        <form onSubmit={handleAddCategory} className={styles.addForm}>
          <div className={styles.mainInputGroup}>
            <button
              type="button"
              className={styles.iconSelectorBtn}
              onClick={() => setIsIconPickerOpen(true)}
              title={t.chooseIconTitle}
            >
              {newIcon && AVAILABLE_ICONS[newIcon] ? (
                React.createElement(AVAILABLE_ICONS[newIcon], {
                  size: 20,
                  color: ICON_COLORS[newIcon] || '#8b5cf6',
                })
              ) : (
                <div className={styles.iconPlaceholder}>
                  <Plus size={16} />
                </div>
              )}
            </button>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder={t.newCategoryNamePlaceholder}
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className={styles.mainInput}
                required
              />
            </div>

            <button
              type="button"
              className={`${styles.toggleTranslationBtn} ${showTranslations ? styles.active : ''}`}
              onClick={() => setShowTranslations(!showTranslations)}
              title={t.addTranslationsTitle}
            >
              <Globe size={18} />
            </button>
            <button
              type="submit"
              className={styles.addButton}
              disabled={!newCatName.trim()}
            >
              <Plus size={16} /> {t.add}
            </button>
          </div>
        </form>
      </div>

      <TranslationsModal
        isOpen={showTranslations}
        onClose={() => setShowTranslations(false)}
        translations={translations}
        onTranslationChange={handleTranslationChange}
        newCatName={newCatName}
      />

      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelectIcon={setNewIcon}
        selectedIcon={newIcon}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={!!editingCategory}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSave={updateCustomCategory}
      />

      {/* List */}
      <div className={styles.categoriesList}>
        <AnimatePresence>
          {customCategories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.categoryCard}
            >
              <div className={styles.catInfo}>
                <div className={styles.catName}>
                  {getCategoryIcon(cat.id, 16, customCategories)}
                  <span>
                    {cat.translations?.[currentLocale] || cat.translations?.['en'] || cat.id}
                  </span>
                </div>
                <div className={styles.catTranslations}>
                  {Object.entries(cat.translations || {}).map(([loc, val]) => {
                    if (loc === currentLocale) return null
                    const langLoc = loc as keyof typeof localeLabels
                    return (
                      <span
                        key={loc}
                        className={styles.transBadge}
                        title={localeLabels[langLoc]?.native}
                      >
                        <img src={localeLabels[langLoc]?.flag} alt="" /> {val}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  onClick={() => setEditingCategory(cat)}
                  className={styles.editBtn}
                  title={t.editCategory || 'Edit category'}
                  aria-label={t.editCategory || 'Edit category'}
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteCustomCategory(cat.id)}
                  className={styles.deleteBtn}
                  title={t.deleteCategory}
                  aria-label={t.deleteCategory}
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {customCategories.length === 0 && (
          <div className={styles.emptyState}>
            <p>{t.noCustomCategories || 'No custom categories yet.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
