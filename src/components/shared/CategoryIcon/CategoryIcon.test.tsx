import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCategoryIcon } from '../../../utils/category-icons'
import { CategoryIcon } from './CategoryIcon'

vi.mock('../../../utils/category-icons', () => ({
  getCategoryIcon: vi.fn((category: string, size: number) => (
    <svg data-testid="category-icon" data-category={category} data-size={size} />
  )),
}))

const mockedGetCategoryIcon = vi.mocked(getCategoryIcon)

describe('CategoryIcon', () => {
  beforeEach(() => {
    mockedGetCategoryIcon.mockClear()
  })

  it('should render the icon resolved by getCategoryIcon with all inputs', () => {
    const customCategories = [
      { id: 'custom_pets', icon: 'Dog', color: '#fff', translations: { en: 'Pets' } },
    ]
    const { getByTestId } = render(
      <CategoryIcon
        category="Groceries"
        size={20}
        customCategories={customCategories}
        description="REWE Markt"
        counterpartyIban="DE00"
      />,
    )

    expect(getByTestId('category-icon').getAttribute('data-category')).toBe('Groceries')
    expect(mockedGetCategoryIcon).toHaveBeenCalledWith(
      'Groceries',
      20,
      customCategories,
      'REWE Markt',
      'DE00',
    )
  })

  it('should use the default size when none is given', () => {
    render(<CategoryIcon category="Travel" />)
    expect(mockedGetCategoryIcon).toHaveBeenCalledWith(
      'Travel',
      16,
      undefined,
      undefined,
      undefined,
    )
  })

  it('should not resolve the icon again when re-rendered with the same props', () => {
    const { rerender } = render(<CategoryIcon category="Travel" size={14} />)
    rerender(<CategoryIcon category="Travel" size={14} />)
    expect(mockedGetCategoryIcon).toHaveBeenCalledTimes(1)

    rerender(<CategoryIcon category="Dining Out" size={14} />)
    expect(mockedGetCategoryIcon).toHaveBeenCalledTimes(2)
  })
})
