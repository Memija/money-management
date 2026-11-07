import fs from 'node:fs'
import path from 'node:path'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTransactionImport } from '../../../components/TransactionImporter/useTransactionImport'
import {
  extractAccountIbansFromPaste,
  htmlToClipboardText,
  parseBankStatementPaste,
} from '../paste-parser'

interface HtmlSetupMeta {
  id: string
  title: string
  iban: string
  expectedMinTxs: number
}

const HTML_FORMAT_SETUPS: HtmlSetupMeta[] = [
  {
    id: 'html-01-standard-table-5col',
    title: 'Standard 5-Column Semantic HTML Table',
    iban: 'DE89370400440532013000',
    expectedMinTxs: 4,
  },
  {
    id: 'html-02-split-soll-haben-balance-table',
    title: 'Split Soll/Haben Columns with Running Saldo Column',
    iban: 'DE19500700100987654321',
    expectedMinTxs: 4,
  },
  {
    id: 'html-03-stacked-date-and-category-table',
    title: '4-Column Stacked Date + Category Badge Table (Umsatzuebersicht)',
    iban: 'DE12500105170648489890',
    expectedMinTxs: 4,
  },
  {
    id: 'html-04-soll-haben-indicator-column-table',
    title: 'Unsigned Amount Column + Dedicated S/H Indicator Column',
    iban: 'DE31200400600555666777',
    expectedMinTxs: 4,
  },
  {
    id: 'html-05-day-grouped-card-list',
    title: 'Day-Grouped Card List (.mkp-card-list)',
    iban: 'DE52370501980001122334',
    expectedMinTxs: 4,
  },
  {
    id: 'html-06-custom-web-components',
    title: 'Custom Web Components (<db-list-row> / <tx-list-row>)',
    iban: 'DE68210501700012345678',
    expectedMinTxs: 4,
  },
  {
    id: 'html-07-timeline-feed-prefix-currency',
    title: 'Neobank Timeline Feed with ISO Dates and Prefix Currency (- € 36.80)',
    iban: 'DE27100777770209299700',
    expectedMinTxs: 4,
  },
  {
    id: 'html-08-pending-and-booked-sections',
    title: 'Pending (Vorgemerkte Umsaetze) + Booked Sections',
    iban: 'DE08120300001020304050',
    expectedMinTxs: 4,
  },
  {
    id: 'html-09-multicurrency-activity-stream',
    title: 'Multi-Currency International Feed (EUR, USD, GBP, PLN)',
    iban: 'DE44500105175407324931',
    expectedMinTxs: 4,
  },
  {
    id: 'html-10-accordion-details-rows',
    title: 'Expandable <details> / <summary> SEPA Rows with Counterparty IBAN',
    iban: 'DE91100500000123456789',
    expectedMinTxs: 4,
  },
  {
    id: 'html-11-aria-role-grid',
    title: 'ARIA Headless UI Data Grid (role="table" / role="row" / role="cell")',
    iban: 'DE75512108001245126199',
    expectedMinTxs: 4,
  },
  {
    id: 'html-12-semantic-ul-li-multilingual',
    title: 'Semantic <ul> / <li> List with Multilingual Transaction Labels',
    iban: 'DE40100101234567890123',
    expectedMinTxs: 4,
  },
]

const htmlDir = path.resolve(__dirname, '../../../../test-data/html')

describe('HTML / Web Portal Format Setups Test Suite (Bank-Agnostic)', () => {
  it('has all 12 structural HTML format test files and index.html hub on disk', () => {
    expect(HTML_FORMAT_SETUPS.length).toBe(12)
    expect(fs.existsSync(path.join(htmlDir, 'index.html'))).toBe(true)
    for (const setup of HTML_FORMAT_SETUPS) {
      const filePath = path.join(htmlDir, `${setup.id}.html`)
      expect(fs.existsSync(filePath), `Missing HTML format fixture: ${setup.id}.html`).toBe(true)
    }
  })

  describe.each(HTML_FORMAT_SETUPS)('$id – $title', (setup) => {
    it(`extracts transactions and IBAN from ${setup.id}.html via direct HTML and clipboard paste`, () => {
      const filePath = path.join(htmlDir, `${setup.id}.html`)
      const htmlContent = fs.readFileSync(filePath, 'utf-8')
      const institutionLabel = 'Format Test Institution'

      const detectedIbans = extractAccountIbansFromPaste(htmlContent)
      expect(detectedIbans).toContain(setup.iban)

      const directTxs = parseBankStatementPaste(htmlContent, institutionLabel)
      expect(directTxs.length).toBeGreaterThanOrEqual(setup.expectedMinTxs)

      const clipboardText = htmlToClipboardText(htmlContent)
      expect(clipboardText.length).toBeGreaterThan(0)
      const clipboardTxs = parseBankStatementPaste(clipboardText, institutionLabel)
      expect(clipboardTxs.length).toBe(directTxs.length)

      for (const tx of directTxs) {
        expect(tx.id.length).toBeGreaterThan(0)
        expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(tx.description.trim().length).toBeGreaterThan(1)
        expect(typeof tx.amount).toBe('number')
        expect(Number.isNaN(tx.amount)).toBe(false)
        expect(tx.amount).not.toBe(0)
        expect(['income', 'expense']).toContain(tx.type)
        expect(tx.institution).toBe(institutionLabel)
      }

      const hasExpense = directTxs.some((t) => t.type === 'expense' && t.amount < 0)
      const hasIncome = directTxs.some((t) => t.type === 'income' && t.amount > 0)
      expect(hasExpense).toBe(true)
      expect(hasIncome).toBe(true)

      const { result } = renderHook(() => useTransactionImport(institutionLabel, 'paste'))
      act(() => {
        result.current.setPasteText(clipboardText)
      })
      act(() => {
        result.current.handlePaste()
      })

      expect(result.current.error).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.transactions.length).toBe(directTxs.length)
      expect(result.current.detectedAccountIbans).toEqual(detectedIbans)
    })
  })
})
