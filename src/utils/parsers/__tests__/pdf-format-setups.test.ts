import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { extractAccountIbansFromPdf, parsePdfText } from '../pdf-parser'

interface PdfSetupMeta {
  id: string
  title: string
  layout: 'standard' | 'umsatzuebersicht' | 'single-date' | 'multipage'
  iban: string
  expectedMinTxs: number
}

const PDF_FORMAT_SETUPS: PdfSetupMeta[] = [
  {
    id: 'pdf-01-double-date-standard-table',
    title: 'Double-Date 4-Column Standard Table Statement',
    layout: 'standard',
    iban: 'DE89 3704 0044 0532 0130 00',
    expectedMinTxs: 4,
  },
  {
    id: 'pdf-02-umsatzuebersicht-grouped-categories',
    title: 'Umsatzuebersicht Layout with Truncated Text and Category Lines',
    layout: 'umsatzuebersicht',
    iban: 'DE12 5001 0517 0648 4898 90',
    expectedMinTxs: 4,
  },
  {
    id: 'pdf-03-single-date-neobank-statement',
    title: 'Single-Date Modern Neobank Account Statement',
    layout: 'single-date',
    iban: 'DE27 1007 7777 0209 2997 00',
    expectedMinTxs: 4,
  },
  {
    id: 'pdf-04-kontoauszug-soll-haben-suffix',
    title: 'Traditional Kontoauszug with Trailing S/H and Minus Suffixes',
    layout: 'standard',
    iban: 'DE52 3705 0198 0001 1223 34',
    expectedMinTxs: 4,
  },
  {
    id: 'pdf-05-two-digit-year-compact',
    title: 'Compact Statement with 2-Digit Years (DD.MM.YY)',
    layout: 'standard',
    iban: 'DE19 5007 0010 0987 6543 21',
    expectedMinTxs: 4,
  },
  {
    id: 'pdf-06-iso-date-international',
    title: 'International Statement with ISO Dates (YYYY-MM-DD) and Dot Decimals',
    layout: 'standard',
    iban: 'DE44 5001 0517 5407 3249 31',
    expectedMinTxs: 4,
  },
  {
    id: 'pdf-07-multipage-carryover-statement',
    title: 'Multi-Page Statement with Carryover (Uebertrag / Zwischensaldo)',
    layout: 'multipage',
    iban: 'DE68 2105 0170 0012 3456 78',
    expectedMinTxs: 4,
  },
  {
    id: 'pdf-08-sepa-mandate-multiline',
    title: 'Dense SEPA Statement with Counterparty IBAN, Mandate, and EREF',
    layout: 'standard',
    iban: 'DE31 2004 0060 0555 6667 77',
    expectedMinTxs: 4,
  },
  {
    id: 'pdf-09-credit-card-monthly-statement',
    title: 'Credit Card Monthly Billing Statement (Kartenabrechnung)',
    layout: 'standard',
    iban: 'DE08 1203 0000 1020 3040 50',
    expectedMinTxs: 4,
  },
  {
    id: 'pdf-10-brokerage-depot-statement',
    title: 'Brokerage Cash & Depot Account Statement',
    layout: 'standard',
    iban: 'DE40 1001 0123 4567 8901 23',
    expectedMinTxs: 4,
  },
  {
    id: 'pdf-11-slash-date-english-statement',
    title: 'English Statement with Slash Dates (DD/MM/YYYY)',
    layout: 'standard',
    iban: 'DE75 5121 0800 1245 1261 99',
    expectedMinTxs: 4,
  },
  {
    id: 'pdf-12-reimbursement-and-fee-refunds',
    title: 'Statement with Travel Reimbursements (REISESP) and Fee Refunds (Rueckverguetung)',
    layout: 'standard',
    iban: 'DE91 1005 0000 0123 4567 89',
    expectedMinTxs: 4,
  },
]

const pdfDir = path.resolve(__dirname, '../../../../test-data/pdf')

describe('PDF Format Setups Test Suite (Bank-Agnostic)', () => {
  it('has all 12 structural PDF statement test files on disk', () => {
    expect(PDF_FORMAT_SETUPS.length).toBe(12)
    for (const setup of PDF_FORMAT_SETUPS) {
      const filePath = path.join(pdfDir, `${setup.id}.pdf`)
      expect(fs.existsSync(filePath), `Missing PDF format fixture: ${setup.id}.pdf`).toBe(true)
    }
  })

  describe.each(PDF_FORMAT_SETUPS)('$id – $title', (setup) => {
    it(`extracts and parses transactions and IBAN from ${setup.id}.pdf`, async () => {
      const filePath = path.join(pdfDir, `${setup.id}.pdf`)
      const fileBuffer = fs.readFileSync(filePath)

      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) }).promise

      if (setup.layout === 'multipage') {
        expect(doc.numPages).toBe(2)
      }

      let fullText = ''
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
          .join(' ')
        fullText += pageText + '\n'
      }

      expect(fullText.length).toBeGreaterThan(50)

      const institutionLabel = 'Format Test Institution'
      const transactions = parsePdfText(fullText, institutionLabel)

      expect(transactions.length).toBeGreaterThanOrEqual(setup.expectedMinTxs)

      for (const tx of transactions) {
        expect(tx.id.length).toBeGreaterThan(0)
        expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(tx.description.trim().length).toBeGreaterThan(1)

        const lowerDesc = tx.description.toLowerCase()
        expect(lowerDesc).not.toContain('kontostand')
        expect(lowerDesc).not.toContain('summe der umsätze')
        expect(lowerDesc).not.toContain('übertrag')

        expect(typeof tx.amount).toBe('number')
        expect(Number.isNaN(tx.amount)).toBe(false)
        expect(tx.amount).not.toBe(0)
        expect(['income', 'expense']).toContain(tx.type)
        expect(tx.currency).toBe('EUR')
        expect(tx.institution).toBe(institutionLabel)
      }

      const hasExpense = transactions.some((t) => t.type === 'expense' && t.amount < 0)
      const hasIncome = transactions.some((t) => t.type === 'income' && t.amount > 0)
      expect(hasExpense).toBe(true)
      expect(hasIncome).toBe(true)

      const detectedIbans = extractAccountIbansFromPdf(fullText, `${setup.id}.pdf`)
      expect(detectedIbans.length).toBeGreaterThanOrEqual(1)
      expect(detectedIbans[0]).toBe(setup.iban.replace(/\s+/g, ''))
    })
  })
})
