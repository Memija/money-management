import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CategorySelect } from './CategorySelect'

const mockSetStep = vi.fn()
const mockAddCustomCategory = vi.fn()

vi.mock('../../../store/useAppStore', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      customCategories: [],
      setStep: mockSetStep,
      addCustomCategory: mockAddCustomCategory,
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn(() => ({
    locale: 'en',
    t: {
      defaultCategoriesGroup: 'Default Categories',
      customCategoriesGroup: 'Custom Categories',
      addNewCategory: 'Add New Category',
      manageInSettings: 'Manage in Settings',
      quickCreateCategoryTitle: 'Quick Add Category',
      createAndApply: 'Create & Apply',
      cancel: 'Cancel',
      name: 'Name',
      chooseIconTitle: 'Choose Icon',
      newCategoryNamePlaceholder: 'Category name...',
      manageInSettingsHint: 'Want multi-language translations or rules? Manage in Settings',
      catDiningOut: 'Dining Out',
      catGroceries: 'Groceries',
      catOther: 'Other',
      icons: {
        Tag: 'Tag Label',
        Coffee: 'Coffee Break',
        Tv: 'Television',
        Dumbbell: 'Fitness Gym',
      },
    },
  })),
}))

describe('CategorySelect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with initial category and toggles dropdown', () => {
    const handleChange = vi.fn()
    render(<CategorySelect value="Groceries" onChange={handleChange} />)

    const button = screen.getByRole('button', { name: /Groceries/i })
    expect(button).toBeInTheDocument()

    // Open dropdown
    fireEvent.click(button)

    expect(screen.getByText('Default Categories')).toBeInTheDocument()
    expect(screen.getByText('Add New Category')).toBeInTheDocument()
    expect(screen.getByText('Manage in Settings')).toBeInTheDocument()
  })

  it('navigates to Settings when "Manage in Settings" is clicked', () => {
    const handleChange = vi.fn()
    render(<CategorySelect value="Groceries" onChange={handleChange} />)

    const button = screen.getByRole('button', { name: /Groceries/i })
    fireEvent.click(button)

    const settingsBtn = screen.getByText('Manage in Settings')
    fireEvent.click(settingsBtn)

    expect(mockSetStep).toHaveBeenCalledWith('settings')
  })

  it('opens QuickCategoryModal on "Add New Category" and applies newly created category', () => {
    const handleChange = vi.fn()
    render(<CategorySelect value="Groceries" onChange={handleChange} />)

    // Open dropdown
    const button = screen.getByRole('button', { name: /Groceries/i })
    fireEvent.click(button)

    // Click Add New Category
    const addCategoryBtn = screen.getByText('Add New Category')
    fireEvent.click(addCategoryBtn)

    // Modal should be open
    expect(screen.getByText('Quick Add Category')).toBeInTheDocument()

    // Type new category name
    const input = screen.getByPlaceholderText('Category name...')
    fireEvent.change(input, { target: { value: 'Streaming Services' } })

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Create & Apply/i })
    expect(submitBtn).not.toBeDisabled()
    fireEvent.click(submitBtn)

    // Should create category and call onChange with generated custom ID
    expect(mockAddCustomCategory).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.any(String),
        translations: expect.objectContaining({
          en: 'Streaming Services',
        }),
      })
    )
    expect(handleChange).toHaveBeenCalledWith(expect.stringMatching(/^custom_/))
  })

  it('renders quick icons with localized tooltips and category colors in quick edit modal', () => {
    const handleChange = vi.fn()
    render(<CategorySelect value="Groceries" onChange={handleChange} />)

    // Open dropdown and modal
    fireEvent.click(screen.getByRole('button', { name: /Groceries/i }))
    fireEvent.click(screen.getByText('Add New Category'))

    // The Coffee button should have localized title "Coffee Break" and aria-label
    const coffeeBtn = screen.getByTitle('Coffee Break')
    expect(coffeeBtn).toBeInTheDocument()
    expect(coffeeBtn).toHaveAttribute('aria-label', 'Coffee Break')

    // The icon SVG inside should have the distinct color for coffee (#78350f)
    const svg = coffeeBtn.querySelector('svg')
    expect(svg).toHaveAttribute('stroke', '#78350f')
  })
})
