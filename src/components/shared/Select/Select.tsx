import React, { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

import { useDropdownPosition } from '../../../hooks/useDropdownPosition'

import styles from './Select.module.css'

export interface SelectOption<T extends string | number = string> {
  value: T
  label: string
  icon?: React.ReactNode
}

export interface SelectProps<T extends string | number = string> {
  id?: string
  name?: string
  value: T
  onChange: (value: T) => void
  options: SelectOption<T>[]
  size?: 'sm' | 'md'
  align?: 'left' | 'right'
  disabled?: boolean
  className?: string
  placeholder?: string
  'aria-label'?: string
  onOpenChange?: (open: boolean) => void
}

export const Select = <T extends string | number = string>({
  id,
  name,
  value,
  onChange,
  options,
  size = 'md',
  align = 'left',
  disabled = false,
  className = '',
  placeholder,
  'aria-label': ariaLabel,
  onOpenChange,
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useDropdownPosition({
    isOpen,
    triggerRef: containerRef,
    dropdownRef,
    padding: 12,
    estimatedHeight: size === 'sm' ? 160 : 220,
  })

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: Event) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onOpenChange?.(false)
      }
    }

    document.addEventListener('pointerdown', handleClickOutside)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen, onOpenChange])

  const handleToggle = () => {
    if (disabled) return
    const next = !isOpen
    setIsOpen(next)
    onOpenChange?.(next)
    if (next) {
      const currentIndex = options.findIndex((opt) => opt.value === value)
      setFocusedIndex(currentIndex >= 0 ? currentIndex : 0)
    }
  }

  const handleSelect = (newValue: T) => {
    onChange(newValue)
    setIsOpen(false)
    onOpenChange?.(false)
    triggerRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault()
        setIsOpen(false)
        onOpenChange?.(false)
        triggerRef.current?.focus()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        onOpenChange?.(true)
        const currentIndex = options.findIndex((opt) => opt.value === value)
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0)
      } else {
        setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0))
      }
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        onOpenChange?.(true)
        const currentIndex = options.findIndex((opt) => opt.value === value)
        setFocusedIndex(currentIndex >= 0 ? currentIndex : options.length - 1)
      } else {
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1))
      }
      return
    }

    if (e.key === 'Enter' || e.key === ' ') {
      if (isOpen && focusedIndex >= 0 && focusedIndex < options.length) {
        e.preventDefault()
        handleSelect(options[focusedIndex].value)
      }
    }
  }

  const selectedOption = options.find((opt) => opt.value === value)
  const displayLabel = selectedOption ? selectedOption.label : (placeholder ?? String(value))

  const sizeClass = size === 'sm' ? styles.sizeSm : styles.sizeMd
  const alignClass = align === 'right' ? styles.dropdownAlignRight : styles.dropdownAlignLeft

  return (
    <div
      className={`${styles.container} ${isOpen ? styles.containerOpen : ''} ${className}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden native select for accessibility & automated tests compatibility */}
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => {
          const raw = e.target.value
          const matched = options.find((opt) => String(opt.value) === raw)
          if (matched) {
            onChange(matched.value)
          } else {
            onChange(raw as unknown as T)
          }
        }}
        disabled={disabled}
        aria-label={ariaLabel}
        tabIndex={-1}
        className={styles.hiddenNativeSelect}
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Visual accessible custom trigger button */}
      <button
        ref={triggerRef}
        type="button"
        id={id ? `${id}-custom-trigger` : undefined}
        data-testid={id ? `${id}-trigger` : 'select-trigger'}
        className={`${styles.trigger} ${sizeClass} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel ? `${ariaLabel}: ${displayLabel}` : displayLabel}
        aria-controls={id ? `${id}-listbox` : undefined}
      >
        <span className={styles.label}>
          {selectedOption?.icon && <span className={styles.labelIcon}>{selectedOption.icon}</span>}
          {displayLabel}
        </span>
        <ChevronDown
          size={size === 'sm' ? 13 : 15}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Custom Dropdown listbox */}
      {isOpen && (
        <div
          ref={dropdownRef}
          id={id ? `${id}-listbox` : undefined}
          className={`${styles.dropdown} ${alignClass} ${size === 'sm' ? styles.dropdownSm : ''}`}
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value
            const isFocused = index === focusedIndex

            return (
              <button
                key={String(opt.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`${styles.option} ${size === 'sm' ? styles.optionSm : ''} ${
                  isSelected ? styles.optionSelected : ''
                } ${isFocused ? styles.optionFocused : ''}`}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                {opt.icon && <span className={styles.optionIcon}>{opt.icon}</span>}
                <span className={styles.optionLabel}>{opt.label}</span>
                {isSelected && size !== 'sm' && (
                  <Check size={14} className={styles.checkIcon} aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
