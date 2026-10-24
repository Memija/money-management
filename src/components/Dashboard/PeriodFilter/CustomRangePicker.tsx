import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowRight,
  CalendarRange,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
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

    const t = useLanguageStore((s) => s.t)
    const locale = useLanguageStore((s) => s.locale)
    const { formatDate } = useFormatters()

    useDropdownPosition({
      isOpen,
      triggerRef: containerRef,
      dropdownRef,
      padding: 12,
      estimatedHeight: 520,
      usePortal: true,
      align: 'right',
    })

    // Local draft state
    const [draftStart, setDraftStart] = useState<string>(startDate)
    const [draftEnd, setDraftEnd] = useState<string>(endDate)
    const [prevProps, setPrevProps] = useState({ startDate, endDate })
    const [hoverDate, setHoverDate] = useState<string | null>(null)

    // Sync state when props change externally
    if (prevProps.startDate !== startDate || prevProps.endDate !== endDate) {
      setPrevProps({ startDate, endDate })
      setDraftStart(startDate)
      setDraftEnd(endDate)
    }

    // Anchor initial view month on startDate or maxDate
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
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          setIsOpen(false)
        }
      }

      document.addEventListener('pointerdown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('pointerdown', handleClickOutside)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }, [isOpen])

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

    // Preset handlers
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
          s = minDate ? minDate.substring(0, 10) : ''
          e = maxDate ? maxDate.substring(0, 10) : ''
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
        setDraftStart(dateStr)
        setDraftEnd('')
        onChange(dateStr, '')
      } else {
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

    // Selected day duration calculation
    const selectedDayCount = useMemo(() => {
      if (!draftStart || !draftEnd) {
        return 0
      }
      const d1 = new Date(draftStart)
      const d2 = new Date(draftEnd)
      const diffTime = Math.abs(d2.getTime() - d1.getTime())
      return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1
    }, [draftStart, draftEnd])

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
          type="button"
          className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''}`}
          onClick={toggleDropdown}
          aria-label={ariaLabel || triggerLabel}
          title={triggerLabel}
          aria-expanded={isOpen}
        >
          <CalendarRange size={14} className={styles.triggerIcon} />
          <span className={styles.triggerLabel}>{triggerLabel}</span>
          {startDate && endDate && selectedDayCount > 0 && (
            <span className={styles.triggerBadge}>{selectedDayCount}d</span>
          )}
          <ChevronDown
            size={13}
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          />
        </button>

        {isOpen &&
          createPortal(
            <div ref={dropdownRef} className={styles.dropdown} role="dialog" aria-modal="true">
              {/* Presets segment */}
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
                  {t.periodAll || 'All time'}
                </button>
              </div>

              {/* Range Preview Card */}
              <div className={styles.rangeDisplayCard}>
                <div className={`${styles.rangeBox} ${!draftStart ? styles.rangeBoxActive : ''}`}>
                  <span className={styles.rangeLabel}>{t.fromDate || 'From'}</span>
                  <span className={draftStart ? styles.rangeDate : styles.rangePlaceholder}>
                    {draftStart ? formatDate(draftStart) : t.selectDatePlaceholder || 'Start date'}
                  </span>
                </div>

                <div className={styles.rangeConnector}>
                  <div className={styles.arrowCircle}>
                    <ArrowRight size={13} />
                  </div>
                  {selectedDayCount > 0 && (
                    <span className={styles.durationPill}>
                      {selectedDayCount} {selectedDayCount === 1 ? 'Tag' : 'Tage'}
                    </span>
                  )}
                </div>

                <div
                  className={`${styles.rangeBox} ${draftStart && !draftEnd ? styles.rangeBoxActive : ''}`}
                >
                  <span className={styles.rangeLabel}>{t.toDate || 'To'}</span>
                  <span className={draftEnd ? styles.rangeDate : styles.rangePlaceholder}>
                    {draftEnd ? formatDate(draftEnd) : t.selectDatePlaceholder || 'End date'}
                  </span>
                </div>
              </div>

              {/* Calendar Container */}
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

                  <div className={styles.calTitleWrapper}>
                    <span className={styles.calMonth}>{monthNames[viewMonth]}</span>
                    <span className={styles.calYear}>{viewYear}</span>
                  </div>

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

                {/* Weekdays */}
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
                    const isDisabled = Boolean(
                      (minDate && dateStr < minDate) || (maxDate && dateStr > maxDate),
                    )

                    return (
                      <div
                        key={`cell-${d}`}
                        className={`
                          ${styles.dayCell}
                          ${isInRange ? styles.cellInRange : ''}
                          ${isStart && !isEnd && draftEnd ? styles.cellRangeStart : ''}
                          ${isEnd && !isStart ? styles.cellRangeEnd : ''}
                          ${isHoverPreview ? styles.cellHoverPreview : ''}
                        `}
                      >
                        <button
                          type="button"
                          className={`
                            ${styles.dayBtn}
                            ${isStart || isEnd ? styles.dayBtnSelected : ''}
                            ${isToday ? styles.dayBtnToday : ''}
                            ${isSingleDay ? styles.singleDayRange : ''}
                          `}
                          onClick={() => !isDisabled && handleDayClick(dateStr)}
                          onMouseEnter={() => draftStart && !draftEnd && setHoverDate(dateStr)}
                          aria-label={`${d}`}
                          disabled={isDisabled}
                        >
                          <span className={styles.dayNum}>{d}</span>
                          {isToday && !(isStart || isEnd) && <span className={styles.todayDot} />}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer with status and actions */}
              <div className={styles.actions}>
                <div className={styles.footerStatus}>
                  {draftStart && draftEnd ? (
                    <span className={styles.statusSuccess}>
                      <Check size={13} className={styles.statusSuccessIcon} />
                      {selectedDayCount} {selectedDayCount === 1 ? 'Tag' : 'Tage'}
                    </span>
                  ) : draftStart ? (
                    <span className={styles.statusPending}>
                      {t.selectDatePlaceholder || 'Enddatum wählen...'}
                    </span>
                  ) : (
                    <span className={styles.statusMuted}>
                      {t.selectDateRange || 'Zeitraum wählen'}
                    </span>
                  )}
                </div>

                <div className={styles.footerActions}>
                  {(draftStart || draftEnd) && (
                    <button
                      type="button"
                      className={styles.clearBtn}
                      onClick={handleClear}
                      aria-label={t.clearDate || t.clear || 'Clear'}
                    >
                      <RotateCcw size={12} />
                      <span>{t.clearDate || t.clear || 'Clear'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.applyBtn}
                    onClick={handleApply}
                    aria-label={t.done || 'Done'}
                  >
                    <Check size={13} />
                    <span>{t.done || 'Done'}</span>
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    )
  },
)

CustomRangePicker.displayName = 'CustomRangePicker'
