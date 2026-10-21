import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLanguageStore } from '../../../store/useLanguageStore'
import { formatCompactEuro, formatEuroThousands } from './category-trend-formatters'
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

    it('notifies onTooltipHoverChange and stops event propagation to prevent data point interference', () => {
      const onTooltipHoverChange = vi.fn()
      const { container } = render(
        <CustomTrendTooltip
          active
          payload={mockPayload}
          label="Mar 25"
          formatCurrency={(v) => `€${v}`}
          t={useLanguageStore.getState().t}
          customCategories={[]}
          locale="en"
          onTooltipHoverChange={onTooltipHoverChange}
        />,
      )

      const tooltipContainer = container.firstChild as HTMLElement
      expect(tooltipContainer).toBeInTheDocument()

      // Entering tooltip notifies chart that tooltip is hovered
      fireEvent.mouseEnter(tooltipContainer)
      expect(onTooltipHoverChange).toHaveBeenCalledWith(true)

      // Moving mouse inside tooltip stops propagation and maintains hovered state
      const mouseMoveEvent = new MouseEvent('mousemove', { bubbles: true, cancelable: true })
      const stopSpy = vi.spyOn(mouseMoveEvent, 'stopPropagation')
      tooltipContainer.dispatchEvent(mouseMoveEvent)
      expect(stopSpy).toHaveBeenCalled()
      expect(onTooltipHoverChange).toHaveBeenCalledWith(true)

      // Leaving tooltip notifies chart that tooltip is no longer hovered
      fireEvent.mouseLeave(tooltipContainer)
      expect(onTooltipHoverChange).toHaveBeenCalledWith(false)
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

    const twentyFourMonthsData = Array.from({ length: 24 }, (_, i) => {
      const year = 2022 + Math.floor(i / 12)
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]
      return {
        month: `${monthNames[i % 12]} ${String(year).slice(-2)}`,
        Rent: 1000,
        Groceries: 400 + (i % 5) * 20,
      }
    })

    it('does not render timeline navigation toolbar or brush when data is small', () => {
      render(<CategoryTrend data={sampleMonthlyData} />)
      expect(screen.queryByRole('region', { name: 'Timeline' })).not.toBeInTheDocument()
      expect(screen.queryByTestId('timeline-brush')).not.toBeInTheDocument()
    })

    it('does not render timeline navigation toolbar or brush on desktop when data has fewer than 24 months', () => {
      render(<CategoryTrend data={twelveMonthsData} />)
      expect(screen.queryByRole('region', { name: 'Timeline' })).not.toBeInTheDocument()
      expect(screen.queryByTestId('timeline-brush')).not.toBeInTheDocument()
    })

    it('renders presets and slider on desktop when 24 or more months are present', () => {
      render(<CategoryTrend data={twentyFourMonthsData} />)
      expect(screen.getByRole('region', { name: 'Timeline' })).toBeInTheDocument()
      expect(screen.getByTestId('timeline-brush')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')

      // Step controls are covered by the slider on desktop
      expect(screen.queryByRole('button', { name: 'Zoom in' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Previous months' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Reset zoom' })).not.toBeInTheDocument()
    })

    it('allows selecting presets such as 3M, 6M and 1Y', () => {
      render(<CategoryTrend data={twentyFourMonthsData} />)

      const preset3M = screen.getByRole('button', { name: '3M' })
      fireEvent.click(preset3M)
      expect(screen.getByText(/^3 of 24 months/)).toBeInTheDocument()

      const preset6M = screen.getByRole('button', { name: '6M' })
      fireEvent.click(preset6M)
      expect(screen.getByText(/^6 of 24 months/)).toBeInTheDocument()

      const preset1Y = screen.getByRole('button', { name: '1Y' })
      fireEvent.click(preset1Y)
      expect(screen.getByText(/^12 of 24 months/)).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'All' }))
      expect(screen.queryByText(/of 24 months/)).not.toBeInTheDocument()
    })

    it('pans the window with the keyboard on the slider selection', () => {
      render(<CategoryTrend data={twentyFourMonthsData} />)
      fireEvent.click(screen.getByRole('button', { name: '3M' }))

      const brush = screen.getByTestId('timeline-brush')
      const panSlider = screen.getAllByRole('slider')[2]
      fireEvent.keyDown(panSlider, { key: 'ArrowLeft' })

      expect(brush).toHaveAttribute('data-start', '20')
      expect(brush).toHaveAttribute('data-end', '22')
    })

    it('allows opening and exiting full screen view', async () => {
      render(<CategoryTrend data={twentyFourMonthsData} />)

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

    it('does not render timeline navigation toolbar or brush on mobile when data has fewer than 12 months', () => {
      act(() => {
        window.innerWidth = 480
        window.dispatchEvent(new Event('resize'))
      })

      const elevenMonthsData = twelveMonthsData.slice(0, 11)
      render(<CategoryTrend data={elevenMonthsData} />)

      expect(screen.queryByRole('region', { name: 'Timeline' })).not.toBeInTheDocument()
      expect(screen.queryByTestId('timeline-brush')).not.toBeInTheDocument()

      // Reset window width back to desktop
      act(() => {
        window.innerWidth = 1024
        window.dispatchEvent(new Event('resize'))
      })
    })

    it('shows full toolbar and position indicator instead of the slider on mobile', () => {
      act(() => {
        window.innerWidth = 480
        window.dispatchEvent(new Event('resize'))
      })

      render(<CategoryTrend data={twelveMonthsData} />)

      // Timeline toolbar keeps accessible step controls on mobile
      expect(screen.getByRole('region', { name: 'Timeline' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument()
      expect(screen.getByTestId('timeline-position-indicator')).toBeInTheDocument()

      // Brush is hidden on mobile
      expect(screen.queryByTestId('timeline-brush')).not.toBeInTheDocument()

      // Reset window width back to desktop
      act(() => {
        window.innerWidth = 1024
        window.dispatchEvent(new Event('resize'))
      })
    })
  })

  describe('formatCompactEuro', () => {
    it('formats 0 as €0', () => {
      expect(formatCompactEuro(0)).toBe('€0')
      expect(formatEuroThousands(0)).toBe('€0')
    })

    it('formats low values (< 1000) as exact euro amounts without 0.0k', () => {
      expect(formatCompactEuro(5)).toBe('€5')
      expect(formatCompactEuro(10)).toBe('€10')
      expect(formatCompactEuro(15)).toBe('€15')
      expect(formatCompactEuro(20)).toBe('€20')
      expect(formatCompactEuro(50)).toBe('€50')
      expect(formatCompactEuro(150)).toBe('€150')
      expect(formatCompactEuro(999)).toBe('€999')
    })

    it('handles decimal values below 1000 cleanly without trailing zeros', () => {
      expect(formatCompactEuro(0.5)).toBe('€0.5')
      expect(formatCompactEuro(2.5)).toBe('€2.5')
      expect(formatCompactEuro(12.5)).toBe('€12.5')
      expect(formatCompactEuro(0.25)).toBe('€0.25')
    })

    it('formats thousands cleanly with k suffix', () => {
      expect(formatCompactEuro(1000)).toBe('€1k')
      expect(formatCompactEuro(1200)).toBe('€1.2k')
      expect(formatCompactEuro(1500)).toBe('€1.5k')
      expect(formatCompactEuro(10000)).toBe('€10k')
      expect(formatCompactEuro(25400)).toBe('€25.4k')
      expect(formatCompactEuro(100000)).toBe('€100k')
      expect(formatCompactEuro(999000)).toBe('€999k')
    })

    it('formats millions cleanly with M suffix', () => {
      expect(formatCompactEuro(1000000)).toBe('€1M')
      expect(formatCompactEuro(2500000)).toBe('€2.5M')
    })

    it('handles negative values correctly', () => {
      expect(formatCompactEuro(-15)).toBe('-€15')
      expect(formatCompactEuro(-1500)).toBe('-€1.5k')
    })
  })
})
