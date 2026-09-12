import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, Plus, Settings } from 'lucide-react'

import { DEFAULT_CATEGORY_KEYS } from '../../../i18n/categories'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { getCategoryColor } from '../../../utils/category-colors'
import { getCategoryIcon } from '../../../utils/category-icons'
import { getCategoryLabel } from '../../../utils/category-utils'
import { QuickCategoryModal } from './QuickCategoryModal'

import styles from './CategorySelect.module.css'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  variant?: 'default' | 'badge'
  className?: string
  align?: 'left' | 'right'
  onOpenChange?: (isOpen: boolean) => void
}

export const CategorySelect: React.FC<CategorySelectProps> = ({ 
  value, 
  onChange, 
  variant = 'default',
  className = '',
  align = 'left',
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { t, locale: currentLocale } = useLanguageStore()
  const customCategories = useAppStore((state) => state.customCategories)
  const setStep = useAppStore((state) => state.setStep)

  const handleToggle = () => {
    const next = !isOpen
    setIsOpen(next)
    onOpenChange?.(next)
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onOpenChange?.(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onOpenChange])

  const handleSelect = (newValue: string) => {
    onChange(newValue)
    setIsOpen(false)
    onOpenChange?.(false)
  }

  const defaultKeys = DEFAULT_CATEGORY_KEYS
  const categoryColor = getCategoryColor(value || 'Other', customCategories)

  return (
    <div 
      className={`${styles.container} ${variant === 'badge' ? styles.badgeContainer : ''} ${className}`}
      ref={containerRef}
      style={{ '--badge-color': categoryColor } as React.CSSProperties}
    >
      <button 
        type="button" 
        className={`${styles.button} ${isOpen ? styles.buttonOpen : ''}`}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className={styles.buttonContent}>
          <div className={styles.iconWrapper}>
            {getCategoryIcon(value || 'Other', variant === 'badge' ? 14 : 16, customCategories)}
          </div>
          <span className={styles.buttonLabel}>
            {getCategoryLabel(value || 'Other', t, currentLocale, customCategories)}
          </span>
        </div>
        <ChevronDown 
          size={variant === 'badge' ? 13 : 14} 
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} 
        />
      </button>

      {isOpen && (
        <div 
          className={`${styles.dropdown} ${align === 'right' ? styles.dropdownAlignRight : styles.dropdownAlignLeft}`} 
          role="listbox"
        >
          <div className={styles.optgroupLabel}>{t.defaultCategoriesGroup || 'Default Categories'}</div>
          {defaultKeys.map((catKey) => (
            <button
              key={catKey}
              className={`${styles.option} ${value === catKey ? styles.optionSelected : ''}`}
              role="option"
              aria-selected={value === catKey}
              onClick={() => handleSelect(catKey)}
            >
              <div className={styles.iconWrapper}>
                {getCategoryIcon(catKey, 14, customCategories)}
              </div>
              {getCategoryLabel(catKey, t, currentLocale, customCategories)}
            </button>
          ))}

          {customCategories.length > 0 && (
            <>
              <div className={styles.optgroupLabel}>{t.customCategoriesGroup || 'Custom Categories'}</div>
              {customCategories.map((c) => (
                <button
                  key={c.id}
                  className={`${styles.option} ${value === c.id ? styles.optionSelected : ''}`}
                  role="option"
                  aria-selected={value === c.id}
                  onClick={() => handleSelect(c.id)}
                >
                  <div className={styles.iconWrapper}>
                    {getCategoryIcon(c.id, 14, customCategories)}
                  </div>
                  {getCategoryLabel(c.id, t, currentLocale, customCategories)}
                </button>
              ))}
            </>
          )}

          <div className={styles.dropdownDivider} />
          <div className={styles.dropdownFooter}>
            <button
              type="button"
              className={styles.footerActionBtn}
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
                onOpenChange?.(false)
                setIsQuickCreateOpen(true)
              }}
            >
              <Plus size={14} className={styles.footerIcon} />
              <span>{t.addNewCategory || 'Add New Category'}</span>
            </button>
            <button
              type="button"
              className={styles.footerActionBtn}
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
                onOpenChange?.(false)
                setStep('settings')
              }}
            >
              <Settings size={13} className={styles.footerIcon} />
              <span>{t.manageInSettings || 'Manage in Settings'}</span>
            </button>
          </div>
        </div>
      )}

      {isQuickCreateOpen && (
        <QuickCategoryModal
          isOpen={isQuickCreateOpen}
          onClose={() => setIsQuickCreateOpen(false)}
          onCreatedAndSelected={(newId) => {
            handleSelect(newId)
            setIsQuickCreateOpen(false)
          }}
        />
      )}
    </div>
  )
}
