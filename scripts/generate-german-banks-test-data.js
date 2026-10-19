import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const outputDir = path.join(rootDir, 'test-data', 'german-banks')
const pasteDir = path.join(outputDir, 'paste-samples')
const pdfDir = path.join(outputDir, 'pdf')
const htmlDir = path.join(outputDir, 'html')

fs.mkdirSync(outputDir, { recursive: true })
fs.mkdirSync(pasteDir, { recursive: true })
fs.mkdirSync(pdfDir, { recursive: true })
fs.mkdirSync(htmlDir, { recursive: true })

/**
 * All data generated here is 100% synthetic mock test data.
 * No real user data or personal information is used.
 */

// Common Sparkasse Finanz Informatik OSPlus generator helper
function createSparkasseContent(iban, blz, city, localTransit) {
  return `"Auftragskonto";"Buchungstag";"Valutadatum";"Buchungstext";"Verwendungszweck";"Glaeubiger ID";"Mandatsreferenz";"Kundenreferenz";"Sammlerreferenz";"Lastschrift Ursprungsbetrag";"Auslagenersatz Ruecklastschrift";"Beguenstigter/Zahlungspflichtiger";"Kontonummer/IBAN";"BIC (SWIFT-Code)";"Betrag";"Waehrung";"Info"
"${iban}";"14.10.2026";"14.10.2026";"SEPA-Lastschrift";"Kartenzahlung Filiale ${city}";"DE58ZZZ00001234567";"MANDAT-1001";"";"";"";"";"REWE Markt GmbH";"DE12100500001234567890";"WELADED1XXX";"-42,50";"EUR";"Umsatz gebucht"
"${iban}";"12.10.2026";"12.10.2026";"Dauerauftrag";"Miete Wohnung 10/2026";"";"";"";"";"";"";"Hausverwaltung Muster GmbH";"DE89100500000987654321";"WELADED1XXX";"-850,00";"EUR";"Umsatz gebucht"
"${iban}";"08.10.2026";"08.10.2026";"SEPA-Lastschrift";"${localTransit.ref}";"DE58ZZZ00007654321";"MANDAT-1002";"";"";"";"";"${localTransit.partner}";"DE45100500004567890123";"WELADED1XXX";"-49,00";"EUR";"Umsatz gebucht"
"${iban}";"01.10.2026";"01.10.2026";"Gehaltsgutschrift";"Gehaltszahlung Bezuege 10/2026";"";"";"";"";"";"";"Musterfirma Arbeitgeber AG";"DE33100500007890123456";"WELADED1XXX";"3250,00";"EUR";"Umsatz gebucht"
`
}

// Common Volksbank Atruvia agree21 generator helper
function createVolksbankContent(accountName, accountIban, bic, partnerCity) {
  return `"Bezeichnung Auftragskonto";"IBAN Auftragskonto";"BIC Auftragskonto";"Bankname Auftragskonto";"Buchungstag";"Valutadatum";"Name Zahlungsbeteiligter";"IBAN Zahlungsbeteiligter";"BIC (SWIFT-Code) Zahlungsbeteiligter";"Buchungstext";"Verwendungszweck";"Betrag";"Waehrung";"Saldo nach Buchung";"Bemerkung"
"${accountName}";"${accountIban}";"${bic}";"Volksbank Raiffeisenbank";"14.10.2026";"14.10.2026";"REWE Markt GmbH";"DE12500600001234567890";"GENODED1XXX";"Kartenzahlung";"Einkauf Filiale ${partnerCity}";"-42,50";"EUR";"2350,20";""
"${accountName}";"${accountIban}";"${bic}";"Volksbank Raiffeisenbank";"12.10.2026";"12.10.2026";"Hausverwaltung Muster GmbH";"DE89500600000987654321";"GENODED1XXX";"Dauerauftrag";"Miete Wohnung 10/2026";"-850,00";"EUR";"2392,70";""
"${accountName}";"${accountIban}";"${bic}";"Volksbank Raiffeisenbank";"09.10.2026";"09.10.2026";"Deutsche Bahn AG";"DE45500600004567890123";"GENODED1XXX";"Kartenzahlung";"Fahrkarte ICE Reise";"-69,90";"EUR";"3242,70";""
"${accountName}";"${accountIban}";"${bic}";"Volksbank Raiffeisenbank";"01.10.2026";"01.10.2026";"Musterfirma Arbeitgeber AG";"DE33500600007890123456";"GENODED1XXX";"Überweisung";"Gehalt Bezuege 10/2026";"3250,00";"EUR";"3312,60";""
`
}

