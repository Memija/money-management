import type { Transaction } from '../../types'
import { createBoundedCache } from '../bounded-cache'
import { repairBrokenWords } from './word-repair'

export interface CleaningHelpers {
  extractCleanDescription: (desc: string) => string
  normalizeDescription: (desc: string) => string
}

let helpers: CleaningHelpers = {
  extractCleanDescription: (d) => d,
  normalizeDescription: (d) => d,
}

export function registerCleaningHelpers(h: CleaningHelpers) {
  helpers = h
}

/**
 * Detects whether a transaction description represents an intermediary payment processor transaction
 * (e.g. PayPal, Klarna, Stripe, SumUp being used as a checkout intermediary for an underlying merchant)
 * as opposed to a direct balance transfer, account debit, or fee with the processor itself.
 */
export function isPaymentProcessorIntermediary(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false
  }
  const t = repairBrokenWords(text)

  // Direct PayPal balance transfer or account debit actions are direct, not intermediary purchases
  if (
    /\b(?:abbuchung\s+vom\s+paypal[- ]konto|paypal[- ]konto\s+abbuchung|paypal[- ]guthaben|guthabeneinzahlung)\b/i.test(
      t,
    )
  ) {
    return false
  }

  // Transactions containing only PayPal corporate/clearing references without any underlying third-party merchant
  const withoutPayPalMetadata = t
    .replace(
      /(?:\by?paypal(?:\s*\([^)]*\))?|\bpp\.\d+\.pp\b|\b\d+\b|s\.?\s*a\.?\s*r\.?\s*l\.?|et\s*cie|s\.?\s*c\.?\s*a\.?|\bsc\b|\beurope\b|\beuropa\b|[.,/:-])/giu,
      ' ',
    )
    .trim()
  if (!withoutPayPalMetadata) {
    return false
  }

  // 1. Purchase phrases in supported languages (including truncated forms on bank statements)
  const purchasePhrase =
    /\b(?:Ihr\s+E(?:in)?[- ]?kauf(?:\s+bei)?|Ihr\s+E(?:in)?k(?:auf|au|a|f)?(?:\s+bei)?|Ihr\s+Ein(?:\s+bei)?|I\s*hr\s+E(?:in)?k(?:auf|au|a|f)?(?:\s+bei)?|Einkauf\s+bei|Your\s+purchase\s+(?:at|from)|Tw[oó]j\s+zakup\s+w|Zakup\s+w|Va[sš]a\s+kupovina\s+kod|Ваша\s+куповина\s+код|Pembelian\s+Anda\s+di)\b/i
  if (purchasePhrase.test(t)) {
    return true
  }

  // 2. Delimiter after processor clearing / merchant ID pointing to an underlying merchant
  const processorDelimiter =
    /(?:(?:y?paypal|payone|sumup|stripe|klarna).*?(?:\bpp\.\d+\.pp|\b\d{8,}|(?:\/\s*pp\.\d+\.pp\s*\/[.]?))\s*(?:\/\s*pp\.\d+\.pp\s*\/?[.]?\s*)?[./*-]?\s*(?!abbuchung\b)(?!paypal\b)(?!pp\.\d)[a-z0-9])/i
  if (processorDelimiter.test(t)) {
    return true
  }

  return false
}

/**
 * Detects whether a string or description contains exclusively payment processor company names,
 * corporate legal forms, SEPA clearing references, and punctuation without any underlying merchant name.
 * Such terms must never be learned as category rules or matched across different transactions as shared prefixes.
 */
export function isPaymentProcessorOnly(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false
  }
  const stripped = text
    .replace(
      /(?:\by?paypal(?:\s*\([^)]*\))?|\bklarna(?:\s+bank|\s+payments?)?|\bsumup(?:\s+payments?|\s+ltd\.?|\s+limited)?|\bstripe(?:\s+payments?)?|\bpayoneer\b|\bpayone\b|s\.?\s*a\.?\s*r\.?\s*l\.?|et\s*cie|s\.?\s*c\.?\s*a\.?|\bsc\b|\beurope\b|\beuropa\b|\bgmbh\b|\bag\b|\bse\b|\bltd\.?\b|\blimited\b|\bab\b|\bbv\b|\bpp\b|\bpp\.[0-9\s]*\.?pp\b|\b\d+\b|[.,/:\s*-])/giu,
      ' ',
    )
    .trim()
  return stripped.length === 0
}

/**
 * Extracts a concise, reusable merchant keyword from a transaction description
 * by stripping banking prefixes, corporate legal forms, branch/terminal codes, and noise.
 * Useful for learning smart category rules that match future transactions from the same merchant.
 */
