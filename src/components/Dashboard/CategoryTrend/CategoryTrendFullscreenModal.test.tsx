import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLanguageStore } from '../../../store/useLanguageStore'
import { CategoryTrendFullscreenModal } from './CategoryTrendFullscreenModal'

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div>Bar</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div>Area</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  Tooltip: () => <div>Tooltip</div>,
}))

const sampleData = [
  { month: 'Jan 25', Rent: 1000, Groceries: 400 },
  { month: 'Feb 25', Rent: 1000, Groceries: 450 },
  { month: 'Mar 25', Rent: 1000, Groceries: 500 },
  { month: 'Apr 25', Rent: 1000, Groceries: 550 },
]

const sampleSummaries = [
  { month: 'Jan 25', total: 1400 },
  { month: 'Feb 25', total: 1450 },
  { month: 'Mar 25', total: 1500 },
  { month: 'Apr 25', total: 1550 },
]

describe('CategoryTrendFullscreenModal', () => {
  beforeEach(() => {
    useLanguageStore.getState().setLocale('en')
  })

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    data: sampleData,
    visibleData: sampleData,
    monthSummaries: sampleSummaries,
    categories: ['Rent', 'Groceries'],
    customCategories: [],
    startIndex: 0,
    endIndex: 3,
    visibleCount: 4,
    totalCount: 4,
    isZoomed: false,
    isAtStart: true,
    isAtEnd: true,
    isAtMinZoom: false,
    isAtMaxZoom: true,
    activePreset: null,
    startMonthLabel: 'Jan 25',
    endMonthLabel: 'Apr 25',
    activeCategory: null,
    selectedCategory: null,
    hoveredCategory: null,
    viewMode: 'stacked' as const,
    monthlyAverage: 1475,
    peakMonth: { month: 'Apr 25', amount: 1550 },
    canZoomAndNavigate: true,
    onRangeChange: vi.fn(),
    onScrub: vi.fn(),
    onSelectPreset: vi.fn(),
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onPanEarlier: vi.fn(),
    onPanLater: vi.fn(),
    onResetZoom: vi.fn(),
    onViewModeChange: vi.fn(),
    onCategoryHover: vi.fn(),
    onCategorySelect: vi.fn(),
    onClearCategorySelect: vi.fn(),
  }

  it('does not render when isOpen is false', () => {
    render(<CategoryTrendFullscreenModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders modal dialog with header, stat pills, chart, and toolbar when isOpen is true', () => {
    render(<CategoryTrendFullscreenModal {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()

    // Title and stats
    expect(screen.getByRole('heading', { level: 2, name: 'Spending by Category' })).toBeInTheDocument()
    expect(screen.getByText('Monthly Average')).toBeInTheDocument()
    expect(screen.getByText('Peak Month')).toBeInTheDocument()

    // Exit Fullscreen button
    const exitBtn = screen.getByRole('button', { name: /Exit Full Screen/i })
    expect(exitBtn).toBeInTheDocument()
  })

  it('calls onClose when clicking exit fullscreen button', () => {
    const onClose = vi.fn()
    render(<CategoryTrendFullscreenModal {...defaultProps} onClose={onClose} />)

    const exitBtn = screen.getByRole('button', { name: /Exit Full Screen/i })
    fireEvent.click(exitBtn)

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when pressing Escape key', () => {
    const onClose = vi.fn()
    render(<CategoryTrendFullscreenModal {...defaultProps} onClose={onClose} />)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onViewModeChange when switching view modes', () => {
    const onViewModeChange = vi.fn()
    render(<CategoryTrendFullscreenModal {...defaultProps} onViewModeChange={onViewModeChange} />)

    const trendBtn = screen.getByRole('button', { name: 'Trend' })
    fireEvent.click(trendBtn)

    expect(onViewModeChange).toHaveBeenCalledWith('area')
  })
})
