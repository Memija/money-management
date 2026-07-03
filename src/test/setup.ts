import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

import '@testing-library/jest-dom'

// Run cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Mock ResizeObserver which is used by Recharts but not provided by jsdom
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver

// Mock window.matchMedia if needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
