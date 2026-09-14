import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CustomPeriodPicker } from './CustomPeriodPicker'

describe('CustomPeriodPicker', () => {
  const defaultOptions = ['2026-03', '2026-02', '2026-01']

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger button with formatted value', () => {
    const handleChange = vi.fn()
    render(
      <CustomPeriodPicker
        mode="month"
        value="2026-03"
        options={defaultOptions}
        onChange={handleChange}
        ariaLabel="Filter by month"
      />
    )

    const trigger = screen.getByRole('button', { name: /Filter by month/i })
    expect(trigger).toBeInTheDocument()
  })

  it('opens dropdown when trigger is clicked and allows selecting a month', () => {
    const handleChange = vi.fn()
    render(
      <CustomPeriodPicker
        mode="month"
        value="2026-03"
        options={defaultOptions}
        onChange={handleChange}
        ariaLabel="Filter by month"
      />
    )

    const trigger = screen.getByRole('button', { name: /Filter by month/i })
    fireEvent.click(trigger)

    // Should render year navigation in month mode
    expect(screen.getByText('2026')).toBeInTheDocument()

    // Click on Jan
    const janBtn = screen.getByText('Jan')
    expect(janBtn).toBeInTheDocument()
    fireEvent.click(janBtn)

    expect(handleChange).toHaveBeenCalledWith('2026-01')
  })
})
