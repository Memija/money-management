import { createBoundedCache } from './bounded-cache'

/**
 * Escapes all RegExp metacharacters in a string so it can be embedded literally in a pattern.
 * @param str - Raw string to escape
 * @returns Escaped string safe for use inside `new RegExp()`
 */
export const escapeRegExp = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const termRegexCache = createBoundedCache<RegExp>()

/**
 * Returns a compiled, cached, case-insensitive regex that matches `term` as a whole ASCII token.
 * Compiling regexes is expensive; caching avoids recompiling the same merchant keyword
 * thousands of times when categorizing or rendering large transaction lists.
 */
const getTermRegex = (term: string): RegExp => {
  const cached = termRegexCache.get(term)
  if (cached) {
    return cached
  }
  const leadingBoundary = /^[a-z0-9]/i.test(term) ? '(^|[^a-z0-9])' : ''
  const trailingBoundary = /[a-z0-9]$/i.test(term) ? '([^a-z0-9]|$)' : ''
  const pattern = new RegExp(`${leadingBoundary}${escapeRegExp(term)}${trailingBoundary}`, 'i')
  termRegexCache.set(term, pattern)
  return pattern
}

/**
 * Checks whether `term` occurs in `text` bounded by non-alphanumeric characters
 * (e.g. 'dm' matches 'dm drogerie' but not 'admin').
 * @param text - Text to search in
 * @param term - Term to look for
 */
export const matchesTerm = (text: string, term: string): boolean => getTermRegex(term).test(text)

/**
 * Fast variant of `matchesTerm` for inputs that are both already lowercased.
 * A plain substring check is a necessary condition for a match, so it cheaply
 * rules out the vast majority of terms before running the boundary regex.
 * @param textLower - Lowercased text to search in
 * @param termLower - Lowercased term to look for
 */
export const matchesLowercaseTerm = (textLower: string, termLower: string): boolean =>
  textLower.includes(termLower) && matchesTerm(textLower, termLower)
