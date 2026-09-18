import { describe, expect, it } from 'vitest'

import type { Transaction } from '../../types'
import { filterInternalSpaceTransfers } from '../account-transfers'

describe('filterInternalSpaceTransfers', () => {
  const createTx = (overrides: Partial<Transaction>): Transaction => ({
    id: 'tx-' + Math.random().toString(36).substring(2, 9),
    date: '2026-03-15',
    description: 'Sample description',
    amount: -50,
    currency: 'EUR',
    type: 'expense',
    institution: 'N26',
    ...overrides,
  })

  it('returns empty list and 0 count when input is empty or has single transaction', () => {
    expect(filterInternalSpaceTransfers([])).toEqual({
      transactions: [],
      discardedSpaceCount: 0,
      excludedTransactions: [],
    })

    const single = [createTx({ amount: -100 })]
    expect(filterInternalSpaceTransfers(single)).toEqual({
      transactions: single,
      discardedSpaceCount: 0,
      excludedTransactions: [],
    })
  })

  it('discards reciprocal space transfer pairs with German bank transfer keywords (Umbuchung / Space)', () => {
    const txA = createTx({
      id: 'tx-1',
      date: '2026-03-15',
      description: 'Umbuchung auf Space Notgroschen',
      amount: -500,
      type: 'expense',
    })
    const txB = createTx({
      id: 'tx-2',
      date: '2026-03-15',
      description: 'Umbuchung von Hauptkonto',
      amount: 500,
      type: 'income',
    })
    const txOther = createTx({
      id: 'tx-3',
      date: '2026-03-15',
      description: 'Supermarkt Einkauf',
      amount: -45.5,
      type: 'expense',
    })

    const result = filterInternalSpaceTransfers([txA, txB, txOther])
    expect(result.discardedSpaceCount).toBe(2)
    expect(result.transactions).toHaveLength(1)
    expect(result.transactions[0].id).toBe('tx-3')
    expect(result.excludedTransactions).toHaveLength(2)
    expect(result.excludedTransactions?.map((t) => t.id)).toEqual(expect.arrayContaining(['tx-1', 'tx-2']))
  })

  it('discards reciprocal space pairs with English space names (Main Account / Investment fund)', () => {
    const txA = createTx({
      id: 'tx-a',
      date: '2026-04-01',
      description: 'Investment fund',
      amount: -150,
      type: 'expense',
    })
    const txB = createTx({
      id: 'tx-b',
      date: '2026-04-01',
      description: 'Main Account',
      amount: 150,
      type: 'income',
    })

    const result = filterInternalSpaceTransfers([txA, txB])
    expect(result.discardedSpaceCount).toBe(2)
    expect(result.transactions).toHaveLength(0)
  })

  it('discards Pockets, Vaults, and Subaccount transfer pairs', () => {
    const tx1 = createTx({
      id: 'tx-p1',
      date: '2026-05-10',
      description: 'Transfer to Pocket Vacation',
      amount: -200,
      type: 'expense',
    })
    const tx2 = createTx({
      id: 'tx-p2',
      date: '2026-05-10',
      description: 'Pocket Vacation transfer',
      amount: 200,
      type: 'income',
    })

    const result = filterInternalSpaceTransfers([tx1, tx2])
    expect(result.discardedSpaceCount).toBe(2)
    expect(result.transactions).toHaveLength(0)
  })

  it('does NOT discard merchant refunds on the same date with matching opposite amounts', () => {
    const purchase = createTx({
      id: 'tx-buy',
      date: '2026-06-01',
      description: 'Zalando Payments GmbH',
      amount: -79.99,
      type: 'expense',
    })
    const refund = createTx({
      id: 'tx-ref',
      date: '2026-06-01',
      description: 'Zalando Payments GmbH Retoure',
      amount: 79.99,
      type: 'income',
    })

    const result = filterInternalSpaceTransfers([purchase, refund])
    expect(result.discardedSpaceCount).toBe(0)
    expect(result.transactions).toHaveLength(2)
  })

  it('does NOT discard unrelated transactions with equal opposite amounts on the same date', () => {
    const salary = createTx({
      id: 'tx-salary',
      date: '2026-07-01',
      description: 'Acme Corp Gehalt',
      amount: 3200,
      type: 'income',
    })
    const rent = createTx({
      id: 'tx-rent',
      date: '2026-07-01',
      description: 'Vermieter Schmidt Miete',
      amount: -3200,
      type: 'expense',
    })

    const result = filterInternalSpaceTransfers([salary, rent])
    expect(result.discardedSpaceCount).toBe(0)
    expect(result.transactions).toHaveLength(2)
  })

  it('correctly handles multiple pairs and leaves legitimate transactions intact', () => {
    const pair1A = createTx({
      id: 'p1-a',
      date: '2026-08-01',
      description: 'Umbuchung auf Tagesgeld',
      amount: -1000,
      type: 'expense',
    })
    const pair1B = createTx({
      id: 'p1-b',
      date: '2026-08-01',
      description: 'Übertrag von Girokonto',
      amount: 1000,
      type: 'income',
    })
    const pair2A = createTx({
      id: 'p2-a',
      date: '2026-08-15',
      description: 'Space Sparziel Auto',
      amount: -250,
      type: 'expense',
    })
    const pair2B = createTx({
      id: 'p2-b',
      date: '2026-08-15',
      description: 'Space Sparziel Auto Gutschrift',
      amount: 250,
      type: 'income',
    })
    const coffee = createTx({
      id: 'coffee',
      date: '2026-08-15',
      description: 'Espresso Bar Berlin',
      amount: -3.8,
      type: 'expense',
    })

    const result = filterInternalSpaceTransfers([pair1A, coffee, pair1B, pair2A, pair2B])
    expect(result.discardedSpaceCount).toBe(4)
    expect(result.transactions).toHaveLength(1)
    expect(result.transactions[0].id).toBe('coffee')
  })

  it('does NOT discard chargebacks, Storno, or Rücklastschrift reversals', () => {
    const originalDebit = createTx({
      id: 'tx-rev-1',
      date: '2026-03-10',
      description: 'Lastschrift Umbuchung Fitnessstudio',
      amount: -49.99,
      type: 'expense',
    })
    const reversal = createTx({
      id: 'tx-rev-2',
      date: '2026-03-10',
      description: 'Rücklastschrift Umbuchung Fitnessstudio',
      amount: 49.99,
      type: 'income',
    })

    const result = filterInternalSpaceTransfers([originalDebit, reversal])
    expect(result.discardedSpaceCount).toBe(0)
    expect(result.transactions).toHaveLength(2)
  })

  it('handles 1-calendar-day boundary for space transfers, but rejects > 1 day', () => {
    // 1 day apart -> accepted as space transfer
    const day1 = createTx({
      id: 'day-1',
      date: '2026-03-15',
      description: 'Umbuchung auf Space Notgroschen',
      amount: -100,
      type: 'expense',
    })
    const day2 = createTx({
      id: 'day-2',
      date: '2026-03-16',
      description: 'Umbuchung von Hauptkonto',
      amount: 100,
      type: 'income',
    })
    expect(filterInternalSpaceTransfers([day1, day2]).discardedSpaceCount).toBe(2)

    // 2 days apart -> rejected
    const day3 = createTx({
      id: 'day-3',
      date: '2026-03-18',
      description: 'Umbuchung von Hauptkonto',
      amount: 100,
      type: 'income',
    })
    expect(filterInternalSpaceTransfers([day1, day3]).discardedSpaceCount).toBe(0)
  })

  it('recognizes multilingual space keywords (Serbian/Bosnian podračun, štednja, English savings pot)', () => {
    const txSr1 = createTx({
      id: 'sr-1',
      date: '2026-04-10',
      description: 'Prenos na podračun štednja',
      amount: -300,
      type: 'expense',
    })
    const txSr2 = createTx({
      id: 'sr-2',
      date: '2026-04-10',
      description: 'Glavni račun prenos',
      amount: 300,
      type: 'income',
    })
    expect(filterInternalSpaceTransfers([txSr1, txSr2]).discardedSpaceCount).toBe(2)

    const txEn1 = createTx({
      id: 'en-1',
      date: '2026-04-15',
      description: 'Move to Savings Pot',
      amount: -75,
      type: 'expense',
    })
    const txEn2 = createTx({
      id: 'en-2',
      date: '2026-04-15',
      description: 'Main account savings pot',
      amount: 75,
      type: 'income',
    })
    expect(filterInternalSpaceTransfers([txEn1, txEn2]).discardedSpaceCount).toBe(2)
  })

  it('does NOT falsely mark SEPA transfers, Dauerauftrag, Junior Depot, or external counterparty transfers as space transfers', () => {
    // 01/02/2026 pair
    const tx1 = createTx({
      id: 'tx-cmz-1',
      date: '2026-02-01',
      description:
        'Anel Memic Sent from N26 End-to-End-Ref.: NOTPROVIDED Kundenreferenz: 4bf2726750a14accace9800b5ce2d73a',
      amount: 250,
      type: 'income',
      institution: 'Commerzbank',
    })
    const tx2 = createTx({
      id: 'tx-cmz-2',
      date: '2026-02-01',
      description:
        'ARTUR MEMIC COBADEHD077 DE97200411770239797400 JUNIOR DEPOT End-to-End-Ref.: NOTPROVIDED Dauerauftrag',
      amount: -250,
      type: 'expense',
      institution: 'Commerzbank',
      counterpartyIban: 'DE97200411770239797400',
    })

    // 11/03/2025 pair
    const tx3 = createTx({
      id: 'tx-cmz-3',
      date: '2025-03-11',
      description:
        'ARTUR MEMIC COBADEHD077 DE97200411770239797400 JUNIOR DEPOT End-to-End-Ref.: NOTPROVIDED Dauerauftrag',
      amount: -250,
      type: 'expense',
      institution: 'Commerzbank',
      counterpartyIban: 'DE97200411770239797400',
    })
    const tx4 = createTx({
      id: 'tx-cmz-4',
      date: '2025-03-11',
      description:
        'Biljana Memic Hilfe End-to-End-Ref.: NOTPROVIDED Kundenreferenz: CD-SCT-676910088',
      amount: 250,
      type: 'income',
      institution: 'Commerzbank',
    })

    const result = filterInternalSpaceTransfers([tx1, tx2, tx3, tx4])
    expect(result.discardedSpaceCount).toBe(0)
    expect(result.transactions).toHaveLength(4)
    expect(result.excludedTransactions).toHaveLength(0)
  })
})
