import type { StateCreator } from 'zustand'

import type { AppState, UISlice } from './types'

export const createUISlice: StateCreator<
  AppState,
  [],
  [],
  UISlice
> = (set, _get, store) => ({
  filterTransactionsWithoutLogos: false,
  detachTransactionsFromDashboard: false,

  setFilterTransactionsWithoutLogos: (enabled) =>
    set({ filterTransactionsWithoutLogos: enabled }),

  setDetachTransactionsFromDashboard: (detach) =>
    set({ detachTransactionsFromDashboard: detach }),

  clearAllData: (resetPreferences = false) => {
    set({
      currentStep: 'country',
      selectedCountry: null,
      selectedInstitution: null,
      importedAccounts: [],
      customKeywords: {},
      manualCategories: {},
      customCategories: [],
      duplicateOverrideRules: [],
      filterTransactionsWithoutLogos: false,
      detachTransactionsFromDashboard: false,
    })
    try {
      const persistableStore = store as unknown as {
        persist?: { clearStorage?: () => void }
      }
      persistableStore.persist?.clearStorage?.()
    } catch (e) {
      console.warn('Failed to clear persisted app storage:', e)
    }
    if (resetPreferences) {
      try {
        localStorage.removeItem('mm-theme-preference')
        localStorage.removeItem('mm-language-preference')
      } catch (e) {
        console.warn('Failed to clear preferences:', e)
      }
    }
  },
})
