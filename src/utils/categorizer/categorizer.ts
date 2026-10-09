import { POPULAR_MERCHANTS } from '../../data/merchants'
import { type CategoryKeywords, translations } from '../../i18n/translations'
import { createBoundedCache } from '../bounded-cache'
import { escapeRegExp, matchesLowercaseTerm } from '../regex-utils'
import { isPaymentProcessorIntermediary, repairBrokenWords } from './description-cleaning'

export interface CategorizeOptions {
  customKeywords?: Record<string, string[]>
  amount?: number
  type?: 'income' | 'expense'
  partner?: string
}

const WORD_CHAR_START = /^[\p{L}\p{N}]/u
const WORD_CHAR_END = /[\p{L}\p{N}]$/u
const LEADING_BOUNDARY = '(?<![\\p{L}\\p{N}])'
const TRAILING_BOUNDARY = '(?![\\p{L}\\p{N}])'

interface KeywordParts {
  escaped: string
  hasLeading: boolean
  hasTrailing: boolean
}

function toKeywordParts(keyword: string): KeywordParts | undefined {
  const trimmed = keyword.trim()
  if (!trimmed) return undefined

  // Strip existing explicit boundary markers like \b and wrap uniformly
  const stripped = trimmed.replace(/^\\b|\\b$/g, '').trim()
  if (!stripped) return undefined

  return {
    escaped: escapeRegExp(stripped),
    hasLeading: WORD_CHAR_START.test(stripped),
    hasTrailing: WORD_CHAR_END.test(stripped),
  }
}

/**
 * Converts a keyword string into a Unicode-aware regular expression pattern.
 * Uses lookbehind (?<![\p{L}\p{N}]) and lookahead (?![\p{L}\p{N}]) to enforce
 * strict token/word boundaries, preventing false positives like 'car' in 'Mastercard',
 * 'rent' in 'Current', 'weg' in 'Bewegung', 'tax' in 'Contactless', etc.
 */
export function keywordToPattern(keyword: string): string {
  const parts = toKeywordParts(keyword)
  if (!parts) return ''
  const leading = parts.hasLeading ? LEADING_BOUNDARY : ''
  const trailing = parts.hasTrailing ? TRAILING_BOUNDARY : ''
  return `${leading}${parts.escaped}${trailing}`
}

/**
 * Compiles a list of keywords into one boundary-aware regex, equivalent to joining
 * `keywordToPattern` results with `|`, but with the lookarounds factored out per boundary group.
 * This lets the engine reject mid-word positions once instead of once per keyword,
 * which is dramatically faster for large dictionaries (thousands of merchant aliases).
 */
