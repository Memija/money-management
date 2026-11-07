/**
 * Match a column header against a set of keywords.
 * Supports two strategies:
 *   1. Phrase match  — the full header equals or starts with the phrase (e.g. "umsatz in eur")
 *   2. Token match   — the header, split on non-alphanumeric chars, contains a keyword token
 */
export function headerMatches(h: string, keywords: string[], phrases: string[] = []): boolean {
  if (phrases.some((p) => h === p || h.startsWith(`${p} `) || h.startsWith(`${p}(`))) {
    return true
  }
  const tokens = h.split(/[^a-zäöüßąćęłńóśźżčćđšž0-9]+/).filter(Boolean)
  return keywords.some((k) => tokens.includes(k))
}

export interface ColumnIndices {
  dateIdx: number
  fallbackDateIdx?: number
  descIdx: number
  amountIdx: number
  sollIdx: number
  habenIdx: number
  signIndicatorIdx: number
  currencyIdx: number
  accountIdx: number
  partnerIdx: number
  senderIdx: number
  ibanIdx: number
  ownIbanIdx: number
  counterpartyIbanIdx: number
  refIdx: number
}

const DATE_KEYWORDS = [
  'date',
  'datum',
  'buchungstag',
  'buchungsdatum',
  'buchung',
  'valuta',
  'valutadatum',
  'wertstellung',
  'booking',
  'belegdatum',
  'umsatztag',
  'data',
  'tanggal',
]
const DATE_PHRASES = [
  'transaction date',
  'booking date',
  'value date',
  'data transakcji',
  'datum knjiženja',
]

const DESC_KEYWORDS = [
  'description',
  'beschreibung',
  'verwendungszweck',
  'buchungstext',
  'auftraggeber',
  'empfanger',
  'empfänger',
  'zahlungsempfanger',
  'zahlungsempfänger',
  'zahlungspflichtige',
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
  'titel',
  'bezeichnung',
  'buchungsinformationen',
  'product',
  'tytuł',
  'tytul',
  'opis',
  'svrha',
  'keterangan',
  'deskripsi',
  'memo',
  'narrative',
]
const DESC_PHRASES = [
  'auftraggeber/empfänger',
  'auftraggeber/empfanger',
  'beguenstigter/zahlungspflichtiger',
  'partner name',
  'partnername',
  'name des partners',
  'transaktionspartner',
]

const PARTNER_EXCLUDED_SUBSTRINGS = [
  'account',
  'konto',
  'iban',
  'bic',
  'file',
  'datei',
  'pocket',
  'space',
  'subaccount',
  'unterkonto',
]
const PARTNER_KEYWORDS = [
  'partner',
  'partnername',
  'transaktionspartner',
  'counterparty',
  'payee',
  'empfanger',
  'empfänger',
  'zahlungsempfanger',
  'zahlungsempfänger',
  'beguenstigter',
  'begünstigter',
  'zahlungsbeteiligter',
  'händler',
  'name',
  'kontrahent',
  'odbiorca',
  'primalac',
  'merchant',
  'penerima',
]
const PARTNER_PHRASES = [
  'partner name',
  'partnername',
  'name des partners',
  'transaktionspartner',
  'counterparty',
  'beguenstigter/zahlungspflichtiger',
  'begünstigter / auftraggeber',
  'auftraggeber/empfänger',
  'auftraggeber/empfanger',
  'auftraggeber / empfänger',
  'sender / empfänger',
  'empfänger / absender',
  'empfänger/zahlungspflichtiger',
  'name zahlungsbeteiligter',
  'zahlungsempfänger*in',
  'empfänger 1',
  'händler / partner',
  'wertpapier / partner',
  'name',
]

const OWN_IBAN_KEYWORDS = [
  'auftragskonto',
  'iban kontoinhaber',
  'konto-iban',
  'konto iban',
  'eigene iban',
  'own iban',
  'account iban',
]
const OWN_IBAN_PHRASES = [...OWN_IBAN_KEYWORDS, 'iban auftragskonto', 'kontonummer']

const COUNTERPARTY_IBAN_KEYWORDS = [
  'partner iban',
  'partner-iban',
  'iban des partners',
  'gegenkonto iban',
  'gegenkonto-iban',
  'counterparty iban',
  'empfänger iban',
  'empfaenger iban',
  'auftraggeber iban',
]
const COUNTERPARTY_IBAN_PHRASES = [
  ...COUNTERPARTY_IBAN_KEYWORDS,
  'iban gegenkonto',
  'iban zahlungsbeteiligter',
  'kontonummer/iban',
  'iban / kontonummer',
  'zahlungsempfänger iban',
]

