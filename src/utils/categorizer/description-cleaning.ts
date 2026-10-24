import { memoizeStringFn } from '../bounded-cache'
import { registerCleaningHelpers } from './merchant-extraction'
import { repairBrokenWords } from './word-repair'

export * from './word-repair'
export * from './merchant-extraction'

/**
 * Checks whether a transaction is an informative entry with a value of 0 euro.
 * Informative transactions have no impact on the balance and are never categorized.
 */
export function isInformativeTransaction(tx?: { amount?: number } | null): boolean {
  if (!tx || typeof tx.amount !== 'number') {
    return false
  }
  return tx.amount === 0
}

/**
 * Non-retail contexts for the personal name "Otto" (e.g. "Heinz Otto GbR", "Miete/Nebenkosten", "Kaution")
 * to prevent rental, tenancy, and personal landlord transactions from misclassifying as the online retailer OTTO.
 */
export const NON_RETAIL_OTTO_REGEX =
  /(?:\b(?:heinz|klaus|hans|karl|frank|jan|michael|peter|wolfgang|johann)\s+otto\b|\botto\s+(?:christoph|barth|schmidt|m[uü]ller|becker|meier|meyer|schulz|wagner|fischer)\b|\b(?:gbr|miete|nebenkosten|kautionsabrechnung|kaution|hausgeld|wohnung|vermiet(?:er|ung)?)\b)/i

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

