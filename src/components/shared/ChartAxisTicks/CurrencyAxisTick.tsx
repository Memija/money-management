import React from 'react'

import { useFormatters } from '../../../hooks/useFormatters'
import { type AxisTickProps, AxisTickText } from './AxisTickText'

interface CurrencyAxisTickProps extends AxisTickProps {
  /** Maximum fraction digits for the formatted amount (defaults to whole units) */
  maximumFractionDigits?: number
}

/** Axis amounts are shown in whole currency units by default. */
const DEFAULT_FRACTION_DIGITS = 0

/**
 * Localized currency label for numeric Recharts axes.
 *
 * Like `MonthYearAxisTick`, pass it as a stable element instead of a locale-bound
 * `tickFormatter`, so a language switch doesn't force the whole chart to re-render.
 */
export const CurrencyAxisTick: React.FC<CurrencyAxisTickProps> = React.memo(
  ({ payload, maximumFractionDigits = DEFAULT_FRACTION_DIGITS, ...textProps }) => {
    const { formatCurrency } = useFormatters()
    const amount = Number(payload?.value ?? 0)
    return <AxisTickText {...textProps} label={formatCurrency(amount, maximumFractionDigits)} />
  },
)

CurrencyAxisTick.displayName = 'CurrencyAxisTick'
