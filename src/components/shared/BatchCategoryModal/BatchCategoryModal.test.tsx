import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Transaction } from '../../../types'
import { BatchCategoryModal } from './BatchCategoryModal'

vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) =>
    selector({
      locale: 'en',
      t: {
        batchCategoryTitle: 'Update Related Transactions',
        batchCategoryPrompt:
          'Found {count} related transaction(s). Update the category for all of them to {category}?',
        batchCategoryOnlyThis: 'Only this transaction',
        batchCategoryUpdateAll: 'Update all ({count})',
        batchCategoryRememberRule: 'Remember this rule for future imports',
        batchCategoryMatchingTransactions: 'Matching transactions',
        cancel: 'Cancel',
      },
    }),
  ),
}))

vi.mock('../../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) =>
    selector({
      customCategories: [],
    }),
  ),
}))

vi.mock('../../../store/usePrivacyStore', () => ({
  usePrivacyStore: vi.fn((selector) =>
    selector({
      isPrivacyMode: false,
    }),
  ),
}))

describe('BatchCategoryModal', () => {
  const mockTargetTx: Transaction = {
    id: 'tx-1',
    date: '2024-03-01',
    amount: -49.99,
    currency: 'EUR',
    institution: 'Bank A',
    description:
      'CHECK24 Vergleichsportal Mobilfunk GmbH Cashback Auszahlung End-to-End-Ref.: C542586686C116',
    category: 'Other',
    type: 'expense',
  }

  const mockRelatedTx: Transaction[] = [
    {
      id: 'tx-2',
      date: '2024-03-05',
      amount: -49.99,
      currency: 'EUR',
      institution: 'Bank A',
      description:
        'CHECK24 Vergleichsportal Mobilfunk GmbH Cashback Auszahlung End-to-End-Ref.: C542491879C1159',
      category: 'Other',
      type: 'expense',
    },
  ]

  it('renders nothing when targetTransaction is null or isOpen is false', () => {
    const { container, rerender } = render(
      <BatchCategoryModal
        isOpen={false}
        targetTransaction={mockTargetTx}
        newCategory="Communication"
        relatedTransactions={mockRelatedTx}
        onClose={vi.fn()}
        onConfirmOnlyThis={vi.fn()}
        onConfirmAll={vi.fn()}
      />,
    )
    expect(container).toBeEmptyDOMElement()

    rerender(
      <BatchCategoryModal
        isOpen={true}
        targetTransaction={null}
        newCategory="Communication"
        relatedTransactions={mockRelatedTx}
        onClose={vi.fn()}
        onConfirmOnlyThis={vi.fn()}
        onConfirmAll={vi.fn()}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders target transaction and related transactions properly when open', () => {
    render(
      <BatchCategoryModal
        isOpen={true}
        targetTransaction={mockTargetTx}
        newCategory="Communication"
        relatedTransactions={mockRelatedTx}
        onClose={vi.fn()}
        onConfirmOnlyThis={vi.fn()}
        onConfirmAll={vi.fn()}
      />,
    )

    expect(screen.getByText('Update Related Transactions')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Found 1 related transaction(s). Update the category for all of them to Communication?',
      ),
    ).toBeInTheDocument()
    expect(screen.getByTestId('related-tx-tx-2')).toBeInTheDocument()
    expect(screen.getByText('Update all (2)')).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(
      <BatchCategoryModal
        isOpen={true}
        targetTransaction={mockTargetTx}
        newCategory="Communication"
        relatedTransactions={mockRelatedTx}
        onClose={onClose}
        onConfirmOnlyThis={vi.fn()}
        onConfirmAll={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByTestId('batch-category-cancel-btn'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirmOnlyThis and closes modal when "Only this transaction" is clicked', () => {
    const onConfirmOnlyThis = vi.fn()
    const onClose = vi.fn()

    render(
      <BatchCategoryModal
        isOpen={true}
        targetTransaction={mockTargetTx}
        newCategory="Communication"
        relatedTransactions={mockRelatedTx}
        onClose={onClose}
        onConfirmOnlyThis={onConfirmOnlyThis}
        onConfirmAll={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByTestId('batch-category-only-this-btn'))
    expect(onConfirmOnlyThis).toHaveBeenCalledWith(mockTargetTx, 'Communication')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirmAll with rememberRule=true by default and closes modal', () => {
    const onConfirmAll = vi.fn()
    const onClose = vi.fn()

    render(
      <BatchCategoryModal
        isOpen={true}
        targetTransaction={mockTargetTx}
        newCategory="Communication"
        relatedTransactions={mockRelatedTx}
        onClose={onClose}
        onConfirmOnlyThis={vi.fn()}
        onConfirmAll={onConfirmAll}
      />,
    )

    fireEvent.click(screen.getByTestId('batch-category-update-all-btn'))
    expect(onConfirmAll).toHaveBeenCalledWith(
      mockTargetTx,
      mockRelatedTx,
      'Communication',
      true,
    )
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('allows unchecking rememberRule and passes false to onConfirmAll', () => {
    const onConfirmAll = vi.fn()

    render(
      <BatchCategoryModal
        isOpen={true}
        targetTransaction={mockTargetTx}
        newCategory="Communication"
        relatedTransactions={mockRelatedTx}
        onClose={vi.fn()}
        onConfirmOnlyThis={vi.fn()}
        onConfirmAll={onConfirmAll}
      />,
    )

    const checkbox = screen.getByTestId('batch-category-remember-rule')
    expect(checkbox).toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()

    fireEvent.click(screen.getByTestId('batch-category-update-all-btn'))
    expect(onConfirmAll).toHaveBeenCalledWith(
      mockTargetTx,
      mockRelatedTx,
      'Communication',
      false,
    )
  })

  it('allows unchecking a transaction to only update selected related transactions', () => {
    const onConfirmAll = vi.fn()
    const multipleRelatedTx: Transaction[] = [
      {
        id: 'tx-2',
        date: '2024-03-05',
        amount: -49.99,
        currency: 'EUR',
        institution: 'Bank A',
        description: 'CHECK24 Mobilfunk',
        category: 'Other',
        type: 'expense',
      },
      {
        id: 'tx-3',
        date: '2024-03-06',
        amount: -49.99,
        currency: 'EUR',
        institution: 'Bank A',
        description: 'CHECK24 DSL',
        category: 'Other',
        type: 'expense',
      },
    ]

    render(
      <BatchCategoryModal
        isOpen={true}
        targetTransaction={mockTargetTx}
        newCategory="Communication"
        relatedTransactions={multipleRelatedTx}
        onClose={vi.fn()}
        onConfirmOnlyThis={vi.fn()}
        onConfirmAll={onConfirmAll}
      />,
    )

    // Initially all 2 related are selected -> total 3 affected
    expect(screen.getByText('Update all (3)')).toBeInTheDocument()

    const cb1 = screen.getByTestId('related-checkbox-tx-2')
    const cb2 = screen.getByTestId('related-checkbox-tx-3')
    expect(cb1).toBeChecked()
    expect(cb2).toBeChecked()

    // Uncheck tx-3
    fireEvent.click(cb2)
    expect(cb1).toBeChecked()
    expect(cb2).not.toBeChecked()

    // Button text should now be "Update selected (2)" (target + tx-2)
    expect(screen.getByText('Update selected (2)')).toBeInTheDocument()

    // Click confirm
    fireEvent.click(screen.getByTestId('batch-category-update-all-btn'))
    expect(onConfirmAll).toHaveBeenCalledWith(
      mockTargetTx,
      [multipleRelatedTx[0]], // only tx-2 is passed!
      'Communication',
      true,
    )
  })

  it('allows clicking the row to toggle checkbox selection', () => {
    render(
      <BatchCategoryModal
        isOpen={true}
        targetTransaction={mockTargetTx}
        newCategory="Communication"
        relatedTransactions={mockRelatedTx}
        onClose={vi.fn()}
        onConfirmOnlyThis={vi.fn()}
        onConfirmAll={vi.fn()}
      />,
    )

    const cb = screen.getByTestId('related-checkbox-tx-2')
    expect(cb).toBeChecked()

    // Click row
    fireEvent.click(screen.getByTestId('related-tx-tx-2'))
    expect(cb).not.toBeChecked()

    // Click row again
    fireEvent.click(screen.getByTestId('related-tx-tx-2'))
    expect(cb).toBeChecked()
  })

  it('toggles select all and deselect all via header checkbox and button', () => {
    const multipleRelatedTx: Transaction[] = [
      {
        id: 'tx-2',
        date: '2024-03-05',
        amount: -49.99,
        currency: 'EUR',
        institution: 'Bank A',
        description: 'CHECK24 Mobilfunk',
        category: 'Other',
        type: 'expense',
      },
      {
        id: 'tx-3',
        date: '2024-03-06',
        amount: -49.99,
        currency: 'EUR',
        institution: 'Bank A',
        description: 'CHECK24 DSL',
        category: 'Other',
        type: 'expense',
      },
    ]

    render(
      <BatchCategoryModal
        isOpen={true}
        targetTransaction={mockTargetTx}
        newCategory="Communication"
        relatedTransactions={multipleRelatedTx}
        onClose={vi.fn()}
        onConfirmOnlyThis={vi.fn()}
        onConfirmAll={vi.fn()}
      />,
    )

    const selectAllBtn = screen.getByTestId('batch-category-select-all-btn')
    const cb1 = screen.getByTestId('related-checkbox-tx-2')
    const cb2 = screen.getByTestId('related-checkbox-tx-3')

    // Click select all button to deselect all
    fireEvent.click(selectAllBtn)
    expect(cb1).not.toBeChecked()
    expect(cb2).not.toBeChecked()

    // Click again to select all
    fireEvent.click(selectAllBtn)
    expect(cb1).toBeChecked()
    expect(cb2).toBeChecked()

    // Toggle via header checkbox
    const selectAllCb = screen.getByTestId('batch-category-select-all')
    fireEvent.click(selectAllCb)
    expect(cb1).not.toBeChecked()
    expect(cb2).not.toBeChecked()
  })
})
