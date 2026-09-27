import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy, Download, Eye, EyeOff, FileText, Share2, Sparkles } from 'lucide-react'

import { useLanguageStore } from '../../../store/useLanguageStore'
import {
  copyShareCardImage,
  downloadShareCard,
  generateShareSummaryText,
  renderShareCardToCanvas,
  type ShareCardCategory,
  type ShareCardData,
  type ShareCardTheme,
} from '../../../utils/share-card-canvas'
import { Modal } from '../../shared/Modal/Modal'

import styles from './ShareSnapshotModal.module.css'

export interface ShareSnapshotModalProps {
  isOpen: boolean
  onClose: () => void
  periodLabel: string
  currencySymbol?: string
  totalIncome: number
  totalExpenses: number
  netSavings: number
  savingsRate: number
  topCategories: ShareCardCategory[]
}

const THEME_OPTIONS: Array<{ key: ShareCardTheme; label: string; class: string }> = [
  { key: 'emerald', label: 'Emerald', class: styles.themeEmerald },
  { key: 'cyan', label: 'Cyan', class: styles.themeCyan },
  { key: 'violet', label: 'Violet', class: styles.themeViolet },
  { key: 'sunset', label: 'Sunset', class: styles.themeSunset },
]

export const ShareSnapshotModal: React.FC<ShareSnapshotModalProps> = ({
  isOpen,
  onClose,
  periodLabel,
  currencySymbol = '€',
  totalIncome,
  totalExpenses,
  netSavings,
  savingsRate,
  topCategories,
}) => {
  const { t } = useLanguageStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [maskAmounts, setMaskAmounts] = useState<boolean>(true)
  const [selectedTheme, setSelectedTheme] = useState<ShareCardTheme>('emerald')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const shareData: ShareCardData = useMemo(
    () => ({
      periodLabel,
      currencySymbol,
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      topCategories,
      maskAmounts,
      theme: selectedTheme,
    }),
    [
      periodLabel,
      currencySymbol,
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      topCategories,
      maskAmounts,
      selectedTheme,
    ],
  )

  // Re-render canvas whenever data or options change
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return
    renderShareCardToCanvas(shareData, canvasRef.current)
  }, [isOpen, shareData])

  // Clear feedback after 3 seconds
  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => {
      setFeedback(null)
      setIsCopied(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [feedback])

  const handleDownload = () => {
    if (!canvasRef.current) return
    const sanitizedLabel = periodLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    downloadShareCard(canvasRef.current, `saldio-snapshot-${sanitizedLabel}.png`)
  }

  const handleCopyImage = async () => {
    if (!canvasRef.current) return
    try {
      await copyShareCardImage(canvasRef.current)
      setIsCopied(true)
      setFeedback(t.imageCopiedSuccess || 'Snapshot image copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err)
      // Fallback: download if copying image is restricted by browser
      handleDownload()
      setFeedback(t.downloadImage || 'Download started!')
    }
  }

  const handleCopyText = async () => {
    try {
      const summaryText = generateShareSummaryText(shareData)
      await navigator.clipboard.writeText(summaryText)
      setIsCopied(true)
      setFeedback(t.textCopiedSuccess || 'Summary text copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleNativeShare = async () => {
    if (typeof navigator.share !== 'function' || !canvasRef.current) return
    try {
      const summaryText = generateShareSummaryText(shareData)
      await navigator.share({
        title: t.shareSnapshotTitle || 'Financial Snapshot',
        text: summaryText,
        url: 'https://saldio.app',
      })
    } catch (err) {
      // User cancelled share
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err)
      }
    }
  }

  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className={styles.modalTitle}>
          <Sparkles size={18} className="text-primary" />
          {t.shareSnapshotTitle || 'Share Financial Snapshot'}
        </span>
      }
      maxWidth="720px"
    >
      <div className={styles.modalContainer}>
        <p className={styles.description}>
          {t.shareSnapshotDesc ||
            'Create a private, aesthetic card of your financial snapshot to share or save.'}
        </p>

        {/* Live Canvas Preview */}
        <div className={styles.previewWrapper}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            aria-label="Financial snapshot preview"
          />
        </div>

        {/* Controls: Masking Toggle & Theme Colors */}
        <div className={styles.controlsRow}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              className={styles.toggleCheckbox}
              checked={maskAmounts}
              onChange={(e) => setMaskAmounts(e.target.checked)}
              aria-label={t.shareMaskAmounts || 'Hide exact amounts'}
            />
            {maskAmounts ? (
              <>
                <EyeOff size={16} />
                <span>{t.shareMaskAmounts || 'Hide exact amounts'}</span>
              </>
            ) : (
              <>
                <Eye size={16} />
                <span>{t.shareIncludeAmounts || 'Show exact amounts'}</span>
              </>
            )}
          </label>

          <div className={styles.themesGroup}>
            <span className={styles.themeTitle}>{t.shareCardTheme || 'Theme'}:</span>
            {THEME_OPTIONS.map((th) => (
              <button
                key={th.key}
                type="button"
                className={`${styles.themeDot} ${th.class} ${
                  selectedTheme === th.key ? styles.themeDotActive : ''
                }`}
                onClick={() => setSelectedTheme(th.key)}
                title={th.label}
                aria-label={`Select ${th.label} theme`}
              />
            ))}
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div className={styles.feedbackBanner} role="status">
            {feedback}
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actionsGrid}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleDownload}
            data-testid="share-card-download-btn"
          >
            <Download size={16} />
            <span>{t.downloadImage || 'Download PNG'}</span>
          </button>

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleCopyImage}
            data-testid="share-card-copy-image-btn"
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            <span>{t.copyImage || 'Copy Image'}</span>
          </button>

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleCopyText}
            data-testid="share-card-copy-text-btn"
          >
            <FileText size={16} />
            <span>{t.copyTextSummary || 'Copy Text'}</span>
          </button>

          {hasNativeShare && (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleNativeShare}
            >
              <Share2 size={16} />
              <span>{t.shareNative || 'Share...'}</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
