import { useCallback, useRef, useState } from 'react'

import { useAppStore } from '../store/useAppStore'
import { useLanguageStore } from '../store/useLanguageStore'
import {
  formatBackupError,
  parseAndValidateBackup,
  type SaldioBackupFile,
  type ValidatedBackupResult,
} from '../utils/backup/backup-utils'

export interface UseBackupRestoreOptions {
  onRestoreSuccess?: () => void
}

export interface UseBackupRestoreReturn {
  fileInputRef: React.RefObject<HTMLInputElement | null>
  feedback: { type: 'success' | 'error'; message: string } | null
  pendingRestore: ValidatedBackupResult | null
  isRestoring: boolean
  triggerFilePicker: () => void
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  confirmRestore: () => Promise<void>
  cancelRestore: () => void
  exportBackup: () => void
  showFeedback: (type: 'success' | 'error', message: string) => void
  clearFeedback: () => void
}

export const useBackupRestore = (options?: UseBackupRestoreOptions): UseBackupRestoreReturn => {
  const t = useLanguageStore((s) => s.t)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [pendingRestore, setPendingRestore] = useState<ValidatedBackupResult | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)

  const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    if (type === 'success') {
      setTimeout(() => {
        setFeedback((curr) => (curr?.message === message ? null : curr))
      }, 4000)
    }
  }, [])

  const clearFeedback = useCallback(() => {
    setFeedback(null)
  }, [])

  const triggerFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const result = parseAndValidateBackup(text)

        if (!result.valid) {
          const localizedError = formatBackupError(result, t)
          showFeedback('error', localizedError)
          return
        }

        setPendingRestore(result)
      } catch (err) {
        console.error('Failed to read backup file:', err)
        showFeedback(
          'error',
          t.restoreBackupInvalidFile || 'The selected file is not a valid Saldio backup.',
        )
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [showFeedback, t],
  )

  const confirmRestore = useCallback(async () => {
    if (!pendingRestore) return

    setIsRestoring(true)
    try {
      const { data } = pendingRestore

      useAppStore.setState({
        importedAccounts: data.importedAccounts ?? [],
        customKeywords: data.customKeywords ?? {},
        manualCategories: data.manualCategories ?? {},
        customCategories: data.customCategories ?? [],
        duplicateOverrideRules: data.duplicateOverrideRules ?? [],
        selectedCountry: data.selectedCountry ?? null,
        selectedInstitution: data.selectedInstitution ?? null,
        currentStep:
          data.currentStep ?? ((data.importedAccounts?.length ?? 0) > 0 ? 'dashboard' : 'country'),
      })

      showFeedback(
        'success',
        t.restoreBackupSuccess || 'Backup restored successfully.',
      )
      setPendingRestore(null)
      options?.onRestoreSuccess?.()
    } catch (err) {
      console.error('Restore failed:', err)
      showFeedback('error', 'Failed to restore backup data.')
    } finally {
      setIsRestoring(false)
    }
  }, [pendingRestore, showFeedback, t, options])

  const cancelRestore = useCallback(() => {
    setPendingRestore(null)
  }, [])

  const exportBackup = useCallback(() => {
    try {
      const state = useAppStore.getState()
      const now = new Date()
      const dateStr = now.toISOString().slice(0, 10)

      const backup: SaldioBackupFile = {
        version: 1,
        app: 'saldio',
        exportedAt: now.toISOString(),
        data: {
          importedAccounts: state.importedAccounts || [],
          customKeywords: state.customKeywords || {},
          manualCategories: state.manualCategories || {},
          customCategories: state.customCategories || [],
          duplicateOverrideRules: state.duplicateOverrideRules || [],
          selectedCountry: state.selectedCountry,
          selectedInstitution: state.selectedInstitution,
          currentStep: state.currentStep,
        },
      }

      const jsonString = JSON.stringify(backup, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `saldio-backup-${dateStr}.json`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)

      showFeedback('success', t.exportBackupSuccess || 'Backup downloaded successfully.')
    } catch (e) {
      console.error('Failed to export backup:', e)
      showFeedback('error', 'Failed to generate backup file.')
    }
  }, [showFeedback, t])

  return {
    fileInputRef,
    feedback,
    pendingRestore,
    isRestoring,
    triggerFilePicker,
    handleFileChange,
    confirmRestore,
    cancelRestore,
    exportBackup,
    showFeedback,
    clearFeedback,
  }
}
