import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Select } from '../../shared/Select'

import styles from './TransactionListPagination.module.css'

export interface TransactionListPaginationProps {
  shownCount: number
  totalCount: number
  pageSize: number
  onPageSizeChange: (newSize: number) => void
  currentPage: number
  totalPages: number
  visiblePages: (number | string)[]
  onPageChange: (newPage: number) => void
  showingOfText?: string
  perPageLabel?: string
}

export const TransactionListPagination: React.FC<TransactionListPaginationProps> = ({
  shownCount,
  totalCount,
  pageSize,
  onPageSizeChange,
  currentPage,
  totalPages,
  visiblePages,
  onPageChange,
  showingOfText,
  perPageLabel,
}) => {
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const defaultShowingOf = 'Showing {shown} of {total}'

  return (
    <div className={styles.paginationBar}>
      <div className={styles.paginationLeft}>
        <p className={styles.moreRows}>
          {(showingOfText || defaultShowingOf)
            .replace('{shown}', String(shownCount))
            .replace('{total}', String(totalCount))}
        </p>
        <div className={styles.pageSizeWrapper}>
          <label htmlFor="tx-page-size-select" className={styles.pageSizeLabel}>
            {perPageLabel || 'Per page:'}
          </label>
          <Select
            id="tx-page-size-select"
            name="tx-page-size-select"
            value={pageSize}
            onChange={(val) => onPageSizeChange(Number(val))}
            size="sm"
            className={styles.pageSizeSelectWrapper}
            aria-label={perPageLabel || 'Per page:'}
            options={[
              { value: 10, label: '10' },
              { value: 25, label: '25' },
              { value: 50, label: '50' },
              { value: 100, label: '100' },
            ]}
          />
        </div>
      </div>

      {totalPages > 1 && (
        <div className={styles.pageControls}>
          <button
            type="button"
            disabled={safeCurrentPage === 1}
            onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
            className={styles.pageBtn}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          {visiblePages.map((pageItem, index) =>
            pageItem === '...' ? (
              <span key={`ellipsis-${index}`} className={styles.pageEllipsis} aria-hidden="true">
                &hellip;
              </span>
            ) : (
              <button
                key={pageItem}
                type="button"
                onClick={() => onPageChange(Number(pageItem))}
                className={`${styles.pageBtn} ${
                  safeCurrentPage === pageItem ? styles.pageBtnActive : ''
                }`}
                aria-label={`Page ${pageItem}`}
                aria-current={safeCurrentPage === pageItem ? 'page' : undefined}
              >
                {pageItem}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={safeCurrentPage === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, safeCurrentPage + 1))}
            className={styles.pageBtn}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