const bankFiles = [
  // ── Traditional Banks ────────────────────────────────────────────────────────
  {
    id: 'deutsche-bank',
    name: 'Deutsche Bank',
    content: `"Buchungstag";"Wert";"Umsatzart";"Begünstigter / Auftraggeber";"Verwendungszweck";"IBAN";"BIC";"Kundenreferenz";"Mandatsreferenz";"Gläubiger ID";"Fremde Gebühren";"Betrag";"Abweichender Empfänger";"Anzahl der Aufträge";"Anzahl der Schecks";"Soll";"Haben";"Währung"
"14.10.2026";"14.10.2026";"Lastschrift";"REWE Markt GmbH";"Einkauf Filiale";"DE12500700100123456789";"DEUTDEDDFXX";"";"";"";"";"0";"";"";"";"42,50";"";"EUR"
"12.10.2026";"12.10.2026";"Dauerauftrag";"Hausverwaltung Muster GmbH";"Miete Wohnung 10/2026";"DE89500700100987654321";"DEUTDEDDFXX";"";"";"";"";"0";"";"";"";"850,00";"";"EUR"
"09.10.2026";"09.10.2026";"Lastschrift";"Deutsche Bahn AG";"ICE Fahrkarte Berlin";"DE45500700100456789012";"DEUTDEDDFXX";"";"";"";"";"0";"";"";"";"69,90";"";"EUR"
"05.10.2026";"05.10.2026";"Kartenzahlung";"dm-drogerie markt";"Drogerieartikel Filiale";"DE67500700100345678901";"DEUTDEDDFXX";"";"";"";"";"0";"";"";"";"19,45";"";"EUR"
"01.10.2026";"01.10.2026";"Gutschrift";"Musterfirma Arbeitgeber AG";"Gehalt 10/2026";"DE33500700100789012345";"DEUTDEDDFXX";"";"";"";"";"0";"";"";"";"";"3250,00";"EUR"
`,
  },
  {
    id: 'commerzbank',
    name: 'Commerzbank',
    content: `"Buchungstag";"Wertstellung";"Umsatzart";"Buchungstext";"Betrag";"Währung";"IBAN Kontoinhaber";"Kategorie"
"14.10.2026";"14.10.2026";"Lastschrift";"EDEKA Filiale Einkauf Lebensmittel";"-36,80";"EUR";"DE89370400440532013000";""
"12.10.2026";"12.10.2026";"Dauerauftrag";"Hausverwaltung Muster GmbH Miete 10/2026";"-850,00";"EUR";"DE89370400440532013000";""
"09.10.2026";"09.10.2026";"Lastschrift";"Spotify AB Monatliches Musik Streaming";"-11,99";"EUR";"DE89370400440532013000";""
"06.10.2026";"06.10.2026";"Kartenzahlung";"Shell Tankstelle Benzin Kraftstoff";"-65,20";"EUR";"DE89370400440532013000";""
"01.10.2026";"01.10.2026";"Überweisung";"Musterfirma Arbeitgeber AG Gehalt 10/2026";"3250,00";"EUR";"DE89370400440532013000";"Einnahmen"
`,
  },
  {
    id: 'hypovereinsbank',
    name: 'HypoVereinsbank (UniCredit)',
    content: `"Buchungsdatum";"Valutadatum";"Empfänger/Zahlungspflichtiger";"Buchungstext";"Verwendungszweck";"Betrag";"Währung"
"14.10.2026";"14.10.2026";"ALDI Sued";"Kartenzahlung";"Einkauf Filiale 204";"-28,90";"EUR"
"12.10.2026";"12.10.2026";"Hausverwaltung Muster GmbH";"Dauerauftrag";"Miete Oktober 2026";"-850,00";"EUR"
"08.10.2026";"08.10.2026";"Telekom Deutschland GmbH";"Lastschrift";"Monatsrechnung Festnetz";"-44,95";"EUR"
"01.10.2026";"01.10.2026";"Musterfirma Arbeitgeber AG";"Gehalt";"Bezuege 10/2026";"3250,00";"EUR"
`,
  },
  {
    id: 'postbank',
    name: 'Postbank',
    content: `"Buchungsdatum";"Wertstellung";"Umsatzart";"Auftraggeber";"Buchungsdetails";"Betrag";"Saldo"
"14.10.2026";"14.10.2026";"Lastschrift";"Netflix Services Germany GmbH";"Monatsabonnement Streaming";"-13,99";"2412,30"
"11.10.2026";"11.10.2026";"Kartenzahlung";"LIDL Dienstleistung";"Kartenzahlung Lebensmitteleinkauf";"-31,25";"2426,29"
"07.10.2026";"07.10.2026";"Lastschrift";"Stadtwerke Energie GmbH";"Abschlag Strom & Gas";"-85,00";"2457,54"
"01.10.2026";"01.10.2026";"Gutschrift";"Musterfirma Arbeitgeber AG";"Gehalt Oktober 2026";"3250,00";"2542,54"
`,
  },
  {
    id: 'targobank',
    name: 'Targobank',
    content: `"Buchungsdatum";"Valuta";"Empfänger / Absender";"Verwendungszweck";"Buchungsart";"Betrag";"Währung"
"14.10.2026";"14.10.2026";"REWE Markt GmbH";"Filialeinkauf Lebensmittel";"Lastschrift";"-42,50";"EUR"
"12.10.2026";"12.10.2026";"Hausverwaltung Muster GmbH";"Miete 10/2026";"Dauerauftrag";"-850,00";"EUR"
"08.10.2026";"08.10.2026";"FitX Deutschland GmbH";"Mitgliedsbeitrag Fitness";"Lastschrift";"-24,00";"EUR"
"01.10.2026";"01.10.2026";"Musterfirma Arbeitgeber AG";"Gehalt Monatszahlung";"Überweisung";"3250,00";"EUR"
`,
  },
  {
    id: 'santander-de',
    name: 'Santander Deutschland',
    content: `"Buchungstag";"Valuta";"Buchungstext";"Verwendungszweck";"Betrag";"Währung"
"14.10.2026";"14.10.2026";"Kartenzahlung";"Kaufland Filiale Wocheneinkauf";"-56,40";"EUR"
"11.10.2026";"11.10.2026";"Lastschrift";"Aral Tankstelle Kraftstoff";"-68,50";"EUR"
"07.10.2026";"07.10.2026";"Lastschrift";"Vattenfall Europe Stromabschlag";"-75,00";"EUR"
"01.10.2026";"01.10.2026";"Gutschrift";"Musterfirma Arbeitgeber AG Gehalt";"3250,00";"EUR"
`,
  },
  {
    id: 'ing-de',
    name: 'ING Deutschland',
    content: `"Umsatzanzeige";;;;;;;
"Girokonto";"DE89370400440532013000";;;;;;
;;;;;;;
"Buchung";"Valuta";"Auftraggeber/Empfänger";"Buchungstext";"Verwendungszweck";"Betrag";"Währung";"Saldo";"Währung"
"14.10.2026";"14.10.2026";"REWE Markt GmbH";"Lastschrift";"Kartenzahlung Lebensmittel";"-42,50";"EUR";"2380,45";"EUR"
"12.10.2026";"12.10.2026";"Hausverwaltung Muster GmbH";"Überweisung";"Miete Oktober 2026";"-850,00";"EUR";"2422,95";"EUR"
"09.10.2026";"09.10.2026";"Deutsche Bahn AG";"Lastschrift";"Fahrkarte ICE Berlin-Muenchen";"-69,90";"EUR";"3272,95";"EUR"
"01.10.2026";"01.10.2026";"Musterfirma Arbeitgeber AG";"Lohn/Gehalt";"Gehaltszahlung 10/2026";"3250,00";"EUR";"3342,85";"EUR"
`,
  },

  // ── Sparkassen (10 institutions, official Finanz Informatik OSPlus format) ────
  {
    id: 'berliner-sparkasse',
    name: 'Berliner Sparkasse',
    content: createSparkasseContent('DE12100500001234567890', '10050000', 'Berlin', {
      ref: 'Monatsticket Berlin AB',
      partner: 'BVG Berliner Verkehrsbetriebe',
    }),
  },
  {
    id: 'hamburger-sparkasse',
    name: 'Hamburger Sparkasse (Haspa)',
    content: createSparkasseContent('DE23200505501234567890', '20050550', 'Hamburg', {
      ref: 'Deutschlandticket HVV',
      partner: 'HVV Hamburger Verkehrsverbund',
    }),
  },
  {
    id: 'stadtsparkasse-muenchen',
    name: 'Stadtsparkasse München',
    content: createSparkasseContent('DE34701500001234567890', '70150000', 'Muenchen', {
      ref: 'MVG IsarCard Ticket',
      partner: 'MVG Muenchen',
    }),
  },
  {
    id: 'kreissparkasse-koeln',
    name: 'Kreissparkasse Köln',
    content: createSparkasseContent('DE45370502991234567890', '37050299', 'Koeln', {
      ref: 'KVB Monatsticket Koeln',
      partner: 'KVB Koelner Verkehrs-Betriebe',
    }),
  },
  {
    id: 'sparkasse-koelnbonn',
    name: 'Sparkasse KölnBonn',
    content: createSparkasseContent('DE56370501981234567890', '37050198', 'Bonn', {
      ref: 'VRS Ticket Regional',
      partner: 'VRS Verkehrsverbund Rhein-Sieg',
    }),
  },
  {
    id: 'nassauische-sparkasse',
    name: 'Nassauische Sparkasse (Naspa)',
    content: createSparkasseContent('DE67510500151234567890', '51050015', 'Wiesbaden', {
      ref: 'RMV Monatskarte',
      partner: 'ESWE Verkehrsgesellschaft',
    }),
  },
  {
    id: 'frankfurter-sparkasse',
    name: 'Frankfurter Sparkasse',
    content: createSparkasseContent('DE78500502011234567890', '50050201', 'Frankfurt', {
      ref: 'RMV Deutschlandticket',
      partner: 'RMV Rhein-Main-Verkehrsverbund',
    }),
  },
  {
    id: 'sparkasse-hannover',
    name: 'Sparkasse Hannover',
    content: createSparkasseContent('DE89250501801234567890', '25050180', 'Hannover', {
      ref: 'GVH Verbundticket',
      partner: 'GVH Grossraum-Verkehr Hannover',
    }),
  },
  {
    id: 'sparkasse-nuernberg',
    name: 'Sparkasse Nürnberg',
    content: createSparkasseContent('DE90760501011234567890', '76050101', 'Nuernberg', {
      ref: 'VGN Monatsticket',
      partner: 'VAG Verkehrs-Aktiengesellschaft Nuernberg',
    }),
  },
  {
    id: 'sparkasse-other',
    name: 'Other Sparkasse',
    content: createSparkasseContent('DE11100500001234567890', '10050000', 'Region', {
      ref: 'Nahverkehr Verbundticket',
      partner: 'Regionaler Verkehrsverbund',
    }),
  },

  // ── Volksbanken / Raiffeisenbanken (5 institutions, official Atruvia format) ─
  {
    id: 'dz-bank',
    name: 'DZ Bank',
    content: createVolksbankContent('Girokonto', 'DE12500600001234567890', 'GENODED1DZX', 'Frankfurt'),
  },
  {
    id: 'berliner-volksbank',
    name: 'Berliner Volksbank',
    content: createVolksbankContent('Girokonto privat', 'DE23100900001234567890', 'GENODED1BVB', 'Berlin'),
  },
  {
    id: 'frankfurter-volksbank',
    name: 'Frankfurter Volksbank Rhein/Main',
    content: createVolksbankContent('Girokonto Plus', 'DE34501900001234567890', 'FFVBDEFFXXX', 'Frankfurt'),
  },
  {
    id: 'muenchner-bank',
    name: 'Münchner Bank',
    content: createVolksbankContent('Muenchner Bank Giro', 'DE45701600001234567890', 'MBNKDEMMXXX', 'Muenchen'),
  },
  {
    id: 'volksbank-other',
    name: 'Other Volksbank / Raiffeisenbank',
    content: createVolksbankContent('VR-Girokonto', 'DE56200900001234567890', 'GENODED1XXX', 'Deutschland'),
  },

  // ── Direct & Online Banks ────────────────────────────────────────────────────
  {
    id: 'dkb',
    name: 'DKB (Deutsche Kreditbank)',
    content: `"Buchungsdatum";"Wertstellung";"Status";"Zahlungspflichtige*r";"Zahlungsempfänger*in";"Verwendungszweck";"Umsatztyp";"IBAN";"Betrag (€)";"Gläubiger-ID";"Mandatsreferenz";"Kundenreferenz"
"14.10.2026";"14.10.2026";"Gebucht";"REWE Markt GmbH";"";"Kartenzahlung Einkauf";"Lastschrift";"DE12120300001234567890";"-42,50";"DE58ZZZ00001234567";"MANDAT-123";""
"12.10.2026";"12.10.2026";"Gebucht";"Hausverwaltung Muster GmbH";"";"Miete Oktober 2026";"Dauerauftrag";"DE89120300000987654321";"-850,00";"";"";""
"09.10.2026";"09.10.2026";"Gebucht";"Netflix Services Germany GmbH";"";"Monatsabonnement Netflix";"Lastschrift";"DE45120300004567890123";"-13,99";"DE58ZZZ00002444586";"DD-987";""
"01.10.2026";"01.10.2026";"Gebucht";"Musterfirma Arbeitgeber AG";"";"LOHN/GEHALT 10/2026";"Gutschrift";"DE33120300007890123456";"3250,00";"";"";""
`,
  },
  {
    id: 'comdirect',
    name: 'comdirect',
    content: `"Umsätze Girokonto";;;;
"Zeitraum: 01.10.2026 - 15.10.2026";;;;
"Buchungstag";"Wertstellung";"Vorgang";"Buchungstext";"Umsatz in EUR"
"14.10.2026";"14.10.2026";"Lastschrift";"REWE Markt GmbH Kartenzahlung";"-42,50"
"12.10.2026";"12.10.2026";"Überweisung";"Hausverwaltung Muster GmbH Miete 10/2026";"-850,00"
"08.10.2026";"08.10.2026";"Lastschrift";"Spotify AB Musik Streaming";"-11,99"
"01.10.2026";"01.10.2026";"Überweisung";"Musterfirma Arbeitgeber AG Gehaltszahlung 10/2026";"3250,00"
`,
  },
  {
    id: 'consorsbank',
    name: 'Consorsbank',
    content: `"Buchungstag";"Wertstellung";"Buchungstext";"Umsatzart";"IBAN";"BIC";"Betrag";"Währung"
"14.10.2026";"14.10.2026";"ALDI Sued Filiale Einkauf";"Kartenzahlung";"DE12760300801234567890";"CSDBDE71XXX";"-28,90";"EUR"
"12.10.2026";"12.10.2026";"Hausverwaltung Muster GmbH Miete";"Dauerauftrag";"DE89760300800987654321";"CSDBDE71XXX";"-850,00";"EUR"
"09.10.2026";"09.10.2026";"Deutsche Bahn AG ICE Ticket";"Kartenzahlung";"DE45760300804567890123";"CSDBDE71XXX";"-69,90";"EUR"
"01.10.2026";"01.10.2026";"Musterfirma Arbeitgeber AG Gehalt";"Gutschrift";"DE33760300807890123456";"CSDBDE71XXX";"3250,00";"EUR"
`,
  },
  {
    id: 'norisbank',
    name: 'norisbank',
    content: `"Buchungstag";"Wert";"Umsatzart";"Begünstigter / Auftraggeber";"Verwendungszweck";"IBAN";"BIC";"Kundenreferenz";"Mandatsreferenz";"Gläubiger ID";"Fremde Gebühren";"Betrag";"Abweichender Empfänger";"Anzahl der Aufträge";"Anzahl der Schecks";"Soll";"Haben";"Währung"
"14.10.2026";"14.10.2026";"Lastschrift";"REWE Markt GmbH";"Einkauf Filiale";"DE12760700241234567890";"DEUTDEDBNOR";"";"";"";"";"0";"";"";"";"42,50";"";"EUR"
"12.10.2026";"12.10.2026";"Dauerauftrag";"Hausverwaltung Muster GmbH";"Miete Oktober";"DE89760700240987654321";"DEUTDEDBNOR";"";"";"";"";"0";"";"";"";"850,00";"";"EUR"
"07.10.2026";"07.10.2026";"Lastschrift";"Telekom Deutschland GmbH";"Internet & Telefon";"DE45760700244567890123";"DEUTDEDBNOR";"";"";"";"";"0";"";"";"";"44,95";"";"EUR"
"01.10.2026";"01.10.2026";"Gutschrift";"Musterfirma Arbeitgeber AG";"Gehalt 10/2026";"DE33760700247890123456";"DEUTDEDBNOR";"";"";"";"";"0";"";"";"";"";"3250,00";"EUR"
`,
  },
  {
    id: '1822direkt',
    name: '1822direkt',
    content: createSparkasseContent('DE99500502221234567890', '50050222', 'Frankfurt', {
      ref: 'Streaming Dienst',
      partner: 'Netflix Services Germany',
    }),
  },

  // ── Neobanks & Fintechs ──────────────────────────────────────────────────────
  {
    id: 'n26',
    name: 'N26',
    content: `"Booking Date","Value Date","Partner Name","Partner Iban","Type","Payment Reference","Account Name","Amount (EUR)","Original Amount","Original Currency","Exchange Rate"
"2026-10-14","2026-10-14","REWE Markt GmbH","DE12100110011234567890","MasterCard Payment","Kartenzahlung Supermarkt","Main Account","-42.50","","",""
"2026-10-12","2026-10-12","Hausverwaltung Muster GmbH","DE89100110010987654321","Credit Transfer","Miete Wohnung 10/2026","Main Account","-850.00","","",""
"2026-10-09","2026-10-09","Spotify AB","DE45100110014567890123","Direct Debit","Monatliches Musik Abo","Main Account","-11.99","","",""
"2026-10-06","2026-10-06","Shell Tankstelle","DE67100110013456789012","MasterCard Payment","Kraftstoff Benzin","Main Account","-65.20","","",""
"2026-10-01","2026-10-01","Musterfirma Arbeitgeber AG","DE33100110017890123456","Income","Gehalt Bezuege 10/2026","Main Account","3250.00","","",""
`,
  },
  {
    id: 'tomorrow',
    name: 'Tomorrow Bank',
    content: `"Date","Recipient / Sender","Description","Amount (EUR)","Category"
"2026-10-14","Bio Company Markt","Bio Einkauf Berlin","-34.50","Groceries"
"2026-10-12","Hausverwaltung Muster GmbH","Miete Oktober 2026","-850.00","Housing"
"2026-10-08","Greenpeace Energy eG","Oekostrom Abschlag","-65.00","Utilities"
"2026-10-01","Musterfirma Arbeitgeber AG","Gehaltszahlung 10/2026","3250.00","Salary"
`,
  },
  {
    id: 'vivid-money',
    name: 'Vivid Money',
    content: `"Date","Time","Description","Amount (EUR)","Pocket name","Counterparty Name","Counterparty IBAN"
"2026-10-14","14:25:00","Einkauf Lebensmittel","-42.50","Main Pocket","REWE Markt GmbH","DE12100110011234567890"
"2026-10-12","08:00:00","Miete Wohnung 10/2026","-850.00","Main Pocket","Hausverwaltung Muster GmbH","DE89100110010987654321"
"2026-10-09","18:30:00","ICE Fahrkarte Berlin","-69.90","Reise Pocket","Deutsche Bahn AG","DE45100110014567890123"
"2026-10-01","07:00:00","Gehaltszahlung","3250.00","Main Pocket","Musterfirma Arbeitgeber AG","DE33100110017890123456"
`,
  },
  {
    id: 'c24',
    name: 'C24 Bank',
    content: `"Buchungsdatum";"Wertstellung";"Name des Partners";"Partner IBAN";"Verwendungszweck";"Betrag";"Währung";"Konto Name"
"14.10.2026";"14.10.2026";"EDEKA Filiale";"DE12500105171234567890";"Kartenzahlung Filiale";"-36,80";"EUR";"Girokonto"
"12.10.2026";"12.10.2026";"Hausverwaltung Muster GmbH";"DE89500105170987654321";"Miete 10/2026";"-850,00";"EUR";"Girokonto"
"09.10.2026";"09.10.2026";"Spotify AB";"DE45500105174567890123";"Musik Streaming Monatsbeitrag";"-11,99";"EUR";"Girokonto"
"01.10.2026";"01.10.2026";"Musterfirma Arbeitgeber AG";"DE33500105177890123456";"Gehalt Oktober 2026";"3250,00";"EUR";"Girokonto"
`,
  },
  {
    id: 'openbank-de',
    name: 'Openbank',
    content: `"Buchungsdatum";"Wertstellung";"Beschreibung";"Betrag";"Währung";"Saldo"
"14.10.2026";"14.10.2026";"Kartenzahlung ALDI Sued Einkauf";"-28,90";"EUR";"1954,20"
"12.10.2026";"12.10.2026";"Überweisung Hausverwaltung Muster GmbH Miete";"-850,00";"EUR";"1983,10"
"07.10.2026";"07.10.2026";"Lastschrift Netflix Services Germany";"-13,99";"EUR";"2833,10"
"01.10.2026";"01.10.2026";"Gutschrift Musterfirma Arbeitgeber AG Gehalt";"3250,00";"EUR";"2847,09"
`,
  },
  {
    id: 'revolut-de',
    name: 'Revolut',
    content: `"Type","Product","Started Date","Completed Date","Description","Amount","Fee","Currency","State","Balance"
"CARD_PAYMENT","Current","2026-10-14 12:30:00","2026-10-14 12:31:00","REWE Supermarkt Filiale","-42.50","0.00","EUR","COMPLETED","2150.30"
"TRANSFER","Current","2026-10-12 09:00:00","2026-10-12 09:01:00","Miete Hausverwaltung Muster GmbH","-850.00","0.00","EUR","COMPLETED","2192.80"
"CARD_PAYMENT","Current","2026-10-09 17:15:00","2026-10-09 17:16:00","Deutsche Bahn Fahrkarte","-69.90","0.00","EUR","COMPLETED","3042.80"
"TRANSFER","Current","2026-10-01 08:00:00","2026-10-01 08:02:00","Musterfirma Arbeitgeber AG Gehalt","3250.00","0.00","EUR","COMPLETED","3112.70"
`,
  },
  {
    id: 'wise-de',
    name: 'Wise',
    content: `"TransferWise ID","Date","Amount","Currency","Description","Payment Reference","Running Balance","Exchange From","Exchange To","Exchange Rate","Payer Name","Payee Name","Payee Account Number"
"TRANSFER-101","2026-10-14","-42.50","EUR","REWE Markt Kartenzahlung","Einkauf","1950.40","EUR","EUR","1.0","Max Mustermann","REWE Markt GmbH","DE12100110011234567890"
"TRANSFER-102","2026-10-12","-850.00","EUR","Miete Wohnung 10/2026","Miete","1992.90","EUR","EUR","1.0","Max Mustermann","Hausverwaltung Muster GmbH","DE89100110010987654321"
"TRANSFER-103","2026-10-08","-44.95","EUR","Telekom Deutschland Monatsrechnung","Internet","2842.90","EUR","EUR","1.0","Max Mustermann","Telekom Deutschland GmbH","DE45100110014567890123"
"TRANSFER-104","2026-10-01","3250.00","EUR","Musterfirma Gehaltszahlung 10/2026","Gehalt","2887.85","EUR","EUR","1.0","Musterfirma Arbeitgeber AG","Max Mustermann","DE33100110017890123456"
`,
  },
  {
    id: 'bunq-de',
    name: 'bunq',
    content: `"Date","Amount","Account","Counterparty","Description"
"2026-10-14","-36.80","Main Account","EDEKA Filiale","Kartenzahlung Filiale"
"2026-10-12","-850.00","Main Account","Hausverwaltung Muster GmbH","Miete Wohnung 10/2026"
"2026-10-09","-11.99","Main Account","Spotify AB","Streaming Monatsabo"
"2026-10-01","3250.00","Main Account","Musterfirma Arbeitgeber AG","Gehalt Oktober 2026"
`,
  },

  // ── Landesbanken ─────────────────────────────────────────────────────────────
  {
    id: 'lbbw',
    name: 'LBBW (Landesbank Baden-Württemberg)',
    content: `"Buchungstag";"Valutadatum";"Auftraggeber/Empfänger";"Verwendungszweck";"Betrag";"Währung";"Saldo"
"14.10.2026";"14.10.2026";"REWE Markt GmbH";"Kartenzahlung Filiale";"-42,50";"EUR";"4150,20"
"12.10.2026";"12.10.2026";"Hausverwaltung Muster GmbH";"Miete Wohnung 10/2026";"-850,00";"EUR";"4192,70"
"07.10.2026";"07.10.2026";"Stadtwerke Stuttgart";"Abschlag Energie & Wasser";"-85,00";"EUR";"5042,70"
"01.10.2026";"01.10.2026";"Musterfirma Arbeitgeber AG";"Gehaltszahlung Bezuege";"3250,00";"EUR";"5127,70"
`,
  },
  {
    id: 'helaba',
    name: 'Helaba (Landesbank Hessen-Thüringen)',
    content: `"Buchungstag";"Valutadatum";"Auftraggeber/Empfänger";"Verwendungszweck";"Betrag";"Währung";"Saldo"
"14.10.2026";"14.10.2026";"EDEKA Filiale";"Kartenzahlung Einkauf";"-36,80";"EUR";"3920,40"
"12.10.2026";"12.10.2026";"Hausverwaltung Muster GmbH";"Miete 10/2026";"-850,00";"EUR";"3957,20"
"09.10.2026";"09.10.2026";"Deutsche Bahn AG";"Fahrkarte ICE Reise";"-69,90";"EUR";"4807,20"
"01.10.2026";"01.10.2026";"Musterfirma Arbeitgeber AG";"Gehalt Oktober 2026";"3250,00";"EUR";"4877,10"
`,
  },
  {
    id: 'bayernlb',
    name: 'BayernLB',
    content: `"Buchungstag";"Valutadatum";"Auftraggeber/Empfänger";"Verwendungszweck";"Betrag";"Währung";"Saldo"
"14.10.2026";"14.10.2026";"ALDI Sued";"Lebensmitteleinkauf Filiale";"-28,90";"EUR";"4310,15"
"12.10.2026";"12.10.2026";"Hausverwaltung Muster GmbH";"Miete Oktober 2026";"-850,00";"EUR";"4339,05"
"08.10.2026";"08.10.2026";"Stadtwerke Muenchen SWM";"Abschlag Stromversorgung";"-85,00";"EUR";"5189,05"
"01.10.2026";"01.10.2026";"Musterfirma Arbeitgeber AG";"Monatsgehalt 10/2026";"3250,00";"EUR";"5274,05"
`,
  },
  {
    id: 'norddeutsche-lb',
    name: 'Nord/LB',
    content: `"Buchungstag";"Valutadatum";"Auftraggeber/Empfänger";"Verwendungszweck";"Betrag";"Währung";"Saldo"
"14.10.2026";"14.10.2026";"LIDL Dienstleistung";"Kartenzahlung Filiale";"-31,25";"EUR";"3850,60"
"12.10.2026";"12.10.2026";"Hausverwaltung Muster GmbH";"Miete Wohnung 10/2026";"-850,00";"EUR";"3881,85"
"06.10.2026";"06.10.2026";"Telekom Deutschland GmbH";"Mobilfunk & Festnetz";"-44,95";"EUR";"4731,85"
"01.10.2026";"01.10.2026";"Musterfirma Arbeitgeber AG";"Gehaltsueberweisung";"3250,00";"EUR";"4776,80"
`,
  },

  // ── Brokerages ───────────────────────────────────────────────────────────────
  {
    id: 'trade-republic',
    name: 'Trade Republic',
    content: `"date","type","title","amount","fee","tax","currency"
"2026-10-14","BUY","iShares Core MSCI World UCITS ETF","-250.00","1.00","0.00","EUR"
"2026-10-10","BUY","Apple Inc Registered Shares","-150.00","1.00","0.00","EUR"
"2026-10-05","DIVIDEND","Allianz SE Dividend Payment","18.50","0.00","4.88","EUR"
"2026-10-01","INTEREST","Zinsgutschrift Verrechnungskonto","12.40","0.00","3.27","EUR"
`,
  },
  {
    id: 'scalable-capital',
    name: 'Scalable Capital',
    content: `"date","time","status","reference","description","assetType","type","isin","shares","price","amount","fee","tax","currency"
"2026-10-14","09:15:00","executed","ORDER-101","iShares Core MSCI World","ETF","savings_plan","IE00B4L5Y983","3.125","80.00","-250.00","0.00","0.00","EUR"
"2026-10-08","14:30:00","executed","ORDER-102","Vanguard FTSE All-World","ETF","buy","IE00BK5BQT80","0.925","108.10","-100.00","0.99","0.00","EUR"
"2026-10-04","08:00:00","executed","INTEREST-103","Zinsgutschrift Guthaben","Cash","interest","","0","0.00","15.20","0.00","0.00","EUR"
"2026-10-01","07:30:00","executed","DEP-104","Einzahlung Referenzkonto","Cash","deposit","","0","0.00","500.00","0.00","0.00","EUR"
`,
  },
  {
    id: 'flatex',
    name: 'flatex',
    content: `"Buchungstag";"Valuta";"Buchungstext";"Umsatz";"Währung";"Saldo"
"14.10.2026";"14.10.2026";"Wertpapierkauf Order 987654";"-320,00";"EUR";"1450,80"
"10.10.2026";"10.10.2026";"Dividendengutschrift Aktien";"24,50";"EUR";"1770,80"
"05.10.2026";"05.10.2026";"Depotgebuehr Quartal";"-12,50";"EUR";"1746,30"
"01.10.2026";"01.10.2026";"Einzahlung Referenzkonto";"500,00";"EUR";"1758,80"
`,
  },
  {
    id: 'smartbroker',
    name: 'Smartbroker+',
    content: `"Datum";"Transaktionstyp";"Beschreibung";"Betrag";"Währung"
"14.10.2026";"Sparplan";"ETF Sparplan MSCI Europe";"-200,00";"EUR"
"09.10.2026";"Wertpapierkauf";"Kauf Aktien DAX Unternehmen";"-180,00";"EUR"
"05.10.2026";"Ausschuettung";"Ertragsausschuettung Fonds";"22,10";"EUR"
"01.10.2026";"Überweisung";"Einzahlung Verrechnungskonto";"400,00";"EUR"
`,
  },
  {
    id: 'degiro-de',
    name: 'DEGIRO',
    content: `"Date","Time","Product","ISIN","Description","Amount","Currency"
"2026-10-14","11:30:00","Vanguard S&P 500","IE00B3XXRP09","Buy order executed","-150.00","EUR"
"2026-10-10","15:45:00","Apple Inc","US0378331005","Dividend payment","14.80","EUR"
"2026-10-06","09:15:00","DEGIRO Connectivity fee","","Exchange connection fee","-2.50","EUR"
"2026-10-01","08:00:00","Deposit","","Bank deposit transfer","300.00","EUR"
`,
  },

  // ── Specialized Banks ────────────────────────────────────────────────────────
  {
    id: 'apobank',
    name: 'apoBank (Deutsche Apotheker- und Ärztebank)',
    content: `"Buchungstag";"Valutadatum";"Buchungstext";"Verwendungszweck";"Beguenstigter/Zahlungspflichtiger";"Betrag";"Währung"
"14.10.2026";"14.10.2026";"Kartenzahlung";"Einkauf Lebensmittelfiliale";"REWE Markt GmbH";"-42,50";"EUR"
"12.10.2026";"12.10.2026";"Dauerauftrag";"Praxismiete / Wohnung 10/2026";"Hausverwaltung Muster GmbH";"-850,00";"EUR"
"07.10.2026";"07.10.2026";"Lastschrift";"Praxisbedarf Medizinbedarf";"DocCheck Shop GmbH";"-75,80";"EUR"
"01.10.2026";"01.10.2026";"Gutschrift";"Gehaltsbezuege Klinikum 10/2026";"Klinikum Musterstadt";"3450,00";"EUR"
`,
  },
  {
    id: 'psd-bank',
    name: 'PSD Bank',
    content: `"Buchungstag";"Valuta";"Zahlungsempfänger";"Verwendungszweck";"Umsatz";"Währung"
"14.10.2026";"14.10.2026";"EDEKA Filiale";"Kartenzahlung Einkauf";"-36,80";"EUR"
"12.10.2026";"12.10.2026";"Hausverwaltung Muster GmbH";"Miete Wohnung 10/2026";"-850,00";"EUR"
"08.10.2026";"08.10.2026";"Netflix Services Germany GmbH";"Monatsabo Netflix";"-13,99";"EUR"
"01.10.2026";"01.10.2026";"Musterfirma Arbeitgeber AG";"Gehalt Oktober 2026";"3250,00";"EUR"
`,
  },
  {
    id: 'sparda-bank',
    name: 'Sparda-Bank',
    content: `"Buchungstag";"Valutadatum";"Buchungstext";"Verwendungszweck";"Beguenstigter/Zahlungspflichtiger";"Betrag";"Währung"
"14.10.2026";"14.10.2026";"Kartenzahlung";"Einkauf Filiale 512";"ALDI Sued";"-28,90";"EUR"
"12.10.2026";"12.10.2026";"Dauerauftrag";"Miete Wohnung 10/2026";"Hausverwaltung Muster GmbH";"-850,00";"EUR"
"09.10.2026";"09.10.2026";"Lastschrift";"Fahrkarte Deutsche Bahn";"Deutsche Bahn AG";"-69,90";"EUR"
"01.10.2026";"01.10.2026";"Gutschrift";"Lohn/Gehalt 10/2026";"Musterfirma Arbeitgeber AG";"3250,00";"EUR"
`,
  },
  {
    id: 'gls-bank',
    name: 'GLS Bank',
    content: `"Buchungstag";"Wertstellung";"Auftraggeber/Empfänger";"Buchungstext";"Verwendungszweck";"Betrag";"Währung"
"14.10.2026";"14.10.2026";"Alnatura Super Natur Markt";"Kartenzahlung";"Bio Lebensmittel Wocheneinkauf";"-45,20";"EUR"
"12.10.2026";"12.10.2026";"Hausverwaltung Muster GmbH";"Dauerauftrag";"Miete Oktober 2026";"-850,00";"EUR"
"08.10.2026";"08.10.2026";"Elektrizitaetswerke Schoenau EWS";"Lastschrift";"Oekostrom Monatsabschlag";"-75,00";"EUR"
"01.10.2026";"01.10.2026";"Musterfirma Arbeitgeber AG";"Gutschrift";"Gehaltszahlung Bezuege";"3250,00";"EUR"
`,
  },
  {
    id: 'ethikbank',
    name: 'EthikBank',
    content: `"Buchungstag";"Wertstellung";"Auftraggeber/Empfänger";"Buchungstext";"Verwendungszweck";"Betrag";"Währung"
"14.10.2026";"14.10.2026";"Denns Biomarkt";"Kartenzahlung";"Einkauf Filiale";"-38,50";"EUR"
"12.10.2026";"12.10.2026";"Hausverwaltung Muster GmbH";"Dauerauftrag";"Miete Wohnung 10/2026";"-850,00";"EUR"
"07.10.2026";"07.10.2026";"Greenpeace Energy eG";"Lastschrift";"Sauberer Strom Abschlag";"-70,00";"EUR"
"01.10.2026";"01.10.2026";"Musterfirma Arbeitgeber AG";"Gutschrift";"Gehaltsbezuege 10/2026";"3250,00";"EUR"
`,
  },
  {
    id: 'triodos-de',
    name: 'Triodos Bank',
    content: `"Buchungsdatum";"Wertstellung";"Empfänger/Zahlungspflichtiger";"Verwendungszweck";"Betrag";"Währung"
"14.10.2026";"14.10.2026";"Bio Company Markt";"Einkauf Bio Lebensmittel";"-42,10";"EUR"
"12.10.2026";"12.10.2026";"Hausverwaltung Muster GmbH";"Wohnungsmiete Oktober";"-850,00";"EUR"
"08.10.2026";"08.10.2026";"Naturstrom AG";"Oekostrom Abschlag Monatszahlung";"-68,00";"EUR"
"01.10.2026";"01.10.2026";"Musterfirma Arbeitgeber AG";"Gehalt 10/2026";"3250,00";"EUR"
`,
  },
  {
    id: 'umweltbank',
    name: 'UmweltBank',
    content: `"Buchungstag";"Valutadatum";"Buchungstext";"Verwendungszweck";"Betrag";"Währung"
"14.10.2026";"14.10.2026";"Kartenzahlung";"Einkauf Bioladen Filiale";"-35,40";"EUR"
"12.10.2026";"12.10.2026";"Dauerauftrag";"Miete Wohnung 10/2026";"-850,00";"EUR"
"07.10.2026";"07.10.2026";"Lastschrift";"Oekostrom Abschlag monatlich";"-72,00";"EUR"
"01.10.2026";"01.10.2026";"Gutschrift";"Gehalt Monatsbezuege 10/2026";"3250,00";"EUR"
`,
  },

  // ── Payment Services ─────────────────────────────────────────────────────────
  {
    id: 'paypal-de',
    name: 'PayPal',
    content: `"Datum","Zeit","Zeitzone","Name","Typ","Status","Währung","Brutto","Gebühr","Netto","Guthaben","Transaktionscode"
"14.10.2026","15:30:10","MESZ","Spotify AB","Zahlung im Einzugsverfahren","Abgeschlossen","EUR","-11,99","0,00","-11,99","125,50","PP-10101"
"12.10.2026","18:45:22","MESZ","Steam Games Europe","Allgemeine Zahlung","Abgeschlossen","EUR","-29,99","0,00","-29,99","137,49","PP-10102"
"09.10.2026","12:10:05","MESZ","Uber Eats Germany","Zahlung im Einzugsverfahren","Abgeschlossen","EUR","-24,50","0,00","-24,50","167,48","PP-10103"
"05.10.2026","10:00:00","MESZ","Erika Musterfrau","Geld empfangen","Abgeschlossen","EUR","15,00","0,00","15,00","191,98","PP-10104"
`,
  },
  {
    id: 'klarna-de',
    name: 'Klarna',
    content: `"Datum";"Beschreibung";"Betrag";"Währung"
"14.10.2026";"H&M Hennes & Mauritz Online Einkauf";"-54,90";"EUR"
"11.10.2026";"Zalando SE Kleidung Kauf auf Rechnung";"-89,95";"EUR"
"06.10.2026";"ASOS Online Shopping Einkauf";"-45,00";"EUR"
"01.10.2026";"Klarna Rueckverguetung Cashback";"10,00";"EUR"
`,
  },

  // ── Other ────────────────────────────────────────────────────────────────────
  {
    id: 'other-de',
    name: 'Other Institution',
    content: `"Buchungstag";"Buchungstext";"Verwendungszweck";"Betrag";"Währung"
"14.10.2026";"REWE Markt GmbH";"Einkauf Lebensmittel";"-42,50";"EUR"
"12.10.2026";"Hausverwaltung Muster GmbH";"Miete 10/2026";"-850,00";"EUR"
"09.10.2026";"Netflix Services Germany GmbH";"Monatsabo Streaming";"-13,99";"EUR"
"01.10.2026";"Musterfirma Arbeitgeber AG";"Gehalt 10/2026";"3250,00";"EUR"
`,
  },
]

