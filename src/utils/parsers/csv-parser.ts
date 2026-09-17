import type { TranslationStrings } from '../../i18n/types'
import type { Transaction } from '../../types'
import { extractIbans, filterInternalSpaceTransfers } from '../account-transfers'
import { generateId, inferType, isValidDateRaw, parseAmount, parseDate } from './helpers'

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
  const AMOUNT_HINTS = ['betrag', 'amount', 'umsatz', 'saldo', 'sum']

  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const cells = rows[i].map((c) => c.toLowerCase().trim())
    const hasDate = cells.some((c) => DATE_HINTS.some((k) => c.includes(k)))
    const hasAmount = cells.some((c) => AMOUNT_HINTS.some((k) => c.includes(k)))
    if (hasDate && hasAmount) return i
  }
  return 0 // fallback: treat row 0 as header
}

/**
 * Match a column header against a set of keywords.
 * Supports two strategies:
 *   1. Phrase match  — the full header equals the phrase (e.g. "umsatz in eur", "amount (eur)")
 *   2. Token match   — the header, split on non-alphanumeric chars, contains a keyword token
 *                      (prevents 'wert' matching 'wertstellung', 'umsatz' matching 'umsatzart')
 */
function headerMatches(h: string, keywords: string[], phrases: string[] = []): boolean {
  if (phrases.some((p) => h === p || h.startsWith(p))) return true
  const tokens = h.split(/[^a-zäöüß0-9]+/).filter(Boolean)
  return keywords.some((k) => tokens.includes(k))
}

interface ColumnIndices {
  dateIdx: number
  descIdx: number
  amountIdx: number
  sollIdx: number
  habenIdx: number
  accountIdx: number
  partnerIdx: number
  ibanIdx: number
  ownIbanIdx: number
  counterpartyIbanIdx: number
  refIdx: number
}