function computeCleanDescription(desc: string): string {
  let cleaned = repairBrokenWords(desc.trim())

  // 1. Remove common German / European banking prefixes
  cleaned = cleaned.replace(
    /^(?:Auftraggeber|Empf[aä]nger|Zahlungsempf[aä]nger|Verwendungszweck|Buchungstext|Umsatztext)\s*:\s*/i,
    '',
  )

  // 2. Strip SEPA reference metadata tags, remittance instructions, and everything following them when appended at the end
  cleaned = cleaned.replace(
    /(?:\b(?:End[-\s]?to[-\s]?(?:End[-\s]?(?:Ref(?:\.|erenz|-Id)?)?|Ref(?:\.|erenz|-Id)?)?|EREF|KREF|MREF|CRED|DEBT|SVWZ|KRED\b|KREDIT(?:RATE)?\b|Mandatsref(?:\.|erenz)?|Referenz|Reference|Ref(?:\.|\s*Nr\.?)?|Gl[aä]ubiger[-\s]?ID|SEPA[-\s]?(?:BASIS|FIRMEN)?[-\s]?LASTSCHRIFT|(?:von\s+)?(?:Karte|Card)[-\s.]?(?:Nr(?:\.|erenz)?|nummer)?|Card[-\s]?ID|(?:Kd|Kunden|Pers|Personen|Personal)[-\s.]?(?:Nr(?:\.|erenz)?|nummer)?|(?:Rg|Rechnungs?)[-\s.]?(?:Nr(?:\.|erenz)?|nummer)?|Vertrags[-\s]?(?:Nr(?:\.|erenz)?|nummer)|Z[aä]hler[-\s]?(?:Nr(?:\.|erenz)?|nummer)|Akten[-\s]?(?:zeichen|nr(?:\.|erenz)?|nummer)|\bAz(?:\.|\s*Nr\.?)?\b)\s*[:+.-]?|\b(?:IBAN|BIC)\s*:\s*[A-Z0-9]+|\bBitte\s+(?:geben\s+Sie\s+)?(?:bei\s+)?(?:der\s+)?(?:Bezahlung|Zahlung|Überweisung|Ueberweisung|Zahlungsverkehr|Verwendungszweck)\b).*/i,
    '',
  )

  // 2b. Strip truncated End-to-End-Ref tags
  cleaned = cleaned.replace(/\bEnd-t(?:o(?:-End)?)?.*$/i, ' ')

  // 2c. Strip trailing truncated purchase phrases
  cleaned = cleaned.replace(
    /(?:[,.]\s*(?:(?:I\s*hr|Ihr)\s*(?:E(?:in)?[- ]?kauf(?:\s+bei)?|E(?:in)?k(?:auf|au|a|f)?(?:\s+bei)?|Ein(?:\s+bei)?|E(?:in)?k?|Ei?|be?i?)?|Ih?r?\b)|\s+Ihr\s+E(?:in)?kauf(?:\s+bei)?).*$/i,
    ' ',
  )

  // 2c. Remove German Girocard / POS terminal location and station prefixes
  cleaned = cleaned.replace(/\/\/[A-Za-z\s.-]+\/[A-Za-z]{2}\b/gi, ' ')
  cleaned = cleaned.replace(/\b[A-Z]:\d+\b/gi, ' ')

  // 2d. Separate dot-attached long reference numbers or tax IDs
  cleaned = cleaned.replace(/\b([A-Za-z]+)\.(\d{5,})\b/g, '$1. $2')

  // 2e. Expand tax refund abbreviation "ERSTATT." to "Erstattung"
  cleaned = cleaned.replace(/\bERSTATT\b\.?/gi, 'Erstattung')

  // 3. Remove date formats and timestamps
  cleaned = cleaned.replace(/\b\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2})?)?\b/gi, ' ')
  cleaned = cleaned.replace(
    /\b(?:am\s+)?\d{1,2}[-./]\d{1,2}(?:[-./]\d{2,4})?(?:\s+(?:um\s+)?\d{1,2}:\d{2}(?::\d{2})?)?\b/gi,
    ' ',
  )

  // 4. Remove file/case reference numbers and billing/invoice codes
  cleaned = cleaned.replace(/\b(?:[A-Za-z]{2,5}-\d{4,}|\d{3,}[/-]\d{2,})\b/gi, ' ')

  // 5. Remove order and invoice references
  cleaned = cleaned.replace(
    /\b(?:Order|Bestellung|Auftrag|Rechnung|Invoice|Rg\.?)\s*(?:[:#.-]?\s*\d[A-Za-z0-9_-]*)?\b/gi,
    ' ',
  )

  // 6. Remove terminal transaction codes and payment method noise
  cleaned = cleaned.replace(
    /\b(?:RG|KD|VK)\s*[:.]?\s*\d+(?:\s*[/:]\s*(?:RG|KD|VK)\s*[:.]?\s*\d+)?\b/gi,
    ' ',
  )
  cleaned = cleaned.replace(
    /\bKarte\s+Nr\.?\s*(?:\d{4}|\d{2,4}[X\d\s]*)\s*(?:Kartenzahlung)?\s*(?:Virtual\s*(?:Debit(?:\s*C(?:ard)?)?|Debi|DB|Car|Card|C)?|Virtu\b).*$/gi,
    ' ',
  )
  cleaned = cleaned.replace(
    /\bKarte\s+Nr\.?\s*(?:\d{4}|\d{2,4}[X\d\s]*)\s*(?:Kartenzahlung)?(?:\s*Virtual\s*(?:Debit(?:\s*C(?:ard)?)?|Debi|DB|Car|Card|C)?|\s*Virtu\b)?(?:\s*PH\s*\d+\s+[A-Za-z]+\s+[A-Za-z]+)?(?:\s*\d+)?\b/gi,
    ' ',
  )
  cleaned = cleaned.replace(
    /\b(?:Virtual\s*(?:Debit(?:\s*C(?:ard)?)?|Debi|DB|Car|Card|C)?|Virtu)\b/gi,
    ' ',
  )
  cleaned = cleaned.replace(/\bGIR\s+\d+(?:\/\/[A-Za-z0-9]+)?\b/gi, ' ')
  cleaned = cleaned.replace(/\bFil\.?\s*\d+\b/gi, ' ')
  cleaned = cleaned.replace(/\bKFN\s+\d+\s+VJ\s+\d+\b/gi, ' ')
  cleaned = cleaned.replace(/\b(?:ELV\d*|ME\d+|PP\.[0-9\s]*\.?PP)\b/gi, ' ')
  cleaned = cleaned.replace(
    /\b(?:Kartenzahlung|Kartenabrechnung|Karteneinsatz|KARTENZAHL\.?)\b/gi,
    ' ',
  )
  cleaned = cleaned.replace(/\b(?:NYA|NNT)\*\s*/gi, ' ')
  cleaned = cleaned.replace(/\bsagt\s+danke\b/gi, ' ')

  // 5. Remove standalone IBANs and SWIFT BICs
  cleaned = cleaned.replace(
    /\b[A-Za-z]{2}\d{2}(?:\s*[A-Za-z0-9]{4}){2,7}(?:\s*[A-Za-z0-9]{1,4})?\b(?:\s+\d{1,4}\b)*/g,
    ' ',
  )
  cleaned = cleaned.replace(/\b[A-Za-z]{6}[A-Za-z0-9]{2}(?:[A-Za-z0-9]{3})?\b/gi, (match) => {
    return /XXX$/i.test(match) || /\d/.test(match) ? ' ' : match
  })

  // 6. Remove standalone long numeric or alphanumeric reference codes
  cleaned = cleaned.replace(/\b[A-Za-z0-9]*\d[A-Za-z0-9]{7,}\b/g, ' ')

  // 7. Remove standalone numbers with 4+ digits
  cleaned = cleaned.replace(/\b(?!(?:19|20)\d{2}\b)\d{4,}\b/g, ' ')

  // 7. Clean up extraneous punctuation
  cleaned = cleaned
    .replace(/[^\w\s\u00C0-\u024F\u0400-\u04FF.&-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.:;/-]+|[\s,.:;/-]+$/g, '')
    .trim()

  return cleaned
}

const memoizedComputeCleanDescription = memoizeStringFn(computeCleanDescription)

/**
 * Strips SEPA payment references, bank noise prefixes, transaction IDs,
 * timestamps, and dates from a transaction description to extract the
 * clean core payee/merchant/purpose description.
 */
export function extractCleanDescription(desc: string): string {
  if (!desc || typeof desc !== 'string') {
    return ''
  }
  return memoizedComputeCleanDescription(desc)
}

import { registerRelatedCleaningHelpers } from './related-transactions'

// Register cleaning helpers for merchant extraction and related transactions
registerCleaningHelpers({
  extractCleanDescription,
  normalizeDescription,
})

registerRelatedCleaningHelpers({
  extractCleanDescription,
  normalizeDescription,
})
