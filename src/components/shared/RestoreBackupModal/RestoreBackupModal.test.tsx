import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ValidatedBackupResult } from '../../../utils/backup/backup-utils'
import { RestoreBackupModal } from './RestoreBackupModal'

describe('RestoreBackupModal', () => {
  const mockPendingRestore: ValidatedBackupResult = {
    valid: true,
    data: {
      importedAccounts: [
        {
          institutionId: 'de_db',
          institutionName: 'Deutsche Bank',
          importedAt: '2026-03-01T00:00:00Z',
          importedFingerprints: [],
          transactions: [
            {
              id: 'tx-1',
              date: '2026-03-01',
              description: 'Groceries',
              amount: -45,
              currency: 'EUR',
              type: 'expense',
              institution: 'Deutsche Bank',
            },
          ],
        },
      ],
    },
    summary: {
      accountsCount: 1,
      transactionsCount: 1,
      exportedAt: '2026-03-01T15:30:00Z',
    },
  }

  it('renders nothing when pendingRestore is null', () => {
    const { container } = render(
      <RestoreBackupModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        pendingRestore={null}
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders modal with summary and timestamp when open', () => {
    render(
      <RestoreBackupModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        pendingRestore={mockPendingRestore}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Restore Backup' })).toBeInTheDocument()
    expect(screen.getByTestId('restore-backup-modal-content')).toBeInTheDocument()
    expect(screen.getByText(/1 accounts/i)).toBeInTheDocument()
    expect(screen.getByText(/1 transactions/i)).toBeInTheDocument()
    expect(screen.getByText(/Backup timestamp:/i)).toBeInTheDocument()
  })

  it('calls onConfirm when clicking confirm button', () => {
    const onConfirm = vi.fn()
    render(
      <RestoreBackupModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        pendingRestore={mockPendingRestore}
      />,
    )

    const confirmBtn = screen.getByTestId('confirm-restore-button')
    fireEvent.click(confirmBtn)

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking cancel button', () => {
    const onClose = vi.fn()
    render(
      <RestoreBackupModal
        isOpen={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        pendingRestore={mockPendingRestore}
      />,
    )

    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelBtn)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('disables buttons and shows loading indicator while isRestoring is true', () => {
    render(
      <RestoreBackupModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        pendingRestore={mockPendingRestore}
        isRestoring={true}
      />,
    )

    expect(screen.getByTestId('confirm-restore-button')).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })
})
