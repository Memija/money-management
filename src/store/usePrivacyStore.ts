import { create } from 'zustand'

const STORAGE_KEY = 'saldio-privacy-mode'

function getStoredPrivacyMode(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch (e) {
    console.debug('localStorage not available:', e)
    return false
  }
}

export function applyPrivacyModeToDocument(isPrivate: boolean): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-privacy-mode', isPrivate ? 'true' : 'false')
  }
}

interface PrivacyState {
  isPrivacyMode: boolean
  togglePrivacyMode: () => void
  setPrivacyMode: (value: boolean) => void
}

export const usePrivacyStore = create<PrivacyState>((set) => {
  const initial = getStoredPrivacyMode()
  applyPrivacyModeToDocument(initial)

  return {
    isPrivacyMode: initial,
    togglePrivacyMode: () => {
      set((state) => {
        const next = !state.isPrivacyMode
        try {
          localStorage.setItem(STORAGE_KEY, String(next))
        } catch (e) {
          console.warn('Failed to save privacy mode to localStorage:', e)
        }
        applyPrivacyModeToDocument(next)
        return { isPrivacyMode: next }
      })
    },
    setPrivacyMode: (value: boolean) => {
      try {
        localStorage.setItem(STORAGE_KEY, String(value))
      } catch (e) {
        console.warn('Failed to save privacy mode to localStorage:', e)
      }
      applyPrivacyModeToDocument(value)
      set({ isPrivacyMode: value })
    },
  }
})
