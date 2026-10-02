import type { Transaction } from '../../types'

/**
 * Checks whether a transaction is an informative entry with a value of 0 euro.
 * Informative transactions have no impact on the balance and are never categorized.
 */
export function isInformativeTransaction(tx?: { amount?: number } | null): boolean {
  if (!tx || typeof tx.amount !== 'number') return false
  return tx.amount === 0
}

/**
 * Normalizes a transaction description by stripping dates, long numbers,
 * special characters, and excess whitespace.
 */
export const normalizeDescription = (desc: string): string => {
  return (
    desc
      .toLowerCase()
      // Remove dates like DD/MM/YYYY, DD.MM.YY, DD-MM
      .replace(/\b\d{1,2}[-./]\d{1,2}([-./]\d{2,4})?\b/g, '')
      // Remove long numeric strings (e.g., transaction IDs, reference numbers)
      .replace(/\b\d{4,}\b/g, '')
      // Remove special characters, keep alphanumeric and spaces
      .replace(/[^\w\s]/g, ' ')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
  )
}

/**
 * Strips SEPA payment references, bank noise prefixes, transaction IDs,
 * timestamps, and dates from a transaction description to extract the
 * clean core payee/merchant/purpose description.
 */
export function extractCleanDescription(desc: string): string {
  if (!desc || typeof desc !== 'string') return ''

  let cleaned = desc.trim()

  // 1. Remove common German / European banking prefixes
  cleaned = cleaned.replace(
    /^(?:Auftraggeber|Empf[aä]nger|Zahlungsempf[aä]nger|Verwendungszweck|Buchungstext|Umsatztext)\s*:\s*/i,
    '',
  )

  // 2. Strip SEPA reference metadata tags and everything following them when appended at the end
  // Handles: End-to-End-Ref.: ..., End to End Ref: ..., EREF+..., KREF+..., MREF+..., CRED+...,
  // DEBT+..., SVWZ+..., Mandatsref: ..., Referenz: ..., Reference: ..., Ref. Nr: ..., IBAN: ..., BIC: ...
  cleaned = cleaned.replace(
    /(?:\b(?:End[-\s]?to[-\s]?End[-\s]?(?:Ref(?:\.|erenz|-Id)?)|EREF|KREF|MREF|CRED|DEBT|SVWZ|Mandatsref(?:\.|erenz)?|Referenz|Reference|Ref(?:\.|\s*Nr\.?)?|Gl[aä]ubiger[-\s]?ID)\s*[:+]?|\b(?:IBAN|BIC)\s*:\s*[A-Z0-9]+).*/i,
    '',
  )

  // 3. Remove date formats (DD.MM.YYYY, DD/MM/YYYY, DD-MM-YY, etc.) and timestamps
  cleaned = cleaned.replace(
    /\b(?:am\s+)?\d{1,2}[-./]\d{1,2}(?:[-./]\d{2,4})?(?:\s+(?:um\s+)?\d{1,2}:\d{2}(?::\d{2})?)?\b/gi,
    ' ',
  )

  // 4. Remove standalone long numeric or alphanumeric reference codes (8+ chars with digits, e.g. terminal/auth IDs)
  cleaned = cleaned.replace(/\b[A-Za-z0-9]*\d[A-Za-z0-9]{7,}\b/g, ' ')

  // 5. Remove standalone numbers with 4+ digits (e.g. postal codes, terminal codes, internal IDs)
  cleaned = cleaned.replace(/\b\d{4,}\b/g, ' ')

  // 6. Clean up extraneous punctuation while preserving periods, ampersands, and hyphens in brand names
  cleaned = cleaned
    .replace(/[^\w\s\u00C0-\u024F\u0400-\u04FF.&-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.:;/-]+|[\s,.:;/-]+$/g, '')
    .trim()

  return cleaned
}

/**
 * Extracts a concise, reusable merchant keyword from a transaction description
 * by stripping banking prefixes, corporate legal forms, branch/terminal codes, and noise.
 * Useful for learning smart category rules that match future transactions from the same merchant.
 */
