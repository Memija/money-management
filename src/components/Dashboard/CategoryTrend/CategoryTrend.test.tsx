import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLanguageStore } from '../../../store/useLanguageStore'
import { CategoryTrend, CustomTrendTooltip } from './CategoryTrend'

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
  Brush: (props: { startIndex?: number; endIndex?: number }) => (
    <div data-testid="timeline-brush" data-start={props?.startIndex} data-end={props?.endIndex}>
      Brush
    </div>
  ),
}))

const sampleMonthlyData = [
  { month: 'Jan 25', Rent: 1000, Groceries: 400, Utilities: 150 },
  { month: 'Feb 25', Rent: 1000, Groceries: 450, Utilities: 120 },
  { month: 'Mar 25', Rent: 1000, Groceries: 500, Utilities: 200 },
]

describe('CategoryTrend', () => {
  beforeEach(() => {
    useLanguageStore.getState().setLocale('en')
  })

  it('renders Spending by Category header, months count and stat pills', () => {
    render(<CategoryTrend data={sampleMonthlyData} />)

    expect(screen.getByText('Spending by Category')).toBeInTheDocument()
    // Subtitle has 3 months • 3 categories
    expect(screen.getByText(/3 months • 3 categories/)).toBeInTheDocument()
    // Stat labels
    expect(screen.getByText('Monthly Average')).toBeInTheDocument()
    expect(screen.getByText('Peak Month')).toBeInTheDocument()
    // Peak month display
    expect(screen.getByText(/Mar 25/)).toBeInTheDocument()
  })

  it('allows toggling between Stacked and Trend view modes', () => {
    render(<CategoryTrend data={sampleMonthlyData} />)

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()

    const trendBtn = screen.getByRole('button', { name: 'Trend' })
    fireEvent.click(trendBtn)

    expect(screen.getByTestId('area-chart')).toBeInTheDocument()

    const stackedBtn = screen.getByRole('button', { name: 'Stacked' })
    fireEvent.click(stackedBtn)

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('handles category spotlighting when clicking legend pill', () => {
    render(<CategoryTrend data={sampleMonthlyData} />)

    const groceriesPill = screen.getByRole('button', { name: 'Groceries' })
    fireEvent.click(groceriesPill)

    // Reset pill should now appear
    const resetBtn = screen.getByRole('button', { name: 'All Categories' })
    expect(resetBtn).toBeInTheDocument()

    // Clicking reset should clear spotlight
    fireEvent.click(resetBtn)
    expect(screen.queryByRole('button', { name: 'All Categories' })).not.toBeInTheDocument()
  })

  it('renders localized title in German', () => {
    useLanguageStore.getState().setLocale('de')
    render(<CategoryTrend data={sampleMonthlyData} />)

    expect(screen.getByText('Ausgaben nach Kategorie')).toBeInTheDocument()
    expect(screen.getByText('Monatsdurchschnitt')).toBeInTheDocument()
    expect(screen.getByText('Spitzenmonat')).toBeInTheDocument()
  })

  it('does not occupy full row when data is small', () => {
    const { container } = render(<CategoryTrend data={sampleMonthlyData} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).not.toContain('fullWidth')
  })

  it('occupies full row automatically on desktop when lots of months are present', () => {
    const lotsOfMonthsData = [
      { month: 'Jan 25', Rent: 1000 },
      { month: 'Feb 25', Rent: 1000 },
      { month: 'Mar 25', Rent: 1000 },
      { month: 'Apr 25', Rent: 1000 },
      { month: 'May 25', Rent: 1000 },
      { month: 'Jun 25', Rent: 1000 },
    ]
    const { container } = render(<CategoryTrend data={lotsOfMonthsData} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('fullWidth')
  })

  it('occupies full row automatically on desktop when lots of categories are present', () => {
    const lotsOfCategoriesData = [
      {
        month: 'Jan 25',
        Rent: 1000,
        Groceries: 400,
        Utilities: 100,
        Transport: 50,
        Entertainment: 80,
        Shopping: 120,
      },
    ]
    const { container } = render(<CategoryTrend data={lotsOfCategoriesData} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('fullWidth')
  })

  it('respects explicit fullWidth prop', () => {
    const { container: container1 } = render(
      <CategoryTrend data={sampleMonthlyData} fullWidth={true} />,
    )
    expect((container1.firstChild as HTMLElement).className).toContain('fullWidth')

    const lotsOfMonthsData = [
      { month: 'Jan 25', Rent: 1000 },
      { month: 'Feb 25', Rent: 1000 },
      { month: 'Mar 25', Rent: 1000 },
      { month: 'Apr 25', Rent: 1000 },
      { month: 'May 25', Rent: 1000 },
      { month: 'Jun 25', Rent: 1000 },
    ]
    const { container: container2 } = render(
      <CategoryTrend data={lotsOfMonthsData} fullWidth={false} />,
    )
    expect((container2.firstChild as HTMLElement).className).not.toContain('fullWidth')
  })

  describe('CustomTrendTooltip interactivity and shading', () => {
    const mockPayload = [
      { name: 'Rent', value: 1000, color: '#6366f1', dataKey: 'Rent' },
      { name: 'Groceries', value: 400, color: '#f59e0b', dataKey: 'Groceries' },
      { name: 'Utilities', value: 150, color: '#10b981', dataKey: 'Utilities' },
    ]

    it('displays active category in full highlight and dims other categories to a different shade', () => {
      const { container } = render(
        <CustomTrendTooltip
          active
          payload={mockPayload}
          label="Mar 25"
          formatCurrency={(v) => `€${v}`}
          t={useLanguageStore.getState().t}
          customCategories={[]}
          locale="en"
          activeCategory="Groceries"
        />,
      )

      const rows = container.querySelectorAll('[role="button"]')
      expect(rows).toHaveLength(3)

      // Rent row (dimmed)
      expect(rows[0].className).toContain('tooltipRowDimmed')
      expect(rows[0].className).not.toContain('tooltipRowActive')

      // Groceries row (active/highlighted)
      expect(rows[1].className).toContain('tooltipRowActive')
      expect(rows[1].className).not.toContain('tooltipRowDimmed')

      // Utilities row (dimmed)
      expect(rows[2].className).toContain('tooltipRowDimmed')
      expect(rows[2].className).not.toContain('tooltipRowActive')
    })

    it('triggers onCategoryHover when hovering over modal items', () => {
      const onCategoryHover = vi.fn()
      render(
        <CustomTrendTooltip
          active
          payload={mockPayload}
          label="Mar 25"
          formatCurrency={(v) => `€${v}`}
          t={useLanguageStore.getState().t}
          customCategories={[]}
          locale="en"
          onCategoryHover={onCategoryHover}
        />,
      )

      const rentButton = screen.getByRole('button', { name: /Rent:/i })
      fireEvent.mouseEnter(rentButton)
      expect(onCategoryHover).toHaveBeenCalledWith('Rent')

      fireEvent.mouseLeave(rentButton)
      expect(onCategoryHover).toHaveBeenCalledWith(null)
    })

    it('triggers onCategoryClick when clicking or pressing Enter on modal items', () => {
      const onCategoryClick = vi.fn()
      render(
        <CustomTrendTooltip
          active
          payload={mockPayload}
          label="Mar 25"
          formatCurrency={(v) => `€${v}`}
          t={useLanguageStore.getState().t}
          customCategories={[]}
          locale="en"
          onCategoryClick={onCategoryClick}
        />,
      )

      const rentButton = screen.getByRole('button', { name: /Rent:/i })
      fireEvent.click(rentButton)
      expect(onCategoryClick).toHaveBeenCalledWith('Rent')

      fireEvent.keyDown(rentButton, { key: 'Enter' })
      expect(onCategoryClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('timeline zooming and navigation', () => {
    const twelveMonthsData = [
      { month: 'Jan 24', Rent: 1000, Groceries: 400 },
      { month: 'Feb 24', Rent: 1000, Groceries: 420 },
      { month: 'Mar 24', Rent: 1000, Groceries: 450 },
      { month: 'Apr 24', Rent: 1000, Groceries: 380 },
      { month: 'May 24', Rent: 1000, Groceries: 410 },
      { month: 'Jun 24', Rent: 1000, Groceries: 500 },
      { month: 'Jul 24', Rent: 1000, Groceries: 460 },
      { month: 'Aug 24', Rent: 1000, Groceries: 490 },
      { month: 'Sep 24', Rent: 1000, Groceries: 430 },
      { month: 'Oct 24', Rent: 1000, Groceries: 440 },
      { month: 'Nov 24', Rent: 1000, Groceries: 470 },
      { month: 'Dec 24', Rent: 1000, Groceries: 600 },
    ]

    it('does not render timeline navigation toolbar or brush when data is small', () => {
      render(<CategoryTrend data={sampleMonthlyData} />)
      expect(screen.queryByRole('region', { name: 'Timeline' })).not.toBeInTheDocument()
      expect(screen.queryByTestId('timeline-brush')).not.toBeInTheDocument()
    })

    it('renders timeline navigation toolbar and brush when lots of data points are present', () => {
      render(<CategoryTrend data={twelveMonthsData} />)
      expect(screen.getByRole('region', { name: 'Timeline' })).toBeInTheDocument()
      expect(screen.getByTestId('timeline-brush')).toBeInTheDocument()
      expect(screen.getByText('12 of 12 months')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Previous months' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Next months' })).toBeInTheDocument()
    })

    it('allows zooming in, zooming out and resetting zoom', () => {
      render(<CategoryTrend data={twelveMonthsData} />)

      const zoomInBtn = screen.getByRole('button', { name: 'Zoom in' })
      fireEvent.click(zoomInBtn)

      // Reset button should now be visible
      const resetBtn = screen.getByRole('button', { name: 'Reset zoom' })
      expect(resetBtn).toBeInTheDocument()

      // Subtitle and pill update to show zoomed range
      expect(screen.getAllByText(/of 12 months/).length).toBeGreaterThanOrEqual(1)

      // Resetting zoom restores 12 of 12 months
      fireEvent.click(resetBtn)
      expect(screen.getByText('12 of 12 months')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Reset zoom' })).not.toBeInTheDocument()
    })

    it('allows selecting presets such as 3M and 6M', () => {
      render(<CategoryTrend data={twelveMonthsData} />)

      const preset3M = screen.getByRole('button', { name: '3M' })
      fireEvent.click(preset3M)
      expect(screen.getByText('3 of 12 months')).toBeInTheDocument()

      const preset6M = screen.getByRole('button', { name: '6M' })
      fireEvent.click(preset6M)
      expect(screen.getByText('6 of 12 months')).toBeInTheDocument()
    })

    it('allows panning earlier and later through the timeline', () => {
      render(<CategoryTrend data={twelveMonthsData} />)

      // Choose 3M (starts at Oct-Dec 24, so is at end)
      fireEvent.click(screen.getByRole('button', { name: '3M' }))
      const nextBtn = screen.getByRole('button', { name: 'Next months' })
      expect(nextBtn).toBeDisabled()

      const prevBtn = screen.getByRole('button', { name: 'Previous months' })
      expect(prevBtn).not.toBeDisabled()

      fireEvent.click(prevBtn)
      // Now it's not at the end anymore, nextBtn becomes enabled
      expect(nextBtn).not.toBeDisabled()
    })

    it('allows opening and exiting full screen view', () => {
      render(<CategoryTrend data={twelveMonthsData} />)

      const fullscreenBtn = screen.getByTestId('category-trend-fullscreen-btn')
      expect(fullscreenBtn).toBeInTheDocument()

      // Fullscreen modal is not open initially
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      // Click to open fullscreen
      fireEvent.click(fullscreenBtn)

      // Dialog is now rendered
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      // Exit fullscreen via exit button
      const exitBtn = screen.getByRole('button', { name: /Exit Full Screen/i })
      fireEvent.click(exitBtn)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })
})

