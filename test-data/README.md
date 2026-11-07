# Format-Agnostic Export Test Data Suite

This directory contains **bank-agnostic, structural test fixtures** across **CSV**, **PDF**, and **HTML** formats designed to stress-test Saldio's import parsers against any real-world file layout, delimiter, encoding, date format, sign convention, or DOM structure without tying data to any specific financial institution.

## Directory Structure

```text
test-data/
├── csv/    # 20 structural CSV & TSV export variations
├── pdf/    # 12 structural PDF statement variations
├── html/   # 12 structural HTML / copy-paste DOM archetypes (+ index.html)
└── README.md
```

## 1. CSV Export Setups (`test-data/csv/`)

| File | Structural Variation Tested |
| :--- | :--- |
| `csv/csv-01-semicolon-eu-standard.csv` | Semicolon Delimiter + European Decimal (DD.MM.YYYY) |
| `csv/csv-02-comma-iso-us-decimal.csv` | Comma Delimiter + ISO Date (YYYY-MM-DD) + Dot Decimal |
| `csv/csv-03-tab-separated-tsv.csv` | Tab-Separated Values (TSV) Export |
| `csv/csv-04-metadata-preamble-long.csv` | Multi-Row Account Metadata Preamble Before Header |
| `csv/csv-05-split-soll-haben-columns.csv` | Split Soll (Debit) and Haben (Credit) Columns |
| `csv/csv-06-split-debit-credit-english.csv` | English Split Debit and Credit Columns with Running Balance |
| `csv/csv-07-soll-haben-indicator-column.csv` | Unsigned Amount + Dedicated S/H (Soll/Haben) Indicator Column |
| `csv/csv-08-trailing-minus-sh-parentheses.csv` | Trailing Minus (12,34-), Trailing S/H, and Accounting Parentheses (12,34) |
| `csv/csv-09-gendered-payer-payee-columns.csv` | Separate Gender-Star Payer (Zahlungspflichtige*r) and Payee (Zahlungsempfänger*in) |
| `csv/csv-10-generic-booking-type-with-partner.csv` | Generic Booking Type in Buchungstext + Merchant in Partner Column |
| `csv/csv-11-utf8-bom-crlf-quoted-delimiters.csv` | UTF-8 BOM + CRLF Line Endings + Quoted Embedded Semicolons/Commas |
| `csv/csv-12-slash-dates-ddmmyyyy-and-mmddyyyy.csv` | Slash-Separated Dates (DD/MM/YYYY and MM/DD/YYYY) |
| `csv/csv-13-two-digit-years.csv` | Short Two-Digit Year Dates (DD.MM.YY) |
| `csv/csv-14-subaccounts-spaces-pockets.csv` | Sub-Account / Space / Pocket Internal Transfers + External Transactions |
| `csv/csv-15-multi-currency-column.csv` | Multi-Currency Rows with Dedicated Währung / Currency Column |
| `csv/csv-16-minimal-3-column.csv` | Minimal 3-Column CSV (Datum, Beschreibung, Betrag) |
| `csv/csv-17-brokerage-isin-dividend-sparplan.csv` | Securities & Brokerage Export (ISIN, ETF Sparplan, Dividend) |
| `csv/csv-18-wallet-brutto-fee-netto-balance.csv` | Digital Wallet Export with Brutto, Fee, Netto, and Running Balance |
| `csv/csv-19-multilingual-headers-pl-bs-id.csv` | Multilingual Column Headers (Polish: Data transakcji, Kontrahent, Tytuł, Kwota) |
| `csv/csv-20-swiss-apostrophe-unicode-minus.csv` | Swiss Apostrophe Thousands (1'250.00), Unicode Minus (−), and Reimbursements |

## 2. PDF Statement Setups (`test-data/pdf/`)

| File | Structural Variation Tested |
| :--- | :--- |
| `pdf/pdf-01-double-date-standard-table.pdf` | Double-Date 4-Column Standard Table Statement |
| `pdf/pdf-02-umsatzuebersicht-grouped-categories.pdf` | Umsatzuebersicht Layout with Truncated Text and Category Lines |
| `pdf/pdf-03-single-date-neobank-statement.pdf` | Single-Date Modern Neobank Account Statement |
| `pdf/pdf-04-kontoauszug-soll-haben-suffix.pdf` | Traditional Kontoauszug with Trailing S/H and Minus Suffixes |
| `pdf/pdf-05-two-digit-year-compact.pdf` | Compact Statement with 2-Digit Years (DD.MM.YY) |
| `pdf/pdf-06-iso-date-international.pdf` | International Statement with ISO Dates (YYYY-MM-DD) and Dot Decimals |
| `pdf/pdf-07-multipage-carryover-statement.pdf` | Multi-Page Statement with Carryover (Uebertrag / Zwischensaldo) |
| `pdf/pdf-08-sepa-mandate-multiline.pdf` | Dense SEPA Statement with Counterparty IBAN, Mandate, and EREF |
| `pdf/pdf-09-credit-card-monthly-statement.pdf` | Credit Card Monthly Billing Statement (Kartenabrechnung) |
| `pdf/pdf-10-brokerage-depot-statement.pdf` | Brokerage Cash & Depot Account Statement |
| `pdf/pdf-11-slash-date-english-statement.pdf` | English Statement with Slash Dates (DD/MM/YYYY) |
| `pdf/pdf-12-reimbursement-and-fee-refunds.pdf` | Statement with Travel Reimbursements (REISESP) and Fee Refunds (Rueckverguetung) |

## 3. HTML / Web Portal DOM Setups (`test-data/html/`)

| File | Structural Variation Tested |
| :--- | :--- |
| `html/html-01-standard-table-5col.html` | Standard 5-Column Semantic HTML Table |
| `html/html-02-split-soll-haben-balance-table.html` | Split Soll/Haben Columns with Running Saldo Column |
| `html/html-03-stacked-date-and-category-table.html` | 4-Column Stacked Date + Category Badge Table (Umsatzuebersicht) |
| `html/html-04-soll-haben-indicator-column-table.html` | Unsigned Amount Column + Dedicated S/H Indicator Column |
| `html/html-05-day-grouped-card-list.html` | Day-Grouped Card List (.mkp-card-list) |
| `html/html-06-custom-web-components.html` | Custom Web Components (<db-list-row> / <tx-list-row>) |
| `html/html-07-timeline-feed-prefix-currency.html` | Neobank Timeline Feed with ISO Dates and Prefix Currency (- € 36.80) |
| `html/html-08-pending-and-booked-sections.html` | Pending (Vorgemerkte Umsaetze) + Booked Sections |
| `html/html-09-multicurrency-activity-stream.html` | Multi-Currency International Feed (EUR, USD, GBP, PLN) |
| `html/html-10-accordion-details-rows.html` | Expandable <details> / <summary> SEPA Rows with Counterparty IBAN |
| `html/html-11-aria-role-grid.html` | ARIA Headless UI Data Grid (role="table" / role="row" / role="cell") |
| `html/html-12-semantic-ul-li-multilingual.html` | Semantic <ul> / <li> List with Multilingual Transaction Labels |

## Regenerating Fixtures & Running Validation

```bash
# Regenerate all CSV, PDF, and HTML format fixtures
node scripts/generate-format-test-data.js

# Run the format validation test suites
npx vitest run src/utils/parsers/__tests__/csv-format-setups.test.ts
npx vitest run src/utils/parsers/__tests__/pdf-format-setups.test.ts
npx vitest run src/utils/parsers/__tests__/html-format-setups.test.ts
```
