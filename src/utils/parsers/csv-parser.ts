import type { TranslationStrings } from '../../i18n/types'
import type { Transaction } from '../../types'
import { filterInternalSpaceTransfers } from '../account-transfers'
import {
  type ColumnIndices,
  detectColumnIndices,
  findHeaderRowIndex,
  parseRow,
} from './csv-columns'
import { findSpaceTransferRowIndices } from './csv-space-detection'
import { isValidDateRaw } from './helpers'

export * from './csv-columns'
export * from './csv-space-detection'

export interface ParsedCsvTransactionsResult {
  transactions: Transaction[]
  discardedSpaceCount: number
  detectedAccountIbans?: string[]
  excludedSpaceTransactions?: Transaction[]
}

const MAIN_ACCOUNT_LABELS = new Set(['main account', 'hauptkonto', 'glavni račun', 'glavni racun'])

function isMainAccountLabel(value?: string): boolean {
  return !value || MAIN_ACCOUNT_LABELS.has(value.toLowerCase())
}

function parseSpaceTransferRow(
  row: string[],
  indices: ColumnIndices,
  institution: string,
): Transaction | null {
  const transaction = parseRow(row, indices, institution)
  if (!transaction) {
    return null
  }
  if (!transaction.subAccount && indices.accountIdx !== -1) {
    const pIdx = indices.partnerIdx !== -1 ? indices.partnerIdx : indices.descIdx
    const rawPartner = pIdx !== -1 ? (row[pIdx]?.toString().trim() ?? '') : ''
    if (rawPartner && !isMainAccountLabel(rawPartner)) {
      transaction.subAccount = rawPartner
    }
  }
  return transaction
}

export function rowsToTransactionsWithMeta(
  rows: string[][],
  institution: string,
  t?: TranslationStrings,
): ParsedCsvTransactionsResult {
  if (rows.length < 2) {
    return {
      transactions: [],
      discardedSpaceCount: 0,
      detectedAccountIbans: [],
      excludedSpaceTransactions: [],
    }
  }

  // Skip preamble rows
  const headerRowIdx = findHeaderRowIndex(rows)
  const dataRows = rows.slice(headerRowIdx)
  if (dataRows.length < 2) {
    return {
      transactions: [],
      discardedSpaceCount: 0,
      detectedAccountIbans: [],
      excludedSpaceTransactions: [],
    }
  }

  // Normalise header cells: lowercase, strip surrounding quotes
  const header = dataRows[0].map((h) => h?.toString().toLowerCase().trim() ?? '')
  const indices = detectColumnIndices(header)
  const spaceTransferIndices = findSpaceTransferRowIndices(dataRows, indices)

  const transactions: Transaction[] = []
  const excludedSpaceTransactions: Transaction[] = []
  const errors: string[] = []

  for (let i = 1; i < dataRows.length; i++) {
    const row = dataRows[i]
    if (!row || row.every((cell) => !cell || cell.toString().trim() === '')) {
      continue
    }

    if (spaceTransferIndices.has(i)) {
      const spaceTx = parseSpaceTransferRow(row, indices, institution)
      if (spaceTx) {
        excludedSpaceTransactions.push(spaceTx)
      }
      continue
    }

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

  const {
    transactions: finalTransactions,
    discardedSpaceCount: additionalDiscarded,
    excludedTransactions: additionalExcluded,
  } = filterInternalSpaceTransfers(transactions)

  if (additionalExcluded && additionalExcluded.length > 0) {
    excludedSpaceTransactions.push(...additionalExcluded)
  }

  const detectedAccountIbans = Array.from(
    new Set(
      finalTransactions.map((tx) => tx.ownIban).filter((iban): iban is string => Boolean(iban)),
    ),
  )

  return {
    transactions: finalTransactions,
    discardedSpaceCount: spaceTransferIndices.size + additionalDiscarded,
    detectedAccountIbans,
    excludedSpaceTransactions,
  }
}

export function rowsToTransactions(
  rows: string[][],
  institution: string,
  t?: TranslationStrings,
): Transaction[] {
  return rowsToTransactionsWithMeta(rows, institution, t).transactions
}
