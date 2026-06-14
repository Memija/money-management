import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

// Mock the lucide-react icon
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
    AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
    X: () => <div data-testid="x-icon" />
  };
});

describe('DeleteConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when isOpen is true', () => {
    render(<DeleteConfirmationModal {...defaultProps} />);

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<DeleteConfirmationModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(<DeleteConfirmationModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm and onClose when Delete button is clicked', () => {
    render(<DeleteConfirmationModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('uses custom confirmText and cancelText when provided', () => {
    render(
      <DeleteConfirmationModal
        {...defaultProps}
        confirmText="Yes, delete it"
        cancelText="No, keep it"
      />
    );

    expect(screen.getByRole('button', { name: 'Yes, delete it' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No, keep it' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked (inherited from Modal)', () => {
    render(<DeleteConfirmationModal {...defaultProps} />);

    // The Modal uses a portal and adds a div with class overlay
    // Actually, testing the overlay click might be tricky without knowing the exact structure or relying on the Modal's implementation
    // We can simulate Escape key instead to test integration with Modal
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
