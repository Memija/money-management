import type { Transaction } from '../types'
import {
  BANKING_STOP_WORDS,
  dateDiffInDays,
  hasExternalCounterparty,
  hasSpaceTransferKeyword,
  normalizeTransferText,
  REVERSAL_KEYWORDS,
} from './transfer-matching'

export interface SpaceTransferFilterResult {
  transactions: Transaction[]
  discardedSpaceCount: number
  excludedTransactions?: Transaction[]
}

/**
 * Scans a single transaction batch (from any import source: PDF, paste, spreadsheet)
 * and detects reciprocal internal transfers between spaces or sub-accounts within that batch.
 *
 * Discards both sides of such intra-statement movements to prevent them from artificially
 * distorting income and expenses.
 */
export function filterInternalSpaceTransfers(
  transactions: Transaction[],
): SpaceTransferFilterResult {
  if (!transactions || transactions.length < 2) {
    return { transactions: transactions || [], discardedSpaceCount: 0, excludedTransactions: [] }
  }

  const discardedTxIds = new Set<string>()
  const usedTxIds = new Set<string>()

  // Sort chronologically so earlier transfers bind to earlier matching counterparties
  const indexed = transactions.map((tx, originalIndex) => ({ tx, originalIndex }))
  indexed.sort((a, b) => (a.tx.date < b.tx.date ? -1 : a.tx.date > b.tx.date ? 1 : 0))

  // Index items by rounded cents for O(1) candidate lookup
  const itemsByCents = new Map<number, typeof indexed>()
  for (const item of indexed) {
    const cents = Math.round(item.tx.amount * 100)
    let list = itemsByCents.get(cents)
    if (!list) {
      list = []
      itemsByCents.set(cents, list)
    }
    list.push(item)
  }

  // Pre-normalize transfer descriptions and extract flags to avoid repeating regexes
  const normDescMap = new Map<string, string>()
  const extCounterpartyMap = new Map<string, boolean>()
  const spaceKeywordMap = new Map<string, boolean>()
  const reversalMap = new Map<string, boolean>()
  const depotMap = new Map<string, boolean>()
  const meaningfulWordsMap = new Map<string, string[]>()

  for (const item of indexed) {
    const desc = item.tx.description || ''
    const norm = normalizeTransferText(desc)
    normDescMap.set(item.tx.id, norm)
    extCounterpartyMap.set(item.tx.id, hasExternalCounterparty(item.tx))
    spaceKeywordMap.set(item.tx.id, hasSpaceTransferKeyword(norm))
    reversalMap.set(
      item.tx.id,
      REVERSAL_KEYWORDS.some((kw) => norm.includes(kw)),
    )
    depotMap.set(item.tx.id, norm.includes('depot'))
    meaningfulWordsMap.set(
      item.tx.id,
      norm.split(' ').filter((w) => w.length >= 3 && !BANKING_STOP_WORDS.has(w)),
    )
  }

  for (let i = 0; i < indexed.length; i++) {
    const itemA = indexed[i]
    if (usedTxIds.has(itemA.tx.id)) {
      continue
    }
    if (itemA.tx.amount === 0) {
      continue
    }

    const targetCents = -Math.round(itemA.tx.amount * 100)
    const candidates = itemsByCents.get(targetCents)
    if (!candidates || candidates.length === 0) {
      continue
    }

    let bestMatch: (typeof indexed)[0] | null = null
    let minDays = Infinity

    for (let j = 0; j < candidates.length; j++) {
      const itemB = candidates[j]
      if (itemA.tx.id === itemB.tx.id) {
        continue
      }
      if (usedTxIds.has(itemB.tx.id)) {
        continue
      }

      // 1. Amounts must be equal and opposite
      if (Math.abs(itemA.tx.amount + itemB.tx.amount) > 0.001) {
        continue
      }
      if (Math.sign(itemA.tx.amount) === Math.sign(itemB.tx.amount)) {
        continue
      }

      // 2. Dates must be within 1 calendar day
      const diffDays = dateDiffInDays(itemA.tx.date, itemB.tx.date)
      if (diffDays > 1) {
        continue
      }

      // 3. External transfers with counterparty IBANs cannot be intra-statement space transfers
      if (extCounterpartyMap.get(itemA.tx.id) || extCounterpartyMap.get(itemB.tx.id)) {
        continue
      }

      // Ignore reversals / chargebacks / refunds from being misclassified as space transfers
      if (reversalMap.get(itemA.tx.id) || reversalMap.get(itemB.tx.id)) {
        continue
      }

      // Custody/brokerage depot transfers are not internal space movements
      if (depotMap.get(itemA.tx.id) || depotMap.get(itemB.tx.id)) {
        continue
      }

      // 4. Clues: At least one side MUST have a space/transfer keyword
      const hasSpaceKeywordA = spaceKeywordMap.get(itemA.tx.id) ?? false
      const hasSpaceKeywordB = spaceKeywordMap.get(itemB.tx.id) ?? false
      if (!hasSpaceKeywordA && !hasSpaceKeywordB) {
        continue
      }

      const normDescA = normDescMap.get(itemA.tx.id) ?? ''
      const normDescB = normDescMap.get(itemB.tx.id) ?? ''

      const meaningfulWordsA = meaningfulWordsMap.get(itemA.tx.id) ?? []
      const meaningfulWordsB = meaningfulWordsMap.get(itemB.tx.id) ?? []
      const sharedMeaningfulWords = meaningfulWordsA.filter((w) => meaningfulWordsB.includes(w))

      const isDescCrossReference =
        (normDescA.length >= 4 &&
          !BANKING_STOP_WORDS.has(normDescA) &&
          normDescB.includes(normDescA)) ||
        (normDescB.length >= 4 &&
          !BANKING_STOP_WORDS.has(normDescB) &&
          normDescA.includes(normDescB))

      const isSpacePair =
        (hasSpaceKeywordA && hasSpaceKeywordB) ||
        isDescCrossReference ||
        sharedMeaningfulWords.length >= 2

      if (isSpacePair) {
        if (diffDays < minDays) {
          minDays = diffDays
          bestMatch = itemB
        }
      }
    }

    if (bestMatch) {
      const isMain = (s?: string) =>
        !s ||
        s.toLowerCase() === 'main account' ||
        s.toLowerCase() === 'hauptkonto' ||
        s.toLowerCase() === 'glavni račun' ||
        s.toLowerCase() === 'glavni racun'

      const subAccount =
        itemA.tx.subAccount ||
        bestMatch.tx.subAccount ||
        (() => {
          const extractFromText = (text: string): string | undefined => {
            if (!text) {
              return undefined
            }
            const prefixMatch = text.match(
              /(?:space|spaces|unterkonto|pocket|tresor|vault|subaccount|podracun|podračun)[:\s-]+([^,\n;]+)/i,
            )
            if (prefixMatch && prefixMatch[1]) {
              const clean = prefixMatch[1].trim()
              if (clean.length > 1 && clean.length < 50 && !isMain(clean)) {
                return clean
              }
            }
            return undefined
          }
          return extractFromText(itemA.tx.description) || extractFromText(bestMatch.tx.description)
        })()

      if (subAccount) {
        if (!itemA.tx.subAccount) {
          itemA.tx.subAccount = subAccount
        }
        if (!bestMatch.tx.subAccount) {
          bestMatch.tx.subAccount = subAccount
        }
      }

      usedTxIds.add(itemA.tx.id)
      usedTxIds.add(bestMatch.tx.id)
      discardedTxIds.add(itemA.tx.id)
      discardedTxIds.add(bestMatch.tx.id)
    }
  }

  const remaining = transactions.filter((tx) => !discardedTxIds.has(tx.id))
  const excluded = transactions.filter((tx) => discardedTxIds.has(tx.id))
  return {
    transactions: remaining,
    discardedSpaceCount: discardedTxIds.size,
    excludedTransactions: excluded,
  }
}
