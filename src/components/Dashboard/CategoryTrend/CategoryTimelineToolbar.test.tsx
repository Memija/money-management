import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLanguageStore } from '../../../store/useLanguageStore'
import { CategoryTimelineToolbar } from './CategoryTimelineToolbar'

describe('CategoryTimelineToolbar', () => {
  beforeEach(() => {
    useLanguageStore.getState().setLocale('en')
  })

  it('renders range text and showing pill', () => {
    render(
      <CategoryTimelineToolbar
        visibleCount={6}
        totalCount={12}
        startMonthLabel="Jan 25"
        endMonthLabel="Jun 25"
        isZoomed={true}
        isAtStart={false}
        isAtEnd={false}
        isAtMinZoom={false}
        isAtMaxZoom={false}
        activePreset={null}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onPanEarlier={vi.fn()}
        onPanLater={vi.fn()}
        onResetZoom={vi.fn()}
        onSelectPreset={vi.fn()}
      />,
    )

    expect(screen.getByText('Jan 25 – Jun 25')).toBeInTheDocument()
    expect(screen.getByText('6 of 12 months')).toBeInTheDocument()
  })

  it('handles navigation and zoom clicks', () => {
    const onZoomIn = vi.fn()
    const onZoomOut = vi.fn()
    const onPanEarlier = vi.fn()
    const onPanLater = vi.fn()
    const onResetZoom = vi.fn()
    const onSelectPreset = vi.fn()

    render(
      <CategoryTimelineToolbar
        visibleCount={6}
        totalCount={12}
        startMonthLabel="Jan 25"
        endMonthLabel="Jun 25"
        isZoomed={true}
        isAtStart={false}
        isAtEnd={false}
        isAtMinZoom={false}
        isAtMaxZoom={false}
        activePreset={null}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onPanEarlier={onPanEarlier}
        onPanLater={onPanLater}
        onResetZoom={onResetZoom}
        onSelectPreset={onSelectPreset}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Previous months' }))
    expect(onPanEarlier).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Next months' }))
    expect(onPanLater).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(onZoomIn).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }))
    expect(onZoomOut).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }))
    expect(onResetZoom).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: '3M' }))
    expect(onSelectPreset).toHaveBeenCalledWith('3M')
  })

  it('disables buttons when bounds are reached', () => {
    render(
      <CategoryTimelineToolbar
        visibleCount={3}
        totalCount={12}
        startMonthLabel="Jan 25"
        endMonthLabel="Mar 25"
        isZoomed={true}
        isAtStart={true}
        isAtEnd={false}
        isAtMinZoom={true}
        isAtMaxZoom={false}
        activePreset={null}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onPanEarlier={vi.fn()}
        onPanLater={vi.fn()}
        onResetZoom={vi.fn()}
        onSelectPreset={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Previous months' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next months' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Zoom out' })).not.toBeDisabled()
  })
})
