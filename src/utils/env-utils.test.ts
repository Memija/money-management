import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { isLocalEnvironment } from './env-utils'

describe('isLocalEnvironment', () => {
  const originalLocation = window.location

  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    })
    vi.unstubAllEnvs()
  })

  it('returns true when import.meta.env.DEV is true', () => {
    vi.stubEnv('DEV', true)
    expect(isLocalEnvironment()).toBe(true)
  })

  it('returns true for localhost hostname when DEV is false', () => {
    vi.stubEnv('DEV', false)
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost' },
      writable: true,
      configurable: true,
    })
    expect(isLocalEnvironment()).toBe(true)
  })

  it('returns true for 127.0.0.1 loopback IP', () => {
    vi.stubEnv('DEV', false)
    Object.defineProperty(window, 'location', {
      value: { hostname: '127.0.0.1' },
      writable: true,
      configurable: true,
    })
    expect(isLocalEnvironment()).toBe(true)
  })

  it('returns true for IPv6 loopback [::1] and ::1', () => {
    vi.stubEnv('DEV', false)
    Object.defineProperty(window, 'location', {
      value: { hostname: '[::1]' },
      writable: true,
      configurable: true,
    })
    expect(isLocalEnvironment()).toBe(true)

    Object.defineProperty(window, 'location', {
      value: { hostname: '::1' },
      writable: true,
      configurable: true,
    })
    expect(isLocalEnvironment()).toBe(true)
  })

  it('returns true for *.localhost and *.local hostnames', () => {
    vi.stubEnv('DEV', false)
    Object.defineProperty(window, 'location', {
      value: { hostname: 'app.localhost' },
      writable: true,
      configurable: true,
    })
    expect(isLocalEnvironment()).toBe(true)

    Object.defineProperty(window, 'location', {
      value: { hostname: 'macbook.local' },
      writable: true,
      configurable: true,
    })
    expect(isLocalEnvironment()).toBe(true)
  })

  it('returns false for production domains when DEV is false', () => {
    vi.stubEnv('DEV', false)
    Object.defineProperty(window, 'location', {
      value: { hostname: 'money-management.example.com' },
      writable: true,
      configurable: true,
    })
    expect(isLocalEnvironment()).toBe(false)
  })
})
