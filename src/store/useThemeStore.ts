import { create } from 'zustand';

export type Theme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'mm-theme-preference';

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'system' || stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return 'system';
}

function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const resolved = getResolvedTheme(theme);
  document.documentElement.setAttribute('data-theme', resolved);
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  // Initialize from localStorage
  const initialTheme = getStoredTheme();
  // Apply immediately on store creation
  applyTheme(initialTheme);

  // Listen for system theme changes when in 'system' mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    const currentTheme = useThemeStore.getState().theme;
    if (currentTheme === 'system') {
      applyTheme('system');
    }
  });

  return {
    theme: initialTheme,
    setTheme: (theme: Theme) => {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // localStorage not available
      }
      applyTheme(theme);
      set({ theme });
    },
  };
});
