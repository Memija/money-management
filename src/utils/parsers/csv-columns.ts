import type { Transaction } from '../../types'
import { extractIbans } from '../account-transfers'
import { type ColumnIndices, headerMatches } from './csv-header-detection'
import {
  EXPLICIT_INCOME_KEYWORDS_REGEX,
  generateId,
  inferType,
  isValidDateRaw,
  parseAmount,
  parseCurrency,
  parseDate,
} from './helpers'

export * from './csv-header-detection'

const GENERIC_BOOKING_TYPE_RE =
  /^(?:(?:sepa-)?(?:basis|folge|erst|sammel|firmen)?lastschrift(?:\s+basislastschrift)?|kartenzahlung|girocard|dauerauftrag|(?:echtzeit-?|sepa-?)?(?:ü|ue)berweisung|gutschrift|gehaltsgutschrift|lohn(?:[,\s/]+gehalt(?:[,\s/]+rente)?)?|abrechnung|entgelt|wertpapier(?:kauf|verkauf)|sparplan|aussch(?:ü|ue)ttung|dividende|zinsen|kupon)$/i

const DEBIT_INDICATOR_RE = /^(?:S|SOLL|D|DR|DBIT|DEBIT|BELASTUNG|AUSGANG|-)$/i

/**
 * Known preamble-row detection: some banks emit metadata rows before the actual
 * column-header row. We detect the real header by scanning rows until we find
 * one whose cells contain recognised date and amount keywords.
 */
export function findHeaderRowIndex(rows: string[][]): number {
  const DATE_HINTS = [
    'datum',
    'date',
    'buchungstag',
    'buchungsdatum',
    'buchung',
    'valuta',
    'valutadatum',
    'wertstellung',
    'wertstellungsdatum',
    'booking',
    'belegdatum',
    'umsatztag',
    'data',
    'tanggal',
  ]
  const AMOUNT_HINTS = [
    'betrag',
    'amount',
    'umsatz',
    'umsatzbetrag',
    'saldo',
    'sum',
    'brutto',
    'gross',
    'soll',
    'haben',
    'belastung',
    'gutschrift',
    'debit',
    'credit',
    'ausgang',
    'eingang',
    'kwota',
    'iznos',
    'jumlah',
  ]

  for (let i = 0; i < Math.min(rows.length, 25); i++) {
    const cells = rows[i].map((c) => c.toLowerCase().trim())
    const nonEmptyCount = cells.filter(Boolean).length
    if (nonEmptyCount < 3) {
      continue
    }
    const hasDate = cells.some((c) => headerMatches(c, DATE_HINTS))
    const hasAmount = cells.some((c) =>
      headerMatches(c, AMOUNT_HINTS, ['umsatz in eur', 'amount (eur)', 'umsatz']),
    )
    if (hasDate && hasAmount) {
      return i
    }
  }
  return 0 // fallback: treat row 0 as header
}

function resolvePartner(row: string[], indices: ColumnIndices, amount: number): string | undefined {
  const { descIdx, partnerIdx, senderIdx } = indices
  const rawPartner = partnerIdx !== -1 ? row[partnerIdx]?.toString?.()?.trim() : undefined
  const rawSender = senderIdx !== -1 ? row[senderIdx]?.toString?.()?.trim() : undefined

  if (rawPartner && rawSender && partnerIdx !== senderIdx) {
    return amount < 0 ? rawPartner : rawSender
  }
  if (rawPartner && partnerIdx !== descIdx) {
    return rawPartner
  }
  if (rawSender && senderIdx !== descIdx) {
    return rawSender
  }
  return undefined
}

function resolveAmount(row: string[], indices: ColumnIndices): number {
  const { amountIdx, sollIdx, habenIdx, signIndicatorIdx } = indices
  const rawAmountStr = amountIdx !== -1 ? (row[amountIdx]?.toString().trim() ?? '') : ''

  let amount: number
  if (sollIdx !== -1 && habenIdx !== -1 && (!rawAmountStr || rawAmountStr === '0')) {
    const soll = parseAmount(row[sollIdx]?.toString() ?? '0')
    const haben = parseAmount(row[habenIdx]?.toString() ?? '0')
    amount = haben > 0 ? haben : soll !== 0 ? -Math.abs(soll) : 0
  } else {
    amount = parseAmount(rawAmountStr || '0')
  }

  if (signIndicatorIdx !== -1 && amount > 0) {
    const indicator = row[signIndicatorIdx]?.toString().trim() ?? ''
    if (DEBIT_INDICATOR_RE.test(indicator)) {
      amount = -Math.abs(amount)
    }
  }

  return amount
}

