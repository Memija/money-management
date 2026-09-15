import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Select, type SelectOption } from './Select'

describe('Select Component', () => {
  const options: SelectOption<string>[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ]

  it('renders correctly with selected value', () => {
    render(
      <Select
        id="fruit-select"
        value="banana"
        onChange={vi.fn()}
        options={options}
        aria-label="Select fruit"
      />
    )

    // Trigger button should show selected option label
    const trigger = screen.getByTestId('fruit-select-trigger')
    expect(trigger).toHaveTextContent('Banana')
  })

  it('toggles dropdown listbox when clicking trigger button', () => {
    render(
      <Select
        id="fruit-select"
        value="apple"
        onChange={vi.fn()}
        options={options}
        aria-label="Select fruit"
      />
    )

    const trigger = screen.getByTestId('fruit-select-trigger')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    // Open dropdown
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()

    // Options inside custom dropdown listbox are visible
    const optionElements = within(listbox).getAllByRole('option')
    expect(optionElements).toHaveLength(3)

    // Close dropdown
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('selects an option when clicked and calls onChange', () => {
    const handleChange = vi.fn()
    render(
      <Select
        id="fruit-select"
        value="apple"
        onChange={handleChange}
        options={options}
        aria-label="Select fruit"
      />
    )

    const trigger = screen.getByTestId('fruit-select-trigger')
    fireEvent.click(trigger)

    const listbox = screen.getByRole('listbox')
    const cherryOption = within(listbox).getByRole('option', { name: /Cherry/i })
    fireEvent.click(cherryOption)

    expect(handleChange).toHaveBeenCalledWith('cherry')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('supports numeric option values', () => {
    const numOptions: SelectOption<number>[] = [
      { value: 10, label: '10' },
      { value: 25, label: '25' },
      { value: 50, label: '50' },
    ]
    const handleChange = vi.fn()

    render(
      <Select
        id="num-select"
        value={10}
        onChange={handleChange}
        options={numOptions}
        size="sm"
        aria-label="Items per page"
      />
    )

    const trigger = screen.getByTestId('num-select-trigger')
    expect(trigger).toHaveTextContent('10')

    fireEvent.click(trigger)
    const listbox = screen.getByRole('listbox')
    const opt25 = within(listbox).getByRole('option', { name: '25' })
    fireEvent.click(opt25)

    expect(handleChange).toHaveBeenCalledWith(25)
  })

  it('navigates options via keyboard arrows and selects with Enter', () => {
    const handleChange = vi.fn()
    render(
      <Select
        id="fruit-select"
        value="apple"
        onChange={handleChange}
        options={options}
        aria-label="Select fruit"
      />
    )

    const trigger = screen.getByTestId('fruit-select-trigger')
    trigger.focus()

    // Open with ArrowDown
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    // Down to Banana (index 1)
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })

    // Select with Enter
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(handleChange).toHaveBeenCalledWith('banana')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes dropdown when Escape key is pressed', () => {
    render(
      <Select
        id="fruit-select"
        value="apple"
        onChange={vi.fn()}
        options={options}
        aria-label="Select fruit"
      />
    )

    const trigger = screen.getByTestId('fruit-select-trigger')
    fireEvent.click(trigger)
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('supports hidden native select for form tests and screen readers', () => {
    const handleChange = vi.fn()
    render(
      <Select
        id="fruit-select"
        value="apple"
        onChange={handleChange}
        options={options}
        aria-label="Select fruit"
      />
    )

    // Query native select via getByLabelText (standard testing-library way)
    const nativeSelect = screen.getByLabelText('Select fruit')
    expect(nativeSelect).toBeInTheDocument()
    expect(nativeSelect).toHaveValue('apple')

    fireEvent.change(nativeSelect, { target: { value: 'banana' } })
    expect(handleChange).toHaveBeenCalledWith('banana')
  })

  it('respects disabled prop', () => {
    render(
      <Select
        id="fruit-select"
        value="apple"
        onChange={vi.fn()}
        options={options}
        disabled={true}
        aria-label="Select fruit"
      />
    )

    const trigger = screen.getByTestId('fruit-select-trigger')
    expect(trigger).toBeDisabled()
    fireEvent.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('calls onOpenChange and applies containerOpen class when opened and closed', () => {
    const handleOpenChange = vi.fn()
    const { container } = render(
      <Select
        id="fruit-select"
        value="apple"
        onChange={vi.fn()}
        options={options}
        onOpenChange={handleOpenChange}
        aria-label="Select fruit"
      />
    )

    const trigger = screen.getByTestId('fruit-select-trigger')
    const selectContainer = container.firstElementChild as HTMLElement
    expect(selectContainer.className).not.toMatch(/containerOpen/)

    // Open
    fireEvent.click(trigger)
    expect(handleOpenChange).toHaveBeenCalledWith(true)
    expect(selectContainer.className).toMatch(/containerOpen/)

    // Close
    fireEvent.click(trigger)
    expect(handleOpenChange).toHaveBeenCalledWith(false)
    expect(selectContainer.className).not.toMatch(/containerOpen/)
  })
})
