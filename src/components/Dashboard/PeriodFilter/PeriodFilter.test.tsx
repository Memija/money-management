import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PeriodFilter as PeriodFilterType } from '../../../hooks/useAnalytics'
import { PeriodFilter } from './PeriodFilter'

describe('PeriodFilter', () => {
  const availableYears = ['2026', '2025', '2024']
  const availableQuarters = ['2026-Q1', '2025-Q4', '2025-Q3']
  const availableMonths = ['2026-03', '2026-02', '2026-01']

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all mode pills including Custom', () => {
    const handlePeriodChange = vi.fn()
    const period: PeriodFilterType = { mode: 'all', value: '' }

    render(
      <PeriodFilter
        period={period}
        onPeriodChange={handlePeriodChange}
        availableYears={availableYears}
        availableQuarters={availableQuarters}
        availableMonths={availableMonths}
      />,
    )

    expect(
      screen.getByRole('button', { name: /All Time|Cały okres|Gesamtzeit/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Year|Jahr|Rok/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Quarter|Quartal|Kwartal/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Month|Monat|Miesiąc/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Custom|Benutzerdefiniert|Własny/i }),
    ).toBeInTheDocument()
  })

  it('switches to custom mode when Custom pill is clicked', () => {
    const handlePeriodChange = vi.fn()
    const period: PeriodFilterType = { mode: 'all', value: '' }

    render(
      <PeriodFilter
        period={period}
        onPeriodChange={handlePeriodChange}
        availableYears={availableYears}
        availableQuarters={availableQuarters}
        availableMonths={availableMonths}
        minDate="2024-01-15"
        maxDate="2026-03-20"
      />,
    )

    const customPill = screen.getByRole('button', { name: /Custom|Benutzerdefiniert|Własny/i })
    fireEvent.click(customPill)

    expect(handlePeriodChange).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'custom',
        startDate: '2024-01-15',
        endDate: '2026-03-20',
        value: '2024-01-15..2026-03-20',
      }),
    )
  })

  it('renders CustomRangePicker when mode is custom', () => {
    const handlePeriodChange = vi.fn()
    const period: PeriodFilterType = {
      mode: 'custom',
      value: '2025-01-01..2025-06-30',
      startDate: '2025-01-01',
      endDate: '2025-06-30',
    }

    render(
      <PeriodFilter
        period={period}
        onPeriodChange={handlePeriodChange}
        availableYears={availableYears}
        availableQuarters={availableQuarters}
        availableMonths={availableMonths}
      />,
    )

    // Trigger button for CustomRangePicker should be rendered
    const rangeTrigger = screen.getByTitle(/2025/)
    expect(rangeTrigger).toBeInTheDocument()
  })

  it('renders CustomPeriodPicker when mode is year', () => {
    const handlePeriodChange = vi.fn()
    const period: PeriodFilterType = { mode: 'year', value: '2026' }

    render(
      <PeriodFilter
        period={period}
        onPeriodChange={handlePeriodChange}
        availableYears={availableYears}
        availableQuarters={availableQuarters}
        availableMonths={availableMonths}
      />,
    )

    const yearPickerBtn = screen.getByText('2026')
    expect(yearPickerBtn).toBeInTheDocument()
  })
})
