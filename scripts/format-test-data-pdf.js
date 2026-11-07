import fs from 'node:fs'
import path from 'node:path'

export const PDF_FORMAT_SETUPS = [
  {
    id: 'pdf-01-double-date-standard-table',
    title: 'Double-Date 4-Column Standard Table Statement',
    layout: 'standard',
    iban: 'DE89 3704 0044 0532 0130 00',
    expectedMinTxs: 4,
    rows: [
      '14.10.2026|14.10.2026|Lastschrift|Supermarkt Nord Filiale 104 Einkauf|-36,80 EUR',
      '12.10.2026|12.10.2026|Dauerauftrag|Wohnbau Gesellschaft mbH Miete 10/2026|-850,00 EUR',
      '09.10.2026|09.10.2026|Lastschrift|Streaming Media Digital Abo|-11,99 EUR',
      '01.10.2026|01.10.2026|Gutschrift|Technik Werk AG Gehaltsabrechnung 10/2026|+3.250,00 EUR',
    ],
  },
  {
    id: 'pdf-02-umsatzuebersicht-grouped-categories',
    title: 'Umsatzuebersicht Layout with Truncated Text and Category Lines',
    layout: 'umsatzuebersicht',
    iban: 'DE12 5001 0517 0648 4898 90',
    expectedMinTxs: 4,
    rows: [
      '14.10.2026|14.10.2026|Lastschrift|Frischemarkt Nord 104, Berlin DE Karte Nr. 4000...|LEBENSHALTUNG|-42,60 EUR',
      '12.10.2026|12.10.2026|Dauerauftrag|Hausverwaltung Musterstr. 10, 10115 Berlin...|WOHNEN|-850,00 EUR',
      '08.10.2026|08.10.2026|Lastschrift|Stadtwerke Energie GmbH Abschlag 10/26...|LEBENSHALTUNG|-95,00 EUR',
      '01.10.2026|01.10.2026|Überweisung|MUSTERFIRMA AG LOHN/GEHALT 10/2026 End-to-End...|EINNAHMEN|+3.420,00 EUR',
    ],
  },
  {
    id: 'pdf-03-single-date-neobank-statement',
    title: 'Single-Date Modern Neobank Account Statement',
    layout: 'single-date',
    iban: 'DE27 1007 7777 0209 2997 00',
    expectedMinTxs: 4,
    rows: [
      '14.10.2026|BioMarkt Zentrum Kartenzahlung MasterCard|-28,40 EUR',
      '12.10.2026|Hausverwaltung Süd GmbH Miete Oktober 2026|-810,00 EUR',
      '06.10.2026|Cloud Storage Abo Monatsgebühr|-9,99 EUR',
      '01.10.2026|Digital Solutions AG Gehalt 10/2026|+3.300,00 EUR',
    ],
  },
  {
    id: 'pdf-04-kontoauszug-soll-haben-suffix',
    title: 'Traditional Kontoauszug with Trailing S/H and Minus Suffixes',
    layout: 'standard',
    iban: 'DE52 3705 0198 0001 1223 34',
    expectedMinTxs: 4,
    rows: [
      '14.10.2026|14.10.2026|Kartenzahlung|Frischemarkt West Lebensmittel|44,90 S EUR',
      '12.10.2026|12.10.2026|Dauerauftrag|Immobilien Verwaltung Nord Miete|830,00 S EUR',
      '07.10.2026|07.10.2026|Lastschrift|Telekom Deutschland Festnetz 10/26|39,95- EUR',
      '01.10.2026|01.10.2026|Gutschrift|Maschinenbau Nord AG Bezüge 10/2026|3.190,00 H EUR',
    ],
  },
  {
    id: 'pdf-05-two-digit-year-compact',
    title: 'Compact Statement with 2-Digit Years (DD.MM.YY)',
    layout: 'standard',
    iban: 'DE19 5007 0010 0987 6543 21',
    expectedMinTxs: 4,
    rows: [
      '14.10.26|14.10.26|Lastschrift|Drogeriemarkt Mitte Einkauf|-19,80 EUR',
      '12.10.26|12.10.26|Dauerauftrag|Wohnpark GmbH Warmmiete 10/26|-790,00 EUR',
      '05.10.26|05.10.26|Lastschrift|Verkehrsverbund Monatskarte Abo|-49,00 EUR',
      '01.10.26|01.10.26|Gutschrift|Nordlicht Technik GmbH Gehalt 10/26|+3.050,00 EUR',
    ],
  },
  {
    id: 'pdf-06-iso-date-international',
    title: 'International Statement with ISO Dates (YYYY-MM-DD) and Dot Decimals',
    layout: 'standard',
    iban: 'DE44 5001 0517 5407 3249 31',
    expectedMinTxs: 4,
    rows: [
      '2026-10-14|2026-10-14|Card Payment|Fresh Market Groceries Berlin|-52.30 EUR',
      '2026-10-12|2026-10-12|Standing Order|City Residential Lease Oct 2026|-880.00 EUR',
      '2026-10-08|2026-10-08|Direct Debit|Fiber Internet Service Plan|-34.90 EUR',
      '2026-10-01|2026-10-01|Credit Transfer|EuroSystems Engineering Payroll|+3,450.00 EUR',
    ],
  },
  {
    id: 'pdf-07-multipage-carryover-statement',
    title: 'Multi-Page Statement with Carryover (Uebertrag / Zwischensaldo)',
    layout: 'multipage',
    iban: 'DE68 2105 0170 0012 3456 78',
    expectedMinTxs: 4,
    rows: [
      '14.10.2026|14.10.2026|Lastschrift|Supermarkt Zentrum Einkauf|-38,20 EUR',
      '12.10.2026|12.10.2026|Dauerauftrag|Hausverwaltung Mitte Miete 10/2026|-840,00 EUR',
      '06.10.2026|06.10.2026|Lastschrift|Stadtwerke Strom Abschlag 10/2026|-85,00 EUR',
      '01.10.2026|01.10.2026|Gutschrift|Hanseatische Werft AG Gehalt 10/2026|+3.380,00 EUR',
    ],
  },
  {
    id: 'pdf-08-sepa-mandate-multiline',
    title: 'Dense SEPA Statement with Counterparty IBAN, Mandate, and EREF',
    layout: 'standard',
    iban: 'DE31 2004 0060 0555 6667 77',
    expectedMinTxs: 4,
    rows: [
      '14.10.2026|14.10.2026|SEPA-Lastschrift|BioMarkt GmbH EREF: BM-2026-991 MREF: M-8821 DE44500105175407324931|-61,40 EUR',
      '12.10.2026|12.10.2026|Dauerauftrag|Wohnbau eG EREF: MIETE-10-2026 DE12500105170648489890|-860,00 EUR',
      '07.10.2026|07.10.2026|SEPA-Lastschrift|Versicherung AG CRED: DE98ZZZ09999999999 MREF: V-2026|-42,10 EUR',
      '01.10.2026|01.10.2026|Gutschrift|Technik Gruppe SE Lohn/Gehalt DE21300500001020304050|+3.510,00 EUR',
    ],
  },
  {
    id: 'pdf-09-credit-card-monthly-statement',
    title: 'Credit Card Monthly Billing Statement (Kartenabrechnung)',
    layout: 'standard',
    iban: 'DE08 1203 0000 1020 3040 50',
    expectedMinTxs: 4,
    rows: [
      '14.10.2026|15.10.2026|Kartenzahlung|Hotel Alpenblick Innsbruck AT Karte 4543|-145,00 EUR',
      '11.10.2026|12.10.2026|Kartenzahlung|Online Buchversand Bestellung 88219|-32,90 EUR',
      '05.10.2026|06.10.2026|Kartenzahlung|Tankstelle Süd Kraftstoff|-68,50 EUR',
      '01.10.2026|01.10.2026|Ausgleich|Kontoausgleich Referenzkonto Gutschrift|+500,00 EUR',
    ],
  },
  {
    id: 'pdf-10-brokerage-depot-statement',
    title: 'Brokerage Cash & Depot Account Statement',
    layout: 'standard',
    iban: 'DE40 1001 0123 4567 8901 23',
    expectedMinTxs: 4,
    rows: [
      '15.10.2026|15.10.2026|Sparplan|ETF Sparplan MSCI World IE00B4L5Y983|-250,00 EUR',
      '10.10.2026|10.10.2026|Wertpapierkauf|Kauf 5 Stk. Siemens AG DE0007236101|-780,00 EUR',
      '05.10.2026|05.10.2026|Dividende|Ausschüttung Dividende Allianz SE|+165,00 EUR',
      '01.10.2026|01.10.2026|Einzahlung|Gutschrift vom Referenzkonto|+1.000,00 EUR',
    ],
  },
  {
    id: 'pdf-11-slash-date-english-statement',
    title: 'English Statement with Slash Dates (DD/MM/YYYY)',
    layout: 'standard',
    iban: 'DE75 5121 0800 1245 1261 99',
    expectedMinTxs: 4,
    rows: [
      '14/10/2026|14/10/2026|POS Purchase|City Supermarket Checkout 04|-47,20 EUR',
      '12/10/2026|12/10/2026|Standing Order|Harbor Apartments Monthly Rent|-850,00 EUR',
      '06/10/2026|06/10/2026|Direct Debit|Metro Electric Utility Bill|-74,00 EUR',
      '01/10/2026|01/10/2026|Salary Credit|Global Tech Solutions Ltd Payroll|+3.350,00 EUR',
    ],
  },
  {
    id: 'pdf-12-reimbursement-and-fee-refunds',
    title: 'Statement with Travel Reimbursements (REISESP) and Fee Refunds (Rueckverguetung)',
    layout: 'standard',
    iban: 'DE91 1005 0000 0123 4567 89',
    expectedMinTxs: 4,
    rows: [
      '14.10.2026|14.10.2026|Lastschrift|Feinkost Bäckerei Einkauf|-14,50 EUR',
      '12.10.2026|12.10.2026|Dauerauftrag|Wohnungsbau Süd GmbH Miete 10/2026|-820,00 EUR',
      '08.10.2026|08.10.2026|Überweisung|MUSTERFIRMA AG REISESP.08.10.2026/99001122 Reisekosten|185,00 EUR',
      '04.10.2026|04.10.2026|Überweisung|Musterbank AG Rueckverguetung fuer 2025/KDNR: 1000|35,00 EUR',
    ],
  },
]