// Bank specific metadata, legal details, and branding colors
const BANK_CONFIGS = {
  'deutsche-bank': {
    primary: rgb(0.05, 0.15, 0.45),
    headerBg: rgb(0.92, 0.94, 0.98),
    legalName: 'Deutsche Bank Privat- und Geschäftskunden AG',
    city: 'Frankfurt am Main',
    postcode: '60006',
    address: 'Postfach 10 06 01',
    court: 'Amtsgericht Frankfurt am Main HRB 30 000',
    board: 'Christian Sewing (Vorsitzender), Alexander Wynaendts (Aufsichtsrat)',
  },
  norisbank: {
    primary: rgb(0.05, 0.15, 0.45),
    headerBg: rgb(0.92, 0.94, 0.98),
    legalName: 'norisbank GmbH',
    city: 'Bonn',
    postcode: '53111',
    address: 'Reuterstraße 122',
    court: 'Amtsgericht Bonn HRB 13412',
    board: 'Geschäftsführung norisbank GmbH',
  },
  commerzbank: {
    primary: rgb(0.08, 0.28, 0.24),
    headerBg: rgb(0.92, 0.96, 0.94),
    legalName: 'Commerzbank Aktiengesellschaft',
    city: 'Frankfurt am Main',
    postcode: '60261',
    address: 'Kaiserplatz',
    court: 'Amtsgericht Frankfurt am Main HRB 32000',
    board: 'Bettina Orlopp (Vorsitzende), Jens Weidmann (Aufsichtsrat)',
  },
  comdirect: {
    primary: rgb(0.12, 0.18, 0.25),
    headerBg: rgb(1.0, 0.98, 0.9),
    legalName: 'comdirect - eine Marke der Commerzbank AG',
    city: 'Quickborn',
    postcode: '25449',
    address: 'Pascalkehre 15',
    court: 'Amtsgericht Frankfurt am Main HRB 32000',
    board: 'Commerzbank AG Vorstand',
  },
  'ing-de': {
    primary: rgb(1.0, 0.38, 0.0),
    headerBg: rgb(1.0, 0.94, 0.88),
    legalName: 'ING-DiBa AG',
    city: 'Frankfurt am Main',
    postcode: '60628',
    address: 'Theodor-Heuss-Allee 2',
    court: 'Amtsgericht Frankfurt am Main HRB 7727',
    board: 'Nick Jue (Vorsitzender), Susanne Klöß (Aufsichtsrat)',
  },
  dkb: {
    primary: rgb(0.0, 0.45, 0.85),
    headerBg: rgb(0.92, 0.96, 1.0),
    legalName: 'Deutsche Kreditbank Aktiengesellschaft',
    city: 'Berlin',
    postcode: '10919',
    address: 'Taubenstraße 7-9',
    court: 'Amtsgericht Berlin-Charlottenburg HRB 34160 B',
    board: 'Stefan Unterlandstättner (Vorsitzender)',
  },
  postbank: {
    primary: rgb(0.95, 0.72, 0.0),
    headerBg: rgb(1.0, 0.97, 0.88),
    legalName: 'Postbank - eine Niederlassung der Deutsche Bank AG',
    city: 'Bonn',
    postcode: '53113',
    address: 'Friedrich-Ebert-Allee 114-126',
    court: 'Amtsgericht Frankfurt am Main HRB 30000',
    board: 'Deutsche Bank AG Vorstand',
  },
  hypovereinsbank: {
    primary: rgb(0.82, 0.08, 0.12),
    headerBg: rgb(0.98, 0.92, 0.92),
    legalName: 'UniCredit Bank GmbH (HypoVereinsbank)',
    city: 'München',
    postcode: '80333',
    address: 'Kardinal-Faulhaber-Straße 1',
    court: 'Amtsgericht München HRB 42148',
    board: 'Marion Höllinger (Sprecherin der Geschäftsführung)',
  },
  targobank: {
    primary: rgb(0.05, 0.32, 0.62),
    headerBg: rgb(0.92, 0.95, 1.0),
    legalName: 'TARGOBANK AG',
    city: 'Düsseldorf',
    postcode: '40213',
    address: 'Kasernenstraße 10',
    court: 'Amtsgericht Düsseldorf HRB 86638',
    board: 'Isabelle Chevelard (Vorstandsvorsitzende)',
  },
  'santander-de': {
    primary: rgb(0.9, 0.05, 0.05),
    headerBg: rgb(1.0, 0.93, 0.93),
    legalName: 'Santander Consumer Bank AG',
    city: 'Mönchengladbach',
    postcode: '41061',
    address: 'Santander-Platz 1',
    court: 'Amtsgericht Mönchengladbach HRB 1741',
    board: 'Vito Volpe (Vorstandsvorsitzender)',
  },
  n26: {
    primary: rgb(0.18, 0.58, 0.53),
    headerBg: rgb(0.91, 0.96, 0.95),
    legalName: 'N26 Bank AG',
    city: 'Berlin',
    postcode: '10179',
    address: 'Klosterstraße 62',
    court: 'Amtsgericht Berlin-Charlottenburg HRB 247466 B',
    board: 'Valentin Stalf, Maximilian Tayenthal',
  },
  c24: {
    primary: rgb(0.05, 0.28, 0.65),
    headerBg: rgb(0.91, 0.94, 1.0),
    legalName: 'C24 Bank GmbH',
    city: 'Frankfurt am Main',
    postcode: '60325',
    address: 'Mainzer Landstraße 180',
    court: 'Amtsgericht Frankfurt am Main HRB 118432',
    board: 'Robert Genz, Lasse Schmid',
  },
  'trade-republic': {
    primary: rgb(0.08, 0.08, 0.08),
    headerBg: rgb(0.94, 0.94, 0.94),
    legalName: 'Trade Republic Bank GmbH',
    city: 'Berlin',
    postcode: '10115',
    address: 'Brunnenstraße 19-21',
    court: 'Amtsgericht Berlin-Charlottenburg HRB 248698 B',
    board: 'Christian Hecker, Thomas Pischke',
  },
  'scalable-capital': {
    primary: rgb(0.06, 0.14, 0.22),
    headerBg: rgb(0.92, 0.95, 0.97),
    legalName: 'Scalable Capital GmbH / Baader Bank AG',
    city: 'München',
    postcode: '80331',
    address: 'Seitzstraße 8e',
    court: 'Amtsgericht München HRB 214429',
    board: 'Erik Podzuweit, Florian Prucker',
  },
  'revolut-de': {
    primary: rgb(0.08, 0.08, 0.08),
    headerBg: rgb(0.93, 0.93, 0.96),
    legalName: 'Revolut Bank UAB (Zweigniederlassung Deutschland)',
    city: 'Berlin',
    postcode: '10117',
    address: 'Unter den Linden 21',
    court: 'Amtsgericht Berlin-Charlottenburg HRB 248405 B',
    board: 'Nikolay Storonsky, Vlad Yatsenko',
  },
  'paypal-de': {
    primary: rgb(0.0, 0.2, 0.55),
    headerBg: rgb(0.92, 0.95, 1.0),
    legalName: 'PayPal (Europe) S.à r.l. et Cie, S.C.A.',
    city: 'Luxemburg / Teltow',
    postcode: '14513',
    address: 'Marktplatz 1',
    court: 'R.C.S. Luxembourg B 118 349',
    board: 'Alex Chriss (President & CEO)',
  },
}

