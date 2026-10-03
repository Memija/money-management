import { POPULAR_MERCHANTS } from '../../data/merchants'
import { type CategoryKeywords, translations } from '../../i18n/translations'
import { repairBrokenWords } from './description-cleaning'

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

const merchantCategoryRegexes: Partial<Record<keyof CategoryKeywords, RegExp>> = {}
for (const [cat, words] of Object.entries(merchantCategoryPatterns)) {
  const uniqueWords = [...new Set(words)]
  const patterns = uniqueWords.map(keywordToPattern).filter(Boolean)
  if (patterns.length > 0) {
    merchantCategoryRegexes[cat as keyof CategoryKeywords] = new RegExp(patterns.join('|'), 'iu')
  }
}

let transferMerchantsRegex: RegExp | undefined
if (transferMerchantPatterns.length > 0) {
  const patterns = [...new Set(transferMerchantPatterns)].map(keywordToPattern).filter(Boolean)
  if (patterns.length > 0) {
    transferMerchantsRegex = new RegExp(patterns.join('|'), 'iu')
  }
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
  /(?:\b(?:car[- ]?rent(?:al)?|rent[- ]?a[- ]?car|rental[- ]?car|autovermietung|auto[- ]?miete|fahrzeug(?:ver)?miete|equipment[- ]?rent(?:al)?|tool[- ]?rent(?:al)?)\b)/i

// Regex to detect income tax context (e.g. 'Income Tax', 'Einkommensteuer')
// to prevent tax payments/refunds from misclassifying as personal Salary.
const INCOME_TAX_REGEX =
  /(?:\b(?:income\s+tax|einkommensteuer|podatek\s+dochodowy|porez\s+na\s+dohodak|pajak\s+penghasilan|pph)\b)/i

// Regex to detect cash withdrawal in Polish context (e.g. 'Wypłata z bankomatu', 'Wypłata gotówki')
// to prevent ATM withdrawals from misclassifying as personal Salary (wypłata).
const POLISH_ATM_WITHDRAWAL_REGEX =
  /(?:\b(?:wyp[lł]ata|wyplata)\s+(?:z\s+bankomatu|got[oó]wki|w\s+bankomacie)\b)/i

const defaultCategoryCache = new Map<string, string>()

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
          /\b(?:salary\s+payment|monthly\s+salary|gehaltszahlung|lohnauszahlung)\b/i.test(d)
        if (!isExplicitSalaryPayment) continue
      }
    }
    if (cat === 'Rent' && CAR_OR_EQUIPMENT_RENTAL_REGEX.test(d)) {
      continue
    }
    const rx = categoryRegexes[cat]
    if (rx?.test(d)) {
      if (!customKeywords) defaultCategoryCache.set(cacheKey, cat)
      return cat
    }
  }

  // 3. Specific brand/merchant matching (airlines, hotel groups, OTAs, supermarkets, mobility)
  // Higher precedence than generic dictionary terms like 'car' or payment processors
  for (const [cat, rx] of Object.entries(merchantCategoryRegexes)) {
    if (rx?.test(d)) {
      if (cat === 'DiningOut' && GERMAN_CITY_ESSEN_REGEX.test(d)) {
        continue
      }
      const result =
        cat === 'DiningOut' ? 'Dining Out' : cat === 'BankFees' ? 'Bank Fees' : cat
      if (!customKeywords) defaultCategoryCache.set(cacheKey, result)
      return result
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
    'Savings',
  ]

  if (isIncome) {
    order = [
      'Savings',
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
      'BankFees',
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
  if (transferMerchantsRegex?.test(d) || categoryRegexes.Transfers?.test(d)) {
    if (!customKeywords) defaultCategoryCache.set(cacheKey, 'Transfers')
    return 'Transfers'
  }

  if (!customKeywords) {
    defaultCategoryCache.set(cacheKey, 'Other')
  }
  return 'Other'
}
