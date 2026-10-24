import { useCallback, useState } from 'react'

import type { Transaction } from '../../../types'
import {
  extractCleanDescription,
  extractMerchantKeyword,
  findRelatedTransactions,
  isInformativeTransaction,
  isPaymentProcessorOnly,
} from '../../../utils/category-utils'

interface UseTransactionBatchCategoryProps {
  allTransactions?: Transaction[]
  filteredTx: Transaction[]
  setManualCategory: (id: string, category: string) => void
  setManualCategoriesBulk: (categories: Record<string, string>) => void
  customKeywords: Record<string, string[]>
  setCustomKeywords: (category: string, keywords: string[]) => void
}

export function useTransactionBatchCategory({
  allTransactions,
  filteredTx,
  setManualCategory,
  setManualCategoriesBulk,
  customKeywords,
  setCustomKeywords,
}: UseTransactionBatchCategoryProps) {
  const [pendingBatchCategory, setPendingBatchCategory] = useState<{
    targetTx: Transaction
    newCategory: string
    relatedTx: Transaction[]
  } | null>(null)

  const handleCategoryChange = useCallback(
    (tx: Transaction, newCategory: string) => {
      if (isInformativeTransaction(tx)) {
        return
      }
      const currentCategory = tx.category || 'Other'
      if (newCategory === currentCategory) {
        return
      }

      // Check for related transactions across candidate pool
      const candidatePool = allTransactions || filteredTx
      const related = findRelatedTransactions(tx, candidatePool, newCategory)

      if (related.length > 0) {
        setPendingBatchCategory({
          targetTx: tx,
          newCategory,
          relatedTx: related,
        })
        return
      }

      // If no related transactions exist, update directly without interrupting
      setManualCategory(tx.id, newCategory)
      const cleanDesc = extractCleanDescription(tx.description)
      const merchantKeyword = extractMerchantKeyword(tx.description)
      const candidates = [merchantKeyword, cleanDesc].filter(
        (kw) => kw && kw.trim().length >= 3 && !isPaymentProcessorOnly(kw),
      )
      if (candidates.length > 0) {
        const existingKeywords = customKeywords[newCategory] || []
        const updated = [...existingKeywords]
        let changed = false
        for (const cand of candidates) {
          if (!updated.some((k) => k.toLowerCase() === cand.toLowerCase())) {
            updated.push(cand)
            changed = true
          }
        }
        if (changed) {
          setCustomKeywords(newCategory, updated)
        }
      }
    },
    [allTransactions, filteredTx, setManualCategory, customKeywords, setCustomKeywords],
  )

  const handleConfirmBatchOnlyThis = useCallback(
    (targetTx: Transaction, newCat: string) => {
      setManualCategory(targetTx.id, newCat)
    },
    [setManualCategory],
  )

  const handleConfirmBatchAll = useCallback(
    (targetTx: Transaction, relatedTx: Transaction[], newCat: string, rememberRule: boolean) => {
      const mapping: Record<string, string> = {
        [targetTx.id]: newCat,
      }
      for (let i = 0; i < relatedTx.length; i++) {
        if (!isInformativeTransaction(relatedTx[i])) {
          mapping[relatedTx[i].id] = newCat
        }
      }
      setManualCategoriesBulk(mapping)

      if (rememberRule) {
        const cleanDesc = extractCleanDescription(targetTx.description)
        const merchantKeyword = extractMerchantKeyword(targetTx.description)
        const candidates = [merchantKeyword, cleanDesc].filter(
          (kw) => kw && kw.trim().length >= 3 && !isPaymentProcessorOnly(kw),
        )
        if (candidates.length > 0) {
          const existingKeywords = customKeywords[newCat] || []
          const updated = [...existingKeywords]
          let changed = false
          for (const cand of candidates) {
            if (!updated.some((k) => k.toLowerCase() === cand.toLowerCase())) {
              updated.push(cand)
              changed = true
            }
          }
          if (changed) {
            setCustomKeywords(newCat, updated)
          }
        }
      }
    },
    [setManualCategoriesBulk, customKeywords, setCustomKeywords],
  )

  return {
    pendingBatchCategory,
    setPendingBatchCategory,
    handleCategoryChange,
    handleConfirmBatchOnlyThis,
    handleConfirmBatchAll,
  }
}
