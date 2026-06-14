import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionPreviewModal } from './TransactionPreviewModal';
import type { Transaction } from '../../../types';

// Mock dependencies
vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: (selector: (state: { locale: string; t: Record<string, string> }) => unknown) => {
    const state = {
      locale: 'en',
      t: {
        transactions: 'Transactions',
        date: 'Date',
        description: 'Description',
        amount: 'Amount',
        done: 'Done',
        noTransactionsLeft: 'No transactions left.',
      },
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock('../../shared/Modal', () => ({
  Modal: ({ isOpen, children, title, footer }: { isOpen: boolean; children: React.ReactNode; title: React.ReactNode; footer: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-modal">
        <h2>{title}</h2>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
      </div>
    );
  },
}));

// react-virtuoso requires a mock for testing environments since it relies on DOM measurement
vi.mock('react-virtuoso', () => ({
  Virtuoso: ({ data, itemContent }: { data: Transaction[]; itemContent: (index: number, item: Transaction) => React.ReactNode }) => (
    <div data-testid="mock-virtuoso">
      {data.map((item: Transaction, index: number) => (
        <div key={item.id} data-testid={`virtuoso-item-${index}`}>
          {itemContent(index, item)}
        </div>
      ))}
    </div>
  ),
}));

describe('TransactionPreviewModal', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      date: '2026-03-01',
      description: 'Salary',
      amount: 3500,
      type: 'income',
      category: 'salary',
      currency: 'EUR',
      institution: 'Mock Bank',
    },
    {
      id: 'tx-2',
      date: '2026-03-02',
      description: 'Supermarket',
      amount: -45.9,
      type: 'expense',
      category: 'groceries',
      currency: 'EUR',
      institution: 'Mock Bank',
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    transactions: mockTransactions,
    onRemoveTransaction: vi.fn(),
  };

  it('renders the modal when isOpen is true', () => {
    render(<TransactionPreviewModal {...defaultProps} />);
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<TransactionPreviewModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
  });

  it('renders empty state when there are no transactions', () => {
    render(<TransactionPreviewModal {...defaultProps} transactions={[]} />);
    expect(screen.getByText('No transactions left.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-virtuoso')).not.toBeInTheDocument();
  });

  it('renders a list of transactions', () => {
    render(<TransactionPreviewModal {...defaultProps} />);

    // Check if the mock virtuoso rendered our items
    expect(screen.getByTestId('mock-virtuoso')).toBeInTheDocument();

    // Check content of first transaction (income)
    // en locale formats 2026-03-01 as "03/01/2026"
    expect(screen.getByText('03/01/2026')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();

    // The amount formatting will output string with currency
    // Using partial match because of special whitespace/currency characters
    const amount1 = screen.getByText(/\+.*3,500/i);
    expect(amount1).toBeInTheDocument();

    // Check content of second transaction (expense)
    expect(screen.getByText('03/02/2026')).toBeInTheDocument();
    expect(screen.getByText('Supermarket')).toBeInTheDocument();
  });

  it('calls onRemoveTransaction with correct id when delete button is clicked', () => {
    render(<TransactionPreviewModal {...defaultProps} />);

    const removeButtons = screen.getAllByRole('button', { name: /remove transaction/i });
    expect(removeButtons).toHaveLength(2);

    // Click the first remove button
    fireEvent.click(removeButtons[0]);

    expect(defaultProps.onRemoveTransaction).toHaveBeenCalledTimes(1);
    expect(defaultProps.onRemoveTransaction).toHaveBeenCalledWith('tx-1');
  });

  it('calls onClose when Done button is clicked', () => {
    render(<TransactionPreviewModal {...defaultProps} />);

    const doneButton = screen.getByText('Done');
    fireEvent.click(doneButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
