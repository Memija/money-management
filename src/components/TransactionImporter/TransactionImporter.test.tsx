import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TranslationStrings } from '../../i18n/translations'
import { type AppState } from '../../store/useAppStore'
import { type LanguageState, useLanguageStore } from '../../store/useLanguageStore'
import type { ImportedAccount } from '../../types'
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
      addDuplicateOverrideRule: vi.fn(),
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
        duplicateImportAllBannerSingular: '1 duplicate transaction detected. This transaction has already been imported.',
        duplicateImportAllBanner: 'All {count} transactions in this file have already been imported (duplicates).',
        duplicateImportPartialBanner: '{duplicateCount} duplicate transactions detected and will be skipped. {newCount} new transactions will be imported.',
        allTransactionsAlreadyImported: 'All transactions already imported',
        importNewTransactions: 'Import {count} new transactions',
        filterDuplicates: 'Duplicates',
        duplicatesSkippedNotice: 'These transactions already exist in your records and will be skipped to prevent double counting.',
        viewDuplicates: 'View duplicates',
        spaceTransfersExcluded: '{count} internal space transfers were automatically excluded to prevent double counting.',
        spaceTransfersExcludedSingular: '1 internal space transfer was automatically excluded to prevent double counting.',
        internalTransfersDetectedSingular: '1 internal transfer with your other accounts detected (excluded from income/expenses and hidden from standard views).',
        internalTransfersDetected: '{count} internal transfers with your other accounts detected (excluded from income/expenses and hidden from standard views).',
        internalTransfersDetectedBannerSingular: '1 internal transfer between your accounts detected (marked with an internal transfer badge).',
        internalTransfersDetectedBanner: '{count} internal transfers between your accounts detected (marked with an internal transfer badge).',
        filterAll: 'All',
        filterIncluded: 'To Import',
        filterSpaceTransfers: 'Space Transfers',
        filterInternalTransfers: 'Internal Transfers',
        viewExcludedSpaceTransfers: 'View excluded',
        viewInternalTransfers: 'View transfers',
        viewTheseTransactions: 'View these transactions',
        internalTransfersNotice: 'These transactions are internal transfers between your own accounts.',
        inflows: 'Inflows',
        outflows: 'Outflows',
        acceptedFormats: 'Accepted formats: {accepted}',
        transferWarningModalTitle: 'Internal Transfers Detected',
        transferWarningModalSpaceMessage: '{count} transfers between your sub-accounts or spaces were detected.',
        transferWarningModalSpaceMessageSingular: '1 transfer between your sub-accounts or spaces was detected.',
        transferWarningModalInternalMessage: '{count} transfers between your accounts were detected.',
        transferWarningModalInternalMessageSingular: '1 transfer between your accounts was detected.',
        transferWarningModalBothMessage: '{count} transfers involving sub-accounts or your other accounts were detected.',
        transferWarningModalReview: 'Review Details',
        transferWarningModalProceed: 'Proceed with Import',
        transferWarningModalNotice: 'These transactions are reconciled internally and will not affect your net totals.',
        done: 'Done',
        unlockDuplicate: 'Unlock duplicate',
        unlockDuplicateTitle: 'Unlock Duplicate Transaction',
        unlockDuplicateMessage: 'Unlock warning message',
        unlockDuplicateConfirm: 'Unlock & Edit',
        relockDuplicate: 'Relock duplicate',
        unlockedDuplicateBadge: 'Unlocked',
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

