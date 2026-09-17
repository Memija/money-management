import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as XLSX from 'xlsx'

import type { Transaction } from '../../types'
import * as parsers from '../../utils/transaction-parsers'
import { useTransactionImport } from './useTransactionImport'

// Mock the dependencies
vi.mock('../../utils/transaction-parsers', () => ({
  rowsToTransactions: vi.fn(),
  rowsToTransactionsWithMeta: vi.fn(),
  parseBankStatementPaste: vi.fn(),
  parsePdfText: vi.fn(),
  extractAccountIbansFromPaste: vi.fn(() => []),
  extractAccountIbansFromPdf: vi.fn(() => []),
  splitCsvLine: (line: string, sep: string) =>
    line.split(sep).map((c: string) => c.replace(/^"|"$/g, '').trim()),
}))

vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
  },
}))

vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: { workerSrc: '' },
}))

// Mock pdfWorkerUrl
vi.mock('pdfjs-dist/build/pdf.worker.mjs?url', () => ({
  default: 'worker-url',
}))

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-01',
    description: 'Test 1',
    amount: 100,
    category: 'Income',
  } as unknown as Transaction,
  {
    id: '2',
    date: '2024-01-02',
    description: 'Test 2',
    amount: -50,
    category: 'Expense',
  } as unknown as Transaction,
]

