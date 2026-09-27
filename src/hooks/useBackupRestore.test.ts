import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppStore } from '../store/useAppStore'
import type { ImportedAccount } from '../types'
import { useBackupRestore } from './useBackupRestore'

describe('useBackupRestore hook', () => {
  const mockAccount: ImportedAccount = {
    institutionId: 'de_n26',
    institutionName: 'N26',
    transactions: [
      {
        id: 'tx-1',
        amount: -15,
        date: '2026-03-01',
        description: 'Coffee',
        currency: 'EUR',
        type: 'expense',
        institution: 'N26',
      },
    ],
    importedAt: '2026-03-01T00:00:00Z',
    importedFingerprints: ['fp-1'],
  }

  beforeEach(() => {
    useAppStore.setState({
      importedAccounts: [],
      customKeywords: {},
      customCategories: [],
      currentStep: 'country',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useBackupRestore())

    expect(result.current.pendingRestore).toBeNull()
    expect(result.current.isRestoring).toBe(false)
    expect(result.current.feedback).toBeNull()
    expect(typeof result.current.triggerFilePicker).toBe('function')
  })

  it('parses valid backup file and sets pendingRestore', async () => {
    const { result } = renderHook(() => useBackupRestore())

    const backupData = {
      version: 1,
      app: 'saldio',
      exportedAt: '2026-03-01T12:00:00Z',
      data: {
        importedAccounts: [mockAccount],
      },
    }

    const file = new File([JSON.stringify(backupData)], 'backup.json', {
      type: 'application/json',
    })

    const changeEvent = {
      target: { files: [file], value: 'fake' },
    } as unknown as React.ChangeEvent<HTMLInputElement>

    await act(async () => {
      await result.current.handleFileChange(changeEvent)
    })

    expect(result.current.pendingRestore).not.toBeNull()
    expect(result.current.pendingRestore?.valid).toBe(true)
    expect(result.current.pendingRestore?.summary.accountsCount).toBe(1)
    expect(result.current.pendingRestore?.summary.transactionsCount).toBe(1)
  })

  it('sets error feedback on invalid backup file', async () => {
    const { result } = renderHook(() => useBackupRestore())

    const file = new File(['invalid json{'], 'broken.json', {
      type: 'application/json',
    })

    const changeEvent = {
      target: { files: [file], value: 'fake' },
    } as unknown as React.ChangeEvent<HTMLInputElement>

    await act(async () => {
      await result.current.handleFileChange(changeEvent)
    })

    expect(result.current.pendingRestore).toBeNull()
    expect(result.current.feedback?.type).toBe('error')
  })

  it('restores data into useAppStore and invokes onRestoreSuccess on confirmRestore', async () => {
    const onRestoreSuccess = vi.fn()
    const { result } = renderHook(() => useBackupRestore({ onRestoreSuccess }))

    const backupData = {
      version: 1,
      app: 'saldio',
      exportedAt: '2026-03-01T12:00:00Z',
      data: {
        importedAccounts: [mockAccount],
        customKeywords: { Groceries: ['edeka'] },
      },
    }

    const file = new File([JSON.stringify(backupData)], 'backup.json', {
      type: 'application/json',
    })

    await act(async () => {
      await result.current.handleFileChange({
        target: { files: [file], value: '' },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    })

    expect(result.current.pendingRestore).not.toBeNull()

    await act(async () => {
      await result.current.confirmRestore()
    })

    expect(result.current.pendingRestore).toBeNull()
    expect(useAppStore.getState().importedAccounts).toHaveLength(1)
    expect(useAppStore.getState().customKeywords).toEqual({ Groceries: ['edeka'] })
    expect(useAppStore.getState().currentStep).toBe('dashboard')
    expect(onRestoreSuccess).toHaveBeenCalledTimes(1)
    expect(result.current.feedback?.type).toBe('success')
  })

  it('cancels restore when cancelRestore is called', async () => {
    const { result } = renderHook(() => useBackupRestore())

    const backupData = {
      version: 1,
      app: 'saldio',
      data: { importedAccounts: [mockAccount] },
    }
    const file = new File([JSON.stringify(backupData)], 'backup.json', { type: 'application/json' })

    await act(async () => {
      await result.current.handleFileChange({
        target: { files: [file], value: '' },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    })

    expect(result.current.pendingRestore).not.toBeNull()

    act(() => {
      result.current.cancelRestore()
    })

    expect(result.current.pendingRestore).toBeNull()
    expect(useAppStore.getState().importedAccounts).toHaveLength(0)
  })

  it('exports backup file and triggers download', () => {
    const { result } = renderHook(() => useBackupRestore())

    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    act(() => {
      result.current.exportBackup()
    })

    expect(createObjectURLSpy).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test')
    expect(result.current.feedback?.type).toBe('success')
  })
})
