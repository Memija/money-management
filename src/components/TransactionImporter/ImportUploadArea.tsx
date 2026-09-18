import React, { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Upload } from 'lucide-react'

import type { TranslationStrings } from '../../i18n/types'
import type { ImportMethod } from '../../types'

import styles from './TransactionImporter.module.css'

const ACCEPT_TYPES: Record<ImportMethod, string> = {
  spreadsheet: '.xlsx,.xls,.csv',
  pdf: '.pdf',
  paste: '',
}

interface ImportUploadAreaProps {
  method: ImportMethod
  error: string | null
  fileName: string | null
  pasteText: string
  t: TranslationStrings
  onBack: () => void
  onFileChange: (file: File) => void
  onPasteTextChange: (text: string) => void
  onPasteSubmit: () => void
}

export const ImportUploadArea: React.FC<ImportUploadAreaProps> = ({
  method,
  error,
  fileName,
  pasteText,
  t,
  onBack,
  onFileChange,
  onPasteTextChange,
  onPasteSubmit,
}) => {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) onFileChange(file)
    },
    [onFileChange],
  )

  return (
    <div className={styles['import-upload-area']}>
      <button
        className={`back-button ${styles['back-button-aligned']}`}
        onClick={onBack}
      >
        <ArrowLeft size={18} />
        <span>{t.chooseDifferentFormat}</span>
      </button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles['import-error']}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </motion.div>
      )}

      {method !== 'paste' ? (
        <div
          className={`${styles['drop-zone']} ${dragOver ? styles['drag-over'] : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          id="drop-zone"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_TYPES[method]}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFileChange(file)
            }}
            className={styles['hidden']}
            id="file-input"
            name="file-input"
            aria-label={t.dragDropFile}
            title={t.dragDropFile}
          />
          <Upload size={40} className={styles['drop-zone-icon']} />
          <p className={styles['drop-zone-title']}>{dragOver ? t.dropHere : t.dragDropFile}</p>
          <p className={styles['drop-zone-subtitle']}>{t.orClickToBrowse}</p>
          <p className={`${styles['drop-zone-subtitle']} ${styles['drop-zone-formats']}`}>
            {t.acceptedFormats.replace('{accepted}', ACCEPT_TYPES[method])}
          </p>
          {fileName && <p className={styles['file-name-label']}>{fileName}</p>}
        </div>
      ) : (
        <div className={styles['paste-area-wrapper']}>
          <textarea
            className={styles['paste-textarea']}
            placeholder={t.pasteDataPlaceholder}
            value={pasteText}
            onChange={(e) => onPasteTextChange(e.target.value)}
            rows={10}
            id="paste-area"
            name="paste-area"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`primary-button ${!pasteText.trim() ? 'disabled' : ''}`}
            onClick={onPasteSubmit}
            disabled={!pasteText.trim()}
            id="parse-paste-button"
          >
            {t.parseTransactions}
          </motion.button>
        </div>
      )}
    </div>
  )
}