export function resolveRawDate(row: string[], indices: ColumnIndices): string {
  const primary = row[indices.dateIdx]?.toString().trim() ?? ''
  if (isValidDateRaw(primary)) {
    return primary
  }
  if (indices.fallbackDateIdx !== undefined && indices.fallbackDateIdx !== -1) {
    const fallback = row[indices.fallbackDateIdx]?.toString().trim() ?? ''
    if (isValidDateRaw(fallback)) {
      return fallback
    }
  }
  return primary
}

export function parseRow(
  row: string[],
  indices: ColumnIndices,
  institution: string,
): Transaction | null {
  if (!row || row.every((cell) => !cell || cell.toString().trim() === '')) {
    return null
  }

  const {
    descIdx,
    currencyIdx,
    refIdx,
    ownIbanIdx,
    counterpartyIbanIdx,
    accountIdx,
    partnerIdx,
    senderIdx,
  } = indices

  let amount = resolveAmount(row, indices)
  const rawDate = resolveRawDate(row, indices)
  let desc = row[descIdx]?.toString?.()?.trim() ?? ''
  const refText = refIdx !== -1 ? (row[refIdx]?.toString?.()?.trim() ?? '') : ''
  if (!desc && refText) {
    desc = refText
  }

  const partner = resolvePartner(row, indices, amount)

  if (
    GENERIC_BOOKING_TYPE_RE.test(desc) ||
    (descIdx === senderIdx && partnerIdx !== -1 && partnerIdx !== senderIdx && amount < 0)
  ) {
    const combined = [partner, refText].filter(Boolean).join(' – ')
    if (combined) {
      desc = combined
    }
  }

  if (!desc) {
    desc = partner || 'Unknown'
  }

  let counterpartyIban: string | undefined
  if (counterpartyIbanIdx !== -1) {
    const raw = row[counterpartyIbanIdx]?.toString().trim() ?? ''
    const ibans = extractIbans(raw)
    if (ibans.length > 0) {
      counterpartyIban = ibans[0]
    }
  }
  if (!counterpartyIban) {
    const ibansInDesc = extractIbans(desc)
    if (ibansInDesc.length > 0) {
      counterpartyIban = ibansInDesc[0]
    }
  }

  let ownIban: string | undefined
  if (ownIbanIdx !== -1) {
    const raw = row[ownIbanIdx]?.toString().trim() ?? ''
    const ibans = extractIbans(raw)
    if (ibans.length > 0) {
      ownIban = ibans[0]
    }
  }

  let subAccount: string | undefined
  if (accountIdx !== -1) {
    const rawAcc = row[accountIdx]?.toString().trim() ?? ''
    const isMain = (s?: string) =>
      !s ||
      s.toLowerCase() === 'main account' ||
      s.toLowerCase() === 'hauptkonto' ||
      s.toLowerCase() === 'glavni račun' ||
      s.toLowerCase() === 'glavni racun'
    if (rawAcc && !isMain(rawAcc)) {
      subAccount = rawAcc
    }
  }

  if (
    (desc && EXPLICIT_INCOME_KEYWORDS_REGEX.test(desc)) ||
    (partner && EXPLICIT_INCOME_KEYWORDS_REGEX.test(partner))
  ) {
    if (amount < 0) {
      amount = Math.abs(amount)
    }
  }

  const rawCurrency = currencyIdx !== -1 ? row[currencyIdx]?.toString().trim() : undefined
  const currency = parseCurrency(rawCurrency)

  return {
    id: generateId(),
    date: parseDate(rawDate),
    description: desc,
    amount,
    currency,
    type: inferType(amount, desc),
    institution,
    counterpartyIban,
    ownIban,
    subAccount,
    partner,
  }
}
