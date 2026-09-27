import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLanguageStore } from '../../../store/useLanguageStore'
import { ShareSnapshotModal, type ShareSnapshotModalProps } from './ShareSnapshotModal'

vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn(),
}))

vi.mock('../../../utils/share-card-canvas', () => ({
  renderShareCardToCanvas: vi.fn(),
  downloadShareCard: vi.fn(),
  copyShareCardImage: vi.fn().mockResolvedValue(true),
  generateShareSummaryText: vi.fn().mockReturnValue('Mock Summary Text'),
}))

describe('ShareSnapshotModal', () => {
  const defaultProps: ShareSnapshotModalProps = {
    isOpen: true,
    onClose: vi.fn(),
    periodLabel: 'September 2026',
    currencySymbol: '€',
    totalIncome: 4500,
    totalExpenses: 2800,
    netSavings: 1700,
    savingsRate: 37.7,
    topCategories: [
      { name: 'Food & Dining', amount: 650, percent: 23, color: '#f59e0b' },
      { name: 'Housing', amount: 1100, percent: 39, color: '#3b82f6' },
    ],
  }

  const mockTranslations = {
    shareSnapshot: 'Share Snapshot',
    shareSnapshotTitle: 'Share Financial Snapshot',
    shareSnapshotDesc: 'Create a private, aesthetic card of your financial snapshot.',
    shareCardTheme: 'Theme Accent',
    shareMaskAmounts: 'Hide exact amounts',
    shareIncludeAmounts: 'Show exact amounts',
    downloadImage: 'Download PNG',
    copyImage: 'Copy Image',
    copyTextSummary: 'Copy Text',
    shareNative: 'Share...',
    imageCopiedSuccess: 'Image copied!',
    textCopiedSuccess: 'Text copied!',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useLanguageStore).mockReturnValue({
      t: mockTranslations,
      currentLocale: 'en',
      setLocale: vi.fn(),
    } as unknown as ReturnType<typeof useLanguageStore>)
  })

  it('renders modal when isOpen is true', () => {
    render(<ShareSnapshotModal {...defaultProps} />)
    expect(screen.getByText('Share Financial Snapshot')).toBeInTheDocument()
    expect(screen.getByText('Download PNG')).toBeInTheDocument()
    expect(screen.getByText('Copy Image')).toBeInTheDocument()
    expect(screen.getByText('Copy Text')).toBeInTheDocument()
  })

  it('toggles privacy masking state', () => {
    render(<ShareSnapshotModal {...defaultProps} />)
    const checkbox = screen.getByRole('checkbox', { name: /Hide exact amounts/i })
    expect(checkbox).toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
    expect(screen.getByText('Show exact amounts')).toBeInTheDocument()
  })

  it('calls download on Download PNG click', async () => {
    const { downloadShareCard } = await import('../../../utils/share-card-canvas')
    render(<ShareSnapshotModal {...defaultProps} />)

    const downloadBtn = screen.getByTestId('share-card-download-btn')
    fireEvent.click(downloadBtn)

    expect(downloadShareCard).toHaveBeenCalled()
  })

  it('calls copy text on Copy Text click', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy,
      },
    })

    render(<ShareSnapshotModal {...defaultProps} />)
    const copyTextBtn = screen.getByTestId('share-card-copy-text-btn')
    await fireEvent.click(copyTextBtn)

    expect(writeTextSpy).toHaveBeenCalledWith('Mock Summary Text')
  })
})