function detectColumnIndices(header: string[]): ColumnIndices {
  // ── Date column ──────────────────────────────────────────────────────────────
  let dateIdx = header.findIndex((h) =>
    headerMatches(h, [
      'date',
      'datum',
      'buchungstag',
      'buchungsdatum',
      'buchung',
      'valuta',
      'valutadatum',
      'wertstellung',
      'booking',
    ]),
  )

  // ── Description / Payee / Partner column ──────────────────────────────────────
  let descIdx = header.findIndex((h) =>
    headerMatches(
      h,
      // Token-level keywords (whole-word match)
      [
        'description',
        'beschreibung',
        'verwendungszweck',
        'buchungstext',
        'auftraggeber',
        'empfanger',
        'empfänger',
        'zahlungsempfanger',
        'zahlungsempfänger',
        'zahlungspflichtige', // DKB gendered: "zahlungspflichtige*r"
        'beguenstigter',
        'beguenstigte',
        'kontoinhaber',
        'payee',
        'recipient',
        'purpose',
        'partner',
        'partnername',
        'transaktionspartner',
      ],
      // Full-phrase overrides (e.g. slash-separated compound headers)
      [
        'auftraggeber/empfänger',
        'auftraggeber/empfanger',
        'beguenstigter/zahlungspflichtiger',
        'partner name',
        'partnername',
        'name des partners',
        'transaktionspartner',
      ],
    ),
  )

  // ── Dedicated Partner / Payee column ──────────────────────────────────────────
  const partnerIdx = header.findIndex((h) =>
    headerMatches(
      h,
      ['partner', 'partnername', 'transaktionspartner', 'payee', 'empfanger', 'empfänger'],
      ['partner name', 'partnername', 'name des partners', 'transaktionspartner'],
    ),
  )

  // ── Dedicated Account / Space Name column ─────────────────────────────────────
  const accountIdx = header.findIndex((h) => {
    // Avoid matching account number or IBAN headers
    if (
      h.includes('number') ||
      h.includes('nummer') ||
      h.includes('iban') ||
      h.includes('auftragskonto')
    ) {
      return false
    }
    return headerMatches(
      h,
      ['space', 'spaces', 'subaccount', 'unterkonto', 'pocket'],
      [
        'account name',
        'kontoname',
        'konto name',
        'space name',
        'spacename',
        'subaccount',
        'subaccount name',
        'unterkonto',
        'pocket name',
        'pocket',
      ],
    )
  })

  // ── Account's own IBAN column (e.g. Commerzbank 'IBAN Kontoinhaber') ───────
  let ownIbanIdx = header.findIndex((h) =>
    headerMatches(
      h,
      ['iban kontoinhaber', 'konto-iban', 'konto iban', 'kontonummer / iban', 'eigene iban', 'own iban', 'account iban'],
      ['iban kontoinhaber', 'konto-iban', 'konto iban', 'kontonummer / iban', 'eigene iban', 'own iban', 'account iban'],
    ),
  )

  // ── Counterparty / Partner IBAN column (e.g. N26 'Partner Iban') ────────────
  let counterpartyIbanIdx = header.findIndex((h) =>
    headerMatches(
      h,
      ['partner iban', 'partner-iban', 'iban des partners', 'gegenkonto iban', 'gegenkonto-iban', 'counterparty iban', 'empfänger iban', 'empfaenger iban', 'auftraggeber iban'],
      ['partner iban', 'partner-iban', 'iban des partners', 'gegenkonto iban', 'gegenkonto-iban', 'counterparty iban', 'empfänger iban', 'empfaenger iban', 'auftraggeber iban'],
    ),
  )

  // ── Fallback generic IBAN column ───────────────────────────────────────────
  let ibanIdx = header.findIndex((h) => header.includes('iban') || h === 'iban')
  if (ownIbanIdx === -1 && counterpartyIbanIdx === -1 && ibanIdx !== -1) {
    const rawH = header[ibanIdx]
    if (rawH.includes('konto') || rawH.includes('inhaber') || rawH.includes('eigen')) {
      ownIbanIdx = ibanIdx
    } else {
      counterpartyIbanIdx = ibanIdx
    }
  }

  // Preserve ibanIdx for space transfer heuristics
  if (ibanIdx === -1) {
    ibanIdx = counterpartyIbanIdx !== -1 ? counterpartyIbanIdx : ownIbanIdx
  }

  // ── Reference / Purpose column ────────────────────────────────────────────────
  const refIdx = header.findIndex((h) =>
    headerMatches(
      h,
      ['verwendungszweck', 'purpose', 'referenz', 'reference', 'details'],
      ['payment reference', 'zahlungsreferenz', 'verwendungszweck', 'buchungstext'],
    ),
  )

  // ── Amount column ────────────────────────────────────────────────────────────
  let amountIdx = header.findIndex((h) =>
    headerMatches(
      h,
      // Token-level keywords
      ['betrag', 'amount', 'umsatzbetrag', 'sum'],
      // Full-phrase overrides
      [
        'umsatz in eur',
        'umsatz in usd',
        'amount (eur)',
        'amount (usd)',
        'umsatz', // standalone 'Umsatz' column (Volksbank) — only matched as exact phrase
        'saldo',
      ],
    ),
  )

  // Prefer 'Betrag' over 'Saldo' when both exist (saldo = running balance, not amount)
  const betragIdx = header.findIndex((h) => h === 'betrag' || h.startsWith('betrag'))
  if (betragIdx !== -1 && betragIdx !== amountIdx) amountIdx = betragIdx

  // ── Soll / Haben split columns (Deutsche Bank and some older formats) ────────
  const sollIdx = header.findIndex((h) => h === 'soll')
  const habenIdx = header.findIndex((h) => h === 'haben')

  // Fallbacks
  if (dateIdx === -1) dateIdx = 0
  if (descIdx === -1) descIdx = Math.min(1, header.length - 1)
  if (amountIdx === -1 && sollIdx === -1 && habenIdx === -1)
    amountIdx = Math.min(header.length - 1, 2)

  return { dateIdx, descIdx, amountIdx, sollIdx, habenIdx, accountIdx, partnerIdx, ibanIdx, ownIbanIdx, counterpartyIbanIdx, refIdx }
}