function escapePdfText(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/ä/g, '\xe4')
    .replace(/ö/g, '\xf6')
    .replace(/ü/g, '\xfc')
    .replace(/Ä/g, '\xc4')
    .replace(/Ö/g, '\xd6')
    .replace(/Ü/g, '\xdc')
    .replace(/ß/g, '\xdf')
    .replace(/€/g, 'EUR')
    .replace(/[^\x20-\x7e\xc4\xd6\xdc\xdf\xe4\xf6\xfc]/g, ' ')
}

function pdfText(font, size, x, y, rgb, str) {
  return `BT /${font} ${size} Tf ${rgb} rg 1 0 0 1 ${x} ${y} Tm (${escapePdfText(str)}) Tj ET`
}

function buildUmsatzuebersichtStream(setup) {
  const ops = [
    pdfText('F2', 18, 365, 785, '0.05 0.12 0.16', 'MUSTERBANK'),
    '0.99 0.88 0.00 rg 522 798 m 536 798 l 543 785 l 536 772 l 522 772 l 515 785 l f',
    '1 1 1 rg 525 792 m 533 792 l 537 785 l 533 778 l 525 778 l 521 785 l f',
    pdfText('F1', 15, 54, 710, '0.05 0.05 0.05', 'Umsatzübersicht'),
    pdfText('F1', 8.5, 54, 678, '0.1 0.1 0.1', 'Max Mustermann'),
    pdfText('F1', 8.5, 54, 666, '0.1 0.1 0.1', 'PremiumKonto'),
    pdfText('F1', 8.5, 54, 646, '0.1 0.1 0.1', `IBAN: ${setup.iban}`),
    pdfText('F1', 8.5, 54, 636, '0.1 0.1 0.1', 'BIC: MUSTDEFFXXX'),
    pdfText('F1', 7.5, 368, 710, '0.1 0.1 0.1', 'www.musterbank.example'),
    pdfText('F2', 8.5, 368, 674, '0.05 0.05 0.05', 'Kontostand'),
    pdfText('F1', 8.5, 485, 674, '0.0 0.52 0.3', '+3.850,00 EUR'),
    '0.1 0.1 0.1 RG 0.8 w 368 669 m 541 669 l S',
    pdfText('F1', 7.5, 368, 658, '0.15 0.15 0.15', 'Kontostand per 15.Okt 2026, 12:00 Uhr'),
    pdfText('F2', 8.5, 368, 632, '0.05 0.05 0.05', 'Auswahlkriterien:'),
    '0.1 0.1 0.1 RG 0.8 w 368 627 m 541 627 l S',
    pdfText('F1', 7.5, 368, 616, '0.15 0.15 0.15', 'Zeitraum: 01.10.2026 - 15.10.2026'),
    pdfText('F1', 7.5, 368, 605, '0.15 0.15 0.15', 'Umsätze: Alle, Neueste zuerst'),
    pdfText('F1', 8, 54, 560, '0.1 0.1 0.1', `${setup.rows.length} Umsätze`),
    '0.05 0.05 0.05 RG 1.1 w 54 550 m 541 550 l S',
    pdfText('F2', 8, 54, 535, '0.05 0.05 0.05', 'Buchungstag / Wertstellung'),
    pdfText('F2', 8, 188, 535, '0.05 0.05 0.05', 'Umsatzart'),
    pdfText('F2', 8, 302, 535, '0.05 0.05 0.05', 'Buchungstext (gekürzt) / Kategorie'),
    pdfText('F2', 8, 514, 535, '0.05 0.05 0.05', 'Betrag'),
    '0.05 0.05 0.05 RG 0.9 w 54 516 m 541 516 l S',
  ]

  let y = 496
  for (const rawRow of setup.rows) {
    const [bDate, vDate, txType, desc, cat, amt] = rawRow.split('|')
    const amtColor = amt.startsWith('+') ? '0.0 0.52 0.3' : '0.1 0.1 0.1'
    ops.push(
      pdfText('F1', 8, 54, y, '0.1 0.1 0.1', bDate),
      pdfText('F1', 8, 54, y - 10, '0.1 0.1 0.1', vDate),
      pdfText('F1', 8, 188, y, '0.1 0.1 0.1', txType),
      pdfText('F1', 8, 302, y, '0.1 0.1 0.1', desc),
      pdfText('F1', 8, 302, y - 12, '0.15 0.15 0.15', cat),
      pdfText('F1', 8, 486, y, amtColor, amt),
      `0.1 0.1 0.1 RG 0.7 w 54 ${y - 24} m 541 ${y - 24} l S`,
    )
    y -= 44
  }

  ops.push(
    pdfText('F1', 8, 54, y - 4, '0.1 0.1 0.1', 'Summe der Umsätze +2.432,40 EUR'),
    `0.05 0.05 0.05 RG 1.1 w 54 ${y - 14} m 541 ${y - 14} l S`,
    '0.99 0.88 0.00 rg 200 34 195 12 re f',
    pdfText('F1', 7.5, 54, 36, '0.15 0.15 0.15', 'Download am 15. Okt 2026, 12:00:00 Uhr'),
    pdfText('F1', 7.5, 505, 36, '0.15 0.15 0.15', 'Seite 1/1'),
  )
  return ops.join('\n')
}

