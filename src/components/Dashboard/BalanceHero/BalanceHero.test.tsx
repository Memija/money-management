import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BalanceHero } from './BalanceHero'

describe('BalanceHero', () => {
  it('renders positive display balance and stats correctly', () => {
    render(<BalanceHero displayBalance={1250.5} totalIncome={2500} totalExpenses={1249.5} />)

    expect(screen.getByText(/1,250\.50/)).toBeInTheDocument()
    expect(screen.getByText(/2,500\.00/)).toBeInTheDocument()
    expect(screen.getByText(/1,249\.50/)).toBeInTheDocument()
  })

  it('renders negative display balance with negative styling', () => {
    const { container } = render(
      <BalanceHero displayBalance={-450.25} totalIncome={100} totalExpenses={550.25} />,
    )

    expect(screen.getByText(/-.*450\.25/)).toBeInTheDocument()
    expect(container.querySelector('[class*="negative"]')).toBeInTheDocument()
  })
})