function getBankBranding(bank) {
  if (BANK_CONFIGS[bank.id]) {
    return BANK_CONFIGS[bank.id]
  }

  if (bank.id.includes('sparkasse')) {
    return {
      primary: rgb(0.88, 0.05, 0.12),
      headerBg: rgb(0.98, 0.92, 0.92),
      legalName: `${bank.name} - Anstalt des öffentlichen Rechts`,
      city: 'Bundesrepublik Deutschland',
      postcode: '10000',
      address: 'Sparkassenplatz 1',
      court: 'Amtsgericht Registergericht der Sparkassen-Finanzgruppe',
      board: 'Vorstand der Sparkasse',
    }
  }

  if (
    bank.id.includes('volksbank') ||
    bank.id === 'dz-bank' ||
    bank.id === 'muenchner-bank'
  ) {
    return {
      primary: rgb(0.0, 0.25, 0.55),
      headerBg: rgb(0.92, 0.95, 0.99),
      legalName: `${bank.name} eingetragene Genossenschaft`,
      city: 'Genossenschaftsnetzwerk Atruvia agree21',
      postcode: '60313',
      address: 'Raiffeisenstraße 1',
      court: 'Genossenschaftsregister des Amtsgerichts',
      board: 'Vorstand der Genossenschaftsbank',
    }
  }

  return {
    primary: rgb(0.12, 0.22, 0.38),
    headerBg: rgb(0.92, 0.94, 0.98),
    legalName: `${bank.name} Kreditinstitut`,
    city: 'Frankfurt am Main',
    postcode: '60311',
    address: 'Bankenviertel 1',
    court: 'Amtsgericht Frankfurt am Main HRB',
    board: 'Vorstand des Kreditinstituts',
  }
}

