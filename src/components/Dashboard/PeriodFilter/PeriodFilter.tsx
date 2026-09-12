import React, { useCallback } from 'react'
import { Calendar } from 'lucide-react'

import type { PeriodFilter as PeriodFilterType, PeriodMode } from '../../../hooks/useAnalytics'
import { useLanguageStore } from '../../../store/useLanguageStore'
import { CustomPeriodPicker } from './CustomPeriodPicker'

import styles from './PeriodFilter.module.css'

interface PeriodFilterProps {
  period: PeriodFilterType
  onPeriodChange: (period: PeriodFilterType) => void
  availableYears: string[]
  availableQuarters: string[]
  availableMonths: string[]
}

const MODES: PeriodMode[] = ['all', 'year', 'quarter', 'month']

export const PeriodFilter: React.FC<PeriodFilterProps> = ({
  period,
  onPeriodChange,
  availableYears,
  availableQuarters,
  availableMonths,
}) => {
  const { t } = useLanguageStore()

  const modeLabels: Record<PeriodMode, string> = {
    all: t.periodAll,
    year: t.periodYear,
    quarter: t.periodQuarter,
    month: t.periodMonth,
  }

  const handleModeChange = useCallback(
    (mode: PeriodMode) => {
      if (mode === 'all') {
        onPeriodChange({ mode, value: '' })
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
    [onPeriodChange, availableYears, availableQuarters, availableMonths],
  )

  const handleValueChange = useCallback(
    (value: string) => {
      onPeriodChange({ ...period, value })
    },
    [onPeriodChange, period],
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
      {period.mode !== 'all' && options.length > 0 && (
        <CustomPeriodPicker
          mode={period.mode}
          value={period.value}
          options={options}
          onChange={handleValueChange}
          ariaLabel={modeLabels[period.mode]}
        />
      )}
    </div>
  )
}
