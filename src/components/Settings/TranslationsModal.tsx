import React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence,motion } from 'framer-motion'
import { X } from 'lucide-react'

import { localeLabels,localeOrder } from '../../i18n/translations'
import { useLanguageStore } from '../../store/useLanguageStore'

import styles from './TranslationsModal.module.css'

interface TranslationsModalProps {
  isOpen: boolean
  onClose: () => void
  translations: Record<string, string>
  onTranslationChange: (locale: string, value: string) => void
  newCatName: string
}

export const TranslationsModal: React.FC<TranslationsModalProps> = ({ 
  isOpen, 
  onClose, 
  translations, 
  onTranslationChange,
  newCatName
}) => {
  const t = useLanguageStore((s) => s.t)
  const currentLocale = useLanguageStore((s) => s.locale)

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
            <h3>{t.addTranslationsTitle}</h3>
            <button type="button" onClick={onClose} className={styles.closeBtn} title={t.close}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.scrollArea}>
            <div className={styles.translationsHelp}>
              {t.optionalTranslationsHelp}
            </div>
            
            <div className={styles.translationsGrid}>
              {localeOrder.map(loc => (
                <div key={loc} className={styles.translationRow}>
                  <img src={localeLabels[loc].flag} alt="" className={styles.flagIcon} />
                  <span className={styles.langLabel}>{localeLabels[loc].native}</span>
                  <input
                    type="text"
                    placeholder={loc === currentLocale ? t.name : t.translation}
                    value={loc === currentLocale ? newCatName : (translations[loc] ?? '')}
                    onChange={(e) => onTranslationChange(loc, e.target.value)}
                    className={styles.transInput}
                  />
                </div>
              ))}
            </div>
            
            <div className={styles.footer}>
              <button type="button" onClick={onClose} className={styles.doneBtn}>
                {t.done}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
