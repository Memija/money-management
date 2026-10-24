import React, { useMemo } from 'react'

import type { MonthlyEntry } from '../../../hooks/useAnalytics'
import { useDeferredUnmount } from '../../../hooks/useDeferredUnmount'
import type { TranslationStrings } from '../../../i18n/translations'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { Transaction } from '../../../types'
import { getCategoryLabel, getTransactionMerchant } from '../../../utils/category-utils'
import { TransactionPreviewModal } from '../../shared/TransactionPreviewModal'
import { AvgDetailModal } from '../AvgDetailModal/AvgDetailModal'
import { SavingsTrendModal } from '../SavingsTrendModal'

/** Drill-down shown in the transaction detail modal. */
export type DetailModalState =
  | { type: 'filter'; filter: 'all' | 'income' | 'expense' }
  | { type: 'category'; category: string }
  | { type: 'merchant'; merchant: string }
  | null

export type AvgDetailType = 'income' | 'expense' | null

interface DashboardModalsProps {
  periodTransactions: Transaction[]
  monthlyData: MonthlyEntry[]
  totalIncome: number
  totalExpenses: number
  savingsRate: number
  showInstitution: boolean
  activeDetailModal: DetailModalState
  onDetailModalClose: () => void
  avgDetailType: AvgDetailType
  onAvgDetailClose: () => void
  isSavingsTrendOpen: boolean
  onSavingsTrendClose: () => void
}

/** Stable empty list so the detail modal doesn't receive a new array while closing. */
const EMPTY_TRANSACTIONS: Transaction[] = []

const normalizeMerchant = (value: string): string => value.trim().replace(/\s+/g, ' ').toLowerCase()

const buildDetailModalConfig = (
  modal: DetailModalState,
  periodTransactions: Transaction[],
  t: TranslationStrings,
) => {
  if (!modal) {
    return null
  }
  if (modal.type === 'filter') {
    const { filter } = modal
    const title =
      filter === 'income' ? t.income : filter === 'expense' ? t.expenses : t.allTransactions
    const variant: 'expense' | 'income' = filter === 'expense' ? 'expense' : 'income'
    const transactions = periodTransactions.filter((tx) => filter === 'all' || tx.type === filter)
    return { title, variant, transactions }
  }
  if (modal.type === 'category') {
    const { category } = modal
    const transactions = periodTransactions.filter(
      (tx) => tx.type === 'expense' && (tx.category || 'Other') === category,
    )
    return { title: getCategoryLabel(category, t), variant: 'expense' as const, transactions }
  }
  const { merchant } = modal
  const normalizedMerchant = normalizeMerchant(merchant)
  const transactions = periodTransactions.filter((tx) => {
    if (tx.type !== 'expense') {
      return false
    }
    const txMerchant = normalizeMerchant(getTransactionMerchant(tx))
    if (txMerchant === normalizedMerchant) {
      return true
    }
    return normalizeMerchant(tx.description) === normalizedMerchant
  })
  return { title: merchant || t.topMerchants, variant: 'expense' as const, transactions }
}

/**
 * All Dashboard drill-down modals. Each heavy modal is mounted only while it is open
 * (or playing its exit animation), so closed modals cost nothing when the Dashboard
 * re-renders, e.g. on a language switch.
 */
export const DashboardModals: React.FC<DashboardModalsProps> = React.memo(
  ({
    periodTransactions,
    monthlyData,
    totalIncome,
    totalExpenses,
    savingsRate,
    showInstitution,
    activeDetailModal,
    onDetailModalClose,
    avgDetailType,
    onAvgDetailClose,
    isSavingsTrendOpen,
    onSavingsTrendClose,
  }) => {
    const t = useLanguageStore((s) => s.t)

    const isDetailModalOpen = activeDetailModal !== null
    const shouldRenderDetailModal = useDeferredUnmount(isDetailModalOpen)
    const shouldRenderSavingsTrend = useDeferredUnmount(isSavingsTrendOpen)

    const detailModalConfig = useMemo(
      () => buildDetailModalConfig(activeDetailModal, periodTransactions, t),
      [activeDetailModal, periodTransactions, t],
    )

    return (
      <>
        {shouldRenderDetailModal && (
          <TransactionPreviewModal
            isOpen={isDetailModalOpen}
            onClose={onDetailModalClose}
            title={detailModalConfig?.title ?? ''}
            variant={detailModalConfig?.variant ?? 'expense'}
            transactions={detailModalConfig?.transactions ?? EMPTY_TRANSACTIONS}
            showInstitution={showInstitution}
            isImport={false}
          />
        )}

        {avgDetailType !== null && (
          <AvgDetailModal
            isOpen
            onClose={onAvgDetailClose}
            type={avgDetailType}
            transactions={periodTransactions}
          />
        )}

        {shouldRenderSavingsTrend && (
          <SavingsTrendModal
            isOpen={isSavingsTrendOpen}
            onClose={onSavingsTrendClose}
            monthlyData={monthlyData}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            savingsRate={savingsRate}
          />
        )}
      </>
    )
  },
)

DashboardModals.displayName = 'DashboardModals'