function parseRow(row: string[], indices: ColumnIndices, institution: string): Transaction | null {
  if (!row || row.every((cell) => !cell || cell.toString().trim() === '')) return null

  const { dateIdx, descIdx, amountIdx, sollIdx, habenIdx, refIdx, ownIbanIdx, counterpartyIbanIdx } = indices

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
  if (!desc) {
    desc = 'Unknown'
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

  return {
    id: generateId(),
    date: parseDate(rawDate),
    description: desc,
    amount,
    currency: 'EUR',
    type: inferType(amount),
    institution,
    counterpartyIban,
    ownIban,
  }
}

/**
 * Identifies indices of rows that represent internal transfers between spaces/sub-accounts.
 *
 * When an export contains account/space metadata (e.g. N26 exports with Spaces):
 * 1. Direct space transfers: The counterparty (partner/payee) matches one of the user's accounts/spaces in the file.
 * 2. Historical/renamed space transfers: When a space was previously renamed, the Main Account side uses the old
 *    space name with no external IBAN, matching an opposite space-side transfer on the same date.
 */
export function findSpaceTransferRowIndices(
  dataRows: string[][],
  indices: ColumnIndices,
): Set<number> {
  const { accountIdx, partnerIdx, descIdx, ibanIdx, dateIdx, amountIdx, sollIdx, habenIdx } = indices
  const discarded = new Set<number>()

  if (accountIdx === -1) {
    return discarded
  }

  const pIdx = partnerIdx !== -1 ? partnerIdx : descIdx
  if (pIdx === -1) {
    return discarded
  }

  // 1. Collect all distinct account/space names (normalized to lowercase)
  const accountNames = new Set<string>()
  for (let i = 1; i < dataRows.length; i++) {
    const acc = dataRows[i]?.[accountIdx]?.toString().trim().toLowerCase()
    if (acc) {
      accountNames.add(acc)
    }
  }

  const hasSpaceAccounts =
    accountNames.size > 1 ||
    Array.from(accountNames).some(
      (name) => name.includes('space') || name.includes('main account') || name.includes('hauptkonto'),
    )

  if (!hasSpaceAccounts) {
    return discarded
  }

  const getRowAmount = (row: string[]): number => {
    const rawAmountStr = row[amountIdx]?.toString().trim() ?? ''
    if (sollIdx !== -1 && habenIdx !== -1 && (!rawAmountStr || rawAmountStr === '0')) {
      const soll = parseAmount(row[sollIdx]?.toString() ?? '0')
      const haben = parseAmount(row[habenIdx]?.toString() ?? '0')
      return haben > 0 ? haben : soll > 0 ? -Math.abs(soll) : 0
    }
    return parseAmount(rawAmountStr || '0')
  }

  const directSpaceIndices = new Set<number>()

  // Step 1: Direct space transfers
  for (let i = 1; i < dataRows.length; i++) {
    const row = dataRows[i]
    if (!row || row.every((cell) => !cell || cell.toString().trim() === '')) continue

    const partner = row[pIdx]?.toString().trim().toLowerCase()
    if (partner && accountNames.has(partner)) {
      discarded.add(i)
      directSpaceIndices.add(i)
    }
  }

  // Step 2: Historical / renamed space transfers
  const pairedDirectSide = new Set<number>()

  for (let i = 1; i < dataRows.length; i++) {
    if (discarded.has(i)) continue

    const row = dataRows[i]
    if (!row || row.every((cell) => !cell || cell.toString().trim() === '')) continue

    const partnerIban = ibanIdx !== -1 ? row[ibanIdx]?.toString().trim() : ''
    // External transfers to third parties or other banks have an IBAN
    if (partnerIban) continue

    const account = row[accountIdx]?.toString().trim().toLowerCase()
    const date = row[dateIdx]?.toString().trim()
    const amount = getRowAmount(row)

    for (const otherIdx of directSpaceIndices) {
      if (pairedDirectSide.has(otherIdx)) continue

      const other = dataRows[otherIdx]
      if (other[dateIdx]?.toString().trim() !== date) continue

      const otherAmount = getRowAmount(other)
      if (Math.abs(amount + otherAmount) > 0.001) continue

      const otherPartner = other[pIdx]?.toString().trim().toLowerCase()
      const otherAccount = other[accountIdx]?.toString().trim().toLowerCase()

      // The other row must have partner equal to this row's account (e.g. 'main account')
      // and other row's account must be in accountNames (e.g. 'pension fund', 'wohnung und auto')
      if (otherPartner === account && accountNames.has(otherAccount)) {
        pairedDirectSide.add(otherIdx)
        discarded.add(i)
        break
      }
    }
  }

  return discarded
}

export interface ParsedCsvTransactionsResult {
  transactions: Transaction[]
  discardedSpaceCount: number
  detectedAccountIbans?: string[]
}

export function rowsToTransactionsWithMeta(
  rows: string[][],
  institution: string,
  t?: TranslationStrings,
): ParsedCsvTransactionsResult {
  if (rows.length < 2) return { transactions: [], discardedSpaceCount: 0, detectedAccountIbans: [] }

  // Skip preamble rows
  const headerRowIdx = findHeaderRowIndex(rows)
  const dataRows = rows.slice(headerRowIdx)
  if (dataRows.length < 2) return { transactions: [], discardedSpaceCount: 0, detectedAccountIbans: [] }

  // Normalise header cells: lowercase, strip surrounding quotes
  const header = dataRows[0].map((h) => h?.toString().toLowerCase().trim() ?? '')
  const indices = detectColumnIndices(header)
  const spaceTransferIndices = findSpaceTransferRowIndices(dataRows, indices)

  const transactions: Transaction[] = []
  const errors: string[] = []

  for (let i = 1; i < dataRows.length; i++) {
    if (spaceTransferIndices.has(i)) {
      continue
    }

    const row = dataRows[i]
    if (!row || row.every((cell) => !cell || cell.toString().trim() === '')) continue

    const rawDate = row[indices.dateIdx]?.toString() ?? ''
    if (rawDate && !isValidDateRaw(rawDate)) {
      const errTpl =
        t?.errorParsePasteInvalidDate ||
        'Line {line}: Invalid date format "{rawDate}" in position {pos}. Expected DD.MM.YYYY or YYYY-MM-DD.'
      errors.push(
        errTpl
          .replace('{line}', String(headerRowIdx + i + 1))
          .replace('{rawDate}', rawDate)
          .replace('{pos}', String(indices.dateIdx + 1)),
      )
      continue
    }

    const transaction = parseRow(row, indices, institution)
    if (transaction) {
      transactions.push(transaction)
    }
  }

  if (transactions.length === 0 && errors.length > 0) {
    const errTpl = t?.errorParsePasteFailed || 'Failed to parse:\n{errors}'
    const moreTpl = t?.errorParsePasteMore || '\n...and {count} more.'

    let errMsg = errTpl.replace('{errors}', errors.slice(0, 3).join('\n'))
    if (errors.length > 3) {
      errMsg += moreTpl.replace('{count}', String(errors.length - 3))
    }
    throw new Error(errMsg)
  }

  const { transactions: finalTransactions, discardedSpaceCount: additionalDiscarded } =
    filterInternalSpaceTransfers(transactions)

  const detectedAccountIbans = Array.from(
    new Set(
      finalTransactions
        .map((tx) => tx.ownIban)
        .filter((iban): iban is string => Boolean(iban)),
    ),
  )

  return {
    transactions: finalTransactions,
    discardedSpaceCount: spaceTransferIndices.size + additionalDiscarded,
    detectedAccountIbans,
  }
}

export function rowsToTransactions(
  rows: string[][],
  institution: string,
  t?: TranslationStrings,
): Transaction[] {
  return rowsToTransactionsWithMeta(rows, institution, t).transactions
}