async function generatePdfForBank(bank) {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595.28, 841.89]) // Standard A4: 595.28 x 841.89 pt
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const branding = getBankBranding(bank)

  // 1. Embed official logo from public/banks/
  const logoPath = path.join(rootDir, 'public', 'banks', `${bank.id}.png`)
  const defaultLogoPath = path.join(rootDir, 'public', 'logo', 'logo.png')
  const actualLogoPath = fs.existsSync(logoPath) ? logoPath : defaultLogoPath

  if (fs.existsSync(actualLogoPath)) {
    try {
      const rawBytes = fs.readFileSync(actualLogoPath)
      const bytes = new Uint8Array(
        rawBytes.buffer.slice(rawBytes.byteOffset, rawBytes.byteOffset + rawBytes.byteLength),
      )
      const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8
      const logoImage = isJpg ? await doc.embedJpg(bytes) : await doc.embedPng(bytes)

      const scale = Math.min(32 / logoImage.height, 140 / logoImage.width, 1.0)
      const logoWidth = logoImage.width * scale
      const logoHeight = logoImage.height * scale

      page.drawImage(logoImage, {
        x: 595.28 - 50 - logoWidth,
        y: 841.89 - 50 - logoHeight + 8,
        width: logoWidth,
        height: logoHeight,
      })
    } catch (err) {
      console.warn(`Could not embed logo for ${bank.id}:`, err)
    }
  }

  // 2. Bank Title & Subtitle (Top Left)
  page.drawText(bank.name, {
    x: 50,
    y: 782,
    size: 15,
    font: fontBold,
    color: branding.primary,
  })
  page.drawText(branding.legalName, {
    x: 50,
    y: 768,
    size: 8,
    font,
    color: rgb(0.35, 0.35, 0.35),
  })

  // Horizontal brand rule
  page.drawLine({
    start: { x: 50, y: 758 },
    end: { x: 545, y: 758 },
    thickness: 1.5,
    color: branding.primary,
  })

  // 3. DIN 5008 Address Window (Left)
  page.drawText(`${bank.name} · ${branding.address} · ${branding.postcode} ${branding.city}`, {
    x: 50,
    y: 745,
    size: 6.5,
    font,
    color: rgb(0.5, 0.5, 0.5),
  })
  page.drawText('Herrn', { x: 50, y: 724, size: 9, font })
  page.drawText('Max Mustermann', { x: 50, y: 712, size: 10, font: fontBold })
  page.drawText('Musterstraße 42', { x: 50, y: 700, size: 9, font })
  page.drawText('10115 Berlin', { x: 50, y: 688, size: 9, font })

  // 4. Account Info Card (Right)
  const ibanMatch = bank.content.match(/DE\d{20}/)
  const iban = ibanMatch ? ibanMatch[0] : 'DE89370400440532013000'
  const formattedIban = iban.replace(/(.{4})/g, '$1 ').trim()
  const bic = 'WELADED1XXX'

  page.drawRectangle({
    x: 335,
    y: 672,
    width: 210,
    height: 75,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 0.5,
    color: branding.headerBg,
  })
  page.drawText('KONTOAUSZUG Nr. 10 / 2026', {
    x: 345,
    y: 732,
    size: 9.5,
    font: fontBold,
    color: branding.primary,
  })
  page.drawText('Auszugsdatum: 15.10.2026', { x: 345, y: 718, size: 8, font })
  page.drawText(`IBAN: ${formattedIban}`, { x: 345, y: 704, size: 8, font: fontBold })
  page.drawText(`BIC: ${bic}`, { x: 345, y: 692, size: 8, font })
  page.drawText('Alter Kontostand: 2.145,20 EUR', { x: 345, y: 680, size: 8, font })

  // 5. Section Heading
  page.drawText('Umsatzübersicht Girokonto', {
    x: 50,
    y: 646,
    size: 11,
    font: fontBold,
    color: branding.primary,
  })

  // 6. Table Header Bar
  page.drawRectangle({
    x: 50,
    y: 624,
    width: 495,
    height: 18,
    color: branding.headerBg,
  })

  const isNeobankOrBroker = [
    'n26',
    'trade-republic',
    'scalable-capital',
    'c24',
    'tomorrow',
    'vivid-money',
    'openbank-de',
    'revolut-de',
    'wise-de',
    'bunq-de',
    'flatex',
    'smartbroker',
    'degiro-de',
    'paypal-de',
    'klarna-de',
  ].includes(bank.id)

  const isDeutscheBankGroup = ['deutsche-bank', 'norisbank'].includes(bank.id)

  const tableHeader = isDeutscheBankGroup
    ? 'Buchungstag   Wertstellung   Umsatzart / Verwendungszweck                           Soll / Haben (EUR)'
    : isNeobankOrBroker
    ? 'Buchungstag   Buchungstext / Verwendungszweck                                       Betrag (EUR)'
    : 'Buchungstag   Wertstellung   Buchungstext / Verwendungszweck                           Betrag (EUR)'

  page.drawText(tableHeader, {
    x: 55,
    y: 629,
    size: 8,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  })

  // 7. Transaction rows
  let txRows = []
  if (isDeutscheBankGroup) {
    txRows = [
      '14.10.2026 14.10.2026 Lastschrift REWE Markt GmbH Einkauf Filiale 42,50 S EUR',
      '12.10.2026 12.10.2026 Dauerauftrag Hausverwaltung Muster GmbH Miete 10/2026 850,00 S EUR',
      '08.10.2026 08.10.2026 Lastschrift Deutsche Bahn AG ICE Fahrkarte Berlin 49,00 S EUR',
      '01.10.2026 01.10.2026 Gutschrift Musterfirma Arbeitgeber AG Gehalt 10/2026 3.250,00 H EUR',
    ]
  } else if (isNeobankOrBroker) {
    txRows = [
      '14.10.2026 REWE Markt GmbH Kartenzahlung Filiale -42,50 EUR',
      '12.10.2026 Hausverwaltung Muster GmbH Miete 10/2026 -850,00 EUR',
      '08.10.2026 Spotify Music Streaming -11,99 EUR',
      '01.10.2026 Musterfirma Arbeitgeber AG Gehaltszahlung 3.250,00 EUR',
    ]
  } else {
    txRows = [
      '14.10.2026 14.10.2026 REWE Markt GmbH Kartenzahlung Filiale -42,50 EUR',
      '12.10.2026 12.10.2026 Hausverwaltung Muster GmbH Miete 10/2026 -850,00 EUR',
      '08.10.2026 08.10.2026 Deutsche Bahn AG Fahrkarte Reise -49,00 EUR',
      '01.10.2026 01.10.2026 Musterfirma Arbeitgeber AG Gehaltszahlung 3.250,00 EUR',
    ]
  }

  let y = 604
  for (const row of txRows) {
    page.drawText(row, {
      x: 55,
      y,
      size: 8,
      font,
      color: rgb(0.12, 0.12, 0.12),
    })
    page.drawLine({
      start: { x: 50, y: y - 5 },
      end: { x: 545, y: y - 5 },
      thickness: 0.3,
      color: rgb(0.85, 0.85, 0.85),
    })
    y -= 20
  }

  // 8. Closing Balance Card
  y -= 8
  page.drawRectangle({
    x: 325,
    y: y - 32,
    width: 220,
    height: 40,
    color: branding.headerBg,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 0.5,
  })
  page.drawText('Neuer Kontostand per 15.10.2026: 4.453,70 EUR', {
    x: 335,
    y: y - 12,
    size: 8,
    font: fontBold,
    color: branding.primary,
  })
  page.drawText('Summe der Umsaetze: 2.308,50 EUR', {
    x: 335,
    y: y - 25,
    size: 8,
    font,
    color: rgb(0.2, 0.2, 0.2),
  })

  // 9. Legal Registration Footer (Bottom of page)
  page.drawLine({
    start: { x: 50, y: 72 },
    end: { x: 545, y: 72 },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  })
  page.drawText(`${branding.legalName} · Sitz: ${branding.city} · ${branding.court}`, {
    x: 50,
    y: 60,
    size: 6.5,
    font,
    color: rgb(0.4, 0.4, 0.4),
  })
  page.drawText(`${branding.board} · Bankleitzahl & BIC laut Deutsche Bundesbank`, {
    x: 50,
    y: 50,
    size: 6.5,
    font,
    color: rgb(0.4, 0.4, 0.4),
  })

  return await doc.save()
}

