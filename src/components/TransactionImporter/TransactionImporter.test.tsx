import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TranslationStrings } from '../../i18n/translations'
import { type AppState } from '../../store/useAppStore'
import { type LanguageState, useLanguageStore } from '../../store/useLanguageStore'
import TransactionImporter from './TransactionImporter'

const { mockAddImportedAccount, mockSetStep, mockGetDuplicateTransactionStats, mockReplaceImportedAccount, mockImportedAccounts } = vi.hoisted(() => ({
  mockAddImportedAccount: vi.fn(),
  mockSetStep: vi.fn(),
  mockGetDuplicateTransactionStats: vi.fn().mockReturnValue({ duplicateCount: 0, newCount: 0 }),
  mockReplaceImportedAccount: vi.fn(),
  mockImportedAccounts: { current: [] as unknown[] },
}))

// Mock the stores
vi.mock('../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      selectedInstitution: { id: '1', name: 'Bank A' },
      importedAccounts: mockImportedAccounts.current,
      addImportedAccount: mockAddImportedAccount,
      replaceImportedAccount: mockReplaceImportedAccount,
      setStep: mockSetStep,
      getDuplicateTransactionStats: mockGetDuplicateTransactionStats,
      cancelImport: vi.fn(),
    }
    return typeof selector === 'function' ? selector(state as unknown as AppState) : state
  }),
}))

vi.mock('../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      t: {
        back: 'Back',
        importTransactionsTitle: 'Import Transactions',
        importTransactionsSubtitle: 'Import for {institution}',
        importPsd2Notice: 'Notice',
        spreadsheetFile: 'Excel / CSV',
        spreadsheetFileDesc: 'Excel / CSV desc',
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
        errorParsePaste: 'No transactions could be parsed.',
        errorParsePasteOneRow: 'Only 1 row detected.',
        clearAllTransactionsTitle: 'Clear All',
        clearAllTransactionsMessage: 'Are you sure?',
        clearAll: 'Delete',
        cancel: 'Cancel',
        reviewTransactions: 'Review',
        duplicateImportTitle: 'Duplicate Import Detected',
        duplicateImportMessageAll: 'All {duplicateCount} transactions have already been imported. There are no new transactions to add.',
        duplicateImportMessagePartial: 'We found {duplicateCount} duplicate transactions which will be skipped. Only {newCount} new transactions will be imported. Do you want to proceed?',
        duplicateImportProceed: 'Proceed with {newCount} transactions',
        duplicateImportCancel: 'Cancel',
        duplicateImportOk: 'OK',
        spaceTransfersExcluded: '{count} internal space transfers were automatically excluded to prevent double counting.',
        spaceTransfersExcludedSingular: '1 internal space transfer was automatically excluded to prevent double counting.',
        internalTransfersDetectedSingular: '1 internal transfer with your other accounts detected (excluded from income/expenses and hidden from standard views).',
        internalTransfersDetected: '{count} internal transfers with your other accounts detected (excluded from income/expenses and hidden from standard views).',
        internalTransfersDetectedBannerSingular: '1 internal transfer between your accounts detected (marked with an internal transfer badge).',
        internalTransfersDetectedBanner: '{count} internal transfers between your accounts detected (marked with an internal transfer badge).',
        inflows: 'Inflows',
        outflows: 'Outflows',
        acceptedFormats: 'Accepted formats: {accepted}',
      } as unknown as TranslationStrings,
    }
    return typeof selector === 'function' ? selector(state as LanguageState) : state
  }),
}))

// Mock XLSX
vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
  },
}))

// Mock pdfjs
vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: { workerSrc: '' },
}))

