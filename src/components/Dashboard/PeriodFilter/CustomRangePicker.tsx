import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { useDropdownPosition } from '../../../hooks/useDropdownPosition'
import { useFormatters } from '../../../hooks/useFormatters'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { getLocalizedMonthNames, getLocalizedWeekdays } from '../../../utils/date-utils'

import styles from './CustomRangePicker.module.css'

export interface CustomRangePickerProps {
  startDate?: string
  endDate?: string
  onChange: (startDate: string, endDate: string) => void
  minDate?: string
  maxDate?: string
  ariaLabel?: string
}

const formatDateToISO = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const CustomRangePicker: React.FC<CustomRangePickerProps> = React.memo(
  ({ startDate = '', endDate = '', onChange, minDate = '', maxDate = '', ariaLabel }) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const fromInputId = useId()
    const toInputId = useId()

    const t = useLanguageStore((s) => s.t)
    const locale = useLanguageStore((s) => s.locale)
    const { formatDate } = useFormatters()

    useDropdownPosition({
      isOpen,
      triggerRef: containerRef,
      dropdownRef,
      padding: 12,
      estimatedHeight: 390,
      usePortal: true,
      align: 'right',
    })

    // Local draft dates
    const [draftStart, setDraftStart] = useState<string>(startDate)
    const [draftEnd, setDraftEnd] = useState<string>(endDate)
    const [prevProps, setPrevProps] = useState({ startDate, endDate })
    const [hoverDate, setHoverDate] = useState<string | null>(null)

    // Adjust state during render when props change
    if (prevProps.startDate !== startDate || prevProps.endDate !== endDate) {
      setPrevProps({ startDate, endDate })
      setDraftStart(startDate)
      setDraftEnd(endDate)
    }

    // Anchor view month/year based on start date or max date
    const initialViewDate = useMemo(() => {
      const anchor = startDate || maxDate || formatDateToISO(new Date())
      const [y, m] = anchor.split('-').map(Number)
      if (!isNaN(y) && !isNaN(m)) {
        return new Date(y, m - 1, 1)
      }
      return new Date()
    }, [startDate, maxDate])

    const [viewDate, setViewDate] = useState<Date>(initialViewDate)

    useEffect(() => {
      const handleClickOutside = (event: Event) => {
        const target = event.target as Node
        if (
          containerRef.current &&
          !containerRef.current.contains(target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(target)
        ) {
          setIsOpen(false)
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
    }, [])

    const toggleDropdown = () => {
      if (!isOpen) {
        setDraftStart(startDate)
        setDraftEnd(endDate)
        setViewDate(initialViewDate)
      }
      setIsOpen((prev) => !prev)
    }

    const monthNames = useMemo(() => getLocalizedMonthNames(locale, 'long'), [locale])
    const weekdays = useMemo(() => getLocalizedWeekdays(locale), [locale])

    const viewYear = viewDate.getFullYear()
    const viewMonth = viewDate.getMonth()

    const handlePrevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1))
    const handleNextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1))
    const handlePrevYear = () => setViewDate(new Date(viewYear - 1, viewMonth, 1))
    const handleNextYear = () => setViewDate(new Date(viewYear + 1, viewMonth, 1))

    // Preset handler
    const applyPreset = useCallback(
      (type: '30d' | '90d' | 'thisYear' | 'lastYear' | 'all') => {
        const anchor = maxDate || formatDateToISO(new Date())
        const anchorDate = new Date(`${anchor}T00:00:00`)
        const anchorYear = anchorDate.getFullYear()

        let s = ''
        let e = ''

        if (type === '30d') {
          e = anchor
          const startObj = new Date(anchorDate.getTime() - 29 * 86400000)
          s = formatDateToISO(startObj)
        } else if (type === '90d') {
          e = anchor
          const startObj = new Date(anchorDate.getTime() - 89 * 86400000)
          s = formatDateToISO(startObj)
        } else if (type === 'thisYear') {
          s = `${anchorYear}-01-01`
          e = `${anchorYear}-12-31`
        } else if (type === 'lastYear') {
          s = `${anchorYear - 1}-01-01`
          e = `${anchorYear - 1}-12-31`
        } else if (type === 'all') {
          s = minDate
          e = maxDate
        }

        setDraftStart(s)
        setDraftEnd(e)
        onChange(s, e)
        if (s) {
          const [sy, sm] = s.split('-').map(Number)
          setViewDate(new Date(sy, sm - 1, 1))
        }
      },
      [maxDate, minDate, onChange],
    )

    const handleDayClick = (dateStr: string) => {
      if (!draftStart || (draftStart && draftEnd)) {
        // Start a fresh selection
        setDraftStart(dateStr)
        setDraftEnd('')
        onChange(dateStr, '')
      } else {
        // Complete the selection
        if (dateStr < draftStart) {
          setDraftStart(dateStr)
          setDraftEnd(draftStart)
          onChange(dateStr, draftStart)
        } else {
          setDraftEnd(dateStr)
          onChange(draftStart, dateStr)
        }
      }
    }

    const handleClear = () => {
      setDraftStart('')
      setDraftEnd('')
      onChange('', '')
    }

    const handleApply = () => {
      onChange(draftStart, draftEnd)
      setIsOpen(false)
    }

    // Days grid calculation
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
    const blanks = Array.from({ length: firstDayIndex }, (_, i) => i)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    const todayStr = formatDateToISO(new Date())

    const triggerLabel = useMemo(() => {
      if (startDate && endDate) {
        return `${formatDate(startDate)} – ${formatDate(endDate)}`
      }
      if (startDate) {
        return `≥ ${formatDate(startDate)}`
      }
      if (endDate) {
        return `≤ ${formatDate(endDate)}`
      }
      return t.selectDateRange || t.customPeriodRange || 'Select date range'
    }, [startDate, endDate, formatDate, t])

    return (
      <div className={styles.container} ref={containerRef}>
        <button
          className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''}`}
          onClick={toggleDropdown}
          aria-label={ariaLabel || triggerLabel}
          title={triggerLabel}
          aria-expanded={isOpen}
        >
          <Calendar size={13} className={styles.triggerIcon} />
          <span className={styles.triggerLabel}>{triggerLabel}</span>
          <ChevronDown
            size={14}
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          />
        </button>

        {isOpen &&
          createPortal(
            <div ref={dropdownRef} className={styles.dropdown} role="dialog" aria-modal="true">
              <div className={styles.presets}>
                <button
                  type="button"
                  className={styles.presetBtn}
                  onClick={() => applyPreset('30d')}
                >
                  {t.last30Days || 'Last 30 days'}
                </button>
                <button
                  type="button"
                  className={styles.presetBtn}
                  onClick={() => applyPreset('90d')}
                >
                  {t.last90Days || 'Last 90 days'}
                </button>
                <button
                  type="button"
                  className={styles.presetBtn}
                  onClick={() => applyPreset('thisYear')}
                >
                  {t.thisYear || 'This year'}
                </button>
                <button
                  type="button"
                  className={styles.presetBtn}
                  onClick={() => applyPreset('lastYear')}
                >
                  {t.lastYear || 'Last year'}
                </button>
                <button
                  type="button"
                  className={styles.presetBtn}
                  onClick={() => applyPreset('all')}
                >
                  {t.periodAll || 'All Time'}
                </button>
              </div>

              <div className={styles.inputsRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor={fromInputId} className={styles.inputLabel}>
                    {t.fromDate || 'From'}
                  </label>
                  <input
                    id={fromInputId}
                    type="date"
                    className={styles.dateInput}
                    value={draftStart}
                    onChange={(e) => {
                      setDraftStart(e.target.value)
                      onChange(e.target.value, draftEnd)
                    }}
                    max={draftEnd || undefined}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor={toInputId} className={styles.inputLabel}>
                    {t.toDate || 'To'}
                  </label>
                  <input
                    id={toInputId}
                    type="date"
                    className={styles.dateInput}
                    value={draftEnd}
                    onChange={(e) => {
                      setDraftEnd(e.target.value)
                      onChange(draftStart, e.target.value)
                    }}
                    min={draftStart || undefined}
                  />
                </div>
              </div>

              <div className={styles.calendar}>
                <div className={styles.calHeader}>
                  <div className={styles.navGroup}>
                    <button
                      type="button"
                      className={styles.navBtn}
                      onClick={handlePrevYear}
                      title={t.previousYear || 'Previous year'}
                      aria-label={t.previousYear || 'Previous year'}
                    >
                      <ChevronsLeft size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.navBtn}
                      onClick={handlePrevMonth}
                      title={t.previousMonth || 'Previous month'}
                      aria-label={t.previousMonth || 'Previous month'}
                    >
                      <ChevronLeft size={15} />
                    </button>
                  </div>

                  <span className={styles.calTitle}>
                    {monthNames[viewMonth]} {viewYear}
                  </span>

                  <div className={styles.navGroup}>
                    <button
                      type="button"
                      className={styles.navBtn}
                      onClick={handleNextMonth}
                      title={t.nextMonth || 'Next month'}
                      aria-label={t.nextMonth || 'Next month'}
                    >
                      <ChevronRight size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.navBtn}
                      onClick={handleNextYear}
                      title={t.nextYear || 'Next year'}
                      aria-label={t.nextYear || 'Next year'}
                    >
                      <ChevronsRight size={15} />
                    </button>
                  </div>
                </div>

                <div className={styles.grid}>
                  {weekdays.map((wd) => (
                    <div key={wd} className={styles.weekday}>
                      {wd}
                    </div>
                  ))}

                  {blanks.map((b) => (
                    <div key={`blank-${b}`} className={styles.emptyCell} />
                  ))}

                  {days.map((d) => {
                    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                    const isStart = dateStr === draftStart
                    const isEnd = dateStr === draftEnd
                    const isSingleDay = isStart && isEnd
                    const isInRange = Boolean(
                      draftStart && draftEnd && dateStr > draftStart && dateStr < draftEnd,
                    )
                    const isHoverPreview = Boolean(
                      draftStart &&
                      !draftEnd &&
                      hoverDate &&
                      dateStr > draftStart &&
                      dateStr <= hoverDate,
                    )
                    const isToday = dateStr === todayStr

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        className={`
                          ${styles.dayBtn}
                          ${isToday ? styles.today : ''}
                          ${isStart ? styles.rangeStart : ''}
                          ${isEnd ? styles.rangeEnd : ''}
                          ${isSingleDay ? styles.singleDayRange : ''}
                          ${isInRange ? styles.inRange : ''}
                          ${isHoverPreview ? styles.hoverPreview : ''}
                        `}
                        onClick={() => handleDayClick(dateStr)}
                        onMouseEnter={() => setHoverDate(dateStr)}
                        onMouseLeave={() => setHoverDate(null)}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className={styles.actions}>
                <button type="button" className={styles.clearBtn} onClick={handleClear}>
                  {t.clearDate || 'Clear'}
                </button>
                <button type="button" className={styles.applyBtn} onClick={handleApply}>
                  {t.done || 'Apply'}
                </button>
              </div>
            </div>,
            document.body,
          )}
      </div>
    )
  },
)

CustomRangePicker.displayName = 'CustomRangePicker'
