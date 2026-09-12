import React, { useMemo,useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence,motion } from 'framer-motion'
import { Search, X } from 'lucide-react'

import { en } from '../../i18n/locales/en'
import { useLanguageStore } from '../../store/useLanguageStore'
import { ICON_COLORS } from '../../utils/category-colors'
import { AVAILABLE_ICONS, ICON_GROUPS } from '../../utils/category-icons'
import { normalizeForSearch } from '../../utils/string-utils'

import styles from './IconPickerModal.module.css'


interface IconPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectIcon: (iconName: string) => void
  selectedIcon?: string
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({ isOpen, onClose, onSelectIcon, selectedIcon }) => {
  const { t } = useLanguageStore()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return ICON_GROUPS

    const query = normalizeForSearch(searchQuery)
    return ICON_GROUPS.map(group => {
      const localizedGroupName = t.iconGroups?.[group.name] || group.name
      const englishGroupName = en.iconGroups?.[group.name] || group.name
      const groupMatches = normalizeForSearch(localizedGroupName).includes(query) || 
                           normalizeForSearch(englishGroupName).includes(query)

      if (groupMatches) {
        return { ...group }
      }

      return {
        ...group,
        icons: group.icons.filter(icon => {
          const localizedName = t.icons?.[icon] || icon
          const englishName = en.icons?.[icon] || icon
          return normalizeForSearch(localizedName).includes(query) || 
                 normalizeForSearch(englishName).includes(query) || 
                 normalizeForSearch(icon).includes(query)
        })
      }
    }).filter(group => group.icons.length > 0)
  }, [searchQuery, t])

  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={styles.modal}
          onClick={e => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h3>{t.chooseIconTitle}</h3>
            <button onClick={onClose} className={styles.closeBtn} title={t.close}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t.searchIconsPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
          </div>

          <div className={styles.scrollArea}>
            {filteredGroups.length === 0 ? (
              <div className={styles.noResults}>{t.noIconsFound.replace('{query}', searchQuery)}</div>
            ) : (
              filteredGroups.map(group => (
                <div key={group.name} className={styles.group}>
                  <h4 className={styles.groupTitle}>{t.iconGroups?.[group.name] || group.name}</h4>
                  <div className={styles.iconGrid}>
                    {group.icons.map(iconName => {
                      const IconComp = AVAILABLE_ICONS[iconName]
                      if (!IconComp) return null
                      const isSelected = selectedIcon === iconName
                      return (
                        <button
                          key={iconName}
                          type="button"
                          className={`${styles.iconBtn} ${isSelected ? styles.selected : ''}`}
                          onClick={() => {
                            onSelectIcon(iconName)
                            onClose()
                          }}
                          title={t.icons?.[iconName] || iconName}
                        >
                          <IconComp size={24} color={ICON_COLORS[iconName] || '#8b5cf6'} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
