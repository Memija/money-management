import fs from 'node:fs'
import path from 'node:path'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTransactionImport } from '../../../components/TransactionImporter/useTransactionImport'
import { rowsToTransactionsWithMeta } from '../csv-parser'
import { splitCsvLine } from '../helpers'

interface CsvSetupMeta {
  id: string
  title: string
  expectedMinTxs: number
  expectedCurrency: 'EUR' | 'MULTI'
  expectedIban: string | null
}

const CSV_FORMAT_SETUPS: CsvSetupMeta[] = [
  {
    id: 'csv-01-semicolon-eu-standard',
    title: 'Semicolon Delimiter + European Decimal (DD.MM.YYYY)',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE89370400440532013000',
  },
  {
    id: 'csv-02-comma-iso-us-decimal',
    title: 'Comma Delimiter + ISO Date (YYYY-MM-DD) + Dot Decimal',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE44500105175407324931',
  },
  {
    id: 'csv-03-tab-separated-tsv',
    title: 'Tab-Separated Values (TSV) Export',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE89370400440532013000',
  },
  {
    id: 'csv-04-metadata-preamble-long',
    title: 'Multi-Row Account Metadata Preamble Before Header',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE68210501700012345678',
  },
  {
    id: 'csv-05-split-soll-haben-columns',
    title: 'Split Soll (Debit) and Haben (Credit) Columns',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE19500700100987654321',
  },
  {
    id: 'csv-06-split-debit-credit-english',
    title: 'English Split Debit and Credit Columns with Running Balance',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE75512108001245126199',
  },
  {
    id: 'csv-07-soll-haben-indicator-column',
    title: 'Unsigned Amount + Dedicated S/H (Soll/Haben) Indicator Column',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE31200400600555666777',
  },
  {
    id: 'csv-08-trailing-minus-sh-parentheses',
    title: 'Trailing Minus (12,34-), Trailing S/H, and Accounting Parentheses (12,34)',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE52370501980001122334',
  },
  {
    id: 'csv-09-gendered-payer-payee-columns',
    title: 'Separate Gender-Star Payer (Zahlungspflichtige*r) and Payee (Zahlungsempfänger*in)',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE08120300001020304050',
  },
  {
    id: 'csv-10-generic-booking-type-with-partner',
    title: 'Generic Booking Type in Buchungstext + Merchant in Partner Column',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE91100500000123456789',
  },
  {
    id: 'csv-11-utf8-bom-crlf-quoted-delimiters',
    title: 'UTF-8 BOM + CRLF Line Endings + Quoted Embedded Semicolons/Commas',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE12500105170648489890',
  },
  {
    id: 'csv-12-slash-dates-ddmmyyyy-and-mmddyyyy',
    title: 'Slash-Separated Dates (DD/MM/YYYY and MM/DD/YYYY)',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE89370400440532013000',
  },
  {
    id: 'csv-13-two-digit-years',
    title: 'Short Two-Digit Year Dates (DD.MM.YY)',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE89370400440532013000',
  },
  {
    id: 'csv-14-subaccounts-spaces-pockets',
    title: 'Sub-Account / Space / Pocket Internal Transfers + External Transactions',
    expectedMinTxs: 3,
    expectedCurrency: 'EUR',
    expectedIban: 'DE27100777770209299700',
  },
  {
    id: 'csv-15-multi-currency-column',
    title: 'Multi-Currency Rows with Dedicated Währung / Currency Column',
    expectedMinTxs: 4,
    expectedCurrency: 'MULTI',
    expectedIban: 'DE89370400440532013000',
  },
  {
    id: 'csv-16-minimal-3-column',
    title: 'Minimal 3-Column CSV (Datum, Beschreibung, Betrag)',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: null,
  },
  {
    id: 'csv-17-brokerage-isin-dividend-sparplan',
    title: 'Securities & Brokerage Export (ISIN, ETF Sparplan, Dividend)',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE40100101234567890123',
  },
  {
    id: 'csv-18-wallet-brutto-fee-netto-balance',
    title: 'Digital Wallet Export with Brutto, Fee, Netto, and Running Balance',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE88500105171122334455',
  },
  {
    id: 'csv-19-multilingual-headers-pl-bs-id',
    title: 'Multilingual Column Headers (Polish: Data transakcji, Kontrahent, Tytuł, Kwota)',
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE89370400440532013000',
  },
  {
    id: 'csv-20-swiss-apostrophe-unicode-minus',
    title: "Swiss Apostrophe Thousands (1'250.00), Unicode Minus (−), and Reimbursements",
    expectedMinTxs: 4,
    expectedCurrency: 'EUR',
    expectedIban: 'DE89370400440532013000',
  },
]

