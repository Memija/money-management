import type { Transaction } from '../../types'

/**
 * Checks whether a transaction is an informative entry with a value of 0 euro.
 * Informative transactions have no impact on the balance and are never categorized.
 */
export function isInformativeTransaction(tx?: { amount?: number } | null): boolean {
  if (!tx || typeof tx.amount !== 'number') return false
  return tx.amount === 0
}

const WORD_REPAIR_RULES: Array<[RegExp, string]> = [
  // German line-break word splits
  [
    /(?:e|ei|ein|eink|einkau)[-\s]+(?:in[-\s]*kauf|n[-\s]*kauf|k[-\s]*auf|nkauf|kauf|auf|f)/iu,
    'Einkauf',
  ],
  [
    /(?:e|ei|ein|eink|einkäu|einkaeu)[-\s]+(?:in[-\s]*käufe|n[-\s]*käufe|k[-\s]*äufe|inkäufe|nkäufe|käufe|äufe|fe|in[-\s]*kaeufe|n[-\s]*kaeufe|k[-\s]*aeufe|inkaeufe|nkaeufe|kaeufe|aeufe)/iu,
    'Einkäufe',
  ],
  [/(?:waren|warene|warenei|warenein)[-\s]+(?:einkauf|inkauf|nkauf|kauf)/iu, 'Wareneinkauf'],
  [/(?:karten|kartene|kartenei|kartenein)[-\s]+(?:einkauf|inkauf|nkauf|kauf)/iu, 'Karteneinkauf'],
  [
    /(?:bar)[-\s]+(?:geld)[-\s]+(?:auszahlung)|(?:bar|bargeld)[-\s]+(?:geldauszahlung|auszahlung)/iu,
    'Bargeldauszahlung',
  ],
  [
    /(?:bar)[-\s]+(?:geld)[-\s]+(?:abhebung)|(?:bar|bargeld)[-\s]+(?:geldabhebung|abhebung)/iu,
    'Bargeldabhebung',
  ],
  [/(?:bar)[-\s]+(?:geld)/iu, 'Bargeld'],
  [/(?:aus)[-\s]+(?:zahlung)/iu, 'Auszahlung'],
  [/(?:ein)[-\s]+(?:zahlung)/iu, 'Einzahlung'],
  [
    /(?:last)[-\s]+(?:schrift)[-\s]+(?:einzug)|(?:last|lastschrift)[-\s]+(?:schrifteinzug|einzug)/iu,
    'Lastschrifteinzug',
  ],
  [/(?:kasino|kasinoab)[-\s]+(?:abrechnung|rechnung)/iu, 'Kasinoabrechnung'],
  [/(?:ka|kas|kasi)[-\s]+(?:sino|ino|no)/iu, 'Kasino'],
  [/(?:ca|cas|casi)[-\s]+(?:sino|ino|no)/iu, 'Casino'],
  [/(?:kan|kanti)[-\s]+(?:tine|ne)/iu, 'Kantine'],
  [/(?:kantinen|kantinenab)[-\s]+(?:abrechnung|rechnung)/iu, 'Kantinenabrechnung'],
  [/(?:ca|cafe|cafete|cafeter)[-\s]+(?:feteria|teria|ria|ia)/iu, 'Cafeteria'],
  [/(?:son|sonsti|sonstig)[-\s]+(?:stiges|ges|es)/iu, 'Sonstiges'],
  [/(?:ab|abrech)[-\s]+(?:rechnung|nung)/iu, 'Abrechnung'],
  [/(?:last)[-\s]+(?:schrift)/iu, 'Lastschrift'],
  [/(?:über|uber)[-\s]+(?:weisung)/iu, 'Überweisung'],
  [/(?:gut)[-\s]+(?:schrift)/iu, 'Gutschrift'],
  [/(?:dauer)[-\s]+(?:auftrag)/iu, 'Dauerauftrag'],
  [/(?:karten)[-\s]+(?:zahlung)/iu, 'Kartenzahlung'],
  [/(?:geld)[-\s]+(?:automat)/iu, 'Geldautomat'],
  [/(?:neben)[-\s]+(?:kosten)/iu, 'Nebenkosten'],
  [/(?:wohnungs?)[-\s]+(?:miete)/iu, 'Wohnungsmiete'],
  [/(?:kalt)[-\s]+(?:miete)/iu, 'Kaltmiete'],
  [/(?:warm)[-\s]+(?:miete)/iu, 'Warmmiete'],
  [/(?:kredit)[-\s]+(?:rate)/iu, 'Kreditrate'],
  [/(?:tilgungs?)[-\s]+(?:rate)/iu, 'Tilgungsrate'],
  [/(?:darlehens?)[-\s]+(?:rate)/iu, 'Darlehensrate'],
  [/(?:steuer)[-\s]+(?:belastung)/iu, 'Steuerbelastung'],
  [/(?:vorab)[-\s]+(?:pauschale)/iu, 'Vorabpauschale'],
  [/(?:steuer)[-\s]+(?:abzug)/iu, 'Steuerabzug'],
  [/(?:steuer)[-\s]+(?:abrechnung)/iu, 'Steuerabrechnung'],
  [/(?:kapital|kapitaler)[-\s]+(?:ertragsteuer|tragsteuer|ertragssteuer|tragssteuer)/iu, 'Kapitalertragsteuer'],
  [/(?:solidaritäts|solidaritaets|soli)[-\s]+(?:zuschlag)/iu, 'Solidaritätszuschlag'],
  [/(?:kirchen)[-\s]+(?:steuer)/iu, 'Kirchensteuer'],
  [/(?:abgeltungs?)[-\s]+(?:steuer)/iu, 'Abgeltungsteuer'],
  [/(?:einkommen)[-\s]+(?:steuer)/iu, 'Einkommensteuer'],
  [/(?:co|coin)[-\s]+(?:inbase|base)/iu, 'Coinbase'],
  [/(?:bi|bin)[-\s]+(?:nance|ance)/iu, 'Binance'],
  [/(?:kra)[-\s]+(?:ken)/iu, 'Kraken'],
  [/(?:bit)[-\s]+(?:panda)/iu, 'Bitpanda'],
  [/(?:identi|identifiz)[-\s]+(?:fizierung|ierung)/iu, 'Identifizierung'],
  [/(?:veri|verifi|verifica)[-\s]+(?:fication|cation|tion)/iu, 'Verification'],
  [/(?:rechnungs|rechnung)[-\s]+(?:abschluss|schluss)/iu, 'Rechnungsabschluss'],
  [/(?:soll)[-\s]+(?:zinsen|zins)/iu, 'Sollzinsen'],
  [/(?:haben)[-\s]+(?:zinsen|zins)/iu, 'Habenzinsen'],
  [/(?:dispo)[-\s]+(?:zinsen|zins)/iu, 'Dispozinsen'],
  [/(?:überziehungs|uberziehungs)[-\s]+(?:zinsen|zins)/iu, 'Überziehungszinsen'],
  [/(?:konto)[-\s]+(?:führung|fuehrung)/iu, 'Kontoführung'],
  [/(?:kontoführungs?|kontofuehrungs?)[-\s]+(?:gebühr|gebuehr)/iu, 'Kontoführungsgebühr'],
  [/(?:bank)[-\s]+(?:gebühren|gebuehren|gebühr|gebuehr)/iu, 'Bankgebühren'],
  [
    /(?:service|serviceg|servicege|serviceges)[-\s]+(?:gesellschaft|esellschaft|sellschaft|ellschaft)/iu,
    'Servicegesellschaft',
  ],
  [/(?:verkehr|verkehrs|verkehrsve|verkehrsver)[-\s]+(?:verbund|erbund|rbund|bund)/iu, 'Verkehrsverbund'],
  // English line-break word splits
  [/(?:pu|pur|purch)[-\s]+(?:rchase|chase|ase)/iu, 'Purchase'],
  [/(?:with)[-\s]+(?:draw)[-\s]+(?:al)|(?:with|withdr|withdra)[-\s]+(?:drawal|awal|wal)/iu, 'Withdrawal'],
  [/(?:pay)[-\s]+(?:roll)/iu, 'Payroll'],
  [/(?:grocer)[-\s]+(?:ies)|(?:groce)[-\s]+(?:ries)/iu, 'Groceries'],
  [/(?:trans)[-\s]+(?:fer)/iu, 'Transfer'],
  // Polish line-break word splits
  [/(?:za|zak)[-\s]+(?:kupy|upy)/iu, 'Zakupy'],
  [/(?:za|zak)[-\s]+(?:kup|up)/iu, 'Zakup'],
  [/(?:wy|wyp)[-\s]+(?:płata|łata)/iu, 'Wypłata'],
  [/(?:wy|wyp)[-\s]+(?:plata|lata)/iu, 'Wyplata'],
  [/(?:płat|plat)[-\s]+(?:ność|nosc)/iu, 'Płatność'],
  [/(?:banko)[-\s]+(?:mat)/iu, 'Bankomat'],
  [/(?:prze)[-\s]+(?:lew)/iu, 'Przelew'],
  // Bosnian / Croatian / Serbian line-break word splits
  [/(?:ku|kupo|kupov)[-\s]+(?:povina|vina|ina)/iu, 'Kupovina'],
  [/(?:ку|купо|купов)[-\s]+(?:повина|вина|ина)/iu, 'Куповина'],
  [/(?:goto|gotov)[-\s]+(?:vina|ina)/iu, 'Gotovina'],
  [/(?:гото|готов)[-\s]+(?:вина|ина)/iu, 'Готовина'],
  [/(?:банко)[-\s]+(?:мат)/iu, 'Банкомат'],
  // Indonesian line-break word splits
  [/(?:pem|pemb)[-\s]+(?:belian|elian)/iu, 'Pembelian'],
  [/(?:be|bel)[-\s]+(?:lanja|anja)/iu, 'Belanja'],
  [/(?:trans)[-\s]+(?:aksi)/iu, 'Transaksi'],
]

