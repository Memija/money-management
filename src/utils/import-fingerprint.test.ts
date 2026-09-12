import { describe, expect, it } from 'vitest'

import type { Transaction } from '../types'
import { computeImportFingerprint } from './import-fingerprint'

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'irrelevant-id',
  date: '2025-03-01',
  description: 'Supermarket Purchase',
  amount: -45.9,
  currency: 'EUR',
  type: 'expense',
  institution: 'TestBank',
  ...overrides,
})

describe('computeImportFingerprint', () => {
  it('returns "empty" for an empty list', () => {
    expect(computeImportFingerprint([])).toBe('empty')
  })

  it('produces the same fingerprint for the same transactions', () => {
    const txs = [
      makeTransaction({ date: '2025-03-01', amount: -45.9, description: 'Supermarket' }),
      makeTransaction({ date: '2025-03-02', amount: 3500, description: 'Freelance' }),
    ]
    expect(computeImportFingerprint(txs)).toBe(computeImportFingerprint(txs))
  })

  it('is order-independent — same transactions in different order yield the same fingerprint', () => {
    const tx1 = makeTransaction({ date: '2025-03-01', amount: -45.9, description: 'Supermarket' })
    const tx2 = makeTransaction({ date: '2025-03-02', amount: 3500, description: 'Freelance' })

    const fp1 = computeImportFingerprint([tx1, tx2])
    const fp2 = computeImportFingerprint([tx2, tx1])

    expect(fp1).toBe(fp2)
  })

  it('is ID-independent — different IDs but same content yield the same fingerprint', () => {
    const tx1 = makeTransaction({ id: 'aaa', date: '2025-03-01', amount: -100, description: 'Rent' })
    const tx2 = makeTransaction({ id: 'bbb', date: '2025-03-01', amount: -100, description: 'Rent' })

    expect(computeImportFingerprint([tx1])).toBe(computeImportFingerprint([tx2]))
  })

  it('produces different fingerprints for different transaction sets', () => {
    const set1 = [makeTransaction({ date: '2025-03-01', amount: -45.9, description: 'Supermarket' })]
    const set2 = [makeTransaction({ date: '2025-03-01', amount: -50.0, description: 'Supermarket' })]

    expect(computeImportFingerprint(set1)).not.toBe(computeImportFingerprint(set2))
  })

  it('is case-insensitive for descriptions', () => {
    const tx1 = makeTransaction({ description: 'SUPERMARKET PURCHASE' })
    const tx2 = makeTransaction({ description: 'supermarket purchase' })

    expect(computeImportFingerprint([tx1])).toBe(computeImportFingerprint([tx2]))
  })

  it('produces different fingerprints when a transaction is added', () => {
    const base = [makeTransaction({ date: '2025-03-01', amount: -45.9, description: 'Supermarket' })]
    const extended = [
      ...base,
      makeTransaction({ date: '2025-03-02', amount: 3500, description: 'Freelance' }),
    ]

    expect(computeImportFingerprint(base)).not.toBe(computeImportFingerprint(extended))
  })

  it('returns a non-empty string for a single transaction', () => {
    const fp = computeImportFingerprint([makeTransaction()])
    expect(typeof fp).toBe('string')
    expect(fp.length).toBeGreaterThan(0)
    expect(fp).not.toBe('empty')
  })
})
