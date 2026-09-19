import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Transaction } from '../../../types'
import { UnlockDuplicateModal } from './UnlockDuplicateModal'

vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: (selector: (s: { t: Record<string, string> }) => unknown) => {
    const state = {
      t: {
        unlockDuplicateTitle: 'Unlock Duplicate Transaction',
        unlockDuplicateMessage:
          'This transaction was flagged as a duplicate of an existing record. Unlocking it will allow you to edit its details and include it in the import. Are you sure you want to unlock it?',
        unlockDuplicateConfirm: 'Unlock & Edit',
        duplicateImportCancel: 'Cancel',
      },
    }
    return selector ? selector(state) : state
  },
}))

vi.mock('../Modal', () => ({
  Modal: ({
    isOpen,
    children,
    title,
    footer,
  }: {
    isOpen: boolean
    children: React.ReactNode
    title: React.ReactNode
    footer: React.ReactNode
  }) => {
    if (!isOpen) return null
    return (
      <div data-testid="mock-modal">
        <div data-testid="mock-modal-title">{title}</div>
        <div data-testid="mock-modal-content">{children}</div>
        <div data-testid="mock-modal-footer">{footer}</div>
      </div>
    )
  },
}))

describe('UnlockDuplicateModal', () => {
  const mockTransaction: Transaction = {
    id: 'tx-dup-1',
    date: '2026-03-01',
    description: 'Starbucks Coffee',
    amount: -4.5,
    currency: 'EUR',
    type: 'expense',
    category: 'Coffee',
    institution: 'Sparkasse',
  }

  const defaultProps = {
    isOpen: true,
    transaction: mockTransaction,
    onClose: vi.fn(),
    onConfirmUnlock: vi.fn(),
    formatCurrency: (amt: number) => `€${Math.abs(amt).toFixed(2)}`,
    formatDate: (d: string) => d,
  }

  it('renders nothing when transaction is null', () => {
    render(<UnlockDuplicateModal {...defaultProps} transaction={null} />)
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument()
  })

  it('renders warning details and transaction info when open', () => {
    render(<UnlockDuplicateModal {...defaultProps} />)
    expect(screen.getByText('Unlock Duplicate Transaction')).toBeInTheDocument()
    expect(
      screen.getByText(/This transaction was flagged as a duplicate/i),
    ).toBeInTheDocument()
    expect(screen.getByText('Starbucks Coffee')).toBeInTheDocument()
    expect(screen.getByText('2026-03-01')).toBeInTheDocument()
    expect(screen.getByText('€4.50')).toBeInTheDocument()
  })

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<UnlockDuplicateModal {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirmUnlock and onClose when Unlock button is clicked', () => {
    const onConfirmUnlock = vi.fn()
    const onClose = vi.fn()
    render(
      <UnlockDuplicateModal
        {...defaultProps}
        onClose={onClose}
        onConfirmUnlock={onConfirmUnlock}
      />,
    )

    fireEvent.click(screen.getByTestId('confirm-unlock-duplicate-btn'))
    expect(onConfirmUnlock).toHaveBeenCalledWith(mockTransaction)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
