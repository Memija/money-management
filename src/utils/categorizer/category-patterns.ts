import { POPULAR_MERCHANTS } from '../../data/merchants'
import { categoryTermsByLocale } from '../../i18n/category-terms'
import type { CategoryKeywords } from '../../i18n/types'
import { getCandidateMerchants } from '../merchant-index'
import { matchesLowercaseTerm } from '../regex-utils'
import { NON_RETAIL_OTTO_REGEX } from './description-cleaning'
import { buildKeywordRegex } from './keyword-compiler'

// 1. Build aggregated keywords across all locales
export const aggregatedKeywords: Record<string, string[]> = {}

for (const terms of Object.values(categoryTermsByLocale)) {
  const keywords = terms.keywords
  if (keywords) {
    for (const [cat, words] of Object.entries(keywords)) {
      if (!aggregatedKeywords[cat]) {
        aggregatedKeywords[cat] = []
      }
      aggregatedKeywords[cat].push(...words)
    }
  }
}

// 2. Separate specific POPULAR_MERCHANTS into distinct high-precedence merchant patterns
export const merchantCategoryPatterns: Record<string, string[]> = {}
export const transferMerchantPatterns: string[] = []

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
    if (!merchantCategoryPatterns[cat]) {
      merchantCategoryPatterns[cat] = []
    }
    merchantCategoryPatterns[cat].push(...words)
  }
}

export const transferMerchantsRegex = buildKeywordRegex(transferMerchantPatterns)

const PAYMENT_PROCESSOR_IDS = new Set<string>([
  'paypal',
  'klarna',
  'stripe',
  'sumup',
  'payoneer',
  'payone',
])

// Integrate POPULAR_MERCHANTS into aggregatedKeywords as fallback
for (const [cat, words] of Object.entries(merchantCategoryPatterns)) {
  if (!aggregatedKeywords[cat]) {
    aggregatedKeywords[cat] = []
  }
  aggregatedKeywords[cat].push(...words)
}
if (!aggregatedKeywords.Transfers) {
  aggregatedKeywords.Transfers = []
}
aggregatedKeywords.Transfers.push(...transferMerchantPatterns)

// 3. Compile high-precision boundary regexes per category
export const categoryRegexes: Partial<Record<keyof CategoryKeywords, RegExp>> = {}

for (const [cat, words] of Object.entries(aggregatedKeywords)) {
  const regex = buildKeywordRegex(words)
  if (regex) {
    categoryRegexes[cat as keyof CategoryKeywords] = regex
  }
}

export const GERMAN_CITY_ESSEN_REGEX =
  /(?:\b(?:hbf|hauptbahnhof|sparkasse|stadt|messe|klinikum|uni|universit[aä]t|rathaus|amtsgericht)\s+essen\b|\bessen\s+(?:hbf|hauptbahnhof|messe|klinikum|rathaus)\b)/i

export const CAR_OR_EQUIPMENT_RENTAL_REGEX =
  /(?:\b(?:car[- ]?rent(?:al)?|rent[- ]?a[- ]?car|rental[- ]?car|autovermietung|auto[- ]?miete|fahrzeug(?:ver)?miete|equipment[- ]?rent(?:al)?|tool[- ]?rent(?:al)?|uber[- ]?rent)\b)/i

export const INCOME_TAX_REGEX =
  /(?:\b(?:income\s+tax|einkommensteuer|podatek\s+dochodowy|porez\s+na\s+dohodak|pajak\s+penghasilan|pph)\b)/i

export const POLISH_ATM_WITHDRAWAL_REGEX =
  /(?:\b(?:wyp[lł]ata|wyplata)\s+(?:z\s+bankomatu|got[oó]wki|w\s+bankomacie)\b)/i

