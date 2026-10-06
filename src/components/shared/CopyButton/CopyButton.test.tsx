import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as clipboardModule from '../../../utils/clipboard'
import { CopyButton } from './CopyButton'

describe('CopyButton', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders copy button with default title and aria-label', () => {
    render(<CopyButton text="Salary payment" testId="copy-btn" />)

    const btn = screen.getByTestId('copy-btn')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('aria-label')
    expect(btn).not.toBeDisabled()
  })

  it('stops event propagation when clicked', async () => {
    const parentClick = vi.fn()
    vi.spyOn(clipboardModule, 'copyToClipboard').mockResolvedValue(true)

    render(
      <div onClick={parentClick}>
        <CopyButton text="Groceries text" testId="copy-btn" />
      </div>,
    )

    const btn = screen.getByTestId('copy-btn')
    await act(async () => {
      fireEvent.click(btn)
    })

    expect(parentClick).not.toHaveBeenCalled()
  })

  it('copies text and shows copied state feedback, then reverts after 2000ms', async () => {
    const copySpy = vi.spyOn(clipboardModule, 'copyToClipboard').mockResolvedValue(true)
    const onCopyMock = vi.fn()

    render(
      <CopyButton
        text="Coffee Shop"
        title="Copy text"
        copiedTitle="Copied to clipboard!"
        onCopy={onCopyMock}
        testId="copy-btn"
      />,
    )

    const btn = screen.getByTestId('copy-btn')
    expect(btn).toHaveAttribute('title', 'Copy text')

    await act(async () => {
      fireEvent.click(btn)
    })

    expect(copySpy).toHaveBeenCalledWith('Coffee Shop')
    expect(onCopyMock).toHaveBeenCalled()
    expect(btn).toHaveAttribute('title', 'Copied to clipboard!')
    expect(btn).toHaveAttribute('aria-label', 'Copied to clipboard!')

    // Fast-forward 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(btn).toHaveAttribute('title', 'Copy text')
  })

  it('is disabled when disabled prop is true or text is empty', () => {
    const { rerender } = render(<CopyButton text="" testId="copy-btn-empty" />)
    expect(screen.getByTestId('copy-btn-empty')).toBeDisabled()

    rerender(<CopyButton text="Valid text" disabled={true} testId="copy-btn-disabled" />)
    expect(screen.getByTestId('copy-btn-disabled')).toBeDisabled()
  })

  it('applies custom className and variant', () => {
    render(
      <CopyButton
        text="Custom variant"
        variant="inline"
        className="my-custom-class"
        testId="copy-btn-custom"
      />,
    )

    const btn = screen.getByTestId('copy-btn-custom')
    expect(btn.className).toContain('my-custom-class')
    expect(btn.className).toContain('inline')
  })
})
