import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLanguageStore } from '../../../store/useLanguageStore'
import { ExpenseCategories } from './ExpenseCategories'

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div>Cell</div>,
  Sector: () => <div>Sector</div>,
  Tooltip: () => <div>Tooltip</div>,
}))

const sampleCategories = Array.from({ length: 11 }, (_, i) => ({
  name: `Category ${i + 1}`,
  value: 100 * (11 - i),
  color: '#ff0000',
  colorClass: 'cat-color-0',
}))

describe('ExpenseCategories', () => {
  beforeEach(() => {
    useLanguageStore.getState().setLocale('en')
  })

  it('renders English category count properly for 11 categories', () => {
    render(
      <ExpenseCategories
        categoryBreakdown={sampleCategories}
        totalExpenses={36778.84}
        onCategoryClick={vi.fn()}
      />
    )

    expect(screen.getByText('Expense Categories')).toBeInTheDocument()
    // Subtitle & donut center check: 11 categories
    expect(screen.getAllByText(/11 categories/).length).toBeGreaterThanOrEqual(1)
  })

  it('renders Serbian category count properly for 11 categories (11 категорија)', () => {
    useLanguageStore.getState().setLocale('sr')

    render(
      <ExpenseCategories
        categoryBreakdown={sampleCategories}
        totalExpenses={36778.84}
        onCategoryClick={vi.fn()}
      />
    )

    expect(screen.getByText('Категорије расхода')).toBeInTheDocument()
    // Subtitle & donut center check: 11 категорија
    expect(screen.getAllByText(/11 категорија/).length).toBeGreaterThanOrEqual(1)
  })

  it('renders Serbian category count properly for 1 category and 2 categories', () => {
    useLanguageStore.getState().setLocale('sr')

    const { rerender } = render(
      <ExpenseCategories
        categoryBreakdown={sampleCategories.slice(0, 1)}
        totalExpenses={100}
        onCategoryClick={vi.fn()}
      />
    )
    expect(screen.getAllByText(/1 категорија/).length).toBeGreaterThanOrEqual(1)

    rerender(
      <ExpenseCategories
        categoryBreakdown={sampleCategories.slice(0, 2)}
        totalExpenses={200}
        onCategoryClick={vi.fn()}
      />
    )
    expect(screen.getAllByText(/2 категорије/).length).toBeGreaterThanOrEqual(1)
  })

  it('handles category click', () => {
    const handleCategoryClick = vi.fn()
    render(
      <ExpenseCategories
        categoryBreakdown={sampleCategories.slice(0, 2)}
        totalExpenses={300}
        onCategoryClick={handleCategoryClick}
      />
    )

    const catBtn = screen.getByText('Category 1')
    fireEvent.click(catBtn)
    expect(handleCategoryClick).toHaveBeenCalledWith('Category 1')
  })
})