export function extractMerchantKeyword(desc: string): string {
  if (!desc || typeof desc !== 'string') {
    return ''
  }

  // Start with clean description
  let merchant = helpers.extractCleanDescription(desc)
  if (!merchant) {
    return ''
  }

  // Direct PayPal account debit or direct transaction with PayPal itself
  if (
    /\b(?:abbuchung\s+vom\s+paypal[- ]konto|paypal[- ]konto\s+abbuchung)\b/i.test(merchant) ||
    (!isPaymentProcessorIntermediary(desc) &&
      !merchant
        .replace(
          /(?:\by?paypal(?:\s*\([^)]*\))?|\bpp\.\d+\.pp\b|\b\d+\b|s\.?\s*a\.?\s*r\.?\s*l\.?|et\s*cie|s\.?\s*c\.?\s*a\.?|\bsc\b|\beurope\b|\beuropa\b|[.,/:-])/giu,
          ' ',
        )
        .trim())
  ) {
    return 'PayPal'
  }

  // 1. Strip leading payment gateway / aggregator prefixes like "PAYONE GmbH", "SumUp .", "SumUp *", "PayPal *", "PayPal (Europe)..."
  merchant = merchant.replace(/^(?:(?:NYA|NNT)\*|KARTENZAHL\.?\s*)+/gi, '')
  merchant = merchant.replace(
    /^(?:y?paypal\s*(?:\([^)]*\)|europe)?\s*(?:s\.?\s*a\.?\s*r\.?\s*l\.?|et\s*cie\.?|s\s*\.?\s*c\s*\.?\s*a\.?|[0-9\s]|pp\.?[0-9\s]*\.?pp|[/.,:;*-])+\s*)+/i,
    '',
  )
  merchant = merchant.replace(
    /^(?:(?:y?paypal|payone|sumup|stripe|klarna)\s*(?:\([^)]+\)|europe|pte\.?\s*ltd\.?)?(?:\s*,?\s*s\.?\s*a\.?\s*r\.?\s*l\.?)?(?:\s*et\s*cie\.?,?)?(?:\s*,?\s*s\s*\.?\s*c\s*\.?\s*a\.?)?(?:\s*(?:\bpp\.\d+\.pp|\b\d{8,}))?(?:\s*\/\s*(?:pp\.\d+\.pp|\d{8,}|[a-z0-9_.-]+)\s*\/?[.]?)*\s*[./*-]?\s*)+/i,
    '',
  )
  merchant = merchant.replace(/^(?:ELV\d*|ME\d+)\s*/gi, '')
  merchant = merchant.replace(
    /^(?:(?:y?paypal\s*(?:[- ]?zahlung)?|lastschrift|zahlung)\s*(?:[uü]ber|ube\s+r)?\s*(?:lastschrift)?(?:\s+an)?\s*)+/i,
    '',
  )
  merchant = merchant.replace(/^(?:lastschrift\s+an|zahlung\s+an|zahlung)\s+/i, '')
  merchant = merchant.replace(
    /^(?:(?:sepa[- ]?)?(?:credit[- ]?transfer|ueberweisung|überweisung|dauerauftrag|bank[- ]?transfer|wire[- ]?transfer|money[- ]?transfer|standing[- ]?order)(?:\s+(?:an|to|f[uü]r|for))?\s*[:.-]?\s*)+/i,
    '',
  )

  // 1b. If the description contains a purchase phrase ("Ihr Einkauf bei ...", "Your purchase at ..."), extract the merchant
  const purchaseMatch = merchant.match(
    /\b(?:Ihr\s+E(?:in)?[- ]?kauf(?:\s+bei)?|Ihr\s+E(?:in)?k(?:auf|au|a|f)?(?:\s+bei)?|Ihr\s+Ein(?:\s+bei)?|I\s*hr\s+E(?:in)?k(?:auf|au|a|f)?(?:\s+bei)?|Your\s+purchase\s+(?:at|from)|Tw[oó]j\s+zakup\s+w|Va[sš]a\s+kupovina\s+kod|Ваша\s+куповина\s+код|Pembelian\s+Anda\s+di)\s*(.*)$/i,
  )
  if (purchaseMatch) {
    const beforePurchase = merchant
      .slice(0, purchaseMatch.index)
      .replace(/[,.:;/-]+\s*$/, '')
      .trim()
    const rawAfter = purchaseMatch[1].trim()
    const cleanAfter = rawAfter
      .replace(/\s+(?:en|end|end-t|end-to)\b.*$/i, '')
      .replace(/\s+(?:cari)\b.*$/i, '')
      .trim()

    // Determine the most complete merchant name (avoid taking truncated merchant after purchase phrase)
    if (
      beforePurchase &&
      (!cleanAfter || beforePurchase.length >= cleanAfter.length || cleanAfter.length <= 4)
    ) {
      merchant = beforePurchase
    } else if (cleanAfter) {
      merchant = cleanAfter
    } else {
      merchant = beforePurchase
    }
  }

  // Strip trailing truncated purchase phrases
  merchant = merchant.replace(
    /(?:[,.]\s*(?:(?:I\s*hr|Ihr)\s*(?:E(?:in)?[- ]?kauf(?:\s+bei)?|E(?:in)?k(?:auf|au|a|f)?(?:\s+bei)?|Ein(?:\s+bei)?|E(?:in)?k?|Ei?|be?i?)?|Ih?r?\b)|\s+Ihr\s+E(?:in)?kauf(?:\s+bei)?)\s*$/i,
    '',
  )
  merchant = merchant.replace(/\s+bei\s*$/i, '')

  // Strip trailing slash noise like "/ Cari" or "/ PP" or trailing "End", "En"
  merchant = merchant.replace(/\s*\/\s*(?:cari|pp|\d+).*$/i, '')
  merchant = merchant.replace(/\s+(?:cari|end|en)\b.*$/i, '')

  // Strip trailing currency cutoff like (Euro, (EUR, Euro
  merchant = merchant.replace(/\s*\(?\s*(?:eur|euro)\b.*$/i, '')

  // If the extracted text is just processor remnants or purchase phrases, clear it
  if (
    /^(?:pp\b|sc\b|i\b|ih\b|ihr\b|ihr\s+e\b|ihr\s+ei\b|ihr\s+ein\b|ihr\s+eink\b|ihr\s+einkauf\b|be\b|bei\b|einkauf\b)/i.test(
      merchant.trim(),
    )
  ) {
    merchant = ''
  }

  // 2. Remove corporate legal entity suffixes
  merchant = merchant.replace(
    /(?<![\p{L}\p{N}])(?:gmbh(?:\s*&\s*co\.?\s*kg)?|ag|s\s*\.?\s*e\.?|ltd\.?|limited|limite|inc\.?|llc|kgaa|ug|e\.?\s*k\.?|co\.?\s*kg|sp\.?\s*z\s*o\.?\s*o\.?|d\s*\.?\s*o\s*\.?\s*o\.?|d\s*\.?\s*d\.?|bv|s\.?a\.?r\.?l\.?|s\s*\.?\s*r\s*\.?\s*o\.?|o[uü]|gbr|lda|unipessoal|unipes|sa|foundation|foundatio)(?![\p{L}\p{N}])/giu,
    ' ',
  )

  // Remove terminal/region abbreviation noise like standalone HK, Europe, Europa
  merchant = merchant.replace(/\b(?:hk|europe|europa)\b/i, ' ')

  // 2. Remove branch / store suffixes and terminal numbers (e.g. 'Filiale 1234', 'Store #5')
  merchant = merchant.replace(/\b(?:filiale|fil\.|store|branch|pos|terminal)\b.*$/i, ' ')

  // 3. Remove courtesy phrases like "sagt Danke"
  merchant = merchant.replace(/\bsagt\s+danke\b/gi, ' ')

  // 4. Remove trailing city names and country codes commonly appended in European card terminals
  merchant = merchant.replace(
    /\s+(?:berlin|m[uü]nchen|hamburg|k[oö]ln|frankfurt|stuttgart|d[uü]sseldorf|dortmund|essen|leipzig|bremen|dresden|hannover|n[uü]rnberg|wien|z[uü]rich|warszawa|krak[oó]w|sarajevo|beograd|zagreb|london|paris|faro|tavira|oberursel|eschborn|heidelberg)\b.*$/i,
    ' ',
  )
  merchant = merchant.replace(/\s+(?:de|at|ch|hr|si|ba|germany|deutschland)\b.*$/i, '')

  // 5. Remove remittance purpose/reason phrases and banking transaction types commonly appended after merchant name
  merchant = merchant.replace(
    /\s+(?:abbuchung|lastschrift|gutschrift|auszahlung|einzahlung|r(?:ü|ue)ckzahlung|r(?:ü|ue)ckverg(?:ü|ue)tung\w*|r(?:ü|ue)ck[uü]berweisung\w*|geb(?:ü|ue)hrenerstattung\w*|entgelterstattung\w*|erstatt(?:\.|ung)?|est-veranl(?:\.|agung)?|steuererstattung|lizenzgeb(?:ü|ue)hr|kautionsabrechnung|abrechnung|miete|(?:monatliches\s+)?hausgeld|gerichtsgeb(?:ü|ue)hr(?:en)?|grundbuch(?:eintragung)?|geb(?:ü|ue)hr(?:en)?|notarkosten|notargeb(?:ü|ue)hr(?:en)?|reisespesen|reisekosten|spesen|order|bestellung|auftrag|rechnung|invoice|kred\b|kredit\w*|kreditrate\w*|darlehen\w*|tilgung\w*|annuit[aä]t\w*)\b.*$/i,
    ' ',
  )

  // Remove trailing reference numbers/counters (e.g. 'Finanzkasse Schwalm-Eder 2' -> 'Finanzkasse Schwalm-Eder')
  merchant = merchant.replace(/\s+\d{1,2}\s*$/, '')

  // 6. Clean up spaces and punctuation
  merchant = merchant
    .replace(/[^\w\s\u00C0-\u024F\u0400-\u04FF.&-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.:;/-]+|[\s,.:;/-]+$/g, '')
    .trim()

  if (/^mc$/i.test(merchant.trim())) {
    return 'Uber'
  }

  if (/\bweg\s+landwehrweg\b/i.test(merchant)) {
    return 'WEG Landwehrweg 1'
  }

  if (/\b(?:z\.?\s*hd\.?\s*kmk|kmk\s+immobilien(?:verw\w*|verwaltung)?)\b/i.test(merchant)) {
    return 'KMK Immobilienverwaltung'
  }

  return merchant.length >= 2
    ? merchant
    : isPaymentProcessorIntermediary(desc)
      ? ''
      : helpers.extractCleanDescription(desc)
}

/**
 * Formats a merchant display name for human-readable display.
 */
export function formatMerchantDisplayName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, ' ')
  if (!trimmed) {
    return ''
  }

  // If already mixed case (contains both lowercase and uppercase letters), preserve as-is
  if (/[a-z]/.test(trimmed) && /[A-Z]/.test(trimmed)) {
    return trimmed
  }

  // If pure all-caps with multiple words or a word with length > 4
  if (trimmed === trimmed.toUpperCase()) {
    const words = trimmed.split(' ')
    // Keep short brand acronyms (e.g. IKEA, ALDI, REWE, BMW, SAP, OBI, DM) as-is
    if (words.length === 1 && words[0].length <= 4) {
      return trimmed
    }
    return words
      .map((word) => {
        if (/^[A-Z]\.?$/.test(word)) {
          return word
        }
        if (word.length <= 1) {
          return word
        }
        return word
          .split('-')
          .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ''))
          .join('-')
      })
      .join(' ')
  }

  return trimmed
}

