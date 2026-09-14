import React, { useLayoutEffect } from 'react'

interface UseDropdownPositionOptions {
  isOpen: boolean
  triggerRef: React.RefObject<HTMLElement | null>
  dropdownRef: React.RefObject<HTMLElement | null>
  padding?: number
  estimatedHeight?: number
  topObstructionSelector?: string
}

/**
 * Custom hook to dynamically position and clamp dropdown menus within the viewport.
 * - Automatically shifts horizontally to prevent overflowing viewport left/right edges.
 * - Constrains max-width so dropdowns never exceed viewport width minus padding.
 * - Detects top obstructions (such as sticky headers) and calculates true visible space.
 * - Flips vertically to the side with optimal space if space below is constrained.
 * - Dynamically clamps max-height so the dropdown never overflows above or below the viewport.
 */
export const useDropdownPosition = ({
  isOpen,
  triggerRef,
  dropdownRef,
  padding = 12,
  estimatedHeight = 260,
  topObstructionSelector = 'header, [class*="app-header"], [class*="subheader"]',
}: UseDropdownPositionOptions) => {
  useLayoutEffect(() => {
    if (!isOpen || typeof window === 'undefined') return

    const updatePosition = () => {
      const dropdown = dropdownRef.current
      const trigger = triggerRef.current
      if (!dropdown || !trigger) return

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // 1. Constrain dynamic max-width to viewport safe area
      const maxAllowedWidth = Math.max(160, Math.floor(viewportWidth - 2 * padding))
      dropdown.style.setProperty('--dropdown-max-width', `${maxAllowedWidth}px`)

      // Reset transform to measure natural layout bounds
      dropdown.style.transform = 'none'
      const dropdownRect = dropdown.getBoundingClientRect()
      const triggerRect = trigger.getBoundingClientRect()
      dropdown.style.transform = ''

      // 2. Horizontal bounds clamping: ensure strictly between padding and viewportWidth - padding
      let shiftX = 0
      if (dropdownRect.right > viewportWidth - padding) {
        shiftX = (viewportWidth - padding) - dropdownRect.right
      }
      if (dropdownRect.left + shiftX < padding) {
        shiftX = padding - dropdownRect.left
      }
      dropdown.style.setProperty('--dropdown-shift-x', `${Math.round(shiftX)}px`)

      // 3. Measure top obstruction (sticky header / subheader)
      let headerBottom = 0
      if (typeof document !== 'undefined' && topObstructionSelector) {
        const stickyElements = document.querySelectorAll(topObstructionSelector)
        stickyElements.forEach((el) => {
          const rect = el.getBoundingClientRect()
          if (rect.bottom > headerBottom && rect.top >= 0 && rect.bottom < viewportHeight * 0.5) {
            headerBottom = rect.bottom
          }
        })
      }

      const topLimit = Math.max(padding, headerBottom > 0 ? headerBottom + 4 : padding)
      const bottomLimit = viewportHeight - padding

      const spaceBelow = Math.max(0, bottomLimit - triggerRect.bottom)
      const spaceAbove = Math.max(0, triggerRect.top - topLimit)

      // 4. Vertical flip decision
      const fitsBelow = spaceBelow >= estimatedHeight
      const fitsAbove = spaceAbove >= estimatedHeight

      let shouldFlip = false
      if (fitsBelow) {
        shouldFlip = false
      } else if (fitsAbove) {
        shouldFlip = true
      } else {
        shouldFlip = spaceAbove > spaceBelow
      }

      if (shouldFlip) {
        dropdown.style.setProperty('--dropdown-top', 'auto')
        dropdown.style.setProperty('--dropdown-bottom', 'calc(100% + 4px)')
      } else {
        dropdown.style.setProperty('--dropdown-top', 'calc(100% + 4px)')
        dropdown.style.setProperty('--dropdown-bottom', 'auto')
      }

      // 5. Dynamic height constraint: strictly fit within visible space in chosen direction
      const availableSpace = shouldFlip ? spaceAbove : spaceBelow
      const maxAllowedHeight = Math.max(
        120,
        Math.min(estimatedHeight, Math.floor(availableSpace - 4))
      )
      dropdown.style.setProperty('--dropdown-max-height', `${maxAllowedHeight}px`)
    }

    updatePosition()

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, triggerRef, dropdownRef, padding, estimatedHeight, topObstructionSelector])
}

