import { POPULAR_MERCHANTS } from '../../data/merchants'
import { type CategoryKeywords, translations } from '../../i18n/translations'
import { isPaymentProcessorIntermediary, repairBrokenWords } from './description-cleaning'

export interface CategorizeOptions {
  customKeywords?: Record<string, string[]>
  amount?: number
  type?: 'income' | 'expense'
  partner?: string
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Converts a keyword string into a Unicode-aware regular expression pattern.
 * Uses lookbehind (?<![\p{L}\p{N}]) and lookahead (?![\p{L}\p{N}]) to enforce
 * strict token/word boundaries, preventing false positives like 'car' in 'Mastercard',
 * 'rent' in 'Current', 'weg' in 'Bewegung', 'tax' in 'Contactless', etc.
 */
export function keywordToPattern(keyword: string): string {
  const trimmed = keyword.trim()
  if (!trimmed) return ''

  // Strip existing explicit boundary markers like \b and wrap uniformly
  const stripped = trimmed.replace(/^\\b|\\b$/g, '').trim()
  if (!stripped) return ''

  const escaped = escapeRegExp(stripped)
  return `(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`
}

// Pre-compile regular expressions for categorization
const categoryRegexes: Partial<Record<keyof CategoryKeywords, RegExp>> = {}
const aggregatedKeywords: Record<string, string[]> = {}

// 1. Build aggregated keywords across all locale translations
for (const locale of Object.values(translations)) {
  const keywords = locale.categoryKeywords
  if (keywords) {
    for (const [cat, words] of Object.entries(keywords)) {
      if (!aggregatedKeywords[cat]) aggregatedKeywords[cat] = []
      aggregatedKeywords[cat].push(...words)
    }
  }
}

// 2. Separate specific POPULAR_MERCHANTS into distinct high-precedence merchant patterns
const merchantCategoryPatterns: Record<string, string[]> = {}
const transferMerchantPatterns: string[] = []

for (const merchant of POPULAR_MERCHANTS) {
  const cat =
    merchant.category === 'Dining Out'
      ? 'DiningOut'
      : merchant.category === 'Bank Fees'
        ? 'BankFees'
        : merchant.category
  const words = [merchant.keyword, ...(merchant.aliases || [])]
  if (cat === 'Transfers') {
    transferMerchantPatterns.push(...words)
  } else {
    if (!merchantCategoryPatterns[cat]) merchantCategoryPatterns[cat] = []
    merchantCategoryPatterns[cat].push(...words)
  }
}

let transferMerchantsRegex: RegExp | undefined
if (transferMerchantPatterns.length > 0) {
  const patterns = [...new Set(transferMerchantPatterns)].map(keywordToPattern).filter(Boolean)
  if (patterns.length > 0) {
    transferMerchantsRegex = new RegExp(patterns.join('|'), 'iu')
  }
}

function matchesTerm(text: string, term: string): boolean {
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}([^a-z0-9]|$)`, 'i')
  return pattern.test(text)
}

const PAYMENT_PROCESSOR_IDS = new Set<string>([
  'paypal',
  'klarna',
  'stripe',
  'sumup',
  'payoneer',
  'payone',
])

function findPopularMerchantCategory(textLower: string): string | undefined {
  let bestDirectCategory: string | undefined
  let bestDirectScore = 0
  let bestProcessorCategory: string | undefined
  let bestProcessorScore = 0

  for (const merchant of POPULAR_MERCHANTS) {
    if (merchant.category === 'Transfers') continue
    const kw = merchant.keyword.toLowerCase()
    let score = 0
    if (matchesTerm(textLower, kw)) {
      score = kw.length
    }

    if (merchant.aliases) {
      for (const alias of merchant.aliases) {
        const a = alias.toLowerCase()
        if (matchesTerm(textLower, a)) {
          score = Math.max(score, a.length)
        }
      }
    }

    if (score > 0 && (kw === textLower || merchant.name.toLowerCase() === textLower)) {
      score += 1000
    }

    if (score > 0) {
      if (PAYMENT_PROCESSOR_IDS.has(merchant.id)) {
        if (score > bestProcessorScore) {
          bestProcessorScore = score
          bestProcessorCategory = merchant.category
        }
      } else if (score > bestDirectScore) {
        bestDirectScore = score
        bestDirectCategory = merchant.category
      }
    }
  }

  return bestDirectCategory || bestProcessorCategory
}

// Also integrate POPULAR_MERCHANTS into aggregatedKeywords as fallback
for (const [cat, words] of Object.entries(merchantCategoryPatterns)) {
  if (!aggregatedKeywords[cat]) aggregatedKeywords[cat] = []
  aggregatedKeywords[cat].push(...words)
}
if (!aggregatedKeywords.Transfers) aggregatedKeywords.Transfers = []
aggregatedKeywords.Transfers.push(...transferMerchantPatterns)

// 3. Compile high-precision boundary regexes per category
for (const [cat, words] of Object.entries(aggregatedKeywords)) {
  if (words.length > 0) {
    const uniqueWords = [...new Set(words)]
    const patterns = uniqueWords
      .map(keywordToPattern)
      .filter(Boolean)

    if (patterns.length > 0) {
      categoryRegexes[cat as keyof CategoryKeywords] = new RegExp(patterns.join('|'), 'iu')
    }
  }
}

// Regex to detect city 'Essen' context (e.g. 'Essen Hbf', 'Sparkasse Essen', 'Messe Essen')
// to prevent misclassifying German bank statements from the city Essen as Dining Out.
const GERMAN_CITY_ESSEN_REGEX =
  /(?:\b(?:hbf|hauptbahnhof|sparkasse|stadt|messe|klinikum|uni|universit[aä]t|rathaus|amtsgericht)\s+essen\b|\bessen\s+(?:hbf|hauptbahnhof|messe|klinikum|rathaus)\b)/i

// Regex to detect car or equipment rental context (e.g. 'Sixt Rent a Car', 'Car Rental', 'Autovermietung')
// to prevent vehicle and equipment rentals from misclassifying as apartment/housing Rent.
const CAR_OR_EQUIPMENT_RENTAL_REGEX =
  /(?:\b(?:car[- ]?rent(?:al)?|rent[- ]?a[- ]?car|rental[- ]?car|autovermietung|auto[- ]?miete|fahrzeug(?:ver)?miete|equipment[- ]?rent(?:al)?|tool[- ]?rent(?:al)?|uber[- ]?rent)\b)/i

// Regex to detect income tax context (e.g. 'Income Tax', 'Einkommensteuer')
// to prevent tax payments/refunds from misclassifying as personal Salary.
const INCOME_TAX_REGEX =
  /(?:\b(?:income\s+tax|einkommensteuer|podatek\s+dochodowy|porez\s+na\s+dohodak|pajak\s+penghasilan|pph)\b)/i

// Regex to detect cash withdrawal in Polish context (e.g. 'Wypłata z bankomatu', 'Wypłata gotówki')
// to prevent ATM withdrawals from misclassifying as personal Salary (wypłata).
const POLISH_ATM_WITHDRAWAL_REGEX =
  /(?:\b(?:wyp[lł]ata|wyplata)\s+(?:z\s+bankomatu|got[oó]wki|w\s+bankomacie)\b)/i

// Regex to detect SEPA and credit transfer / standing order reference patterns
// (e.g. 'CCB.321.UE.328580', 'MOB.210.EE.POS00026333', 'CD-SCT-12345', 'SEPA-Überweisung', 'Dauerauftrag', 'Umbuchung', 'End-to-End-Ref ... Kundenreferenz ...')
const SEPA_TRANSFER_REGEX =
  /(?:\b[a-z0-9_-]+\.\d+\.(?:ue|da|ee|ta|sct|inst)(?:\.[a-z0-9_-]+)?\b|\bcd-sct-[a-z0-9_-]+\b|\b(?:end-to-end-ref\b.*\bkundenreferenz\b|\bkundenreferenz\b.*\bend-to-end-ref\b)|\b(?:end-to-end-ref|kundenreferenz)\s*:\s*(?:notprovided|null|\d{8}-[a-z0-9_-]+|[a-z0-9_.-]*(?:ue|da|ee|ta|sct|inst|mob|si)[a-z0-9_.-]*)\b|\b(?:sepa[- ]?)?(?:credit[- ]?transfer|ueberweisung|überweisung|dauerauftrag|umbuchung|bank[uü]berweisung|bank[- ]?transfer|wire[- ]?transfer|money[- ]?(?:transfer|back)|geld[- ]?zur[uü]ck|sent\s+from|echtzeit[uü]berweisung|echtzeit[- ]?[uü]berweisung|instant[- ]?transfer|instant[- ]?payment)\b|(?:\b[a-z]{4}[a-z]{2}[a-z0-9]{2}(?:[a-z0-9]{3})?\s+[a-z]{2}\d{2}[a-z0-9]{11,30}\b|\b[a-z]{2}\d{2}[a-z0-9]{11,30}\b).*\b(?:end-to-end-ref|kundenreferenz)\b|\b(?:anel\s*(?:o\.?|oder|u\.?|und|\/|&)\s*biljana\s*memic|biljana\s*(?:o\.?|oder|u\.?|und|\/|&)\s*anel\s*memic)\b)/i

// Regex to detect commercial purchase / order indicators in SEPA payments
// to prevent business invoices, orders, and corporate collections with End-to-End-Ref from falling into Transfers.
const COMMERCIAL_SEPA_REGEX =
  /(?:\b(?:order|bestellung|auftrag|rechnung|invoice|rg\.?)\s*[:#.-]?\s*\d|\b(?:citideffxxx)\b|\bde\d{2}50210900\d{10}\b|\b(?:mandatsref|mandatsreferenz|gl[aä]ubiger[- ]?id|sepa[- ]?(?:basis|firmen)?[- ]?lastschrift|lastschrift\b))/i

// Regex to detect explicit tax authority or specific tax duty/assessment context
// to prevent regular bank transfers with tax-related memos/references from misclassifying as Taxes.
const EXPLICIT_TAX_AUTHORITY_OR_DUTY_REGEX =
  /(?:\b(?:finanzamt|finanzkasse|bundeskasse|steuerverwaltung|steuerbeh[oö]rde|irs|hmrc|cra|belastingdienst|dgfip|agenzia\s+delle\s+entrate|agencia\s+tributaria|receita\s+federal|porezn[ae]|poresk[ae]|urzad\s+skarbowy|urząd\s+skarbowy|dirjen\s+pajak|wundertax|taxfix|smartsteuer|elster|wiso\s*steuer|buhl\s*data|gerichtkasse|gerichtskasse|justizkasse|landesjustizkasse|oberlandesgerichtskasse|zentrale\s+gerichtskasse|grundbuchamt|notar|notariat|f[aä]rber\s*(?:und|&)\s*hutzel|fa\s+[a-zäöüß]+|stadtkasse|gemeindekasse|stadtverwaltung|gemeindeverwaltung|standesamt|standesamtskasse|konsulat|generalkonsulat|generalkosulat|botschaft|embassy|consulate)\b|\b(?:einkommensteuer|grundsteuer|gewerbesteuer|umsatzsteuer|kirchensteuer|hundesteuer|zweitwohnungs?steuer|grundbesitzabgaben|vorabpauschale|invstg|kapitalertragsteuer|quellensteuer|solidarit[aä]tszuschlag|steuernummer|steuer[- ]?id|steuerbescheid|steuererkl[aä]rung|steuererstattung|est-veranl(?:\.|agung)?|grunderwerbsteuer|grunderwerbssteuer|grundbuchgeb[uü]hr(?:en)?|gerichtsgeb[uü]hr(?:en)?|notarkosten|notargeb[uü]hr(?:en)?|standesamtsgeb[uü]hr(?:en)?|geburtsurkunde|passgeb[uü]hr(?:en)?|ausweisgeb[uü]hr(?:en)?|visageb[uü]hr(?:en)?|visumgeb[uü]hr(?:en)?|tax\s+payment|tax\s+assessment|tax\s+bill|tax\s+return|tax\s+refund|tax\s+office|tax\s+authority|income\s+tax|property\s+tax|sales\s+tax|corporate\s+tax|capital\s+gains\s+tax|council\s+tax|advance\s+tax)\b)/i

const defaultCategoryCache = new Map<string, string>()

// Regex to detect childcare / school-care fee purposes (e.g. 'KINDERTAGESSTAETTENBEITRAG', 'Kita-Gebuehr', 'Hortbeitrag').
// Municipalities bill these too, so the purpose must win over the municipal authority's default 'Taxes' category.
const CHILDCARE_FEE_REGEX =
  /\b(?:kindertagesst(?:ä|ae|a)tte\w*|kita[- ]?(?:geb(?:ü|ue|u)hr\w*|beitr(?:ä|ae|a)g\w*)|(?:kindergarten|krippen|hort|betreuungs)(?:geb(?:ü|ue|u)hr\w*|beitr(?:ä|ae|a)g\w*)|schulkindbetreuung)/i

/**
 * Infers a category from a transaction description and context.
 * Returns one of the standardized canonical category keys (e.g. 'Salary', 'Groceries', 'Dining Out').
 */
export function categorize(
  desc: string,
  customKeywordsOrOptions?: Record<string, string[]> | CategorizeOptions,
  maybeOptions?: CategorizeOptions,
): string {
  if (!desc || typeof desc !== 'string') return 'Other'

  // Normalize options
  let customKeywords: Record<string, string[]> | undefined
  let options: CategorizeOptions | undefined

  if (customKeywordsOrOptions) {
    if ('customKeywords' in customKeywordsOrOptions || 'amount' in customKeywordsOrOptions || 'type' in customKeywordsOrOptions || 'partner' in customKeywordsOrOptions) {
      options = customKeywordsOrOptions as CategorizeOptions
      customKeywords = options.customKeywords
    } else {
      customKeywords = customKeywordsOrOptions as Record<string, string[]>
      options = maybeOptions
    }
  }

  // Combine partner and description if partner is available, repairing broken line-wrap words
  const rawText = options?.partner
    ? `${options.partner} ${desc}`.trim()
    : desc.trim()

  const fullText = repairBrokenWords(rawText)
  const d = fullText.toLowerCase()

  // 1. First evaluate user's custom keywords (highest priority)
  if (customKeywords) {
    for (const [cat, words] of Object.entries(customKeywords)) {
      if (!words || words.length === 0) continue
      for (const w of words) {
        if (!w || !w.trim()) continue
        const pat = keywordToPattern(w)
        try {
          if (new RegExp(pat, 'iu').test(d)) {
            if (cat === 'DiningOut') return 'Dining Out'
            if (cat === 'BankFees') return 'Bank Fees'
            return cat
          }
        } catch {
          if (d.includes(w.toLowerCase())) {
            if (cat === 'DiningOut') return 'Dining Out'
            if (cat === 'BankFees') return 'Bank Fees'
            return cat
          }
        }
      }
    }
  }

  // Check cache for default evaluations
  const isExpense = options?.type === 'expense' || (typeof options?.amount === 'number' && options.amount < 0)
  const isIncome = options?.type === 'income' || (typeof options?.amount === 'number' && options.amount > 0)
  const cacheKey = `${d}:${isExpense ? 'exp' : isIncome ? 'inc' : 'any'}`

  if (!customKeywords && defaultCategoryCache.has(cacheKey)) {
    return defaultCategoryCache.get(cacheKey)!
  }

  // 2. High-priority structural commitments: Salary, Rent, Loans, Taxes
  const structuralCategories: (keyof CategoryKeywords)[] = ['Salary', 'Rent', 'Loans', 'Taxes']
  for (const cat of structuralCategories) {
    if (cat === 'Salary') {
      if (INCOME_TAX_REGEX.test(d)) continue
      if (POLISH_ATM_WITHDRAWAL_REGEX.test(d)) continue
      if (isExpense) {
        const isExplicitSalaryPayment =
          /\b(?:salary\s+payment|monthly\s+salary|gehaltszahlung|lohnauszahlung|reisespesen|reisesp|reisekosten|spesenabrechnung|spesenerstattung|auslagenerstattung|r[uü]ck[uü]berweisung\w*|rueckueberweisung\w*)\b/i.test(d)
        if (!isExplicitSalaryPayment) continue
      }
    }
    if (cat === 'Rent' && CAR_OR_EQUIPMENT_RENTAL_REGEX.test(d)) {
      continue
    }
    if (cat === 'Taxes' && CHILDCARE_FEE_REGEX.test(d)) {
      if (!customKeywords) defaultCategoryCache.set(cacheKey, 'Education')
      return 'Education'
    }
    if (cat === 'Taxes' && SEPA_TRANSFER_REGEX.test(d)) {
      if (!EXPLICIT_TAX_AUTHORITY_OR_DUTY_REGEX.test(d)) {
        continue
      }
    }
    const rx = categoryRegexes[cat]
    if (rx?.test(d)) {
      if (!customKeywords) defaultCategoryCache.set(cacheKey, cat)
      return cat
    }
  }

  // 3. Specific brand/merchant matching (airlines, hotel groups, OTAs, supermarkets, mobility)
  // Higher precedence than generic dictionary terms like 'car' or payment processors
  const popularCat = findPopularMerchantCategory(d.toLowerCase())
  if (popularCat) {
    if (popularCat === 'Dining Out' && GERMAN_CITY_ESSEN_REGEX.test(d)) {
      // Ignore false positives from city of Essen
    } else {
      if (!customKeywords) defaultCategoryCache.set(cacheKey, popularCat)
      return popularCat
    }
  }

  // 4. General category matching
  let order: (keyof CategoryKeywords)[] = [
    'Cash',
    'BankFees',
    'Crypto',
    'Groceries',
    'DiningOut',
    'Shopping',
    'Transport',
    'Travel',
    'Entertainment',
    'Insurance',
    'Communication',
    'Utilities',
    'Healthcare',
    'Education',
    'Savings',
  ]

  if (isIncome) {
    order = [
      'Savings',
      'BankFees',
      'Crypto',
      'Cash',
      'Groceries',
      'Shopping',
      'DiningOut',
      'Transport',
      'Travel',
      'Entertainment',
      'Insurance',
      'Communication',
      'Utilities',
      'Healthcare',
      'Education',
    ]
  }

  for (const cat of order) {
    const rx = categoryRegexes[cat]
    if (rx?.test(d)) {
      // Guard against German city Essen misclassifying as Dining Out
      if (cat === 'DiningOut' && GERMAN_CITY_ESSEN_REGEX.test(d)) {
        continue
      }

      const result =
        cat === 'DiningOut' ? 'Dining Out' : cat === 'BankFees' ? 'Bank Fees' : cat
      if (!customKeywords) {
        defaultCategoryCache.set(cacheKey, result)
      }
      return result
    }
  }

  // 5. Transfers & Payment processor fallback (e.g. direct PayPal/Klarna without specific retail merchant)
  if (isPaymentProcessorIntermediary(d)) {
    if (!customKeywords) defaultCategoryCache.set(cacheKey, 'Shopping')
    return 'Shopping'
  }

  if (
    transferMerchantsRegex?.test(d) ||
    categoryRegexes.Transfers?.test(d) ||
    (SEPA_TRANSFER_REGEX.test(d) && !COMMERCIAL_SEPA_REGEX.test(d))
  ) {
    if (!customKeywords) defaultCategoryCache.set(cacheKey, 'Transfers')
    return 'Transfers'
  }

  if (!customKeywords) {
    defaultCategoryCache.set(cacheKey, 'Other')
  }
  return 'Other'
}