describe('useTransactionImport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useTransactionImport('Bank A', null))

    expect(result.current.transactions).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.fileName).toBeNull()
    expect(result.current.pasteText).toBe('')
  })

  describe('handlePaste', () => {
    it('should parse valid bank statement paste successfully', () => {
      vi.mocked(parsers.parseBankStatementPaste).mockReturnValue(mockTransactions)

      const { result } = renderHook(() => useTransactionImport('Bank A', 'paste'))

      act(() => {
        result.current.setPasteText('some raw paste text')
      })

      act(() => {
        result.current.handlePaste()
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.transactions).toEqual(mockTransactions)
      expect(parsers.parseBankStatementPaste).toHaveBeenCalledWith('some raw paste text', 'Bank A')
    })

    it('should detect and discard space transfers from bank statement paste', () => {
      const spaceTxs: Transaction[] = [
        {
          id: '1',
          date: '2024-03-01',
          description: 'Umbuchung auf Space Notgroschen',
          amount: -200,
          currency: 'EUR',
          type: 'expense',
          institution: 'Bank A',
        },
        {
          id: '2',
          date: '2024-03-01',
          description: 'Umbuchung von Hauptkonto',
          amount: 200,
          currency: 'EUR',
          type: 'income',
          institution: 'Bank A',
        },
        {
          id: '3',
          date: '2024-03-01',
          description: 'Supermarket',
          amount: -35,
          currency: 'EUR',
          type: 'expense',
          institution: 'Bank A',
        },
      ]
      vi.mocked(parsers.parseBankStatementPaste).mockReturnValue(spaceTxs)

      const { result } = renderHook(() => useTransactionImport('Bank A', 'paste'))

      act(() => {
        result.current.setPasteText('bank statement paste content')
      })

      act(() => {
        result.current.handlePaste()
      })

      expect(result.current.discardedSpaceCount).toBe(2)
      expect(result.current.transactions).toHaveLength(1)
      expect(result.current.transactions[0].id).toBe('3')
    })

    it('should fallback to CSV parsing if bank statement paste fails', () => {
      vi.mocked(parsers.parseBankStatementPaste).mockReturnValue([])
      vi.mocked(parsers.rowsToTransactionsWithMeta).mockReturnValue({
        transactions: mockTransactions,
        discardedSpaceCount: 0,
      })

      const { result } = renderHook(() => useTransactionImport('Bank A', 'paste'))

      act(() => {
        result.current.setPasteText('Date,Amount\n2024-01-01,100')
      })

      act(() => {
        result.current.handlePaste()
      })

      expect(result.current.transactions).toEqual(mockTransactions)
      expect(parsers.rowsToTransactionsWithMeta).toHaveBeenCalled()
    })

    it('should set error if both paste parsing strategies fail', () => {
      vi.mocked(parsers.parseBankStatementPaste).mockReturnValue([])
      vi.mocked(parsers.rowsToTransactionsWithMeta).mockReturnValue({
        transactions: [],
        discardedSpaceCount: 0,
      })

      const { result } = renderHook(() => useTransactionImport('Bank A', 'paste'))

      act(() => {
        result.current.setPasteText('invalid paste text\nanother line\nthird line')
      })

      act(() => {
        result.current.handlePaste()
      })

      expect(result.current.transactions).toEqual([])
      expect(result.current.error).toMatch(/No transactions could be parsed/)
    })
  })

  describe('handleFileChange - Spreadsheet (.xlsx)', () => {
    it('should parse valid Excel file successfully', async () => {
      const file = new File(['dummy content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      vi.mocked(XLSX.read).mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      } as unknown as XLSX.WorkBook)
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([
        ['Date', 'Amount'],
        ['2024-01-01', '100'],
      ])
      vi.mocked(parsers.rowsToTransactionsWithMeta).mockReturnValue({
        transactions: mockTransactions,
        discardedSpaceCount: 0,
      })

      const { result } = renderHook(() => useTransactionImport('Bank A', 'spreadsheet'))

      await act(async () => {
        await result.current.handleFileChange(file)
      })

      expect(result.current.fileName).toBe('test.xlsx')
      expect(result.current.transactions).toEqual(mockTransactions)
      expect(result.current.error).toBeNull()
      expect(parsers.rowsToTransactionsWithMeta).toHaveBeenCalledWith(
        [
          ['Date', 'Amount'],
          ['2024-01-01', '100'],
        ],
        'Bank A',
        undefined,
      )
    })

    it('should handle Excel files with no transactions', async () => {
      const file = new File(['dummy content'], 'empty.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      vi.mocked(XLSX.read).mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} },
      } as unknown as XLSX.WorkBook)
      vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([])
      vi.mocked(parsers.rowsToTransactionsWithMeta).mockReturnValue({
        transactions: [],
        discardedSpaceCount: 0,
      })

      const { result } = renderHook(() => useTransactionImport('Bank A', 'spreadsheet'))

      await act(async () => {
        await result.current.handleFileChange(file)
      })

      expect(result.current.transactions).toEqual([])
      expect(result.current.error).toBe('No transactions found in the file.')
    })
  })

  describe('handleFileChange - CSV', () => {
    it('should parse valid CSV file successfully', async () => {
      const csvContent = 'Date,Amount\n2024-01-01,100'
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
      vi.mocked(parsers.rowsToTransactionsWithMeta).mockReturnValue({
        transactions: mockTransactions,
        discardedSpaceCount: 0,
      })

      const { result } = renderHook(() => useTransactionImport('Bank A', 'spreadsheet'))

      await act(async () => {
        await result.current.handleFileChange(file)
      })

      expect(result.current.fileName).toBe('test.csv')
      expect(result.current.transactions).toEqual(mockTransactions)
      expect(result.current.error).toBeNull()
    })

    it('should track discardedSpaceCount from parser meta', async () => {
      const csvContent = 'Date,Amount\n2024-01-01,100'
      const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
      vi.mocked(parsers.rowsToTransactionsWithMeta).mockReturnValue({
        transactions: mockTransactions,
        discardedSpaceCount: 4,
      })

      const { result } = renderHook(() => useTransactionImport('Bank A', 'spreadsheet'))

      await act(async () => {
        await result.current.handleFileChange(file)
      })

      expect(result.current.transactions).toEqual(mockTransactions)
      expect(result.current.discardedSpaceCount).toBe(4)

      act(() => {
        result.current.handleClearAll()
      })
      expect(result.current.discardedSpaceCount).toBe(0)
    })

    it('should handle ISO-8859-1 encoded CSV files', async () => {
      // Provide a buffer that decodes poorly in UTF-8
      const buffer = new Uint8Array([0xc4, 0xd6, 0xdc]) // ÄÖÜ in ISO-8859-1
      const file = new File([buffer], 'iso.csv', { type: 'text/csv' })
      vi.mocked(parsers.rowsToTransactionsWithMeta).mockReturnValue({
        transactions: mockTransactions,
        discardedSpaceCount: 0,
      })

      const { result } = renderHook(() => useTransactionImport('Bank A', 'spreadsheet'))

      await act(async () => {
        await result.current.handleFileChange(file)
      })

      expect(result.current.error).toBeNull()
      expect(result.current.transactions).toEqual(mockTransactions)
    })

    it('should handle CSV files with no transactions', async () => {
      const file = new File(['HeaderOnly'], 'empty.csv', { type: 'text/csv' })
      vi.mocked(parsers.rowsToTransactionsWithMeta).mockReturnValue({
        transactions: [],
        discardedSpaceCount: 0,
      })

      const { result } = renderHook(() => useTransactionImport('Bank A', 'spreadsheet'))

      await act(async () => {
        await result.current.handleFileChange(file)
      })

      expect(result.current.transactions).toEqual([])
      expect(result.current.error).toBe('No transactions found in the CSV.')
    })
  })

  describe('handleFileChange - PDF', () => {
    it('should parse valid PDF file successfully', async () => {
      const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' })
      vi.mocked(parsers.parsePdfText).mockReturnValue(mockTransactions)

      // We need to mock pdfjs-dist getDocument to resolve a promise
      const mockPdfjs = await import('pdfjs-dist')
      vi.mocked(mockPdfjs.getDocument).mockReturnValue({
        promise: Promise.resolve({
          numPages: 1,
          getPage: vi.fn().mockResolvedValue({
            getTextContent: vi.fn().mockResolvedValue({
              items: [{ str: 'PDF Content' }],
            }),
          }),
        }),
      } as unknown as ReturnType<typeof mockPdfjs.getDocument>)

      const { result } = renderHook(() => useTransactionImport('Bank A', 'pdf'))

      await act(async () => {
        await result.current.handleFileChange(file)
      })

      expect(result.current.fileName).toBe('test.pdf')
      expect(result.current.transactions).toEqual(mockTransactions)
      expect(result.current.error).toBeNull()
      expect(parsers.parsePdfText).toHaveBeenCalledWith('PDF Content\n', 'Bank A')
    })

    it('should detect and discard space transfers from PDF statements', async () => {
      const file = new File(['dummy content'], 'statement.pdf', { type: 'application/pdf' })
      const spaceTxs: Transaction[] = [
        {
          id: 'pdf-1',
          date: '2024-04-10',
          description: 'Investment fund',
          amount: -100,
          currency: 'EUR',
          type: 'expense',
          institution: 'Bank A',
        },
        {
          id: 'pdf-2',
          date: '2024-04-10',
          description: 'Main Account',
          amount: 100,
          currency: 'EUR',
          type: 'income',
          institution: 'Bank A',
        },
        {
          id: 'pdf-3',
          date: '2024-04-10',
          description: 'Bakery',
          amount: -5.5,
          currency: 'EUR',
          type: 'expense',
          institution: 'Bank A',
        },
      ]
      vi.mocked(parsers.parsePdfText).mockReturnValue(spaceTxs)

      const mockPdfjs = await import('pdfjs-dist')
      vi.mocked(mockPdfjs.getDocument).mockReturnValue({
        promise: Promise.resolve({
          numPages: 1,
          getPage: vi.fn().mockResolvedValue({
            getTextContent: vi.fn().mockResolvedValue({
              items: [{ str: 'Statement text' }],
            }),
          }),
        }),
      } as unknown as ReturnType<typeof mockPdfjs.getDocument>)

      const { result } = renderHook(() => useTransactionImport('Bank A', 'pdf'))

      await act(async () => {
        await result.current.handleFileChange(file)
      })

      expect(result.current.discardedSpaceCount).toBe(2)
      expect(result.current.transactions).toHaveLength(1)
      expect(result.current.transactions[0].id).toBe('pdf-3')
    })

    it('should handle PDF files with no transactions', async () => {
      const file = new File(['dummy content'], 'empty.pdf', { type: 'application/pdf' })
      vi.mocked(parsers.parsePdfText).mockReturnValue([])

      const mockPdfjs = await import('pdfjs-dist')
      vi.mocked(mockPdfjs.getDocument).mockReturnValue({
        promise: Promise.resolve({
          numPages: 1,
          getPage: vi.fn().mockResolvedValue({
            getTextContent: vi.fn().mockResolvedValue({
              items: [{ str: 'Empty PDF' }],
            }),
          }),
        }),
      } as unknown as ReturnType<typeof mockPdfjs.getDocument>)

      const { result } = renderHook(() => useTransactionImport('Bank A', 'pdf'))

      await act(async () => {
        await result.current.handleFileChange(file)
      })

      expect(result.current.transactions).toEqual([])
      expect(result.current.error).toMatch(/Could not auto-detect transactions in this PDF/)
    })

    it('should NOT discard merchant refunds or reversals in PDF statements', async () => {
      const file = new File(['dummy content'], 'statement.pdf', { type: 'application/pdf' })
      const refundTxs: Transaction[] = [
        {
          id: 'pdf-buy',
          date: '2024-04-10',
          description: 'Amazon Payments Europe',
          amount: -59.99,
          currency: 'EUR',
          type: 'expense',
          institution: 'Bank A',
        },
        {
          id: 'pdf-refund',
          date: '2024-04-10',
          description: 'Amazon Payments Europe Erstattung',
          amount: 59.99,
          currency: 'EUR',
          type: 'income',
          institution: 'Bank A',
        },
      ]
      vi.mocked(parsers.parsePdfText).mockReturnValue(refundTxs)

      const mockPdfjs = await import('pdfjs-dist')
      vi.mocked(mockPdfjs.getDocument).mockReturnValue({
        promise: Promise.resolve({
          numPages: 1,
          getPage: vi.fn().mockResolvedValue({
            getTextContent: vi.fn().mockResolvedValue({
              items: [{ str: 'Statement text' }],
            }),
          }),
        }),
      } as unknown as ReturnType<typeof mockPdfjs.getDocument>)

      const { result } = renderHook(() => useTransactionImport('Bank A', 'pdf'))

      await act(async () => {
        await result.current.handleFileChange(file)
      })

      expect(result.current.discardedSpaceCount).toBe(0)
      expect(result.current.transactions).toHaveLength(2)
    })
  })

  describe('State Mutators', () => {
    it('should remove transaction by ID', () => {
      const { result } = renderHook(() => useTransactionImport('Bank A', null))

      // First manually set some transactions via a mocked success
      act(() => {
        vi.mocked(parsers.parseBankStatementPaste).mockReturnValue(mockTransactions)
        result.current.setPasteText('test')
        result.current.handlePaste()
      })

      expect(result.current.transactions).toHaveLength(2)

      act(() => {
        result.current.handleRemoveTransaction('1')
      })

      expect(result.current.transactions).toHaveLength(1)
      expect(result.current.transactions[0].id).toBe('2')
    })

    it('should clear all state', () => {
      const { result } = renderHook(() => useTransactionImport('Bank A', null))

      act(() => {
        vi.mocked(parsers.parseBankStatementPaste).mockReturnValue(mockTransactions)
        result.current.setPasteText('test')
        result.current.handlePaste()
        result.current.setFileName('test.csv')
      })

      expect(result.current.transactions).toHaveLength(2)
      expect(result.current.fileName).toBe('test.csv')
      expect(result.current.pasteText).toBe('test')

      act(() => {
        result.current.handleClearAll()
      })

      expect(result.current.transactions).toHaveLength(0)
      expect(result.current.fileName).toBeNull()
      expect(result.current.pasteText).toBe('')
    })
  })
})