function buildStandardStream(setup, pageIndex = 1, totalPages = 1) {
  const ops = [
    pdfText('F2', 14, 54, 785, '0.08 0.18 0.32', setup.title),
    pdfText('F1', 9, 54, 768, '0.25 0.28 0.32', `IBAN: ${setup.iban}   |   BIC: TESTDEFFXXX`),
    '0.15 0.25 0.40 RG 1.2 w 54 756 m 541 756 l S',
    '0.94 0.96 0.98 rg 54 726 487 20 re f',
    pdfText('F2', 8.5, 60, 733, '0.1 0.1 0.1', 'Buchungstag / Valuta'),
    pdfText('F2', 8.5, 195, 733, '0.1 0.1 0.1', 'Buchungstext / Verwendungszweck'),
    pdfText('F2', 8.5, 480, 733, '0.1 0.1 0.1', 'Betrag'),
  ]

  let y = 704
  const rows =
    totalPages > 1 ? (pageIndex === 1 ? setup.rows.slice(0, 2) : setup.rows.slice(2)) : setup.rows

  for (const rawRow of rows) {
    const parts = rawRow.split('|')
    const lineText =
      setup.layout === 'single-date' ? `${parts[0]}   ${parts[1]}   ${parts[2]}` : parts.join(' ')
    ops.push(
      pdfText('F1', 8.5, 60, y, '0.1 0.1 0.1', lineText),
      `0.85 0.88 0.91 RG 0.5 w 54 ${y - 10} m 541 ${y - 10} l S`,
    )
    y -= 28
  }

  if (totalPages > 1 && pageIndex === 1) {
    ops.push(
      pdfText('F2', 8.5, 60, y - 10, '0.2 0.2 0.2', '14.10.2026 14.10.2026 Übertrag 1.500,00 EUR'),
    )
  } else {
    ops.push(
      pdfText(
        'F2',
        8.5,
        60,
        y - 10,
        '0.2 0.2 0.2',
        '15.10.2026 15.10.2026 Neuer Kontostand 3.850,00 EUR',
      ),
      pdfText(
        'F1',
        8,
        60,
        y - 24,
        '0.3 0.3 0.3',
        '15.10.2026 15.10.2026 Summe der Umsätze +2.308,50 EUR',
      ),
    )
  }

  ops.push(
    pdfText(
      'F1',
      7.5,
      54,
      36,
      '0.4 0.4 0.4',
      `Synthetischer Testbeleg (${setup.id}) · Seite ${pageIndex}/${totalPages}`,
    ),
  )
  return ops.join('\n')
}

