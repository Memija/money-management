# Synthetic Test Data for German Banks

This directory contains synthetic mock test data for **every German financial institution** supported by the application (54 institutions in total).

> **Important Privacy Notice:**
> All data in this directory is **100% synthetic mock test data**.
> - Names are fictional (e.g. *Max Mustermann*, *Erika Musterfrau*).
> - Account numbers and IBANs are synthetic sample test identifiers.
> - Transaction descriptions represent common German merchants (*REWE*, *EDEKA*, *ALDI*, *LIDL*, *dm*, *Deutsche Bahn*, *Spotify*, *Netflix*, *Telekom*) and standard everyday expenses (groceries, rent, utility bills, salary).
> - **Zero real personal user data is contained in this folder.**

---

## Directory Structure

```
test-data/german-banks/
├── <institution-id>.csv      # 54 CSV files, one for each supported German bank
├── pdf/                      # 54 Official PDF statements with embedded bank logos
│   ├── <institution-id>.pdf
├── html/                     # 54 Authentic Online-Banking web portals with HTML tables
│   ├── <institution-id>.html
│   └── index.html            # Hub with bank search & links
└── README.md                 # This documentation file
```

---

## Supported Institutions & Test Files

| Category | Institution Name | File Name | Delimiter | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **Traditional** | Deutsche Bank | `deutsche-bank.csv` | `;` | Separate Soll / Haben debit/credit columns |
| **Traditional** | Commerzbank | `commerzbank.csv` | `;` | Includes `IBAN Kontoinhaber` column |
| **Traditional** | HypoVereinsbank (UniCredit) | `hypovereinsbank.csv` | `;` | German standard layout |
| **Traditional** | Postbank | `postbank.csv` | `;` | Includes `Betrag` and running `Saldo` |
| **Traditional** | Targobank | `targobank.csv` | `;` | Empfänger / Absender column |
| **Traditional** | Santander Deutschland | `santander-de.csv` | `;` | Standard German statement format |
| **Traditional** | ING Deutschland | `ing-de.csv` | `;` | Includes ING metadata preamble rows and `Betrag`/`Saldo` |
| **Sparkassen** | Berliner Sparkasse | `berliner-sparkasse.csv` | `;` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Hamburger Sparkasse (Haspa) | `hamburger-sparkasse.csv` | `;` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Stadtsparkasse München | `stadtsparkasse-muenchen.csv` | `;` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Kreissparkasse Köln | `kreissparkasse-koeln.csv` | `;` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Sparkasse KölnBonn | `sparkasse-koelnbonn.csv` | `;` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Nassauische Sparkasse (Naspa) | `nassauische-sparkasse.csv` | `;` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Frankfurter Sparkasse | `frankfurter-sparkasse.csv` | `;` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Sparkasse Hannover | `sparkasse-hannover.csv` | `;` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Sparkasse Nürnberg | `sparkasse-nuernberg.csv` | `;` | Official Finanz Informatik OSPlus export |
| **Sparkassen** | Other Sparkasse | `sparkasse-other.csv` | `;` | Official Finanz Informatik OSPlus export |
| **Volksbanken** | DZ Bank | `dz-bank.csv` | `;` | Official Atruvia agree21 export |
| **Volksbanken** | Berliner Volksbank | `berliner-volksbank.csv` | `;` | Official Atruvia agree21 export |
| **Volksbanken** | Frankfurter Volksbank Rhein/Main | `frankfurter-volksbank.csv` | `;` | Official Atruvia agree21 export |
| **Volksbanken** | Münchner Bank | `muenchner-bank.csv` | `;` | Official Atruvia agree21 export |
| **Volksbanken** | Other Volksbank / Raiffeisenbank | `volksbank-other.csv` | `;` | Official Atruvia agree21 export |
| **Direct** | DKB (Deutsche Kreditbank) | `dkb.csv` | `;` | Official DKB format with gendered headers (`Zahlungspflichtige*r`) |
| **Direct** | comdirect | `comdirect.csv` | `;` | Official comdirect format with preamble + `Umsatz in EUR` |
| **Direct** | Consorsbank | `consorsbank.csv` | `;` | Consorsbank standard format |
| **Direct** | norisbank | `norisbank.csv` | `;` | Deutsche Bank group format with Soll/Haben |
| **Direct** | 1822direkt | `1822direkt.csv` | `;` | Official Finanz Informatik OSPlus format |
| **Neobanks** | N26 | `n26.csv` | `,` | Official N26 Web export with Booking Date, Partner Name, Account Name |
| **Neobanks** | Tomorrow Bank | `tomorrow.csv` | `,` | English headers with category |
| **Neobanks** | Vivid Money | `vivid-money.csv` | `,` | Official export with pocket sub-accounts |
| **Neobanks** | C24 Bank | `c24.csv` | `;` | Official C24 format with Partner IBAN and pocket/account name |
| **Neobanks** | Openbank | `openbank-de.csv` | `;` | Standard European format |
| **Neobanks** | Revolut | `revolut-de.csv` | `,` | Official Revolut CSV format |
| **Neobanks** | Wise | `wise-de.csv` | `,` | Official Wise statement format |
| **Neobanks** | bunq | `bunq-de.csv` | `,` | Official bunq statement format |
| **Landesbanken** | LBBW | `lbbw.csv` | `;` | Landesbank Baden-Württemberg format |
| **Landesbanken** | Helaba | `helaba.csv` | `;` | Landesbank Hessen-Thüringen format |
| **Landesbanken** | BayernLB | `bayernlb.csv` | `;` | BayernLB format |
| **Landesbanken** | Nord/LB | `norddeutsche-lb.csv` | `;` | Nord/LB format |
| **Brokerages** | Trade Republic | `trade-republic.csv` | `,` | Official Trade Republic app export (`date,type,title,amount,fee,tax,currency`) |
| **Brokerages** | Scalable Capital | `scalable-capital.csv` | `,` | Official Scalable Capital web export |
| **Brokerages** | flatex | `flatex.csv` | `;` | flatex statement export |
| **Brokerages** | Smartbroker+ | `smartbroker.csv` | `;` | Smartbroker+ export format |
| **Brokerages** | DEGIRO | `degiro-de.csv` | `,` | Official DEGIRO CSV export |
| **Specialized** | apoBank | `apobank.csv` | `;` | Deutsche Apotheker- und Ärztebank layout |
| **Specialized** | PSD Bank | `psd-bank.csv` | `;` | PSD Bank statement layout |
| **Specialized** | Sparda-Bank | `sparda-bank.csv` | `;` | Sparda-Bank layout |
| **Specialized** | GLS Bank | `gls-bank.csv` | `;` | Ethical banking statement layout |
| **Specialized** | EthikBank | `ethikbank.csv` | `;` | Ethical banking statement layout |
| **Specialized** | Triodos Bank | `triodos-de.csv` | `;` | Triodos Bank statement layout |
| **Specialized** | UmweltBank | `umweltbank.csv` | `;` | UmweltBank statement layout |
| **Payment** | PayPal | `paypal-de.csv` | `,` | Official German PayPal activity CSV with `Brutto` & `Netto` |
| **Payment** | Klarna | `klarna-de.csv` | `;` | Klarna monthly statement layout |
| **Other** | Other Institution | `other-de.csv` | `;` | Generic German fallback format |

---

## How to Use for Testing

### In the Web Application UI:
1. Start the app (`npm run dev`).
2. Navigate to **Import Transactions** / **Add Account**.
3. Choose any German bank (e.g. *Commerzbank*, *N26*, *DKB*, *ING*, *Berliner Sparkasse*, etc.).
4. Select **Excel / CSV** and drag & drop (or browse to) the corresponding `.csv` file from `test-data/german-banks/`.
5. Verify the preview modal displays the parsed dates, descriptions, amounts, and automatic categories.
6. For **Copy & Paste** testing, open any bank portal or presentation archetype in `test-data/german-banks/html/` (via `index.html`), select and copy the transaction list or ledger, and paste into the application.

### Automated Testing:
Run the automated test suites to verify all test files:
```bash
# Test all CSV bank files (54 banks)
npx vitest run src/utils/parsers/__tests__/german-banks-test-data.test.ts

# Test authentic bank portals and web presentation archetypes for paste & HTML extraction
npx vitest run src/utils/parsers/__tests__/german-banks-paste-test-data.test.ts
```
