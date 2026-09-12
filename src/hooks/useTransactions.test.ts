import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAppStore } from '../store/useAppStore'
import type { ImportedAccount } from '../types'
import type { PeriodFilter } from './useAnalytics'
import { useTransactions } from './useTransactions'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAccount(
  institutionId: string,
  overrides: Partial<ImportedAccount> = {},
): ImportedAccount {
  return {
    institutionId,
    institutionName: institutionId,
    importedAt: '2024-01-01T00:00:00Z',
    importedFingerprints: [],
    transactions: [],
    ...overrides,
  }
}

type RawTransaction = ImportedAccount['transactions'][number]

function makeTx(overrides: Partial<RawTransaction> = {}): RawTransaction {
  return {
    id: crypto.randomUUID(),
    date: '2024-01-15',
    description: 'Some payment',
    amount: -10,
    currency: 'EUR',
    type: 'expense',
    institution: 'bank-a',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useTransactions', () => {
  beforeEach(() => {
    useAppStore.setState({ importedAccounts: [] })
  })

  // ---- Initial state -------------------------------------------------------

  it('should return empty arrays when there are no imported accounts', () => {
    const { result } = renderHook(() => useTransactions())
    expect(result.current.allTransactions).toHaveLength(0)
    expect(result.current.filteredTx).toHaveLength(0)
  })

  // ---- Category derivation -------------------------------------------------

  it('should assign the "Salary" category to matching descriptions', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', {
          transactions: [makeTx({ description: 'Monthly Salary Payment' })],
        }),
      ],
    })

    const { result } = renderHook(() => useTransactions())
    expect(result.current.allTransactions[0].category).toBe('Salary')
  })

  it('should assign the "Groceries" category for supermarket descriptions', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', {
          transactions: [makeTx({ description: 'REWE Markt Berlin' })],
        }),
      ],
    })

    const { result } = renderHook(() => useTransactions())
    expect(result.current.allTransactions[0].category).toBe('Groceries')
  })

  it('should fall back to "Other" for unrecognized descriptions', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', {
          transactions: [makeTx({ description: 'Random unknown vendor XYZ' })],
        }),
      ],
    })

    const { result } = renderHook(() => useTransactions())
    expect(result.current.allTransactions[0].category).toBe('Other')
  })

  // ---- Institution filter --------------------------------------------------

  it('should return all transactions when selectedInstitution is "all"', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', { transactions: [makeTx({ institution: 'bank-a' })] }),
        makeAccount('bank-b', { transactions: [makeTx({ institution: 'bank-b' })] }),
      ],
    })

    const { result } = renderHook(() => useTransactions())
    expect(result.current.filteredTx).toHaveLength(2)
  })

  it('should filter to only the selected institution', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', { transactions: [makeTx({ institution: 'bank-a' })] }),
        makeAccount('bank-b', { transactions: [makeTx({ institution: 'bank-b' })] }),
      ],
    })

    const { result } = renderHook(() => useTransactions())

    act(() => result.current.setSelectedInstitution('bank-a'))

    expect(result.current.filteredTx).toHaveLength(1)
    expect(result.current.filteredTx[0].institution).toBe('bank-a')
  })

  it('should show all transactions again after resetting institution filter to "all"', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', { transactions: [makeTx({ institution: 'bank-a' })] }),
        makeAccount('bank-b', { transactions: [makeTx({ institution: 'bank-b' })] }),
      ],
    })

    const { result } = renderHook(() => useTransactions())

    act(() => result.current.setSelectedInstitution('bank-a'))
    expect(result.current.filteredTx).toHaveLength(1)

    act(() => result.current.setSelectedInstitution('all'))
    expect(result.current.filteredTx).toHaveLength(2)
  })

  // ---- Search --------------------------------------------------------------

  it('should filter by description (case-insensitive)', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', {
          transactions: [
            makeTx({ description: 'REWE Berlin' }),
            makeTx({ description: 'Netflix subscription' }),
          ],
        }),
      ],
    })

    const { result } = renderHook(() => useTransactions())

    act(() => result.current.setSearchTerm('rewe'))

    expect(result.current.filteredTx).toHaveLength(1)
    expect(result.current.filteredTx[0].description).toBe('REWE Berlin')
  })

  it('should filter by derived category (case-insensitive)', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', {
          transactions: [
            makeTx({ description: 'Monthly Salary Payment' }),
            makeTx({ description: 'REWE supermarket' }),
          ],
        }),
      ],
    })

    const { result } = renderHook(() => useTransactions())

    act(() => result.current.setSearchTerm('groceries'))

    expect(result.current.filteredTx).toHaveLength(1)
    expect(result.current.filteredTx[0].category).toBe('Groceries')
  })

  it('should return all transactions when search term is cleared', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', {
          transactions: [makeTx({ description: 'REWE' }), makeTx({ description: 'Netflix' })],
        }),
      ],
    })

    const { result } = renderHook(() => useTransactions())

    act(() => result.current.setSearchTerm('REWE'))
    expect(result.current.filteredTx).toHaveLength(1)

    act(() => result.current.setSearchTerm(''))
    expect(result.current.filteredTx).toHaveLength(2)
  })

  // ---- Sort orders ---------------------------------------------------------

  it('should sort by newest date first (default)', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', {
          transactions: [
            makeTx({ date: '2024-01-01' }),
            makeTx({ date: '2024-03-15' }),
            makeTx({ date: '2024-02-10' }),
          ],
        }),
      ],
    })

    const { result } = renderHook(() => useTransactions())

    const dates = result.current.filteredTx.map((t) => t.date)
    expect(dates).toEqual(['2024-03-15', '2024-02-10', '2024-01-01'])
  })

  it('should sort by oldest date first', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', {
          transactions: [
            makeTx({ date: '2024-03-15' }),
            makeTx({ date: '2024-01-01' }),
            makeTx({ date: '2024-02-10' }),
          ],
        }),
      ],
    })

    const { result } = renderHook(() => useTransactions())

    act(() => result.current.setSortOrder('oldest'))

    const dates = result.current.filteredTx.map((t) => t.date)
    expect(dates).toEqual(['2024-01-01', '2024-02-10', '2024-03-15'])
  })

  it('should sort by highest absolute amount first (debits rank above small credits)', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', {
          transactions: [
            makeTx({ amount: -500 }),
            makeTx({ amount: 10 }),
            makeTx({ amount: -250 }),
          ],
        }),
      ],
    })

    const { result } = renderHook(() => useTransactions())

    act(() => result.current.setSortOrder('highest'))

    const amounts = result.current.filteredTx.map((t) => t.amount)
    expect(amounts).toEqual([-500, -250, 10])
  })

  it('should sort by lowest absolute amount first', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', {
          transactions: [
            makeTx({ amount: -500 }),
            makeTx({ amount: 10 }),
            makeTx({ amount: -250 }),
          ],
        }),
      ],
    })

    const { result } = renderHook(() => useTransactions())

    act(() => result.current.setSortOrder('lowest'))

    const amounts = result.current.filteredTx.map((t) => t.amount)
    expect(amounts).toEqual([10, -250, -500])
  })

  // ---- Combination: filter + search ----------------------------------------

  it('should apply institution filter and search term together', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', {
          transactions: [
            makeTx({ institution: 'bank-a', description: 'REWE Berlin' }),
            makeTx({ institution: 'bank-a', description: 'Netflix' }),
          ],
        }),
        makeAccount('bank-b', {
          transactions: [makeTx({ institution: 'bank-b', description: 'REWE Hamburg' })],
        }),
      ],
    })

    const { result } = renderHook(() => useTransactions())

    act(() => {
      result.current.setSelectedInstitution('bank-a')
      result.current.setSearchTerm('rewe')
    })

    expect(result.current.filteredTx).toHaveLength(1)
    expect(result.current.filteredTx[0].institution).toBe('bank-a')
    expect(result.current.filteredTx[0].description).toBe('REWE Berlin')
  })

  it('should filter transactions by period when provided', () => {
    useAppStore.setState({
      importedAccounts: [
        makeAccount('bank-a', {
          transactions: [
            makeTx({ date: '2024-01-10', description: 'January Tx' }),
            makeTx({ date: '2024-02-15', description: 'February Tx' }),
            makeTx({ date: '2025-01-10', description: 'Next Year Tx' }),
          ],
        }),
      ],
    })

    const { result, rerender } = renderHook(
      ({ period }: { period: PeriodFilter }) => useTransactions(period),
      { initialProps: { period: { mode: 'month', value: '2024-01' } } },
    )

    expect(result.current.filteredTx).toHaveLength(1)
    expect(result.current.filteredTx[0].description).toBe('January Tx')

    // Rerender with year filter
    rerender({ period: { mode: 'year', value: '2024' } })
    expect(result.current.filteredTx).toHaveLength(2)

    // Rerender with 'all'
    rerender({ period: { mode: 'all', value: '' } })
    expect(result.current.filteredTx).toHaveLength(3)
  })
})
