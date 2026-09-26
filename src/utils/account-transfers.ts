import type { ImportedAccount, Transaction } from '../types'

/**
 * Normalizes text for fuzzy matching by lowercasing, removing special characters,
 * and collapsing whitespace.
 */
export function normalizeTransferText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calculates absolute difference between two ISO date strings (YYYY-MM-DD) in calendar days.
 */
export function dateDiffInDays(dateA: string, dateB: string): number {
  const d1 = Date.parse(dateA)
  const d2 = Date.parse(dateB)
  if (Number.isNaN(d1) || Number.isNaN(d2)) {
    return Infinity
  }
  return Math.abs(d1 - d2) / 86400000
}

/**
 * Extracts potential IBAN substrings from text.
 */
export function extractIbans(text: string): string[] {
  const raw = (text || '').toUpperCase()
  // Replace underscores and common punctuation with spaces so delimiters like _ or - don't block word boundaries
  const clean = raw.replace(/[_\-:/|;,.]/g, ' ')
  // Matches European IBANs with or without spaces (e.g. DE12 3456 7890 1234 5678 90 or DE12345678901234567890)
  const spacedRegex = /\b[A-Z]{2}\d{2}(?:\s+[A-Z0-9]{2,4}){3,8}\b/g
  const compactRegex = /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g

  const result = new Set<string>()
  const compactMatches = clean.match(compactRegex) || []
  for (const m of compactMatches) {
    result.add(m.replace(/\s+/g, ''))
  }
  const spacedMatches = clean.match(spacedRegex) || []
  for (const m of spacedMatches) {
    const compact = m.replace(/\s+/g, '')
    if (compact.length >= 15 && compact.length <= 34) {
      result.add(compact)
    }
  }
  return Array.from(result)
}

export const TRANSFER_KEYWORDS = [
  'umbuchung',
  'uebertrag',
  'übertrag',
  'transfer',
  'dauerauftrag',
  'eigenes konto',
  'eigene konten',
  'sent from',
  'interni prenos',
  'interni transfer',
  'интерни пренос',
  'интерни трансфер',
  'пренос',
]

export const REVERSAL_KEYWORDS = [
  'rücklastschrift',
  'ruecklastschrift',
  'lastschriftrückgabe',
  'lastschriftruckgabe',
  'rückgabe',
  'rueckgabe',
  'erstattung',
  'refund',
  'chargeback',
  'retoure',
  'storno',
  'reversal',
]

export const BANKING_STOP_WORDS = new Set([
  'end',
  'ref',
  'notprovided',
  'kundenreferenz',
  'dauerauftrag',
  'sepa',
  'iban',
  'bic',
  'mandat',
  'mandatsreferenz',
  'gref',
  'mref',
  'kref',
  'ereference',
  'cred',
  'deb',
  'sct',
  'pmt',
  'auftragskonto',
  'buchungstext',
  'umsatz',
  'kartenzahlung',
  'lastschrift',
  'gutschrift',
  'ueberweisung',
  'überweisung',
  'einzahlung',
  'auszahlung',
  'entgelt',
  'gebuehr',
  'gebühr',
  'zinsen',
  'steuer',
  'abschluss',
  'saldo',
  'und',
  'von',
  'mit',
  'auf',
  'fuer',
  'für',
  'the',
  'for',
  'and',
  'from',
  'with',
])

export const SPACE_TRANSFER_KEYWORDS = [
  'space',
  'spaces',
  'unterkonto',
  'unterkonten',
  'pocket',
  'pockets',
  'pot',
  'pots',
  'tresor',
  'vault',
  'vaults',
  'subaccount',
  'sub-account',
  'hauptkonto',
  'main account',
  'umbuchung',
  'uebertrag',
  'übertrag',
  'eigenübertrag',
  'eigenuebertrag',
  'eigenes konto',
  'eigene konten',
  'tagesgeld',
  'notgroschen',
  'sparziel',
  'sparen',
  'investment fund',
  'pension fund',
  'wohnung und auto',
  'gebäude und wohnung',
  'gebaeude und wohnung',
  'prostor',
  'prostori',
  'podracun',
  'podračun',
  'podracuni',
  'podračuni',
  'džep',
  'trezor',
  'stednja',
  'štednja',
  'prenos',
  'glavni racun',
  'glavni račun',
  'пренос',
  'простор',
  'простори',
  'подрачун',
  'подрачуни',
  'џеп',
  'штедња',
  'главни рачун',
]

/**
 * Checks whether a normalized text contains any space/internal transfer keywords
 * using whole-token or phrase matching (preventing false matches like "depot" matching "pot").
 */
