import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2, X } from 'lucide-react'

import { localeLabels, localeOrder } from '../../i18n/translations'
import { useLanguageStore } from '../../store/useLanguageStore'
import type { CustomCategory } from '../../types'
import { ICON_COLORS } from '../../utils/category-colors'
import { AVAILABLE_ICONS } from '../../utils/category-icons'
import { IconPickerModal } from './IconPickerModal'

import styles from './EditCategoryModal.module.css'

interface EditCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: CustomCategory | null
  onSave: (updatedCategory: CustomCategory) => void
}

interface EditCategoryModalContentProps {
  category: CustomCategory
  onClose: () => void
  onSave: (updatedCategory: CustomCategory) => void
}

const EditCategoryModalContent: React.FC<EditCategoryModalContentProps> = ({
  category,
  onClose,
  onSave,
}) => {
  const t = useLanguageStore((s) => s.t)
  const currentLocale = useLanguageStore((s) => s.locale)

  const [selectedIcon, setSelectedIcon] = useState<string>(category.icon || '')
  const [translations, setTranslations] = useState<Record<string, string>>({
    ...(category.translations || {}),
  })
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false)

  const handleTranslationChange = (locale: string, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [locale]: value,
    }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    // Clean up empty strings
    const cleanedTranslations: Record<string, string> = {}
    for (const [loc, val] of Object.entries(translations)) {
      if (val && val.trim()) {
        cleanedTranslations[loc] = val.trim()
      }
    }

    // Ensure fallback exists
    if (Object.keys(cleanedTranslations).length === 0) {
      return
    }

    onSave({
      id: category.id,
      icon: selectedIcon || undefined,
      translations: cleanedTranslations,
    })

    onClose()
  }

  const hasAnyTranslation = Object.values(translations).some((v) => v && v.trim().length > 0)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3>{t.editCategoryTitle || 'Edit Category'}</h3>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            title={t.close || 'Close'}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className={styles.scrollArea}>
          {/* Icon Section */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>
              {t.chooseIconTitle || 'Category Icon'}
            </label>
            <div className={styles.iconRow}>
              <button
                type="button"
                className={styles.iconSelectorBtn}
                onClick={() => setIsIconPickerOpen(true)}
                title={t.chooseIconTitle}
              >
                {selectedIcon && AVAILABLE_ICONS[selectedIcon] ? (
                  React.createElement(AVAILABLE_ICONS[selectedIcon], {
                    size: 20,
                    color: ICON_COLORS[selectedIcon] || '#8b5cf6',
                  })
                ) : (
                  <div className={styles.iconPlaceholder}>
                    <Plus size={16} />
                  </div>
                )}
              </button>

              {selectedIcon && (
                <button
                  type="button"
                  className={styles.removeIconBtn}
                  onClick={() => setSelectedIcon('')}
                  title={t.removeIcon || 'Remove icon'}
                >
                  <Trash2 size={14} />
                  {t.removeIcon || 'Remove icon'}
                </button>
              )}
            </div>
          </div>

          {/* Translations Section */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>
              {t.addTranslationsTitle || 'Category Name & Translations'}
            </label>
            <div className={styles.translationsHelp}>
              {t.optionalTranslationsHelp || 'Provide names for different languages.'}
            </div>

            <div className={styles.translationsGrid}>
              {localeOrder.map((loc) => {
                const isCurrent = loc === currentLocale
                return (
                  <div
                    key={loc}
                    className={`${styles.translationRow} ${isCurrent ? styles.activeRow : ''}`}
                  >
                    <img
                      src={localeLabels[loc].flag}
                      alt=""
                      className={styles.flagIcon}
                    />
                    <span className={styles.langLabel}>
                      {localeLabels[loc].native}
                      {isCurrent && ' *'}
                    </span>
                    <input
                      type="text"
                      placeholder={isCurrent ? t.name : t.translation}
                      value={translations[loc] ?? ''}
                      onChange={(e) => handleTranslationChange(loc, e.target.value)}
                      className={styles.transInput}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
            >
              {t.cancel || 'Cancel'}
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={!hasAnyTranslation}
            >
              {t.saveChanges || 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>

      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelectIcon={setSelectedIcon}
        selectedIcon={selectedIcon}
      />
    </div>
  )
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSave,
}) => {
  if (!isOpen || !category) return null

  return createPortal(
    <AnimatePresence>
      <EditCategoryModalContent
        key={category.id}
        category={category}
        onClose={onClose}
        onSave={onSave}
      />
    </AnimatePresence>,
    document.body,
  )
}

