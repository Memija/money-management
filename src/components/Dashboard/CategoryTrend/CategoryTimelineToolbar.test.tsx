import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLanguageStore } from '../../../store/useLanguageStore'
import { CategoryTimelineToolbar } from './CategoryTimelineToolbar'

type ToolbarProps = React.ComponentProps<typeof CategoryTimelineToolbar>

const renderToolbar = (overrides: Partial<ToolbarProps> = {}) => {
  const props: ToolbarProps = {
    visibleCount: 6,
    totalCount: 12,
    startMonthLabel: 'Jan 25',
    endMonthLabel: 'Jun 25',
    isAtStart: false,
    isAtEnd: false,
    isAtMinZoom: false,
    isAtMaxZoom: false,
    activePreset: null,
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onPanEarlier: vi.fn(),
    onPanLater: vi.fn(),
    onSelectPreset: vi.fn(),
    ...overrides,
  }
  render(<CategoryTimelineToolbar {...props} />)
  return props
}

describe('CategoryTimelineToolbar', () => {
  beforeEach(() => {
    useLanguageStore.getState().setLocale('en')
  })

  it('renders range text and showing pill', () => {
    renderToolbar()

    expect(screen.getByText('Jan 25 – Jun 25')).toBeInTheDocument()
    expect(screen.getByText('6 of 12 months')).toBeInTheDocument()
  })

  it('handles navigation, zoom and preset clicks', () => {
    const props = renderToolbar()

    fireEvent.click(screen.getByRole('button', { name: 'Previous months' }))
    expect(props.onPanEarlier).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Next months' }))
    expect(props.onPanLater).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(props.onZoomIn).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }))
    expect(props.onZoomOut).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: '3M' }))
    expect(props.onSelectPreset).toHaveBeenCalledWith('3M')
  })

  it('marks the active preset as pressed', () => {
    renderToolbar({ activePreset: '6M' })

    expect(screen.getByRole('button', { name: '6M' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('only offers presets that fit within the available months', () => {
    renderToolbar({ totalCount: 8 })

    expect(screen.getByRole('button', { name: '6M' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '1Y' })).not.toBeInTheDocument()
  })

  it('disables buttons when bounds are reached', () => {
    renderToolbar({ visibleCount: 3, endMonthLabel: 'Mar 25', isAtStart: true, isAtMinZoom: true })

    expect(screen.getByRole('button', { name: 'Previous months' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next months' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Zoom out' })).not.toBeDisabled()
  })

  it('reduces to presets only when a timeline overview slider is shown', () => {
    renderToolbar({ hasOverview: true })

    expect(screen.getByRole('button', { name: '3M' })).toBeInTheDocument()
    expect(screen.queryByText('6 of 12 months')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Zoom in' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Previous months' })).not.toBeInTheDocument()
  })
})
