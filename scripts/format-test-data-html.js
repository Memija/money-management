import fs from 'node:fs'
import path from 'node:path'

function wrapHtmlShell(title, iban, bodyMarkup) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} – Synthetischer Online-Banking Testbeleg</title>
  <style>
    :root { --bg: #f6f8fa; --surface: #fff; --text: #1b2430; --border: #dde3ea; --pos: #0a7a42; --neg: #c42828; }
    body { margin: 0; font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); padding: 24px; }
    .container { max-width: 960px; margin: 0 auto; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 24px; }
    .acct-meta { display: flex; justify-content: space-between; border-bottom: 2px solid var(--border); padding-bottom: 12px; margin-bottom: 18px; }
    table, [role="table"] { width: 100%; border-collapse: collapse; }
    th, td, [role="columnheader"], [role="cell"] { padding: 10px; border-bottom: 1px solid var(--border); text-align: left; }
    [role="row"] { display: grid; grid-template-columns: 120px 1fr 1fr 140px; }
    .amt-pos { color: var(--pos); font-weight: 600; }
    .amt-neg { color: var(--neg); font-weight: 600; }
    .feed-card, .timeline-item, .mkp-card, details, li { padding: 10px; border-bottom: 1px solid var(--border); }
  </style>
</head>
<body>
  <main class="container">
    <header class="acct-meta">
      <div>
        <h1>${title}</h1>
        <p>Konto: Girokonto | IBAN: <strong>${iban}</strong> | Kontoinhaber: Max Mustermann</p>
      </div>
      <div>Kontostand: <strong>+3.850,00 EUR</strong></div>
    </header>
    ${bodyMarkup}
  </main>
