import { describe, expect, it } from 'vitest'

import type { ImportedAccount, Transaction } from '../../types'
import {
  dateDiffInDays,
  extractIbans,
  isTransferCandidate,
  normalizeTransferText,
  reconcileCrossAccountTransfers,
} from '../account-transfers'
import { splitCsvLine } from '../parsers/helpers'
import {
  extractAccountIbansFromPaste,
  extractAccountIbansFromPdf,
  parseBankStatementPaste,
  parsePdfText,
  rowsToTransactionsWithMeta,
} from '../transaction-parsers'

describe('account-transfers utility', () => {
  describe('normalizeTransferText', () => {
    it('normalizes text by lowercasing and trimming punctuation', () => {
      expect(normalizeTransferText('ANEL MEMIC - N26!')).toBe('anel memic n26')
    })
  })

  describe('dateDiffInDays', () => {
    it('calculates calendar day differences accurately', () => {
      expect(dateDiffInDays('2026-09-10', '2026-09-10')).toBe(0)
      expect(dateDiffInDays('2026-09-10', '2026-09-13')).toBe(3)
      expect(dateDiffInDays('2026-09-15', '2026-09-10')).toBe(5)
    })
  })

  describe('extractIbans', () => {
    it('extracts IBANs from descriptions', () => {
      const text = 'ANEL MEMIC NTSBDEB1XXX DE35100110012621828092 FOR SPACES'
      const ibans = extractIbans(text)
      expect(ibans).toContain('DE35100110012621828092')
    })
  })

  describe('isTransferCandidate', () => {
    const accA: ImportedAccount = {
      institutionId: 'commerzbank',
      institutionName: 'Commerzbank',
      transactions: [],
      importedAt: '2026-09-15T10:00:00Z',
      importedFingerprints: [],
    }

    const accB: ImportedAccount = {
      institutionId: 'n26',
      institutionName: 'N26',
      transactions: [],
      importedAt: '2026-09-15T10:00:00Z',
      importedFingerprints: [],
    }

    it('matches transfers referencing institution name', () => {
      const txA: Transaction = {
        id: 'tx1',
        date: '2026-09-01',
        description: 'Sent to N26 account',
        amount: -250,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      }
      const txB: Transaction = {
        id: 'tx2',
        date: '2026-09-01',
        description: 'Top up from Commerzbank',
        amount: 250,
        currency: 'EUR',
        type: 'income',
        institution: 'N26',
      }

      expect(isTransferCandidate(txA, accA, txB, accB)).toBe(true)
    })

    it('matches transfers sharing account holder name tokens', () => {
      const txA: Transaction = {
        id: 'tx1',
        date: '2026-09-01',
        description: 'ANEL MEMIC Dauerauftrag',
        amount: -300,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      }
      const txB: Transaction = {
        id: 'tx2',
        date: '2026-09-02',
        description: 'ANEL MEMIC',
        amount: 300,
        currency: 'EUR',
        type: 'income',
        institution: 'N26',
      }

      expect(isTransferCandidate(txA, accA, txB, accB)).toBe(true)
    })

    it('matches transfers with direct IBAN references', () => {
      const txA: Transaction = {
        id: 'tx1',
        date: '2026-09-01',
        description: 'Transfer DE35100110012621828092',
        amount: -500,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      }
      const txB: Transaction = {
        id: 'tx2',
        date: '2026-09-01',
        description: 'Salary advance DE35100110012621828092',
        amount: 500,
        currency: 'EUR',
        type: 'income',
        institution: 'N26',
      }

      expect(isTransferCandidate(txA, accA, txB, accB)).toBe(true)
    })

    it('rejects transactions with identical sign (both positive or both negative)', () => {
      const txA: Transaction = {
        id: 'tx1',
        date: '2026-09-01',
        description: 'ANEL MEMIC',
        amount: -100,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      }
      const txB: Transaction = {
        id: 'tx2',
        date: '2026-09-01',
        description: 'ANEL MEMIC',
        amount: -100,
        currency: 'EUR',
        type: 'expense',
        institution: 'N26',
      }

      expect(isTransferCandidate(txA, accA, txB, accB)).toBe(false)
    })

    it('rejects transactions when dates differ by more than 4 days', () => {
      const txA: Transaction = {
        id: 'tx1',
        date: '2026-09-01',
        description: 'ANEL MEMIC',
        amount: -100,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      }
      const txB: Transaction = {
        id: 'tx2',
        date: '2026-09-10',
        description: 'ANEL MEMIC',
        amount: 100,
        currency: 'EUR',
        type: 'income',
        institution: 'N26',
      }

      expect(isTransferCandidate(txA, accA, txB, accB)).toBe(false)
    })

    it('matches spaced IBANs against compact IBANs across transactions', () => {
      const txA: Transaction = {
        id: 'tx1',
        date: '2026-09-01',
        description: 'Transfer to DE35 1001 1001 2621 8280 92',
        amount: -400,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      }
      const txB: Transaction = {
        id: 'tx2',
        date: '2026-09-02',
        description: 'Credit from DE35100110012621828092',
        amount: 400,
        currency: 'EUR',
        type: 'income',
        institution: 'N26',
      }

      expect(isTransferCandidate(txA, accA, txB, accB)).toBe(true)
    })

    it('matches multi-word institution names like "ING Deutschland" against "ING"', () => {
      const ingAcc: ImportedAccount = {
        institutionId: 'ing',
        institutionName: 'ING Deutschland',
        transactions: [],
        importedAt: '2026-09-15T10:00:00Z',
        importedFingerprints: [],
      }
      const txA: Transaction = {
        id: 'tx1',
        date: '2026-09-01',
        description: 'Überweisung auf ING',
        amount: -150,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      }
      const txB: Transaction = {
        id: 'tx2',
        date: '2026-09-02',
        description: 'Gutschrift Girokonto',
        amount: 150,
        currency: 'EUR',
        type: 'income',
        institution: 'ING Deutschland',
      }

      expect(isTransferCandidate(txA, accA, txB, ingAcc)).toBe(true)
    })

    it('matches exactly at 4-day settlement boundary (e.g. Fri to Tue)', () => {
      const txA: Transaction = {
        id: 'tx1',
        date: '2026-09-04',
        description: 'ANEL MEMIC',
        amount: -200,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      }
      const txB: Transaction = {
        id: 'tx2',
        date: '2026-09-08',
        description: 'ANEL MEMIC',
        amount: 200,
        currency: 'EUR',
        type: 'income',
        institution: 'N26',
      }

      expect(isTransferCandidate(txA, accA, txB, accB)).toBe(true)
    })

    it('rejects transactions with different currencies', () => {
      const txA: Transaction = {
        id: 'tx1',
        date: '2026-09-01',
        description: 'ANEL MEMIC',
        amount: -100,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      }
      const txB: Transaction = {
        id: 'tx2',
        date: '2026-09-01',
        description: 'ANEL MEMIC',
        amount: 100,
        currency: 'USD',
        type: 'income',
        institution: 'N26',
      }

      expect(isTransferCandidate(txA, accA, txB, accB)).toBe(false)
    })

    it('rejects merchant purchases even if opposite amounts happen to align', () => {
      const txA: Transaction = {
        id: 'tx1',
        date: '2026-09-01',
        description: 'STARBUCKS COFFEE',
        amount: -15,
        currency: 'EUR',
        type: 'expense',
        institution: 'Commerzbank',
      }
      const txB: Transaction = {
        id: 'tx2',
        date: '2026-09-01',
        description: 'ZALANDO REFUND',
        amount: 15,
        currency: 'EUR',
        type: 'income',
        institution: 'N26',
      }

      expect(isTransferCandidate(txA, accA, txB, accB)).toBe(false)
    })
  })

  describe('reconcileCrossAccountTransfers', () => {
    it('marks matching pairs across accounts as ghost transactions and links them', () => {
      const accA: ImportedAccount = {
        institutionId: 'commerzbank',
        institutionName: 'Commerzbank',
        transactions: [
          {
            id: 'cb-1',
            date: '2026-08-21',
            description: 'ANEL MEMIC NTSBDEB1XXX DE35100110012621828092 FOR SPACES',
            amount: -1500,
            currency: 'EUR',
            type: 'expense',
            institution: 'Commerzbank',
          },
          {
            id: 'cb-2',
            date: '2026-08-22',
            description: 'REWE Supermarkt Einkauf',
            amount: -45.5,
            currency: 'EUR',
            type: 'expense',
            institution: 'Commerzbank',
          },
        ],
        importedAt: '2026-09-15T10:00:00Z',
        importedFingerprints: [],
      }

      const accB: ImportedAccount = {
        institutionId: 'n26',
        institutionName: 'N26',
        transactions: [
          {
            id: 'n26-1',
            date: '2026-08-21',
            description: 'ANEL MEMIC',
            amount: 1500,
            currency: 'EUR',
            type: 'income',
            institution: 'N26',
          },
          {
            id: 'n26-2',
            date: '2026-08-23',
            description: 'WIZZ AIR Flight Ticket',
            amount: -79.99,
            currency: 'EUR',
            type: 'expense',
            institution: 'N26',
          },
        ],
        importedAt: '2026-09-15T10:05:00Z',
        importedFingerprints: [],
      }

      const reconciled = reconcileCrossAccountTransfers([accA, accB])

      const resA = reconciled.find((a) => a.institutionId === 'commerzbank')!
      const resB = reconciled.find((a) => a.institutionId === 'n26')!

      // Transfer pair is marked as ghost and linked
      const cbTx = resA.transactions.find((t) => t.id === 'cb-1')!
      const n26Tx = resB.transactions.find((t) => t.id === 'n26-1')!

      expect(cbTx.isGhost).toBe(true)
      expect(cbTx.linkedTransactionId).toBe('n26-1')

      expect(n26Tx.isGhost).toBe(true)
      expect(n26Tx.linkedTransactionId).toBe('cb-1')

      // Non-transfer transactions are untouched
      expect(resA.transactions.find((t) => t.id === 'cb-2')!.isGhost).toBeFalsy()
      expect(resB.transactions.find((t) => t.id === 'n26-2')!.isGhost).toBeFalsy()
    })

    it('works identically regardless of account order', () => {
      const accA: ImportedAccount = {
        institutionId: 'commerzbank',
        institutionName: 'Commerzbank',
        transactions: [
          {
            id: 'cb-1',
            date: '2026-08-21',
            description: 'ANEL MEMIC N26 Transfer',
            amount: -500,
            currency: 'EUR',
            type: 'expense',
            institution: 'Commerzbank',
          },
        ],
        importedAt: '2026-09-15T10:00:00Z',
        importedFingerprints: [],
      }

      const accB: ImportedAccount = {
        institutionId: 'n26',
        institutionName: 'N26',
        transactions: [
          {
            id: 'n26-1',
            date: '2026-08-22',
            description: 'ANEL MEMIC Commerzbank Transfer',
            amount: 500,
            currency: 'EUR',
            type: 'income',
            institution: 'N26',
          },
        ],
        importedAt: '2026-09-15T10:05:00Z',
        importedFingerprints: [],
      }

      const order1 = reconcileCrossAccountTransfers([accA, accB])
      const order2 = reconcileCrossAccountTransfers([accB, accA])

      const order1Cb = order1.find((a) => a.institutionId === 'commerzbank')!.transactions[0]
      const order2Cb = order2.find((a) => a.institutionId === 'commerzbank')!.transactions[0]

      expect(order1Cb.isGhost).toBe(true)
      expect(order2Cb.isGhost).toBe(true)
      expect(order1Cb.linkedTransactionId).toBe('n26-1')
      expect(order2Cb.linkedTransactionId).toBe('n26-1')
    })

    it('clears ghost status when an account is removed leaving only 1 account', () => {
      const accA: ImportedAccount = {
        institutionId: 'commerzbank',
        institutionName: 'Commerzbank',
        transactions: [
          {
            id: 'cb-1',
            date: '2026-08-21',
            description: 'ANEL MEMIC N26 Transfer',
            amount: -500,
            currency: 'EUR',
            type: 'expense',
            institution: 'Commerzbank',
            isGhost: true,
            linkedTransactionId: 'n26-1',
          },
        ],
        importedAt: '2026-09-15T10:00:00Z',
        importedFingerprints: [],
      }

      const reconciled = reconcileCrossAccountTransfers([accA])
      expect(reconciled[0].transactions[0].isGhost).toBe(false)
      expect(reconciled[0].transactions[0].linkedTransactionId).toBeUndefined()
    })

    it('marks single-legged historical transfers as ghost when counterparty IBAN matches a known account IBAN', () => {
      const accCb: ImportedAccount = {
        institutionId: 'commerzbank',
        institutionName: 'Commerzbank',
        accountIbans: ['DE92500400000646293100'],
        transactions: [
          {
            id: 'cb-2026',
            date: '2026-09-01',
            description: 'Some recent transaction',
            amount: -50,
            currency: 'EUR',
            type: 'expense',
            institution: 'Commerzbank',
          },
        ],
        importedAt: '2026-09-15T10:00:00Z',
        importedFingerprints: [],
      }

      const accN26: ImportedAccount = {
        institutionId: 'n26',
        institutionName: 'N26',
        transactions: [
          {
            id: 'n26-historical-1',
            date: '2021-02-22',
            description: 'ANEL MEMIC',
            amount: 200,
            currency: 'EUR',
            type: 'income',
            institution: 'N26',
            counterpartyIban: 'DE92500400000646293100',
          },
          {
            id: 'n26-external',
            date: '2021-02-25',
            description: 'Supermarket Purchase',
            amount: -45,
            currency: 'EUR',
            type: 'expense',
            institution: 'N26',
            counterpartyIban: 'DE11111111111111111111',
          },
        ],
        importedAt: '2026-09-15T10:05:00Z',
        importedFingerprints: [],
      }

      const reconciled = reconcileCrossAccountTransfers([accCb, accN26])
      const n26Reconciled = reconciled.find((a) => a.institutionId === 'n26')!

      // The historical transfer to Commerzbank IBAN should be flagged as ghost
      const ghostTx = n26Reconciled.transactions.find((t) => t.id === 'n26-historical-1')!
      expect(ghostTx.isGhost).toBe(true)
      expect(ghostTx.linkedTransactionId).toBeUndefined()

      // The external purchase should NOT be a ghost
      const normalTx = n26Reconciled.transactions.find((t) => t.id === 'n26-external')!
      expect(normalTx.isGhost).toBeFalsy()
    })

    it('learns account IBANs from matched reciprocal pairs and applies them to historical transfers', () => {
      const accCb: ImportedAccount = {
        institutionId: 'commerzbank',
        institutionName: 'Commerzbank',
        // accountIbans not explicitly provided; should be learned from the 2026 paired transfer
        transactions: [
          {
            id: 'cb-2026',
            date: '2026-08-21',
            description: 'ANEL MEMIC Sent from N26',
            amount: -200,
            currency: 'EUR',
            type: 'expense',
            institution: 'Commerzbank',
          },
        ],
        importedAt: '2026-09-15T10:00:00Z',
        importedFingerprints: [],
      }

      const accN26: ImportedAccount = {
        institutionId: 'n26',
        institutionName: 'N26',
        transactions: [
          // 2026 paired transfer: establishes that DE92500400000646293100 belongs to Commerzbank
          {
            id: 'n26-2026',
            date: '2026-08-21',
            description: 'ANEL MEMIC',
            amount: 200,
            currency: 'EUR',
            type: 'income',
            institution: 'N26',
            counterpartyIban: 'DE92500400000646293100',
          },
          // 2021 historical transfer (outside Commerzbank export range)
          {
            id: 'n26-2021-02-22',
            date: '2021-02-22',
            description: 'ANEL MEMIC',
            amount: 200,
            currency: 'EUR',
            type: 'income',
            institution: 'N26',
            counterpartyIban: 'DE92500400000646293100',
          },
        ],
        importedAt: '2026-09-15T10:05:00Z',
        importedFingerprints: [],
      }

      const reconciled = reconcileCrossAccountTransfers([accCb, accN26])
      const n26Reconciled = reconciled.find((a) => a.institutionId === 'n26')!

      // Paired 2026 transfer is a ghost with linked ID
      const pairedTx = n26Reconciled.transactions.find((t) => t.id === 'n26-2026')!
      expect(pairedTx.isGhost).toBe(true)
      expect(pairedTx.linkedTransactionId).toBe('cb-2026')

      // Historical 2021 transfer learned Commerzbank IBAN and is also flagged as ghost
      const historicalTx = n26Reconciled.transactions.find((t) => t.id === 'n26-2021-02-22')!
      expect(historicalTx.isGhost).toBe(true)
      expect(historicalTx.linkedTransactionId).toBeUndefined()
    })

    it('prioritizes exact transfer matches over unrelated transactions with similar amount or surname', () => {
      const accCb: ImportedAccount = {
        institutionId: 'commerzbank',
        institutionName: 'Commerzbank',
        accountIbans: ['DE92500400000646293100'],
        transactions: [
          // Unrelated transaction 3 days before: shares surname 'Memic' but is external
          {
            id: 'cb-biljana-aug5',
            date: '2025-08-05',
            description: 'Biljana Memic Help for my husband End-to-End-Ref.: NOTPROVIDED',
            amount: 100,
            currency: 'EUR',
            type: 'income',
            institution: 'Commerzbank',
          },
          // Real reciprocal transfer: same date, mentions N26 and Anel Memic
          {
            id: 'cb-anel-aug8',
            date: '2025-08-08',
            description: 'Anel Memic Sent from N26 End-to-End-Ref.: NOTPROVIDED',
            amount: 100,
            currency: 'EUR',
            type: 'income',
            institution: 'Commerzbank',
          },
        ],
        importedAt: '2026-09-15T10:00:00Z',
        importedFingerprints: [],
      }

      const accN26: ImportedAccount = {
        institutionId: 'n26',
        institutionName: 'N26',
        transactions: [
          {
            id: 'n26-anel-aug8',
            date: '2025-08-08',
            description: 'Anel Memic',
            amount: -100,
            currency: 'EUR',
            type: 'expense',
            institution: 'N26',
            counterpartyIban: 'DE92500400000646293100',
          },
        ],
        importedAt: '2026-09-15T10:05:00Z',
        importedFingerprints: [],
      }

      const reconciled = reconcileCrossAccountTransfers([accCb, accN26])
      const cbReconciled = reconciled.find((a) => a.institutionId === 'commerzbank')!
      const n26Reconciled = reconciled.find((a) => a.institutionId === 'n26')!

      // Real transfer should be paired with N26
      const realTransfer = cbReconciled.transactions.find((t) => t.id === 'cb-anel-aug8')!
      expect(realTransfer.isGhost).toBe(true)
      expect(realTransfer.linkedTransactionId).toBe('n26-anel-aug8')

      // Unrelated payment from Biljana should NOT be a ghost
      const unrelatedPayment = cbReconciled.transactions.find((t) => t.id === 'cb-biljana-aug5')!
      expect(unrelatedPayment.isGhost).toBeFalsy()

      const n26Tx = n26Reconciled.transactions.find((t) => t.id === 'n26-anel-aug8')!
      expect(n26Tx.isGhost).toBe(true)
      expect(n26Tx.linkedTransactionId).toBe('cb-anel-aug8')
    })

    it('reconciles transfers seamlessly across mixed formats: CSV, PDF, and Copy-Paste', () => {
      // 1. Account 1: CSV Export (e.g. Commerzbank)
      const csvContent = `Buchungstag;Wertstellung;Umsatzart;Begünstigter / Auftraggeber;Verwendungszweck;IBAN;Betrag;Währung
15.05.2024;15.05.2024;Überweisung;Anel Memic;Sent to N26;DE35100110012621828092;-250,00;EUR
18.05.2024;18.05.2024;Überweisung;Anel Memic;From Sparkasse;DE89370400440532013000;100,00;EUR`
      const csvRows = csvContent.split('\n').map((l) => splitCsvLine(l, ';'))
      const csvParsed = rowsToTransactionsWithMeta(csvRows, 'Commerzbank')
      const accCsv: ImportedAccount = {
        institutionId: 'commerzbank',
        institutionName: 'Commerzbank',
        transactions: csvParsed.transactions,
        accountIbans: ['DE92500400000646293100'],
        importedAt: '2026-05-15T10:00:00Z',
        importedFingerprints: ['csv-1'],
      }

      // 2. Account 2: PDF Statement (e.g. N26)
      const pdfText = `Kontoauszug IBAN: DE35100110012621828092
15.05.2024 15.05.2024 Anel Memic Top up from Commerzbank DE92500400000646293100 +250,00 EUR`
      const pdfTxs = parsePdfText(pdfText, 'N26')
      const pdfIbans = extractAccountIbansFromPdf(pdfText)
      const accPdf: ImportedAccount = {
        institutionId: 'n26',
        institutionName: 'N26',
        transactions: pdfTxs,
        accountIbans: pdfIbans,
        importedAt: '2026-05-15T10:05:00Z',
        importedFingerprints: ['pdf-1'],
      }

      // 3. Account 3: Copy-Paste statement (e.g. Sparkasse)
      const pasteText = `IBAN: DE89370400440532013000
18.05.2024
Anel Memic
Transfer to Commerzbank DE92500400000646293100
Überweisung
-100,00 EUR`
      const pasteTxs = parseBankStatementPaste(pasteText, 'Sparkasse')
      const pasteIbans = extractAccountIbansFromPaste(pasteText)
      const accPaste: ImportedAccount = {
        institutionId: 'sparkasse',
        institutionName: 'Sparkasse',
        transactions: pasteTxs,
        accountIbans: pasteIbans,
        importedAt: '2026-05-18T10:10:00Z',
        importedFingerprints: ['paste-1'],
      }

      const reconciled = reconcileCrossAccountTransfers([accCsv, accPdf, accPaste])

      const resCsv = reconciled.find((a) => a.institutionId === 'commerzbank')!
      const resPdf = reconciled.find((a) => a.institutionId === 'n26')!
      const resPaste = reconciled.find((a) => a.institutionId === 'sparkasse')!

      // CSV <-> PDF transfer (-250 / +250)
      const csvToN26 = resCsv.transactions.find((t) => t.amount === -250)!
      const n26FromCsv = resPdf.transactions.find((t) => t.amount === 250)!
      expect(csvToN26.isGhost).toBe(true)
      expect(n26FromCsv.isGhost).toBe(true)
      expect(csvToN26.linkedTransactionId).toBe(n26FromCsv.id)
      expect(n26FromCsv.linkedTransactionId).toBe(csvToN26.id)

      // CSV <-> Paste transfer (+100 / -100)
      const csvFromPaste = resCsv.transactions.find((t) => t.amount === 100)!
      const pasteToCsv = resPaste.transactions.find((t) => t.amount === -100)!
      expect(csvFromPaste.isGhost).toBe(true)
      expect(pasteToCsv.isGhost).toBe(true)
      expect(csvFromPaste.linkedTransactionId).toBe(pasteToCsv.id)
      expect(pasteToCsv.linkedTransactionId).toBe(csvFromPaste.id)
    })
  })
})