export function buildKeywordRegex(keywords: string[]): RegExp | undefined {
  const groups = new Map<string, string[]>()
  for (const keyword of new Set(keywords)) {
    const parts = toKeywordParts(keyword)
    if (!parts) continue
    const groupKey = `${parts.hasLeading ? LEADING_BOUNDARY : ''}|${parts.hasTrailing ? TRAILING_BOUNDARY : ''}`
    const group = groups.get(groupKey)
    if (group) {
      group.push(parts.escaped)
    } else {
      groups.set(groupKey, [parts.escaped])
    }
  }
  if (groups.size === 0) return undefined

  const alternatives = [...groups].map(([groupKey, escapedWords]) => {
    const [leading, trailing] = groupKey.split('|')
    return `${leading}(?:${escapedWords.join('|')})${trailing}`
  })
  return new RegExp(alternatives.join('|'), 'iu')
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

const transferMerchantsRegex = buildKeywordRegex(transferMerchantPatterns)

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
    if (matchesLowercaseTerm(textLower, kw)) {
      score = kw.length
    }

    if (merchant.aliases) {
      for (const alias of merchant.aliases) {
        const a = alias.toLowerCase()
        if (matchesLowercaseTerm(textLower, a)) {
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
  const regex = buildKeywordRegex(words)
  if (regex) {
    categoryRegexes[cat as keyof CategoryKeywords] = regex
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
  /(?:\b[a-z0-9_-]+\.\d+\.(?:ue|da|ee|ta|sct|inst)(?:\.[a-z0-9_-]+)?\b|\bcd-sct-[a-z0-9_-]+\b|\b(?:end-to-end-ref\b.*\bkundenreferenz\b|\bkundenreferenz\b.*\bend-to-end-ref\b)|\b(?:end-to-end-ref|kundenreferenz)\s*:\s*(?:notprovided|null|\d{8}-[a-z0-9_-]+|[a-z0-9_.-]*(?:ue|da|ee|ta|sct|inst|mob|si)[a-z0-9_.-]*)\b|\b(?:sepa[- ]?)?(?:credit[- ]?transfer|ueberweisung|überweisung|dauerauftrag|umbuchung|bank[uü]berweisung|bank[- ]?transfer|wire[- ]?transfer|money[- ]?(?:transfer|back)|geld[- ]?zur[uü]ck|sent\s+from|echtzeit[uü]berweisung|echtzeit[- ]?[uü]berweisung|instant[- ]?transfer|instant[- ]?payment)\b|(?:\b[a-z]{4}[a-z]{2}[a-z0-9]{2}(?:[a-z0-9]{3})?\s+[a-z]{2}\d{2}[a-z0-9]{11,30}\b|\b[a-z]{2}\d{2}[a-z0-9]{11,30}\b).*\b(?:end-to-end-ref|kundenreferenz)\b|\b(?:anel(?:\s+memic)?\s*(?:o\.?|oder|u\.?|und|i|ili|\/|&|,)\s*biljana\s*memic|biljana(?:\s+memic)?\s*(?:o\.?|oder|u\.?|und|i|ili|\/|&|,)\s*anel\s*memic)\b)/i

// Regex to detect commercial purchase / order indicators in SEPA payments
// to prevent business invoices, orders, and corporate collections with End-to-End-Ref from falling into Transfers.
const COMMERCIAL_SEPA_REGEX =
  /(?:\b(?:order|bestellung|auftrag|rechnung|invoice|rg\.?)\s*[:#.-]?\s*\d|\b(?:citideffxxx)\b|\bde\d{2}50210900\d{10}\b|\b(?:mandatsref|mandatsreferenz|gl[aä]ubiger[- ]?id|sepa[- ]?(?:basis|firmen)?[- ]?lastschrift|lastschrift\b))/i

// Regex to detect explicit tax authority or specific tax duty/assessment context
// to prevent regular bank transfers with tax-related memos/references from misclassifying as Taxes.
const EXPLICIT_TAX_AUTHORITY_OR_DUTY_REGEX =
  /(?:\b(?:finanzamt|finanzkasse|bundeskasse|steuerverwaltung|steuerbeh[oö]rde|irs|hmrc|cra|belastingdienst|dgfip|agenzia\s+delle\s+entrate|agencia\s+tributaria|receita\s+federal|porezn[ae]|poresk[ae]|urzad\s+skarbowy|urząd\s+skarbowy|dirjen\s+pajak|wundertax|taxfix|smartsteuer|elster|wiso\s*steuer|buhl\s*data|gerichtkasse|gerichtskasse|justizkasse|landesjustizkasse|oberlandesgerichtskasse|zentrale\s+gerichtskasse|grundbuchamt|notar|notariat|f[aä]rber\s*(?:und|&)\s*hutzel|fa\s+[a-zäöüß]+|stadtkasse|gemeindekasse|stadtverwaltung|gemeindeverwaltung|standesamt|standesamtskasse|konsulat|generalkonsulat|generalkosulat|botschaft|embassy|consulate)\b|\b(?:einkommensteuer|grundsteuer|gewerbesteuer|umsatzsteuer|kirchensteuer|hundesteuer|zweitwohnungs?steuer|grundbesitzabgaben|vorabpauschale|invstg|kapitalertragsteuer|quellensteuer|solidarit[aä]tszuschlag|steuernummer|steuer[- ]?id|steuerbescheid|steuererkl[aä]rung|steuererstattung|est-veranl(?:\.|agung)?|grunderwerbsteuer|grunderwerbssteuer|grundbuchgeb[uü]hr(?:en)?|gerichtsgeb[uü]hr(?:en)?|notarkosten|notargeb[uü]hr(?:en)?|standesamtsgeb[uü]hr(?:en)?|geburtsurkunde|passgeb[uü]hr(?:en)?|ausweisgeb[uü]hr(?:en)?|visageb[uü]hr(?:en)?|visumgeb[uü]hr(?:en)?|tax\s+payment|tax\s+assessment|tax\s+bill|tax\s+return|tax\s+refund|tax\s+office|tax\s+authority|income\s+tax|property\s+tax|sales\s+tax|corporate\s+tax|capital\s+gains\s+tax|council\s+tax|advance\s+tax)\b)/i

const defaultCategoryCache = createBoundedCache<string>()

interface CompiledCustomKeyword {
  category: string
  word: string
  regex?: RegExp
}

// Compiled custom keyword regexes, keyed by the (immutable) customKeywords object from the store.
const compiledCustomKeywordsCache = new WeakMap<Record<string, string[]>, CompiledCustomKeyword[]>()

function compileCustomKeywords(customKeywords: Record<string, string[]>): CompiledCustomKeyword[] {
  const cached = compiledCustomKeywordsCache.get(customKeywords)
  if (cached) return cached

  const compiled: CompiledCustomKeyword[] = []
  for (const [category, words] of Object.entries(customKeywords)) {
    if (!words || words.length === 0) continue
    for (const word of words) {
      if (!word || !word.trim()) continue
      let regex: RegExp | undefined
      try {
        regex = new RegExp(keywordToPattern(word), 'iu')
      } catch {
        regex = undefined
      }
      compiled.push({ category, word: word.toLowerCase(), regex })
    }
  }
  compiledCustomKeywordsCache.set(customKeywords, compiled)
  return compiled
}

function toDisplayCategory(cat: string): string {
  if (cat === 'DiningOut') return 'Dining Out'
  if (cat === 'BankFees') return 'Bank Fees'
  return cat
}

function matchCustomKeywords(d: string, customKeywords: Record<string, string[]>): string | undefined {
  for (const { category, word, regex } of compileCustomKeywords(customKeywords)) {
    const isMatch = regex ? regex.test(d) : d.includes(word)
    if (isMatch) return toDisplayCategory(category)
  }
  return undefined
}

// Regex to detect childcare / school-care fee purposes (e.g. 'KINDERTAGESSTAETTENBEITRAG', 'Kita-Gebuehr', 'Hortbeitrag').
// Municipalities bill these too, so the purpose must win over the municipal authority's default 'Taxes' category.
const CHILDCARE_FEE_REGEX =
  /\b(?:kindertagesst(?:ä|ae|a)tte\w*|kita[- ]?(?:geb(?:ü|ue|u)hr\w*|beitr(?:ä|ae|a)g\w*)|(?:kindergarten|krippen|hort|betreuungs)(?:geb(?:ü|ue|u)hr\w*|beitr(?:ä|ae|a)g\w*)|schulkindbetreuung)/i

// Regex to detect German health insurance context (e.g. 'Krankenvers.', 'Krankenversicherung', 'Krankenvers', 'Krankenkasse', 'Zahnzusatzversicherung')
// to categorize health insurance transactions as Healthcare rather than general Insurance even from multi-line insurers like AXA, Debeka, etc.
export const GERMAN_HEALTH_INSURANCE_REGEX =
  /(?:\b(?:kr(?:anke\s*n|anken)vers\w*|krankenkasse\w*|zahn(?:zu\s*)?satz\w*)\b)/i

// Regex to detect German vehicle or general insurance context (e.g. 'KFZ Versicherung', 'Kfz-Versicherung', 'Autoversicherung', 'Haftpflichtversicherung')
// to categorize policy payments, fees, or broker/comparison portal cashback (e.g. CHECK24 Gutscheinauszahlung) as Insurance.
export const GERMAN_INSURANCE_PURPOSE_REGEX =
  /(?:\b(?:kfz[- ]?vers\w*|auto[- ]?vers\w*|fahrzeug[- ]?vers\w*|motorrad[- ]?vers\w*|haftpflicht\w*|hausrat\w*|rechtsschutz\w*|unfallvers\w*|lebensvers\w*|risikolv\w*|sterbegeld\w*|tierhalterhaftpflicht\w*|hundehaftpflicht\w*|wohngeb[aä]udevers\w*|geb[aä]udevers\w*|versicherungs?(?:auszahlung|beitrag|pr[aä]mie)?)\b)/i

// Regex to detect German travel, vacation, booking, flight, and lodging context (e.g. 'Reise', 'Reisen', 'Reisebuchung', 'Urlaub', 'Pauschalreise', 'Hotel', 'Flug')
// to categorize travel bookings, tour operator packages, or comparison portal cashback/refunds (e.g. CHECK24 Auszahlung Guthaben - fuer Ihre Reise) as Travel.
export const GERMAN_TRAVEL_PURPOSE_REGEX =
  /(?:\b(?:(?:an|ab)?reise\b|reisen\b|reisebuchung\w*|reisedienst\w*|reisepartner\w*|urlaub\w*|pauschalreise\w*|flug(?:buchung|reise|ticket)?\w*|fl[uü]ge\b|hotel(?:buchung|reservierung)?\w*|resort\w*|ferien(?:wohnung|haus|resort)?\w*|kreuzfahrt\w*)\b)/i

// Regex to detect telecommunication, mobile, broadband, and internet contract/cashback context
// (e.g. 'Mobilfunk', 'Handyvertrag', 'Handytarif', 'DSL', 'Glasfaser', 'Internetanschluss', 'Festnetz', 'SIM-Karte', 'eSIM')
// to categorize mobile tariffs, telecom contracts, and comparison portal cashback (e.g. CHECK24 Cashback Mobilfunk) as Communication.
export const GERMAN_COMMUNICATION_PURPOSE_REGEX =
  /(?:\b(?:mobilfunk\w*|handy[- ]?(?:vertrag|tarif|rechnung)\w*|mobil[- ]?funk[- ]?(?:vertrag|tarif)\w*|daten[- ]?tarif\w*|(?:a|v)?dsl\b|glasfaser\w*|festnetz\w*|breitband\w*|sim[- ]?karte\w*|e[- ]?sim\b|telekommunikation\w*|internet[- ]?(?:tarif|vertrag|anschluss|zugang|flatrate)\w*|telefon[- ]?(?:anschluss|rechnung|vertrag|tarif)\w*|mobile\s+(?:tariff|plan|contract)|cellular\s+(?:plan|service))\b)/i

/**
 * Regex to detect explicit dining venue / establishment terms
 * (e.g. 'Restoran', 'Restaurant', 'Bistro', 'Pizzeria', 'Caffe & Restoran', 'Konoba', 'Gostionica', 'Ćevabdžinica', 'Kafana')
 * to ensure dining establishments located inside or affiliated with shopping centers or supermarket chains prioritize Dining Out over Groceries/Shopping.
 */
export const DINING_ESTABLISHMENT_REGEX =
  /(?:\b(?:restoran|restaurant|bistro|pizzeria|pizzaria|trattoria|osteria|konoba|gostionica|caffe\s*&?\s*restoran|kafana|[cć]evabd[zž]inica|grill\s*restoran|steakhouse|brasserie|bäckerei\w*|baeckerei\w*|feinbäckerei\w*|feinbaeckerei\w*|konditorei\w*|brotchen[- ]?macher\w*|brötchen[- ]?macher\w*|brothaus\w*|brot[- ]?haus\w*)\b)/i

/**
 * Regex to detect card payments, POS purchases, and bank/service fee contexts
 * (e.g. 'Entgelt Auslandseinsatz', 'Kartenzahlung', 'Virtual Debit Card', 'POS-Zahlung')
 * to prevent card charges and bank fees containing 'entgelt' from misclassifying as personal Salary.
 */
export const CARD_OR_BANK_FEE_REGEX =
  /(?:\b(?:kartenzahlung|karteneinkauf|pos[- ]?zahlung|pos[- ]?einkauf|virtual\s+debit|debit\s+card|credit\s+card|karte\s+nr|kartenabrechnung|auslandseinsatz|karteneinsatz)\b|\bentgelt\s+(?:auslands|karten|abschluss|konto|depot|info|buchung|service)\w*\b)/i

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
    const customMatch = matchCustomKeywords(d, customKeywords)
    if (customMatch) return customMatch
  }

  // Check cache for default evaluations. Everything below is independent of custom keywords,
  // so results are safely cached regardless of whether custom keywords were supplied.
  const isExpense = options?.type === 'expense' || (typeof options?.amount === 'number' && options.amount < 0)
  const isIncome = options?.type === 'income' || (typeof options?.amount === 'number' && options.amount > 0)
  const cacheKey = `${d}:${isExpense ? 'exp' : isIncome ? 'inc' : 'any'}`

  const cachedCategory = defaultCategoryCache.get(cacheKey)
  if (cachedCategory !== undefined) {
    return cachedCategory
  }

  // 2. High-priority structural commitments: Salary, Rent, Loans, Taxes
  const structuralCategories: (keyof CategoryKeywords)[] = ['Salary', 'Rent', 'Loans', 'Taxes']
  for (const cat of structuralCategories) {
    if (cat === 'Salary') {
      if (INCOME_TAX_REGEX.test(d)) continue
      if (POLISH_ATM_WITHDRAWAL_REGEX.test(d)) continue
      const isExplicitSalaryPayment =
        /\b(?:salary\s+payment|monthly\s+salary|gehaltszahlung|lohnauszahlung|reisespesen|reisesp|reisekosten|spesenabrechnung|spesenerstattung|auslagenerstattung|r[uü]ck[uü]berweisung\w*|rueckueberweisung\w*)\b/i.test(d)
      if (isExpense && !isExplicitSalaryPayment) {
        continue
      }
      if (!isExplicitSalaryPayment && CARD_OR_BANK_FEE_REGEX.test(d)) {
        continue
      }
    }
    if (cat === 'Rent' && CAR_OR_EQUIPMENT_RENTAL_REGEX.test(d)) {
      continue
    }
    if (cat === 'Taxes' && CHILDCARE_FEE_REGEX.test(d)) {
      defaultCategoryCache.set(cacheKey, 'Education')
      return 'Education'
    }
    if (cat === 'Taxes' && SEPA_TRANSFER_REGEX.test(d)) {
      if (!EXPLICIT_TAX_AUTHORITY_OR_DUTY_REGEX.test(d)) {
        continue
      }
    }
    const rx = categoryRegexes[cat]
    if (rx?.test(d)) {
      defaultCategoryCache.set(cacheKey, cat)
      return cat
    }
  }

  // 3. Specific brand/merchant matching (airlines, hotel groups, OTAs, supermarkets, mobility)
  // Higher precedence than generic dictionary terms like 'car' or payment processors
  const popularCat = findPopularMerchantCategory(d.toLowerCase())
  if (popularCat) {
    if (popularCat === 'Dining Out' && GERMAN_CITY_ESSEN_REGEX.test(d)) {
      // Ignore false positives from city of Essen
    } else if (popularCat === 'Insurance' && GERMAN_HEALTH_INSURANCE_REGEX.test(d)) {
      defaultCategoryCache.set(cacheKey, 'Healthcare')
      return 'Healthcare'
    } else if ((popularCat === 'Groceries' || popularCat === 'Shopping') && DINING_ESTABLISHMENT_REGEX.test(d)) {
      defaultCategoryCache.set(cacheKey, 'Dining Out')
      return 'Dining Out'
    } else if (popularCat === 'Shopping' && GERMAN_HEALTH_INSURANCE_REGEX.test(d)) {
      defaultCategoryCache.set(cacheKey, 'Healthcare')
      return 'Healthcare'
    } else if (popularCat === 'Shopping' && GERMAN_INSURANCE_PURPOSE_REGEX.test(d)) {
      defaultCategoryCache.set(cacheKey, 'Insurance')
      return 'Insurance'
    } else if (
      (popularCat === 'Shopping' || popularCat === 'Services' || popularCat === 'Insurance') &&
      GERMAN_TRAVEL_PURPOSE_REGEX.test(d)
    ) {
      defaultCategoryCache.set(cacheKey, 'Travel')
      return 'Travel'
    } else if (
      (popularCat === 'Shopping' || popularCat === 'Services' || popularCat === 'Insurance' || popularCat === 'Other') &&
      GERMAN_COMMUNICATION_PURPOSE_REGEX.test(d)
    ) {
      defaultCategoryCache.set(cacheKey, 'Communication')
      return 'Communication'
    } else {
      defaultCategoryCache.set(cacheKey, popularCat)
      return popularCat
    }
  }

  // Health insurance priority check (e.g. 'Krankenvers.', 'Krankenversicherung', 'Krankenkasse', 'Zahnzusatzversicherung')
  // categorized as Healthcare rather than falling into general Insurance or Other
  if (GERMAN_HEALTH_INSURANCE_REGEX.test(d)) {
    defaultCategoryCache.set(cacheKey, 'Healthcare')
    return 'Healthcare'
  }

  // General/vehicle insurance priority check (e.g. 'KFZ Versicherung', 'Kfz-Versicherung', 'Haftpflichtversicherung')
  // categorized as Insurance rather than falling into general Shopping or Other
  if (GERMAN_INSURANCE_PURPOSE_REGEX.test(d)) {
    defaultCategoryCache.set(cacheKey, 'Insurance')
    return 'Insurance'
  }

  // Travel priority check (e.g. 'Reise', 'Reisen', 'Urlaub', 'Pauschalreise', 'Hotel', 'Flug')
  // categorized as Travel rather than falling into general Shopping or Other
  if (GERMAN_TRAVEL_PURPOSE_REGEX.test(d)) {
    defaultCategoryCache.set(cacheKey, 'Travel')
    return 'Travel'
  }

  // Telecommunication / mobile / broadband priority check (e.g. 'Mobilfunk', 'Handyvertrag', 'DSL', 'Glasfaser')
  // categorized as Communication rather than falling into general Shopping, Other, or generic dictionary matching
  if (GERMAN_COMMUNICATION_PURPOSE_REGEX.test(d)) {
    defaultCategoryCache.set(cacheKey, 'Communication')
    return 'Communication'
  }

  // Explicit dining establishment venue indicators (e.g. 'Restoran', 'Restaurant', 'Bistro', 'Pizzeria')
  // take precedence over general grocery or shopping dictionaries
  if (DINING_ESTABLISHMENT_REGEX.test(d) && !GERMAN_CITY_ESSEN_REGEX.test(d)) {
    defaultCategoryCache.set(cacheKey, 'Dining Out')
    return 'Dining Out'
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

      const result = toDisplayCategory(cat)
      defaultCategoryCache.set(cacheKey, result)
      return result
    }
  }

  // 5. Transfers & Payment processor fallback (e.g. direct PayPal/Klarna without specific retail merchant)
  if (isPaymentProcessorIntermediary(d)) {
    defaultCategoryCache.set(cacheKey, 'Shopping')
    return 'Shopping'
  }

  if (
    transferMerchantsRegex?.test(d) ||
    categoryRegexes.Transfers?.test(d) ||
    (SEPA_TRANSFER_REGEX.test(d) && !COMMERCIAL_SEPA_REGEX.test(d))
  ) {
    defaultCategoryCache.set(cacheKey, 'Transfers')
    return 'Transfers'
  }

  defaultCategoryCache.set(cacheKey, 'Other')
  return 'Other'
}
