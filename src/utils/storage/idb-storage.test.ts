import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  idbStorage,
  isIndexedDBAvailable,
  requestPersistentStorage,
  resetStorageConnection,
} from './idb-storage'

describe('idbStorage', () => {
  beforeEach(() => {
    resetStorageConnection()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    resetStorageConnection()
  })

  describe('isIndexedDBAvailable', () => {
    it('returns false when indexedDB is undefined', () => {
      const orig = window.indexedDB
      try {
        // @ts-expect-error test override
        delete window.indexedDB
        expect(isIndexedDBAvailable()).toBe(false)
      } finally {
        window.indexedDB = orig
      }
    })

    it('returns true when indexedDB is defined on window', () => {
      const mockIDB = {} as IDBFactory
      vi.stubGlobal('indexedDB', mockIDB)
      expect(isIndexedDBAvailable()).toBe(true)
    })
  })

  describe('in-memory fallback when IndexedDB is unavailable', () => {
    beforeEach(() => {
      // @ts-expect-error test override
      delete window.indexedDB
    })

    it('stores, retrieves, and removes items cleanly in memory', async () => {
      expect(await idbStorage.getItem('test-key')).toBeNull()

      await idbStorage.setItem('test-key', '{"data":"hello"}')
      expect(await idbStorage.getItem('test-key')).toBe('{"data":"hello"}')

      await idbStorage.removeItem('test-key')
      expect(await idbStorage.getItem('test-key')).toBeNull()
    })
  })

  describe('with mocked IndexedDB implementation', () => {
    let mockStore: Map<string, unknown>
    let mockDB: IDBDatabase

    beforeEach(() => {
      mockStore = new Map()

      const mockTx = {
        objectStore: vi.fn(() => ({
          get: (key: string) => {
            const req = {
              result: mockStore.get(key),
              onsuccess: null as (() => void) | null,
              onerror: null as (() => void) | null,
            }
            setTimeout(() => req.onsuccess?.(), 0)
            return req
          },
          put: (val: unknown, key: string) => {
            mockStore.set(key, val)
            const req = {
              onsuccess: null as (() => void) | null,
              onerror: null as (() => void) | null,
            }
            setTimeout(() => req.onsuccess?.(), 0)
            return req
          },
          delete: (key: string) => {
            mockStore.delete(key)
            const req = {
              onsuccess: null as (() => void) | null,
              onerror: null as (() => void) | null,
            }
            setTimeout(() => req.onsuccess?.(), 0)
            return req
          },
        })),
        onabort: null as (() => void) | null,
        onerror: null as (() => void) | null,
      }

      mockDB = {
        objectStoreNames: {
          contains: vi.fn().mockReturnValue(true),
        },
        createObjectStore: vi.fn(),
        transaction: vi.fn(() => mockTx),
        close: vi.fn(),
        onclose: null as (() => void) | null,
        onversionchange: null as (() => void) | null,
      } as unknown as IDBDatabase

      const mockOpenRequest = {
        result: mockDB,
        onsuccess: null as (() => void) | null,
        onerror: null as (() => void) | null,
        onupgradeneeded: null as (() => void) | null,
        onblocked: null as (() => void) | null,
      }

      const mockFactory = {
        open: vi.fn(() => {
          setTimeout(() => {
            mockOpenRequest.onupgradeneeded?.()
            mockOpenRequest.onsuccess?.()
          }, 0)
          return mockOpenRequest
        }),
      }

      vi.stubGlobal('indexedDB', mockFactory)
    })

    it('sets, gets, and removes values in the IndexedDB object store', async () => {
      await idbStorage.setItem('app-key', '{"accounts":[1,2,3]}')
      expect(mockStore.get('app-key')).toBe('{"accounts":[1,2,3]}')

      const loaded = await idbStorage.getItem('app-key')
      expect(loaded).toBe('{"accounts":[1,2,3]}')

      await idbStorage.removeItem('app-key')
      expect(mockStore.has('app-key')).toBe(false)
      expect(await idbStorage.getItem('app-key')).toBeNull()
    })
  })

  describe('requestPersistentStorage', () => {
    it('returns true if navigator.storage.persisted returns true', async () => {
      const mockStorage = {
        persisted: vi.fn().mockResolvedValue(true),
        persist: vi.fn().mockResolvedValue(true),
      }
      vi.stubGlobal('navigator', { storage: mockStorage })

      const result = await requestPersistentStorage()
      expect(result).toBe(true)
      expect(mockStorage.persist).not.toHaveBeenCalled()
    })

    it('calls persist if navigator.storage.persisted returns false', async () => {
      const mockStorage = {
        persisted: vi.fn().mockResolvedValue(false),
        persist: vi.fn().mockResolvedValue(true),
      }
      vi.stubGlobal('navigator', { storage: mockStorage })

      const result = await requestPersistentStorage()
      expect(result).toBe(true)
      expect(mockStorage.persist).toHaveBeenCalled()
    })

    it('handles environments without navigator.storage gracefully', async () => {
      vi.stubGlobal('navigator', {})
      const result = await requestPersistentStorage()
      expect(result).toBe(false)
    })
  })
})
