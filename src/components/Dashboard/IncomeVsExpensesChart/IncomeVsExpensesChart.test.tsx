import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { IncomeVsExpensesChart } from './IncomeVsExpensesChart'

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  ComposedChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
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
      },
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

const sampleData = [
  { name: 'Jan 24', rawMonth: '2024-01', income: 3000, expenses: 1500 },
  { name: 'Feb 24', rawMonth: '2024-02', income: 3500, expenses: 2000 },
]

describe('IncomeVsExpensesChart', () => {
  it('renders title and chart when data is present', () => {
    render(<IncomeVsExpensesChart monthlyData={sampleData} />)

    expect(screen.getByText('Income vs Expenses')).toBeInTheDocument()
    expect(screen.getByText('Jan 24 – Feb 24')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('renders summary metric pill correctly', () => {
    render(<IncomeVsExpensesChart monthlyData={sampleData} totalIncome={6500} totalExpenses={3500} />)

    // Net Saved +€3,000.00
    expect(screen.getByTitle('Net Saved')).toBeInTheDocument()
  })

  it('renders deficit pill when expenses exceed income', () => {
    const deficitData = [
      { name: 'Jan 24', rawMonth: '2024-01', income: 1000, expenses: 2500 },
    ]
    render(<IncomeVsExpensesChart monthlyData={deficitData} totalIncome={1000} totalExpenses={2500} />)

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
})
