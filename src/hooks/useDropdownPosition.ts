import React, { useLayoutEffect } from 'react'

interface UseDropdownPositionOptions {
  isOpen: boolean
  triggerRef: React.RefObject<HTMLElement | null>
  dropdownRef: React.RefObject<HTMLElement | null>
  padding?: number
  estimatedHeight?: number
  topObstructionSelector?: string
  usePortal?: boolean
  align?: 'left' | 'right'
}

/**
 * Custom hook to dynamically position and clamp dropdown menus within the viewport.
 * - Automatically shifts horizontally to prevent overflowing viewport left/right edges.
 * - Constrains max-width so dropdowns never exceed viewport width minus padding.
 * - Detects top obstructions (such as sticky headers) and calculates true visible space.
 * - Flips vertically to the side with optimal space if space below is constrained.
 * - Dynamically clamps max-height so the dropdown never overflows above or below the viewport.
 * - Supports portaled dropdowns (position: fixed) with absolute viewport coordinate calculation.
 */
export const useDropdownPosition = ({
  isOpen,
  triggerRef,
  dropdownRef,
  padding = 12,
  estimatedHeight = 260,
  topObstructionSelector = 'header, [class*="app-header"], [class*="subheader"]',
  usePortal = false,
  align = 'left',
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

      // Reset transform and shift to measure natural layout bounds
      dropdown.style.setProperty('--dropdown-shift-x', '0px')
      dropdown.style.transform = 'none'
      dropdown.style.translate = 'none'
      const dropdownRect = dropdown.getBoundingClientRect()
      const triggerRect = trigger.getBoundingClientRect()
      dropdown.style.transform = ''
      dropdown.style.translate = ''

      // Measure top obstruction (sticky header / subheader)
      let headerBottom = 0
      if (typeof document !== 'undefined' && topObstructionSelector) {
        const stickyElements = document.querySelectorAll(topObstructionSelector)
        stickyElements.forEach((el) => {
          if (el.contains(trigger)) return
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

      // Vertical flip decision
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

      if (usePortal) {
        dropdown.style.position = 'fixed'
        dropdown.style.zIndex = '1000'

        // Determine dropdown dimensions
        const dWidth = dropdownRect.width || Math.min(260, maxAllowedWidth)
        const dHeight = dropdownRect.height || estimatedHeight

        // Horizontal positioning: align left or right edge of trigger, then clamp strictly within viewport safe area
        const idealLeft = align === 'right' ? triggerRect.right - dWidth : triggerRect.left
        const clampedLeft = Math.max(padding, Math.min(idealLeft, viewportWidth - padding - dWidth))
        dropdown.style.left = `${Math.round(clampedLeft)}px`
        dropdown.style.right = 'auto'

        // Vertical positioning
        if (shouldFlip) {
          const top = Math.max(topLimit, triggerRect.top - dHeight - 4)
          dropdown.style.top = `${Math.round(top)}px`
          dropdown.style.bottom = 'auto'
        } else {
          const top = triggerRect.bottom + 4
          dropdown.style.top = `${Math.round(top)}px`
          dropdown.style.bottom = 'auto'
        }

        // Dynamic height constraint
        const availableSpace = shouldFlip ? spaceAbove : spaceBelow
        const maxAllowedHeight = Math.max(
          120,
          Math.min(estimatedHeight, Math.floor(availableSpace - 4))
        )
        dropdown.style.maxHeight = `${maxAllowedHeight}px`
        dropdown.style.setProperty('--dropdown-max-height', `${maxAllowedHeight}px`)

        // Hide if trigger is scrolled completely out of view
        if (triggerRect.bottom < 0 || triggerRect.top > viewportHeight) {
          dropdown.style.display = 'none'
        } else {
          dropdown.style.display = ''
        }
        return
      }

      // Non-portal relative positioning:
      // 2. Horizontal bounds clamping: ensure strictly between padding and viewportWidth - padding
      let shiftX = 0
      if (dropdownRect.right > viewportWidth - padding) {
        shiftX = (viewportWidth - padding) - dropdownRect.right
      }
      if (dropdownRect.left + shiftX < padding) {
        shiftX = padding - dropdownRect.left
      }
      const roundedShift = Math.round(shiftX)
      dropdown.style.setProperty('--dropdown-shift-x', `${roundedShift}px`)
      if (roundedShift !== 0) {
        dropdown.style.translate = `${roundedShift}px 0`
      } else {
        dropdown.style.translate = ''
      }

      if (shouldFlip) {
        dropdown.style.setProperty('--dropdown-top', 'auto')
        dropdown.style.setProperty('--dropdown-bottom', 'calc(100% + 4px)')
      } else {
        dropdown.style.setProperty('--dropdown-top', 'calc(100% + 4px)')
        dropdown.style.setProperty('--dropdown-bottom', 'auto')
      }

      // Dynamic height constraint: strictly fit within visible space in chosen direction
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
  }, [isOpen, triggerRef, dropdownRef, padding, estimatedHeight, topObstructionSelector, usePortal, align])
}

