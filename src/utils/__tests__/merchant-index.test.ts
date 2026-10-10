import { describe, expect, it } from 'vitest'

import { POPULAR_MERCHANTS } from '../../data/merchants'
import { getCandidateMerchants, INDEXED_MERCHANTS } from '../merchant-index'

describe('merchant-index', () => {
  it('should have indexed all popular merchants with lowercased terms', () => {
    expect(INDEXED_MERCHANTS.length).toBe(POPULAR_MERCHANTS.length)
    expect(INDEXED_MERCHANTS[0].keywordLower).toBe(POPULAR_MERCHANTS[0].keyword.toLowerCase())
    expect(INDEXED_MERCHANTS[0].nameLower).toBe(POPULAR_MERCHANTS[0].name.toLowerCase())
  })

  it('should find matching candidates for popular brands', () => {
    const candidates = getCandidateMerchants('rewe markt gmbh einkauf')
    const rewe = candidates.find((c) => c.merchant.name === 'REWE')
    expect(rewe).toBeDefined()
  })

  it('should include candidates with short terms (<3 chars)', () => {
    // "dm" has alias length 2 ('dm')
    const candidates = getCandidateMerchants('dm filiale 1234')
    const dm = candidates.find((c) => c.merchant.id === 'dm')
    expect(dm).toBeDefined()
  })

  it('should filter out completely unrelated merchants', () => {
    const candidates = getCandidateMerchants('abcdefgh xyz 12345')
    // Should be a tiny fraction of the total 533 merchants (only short terms)
    expect(candidates.length).toBeLessThan(50)
  })

  it('should support reverse-matching names when requested', () => {
    // Searching for "ub" or partial name
    const candidates = getCandidateMerchants('uber', { includeNamesContainingText: true })
    const uber = candidates.find((c) => c.merchant.name === 'Uber')
    expect(uber).toBeDefined()
  })
})
