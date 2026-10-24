import type { StateCreator } from 'zustand'

import { CATEGORIZER_RULES_VERSION, isPaymentProcessorOnly } from '../../utils/category-utils'
import { recategorizeAccounts } from '../category-store-helpers'
import type { AppState, CategorySlice } from './types'

export const createCategorySlice: StateCreator<
  AppState,
  [],
  [],
  CategorySlice
> = (set, get) => ({
  customKeywords: {},
  manualCategories: {},
  customCategories: [],
  appliedCategorizerVersion: CATEGORIZER_RULES_VERSION,

  autoRecategorizeUneditedTransactions: (force = false) => {
    const {
      importedAccounts,
      manualCategories,
      customKeywords,
      customCategories,
      appliedCategorizerVersion,
    } = get()
    if (force || (appliedCategorizerVersion ?? 0) < CATEGORIZER_RULES_VERSION) {
      const { accounts, changed } = recategorizeAccounts(
        importedAccounts,
        manualCategories,
        customKeywords,
        customCategories,
      )
      if (changed) {
        set({
          importedAccounts: accounts,
          appliedCategorizerVersion: CATEGORIZER_RULES_VERSION,
        })
      } else {
        set({ appliedCategorizerVersion: CATEGORIZER_RULES_VERSION })
      }
    }
  },

  migrateHealthInsurance: () => {
    get().autoRecategorizeUneditedTransactions(true)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('mm-app-storage')
      }
    } catch {
      // ignore
    }
  },

  addCustomCategory: (category) =>
    set((state) => ({
      customCategories: [...state.customCategories, category],
    })),

  updateCustomCategory: (category) =>
    set((state) => ({
      customCategories: state.customCategories.map((c) =>
        c.id === category.id ? category : c,
      ),
    })),

  deleteCustomCategory: (id) =>
    set((state) => ({
      customCategories: state.customCategories.filter((c) => c.id !== id),
    })),

  setCustomKeywords: (category, keywords) =>
    set((state) => {
      const cleaned = Array.isArray(keywords)
        ? keywords.filter(
            (w) => typeof w === 'string' && w.trim().length >= 2 && !isPaymentProcessorOnly(w),
          )
        : []
      const next = { ...state.customKeywords }
      if (cleaned.length > 0) {
        next[category] = cleaned
      } else {
        delete next[category]
      }
      return { customKeywords: next }
    }),

  setManualCategory: (transactionId, category) =>
    set((state) => ({
      manualCategories: {
        ...state.manualCategories,
        [transactionId]: category,
      },
    })),

  setManualCategoriesBulk: (mapping) =>
    set((state) => ({
      manualCategories: {
        ...state.manualCategories,
        ...mapping,
      },
    })),
})
