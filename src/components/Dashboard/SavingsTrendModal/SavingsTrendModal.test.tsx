import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MonthlyEntry } from '../../../hooks/useAnalytics'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { SavingsTrendModal } from './SavingsTrendModal'

// Mock framer-motion to avoid animation issues and unneeded timers in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({
        children,
        ...props
      }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => {
        const validProps = { ...props }
        delete validProps.initial
        delete validProps.animate
        delete validProps.exit
        delete validProps.transition
        return <div {...validProps}>{children}</div>
      },
      tr: ({
        children,
        ...props
      }: React.HTMLAttributes<HTMLTableRowElement> & Record<string, unknown>) => {
        const validProps = { ...props }
        delete validProps.initial
        delete validProps.animate
        delete validProps.exit
        delete validProps.transition
        return <tr {...validProps}>{children}</tr>
      },
    },
  }
})

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <svg data-testid="area-chart">{children}</svg>
  ),
  Area: ({
    dot,
    activeDot,
  }: {
    dot?: (props: { cx?: number; cy?: number; payload?: { saved: number }; key?: React.Key | null }) => React.ReactNode
    activeDot?: (props: { cx?: number; cy?: number; payload?: { saved: number }; key?: React.Key | null }) => React.ReactNode
  }) => (
    <g data-testid="area">
      {typeof dot === 'function' && (
        <g data-testid="area-dots">
          {dot({ cx: 10, cy: 10, payload: { saved: 500 }, key: 'dot-pos' })}
          {dot({ cx: 20, cy: 20, payload: { saved: -300 }, key: 'dot-neg' })}
          {dot({ cx: undefined, cy: undefined })}
        </g>
      )}
      {typeof activeDot === 'function' && (
        <g data-testid="area-active-dots">
          {activeDot({ cx: 15, cy: 15, payload: { saved: 500 }, key: 'active-pos' })}
          {activeDot({ cx: 25, cy: 25, payload: { saved: -300 }, key: 'active-neg' })}
          {activeDot({ cx: undefined, cy: undefined })}
        </g>
      )}
    </g>
  ),
  Tooltip: ({ content }: { content?: React.ReactElement | React.ComponentType<unknown> }) => (
    <div data-testid="chart-tooltip-container">
      {React.isValidElement(content) && (
        <>
          <div data-testid="tooltip-active-positive">
            {React.cloneElement(content as React.ReactElement<{
              active?: boolean
              payload?: Array<{ value: number; name: string; color: string }>
              label?: string
            }>, {
              active: true,
              payload: [{ value: 750, name: 'saved', color: '#10b981' }],
              label: 'Feb 24',
            })}
          </div>
          <div data-testid="tooltip-active-negative">
            {React.cloneElement(content as React.ReactElement<{
              active?: boolean
              payload?: Array<{ value: number; name: string; color: string }>
              label?: string
            }>, {
              active: true,
              payload: [{ value: -400, name: 'saved', color: '#f43f5e' }],
              label: 'Jan 24',
            })}
          </div>
          <div data-testid="tooltip-inactive">
            {React.cloneElement(content as React.ReactElement<{
              active?: boolean
              payload?: Array<{ value: number; name: string; color: string }>
              label?: string
            }>, {
              active: false,
              payload: [],
              label: 'Mar 24',
            })}
          </div>
        </>
      )}
    </div>
  ),
  CartesianGrid: () => <g data-testid="cartesian-grid" />,
  XAxis: () => <g data-testid="x-axis" />,
  YAxis: ({ tickFormatter }: { tickFormatter?: (v: number) => string }) => (
    <g data-testid="y-axis">
      {tickFormatter && <text data-testid="y-axis-tick">{tickFormatter(1000)}</text>}
    </g>
  ),
}))

const sampleMonthlyData: MonthlyEntry[] = [
  { name: 'Jan 24', rawMonth: '2024-01', income: 3000, expenses: 2000 },
  { name: 'Feb 24', rawMonth: '2024-02', income: 3500, expenses: 1500 },
  { name: 'Mar 24', rawMonth: '2024-03', income: 2800, expenses: 3200 },
]

