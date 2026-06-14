import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DatePicker } from './DatePicker';

// Mock dependencies
vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: () => ({
    locale: 'en-US',
    t: {
      selectDatePlaceholder: 'Select date...',
      holidays: {
        'New Year': 'New Year',
      }
    }
  })
}));

vi.mock('../../../utils/holidays', () => ({
  getPublicHolidayName: vi.fn((date) => {
    if (date.getMonth() === 0 && date.getDate() === 1) return 'New Year';
    return null;
  })
}));

describe('DatePicker', () => {
  beforeEach(() => {
    // Mock system time to ensure consistent tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-10-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders input with placeholder when no value is provided', () => {
    render(<DatePicker value="" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Select date...');
    expect(input).toHaveValue('');
  });

  it('renders input with provided value', () => {
    render(<DatePicker value="2023-10-15" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('2023-10-15');
  });

  it('opens dropdown when input is clicked', () => {
    render(<DatePicker value="" onChange={vi.fn()} />);
    const inputWrapper = screen.getByRole('textbox').parentElement;
    fireEvent.click(inputWrapper!);

    // Calendar should be visible, showing current month (Oct 2023)
    expect(screen.getByText('October 2023')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <DatePicker value="" onChange={vi.fn()} />
      </div>
    );

    const inputWrapper = screen.getByRole('textbox').parentElement;
    fireEvent.click(inputWrapper!);
    expect(screen.getByText('October 2023')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByText('October 2023')).not.toBeInTheDocument();
  });

  it('calls onChange and closes dropdown when a date is selected', () => {
    const handleChange = vi.fn();
    render(<DatePicker value="" onChange={handleChange} />);

    const inputWrapper = screen.getByRole('textbox').parentElement;
    fireEvent.click(inputWrapper!);

    // Click on the 20th
    const dayElement = screen.getByText('20');
    fireEvent.click(dayElement);

    expect(handleChange).toHaveBeenCalledWith('2023-10-20');
    expect(screen.queryByText('October 2023')).not.toBeInTheDocument();
  });

  it('clears date when clear button is clicked', () => {
    const handleChange = vi.fn();
    render(<DatePicker value="2023-10-15" onChange={handleChange} />);

    // The clear button should be present
    const clearButton = screen.getByTitle('Clear date');
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('navigates to previous and next month', () => {
    render(<DatePicker value="2023-10-15" onChange={vi.fn()} />);

    const inputWrapper = screen.getByRole('textbox').parentElement;
    fireEvent.click(inputWrapper!);

    expect(screen.getByText('October 2023')).toBeInTheDocument();

    // Previous month buttons (we need to be specific or use indexing)
    const [prevBtn, nextBtn] = screen.getAllByRole('button').filter(b => b.className.includes('nav-button'));

    fireEvent.click(prevBtn);
    expect(screen.getByText('September 2023')).toBeInTheDocument();

    fireEvent.click(nextBtn);
    expect(screen.getByText('October 2023')).toBeInTheDocument();
  });

  it('correctly applies today and selected classes', () => {
    // Current time is mocked to Oct 15, 2023. Let's select Oct 20, 2023
    render(<DatePicker value="2023-10-20" onChange={vi.fn()} />);

    const inputWrapper = screen.getByRole('textbox').parentElement;
    fireEvent.click(inputWrapper!);

    const todayElement = screen.getByText('15');
    const selectedElement = screen.getByText('20');

    expect(todayElement.className).toContain('today');
    expect(selectedElement.className).toContain('selected');
  });

  it('correctly identifies future dates and sundays', () => {
    render(<DatePicker value="" onChange={vi.fn()} />);

    const inputWrapper = screen.getByRole('textbox').parentElement;
    fireEvent.click(inputWrapper!);

    // Oct 15 is today. Oct 16 is future. Oct 22 is Sunday.
    const futureElement = screen.getByText('16');
    const sundayElement = screen.getByText('22');

    expect(futureElement.className).toContain('future');
    expect(sundayElement.className).toContain('sundayText');
  });

  it('correctly applies holiday classes and title', () => {
    render(<DatePicker value="2023-01-15" onChange={vi.fn()} />);

    const inputWrapper = screen.getByRole('textbox').parentElement;
    fireEvent.click(inputWrapper!);

    const holidayElement = screen.getByText('1');

    expect(holidayElement.className).toContain('sundayText');
    expect(holidayElement).toHaveAttribute('title', 'New Year');
  });
});
