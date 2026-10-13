import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CategoryTrendLegend } from './CategoryTrendLegend'

describe('CategoryTrendLegend', () => {
  const categories = ['Groceries', 'Rent', 'Utilities']
  const customCategories = []

  it('renders category legend pills with labels', () => {
    render(
      <CategoryTrendLegend
        categories={categories}
        customCategories={customCategories}
        selectedCategory={null}
        hoveredCategory={null}
        activeCategory={null}
        onCategoryHover={vi.fn()}
        onCategorySelect={vi.fn()}
        onClearCategorySelect={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Groceries' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rent' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Utilities' })).toBeInTheDocument()
  })

  it('calls onCategorySelect when clicking a category pill', () => {
    const onCategorySelect = vi.fn()
    render(
      <CategoryTrendLegend
        categories={categories}
        customCategories={customCategories}
        selectedCategory={null}
        hoveredCategory={null}
        activeCategory={null}
        onCategoryHover={vi.fn()}
        onCategorySelect={onCategorySelect}
        onClearCategorySelect={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Rent' }))
    expect(onCategorySelect).toHaveBeenCalledWith('Rent')
  })

  it('renders reset pill when a category is selected and calls onClearCategorySelect', () => {
    const onClearCategorySelect = vi.fn()
    render(
      <CategoryTrendLegend
        categories={categories}
        customCategories={customCategories}
        selectedCategory="Groceries"
        hoveredCategory={null}
        activeCategory="Groceries"
        onCategoryHover={vi.fn()}
        onCategorySelect={vi.fn()}
        onClearCategorySelect={onClearCategorySelect}
      />,
    )

    const resetBtn = screen.getByRole('button', { name: 'All Categories' })
    expect(resetBtn).toBeInTheDocument()

    fireEvent.click(resetBtn)
    expect(onClearCategorySelect).toHaveBeenCalled()
  })

  it('triggers onCategoryHover on mouse enter and leave', () => {
    const onCategoryHover = vi.fn()
    render(
      <CategoryTrendLegend
        categories={categories}
        customCategories={customCategories}
        selectedCategory={null}
        hoveredCategory={null}
        activeCategory={null}
        onCategoryHover={onCategoryHover}
        onCategorySelect={vi.fn()}
        onClearCategorySelect={vi.fn()}
      />,
    )

    const pill = screen.getByRole('button', { name: 'Groceries' })
    fireEvent.mouseEnter(pill)
    expect(onCategoryHover).toHaveBeenCalledWith('Groceries')

    fireEvent.mouseLeave(pill)
    expect(onCategoryHover).toHaveBeenCalledWith(null)
  })
})
