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

    // Unlocked badge is displayed
    expect(screen.getByTestId('unlocked-duplicate-badge-tx-1')).toHaveTextContent('Unlocked')

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
})
