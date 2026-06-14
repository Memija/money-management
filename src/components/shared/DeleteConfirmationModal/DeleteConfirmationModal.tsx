import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../Modal';
import styles from './DeleteConfirmationModal.module.css';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="400px"
      footer={
        <>
          <button className={`secondary-button ${styles.cancelButton}`} onClick={onClose}>
            {cancelText}
          </button>
          <button
            className={`primary-button ${styles.deleteButton}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className={styles.contentContainer}>
        <div className={styles.iconContainer}>
          <AlertTriangle size={24} />
        </div>
        <p className={styles.messageText}>
          {message}
        </p>
      </div>
    </Modal>
  );
};
