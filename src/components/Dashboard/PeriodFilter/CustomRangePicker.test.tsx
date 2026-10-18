import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CustomRangePicker } from './CustomRangePicker'

describe('CustomRangePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger button with formatted range', () => {
    const handleChange = vi.fn()
    render(
      <CustomRangePicker
        startDate="2024-03-01"
        endDate="2024-06-30"
        onChange={handleChange}
        ariaLabel="Filter custom range"
      />,
    )

    const trigger = screen.getByRole('button', { name: /Filter custom range/i })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent(/2024/)
  })

  it('renders placeholder when no dates are provided', () => {
    const handleChange = vi.fn()
    render(<CustomRangePicker startDate="" endDate="" onChange={handleChange} />)

    const trigger = screen.getByRole('button')
    expect(trigger).toHaveTextContent(/Select date range|Custom Range/i)
  })

  it('opens popover dialog when trigger is clicked and renders presets and calendar', () => {
    const handleChange = vi.fn()
    render(
      <CustomRangePicker
        startDate="2024-03-01"
        endDate="2024-06-30"
        maxDate="2024-06-30"
        minDate="2024-01-01"
        onChange={handleChange}
      />,
    )

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()

    // Check presets are visible
    expect(screen.getByRole('button', { name: /Last 30 days/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /This year/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /All Time/i })).toBeInTheDocument()
  })

  it('calls onChange when clicking a preset', () => {
    const handleChange = vi.fn()
    render(
      <CustomRangePicker
        startDate=""
        endDate=""
        maxDate="2024-06-30"
        minDate="2024-01-01"
        onChange={handleChange}
      />,
    )

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const thisYearBtn = screen.getByRole('button', { name: /This year/i })
    fireEvent.click(thisYearBtn)

    expect(handleChange).toHaveBeenCalledWith('2024-01-01', '2024-12-31')
  })

  it('calls onChange when clicking days in calendar to select a range', () => {
    const handleChange = vi.fn()
    render(
      <CustomRangePicker startDate="2024-05-01" endDate="2024-05-31" onChange={handleChange} />,
    )

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    // Find day button for 10
    const day10 = screen.getByRole('button', { name: '10' })
    fireEvent.click(day10)
    expect(handleChange).toHaveBeenCalledWith('2024-05-10', '')

    // Find day button for 20
    const day20 = screen.getByRole('button', { name: '20' })
    fireEvent.click(day20)
    expect(handleChange).toHaveBeenCalledWith('2024-05-10', '2024-05-20')
  })

  it('calls onChange with empty strings when Clear is clicked', () => {
    const handleChange = vi.fn()
    render(
      <CustomRangePicker startDate="2024-03-01" endDate="2024-06-30" onChange={handleChange} />,
    )

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const clearBtn = screen.getByRole('button', { name: /Clear/i })
    fireEvent.click(clearBtn)

    expect(handleChange).toHaveBeenCalledWith('', '')
  })

  it('closes dialog when Apply is clicked', () => {
    const handleChange = vi.fn()
    render(
      <CustomRangePicker startDate="2024-03-01" endDate="2024-06-30" onChange={handleChange} />,
    )

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    const applyBtn = screen.getByRole('button', { name: /Apply|Done/i })
    fireEvent.click(applyBtn)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
