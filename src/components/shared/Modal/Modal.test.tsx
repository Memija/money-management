import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Modal } from './Modal';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => {
        // filter out framer-motion specific props to prevent React warnings in tests
        const validProps = { ...props };
        delete validProps.initial;
        delete validProps.animate;
        delete validProps.exit;
        delete validProps.transition;

        return <div {...validProps}>{children}</div>;
      },
    },
  };
});

describe('Modal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    document.body.style.overflow = ''; // Reset body overflow before each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <p>Modal Content</p>
      </Modal>
    );
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('renders children and title when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Title">
        <p>Modal Content</p>
      </Modal>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('renders footer if provided', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} footer={<button>Save</button>}>
        <p>Modal Content</p>
      </Modal>
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <p>Modal Content</p>
      </Modal>
    );

    const closeBtn = screen.getByRole('button', { name: 'Close modal' });
    await user.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <p>Modal Content</p>
      </Modal>
    );

    await user.keyboard('{Escape}');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when Escape key is pressed but modal is closed', async () => {
    const user = userEvent.setup();
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <p>Modal Content</p>
      </Modal>
    );

    await user.keyboard('{Escape}');
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <p>Modal Content</p>
      </Modal>
    );

    // Find the overlay element by looking for a class that contains 'overlay'
    const overlay = document.querySelector('div[class*="overlay"]');
    if (overlay) {
      fireEvent.click(overlay);
    } else {
      throw new Error('Overlay not found');
    }
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when overlay is clicked and closeOnOverlayClick is false', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} closeOnOverlayClick={false}>
        <p>Modal Content</p>
      </Modal>
    );

    const overlay = document.querySelector('div[class*="overlay"]');
    if (overlay) {
      fireEvent.click(overlay);
    } else {
      throw new Error('Overlay not found');
    }
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('does not call onClose when modal content is clicked', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <p>Modal Content</p>
      </Modal>
    );

    const content = screen.getByText('Modal Content');
    fireEvent.click(content);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('locks body scroll when opened and unlocks when closed', () => {
    const { rerender } = render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <p>Modal Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).not.toBe('hidden');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose}>
        <p>Modal Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={mockOnClose}>
        <p>Modal Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('unset');
  });

  it('unlocks body scroll when component is unmounted', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <p>Modal Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });
});
