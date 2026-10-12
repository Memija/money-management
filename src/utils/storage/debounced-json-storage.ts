import type { PersistStorage, StateStorage, StorageValue } from 'zustand/middleware'

/** Delay before a burst of state updates is serialized and written to storage. */
export const PERSIST_DEBOUNCE_MS = 400

export interface DebouncedPersistStorage<S> extends PersistStorage<S> {
  /** Immediately serializes and writes all pending values. */
  flush: () => Promise<void>
}

/**
 * Creates a Zustand `PersistStorage` that coalesces rapid state updates into a single
 * write. Unlike `createJSONStorage`, which runs `JSON.stringify` on the full state
 * synchronously after every `set()`, serialization here is deferred until updates
 * settle, keeping large stores (thousands of transactions) from blocking interactions.
 *
 * Pending writes are flushed when the page is hidden or unloaded so no data is lost.
 * @param getStorage - Lazily resolves the underlying string-based storage
 * @param delayMs - Debounce window in milliseconds
 */
export const createDebouncedJSONStorage = <S>(
  getStorage: () => StateStorage,
  delayMs: number = PERSIST_DEBOUNCE_MS,
): DebouncedPersistStorage<S> => {
  const pending = new Map<string, StorageValue<S>>()
  let timer: ReturnType<typeof setTimeout> | null = null

  const cancelTimer = (): void => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  const writeEntry = async (name: string, value: StorageValue<S>): Promise<void> => {
    try {
      await getStorage().setItem(name, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to persist "${name}":`, error)
    }
  }

  const flush = async (): Promise<void> => {
    cancelTimer()
    if (pending.size === 0) {
      return
    }
    const entries = [...pending.entries()]
    pending.clear()
    await Promise.all(entries.map(([name, value]) => writeEntry(name, value)))
  }

  const scheduleFlush = (): void => {
    cancelTimer()
    timer = setTimeout(() => {
      void flush()
    }, delayMs)
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const flushNow = (): void => {
      void flush()
    }
    window.addEventListener('pagehide', flushNow)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushNow()
      }
    })
  }

  return {
    getItem: async (name: string): Promise<StorageValue<S> | null> => {
      const queued = pending.get(name)
      if (queued) {
        return queued
      }
      const raw = await getStorage().getItem(name)
      if (raw === null || raw === undefined) {
        return null
      }
      return JSON.parse(raw) as StorageValue<S>
    },
    setItem: (name: string, value: StorageValue<S>): void => {
      pending.set(name, value)
      scheduleFlush()
    },
    removeItem: async (name: string): Promise<void> => {
      pending.delete(name)
      if (pending.size === 0) {
        cancelTimer()
      }
      await getStorage().removeItem(name)
    },
    flush,
  }
}
