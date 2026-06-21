import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  FileType,
  ClipboardPaste,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Info,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import type { ImportMethod, ImportedAccount } from '../../types';
import styles from './TransactionImporter.module.css';
import { TransactionPreviewModal } from './TransactionPreviewModal';
import { DeleteConfirmationModal } from '../shared/DeleteConfirmationModal';
import { useTransactionImport } from './useTransactionImport';

/* ─── component ─── */
const TransactionImporter: React.FC = () => {
  const { selectedInstitution, addImportedAccount, setStep } = useAppStore();
  const t = useLanguageStore((s) => s.t);
  const institutionName = selectedInstitution?.name ?? 'Unknown';

  const [method, setMethod] = useState<ImportMethod | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    transactions,
    loading,
    error,
    fileName,
    pasteText,
    setPasteText,
    setError,
    setFileName,
    handleFileChange,
    handlePaste,
    handleRemoveTransaction,
    handleUpdateTransaction,
    handleClearAll
  } = useTransactionImport(institutionName, method, t);

  /* ─── import method cards ─── */
  const importMethods: { key: ImportMethod; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      key: 'spreadsheet',
      label: t.spreadsheetFile,
      icon: <FileSpreadsheet size={24} />,
      desc: t.spreadsheetFileDesc,
    },
    {
      key: 'pdf',
      label: t.pdfStatement,
      icon: <FileType size={24} />,
      desc: t.pdfStatementDesc,
    },
    {
      key: 'paste',
      label: t.copyPaste,
      icon: <ClipboardPaste size={24} />,
      desc: t.copyPasteDesc,
    },
  ];

  /* ─── file handlers ─── */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileChange(file);
    },
    [handleFileChange]
  );

  const handleConfirmImport = () => {
    const account: ImportedAccount = {
      institutionId: selectedInstitution?.id ?? 'unknown',
      institutionName,
      transactions,
      importedAt: new Date().toISOString(),
    };
    addImportedAccount(account);
  };

  const onClearAll = useCallback(() => {
    handleClearAll();
    setShowClearConfirmation(false);
  }, [handleClearAll]);

  const acceptTypes: Record<ImportMethod, string> = {
    spreadsheet: '.xlsx,.xls,.csv',
    pdf: '.pdf',
    paste: '',
  };

  /* ─── render ─── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="onboarding-container"
    >
      <button className="back-button" onClick={() => setStep('institution')} id="back-to-institution">
        <ArrowLeft size={18} />
        <span>{t.back}</span>
      </button>

      <div className="onboarding-header">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="onboarding-icon upload-icon"
        >
          <Upload size={32} />
        </motion.div>
        <h1 className="onboarding-title">{t.importTransactionsTitle}</h1>
        <p className="onboarding-subtitle">
          {t.importTransactionsSubtitle.replace('{institution}', institutionName)}
          <br />
          <span className="info-text">
            <Info size={14} />
            {t.importPsd2Notice}
          </span>
        </p>
      </div>

      {/* Step 1: Choose method */}
      {!method && (
        <div className={styles['import-methods-grid']}>
          {importMethods.map((m, idx) => (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={styles['import-method-card']}
              onClick={() => setMethod(m.key)}
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
      )}

      {/* Step 2: Upload area / Paste */}
      {method && transactions.length === 0 && !loading && (
        <div className={styles['import-upload-area']}>
          <button className={`back-button ${styles['back-button-aligned']}`} onClick={() => { setMethod(null); setError(null); setFileName(null); }}>
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
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              id="drop-zone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptTypes[method]}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                }}
                className={styles['hidden']}
                id="file-input"
                name="file-input"
                aria-label={t.dragDropFile}
                title={t.dragDropFile}
              />
              <Upload size={40} className={styles['drop-zone-icon']} />
              <p className={styles['drop-zone-title']}>
                {dragOver ? t.dropHere : t.dragDropFile}
              </p>
              <p className={styles['drop-zone-subtitle']}>
                {t.orClickToBrowse}
              </p>
              <p className={`${styles['drop-zone-subtitle']} ${styles['drop-zone-formats']}`}>
                {t.acceptedFormats.replace('{accepted}', acceptTypes[method])}
              </p>
              {fileName && <p className={styles['file-name-label']}>{fileName}</p>}
            </div>
          ) : (
            <div className={styles['paste-area-wrapper']}>
              <textarea
                className={styles['paste-textarea']}
                placeholder={t.pasteDataPlaceholder}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={10}
                id="paste-area"
                name="paste-area"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`primary-button ${!pasteText.trim() ? 'disabled' : ''}`}
                onClick={handlePaste}
                disabled={!pasteText.trim()}
                id="parse-paste-button"
              >
                {t.parseTransactions}
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className={styles['import-loading']}>
          <Loader2 size={32} className={styles.spinner} />
          <p>{t.processingData}</p>
        </div>
      )}

      {/* Step 3: Preview transactions */}
      {transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={styles['import-preview']}
        >
          <div className={styles['import-preview-header']}>
            <div className={styles['import-preview-info']}>
              <CheckCircle2 size={20} className={styles['success-icon']} />
              <span>
                <strong>{transactions.length}</strong> {t.transactionsFound.replace('{count}', '').trim()}
              </span>
            </div>
            <button
              className={styles['clear-button']}
              onClick={() => setShowClearConfirmation(true)}
              id="clear-import"
            >
              <X size={14} />
              {t.clear}
            </button>
          </div>

          <div className={styles['action-buttons-container']}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`secondary-button ${styles['no-margin-top']}`}
              onClick={() => setIsPreviewOpen(true)}
            >
              {t.reviewTransactions}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`primary-button ${styles['no-margin-top']}`}
              onClick={handleConfirmImport}
              id="confirm-import"
              disabled={loading || transactions.length === 0}
            >
              <CheckCircle2 size={18} />
              {t.confirmImport}
            </motion.button>
          </div>
        </motion.div>
      )}

      <TransactionPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        transactions={transactions}
        onRemoveTransaction={handleRemoveTransaction}
        onUpdateTransaction={handleUpdateTransaction}
      />

      <DeleteConfirmationModal
        isOpen={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={onClearAll}
        title={t.clearAllTransactionsTitle}
        message={t.clearAllTransactionsMessage}
        confirmText={t.clearAll}
        cancelText={t.cancel}
      />
    </motion.div>
  );
};

export default TransactionImporter;
