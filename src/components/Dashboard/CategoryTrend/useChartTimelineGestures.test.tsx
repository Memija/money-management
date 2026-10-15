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
      onZoomOut: vi.fn(),
      onResetZoom: vi.fn(),
      onPanEarlier: vi.fn(),
      onPanLater: vi.fn(),
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

  it('handles mouse wheel and horizontal scroll', () => {
    const onPanLater = vi.fn()
    const onPanEarlier = vi.fn()
    const onZoomIn = vi.fn()
    const onZoomOut = vi.fn()
    const { el } = setupChart({ onPanEarlier, onPanLater, onZoomIn, onZoomOut })

    act(() => {
      // Horizontal scroll later
      fireEvent.wheel(el, { deltaX: 40, deltaY: 0 })
      // Horizontal scroll earlier
      fireEvent.wheel(el, { deltaX: -40, deltaY: 0 })
      // Ctrl+wheel zoom in
      fireEvent.wheel(el, { ctrlKey: true, deltaY: -20 })
      // Ctrl+wheel zoom out
      fireEvent.wheel(el, { ctrlKey: true, deltaY: 20 })
    })

    expect(onPanLater).toHaveBeenCalled()
    expect(onPanEarlier).toHaveBeenCalled()
    expect(onZoomIn).toHaveBeenCalled()
    expect(onZoomOut).toHaveBeenCalled()
  })
})