const COMPILED_WORD_REPAIR_RULES: Array<[RegExp, string]> = WORD_REPAIR_RULES.map(([regex, rep]) => [
  new RegExp(`(?<![\\p{L}\\p{N}])(?:${regex.source})(?![\\p{L}\\p{N}])`, 'giu'),
  rep,
])

/**
 * Repairs common banking words split by line breaks, column wrapping, or OCR noise
 * (e.g. "Ei nkauf" -> "Einkauf", "Pur chase" -> "Purchase", "Za kup" -> "Zakup").
 */
export function repairBrokenWords(text: string): string {
  if (!text || typeof text !== 'string') return ''

  let repaired = text
  for (const [pattern, replacement] of COMPILED_WORD_REPAIR_RULES) {
    repaired = repaired.replace(pattern, replacement)
  }
  return repaired
}

/**
 * Normalizes a transaction description by stripping dates, long numbers,
 * special characters, and excess whitespace.
 */
export const normalizeDescription = (desc: string): string => {
  return (
    repairBrokenWords(desc)
      .toLowerCase()
      // Remove dates like DD/MM/YYYY, DD.MM.YY, DD-MM
      .replace(/\b\d{1,2}[-./]\d{1,2}([-./]\d{2,4})?\b/g, '')
      // Remove long numeric strings (e.g., transaction IDs, reference numbers)
      .replace(/\b\d{4,}\b/g, '')
      // Remove special characters, keep alphanumeric and spaces
      .replace(/[^\w\s]/g, ' ')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
  )
}

