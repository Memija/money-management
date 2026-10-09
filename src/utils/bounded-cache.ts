/**
 * A size-bounded memoization cache for pure string-keyed computations.
 * When the cache exceeds `maxSize`, the oldest entry is evicted (insertion order),
 * which keeps memory flat even for very large imports.
 */
export const DEFAULT_MAX_CACHE_SIZE = 5000

export interface BoundedCache<V> {
  get: (key: string) => V | undefined
  has: (key: string) => boolean
  set: (key: string, value: V) => void
  clear: () => void
}

/**
 * Creates a bounded FIFO cache keyed by strings.
 * @param maxSize - Maximum number of entries kept before evicting the oldest
 */
export const createBoundedCache = <V>(maxSize: number = DEFAULT_MAX_CACHE_SIZE): BoundedCache<V> => {
  const store = new Map<string, V>()
  return {
    get: (key) => store.get(key),
    has: (key) => store.has(key),
    set: (key, value) => {
      if (store.size >= maxSize && !store.has(key)) {
        const oldestKey = store.keys().next().value
        if (oldestKey !== undefined) {
          store.delete(oldestKey)
        }
      }
      store.set(key, value)
    },
    clear: () => store.clear(),
  }
}

/**
 * Wraps a pure `(input: string) => V` function with a bounded memoization cache.
 * Only use for deterministic functions without side effects.
 * @param fn - Pure function to memoize
 * @param maxSize - Maximum number of cached results
 */
export const memoizeStringFn = <V>(
  fn: (input: string) => V,
  maxSize: number = DEFAULT_MAX_CACHE_SIZE,
): ((input: string) => V) => {
  const cache = createBoundedCache<V>(maxSize)
  return (input: string): V => {
    if (cache.has(input)) {
      return cache.get(input) as V
    }
    const result = fn(input)
    cache.set(input, result)
    return result
  }
}
