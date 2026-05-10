import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TransactionImporter from './TransactionImporter';
import { useAppStore, type AppState } from '../store/useAppStore';
import { useLanguageStore, type LanguageState } from '../store/useLanguageStore';
import type { TranslationStrings } from '../i18n/translations';
import * as XLSX from 'xlsx';

const { mockAddImportedAccount, mockSetStep } = vi.hoisted(() => ({
  mockAddImportedAccount: vi.fn(),
  mockSetStep: vi.fn(),
}));

// Mock the stores
vi.mock('../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      selectedInstitution: { id: '1', name: 'Bank A' },
      addImportedAccount: mockAddImportedAccount,
      setStep: mockSetStep,
    };
    return typeof selector === 'function' ? selector(state as unknown as AppState) : state;
  }),
}));

vi.mock('../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      t: {
        back: 'Back',
        importTransactionsTitle: 'Import Transactions',
        importTransactionsSubtitle: 'Import for {institution}',
        importPsd2Notice: 'Notice',
        excelFile: 'Excel',
        excelFileDesc: 'Excel desc',
        csvFile: 'CSV',
        csvFileDesc: 'CSV desc',
        pdfStatement: 'PDF',
        pdfStatementDesc: 'PDF desc',
        copyPaste: 'Paste',
        copyPasteDesc: 'Paste desc',
        chooseDifferentFormat: 'Choose Different',
        dragDropFile: 'Drag & Drop',
        orClickToBrowse: 'Or click to browse {accepted}',
        pasteDataPlaceholder: 'Paste here',
        parseTransactions: 'Parse',
        processingData: 'Processing...',
        transactionsFound: '{count} transactions found',
        clear: 'Clear',
        date: 'Date',
        description: 'Description',
        amount: 'Amount',
        moreTransactions: '+{count} more',
        confirmImport: 'Confirm',
        dropHere: 'Drop here',
      } as unknown as TranslationStrings
    };
    return typeof selector === 'function' ? selector(state as LanguageState) : state;
  }),
}));

// Mock XLSX
vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
  },
}));

// Mock pdfjs
vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: { workerSrc: '' },
}));

describe('TransactionImporter', () => {
  const mockT = {
    back: 'Back',
    importTransactionsTitle: 'Import Transactions',
    importTransactionsSubtitle: 'Import for {institution}',
    importPsd2Notice: 'Notice',
    excelFile: 'Excel',
    excelFileDesc: 'Excel desc',
    csvFile: 'CSV',
    csvFileDesc: 'CSV desc',
    pdfStatement: 'PDF',
    pdfStatementDesc: 'PDF desc',
    copyPaste: 'Paste',
    copyPasteDesc: 'Paste desc',
    chooseDifferentFormat: 'Choose Different',
    dragDropFile: 'Drag & Drop',
    orClickToBrowse: 'Or click to browse {accepted}',
    pasteDataPlaceholder: 'Paste here',
    parseTransactions: 'Parse',
    processingData: 'Processing...',
    transactionsFound: '{count} transactions found',
    clear: 'Clear',
    date: 'Date',
    description: 'Description',
    amount: 'Amount',
    moreTransactions: '+{count} more',
    confirmImport: 'Confirm',
    dropHere: 'Drop here',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLanguageStore).mockImplementation((selector) => selector({
      t: mockT as unknown as TranslationStrings,
    } as unknown as LanguageState));
  });

  it('renders initial methods correctly', () => {
    render(<TransactionImporter />);
    
    expect(screen.getByText('Excel')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
  });

  it('navigates back to institution selection', () => {
    render(<TransactionImporter />);
    
    fireEvent.click(screen.getByText('Back'));
    expect(mockSetStep).toHaveBeenCalledWith('institution');
  });

  it('shows paste area when copy-paste method is selected', () => {
    render(<TransactionImporter />);
    
    fireEvent.click(screen.getByText('Paste'));
    expect(screen.getByPlaceholderText('Paste here')).toBeInTheDocument();
  });

  it('parses pasted data correctly', async () => {
    render(<TransactionImporter />);
    
    fireEvent.click(screen.getByText('Paste'));
    const textarea = screen.getByPlaceholderText('Paste here');
    
    // Header + one row
    const csvData = "Date,Description,Amount\n2024-01-01,Lunch,-15.50";
    fireEvent.change(textarea, { target: { value: csvData } });
    
    fireEvent.click(screen.getByText('Parse'));
    
    await waitFor(() => {
      expect(screen.getByText('Lunch')).toBeInTheDocument();
      expect(screen.getByText(/15,50/)).toBeInTheDocument();
    });
  });

  it('calls addImportedAccount on confirm', async () => {
    render(<TransactionImporter />);
    
    // Select paste and parse some data
    fireEvent.click(screen.getByText('Paste'));
    fireEvent.change(screen.getByPlaceholderText('Paste here'), { 
      target: { value: "Date,Description,Amount\n2024-01-01,Test,100" } 
    });
    fireEvent.click(screen.getByText('Parse'));
    
    await waitFor(() => screen.getByText('Confirm'));
    fireEvent.click(screen.getByText('Confirm'));
    
    expect(mockAddImportedAccount).toHaveBeenCalledWith(expect.objectContaining({
      institutionName: 'Bank A',
      transactions: expect.arrayContaining([
        expect.objectContaining({ description: 'Test', amount: 100 })
      ])
    }));
  });

  it('shows error if no transactions found in pasted data', async () => {
    render(<TransactionImporter />);
    
    fireEvent.click(screen.getByText('Paste'));
    fireEvent.change(screen.getByPlaceholderText('Paste here'), { 
      target: { value: "Invalid Data" } 
    });
    fireEvent.click(screen.getByText('Parse'));
    
    await waitFor(() => {
      expect(screen.getByText('No transactions could be parsed from the pasted data.')).toBeInTheDocument();
    });
  });

  it('allows clearing transactions and going back to method selection', async () => {
    render(<TransactionImporter />);
    
    fireEvent.click(screen.getByText('Paste'));
    fireEvent.change(screen.getByPlaceholderText('Paste here'), { 
      target: { value: "Date,Description,Amount\n2024-01-01,Test,100" } 
    });
    fireEvent.click(screen.getByText('Parse'));
    
    await waitFor(() => screen.getByText('Clear'));
    fireEvent.click(screen.getByText('Clear'));
    
    expect(screen.getByPlaceholderText('Paste here')).toHaveValue('');
  });
});
