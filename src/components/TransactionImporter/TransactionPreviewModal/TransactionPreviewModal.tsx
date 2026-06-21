import React, { useState, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Trash2, ArrowUp, ArrowDown, ArrowUpDown, CalendarDays, FileText, Coins, Check } from 'lucide-react';
import { Modal } from '../../shared/Modal';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { DatePicker } from '../../shared/DatePicker';
import { useFormatters } from '../../../hooks/useFormatters';
import type { Transaction } from '../../../types';
import styles from './TransactionPreviewModal.module.css';

interface TransactionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onRemoveTransaction: (id: string) => void;
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void;
}

type SortColumn = 'date' | 'description' | 'amount';

export const TransactionPreviewModal: React.FC<TransactionPreviewModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onRemoveTransaction,
  onUpdateTransaction,
}) => {
  const t = useLanguageStore((s) => s.t);
  const { formatCurrency, formatDate } = useFormatters();

  const [sortConfig, setSortConfig] = useState<{ key: SortColumn; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState({ date: '', description: '', amount: '' });

  const handleSort = (key: SortColumn) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (filters.date) {
      result = result.filter(tx => tx.date === filters.date);
    }
    if (filters.description) {
      const lowerQuery = filters.description.toLowerCase();
      result = result.filter(tx => tx.description.toLowerCase().includes(lowerQuery));
    }
    if (filters.amount) {
      const lowerQuery = filters.amount.toLowerCase();
      result = result.filter(tx => {
        const formattedAmount = formatCurrency(tx.amount).toLowerCase();
        return formattedAmount.includes(lowerQuery) || tx.amount.toString().includes(lowerQuery);
      });
    }

    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (sortConfig.key === 'date') {
          return sortConfig.direction === 'asc'
            ? a.date.localeCompare(b.date)
            : b.date.localeCompare(a.date);
        }
        if (sortConfig.key === 'description') {
          return sortConfig.direction === 'asc'
            ? a.description.localeCompare(b.description)
            : b.description.localeCompare(a.description);
        }
        if (sortConfig.key === 'amount') {
          return sortConfig.direction === 'asc'
            ? a.amount - b.amount
            : b.amount - a.amount;
        }
        return 0;
      });
    }

    return result;
  }, [transactions, filters, sortConfig, formatCurrency]);

  const renderSortIcon = (key: SortColumn) => {
    if (sortConfig?.key !== key) return <ArrowUpDown size={14} className={styles['sort-icon']} />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={14} className={`${styles['sort-icon']} ${styles.active}`} />
      : <ArrowDown size={14} className={`${styles['sort-icon']} ${styles.active}`} />;
  };

  const rowContent = (index: number, tx: Transaction) => (
    <div className={`${styles['tx-row']} ${index % 2 === 0 ? styles['tx-row-even'] : ''}`}>
      <div className={styles['tx-date']}>
        {onUpdateTransaction ? (
          <DatePicker
            className={styles['tx-date-picker-container']}
            value={tx.date}
            onChange={(date) => onUpdateTransaction(tx.id, { date })}
          />
        ) : (
          formatDate(tx.date)
        )}
      </div>
      <div className={styles['tx-desc']} title={tx.description}>
        {onUpdateTransaction ? (
          <input
            type="text"
            aria-label={t.description || 'Description'}
            className={styles['tx-inline-input']}
            value={tx.description}
            onChange={(e) => onUpdateTransaction(tx.id, { description: e.target.value })}
            title={tx.description}
          />
        ) : (
          tx.description
        )}
      </div>
      <div className={`${styles['tx-amount']} ${tx.type === 'income' ? styles.positive : styles.negative}`}>
        {onUpdateTransaction ? (
          <input
            type="number"
            step="0.01"
            aria-label={t.amount || 'Amount'}
            className={`${styles['tx-inline-input']} ${styles['tx-amount-input']}`}
            value={tx.amount === 0 ? '' : tx.amount}
            onChange={(e) => {
              const val = e.target.value;
              const num = val === '' ? 0 : parseFloat(val);
              onUpdateTransaction(tx.id, {
                amount: isNaN(num) ? 0 : num,
                type: (isNaN(num) ? 0 : num) >= 0 ? 'income' : 'expense'
              });
            }}
            title={formatCurrency(tx.amount)}
          />
        ) : (
          <>
            {tx.type === 'income' ? '+' : ''}
            {formatCurrency(tx.amount)}
          </>
        )}
      </div>
      <div className={styles['tx-actions']}>
        <button
          className={styles['tx-remove-btn']}
          onClick={() => onRemoveTransaction(tx.id)}
          aria-label={t.removeTransaction}
          title={t.removeTransaction}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.transactions}
      maxWidth="800px"
      footer={
        <button className={`primary-button ${styles['done-button']}`} onClick={onClose} title={t.done}>
          <Check size={18} className={styles['header-concept-icon']} />
          <span className={styles['hide-on-mobile']}>{t.done}</span>
        </button>
      }
    >
      <div className={styles['table-responsive-wrapper']}>
        <div className={styles['table-min-width']}>
          <div className={styles['table-header']}>
            <div className={`${styles['header-col']} ${styles['header-col-date']} ${styles['theme-primary-strong']}`}>
              <div className={styles['sortable-title']} onClick={() => handleSort('date')} title={t.date}>
                <CalendarDays size={16} className={`${styles['header-concept-icon']} ${styles['icon-secondary']}`} />
                <span className={styles['hide-on-mobile']}>{t.date}</span>
                {renderSortIcon('date')}
              </div>
              <DatePicker
                className={styles['filter-input']}
                value={filters.date}
                onChange={(date) => setFilters(prev => ({ ...prev, date }))}
                placeholder={t.filterDatePlaceholder}
              />
            </div>
            <div className={`${styles['header-col']} ${styles['header-col-desc']} ${styles['theme-primary-medium']}`}>
              <div className={styles['sortable-title']} onClick={() => handleSort('description')} title={t.description}>
                <FileText size={16} className={`${styles['header-concept-icon']} ${styles['icon-accent']}`} />
                <span className={styles['hide-on-mobile']}>{t.description}</span>
                {renderSortIcon('description')}
              </div>
              <input
                id="filter-desc"
                name="filter-desc"
                type="text"
                className={styles['filter-input']}
                placeholder={t.filterPlaceholder}
                title={t.filterPlaceholder}
                value={filters.description}
                onChange={(e) => setFilters(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className={`${styles['header-col']} ${styles['header-col-amount']} ${styles['theme-primary-light']}`}>
              <div className={`${styles['sortable-title']} ${styles['sortable-title-right']}`} onClick={() => handleSort('amount')} title={t.amount}>
                <Coins size={16} className={`${styles['header-concept-icon']} ${styles['icon-primary']}`} />
                <span className={styles['hide-on-mobile']}>{t.amount}</span>
                {renderSortIcon('amount')}
              </div>
              <input
                id="filter-amount"
                name="filter-amount"
                type="text"
                className={`${styles['filter-input']} ${styles['text-right']}`}
                placeholder={t.filterPlaceholder}
                title={t.filterPlaceholder}
                value={filters.amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.,-]/g, '');
                  setFilters(prev => ({ ...prev, amount: val }));
                }}
              />
            </div>
            <div className={`${styles['header-col']} ${styles['header-col-actions']}`}></div>
          </div>

          {filteredAndSortedTransactions.length === 0 ? (
            <div className={styles['empty-state']}>
              {transactions.length === 0 ? t.noTransactionsLeft : t.noTransactionsMatch}
            </div>
          ) : (
            <div className={styles['list-container']}>
              <Virtuoso
                style={{ height: '100%' }}
                totalCount={filteredAndSortedTransactions.length}
                data={filteredAndSortedTransactions}
                itemContent={rowContent}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