function generatePasteForBank(bank) {
  const ibanMatch = bank.content.match(/DE\d{20}/)
  const rawIban = ibanMatch ? ibanMatch[0] : 'DE89370400440532013000'
  const formattedIban = rawIban.replace(/(.{4})/g, '$1 ').trim()

  // 1. ING Deutschland (includes circle avatar initials and 'Menü öffnen' button noise)
  if (bank.id === 'ing-de') {
    return `Girokonto
IBAN: ${formattedIban}
14.10.2026
RE
REWE Markt GmbH
Kartenzahlung Einkauf Filiale
Lastschrift
-42,50 EUR
Menü öffnen
12.10.2026
HV
Hausverwaltung Muster GmbH
Miete Wohnung Oktober 2026
Dauerauftrag
-850,00 EUR
Menü öffnen
09.10.2026
DB
Deutsche Bahn AG
Fahrkarte ICE Reise
Lastschrift
-69,90 EUR
Menü öffnen
01.10.2026
AG
Musterfirma Arbeitgeber AG
LOHN/GEHALT Bezuege 10/2026
Gutschrift
+3.250,00 EUR
Menü öffnen
`
  }

  // 2. Sparkassen (Finanz Informatik OSPlus Internet-Filiale)
  if (bank.id.includes('sparkasse')) {
    const city =
      bank.id === 'berliner-sparkasse'
        ? 'Berlin'
        : bank.id === 'hamburger-sparkasse'
          ? 'Hamburg'
          : bank.id === 'stadtsparkasse-muenchen'
            ? 'München'
            : bank.id === 'kreissparkasse-koeln'
              ? 'Köln'
              : bank.id === 'sparkasse-koelnbonn'
                ? 'Bonn'
                : bank.id === 'nassauische-sparkasse'
                  ? 'Wiesbaden'
                  : bank.id === 'frankfurter-sparkasse'
                    ? 'Frankfurt'
                    : bank.id === 'sparkasse-hannover'
                      ? 'Hannover'
                      : bank.id === 'sparkasse-nuernberg'
                        ? 'Nürnberg'
                        : 'Filiale'
    return `Girokonto
IBAN: ${formattedIban}
Umsatzübersicht
14.10.2026
REWE Markt GmbH
Kartenzahlung Filiale ${city}
Kartenzahlung
-42,50 EUR
(Umsatzdetails öffnen)
12.10.2026
Hausverwaltung Muster GmbH
Miete Wohnung 10/2026
Dauerauftrag
-850,00 EUR
(Umsatzdetails öffnen)
08.10.2026
Nahverkehr ${city} Service
Monatsticket Nahverkehr
Lastschrift
-49,00 EUR
(Umsatzdetails öffnen)
01.10.2026
Musterfirma Arbeitgeber AG
Gehaltszahlung 10/2026
Überweisung
+3.250,00 EUR
(Umsatzdetails öffnen)
`
  }

  // 3. Volksbanken / Raiffeisenbanken (Atruvia agree21 VR-Banking)
  if (bank.id.includes('volksbank') || bank.id === 'dz-bank' || bank.id === 'muenchner-bank') {
    return `Girokonto
IBAN: ${formattedIban}
Umsatzübersicht
14.10.2026
REWE Markt GmbH
Einkauf Filiale
Kartenzahlung
-42,50 EUR
12.10.2026
Hausverwaltung Muster GmbH
Miete Wohnung 10/2026
Dauerauftrag
-850,00 EUR
09.10.2026
Deutsche Bahn AG
Fahrkarte ICE Reise
Kartenzahlung
-69,90 EUR
01.10.2026
Musterfirma Arbeitgeber AG
Gehalt Bezuege 10/2026
Überweisung
+3.250,00 EUR
`
  }

  // 4. DKB (Deutsche Kreditbank)
  if (bank.id === 'dkb') {
    return `Girokonto
IBAN: ${formattedIban}
14.10.2026
Netflix Services Germany GmbH
Abo-Zahlung monatlich
Lastschrift
-13,99 EUR
12.10.2026
Hausverwaltung Muster GmbH
Miete Wohnung 10/2026
Überweisung
-850,00 EUR
08.10.2026
REWE Markt GmbH
Kartenzahlung Lebensmittel
Kartenzahlung
-42,50 EUR
01.10.2026
Musterfirma Arbeitgeber AG
Lohn und Gehalt 10/2026
Gutschrift
+3.250,00 EUR
`
  }

  // 5. Commerzbank / comdirect
  if (bank.id === 'commerzbank' || bank.id === 'comdirect') {
    return `Girokonto
IBAN: ${formattedIban}
14.10.2026
EDEKA Filiale
Kartenzahlung Einkauf Lebensmittel
Lastschrift
-36,80 EUR
12.10.2026
Hausverwaltung Muster GmbH
Miete Wohnung 10/2026
Dauerauftrag
-850,00 EUR
09.10.2026
Spotify AB
Monatliches Musik Streaming
Lastschrift
-11,99 EUR
01.10.2026
Musterfirma Arbeitgeber AG
Gehaltsgutschrift 10/2026
Gutschrift
+3.250,00 EUR
`
  }

  // 6. Deutsche Bank / norisbank
  if (bank.id === 'deutsche-bank' || bank.id === 'norisbank') {
    return `Girokonto
IBAN: ${formattedIban}
14.10.2026
REWE Markt GmbH
Einkauf Filiale
Lastschrift
-42,50 EUR
12.10.2026
Hausverwaltung Muster GmbH
Miete Wohnung 10/2026
Dauerauftrag
-850,00 EUR
09.10.2026
Deutsche Bahn AG
ICE Fahrkarte Berlin
Lastschrift
-69,90 EUR
01.10.2026
Musterfirma Arbeitgeber AG
Gehalt 10/2026
Gutschrift
+3.250,00 EUR
`
  }

  // 7. Postbank
  if (bank.id === 'postbank') {
    return `Postbank Giro plus
IBAN: ${formattedIban}
14.10.2026
Netflix Services Germany GmbH
Monatsabonnement Streaming
Lastschrift
-13,99 EUR
11.10.2026
LIDL Dienstleistung
Kartenzahlung Lebensmitteleinkauf
Kartenzahlung
-31,25 EUR
07.10.2026
Stadtwerke Energie GmbH
Abschlag Strom und Gas
Lastschrift
-85,00 EUR
01.10.2026
Musterfirma Arbeitgeber AG
Gehalt Oktober 2026
Gutschrift
+3.250,00 EUR
`
  }

  // 8. HypoVereinsbank (UniCredit)
  if (bank.id === 'hypovereinsbank') {
    return `HVB Girokonto
IBAN: ${formattedIban}
14.10.2026
ALDI Sued
Kartenzahlung Filiale 204
Kartenzahlung
-28,90 EUR
12.10.2026
Hausverwaltung Muster GmbH
Miete Oktober 2026
Dauerauftrag
-850,00 EUR
08.10.2026
Telekom Deutschland GmbH
Monatsrechnung Festnetz
Lastschrift
-44,95 EUR
01.10.2026
Musterfirma Arbeitgeber AG
Bezuege Gehalt 10/2026
Überweisung
+3.250,00 EUR
`
  }

  // 9. Targobank
  if (bank.id === 'targobank') {
    return `Targobank Plus-Konto
IBAN: ${formattedIban}
14.10.2026
REWE Markt GmbH
Filialeinkauf Lebensmittel
Lastschrift
-42,50 EUR
12.10.2026
Hausverwaltung Muster GmbH
Miete 10/2026
Dauerauftrag
-850,00 EUR
08.10.2026
FitX Deutschland GmbH
Mitgliedsbeitrag Fitness
Lastschrift
-24,00 EUR
01.10.2026
Musterfirma Arbeitgeber AG
Gehalt Monatszahlung
Überweisung
+3.250,00 EUR
`
  }

  // 10. Santander Deutschland
  if (bank.id === 'santander-de') {
    return `Santander Girokonto
IBAN: ${formattedIban}
14.10.2026
Kaufland Filiale
Kartenzahlung Wocheneinkauf
Kartenzahlung
-56,40 EUR
11.10.2026
Aral Tankstelle
Kraftstoff Benzin
Lastschrift
-68,50 EUR
07.10.2026
Vattenfall Europe
Stromabschlag monatlich
Lastschrift
-75,00 EUR
01.10.2026
Musterfirma Arbeitgeber AG
Gehalt monatlich
Gutschrift
+3.250,00 EUR
`
  }

  // 11. Brokerages
  if (
    ['trade-republic', 'scalable-capital', 'flatex', 'smartbroker', 'degiro-de'].includes(bank.id)
  ) {
    return `Verrechnungskonto
IBAN: ${formattedIban}
14.10.2026
iShares Core MSCI World UCITS ETF
Wertpapierkauf Sparplan
Lastschrift
-150,00 EUR
10.10.2026
Allianz SE Dividende
Dividendengutschrift
Gutschrift
+45,00 EUR
05.10.2026
Depotgebuehren Abrechnung
Entgelt
-2,50 EUR
01.10.2026
Max Mustermann
Einzahlung Referenzkonto
Überweisung
+500,00 EUR
`
  }

  // 12. Neobanks (N26, C24, Tomorrow, Vivid, Revolut, Wise, bunq, Openbank)
  if (
    [
      'n26',
      'c24',
      'tomorrow',
      'vivid-money',
      'revolut-de',
      'wise-de',
      'bunq-de',
      'openbank-de',
    ].includes(bank.id)
  ) {
    return `${bank.name} Account
IBAN: ${formattedIban}
14.10.2026
REWE Filiale
Kartenzahlung Einkauf
Kartenzahlung
-42,50 EUR
12.10.2026
Hausverwaltung Muster GmbH
Miete Wohnung 10/2026
Überweisung
-850,00 EUR
09.10.2026
Spotify AB
Monatsabonnement Musik
Lastschrift
-11,99 EUR
01.10.2026
Musterfirma Arbeitgeber AG
Gehalt 10/2026
Gutschrift
+3.250,00 EUR
`
  }

  // 13. Payment services (PayPal, Klarna)
  if (bank.id === 'paypal-de') {
    return `PayPal Guthaben
Konto: ${formattedIban}
14.10.2026
Steam Games Hamburg
Computerspiel Kauf
Lastschrift
-29,99 EUR
10.10.2026
Erika Musterfrau
Geld senden Freunde und Familie
Überweisung
-15,00 EUR
05.10.2026
eBay Kleinanzeigen
Verkauf Artikel Gutschrift
Gutschrift
+45,00 EUR
01.10.2026
Bankabbuchung Girokonto
Einzahlung Guthaben
Gutschrift
+100,00 EUR
`
  }
  if (bank.id === 'klarna-de') {
    return `Klarna Card & Bank
IBAN: ${formattedIban}
14.10.2026
Zalando SE
Online-Shopping Kleidung
Kartenzahlung
-64,90 EUR
11.10.2026
ASOS Germany
Bestellung Mode
Kartenzahlung
-39,50 EUR
08.10.2026
Rückzahlung Rate
Kauf auf Rechnung
Lastschrift
-50,00 EUR
01.10.2026
Einzahlung Verrechnungskonto
Guthaben Aufladung
Überweisung
+200,00 EUR
`
  }

  // 14. Default / Consorsbank / 1822direkt / Landesbanken / Specialized Banks
  return `Girokonto
IBAN: ${formattedIban}
14.10.2026
REWE Markt GmbH
Einkauf Filiale Lebensmittel
Kartenzahlung
-42,50 EUR
12.10.2026
Hausverwaltung Muster GmbH
Miete Wohnung 10/2026
Dauerauftrag
-850,00 EUR
08.10.2026
Deutsche Bahn AG
Fahrkarte ICE Reise
Kartenzahlung
-69,90 EUR
01.10.2026
Musterfirma Arbeitgeber AG
Gehalt Bezuege 10/2026
Überweisung
+3.250,00 EUR
`
}

function parseTransactionsFromPaste(pasteText) {
  const lines = pasteText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  const items = []
  let currentDate = ''
  let currentPartner = ''
  let currentDesc = ''
  let currentType = ''

  for (const line of lines) {
    if (/^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(line)) {
      currentDate = line
      currentPartner = ''
      currentDesc = ''
      currentType = ''
      continue
    }
    if (/^[+-]?\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\s*(?:EUR|€)$/i.test(line)) {
      const isNeg =
        line.startsWith('-') ||
        (!line.startsWith('+') && !line.toLowerCase().includes('gutschrift'))
      items.push({
        date: currentDate || '14.10.2026',
        partner: currentPartner || 'REWE Markt GmbH',
        desc: currentDesc || 'Kartenzahlung Filiale',
        type: currentType || (isNeg ? 'Lastschrift' : 'Überweisung'),
        amount: line,
        isNegative: isNeg,
      })
      currentPartner = ''
      currentDesc = ''
      currentType = ''
      continue
    }
    if (
      [
        'kartenzahlung',
        'lastschrift',
        'überweisung',
        'dauerauftrag',
        'gutschrift',
        'entgelt',
      ].includes(line.toLowerCase())
    ) {
      currentType = line
      continue
    }
    if (
      /^[A-Z]{1,3}$/.test(line) ||
      line.includes('öffnen') ||
      line.includes('Umsatzübersicht') ||
      line.includes('Girokonto') ||
      line.includes('IBAN') ||
      line.includes('Account')
    ) {
      continue
    }
    if (!currentPartner) {
      currentPartner = line
    } else if (!currentDesc) {
      currentDesc = line
    } else {
      currentDesc += ' ' + line
    }
  }
  return items
}