export function detectColumnIndices(header: string[]): ColumnIndices {
  let dateIdx = header.findIndex((h) => headerMatches(h, DATE_KEYWORDS, DATE_PHRASES))
  const fallbackDateIdx = header.findIndex(
    (h, idx) => idx !== dateIdx && headerMatches(h, DATE_KEYWORDS, DATE_PHRASES),
  )
  let descIdx = header.findIndex((h) => headerMatches(h, DESC_KEYWORDS, DESC_PHRASES))

  const partnerIdx = header.findIndex(
    (h) =>
      !PARTNER_EXCLUDED_SUBSTRINGS.some((sub) => h.includes(sub)) &&
      headerMatches(h, PARTNER_KEYWORDS, PARTNER_PHRASES),
  )

  const senderIdx = header.findIndex((h) =>
    headerMatches(
      h,
      [
        'sender',
        'absender',
        'auftraggeber',
        'payer',
        'zahlender',
        'zahlungspflichtige',
        'nadawca',
        'platilac',
      ],
      ['name des senders', 'name des auftraggebers', 'zahlungspflichtige*r'],
    ),
  )

  const accountIdx = header.findIndex((h) => {
    if (['number', 'nummer', 'iban', 'auftragskonto'].some((s) => h.includes(s))) {
      return false
    }
    return headerMatches(
      h,
      ['space', 'spaces', 'subaccount', 'unterkonto', 'pocket'],
      [
        'account name',
        'kontoname',
        'konto name',
        'konto / pocket',
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

  let ownIbanIdx = header.findIndex((h) => headerMatches(h, OWN_IBAN_KEYWORDS, OWN_IBAN_PHRASES))
  let counterpartyIbanIdx = header.findIndex((h) =>
    headerMatches(h, COUNTERPARTY_IBAN_KEYWORDS, COUNTERPARTY_IBAN_PHRASES),
  )

  let ibanIdx = header.findIndex((h) => h.includes('iban') || h === 'iban')
  if (ownIbanIdx === -1 && counterpartyIbanIdx === -1 && ibanIdx !== -1) {
    const rawH = header[ibanIdx]
    if (rawH.includes('kont') || rawH.includes('inhaber') || rawH.includes('eigen')) {
      ownIbanIdx = ibanIdx
    } else {
      counterpartyIbanIdx = ibanIdx
    }
  }
  if (ibanIdx === -1) {
    ibanIdx = counterpartyIbanIdx !== -1 ? counterpartyIbanIdx : ownIbanIdx
  }

  const refIdx = header.findIndex((h) =>
    headerMatches(
      h,
      [
        'verwendungszweck',
        'purpose',
        'referenz',
        'reference',
        'details',
        'buchungsinformationen',
        'tytuł',
        'tytul',
        'opis',
        'svrha',
        'keterangan',
        'memo',
      ],
      [
        'payment reference',
        'zahlungsreferenz',
        'verwendungszweck',
        'buchungstext',
        'buchungsinformationen',
      ],
    ),
  )

  let amountIdx = header.findIndex((h) =>
    headerMatches(
      h,
      ['betrag', 'amount', 'umsatzbetrag', 'sum', 'brutto', 'gross', 'kwota', 'iznos', 'jumlah'],
      [
        'umsatz in eur',
        'umsatz in usd',
        'amount (eur)',
        'amount (usd)',
        'umsatz',
        'saldo',
        'brutto',
        'gross',
      ],
    ),
  )

  const preferredAmountPrefixes = ['betrag', 'brutto', 'gross', 'kwota', 'iznos', 'jumlah']
  const betragIdx = header.findIndex((h) =>
    preferredAmountPrefixes.some((p) => h === p || h.startsWith(p)),
  )
  if (betragIdx !== -1 && betragIdx !== amountIdx) {
    amountIdx = betragIdx
  }

  const sollIdx = header.findIndex((h) =>
    headerMatches(
      h,
      ['soll', 'belastung', 'debit', 'ausgang', 'obciążenia', 'obciazenia', 'duguje'],
      ['soll (eur)', 'belastung (eur)', 'debit amount'],
    ),
  )
  const habenIdx = header.findIndex((h) =>
    headerMatches(
      h,
      ['haben', 'gutschrift', 'credit', 'eingang', 'uznania', 'potražuje', 'potrazuje'],
      ['haben (eur)', 'gutschrift (eur)', 'credit amount'],
    ),
  )

  const signIndicatorIdx = header.findIndex((h) =>
    headerMatches(
      h,
      ['umsatzkennzeichen', 'kennzeichen', 'indikator', 'indicator'],
      [
        'soll/haben',
        'soll / haben',
        's/h',
        'd/c',
        'dr/cr',
        'credit/debit',
        'debit/credit',
        'soll/haben-kennzeichen',
      ],
    ),
  )

  const currencyIdx = header.findIndex(
    (h) =>
      !['original', 'datum', 'date'].some((s) => h.includes(s)) &&
      headerMatches(
        h,
        ['währung', 'waehrung', 'currency', 'whrg', 'wkz', 'waluta'],
        ['währung', 'currency', 'mata uang'],
      ),
  )

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
    fallbackDateIdx,
    descIdx,
    amountIdx,
    sollIdx,
    habenIdx,
    signIndicatorIdx,
    currencyIdx,
    accountIdx,
    partnerIdx,
    senderIdx,
    ibanIdx,
    ownIbanIdx,
    counterpartyIbanIdx,
    refIdx,
  }
}
