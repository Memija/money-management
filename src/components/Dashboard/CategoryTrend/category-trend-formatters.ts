/**
 * Formats a currency value for chart axis display.
 * - Under €1,000: shows exact unit or clean decimal (€0, €5, €10, €150, €500)
 * - €1,000 to €999,999: shows compact 'k' notation (€1k, €1.5k, €20k, €150k)
 * - €1,000,000+: shows compact 'M' notation (€1M, €2.5M)
 */
export const formatCompactEuro = (v: number): string => {
  if (v === 0) {
    return '€0'
  }
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : ''

  const compact = (num: number): string =>
    num >= 100 ? num.toFixed(0) : num.toFixed(1).replace(/\.0$/, '')

  if (abs >= 1_000_000) {
    return `${sign}€${compact(abs / 1_000_000)}M`
  }
  if (abs >= 1_000) {
    return `${sign}€${compact(abs / 1_000)}k`
  }
  if (Number.isInteger(abs)) {
    return `${sign}€${abs}`
  }
  return `${sign}€${abs.toFixed(abs < 10 ? 2 : 1).replace(/\.?0+$/, '')}`
}

export const formatEuroThousands = formatCompactEuro
