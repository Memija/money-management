import type { Transaction } from '../../types'
import { extractIbans } from '../account-transfers'
import {
  EXPLICIT_INCOME_KEYWORDS_REGEX,
  generateId,
  inferType,
  parseAmount,
  parseDate,
} from './helpers'
import type { ColumnIndices } from './csv-header-detection'

export * from './csv-header-detection'

/**
 * Known preamble-row detection: some banks (ING, comdirect) emit metadata
 * rows before the actual column-header row. We detect the real header by
 * scanning rows until we find one whose cells contain recognised keywords.
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
  ]
  const AMOUNT_HINTS = ['betrag', 'amount', 'umsatz', 'saldo', 'sum', 'brutto', 'gross']

  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const cells = rows[i].map((c) => c.toLowerCase().trim())
    const hasDate = cells.some((c) => DATE_HINTS.some((k) => c.includes(k)))
    const hasAmount = cells.some((c) => AMOUNT_HINTS.some((k) => c.includes(k)))
    if (hasDate && hasAmount) {
      return i
    }
  }
  return 0 // fallback: treat row 0 as header
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
    dateIdx,
    descIdx,
    amountIdx,
    sollIdx,
    habenIdx,
    refIdx,
    ownIbanIdx,
    counterpartyIbanIdx,
    accountIdx,
    partnerIdx,
    senderIdx,
  } = indices

  const rawAmount = row[amountIdx]
  const rawAmountStr = rawAmount?.toString().trim() ?? ''

  let amount: number
  if (sollIdx !== -1 && habenIdx !== -1 && (!rawAmountStr || rawAmountStr === '0')) {
    // Deutsche Bank Soll/Haben mode: only one column is populated per row
    const soll = parseAmount(row[sollIdx]?.toString() ?? '0')
    const haben = parseAmount(row[habenIdx]?.toString() ?? '0')
    amount = haben > 0 ? haben : soll > 0 ? -Math.abs(soll) : 0
  } else {
    amount = parseAmount(rawAmountStr || '0')
  }

  const rawDate = row[dateIdx]?.toString() ?? ''
  let desc = row[descIdx]?.toString?.()?.trim() ?? ''
  if (!desc && refIdx !== -1) {
    desc = row[refIdx]?.toString?.()?.trim() ?? ''
  }

  let partner: string | undefined
  if (partnerIdx !== -1 && partnerIdx !== descIdx) {
    const rawPartner = row[partnerIdx]?.toString?.()?.trim()
    if (rawPartner) {
      partner = rawPartner
    }
  }
  if (!partner && senderIdx !== -1 && senderIdx !== descIdx) {
    const rawSender = row[senderIdx]?.toString?.()?.trim()
    if (rawSender) {
      partner = rawSender
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

  return {
    id: generateId(),
    date: parseDate(rawDate),
    description: desc,
    amount,
    currency: 'EUR',
    type: inferType(amount, desc),
    institution,
    counterpartyIban,
    ownIban,
    subAccount,
    partner,
  }
}
