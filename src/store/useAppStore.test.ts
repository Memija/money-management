import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './useAppStore';
import type { Country, FinancialInstitution, ImportedAccount } from '../types';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      currentStep: 'country',
      selectedCountry: null,
      selectedInstitution: null,
      importedAccounts: [],
    });
  });

  it('should have initial state', () => {
    const state = useAppStore.getState();
    expect(state.currentStep).toBe('country');
    expect(state.selectedCountry).toBeNull();
    expect(state.selectedInstitution).toBeNull();
    expect(state.importedAccounts).toEqual([]);
  });

  it('should set step', () => {
    useAppStore.getState().setStep('import');
    expect(useAppStore.getState().currentStep).toBe('import');
  });

  it('should select country and move to institution step', () => {
    const mockCountry: Country = { code: 'us', name: 'USA', flag: '🇺🇸', supported: true };
    useAppStore.getState().selectCountry(mockCountry);

    const state = useAppStore.getState();
    expect(state.selectedCountry).toEqual(mockCountry);
    expect(state.currentStep).toBe('institution');
  });

  it('should select institution and move to import step', () => {
    const mockInstitution: FinancialInstitution = {
      id: 'chase',
      name: 'Chase',
      type: 'bank',
      category: 'traditional',
      logo: 'chase.png'
    };
    useAppStore.getState().selectInstitution(mockInstitution);

    const state = useAppStore.getState();
    expect(state.selectedInstitution).toEqual(mockInstitution);
    expect(state.currentStep).toBe('import');
  });

  it('should add imported account and move to review step', () => {
    const mockAccount: ImportedAccount = {
      institutionId: 'chase',
      institutionName: 'Chase',
      transactions: [],
      importedAt: new Date().toISOString()
    };
    useAppStore.getState().addImportedAccount(mockAccount);

    const state = useAppStore.getState();
    expect(state.importedAccounts).toContainEqual(mockAccount);
    expect(state.currentStep).toBe('review');
  });

  it('should reset import state', () => {
    // Set some non-initial state
    useAppStore.setState({
      currentStep: 'review',
      selectedCountry: { code: 'us', name: 'USA', flag: '🇺🇸', supported: true },
      selectedInstitution: { id: 'chase', name: 'Chase', type: 'bank', category: 'traditional' },
      importedAccounts: [{
        institutionId: '1',
        institutionName: 'test',
        transactions: [],
        importedAt: ''
      }],
    });

    useAppStore.getState().resetImport();

    const state = useAppStore.getState();
    expect(state.currentStep).toBe('country');
    expect(state.selectedCountry).toBeNull();
    expect(state.selectedInstitution).toBeNull();
    expect(state.importedAccounts).toEqual([]);
  });

  it('should start new institution flow', () => {
    useAppStore.setState({
      currentStep: 'import',
      selectedInstitution: { id: 'chase', name: 'Chase', type: 'bank', category: 'traditional' },
    });

    useAppStore.getState().startNewInstitution();

    const state = useAppStore.getState();
    expect(state.selectedInstitution).toBeNull();
    expect(state.currentStep).toBe('institution');
  });
});
