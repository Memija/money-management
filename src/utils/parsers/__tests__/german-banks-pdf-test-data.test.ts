import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { germanInstitutions } from '../../../data/institutions'
import { extractAccountIbansFromPdf, parsePdfText } from '../pdf-parser'

const testDataDir = path.resolve(__dirname, '../../../../test-data/german-banks')
const pdfDir = path.join(testDataDir, 'pdf')

describe('German Banks PDF Test Data Suite', () => {
  it('has a test PDF file for every supported German bank in germanInstitutions', () => {
    expect(germanInstitutions.length).toBe(54)

    for (const inst of germanInstitutions) {
      const filePath = path.join(pdfDir, `${inst.id}.pdf`)
      expect(
        fs.existsSync(filePath),
        `Missing test PDF file for bank: ${inst.id} (${inst.name})`,
      ).toBe(true)
    }
  })

  describe.each(germanInstitutions)('PDF Statement validation for $name ($id)', (inst) => {
    it(`successfully extracts and parses transactions from ${inst.id}.pdf`, async () => {
      const filePath = path.join(pdfDir, `${inst.id}.pdf`)
      const fileBuffer = fs.readFileSync(filePath)

      // Verify that the PDF embeds the bank's official image/logo
      const hasImageXObject =
        fileBuffer.includes(Buffer.from('Image')) && fileBuffer.includes(Buffer.from('Width'))
      expect(
        hasImageXObject,
        `${inst.name} PDF statement should include the embedded official bank logo`,
      ).toBe(true)

      // Use pdfjs-dist legacy build for Node.js test environment
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise

      let fullText = ''
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
          .join(' ')

        fullText += pageText + '\n'
      }

      // PDF text must contain the bank header and account details
      expect(fullText.length).toBeGreaterThan(50)

      // Parse transactions using the production PDF parser
      const transactions = parsePdfText(fullText, inst.name)

      // Must extract at least 3 transactions
      expect(
        transactions.length,
        `${inst.name} should parse at least 3 transactions from PDF`,
      ).toBeGreaterThanOrEqual(3)

      // Verify each transaction's integrity
      for (const tx of transactions) {
        expect(tx.id).toBeDefined()
        expect(tx.id.length).toBeGreaterThan(0)

        // Valid ISO date YYYY-MM-DD
        expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)

        // Non-empty description
        expect(tx.description).toBeDefined()
        expect(tx.description.trim().length).toBeGreaterThan(1)

        // Ensure summary / balance rows were filtered out
        const lowerDesc = tx.description.toLowerCase()
        expect(lowerDesc).not.toContain('kontostand')
        expect(lowerDesc).not.toContain('summe der umsaetze')
        expect(lowerDesc).not.toContain('summe der umsätze')

        // Numeric non-zero amount
        expect(typeof tx.amount).toBe('number')
        expect(isNaN(tx.amount)).toBe(false)
        expect(tx.amount).not.toBe(0)

        // Valid transaction type and currency
        expect(['income', 'expense']).toContain(tx.type)
        expect(tx.currency).toBe('EUR')
        expect(tx.institution).toBe(inst.name)
      }

      // Check that both expense and income transactions exist
      const hasExpense = transactions.some((t) => t.type === 'expense' || t.amount < 0)
      const hasIncome = transactions.some((t) => t.type === 'income' || t.amount > 0)
      expect(hasExpense, `${inst.name} PDF should include at least one expense`).toBe(true)
      expect(hasIncome, `${inst.name} PDF should include at least one income transaction`).toBe(
        true,
      )

      // Verify that the account IBAN was extracted from the PDF statement header
      const detectedIbans = extractAccountIbansFromPdf(fullText, `${inst.id}.pdf`)
      expect(detectedIbans.length).toBeGreaterThanOrEqual(1)
      expect(detectedIbans[0]).toMatch(/^DE\d{20}$/)
    })
  })
})
