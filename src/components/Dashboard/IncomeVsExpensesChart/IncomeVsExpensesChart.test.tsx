import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  IncomeVsExpensesChart,
  MIN_MONTHS_ZOOM_DESKTOP,
  MIN_MONTHS_ZOOM_MOBILE,
} from './IncomeVsExpensesChart'

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div>Area</div>,
  Bar: () => <div>Bar</div>,
  Line: () => <div>Line</div>,
  Legend: () => <div>Legend</div>,
  ReferenceLine: () => <div>ReferenceLine</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  Tooltip: () => <div>Tooltip</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
}))

// Mock language store
vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      t: {
        incomeVsExpenses: 'Income vs Expenses',
        income: 'Income',
        expenses: 'Expenses',
        totalIncome: 'Total Income',
        totalExpenses: 'Total Expenses',
        netSavedLabel: 'Net Saved',
        netDeficitLabel: 'Net Deficit',
        noTransactionsInPeriod: 'No data available for this period.',
        viewMonthly: 'Monthly',
        viewCumulative: 'Cumulative',
        cumulativeBalance: 'Cumulative Balance',
        timelineRange: 'Timeline',
        showingMonths: '{visible} of {total} months',
        preset3M: '3M',
        preset6M: '6M',
        preset1Y: '1Y',
        presetAll: 'All',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        panEarlier: 'Previous months',
        panLater: 'Next months',
        resetZoom: 'Reset',
      },
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

const sampleData = [
  { name: 'Jan 24', rawMonth: '2024-01', income: 3000, expenses: 1500 },
  { name: 'Feb 24', rawMonth: '2024-02', income: 3500, expenses: 2000 },
]

const createMonthsData = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    const year = 2022 + Math.floor(i / 12)
    const monthNum = (i % 12) + 1
    const rawMonth = `${year}-${String(monthNum).padStart(2, '0')}`
    return {
      name: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i % 12]} ${String(year).slice(-2)}`,
      rawMonth,
      income: 3000 + (i % 5) * 100,
      expenses: 2000 + (i % 4) * 80,
    }
  })
}

describe('IncomeVsExpensesChart', () => {
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    window.innerWidth = 1024
  })

  afterEach(() => {
    window.innerWidth = originalInnerWidth
  })

  it('renders title and chart when data is present', () => {
    render(<IncomeVsExpensesChart monthlyData={sampleData} />)

    expect(screen.getByText('Income vs Expenses')).toBeInTheDocument()
    expect(screen.getByText('Jan 24 – Feb 24')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('renders summary metric pill correctly', () => {
    render(
      <IncomeVsExpensesChart monthlyData={sampleData} totalIncome={6500} totalExpenses={3500} />,
    )

    // Net Saved +€3,000.00
    expect(screen.getByTitle('Net Saved')).toBeInTheDocument()
  })

  it('renders deficit pill when expenses exceed income', () => {
    const deficitData = [{ name: 'Jan 24', rawMonth: '2024-01', income: 1000, expenses: 2500 }]
    render(
      <IncomeVsExpensesChart monthlyData={deficitData} totalIncome={1000} totalExpenses={2500} />,
    )

    expect(screen.getByTitle('Net Deficit')).toBeInTheDocument()
  })

  it('toggles between monthly and cumulative view', async () => {
    render(<IncomeVsExpensesChart monthlyData={sampleData} />)

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Cumulative' }))

    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
  })

  it('renders empty state message when monthlyData is empty', () => {
    render(<IncomeVsExpensesChart monthlyData={[]} />)

    expect(screen.getByText('No data available for this period.')).toBeInTheDocument()
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
  })

  it('does not render zoom toolbar or slider on desktop when data has fewer than 24 months', () => {
    // 12 months is valid for mobile, but on desktop (1024px) requires 24 months
    render(<IncomeVsExpensesChart monthlyData={createMonthsData(12)} />)

    expect(screen.queryByRole('region', { name: 'Timeline' })).not.toBeInTheDocument()
    expect(screen.queryByTestId('timeline-brush')).not.toBeInTheDocument()
  })

  it('renders zoom toolbar and timeline slider scrubber on desktop when data has 24 or more months', () => {
    render(<IncomeVsExpensesChart monthlyData={createMonthsData(MIN_MONTHS_ZOOM_DESKTOP)} />)

    expect(screen.getByRole('region', { name: 'Timeline' })).toBeInTheDocument()
    expect(screen.getByTestId('timeline-brush')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3M' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '6M' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1Y' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
  })

  it('allows zooming in, zooming out, selecting presets, and resetting zoom on desktop with 24 months', async () => {
    const user = userEvent.setup()
    const data24 = createMonthsData(24)
    render(<IncomeVsExpensesChart monthlyData={data24} />)

    // Initially All (24 of 24 months)
    expect(screen.getByText('24 of 24 months')).toBeInTheDocument()

    // Select 3M preset
    const preset3M = screen.getByRole('button', { name: '3M' })
    await user.click(preset3M)

    // Now zoomed in to 3 months (3 of 24 months)
    expect(screen.getByText('3 of 24 months')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()

    // Select 1Y preset
    const preset1Y = screen.getByRole('button', { name: '1Y' })
    await user.click(preset1Y)
    expect(screen.getByText('12 of 24 months')).toBeInTheDocument()

    // Reset zoom
    const resetBtn = screen.getByRole('button', { name: 'Reset' })
    await user.click(resetBtn)

    expect(screen.getByText('24 of 24 months')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()

    // Zoom in via ZoomIn button
    const zoomInBtn = screen.getByRole('button', { name: 'Zoom in' })
    await user.click(zoomInBtn)
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()

    // Zoom out via ZoomOut button
    const zoomOutBtn = screen.getByRole('button', { name: 'Zoom out' })
    await user.click(zoomOutBtn)
  })

  it('allows panning earlier and later when zoomed', async () => {
    const user = userEvent.setup()
    const data24 = createMonthsData(24)
    render(<IncomeVsExpensesChart monthlyData={data24} />)

    // Select 3M
    await user.click(screen.getByRole('button', { name: '3M' }))

    const panEarlierBtn = screen.getByRole('button', { name: 'Previous months' })
    expect(panEarlierBtn).not.toBeDisabled()

    await user.click(panEarlierBtn)
    // Slices shifted earlier
    expect(screen.getByRole('button', { name: 'Next months' })).not.toBeDisabled()
  })

  it('does not offer zoom on mobile when data has fewer than 12 months', () => {
    window.innerWidth = 500
    render(<IncomeVsExpensesChart monthlyData={createMonthsData(11)} />)

    expect(screen.queryByRole('region', { name: 'Timeline' })).not.toBeInTheDocument()
    expect(screen.queryByTestId('timeline-brush')).not.toBeInTheDocument()
  })

  it('offers zoom on mobile when data has 12 or more months (toolbar shown, slider hidden)', () => {
    window.innerWidth = 500
    render(<IncomeVsExpensesChart monthlyData={createMonthsData(MIN_MONTHS_ZOOM_MOBILE)} />)

    // Toolbar is offered
    expect(screen.getByRole('region', { name: 'Timeline' })).toBeInTheDocument()
    expect(screen.getByText('12 of 12 months')).toBeInTheDocument()

    // TimelineSlider scrubber is hidden on mobile to conserve screen space
    expect(screen.queryByTestId('timeline-brush')).not.toBeInTheDocument()
  })
})

