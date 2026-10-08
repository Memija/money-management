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
  [/(?:rg|rechnungs?)[-\s]+(?:n\s*r|nr)\.?/iu, 'RG-Nr.'],
  [/(?:b|bo|boo)[-\s]+(?:ooking|oking|king)/iu, 'Booking'],
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
  [/(?:r(?:ü|ue)ck)[-\s]+(?:verg(?:ü|ue)tung)/iu, 'Rückvergütung'],
  [/(?:geb(?:ü|ue)hren)[-\s]+(?:erstattung)/iu, 'Gebührenerstattung'],
  [
    /(?:service|serviceg|servicege|serviceges)[-\s]+(?:gesellschaft|esellschaft|sellschaft|ellschaft)/iu,
    'Servicegesellschaft',
  ],
  [/(?:verkehr|verkehrs|verkehrsve|verkehrsver)[-\s]+(?:verbund|erbund|rbund|bund)/iu, 'Verkehrsverbund'],
  [/(?:reise|reisebu|reisebuch)[-\s]+(?:buchung|chung)/iu, 'Reisebuchung'],
  [
    /(?:rheinische)[-\s]+(?:elektrizit[aä]ts)[-\s]+(?:und)[-\s]+(?:gasve)\s+(?:rsorgungsgesellscha|rsorgungsgesellschaft)/iu,
    'Rheinische Elektrizitäts- und Gasversorgungsgesellschaft',
  ],
  [
    /(?:gasve)[-\s]+(?:rsorgungsgesellscha|rsorgungsgesellschaft)/iu,
    'Gasversorgungsgesellschaft',
  ],
  [/(?:financial\s+service)\s+(?:s)\s+(?:gmbh)/iu, 'Financial Services GmbH'],
  [/(?:lastschrif)\s+(?:t)\b/iu, 'Lastschrift'],
  [/(?:y)[-\s]*(?:pal)\b/iu, 'PayPal'],
  [/(?:ih)[-\s]+(?:r)\b/iu, 'Ihr'],
  [/(?:ko)[-\s]+(?:nto)\b/iu, 'Konto'],
  [/(?:paypal)[-\s]+(?:konto)\b/iu, 'PayPal-Konto'],
  [/\b(?:foundatio)\b/iu, 'Foundation'],
  [/\b(?:limite)\b/iu, 'Limited'],
  [/\beinkau\s+f\b/iu, 'Einkauf'],
  [/\bdeut\s+schland\b/iu, 'Deutschland'],
  [/\brothenburg\s+o\s+b\b/iu, 'Rothenburg ob'],
  [/\bc\s+o\.\s*ltd\b/iu, 'Co. Ltd'],
  [/\bautobahn\s+en\b/iu, 'Autobahnen'],
  [/\bschnellstrasen[-\s]*fina\b/iu, 'Schnellstraßen-Finanzierungs'],
  [/\bst\s+udium\b/iu, 'Studium'],
  [/\bdeutsche\s+r\b/iu, 'Deutscher'],
  [/\bmar\s+kets\b/iu, 'Markets'],
  [/\bmega[-\s]*hol\s+z\b/iu, 'Mega-Holz'],
  [/\bthalia\s+bucher\b/iu, 'Thalia Bücher'],
  [/\bs\s*\.\s*a\s*r\s*\.\s*l\b/iu, 'S.a.r.l'],
  [/\bauthenti\s+c\s+play\b/iu, 'authentic play'],
  [/\bube\s+r\b/iu, 'Uber'],
  [/\bpdf\s+conv\s+erter\b/iu, 'PDF Converter'],
  [/\bconv\s+erter\b/iu, 'Converter'],
  [/\bheise\s+me\s+dien\b/iu, 'Heise Medien'],
  [/\bme\s+dien\b/iu, 'Medien'],
  [/\braj\s+toy\b(?!\s*s)/iu, 'Raj Toys'],
  [/\bstadt\s+bad\s+hombg\b/iu, 'Stadt Bad Homburg'],
  [/\b(?:bad\s+)?hombur\s+g\b/iu, 'Bad Homburg'],
  [/\bfahrerlaubnisbehoerde\b/iu, 'Fahrerlaubnisbehörde'],
  [/\bantra\s+g\b/iu, 'Antrag'],
  [/\bneu\s+e\b/iu, 'neue'],
  [/(?:gutschein)[-\s]+(?:auszahlung)/iu, 'Gutscheinauszahlung'],
  [/\bkranke\s+nversicher/iu, 'Krankenversicher'],
  [/\bzahnzu\s+satzversicher/iu, 'Zahnzusatzversicher'],
  [/\bgermany\s+rel\b/iu, 'Dell Germany'],
  [/\breisesp\.(?=\d)/iu, 'Reisespesen '],
  [/\breisesp\b\.?/iu, 'Reisespesen'],
  [/\breisespesen\.(?=\d)/iu, 'Reisespesen '],
  [/\breisekosten\.(?=\d)/iu, 'Reisekosten '],
  [/(?:velika\s+kopa)\s+(?:n)\b/iu, 'Velika Kopanica'],
  [/(?:wasserpal)\b/iu, 'Wasserpalast'],
  [/(?:wunder|wundert|wunderta)[-\s]+(?:tax|ax|x)/iu, 'Wundertax'],
  [/(?:tax)[-\s]+(?:fix)/iu, 'Taxfix'],
  [/(?:gericht|gerichts)[-\s]+(?:kasse)/iu, 'Gerichtskasse'],
  [/(?:justiz|landesjustiz)[-\s]+(?:kasse)/iu, 'Justizkasse'],
  [/(?:grund|grunderwerb)[-\s]+(?:steuer|erwerbsteuer)/iu, 'Grunderwerbsteuer'],
  [/(?:grund)[-\s]+(?:buchamt)/iu, 'Grundbuchamt'],
  [/(?:smart)[-\s]+(?:steuer)/iu, 'Smartsteuer'],
  [/(?:fa)[-\s]+(?:nidda)/iu, 'Finanzamt Nidda'],
  [/(?:fa)[-\s]+(?:frankfurt)/iu, 'Finanzamt Frankfurt'],
  [/(?:fa)[-\s]+(?:wiesbaden)/iu, 'Finanzamt Wiesbaden'],
  [/(?:fa)[-\s]+(?:darmstadt)/iu, 'Finanzamt Darmstadt'],
  [/(?:fa)[-\s]+(?:kassel)/iu, 'Finanzamt Kassel'],
  [/(?:fa)[-\s]+(?:gie(?:ß|ss)en)/iu, 'Finanzamt Gießen'],
  [/(?:fa)[-\s]+(?:offenbach)/iu, 'Finanzamt Offenbach'],
  [/(?:fa)[-\s]+(?:m[uü]nchen)/iu, 'Finanzamt München'],
  [/(?:fa)[-\s]+(?:berlin)/iu, 'Finanzamt Berlin'],
  [/(?:fa)[-\s]+(?:hamburg)/iu, 'Finanzamt Hamburg'],
  [/(?:fa)[-\s]+(?:k[oö]ln)/iu, 'Finanzamt Köln'],
  [/(?:fa)[-\s]+(?:stuttgart)/iu, 'Finanzamt Stuttgart'],
  [/(?:fa)[-\s]+(?:d[uü]sseldorf)/iu, 'Finanzamt Düsseldorf'],
  [/(?:fa)[-\s]+(?:leipzig)/iu, 'Finanzamt Leipzig'],
  [/(?:fa)[-\s]+(?:dresden)/iu, 'Finanzamt Dresden'],
  [/(?:fa)[-\s]+(?:hannover)/iu, 'Finanzamt Hannover'],
  [/(?:fa)[-\s]+(?:n[uü]rnberg)/iu, 'Finanzamt Nürnberg'],
  [/(?:est)[-\s]+(?:veranl|veranlagung)\.?/iu, 'EST-Veranlagung'],
  [/(?:intra)[-\s]+(?:tec)/iu, 'INTRA-TEC'],
  [/(?:färber|faerber)[-\s]+(?:und|&)[-\s]+(?:hutzel)/iu, 'Färber und Hutzel'],
  [/(?:notar|notari)[-\s]+(?:at|atskosten|kosten)/iu, 'Notarkosten'],
  [/(?:kautions|kaution|kaut|kau)[-\s]+(?:abrechnung|rechnung|nung)/iu, 'Kautionsabrechnung'],
  [/(?:mietkautions|mietkaution)[-\s]+(?:abrechnung|rechnung|nung)/iu, 'Mietkautionsabrechnung'],
  [/(?:miet)[-\s]+(?:kaution)/iu, 'Mietkaution'],
  [/(?:c)[-\s]+(?:hrista)/iu, 'Christa'],
  [/(?:an\s+de)[-\s]+(?:r)/iu, 'An der'],
  [/(?:hauptv|hauptver|hauptverb)[-\s]+(?:erband|rband|band)/iu, 'Hauptverband'],
  [/(?:jugendherberg|jugendherbergs)[-\s]+(?:werk)/iu, 'Jugendherbergswerk'],
  [/(?:krankenversicheru|krankenversicher)[-\s]+(?:ng|ung)/iu, 'Krankenversicherung'],
  [/(?:haftpflicht)[-\s]+(?:kasse)/iu, 'Haftpflichtkasse'],
  [/(?:standes)[-\s]+(?:amt)/iu, 'Standesamt'],
  [/(?:general)[-\s]+(?:konsulat|kosulat)|(?:generalkosulat)/iu, 'Generalkonsulat'],
  [/(?:bosnienherzegow|bosnienherzegowina|bosnien-herzegowina)\.?/iu, 'Bosnien und Herzegowina'],
  [/(?:selbstbesti)[-\s]+(?:mmtes|mmte|mmt)/iu, 'selbstbestimmtes'],
  [/(?:wgv)[-\s]+(?:wuertt|w\u00fcrtt)\.?/iu, 'WGV-Wuertt.'],
  [/(?:privathaftpflicht)[-\s]+(?:v\s*ersicherungsnummer|versicherungsnummer)/iu, 'Privathaftpflicht-Versicherungsnummer'],
  [/(?:v)[-\s]+(?:ersicherungsnummer)/iu, 'Versicherungsnummer'],
  [/(?:sc)[-\s]+(?:huhe|huh)/iu, 'Schuhe'],
  [/(?:i)[-\s]+(?:hre|hren|hrem|hrer)/iu, 'Ihre'],
  [/(?:rechnu)[-\s]+(?:ng)/iu, 'Rechnung'],
  [/(?:vi)[-\s]+(?:ele)/iu, 'Viele'],
  [/(?:disneypl)[-\s]+(?:us)\b/iu, 'DisneyPlus'],
  [/\b(?:disneypl)\b/iu, 'DisneyPlus'],
  [/(?:salzburger)[-\s]+(?:jugendherbe)\b/iu, 'Salzburger Jugendherberge'],
  [/\bZELL\s+AM\s+SEE\s+A\s+T\b/iu, 'ZELL AM SEE AT'],
  [/(?:raststaette|raststaett)[-\s]+(?:spessart)/iu, 'Raststätte Spessart'],
  [/(?:cabanas)[-\s]+(?:tavi)\s+r\b/iu, 'Cabanas Tavira'],
  [/\bCABANAS\s+TAVI\s+R\b/iu, 'CABANAS TAVIRA'],
  [/(?:delhis)[-\s]+(?:belly)/iu, 'Delhis Belly'],
  [/\bUNIPES\b/iu, 'Unipessoal'],
  [/(?:ros|ross)[-\s]+(?:smann|mann)\b/iu, 'Rossmann'],
  [/\b(?:u|ub|ube)[-\s]+(?:ber|er|r)\b/iu, 'Uber'],
  // English line-break word splits
  [/(?:pu|pur|purch)[-\s]+(?:rchase|chase|ase)/iu, 'Purchase'],
  [/(?:with)[-\s]+(?:draw)[-\s]+(?:al)|(?:with|withdr|withdra)[-\s]+(?:drawal|awal|wal)/iu, 'Withdrawal'],
  [/(?:pay)[-\s]+(?:roll)/iu, 'Payroll'],
  [/(?:grocer)[-\s]+(?:ies)|(?:groce)[-\s]+(?:ries)/iu, 'Groceries'],
  [/(?:trans)[-\s]+(?:fer)/iu, 'Transfer'],
  [/(?:holi|holid|holiday)[-\s]+(?:day|days|s)/iu, 'Holidays'],
  [/(?:holi)[-\s]+(?:day)/iu, 'Holiday'],
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

  // 2. Strip SEPA reference metadata tags, remittance instructions, and everything following them when appended at the end
  // Handles: End-to-End-Ref.: ..., End to End Ref: ..., EREF+..., KREF+..., MREF+..., CRED+...,
  // DEBT+..., SVWZ+..., Mandatsref: ..., Referenz: ..., Reference: ..., Ref. Nr: ..., IBAN: ..., BIC: ...,
  // Kunden-Nr.: ..., Rechnungsnr: ..., Vertrags-Nr.: ..., Zählernummer: ...,
  // Bitte geben Sie bei Bezahlung / Zahlung / Überweisung ...
  cleaned = cleaned.replace(
    /(?:\b(?:End[-\s]?to[-\s]?(?:End[-\s]?(?:Ref(?:\.|erenz|-Id)?)?|Ref(?:\.|erenz|-Id)?)?|EREF|KREF|MREF|CRED|DEBT|SVWZ|Mandatsref(?:\.|erenz)?|Referenz|Reference|Ref(?:\.|\s*Nr\.?)?|Gl[aä]ubiger[-\s]?ID|SEPA[-\s]?(?:BASIS|FIRMEN)?[-\s]?LASTSCHRIFT|(?:von\s+)?(?:Karte|Card)[-\s.]?(?:Nr(?:\.|erenz)?|nummer)?|Card[-\s]?ID|(?:Kd|Kunden|Pers|Personen|Personal)[-\s.]?(?:Nr(?:\.|erenz)?|nummer)?|(?:Rg|Rechnungs?)[-\s.]?(?:Nr(?:\.|erenz)?|nummer)?|Vertrags[-\s]?(?:Nr(?:\.|erenz)?|nummer)|Z[aä]hler[-\s]?(?:Nr(?:\.|erenz)?|nummer)|Akten[-\s]?(?:zeichen|nr(?:\.|erenz)?|nummer)|\bAz(?:\.|\s*Nr\.?)?\b)\s*[:+.-]?|\b(?:IBAN|BIC)\s*:\s*[A-Z0-9]+|\bBitte\s+(?:geben\s+Sie\s+)?(?:bei\s+)?(?:der\s+)?(?:Bezahlung|Zahlung|Überweisung|Ueberweisung|Zahlungsverkehr|Verwendungszweck)\b).*/i,
    '',
  )

  // 2b. Strip truncated End-to-End-Ref tags (e.g. "End-t", "End-to-E", "End-to")
  cleaned = cleaned.replace(/\bEnd-t(?:o(?:-End)?)?.*$/i, ' ')

  // 2c. Strip trailing truncated purchase phrases (e.g. ", Ihr Einkauf bei", ", Ihr Einkauf", ", Ihr", ", Ih", ", I")
  cleaned = cleaned.replace(
    /(?:[,.]\s*(?:(?:I\s*hr|Ihr)\s*(?:E(?:in)?[- ]?kauf(?:\s+bei)?|E(?:in)?k(?:auf|au|a|f)?(?:\s+bei)?|Ein(?:\s+bei)?|E(?:in)?k?|Ei?|be?i?)?|Ih?r?\b)|\s+Ihr\s+E(?:in)?kauf(?:\s+bei)?).*$/i,
    ' ',
  )

  // 2c. Remove German Girocard / POS terminal location and station prefixes (e.g. //BAD HOMBURG/DE, //ESCHBORN/DE)
  cleaned = cleaned.replace(/\/\/[A-Za-z\s.-]+\/[A-Za-z]{2}\b/gi, ' ')
  cleaned = cleaned.replace(/\b[A-Z]:\d+\b/gi, ' ')

  // 2d. Separate dot-attached long reference numbers or tax IDs (e.g. "ERSTATT.00345234717" -> "ERSTATT. 00345234717")
  cleaned = cleaned.replace(/\b([A-Za-z]+)\.(\d{5,})\b/g, '$1. $2')

  // 2e. Expand tax refund abbreviation "ERSTATT." to "Erstattung"
  cleaned = cleaned.replace(/\bERSTATT\b\.?/gi, 'Erstattung')

  // 3. Remove date formats (ISO YYYY-MM-DDTHH:MM:SS, DD.MM.YYYY, DD/MM/YYYY, DD-MM-YY, etc.) and timestamps
  cleaned = cleaned.replace(/\b\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2})?)?\b/gi, ' ')
  cleaned = cleaned.replace(
    /\b(?:am\s+)?\d{1,2}[-./]\d{1,2}(?:[-./]\d{2,4})?(?:\s+(?:um\s+)?\d{1,2}:\d{2}(?::\d{2})?)?\b/gi,
    ' ',
  )

  // 4. Remove file/case reference numbers and billing/invoice codes (e.g., notary/court Aktenzeichen '01571/21', order/ref '230503-663021', 'JUL-106945945')
  cleaned = cleaned.replace(/\b(?:[A-Za-z]{2,5}-\d{4,}|\d{3,}[/-]\d{2,})\b/gi, ' ')

  // 5. Remove order and invoice references (e.g. Order 589490, Bestellung 12345, Auftrag 99281, standalone/trailing Rechnung or Invoice)
  cleaned = cleaned.replace(
    /\b(?:Order|Bestellung|Auftrag|Rechnung|Invoice|Rg\.?)\s*(?:[:#.-]?\s*\d[A-Za-z0-9_-]*)?\b/gi,
    ' ',
  )

  // 6. Remove terminal transaction codes and payment method noise (e.g. KFN 0 VJ 2412, ELV68423401, ME0, Kartenzahlung, Virtual Debit...)
  cleaned = cleaned.replace(/\b(?:RG|KD|VK)\s*[:.]?\s*\d+(?:\s*[/:]\s*(?:RG|KD|VK)\s*[:.]?\s*\d+)?\b/gi, ' ')
  cleaned = cleaned.replace(/\bKarte\s+Nr\.?\s*(?:\d{4}|\d{2,4}[X\d\s]*)\s*(?:Kartenzahlung)?\s*(?:Virtual\s*(?:Debit(?:\s*C(?:ard)?)?|Debi|DB|Car|Card|C)?|Virtu\b).*$/gi, ' ')
  cleaned = cleaned.replace(
    /\bKarte\s+Nr\.?\s*(?:\d{4}|\d{2,4}[X\d\s]*)\s*(?:Kartenzahlung)?(?:\s*Virtual\s*(?:Debit(?:\s*C(?:ard)?)?|Debi|DB|Car|Card|C)?|\s*Virtu\b)?(?:\s*PH\s*\d+\s+[A-Za-z]+\s+[A-Za-z]+)?(?:\s*\d+)?\b/gi,
    ' ',
  )
  cleaned = cleaned.replace(/\b(?:Virtual\s*(?:Debit(?:\s*C(?:ard)?)?|Debi|DB|Car|Card|C)?|Virtu)\b/gi, ' ')
  cleaned = cleaned.replace(/\bGIR\s+\d+(?:\/\/[A-Za-z0-9]+)?\b/gi, ' ')
  cleaned = cleaned.replace(/\bFil\.?\s*\d+\b/gi, ' ')
  cleaned = cleaned.replace(/\bKFN\s+\d+\s+VJ\s+\d+\b/gi, ' ')
  cleaned = cleaned.replace(/\b(?:ELV\d*|ME\d+)\b/gi, ' ')
  cleaned = cleaned.replace(/\b(?:Kartenzahlung|Kartenabrechnung|Karteneinsatz|KARTENZAHL\.?)\b/gi, ' ')
  cleaned = cleaned.replace(/\b(?:NYA|NNT)\*\s*/gi, ' ')
  cleaned = cleaned.replace(/\bsagt\s+danke\b/gi, ' ')

  // 5. Remove standalone IBANs (compact or spaced) and SWIFT BICs
  cleaned = cleaned.replace(/\b[A-Za-z]{2}\d{2}(?:\s*[A-Za-z0-9]{4}){2,7}(?:\s*[A-Za-z0-9]{1,4})?\b/g, ' ')
  cleaned = cleaned.replace(/\b[A-Za-z]{6}[A-Za-z0-9]{2}(?:[A-Za-z0-9]{3})?\b/gi, (match) => {
    return /XXX$/i.test(match) || /\d/.test(match) ? ' ' : match
  })

  // 6. Remove standalone long numeric or alphanumeric reference codes (8+ chars with digits, e.g. terminal/auth IDs)
  cleaned = cleaned.replace(/\b[A-Za-z0-9]*\d[A-Za-z0-9]{7,}\b/g, ' ')

  // 7. Remove standalone numbers with 4+ digits (e.g. postal codes, terminal codes, internal IDs),
  // but preserve 4-digit calendar years (1900-2099)
  cleaned = cleaned.replace(/\b(?!(?:19|20)\d{2}\b)\d{4,}\b/g, ' ')

  // 7. Clean up extraneous punctuation while preserving periods, ampersands, and hyphens in brand names
  cleaned = cleaned
    .replace(/[^\w\s\u00C0-\u024F\u0400-\u04FF.&-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.:;/-]+|[\s,.:;/-]+$/g, '')
    .trim()

  return cleaned
}

/**
 * Detects whether a transaction description represents an intermediary payment processor transaction
 * (e.g. PayPal, Klarna, Stripe, SumUp being used as a checkout intermediary for an underlying merchant)
 * as opposed to a direct balance transfer, account debit, or fee with the processor itself.
 */
export function isPaymentProcessorIntermediary(text: string): boolean {
  if (!text || typeof text !== 'string') return false
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
 * Extracts a concise, reusable merchant keyword from a transaction description
 * by stripping banking prefixes, corporate legal forms, branch/terminal codes, and noise.
 * Useful for learning smart category rules that match future transactions from the same merchant.
 */
export function extractMerchantKeyword(desc: string): string {
  if (!desc || typeof desc !== 'string') return ''

  // Start with clean description
  let merchant = extractCleanDescription(desc)
  if (!merchant) return ''

  // Direct PayPal account debit or direct transaction with PayPal itself
  if (
    /\b(?:abbuchung\s+vom\s+paypal[- ]konto|paypal[- ]konto\s+abbuchung)\b/i.test(merchant) ||
    !merchant
      .replace(
        /(?:\by?paypal(?:\s*\([^)]*\))?|\bpp\.\d+\.pp\b|\b\d+\b|s\.?\s*a\.?\s*r\.?\s*l\.?|et\s*cie|s\.?\s*c\.?\s*a\.?|\bsc\b|\beurope\b|\beuropa\b|[.,/:-])/giu,
        ' ',
      )
      .trim()
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

  // 1b. If the description contains a purchase phrase ("Ihr Einkauf bei ...", "Your purchase at ..."), extract the merchant
  const purchaseMatch = merchant.match(
    /\b(?:Ihr\s+E(?:in)?[- ]?kauf(?:\s+bei)?|Ihr\s+E(?:in)?k(?:auf|au|a|f)?(?:\s+bei)?|Ihr\s+Ein(?:\s+bei)?|I\s*hr\s+E(?:in)?k(?:auf|au|a|f)?(?:\s+bei)?|Your\s+purchase\s+(?:at|from)|Tw[oó]j\s+zakup\s+w|Va[sš]a\s+kupovina\s+kod|Ваша\s+куповина\s+код|Pembelian\s+Anda\s+di)\s*(.*)$/i,
  )
  if (purchaseMatch) {
    const beforePurchase = merchant.slice(0, purchaseMatch.index).replace(/[,.:;/-]+\s*$/, '').trim()
    const rawAfter = purchaseMatch[1].trim()
    const cleanAfter = rawAfter
      .replace(/\s+(?:en|end|end-t|end-to)\b.*$/i, '')
      .replace(/\s+(?:cari)\b.*$/i, '')
      .trim()

    // Determine the most complete merchant name (avoid taking truncated merchant after purchase phrase)
    if (beforePurchase && (!cleanAfter || beforePurchase.length >= cleanAfter.length || cleanAfter.length <= 4)) {
      merchant = beforePurchase
    } else if (cleanAfter) {
      merchant = cleanAfter
    } else {
      merchant = beforePurchase
    }
  }

  // Strip trailing truncated purchase phrases (e.g. ", Ihr Einkauf", ", Ihr Einkau", ", Ihr Eink", ", Ihr Einka", ", Ihr Ein", ", Ihr", ", Ih", ", I")
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
  if (/^(?:pp\b|sc\b|i\b|ih\b|ihr\b|ihr\s+e\b|ihr\s+ei\b|ihr\s+ein\b|ihr\s+eink\b|ihr\s+einkauf\b|be\b|bei\b|einkauf\b)/i.test(merchant.trim())) {
    merchant = ''
  }

  // 2. Remove corporate legal entity suffixes
  merchant = merchant.replace(
    /(?<![\p{L}\p{N}])(?:gmbh(?:\s*&\s*co\.?\s*kg)?|ag|s\s*\.?\s*e\.?|ltd\.?|limited|limite|inc\.?|llc|kgaa|ug|e\.?\s*k\.?|co\.?\s*kg|sp\.?\s*z\s*o\.?\s*o\.?|d\s*\.?\s*o\s*\.?\s*o\.?|d\s*\.?\s*d\.?|bv|s\.?a\.?r\.?l\.?|o[uü]|gbr|lda|unipessoal|unipes|sa|foundation|foundatio)(?![\p{L}\p{N}])/giu,
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
    /\s+(?:abbuchung|lastschrift|gutschrift|auszahlung|einzahlung|r(?:ü|ue)ckzahlung|r(?:ü|ue)ckverg(?:ü|ue)tung\w*|r(?:ü|ue)ck[uü]berweisung\w*|geb(?:ü|ue)hrenerstattung\w*|entgelterstattung\w*|erstatt(?:\.|ung)?|est-veranl(?:\.|agung)?|steuererstattung|lizenzgeb(?:ü|ue)hr|kautionsabrechnung|abrechnung|miete|(?:monatliches\s+)?hausgeld|gerichtsgeb(?:ü|ue)hr(?:en)?|grundbuch(?:eintragung)?|geb(?:ü|ue)hr(?:en)?|notarkosten|notargeb(?:ü|ue)hr(?:en)?|reisespesen|reisekosten|spesen|order|bestellung|auftrag|rechnung|invoice)\b.*$/i,
    ' ',
  )

  // 6. Clean up spaces and punctuation
  merchant = merchant
    .replace(/[^\w\s\u00C0-\u024F\u0400-\u04FF.&-]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.:;/-]+|[\s,.:;/-]+$/g, '')
    .trim()

  if (/^mc$/i.test(merchant.trim())) {
    return 'Uber'
  }

  if (/\b(?:z\.?\s*hd\.?\s*kmk|kmk\s+immobilien(?:verw\w*|verwaltung)?)\b/i.test(merchant)) {
    return 'KMK Immobilienverwaltung'
  }

  if (/\bweg\s+landwehrweg\b/i.test(merchant)) {
    return 'WEG Landwehrweg 1'
  }

  return merchant.length >= 2
    ? merchant
    : isPaymentProcessorIntermediary(desc)
      ? ''
      : extractCleanDescription(desc)
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