export function hasSpaceTransferKeyword(normDesc: string): boolean {
  if (!normDesc) return false
  const tokens = normDesc.split(' ')
  for (const kw of SPACE_TRANSFER_KEYWORDS) {
    if (kw.includes(' ')) {
      if (normDesc.includes(kw)) {
        return true
      }
    } else {
      if (tokens.some((token) => token === kw || token === `${kw}s` || token === `${kw}en`)) {
        return true
      }
    }
  }
  return false
}

/**
 * Checks if a transaction has an explicit counterparty IBAN, BIC, or external account reference,
 * which indicates an external transfer/standing order rather than an intra-statement space movement.
 */
export function hasExternalCounterparty(tx: Transaction): boolean {
  if (tx.counterpartyIban && tx.counterpartyIban.trim().length > 0) {
    return true
  }
  if (extractIbans(tx.description).length > 0) {
    return true
  }
  return false
}

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
    reversalMap.set(item.tx.id, REVERSAL_KEYWORDS.some((kw) => norm.includes(kw)))
    depotMap.set(item.tx.id, norm.includes('depot'))
    meaningfulWordsMap.set(
      item.tx.id,
      norm.split(' ').filter((w) => w.length >= 3 && !BANKING_STOP_WORDS.has(w)),
    )
  }

  for (let i = 0; i < indexed.length; i++) {
    const itemA = indexed[i]
    if (usedTxIds.has(itemA.tx.id)) continue
    if (itemA.tx.amount === 0) continue

    const targetCents = -Math.round(itemA.tx.amount * 100)
    const candidates = itemsByCents.get(targetCents)
    if (!candidates || candidates.length === 0) continue

    let bestMatch: (typeof indexed)[0] | null = null
    let minDays = Infinity

    for (let j = 0; j < candidates.length; j++) {
      const itemB = candidates[j]
      if (itemA.tx.id === itemB.tx.id) continue
      if (usedTxIds.has(itemB.tx.id)) continue

      // 1. Amounts must be equal and opposite
      if (Math.abs(itemA.tx.amount + itemB.tx.amount) > 0.001) continue
      if (Math.sign(itemA.tx.amount) === Math.sign(itemB.tx.amount)) continue

      // 2. Dates must be within 1 calendar day
      const diffDays = dateDiffInDays(itemA.tx.date, itemB.tx.date)
      if (diffDays > 1) continue

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
        (normDescA.length >= 4 && !BANKING_STOP_WORDS.has(normDescA) && normDescB.includes(normDescA)) ||
        (normDescB.length >= 4 && !BANKING_STOP_WORDS.has(normDescB) && normDescA.includes(normDescB))

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
            if (!text) return undefined
            const prefixMatch = text.match(
              /(?:space|spaces|unterkonto|pocket|tresor|vault|subaccount|podracun|podračun)[:\s-]+([^,\n;]+)/i,
            )
            if (prefixMatch && prefixMatch[1]) {
              const clean = prefixMatch[1].trim()
              if (clean.length > 1 && clean.length < 50 && !isMain(clean)) return clean
            }
            return undefined
          }
          return extractFromText(itemA.tx.description) || extractFromText(bestMatch.tx.description)
        })()

      if (subAccount) {
        if (!itemA.tx.subAccount) itemA.tx.subAccount = subAccount
        if (!bestMatch.tx.subAccount) bestMatch.tx.subAccount = subAccount
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

/**
 * Determines whether two transactions across different accounts represent a transfer
 * between the user's own accounts.
 */
/**
 * Calculates a confidence score (0 to 400+) indicating how strongly two transactions
 * across different accounts represent the reciprocal legs of an internal transfer.
 * Returns 0 if the transactions are not an internal transfer pair.
 */
export function calculateTransferCandidateScore(
  txA: Transaction,
  accountA: ImportedAccount,
  txB: Transaction,
  accountB: ImportedAccount,
): number {
  // 0. Accounts must belong to different institutions
  if (accountA.institutionId && accountA.institutionId === accountB.institutionId) {
    return 0
  }

  // 1. Amounts must be opposite
  if (Math.abs(txA.amount + txB.amount) > 0.01) {
    return 0
  }
  if (Math.sign(txA.amount) === Math.sign(txB.amount) || txA.amount === 0 || txB.amount === 0) {
    return 0
  }

  // 2. Currencies must match (defaulting to EUR if missing)
  const currA = (txA.currency || 'EUR').toUpperCase()
  const currB = (txB.currency || 'EUR').toUpperCase()
  if (currA !== currB) {
    return 0
  }

  // 3. Dates must be within 4 calendar days (accommodates weekends and SEPA settlement)
  const diffDays = dateDiffInDays(txA.date, txB.date)
  if (diffDays > 4) {
    return 0
  }

  const normDescA = normalizeTransferText(txA.description)
  const normDescB = normalizeTransferText(txB.description)
  const normInstA = normalizeTransferText(accountA.institutionName)
  const normInstB = normalizeTransferText(accountB.institutionName)

  let score = 0

  // Date proximity (0 days diff = 100, 1 day = 75, 2 days = 50, 3 days = 25, 4 days = 0)
  score += Math.max(0, 100 - diffDays * 25)

  // Direct IBAN match
  const ibansA = [
    ...extractIbans(txA.description),
    ...(txA.counterpartyIban ? [txA.counterpartyIban] : []),
  ]
  const ibansB = [
    ...extractIbans(txB.description),
    ...(txB.counterpartyIban ? [txB.counterpartyIban] : []),
  ]
  const compactDescA = normDescA.replace(/\s+/g, '')
  const compactDescB = normDescB.replace(/\s+/g, '')
  const hasDirectDescIban =
    ibansA.some((iban) => compactDescB.includes(iban.toLowerCase())) ||
    ibansB.some((iban) => compactDescA.includes(iban.toLowerCase()))

  const knownIbansA = [
    ...(accountA.accountIbans || []),
    ...(txA.ownIban ? [txA.ownIban] : []),
  ].map((ib) => ib.toUpperCase().replace(/\s+/g, ''))

  const knownIbansB = [
    ...(accountB.accountIbans || []),
    ...(txB.ownIban ? [txB.ownIban] : []),
  ].map((ib) => ib.toUpperCase().replace(/\s+/g, ''))

  const aPointsToB = ibansA.some((iban) => knownIbansB.includes(iban.toUpperCase().replace(/\s+/g, '')))
  const bPointsToA = ibansB.some((iban) => knownIbansA.includes(iban.toUpperCase().replace(/\s+/g, '')))

  if (hasDirectDescIban) {
    score += 120
  } else if (aPointsToB || bPointsToA) {
    score += 100
  }

  // Institution name mention (e.g. Account A mentions 'N26' or Account B mentions 'Commerzbank')
  const genericTokens = new Set(['bank', 'ag', 'gmbh', 'deutschland', 'germany', 'online', 'direct', 'direkt'])
  const instWordsA = normInstA.split(' ').filter((w) => w.length >= 3 && !genericTokens.has(w))
  const instWordsB = normInstB.split(' ').filter((w) => w.length >= 3 && !genericTokens.has(w))

  const matchesInstA =
    (normInstA.length >= 3 && normDescB.includes(normInstA)) ||
    instWordsA.some((w) => normDescB.includes(w))
  const matchesInstB =
    (normInstB.length >= 3 && normDescA.includes(normInstB)) ||
    instWordsB.some((w) => normDescA.includes(w))

  if (matchesInstA || matchesInstB) {
    score += 80
  }

  // Shared name tokens (e.g. user's own name 'Anel Memic' present in counterparties)
  const wordsA = normDescA.split(' ').filter((w) => w.length >= 3)
  const wordsB = normDescB.split(' ').filter((w) => w.length >= 3)
  const sharedWords = wordsA.filter((w) => wordsB.includes(w))
  if (sharedWords.length >= 2) {
    score += 60
  } else if (sharedWords.length === 1) {
    score += 10
  }

  // Transfer keywords
  const hasKeyword = TRANSFER_KEYWORDS.some(
    (kw) => normDescA.includes(kw) || normDescB.includes(kw),
  )
  if (hasKeyword) {
    score += 30
  }

  // Require at least one reliable clue connecting the two accounts:
  // - Direct description IBAN cross-reference
  // - Institution name mention
  // - 2+ shared name tokens
  // - Transfer keyword combined with at least 1 shared word
  // - IBAN pointing to the target account combined with an institution mention, transfer keyword, or shared name
  const hasReliableClue =
    hasDirectDescIban ||
    matchesInstA ||
    matchesInstB ||
    sharedWords.length >= 2 ||
    (hasKeyword && sharedWords.length >= 1) ||
    ((aPointsToB || bPointsToA) &&
      (matchesInstA || matchesInstB || sharedWords.length >= 2 || (hasKeyword && sharedWords.length >= 1)))

  if (!hasReliableClue) {
    return 0
  }

  return score
}

export function isTransferCandidate(
  txA: Transaction,
  accountA: ImportedAccount,
  txB: Transaction,
  accountB: ImportedAccount,
): boolean {
  return calculateTransferCandidateScore(txA, accountA, txB, accountB) > 0
}

export interface MatchedTransferPair {
  txA: Transaction
  txB: Transaction
  accountAId: string
  accountBId: string
}

/**
 * Scans all imported accounts and identifies reciprocal transfers between them.
 * Links matched pairs as ghost transactions (`isGhost: true`, `linkedTransactionId`),
 * and marks single-legged transfers to known user account IBANs as ghosts (`isGhost: true`).
 */
export function reconcileCrossAccountTransfers(accounts: ImportedAccount[]): ImportedAccount[] {
  if (!accounts || accounts.length < 2) {
    // If fewer than 2 accounts, no cross-account transfers can exist; reset any ghost flags
    return (accounts || []).map((acc) => ({
      ...acc,
      transactions: acc.transactions.map((tx) =>
        tx.isGhost ? { ...tx, isGhost: false, linkedTransactionId: undefined } : tx,
      ),
      duplicateTransactions: acc.duplicateTransactions?.map((tx) =>
        tx.isGhost ? { ...tx, isGhost: false, linkedTransactionId: undefined } : tx,
      ),
      modifiedTransactions: acc.modifiedTransactions?.map((tx) =>
        tx.isGhost ? { ...tx, isGhost: false, linkedTransactionId: undefined } : tx,
      ),
    }))
  }

  // Flatten all transactions with their owning account index
  interface IndexedTx {
    accIdx: number
    tx: Transaction
  }

  const allIndexed: IndexedTx[] = []
  accounts.forEach((acc, accIdx) => {
    acc.transactions.forEach((tx) => {
      allIndexed.push({ accIdx, tx })
    })
    acc.duplicateTransactions?.forEach((tx) => {
      allIndexed.push({ accIdx, tx })
    })
    acc.modifiedTransactions?.forEach((tx) => {
      allIndexed.push({ accIdx, tx })
    })
  })

  // Map of transaction ID to paired transaction ID
  const matchedPairsMap = new Map<string, string>()
  const usedTxIds = new Set<string>()

  // Phase 1: Score-based global pairing across different accounts
  interface CandidatePair {
    itemA: IndexedTx
    itemB: IndexedTx
    score: number
    diffDays: number
  }

  const candidatePairs: CandidatePair[] = []

  // Group candidate negative transactions by absolute rounded cents for O(1) matching
  const negativeByCents = new Map<number, IndexedTx[]>()
  for (const item of allIndexed) {
    if (item.tx.amount < 0) {
      const cents = Math.abs(Math.round(item.tx.amount * 100))
      let list = negativeByCents.get(cents)
      if (!list) {
        list = []
        negativeByCents.set(cents, list)
      }
      list.push(item)
    }
  }

  for (const itemA of allIndexed) {
    if (itemA.tx.amount <= 0) continue
    const posCents = Math.round(itemA.tx.amount * 100)

    for (let c = posCents - 1; c <= posCents + 1; c++) {
      const candidates = negativeByCents.get(c)
      if (!candidates || candidates.length === 0) continue

      for (const itemB of candidates) {
        if (itemA.accIdx === itemB.accIdx) continue
        if (
          accounts[itemA.accIdx].institutionId &&
          accounts[itemA.accIdx].institutionId === accounts[itemB.accIdx].institutionId
        ) {
          continue
        }

        const score = calculateTransferCandidateScore(
          itemA.tx,
          accounts[itemA.accIdx],
          itemB.tx,
          accounts[itemB.accIdx],
        )
        if (score > 0) {
          candidatePairs.push({
            itemA,
            itemB,
            score,
            diffDays: dateDiffInDays(itemA.tx.date, itemB.tx.date),
          })
        }
      }
    }
  }

  // Sort candidate pairs: highest score first, then smallest date diff
  candidatePairs.sort((a, b) => b.score - a.score || a.diffDays - b.diffDays)

  for (const pair of candidatePairs) {
    if (usedTxIds.has(pair.itemA.tx.id) || usedTxIds.has(pair.itemB.tx.id)) continue
    usedTxIds.add(pair.itemA.tx.id)
    usedTxIds.add(pair.itemB.tx.id)
    matchedPairsMap.set(pair.itemA.tx.id, pair.itemB.tx.id)
    matchedPairsMap.set(pair.itemB.tx.id, pair.itemA.tx.id)
  }

  // Collect known IBANs for each account
  const knownAccountIbans = new Map<number, Set<string>>()
  accounts.forEach((acc, accIdx) => {
    const ibanSet = new Set<string>()
    if (acc.accountIbans) {
      acc.accountIbans.forEach((iban) => ibanSet.add(iban.toUpperCase().replace(/\s+/g, '')))
    }
    acc.transactions.forEach((tx) => {
      if (tx.ownIban) {
        ibanSet.add(tx.ownIban.toUpperCase().replace(/\s+/g, ''))
      }
    })
    acc.duplicateTransactions?.forEach((tx) => {
      if (tx.ownIban) {
        ibanSet.add(tx.ownIban.toUpperCase().replace(/\s+/g, ''))
      }
    })
    knownAccountIbans.set(accIdx, ibanSet)
  })

  // Fast O(1) map of tx.id to IndexedTx
  const txById = new Map<string, IndexedTx>()
  for (const it of allIndexed) {
    txById.set(it.tx.id, it)
  }

  // Learn IBANs from matched pairs in Phase 1
  for (const [txAId, txBId] of matchedPairsMap.entries()) {
    const itemA = txById.get(txAId)
    const itemB = txById.get(txBId)
    if (!itemA || !itemB || itemA.accIdx === itemB.accIdx) continue

    const ibansOfB = knownAccountIbans.get(itemB.accIdx)
    if (ibansOfB) {
      if (itemA.tx.counterpartyIban) {
        ibansOfB.add(itemA.tx.counterpartyIban.toUpperCase().replace(/\s+/g, ''))
      }
      for (const ib of extractIbans(itemA.tx.description)) {
        ibansOfB.add(ib.toUpperCase().replace(/\s+/g, ''))
      }
    }

    const ibansOfA = knownAccountIbans.get(itemA.accIdx)
    if (ibansOfA) {
      if (itemB.tx.counterpartyIban) {
        ibansOfA.add(itemB.tx.counterpartyIban.toUpperCase().replace(/\s+/g, ''))
      }
      for (const ib of extractIbans(itemB.tx.description)) {
        ibansOfA.add(ib.toUpperCase().replace(/\s+/g, ''))
      }
    }
  }

  // Phase 2: Single-legged cross-account transfers (where the other account's statement
  // has a non-overlapping date range or does not cover older dates)
  const singleLeggedGhostTxIds = new Set<string>()

  // Pre-combine other account IBANs for each account index to avoid inner loop set iteration
  const otherIbansByAccIdx = new Map<number, Set<string>>()
  accounts.forEach((_, accIdx) => {
    const combined = new Set<string>()
    for (const [otherIdx, ibans] of knownAccountIbans.entries()) {
      if (otherIdx !== accIdx) {
        for (const ib of ibans) {
          combined.add(ib)
        }
      }
    }
    otherIbansByAccIdx.set(accIdx, combined)
  })

  for (let i = 0; i < allIndexed.length; i++) {
    const itemA = allIndexed[i]
    if (matchedPairsMap.has(itemA.tx.id)) continue

    const otherIbans = otherIbansByAccIdx.get(itemA.accIdx)
    if (!otherIbans || otherIbans.size === 0) continue

    const counterIban = itemA.tx.counterpartyIban
      ? itemA.tx.counterpartyIban.toUpperCase().replace(/\s+/g, '')
      : ''
    if (counterIban && otherIbans.has(counterIban)) {
      singleLeggedGhostTxIds.add(itemA.tx.id)
      continue
    }

    const descIbans = extractIbans(itemA.tx.description)
    if (descIbans.length > 0) {
      if (descIbans.some((ib) => otherIbans.has(ib.toUpperCase().replace(/\s+/g, '')))) {
        singleLeggedGhostTxIds.add(itemA.tx.id)
      }
    }
  }

  const reconcileTx = (tx: Transaction): Transaction => {
    const linkedId = matchedPairsMap.get(tx.id)
    if (linkedId) {
      return {
        ...tx,
        isGhost: true,
        linkedTransactionId: linkedId,
      }
    }
    if (singleLeggedGhostTxIds.has(tx.id)) {
      return {
        ...tx,
        isGhost: true,
        linkedTransactionId: undefined,
      }
    }
    if (tx.isGhost) {
      return {
        ...tx,
        isGhost: false,
        linkedTransactionId: undefined,
      }
    }
    return tx
  }

  // Update all accounts with the reconciled ghost status
  return accounts.map((acc) => ({
    ...acc,
    transactions: acc.transactions.map(reconcileTx),
    duplicateTransactions: acc.duplicateTransactions?.map(reconcileTx),
    modifiedTransactions: acc.modifiedTransactions?.map(reconcileTx),
  }))
}
