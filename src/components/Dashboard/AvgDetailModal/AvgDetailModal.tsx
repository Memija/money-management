import React, { useMemo } from 'react'
import { ArrowDownLeft, ArrowUpRight, BarChart2, Hash, Info,TrendingDown, TrendingUp } from 'lucide-react'

import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { Transaction } from '../../../types'
import { Modal } from '../../shared/Modal'
import { MedianExplanationModal } from './MedianExplanationModal'

import styles from './AvgDetailModal.module.css'

interface AvgDetailModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'income' | 'expense'
  transactions: Transaction[]
}

interface StatRowProps {
  label: string
  value: string
  icon: React.ReactNode
  accent?: 'emerald' | 'rose' | 'blue' | 'amber'
  infoTooltip?: string
  onClick?: () => void
}

const StatRow: React.FC<StatRowProps> = ({ label, value, icon, accent = 'blue', infoTooltip, onClick }) => (
  <div 
    className={`${styles['stat-row']} ${onClick ? styles['stat-row-clickable'] : ''}`}
    onClick={onClick}
  >
    <div className={`${styles['stat-icon']} ${styles[`stat-icon-${accent}`]}`}>{icon}</div>
    <span className={styles['stat-label']}>
      {label}
      {infoTooltip && (
        <span className={styles['info-tooltip-wrapper']}>
          <Info size={12} className={styles['tooltip-icon']} />
          <span className={styles['info-tooltip-bubble']}>
            {infoTooltip}
          </span>
        </span>
      )}
    </span>
    <span className={`${styles['stat-value']} ${styles[`stat-value-${accent}`]}`}>{value}</span>
  </div>
)

export const AvgDetailModal: React.FC<AvgDetailModalProps> = ({ isOpen, onClose, type, transactions }) => {
  const t = useLanguageStore((s) => s.t)
  const { formatCurrency } = useFormatters()
  const isIncome = type === 'income'
  const accent = isIncome ? 'emerald' : 'rose'

  const [isMedianModalOpen, setIsMedianModalOpen] = React.useState(false)

  const stats = useMemo(() => {
    const filtered = transactions.filter((tx) => tx.type === type)
    if (filtered.length === 0) {
      return null
    }

    const amounts = filtered.map((tx) => Math.abs(tx.amount))
    const total = amounts.reduce((s, a) => s + a, 0)
    const avg = total / amounts.length
    const max = Math.max(...amounts)
    const min = Math.min(...amounts)

    // Median
    const sorted = [...amounts].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]

    // Monthly average — group by YYYY-MM
    const byMonth: Record<string, number> = {}
    filtered.forEach((tx) => {
      const month = tx.date.substring(0, 7)
      byMonth[month] = (byMonth[month] || 0) + Math.abs(tx.amount)
    })
    const monthCount = Object.keys(byMonth).length
    const avgPerMonth = monthCount > 0 ? total / monthCount : 0

    // Below/above average counts
    const aboveAvg = amounts.filter((a) => a > avg).length
    const belowAvg = amounts.filter((a) => a <= avg).length

    return {
      count: filtered.length,
      total,
      avg,
      max,
      min,
      median,
      avgPerMonth,
      monthCount,
      aboveAvg,
      belowAvg,
    }
  }, [transactions, type])

  const title = isIncome ? t.income : t.expenses

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="400px">
      {stats === null ? (
        <p className={styles.empty}>{t.noTransactionsInPeriod}</p>
      ) : (
        <div className={styles.content}>
          {/* Hero avg */}
          <div className={`${styles['avg-hero']} ${styles[`avg-hero-${accent}`]}`}>
            <div className={styles['avg-hero-icon']}>
              {isIncome ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
            </div>
            <div>
              <p className={styles['avg-hero-label']}>{t.avgPerTransaction}</p>
              <p className={styles['avg-hero-value']}>{formatCurrency(stats.avg)}</p>
            </div>
          </div>

          {/* Stat rows */}
          <div className={styles['stat-list']}>
            <StatRow
              label={t.total}
              value={formatCurrency(stats.total)}
              icon={isIncome ? <ArrowUpRight size={13} /> : <ArrowDownLeft size={13} />}
              accent={accent}
            />
            <StatRow
              label={t.numTransactions}
              value={stats.count.toLocaleString()}
              icon={<Hash size={13} />}
              accent="blue"
            />
            {stats.monthCount > 1 && (
              <StatRow
                label={t.avgPerMonthWithCount.replace('{count}', stats.monthCount.toString())}
                value={formatCurrency(stats.avgPerMonth)}
                icon={<BarChart2 size={13} />}
                accent={accent}
              />
            )}
            <div className={styles.divider} />
            <StatRow
              label={t.highestSingle}
              value={formatCurrency(stats.max)}
              icon={<TrendingUp size={13} />}
              accent={isIncome ? 'emerald' : 'rose'}
            />
            <StatRow
              label={t.lowestSingle}
              value={formatCurrency(stats.min)}
              icon={<TrendingDown size={13} />}
              accent="blue"
            />
            <StatRow
              label={t.median || "Median"}
              value={formatCurrency(stats.median)}
              icon={<BarChart2 size={13} />}
              accent="amber"
              infoTooltip={t.medianInfo}
              onClick={() => setIsMedianModalOpen(true)}
            />
          </div>

          {/* Distribution note */}
          <div className={styles.distribution}>
            <div className={styles['dist-bar-track']}>
              <div
                className={`${styles['dist-bar-fill']} ${styles[`dist-bar-${accent}`]}`}
                style={{ width: `${Math.round((stats.aboveAvg / stats.count) * 100)}%` }}
              />
            </div>
            <div className={styles['dist-labels']}>
              <span className={styles['dist-label-above']}>
                {stats.aboveAvg} {t.aboveAvg}
              </span>
              <span className={styles['dist-label-below']}>
                {stats.belowAvg} {t.atBelowAvg}
              </span>
            </div>
          </div>
        </div>
      )}
    </Modal>
    {isMedianModalOpen && (
      <MedianExplanationModal
        isOpen={isMedianModalOpen}
        onClose={() => setIsMedianModalOpen(false)}
        type={type}
        transactions={transactions}
      />
    )}
    </>
  )
}
