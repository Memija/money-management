import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, Monitor, Moon, PieChart, PlusCircle, Settings,Sun } from 'lucide-react'

import { localeLabels, localeOrder } from '../../../i18n/translations'
import { useAppStore } from '../../../store/useAppStore'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { type Theme, useThemeStore } from '../../../store/useThemeStore'

import styles from './AppHeader.module.css'

const AppHeader: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useThemeStore()
  const { locale, t, setLocale } = useLanguageStore()
  const { importedAccounts, currentStep, cancelImport, resetImport, setStep } = useAppStore()
  const [isThemeOpen, setIsThemeOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const themeDropdownRef = useRef<HTMLDivElement>(null)
  const langDropdownRef = useRef<HTMLDivElement>(null)

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { 
      value: 'system', 
      label: t.themeSystem, 
      icon: (
        <div className={styles['system-theme-icon']}>
          <Monitor size={15} />
          {resolvedTheme === 'dark' ? <Moon size={10} opacity={0.7} /> : <Sun size={10} opacity={0.7} />}
        </div>
      ) 
    },
    { value: 'light', label: t.themeLight, icon: <Sun size={15} /> },
    { value: 'dark', label: t.themeDark, icon: <Moon size={15} /> },
  ]

  const currentThemeOption = themeOptions.find((o) => o.value === theme) || themeOptions[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setIsThemeOpen(false)
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsThemeOpen(false)
        setIsLangOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const showDashboardNav = (importedAccounts || []).length > 0 && currentStep !== 'dashboard'
  const showNewImportNav = currentStep === 'dashboard' || currentStep === 'settings'
  const showSettingsNav = currentStep === 'dashboard'

  return (
    <header className={styles['app-header']} id="app-header">
      <div className={styles['app-header-inner']}>
        <div className={styles['app-header-logo']}>
          <img src="/logo/logo.png" alt="Saldio logo" className={styles['app-header-logo-icon']} />
          <span className={styles['app-header-logo-text']}>{t.appName}</span>
        </div>

        <div className={styles['app-header-actions']}>
          {/* Dashboard nav — shown during import flow when data already exists */}
          {showDashboardNav && (
            <button
              className={styles['theme-switcher-trigger']}
              onClick={cancelImport}
              aria-label={t.goToDashboard}
              title={t.goToDashboard}
              id="header-go-to-dashboard-btn"
            >
              <span className={styles['theme-switcher-icon']}><PieChart size={15} /></span>
              <span className={styles['theme-switcher-label']}>{t.goToDashboard}</span>
            </button>
          )}

          {/* New Import nav — shown on the dashboard */}
          {showNewImportNav && (
            <button
              className={styles['theme-switcher-trigger']}
              onClick={resetImport}
              aria-label={t.newImport}
              title={t.newImport}
              id="header-new-import-btn"
            >
              <span className={styles['theme-switcher-icon']}><PlusCircle size={15} /></span>
              <span className={styles['theme-switcher-label']}>{t.newImport}</span>
            </button>
          )}

          {/* Settings nav */}
          {showSettingsNav && (
            <button
              className={styles['theme-switcher-trigger']}
              onClick={() => setStep('settings')}
              aria-label={t.settingsTitle || 'Settings'}
              title={t.settingsTitle || 'Settings'}
              id="header-settings-btn"
            >
              <span className={styles['theme-switcher-icon']}><Settings size={15} /></span>
              <span className={styles['theme-switcher-label']}>{t.settingsTitle || 'Settings'}</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className={styles['theme-switcher']} ref={langDropdownRef}>
            <button
              className={styles['theme-switcher-trigger']}
              onClick={() => {
                setIsLangOpen(!isLangOpen)
                setIsThemeOpen(false)
              }}
              aria-label={t.changeLanguage}
              {...{ 'aria-expanded': isLangOpen ? 'true' : 'false' }}
              id="language-switcher-btn"
            >
              <img
                src={localeLabels[locale].flag}
                alt={`${localeLabels[locale].native} flag`}
                className={`${styles['flag-icon']} ${styles['flag-icon-trigger']}`}
              />
              <span className={styles['theme-switcher-label']}>{localeLabels[locale].native}</span>
              <ChevronDown
                size={13}
                className={`${styles['theme-switcher-chevron']} ${isLangOpen ? styles.rotated : ''}`}
              />
            </button>

            {isLangOpen && (
              <div
                className={styles['theme-dropdown']}
                role="listbox"
                aria-label={t.changeLanguage}
              >
                {localeOrder.map((loc) => {
                  const isSelected = locale === loc
                  return (
                    <button
                      key={loc}
                      className={`${styles['theme-dropdown-item']} ${isSelected ? styles.active : ''}`}
                      onClick={() => {
                        setLocale(loc)
                        setIsLangOpen(false)
                      }}
                      role="option"
                      {...{ 'aria-selected': isSelected ? 'true' : 'false' }}
                      {...{ id: `language-option-${loc}` }}
                    >
                      <span className={styles['theme-dropdown-item-icon']}>
                        <img
                          src={localeLabels[loc].flag}
                          alt=""
                          className={`${styles['flag-icon']} ${styles['flag-icon-dropdown']}`}
                        />
                      </span>
                      <span className={styles['theme-dropdown-item-label']}>
                        {localeLabels[loc].native}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <div className={styles['theme-switcher']} ref={themeDropdownRef}>
            <button
              className={styles['theme-switcher-trigger']}
              onClick={() => {
                setIsThemeOpen(!isThemeOpen)
                setIsLangOpen(false)
              }}
              aria-label={t.changeTheme}
              {...{ 'aria-expanded': isThemeOpen ? 'true' : 'false' }}
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
                {themeOptions.map((option) => {
                  const isSelected = theme === option.value
                  return (
                    <button
                      key={option.value}
                      className={`${styles['theme-dropdown-item']} ${isSelected ? styles.active : ''}`}
                      onClick={() => {
                        setTheme(option.value)
                        setIsThemeOpen(false)
                      }}
                      role="option"
                      {...{ 'aria-selected': isSelected ? 'true' : 'false' }}
                      {...{ id: `theme-option-${option.value}` }}
                    >
                      <span className={styles['theme-dropdown-item-icon']}>{option.icon}</span>
                      <span className={styles['theme-dropdown-item-label']}>{option.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
