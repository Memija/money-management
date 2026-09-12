import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CustomCategoriesSettings } from './CustomCategoriesSettings'

// Mock language store
vi.mock('../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn((selector) => {
    const state = {
      locale: 'en',
      t: {
        yourCategories: 'Your Categories',
        customCount: '{count} custom',
        newCategoryNamePlaceholder: 'New category name (e.g., Pets)',
        addTranslationsTitle: 'Add translations for other languages',
        noCustomCategories: 'No custom categories yet.',
        add: 'Add',
        chooseIconTitle: 'Choose icon',
        name: 'Name',
        translation: 'Translation',
        deleteCategory: 'Delete category',
        editCategory: 'Edit category',
        editCategoryTitle: 'Edit Category',
        saveChanges: 'Save Changes',
        removeIcon: 'Remove icon',
        cancel: 'Cancel',
      },
    }
    return typeof selector === 'function' ? selector(state) : state
  }),
}))

// Mock app store
const mockAddCustomCategory = vi.fn()
const mockUpdateCustomCategory = vi.fn()
const mockDeleteCustomCategory = vi.fn()

vi.mock('../../store/useAppStore', () => ({
  useAppStore: vi.fn(() => ({
    customCategories: [
      {
        id: 'custom_1',
        icon: 'PawPrint',
        translations: { en: 'Pets', de: 'Haustiere' },
      },
    ],
    addCustomCategory: mockAddCustomCategory,
    updateCustomCategory: mockUpdateCustomCategory,
    deleteCustomCategory: mockDeleteCustomCategory,
  })),
}))

describe('CustomCategoriesSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders existing custom categories and action buttons', () => {
    render(<CustomCategoriesSettings />)

    expect(screen.getByText('Your Categories')).toBeInTheDocument()
    expect(screen.getByText('Pets')).toBeInTheDocument()
    expect(screen.getByTitle('Edit category')).toBeInTheDocument()
    expect(screen.getByTitle('Delete category')).toBeInTheDocument()
  })

  it('opens edit modal when edit button is clicked and saves changes', () => {
    render(<CustomCategoriesSettings />)

    const editBtn = screen.getByTitle('Edit category')
    fireEvent.click(editBtn)

    expect(screen.getByText('Edit Category')).toBeInTheDocument()

    // Find the English input in the modal
    const inputs = screen.getAllByDisplayValue('Pets')
    expect(inputs.length).toBeGreaterThan(0)

    fireEvent.change(inputs[0], { target: { value: 'My Lovely Pets' } })

    const saveBtn = screen.getByText('Save Changes')
    fireEvent.click(saveBtn)

    expect(mockUpdateCustomCategory).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'custom_1',
        translations: expect.objectContaining({
          en: 'My Lovely Pets',
        }),
      })
    )
  })

  it('allows removing icon in edit modal and saves category without icon', () => {
    render(<CustomCategoriesSettings />)

    const editBtn = screen.getByTitle('Edit category')
    fireEvent.click(editBtn)

    const removeIconBtn = screen.getByTitle('Remove icon')
    fireEvent.click(removeIconBtn)

    const saveBtn = screen.getByText('Save Changes')
    fireEvent.click(saveBtn)

    expect(mockUpdateCustomCategory).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'custom_1',
        icon: undefined,
      })
    )
  })

  it('calls deleteCustomCategory when delete button is clicked', () => {
    render(<CustomCategoriesSettings />)

    const deleteBtn = screen.getByTitle('Delete category')
    fireEvent.click(deleteBtn)

    expect(mockDeleteCustomCategory).toHaveBeenCalledWith('custom_1')
  })
})
