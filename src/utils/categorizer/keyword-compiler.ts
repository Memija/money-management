import { escapeRegExp } from '../regex-utils'
import { isPaymentProcessorOnly } from './description-cleaning'

const WORD_CHAR_START = /^[\p{L}\p{N}]/u
const WORD_CHAR_END = /[\p{L}\p{N}]$/u
const LEADING_BOUNDARY = '(?<![\\p{L}\\p{N}])'
const TRAILING_BOUNDARY = '(?![\\p{L}\\p{N}])'

interface KeywordParts {
  escaped: string
  hasLeading: boolean
  hasTrailing: boolean
}

export function toKeywordParts(keyword: string): KeywordParts | undefined {
  const trimmed = keyword.trim()
  if (!trimmed) {
    return undefined
  }

  // Strip existing explicit boundary markers like \b and wrap uniformly
  const stripped = trimmed.replace(/^\\b|\\b$/g, '').trim()
  if (!stripped) {
    return undefined
  }

  return {
    escaped: escapeRegExp(stripped),
    hasLeading: WORD_CHAR_START.test(stripped),
    hasTrailing: WORD_CHAR_END.test(stripped),
  }
}

/**
 * Converts a keyword string into a Unicode-aware regular expression pattern.
 * Uses lookbehind (?<![\p{L}\p{N}]) and lookahead (?![\p{L}\p{N}]) to enforce
 * strict token/word boundaries.
 */
export function keywordToPattern(keyword: string): string {
  const parts = toKeywordParts(keyword)
  if (!parts) {
    return ''
  }
  const leading = parts.hasLeading ? LEADING_BOUNDARY : ''
  const trailing = parts.hasTrailing ? TRAILING_BOUNDARY : ''
  return `${leading}${parts.escaped}${trailing}`
}

/**
 * Compiles a list of keywords into one boundary-aware regex, equivalent to joining
 * `keywordToPattern` results with `|`, but with the lookarounds factored out per boundary group.
 */
export function buildKeywordRegex(keywords: string[]): RegExp | undefined {
  const groups = new Map<string, string[]>()
  for (const keyword of new Set(keywords)) {
    const parts = toKeywordParts(keyword)
    if (!parts) {
      continue
    }
    const groupKey = `${parts.hasLeading ? LEADING_BOUNDARY : ''}|${parts.hasTrailing ? TRAILING_BOUNDARY : ''}`
    const group = groups.get(groupKey)
    if (group) {
      group.push(parts.escaped)
    } else {
      groups.set(groupKey, [parts.escaped])
    }
  }
  if (groups.size === 0) {
    return undefined
  }

  const alternatives = [...groups].map(([groupKey, escapedWords]) => {
    const [leading, trailing] = groupKey.split('|')
    return `${leading}(?:${escapedWords.join('|')})${trailing}`
  })
  return new RegExp(alternatives.join('|'), 'iu')
}

export interface CompiledCustomKeyword {
  category: string
  word: string
  regex?: RegExp
}

export interface CompiledCustomKeywords {
  entries: CompiledCustomKeyword[]
  anyMatch?: RegExp
}

const compiledCustomKeywordsCache = new WeakMap<Record<string, string[]>, CompiledCustomKeywords>()

export function buildCombinedPrefilter(words: string[]): RegExp | undefined {
  try {
    return buildKeywordRegex(words)
  } catch {
    return undefined
  }
}

export function compileCustomKeywords(
  customKeywords: Record<string, string[]>,
): CompiledCustomKeywords {
  const cached = compiledCustomKeywordsCache.get(customKeywords)
  if (cached) {
    return cached
  }

  const entries: CompiledCustomKeyword[] = []
  const prefilterWords: string[] = []
  let canPrefilter = true
  for (const [category, words] of Object.entries(customKeywords)) {
    if (!words || words.length === 0) {
      continue
    }
    for (const word of words) {
      if (!word || !word.trim()) {
        continue
      }
      if (isPaymentProcessorOnly(word)) {
        continue
      }
      const pattern = keywordToPattern(word)
      let regex: RegExp | undefined
      try {
        regex = new RegExp(pattern, 'iu')
      } catch {
        regex = undefined
      }
      if (!regex || !pattern) {
        canPrefilter = false
      }
      prefilterWords.push(word)
      entries.push({ category, word: word.toLowerCase(), regex })
    }
  }
  const compiled: CompiledCustomKeywords = {
    entries,
    anyMatch: canPrefilter ? buildCombinedPrefilter(prefilterWords) : undefined,
  }
  compiledCustomKeywordsCache.set(customKeywords, compiled)
  return compiled
}

export function toDisplayCategory(cat: string): string {
  if (cat === 'DiningOut') {
    return 'Dining Out'
  }
  if (cat === 'BankFees') {
    return 'Bank Fees'
  }
  return cat
}

export function matchCustomKeywords(
  d: string,
  customKeywords: Record<string, string[]>,
): string | undefined {
  const { entries, anyMatch } = compileCustomKeywords(customKeywords)
  if (anyMatch && !anyMatch.test(d)) {
    return undefined
  }
  for (const { category, word, regex } of entries) {
    const isMatch = regex ? regex.test(d) : d.includes(word)
    if (isMatch) {
      return toDisplayCategory(category)
    }
  }
  return undefined
}
