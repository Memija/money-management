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
  'max o. erika mustermann',
  'max o erika mustermann',
  'max oder erika mustermann',
  'erika o. max mustermann',
  'erika o max mustermann',
  'erika oder max mustermann',
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
  if (!normDesc) {
    return false
  }
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

  const knownIbansA = [...(accountA.accountIbans || []), ...(txA.ownIban ? [txA.ownIban] : [])].map(
    (ib) => ib.toUpperCase().replace(/\s+/g, ''),
  )

  const knownIbansB = [...(accountB.accountIbans || []), ...(txB.ownIban ? [txB.ownIban] : [])].map(
    (ib) => ib.toUpperCase().replace(/\s+/g, ''),
  )

  const aPointsToB = ibansA.some((iban) =>
    knownIbansB.includes(iban.toUpperCase().replace(/\s+/g, '')),
  )
  const bPointsToA = ibansB.some((iban) =>
    knownIbansA.includes(iban.toUpperCase().replace(/\s+/g, '')),
  )

  if (hasDirectDescIban) {
    score += 120
  } else if (aPointsToB || bPointsToA) {
    score += 100
  }

  // Institution name mention (e.g. Account A mentions 'N26' or Account B mentions 'Commerzbank')
  const genericTokens = new Set([
    'bank',
    'ag',
    'gmbh',
    'deutschland',
    'germany',
    'online',
    'direct',
    'direkt',
  ])
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
  const hasReliableClue =
    hasDirectDescIban ||
    matchesInstA ||
    matchesInstB ||
    sharedWords.length >= 2 ||
    (hasKeyword && sharedWords.length >= 1) ||
    ((aPointsToB || bPointsToA) &&
      (matchesInstA ||
        matchesInstB ||
        sharedWords.length >= 2 ||
        (hasKeyword && sharedWords.length >= 1)))

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
