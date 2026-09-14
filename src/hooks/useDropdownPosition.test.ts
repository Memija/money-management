import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDropdownPosition } from './useDropdownPosition'

describe('useDropdownPosition', () => {
  let triggerElement: HTMLDivElement
  let dropdownElement: HTMLDivElement

  beforeEach(() => {
    triggerElement = document.createElement('div')
    dropdownElement = document.createElement('div')
    document.body.appendChild(triggerElement)
    document.body.appendChild(dropdownElement)

    // Default window dimensions
    window.innerWidth = 375
    window.innerHeight = 667
  })

  afterEach(() => {
    document.body.removeChild(triggerElement)
    document.body.removeChild(dropdownElement)
    vi.restoreAllMocks()
  })

  it('does nothing when isOpen is false', () => {
    renderHook(() =>
      useDropdownPosition({
        isOpen: false,
        triggerRef: { current: triggerElement },
        dropdownRef: { current: dropdownElement },
      })
    )

    expect(dropdownElement.style.getPropertyValue('--dropdown-shift-x')).toBe('')
  })

  it('shifts dropdown left when it overflows the right edge of viewport', () => {
    // Simulate dropdown extending past right edge (e.g. Right edge at 380px in 375px viewport)
    vi.spyOn(dropdownElement, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      right: 380,
      top: 50,
      bottom: 250,
      width: 280,
      height: 200,
      x: 100,
      y: 50,
      toJSON: () => {},
    })

    vi.spyOn(triggerElement, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      right: 200,
      top: 20,
      bottom: 46,
      width: 100,
      height: 26,
      x: 100,
      y: 20,
      toJSON: () => {},
    })

    renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: { current: triggerElement },
        dropdownRef: { current: dropdownElement },
        padding: 12,
      })
    )

    // Viewport is 375. Safe right bound is 375 - 12 = 363.
    // Dropdown right is 380. Overflow is 380 - 363 = 17px.
    // Shift should be -17px.
    expect(dropdownElement.style.getPropertyValue('--dropdown-shift-x')).toBe('-17px')
    expect(dropdownElement.style.getPropertyValue('--dropdown-top')).toBe('calc(100% + 4px)')
    expect(dropdownElement.style.getPropertyValue('--dropdown-bottom')).toBe('auto')
  })

  it('shifts dropdown right when it overflows the left edge of viewport', () => {
    // Simulate dropdown extending past left edge (e.g. Left edge at -20px)
    vi.spyOn(dropdownElement, 'getBoundingClientRect').mockReturnValue({
      left: -20,
      right: 240,
      top: 50,
      bottom: 250,
      width: 260,
      height: 200,
      x: -20,
      y: 50,
      toJSON: () => {},
    })

    vi.spyOn(triggerElement, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      right: 110,
      top: 20,
      bottom: 46,
      width: 100,
      height: 26,
      x: 10,
      y: 20,
      toJSON: () => {},
    })

    renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: { current: triggerElement },
        dropdownRef: { current: dropdownElement },
        padding: 12,
      })
    )

    // Safe left bound is 12px. Dropdown left is -20px. Shift = 12 - (-20) = 32px.
    expect(dropdownElement.style.getPropertyValue('--dropdown-shift-x')).toBe('32px')
  })

  it('flips dropdown vertically when bottom space is insufficient', () => {
    // Trigger is near bottom: top: 580, bottom: 610 in 667px window (space below = 57px)
    vi.spyOn(triggerElement, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      right: 200,
      top: 580,
      bottom: 610,
      width: 100,
      height: 30,
      x: 100,
      y: 580,
      toJSON: () => {},
    })

    vi.spyOn(dropdownElement, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      right: 320,
      top: 614,
      bottom: 814,
      width: 220,
      height: 200,
      x: 100,
      y: 614,
      toJSON: () => {},
    })

    renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: { current: triggerElement },
        dropdownRef: { current: dropdownElement },
        estimatedHeight: 200,
      })
    )

    // Should flip upwards:
    expect(dropdownElement.style.getPropertyValue('--dropdown-top')).toBe('auto')
    expect(dropdownElement.style.getPropertyValue('--dropdown-bottom')).toBe('calc(100% + 4px)')
    expect(dropdownElement.style.getPropertyValue('--dropdown-max-height')).toBe('200px')
  })

  it('sets dynamic max-width and clamps max-height when space in chosen direction is constrained', () => {
    // Viewport: 375x667
    // Trigger is in the middle-bottom: top: 400, bottom: 430
    // spaceBelow = (667 - 12) - 430 = 225px
    // spaceAbove = 400 - 12 = 388px
    // estimatedHeight: 260px -> fitsAbove=true, fitsBelow=false -> shouldFlip = true
    // availableSpace = spaceAbove = 388px -> maxAllowedHeight = min(260, 384) = 260px
    vi.spyOn(triggerElement, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      right: 150,
      top: 400,
      bottom: 430,
      width: 100,
      height: 30,
      x: 50,
      y: 400,
      toJSON: () => {},
    })

    vi.spyOn(dropdownElement, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      right: 250,
      top: 434,
      bottom: 694,
      width: 200,
      height: 260,
      x: 50,
      y: 434,
      toJSON: () => {},
    })

    renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: { current: triggerElement },
        dropdownRef: { current: dropdownElement },
        padding: 12,
        estimatedHeight: 260,
      })
    )

    // max-width should be 375 - 2*12 = 351px
    expect(dropdownElement.style.getPropertyValue('--dropdown-max-width')).toBe('351px')
    expect(dropdownElement.style.getPropertyValue('--dropdown-max-height')).toBe('260px')
    expect(dropdownElement.style.getPropertyValue('--dropdown-top')).toBe('auto')
    expect(dropdownElement.style.getPropertyValue('--dropdown-bottom')).toBe('calc(100% + 4px)')
  })

  it('respects sticky header obstruction when determining available space above', () => {
    // Add a sticky header to the DOM
    const header = document.createElement('header')
    header.className = 'app-header'
    document.body.appendChild(header)

    // Header bottom is at 100px
    vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 375,
      top: 0,
      bottom: 100,
      width: 375,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    })

    // Trigger is at top: 180, bottom: 210
    // topLimit with header = 100 + 4 = 104px
    // spaceAbove = 180 - 104 = 76px
    // spaceBelow = (667 - 12) - 210 = 445px (fitsBelow = true!)
    vi.spyOn(triggerElement, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      right: 150,
      top: 180,
      bottom: 210,
      width: 100,
      height: 30,
      x: 50,
      y: 180,
      toJSON: () => {},
    })

    vi.spyOn(dropdownElement, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      right: 250,
      top: 214,
      bottom: 474,
      width: 200,
      height: 260,
      x: 50,
      y: 214,
      toJSON: () => {},
    })

    renderHook(() =>
      useDropdownPosition({
        isOpen: true,
        triggerRef: { current: triggerElement },
        dropdownRef: { current: dropdownElement },
        padding: 12,
        estimatedHeight: 260,
      })
    )

    // Because spaceAbove (76px) is tiny due to header, it should NOT flip up even if spaceBelow was smaller
    expect(dropdownElement.style.getPropertyValue('--dropdown-top')).toBe('calc(100% + 4px)')
    expect(dropdownElement.style.getPropertyValue('--dropdown-bottom')).toBe('auto')
    expect(dropdownElement.style.getPropertyValue('--dropdown-max-height')).toBe('260px')

    document.body.removeChild(header)
  })
})