/**
 * Strips SEPA payment references, bank noise prefixes, transaction IDs,
 * timestamps, and dates from a transaction description to extract the
 * clean core payee/merchant/purpose description.
 */
export function extractCleanDescription(desc: string): string {
  if (!desc || typeof desc !== 'string') return ''

  let cleaned = repairBrokenWords(desc.trim())

  // 1. Remove common German / European banking prefixes
  cleaned = cleaned.replace(
    /^(?:Auftraggeber|Empf[aä]nger|Zahlungsempf[aä]nger|Verwendungszweck|Buchungstext|Umsatztext)\s*:\s*/i,
    '',
  )

  // 2. Strip SEPA reference metadata tags and everything following them when appended at the end
  // Handles: End-to-End-Ref.: ..., End to End Ref: ..., EREF+..., KREF+..., MREF+..., CRED+...,
  // DEBT+..., SVWZ+..., Mandatsref: ..., Referenz: ..., Reference: ..., Ref. Nr: ..., IBAN: ..., BIC: ...
  cleaned = cleaned.replace(
    /(?:\b(?:End[-\s]?to[-\s]?(?:End[-\s]?(?:Ref(?:\.|erenz|-Id)?)?|Ref(?:\.|erenz|-Id)?)?|EREF|KREF|MREF|CRED|DEBT|SVWZ|Mandatsref(?:\.|erenz)?|Referenz|Reference|Ref(?:\.|\s*Nr\.?)?|Gl[aä]ubiger[-\s]?ID|SEPA[-\s]?(?:BASIS|FIRMEN)?[-\s]?LASTSCHRIFT)\s*[:+]?|\b(?:IBAN|BIC)\s*:\s*[A-Z0-9]+).*/i,
    '',
  )

  // 3. Remove date formats (DD.MM.YYYY, DD/MM/YYYY, DD-MM-YY, etc.) and timestamps
  cleaned = cleaned.replace(
    /\b(?:am\s+)?\d{1,2}[-./]\d{1,2}(?:[-./]\d{2,4})?(?:\s+(?:um\s+)?\d{1,2}:\d{2}(?::\d{2})?)?\b/gi,
    ' ',
  )

  // 4. Remove standalone long numeric or alphanumeric reference codes (8+ chars with digits, e.g. terminal/auth IDs)
  cleaned = cleaned.replace(/\b[A-Za-z0-9]*\d[A-Za-z0-9]{7,}\b/g, ' ')

  // 5. Remove standalone numbers with 4+ digits (e.g. postal codes, terminal codes, internal IDs)
  cleaned = cleaned.replace(/\b\d{4,}\b/g, ' ')

  // 6. Clean up extraneous punctuation while preserving periods, ampersands, and hyphens in brand names
  cleaned = cleaned
    .replace(/[^\w\s\u00C0-\u024F\u0400-\u04FF.&-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.:;/-]+|[\s,.:;/-]+$/g, '')
    .trim()

  return cleaned
}

