import { describe, expect, it, vi } from 'vitest'

import { extractAccountIbansFromPaste, parseBankStatementPaste } from '../paste-parser'

vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>()
  return {
    ...actual,
    generateId: () => 'mocked-id',
  }
})

describe('parseBankStatementPaste', () => {
  it('parses typical bank paste format', () => {
    const rawText = `
01.01.2023
Max Mustermann
Invoice 1234
Überweisung
-50,00 EUR
(Umsatzdetails öffnen)
    `
    const result = parseBankStatementPaste(rawText, 'TestBank')

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: 'mocked-id',
      date: '2023-01-01',
      description: 'Max Mustermann – Invoice 1234',
      amount: -50,
      currency: 'EUR',
      type: 'expense',
      institution: 'TestBank',
    })
  })

  it('filters out noise and IBANs', () => {
    const rawText = `
Menü öffnen
Symbol
Zahlungsverkehrspartner
01.01.2023
Supermarket
Groceries
Kartenzahlung
-100,50 EUR
DE12 3456
12.01.2023
Salary inc
Monthly Pay
Gehalt
+2.000,00 EUR
    `
    const result = parseBankStatementPaste(rawText, 'TestBank')

    expect(result).toHaveLength(2)
    expect(result[0].description).toBe('Supermarket – Groceries')
    expect(result[0].amount).toBe(-100.5)

    expect(result[1].description).toBe('Salary inc – Monthly Pay')
    expect(result[1].amount).toBe(2000)
  })

  it('handles pending transactions (Voraussichtliche Buchung)', () => {
    const rawText = `
Voraussichtliche Buchung: 15.01.2023
Pending Store
Some Purchase
Kartenzahlung
-15,99 EUR
    `
    const result = parseBankStatementPaste(rawText, 'TestBank')

    expect(result).toHaveLength(1)
    expect(result[0].date).toBe('2023-01-15')
    expect(result[0].description).toBe('Pending Store – Some Purchase')
  })

  it('concatenates multi-line descriptions', () => {
    const rawText = `
01.01.2023
Company Name
Description Line 1
Description Line 2
Description Line 3
Lastschrift
-10,00 EUR
    `
    const result = parseBankStatementPaste(rawText, 'TestBank')

    expect(result).toHaveLength(1)
    expect(result[0].description).toBe(
      'Company Name – Description Line 1 Description Line 2 Description Line 3',
    )
  })

  it('skips avatar initials placeholders', () => {
    const rawText = `
01.01.2023
JD
John Doe
Invoice
Überweisung
-5,00 EUR
    `
    const result = parseBankStatementPaste(rawText, 'TestBank')

    expect(result).toHaveLength(1)
    expect(result[0].description).toBe('John Doe – Invoice') // JD is skipped because it's 2 uppercase letters
  })

  it('returns empty array if no transactions found', () => {
    const rawText = `
Menü öffnen
Symbol
Filter
Suchen
    `
    const result = parseBankStatementPaste(rawText, 'TestBank')
    expect(result).toEqual([])
  })

  it('falls back to type as description if partner and desc are missing', () => {
    // Though rare, if it parses without partner/desc but with type
    const rawText = `
01.01.2023
Zinsen
+1,00 EUR
    `
    const result = parseBankStatementPaste(rawText, 'TestBank')

    expect(result).toHaveLength(1)
    expect(result[0].description).toBe('Zinsen')
    expect(result[0].amount).toBe(1)
  })

  it('extracts counterpartyIban when present in paste description', () => {
    const rawText = `
01.01.2023
Max Mustermann
IBAN DE89370400440000000001
Überweisung
-50,00 EUR
    `
    const result = parseBankStatementPaste(rawText, 'TestBank')
    expect(result).toHaveLength(1)
    expect(result[0].counterpartyIban).toBe('DE89370400440000000001')
  })

  it('parses tab-delimited table rows copied from an HTML <table> on a bank website', () => {
    const rawText = `
IBAN: DE45 3705 0299 1234 5678 90
Buchungstag\tBegünstigter / Auftraggeber\tVerwendungszweck\tUmsatzart\tBetrag
14.10.2026\tREWE Markt GmbH\tKartenzahlung Filiale Köln\tKartenzahlung\t-42,50 EUR
12.10.2026\tHausverwaltung Muster GmbH\tMiete Wohnung 10/2026\tDauerauftrag\t-850,00 EUR
01.10.2026\tMusterfirma Arbeitgeber AG\tGehaltszahlung 10/2026\tÜberweisung\t+3.250,00 EUR
    `
    const result = parseBankStatementPaste(rawText, 'Kreissparkasse Köln')
    expect(result).toHaveLength(3)

    expect(result[0]).toMatchObject({
      date: '2026-10-14',
      description: 'REWE Markt GmbH – Kartenzahlung Filiale Köln',
      amount: -42.5,
      currency: 'EUR',
      type: 'expense',
      institution: 'Kreissparkasse Köln',
    })

    expect(result[1]).toMatchObject({
      date: '2026-10-12',
      description: 'Hausverwaltung Muster GmbH – Miete Wohnung 10/2026',
      amount: -850,
      currency: 'EUR',
      type: 'expense',
      institution: 'Kreissparkasse Köln',
    })

    expect(result[2]).toMatchObject({
      date: '2026-10-01',
      description: 'Musterfirma Arbeitgeber AG – Gehaltszahlung 10/2026',
      amount: 3250,
      currency: 'EUR',
      type: 'income',
      institution: 'Kreissparkasse Köln',
    })
  })

  it('parses raw HTML table directly', () => {
    const htmlText = `
      <div class="account-header">
        <p>IBAN: <strong>DE45 3705 0299 1234 5678 90</strong></p>
      </div>
      <table>
        <thead>
          <tr><th>Datum</th><th>Empfänger</th><th>Verwendungszweck</th><th>Betrag</th></tr>
        </thead>
        <tbody>
          <tr><td>14.10.2026</td><td>REWE Markt</td><td>Einkauf</td><td>-42,50 EUR</td></tr>
          <tr><td>01.10.2026</td><td>Arbeitgeber AG</td><td>Gehalt</td><td>+3.250,00 EUR</td></tr>
        </tbody>
      </table>
    `
    const result = parseBankStatementPaste(htmlText, 'Kreissparkasse Köln')
    expect(result).toHaveLength(2)
    expect(result[0].date).toBe('2026-10-14')
    expect(result[0].amount).toBe(-42.5)
    expect(result[1].date).toBe('2026-10-01')
    expect(result[1].amount).toBe(3250)
  })
})

describe('extractAccountIbansFromPaste', () => {
  it('extracts IBAN from header line', () => {
    const rawText = `
Konto: Girokonto
IBAN: DE35 1001 1001 0000 0000 01
Saldo: 1.000,00 EUR
    `
    const ibans = extractAccountIbansFromPaste(rawText)
    expect(ibans).toContain('DE35100110010000000001')
  })

  it('extracts IBAN from raw HTML elements', () => {
    const html = `<p class="account-iban">IBAN: <strong>DE89 3705 0198 1234 5678 90</strong></p>`
    const ibans = extractAccountIbansFromPaste(html)
    expect(ibans).toContain('DE89370501981234567890')
  })
})

