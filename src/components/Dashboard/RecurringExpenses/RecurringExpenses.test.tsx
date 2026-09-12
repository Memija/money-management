import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { RecurringExpense } from '../../../hooks/useRecurringTransactions'
import { RecurringExpenses } from './RecurringExpenses'

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

const mockSetManualCategoriesBulk = vi.fn()
const mockSetCustomKeywords = vi.fn()

// Mock app store
vi.mock('../../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      customCategories: [],
      customKeywords: {},
      setManualCategoriesBulk: mockSetManualCategoriesBulk,
      setCustomKeywords: mockSetCustomKeywords,
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

// Mock language store
vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      locale: 'en',
      t: {
        recurringTitle: 'Recurring Expenses and Subscriptions',
        monthlyTotal: 'Monthly Overhead',
        yearlyTotal: 'Projected Yearly',
        activeSubscriptionsSingular: '1 active subscription or recurring charge detected',
        activeSubscriptions: '{count} active subscriptions or recurring charges detected',
        estimatedLabel: 'Estimated monthly cost',
        chargesCountSingular: '{count} charge',
        chargesCountFew: '{count} charges',
        chargesCountPlural: '{count} charges',
        chargesCount: '{count} charges',
        monthlyFrequency: 'Monthly',
        perMonth: '/mo',
        perYear: '/yr',
        defaultCategoriesGroup: 'Default Categories',
        catEntertainment: 'Entertainment',
        catUtilities: 'Utilities',
        catDiningOut: 'Dining Out',
      },
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

const sampleRecurring: RecurringExpense[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    amount: 15.99,
    category: 'Entertainment',
    frequency: 'monthly',
    transactionCount: 6,
    transactionIds: ['tx-1', 'tx-2'],
  },
  {
    id: 'telemach',
    name: 'Telemach Internet',
    amount: 35.0,
    category: 'Utilities',
    frequency: 'monthly',
    transactionCount: 3,
    transactionIds: ['tx-3', 'tx-4', 'tx-5'],
  },
]

describe('RecurringExpenses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders null when there are no recurring expenses', () => {
    const { container } = render(
      <RecurringExpenses recurringExpenses={[]} totalMonthly={0} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders recurring expense cards with full row header and KPI stats', () => {
    render(
      <RecurringExpenses
        recurringExpenses={sampleRecurring}
        totalMonthly={50.99}
      />
    )

    expect(screen.getByText('Recurring Expenses and Subscriptions')).toBeInTheDocument()
    expect(
      screen.getByText('2 active subscriptions or recurring charges detected')
    ).toBeInTheDocument()
    expect(screen.getByText('Monthly Overhead')).toBeInTheDocument()
    expect(screen.getByText('Projected Yearly')).toBeInTheDocument()

    // Cards
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Telemach Internet')).toBeInTheDocument()
    expect(screen.getByText('6 charges')).toBeInTheDocument()
    expect(screen.getByText('3 charges')).toBeInTheDocument()
  })

  it('renders singular message when exactly 1 recurring expense is detected', () => {
    render(
      <RecurringExpenses
        recurringExpenses={[sampleRecurring[0]]}
        totalMonthly={15.99}
      />
    )

    expect(
      screen.getByText('1 active subscription or recurring charge detected')
    ).toBeInTheDocument()
  })

  it('allows reassigning the category for an individual item', () => {
    render(
      <RecurringExpenses
        recurringExpenses={sampleRecurring}
        totalMonthly={50.99}
      />
    )

    // Find the category badge button for Netflix (Entertainment)
    const categoryBtn = screen.getByRole('button', { name: /Entertainment/i })
    expect(categoryBtn).toBeInTheDocument()

    // Open dropdown
    fireEvent.click(categoryBtn)

    // Option for Dining Out should be visible in the dropdown
    const diningOption = screen.getByRole('option', { name: /Dining Out/i })
    expect(diningOption).toBeInTheDocument()

    // Select Dining Out
    fireEvent.click(diningOption)

    // Should call setManualCategoriesBulk with Netflix's transaction IDs
    expect(mockSetManualCategoriesBulk).toHaveBeenCalledWith({
      'tx-1': 'Dining Out',
      'tx-2': 'Dining Out',
    })
  })
})
