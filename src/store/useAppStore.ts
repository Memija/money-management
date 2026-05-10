import { create } from 'zustand';
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

export const useAppStore = create<AppState>((set) => ({
  currentStep: 'country',
  selectedCountry: null,
  selectedInstitution: null,
  importedAccounts: [],


  setStep: (step) => set({ currentStep: step }),

  selectCountry: (country) => set({ selectedCountry: country, currentStep: 'institution' }),

  selectInstitution: (institution) => set({ selectedInstitution: institution, currentStep: 'import' }),

  addImportedAccount: (account) =>
    set((state) => ({
      importedAccounts: [...state.importedAccounts, account],
      currentStep: 'review',
    })),

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

}));
