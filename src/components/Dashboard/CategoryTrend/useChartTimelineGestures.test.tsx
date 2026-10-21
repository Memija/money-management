import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { UseChartTimelineGesturesOptions } from './useChartTimelineGestures'
import { useChartTimelineGestures } from './useChartTimelineGestures'

const TestChartCanvas: React.FC<UseChartTimelineGesturesOptions> = (props) => {
  const containerRef = useChartTimelineGestures(props)
  return <div ref={containerRef} data-testid="chart-canvas" style={{ width: 300, height: 200 }} />
}

describe('useChartTimelineGestures', () => {
  const setupChart = (props: Partial<UseChartTimelineGesturesOptions> = {}) => {
    const defaultProps: UseChartTimelineGesturesOptions = {
      enabled: true,
      totalCount: 12,
      startIndex: 0,
      endIndex: 5,
      minWindow: 3,
      onRangeChange: vi.fn(),
      onZoomIn: vi.fn(),
      onResetZoom: vi.fn(),
      ...props,
    }

    const renderResult = render(<TestChartCanvas {...defaultProps} />)
    const el = screen.getByTestId('chart-canvas')
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      width: 300,
      height: 200,
      left: 0,
      top: 0,
      right: 300,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    })

    return { el, props: defaultProps, ...renderResult }
  }

  it('does nothing when disabled', () => {
    const onRangeChange = vi.fn()
    const { el } = setupChart({ enabled: false, onRangeChange })

    act(() => {
      el.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        }),
      )
      el.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [{ clientX: 50, clientY: 100 } as Touch],
          cancelable: true,
        }),
      )
      el.dispatchEvent(new TouchEvent('touchend', { touches: [] }))
    })

    expect(onRangeChange).not.toHaveBeenCalled()
  })

  it('pans later when swiping left (dx < 0)', () => {
    const onRangeChange = vi.fn()
    const { el } = setupChart({ startIndex: 0, endIndex: 5, onRangeChange })

    act(() => {
      el.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [{ clientX: 200, clientY: 100 } as Touch],
        }),
      )
      // Moving left by 100px: 100 / 300 * 6 = 2 months
      el.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
          cancelable: true,
        }),
      )
      el.dispatchEvent(new TouchEvent('touchend', { touches: [] }))
    })

    expect(onRangeChange).toHaveBeenCalledWith(2, 7)
  })

  it('pans earlier when swiping right (dx > 0)', () => {
    const onRangeChange = vi.fn()
    const { el } = setupChart({ startIndex: 6, endIndex: 11, onRangeChange })

    act(() => {
      el.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        }),
      )
      // Moving right by 100px: shifts back by 2 months
      el.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [{ clientX: 200, clientY: 100 } as Touch],
          cancelable: true,
        }),
      )
      el.dispatchEvent(new TouchEvent('touchend', { touches: [] }))
    })

    expect(onRangeChange).toHaveBeenCalledWith(4, 9)
  })

  it('ignores vertical swipes to preserve smooth page scroll', () => {
    const onRangeChange = vi.fn()
    const { el } = setupChart({ onRangeChange })

    let defaultPrevented = false
    act(() => {
      el.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        }),
      )
      const moveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 105, clientY: 160 } as Touch], // vertical swipe (dy = 60)
        cancelable: true,
      })
      el.dispatchEvent(moveEvent)
      defaultPrevented = moveEvent.defaultPrevented
      el.dispatchEvent(new TouchEvent('touchend', { touches: [] }))
    })

    expect(defaultPrevented).toBe(false)
    expect(onRangeChange).not.toHaveBeenCalled()
  })

  it('handles pinch to zoom with 2 fingers', () => {
    const onRangeChange = vi.fn()
    const { el } = setupChart({ startIndex: 0, endIndex: 11, minWindow: 3, onRangeChange })

    act(() => {
      // 2 fingers initial distance: 100px apart
      el.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [
            { clientX: 100, clientY: 100 } as Touch,
            { clientX: 200, clientY: 100 } as Touch,
          ],
        }),
      )

      // Spreading fingers to 200px apart (scale = 2 -> zoom in)
      el.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [
            { clientX: 50, clientY: 100 } as Touch,
            { clientX: 250, clientY: 100 } as Touch,
          ],
          cancelable: true,
        }),
      )
      el.dispatchEvent(new TouchEvent('touchend', { touches: [] }))
    })

    expect(onRangeChange).toHaveBeenCalled()
    const [calledStart, calledEnd] = onRangeChange.mock.calls[0]
    expect(calledEnd - calledStart + 1).toBeLessThan(12)
  })

  it('handles double tap to reset zoom or zoom in', () => {
    const onResetZoom = vi.fn()
    const onZoomIn = vi.fn()
    const { el } = setupChart({
      startIndex: 2,
      endIndex: 7, // currently zoomed
      totalCount: 12,
      onResetZoom,
      onZoomIn,
    })

    act(() => {
      // Tap 1
      el.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as Touch],
        }),
      )
      el.dispatchEvent(new TouchEvent('touchend', { touches: [] }))

      // Tap 2 quickly
      el.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [{ clientX: 102, clientY: 101 } as Touch],
        }),
      )
      el.dispatchEvent(new TouchEvent('touchend', { touches: [] }))
    })

    expect(onResetZoom).toHaveBeenCalled()
  })

  it('pans proportionally on horizontal wheel / trackpad scroll', () => {
    const onRangeChange = vi.fn()
    const { el } = setupChart({ startIndex: 3, endIndex: 8, onRangeChange })

    act(() => {
      // 100px of 300px with a 6-month window → 2 months
      fireEvent.wheel(el, { deltaX: 100, deltaY: 0 })
    })
    expect(onRangeChange).toHaveBeenLastCalledWith(5, 10)

    act(() => {
      fireEvent.wheel(el, { deltaX: -100, deltaY: 0 })
    })
    expect(onRangeChange).toHaveBeenLastCalledWith(1, 6)
  })

  it('ignores plain vertical wheel so the page keeps scrolling', () => {
    const onRangeChange = vi.fn()
    const { el } = setupChart({ startIndex: 3, endIndex: 8, onRangeChange })

    act(() => {
      fireEvent.wheel(el, { deltaY: 120 })
    })
    expect(onRangeChange).not.toHaveBeenCalled()
  })

  it('zooms one ladder step around the cursor on Ctrl+wheel', () => {
    const onRangeChange = vi.fn()
    const { el } = setupChart({ startIndex: 3, endIndex: 8, onRangeChange })

    act(() => {
      // Zoom in at the center: 6 → 3 months
      fireEvent.wheel(el, { ctrlKey: true, deltaY: -100, clientX: 150 })
    })
    expect(onRangeChange).toHaveBeenLastCalledWith(5, 7)

    act(() => {
      // Zoom out at the center: 6 → 9 months
      fireEvent.wheel(el, { ctrlKey: true, deltaY: 100, clientX: 150 })
    })
    expect(onRangeChange).toHaveBeenLastCalledWith(2, 10)
  })

  it('accumulates small trackpad pinch deltas before zooming', () => {
    const onRangeChange = vi.fn()
    const { el } = setupChart({ startIndex: 0, endIndex: 11, onRangeChange })

    act(() => {
      fireEvent.wheel(el, { ctrlKey: true, deltaY: -10, clientX: 150 })
      fireEvent.wheel(el, { ctrlKey: true, deltaY: -10, clientX: 150 })
    })
    expect(onRangeChange).not.toHaveBeenCalled()

    act(() => {
      fireEvent.wheel(el, { ctrlKey: true, deltaY: -40, clientX: 150 })
    })
    expect(onRangeChange).toHaveBeenCalledTimes(1)
  })

  it('suppresses the click that follows a mouse drag', () => {
    const onRangeChange = vi.fn()
    const onChildClick = vi.fn()
    const { el } = setupChart({ startIndex: 3, endIndex: 8, onRangeChange })
    const child = document.createElement('button')
    child.addEventListener('click', onChildClick)
    el.appendChild(child)

    const pointer = (type: string, clientX: number) =>
      Object.assign(new MouseEvent(type, { bubbles: true, clientX, button: 0 }), {
        pointerType: 'mouse',
        pointerId: 1,
      })

    act(() => {
      child.dispatchEvent(pointer('pointerdown', 200))
      child.dispatchEvent(pointer('pointermove', 100))
      child.dispatchEvent(pointer('pointerup', 100))
      child.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onRangeChange).toHaveBeenCalledWith(5, 10)
    expect(onChildClick).not.toHaveBeenCalled()

    // A normal click afterwards still works
    act(() => {
      child.dispatchEvent(pointer('pointerdown', 100))
      child.dispatchEvent(pointer('pointerup', 100))
      child.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(onChildClick).toHaveBeenCalledTimes(1)
  })
})
