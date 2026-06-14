import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTransactionImport } from './useTransactionImport';
import * as parsers from '../../utils/transaction-parsers';
import * as XLSX from 'xlsx';
import type { Transaction } from '../../types';

// Mock the dependencies
vi.mock('../../utils/transaction-parsers', () => ({
  rowsToTransactions: vi.fn(),
  parseBankStatementPaste: vi.fn(),
  parsePdfText: vi.fn(),
}));

vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
  },
}));

vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: { workerSrc: '' },
}));

// Mock pdfWorkerUrl
vi.mock('pdfjs-dist/build/pdf.worker.mjs?url', () => ({
  default: 'worker-url'
}));

const mockTransactions: Transaction[] = [
  { id: '1', date: '2024-01-01', description: 'Test 1', amount: 100, category: 'Income' } as unknown as Transaction,
  { id: '2', date: '2024-01-02', description: 'Test 2', amount: -50, category: 'Expense' } as unknown as Transaction,
];

describe('useTransactionImport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useTransactionImport('Bank A', null));

    expect(result.current.transactions).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.fileName).toBeNull();
    expect(result.current.pasteText).toBe('');
  });

  describe('handlePaste', () => {
    it('should parse valid bank statement paste successfully', () => {
      vi.mocked(parsers.parseBankStatementPaste).mockReturnValue(mockTransactions);

      const { result } = renderHook(() => useTransactionImport('Bank A', 'paste'));

      act(() => {
        result.current.setPasteText('some raw paste text');
      });

      act(() => {
        result.current.handlePaste();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.transactions).toEqual(mockTransactions);
      expect(parsers.parseBankStatementPaste).toHaveBeenCalledWith('some raw paste text', 'Bank A');
    });

    it('should fallback to CSV parsing if bank statement paste fails', () => {
      vi.mocked(parsers.parseBankStatementPaste).mockReturnValue([]);
      vi.mocked(parsers.rowsToTransactions).mockReturnValue(mockTransactions);

      const { result } = renderHook(() => useTransactionImport('Bank A', 'paste'));

      act(() => {
        result.current.setPasteText('Date,Amount\n2024-01-01,100');
      });

      act(() => {
        result.current.handlePaste();
      });

      expect(result.current.transactions).toEqual(mockTransactions);
      expect(parsers.rowsToTransactions).toHaveBeenCalled();
    });

    it('should set error if both paste parsing strategies fail', () => {
      vi.mocked(parsers.parseBankStatementPaste).mockReturnValue([]);
      vi.mocked(parsers.rowsToTransactions).mockReturnValue([]);

      const { result } = renderHook(() => useTransactionImport('Bank A', 'paste'));

      act(() => {
        result.current.setPasteText('invalid paste text');
      });

      act(() => {
        result.current.handlePaste();
      });

      expect(result.current.transactions).toEqual([]);
      expect(result.current.error).toMatch(/No transactions could be parsed/);
    });
  });

  describe('handleFileChange - Spreadsheet (.xlsx)', () => {
    it('should parse valid Excel file successfully', async () => {
      const file = new File(['dummy content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      vi.mocked(XLSX.read).mockReturnValue({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } } as unknown as XLSX.WorkBook);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([['Date', 'Amount'], ['2024-01-01', '100']]);
      vi.mocked(parsers.rowsToTransactions).mockReturnValue(mockTransactions);

      const { result } = renderHook(() => useTransactionImport('Bank A', 'spreadsheet'));

      await act(async () => {
        await result.current.handleFileChange(file);
      });

      expect(result.current.fileName).toBe('test.xlsx');
      expect(result.current.transactions).toEqual(mockTransactions);
      expect(result.current.error).toBeNull();
      expect(parsers.rowsToTransactions).toHaveBeenCalledWith([['Date', 'Amount'], ['2024-01-01', '100']], 'Bank A');
    });

    it('should handle Excel files with no transactions', async () => {
      const file = new File(['dummy content'], 'empty.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      vi.mocked(XLSX.read).mockReturnValue({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } } as unknown as XLSX.WorkBook);
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([]);
      vi.mocked(parsers.rowsToTransactions).mockReturnValue([]);

      const { result } = renderHook(() => useTransactionImport('Bank A', 'spreadsheet'));

      await act(async () => {
        await result.current.handleFileChange(file);
      });

      expect(result.current.transactions).toEqual([]);
      expect(result.current.error).toBe('No transactions found in the file.');
    });
  });

  describe('handleFileChange - CSV', () => {
    it('should parse valid CSV file successfully', async () => {
      const csvContent = 'Date,Amount\n2024-01-01,100';
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
      vi.mocked(parsers.rowsToTransactions).mockReturnValue(mockTransactions);

      const { result } = renderHook(() => useTransactionImport('Bank A', 'spreadsheet'));

      await act(async () => {
        await result.current.handleFileChange(file);
      });

      expect(result.current.fileName).toBe('test.csv');
      expect(result.current.transactions).toEqual(mockTransactions);
      expect(result.current.error).toBeNull();
    });
    
    it('should handle ISO-8859-1 encoded CSV files', async () => {
      // Provide a buffer that decodes poorly in UTF-8
      const buffer = new Uint8Array([0xC4, 0xD6, 0xDC]); // ÄÖÜ in ISO-8859-1
      const file = new File([buffer], 'iso.csv', { type: 'text/csv' });
      vi.mocked(parsers.rowsToTransactions).mockReturnValue(mockTransactions);

      const { result } = renderHook(() => useTransactionImport('Bank A', 'spreadsheet'));

      await act(async () => {
        await result.current.handleFileChange(file);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.transactions).toEqual(mockTransactions);
    });

    it('should handle CSV files with no transactions', async () => {
      const file = new File(['HeaderOnly'], 'empty.csv', { type: 'text/csv' });
      vi.mocked(parsers.rowsToTransactions).mockReturnValue([]);

      const { result } = renderHook(() => useTransactionImport('Bank A', 'spreadsheet'));

      await act(async () => {
        await result.current.handleFileChange(file);
      });

      expect(result.current.transactions).toEqual([]);
      expect(result.current.error).toBe('No transactions found in the CSV.');
    });
  });

  describe('handleFileChange - PDF', () => {
    it('should parse valid PDF file successfully', async () => {
      const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
      vi.mocked(parsers.parsePdfText).mockReturnValue(mockTransactions);

      // We need to mock pdfjs-dist getDocument to resolve a promise
      const mockPdfjs = await import('pdfjs-dist');
      vi.mocked(mockPdfjs.getDocument).mockReturnValue({
        promise: Promise.resolve({
          numPages: 1,
          getPage: vi.fn().mockResolvedValue({
            getTextContent: vi.fn().mockResolvedValue({
              items: [{ str: 'PDF Content' }]
            })
          })
        })
      } as unknown as ReturnType<typeof mockPdfjs.getDocument>);

      const { result } = renderHook(() => useTransactionImport('Bank A', 'pdf'));

      await act(async () => {
        await result.current.handleFileChange(file);
      });

      expect(result.current.fileName).toBe('test.pdf');
      expect(result.current.transactions).toEqual(mockTransactions);
      expect(result.current.error).toBeNull();
      expect(parsers.parsePdfText).toHaveBeenCalledWith('PDF Content\n', 'Bank A');
    });

    it('should handle PDF files with no transactions', async () => {
      const file = new File(['dummy content'], 'empty.pdf', { type: 'application/pdf' });
      vi.mocked(parsers.parsePdfText).mockReturnValue([]);

      const mockPdfjs = await import('pdfjs-dist');
      vi.mocked(mockPdfjs.getDocument).mockReturnValue({
        promise: Promise.resolve({
          numPages: 1,
          getPage: vi.fn().mockResolvedValue({
            getTextContent: vi.fn().mockResolvedValue({
              items: [{ str: 'Empty PDF' }]
            })
          })
        })
      } as unknown as ReturnType<typeof mockPdfjs.getDocument>);

      const { result } = renderHook(() => useTransactionImport('Bank A', 'pdf'));

      await act(async () => {
        await result.current.handleFileChange(file);
      });

      expect(result.current.transactions).toEqual([]);
      expect(result.current.error).toMatch(/Could not auto-detect transactions in this PDF/);
    });
  });

  describe('State Mutators', () => {
    it('should remove transaction by ID', () => {
      const { result } = renderHook(() => useTransactionImport('Bank A', null));

      // First manually set some transactions via a mocked success
      act(() => {
        vi.mocked(parsers.parseBankStatementPaste).mockReturnValue(mockTransactions);
        result.current.setPasteText('test');
        result.current.handlePaste();
      });

      expect(result.current.transactions).toHaveLength(2);

      act(() => {
        result.current.handleRemoveTransaction('1');
      });

      expect(result.current.transactions).toHaveLength(1);
      expect(result.current.transactions[0].id).toBe('2');
    });

    it('should clear all state', () => {
      const { result } = renderHook(() => useTransactionImport('Bank A', null));

      act(() => {
        vi.mocked(parsers.parseBankStatementPaste).mockReturnValue(mockTransactions);
        result.current.setPasteText('test');
        result.current.handlePaste();
        result.current.setFileName('test.csv');
      });

      expect(result.current.transactions).toHaveLength(2);
      expect(result.current.fileName).toBe('test.csv');
      expect(result.current.pasteText).toBe('test');

      act(() => {
        result.current.handleClearAll();
      });

      expect(result.current.transactions).toHaveLength(0);
      expect(result.current.fileName).toBeNull();
      expect(result.current.pasteText).toBe('');
    });
  });
});
