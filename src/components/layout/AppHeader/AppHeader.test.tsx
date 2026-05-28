import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppHeader from './AppHeader';
import { useThemeStore } from '../../../store/useThemeStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useAppStore } from '../../../store/useAppStore';

// Mock the stores
vi.mock('../../../store/useThemeStore', () => ({
  useThemeStore: vi.fn(),
}));

vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: vi.fn(),
  localeLabels: {
    en: { native: 'English', flag: 'en-flag' },
    ba: { native: 'Bosanski', flag: 'ba-flag' },
  },
  localeOrder: ['en', 'ba'],
}));

vi.mock('../../../store/useAppStore', () => ({
  useAppStore: vi.fn(),
}));

describe('AppHeader', () => {
  const mockSetTheme = vi.fn();
  const mockSetLocale = vi.fn();
  const mockT = {
    appName: 'Money App',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    changeLanguage: 'Change Language',
    changeTheme: 'Change Theme',
    themeOptions: 'Theme Options',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useThemeStore).mockImplementation(() => ({
      theme: 'system',
      setTheme: mockSetTheme,
    } as ReturnType<typeof useThemeStore>));

    vi.mocked(useLanguageStore).mockImplementation(() => ({
      locale: 'en',
      t: mockT,
      setLocale: mockSetLocale,
    } as ReturnType<typeof useLanguageStore>));

    vi.mocked(useAppStore).mockImplementation(() => ({
    } as ReturnType<typeof useAppStore>));
  });

  it('renders correctly', () => {
    render(<AppHeader />);
    expect(screen.getByText('Money App')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('opens language dropdown and changes language', () => {
    render(<AppHeader />);

    fireEvent.click(screen.getByText('English'));
    expect(screen.getByText('Bosanski')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Bosanski'));
    expect(mockSetLocale).toHaveBeenCalledWith('bs');
  });

  it('opens theme dropdown and changes theme', () => {
    render(<AppHeader />);

    fireEvent.click(screen.getByText('System'));
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Light'));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });


  it('closes dropdowns on escape key', () => {
    render(<AppHeader />);

    fireEvent.click(screen.getByText('English'));
    expect(screen.getByText('Bosanski')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Bosanski')).not.toBeInTheDocument();
  });
});
