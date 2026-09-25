import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Transaction } from '../../../types'
import { TransactionPreviewRow } from './TransactionPreviewRow'

describe('TransactionPreviewRow', () => {
  const mockTx: Transaction = {
    id: 'tx-1',
    date: '2026-03-01',
    description: 'Bakery Purchase',
    amount: -15.5,
    currency: 'EUR',
    type: 'expense',
    category: 'Groceries',
    institution: 'Sparkasse',
  }

  const defaultProps = {
    index: 0,
    tx: mockTx,
    isDuplicate: false,
    isInternalTransfer: false,
    isSpaceTransfer: false,
    customCategories: [],
    t: {
      description: 'Description',
      amount: 'Amount',
      duplicate: 'Duplicate',
      unlockDuplicate: 'Unlock',
      relockDuplicate: 'Lock',
      unlockedDuplicateBadge: 'Unlocked',
      removeTransaction: 'Remove transaction',
    } as unknown as Parameters<typeof TransactionPreviewRow>[0]['t'],
    locale: 'en',
    formatCurrency: (amt: number) => `€${Math.abs(amt).toFixed(2)}`,
    formatDate: (d: string) => d,
  }

  it('renders duplicate pill when isDuplicate is true and hideDuplicateBadge is false', () => {
    render(
      <TransactionPreviewRow
        {...defaultProps}
        isDuplicate={true}
        hideDuplicateBadge={false}
      />,
    )
    expect(screen.getByText('Duplicate')).toBeInTheDocument()
  })

  it('renders modified pill when isDuplicate is true, isModified is true, and hideDuplicateBadge is false', () => {
    render(
      <TransactionPreviewRow
        {...defaultProps}
        t={{ ...defaultProps.t, modified: 'Modified' }}
        isDuplicate={true}
        isModified={true}
        hideDuplicateBadge={false}
      />,
    )
    expect(screen.getByText('Modified')).toBeInTheDocument()
    expect(screen.queryByText('Duplicate')).not.toBeInTheDocument()
  })

  it('does NOT render duplicate pill when hideDuplicateBadge is true (e.g. in duplicates view)', () => {
    render(
      <TransactionPreviewRow
        {...defaultProps}
        isDuplicate={true}
        hideDuplicateBadge={true}
      />,
    )
    expect(screen.queryByText('Duplicate')).not.toBeInTheDocument()
  })

  it('renders unlock button and triggers onUnlockDuplicate when clicked', () => {
    const onUnlock = vi.fn()
    render(
      <TransactionPreviewRow
        {...defaultProps}
        isDuplicate={true}
        onUnlockDuplicate={onUnlock}
      />,
    )

    const unlockBtn = screen.getByTestId('unlock-duplicate-btn-tx-1')
    expect(unlockBtn).toBeInTheDocument()
    fireEvent.click(unlockBtn)
    expect(onUnlock).toHaveBeenCalledWith(mockTx)
  })

  it('renders editable inputs, unlocked badge, and relock button when isUnlockedDuplicate is true', () => {
    const onRelock = vi.fn()
    const onUpdate = vi.fn()

    render(
      <TransactionPreviewRow
        {...defaultProps}
        isDuplicate={true}
        isUnlockedDuplicate={true}
        onUpdateTransaction={onUpdate}
        onRelockDuplicate={onRelock}
      />,
    )

    // Unlocked text label is NOT displayed (unlock padlock icon is sufficient)
    expect(screen.queryByTestId('unlocked-duplicate-badge-tx-1')).not.toBeInTheDocument()

    // Duplicate pill is NOT displayed
    expect(screen.queryByText('Duplicate')).not.toBeInTheDocument()

    // Row is editable inline
    const descInput = screen.getByDisplayValue('Bakery Purchase')
    expect(descInput).toBeInTheDocument()
    fireEvent.change(descInput, { target: { value: 'Updated Bakery' } })
    expect(onUpdate).toHaveBeenCalledWith('tx-1', { description: 'Updated Bakery' })

    // Relock button triggers onRelockDuplicate
    const relockBtn = screen.getByTestId('relock-duplicate-btn-tx-1')
    expect(relockBtn).toBeInTheDocument()
    fireEvent.click(relockBtn)
    expect(onRelock).toHaveBeenCalledWith(mockTx)
  })

  it('replaces relock padlock with reset button when isUnlockedDuplicate and isModified are true', () => {
    const onRelock = vi.fn()
    const onReset = vi.fn()

    const { rerender } = render(
      <TransactionPreviewRow
        {...defaultProps}
        isDuplicate={true}
        isUnlockedDuplicate={true}
        isModified={true}
        onRelockDuplicate={onRelock}
        onResetTransaction={onReset}
        t={{
          ...defaultProps.t,
          cannotRelockModified: 'Cannot relock modified transaction. Reset to original values to relock.',
          resetToOriginal: 'Reset to original values',
        } as unknown as Parameters<typeof TransactionPreviewRow>[0]['t']}
      />,
    )

    // Padlock relock button is NOT present when modified (replaced by reset icon to avoid squishing amount column)
    expect(screen.queryByTestId('relock-duplicate-btn-tx-1')).not.toBeInTheDocument()

    // Reset button is visible and triggers onResetTransaction
    const resetBtn = screen.getByTestId('reset-tx-btn-tx-1')
    expect(resetBtn).toBeInTheDocument()
    expect(resetBtn).toHaveAttribute('title', 'Reset to original values')

    fireEvent.click(resetBtn)
    expect(onReset).toHaveBeenCalledWith('tx-1')

    // After reset is complete (isModified becomes false), padlock icon replaces the reset button
    rerender(
      <TransactionPreviewRow
        {...defaultProps}
        isDuplicate={true}
        isUnlockedDuplicate={true}
        isModified={false}
        onRelockDuplicate={onRelock}
        onResetTransaction={onReset}
      />,
    )
    expect(screen.queryByTestId('reset-tx-btn-tx-1')).not.toBeInTheDocument()
    const restoredRelockBtn = screen.getByTestId('relock-duplicate-btn-tx-1')
    expect(restoredRelockBtn).toBeInTheDocument()
    expect(restoredRelockBtn).not.toBeDisabled()
  })

  it('does not render row-level bulk adjust button', () => {
    render(
      <TransactionPreviewRow
        {...defaultProps}
        isDuplicate={true}
        isUnlockedDuplicate={true}
        isModified={true}
      />,
    )

    expect(screen.queryByTestId('row-bulk-adjust-btn-tx-1')).not.toBeInTheDocument()
  })

  it('renders disabled lock button, Already Duplicated badge, and disables all actions when isAlreadyDuplicated is true', () => {
    const onUnlock = vi.fn()
    const onUpdate = vi.fn()
    const onReset = vi.fn()
    const onRelock = vi.fn()

    render(
      <TransactionPreviewRow
        {...defaultProps}
        isDuplicate={true}
        isAlreadyDuplicated={true}
        onUnlockDuplicate={onUnlock}
        onUpdateTransaction={onUpdate}
        onResetTransaction={onReset}
        onRelockDuplicate={onRelock}
        t={{
          ...defaultProps.t,
          alreadyDuplicated: 'Already Duplicated',
          alreadyDuplicatedNotice: 'This duplicate was already imported and cannot be unlocked again.',
        } as unknown as Parameters<typeof TransactionPreviewRow>[0]['t']}
      />,
    )

    // Displays Already Duplicated pill
    expect(screen.getByTestId('preview-duplicate-badge-tx-1')).toHaveTextContent('Already Duplicated')

    // Lock button is disabled with notice tooltip and cannot be clicked
    const lockBtn = screen.getByTestId('already-duplicated-lock-tx-1')
    expect(lockBtn).toBeInTheDocument()
    expect(lockBtn).toBeDisabled()
    expect(lockBtn).toHaveAttribute('title', 'This duplicate was already imported and cannot be unlocked again.')

    // Does not render unlock button, reset button, or relock button
    expect(screen.queryByTestId('unlock-duplicate-btn-tx-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('reset-tx-btn-tx-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('relock-duplicate-btn-tx-1')).not.toBeInTheDocument()

    // Row is not editable (inputs not rendered, plain text rendered)
    expect(screen.queryByDisplayValue('Bakery Purchase')).not.toBeInTheDocument()
    expect(screen.getByText('Bakery Purchase')).toBeInTheDocument()
  })

  it('renders space transfer badge as view-only with Sub-account label, and no include/exclude action buttons', () => {
    const onUpdate = vi.fn()
    const onRemove = vi.fn()

    render(
      <TransactionPreviewRow
        {...defaultProps}
        isSpaceTransfer={true}
        onUpdateTransaction={onUpdate}
        onRemoveTransaction={onRemove}
        t={{
          ...defaultProps.t,
          spaceTransfer: 'Sub-account',
        } as unknown as Parameters<typeof TransactionPreviewRow>[0]['t']}
      />,
    )

    // Displays Sub-account pill
    const spaceBadge = screen.getByTestId('space-transfer-badge-tx-1')
    expect(spaceBadge).toBeInTheDocument()
    expect(spaceBadge).toHaveTextContent('Sub-account')

    // Row is read-only (not editable inline even if onUpdateTransaction is passed)
    expect(screen.queryByDisplayValue('Bakery Purchase')).not.toBeInTheDocument()
    expect(screen.getByText('Bakery Purchase')).toBeInTheDocument()

    // No remove/trash button, and no include or exclude buttons
    expect(screen.queryByRole('button', { name: 'Remove transaction' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /include/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /exclude/i })).not.toBeInTheDocument()
  })
})
