import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import type { TranslationStrings } from '../../../i18n/translations'

import styles from './RangeCalendar.module.css'

interface RangeCalendarProps {
  viewYear: number
  viewMonth: number
  monthNames: string[]
  weekdays: string[]
  blanks: number[]
  days: number[]
  draftStart: string | null
  draftEnd: string | null
  hoverDate: string | null
  todayStr: string
  minDate?: string
  maxDate?: string
  onPrevYear: () => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onNextYear: () => void
  onDayClick: (dateStr: string) => void
  onDayHover: (dateStr: string) => void
  t: TranslationStrings
}

export const RangeCalendar: React.FC<RangeCalendarProps> = React.memo(
  ({
    viewYear,
    viewMonth,
    monthNames,
    weekdays,
    blanks,
    days,
    draftStart,
    draftEnd,
    hoverDate,
    todayStr,
    minDate,
    maxDate,
    onPrevYear,
    onPrevMonth,
    onNextMonth,
    onNextYear,
    onDayClick,
    onDayHover,
    t,
  }) => {
    return (
      <div className={styles.calendar}>
        <div className={styles.calHeader}>
          <div className={styles.navGroup}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={onPrevYear}
              title={t.previousYear || 'Previous year'}
              aria-label={t.previousYear || 'Previous year'}
            >
              <ChevronsLeft size={15} />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={onPrevMonth}
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
              onClick={onNextMonth}
              title={t.nextMonth || 'Next month'}
              aria-label={t.nextMonth || 'Next month'}
            >
              <ChevronRight size={15} />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={onNextYear}
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
              draftStart && !draftEnd && hoverDate && dateStr > draftStart && dateStr <= hoverDate,
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
                  onClick={() => !isDisabled && onDayClick(dateStr)}
                  onMouseEnter={() => draftStart && !draftEnd && onDayHover(dateStr)}
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
    )
  },
)

RangeCalendar.displayName = 'RangeCalendar'
