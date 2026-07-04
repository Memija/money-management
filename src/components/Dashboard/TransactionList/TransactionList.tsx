import React from 'react'
import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react'

import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { Transaction } from '../../../types'
import { getCategoryLabel } from '../../../utils/category-utils'

import styles from './TransactionList.module.css'

interface TransactionListProps {
  filteredTx: Transaction[]
  institutionNames: string[]
  searchTerm: string
  setSearchTerm: (val: string) => void
  selectedInstitution: string
  setSelectedInstitution: (val: string) => void
  sortOrder: 'newest' | 'oldest' | 'highest' | 'lowest'
  setSortOrder: (val: 'newest' | 'oldest' | 'highest' | 'lowest') => void
}

export const TransactionList: React.FC<TransactionListProps> = ({
  filteredTx,
  institutionNames,
  searchTerm,
  setSearchTerm,
  selectedInstitution,
  setSelectedInstitution,
  sortOrder,
  setSortOrder,
}) => {
  const t = useLanguageStore((s) => s.t)
  const { formatDate, formatCurrency } = useFormatters()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`glass-card ${styles['col-span-12']}`}
    >
      <div className={styles['transactions-header']}>
        <h3>{t.allTransactions}</h3>
        <div className={styles['transactions-controls']}>
          <div className={styles['tx-search-wrapper']}>
            <Search size={14} />
            <input
              type="text"
              placeholder={t.search}
              aria-label={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles['tx-search-input']}
              id="tx-search"
              name="tx-search"
            />
          </div>
          {institutionNames.length > 1 && (
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className={styles['tx-filter-select']}
              id="institution-filter"
              name="institution-filter"
              aria-label={t.allInstitutions}
            >
              <option value="all">{t.allInstitutions}</option>
              {institutionNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest')
            }
            className={styles['tx-filter-select']}
            id="sort-order"
            name="sort-order"
            aria-label="Sort order"
          >
            <option value="newest">{t.newestFirst}</option>
            <option value="oldest">{t.oldestFirst}</option>
            <option value="highest">{t.highestAmount}</option>
            <option value="lowest">{t.lowestAmount}</option>
          </select>
        </div>
      </div>

      <div className={styles['transaction-list']}>
        {filteredTx.slice(0, 100).map((tx) => (
          <div key={tx.id} className={styles['transaction-item']}>
            <div className={styles['tx-left']}>
              <div
                className={`${styles['icon-box']} ${tx.type === 'income' ? styles['icon-income'] : styles['icon-expense']
                  }`}
              >
                {tx.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </div>
              <div>
                <p className={styles['tx-desc']}>{tx.description}</p>
                <p className={styles['tx-meta']}>
                  {formatDate(tx.date)} • {tx.institution}
                </p>
              </div>
            </div>
            <div className={styles['tx-right']}>
              <p
                className={
                  tx.type === 'income' ? styles['amount-positive'] : styles['amount-negative']
                }
              >
                {tx.type === 'income' ? '+' : ''}
                {formatCurrency(tx.amount)}
              </p>
              <span className={styles['category-badge']}>
                {getCategoryLabel(tx.category || 'Other', t)}
              </span>
            </div>
          </div>
        ))}
        {filteredTx.length > 100 && (
          <p className={styles['more-rows']}>
            {t.showingOf.replace('{shown}', '100').replace('{total}', String(filteredTx.length))}
          </p>
        )}
        {filteredTx.length === 0 && (
          <div className={styles['no-transactions']}>{t.noTransactionsMatch}</div>
        )}
      </div>
    </motion.div>
  )
}