</body>
</html>`
}

export const HTML_FORMAT_SETUPS = [
  {
    id: 'html-01-standard-table-5col',
    title: 'Standard 5-Column Semantic HTML Table',
    iban: 'DE89370400440532013000',
    expectedMinTxs: 4,
    html: wrapHtmlShell(
      'Standard 5-Column Semantic Table',
      'DE89 3704 0044 0532 0130 00',
      `<table>
        <thead><tr><th>Buchungstag</th><th>Wertstellung</th><th>Umsatzart</th><th>Buchungstext</th><th>Betrag</th></tr></thead>
        <tbody>
          <tr><td>14.10.2026</td><td>14.10.2026</td><td>Lastschrift</td><td>Supermarkt Nord Filiale 104 Einkauf</td><td class="amt-neg">-36,80 EUR</td></tr>
          <tr><td>12.10.2026</td><td>12.10.2026</td><td>Dauerauftrag</td><td>Wohnbau Gesellschaft mbH Miete 10/2026</td><td class="amt-neg">-850,00 EUR</td></tr>
          <tr><td>09.10.2026</td><td>09.10.2026</td><td>Lastschrift</td><td>Streaming Media Digital Abo</td><td class="amt-neg">-11,99 EUR</td></tr>
          <tr><td>01.10.2026</td><td>01.10.2026</td><td>Gutschrift</td><td>Technik Werk AG Gehaltsabrechnung 10/2026</td><td class="amt-pos">+3.250,00 EUR</td></tr>
        </tbody>
      </table>`,
    ),
  },
  {
    id: 'html-02-split-soll-haben-balance-table',
    title: 'Split Soll/Haben Columns with Running Saldo Column',
    iban: 'DE19500700100987654321',
    expectedMinTxs: 4,
    html: wrapHtmlShell(
      'Split Soll and Haben Table with Running Balance',
      'DE19 5007 0010 0987 6543 21',
      `<table>
        <thead><tr><th>Buchungstag</th><th>Empfänger / Auftraggeber</th><th>Verwendungszweck</th><th>Soll</th><th>Haben</th><th>Saldo</th></tr></thead>
        <tbody>
          <tr><td>14.10.2026</td><td>Frischemarkt Zentrum</td><td>Kartenzahlung Einkauf</td><td>48,60 EUR</td><td></td><td>3.850,00 EUR</td></tr>
          <tr><td>12.10.2026</td><td>ImmoVerwaltung Süd GmbH</td><td>Miete Wohnung 10/2026</td><td>850,00 EUR</td><td></td><td>4.502,30 EUR</td></tr>
          <tr><td>06.10.2026</td><td>Sportverein Eintracht e.V.</td><td>Mitgliedsbeitrag Q4</td><td>25,00 EUR</td><td></td><td>5.352,30 EUR</td></tr>
          <tr><td>01.10.2026</td><td>Industrie Werk GmbH</td><td>Gehaltsabrechnung 10/2026</td><td></td><td>3.450,00 EUR</td><td>5.377,30 EUR</td></tr>
        </tbody>
      </table>`,
    ),
  },
  {
    id: 'html-03-stacked-date-and-category-table',
    title: '4-Column Stacked Date + Category Badge Table (Umsatzuebersicht)',
    iban: 'DE12500105170648489890',
    expectedMinTxs: 4,
    html: wrapHtmlShell(
      '4-Column Stacked Date & Category Table',
      'DE12 5001 0517 0648 4898 90',
      `<table>
        <thead><tr><th>Buchungstag<br/>Wertstellung</th><th>Umsatzart</th><th>Buchungstext (gekürzt)<br/>Kategorie</th><th>Betrag</th></tr></thead>
        <tbody>
          <tr><td><div>14.10.2026</div><div>14.10.2026</div></td><td>Lastschrift</td><td><div>Frischemarkt Nord 104, Berlin DE Karte Nr. 4000</div><div>LEBENSHALTUNG</div></td><td>-42,60 EUR</td></tr>
          <tr><td><div>12.10.2026</div><div>12.10.2026</div></td><td>Dauerauftrag</td><td><div>Hausverwaltung Musterstr. 10, 10115 Berlin</div><div>WOHNEN</div></td><td>-850,00 EUR</td></tr>
          <tr><td><div>08.10.2026</div><div>08.10.2026</div></td><td>Lastschrift</td><td><div>Stadtwerke Energie GmbH Abschlag 10/26</div><div>WOHNEN</div></td><td>-95,00 EUR</td></tr>
          <tr><td><div>01.10.2026</div><div>01.10.2026</div></td><td>Überweisung</td><td><div>MUSTERFIRMA AG LOHN/GEHALT 10/2026</div><div>EINNAHMEN</div></td><td>+3.420,00 EUR</td></tr>
        </tbody>
      </table>`,
    ),
  },
  {
    id: 'html-04-soll-haben-indicator-column-table',
    title: 'Unsigned Amount Column + Dedicated S/H Indicator Column',
    iban: 'DE31200400600555666777',
    expectedMinTxs: 4,
    html: wrapHtmlShell(
      'Unsigned Amount + S/H Indicator Table',
      'DE31 2004 0060 0555 6667 77',
      `<table>
        <thead><tr><th>Buchungstag</th><th>Zahlungsbeteiligter</th><th>Verwendungszweck</th><th>Umsatz</th><th>S/H</th></tr></thead>
        <tbody>
          <tr><td>14.10.2026</td><td>Drogeriemarkt Zentrum</td><td>Kartenzahlung Einkauf</td><td>24,85 EUR</td><td>S</td></tr>
          <tr><td>12.10.2026</td><td>Wohnungsbau Nord eG</td><td>Miete Oktober 2026</td><td>790,00 EUR</td><td>S</td></tr>
          <tr><td>08.10.2026</td><td>Versicherung Schutz AG</td><td>Haftpflicht Beitrag</td><td>18,40 EUR</td><td>S</td></tr>
          <tr><td>01.10.2026</td><td>Hanseatische Logistik GmbH</td><td>Gehalt 10/2026</td><td>3.150,00 EUR</td><td>H</td></tr>
        </tbody>
      </table>`,
    ),
  },
  {
    id: 'html-05-day-grouped-card-list',
    title: 'Day-Grouped Card List (.mkp-card-list)',
    iban: 'DE52370501980001122334',
    expectedMinTxs: 4,
    html: wrapHtmlShell(
      'Day-Grouped Card List',
      'DE52 3705 0198 0001 1223 34',
      `<div class="mkp-card-list">
        <div class="mkp-list-subline"><h3 class="groupdate">14.10.2026</h3></div>
        <div class="mkp-card-group"><div class="mkp-card mkp-card-debit"><span class="mkp-identifier-link">Supermarkt Süd GmbH</span><p>Kartenzahlung Wocheneinkauf</p><strong>-58,40 EUR</strong></div></div>
        <div class="mkp-list-subline"><h3 class="groupdate">12.10.2026</h3></div>
        <div class="mkp-card-group">
          <div class="mkp-card mkp-card-debit"><span class="mkp-identifier-link">Immobilien Treuhand KG</span><p>Dauerauftrag Miete 10/2026</p><strong>-840,00 EUR</strong></div>
          <div class="mkp-card mkp-card-debit"><span class="mkp-identifier-link">Stadtwerke Versorgung</span><p>Abschlag Strom und Gas</p><strong>-92,00 EUR</strong></div>
        </div>
        <div class="mkp-list-subline"><h3 class="groupdate">01.10.2026</h3></div>
        <div class="mkp-card-group"><div class="mkp-card mkp-card-credit"><span class="mkp-identifier-link">Rheinland Technik GmbH</span><p>Gehaltsgutschrift 10/2026</p><strong>+3.290,00 EUR</strong></div></div>
      </div>`,
    ),
  },
  {
    id: 'html-06-custom-web-components',
    title: 'Custom Web Components (<db-list-row> / <tx-list-row>)',
    iban: 'DE68210501700012345678',
    expectedMinTxs: 4,
    html: wrapHtmlShell(
      'Custom Web Components Transaction Feed',
      'DE68 2105 0170 0012 3456 78',
      `<section>
        <h3>14.10.2026</h3>
        <db-list-row><span class="db-text--highlight">BioMarkt Alnatura</span><span class="db-text--mute">Kartenzahlung Filiale Süd</span><span class="db-amount" slot="actions">-54,20 EUR</span></db-list-row>
        <h3>12.10.2026</h3>
        <db-list-row><span class="db-text--highlight">Hausverwaltung Zentrum</span><span class="db-text--mute">Dauerauftrag Warmmiete 10/2026</span><span class="db-amount" slot="actions">-820,00 EUR</span></db-list-row>
        <h3>07.10.2026</h3>
        <tx-list-row><strong class="tx-partner">Telekommunikation Netz AG</strong><span class="tx-purpose">Glasfaser Tarif 10/2026</span><span class="tx-amount">-39,99 EUR</span></tx-list-row>
        <h3>01.10.2026</h3>
        <tx-list-row><strong class="tx-partner">Musterbau Technik AG</strong><span class="tx-purpose">Lohn und Gehalt 10/2026</span><span class="tx-amount">+3.180,00 EUR</span></tx-list-row>
      </section>`,
    ),
  },
  {
    id: 'html-07-timeline-feed-prefix-currency',
    title: 'Neobank Timeline Feed with ISO Dates and Prefix Currency (- € 36.80)',
    iban: 'DE27100777770209299700',
    expectedMinTxs: 4,
    html: wrapHtmlShell(
      'Neobank Activity Timeline Feed',
      'DE27 1007 7777 0209 2997 00',
      `<div class="timeline-feed">
        <div class="timeline-item"><div class="title">Organic Supermarket</div><div class="subtitle">2026-10-14 · MasterCard Payment</div><div class="amount">- € 46.80</div></div>
        <div class="timeline-item"><div class="title">Urban Living GmbH</div><div class="subtitle">2026-10-12 · Standing Order Rent</div><div class="amount">- € 850.00</div></div>
        <div class="timeline-item"><div class="title">Cloud Streaming Service</div><div class="subtitle">2026-10-08 · Direct Debit</div><div class="amount">- € 13.99</div></div>
        <div class="timeline-item"><div class="title">CloudTech Solutions AG</div><div class="subtitle">2026-10-01 · Salary Credit Transfer</div><div class="amount">+ € 3,350.00</div></div>
      </div>`,
    ),
  },
  {
    id: 'html-08-pending-and-booked-sections',
    title: 'Pending (Vorgemerkte Umsaetze) + Booked Sections',
    iban: 'DE08120300001020304050',
    expectedMinTxs: 4,
    html: wrapHtmlShell(
      'Pending and Booked Transactions View',
      'DE08 1203 0000 1020 3040 50',
      `<div class="feed-list">
        <div class="feed-card"><strong class="partner">Bäckerei Morgenrot</strong><p class="desc">Voraussichtliche Buchung: 15.10.2026 · Kartenzahlung</p><span class="amount">-9,40 EUR</span></div>
        <div class="feed-card"><strong class="partner">Kaufhaus Mitte GmbH</strong><p class="desc">14.10.2026 · Kartenzahlung Haushalt</p><span class="amount">-38,90 EUR</span></div>
        <div class="feed-card"><strong class="partner">Wohnpark Verwaltung GmbH</strong><p class="desc">12.10.2026 · Dauerauftrag Miete 10/2026</p><span class="amount">-860,00 EUR</span></div>
        <div class="feed-card"><strong class="partner">Solaris Engineering AG</strong><p class="desc">01.10.2026 · Gehaltszahlung 10/2026</p><span class="amount">+3.320,00 EUR</span></div>
      </div>`,
    ),
  },
  {
    id: 'html-09-multicurrency-activity-stream',
    title: 'Multi-Currency International Feed (EUR, USD, GBP, PLN)',
    iban: 'DE44500105175407324931',
    expectedMinTxs: 4,
    html: wrapHtmlShell(
      'Multi-Currency International Activity Stream',
      'DE44 5001 0517 5407 3249 31',
      `<div class="feed-list">
        <div class="feed-card"><div class="title">Cloud Infrastructure Inc</div><div class="subtitle">14.10.2026 · Card Payment USD</div><div class="amount">-49.99 USD</div></div>
        <div class="feed-card"><div class="title">London Rail Express</div><div class="subtitle">12.10.2026 · Contactless Transit</div><div class="amount">-24.50 GBP</div></div>
        <div class="feed-card"><div class="title">Krakow Bistro Sp. z o.o.</div><div class="subtitle">09.10.2026 · POS Card Payment</div><div class="amount">-125,00 zł</div></div>
        <div class="feed-card"><div class="title">European Consulting Partners</div><div class="subtitle">01.10.2026 · Monthly Retainer Transfer</div><div class="amount">+3.400,00 EUR</div></div>
      </div>`,
    ),
  },
  {
    id: 'html-10-accordion-details-rows',
    title: 'Expandable <details> / <summary> SEPA Rows with Counterparty IBAN',
    iban: 'DE91100500000123456789',
    expectedMinTxs: 4,
    html: wrapHtmlShell(
      'Expandable SEPA Accordion Rows',
      'DE91 1005 0000 0123 4567 89',
      `<section>
        <details open><summary><strong>Supermarkt Nordwest Filiale 12</strong> · 14.10.2026 · <span class="amount">-41,25 EUR</span></summary><p>SEPA-Lastschrift · EREF: SNW-2026-1014 · Gegenkonto DE89370400440532013000</p></details>
        <details><summary><strong>Hausverwaltung Alster GmbH</strong> · 12.10.2026 · <span class="amount">-890,00 EUR</span></summary><p>Dauerauftrag · Miete Oktober 2026 · IBAN DE12500105170648489890</p></details>
        <details><summary><strong>Medienanstalt Service</strong> · 08.10.2026 · <span class="amount">-54,00 EUR</span></summary><p>Folgelastschrift · Quartalsbeitrag Q4/2026 · MREF: RB-99201</p></details>
        <details><summary><strong>Norddeutsche Technik AG</strong> · 01.10.2026 · <span class="amount">+3.480,00 EUR</span></summary><p>Gehaltsgutschrift 10/2026 · IBAN DE21300500001020304050</p></details>
      </section>`,
    ),
  },
  {
    id: 'html-11-aria-role-grid',
    title: 'ARIA Headless UI Data Grid (role="table" / role="row" / role="cell")',
    iban: 'DE75512108001245126199',
    expectedMinTxs: 4,
    html: wrapHtmlShell(
      'ARIA Role Data Grid (No <table> Tag)',
      'DE75 5121 0800 1245 1261 99',
      `<div role="table" aria-label="Umsatzliste">
        <div role="rowgroup"><div role="row"><div role="columnheader">Datum</div><div role="columnheader">Zahlungsbeteiligter</div><div role="columnheader">Verwendungszweck</div><div role="columnheader">Betrag</div></div></div>
        <div role="rowgroup">
          <div role="row"><div role="cell">14.10.2026</div><div role="cell">Cornerstone Cafe</div><div role="cell">Kartenzahlung POS</div><div role="cell">-12,50 EUR</div></div>
          <div role="row"><div role="cell">12.10.2026</div><div role="cell">Metro Residential Ltd</div><div role="cell">Miete Oktober 2026</div><div role="cell">-900,00 EUR</div></div>
          <div role="row"><div role="cell">05.10.2026</div><div role="cell">City Transit Authority</div><div role="cell">Monatsticket Abo</div><div role="cell">-58,00 EUR</div></div>
          <div role="row"><div role="cell">01.10.2026</div><div role="cell">Global Systems Corp</div><div role="cell">Gehalt Oktober 2026</div><div role="cell">+3.600,00 EUR</div></div>
        </div>
      </div>`,
    ),
  },
  {
    id: 'html-12-semantic-ul-li-multilingual',
    title: 'Semantic <ul> / <li> List with Multilingual Transaction Labels',
    iban: 'DE40100101234567890123',
    expectedMinTxs: 4,
    html: wrapHtmlShell(
      'Semantic List with Multilingual Labels',
      'DE40 1001 0123 4567 8901 23',
      `<ul>
        <li><strong>Market Spożywczy Centrum</strong><p>14.10.2026 · Płatność kartą Zakupy</p><span data-amount>-44,20 EUR</span></li>
        <li><strong>Wspólnota Mieszkaniowa</strong><p>12.10.2026 · Zlecenie stałe Czynsz</p><span data-amount>-760,00 EUR</span></li>
        <li><strong>Miejski Zakład Energetyczny</strong><p>07.10.2026 · Polecenie zapłaty Prąd</p><span data-amount>-62,00 EUR</span></li>
        <li><strong>TechPol Software Sp. z o.o.</strong><p>01.10.2026 · Wynagrodzenie 10/2026</p><span data-amount>+3.200,00 EUR</span></li>
      </ul>`,
    ),
  },
]

export function generateHtmlTestFiles(htmlDir) {
  fs.mkdirSync(htmlDir, { recursive: true })
  for (const setup of HTML_FORMAT_SETUPS) {
    fs.writeFileSync(path.join(htmlDir, `${setup.id}.html`), setup.html + '\n', 'utf-8')
  }
  const indexLinks = HTML_FORMAT_SETUPS.map(
    (s) => `<li><a href="./${s.id}.html"><strong>${s.id}.html</strong></a> – ${s.title}</li>`,
  ).join('\n      ')
  const indexHtml = wrapHtmlShell(
    'HTML Format Archetypes Hub',
    'DE89 3704 0044 0532 0130 00',
    `<ul>\n      ${indexLinks}\n    </ul>`,
  )
  fs.writeFileSync(path.join(htmlDir, 'index.html'), indexHtml + '\n', 'utf-8')
  return HTML_FORMAT_SETUPS.length
}