/**
 * Extracts a concise, reusable merchant keyword from a transaction description
 * by stripping banking prefixes, corporate legal forms, branch/terminal codes, and noise.
 * Useful for learning smart category rules that match future transactions from the same merchant.
 */
export function extractMerchantKeyword(desc: string): string {
  if (!desc || typeof desc !== 'string') return ''

  // Start with clean description
  let merchant = extractCleanDescription(desc)
  if (!merchant) return ''

  // 1. Remove corporate legal entity suffixes
  merchant = merchant.replace(
    /\b(?:gmbh(?:\s*&\s*co\.?\s*kg)?|ag|se|ltd\.?|inc\.?|llc|kgaa|ug|e\.?\s*k\.?|co\.?\s*kg|sp\.?\s*z\s*o\.?\s*o\.?|d\.?o\.?o\.?|bv|s\.?a\.?r\.?l\.?)\b/gi,
    ' ',
  )

  // 2. Remove branch / store suffixes and terminal numbers (e.g. 'Filiale 1234', 'Store #5')
  merchant = merchant.replace(/\b(?:filiale|fil\.|store|branch|pos|terminal)\b.*$/i, ' ')

  // 3. Remove trailing city names commonly appended in European card terminals
  merchant = merchant.replace(
    /\s+(?:berlin|m[uü]nchen|hamburg|k[oö]ln|frankfurt|stuttgart|d[uü]sseldorf|dortmund|essen|leipzig|bremen|dresden|hannover|n[uü]rnberg|wien|z[uü]rich|warszawa|krak[oó]w|sarajevo|beograd|zagreb|london|paris)\b.*$/i,
    ' ',
  )

  // 4. Clean up spaces and punctuation
  merchant = merchant
    .replace(/[^\w\s\u00C0-\u024F\u0400-\u04FF.&-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.:;/-]+|[\s,.:;/-]+$/g, '')
    .trim()

  return merchant.length >= 2 ? merchant : extractCleanDescription(desc)
}

/**
 * Determines whether two transaction descriptions are related
 * (e.g., same core merchant or recurring charge with different SEPA/card reference IDs).
 */
export function isRelatedTransaction(descA: string, descB: string): boolean {
  if (!descA || !descB) return false

  const cleanA = extractCleanDescription(descA).toLowerCase()
  const cleanB = extractCleanDescription(descB).toLowerCase()

  // 1. Exact match on clean description (if length >= 3)
  if (cleanA.length >= 3 && cleanA === cleanB) return true

  // 2. Normalized description fallback
  const normA = normalizeDescription(descA)
  const normB = normalizeDescription(descB)
  if (normA.length >= 3 && normA === normB) return true

  // 3. Prefix matching: if one clean string starts with the other on a word boundary
  // Require at least 8 characters for the shorter string to avoid false positives (e.g. "Bar", "Apple")
  if (cleanA.length >= 8 && cleanB.length >= 8) {
    const shorter = cleanA.length <= cleanB.length ? cleanA : cleanB
    const longer = cleanA.length <= cleanB.length ? cleanB : cleanA
    if (longer.startsWith(shorter)) {
      const nextChar = longer.charAt(shorter.length)
      if (nextChar === '' || nextChar === ' ' || nextChar === '-' || nextChar === '/') {
        return true
      }
    }
  }

  return false
}

/**
 * Finds all non-ghost transactions in a collection that are related to the target transaction.
 * If targetCategory is specified, filters only candidates whose category is different from targetCategory.
 */
export function findRelatedTransactions(
  targetTx: Transaction,
  allTransactions: Transaction[],
  targetCategory?: string,
): Transaction[] {
  if (!targetTx || !allTransactions || allTransactions.length === 0 || isInformativeTransaction(targetTx)) return []

  const seenIds = new Set<string>()
  const results: Transaction[] = []

  for (const candidate of allTransactions) {
    if (!candidate || candidate.id === targetTx.id || candidate.isGhost || isInformativeTransaction(candidate)) {
      continue
    }

    if (seenIds.has(candidate.id)) {
      continue
    }

    // If targetCategory is specified, only include transactions that don't already have that category
    if (targetCategory !== undefined && candidate.category === targetCategory) {
      continue
    }

    if (isRelatedTransaction(targetTx.description, candidate.description)) {
      seenIds.add(candidate.id)
      results.push(candidate)
    }
  }

  return results
}
