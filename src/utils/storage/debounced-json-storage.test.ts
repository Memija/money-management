import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { StateStorage } from 'zustand/middleware'

import { createDebouncedJSONStorage, PERSIST_DEBOUNCE_MS } from './debounced-json-storage'

interface TestState {
  count: number
}

const createMemoryStorage = (): StateStorage & { data: Map<string, string> } => {
  const data = new Map<string, string>()
  return {
    data,
    getItem: vi.fn((name: string) => data.get(name) ?? null),
    setItem: vi.fn((name: string, value: string) => {
      data.set(name, value)
    }),
    removeItem: vi.fn((name: string) => {
      data.delete(name)
    }),
  }
}

describe('createDebouncedJSONStorage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should coalesce rapid writes into a single storage write', async () => {
    const backing = createMemoryStorage()
    const storage = createDebouncedJSONStorage<TestState>(() => backing)

    storage.setItem('key', { state: { count: 1 }, version: 0 })
    storage.setItem('key', { state: { count: 2 }, version: 0 })
    storage.setItem('key', { state: { count: 3 }, version: 0 })

    expect(backing.setItem).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(PERSIST_DEBOUNCE_MS)

    expect(backing.setItem).toHaveBeenCalledTimes(1)
    expect(JSON.parse(backing.data.get('key') ?? '{}')).toEqual({ state: { count: 3 }, version: 0 })
  })

  it('should return the pending value before it is written', async () => {
    const backing = createMemoryStorage()
    const storage = createDebouncedJSONStorage<TestState>(() => backing)

    storage.setItem('key', { state: { count: 7 }, version: 0 })

    expect(await storage.getItem('key')).toEqual({ state: { count: 7 }, version: 0 })
    expect(backing.getItem).not.toHaveBeenCalled()
  })

  it('should parse previously stored JSON strings', async () => {
    const backing = createMemoryStorage()
    backing.data.set('key', JSON.stringify({ state: { count: 5 }, version: 1 }))
    const storage = createDebouncedJSONStorage<TestState>(() => backing)

    expect(await storage.getItem('key')).toEqual({ state: { count: 5 }, version: 1 })
    expect(await storage.getItem('missing')).toBeNull()
  })

  it('should drop pending writes when the item is removed', async () => {
    const backing = createMemoryStorage()
    const storage = createDebouncedJSONStorage<TestState>(() => backing)

    storage.setItem('key', { state: { count: 1 }, version: 0 })
    await storage.removeItem('key')
    await vi.advanceTimersByTimeAsync(PERSIST_DEBOUNCE_MS)

    expect(backing.setItem).not.toHaveBeenCalled()
    expect(backing.removeItem).toHaveBeenCalledWith('key')
  })

  it('should write immediately when flushed', async () => {
    const backing = createMemoryStorage()
    const storage = createDebouncedJSONStorage<TestState>(() => backing)

    storage.setItem('key', { state: { count: 9 }, version: 0 })
    await storage.flush()

    expect(backing.setItem).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(PERSIST_DEBOUNCE_MS)
    expect(backing.setItem).toHaveBeenCalledTimes(1)
  })

  it('should flush pending writes when the page is hidden', async () => {
    const backing = createMemoryStorage()
    const storage = createDebouncedJSONStorage<TestState>(() => backing)

    storage.setItem('key', { state: { count: 4 }, version: 0 })
    window.dispatchEvent(new Event('pagehide'))
    await vi.advanceTimersByTimeAsync(0)

    expect(backing.setItem).toHaveBeenCalledTimes(1)
  })

  it('should log and continue when the underlying write fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const backing = createMemoryStorage()
    backing.setItem = vi.fn(() => {
      throw new Error('quota exceeded')
    })
    const storage = createDebouncedJSONStorage<TestState>(() => backing)

    storage.setItem('key', { state: { count: 1 }, version: 0 })
    await expect(storage.flush()).resolves.toBeUndefined()

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
