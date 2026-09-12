import React, { useState } from 'react'
import { ArrowRight, Plus, Settings, Sparkles } from 'lucide-react'

import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { ICON_COLORS } from '../../../utils/category-colors'
import { AVAILABLE_ICONS } from '../../../utils/category-icons'
import { IconPickerModal } from '../../Settings/IconPickerModal'
import { Modal } from '../Modal'

import styles from './QuickCategoryModal.module.css'

interface QuickCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreatedAndSelected: (categoryId: string) => void
}

const QUICK_ICONS = [
  'Tag',
  'ShoppingBag',
  'Tv',
  'Film',
  'Coffee',
  'Dumbbell',
  'Wifi',
  'Gamepad2',
  'Music',
  'Heart',
  'Car',
  'Plane',
]

export const QuickCategoryModal: React.FC<QuickCategoryModalProps> = ({
  isOpen,
  onClose,
  onCreatedAndSelected,
}) => {
  const { t, locale: currentLocale } = useLanguageStore()
  const addCustomCategory = useAppStore((state) => state.addCustomCategory)
  const setStep = useAppStore((state) => state.setStep)

  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string>('Tag')
  const [isFullPickerOpen, setIsFullPickerOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    const id = `custom_${Date.now()}`
    addCustomCategory({
      id,
      icon: selectedIcon || undefined,
      translations: {
        [currentLocale]: trimmed,
        en: trimmed,
      },
    })

    setName('')
    setSelectedIcon('Tag')
    onCreatedAndSelected(id)
    onClose()
  }

  const handleNavigateToSettings = () => {
    onClose()
    setStep('settings')
  }

  const SelectedIconComp = AVAILABLE_ICONS[selectedIcon]

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t.quickCreateCategoryTitle}
        maxWidth="440px"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="quick-category-name" className={styles.label}>
              {t.name || 'Name'}
            </label>
            <input
              id="quick-category-name"
              type="text"
              autoFocus
              className={styles.input}
              placeholder={t.newCategoryNamePlaceholder || 'e.g. Subscriptions, Gym...'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.fieldHeader}>
              <label className={styles.label}>
                {t.chooseIconTitle || 'Choose Icon'}
              </label>
              {selectedIcon && (
                <span
                  className={styles.selectedIconChip}
                  style={{
                    '--chip-color': ICON_COLORS[selectedIcon] || '#8b5cf6',
                  } as React.CSSProperties}
                >
                  {SelectedIconComp && React.createElement(SelectedIconComp, {
                    size: 13,
                    color: ICON_COLORS[selectedIcon] || '#8b5cf6',
                  })}
                  <span>{t.icons?.[selectedIcon] || selectedIcon}</span>
                </span>
              )}
            </div>

            <div className={styles.iconSelectorRow}>
              {QUICK_ICONS.map((iconKey) => {
                const IconComp = AVAILABLE_ICONS[iconKey]
                if (!IconComp) return null
                const isSelected = selectedIcon === iconKey
                const color = ICON_COLORS[iconKey] || '#8b5cf6'
                const localizedTitle = t.icons?.[iconKey] || iconKey

                return (
                  <button
                    key={iconKey}
                    type="button"
                    className={`${styles.quickIconBtn} ${isSelected ? styles.quickIconBtnSelected : ''}`}
                    onClick={() => setSelectedIcon(iconKey)}
                    title={localizedTitle}
                    aria-label={localizedTitle}
                    style={{
                      '--icon-color': color,
                    } as React.CSSProperties}
                  >
                    <IconComp size={18} color={color} />
                  </button>
                )
              })}
              <button
                type="button"
                className={styles.moreIconsBtn}
                onClick={() => setIsFullPickerOpen(true)}
                title={t.chooseIconTitle || 'More icons'}
                aria-label={t.chooseIconTitle || 'More icons'}
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              {t.cancel || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={styles.submitBtn}
            >
              <Sparkles size={14} />
              {t.createAndApply || 'Create & Apply'}
            </button>
          </div>

          <div className={styles.settingsHintRow}>
            <button
              type="button"
              className={styles.settingsLinkBtn}
              onClick={handleNavigateToSettings}
            >
              <Settings size={13} />
              <span>{t.manageInSettingsHint}</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </form>
      </Modal>

      {isFullPickerOpen && (
        <IconPickerModal
          isOpen={isFullPickerOpen}
          onClose={() => setIsFullPickerOpen(false)}
          selectedIcon={selectedIcon}
          onSelectIcon={(iconKey) => {
            setSelectedIcon(iconKey)
            setIsFullPickerOpen(false)
          }}
        />
      )}
    </>
  )
}
