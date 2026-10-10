import { type MerchantSuggestion, POPULAR_MERCHANTS } from '../data/merchants'

/**
 * A popular merchant with all of its match terms pre-lowercased,
 * so hot matching loops don't allocate new strings on every call.
 */
export interface IndexedMerchant {
  merchant: MerchantSuggestion
  keywordLower: string
  aliasesLower: string[]
  nameLower: string
}

/** Length of the leading n-gram used to index each merchant term. */
const NGRAM_SIZE = 3

/** All popular merchants (in original priority order) with pre-lowercased terms. */
export const INDEXED_MERCHANTS: readonly IndexedMerchant[] = POPULAR_MERCHANTS.map((merchant) => ({
  merchant,
  keywordLower: merchant.keyword.toLowerCase(),
  aliasesLower: (merchant.aliases || []).map((alias) => alias.toLowerCase()),
  nameLower: merchant.name.toLowerCase(),
}))

const CHAR_CODE_RANGE = 65536

/** Encodes the n-gram starting at `start` as a number, avoiding a substring allocation per position. */
const ngramKey = (text: string, start: number): number =>
  (text.charCodeAt(start) * CHAR_CODE_RANGE + text.charCodeAt(start + 1)) * CHAR_CODE_RANGE +
  text.charCodeAt(start + 2)

const ngramIndex = new Map<number, number[]>()
const alwaysCandidateIndices: number[] = []

INDEXED_MERCHANTS.forEach((entry, idx) => {
  const grams = new Set<number>()
  let hasShortTerm = false
  for (const term of [entry.keywordLower, ...entry.aliasesLower, entry.nameLower]) {
    if (term.length < NGRAM_SIZE) {
      hasShortTerm = true
      continue
    }
    grams.add(ngramKey(term, 0))
  }
  if (hasShortTerm) {
    alwaysCandidateIndices.push(idx)
  }
  for (const gram of grams) {
    const bucket = ngramIndex.get(gram)
    if (bucket) {
      bucket.push(idx)
    } else {
      ngramIndex.set(gram, [idx])
    }
  }
})

interface CandidateOptions {
  /** Also include merchants whose display name contains the text (reverse-direction matching). */
  includeNamesContainingText?: boolean
}

/**
 * Returns the subset of popular merchants that could possibly match the given lowercased text,
 * preserving the original merchant order so tie-breaking stays identical to a full scan.
 *
 * A term can only occur in the text if its leading n-gram occurs in the text, so this is an exact
 * superset of all merchants whose keyword, aliases, or name are contained in the text — it just
 * skips the hundreds of merchants that cannot match.
 * @param textLower - Lowercased text to match against
 * @param options - Optional extra candidate rules
 * @returns Candidate merchants in original priority order
 */
export function getCandidateMerchants(
  textLower: string,
  options?: CandidateOptions,
): IndexedMerchant[] {
  const marks = new Uint8Array(INDEXED_MERCHANTS.length)
  for (const idx of alwaysCandidateIndices) {
    marks[idx] = 1
  }
  for (let i = 0; i + NGRAM_SIZE <= textLower.length; i++) {
    const bucket = ngramIndex.get(ngramKey(textLower, i))
    if (bucket) {
      for (const idx of bucket) {
        marks[idx] = 1
      }
    }
  }
  if (options?.includeNamesContainingText) {
    INDEXED_MERCHANTS.forEach((entry, idx) => {
      if (entry.nameLower.includes(textLower)) {
        marks[idx] = 1
      }
    })
  }

  const candidates: IndexedMerchant[] = []
  for (let i = 0; i < marks.length; i++) {
    if (marks[i]) {
      candidates.push(INDEXED_MERCHANTS[i])
    }
  }
  return candidates
}