export const SEPA_TRANSFER_REGEX =
  /(?:\b[a-z0-9_-]+\.\d+\.(?:ue|da|ee|ta|sct|inst)(?:\.[a-z0-9_-]+)?\b|\bcd-sct-[a-z0-9_-]+\b|\b(?:end-to-end-ref\b.*\bkundenreferenz\b|\bkundenreferenz\b.*\bend-to-end-ref\b)|\b(?:end-to-end-ref|kundenreferenz)\s*:\s*(?:notprovided|null|\d{8}-[a-z0-9_-]+|[a-z0-9_.-]*(?:ue|da|ee|ta|sct|inst|mob|si)[a-z0-9_.-]*)\b|\b(?:sepa[- ]?)?(?:credit[- ]?transfer|ueberweisung|überweisung|dauerauftrag|umbuchung|bank[uü]berweisung|bank[- ]?transfer|wire[- ]?transfer|money[- ]?(?:transfer|back)|geld[- ]?zur[uü]ck|sent\s+from|echtzeit[uü]berweisung|echtzeit[- ]?[uü]berweisung|instant[- ]?transfer|instant[- ]?payment)\b|(?:\b[a-z]{4}[a-z]{2}[a-z0-9]{2}(?:[a-z0-9]{3})?\s+[a-z]{2}\d{2}[a-z0-9]{11,30}\b|\b[a-z]{2}\d{2}[a-z0-9]{11,30}\b).*\b(?:end-to-end-ref|kundenreferenz)\b|\b(?:max(?:\s+mustermann)?\s*(?:o\.?|oder|u\.?|und|i|ili|\/|&|,)\s*erika\s*mustermann|erika(?:\s+mustermann)?\s*(?:o\.?|oder|u\.?|und|i|ili|\/|&|,)\s*max\s*mustermann)\b)/i

