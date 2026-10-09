import { describe, expect, it, vi } from 'vitest'

import { createBoundedCache, memoizeStringFn } from './bounded-cache'

describe('createBoundedCache', () => {
  it('should store and retrieve values', () => {
    const cache = createBoundedCache<number>(3)
    cache.set('a', 1)
    expect(cache.has('a')).toBe(true)
    expect(cache.get('a')).toBe(1)
  })

  it('should evict the oldest entry when exceeding max size', () => {
    const cache = createBoundedCache<number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    expect(cache.has('a')).toBe(false)
    expect(cache.get('b')).toBe(2)
    expect(cache.get('c')).toBe(3)
  })

  it('should not evict when overwriting an existing key', () => {
    const cache = createBoundedCache<number>(2)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('a', 10)
    expect(cache.get('a')).toBe(10)
    expect(cache.get('b')).toBe(2)
  })
})

describe('memoizeStringFn', () => {
  it('should call the wrapped function only once per input', () => {
    const fn = vi.fn((s: string) => s.toUpperCase())
    const memoized = memoizeStringFn(fn)
    expect(memoized('abc')).toBe('ABC')
    expect(memoized('abc')).toBe('ABC')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should cache undefined results', () => {
    const fn = vi.fn((): string | undefined => undefined)
    const memoized = memoizeStringFn(fn)
    memoized('x')
    memoized('x')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
