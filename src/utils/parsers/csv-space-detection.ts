import { parseAmount } from './helpers'
import type { ColumnIndices } from './csv-columns'

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
  const { accountIdx, partnerIdx, descIdx, ibanIdx, dateIdx, amountIdx, sollIdx, habenIdx } =
    indices
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
      (name) =>
        name.includes('space') || name.includes('main account') || name.includes('hauptkonto'),
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
    if (!row || row.every((cell) => !cell || cell.toString().trim() === '')) {
      continue
    }

    const partner = row[pIdx]?.toString().trim().toLowerCase()
    if (partner && accountNames.has(partner)) {
      discarded.add(i)
      directSpaceIndices.add(i)
    }
  }

  // Step 2: Historical / renamed space transfers
  const pairedDirectSide = new Set<number>()
  const directByDateAndCents = new Map<string, number[]>()

  for (const directIdx of directSpaceIndices) {
    const row = dataRows[directIdx]
    const date = row[dateIdx]?.toString().trim() ?? ''
    const amt = getRowAmount(row)
    const key = `${date}|${Math.round(amt * 100)}`
    let list = directByDateAndCents.get(key)
    if (!list) {
      list = []
      directByDateAndCents.set(key, list)
    }
    list.push(directIdx)
  }

  for (let i = 1; i < dataRows.length; i++) {
    if (discarded.has(i)) {
      continue
    }

    const row = dataRows[i]
    if (!row || row.every((cell) => !cell || cell.toString().trim() === '')) {
      continue
    }

    const partnerIban = ibanIdx !== -1 ? row[ibanIdx]?.toString().trim() : ''
    // External transfers to third parties or other banks have an IBAN
    if (partnerIban) {
      continue
    }

    const account = row[accountIdx]?.toString().trim().toLowerCase()
    const date = row[dateIdx]?.toString().trim() ?? ''
    const amount = getRowAmount(row)
    const oppKey = `${date}|${Math.round(-amount * 100)}`

    const candidates = directByDateAndCents.get(oppKey)
    if (!candidates) {
      continue
    }

    for (const otherIdx of candidates) {
      if (pairedDirectSide.has(otherIdx)) {
        continue
      }

      const other = dataRows[otherIdx]
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