function generateDeutscheBankHtml(bank) {
  const pasteText = generatePasteForBank(bank)
  const txs = parseTransactionsFromPaste(pasteText)
  const ibanMatch = bank.content.match(/DE\d{20}/)
  const rawIban = ibanMatch ? ibanMatch[0] : 'DE12500700100123456789'
  const formattedIban = rawIban.replace(/(.{4})/g, '$1 ').trim()

  return `<!DOCTYPE html>
<html lang="de" data-dbcr-theme="db-light" data-beasties-container>
<head>
  <meta charset="utf-8">
  <title>Deutsche Bank Banking &amp; Brokerage</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="https://meine.deutsche-bank.de/favicon.ico">
  <link rel="stylesheet" href="https://meine.deutsche-bank.de/demo/styles-5Z44O5VC.css">
  <style>
    :root {
      --dbcr-semantic-color-background-body: #f5f6f8;
      --dbcr-semantic-color-text-text: #1d1d1b;
      --dbcr-semantic-typography-font-family-text: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #f5f6f8;
      color: #1d1d1b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .db-header {
      background-color: #00186b;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .db-header-left {
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .db-logo-box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 3px solid #ffffff;
      position: relative;
    }
    .db-logo-slash {
      width: 3px;
      height: 28px;
      background: #ffffff;
      transform: rotate(45deg);
    }
    .db-nav-links {
      display: flex;
      gap: 24px;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .db-nav-links a {
      color: #ced4da;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
    }
    .db-nav-links a.active {
      color: #ffffff;
      font-weight: 700;
      border-bottom: 2px solid #ffffff;
      padding-bottom: 4px;
    }
    .db-header-right {
      display: flex;
      align-items: center;
      gap: 20px;
      font-size: 0.88rem;
    }
    .db-subnav {
      background: #ffffff;
      border-bottom: 1px solid #e2e4e8;
      padding: 0 24px;
      display: flex;
      gap: 24px;
    }
    .db-subnav a {
      color: #495057;
      text-decoration: none;
      font-size: 0.88rem;
      padding: 12px 0;
      border-bottom: 2px solid transparent;
    }
    .db-subnav a.active {
      color: #00186b;
      font-weight: 600;
      border-bottom-color: #00186b;
    }
    .db-content-container {
      max-width: 1140px;
      margin: 24px auto;
      padding: 0 24px;
    }
    .db-overview-card {
      background: #ffffff;
      border: 1px solid #e2e4e8;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .db-overview-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .db-overview-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1d1d1b;
      margin-bottom: 4px;
    }
    .db-account-iban {
      font-size: 0.95rem;
      color: #5f6368;
      margin-bottom: 12px;
    }
    .db-account-iban strong {
      color: #1d1d1b;
      font-family: monospace;
      font-size: 1.05rem;
    }
    .db-balance-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1d1d1b;
    }
    .db-tabs {
      display: flex;
      gap: 16px;
      border-bottom: 1px solid #e2e4e8;
      margin-top: 20px;
    }
    .db-tab {
      padding: 10px 16px;
      font-size: 0.95rem;
      font-weight: 600;
      color: #5f6368;
      cursor: pointer;
      border-bottom: 3px solid transparent;
    }
    .db-tab.active {
      color: #00186b;
      border-bottom-color: #00186b;
    }
    .db-transactions-card {
      background: #ffffff;
      border: 1px solid #e2e4e8;
      border-radius: 8px;
      overflow: hidden;
    }
    .db-toolbar {
      padding: 16px 24px;
      border-bottom: 1px solid #e2e4e8;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fafbfc;
    }
    .db-search-input {
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      width: 280px;
      font-size: 0.88rem;
    }
    .db-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    .db-table th {
      background: #f8f9fa;
      color: #5f6368;
      font-weight: 600;
      padding: 12px 24px;
      border-bottom: 1px solid #e2e4e8;
    }
    .db-table td {
      padding: 16px 24px;
      border-bottom: 1px solid #e2e4e8;
      color: #1d1d1b;
      vertical-align: middle;
    }
    .db-table tr:hover td {
      background: #f9fbff;
    }
    .db-table-partner {
      font-weight: 600;
      color: #1d1d1b;
    }
    .db-table-desc {
      color: #5f6368;
      font-size: 0.82rem;
      margin-top: 2px;
    }
    .db-amount {
      text-align: right;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    .db-amount.negative {
      color: #1d1d1b;
    }
    .db-amount.positive {
      color: #00875a;
    }
    .db-footer {
      max-width: 1140px;
      margin: 40px auto 20px;
      padding: 20px 24px;
      border-top: 1px solid #e2e4e8;
      font-size: 0.8rem;
      color: #5f6368;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <header class="db-header">
    <div class="db-header-left">
      <div class="db-logo-box" aria-label="Deutsche Bank Logo">
        <div class="db-logo-slash"></div>
      </div>
      <nav>
        <ul class="db-nav-links">
          <li><a href="#" class="active">Finanzübersicht</a></li>
          <li><a href="#">Überweisen</a></li>
          <li><a href="#">Investieren</a></li>
          <li><a href="#">Produkte</a></li>
          <li><a href="#">Services</a></li>
        </ul>
      </nav>
    </div>
    <div class="db-header-right">
      <span>✉️ Nachrichten</span>
      <span>❓ Hilfe</span>
      <span>👤 M. Mustermann</span>
      <span>🚪 Logout</span>
    </div>
  </header>

  <nav class="db-subnav">
    <a href="#" class="active">Übersicht</a>
    <a href="#">Versicherungen</a>
  </nav>

  <main class="db-content-container">
    <section class="db-overview-card">
      <div class="db-overview-header">
        <div>
          <h1 class="db-overview-title">Ihre Finanzübersicht</h1>
          <div class="db-account-iban">
            IBAN: <strong>${formattedIban}</strong> &nbsp;|&nbsp; BIC: <strong>DEUTDEDDFXX</strong>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.82rem; color: #5f6368; text-transform: uppercase;">Gesamtsaldo</div>
          <div class="db-balance-value">2.350,20 EUR</div>
        </div>
      </div>

      <div class="db-tabs">
        <div class="db-tab">Produkte</div>
        <div class="db-tab active">Alle Umsätze</div>
        <div class="db-tab">FinanzPlaner</div>
      </div>
    </section>

    <section class="db-transactions-card">
      <div class="db-toolbar">
        <span style="font-weight: 600; color: #1d1d1b;">Umsätze aller Produkte</span>
        <input type="text" class="db-search-input" placeholder="Umsätze durchsuchen...">
      </div>

      <table class="db-table" id="transactionTable">
        <thead>
          <tr>
            <th>Buchungstag</th>
            <th>Wertstellung</th>
            <th>Zahlungsempfänger / Auftraggeber</th>
            <th>Verwendungszweck</th>
            <th>Umsatzart</th>
            <th style="text-align: right;">Betrag</th>
          </tr>
        </thead>
        <tbody>
${txs
  .map(
    (t) => `          <tr>
            <td>${t.date}</td>
            <td>${t.date}</td>
            <td class="db-table-partner">${t.partner}</td>
            <td class="db-table-desc">${t.desc}</td>
            <td>${t.type}</td>
            <td class="db-amount ${t.isNegative ? 'negative' : 'positive'}">${t.amount}</td>
          </tr>`,
  )
  .join('\n')}
        </tbody>
      </table>
    </section>
  </main>

  <footer class="db-footer">
    <div>&copy; 2026 Deutsche Bank AG, Frankfurt am Main</div>
    <div>
      <a href="#" style="color: #5f6368; margin-left: 16px; text-decoration: none;">Hilfe</a>
      <a href="#" style="color: #5f6368; margin-left: 16px; text-decoration: none;">Impressum</a>
      <a href="#" style="color: #5f6368; margin-left: 16px; text-decoration: none;">Rechtliche Hinweise</a>
      <a href="#" style="color: #5f6368; margin-left: 16px; text-decoration: none;">Datenschutz</a>
    </div>
  </footer>
</body>
</html>
`
}

