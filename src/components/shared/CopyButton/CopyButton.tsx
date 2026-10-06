import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { useLanguageStore } from '../../../store/useLanguageStore'
import { copyToClipboard } from '../../../utils/clipboard'

import styles from './CopyButton.module.css'

export interface CopyButtonProps {
  text: string
  title?: string
  copiedTitle?: string
  size?: number
  variant?: 'subtle' | 'inline' | 'ghost'
  className?: string
  testId?: string
  disabled?: boolean
  onCopy?: () => void
}

export const CopyButton: React.FC<CopyButtonProps> = React.memo(
  ({
    text,
    title,
    copiedTitle,
    size = 13,
    variant = 'subtle',
    className = '',
    testId,
    disabled = false,
    onCopy,
  }) => {
    const t = useLanguageStore((s) => s.t)
    const [isCopied, setIsCopied] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    const handleCopy = useCallback(
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        e.preventDefault()

        if (!text || disabled) return

        const success = await copyToClipboard(text)
        if (success) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
          setIsCopied(true)
          onCopy?.()
          timeoutRef.current = setTimeout(() => {
            setIsCopied(false)
          }, 2000)
        }
      },
      [text, disabled, onCopy],
    )

    const resolvedTitle = title || t?.copyTransactionText || 'Copy transaction text'
    const resolvedCopiedTitle = copiedTitle || t?.copied || 'Copied!'
    const currentTitle = isCopied ? resolvedCopiedTitle : resolvedTitle

    return (
      <button
        type="button"
        className={`${styles.copyBtn} ${styles[variant]} ${isCopied ? styles.copied : ''} ${className}`}
        onClick={handleCopy}
        title={currentTitle}
        aria-label={currentTitle}
        data-testid={testId}
        disabled={disabled || !text}
      >
        {isCopied ? (
          <Check size={size} className={styles.checkIcon} aria-hidden="true" />
        ) : (
          <Copy size={size} aria-hidden="true" />
        )}
      </button>
    )
  },
)

CopyButton.displayName = 'CopyButton'
