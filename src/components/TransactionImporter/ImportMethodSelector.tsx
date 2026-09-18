import React from 'react'
import { motion } from 'framer-motion'
import { ClipboardPaste, FileSpreadsheet, FileType } from 'lucide-react'

import type { TranslationStrings } from '../../i18n/types'
import type { ImportMethod } from '../../types'

import styles from './TransactionImporter.module.css'

interface ImportMethodSelectorProps {
  t: TranslationStrings
  onSelectMethod: (method: ImportMethod) => void
}

export const ImportMethodSelector: React.FC<ImportMethodSelectorProps> = ({ t, onSelectMethod }) => {
  const importMethods: { key: ImportMethod; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'spreadsheet', label: t.spreadsheetFile, icon: <FileSpreadsheet size={24} />, desc: t.spreadsheetFileDesc },
    { key: 'pdf', label: t.pdfStatement, icon: <FileType size={24} />, desc: t.pdfStatementDesc },
    { key: 'paste', label: t.copyPaste, icon: <ClipboardPaste size={24} />, desc: t.copyPasteDesc },
  ]

  return (
    <div className={styles['import-methods-grid']}>
      {importMethods.map((m, idx) => (
        <motion.div
          key={m.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08 }}
          className={styles['import-method-card']}
          onClick={() => onSelectMethod(m.key)}
          id={`import-method-${m.key}`}
        >
          <div className={styles['import-method-icon']}>{m.icon}</div>
          <div>
            <p className={styles['import-method-label']}>{m.label}</p>
            <p className={styles['import-method-desc']}>{m.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
