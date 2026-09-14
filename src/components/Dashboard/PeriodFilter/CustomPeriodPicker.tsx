import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

import type { PeriodMode } from '../../../hooks/useAnalytics'
import { useDropdownPosition } from '../../../hooks/useDropdownPosition'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { formatMonthYearLocalized, getLocalizedMonthNames } from '../../../utils/date-utils'

import styles from './CustomPeriodPicker.module.css'

interface CustomPeriodPickerProps {
  mode: PeriodMode
  value: string
  options: string[]
  onChange: (value: string) => void
  ariaLabel?: string
}

export const CustomPeriodPicker: React.FC<CustomPeriodPickerProps> = ({
  mode,
  value,
  options,
  onChange,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { locale } = useLanguageStore()

  useDropdownPosition({
    isOpen,
    triggerRef: containerRef,
    dropdownRef,
    padding: 12,
    estimatedHeight: 220,
  })

  // Initialize view year based on selected value or the most recent option
  const initialYear = useMemo(() => {
    if (value) {
      return parseInt(value.split('-')[0], 10)
    }
    if (options.length > 0) {
      return parseInt(options[0].split('-')[0], 10)
    }
    return new Date().getFullYear()
  }, [value, options])

  const [viewYear, setViewYear] = useState<number>(initialYear)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = () => {
    if (!isOpen) {
      setViewYear(initialYear)
    }
    setIsOpen(!isOpen)
  }

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setIsOpen(false)
  }

  // --- Display Label Formatting ---
  const displayLabel = useMemo(() => {
    if (!value) return ''
    if (mode === 'year') return value
    if (mode === 'quarter') {
      const [y, q] = value.split('-')
      return `${q} ${y}`
    }
    if (mode === 'month') {
      return formatMonthYearLocalized(value, locale, 'numeric')
    }
    return value
  }, [value, mode, locale])

  // --- Grid Data Generation ---
  const availableYears = useMemo(() => {
    const years = new Set(options.map((opt) => parseInt(opt.split('-')[0], 10)))
    return Array.from(years).sort((a, b) => b - a) // descending
  }, [options])

  const monthNames = useMemo(() => getLocalizedMonthNames(locale, 'short'), [locale])

  // --- Rendering Grid Items ---
  const renderYearGrid = () => {
    return (
      <div className={`${styles.grid} ${styles.years}`}>
        {availableYears.map((year) => (
          <button
            key={year}
            className={`${styles.item} ${value === year.toString() ? styles.selected : ''}`}
            onClick={() => handleSelect(year.toString())}
          >
            {year}
          </button>
        ))}
      </div>
    )
  }

  const renderQuarterGrid = () => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
    return (
      <div className={styles.grid}>
        {quarters.map((q) => {
          const quarterValue = `${viewYear}-${q}`
          const isAvailable = options.includes(quarterValue)
          const isSelected = value === quarterValue
          return (
            <button
              key={q}
              className={`
                ${styles.item} 
                ${isSelected ? styles.selected : ''} 
                ${!isAvailable && !isSelected ? styles.disabled : ''}
              `}
              disabled={!isAvailable && !isSelected}
              onClick={() => handleSelect(quarterValue)}
            >
              {q}
            </button>
          )
        })}
      </div>
    )
  }

  const renderMonthGrid = () => {
    return (
      <div className={styles.grid}>
        {monthNames.map((month, index) => {
          const monthStr = String(index + 1).padStart(2, '0')
          const monthValue = `${viewYear}-${monthStr}`
          const isAvailable = options.includes(monthValue)
          const isSelected = value === monthValue
          return (
            <button
              key={monthValue}
              className={`
                ${styles.item} 
                ${isSelected ? styles.selected : ''} 
                ${!isAvailable && !isSelected ? styles.disabled : ''}
              `}
              disabled={!isAvailable && !isSelected}
              onClick={() => handleSelect(monthValue)}
            >
              {month}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={styles.trigger}
        onClick={toggleDropdown}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        <span>{displayLabel}</span>
        <ChevronDown className={styles.icon} />
      </button>

      {isOpen && (
        <div ref={dropdownRef} className={styles.dropdown}>
          {mode !== 'year' && (
            <div className={styles.header}>
              <button
                className={styles['nav-button']}
                onClick={(e) => {
                  e.stopPropagation()
                  setViewYear(viewYear - 1)
                }}
                disabled={!availableYears.includes(viewYear - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span>{viewYear}</span>
              <button
                className={styles['nav-button']}
                onClick={(e) => {
                  e.stopPropagation()
                  setViewYear(viewYear + 1)
                }}
                disabled={!availableYears.includes(viewYear + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {mode === 'year' && renderYearGrid()}
          {mode === 'quarter' && renderQuarterGrid()}
          {mode === 'month' && renderMonthGrid()}
        </div>
      )}
    </div>
  )
}
