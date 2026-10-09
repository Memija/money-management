import { describe, expect, it } from 'vitest'

import { buildKeywordRegex, keywordToPattern } from './categorizer/categorizer'
import { escapeRegExp, matchesLowercaseTerm, matchesTerm } from './regex-utils'

describe('escapeRegExp', () => {
  it('should escape regex metacharacters', () => {
    expect(new RegExp(escapeRegExp('a.b*c')).test('a.b*c')).toBe(true)
    expect(new RegExp(escapeRegExp('a.b*c')).test('axbbc')).toBe(false)
  })
})

describe('matchesTerm', () => {
  it('should match whole tokens only', () => {
    expect(matchesTerm('dm drogerie markt', 'dm')).toBe(true)
    expect(matchesTerm('admin fee', 'dm')).toBe(false)
  })

  it('should be case-insensitive', () => {
    expect(matchesTerm('REWE Markt', 'rewe')).toBe(true)
  })
})

describe('matchesLowercaseTerm', () => {
  it('should behave like matchesTerm for lowercased input', () => {
    expect(matchesLowercaseTerm('dm drogerie markt', 'dm')).toBe(true)
    expect(matchesLowercaseTerm('admin fee', 'dm')).toBe(false)
    expect(matchesLowercaseTerm('booking.com hotel', 'booking.com')).toBe(true)
  })
})

describe('buildKeywordRegex', () => {
  const KEYWORDS = ['car', 'rent', 'c&a', '#tag', 'h&m', 'miete', '\\bweg\\b', 'ölwechsel']
  const SAMPLES = [
    'mastercard payment',
    'car wash',
    'current account',
    'monthly rent',
    'c&a store',
    'my #tag here',
    'h&m berlin',
    'bewegung',
    'weg 12',
    'ölwechsel werkstatt',
    'kaltmiete',
  ]

  it('should return identical results to the joined keywordToPattern regex', () => {
    const reference = new RegExp(KEYWORDS.map(keywordToPattern).filter(Boolean).join('|'), 'iu')
    const factored = buildKeywordRegex(KEYWORDS)
    for (const sample of [...SAMPLES, ...KEYWORDS]) {
      expect(factored?.test(sample)).toBe(reference.test(sample))
    }
  })

  it('should return undefined for empty keyword lists', () => {
    expect(buildKeywordRegex([])).toBeUndefined()
    expect(buildKeywordRegex(['  ', ''])).toBeUndefined()
  })
})
