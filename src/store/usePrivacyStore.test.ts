import { beforeEach, describe, expect, it } from 'vitest'

import { usePrivacyStore } from './usePrivacyStore'

describe('usePrivacyStore', () => {
  beforeEach(() => {
    localStorage.clear()
    usePrivacyStore.getState().setPrivacyMode(false)
  })

  it('initializes with privacy mode disabled', () => {
    expect(usePrivacyStore.getState().isPrivacyMode).toBe(false)
    expect(document.documentElement.getAttribute('data-privacy-mode')).toBe('false')
  })

  it('toggles privacy mode and updates document attribute', () => {
    usePrivacyStore.getState().togglePrivacyMode()
    expect(usePrivacyStore.getState().isPrivacyMode).toBe(true)
    expect(document.documentElement.getAttribute('data-privacy-mode')).toBe('true')
    expect(localStorage.getItem('saldio-privacy-mode')).toBe('true')

    usePrivacyStore.getState().togglePrivacyMode()
    expect(usePrivacyStore.getState().isPrivacyMode).toBe(false)
    expect(document.documentElement.getAttribute('data-privacy-mode')).toBe('false')
    expect(localStorage.getItem('saldio-privacy-mode')).toBe('false')
  })

  it('sets privacy mode explicitly', () => {
    usePrivacyStore.getState().setPrivacyMode(true)
    expect(usePrivacyStore.getState().isPrivacyMode).toBe(true)
    expect(document.documentElement.getAttribute('data-privacy-mode')).toBe('true')

    usePrivacyStore.getState().setPrivacyMode(false)
    expect(usePrivacyStore.getState().isPrivacyMode).toBe(false)
    expect(document.documentElement.getAttribute('data-privacy-mode')).toBe('false')
  })
})
