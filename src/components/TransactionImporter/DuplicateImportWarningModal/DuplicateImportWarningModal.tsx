import React from 'react'
import { AlertTriangle } from 'lucide-react'

import { Modal } from '../../shared/Modal'

import styles from './DuplicateImportWarningModal.module.css'

export interface DuplicateImportWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onProceed: () => void
  title: string
  message: string
  proceedText?: string
  cancelText?: string
  showProceedButton?: boolean
}

export const DuplicateImportWarningModal: React.FC<DuplicateImportWarningModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  title,
  message,
  proceedText = 'Proceed',
  cancelText = 'Cancel',
  showProceedButton = true,
}) => {
  const handleProceed = () => {
    onProceed()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="440px"
      footer={
        <>
          <button className={`secondary-button ${styles.cancelButton}`} onClick={onClose}>
            {cancelText}
          </button>
          {showProceedButton && (
            <button
              className={styles.proceedButton}
              onClick={handleProceed}
              id="duplicate-import-proceed"
            >
              {proceedText}
            </button>
          )}
        </>
      }
    >
      <div className={styles.contentContainer}>
        <div className={styles.iconContainer}>
          <AlertTriangle size={24} />
        </div>
        <p className={styles.messageText}>{message}</p>
      </div>
    </Modal>
  )
}
