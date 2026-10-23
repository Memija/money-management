import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLanguageStore } from '../../../store/useLanguageStore'
import { InsightCards } from './InsightCards'

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
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
    },
  }
})

describe('InsightCards', () => {
  const defaultProps = {
    transactionCount: 42,
    incomeCount: 12,
    expenseCount: 30,
    avgExpense: 85.5,
    avgIncome: 250,
    avgTransaction: 65,
    totalIncome: 3000,
    totalExpenses: 2565,
    balance: 435,
    topCategory: { name: 'Food', amount: 500, percent: 20 },
    topCategories: [{ name: 'Food', amount: 500, percent: 20 }],
    savingsRate: 15,
  }

  beforeEach(() => {
    useLanguageStore.getState().setLocale('en')
  })

  it('renders all four insight cards with correct labels', () => {
    render(<InsightCards {...defaultProps} />)

    expect(screen.getByText('Transactions')).toBeInTheDocument()
    expect(screen.getByText('Average Transaction')).toBeInTheDocument()
    expect(screen.getByText('Top Category')).toBeInTheDocument()
    expect(screen.getByText('Savings Rate')).toBeInTheDocument()
  })

  it('applies privacy-blur to average transaction and savings rate values', () => {
    render(<InsightCards {...defaultProps} />)

    const avgExpenseElements = screen.getAllByText(/85\.50/)
    expect(avgExpenseElements.length).toBeGreaterThan(0)
    avgExpenseElements.forEach((el) => {
      expect(el).toHaveClass('privacy-blur')
    })

    const savingsRateEl = screen.getByText('15%')
    expect(savingsRateEl).toHaveClass('privacy-blur')

    const txCountEl = screen.getByText('42')
    expect(txCountEl).not.toHaveClass('privacy-blur')
  })

  it('renders Deficit Rate card with privacy-blur when savingsRate is negative', () => {
    render(
      <InsightCards
        {...defaultProps}
        savingsRate={-35}
        balance={-1050}
        totalExpenses={4050}
      />,
    )

    expect(screen.getByText('Deficit Rate')).toBeInTheDocument()
    const deficitRateEl = screen.getByText('-35%')
    expect(deficitRateEl).toBeInTheDocument()
    expect(deficitRateEl).toHaveClass('privacy-blur')
  })
})