export function extractMerchantKeyword(desc: string): string {
  if (!desc || typeof desc !== 'string') return ''

  // Start with clean description
  let merchant = extractCleanDescription(desc)
  if (!merchant) return ''

  // 1. Remove corporate legal entity suffixes
  merchant = merchant.replace(
    /\b(?:gmbh(?:\s*&\s*co\.?\s*kg)?|ag|se|ltd\.?|inc\.?|llc|kgaa|ug|e\.?\s*k\.?|co\.?\s*kg|sp\.?\s*z\s*o\.?\s*o\.?|d\.?o\.?o\.?|bv|s\.?a\.?r\.?l\.?)\b/gi,
    ' ',
  )

  // 2. Remove branch / store suffixes and terminal numbers (e.g. 'Filiale 1234', 'Store #5')
  merchant = merchant.replace(/\b(?:filiale|fil\.|store|branch|pos|terminal)\b.*$/i, ' ')

  // 3. Remove trailing city names commonly appended in European card terminals
  merchant = merchant.replace(
    /\s+(?:berlin|m[uü]nchen|hamburg|k[oö]ln|frankfurt|stuttgart|d[uü]sseldorf|dortmund|essen|leipzig|bremen|dresden|hannover|n[uü]rnberg|wien|z[uü]rich|warszawa|krak[oó]w|sarajevo|beograd|zagreb|london|paris)\b.*$/i,
    ' ',
  )

  // 4. Clean up spaces and punctuation
  merchant = merchant
    .replace(/[^\w\s\u00C0-\u024F\u0400-\u04FF.&-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.:;/-]+|[\s,.:;/-]+$/g, '')
    .trim()

  return merchant.length >= 2 ? merchant : extractCleanDescription(desc)
}

/**
 * Determines whether two transaction descriptions are related
 * (e.g., same core merchant or recurring charge with different SEPA/card reference IDs).
 */
export function isRelatedTransaction(descA: string, descB: string): boolean {
  if (!descA || !descB) return false

  const cleanA = extractCleanDescription(descA).toLowerCase()
  const cleanB = extractCleanDescription(descB).toLowerCase()

  // 1. Exact match on clean description (if length >= 3)
  if (cleanA.length >= 3 && cleanA === cleanB) return true

  // 2. Normalized description fallback
  const normA = normalizeDescription(descA)
  const normB = normalizeDescription(descB)
  if (normA.length >= 3 && normA === normB) return true

  // 3. Prefix matching: if one clean string starts with the other on a word boundary
  // Require at least 8 characters for the shorter string to avoid false positives (e.g. "Bar", "Apple")
  if (cleanA.length >= 8 && cleanB.length >= 8) {
    const shorter = cleanA.length <= cleanB.length ? cleanA : cleanB
    const longer = cleanA.length <= cleanB.length ? cleanB : cleanA
    if (longer.startsWith(shorter)) {
      const nextChar = longer.charAt(shorter.length)
      if (nextChar === '' || nextChar === ' ' || nextChar === '-' || nextChar === '/') {
        return true
      }
    }
  }

  return false
}

/**
 * Finds all non-ghost transactions in a collection that are related to the target transaction.
 * If targetCategory is specified, filters only candidates whose category is different from targetCategory.
 */
export function findRelatedTransactions(
  targetTx: Transaction,
  allTransactions: Transaction[],
  targetCategory?: string,
): Transaction[] {
  if (!targetTx || !allTransactions || allTransactions.length === 0 || isInformativeTransaction(targetTx)) return []

  const seenIds = new Set<string>()
  const results: Transaction[] = []

  for (const candidate of allTransactions) {
    if (!candidate || candidate.id === targetTx.id || candidate.isGhost || isInformativeTransaction(candidate)) {
      continue
    }

    if (seenIds.has(candidate.id)) {
      continue
    }

    // If targetCategory is specified, only include transactions that don't already have that category
    if (targetCategory !== undefined && candidate.category === targetCategory) {
      continue
    }

    if (isRelatedTransaction(targetTx.description, candidate.description)) {
      seenIds.add(candidate.id)
      results.push(candidate)
    }
  }

  return results
}