describe('TransactionImporter', () => {
  const mockT = {
    back: 'Back',
    importTransactionsTitle: 'Import Transactions',
    importTransactionsSubtitle: 'Import for {institution}',
    importPsd2Notice: 'Notice',
    spreadsheetFile: 'Excel / CSV',
    spreadsheetFileDesc: 'Excel / CSV desc',
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
    errorParsePaste: 'No transactions could be parsed.',
    errorParsePasteOneRow: 'Only 1 row detected.',
    clearAllTransactionsTitle: 'Clear All',
    clearAllTransactionsMessage: 'Are you sure?',
    clearAll: 'Delete',
    cancel: 'Cancel',
    reviewTransactions: 'Review',
    duplicateImportTitle: 'Duplicate Import Detected',
    duplicateImportMessageAll: 'All {duplicateCount} transactions have already been imported. There are no new transactions to add.',
    duplicateImportMessagePartial: 'We found {duplicateCount} duplicate transactions which will be skipped. Only {newCount} new transactions will be imported. Do you want to proceed?',
    duplicateImportProceed: 'Proceed with {newCount} transactions',
    duplicateImportCancel: 'Cancel',
    duplicateImportOk: 'OK',
    spaceTransfersExcluded: '{count} internal space transfers were automatically excluded to prevent double counting.',
    spaceTransfersExcludedSingular: '1 internal space transfer was automatically excluded to prevent double counting.',
    internalTransfersDetectedSingular: '1 internal transfer with your other accounts detected (excluded from income/expenses and hidden from standard views).',
    internalTransfersDetected: '{count} internal transfers with your other accounts detected (excluded from income/expenses and hidden from standard views).',
    internalTransfersDetectedBannerSingular: '1 internal transfer between your accounts detected (marked with an internal transfer badge).',
    internalTransfersDetectedBanner: '{count} internal transfers between your accounts detected (marked with an internal transfer badge).',
    inflows: 'Inflows',
    outflows: 'Outflows',
    acceptedFormats: 'Accepted formats: {accepted}',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockImportedAccounts.current = []
    vi.mocked(useLanguageStore).mockImplementation((selector) =>
      selector({
        t: mockT as unknown as TranslationStrings,
      } as unknown as LanguageState),
    )
  })

  it('renders initial methods correctly', () => {
    render(<TransactionImporter />)

    expect(screen.getByText('Excel / CSV')).toBeInTheDocument()
    expect(screen.getByText('PDF')).toBeInTheDocument()
    expect(screen.getByText('Paste')).toBeInTheDocument()
  })

  it('navigates back to institution selection', () => {
    render(<TransactionImporter />)

    fireEvent.click(screen.getByText('Back'))
    expect(mockSetStep).toHaveBeenCalledWith('institution')
  })

  it('shows paste area when copy-paste method is selected', () => {
    render(<TransactionImporter />)

    fireEvent.click(screen.getByText('Paste'))
    expect(screen.getByPlaceholderText('Paste here')).toBeInTheDocument()
  })

  it('parses pasted data correctly', async () => {
    render(<TransactionImporter />)

    fireEvent.click(screen.getByText('Paste'))
    const textarea = screen.getByPlaceholderText('Paste here')

    // Header + one row
    const csvData = 'Date,Description,Amount\n2024-01-01,Lunch,-15.50'
    fireEvent.change(textarea, { target: { value: csvData } })

    fireEvent.click(screen.getByText('Parse'))

    // Transaction details are now shown in a modal; the main view shows the count summary
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText(/transactions found/)).toBeInTheDocument()
    })
  })

  it('calls addImportedAccount on confirm', async () => {
    render(<TransactionImporter />)

    // Select paste and parse some data
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: 'Date,Description,Amount\n2024-01-01,Test,100' },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => screen.getByText('Confirm'))
    fireEvent.click(screen.getByText('Confirm'))

    expect(mockAddImportedAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        institutionName: 'Bank A',
        transactions: expect.arrayContaining([
          expect.objectContaining({ description: 'Test', amount: 100 }),
        ]),
      }),
    )
  })

  it('shows error if no transactions found in pasted data', async () => {
    render(<TransactionImporter />)

    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: 'Invalid Data' },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByText(/Only 1 row detected/)).toBeInTheDocument()
    })
  })

  it('allows clearing transactions and going back to method selection', async () => {
    render(<TransactionImporter />)

    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: 'Date,Description,Amount\n2024-01-01,Test,100' },
    })
    fireEvent.click(screen.getByText('Parse'))

    // Click Clear — this now opens a DeleteConfirmationModal
    await waitFor(() => screen.getByText('Clear'))
    fireEvent.click(screen.getByText('Clear'))

    // Confirm in the deletion modal (button text matches confirmText='Delete')
    await waitFor(() => screen.getByText('Delete'))
    fireEvent.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Paste here')).toHaveValue('')
    })
  })

  it('displays space transfers excluded banner when space transactions are detected in import', async () => {
    const n26Csv =
      '"Datum","Empfänger","Kontonummer","Transaktionstyp","Verwendungszweck","Betrag (EUR)","Betrag (Fremdwährung)","Fremdwährung","Wechselkurs","Kontoname"\n' +
      '"2024-01-01","Investment fund","","Ausgehende Überweisung","","-50.00","","","","Main Account"\n' +
      '"2024-01-01","Main Account","","Eingehende Überweisung","","50.00","","","","Investment fund"\n' +
      '"2024-01-02","Supermarket","","MasterCard-Zahlung","Groceries","-25.00","","","","Main Account"'

    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: n26Csv },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByTestId('space-transfers-banner')).toBeInTheDocument()
      expect(screen.getByText(/internal space transfers were automatically excluded/i)).toBeInTheDocument()
    })
  })

  it('displays internal transfers banner when cross-account transfers with existing accounts are detected', async () => {
    mockImportedAccounts.current = [
      {
        institutionId: '2',
        institutionName: 'Bank B',
        importedAt: '2024-01-01T00:00:00.000Z',
        importedFingerprints: [],
        transactions: [
          {
            id: 'tx-bank-b',
            date: '2024-01-01',
            description: 'Transfer to Bank A DE12345678901234567890',
            amount: -100,
            type: 'expense',
            institution: 'Bank B',
          },
        ],
      },
    ]

    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: 'Date,Description,Amount\n2024-01-01,Transfer from Bank B DE12345678901234567890,100' },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByTestId('internal-transfers-banner')).toBeInTheDocument()
      expect(screen.getByText(/internal transfer with your other accounts detected/i)).toBeInTheDocument()
    })
  })

  it('displays inflows and outflows badges in the preview header', async () => {
    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: {
        value: 'Date,Description,Amount\n2024-01-01,Salary,3000\n2024-01-02,Groceries,-150',
      },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      const inflowBadge = screen.getByTestId('import-inflow-badge')
      const outflowBadge = screen.getByTestId('import-outflow-badge')

      expect(inflowBadge).toBeInTheDocument()
      expect(inflowBadge).toHaveTextContent(/3,000/)
      expect(inflowBadge).toHaveAttribute('title', expect.stringContaining('Inflows'))

      expect(outflowBadge).toBeInTheDocument()
      expect(outflowBadge).toHaveTextContent(/150/)
      expect(outflowBadge).toHaveAttribute('title', expect.stringContaining('Outflows'))
    })
  })

  it('handles PDF statement import with BOTH space transfers excluded and cross-account transfers detected', async () => {
    mockImportedAccounts.current = [
      {
        institutionId: '2',
        institutionName: 'Bank B',
        importedAt: '2026-03-01T00:00:00.000Z',
        importedFingerprints: [],
        transactions: [
          {
            id: 'tx-bank-b',
            date: '2026-03-01',
            description: 'Transfer to Bank A DE12345678901234567890',
            amount: -100,
            type: 'expense',
            institution: 'Bank B',
          },
        ],
      },
    ]

    const mockPdfjs = await import('pdfjs-dist')
    vi.mocked(mockPdfjs.getDocument).mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getTextContent: vi.fn().mockResolvedValue({
            items: [
              {
                str: '01.03.2026 01.03.2026 Umbuchung auf Space Notgroschen -500,00 EUR\n01.03.2026 01.03.2026 Umbuchung von Hauptkonto 500,00 EUR\n01.03.2026 01.03.2026 Transfer from Bank B DE12345678901234567890 100,00 EUR\n',
              },
            ],
          }),
        }),
      }),
    } as unknown as ReturnType<typeof mockPdfjs.getDocument>)

    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('PDF'))

    const fileInput = document.getElementById('file-input') as HTMLInputElement
    const file = new File(['dummy pdf content'], 'statement.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByTestId('space-transfers-banner')).toBeInTheDocument()
      expect(screen.getByText(/internal space transfers were automatically excluded/i)).toBeInTheDocument()
      expect(screen.getByTestId('internal-transfers-banner')).toBeInTheDocument()
      expect(screen.getByText(/internal transfer with your other accounts detected/i)).toBeInTheDocument()
    })
  })

  it('handles bank portal multi-line copy-paste with BOTH space transfers excluded and cross-account transfers detected', async () => {
    mockImportedAccounts.current = [
      {
        institutionId: '2',
        institutionName: 'Bank B',
        importedAt: '2026-03-01T00:00:00.000Z',
        importedFingerprints: [],
        transactions: [
          {
            id: 'tx-bank-b',
            date: '2026-03-01',
            description: 'Transfer to Bank A DE12345678901234567890',
            amount: -100,
            type: 'expense',
            institution: 'Bank B',
          },
        ],
      },
    ]

    const bankPortalPaste = `01.03.2026
Sparkasse
Umbuchung auf Space Notgroschen
-500,00 EUR
01.03.2026
Sparkasse
Umbuchung von Hauptkonto
500,00 EUR
01.03.2026
Bank B
Transfer from Bank B DE12345678901234567890
100,00 EUR`

    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: bankPortalPaste },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByTestId('space-transfers-banner')).toBeInTheDocument()
      expect(screen.getByText(/internal space transfers were automatically excluded/i)).toBeInTheDocument()
      expect(screen.getByTestId('internal-transfers-banner')).toBeInTheDocument()
      expect(screen.getByText(/internal transfer with your other accounts detected/i)).toBeInTheDocument()
    })
  })

  it('shows both space transfer and internal transfer banners inside TransactionPreviewModal when reviewing import', async () => {
    mockImportedAccounts.current = [
      {
        institutionId: '2',
        institutionName: 'Bank B',
        importedAt: '2026-03-01T00:00:00.000Z',
        importedFingerprints: [],
        transactions: [
          {
            id: 'tx-bank-b',
            date: '2026-03-01',
            description: 'Transfer to Bank A DE12345678901234567890',
            amount: -100,
            type: 'expense',
            institution: 'Bank B',
          },
        ],
      },
    ]

    const tsvData = `Date\tDescription\tAmount
2026-03-01\tUmbuchung auf Space Notgroschen\t-500
2026-03-01\tUmbuchung von Hauptkonto\t500
2026-03-01\tTransfer from Bank B DE12345678901234567890\t100`

    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: tsvData },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByTestId('space-transfers-banner')).toBeInTheDocument()
      expect(screen.getByTestId('internal-transfers-banner')).toBeInTheDocument()
      expect(screen.getByTestId('import-inflow-badge')).toHaveTextContent(/0\.00/)
      expect(screen.getByTestId('import-outflow-badge')).toHaveTextContent(/0\.00/)
    })

    // Open review modal
    fireEvent.click(screen.getByText('Review'))

    expect(screen.getByTestId('preview-space-transfers-banner')).toBeInTheDocument()
    expect(screen.getByTestId('preview-internal-transfers-banner')).toBeInTheDocument()
  })
})
