import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppStep, Country, FinancialInstitution, ImportedAccount } from '../types';

export interface AppState {
  currentStep: AppStep;
  selectedCountry: Country | null;
  selectedInstitution: FinancialInstitution | null;
  importedAccounts: ImportedAccount[];

  setStep: (step: AppStep) => void;
  selectCountry: (country: Country) => void;
  selectInstitution: (institution: FinancialInstitution) => void;
  addImportedAccount: (account: ImportedAccount) => void;
  resetImport: () => void;
  startNewInstitution: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentStep: 'country',
      selectedCountry: null,
      selectedInstitution: null,
      importedAccounts: [],

      setStep: (step) => set({ currentStep: step }),

      selectCountry: (country) => set({ selectedCountry: country, currentStep: 'institution' }),

      selectInstitution: (institution) => set({ selectedInstitution: institution, currentStep: 'import' }),

      addImportedAccount: (account) =>
        set((state) => {
          // Upsert: replace existing account for the same institution, or append if new.
          // This prevents duplicate transactions when the user re-imports the same file.
          const existingIdx = state.importedAccounts.findIndex(
            (a) => a.institutionId === account.institutionId
          );
          const updated =
            existingIdx >= 0
              ? state.importedAccounts.map((a, i) => (i === existingIdx ? account : a))
              : [...state.importedAccounts, account];
          return { importedAccounts: updated, currentStep: 'review' };
        }),

      resetImport: () =>
        set({
          currentStep: 'country',
          selectedCountry: null,
          selectedInstitution: null,
          importedAccounts: [],
        }),

      startNewInstitution: () =>
        set({
          selectedInstitution: null,
          currentStep: 'institution',
        }),
    }),
    {
      name: 'mm-app-storage',
    }
  )
);
