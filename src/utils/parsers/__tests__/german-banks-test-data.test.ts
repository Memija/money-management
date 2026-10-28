import fs from 'node:fs'
import path from 'node:path'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTransactionImport } from '../../../components/TransactionImporter/useTransactionImport'
import { germanInstitutions } from '../../../data/institutions'
import { rowsToTransactionsWithMeta } from '../csv-parser'
import { splitCsvLine } from '../helpers'
import { parseBankStatementPaste } from '../paste-parser'

const testDataDir = path.resolve(__dirname, '../../../../test-data/german-banks')
const htmlDir = path.join(testDataDir, 'html')

describe('German Banks Test Data Suite', () => {
  it('has a test CSV file for every supported German bank in germanInstitutions', () => {
    expect(germanInstitutions.length).toBe(54)

    for (const inst of germanInstitutions) {
      const filePath = path.join(testDataDir, `${inst.id}.csv`)
      expect(
        fs.existsSync(filePath),
        `Missing test CSV file for bank: ${inst.id} (${inst.name})`,
      ).toBe(true)
    }
  })

  describe.each(germanInstitutions)('Import validation for $name ($id)', (inst) => {
    it(`successfully parses transactions from ${inst.id}.csv`, async () => {
      const filePath = path.join(testDataDir, `${inst.id}.csv`)
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Detect separator using the first non-empty line (matching useTransactionImport logic)
      const firstMeaningfulLine = fileContent.split('\n').find((l) => l.trim()) ?? ''
      const cleanFirst = firstMeaningfulLine.replace(/\r$/, '')
      const sep = cleanFirst.includes(';') ? ';' : cleanFirst.includes('\t') ? '\t' : ','

      const rows = fileContent
        .trim()
        .split('\n')
        .map((line) => splitCsvLine(line.replace(/\r$/, ''), sep))

      const { transactions } = rowsToTransactionsWithMeta(rows, inst.name)

      // Must parse at least 3 transactions
      expect(transactions.length).toBeGreaterThanOrEqual(3)

      // Verify each transaction's integrity
      for (const tx of transactions) {
        expect(tx.id).toBeDefined()
        expect(tx.id.length).toBeGreaterThan(0)

        // Valid ISO date YYYY-MM-DD
        expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)

        // Non-empty description
        expect(tx.description).toBeDefined()
        expect(tx.description.trim().length).toBeGreaterThan(1)

        // Numeric non-zero amount
        expect(typeof tx.amount).toBe('number')
        expect(isNaN(tx.amount)).toBe(false)
        expect(tx.amount).not.toBe(0)

        // Valid transaction type
        expect(['income', 'expense']).toContain(tx.type)
        expect(tx.currency).toBe('EUR')
      }

      // Check that at least one expense and one income transaction exist
      const hasExpense = transactions.some((t) => t.type === 'expense' || t.amount < 0)
      const hasIncome = transactions.some((t) => t.type === 'income' || t.amount > 0)
      expect(hasExpense, `${inst.name} test data should include at least one expense`).toBe(true)
      expect(
        hasIncome,
        `${inst.name} test data should include at least one income transaction`,
      ).toBe(true)

      // End-to-end import validation via the useTransactionImport hook with real File object
      const { result } = renderHook(() => useTransactionImport(inst.name, 'spreadsheet'))

      const file = new File([fileContent], `${inst.id}.csv`, { type: 'text/csv' })

      await act(async () => {
        await result.current.handleFileChange(file)
      })

      expect(result.current.error).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.fileName).toBe(`${inst.id}.csv`)
      expect(result.current.transactions.length).toBe(transactions.length)
    })
  })

  describe('HTML samples import validation', () => {
    const htmlSamples = [
      { file: 'berliner-sparkasse.html', institution: 'Berliner Sparkasse' },
      { file: 'deutsche-bank.html', institution: 'Deutsche Bank' },
      { file: 'norisbank.html', institution: 'norisbank' },
    ]

    it.each(htmlSamples)(
      'parses HTML web portal sample for $institution ($file)',
      ({ file, institution }) => {
        const filePath = path.join(htmlDir, file)
        expect(fs.existsSync(filePath)).toBe(true)

        const content = fs.readFileSync(filePath, 'utf-8')
        const transactions = parseBankStatementPaste(content, institution)

        expect(transactions.length).toBeGreaterThanOrEqual(2)
        for (const tx of transactions) {
          expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
          expect(tx.amount).not.toBe(0)
          expect(tx.description.trim().length).toBeGreaterThan(1)
          expect(tx.institution).toBe(institution)
        }
      },
    )
  })
})
