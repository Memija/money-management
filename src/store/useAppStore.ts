import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { CATEGORIZER_RULES_VERSION } from '../utils/category-utils'
import { createDebouncedJSONStorage } from '../utils/storage/debounced-json-storage'
import { idbStorage } from '../utils/storage/idb-storage'
import {
  recategorizeAccounts,
  sanitizeCustomKeywords,
  sanitizeManualCategories,
} from './category-store-helpers'
import { sanitizeDuplicateOverrideRules } from './duplicate-helpers'
import { createAccountSlice } from './slices/accountSlice'
import { createCategorySlice } from './slices/categorySlice'
import { createDuplicateRuleSlice } from './slices/duplicateRuleSlice'
import type { AppState } from './slices/types'
import { createUISlice } from './slices/uiSlice'

export type { AppState } from './slices/types'
export {
  countDuplicateTransactionsInAccounts,
  isModifiedTransactionForRule,
  isOriginalTransactionMatchForRule,
  matchesDuplicateOverrideRule,
  sanitizeDuplicateOverrideRules,
  toCanonicalTransactionKey,
} from './duplicate-helpers'
export {
  migrateHealthInsuranceCategories,
  recategorizeAccounts,
  sanitizeCustomKeywords,
  sanitizeManualCategories,
} from './category-store-helpers'

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAccountSlice(...a),
      ...createDuplicateRuleSlice(...a),
      ...createCategorySlice(...a),
      ...createUISlice(...a),
    }),
    {
      name: 'saldio-app-storage',
      storage: createDebouncedJSONStorage<AppState>(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (Array.isArray(state.duplicateOverrideRules)) {
            state.duplicateOverrideRules = sanitizeDuplicateOverrideRules(
              state.duplicateOverrideRules,
            )
          }
          if (state.customKeywords) {
            state.customKeywords = sanitizeCustomKeywords(state.customKeywords)
          }
          if (state.manualCategories && state.importedAccounts) {
            state.manualCategories = sanitizeManualCategories(
              state.manualCategories,
              state.importedAccounts,
            )
          }
          if (
            state.importedAccounts &&
            (state.appliedCategorizerVersion ?? 0) < CATEGORIZER_RULES_VERSION
          ) {
            const { accounts, changed } = recategorizeAccounts(
              state.importedAccounts,
              state.manualCategories,
              state.customKeywords,
              state.customCategories,
            )
            if (changed) {
              state.importedAccounts = accounts
            }
            state.appliedCategorizerVersion = CATEGORIZER_RULES_VERSION
          }
        }
      },
    },
  ),
)