export const COMMERCIAL_SEPA_REGEX =
  /(?:\b(?:order|bestellung|auftrag|rechnung|invoice|rg\.?)\s*[:#.-]?\s*\d|\b(?:citideffxxx)\b|\bde\d{2}50210900\d{10}\b|\b(?:mandatsref|mandatsreferenz|gl[aä]ubiger[- ]?id|sepa[- ]?(?:basis|firmen)?[- ]?lastschrift|lastschrift\b))/i

export const EXPLICIT_TAX_AUTHORITY_OR_DUTY_REGEX =
  /(?:\b(?:finanzamt|finanzkasse|bundeskasse|steuerverwaltung|steuerbeh[oö]rde|irs|hmrc|cra|belastingdienst|dgfip|agenzia\s+delle\s+entrate|agencia\s+tributaria|receita\s+federal|porezn[ae]|poresk[ae]|urzad\s+skarbowy|urząd\s+skarbowy|dirjen\s+pajak|wundertax|taxfix|smartsteuer|elster|wiso\s*steuer|buhl\s*data|gerichtkasse|gerichtskasse|justizkasse|landesjustizkasse|oberlandesgerichtskasse|zentrale\s+gerichtskasse|grundbuchamt|notar|notariat|f[aä]rber\s*(?:und|&)\s*hutzel|fa\s+[a-zäöüß]+|stadtkasse|gemeindekasse|stadtverwaltung|gemeindeverwaltung|standesamt|standesamtskasse|konsulat|generalkonsulat|generalkosulat|botschaft|embassy|consulate)\b|\b(?:einkommensteuer|grundsteuer|gewerbesteuer|umsatzsteuer|kirchensteuer|hundesteuer|zweitwohnungs?steuer|grundbesitzabgaben|vorabpauschale|invstg|kapitalertragsteuer|quellensteuer|solidarit[aä]tszuschlag|steuernummer|steuer[- ]?id|steuerbescheid|steuererkl[aä]rung|steuererstattung|est-veranl(?:\.|agung)?|grunderwerbsteuer|grunderwerbssteuer|grundbuchgeb[uü]hr(?:en)?|gerichtsgeb[uü]hr(?:en)?|notarkosten|notargeb[uü]hr(?:en)?|standesamtsgeb[uü]hr(?:en)?|geburtsurkunde|passgeb[uü]hr(?:en)?|ausweisgeb[uü]hr(?:en)?|visageb[uü]hr(?:en)?|visumgeb[uü]hr(?:en)?|tax\s+payment|tax\s+assessment|tax\s+bill|tax\s+return|tax\s+refund|tax\s+office|tax\s+authority|income\s+tax|property\s+tax|sales\s+tax|corporate\s+tax|capital\s+gains\s+tax|council\s+tax|advance\s+tax)\b)/i

export const CHILDCARE_FEE_REGEX =
  /\b(?:kindertagesst(?:ä|ae|a)tte\w*|kita[- ]?(?:geb(?:ü|ue|u)hr\w*|beitr(?:ä|ae|a)g\w*)|(?:kindergarten|krippen|hort|betreuungs)(?:geb(?:ü|ue|u)hr\w*|beitr(?:ä|ae|a)g\w*)|schulkindbetreuung)/i

export const GERMAN_HEALTH_INSURANCE_REGEX =
  /(?:\b(?:kr(?:anke[-\s]*n|anken)[-\s]*vers\w*|kranken[-\s]*kasse\w*|krankenkasse\w*|zahn[-\s]*(?:zu[-\s]*)?satz\w*|zahn[-\s]*vers\w*|dental[-\s]*vers\w*)\b)/i

export const GERMAN_INSURANCE_PURPOSE_REGEX =
  /(?:\b(?:kfz[- ]?vers\w*|auto[- ]?vers\w*|fahrzeug[- ]?vers\w*|motorrad[- ]?vers\w*|haftpflicht\w*|hausrat\w*|rechtsschutz\w*|unfallvers\w*|lebensvers\w*|risikolv\w*|sterbegeld\w*|tierhalterhaftpflicht\w*|hundehaftpflicht\w*|wohngeb[aä]udevers\w*|geb[aä]udevers\w*|restkreditvers\w*|restschuldvers\w*|ratenschutz\w*|kreditschutz\w*|darlehensschutz\w*|kreditvers\w*|iptiq\w*|versicherungs?(?:auszahlung|beitrag|pr[aä]mie)?)\b|\b[a-z]{2}\d{2}ver\d{10,25}\b)/i

export const CREDIT_INSURANCE_REGEX =
  /(?:\b(?:restkreditvers\w*|restschuldvers\w*|ratenschutz(?:vers\w*)?|kreditschutz\w*|darlehensschutz\w*|kreditvers\w*|darlehensvers\w*|kreditleben\w*|credit\s*life\w*|iptiq(?:\s+life)?\b|aeguron\b|cardif\b|alpha\s*kredit\s*-\s*2\b|alpha\s*kredit\s+ratenschutz\w*)\b|\b[a-z]{2}\d{2}ver\d{10,25}\b)/i

export const GERMAN_TRAVEL_PURPOSE_REGEX =
  /(?:\b(?:(?:an|ab)?reise\b|reisen\b|reisebuchung\w*|reisedienst\w*|reisepartner\w*|urlaub\w*|pauschalreise\w*|flug(?:buchung|reise|ticket)?\w*|fl[uü]ge\b|hotel(?:buchung|reservierung)?\w*|resort\w*|ferien(?:wohnung|haus|resort)?\w*|kreuzfahrt\w*)\b)/i

export const GERMAN_COMMUNICATION_PURPOSE_REGEX =
  /(?:\b(?:mobilfunk\w*|handy[- ]?(?:vertrag|tarif|rechnung)\w*|mobil[- ]?funk[- ]?(?:vertrag|tarif)\w*|daten[- ]?tarif\w*|(?:a|v)?dsl\b|glasfaser\w*|festnetz\w*|breitband\w*|sim[- ]?karte\w*|e[- ]?sim\b|telekommunikation\w*|internet[- ]?(?:tarif|vertrag|anschluss|zugang|flatrate)\w*|telefon[- ]?(?:anschluss|rechnung|vertrag|tarif)\w*|mobile\s+(?:tariff|plan|contract)|cellular\s+(?:plan|service))\b)/i

export const DINING_ESTABLISHMENT_REGEX =
  /(?:\b(?:restoran|restaurant|resto|restos|bistro|pizzeria|pizzaria|trattoria|osteria|konoba|gostionica|caffe\s*&?\s*restoran|kafana|[cć]evabd[zž]inica|grill\s*restoran|steakhouse|brasserie|bäckerei\w*|baeckerei\w*|feinbäckerei\w*|feinbaeckerei\w*|konditorei\w*|brotchen[- ]?macher\w*|brötchen[- ]?macher\w*|brothaus\w*|brot[- ]?haus\w*)\b)/i

export const BUTCHER_MEAT_SHOP_REGEX =
  /(?:\b(?:metzgerei\w*|feinkostmetzgerei\w*|landmetzgerei\w*|fleischerei\w*|schlachterei\w*|metzger\w*|fleischer\w*|schlachter\w*|fleischmarkt\w*|fleischwaren\w*|wurstwaren\w*|butcher(?:s|\s+shop)?|meat\s*(?:shop|market|store)|mesnica\w*|mesara\w*|rze[zź]nik\w*|sklep\s+mi[eę]sny|toko\s+daging)\b)/i

export const REMITTANCE_TRANSFER_REGEX =
  /(?:\b(?:western\s*union\w*|westernunion\w*|wu\.com|money[- ]?gram\w*|remitly\w*|ria\s+money\w*|world\s*remit\w*|small\s*world\s*money\w*|transferwise\b|money\s*transfer\w*|geldtransfer\w*|bargeldtransfer\w*|auslands[uü]berweisung\w*|auslandsueberweisung\w*|international\s+money\s+transfer\w*|remittance\w*|slanje\s+novca\w*|przelew\s+zagraniczny\w*|transfer\s+uang\w*)\b)/i

export const AI_AND_SOFTWARE_SUBSCRIPTION_REGEX =
  /(?:\b(?:openai\w*|chatgpt\w*|anthropic\w*|claude\.ai\w*|midjourney\w*|perplexity(?:\.ai)?\w*|cursor(?:\.sh|\.com)?\b|anysphere\w*|google\s+p\s*ayment\s+ireland\w*|google\s+payment\s+ireland\w*|google\s+ireland(?:\s+ltd)?\b|google\s+(?:gemini|one|workspace|cloud|storage)\b)\b)/i

export const CARD_OR_BANK_FEE_REGEX =
  /(?:\b(?:kartenzahlung|karteneinkauf|pos[- ]?zahlung|pos[- ]?einkauf|virtual\s+debit|debit\s+card|credit\s+card|karte\s+nr|kartenabrechnung|auslandseinsatz|karteneinsatz)\b|\bentgelt\s+(?:auslands|karten|abschluss|konto|depot|info|buchung|service)\w*\b)/i

export function findPopularMerchantCategory(textLower: string): string | undefined {
  let bestDirectCategory: string | undefined
  let bestDirectScore = 0
  let bestProcessorCategory: string | undefined
  let bestProcessorScore = 0

  for (const { merchant, keywordLower: kw, aliasesLower, nameLower } of getCandidateMerchants(
    textLower,
  )) {
    if (merchant.category === 'Transfers' && !REMITTANCE_TRANSFER_REGEX.test(merchant.keyword)) {
      continue
    }
    if (merchant.id === 'otto' && NON_RETAIL_OTTO_REGEX.test(textLower)) {
      continue
    }
    let score = 0
    if (matchesLowercaseTerm(textLower, kw)) {
      score = kw.length
    }

    for (const a of aliasesLower) {
      if (matchesLowercaseTerm(textLower, a)) {
        score = Math.max(score, a.length)
      }
    }

    if (score > 0 && (kw === textLower || nameLower === textLower)) {
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