/** Separator for the merchant cache key; cannot appear in bank descriptions. */
const MERCHANT_CACHE_KEY_SEPARATOR = '\u0000'
const merchantCache = createBoundedCache<string>()

/**
 * Resolves the canonical merchant/payee name for a transaction.
 * Checks both `partner` and `description`, strips banking and SEPA noise,
 * and formats the display name cleanly.
 * Results are memoized per (partner, description) pair.
 */
export function getTransactionMerchant(
  tx: Transaction | { description: string; partner?: string },
): string {
  if (!tx) {
    return ''
  }

  const cacheKey = `${tx.partner ?? ''}${MERCHANT_CACHE_KEY_SEPARATOR}${tx.description ?? ''}`
  const cached = merchantCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }
  const merchant = computeTransactionMerchant(tx)
  merchantCache.set(cacheKey, merchant)
  return merchant
}

function computeTransactionMerchant(tx: { description: string; partner?: string }): string {
  if (tx.description && /\bweg\s+landwehrweg\b/i.test(tx.description)) {
    return 'WEG Landwehrweg 1'
  }
  if (tx.partner && /\bweg\s+landwehrweg\b/i.test(tx.partner)) {
    return 'WEG Landwehrweg 1'
  }

  if (tx.partner && tx.partner.trim()) {
    const cleanPartner = extractMerchantKeyword(tx.partner)
    if (cleanPartner && !isPaymentProcessorOnly(cleanPartner)) {
      if (
        /kmk\s+immobilien(?:verw\w*|verwaltung)?/i.test(cleanPartner) &&
        tx.description &&
        /\bweg\b/i.test(tx.description)
      ) {
        const cleanDesc = extractMerchantKeyword(tx.description)
        if (cleanDesc && !isPaymentProcessorOnly(cleanDesc)) {
          return formatMerchantDisplayName(cleanDesc)
        }
      }
      return formatMerchantDisplayName(cleanPartner)
    }
  }

  if (tx.description && tx.description.trim()) {
    const cleanDesc = extractMerchantKeyword(tx.description)
    if (cleanDesc && !isPaymentProcessorOnly(cleanDesc)) {
      return formatMerchantDisplayName(cleanDesc)
    }
    const fallback = helpers.extractCleanDescription(tx.description)
    if (fallback && !isPaymentProcessorOnly(fallback)) {
      return formatMerchantDisplayName(fallback)
    }
  }

  const raw = (tx.partner && tx.partner.trim()) || tx.description.trim().replace(/\s+/g, ' ')
  return formatMerchantDisplayName(raw)
}

export * from './related-transactions'
