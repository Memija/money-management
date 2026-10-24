import { act, renderHook } from '@testing-library/react'
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { useTransactionImport } from '../../../components/TransactionImporter/useTransactionImport'
import {
  extractAccountIbansFromPaste,
  htmlToClipboardText,
  parseBankStatementPaste,
} from '../paste-parser'

const testDataDir = path.resolve(__dirname, '../../../../test-data/german-banks')
const htmlDir = path.join(testDataDir, 'html')

describe('Web Banking Portals & Presentation Archetypes Suite', () => {
  describe('Authentic Core Online-Banking Portals', () => {
    const authenticPortals = [
      {
        id: 'berliner-sparkasse',
        name: 'Berliner Sparkasse',
        file: 'berliner-sparkasse.html',
        coreSystem: 'Finanz Informatik IF6 (Sparkassen Group)',
      },
      {
        id: 'deutsche-bank',
        name: 'Deutsche Bank',
        file: 'deutsche-bank.html',
        coreSystem: 'Cirrus Angular SPA (Deutsche Bank)',
      },
      {
        id: 'norisbank',
        name: 'norisbank',
        file: 'norisbank.html',
        coreSystem: 'Cirrus Dark Theme (norisbank)',
      },
    ]

    it('has all authentic core banking portals and index hub', () => {
      expect(fs.existsSync(htmlDir)).toBe(true)
      expect(fs.existsSync(path.join(htmlDir, 'index.html'))).toBe(true)

      for (const portal of authenticPortals) {
        const filePath = path.join(htmlDir, portal.file)
        expect(fs.existsSync(filePath), `Missing authentic portal: ${portal.file}`).toBe(true)

        const content = fs.readFileSync(filePath, 'utf-8')
        expect(content).toContain('<!DOCTYPE html>')
        expect(content).toMatch(/<cirrus-|<div class="mkp-card/i)
      }
    })

    describe.each(authenticPortals)('Extraction for $name ($coreSystem)', ({ name, file }) => {
      it(`successfully extracts transactions and IBAN from authentic ${file}`, () => {
        const htmlPath = path.join(htmlDir, file)
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8')

        // Verify account IBAN extraction directly from authentic HTML content
        const detectedIbans = extractAccountIbansFromPaste(htmlContent)
        expect(detectedIbans.length).toBeGreaterThanOrEqual(1)
        expect(detectedIbans[0]).toMatch(/^DE\d{20}$/)

        // 1. Direct parsing from raw HTML
        const directHtmlTxs = parseBankStatementPaste(htmlContent, name)
        expect(directHtmlTxs.length).toBeGreaterThanOrEqual(3)

        // 2. Clipboard conversion matching browser drag/selection
        const clipboardText = htmlToClipboardText(htmlContent)
        expect(clipboardText.length).toBeGreaterThan(0)
        const clipboardTxs = parseBankStatementPaste(clipboardText, name)
        expect(clipboardTxs.length).toBe(directHtmlTxs.length)

        // Verify transaction fields
        for (const tx of directHtmlTxs) {
          expect(tx.id.length).toBeGreaterThan(0)
          expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
          expect(tx.description.trim().length).toBeGreaterThan(1)
          expect(typeof tx.amount).toBe('number')
          expect(tx.amount).not.toBe(0)
          expect(tx.currency).toBe('EUR')
          expect(tx.institution).toBe(name)
        }

        const hasExpense = directHtmlTxs.some((t) => t.type === 'expense' || t.amount < 0)
        const hasIncome = directHtmlTxs.some((t) => t.type === 'income' || t.amount > 0)
        expect(hasExpense).toBe(true)
        expect(hasIncome).toBe(true)

        // End-to-end import via useTransactionImport hook
        const { result } = renderHook(() => useTransactionImport(name, 'paste'))
        act(() => {
          result.current.setPasteText(clipboardText)
        })
        act(() => {
          result.current.handlePaste()
        })

        expect(result.current.error).toBeNull()
        expect(result.current.loading).toBe(false)
        expect(result.current.transactions.length).toBe(directHtmlTxs.length)
        expect(result.current.detectedAccountIbans).toEqual(detectedIbans)
      })
    })
  })

  describe('Web Presentation Archetypes (Mish/Mash Layout Variations)', () => {
    const archetypes = [
      {
        file: 'presentation-standard-table.html',
        name: 'Standard 5-Column Table',
        description: 'Classic table layout with separate booking and valuta dates',
      },
      {
        file: 'presentation-split-columns.html',
        name: 'Split Debit/Credit Columns',
        description: 'Separate Soll (debit) and Haben (credit) columns with running balance',
      },
      {
        file: 'presentation-multiline-cells.html',
        name: 'Multiline Rich Cells',
        description: 'Table cells with nested line breaks, mandate references, and counterparty',
      },
      {
        file: 'presentation-cards-feed.html',
        name: 'Modern Cards Feed',
        description: 'Flex/grid card list with badges, metadata, and amount containers',
      },
      {
        file: 'presentation-timeline-feed.html',
        name: 'Neobank Activity Timeline',
        description: 'Dark-mode activity stream with currency prefixes (- € 13.99)',
      },
      {
        file: 'presentation-multicurrency.html',
        name: 'Multi-Currency International',
        description: 'International statements with USD, GBP, PLN, and EUR',
      },
    ]

    describe.each(archetypes)('Presentation: $name ($file)', ({ file, name }) => {
      it(`successfully extracts transactions and IBAN from ${file}`, () => {
        const filePath = path.join(htmlDir, file)
        expect(fs.existsSync(filePath)).toBe(true)

        const htmlContent = fs.readFileSync(filePath, 'utf-8')

        // 1. Account IBAN detection
        const detectedIbans = extractAccountIbansFromPaste(htmlContent)
        expect(detectedIbans.length).toBeGreaterThanOrEqual(1)
        expect(detectedIbans[0]).toMatch(/^DE\d{20}$/)

        // 2. Direct parsing from raw HTML
        const directTxs = parseBankStatementPaste(htmlContent, name)
        expect(directTxs.length).toBeGreaterThanOrEqual(3)

        // 3. Clipboard conversion
        const clipboardText = htmlToClipboardText(htmlContent)
        expect(clipboardText.length).toBeGreaterThan(0)
        const clipboardTxs = parseBankStatementPaste(clipboardText, name)
        expect(clipboardTxs.length).toBe(directTxs.length)

        // Verify transaction fields
        for (const tx of directTxs) {
          expect(tx.id.length).toBeGreaterThan(0)
          expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
          expect(tx.description.trim().length).toBeGreaterThan(1)
          expect(typeof tx.amount).toBe('number')
          expect(tx.amount).not.toBe(0)
        }

        const hasExpense = directTxs.some((t) => t.type === 'expense' || t.amount < 0)
        const hasIncome = directTxs.some((t) => t.type === 'income' || t.amount > 0)
        expect(hasExpense).toBe(true)
        expect(hasIncome).toBe(true)

        // End-to-end import via useTransactionImport hook
        const { result } = renderHook(() => useTransactionImport(name, 'paste'))
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
})
