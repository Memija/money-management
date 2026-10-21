import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLanguageStore } from '../../../store/useLanguageStore'
import { CategoryTimelineSlider } from './CategoryTimelineSlider'

const sampleSummaries = [
  { month: 'Jan 24', total: 1000 },
  { month: 'Feb 24', total: 1200 },
  { month: 'Mar 24', total: 900 },
  { month: 'Apr 24', total: 1500 },
  { month: 'May 24', total: 1100 },
  { month: 'Jun 24', total: 1300 },
]

describe('CategoryTimelineSlider', () => {
  beforeEach(() => {
    useLanguageStore.getState().setLocale('en')
  })

  it('renders slider track, micro-bars and travellers with accessible roles', () => {
    render(
      <CategoryTimelineSlider
        data={sampleSummaries}
        startIndex={1}
        endIndex={4}
        onRangeChange={vi.fn()}
      />,
    )

    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(3)

    // Start handle
    expect(sliders[0]).toHaveAttribute('aria-label', expect.stringContaining('Start'))
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '1')
    expect(sliders[0]).toHaveAttribute('aria-valuetext', 'Feb 24')

    // End handle
    expect(sliders[1]).toHaveAttribute('aria-label', expect.stringContaining('End'))
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '4')
    expect(sliders[1]).toHaveAttribute('aria-valuetext', 'May 24')

    // Selection window (pans the whole range)
    expect(sliders[2]).toHaveAttribute('aria-valuetext', 'Feb 24 – May 24')
  })

  it('does not render when data has 1 or fewer elements', () => {
    const { container } = render(
      <CategoryTimelineSlider
        data={[{ month: 'Jan 24', total: 1000 }]}
        startIndex={0}
        endIndex={0}
        onRangeChange={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('supports keyboard navigation on start handle', () => {
    const onRangeChange = vi.fn()
    render(
      <CategoryTimelineSlider
        data={sampleSummaries}
        startIndex={2}
        endIndex={5}
        onRangeChange={onRangeChange}
      />,
    )

    const startHandle = screen.getAllByRole('slider')[0]

    // ArrowLeft nudges start index earlier
    fireEvent.keyDown(startHandle, { key: 'ArrowLeft' })
    expect(onRangeChange).toHaveBeenCalledWith(1, 5)

    // ArrowRight nudges start index later
    fireEvent.keyDown(startHandle, { key: 'ArrowRight' })
    expect(onRangeChange).toHaveBeenCalledWith(3, 5)

    // Home jumps to 0
    fireEvent.keyDown(startHandle, { key: 'Home' })
    expect(onRangeChange).toHaveBeenCalledWith(0, 5)
  })

  it('supports keyboard navigation on end handle', () => {
    const onRangeChange = vi.fn()
    render(
      <CategoryTimelineSlider
        data={sampleSummaries}
        startIndex={1}
        endIndex={4}
        onRangeChange={onRangeChange}
      />,
    )

    const endHandle = screen.getAllByRole('slider')[1]

    // ArrowRight nudges end index later
    fireEvent.keyDown(endHandle, { key: 'ArrowRight' })
    expect(onRangeChange).toHaveBeenCalledWith(1, 5)

    // ArrowLeft nudges end index earlier
    fireEvent.keyDown(endHandle, { key: 'ArrowLeft' })
    expect(onRangeChange).toHaveBeenCalledWith(1, 3)

    // End jumps to totalCount - 1 (5)
    fireEvent.keyDown(endHandle, { key: 'End' })
    expect(onRangeChange).toHaveBeenCalledWith(1, 5)
  })

  it('calls onScrub when track is clicked', () => {
    const onScrub = vi.fn()
    render(
      <CategoryTimelineSlider
        data={sampleSummaries}
        startIndex={1}
        endIndex={3}
        onRangeChange={vi.fn()}
        onScrub={onScrub}
      />,
    )

    const track = screen.getByTestId('timeline-track')
    expect(track).toBeInTheDocument()

    // Mock getBoundingClientRect
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 0,
      width: 200,
      height: 26,
      right: 300,
      bottom: 26,
      x: 100,
      y: 0,
      toJSON: () => {},
    })

    fireEvent.click(track, { clientX: 200 })
    expect(onScrub).toHaveBeenCalledWith(0.5)
  })

  describe('pointer dragging', () => {
    const twelveMonths = Array.from({ length: 12 }, (_, i) => ({ month: `M${i}`, total: 100 }))

    const setupDrag = (startIndex: number, endIndex: number) => {
      const onRangeChange = vi.fn()
      render(
        <CategoryTimelineSlider
          data={twelveMonths}
          startIndex={startIndex}
          endIndex={endIndex}
          onRangeChange={onRangeChange}
        />,
      )
      vi.spyOn(screen.getByTestId('timeline-track'), 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 240,
        height: 42,
        right: 240,
        bottom: 42,
        x: 0,
        y: 0,
        toJSON: () => {},
      })
      // jsdom does not implement pointer capture
      Element.prototype.setPointerCapture = vi.fn()
      Element.prototype.releasePointerCapture = vi.fn()
      return { onRangeChange, sliders: screen.getAllByRole('slider') }
    }

    it('does not jump when a handle is grabbed and nudged less than one month', () => {
      // 12 months over 240px → 20px per month; end handle of window 2..5 sits at 120px
      const { onRangeChange, sliders } = setupDrag(2, 5)
      const endHandle = sliders[1]

      fireEvent.pointerDown(endHandle, { clientX: 118, pointerId: 1 })
      fireEvent.pointerMove(endHandle, { clientX: 121, pointerId: 1 })
      expect(onRangeChange).not.toHaveBeenCalled()

      fireEvent.pointerMove(endHandle, { clientX: 158, pointerId: 1 })
      expect(onRangeChange).toHaveBeenLastCalledWith(2, 7)
      fireEvent.pointerUp(endHandle, { pointerId: 1 })
    })

    it('respects the minimum window when dragging the start handle past the end', () => {
      const { onRangeChange, sliders } = setupDrag(2, 5)
      const startHandle = sliders[0]

      fireEvent.pointerDown(startHandle, { clientX: 40, pointerId: 1 })
      fireEvent.pointerMove(startHandle, { clientX: 200, pointerId: 1 })
      expect(onRangeChange).toHaveBeenLastCalledWith(3, 5)
    })
  })

  it('pans the whole window with keyboard on the selection slider', () => {
    const onRangeChange = vi.fn()
    render(
      <CategoryTimelineSlider
        data={sampleSummaries}
        startIndex={1}
        endIndex={3}
        onRangeChange={onRangeChange}
      />,
    )

    const windowSlider = screen.getAllByRole('slider')[2]
    expect(windowSlider).toHaveAttribute('aria-valuetext', 'Feb 24 – Apr 24')

    fireEvent.keyDown(windowSlider, { key: 'ArrowRight' })
    expect(onRangeChange).toHaveBeenLastCalledWith(2, 4)

    fireEvent.keyDown(windowSlider, { key: 'PageDown' })
    expect(onRangeChange).toHaveBeenLastCalledWith(3, 5)

    fireEvent.keyDown(windowSlider, { key: 'Home' })
    expect(onRangeChange).toHaveBeenLastCalledWith(0, 2)
  })
})