// Mock react-virtuoso for jsdom
vi.mock('react-virtuoso', () => ({
  Virtuoso: ({
    data,
    itemContent,
  }: {
    data: unknown[]
    itemContent: (index: number, item: unknown) => React.ReactNode
  }) => (
    <div data-testid="mock-virtuoso">
      {data?.map((item: unknown, index: number) => {
        const tx = item as { id?: string }
        return (
          <div key={tx.id ?? index} data-testid={`virtuoso-item-${index}`}>
            {itemContent(index, item)}
          </div>
        )
      })}
    </div>
  ),
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
    removeTransaction: 'Remove transaction',
    reviewTransactions: 'Review',
    duplicateImportTitle: 'Duplicate Import Detected',
    duplicateImportMessageAll: 'All {duplicateCount} transactions have already been imported. There are no new transactions to add.',
    duplicateImportMessagePartial: 'We found {duplicateCount} duplicate transactions which will be skipped. Only {newCount} new transactions will be imported. Do you want to proceed?',
    duplicateImportProceed: 'Proceed with {newCount} transactions',
    duplicateImportCancel: 'Cancel',
    duplicateImportOk: 'OK',
    duplicateImportAllBannerSingular: '1 duplicate transaction detected. This transaction has already been imported.',
    duplicateImportAllBanner: 'All {count} transactions in this file have already been imported (duplicates).',
    duplicateTransactionsDetectedSingular: '1 duplicate transaction detected (highlighted in yellow).',
    duplicateTransactionsDetected: '{count} duplicate transactions detected (highlighted in yellow).',
    duplicateImportPartialBanner: '{duplicateCount} duplicate transactions detected and will be skipped. {newCount} new transactions will be imported.',
    allTransactionsAlreadyImported: 'All transactions already imported',
    importNewTransactions: 'Import {count} new transactions',
    filterDuplicates: 'Duplicates',
    duplicatesSkippedNotice: 'These transactions already exist in your records and will be skipped to prevent double counting.',
    viewDuplicates: 'View duplicates',
    spaceTransfersExcluded: '{count} internal space transfers were automatically excluded to prevent double counting.',
    spaceTransfersExcludedSingular: '1 internal space transfer was automatically excluded to prevent double counting.',
    viewExcludedSpaceTransfers: 'View excluded',
    internalTransfersDetectedSingular: '{count} internal transfer with your other accounts detected (excluded from income/expenses and hidden from standard views).',
    internalTransfersDetected: '{count} internal transfers with your other accounts detected (excluded from income/expenses and hidden from standard views).',
    internalTransfersDetectedBannerSingular: '1 internal transfer between your accounts detected (marked with an internal transfer badge).',
    internalTransfersDetectedBanner: '{count} internal transfers between your accounts detected (marked with an internal transfer badge).',
    inflows: 'Inflows',
    outflows: 'Outflows',
    acceptedFormats: 'Accepted formats: {accepted}',
    transferWarningModalTitle: 'Internal Transfers Detected',
    transferWarningModalSpaceMessage: '{count} transfers between your sub-accounts or spaces were detected.',
    transferWarningModalSpaceMessageSingular: '1 transfer between your sub-accounts or spaces was detected.',
    transferWarningModalInternalMessage: '{count} transfers between your accounts were detected.',
    transferWarningModalInternalMessageSingular: '1 transfer between your accounts was detected.',
    transferWarningModalBothMessage: '{count} transfers involving sub-accounts or your other accounts were detected.',
    transferWarningModalReview: 'Review Details',
    transferWarningModalProceed: 'Proceed with Import',
    transferWarningModalNotice: 'These transactions are reconciled internally and will not affect your net totals.',
    done: 'Done',
    unlockDuplicate: 'Unlock',
    unlockDuplicateTitle: 'Unlock Duplicate Transaction',
    unlockDuplicateMessage: 'Unlock warning message',
    unlockDuplicateConfirm: 'Unlock & Edit',
    relockDuplicate: 'Lock',
    unlockedDuplicateBadge: 'Unlocked',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockImportedAccounts.current = []
    mockGetDuplicateTransactionStats.mockReturnValue({ duplicateCount: 0, newCount: 0, duplicateIds: [] })
    vi.mocked(useLanguageStore).mockImplementation((selector) => {
      const state = {
        t: mockT as unknown as TranslationStrings,
        locale: 'en',
      } as unknown as LanguageState
      return typeof selector === 'function' ? selector(state) : state
    })
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

    expect(screen.queryByTestId('preview-space-transfers-banner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('preview-internal-transfers-banner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('filter-tab-space-transfers')).not.toBeInTheDocument()
    expect(screen.queryByTestId('filter-tab-internal-transfers')).not.toBeInTheDocument()
  })

  it('allows clicking view excluded button on space transfers banner to open review modal filtered to space transfers', async () => {
    const tsvData = `Date\tDescription\tAmount
2026-03-01\tUmbuchung auf Space Notgroschen\t-500
2026-03-01\tUmbuchung von Hauptkonto\t500
2026-03-01\tSupermarkt Einkauf\t-50`

    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: tsvData },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByTestId('space-transfers-banner')).toBeInTheDocument()
    })

    const viewExcludedBtn = screen.getByTestId('view-space-transfers-button')
    expect(viewExcludedBtn).toBeInTheDocument()
    fireEvent.click(viewExcludedBtn)

    // Modal opens without top warning banner and without type tabs, pre-filtered to space-transfers
    expect(screen.queryByTestId('preview-space-transfers-banner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('filter-tab-space-transfers')).not.toBeInTheDocument()
    expect(screen.getByTestId('space-transfers-notice')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /include/i }).length).toBeGreaterThan(0)
  })

  it('allows clicking view transfers button on internal transfers banner to open review modal filtered to internal transfers', async () => {
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
2026-03-01\tTransfer from Bank B DE12345678901234567890\t100
2026-03-01\tSupermarkt Einkauf\t-50`

    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: tsvData },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByTestId('internal-transfers-banner')).toBeInTheDocument()
    })

    const viewTransfersBtn = screen.getByTestId('view-internal-transfers-button')
    expect(viewTransfersBtn).toBeInTheDocument()
    fireEvent.click(viewTransfersBtn)

    // Modal opens filtered to internal transfers without warning banner and without tabs
    expect(screen.queryByTestId('preview-internal-transfers-banner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('filter-tab-internal-transfers')).not.toBeInTheDocument()
    expect(screen.getByTestId('internal-transfers-notice')).toBeInTheDocument()
    expect(screen.getByText('Transfer from Bank B DE12345678901234567890')).toBeInTheDocument()
    expect(screen.queryByText('Supermarkt Einkauf')).not.toBeInTheDocument()
  })

  it('shows duplicate-all-banner and disables import button when all transactions are duplicates', async () => {
    mockGetDuplicateTransactionStats.mockImplementation((_instId: string, txs: unknown[]) => {
      if (!txs || txs.length === 0) return { duplicateCount: 0, newCount: 0, duplicateIds: [] }
      return {
        duplicateCount: txs.length,
        newCount: 0,
        duplicateIds: (txs as { id: string }[]).map((t) => t.id),
      }
    })

    const tsvData = `Date\tDescription\tAmount
2026-03-01\tGroceries\t-50
2026-03-02\tSalary\t2000`

    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: tsvData },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByTestId('duplicate-all-banner')).toBeInTheDocument()
    })

    expect(screen.getByText('All 2 transactions in this file have already been imported (duplicates).')).toBeInTheDocument()
    expect(screen.getByTestId('view-duplicates-button')).toBeInTheDocument()
    expect(screen.queryByTestId('space-transfers-banner')).not.toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: /All transactions already imported/i })
    expect(confirmBtn).toBeDisabled()

    // Clicking view duplicates opens preview modal with duplicates view active
    fireEvent.click(screen.getByTestId('view-duplicates-button'))
    expect(screen.queryByTestId('filter-tab-duplicates')).not.toBeInTheDocument()
    expect(screen.queryByTestId('duplicates-notice')).not.toBeInTheDocument()
  })

  it('does not mark duplicates as internal transfers or space transfers', async () => {
    // Both transactions are duplicates
    mockGetDuplicateTransactionStats.mockImplementation((_instId: string, txs: unknown[]) => {
      if (!txs || txs.length === 0) return { duplicateCount: 0, newCount: 0, duplicateIds: [] }
      return {
        duplicateCount: txs.length,
        newCount: 0,
        duplicateIds: (txs as { id: string }[]).map((t) => t.id),
      }
    })

    // Setup an existing account with matching transfer text
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
2026-03-01\tTransfer from Bank B DE12345678901234567890\t100`

    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: tsvData },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByTestId('duplicate-all-banner')).toBeInTheDocument()
    })

    // Because it is a duplicate, it should NOT be checked or marked as an internal transfer!
    expect(screen.queryByTestId('internal-transfers-banner')).not.toBeInTheDocument()

    // Open duplicates preview
    fireEvent.click(screen.getByTestId('view-duplicates-button'))
    expect(screen.queryByTestId('duplicates-notice')).not.toBeInTheDocument()

    // Row preview is read-only in this view:
    // Has static description text (not editable input)
    expect(screen.getByText('Transfer from Bank B DE12345678901234567890')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Transfer from Bank B DE12345678901234567890')).not.toBeInTheDocument()
    // No internal transfer badge
    expect(screen.queryByText('Internal Transfer')).not.toBeInTheDocument()
    // No include button
    expect(screen.queryByRole('button', { name: /include/i })).not.toBeInTheDocument()
    // No remove trash button
    expect(screen.queryByRole('button', { name: 'Remove transaction' })).not.toBeInTheDocument()
  })

  it('shows duplicate-partial-banner and imports only non-duplicate transactions', async () => {
    mockGetDuplicateTransactionStats.mockImplementation((_instId: string, txs: { id: string }[]) => {
      if (!txs || txs.length === 0) return { duplicateCount: 0, newCount: 0, duplicateIds: [] }
      return {
        duplicateCount: 1,
        newCount: txs.length - 1,
        duplicateIds: [txs[0].id],
      }
    })

    const tsvData = `Date\tDescription\tAmount
2026-03-01\tGroceries\t-50
2026-03-02\tSalary\t2000`

    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: tsvData },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByTestId('duplicate-partial-banner')).toBeInTheDocument()
    })

    expect(screen.getByText(/1 duplicate transactions detected and will be skipped/i)).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: /Import 1 new transactions/i })
    expect(confirmBtn).toBeEnabled()

    fireEvent.click(confirmBtn)

    // Modal opens for partial duplicates confirmation
    expect(screen.getByText(/We found 1 duplicate transactions/i)).toBeInTheDocument()
    const proceedBtn = screen.getByText('Proceed with 1 transactions')
    fireEvent.click(proceedBtn)

    expect(mockAddImportedAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        transactions: expect.arrayContaining([
          expect.objectContaining({ description: 'Salary', amount: 2000 }),
        ]),
      }),
    )
    const passedAccount = mockAddImportedAccount.mock.calls[0][0]
    expect(passedAccount.transactions).toHaveLength(1)
    expect(passedAccount.transactions[0].description).toBe('Salary')
  })

  it('shows transfer warning modal when space transfers exist upon clicking confirm, and opens preview on Review Details', async () => {
    const tsvData = `Date\tDescription\tAmount
2026-04-01\tInvestment fund\t-150
2026-04-01\tMain Account\t150
2026-04-02\tSalary\t2000`

    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: tsvData },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByTestId('space-transfers-banner')).toBeInTheDocument()
      expect(screen.getByText(/2 internal space transfers were automatically excluded/i)).toBeInTheDocument()
    })

    // Click "View excluded" on the banner
    const viewBtn = screen.getByTestId('view-space-transfers-button')
    fireEvent.click(viewBtn)

    // Preview modal should open and display the space transfers notice
    await waitFor(() => {
      expect(screen.getByTestId('space-transfers-notice')).toBeInTheDocument()
    })
    expect(mockAddImportedAccount).not.toHaveBeenCalled()
  })

  it('proceeds directly with import when confirming with excluded space transfers', async () => {
    const tsvData = `Date\tDescription\tAmount
2026-04-01\tInvestment fund\t-150
2026-04-01\tMain Account\t150
2026-04-02\tSalary\t2000`

    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: tsvData },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByTestId('space-transfers-banner')).toBeInTheDocument()
    })

    const confirmBtn = screen.getByRole('button', { name: /Confirm/i })
    fireEvent.click(confirmBtn)

    // No modal should interrupt - directly imports!
    expect(screen.queryByText('Internal Transfers Detected')).not.toBeInTheDocument()
    expect(mockAddImportedAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        transactions: expect.arrayContaining([
          expect.objectContaining({ description: 'Salary', amount: 2000 }),
        ]),
      }),
    )
    const passedAccount = mockAddImportedAccount.mock.calls[0][0]
    expect(passedAccount.transactions).toHaveLength(1)
    expect(passedAccount.transactions[0].description).toBe('Salary')
  })

  it('proceeds directly with import after resolving duplicate warning even if space transfers exist', async () => {
    mockGetDuplicateTransactionStats.mockImplementation((_instId: string, txs: { id: string }[]) => {
      if (!txs || txs.length === 0) return { duplicateCount: 0, newCount: 0, duplicateIds: [] }
      return {
        duplicateCount: 1,
        newCount: txs.length - 1,
        duplicateIds: [txs[0].id],
      }
    })

    const tsvData = `Date\tDescription\tAmount
2026-04-01\tInvestment fund\t-150
2026-04-01\tMain Account\t150
2026-04-02\tSalary\t2000
2026-04-03\tCoffee\t-5`

    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: tsvData },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByTestId('space-transfers-banner')).toBeInTheDocument()
      expect(screen.getByTestId('duplicate-partial-banner')).toBeInTheDocument()
    })

    const confirmBtn = screen.getByRole('button', { name: /Import 1 new transactions/i })
    fireEvent.click(confirmBtn)

    // Duplicate warning modal opens first
    expect(screen.getByText(/We found 1 duplicate transactions/i)).toBeInTheDocument()

    // Proceed through duplicate modal
    const proceedDuplicateBtn = screen.getByText('Proceed with 1 transactions')
    fireEvent.click(proceedDuplicateBtn)

    // Directly imports without any transfer warning modal!
    expect(screen.queryByText('Internal Transfers Detected')).not.toBeInTheDocument()
    expect(mockAddImportedAccount).toHaveBeenCalled()
  })

  it('does not display internal transfer banner when importing initial account even if store updates during transition', async () => {
    mockImportedAccounts.current = []

    mockAddImportedAccount.mockImplementation((acc: ImportedAccount) => {
      // Simulates Zustand store updating importedAccounts with the newly added account
      mockImportedAccounts.current = [acc]
    })

    // Transactions with matching reciprocal amounts that could trigger self-reconciliation
    const tsvData = `Date\tDescription\tAmount
2026-04-01\tANEL O. BILJANA MEMIC KREDITRATE\t-1000
2026-04-02\tANEL O. BILJANA MEMIC KREDITRATE\t1000
2026-04-03\tGroceries\t-50`

    const { rerender } = render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: tsvData },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText(/transactions found/i)).toBeInTheDocument()
    })

    // Before clicking import, no internal transfer banner is shown
    expect(screen.queryByTestId('internal-transfers-banner')).not.toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: /Confirm/i })
    fireEvent.click(confirmBtn)

    expect(mockAddImportedAccount).toHaveBeenCalled()

    // Trigger re-render to simulate AnimatePresence exit animation re-rendering with updated store
    rerender(<TransactionImporter />)

    // Verify NO internal transfer banner flashes or renders!
    expect(screen.queryByTestId('internal-transfers-banner')).not.toBeInTheDocument()
    expect(screen.queryByText(/internal transfer/i)).not.toBeInTheDocument()
  })

  it('allows unlocking duplicate transactions, updating stats and enabling import with forceImport', async () => {
    mockGetDuplicateTransactionStats.mockImplementation((_instId: string, txs: { id: string }[]) => {
      if (!txs || txs.length === 0) return { duplicateCount: 0, newCount: 0, duplicateIds: [] }
      return {
        duplicateCount: txs.length,
        newCount: 0,
        duplicateIds: txs.map((tx) => tx.id),
      }
    })

    const tsvData = `Date\tDescription\tAmount
2026-04-01\tCoffee Shop\t-4.5
2026-04-02\tLunch\t-12`

    render(<TransactionImporter />)
    fireEvent.click(screen.getByText('Paste'))
    fireEvent.change(screen.getByPlaceholderText('Paste here'), {
      target: { value: tsvData },
    })
    fireEvent.click(screen.getByText('Parse'))

    await waitFor(() => {
      expect(screen.getByTestId('duplicate-all-banner')).toBeInTheDocument()
    })

    // Initially import button is disabled because all items are duplicates
    const importBtn = screen.getByRole('button', { name: /all transactions already imported/i })
    expect(importBtn).toBeDisabled()

    // Click "View duplicates" to open preview modal
    const viewDuplicatesBtn = screen.getByTestId('view-duplicates-button')
    fireEvent.click(viewDuplicatesBtn)

    // Ensure preview modal is open and shows duplicate rows
    await waitFor(() => {
      expect(screen.getByText('Duplicates')).toBeInTheDocument()
    })

    // Find unlock button for the first transaction
    const unlockBtns = screen.getAllByTitle('Unlock')
    expect(unlockBtns.length).toBeGreaterThan(0)
    fireEvent.click(unlockBtns[0])

    // Warning modal should open
    expect(screen.getByText('Unlock Duplicate Transaction')).toBeInTheDocument()

    // Confirm unlock
    const confirmUnlockBtn = screen.getByTestId('confirm-unlock-duplicate-btn')
    fireEvent.click(confirmUnlockBtn)

    // The transaction should now have the relock button (with unlock padlock icon, without redundant text label)
    await waitFor(() => {
      expect(screen.getAllByTitle('Lock').length).toBeGreaterThan(0)
    })

    // Close the preview modal by clicking Done
    const doneBtn = screen.getByRole('button', { name: /Done/i })
    fireEvent.click(doneBtn)

    // Now back on the main view: duplicate count decreased to 1, newCount increased to 1
    // Duplicate banner changes from all duplicates to partial duplicates
    await waitFor(() => {
      expect(screen.getByTestId('duplicate-partial-banner')).toBeInTheDocument()
    })

    // Import button should now be enabled for 1 new transaction!
    const activeImportBtn = screen.getByRole('button', { name: /Import 1 new transactions/i })
    expect(activeImportBtn).not.toBeDisabled()

    // Click import
    fireEvent.click(activeImportBtn)

    // Warning modal for remaining duplicates appears
    expect(screen.getByText(/We found 1 duplicate transactions/i)).toBeInTheDocument()

    // Proceed through duplicate warning
    const proceedBtn = screen.getByText('Proceed with 1 transactions')
    fireEvent.click(proceedBtn)

    // Verify addImportedAccount was called with forceImport: true on the unlocked transaction
    expect(mockAddImportedAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        transactions: expect.arrayContaining([
          expect.objectContaining({
            description: 'Coffee Shop',
            forceImport: true,
          }),
        ]),
      }),
    )
  })
})


