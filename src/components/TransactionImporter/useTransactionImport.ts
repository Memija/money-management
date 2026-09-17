import { useCallback, useMemo, useState } from 'react'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'
import * as XLSX from 'xlsx'

import type { TranslationStrings } from '../../i18n/types'
import type { ImportMethod, Transaction } from '../../types'
import { filterInternalSpaceTransfers } from '../../utils/account-transfers'
import { computeImportFingerprint } from '../../utils/import-fingerprint'
import { splitCsvLine } from '../../utils/parsers/helpers'
import {
  extractAccountIbansFromPaste,
  extractAccountIbansFromPdf,
  parseBankStatementPaste,
  parsePdfText,
  rowsToTransactionsWithMeta,
} from '../../utils/transaction-parsers'


export const useTransactionImport = (
  institutionName: string,
  method: ImportMethod | null,
  t?: TranslationStrings,
) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [discardedSpaceCount, setDiscardedSpaceCount] = useState(0)
  const [detectedAccountIbans, setDetectedAccountIbans] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [pasteText, setPasteText] = useState('')

  const handleFileChange = useCallback(
    async (file: File) => {
      setLoading(true)
      setError(null)
      setFileName(file.name)
      setDiscardedSpaceCount(0)
      setDetectedAccountIbans([])

      try {
        if (method === 'spreadsheet' || file.name.match(/\.(xlsx|xls|csv)$/i)) {
          if (file.name.match(/\.(xlsx|xls)$/i)) {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]
            const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })
            const { transactions: txs, discardedSpaceCount: spaceCount, detectedAccountIbans: ibans } =
              rowsToTransactionsWithMeta(rows, institutionName, t)
            if (txs.length === 0)
              throw new Error(t?.errorNoTransactionsInFile || 'No transactions found in the file.')
            setTransactions(txs)
            setDiscardedSpaceCount(spaceCount)
            setDetectedAccountIbans(ibans ?? [])
          } else {
            // Read as binary buffer so we can detect and handle encoding ourselves
            const buffer = await file.arrayBuffer()

            // Try UTF-8 first; fall back to ISO-8859-1 (Latin-1) if replacement chars appear.
            // ING, Sparkasse, comdirect, Deutsche Bank, and older DKB exports use ISO-8859-1.
            let text = new TextDecoder('utf-8').decode(buffer)
            if (text.includes('\uFFFD')) {
              text = new TextDecoder('iso-8859-1').decode(buffer)
            }

            // Strip UTF-8 BOM (\uFEFF) — present in some ING and bank exports
            text = text.replace(/^\uFEFF/, '')

            // Detect separator using the first non-empty line
            const firstMeaningfulLine = text.split('\n').find((l) => l.trim()) ?? ''
            const cleanFirst = firstMeaningfulLine.replace(/\r$/, '')
            const sep = cleanFirst.includes(';') ? ';' : cleanFirst.includes('\t') ? '\t' : ','
            const rows = text
              .trim()
              .split('\n')
              // Strip trailing \r (CRLF) and split into cells using quote-aware parser
              .map((line) => splitCsvLine(line.replace(/\r$/, ''), sep))
            const { transactions: txs, discardedSpaceCount: spaceCount, detectedAccountIbans: ibans } =
              rowsToTransactionsWithMeta(rows, institutionName, t)
            if (txs.length === 0)
              throw new Error(t?.errorNoTransactionsInCSV || 'No transactions found in the CSV.')
            setTransactions(txs)
            setDiscardedSpaceCount(spaceCount)
            setDetectedAccountIbans(ibans ?? [])
          }
        } else if (method === 'pdf' || file.name.match(/\.pdf$/i)) {
          // Dynamically import pdfjs
          const pdfjsLib = await import('pdfjs-dist')
          pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
          const data = await file.arrayBuffer()
          const pdf = await pdfjsLib.getDocument({ data }).promise
          let fullText = ''
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items
              .map((item) => (item as { str?: string }).str || '')
              .join(' ')
            fullText += pageText + '\n'
          }

          const txLines = parsePdfText(fullText, institutionName)
          if (txLines.length === 0) {
            throw new Error(
              t?.errorParsePdf ||
                'Could not auto-detect transactions in this PDF. Try exporting as CSV or Excel from your bank portal instead.',
            )
          }
          const { transactions: filteredTxs, discardedSpaceCount: spaceCount } =
            filterInternalSpaceTransfers(txLines)
          setTransactions(filteredTxs)
          setDiscardedSpaceCount(spaceCount)
          const detectedIbans = extractAccountIbansFromPdf(fullText, file.name)
          setDetectedAccountIbans(detectedIbans)
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : t?.errorProcessFile || 'Failed to process file.',
        )
        setTransactions([])
        setDiscardedSpaceCount(0)
      } finally {
        setLoading(false)
      }
    },
    [method, institutionName, t],
  )

  const handlePaste = useCallback(() => {
    setLoading(true)
    setError(null)
    setDiscardedSpaceCount(0)
    try {
      // Strategy 1: German bank portal format (multi-line structured copy-paste)
      const bankTxs = parseBankStatementPaste(pasteText, institutionName)
      if (bankTxs.length > 0) {
        const { transactions: filteredTxs, discardedSpaceCount: spaceCount } =
          filterInternalSpaceTransfers(bankTxs)
        setTransactions(filteredTxs)
        setDiscardedSpaceCount(spaceCount)
        const detectedIbans = extractAccountIbansFromPaste(pasteText)
        setDetectedAccountIbans(detectedIbans)
        return
      }

      // Strategy 2: Structured CSV/TSV fallback (tab, semicolon, or comma separated)
      const lines = pasteText.trim().split('\n')
      if (lines.length < 2) {
        throw new Error(
          t?.errorParsePasteOneRow ||
            'Only 1 row detected. Please make sure to include a header row (e.g. "Date, Description, Amount") and at least one transaction row with a valid date format like DD.MM.YYYY.',
        )
      }
      const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ','
      const rows = lines.map((l) => splitCsvLine(l.replace(/\r$/, ''), sep))
      const { transactions: csvTxs, discardedSpaceCount: spaceCount, detectedAccountIbans: ibans } =
        rowsToTransactionsWithMeta(rows, institutionName, t)
      if (csvTxs.length === 0) {
        throw new Error(
          t?.errorParsePaste ||
            "No transactions could be parsed. Please try pasting directly from your bank's transaction list, or use a CSV/Excel export instead.",
        )
      }
      setTransactions(csvTxs)
      setDiscardedSpaceCount(spaceCount)
      setDetectedAccountIbans(ibans ?? [])
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : t?.errorParsePastedData || 'Failed to parse pasted data.',
      )
      setDiscardedSpaceCount(0)
      setDetectedAccountIbans([])
    } finally {
      setLoading(false)
    }
  }, [pasteText, institutionName, t])

  const handleRemoveTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
  }, [])

  const handleUpdateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx)))
  }, [])

  const handleClearAll = useCallback(() => {
    setTransactions([])
    setDiscardedSpaceCount(0)
    setDetectedAccountIbans([])
    setFileName(null)
    setPasteText('')
  }, [])

  const importFingerprint = useMemo(
    () => computeImportFingerprint(transactions),
    [transactions],
  )

  return {
    transactions,
    discardedSpaceCount,
    detectedAccountIbans,
    loading,
    error,
    fileName,
    pasteText,
    importFingerprint,
    setPasteText,
    setError,
    setFileName,
    handleFileChange,
    handlePaste,
    handleRemoveTransaction,
    handleUpdateTransaction,
    handleClearAll,
  }
}
