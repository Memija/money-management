import type { StateStorage } from 'zustand/middleware'

const DB_NAME = 'saldio_db'
const STORE_NAME = 'keyval'
const DB_VERSION = 1

let cachedDBPromise: Promise<IDBDatabase> | null = null
const memoryFallback = new Map<string, string>()

/**
 * Checks if IndexedDB is available and accessible in the current environment.
 */
export const isIndexedDBAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null
  } catch {
    return false
  }
}

/**
 * Opens or retrieves the cached IndexedDB database connection.
 */
const getDB = (): Promise<IDBDatabase> => {
  if (cachedDBPromise) {
    return cachedDBPromise
  }

  if (!isIndexedDBAvailable()) {
    return Promise.reject(new Error('IndexedDB is not available in this environment'))
  }

  cachedDBPromise = new Promise<IDBDatabase>((resolve, reject) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }

      request.onsuccess = () => {
        const db = request.result
        db.onclose = () => {
          cachedDBPromise = null
        }
        db.onversionchange = () => {
          db.close()
          cachedDBPromise = null
        }
        resolve(db)
      }

      request.onerror = () => {
        cachedDBPromise = null
        reject(request.error || new Error('Failed to open IndexedDB'))
      }

      request.onblocked = () => {
        console.warn('IndexedDB database open request was blocked by an existing open connection')
      }
    } catch (err) {
      cachedDBPromise = null
      reject(err)
    }
  })

  return cachedDBPromise
}

/**
 * Modern async StateStorage adapter for Zustand backed by IndexedDB,
 * with automatic, transparent in-memory fallback if IndexedDB is unavailable.
 */
export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const db = await getDB()
      return await new Promise<string | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const request = store.get(name)

        request.onsuccess = () => {
          const result = request.result
          resolve(typeof result === 'string' ? result : null)
        }

        request.onerror = () => reject(request.error)
      })
    } catch {
      return memoryFallback.get(name) ?? null
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const db = await getDB()
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const request = store.put(value, name)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
        tx.onabort = () => reject(tx.error || new Error('Transaction aborted'))
      })
    } catch {
      memoryFallback.set(name, value)
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      const db = await getDB()
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const request = store.delete(name)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
        tx.onabort = () => reject(tx.error || new Error('Transaction aborted'))
      })
    } catch {
      memoryFallback.delete(name)
    }
  },
}

/**
 * Requests persistent storage from the browser to protect financial data from eviction.
 * Returns true if persistence was granted or already active, false otherwise.
 */
export const requestPersistentStorage = async (): Promise<boolean> => {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage) {
      if (typeof navigator.storage.persisted === 'function') {
        const isAlreadyPersisted = await navigator.storage.persisted()
        if (isAlreadyPersisted) {
          return true
        }
      }
      if (typeof navigator.storage.persist === 'function') {
        return await navigator.storage.persist()
      }
    }
  } catch (err) {
    console.debug('Persistent storage request failed:', err)
  }
  return false
}

/**
 * Testing helper: resets cached database connections and clears the in-memory fallback.
 */
export const resetStorageConnection = (): void => {
  cachedDBPromise = null
  memoryFallback.clear()
}
