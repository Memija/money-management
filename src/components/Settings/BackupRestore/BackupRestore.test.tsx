import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { translations } from '../../../i18n/translations'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import type { ImportedAccount } from '../../../types'
import { formatBackupError, parseAndValidateBackup } from '../../../utils/backup/backup-utils'
import { BackupRestore } from './BackupRestore'

describe('BackupRestore', () => {
  const mockAccount: ImportedAccount = {
    institutionId: 'de_sparkasse',
    institutionName: 'Berliner Sparkasse',
    transactions: [
      {
        id: 'tx-1',
        amount: -50,
        date: '2026-03-01',
        description: 'Supermarket',
        currency: 'EUR',
        type: 'expense',
        category: 'Groceries',
        institution: 'Berliner Sparkasse',
      },
    ],
    duplicateTransactions: [
      {
        id: 'tx-dup-1',
        amount: -50,
        date: '2026-03-01',
        description: 'Supermarket',
        currency: 'EUR',
        type: 'expense',
        category: 'Groceries',
        institution: 'Berliner Sparkasse',
      },
    ],
    importedAt: '2026-03-01T10:00:00Z',
    importedFingerprints: ['fp-1'],
  }

  beforeEach(() => {
    useAppStore.setState({
      importedAccounts: [mockAccount],
      customKeywords: { Groceries: ['edeka', 'rewe'] },
      manualCategories: { 'tx-1': 'Groceries' },
      customCategories: [],
      duplicateOverrideRules: [],
      currentStep: 'dashboard',
    })

    // Mock URL.createObjectURL and revokeObjectURL
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('parseAndValidateBackup', () => {
    it('validates a standard Saldio backup format', () => {
      const backupJson = JSON.stringify({
        version: 1,
        app: 'saldio',
        exportedAt: '2026-09-27T10:00:00Z',
        data: {
          importedAccounts: [mockAccount],
        },
      })

      const result = parseAndValidateBackup(backupJson)
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.summary.accountsCount).toBe(1)
        expect(result.summary.transactionsCount).toBe(2)
        expect(result.summary.exportedAt).toBe('2026-09-27T10:00:00Z')
      }
    })

    it('validates a direct store dump format containing importedAccounts', () => {
      const directDumpJson = JSON.stringify({
        importedAccounts: [mockAccount],
      })

      const result = parseAndValidateBackup(directDumpJson)
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.summary.accountsCount).toBe(1)
        expect(result.summary.transactionsCount).toBe(2)
      }
    })

    it('rejects invalid JSON syntax', () => {
      const result = parseAndValidateBackup('{ not a valid json')
      expect(result.valid).toBe(false)
    })

    it('rejects JSON without importedAccounts array', () => {
      const result = parseAndValidateBackup(JSON.stringify({ someKey: 'value' }))
      expect(result.valid).toBe(false)
    })

    it('rejects backup if a transaction is missing an id', () => {
      const invalidBackup = JSON.stringify({
        version: 1,
        app: 'saldio',
        data: {
          importedAccounts: [
            {
              ...mockAccount,
              transactions: [
                {
                  amount: -50,
                  date: '2026-03-01',
                  description: 'Supermarket',
                  currency: 'EUR',
                  type: 'expense',
                  institution: 'Berliner Sparkasse',
                },
              ],
            },
          ],
        },
      })

      const result = parseAndValidateBackup(invalidBackup)
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toContain("missing a valid 'id'")
      }
    })

    it('rejects backup if a transaction has an invalid amount', () => {
      const invalidBackup = JSON.stringify({
        importedAccounts: [
          {
            ...mockAccount,
            transactions: [
              {
                id: 'tx-bad-amount',
                amount: 'not-a-number',
                date: '2026-03-01',
                description: 'Bad amount',
                currency: 'EUR',
                type: 'expense',
                institution: 'Berliner Sparkasse',
              },
            ],
          },
        ],
      })

      const result = parseAndValidateBackup(invalidBackup)
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toContain("invalid 'amount'")
      }
    })

    it('properly localizes error messages across multiple locales when transaction ID is missing', () => {
      const invalidBackup = JSON.stringify({
        importedAccounts: [
          {
            ...mockAccount,
            institutionName: 'Commerzbank',
            transactions: [
              {
                amount: -50,
                date: '2026-03-01',
                description: 'Supermarket',
                currency: 'EUR',
                type: 'expense',
                institution: 'Commerzbank',
              },
            ],
          },
        ],
      })

      const result = parseAndValidateBackup(invalidBackup)
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toContain("missing a valid 'id'")
        expect(formatBackupError(result, translations.en)).toBe(
          'Transaction #1 in "Commerzbank" is missing a valid ID.',
        )
        expect(formatBackupError(result, translations.de)).toBe(
          'Transaktion #1 in „Commerzbank“ enthält keine gültige ID.',
        )
        expect(formatBackupError(result, translations.bs)).toBe(
          'Transakcija #1 na računu „Commerzbank“ nema valjan ID.',
        )
      }
    })
  })

  describe('UI interactions', () => {
    it('renders the Backup & Restore section with Export and Restore cards', () => {
      render(<BackupRestore />)

      expect(screen.getByTestId('backup-restore-section')).toBeInTheDocument()
      expect(screen.getByTestId('export-backup-card')).toBeInTheDocument()
      expect(screen.getByTestId('restore-backup-card')).toBeInTheDocument()
    })

    it('exports backup file and displays success feedback when clicking export button', () => {
      render(<BackupRestore />)

      const exportBtn = screen.getByTestId('export-backup-button')
      fireEvent.click(exportBtn)

      expect(window.URL.createObjectURL).toHaveBeenCalled()
      expect(screen.getByTestId('backup-feedback-success')).toBeInTheDocument()
    })

    it('triggers hidden file input when clicking restore button', () => {
      render(<BackupRestore />)

      const fileInput = screen.getByTestId('restore-file-input') as HTMLInputElement
      const clickSpy = vi.spyOn(fileInput, 'click')

      const restoreBtn = screen.getByTestId('restore-backup-button')
      fireEvent.click(restoreBtn)

      expect(clickSpy).toHaveBeenCalled()
    })

    it('shows error feedback when uploading an invalid backup file', async () => {
      render(<BackupRestore />)

      const fileInput = screen.getByTestId('restore-file-input')
      const invalidFile = new File(['invalid content'], 'invalid.json', { type: 'application/json' })

      fireEvent.change(fileInput, { target: { files: [invalidFile] } })

      await waitFor(() => {
        expect(screen.getByTestId('backup-feedback-error')).toBeInTheDocument()
      })
    })

    it('opens confirmation modal on valid file, allows canceling without modifying store', async () => {
      render(<BackupRestore />)

      const validBackup = JSON.stringify({
        version: 1,
        app: 'saldio',
        exportedAt: '2026-09-27T08:00:00Z',
        data: {
          importedAccounts: [
            {
              ...mockAccount,
              institutionName: 'N26',
            },
          ],
        },
      })

      const fileInput = screen.getByTestId('restore-file-input')
      const validFile = new File([validBackup], 'saldio-backup.json', { type: 'application/json' })

      fireEvent.change(fileInput, { target: { files: [validFile] } })

      await waitFor(() => {
        expect(screen.getByTestId('confirm-restore-button')).toBeInTheDocument()
      })

      // Cancel restore
      const cancelBtn = screen.getByText(useLanguageStore.getState().t.cancel || 'Cancel')
      fireEvent.click(cancelBtn)

      expect(screen.queryByTestId('confirm-restore-button')).not.toBeInTheDocument()
      // Store state was not changed to N26
      expect(useAppStore.getState().importedAccounts[0].institutionName).toBe('Berliner Sparkasse')
    })

    it('restores data into store on confirming modal', async () => {
      render(<BackupRestore />)

      const validBackup = JSON.stringify({
        version: 1,
        app: 'saldio',
        exportedAt: '2026-09-27T08:00:00Z',
        data: {
          importedAccounts: [
            {
              ...mockAccount,
              institutionName: 'Restored N26 Bank',
            },
          ],
          customKeywords: { Health: ['pharmacy'] },
        },
      })

      const fileInput = screen.getByTestId('restore-file-input')
      const validFile = new File([validBackup], 'saldio-backup.json', { type: 'application/json' })

      fireEvent.change(fileInput, { target: { files: [validFile] } })

      await waitFor(() => {
        expect(screen.getByTestId('confirm-restore-button')).toBeInTheDocument()
      })

      // Confirm restore
      fireEvent.click(screen.getByTestId('confirm-restore-button'))

      await waitFor(() => {
        expect(screen.getByTestId('backup-feedback-success')).toBeInTheDocument()
      })

      // Store state was successfully updated
      expect(useAppStore.getState().importedAccounts[0].institutionName).toBe('Restored N26 Bank')
      expect(useAppStore.getState().customKeywords).toEqual({ Health: ['pharmacy'] })
    })
  })
})
