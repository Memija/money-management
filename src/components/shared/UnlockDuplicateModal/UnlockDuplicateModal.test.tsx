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
    expect(onConfirmUnlock).toHaveBeenCalledWith(mockTransaction, true)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirmUnlock with rememberRule=false when checkbox is unchecked', () => {
    const onConfirmUnlock = vi.fn()
    const onClose = vi.fn()
    render(
      <UnlockDuplicateModal
        {...defaultProps}
        onClose={onClose}
        onConfirmUnlock={onConfirmUnlock}
      />,
    )

    const checkbox = screen.getByTestId('remember-duplicate-rule-checkbox')
    expect(checkbox).toBeChecked()
    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()

    fireEvent.click(screen.getByTestId('confirm-unlock-duplicate-btn'))
    expect(onConfirmUnlock).toHaveBeenCalledWith(mockTransaction, false)
  })

  it('renders identical duplicates notice and bulk unlock button when sameDuplicateCount > 1', () => {
    const onConfirmUnlock = vi.fn()
    const onClose = vi.fn()
    render(
      <UnlockDuplicateModal
        {...defaultProps}
        sameDuplicateCount={3}
        onClose={onClose}
        onConfirmUnlock={onConfirmUnlock}
      />,
    )

    expect(screen.getByTestId('identical-duplicates-notice')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-unlock-single-btn')).toHaveTextContent('Unlock only this')
    expect(screen.getByTestId('confirm-unlock-all-btn')).toHaveTextContent('Unlock all 3 identical transactions')

    // Click "Unlock all 3 identical transactions"
    fireEvent.click(screen.getByTestId('confirm-unlock-all-btn'))
    expect(onConfirmUnlock).toHaveBeenCalledWith(mockTransaction, true, true)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('allows unlocking only the current transaction when sameDuplicateCount > 1', () => {
    const onConfirmUnlock = vi.fn()
    const onClose = vi.fn()
    render(
      <UnlockDuplicateModal
        {...defaultProps}
        sameDuplicateCount={3}
        onClose={onClose}
        onConfirmUnlock={onConfirmUnlock}
      />,
    )

    fireEvent.click(screen.getByTestId('confirm-unlock-single-btn'))
    expect(onConfirmUnlock).toHaveBeenCalledWith(mockTransaction, true)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
