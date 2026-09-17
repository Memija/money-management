import { describe, expect, it, vi } from 'vitest'

import { findHeaderRowIndex, rowsToTransactions, rowsToTransactionsWithMeta } from '../csv-parser'

// Mock generateId so snapshot testing or deterministic asserts work if needed,
// though we mostly just check if it returns strings.
vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>()
  return {
    ...actual,
    generateId: () => 'mocked-id',
  }
})

describe('csv-parser', () => {
  describe('findHeaderRowIndex', () => {
    it('returns 0 when no obvious headers are found', () => {
      const rows = [
        ['col1', 'col2', 'col3'],
        ['val1', 'val2', 'val3'],
      ]
      expect(findHeaderRowIndex(rows)).toBe(0)
    })

    it('finds header row amidst preamble', () => {
      const rows = [
        ['Umsätze für Konto', '123456'],
        ['Zeitraum', '01.01.-31.01.'],
        [''],
        ['Datum', 'Verwendungszweck', 'Betrag'],
        ['01.01.2023', 'Supermarket', '-50.00'],
      ]
      expect(findHeaderRowIndex(rows)).toBe(3)
    })

    it('is case-insensitive and trims whitespace', () => {
      const rows = [
        [''],
        ['   DATE  ', ' DESCRIPTION ', '  AMOUNT  '],
        ['01.01.2023', 'Supermarket', '-50.00'],
      ]
      expect(findHeaderRowIndex(rows)).toBe(1)
    })
  })

  describe('rowsToTransactions', () => {
    it('returns empty array for less than 2 rows', () => {
      expect(rowsToTransactions([], 'TestBank')).toEqual([])
      expect(rowsToTransactions([['Datum', 'Betrag']], 'TestBank')).toEqual([])
    })

    it('skips completely empty rows', () => {
      const rows = [
        ['Datum', 'Verwendungszweck', 'Betrag'],
        ['01.01.2023', 'Grocery', '-50.00'],
        ['', '', ''],
        ['02.01.2023', 'Salary', '1000.00'],
      ]
      const result = rowsToTransactions(rows, 'TestBank')
      expect(result).toHaveLength(2)
      expect(result[0].amount).toBe(-50)
      expect(result[1].amount).toBe(1000)
    })

    it('parses standard CSV correctly', () => {
      const rows = [
        ['Date', 'Description', 'Amount'],
        ['2023-12-01', 'Coffee', '-4.50'],
        ['2023-12-02', 'Paycheck', '2000.00'],
      ]
      const result = rowsToTransactions(rows, 'BankA')

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 'mocked-id',
        date: '2023-12-01',
        description: 'Coffee',
        amount: -4.5,
        currency: 'EUR',
        type: 'expense',
        institution: 'BankA',
      })
      expect(result[1].amount).toBe(2000)
      expect(result[1].type).toBe('income')
    })

    it('matches exact phrase headers (e.g., umsatz in eur)', () => {
      const rows = [
        ['Buchungstag', 'Buchungstext', 'Umsatz in EUR'],
        ['15.01.2023', 'Test Transaction', '-15.99'],
      ]
      const result = rowsToTransactions(rows, 'comdirect')

      expect(result).toHaveLength(1)
      expect(result[0].date).toBe('2023-01-15')
      expect(result[0].amount).toBe(-15.99)
    })

    it('falls back to default column indices if headers are missing', () => {
      const rows = [
        ['Col0', 'Col1', 'Col2'],
        ['15.01.2023', 'No Header Match', '-10.00'],
      ]
      const result = rowsToTransactions(rows, 'FallbackBank')

      // Default: date=0, desc=1, amount=2
      expect(result).toHaveLength(1)
      expect(result[0].date).toBe('2023-01-15')
      expect(result[0].description).toBe('No Header Match')
      expect(result[0].amount).toBe(-10)
    })

    it('handles Deutsche Bank Soll/Haben logic', () => {
      const rows = [
        ['Buchungstag', 'Verwendungszweck', 'Soll', 'Haben'],
        ['01.01.2023', 'Rent', '500.00', ''], // Soll is populated -> expense
        ['02.01.2023', 'Salary', '', '1500.00'], // Haben is populated -> income
        ['03.01.2023', 'Zero', '', '0'],
      ]
      const result = rowsToTransactions(rows, 'DeutscheBank')

      expect(result).toHaveLength(3)
      expect(result[0].amount).toBe(-500)
      expect(result[0].type).toBe('expense')

      expect(result[1].amount).toBe(1500)
      expect(result[1].type).toBe('income')

      expect(result[2].amount).toBe(0)
    })

    it('prefers Betrag over Saldo', () => {
      const rows = [
        ['Datum', 'Beschreibung', 'Betrag', 'Saldo'],
        ['01.01.2023', 'Purchase', '-20', '1000'],
      ]
      const result = rowsToTransactions(rows, 'Sparkasse')

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(-20) // Amount should be Betrag, not Saldo
    })

    it('handles DKB gendered payer tokens', () => {
      const rows = [
        ['Wertstellung', 'Zahlungspflichtige*r', 'Betrag'],
        ['01.01.2023', 'John Doe', '-100'],
      ]
      const result = rowsToTransactions(rows, 'DKB')

      expect(result).toHaveLength(1)
      expect(result[0].description).toBe('John Doe')
      expect(result[0].amount).toBe(-100)
    })

    it('returns empty array if no data rows left after preamble', () => {
      const rows = [['Preamble'], ['Datum', 'Verwendungszweck', 'Betrag']]
      expect(rowsToTransactions(rows, 'TestBank')).toEqual([])
    })

    it('falls back to empty string or default when cells are missing/short', () => {
      const rows = [
        ['Datum', 'Verwendungszweck', 'Betrag'],
        ['01.01.2023'], // Short row, desc and amount are missing
      ]
      const result = rowsToTransactions(rows, 'TestBank')
      expect(result).toHaveLength(1)
      expect(result[0].date).toBe('2023-01-01')
      expect(result[0].description).toBe('Unknown')
      expect(result[0].amount).toBe(0)
    })

    it('handles empty amount strings explicitly', () => {
      const rows = [
        ['Datum', 'Verwendungszweck', 'Betrag'],
        ['01.01.2023', 'Some desc', ''],
      ]
      const result = rowsToTransactions(rows, 'TestBank')
      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(0)
    })

    it('discards direct transactions between spaces and preserves real transactions', () => {
      const rows = [
        [
          'Booking Date',
          'Value Date',
          'Partner Name',
          'Partner Iban',
          'Type',
          'Payment Reference',
          'Account Name',
          'Amount (EUR)',
        ],
        // Transfer from Main Account to Space (both sides recorded)
        ['2023-05-10', '2023-05-10', 'Investment fund', '', 'Debit Transfer', 'To fund', 'Main Account', '-100.00'],
        ['2023-05-10', '2023-05-10', 'Main Account', '', 'Credit Transfer', 'To fund', 'Investment fund', '100.00'],
        // Real purchase in Main Account
        ['2023-05-12', '2023-05-12', 'Supermarket GmbH', '', 'Presentment', '-', 'Main Account', '-45.50'],
        // Real incoming salary in Main Account
        ['2023-05-15', '2023-05-15', 'Employer AG', 'DE991234567890', 'Credit Transfer', 'Salary', 'Main Account', '2800.00'],
      ]
      const result = rowsToTransactions(rows, 'N26')

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        date: '2023-05-12',
        description: 'Supermarket GmbH',
        amount: -45.5,
        type: 'expense',
      })
      expect(result[1]).toMatchObject({
        date: '2023-05-15',
        description: 'Employer AG',
        amount: 2800,
        type: 'income',
      })
    })

    it('discards historical renamed space transfers paired on same date with equal and opposite amount', () => {
      const rows = [
        [
          'Booking Date',
          'Value Date',
          'Partner Name',
          'Partner Iban',
          'Type',
          'Payment Reference',
          'Account Name',
          'Amount (EUR)',
        ],
        // Main Account side has historical space name 'Rente', space side has current name 'Pension fund'
        ['2019-10-07', '2019-10-07', 'Rente', '', 'Debit Transfer', 'Zur Rente', 'Main Account', '-50.00'],
        ['2019-10-07', '2019-10-07', 'Main Account', '', 'Credit Transfer', 'Zur Rente', 'Pension fund', '50.00'],
        // Real external transfer with similar reference text is preserved
        ['2019-10-07', '2019-10-07', 'External Sender', 'DE92500400000646293100', 'Credit Transfer', 'For spaces.', 'Main Account', '100.00'],
      ]
      const result = rowsToTransactions(rows, 'N26')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        date: '2019-10-07',
        description: 'External Sender',
        amount: 100,
        type: 'income',
      })
    })

    it('correctly parses instance CSV cfd1945d-b724-4ed0-9597-dca49169963c.csv discarding all 462 space transfers', async () => {
      const fs = await import('fs')
      const path = await import('path')
      const csvPath = path.resolve(process.cwd(), 'data/cfd1945d-b724-4ed0-9597-dca49169963c.csv')
      const content = fs.readFileSync(csvPath, 'utf-8')
      const lines = content.split('\n').filter((l) => l.trim())

      // Parse lines with quote-awareness
      const parseCsvLine = (line: string): string[] => {
        const result: string[] = []
        let cur = ''
        let inQuotes = false
        for (let i = 0; i < line.length; i++) {
          const c = line[i]
          if (c === '"') inQuotes = !inQuotes
          else if (c === ',' && !inQuotes) {
            result.push(cur.trim().replace(/^"|"$/g, ''))
            cur = ''
          } else {
            cur += c
          }
        }
        result.push(cur.trim().replace(/^"|"$/g, ''))
        return result
      }

      const rows = lines.map(parseCsvLine)
      const txs = rowsToTransactions(rows, 'N26')

      // Total data rows is 681. 462 space transfers should be discarded, leaving 219 real transactions.
      expect(txs).toHaveLength(219)

      // Verify no discarded space names exist in the remaining descriptions
      const spaceNames = ['Investment fund', 'Pension fund', 'Wohnung und Auto', 'Main Account', 'Gebäude und Wohnung', 'Rente']
      for (const tx of txs) {
        expect(spaceNames).not.toContain(tx.description)
      }

      // Verify sample real merchants are correctly parsed with proper descriptions
      const descriptions = txs.map((t) => t.description)
      expect(descriptions.some((d) => d.startsWith('WIZZ AIR'))).toBe(true)
      expect(descriptions.some((d) => d.startsWith('HEROKU'))).toBe(true)
      expect(descriptions.some((d) => d.includes('ANEL MEMIC') || d.includes('Anel Memic'))).toBe(true)

      // Also verify rowsToTransactionsWithMeta returns metadata correctly
      const metaResult = rowsToTransactionsWithMeta(rows, 'N26')
      expect(metaResult.transactions).toHaveLength(219)
      expect(metaResult.discardedSpaceCount).toBe(462)

      // Verify counterpartyIban is preserved on transfers
      const cbTransfers = metaResult.transactions.filter(
        (t) => t.counterpartyIban === 'DE92500400000646293100',
      )
      expect(cbTransfers).toHaveLength(177)
    })

    it('extracts own account IBANs and counterparty IBANs from Commerzbank-style CSV', () => {
      const rows = [
        ['Buchungstag', 'Buchungstext', 'Betrag', 'IBAN Kontoinhaber'],
        ['15.09.2026', 'ANEL MEMIC Transfer DE35100110012621828092', '-200,00', 'DE92500400000646293100'],
        ['16.09.2026', 'Supermarket', '-45,50', 'DE92500400000646293100'],
      ]

      const meta = rowsToTransactionsWithMeta(rows, 'Commerzbank')
      expect(meta.detectedAccountIbans).toEqual(['DE92500400000646293100'])
      expect(meta.transactions[0].ownIban).toBe('DE92500400000646293100')
      expect(meta.transactions[0].counterpartyIban).toBe('DE35100110012621828092')
    })
  })
})

