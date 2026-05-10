import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';
import { useThemeStore, type Theme } from '../store/useThemeStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { localeLabels, localeOrder } from '../i18n/translations';
import styles from './AppHeader.module.css';

const AppHeader: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const { locale, t, setLocale } = useLanguageStore();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'system', label: t.themeSystem, icon: <Monitor size={15} /> },
    { value: 'light', label: t.themeLight, icon: <Sun size={15} /> },
    { value: 'dark', label: t.themeDark, icon: <Moon size={15} /> },
  ];

  const currentThemeOption = themeOptions.find((o) => o.value === theme) || themeOptions[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setIsThemeOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsThemeOpen(false);
        setIsLangOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <header className={styles['app-header']} id="app-header">
      <div className={styles['app-header-inner']}>
        <div className={styles['app-header-logo']}>
          <div className={styles['app-header-logo-icon']}>
            <img src="/logo/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
          </div>
          <span className={styles['app-header-logo-text']}>{t.appName}</span>
        </div>

        <div className={styles['app-header-actions']}>

          {/* Language Switcher */}
          <div className={styles['theme-switcher']} ref={langDropdownRef}>
            <button
              className={styles['theme-switcher-trigger']}
              onClick={() => { setIsLangOpen(!isLangOpen); setIsThemeOpen(false); }}
              aria-label={t.changeLanguage}
              aria-expanded={isLangOpen}
              id="language-switcher-btn"
            >
              <img 
                src={localeLabels[locale].flag} 
                alt={`${localeLabels[locale].native} flag`} 
                className="country-flag-sm"
                style={{ marginLeft: 0, marginRight: '0.4rem' }}
              />
              <span className={styles['theme-switcher-label']}>{localeLabels[locale].native}</span>
              <ChevronDown
                size={13}
                className={`${styles['theme-switcher-chevron']} ${isLangOpen ? styles.rotated : ''}`}
              />
            </button>

            {isLangOpen && (
              <div className={styles['theme-dropdown']} role="listbox" aria-label={t.changeLanguage}>
                {localeOrder.map((loc) => (
                  <button
                    key={loc}
                    className={`${styles['theme-dropdown-item']} ${locale === loc ? styles.active : ''}`}
                    onClick={() => {
                      setLocale(loc);
                      setIsLangOpen(false);
                    }}
                    role="option"
                    aria-selected={locale === loc}
                    id={`language-option-${loc}`}
                  >
                    <span className={styles['theme-dropdown-item-icon']}>
                      <img 
                        src={localeLabels[loc].flag} 
                        alt="" 
                        className="country-flag-sm" 
                        style={{ marginLeft: 0 }}
                      />
                    </span>
                    <span className={styles['theme-dropdown-item-label']}>{localeLabels[loc].native}</span>
                    {locale === loc && (
                      <Check size={14} className={styles['theme-dropdown-check']} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <div className={styles['theme-switcher']} ref={themeDropdownRef}>
            <button
              className={styles['theme-switcher-trigger']}
              onClick={() => { setIsThemeOpen(!isThemeOpen); setIsLangOpen(false); }}
              aria-label={t.changeTheme}
              aria-expanded={isThemeOpen}
              id="theme-switcher-btn"
            >
              <span className={styles['theme-switcher-icon']}>{currentThemeOption.icon}</span>
              <span className={styles['theme-switcher-label']}>{currentThemeOption.label}</span>
              <ChevronDown
                size={13}
                className={`${styles['theme-switcher-chevron']} ${isThemeOpen ? styles.rotated : ''}`}
              />
            </button>

            {isThemeOpen && (
              <div className={styles['theme-dropdown']} role="listbox" aria-label={t.themeOptions}>
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`${styles['theme-dropdown-item']} ${theme === option.value ? styles.active : ''}`}
                    onClick={() => {
                      setTheme(option.value);
                      setIsThemeOpen(false);
                    }}
                    role="option"
                    aria-selected={theme === option.value}
                    id={`theme-option-${option.value}`}
                  >
                    <span className={styles['theme-dropdown-item-icon']}>{option.icon}</span>
                    <span className={styles['theme-dropdown-item-label']}>{option.label}</span>
                    {theme === option.value && (
                      <Check size={14} className={styles['theme-dropdown-check']} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
};

export default AppHeader;