const csvDir = path.resolve(__dirname, '../../../../test-data/csv')

describe('CSV Format Setups Test Suite (Bank-Agnostic)', () => {
  it('has all 20 structural CSV format test files on disk', () => {
    expect(CSV_FORMAT_SETUPS.length).toBe(20)
    for (const setup of CSV_FORMAT_SETUPS) {
      const filePath = path.join(csvDir, `${setup.id}.csv`)
      expect(fs.existsSync(filePath), `Missing CSV format fixture: ${setup.id}.csv`).toBe(true)
    }
  })

  describe.each(CSV_FORMAT_SETUPS)('$id – $title', (setup) => {
    it(`parses transactions, amounts, dates, and metadata from ${setup.id}.csv`, async () => {
      const filePath = path.join(csvDir, `${setup.id}.csv`)
      const rawContent = fs.readFileSync(filePath, 'utf-8')
      const cleanContent = rawContent.replace(/^\uFEFF/, '')

      const firstMeaningfulLine = cleanContent.split(/\r?\n/).find((l) => l.trim()) ?? ''
      const sep = firstMeaningfulLine.includes(';')
        ? ';'
        : firstMeaningfulLine.includes('\t')
          ? '\t'
          : ','

      const rows = cleanContent
        .trim()
        .split(/\r?\n/)
        .map((line) => splitCsvLine(line, sep))

      const institutionLabel = 'Format Test Institution'
      const { transactions, detectedAccountIbans } = rowsToTransactionsWithMeta(
        rows,
        institutionLabel,
      )

      expect(transactions.length).toBeGreaterThanOrEqual(setup.expectedMinTxs)

      if (setup.expectedIban) {
        expect(detectedAccountIbans).toContain(setup.expectedIban)
      }

      for (const tx of transactions) {
        expect(tx.id.length).toBeGreaterThan(0)
        expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(tx.description.trim().length).toBeGreaterThan(1)
        expect(tx.description.toLowerCase()).not.toBe('unknown')
        expect(typeof tx.amount).toBe('number')
        expect(Number.isNaN(tx.amount)).toBe(false)
        expect(tx.amount).not.toBe(0)
        expect(['income', 'expense']).toContain(tx.type)

        if (setup.expectedCurrency === 'MULTI') {
          expect(['EUR', 'USD', 'CHF', 'PLN', 'GBP']).toContain(tx.currency)
        } else {
          expect(tx.currency).toBe(setup.expectedCurrency)
        }
      }

      const hasExpense = transactions.some((t) => t.type === 'expense' && t.amount < 0)
      const hasIncome = transactions.some((t) => t.type === 'income' && t.amount > 0)
      expect(hasExpense).toBe(true)
      expect(hasIncome).toBe(true)

      // End-to-end validation through useTransactionImport hook
      const { result } = renderHook(() => useTransactionImport(institutionLabel, 'spreadsheet'))
      const file = new File([rawContent], `${setup.id}.csv`, { type: 'text/csv' })

      await act(async () => {
        await result.current.handleFileChange(file)
      })

      expect(result.current.error).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.fileName).toBe(`${setup.id}.csv`)
      expect(result.current.transactions.length).toBe(transactions.length)
    })
  })
})
