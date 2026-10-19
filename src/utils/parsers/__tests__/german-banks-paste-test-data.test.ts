import fs from 'node:fs'
import path from 'node:path'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTransactionImport } from '../../../components/TransactionImporter/useTransactionImport'
import { germanInstitutions } from '../../../data/institutions'
import { extractAccountIbansFromPaste, parseBankStatementPaste } from '../paste-parser'

const testDataDir = path.resolve(__dirname, '../../../../test-data/german-banks')
const pasteDir = path.join(testDataDir, 'paste-samples')

describe('German Banks Copy-Paste Test Data Suite', () => {
  it('has a test copy-paste text file for every supported German bank in germanInstitutions', () => {
    expect(germanInstitutions.length).toBe(54)

    for (const inst of germanInstitutions) {
      const filePath = path.join(pasteDir, `${inst.id}.txt`)
      expect(
        fs.existsSync(filePath),
        `Missing test copy-paste file for bank: ${inst.id} (${inst.name})`,
      ).toBe(true)
    }
  })

  describe.each(germanInstitutions)('Paste validation for $name ($id)', (inst) => {
    it(`successfully parses transactions and extracts IBAN from ${inst.id}.txt`, async () => {
      const filePath = path.join(pasteDir, `${inst.id}.txt`)
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // Parse with parseBankStatementPaste
      const transactions = parseBankStatementPaste(fileContent, inst.name)

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
        expect(tx.institution).toBe(inst.name)
      }

      // Check that at least one expense and one income transaction exist
      const hasExpense = transactions.some((t) => t.type === 'expense' || t.amount < 0)
      const hasIncome = transactions.some((t) => t.type === 'income' || t.amount > 0)
      expect(hasExpense, `${inst.name} paste data should include at least one expense`).toBe(true)
      expect(
        hasIncome,
        `${inst.name} paste data should include at least one income transaction`,
      ).toBe(true)

      // Verify account IBAN extraction from paste header
      const detectedIbans = extractAccountIbansFromPaste(fileContent)
      expect(detectedIbans.length).toBeGreaterThanOrEqual(1)
      expect(detectedIbans[0]).toMatch(/^DE\d{20}$/)

      // End-to-end import validation via the useTransactionImport hook with paste method
      const { result } = renderHook(() => useTransactionImport(inst.name, 'paste'))

      act(() => {
        result.current.setPasteText(fileContent)
      })

      act(() => {
        result.current.handlePaste()
      })

      expect(result.current.error).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.transactions.length).toBe(transactions.length)
      expect(result.current.detectedAccountIbans).toEqual(detectedIbans)
    })
  })

  describe('Legacy alias paste samples validation', () => {
    const legacyAliases = [
      { file: 'ing-paste.txt', institution: 'ING Deutschland' },
      { file: 'sparkasse-paste.txt', institution: 'Berliner Sparkasse' },
      { file: 'dkb-paste.txt', institution: 'DKB (Deutsche Kreditbank)' },
      { file: 'commerzbank-paste.txt', institution: 'Commerzbank' },
    ]

    it.each(legacyAliases)(
      'parses legacy alias sample $file for $institution',
      ({ file, institution }) => {
        const filePath = path.join(pasteDir, file)
        expect(fs.existsSync(filePath)).toBe(true)

        const content = fs.readFileSync(filePath, 'utf-8')
        const transactions = parseBankStatementPaste(content, institution)

        expect(transactions.length).toBeGreaterThanOrEqual(3)
        for (const tx of transactions) {
          expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
          expect(tx.amount).not.toBe(0)
          expect(tx.description.trim().length).toBeGreaterThan(1)
          expect(tx.institution).toBe(institution)
        }

        const detectedIbans = extractAccountIbansFromPaste(content)
        expect(detectedIbans.length).toBeGreaterThanOrEqual(1)
        expect(detectedIbans[0]).toMatch(/^DE\d{20}$/)
      },
    )
  })

  describe('HTML Web Portal validation for German banks', () => {
    const htmlDir = path.join(testDataDir, 'html')

    it('has an authentic HTML online banking portal for every supported German bank', () => {
      expect(fs.existsSync(htmlDir)).toBe(true)
      expect(fs.existsSync(path.join(htmlDir, 'index.html'))).toBe(true)

      for (const inst of germanInstitutions) {
        const filePath = path.join(htmlDir, `${inst.id}.html`)
        expect(
          fs.existsSync(filePath),
          `Missing HTML portal file for bank: ${inst.id} (${inst.name})`,
        ).toBe(true)

        const content = fs.readFileSync(filePath, 'utf-8')
        expect(content).toContain('<!DOCTYPE html>')
        expect(content).toMatch(/<table|<cirrus-|<div class="mkp-card/i)
        expect(content).toMatch(/Buchungstag|Umsätze|Finanzübersicht|Datum/i)
        expect(content).toContain('DE') // Includes IBAN
      }
    })

    describe.each(germanInstitutions)('HTML table copy-paste for $name ($id)', (inst) => {
      it(`successfully parses transactions when copied from ${inst.id}.html`, async () => {
        const htmlPath = path.join(htmlDir, `${inst.id}.html`)
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8')

        // Verify there are no invented helper buttons, copy scripts, or instruction boxes
        expect(htmlContent).not.toContain('test-instruction-box')
        expect(htmlContent).not.toContain('copyTableOnly')
        expect(htmlContent).not.toContain('Tabelle kopieren')
        expect(htmlContent).not.toContain('In App öffnen')

        // Extract transactions as clipboard text just as a browser selection produces
        const ibanMatch =
          htmlContent.match(/IBAN:?\s*<strong[^>]*>([^<]+)<\/strong>/i) ||
          htmlContent.match(/(DE\d{2}\s*(?:\d{4}\s*){4}\d{2})/i)
        const ibanLine = ibanMatch ? `IBAN: ${ibanMatch[1].replace(/\s+/g, '')}` : ''

        const rows: string[] = []

        // 1. Deutsche Bank Cirrus Angular components
        if (htmlContent.includes('cirrus-')) {
          const dateGroups = htmlContent.matchAll(/<h3 class="db-heading-4">\s*(\d{2}\.\d{2}\.\d{4})\s*<\/h3>([\s\S]*?)(?=<h3 class="db-heading-4">|<\/cirrus-transactions-view>)/gi)
          for (const group of dateGroups) {
            const date = group[1]
            const groupContent = group[2]
            for (const row of groupContent.matchAll(/<db-list-row[^>]*>([\s\S]*?)<\/db-list-row>/gi)) {
              const nameMatch = row[1].match(/<div class="[^"]*db-text--highlight[^"]*"><span>\s*([^<]+?)\s*<\/span><\/div>/i)
              const descMatch = row[1].match(/<div class="[^"]*db-text--mute[^"]*">\s*([^<]+?)\s*<\/div>/i)
              const amountMatch = row[1].match(/<span>\s*([+-]?[\d.,]+\s*EUR)\s*<\/span>/i)
              if (nameMatch && amountMatch) {
                rows.push(date)
                rows.push(nameMatch[1].trim())
                if (descMatch) rows.push(descMatch[1].trim())
                rows.push(amountMatch[1].trim())
              }
            }
          }
        } else if (htmlContent.includes('mkp-card-list') || htmlContent.includes('if6')) {
          // 2. Finanz Informatik Internet-Filiale cards (Sparkassen)
          const groups = htmlContent.split(/<h3[^>]*groupdate[^>]*>/i)
          for (let i = 1; i < groups.length; i++) {
            const g = groups[i]
            const dateMatch = g.match(/^\s*(\d{2}\.\d{2}\.\d{4})/)
            const date = dateMatch ? dateMatch[1] : 'unknown'
            const cards = Array.from(g.matchAll(/<li>([\s\S]*?)<\/li>/gi))
            for (const card of cards) {
              const nameMatch = card[1].match(/<a[^>]*mkp-identifier-link[^>]*>([^<]+)<\/a>/i)
              const descMatch = card[1].match(/<p>([^<]+)<\/p>/i)
              const amountMatch = card[1].match(/Betrag:\s*([+-]?[\d.,]+\s*EUR)/i) || card[1].match(/([+-]?\d+,\d{2}\s*EUR)/i)
              if (nameMatch && amountMatch) {
                rows.push(date)
                rows.push(nameMatch[1].trim())
                if (descMatch) rows.push(descMatch[1].trim())
                rows.push(amountMatch[1].trim())
              }
            }
          }
        } else {
          // 3. Standard HTML table
          for (const tr of htmlContent.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
            const cells: string[] = []
            for (const td of tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)) {
              cells.push(td[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
            }
            if (cells.length > 0) {
              rows.push(cells.join('\t'))
            }
          }
        }

        const clipboardTableText = [ibanLine, ...rows].filter(Boolean).join('\n')

        const transactions = parseBankStatementPaste(clipboardTableText, inst.name)
        expect(transactions.length).toBeGreaterThanOrEqual(3)

        for (const tx of transactions) {
          expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
          expect(tx.amount).not.toBe(0)
          expect(tx.description.trim().length).toBeGreaterThan(1)
          expect(tx.institution).toBe(inst.name)
          expect(tx.currency).toBe('EUR')
        }

        const detectedIbans = extractAccountIbansFromPaste(clipboardTableText)
        expect(detectedIbans.length).toBeGreaterThanOrEqual(1)
        expect(detectedIbans[0]).toMatch(/^DE\d{20}$/)

        // Test through useTransactionImport hook
        const { result } = renderHook(() => useTransactionImport(inst.name, 'paste'))
        act(() => {
          result.current.setPasteText(clipboardTableText)
        })
        act(() => {
          result.current.handlePaste()
        })

        expect(result.current.error).toBeNull()
        expect(result.current.loading).toBe(false)
        expect(result.current.transactions.length).toBe(transactions.length)
        expect(result.current.detectedAccountIbans).toEqual(detectedIbans)
      })
    })
  })
})