function assemblePdfDocument(pageStreams) {
  const objects = []
  const addObj = (body) => {
    objects.push(body)
    return objects.length
  }

  const font1Id = addObj(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  )
  const font2Id = addObj(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  )
  const imgBytes = Buffer.from([0, 46, 60, 255, 237, 0, 255, 237, 0, 0, 46, 60])
  const imgObjId = addObj({
    header: `<< /Type /XObject /Subtype /Image /Width 2 /Height 2 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length ${imgBytes.length} >>\nstream\n`,
    stream: imgBytes,
    footer: '\nendstream',
  })

  const pageIds = []
  const pagesRootId = addObj('')

  for (const streamText of pageStreams) {
    const streamBuf = Buffer.from(`q 12 0 0 12 525 780 cm /Im1 Do Q\n${streamText}`, 'latin1')
    const contentId = addObj({
      header: `<< /Length ${streamBuf.length} >>\nstream\n`,
      stream: streamBuf,
      footer: '\nendstream',
    })
    pageIds.push(
      addObj(
        `<< /Type /Page /Parent ${pagesRootId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font1Id} 0 R /F2 ${font2Id} 0 R >> /XObject << /Im1 ${imgObjId} 0 R >> >> /Contents ${contentId} 0 R >>`,
      ),
    )
  }

  objects[pagesRootId - 1] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
  const catalogId = addObj(`<< /Type /Catalog /Pages ${pagesRootId} 0 R >>`)

  const chunks = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'binary')]
  const offsets = []
  let currentOffset = chunks[0].length

  for (let i = 0; i < objects.length; i++) {
    offsets.push(currentOffset)
    const obj = objects[i]
    const bodyBuf =
      typeof obj === 'string'
        ? Buffer.from(obj, 'ascii')
        : Buffer.concat([
            Buffer.from(obj.header, 'ascii'),
            obj.stream,
            Buffer.from(obj.footer, 'ascii'),
          ])
    const fullObj = Buffer.concat([
      Buffer.from(`${i + 1} 0 obj\n`, 'ascii'),
      bodyBuf,
      Buffer.from('\nendobj\n', 'ascii'),
    ])
    chunks.push(fullObj)
    currentOffset += fullObj.length
  }

  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const off of offsets) {
    xref += `${String(off).padStart(10, '0')} 00000 n \n`
  }
  xref += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${currentOffset}\n%%EOF\n`
  chunks.push(Buffer.from(xref, 'ascii'))
  return Buffer.concat(chunks)
}

export function generatePdfTestFiles(pdfDir) {
  fs.mkdirSync(pdfDir, { recursive: true })
  for (const setup of PDF_FORMAT_SETUPS) {
    const streams =
      setup.layout === 'umsatzuebersicht'
        ? [buildUmsatzuebersichtStream(setup)]
        : setup.layout === 'multipage'
          ? [buildStandardStream(setup, 1, 2), buildStandardStream(setup, 2, 2)]
          : [buildStandardStream(setup, 1, 1)]
    fs.writeFileSync(path.join(pdfDir, `${setup.id}.pdf`), assemblePdfDocument(streams))
  }
  return PDF_FORMAT_SETUPS.length
}
