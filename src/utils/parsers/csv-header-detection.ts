/**
 * Match a column header against a set of keywords.
 * Supports two strategies:
 *   1. Phrase match  — the full header equals the phrase (e.g. "umsatz in eur", "amount (eur)")
 *   2. Token match   — the header, split on non-alphanumeric chars, contains a keyword token
 *                      (prevents 'wert' matching 'wertstellung', 'umsatz' matching 'umsatzart')
 */
export function headerMatches(h: string, keywords: string[], phrases: string[] = []): boolean {
  if (phrases.some((p) => h === p || h.startsWith(p))) {
    return true
  }
  const tokens = h.split(/[^a-zäöüß0-9]+/).filter(Boolean)
  return keywords.some((k) => tokens.includes(k))
}

export interface ColumnIndices {
  dateIdx: number
  descIdx: number
  amountIdx: number
  sollIdx: number
  habenIdx: number
  accountIdx: number
  partnerIdx: number
  senderIdx: number
  ibanIdx: number
  ownIbanIdx: number
  counterpartyIbanIdx: number
  refIdx: number
}

export function detectColumnIndices(header: string[]): ColumnIndices {
  // ── Date column ──────────────────────────────────────────────────────────────
  let dateIdx = header.findIndex((h) =>
    headerMatches(h, [
      'date',
      'datum',
      'buchungstag',
      'buchungsdatum',
      'buchung',
      'valuta',
      'valutadatum',
      'wertstellung',
      'booking',
    ]),
  )

  // ── Description / Payee / Partner column ──────────────────────────────────────
  let descIdx = header.findIndex((h) =>
    headerMatches(
      h,
      // Token-level keywords (whole-word match)
      [
        'description',
        'beschreibung',
        'verwendungszweck',
        'buchungstext',
        'auftraggeber',
        'empfanger',
        'empfänger',
        'zahlungsempfanger',
        'zahlungsempfänger',
        'zahlungspflichtige', // DKB gendered: "zahlungspflichtige*r"
        'beguenstigter',
        'beguenstigte',
        'kontoinhaber',
        'payee',
        'recipient',
        'purpose',
        'partner',
        'partnername',
        'transaktionspartner',
        'title',
        'product',
      ],
      // Full-phrase overrides (e.g. slash-separated compound headers)
      [
        'auftraggeber/empfänger',
        'auftraggeber/empfanger',
        'beguenstigter/zahlungspflichtiger',
        'partner name',
        'partnername',
        'name des partners',
        'transaktionspartner',
      ],
    ),
  )

  // ── Dedicated Partner / Payee column ──────────────────────────────────────────
  const partnerIdx = header.findIndex((h) => {
    if (
      h.includes('account') ||
      h.includes('konto') ||
      h.includes('file') ||
      h.includes('datei') ||
      h.includes('pocket') ||
      h.includes('space') ||
      h.includes('subaccount') ||
      h.includes('unterkonto')
    ) {
      return false
    }
    return headerMatches(
      h,
      [
        'partner',
        'partnername',
        'transaktionspartner',
        'counterparty',
        'payee',
        'empfanger',
        'empfänger',
        'name',
      ],
      [
        'partner name',
        'partnername',
        'name des partners',
        'transaktionspartner',
        'counterparty',
        'name',
      ],
    )
  })

  // ── Dedicated Sender / Payer column ───────────────────────────────────────────
  const senderIdx = header.findIndex((h) =>
    headerMatches(
      h,
      ['sender', 'absender', 'auftraggeber', 'payer', 'zahlender'],
      ['name des senders', 'name des auftraggebers'],
    ),
  )

  // ── Dedicated Account / Space Name column ─────────────────────────────────────
  const accountIdx = header.findIndex((h) => {
    // Avoid matching account number or IBAN headers
    if (
      h.includes('number') ||
      h.includes('nummer') ||
      h.includes('iban') ||
      h.includes('auftragskonto')
    ) {
      return false
    }
    return headerMatches(
      h,
      ['space', 'spaces', 'subaccount', 'unterkonto', 'pocket'],
      [
        'account name',
        'kontoname',
        'konto name',
        'space name',
        'spacename',
        'subaccount',
        'subaccount name',
        'unterkonto',
        'pocket name',
        'pocket',
      ],
    )
  })

  // ── Account's own IBAN column (e.g. Commerzbank 'IBAN Kontoinhaber') ───────
  let ownIbanIdx = header.findIndex((h) =>
    headerMatches(
      h,
      [
        'iban kontoinhaber',
        'konto-iban',
        'konto iban',
        'kontonummer / iban',
        'eigene iban',
        'own iban',
        'account iban',
      ],
      [
        'iban kontoinhaber',
        'konto-iban',
        'konto iban',
        'kontonummer / iban',
        'eigene iban',
        'own iban',
        'account iban',
      ],
    ),
  )

  // ── Counterparty / Partner IBAN column (e.g. N26 'Partner Iban') ────────────
  let counterpartyIbanIdx = header.findIndex((h) =>
    headerMatches(
      h,
      [
        'partner iban',
        'partner-iban',
        'iban des partners',
        'gegenkonto iban',
        'gegenkonto-iban',
        'counterparty iban',
        'empfänger iban',
        'empfaenger iban',
        'auftraggeber iban',
      ],
      [
        'partner iban',
        'partner-iban',
        'iban des partners',
        'gegenkonto iban',
        'gegenkonto-iban',
        'counterparty iban',
        'empfänger iban',
        'empfaenger iban',
        'auftraggeber iban',
      ],
    ),
  )

  // ── Fallback generic IBAN column ───────────────────────────────────────────
  let ibanIdx = header.findIndex((h) => header.includes('iban') || h === 'iban')
  if (ownIbanIdx === -1 && counterpartyIbanIdx === -1 && ibanIdx !== -1) {
    const rawH = header[ibanIdx]
    if (rawH.includes('konto') || rawH.includes('inhaber') || rawH.includes('eigen')) {
      ownIbanIdx = ibanIdx
    } else {
      counterpartyIbanIdx = ibanIdx
    }
  }

  // Preserve ibanIdx for space transfer heuristics
  if (ibanIdx === -1) {
    ibanIdx = counterpartyIbanIdx !== -1 ? counterpartyIbanIdx : ownIbanIdx
  }

  // ── Reference / Purpose column ────────────────────────────────────────────────
  const refIdx = header.findIndex((h) =>
    headerMatches(
      h,
      ['verwendungszweck', 'purpose', 'referenz', 'reference', 'details'],
      ['payment reference', 'zahlungsreferenz', 'verwendungszweck', 'buchungstext'],
    ),
  )

  // ── Amount column ────────────────────────────────────────────────────────────
  let amountIdx = header.findIndex((h) =>
    headerMatches(
      h,
      // Token-level keywords
      ['betrag', 'amount', 'umsatzbetrag', 'sum', 'brutto', 'gross'],
      // Full-phrase overrides
      [
        'umsatz in eur',
        'umsatz in usd',
        'amount (eur)',
        'amount (usd)',
        'umsatz', // standalone 'Umsatz' column (Volksbank) — only matched as exact phrase
        'saldo',
        'brutto',
        'gross',
      ],
    ),
  )

  // Prefer 'Betrag', 'Brutto', or 'Gross' over 'Saldo' when both exist
  const betragIdx = header.findIndex(
    (h) =>
      h === 'betrag' ||
      h.startsWith('betrag') ||
      h === 'brutto' ||
      h.startsWith('brutto') ||
      h === 'gross' ||
      h.startsWith('gross'),
  )
  if (betragIdx !== -1 && betragIdx !== amountIdx) {
    amountIdx = betragIdx
  }

  // ── Soll / Haben split columns (Deutsche Bank and some older formats) ────────
  const sollIdx = header.findIndex((h) => h === 'soll')
  const habenIdx = header.findIndex((h) => h === 'haben')

  // Fallbacks
  if (dateIdx === -1) {
    dateIdx = 0
  }
  if (descIdx === -1) {
    descIdx = Math.min(1, header.length - 1)
  }
  if (amountIdx === -1 && sollIdx === -1 && habenIdx === -1) {
    amountIdx = Math.min(header.length - 1, 2)
  }

  return {
    dateIdx,
    descIdx,
    amountIdx,
    sollIdx,
    habenIdx,
    accountIdx,
    partnerIdx,
    senderIdx,
    ibanIdx,
    ownIbanIdx,
    counterpartyIbanIdx,
    refIdx,
  }
}