describe('SavingsTrendModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    monthlyData: sampleMonthlyData,
    totalIncome: 9300,
    totalExpenses: 6700,
    savingsRate: 28,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useLanguageStore.getState().setLocale('en')
  })

  describe('Visibility and Modal Controls', () => {
    it('does not render modal content when isOpen is false', () => {
      render(<SavingsTrendModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Savings Trend')).not.toBeInTheDocument()
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
    })

    it('renders modal with title when isOpen is true', () => {
      render(<SavingsTrendModal {...defaultProps} />)

      expect(screen.getByText('Savings Trend')).toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<SavingsTrendModal {...defaultProps} />)

      const closeBtn = screen.getByRole('button', { name: 'Close modal' })
      await user.click(closeBtn)

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Escape key is pressed', async () => {
      const user = userEvent.setup()
      render(<SavingsTrendModal {...defaultProps} />)

      await user.keyboard('{Escape}')

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Empty State', () => {
    it('renders empty message and hides chart and table when monthlyData is empty', () => {
      render(
        <SavingsTrendModal
          {...defaultProps}
          monthlyData={[]}
          totalIncome={0}
          totalExpenses={0}
          savingsRate={0}
        />
      )

      const emptyMessage = useLanguageStore.getState().t.noTransactionsInPeriod
      expect(screen.getByText(emptyMessage)).toBeInTheDocument()
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('Hero Summary', () => {
    it('displays positive net saved with emerald styling and savings rate', () => {
      render(
        <SavingsTrendModal
          {...defaultProps}
          totalIncome={5000}
          totalExpenses={3000}
          savingsRate={40}
        />
      )

      const hero = document.querySelector('[class*="hero"]')
      expect(hero).toBeInTheDocument()
      expect(hero?.className).toContain('hero-emerald')

      const heroScope = within(hero as HTMLElement)
      expect(heroScope.getByText('Net Saved')).toBeInTheDocument()
      expect(heroScope.getByText(/\+.*2,000/)).toBeInTheDocument()
      expect(heroScope.getByText('40%')).toBeInTheDocument()
    })

    it('displays net deficit with rose styling and negative rate', () => {
      render(
        <SavingsTrendModal
          {...defaultProps}
          totalIncome={2000}
          totalExpenses={3500}
          savingsRate={-75}
        />
      )

      const hero = document.querySelector('[class*="hero"]')
      expect(hero).toBeInTheDocument()
      expect(hero?.className).toContain('hero-rose')

      const heroScope = within(hero as HTMLElement)
      expect(heroScope.getByText('Net Deficit')).toBeInTheDocument()
      expect(heroScope.getByText(/-.*1,500/)).toBeInTheDocument()
      expect(heroScope.getByText('-75%')).toBeInTheDocument()
    })

    it('shows multiplier tooltip in hero when savingsRate is <= -100', () => {
      render(
        <SavingsTrendModal
          {...defaultProps}
          totalIncome={1000}
          totalExpenses={3000}
          savingsRate={-200}
        />
      )

      const hero = document.querySelector('[class*="hero"]')
      expect(hero).toBeInTheDocument()
      const heroScope = within(hero as HTMLElement)

      // rate <= -100 formats as multiplier, e.g. 3.0x
      expect(heroScope.getByText('3.0x')).toBeInTheDocument()

      const t = useLanguageStore.getState().t
      expect(heroScope.getByText(t.multiplierInfo)).toBeInTheDocument()
    })

    it('does not show multiplier tooltip in hero when savingsRate is > -100', () => {
      render(
        <SavingsTrendModal
          {...defaultProps}
          totalIncome={2000}
          totalExpenses={2500}
          savingsRate={-25}
        />
      )

      const hero = document.querySelector('[class*="hero"]')
      expect(hero).toBeInTheDocument()
      const heroScope = within(hero as HTMLElement)

      expect(heroScope.getByText('-25%')).toBeInTheDocument()
      const t = useLanguageStore.getState().t
      expect(heroScope.queryByText(t.multiplierInfo)).not.toBeInTheDocument()
    })
  })

  describe('Best and Worst Month Highlights', () => {
    it('renders best and worst month pills when multiple distinct months exist', () => {
      render(<SavingsTrendModal {...defaultProps} />)

      const highlightRow = document.querySelector('[class*="highlight-row"]')
      expect(highlightRow).toBeInTheDocument()
      const highlightScope = within(highlightRow as HTMLElement)

      // Jan: +1000, Feb: +2000 (Best), Mar: -400 (Worst)
      expect(highlightScope.getByText(/Best/)).toBeInTheDocument()
      expect(highlightScope.getByText('Feb 24')).toBeInTheDocument()
      expect(highlightScope.getByText(/\+.*2,000/)).toBeInTheDocument()

      expect(highlightScope.getByText(/Worst/)).toBeInTheDocument()
      expect(highlightScope.getByText('Mar 24')).toBeInTheDocument()
      expect(highlightScope.getByText(/-.*400/)).toBeInTheDocument()
    })

    it('renders only the best month pill if all months have identical savings', () => {
      const identicalData: MonthlyEntry[] = [
        { name: 'Jan 24', rawMonth: '2024-01', income: 3000, expenses: 2000 },
        { name: 'Feb 24', rawMonth: '2024-02', income: 3000, expenses: 2000 },
      ]

      render(
        <SavingsTrendModal
          {...defaultProps}
          monthlyData={identicalData}
        />
      )

      const highlightRow = document.querySelector('[class*="highlight-row"]')
      expect(highlightRow).toBeInTheDocument()
      const highlightScope = within(highlightRow as HTMLElement)

      expect(highlightScope.getByText(/Best/)).toBeInTheDocument()
      expect(highlightScope.queryByText(/Worst/)).not.toBeInTheDocument()
    })

    it('does not render highlight pills if monthlyData has only 1 item', () => {
      const singleMonth: MonthlyEntry[] = [
        { name: 'Jan 24', rawMonth: '2024-01', income: 3000, expenses: 2000 },
      ]

      render(
        <SavingsTrendModal
          {...defaultProps}
          monthlyData={singleMonth}
        />
      )

      const highlightRow = document.querySelector('[class*="highlight-row"]')
      expect(highlightRow).not.toBeInTheDocument()
    })
  })

  describe('Month-by-Month Table', () => {
    it('renders table headers and row items correctly for positive balance', () => {
      render(<SavingsTrendModal {...defaultProps} />)

      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      expect(within(table).getByRole('columnheader', { name: 'Month' })).toBeInTheDocument()
      expect(within(table).getByRole('columnheader', { name: 'Total Income' })).toBeInTheDocument()
      expect(within(table).getByRole('columnheader', { name: 'Total Expenses' })).toBeInTheDocument()
      expect(within(table).getByRole('columnheader', { name: 'Net Saved' })).toBeInTheDocument()
      expect(within(table).getByRole('columnheader', { name: 'Savings Rate' })).toBeInTheDocument()

      // Check rows: Jan 24, Feb 24, Mar 24
      expect(within(table).getByRole('cell', { name: 'Jan 24' })).toBeInTheDocument()
      expect(within(table).getByRole('cell', { name: 'Feb 24' })).toBeInTheDocument()
      expect(within(table).getByRole('cell', { name: 'Mar 24' })).toBeInTheDocument()

      // Jan 24: income 3000, expenses 2000, saved +1000, rate 33%
      expect(within(table).getByText('33%')).toBeInTheDocument()
      // Feb 24: income 3500, expenses 1500, saved +2000, rate 57%
      expect(within(table).getByText('57%')).toBeInTheDocument()
    })

    it('renders deficit table headers when totalSaved is negative', () => {
      render(
        <SavingsTrendModal
          {...defaultProps}
          totalIncome={2000}
          totalExpenses={4000}
          savingsRate={-100}
        />
      )

      const table = screen.getByRole('table')
      expect(within(table).getByRole('columnheader', { name: 'Net Deficit' })).toBeInTheDocument()
      expect(within(table).getByRole('columnheader', { name: 'Deficit Rate' })).toBeInTheDocument()
    })

    it('handles a month with 0 income gracefully without producing NaN', () => {
      const dataWithZeroIncome: MonthlyEntry[] = [
        { name: 'Jan 24', rawMonth: '2024-01', income: 0, expenses: 500 },
      ]

      render(
        <SavingsTrendModal
          {...defaultProps}
          monthlyData={dataWithZeroIncome}
          totalIncome={0}
          totalExpenses={500}
        />
      )

      const table = screen.getByRole('table')
      expect(within(table).getByText('0%')).toBeInTheDocument()
    })

    it('renders info tooltip inside row when individual month has rate <= -100', () => {
      const severeDeficitMonth: MonthlyEntry[] = [
        { name: 'Jan 24', rawMonth: '2024-01', income: 1000, expenses: 3000 },
      ]

      render(
        <SavingsTrendModal
          {...defaultProps}
          monthlyData={severeDeficitMonth}
        />
      )

      const table = screen.getByRole('table')
      // Rate is -200%, formatted as 3.0x
      expect(within(table).getByText('3.0x')).toBeInTheDocument()

      const t = useLanguageStore.getState().t
      expect(within(table).getByText(t.multiplierInfo)).toBeInTheDocument()
    })
  })

  describe('Trend Chart & Tooltip', () => {
    it('renders the chart when multiple months are present', () => {
      render(<SavingsTrendModal {...defaultProps} />)

      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    })

    it('does not render the chart when only one month is present', () => {
      const singleMonth: MonthlyEntry[] = [
        { name: 'Jan 24', rawMonth: '2024-01', income: 3000, expenses: 2000 },
      ]

      render(
        <SavingsTrendModal
          {...defaultProps}
          monthlyData={singleMonth}
        />
      )

      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
    })

    it('handles gradientOffset calculation when all months have positive savings', () => {
      const allPositive: MonthlyEntry[] = [
        { name: 'Jan 24', rawMonth: '2024-01', income: 3000, expenses: 2000 }, // +1000
        { name: 'Feb 24', rawMonth: '2024-02', income: 4000, expenses: 2000 }, // +2000
      ]

      render(
        <SavingsTrendModal
          {...defaultProps}
          monthlyData={allPositive}
        />
      )

      const splitStroke = document.querySelector('#splitStroke')
      expect(splitStroke).toBeInTheDocument()
      const stops = splitStroke?.querySelectorAll('stop')
      // When all savings >= 0, gradientOffset is 1
      expect(stops?.[0].getAttribute('offset')).toBe('1')
    })

    it('handles gradientOffset calculation when all months have negative savings', () => {
      const allNegative: MonthlyEntry[] = [
        { name: 'Jan 24', rawMonth: '2024-01', income: 1000, expenses: 2000 }, // -1000
        { name: 'Feb 24', rawMonth: '2024-02', income: 1500, expenses: 2500 }, // -1000
      ]

      render(
        <SavingsTrendModal
          {...defaultProps}
          monthlyData={allNegative}
        />
      )

      const splitStroke = document.querySelector('#splitStroke')
      expect(splitStroke).toBeInTheDocument()
      const stops = splitStroke?.querySelectorAll('stop')
      // When all savings <= 0, gradientOffset is 0
      expect(stops?.[0].getAttribute('offset')).toBe('0')
    })

    it('handles gradientOffset calculation for mixed positive and negative savings', () => {
      const mixed: MonthlyEntry[] = [
        { name: 'Jan 24', rawMonth: '2024-01', income: 3000, expenses: 1000 }, // +2000 (max)
        { name: 'Feb 24', rawMonth: '2024-02', income: 1000, expenses: 3000 }, // -2000 (min)
      ]

      render(
        <SavingsTrendModal
          {...defaultProps}
          monthlyData={mixed}
        />
      )

      const splitStroke = document.querySelector('#splitStroke')
      expect(splitStroke).toBeInTheDocument()
      const stops = splitStroke?.querySelectorAll('stop')
      // dataMax / (dataMax - dataMin) = 2000 / (2000 - (-2000)) = 2000 / 4000 = 0.5
      expect(stops?.[0].getAttribute('offset')).toBe('0.5')
    })

    it('renders area dots and activeDots correctly with positive and negative indicators', () => {
      render(<SavingsTrendModal {...defaultProps} />)

      const dots = screen.getByTestId('area-dots')
      const dotCircles = dots.querySelectorAll('circle')
      expect(dotCircles).toHaveLength(2)
      // Positive dot has emerald color
      expect(dotCircles[0].getAttribute('fill')).toBe('#10b981')
      // Negative dot has rose color
      expect(dotCircles[1].getAttribute('fill')).toBe('#f43f5e')

      const activeDots = screen.getByTestId('area-active-dots')
      const activeCircles = activeDots.querySelectorAll('circle')
      expect(activeCircles).toHaveLength(2)
      expect(activeCircles[0].getAttribute('fill')).toBe('#10b981')
      expect(activeCircles[1].getAttribute('fill')).toBe('#f43f5e')
    })

    it('renders ChartTooltip content for positive, negative, and inactive states', () => {
      render(<SavingsTrendModal {...defaultProps} />)

      const positiveTooltip = screen.getByTestId('tooltip-active-positive')
      expect(positiveTooltip).toHaveTextContent('Feb 24')
      expect(positiveTooltip).toHaveTextContent(/\+.*750/)

      const negativeTooltip = screen.getByTestId('tooltip-active-negative')
      expect(negativeTooltip).toHaveTextContent('Jan 24')
      expect(negativeTooltip).toHaveTextContent(/-.*400/)

      const inactiveTooltip = screen.getByTestId('tooltip-inactive')
      expect(inactiveTooltip).toBeEmptyDOMElement()
    })
  })

  describe('Internationalization (i18n)', () => {
    it('renders German localization correctly', () => {
      useLanguageStore.getState().setLocale('de')

      render(<SavingsTrendModal {...defaultProps} />)

      expect(screen.getByText('Spartrend')).toBeInTheDocument()

      const hero = document.querySelector('[class*="hero"]')
      expect(within(hero as HTMLElement).getByText('Netto gespart')).toBeInTheDocument()

      const table = screen.getByRole('table')
      expect(within(table).getByRole('columnheader', { name: 'Monat' })).toBeInTheDocument()
      expect(within(table).getByRole('columnheader', { name: 'Gesamteinnahmen' })).toBeInTheDocument()
      expect(within(table).getByRole('columnheader', { name: 'Gesamtausgaben' })).toBeInTheDocument()

      const highlightRow = document.querySelector('[class*="highlight-row"]')
      expect(within(highlightRow as HTMLElement).getByText(/Bester/)).toBeInTheDocument()
      expect(within(highlightRow as HTMLElement).getByText(/Schlechtester/)).toBeInTheDocument()
    })

    it('renders Polish localization correctly', () => {
      useLanguageStore.getState().setLocale('pl')

      render(<SavingsTrendModal {...defaultProps} />)

      expect(screen.getByText('Trend oszczędności')).toBeInTheDocument()

      const hero = document.querySelector('[class*="hero"]')
      expect(within(hero as HTMLElement).getByText('Netto zaoszczędzone')).toBeInTheDocument()

      const table = screen.getByRole('table')
      expect(within(table).getByRole('columnheader', { name: 'Miesiąc' })).toBeInTheDocument()
      expect(within(table).getByRole('columnheader', { name: 'Łączny przychód' })).toBeInTheDocument()
      expect(within(table).getByRole('columnheader', { name: 'Łączne wydatki' })).toBeInTheDocument()

      const highlightRow = document.querySelector('[class*="highlight-row"]')
      expect(within(highlightRow as HTMLElement).getByText(/Najlepszy/)).toBeInTheDocument()
      expect(within(highlightRow as HTMLElement).getByText(/Najgorszy/)).toBeInTheDocument()
    })
  })
})
