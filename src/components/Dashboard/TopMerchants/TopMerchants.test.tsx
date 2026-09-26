import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MerchantEntry } from '../../../hooks/useAnalytics'
import { TopMerchants } from './TopMerchants'

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      style,
      onClick,
    }: {
      children?: React.ReactNode
      className?: string
      style?: React.CSSProperties
      onClick?: () => void
    }) => (
      <div className={className} style={style} onClick={onClick}>
        {children}
      </div>
    ),
  },
}))

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="barchart">{children}</div>,
  Bar: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div data-testid="bar-cell" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
}))

// Mock language store
vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      locale: 'en',
      t: {
        topMerchants: 'Top Merchants',
        popularMerchantsCountSingular: '{count} popular merchant',
        popularMerchantsCountFew: '{count} popular merchants',
        popularMerchantsCountPlural: '{count} popular merchants',
        viewRankedList: 'Ranked',
        viewBarChart: 'Chart',
        topMerchantsShare: 'Top spend share',
        total: 'Total',
        amount: 'Total Spent',
        numTransactions: 'Transactions',
        avgPerTransaction: 'Avg. / Transaction',
        perTransaction: 'Per transaction',
        perTransactionShort: '/ tx',
        ofTopSpend: 'of top spend',
        ofTotal: '{percent}% of total expenses',
        allMerchants: 'All Merchants',
      },
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

// Mock app store
vi.mock('../../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      customCategories: [],
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

describe('TopMerchants', () => {
  const mockMerchants: MerchantEntry[] = [
    { name: 'Amazon', amount: 350.5, count: 5, category: 'Shopping' },
    { name: 'Rewe', amount: 200.0, count: 4, category: 'Groceries' },
    { name: 'Netflix', amount: 17.99, count: 1, category: 'Entertainment' },
    { name: 'Custom Coffee Shop', amount: 12.5, count: 2, category: 'Dining Out' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders null when merchants array is empty', () => {
    const { container } = render(<TopMerchants merchants={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders header, title, and summary metrics', () => {
    render(<TopMerchants merchants={mockMerchants} totalExpenses={1000} />)

    expect(screen.getByText('Top Merchants')).toBeInTheDocument()
    expect(screen.getByText('4 popular merchants')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Top spend share')).toBeInTheDocument()
    // Total is 350.5 + 200 + 17.99 + 12.5 = 580.99
    // Share is 58.1%
    expect(screen.getByText('58.1%')).toBeInTheDocument()
  })

  it('renders merchant items in ranked list view by default', () => {
    render(<TopMerchants merchants={mockMerchants} />)

    expect(screen.getByText('Amazon')).toBeInTheDocument()
    expect(screen.getByText('Rewe')).toBeInTheDocument()
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Custom Coffee Shop')).toBeInTheDocument()

    // Rank numbers
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('toggles between Ranked List and Chart view', () => {
    render(<TopMerchants merchants={mockMerchants} />)

    // Initially in Ranked list view
    expect(screen.getByText('Amazon')).toBeInTheDocument()
    expect(screen.queryByTestId('barchart')).not.toBeInTheDocument()

    // Click Chart view button
    const chartBtn = screen.getByRole('button', { name: /chart/i })
    fireEvent.click(chartBtn)

    expect(screen.getByTestId('barchart')).toBeInTheDocument()

    // Click Ranked list button
    const rankedBtn = screen.getByRole('button', { name: /ranked/i })
    fireEvent.click(rankedBtn)

    expect(screen.getByText('Amazon')).toBeInTheDocument()
    expect(screen.queryByTestId('barchart')).not.toBeInTheDocument()
  })

  it('calls onMerchantClick when a merchant row is clicked', () => {
    const onMerchantClick = vi.fn()
    render(<TopMerchants merchants={mockMerchants} onMerchantClick={onMerchantClick} />)

    const amazonRow = screen.getByText('Amazon').closest('[role="button"]')
    expect(amazonRow).toBeInTheDocument()

    if (amazonRow) {
      fireEvent.click(amazonRow)
      expect(onMerchantClick).toHaveBeenCalledWith('Amazon')
    }
  })

  it('supports keyboard navigation with Enter key', () => {
    const onMerchantClick = vi.fn()
    render(<TopMerchants merchants={mockMerchants} onMerchantClick={onMerchantClick} />)

    const reweRow = screen.getByText('Rewe').closest('[role="button"]')
    expect(reweRow).toBeInTheDocument()

    if (reweRow) {
      fireEvent.keyDown(reweRow, { key: 'Enter' })
      expect(onMerchantClick).toHaveBeenCalledWith('Rewe')
    }
  })

  it('omits approximation sign when transaction count is 1, and includes it when count > 1', () => {
    render(<TopMerchants merchants={mockMerchants} />)

    // Amazon, Rewe, Custom Coffee Shop have count > 1 -> should show approximation sign ~
    const approxElements = screen.getAllByText(/~.*\/ tx/)
    expect(approxElements).toHaveLength(3)

    // Netflix has count 1 -> exact value, so it must not have ~
    // The Netflix row text will include 17.99 / tx without ~
    const netflixText = screen.getByText('Netflix')
    const netflixRow = netflixText.closest('div[style*="--brand-color"]')
    expect(netflixRow).toBeInTheDocument()
    expect(netflixRow?.textContent).not.toMatch(/~.*17\.99/)
    expect(netflixRow?.textContent).toMatch(/17\.99 \/ tx/)
  })

  it('applies fullWidth class when fullWidth prop is true', () => {
    const { container: container1 } = render(
      <TopMerchants merchants={mockMerchants} fullWidth={true} />,
    )
    expect((container1.firstChild as HTMLElement).className).toContain('fullWidth')

    const { container: container2 } = render(
      <TopMerchants merchants={mockMerchants} fullWidth={false} />,
    )
    expect((container2.firstChild as HTMLElement).className).not.toContain('fullWidth')
  })
})
