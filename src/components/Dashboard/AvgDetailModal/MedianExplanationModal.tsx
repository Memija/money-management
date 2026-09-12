import React, { useEffect, useMemo, useRef } from 'react'

import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { Transaction } from '../../../types'
import { Modal } from '../../shared/Modal'

import styles from './MedianExplanationModal.module.css'

interface MedianExplanationModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'income' | 'expense'
  transactions: Transaction[]
}

export const MedianExplanationModal: React.FC<MedianExplanationModalProps> = ({ isOpen, onClose, type, transactions }) => {
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency, formatDate } = useFormatters()

  const listRef = useRef<HTMLDivElement>(null)

  const { sortedTransactions, medianValue, medianIndices } = useMemo(() => {
    const filtered = transactions.filter((tx) => tx.type === type)
    // Sort ascending by absolute amount
    const sorted = [...filtered].sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount))
    
    const len = sorted.length
    if (len === 0) return { sortedTransactions: [], medianValue: 0, medianIndices: [] }

    const mid = Math.floor(len / 2)
    let medianValue = 0
    let medianIndices: number[] = []

    if (len % 2 === 0) {
      medianValue = (Math.abs(sorted[mid - 1].amount) + Math.abs(sorted[mid].amount)) / 2
      medianIndices = [mid - 1, mid]
    } else {
      medianValue = Math.abs(sorted[mid].amount)
      medianIndices = [mid]
    }

    return { sortedTransactions: sorted, medianValue, medianIndices }
  }, [transactions, type])

  useEffect(() => {
    if (isOpen && listRef.current) {
      // Small timeout to allow Modal to render and display:block
      const timer = setTimeout(() => {
        if (listRef.current) {
          const highlighted = listRef.current.querySelector(`.${styles['row-highlight']}`)
          if (highlighted) {
            highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.median || 'Median'} maxWidth="400px">
      <div className={styles.container}>
        <p className={styles.explanation}>
          {t.medianInfo}
        </p>
        
        <div className={styles['median-value']}>
          {formatCurrency(medianValue)}
        </div>

        <div className={styles.list} ref={listRef}>
          {sortedTransactions.map((tx, index) => {
            const isMedian = medianIndices.includes(index)
            return (
              <div 
                key={`${tx.id}-${index}`} 
                className={`${styles.row} ${isMedian ? styles['row-highlight'] : ''}`}
              >
                <div className={styles['row-left']}>
                  <div className={styles['row-index']}>{index + 1}</div>
                  <div className={styles['row-date']}>{formatDate(tx.date)}</div>
                </div>
                <div className={styles['row-right']}>
                  {isMedian && (
                    <div className={styles['median-badge']}>
                      {medianIndices.length === 2 ? '1/2' : t.median || 'Median'}
                    </div>
                  )}
                  <div className={`${styles['row-amount']} ${isMedian ? styles['amount-highlight'] : ''}`}>
                    {formatCurrency(Math.abs(tx.amount))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
