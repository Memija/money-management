import React, { useCallback } from 'react'
import { Calendar } from 'lucide-react'

import type { PeriodFilter as PeriodFilterType, PeriodMode } from '../../../hooks/useAnalytics'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { CustomPeriodPicker } from './CustomPeriodPicker'
import { CustomRangePicker } from './CustomRangePicker'

import styles from './PeriodFilter.module.css'

interface PeriodFilterProps {
  period: PeriodFilterType
  onPeriodChange: (period: PeriodFilterType) => void
  availableYears: string[]
  availableQuarters: string[]
  availableMonths: string[]
  minDate?: string
  maxDate?: string
}

const MODES: PeriodMode[] = ['all', 'year', 'quarter', 'month', 'custom']

export const PeriodFilter: React.FC<PeriodFilterProps> = React.memo(
  ({
    period,
    onPeriodChange,
    availableYears,
    availableQuarters,
    availableMonths,
    minDate,
    maxDate,
  }) => {
    const t = useLanguageStore((s) => s.t)

    const modeLabels: Record<PeriodMode, string> = {
      all: t.periodAll,
      year: t.periodYear,
      quarter: t.periodQuarter,
      month: t.periodMonth,
      custom: t.periodCustom || 'Custom',
    }

    const handleModeChange = useCallback(
      (mode: PeriodMode) => {
        if (mode === 'all') {
          onPeriodChange({ mode, value: '' })
          return
        }

        if (mode === 'custom') {
          const start =
            period.startDate ||
            minDate ||
            (availableMonths.length > 0 ? `${availableMonths[availableMonths.length - 1]}-01` : '')
          let end = period.endDate || maxDate
          if (!end && availableMonths.length > 0) {
            const [y, m] = availableMonths[0].split('-').map(Number)
            const lastDay = new Date(y, m, 0).getDate()
            end = `${availableMonths[0]}-${String(lastDay).padStart(2, '0')}`
          }
          onPeriodChange({
            mode: 'custom',
            value: start && end ? `${start}..${end}` : '',
            startDate: start,
            endDate: end,
          })
          return
        }

        // Auto-select the most recent available period
        let defaultValue = ''
        if (mode === 'year' && availableYears.length > 0) {
          defaultValue = availableYears[0]
        } else if (mode === 'quarter' && availableQuarters.length > 0) {
          defaultValue = availableQuarters[0]
        } else if (mode === 'month' && availableMonths.length > 0) {
          defaultValue = availableMonths[0]
        }
        onPeriodChange({ mode, value: defaultValue })
      },
      [
        onPeriodChange,
        availableYears,
        availableQuarters,
        availableMonths,
        minDate,
        maxDate,
        period.startDate,
        period.endDate,
      ],
    )

    const handleValueChange = useCallback(
      (value: string) => {
        onPeriodChange({ ...period, value })
      },
      [onPeriodChange, period],
    )

    const handleCustomRangeChange = useCallback(
      (startDate: string, endDate: string) => {
        onPeriodChange({
          mode: 'custom',
          value: startDate && endDate ? `${startDate}..${endDate}` : startDate || endDate || '',
          startDate,
          endDate,
        })
      },
      [onPeriodChange],
    )

    const getOptions = (): string[] => {
      switch (period.mode) {
        case 'year':
          return availableYears
        case 'quarter':
          return availableQuarters
        case 'month':
          return availableMonths
        default:
          return []
      }
    }

    const options = getOptions()

    return (
      <div className={styles.wrapper}>
        <Calendar size={15} className={styles.icon} />
        <div className={styles.pills}>
          {MODES.map((mode) => (
            <button
              key={mode}
              className={`${styles.pill} ${period.mode === mode ? styles.active : ''}`}
              onClick={() => handleModeChange(mode)}
              aria-label={modeLabels[mode]}
              title={modeLabels[mode]}
            >
              {modeLabels[mode]}
            </button>
          ))}
        </div>
        {period.mode !== 'all' && period.mode !== 'custom' && options.length > 0 && (
          <CustomPeriodPicker
            mode={period.mode}
            value={period.value}
            options={options}
            onChange={handleValueChange}
            ariaLabel={modeLabels[period.mode]}
          />
        )}
        {period.mode === 'custom' && (
          <CustomRangePicker
            startDate={period.startDate}
            endDate={period.endDate}
            minDate={minDate}
            maxDate={maxDate}
            onChange={handleCustomRangeChange}
            ariaLabel={t.customPeriodRange || modeLabels.custom}
          />
        )}
      </div>
    )
  },
)

PeriodFilter.displayName = 'PeriodFilter'
