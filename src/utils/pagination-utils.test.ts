import { describe, expect, it } from 'vitest'

import { getVisiblePages } from './pagination-utils'

describe('getVisiblePages', () => {
  it('returns all pages when total <= 7', () => {
    expect(getVisiblePages(1, 0)).toEqual([])
    expect(getVisiblePages(1, 1)).toEqual([1])
    expect(getVisiblePages(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(getVisiblePages(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('truncates pages with ellipsis at the end when near the start', () => {
    expect(getVisiblePages(1, 14)).toEqual([1, 2, 3, 4, 5, '...', 14])
    expect(getVisiblePages(2, 14)).toEqual([1, 2, 3, 4, 5, '...', 14])
    expect(getVisiblePages(3, 14)).toEqual([1, 2, 3, 4, 5, '...', 14])
    expect(getVisiblePages(4, 14)).toEqual([1, 2, 3, 4, 5, '...', 14])
  })

  it('truncates pages with ellipsis at both ends when in the middle', () => {
    expect(getVisiblePages(5, 14)).toEqual([1, '...', 4, 5, 6, '...', 14])
    expect(getVisiblePages(7, 14)).toEqual([1, '...', 6, 7, 8, '...', 14])
    expect(getVisiblePages(10, 14)).toEqual([1, '...', 9, 10, 11, '...', 14])
  })

  it('truncates pages with ellipsis at the start when near the end', () => {
    expect(getVisiblePages(11, 14)).toEqual([1, '...', 10, 11, 12, 13, 14])
    expect(getVisiblePages(12, 14)).toEqual([1, '...', 10, 11, 12, 13, 14])
    expect(getVisiblePages(13, 14)).toEqual([1, '...', 10, 11, 12, 13, 14])
    expect(getVisiblePages(14, 14)).toEqual([1, '...', 10, 11, 12, 13, 14])
  })

  it('handles boundary values of current correctly', () => {
    expect(getVisiblePages(0, 10)).toEqual([1, 2, 3, 4, 5, '...', 10])
    expect(getVisiblePages(99, 10)).toEqual([1, '...', 6, 7, 8, 9, 10])
  })
})