function generateHtmlForBank(bank) {
  if (bank.id === 'deutsche-bank') {
    return generateDeutscheBankHtml(bank)
  }

  const branding = getBankBranding(bank)
  const primaryRgb = `rgb(${Math.round(branding.primary.red * 255)}, ${Math.round(branding.primary.green * 255)}, ${Math.round(branding.primary.blue * 255)})`
  const headerBgRgb = `rgb(${Math.round(branding.headerBg.red * 255)}, ${Math.round(branding.headerBg.green * 255)}, ${Math.round(branding.headerBg.blue * 255)})`

  const ibanMatch = bank.content.match(/DE\d{20}/)
  const rawIban = ibanMatch ? ibanMatch[0] : 'DE89370400440532013000'
  const formattedIban = rawIban.replace(/(.{4})/g, '$1 ').trim()
  const bic = 'WELADED1XXX'

  const pasteText = generatePasteForBank(bank)
  const txs = parseTransactionsFromPaste(pasteText)

  const accountType = [
    'trade-republic',
    'scalable-capital',
    'flatex',
    'smartbroker',
    'degiro-de',
  ].includes(bank.id)
    ? 'Verrechnungskonto / Depot'
    : 'Girokonto Plus'

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${bank.name} – Online-Banking | Umsatzanzeige</title>
  <style>
    :root {
      --primary-color: ${primaryRgb};
      --header-bg: ${headerBgRgb};
      --text-main: #1d1d1b;
      --text-muted: #5f6368;
      --bg-page: #f5f6f8;
      --card-bg: #ffffff;
      --border-color: #e2e4e8;
      --accent-red: #c92a2a;
      --accent-green: #2b8a3e;
      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-family);
      background-color: var(--bg-page);
      color: var(--text-main);
      line-height: 1.5;
    }
    header.portal-header {
      background-color: var(--card-bg);
      border-bottom: 3px solid var(--primary-color);
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      height: 38px;
      max-width: 140px;
      object-fit: contain;
    }
    .brand-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--primary-color);
      letter-spacing: -0.01em;
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 18px;
      font-size: 0.88rem;
      color: var(--text-muted);
    }
    .user-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--header-bg);
      border-radius: 20px;
      color: var(--text-main);
      font-weight: 600;
    }
    .btn-logout {
      background: none;
      border: 1px solid var(--border-color);
      padding: 6px 12px;
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.82rem;
    }
    nav.portal-nav {
      background-color: #212529;
      color: #fff;
    }
    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      gap: 24px;
    }
    .nav-link {
      padding: 12px 0;
      color: #ced4da;
      text-decoration: none;
      font-size: 0.9rem;
      border-bottom: 3px solid transparent;
      display: inline-block;
    }
    .nav-link.active {
      color: #ffffff;
      font-weight: 600;
      border-bottom-color: var(--primary-color);
    }
    main.portal-main {
      max-width: 1200px;
      margin: 24px auto;
      padding: 0 24px;
    }
    .account-card {
      background: var(--card-bg);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid var(--border-color);
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .account-details h2 {
      font-size: 1.25rem;
      color: var(--text-main);
      margin-bottom: 6px;
    }
    .account-meta {
      display: flex;
      gap: 20px;
      font-size: 0.88rem;
      color: var(--text-muted);
    }
    .account-meta strong {
      color: var(--text-main);
      font-family: monospace;
      font-size: 0.95rem;
    }
    .account-balance {
      text-align: right;
    }
    .balance-label {
      font-size: 0.82rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .balance-amount {
      font-size: 1.85rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--primary-color);
    }
    .table-container {
      background: var(--card-bg);
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid var(--border-color);
      overflow-x: auto;
    }
    table.banking-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }
    table.banking-table th {
      background-color: var(--header-bg);
      color: var(--text-muted);
      font-weight: 600;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
    }
    table.banking-table td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-color);
      vertical-align: middle;
    }
    table.banking-table tr:hover td {
      background-color: #fafbfc;
    }
    .col-partner {
      font-weight: 600;
      color: var(--text-main);
    }
    .col-desc {
      color: var(--text-muted);
      font-size: 0.84rem;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      background: #e9ecef;
      color: #495057;
      font-size: 0.76rem;
      font-weight: 600;
    }
    .col-amount {
      text-align: right;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .col-amount.negative { color: var(--accent-red); }
    .col-amount.positive { color: var(--accent-green); }
    footer.portal-footer {
      max-width: 1200px;
      margin: 40px auto 20px;
      padding: 20px 24px;
      border-top: 1px solid var(--border-color);
      font-size: 0.78rem;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
  </style>
</head>
<body>
  <header class="portal-header">
    <div class="header-inner">
      <div class="brand-group">
        <img class="brand-logo" src="../../../public/banks/${bank.id}.png" alt="${bank.name} Logo" onerror="this.style.display='none'">
        <span class="brand-title">${bank.name}</span>
      </div>
      <div class="user-profile">
        <span class="user-badge">👤 Max Mustermann</span>
        <button class="btn-logout" type="button">Abmelden</button>
      </div>
    </div>
  </header>

  <nav class="portal-nav">
    <div class="nav-inner">
      <a href="#" class="nav-link">Übersicht</a>
      <a href="#" class="nav-link active">Umsätze &amp; Konten</a>
      <a href="#" class="nav-link">Überweisungen</a>
      <a href="#" class="nav-link">Daueraufträge</a>
      <a href="#" class="nav-link">Service &amp; Postfach</a>
    </div>
  </nav>

  <main class="portal-main">
    <section class="account-card">
      <div class="account-details">
        <h2>${accountType}</h2>
        <div class="account-meta">
          <span>IBAN: <strong>${formattedIban}</strong></span>
          <span>BIC: <strong>${bic}</strong></span>
          <span>Inhaber: <strong>Max Mustermann</strong></span>
        </div>
      </div>
      <div class="account-balance">
        <div class="balance-label">Aktueller Kontostand</div>
        <div class="balance-amount">2.350,20 EUR</div>
      </div>
    </section>

    <div class="section-header">
      <h3 class="section-title">Umsatzübersicht</h3>
    </div>

    <!-- Desktop Table View (HTML <table>) -->
    <div class="table-container" id="view-table">
      <table class="banking-table" id="banking-table">
        <thead>
          <tr>
            <th>Buchungstag</th>
            <th>Zahlungsempfänger / Auftraggeber</th>
            <th>Verwendungszweck</th>
            <th>Umsatzart</th>
            <th style="text-align: right;">Betrag</th>
          </tr>
        </thead>
        <tbody>
${txs
  .map(
    (t) => `          <tr>
            <td>${t.date}</td>
            <td class="col-partner">${t.partner}</td>
            <td class="col-desc">${t.desc}</td>
            <td><span class="badge">${t.type}</span></td>
            <td class="col-amount ${t.isNegative ? 'negative' : 'positive'}">${t.amount}</td>
          </tr>`,
  )
  .join('\n')}
        </tbody>
      </table>
    </div>
  </main>

  <footer class="portal-footer">
    <div>${branding.legalName} · Sitz: ${branding.city} · ${branding.court}</div>
    <div>Sichere SSL-Verbindung · 100% Synthetische Testdaten</div>
  </footer>
</body>
</html>
`
}

function generateIndexHtml(bankFiles) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deutsche Banken Testportale &amp; Vorlagen</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8f9fa;
      color: #212529;
      line-height: 1.5;
      padding: 32px 24px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      background: #ffffff;
      border-radius: 12px;
      padding: 32px;
      margin-bottom: 24px;
      border: 1px solid #e9ecef;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .header h1 {
      font-size: 1.85rem;
      margin-bottom: 8px;
      color: #1a1a1a;
    }
    .header p {
      color: #6c757d;
      font-size: 0.95rem;
      margin-bottom: 20px;
    }
    .search-box {
      display: flex;
      gap: 12px;
    }
    .search-box input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #ced4da;
      border-radius: 8px;
      font-size: 0.95rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .card-top {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
    }
    .card-logo {
      width: 44px;
      height: 44px;
      object-fit: contain;
      border-radius: 6px;
      background: #f8f9fa;
      padding: 4px;
      border: 1px solid #dee2e6;
    }
    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #212529;
    }
    .card-links {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .link-btn {
      text-decoration: none;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      text-align: center;
      border: 1px solid #dee2e6;
      color: #495057;
      background: #f8f9fa;
      transition: background 0.15s;
    }
    .link-btn:hover {
      background: #e9ecef;
      color: #212529;
    }
    .link-btn.primary {
      background: #0d6efd;
      color: #ffffff;
      border-color: #0d6efd;
      grid-column: span 2;
    }
    .link-btn.primary:hover {
      background: #0b5ed7;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏛️ Testdaten &amp; Webportale aller 54 deutschen Banken</h1>
      <p>Öffne ein beliebiges Online-Banking Webportal, markiere die Umsätze mit der Maus (Strg+C) und füge sie in die Money Management App ein.</p>
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Bank suchen (z. B. Kreissparkasse Köln, Deutsche Bank, ING, DKB, N26)..." oninput="filterBanks()">
      </div>
    </div>

    <div class="grid" id="bankGrid">
${bankFiles
  .map(
    (b) => `      <div class="card" data-name="${b.name.toLowerCase()} ${b.id}">
        <div class="card-top">
          <img class="card-logo" src="../../../public/banks/${b.id}.png" alt="${b.name} Logo" onerror="this.style.display='none'">
          <div class="card-title">${b.name}</div>
        </div>
        <div class="card-links">
          <a class="link-btn primary" href="./${b.id}.html">🌐 Online-Banking Portal</a>
          <a class="link-btn" href="../pdf/${b.id}.pdf" target="_blank">📄 PDF Auszug</a>
          <a class="link-btn" href="../${b.id}.csv" download>📊 CSV Export</a>
        </div>
      </div>`,
  )
  .join('\n')}
    </div>
  </div>

  <script>
    function filterBanks() {
      const q = document.getElementById('searchInput').value.toLowerCase().trim();
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        const text = card.getAttribute('data-name');
        card.style.display = text.includes(q) ? 'flex' : 'none';
      });
    }
  </script>
</body>
</html>
`
}

// Write all CSV, PDF, Paste and HTML portal files
for (const bank of bankFiles) {
  const csvPath = path.join(outputDir, `${bank.id}.csv`)
  fs.writeFileSync(csvPath, bank.content, 'utf-8')

  const pdfBuf = await generatePdfForBank(bank)
  const pdfPath = path.join(pdfDir, `${bank.id}.pdf`)
  fs.writeFileSync(pdfPath, pdfBuf)

  const pasteContent = generatePasteForBank(bank)
  const pastePath = path.join(pasteDir, `${bank.id}.txt`)
  fs.writeFileSync(pastePath, pasteContent, 'utf-8')

  const htmlContent = generateHtmlForBank(bank)
  const htmlPath = path.join(htmlDir, `${bank.id}.html`)
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8')
}

// Write HTML index hub
fs.writeFileSync(path.join(htmlDir, 'index.html'), generateIndexHtml(bankFiles), 'utf-8')

// Write shortcut alias paste files for quick tests
fs.writeFileSync(
  path.join(pasteDir, 'ing-paste.txt'),
  generatePasteForBank(bankFiles.find((b) => b.id === 'ing-de')),
  'utf-8',
)
fs.writeFileSync(
  path.join(pasteDir, 'sparkasse-paste.txt'),
  generatePasteForBank(bankFiles.find((b) => b.id === 'berliner-sparkasse')),
  'utf-8',
)
fs.writeFileSync(
  path.join(pasteDir, 'dkb-paste.txt'),
  generatePasteForBank(bankFiles.find((b) => b.id === 'dkb')),
  'utf-8',
)
fs.writeFileSync(
  path.join(pasteDir, 'commerzbank-paste.txt'),
  generatePasteForBank(bankFiles.find((b) => b.id === 'commerzbank')),
  'utf-8',
)

// Generate README.md
const readmeContent = `# Synthetic Test Data for German Banks

This directory contains synthetic mock test data for **every German financial institution** supported by the application (54 institutions in total).

> **Important Privacy Notice:**
> All data in this directory is **100% synthetic mock test data**.
> - Names are fictional (e.g. *Max Mustermann*, *Erika Musterfrau*).
> - Account numbers and IBANs are synthetic sample test identifiers.
> - Transaction descriptions represent common German merchants (*REWE*, *EDEKA*, *ALDI*, *LIDL*, *dm*, *Deutsche Bahn*, *Spotify*, *Netflix*, *Telekom*) and standard everyday expenses (groceries, rent, utility bills, salary).
> - **Zero real personal user data is contained in this folder.**

---

## Directory Structure

\`\`\`
test-data/german-banks/
├── <institution-id>.csv      # 54 CSV files, one for each supported German bank
├── pdf/                      # 54 Official PDF statements with embedded bank logos
│   ├── <institution-id>.pdf
├── html/                     # 54 Authentic Online-Banking web portals with HTML tables
│   ├── <institution-id>.html
│   └── index.html            # Hub with bank search & links
├── paste-samples/            # 54 Web portal copy-paste texts (+ legacy aliases)
│   ├── <institution-id>.txt
│   ├── commerzbank-paste.txt
│   ├── dkb-paste.txt
│   ├── ing-paste.txt
│   └── sparkasse-paste.txt
└── README.md                 # This documentation file
\`\`\`

---

## Supported Institutions & Test Files

| Category | Institution Name | File Name | Delimiter | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **Traditional** | Deutsche Bank | \`deutsche-bank.csv\` | \`;\` | Separate Soll / Haben debit/credit columns |
| **Traditional** | Commerzbank | \`commerzbank.csv\` | \`;\` | Includes \`IBAN Kontoinhaber\` column |
| **Traditional** | HypoVereinsbank (UniCredit) | \`hypovereinsbank.csv\` | \`;\` | German standard layout |
| **Traditional** | Postbank | \`postbank.csv\` | \`;\` | Includes \`Betrag\` and running \`Saldo\` |
| **Traditional** | Targobank | \`targobank.csv\` | \`;\` | Empfänger / Absender column |
| **Traditional** | Santander Deutschland | \`santander-de.csv\` | \`;\` | Standard German statement format |
| **Traditional** | ING Deutschland | \`ing-de.csv\` | \`;\` | Includes ING metadata preamble rows and \`Betrag\`/\`Saldo\` |
| **Sparkassen** | Berliner Sparkasse | \`berliner-sparkasse.csv\` | \`;\` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Hamburger Sparkasse (Haspa) | \`hamburger-sparkasse.csv\` | \`;\` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Stadtsparkasse München | \`stadtsparkasse-muenchen.csv\` | \`;\` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Kreissparkasse Köln | \`kreissparkasse-koeln.csv\` | \`;\` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Sparkasse KölnBonn | \`sparkasse-koelnbonn.csv\` | \`;\` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Nassauische Sparkasse (Naspa) | \`nassauische-sparkasse.csv\` | \`;\` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Frankfurter Sparkasse | \`frankfurter-sparkasse.csv\` | \`;\` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Sparkasse Hannover | \`sparkasse-hannover.csv\` | \`;\` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Sparkasse Nürnberg | \`sparkasse-nuernberg.csv\` | \`;\` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Other Sparkasse | \`sparkasse-other.csv\` | \`;\` | Official Finanz Informatik OSPlus export |
| **Volksbanken** | DZ Bank | \`dz-bank.csv\` | \`;\` | Official Atruvia agree21 export |
| **Volksbanken** | Berliner Volksbank | \`berliner-volksbank.csv\` | \`;\` | Official Atruvia agree21 export |
| **Volksbanken** | Frankfurter Volksbank Rhein/Main | \`frankfurter-volksbank.csv\` | \`;\` | Official Atruvia agree21 export |
| **Volksbanken** | Münchner Bank | \`muenchner-bank.csv\` | \`;\` | Official Atruvia agree21 export |
| **Volksbanken** | Other Volksbank / Raiffeisenbank | \`volksbank-other.csv\` | \`;\` | Official Atruvia agree21 export |
| **Direct** | DKB (Deutsche Kreditbank) | \`dkb.csv\` | \`;\` | Official DKB format with gendered headers (\`Zahlungspflichtige*r\`) |
| **Direct** | comdirect | \`comdirect.csv\` | \`;\` | Official comdirect format with preamble + \`Umsatz in EUR\` |
| **Direct** | Consorsbank | \`consorsbank.csv\` | \`;\` | Consorsbank standard format |
| **Direct** | norisbank | \`norisbank.csv\` | \`;\` | Deutsche Bank group format with Soll/Haben |
| **Direct** | 1822direkt | \`1822direkt.csv\` | \`;\` | Official Finanz Informatik OSPlus format |
| **Neobanks** | N26 | \`n26.csv\` | \`,\` | Official N26 Web export with Booking Date, Partner Name, Account Name |
| **Neobanks** | Tomorrow Bank | \`tomorrow.csv\` | \`,\` | English headers with category |
| **Neobanks** | Vivid Money | \`vivid-money.csv\` | \`,\` | Official export with pocket sub-accounts |
| **Neobanks** | C24 Bank | \`c24.csv\` | \`;\` | Official C24 format with Partner IBAN and pocket/account name |
| **Neobanks** | Openbank | \`openbank-de.csv\` | \`;\` | Standard European format |
| **Neobanks** | Revolut | \`revolut-de.csv\` | \`,\` | Official Revolut CSV format |
| **Neobanks** | Wise | \`wise-de.csv\` | \`,\` | Official Wise statement format |
| **Neobanks** | bunq | \`bunq-de.csv\` | \`,\` | Official bunq statement format |
| **Landesbanken** | LBBW | \`lbbw.csv\` | \`;\` | Landesbank Baden-Württemberg format |
| **Landesbanken** | Helaba | \`helaba.csv\` | \`;\` | Landesbank Hessen-Thüringen format |
| **Landesbanken** | BayernLB | \`bayernlb.csv\` | \`;\` | BayernLB format |
| **Landesbanken** | Nord/LB | \`norddeutsche-lb.csv\` | \`;\` | Nord/LB format |
| **Brokerages** | Trade Republic | \`trade-republic.csv\` | \`,\` | Official Trade Republic app export (\`date,type,title,amount,fee,tax,currency\`) |
| **Brokerages** | Scalable Capital | \`scalable-capital.csv\` | \`,\` | Official Scalable Capital web export |
| **Brokerages** | flatex | \`flatex.csv\` | \`;\` | flatex statement export |
| **Brokerages** | Smartbroker+ | \`smartbroker.csv\` | \`;\` | Smartbroker+ export format |
| **Brokerages** | DEGIRO | \`degiro-de.csv\` | \`,\` | Official DEGIRO CSV export |
| **Specialized** | apoBank | \`apobank.csv\` | \`;\` | Deutsche Apotheker- und Ärztebank layout |
| **Specialized** | PSD Bank | \`psd-bank.csv\` | \`;\` | PSD Bank statement layout |
| **Specialized** | Sparda-Bank | \`sparda-bank.csv\` | \`;\` | Sparda-Bank layout |
| **Specialized** | GLS Bank | \`gls-bank.csv\` | \`;\` | Ethical banking statement layout |
| **Specialized** | EthikBank | \`ethikbank.csv\` | \`;\` | Ethical banking statement layout |
| **Specialized** | Triodos Bank | \`triodos-de.csv\` | \`;\` | Triodos Bank statement layout |
| **Specialized** | UmweltBank | \`umweltbank.csv\` | \`;\` | UmweltBank statement layout |
| **Payment** | PayPal | \`paypal-de.csv\` | \`,\` | Official German PayPal activity CSV with \`Brutto\` & \`Netto\` |
| **Payment** | Klarna | \`klarna-de.csv\` | \`;\` | Klarna monthly statement layout |
| **Other** | Other Institution | \`other-de.csv\` | \`;\` | Generic German fallback format |

---

## How to Use for Testing

### In the Web Application UI:
1. Start the app (\`npm run dev\`).
2. Navigate to **Import Transactions** / **Add Account**.
3. Choose any German bank (e.g. *Commerzbank*, *N26*, *DKB*, *ING*, *Berliner Sparkasse*, etc.).
4. Select **Excel / CSV** and drag & drop (or browse to) the corresponding \`.csv\` file from \`test-data/german-banks/\`.
5. Verify the preview modal displays the parsed dates, descriptions, amounts, and automatic categories.
6. For **Copy & Paste** testing, select Copy & Paste and paste content from \`test-data/german-banks/paste-samples/\`.

### Automated Testing:
Run the automated test suites to verify all test files:
\`\`\`bash
# Test all CSV bank files (54 banks)
npx vitest run src/utils/parsers/__tests__/german-banks-test-data.test.ts

# Test all PDF statement files (54 banks)
npx vitest run src/utils/parsers/__tests__/german-banks-pdf-test-data.test.ts

# Test all Copy-Paste portal samples (54 banks + aliases)
npx vitest run src/utils/parsers/__tests__/german-banks-paste-test-data.test.ts
\`\`\`
`

fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent, 'utf-8')
console.log(`Generated ${bankFiles.length} bank CSV files, ${bankFiles.length} PDF statement files, and paste samples in ${outputDir}`)
