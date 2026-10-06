import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { copyToClipboard } from './clipboard'

describe('copyToClipboard', () => {
  const originalClipboard = navigator.clipboard

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    })
  })

  it('returns false for empty text', async () => {
    const result = await copyToClipboard('')
    expect(result).toBe(false)
  })

  it('copies using navigator.clipboard when available and working', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    })

    const result = await copyToClipboard('Hello World')
    expect(result).toBe(true)
    expect(writeTextMock).toHaveBeenCalledWith('Hello World')
  })

  it('falls back to document.execCommand when navigator.clipboard throws', async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error('Clipboard error'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    })

    const execCommandMock = vi.fn().mockReturnValue(true)
    document.execCommand = execCommandMock

    const result = await copyToClipboard('Fallback text')
    expect(result).toBe(true)
    expect(execCommandMock).toHaveBeenCalledWith('copy')
  })

  it('falls back to document.execCommand when navigator.clipboard is undefined', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    const execCommandMock = vi.fn().mockReturnValue(true)
    document.execCommand = execCommandMock

    const result = await copyToClipboard('ExecCommand text')
    expect(result).toBe(true)
    expect(execCommandMock).toHaveBeenCalledWith('copy')
  })
})
