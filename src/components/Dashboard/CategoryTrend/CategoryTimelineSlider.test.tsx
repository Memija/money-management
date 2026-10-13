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
    expect(sliders).toHaveLength(2)

    // Start handle
    expect(sliders[0]).toHaveAttribute('aria-label', expect.stringContaining('Start'))
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '1')
    expect(sliders[0]).toHaveAttribute('aria-valuetext', 'Feb 24')

    // End handle
    expect(sliders[1]).toHaveAttribute('aria-label', expect.stringContaining('End'))
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '4')
    expect(sliders[1]).toHaveAttribute('aria-valuetext', 'May 24')
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
})
