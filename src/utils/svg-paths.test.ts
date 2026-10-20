import { describe, expect, it } from 'vitest'

import { getRoundedRectPath } from './svg-paths'

describe('getRoundedRectPath', () => {
  it('should draw a sharp rectangle when all radii are zero', () => {
    expect(getRoundedRectPath(0, 0, 10, 20, [0, 0, 0, 0])).toBe('M0,0H10V20H0V0Z')
  })

  it('should add arcs only for rounded corners', () => {
    expect(getRoundedRectPath(0, 0, 10, 20, [2, 2, 0, 0])).toBe(
      'M2,0H8A2,2 0 0 1 10,2V20H0V2A2,2 0 0 1 2,0Z',
    )
  })

  it('should clamp radii to half of the shortest side', () => {
    expect(getRoundedRectPath(0, 0, 4, 20, [8, 8, 8, 8])).toContain('A2,2')
  })

  it('should normalise negative heights', () => {
    expect(getRoundedRectPath(0, 20, 10, -20, [0, 0, 0, 0])).toBe('M0,0H10V20H0V0Z')
  })
})
