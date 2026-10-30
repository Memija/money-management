# Saldio 💰

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Memija_money-management&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Memija_money-management)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Memija_money-management&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Memija_money-management)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Memija_money-management&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Memija_money-management)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Memija_money-management&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Memija_money-management)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=Memija_money-management&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=Memija_money-management)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg?logo=vite)](https://vite.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6e9f18.svg?logo=vitest)](https://vitest.dev)
[![License: Prosperity-3.0.0](https://img.shields.io/badge/License-Prosperity%203.0.0-blue.svg)](./LICENSE.md)

An enterprise-grade, privacy-first personal finance and expense tracking application built with **React 19**, **Vite 8 (Rolldown)**, **TypeScript 6**, and **Zustand**. Designed for maximum financial sovereignty, Saldio operates 100% client-side with offline-first persistence, automated bank statement ingestion (**Excel `.xlsx`/`.xls`**, **CSV**, **PDF**, and **clipboard tables/text**), multi-account transfer matching, deep analytical visualizations, and a defense-in-depth security and quality verification pipeline.

---

## ✨ Features

### 🏦 Multi-Account & Transfer Intelligence

- **Multi-Institution Overview**: Aggregate imported statements across multiple banks, savings accounts, credit cards, and payment services, or filter down to a single institution with the sticky account switcher.
- **Internal & Space Transfer Matching**: Automatically detects IBAN-linked inter-account transfers and internal pocket/space movements so shifting money between your own accounts never skews net income or expense totals.

### 📄 Smart Bank Statement Ingestion

- **Multi-Format Importer**: Import statements via **Excel spreadsheets (`.xlsx`, `.xls`)**, **CSV files** (with automatic UTF-8 / ISO-8859-1 encoding and delimiter detection), **PDF statements**, or **copied clipboard content** (rich HTML tables and unstructured plain text).
- **German Banking Presets**: Built-in support for **Germany** across 40+ institutions—including traditional banks, Sparkassen, Volksbanken, direct/neobanks, and payment providers—with 42 additional countries queued in the country selector.
- **Duplicate Detection & Override Rules**: Intelligent transaction fingerprinting flags repeated imports for review and supports persistent duplicate override rules.
- **100% Client-Side Parsing**: PDF text extraction runs locally via a `pdfjs-dist` Web Worker while spreadsheet and clipboard parsers execute directly in your browser—no financial data is ever sent to a server.

### 📊 Interactive Visualizations & Analytics

- **Dynamic Charts (Recharts)**: Interactive income vs. expense timelines, category trend charts, and spending distribution breakdowns.
- **Deep Financial Insights**: Drill down into mean-vs-median spending comparisons, recurring expense detection, savings rate trend modals, and top merchant rankings with brand logos.
- **Custom Categories & Keyword Rules**: Create custom categories with bespoke icons and colors, and define merchant keyword rules to automatically categorize past and future transactions.
- **Flexible Period & Timeline Filtering**: Filter across months, quarters, years, year-to-date, or interactive timeline selections.

### 🔒 100% Privacy & Offline-First

- **Zero Cloud Storage**: All transactions, accounts, categories, and rules persist locally in your browser via IndexedDB (`saldio_db`) and LocalStorage.
- **No Remote Telemetry**: Zero external tracking scripts, third-party analytics, or remote API calls.
- **Privacy Masking**: Built-in header toggle blurs balances and transaction amounts when viewing on shared or public screens.

### 💾 Backup, Restore & Data Control

- **Schema-Validated JSON Backups**: Export your complete accounts, transactions, custom categories, keyword rules, and duplicate override rules to a portable `.json` backup file (`saldio-backup-YYYY-MM-DD.json`).
- **One-Click Validated Restore**: Restore previous `.json` backups with strict schema validation, localized error reporting, and a confirmation preview before overwriting local state.
- **Granular Data Deletion**: Delete transactions for individual imported banks or wipe all local data (with an optional toggle to preserve or reset theme and language preferences).

### 🌍 Multi-Language Internationalization (i18n)

- Complete localization across **6 languages** (see [Supported Languages](#-supported-languages)) with lazy-loaded translation bundles, localized statement parser keywords, currency/number formatting, and regional date conventions.

---

## 🏗️ Architecture & Key Technical Decisions

The application follows clean-code principles, modular architecture, and modern React best practices:

1. **React 19 & TypeScript 6 Strict Mode**:
   - Modern functional components with hooks (`useState`, `useMemo`, `useCallback`, `useEffect`).
   - Strict TypeScript configuration (`strict`, `noImplicitReturns`, `noImplicitOverride`, `verbatimModuleSyntax`, zero `any`) shared across DRY `tsconfig` project references.
2. **Vite 8 (Rolldown) & On-Demand Code Splitting**:
   - Dedicated vendor chunk groups (`react-vendor`, `motion-vendor`, `recharts`, `icons-vendor`), lazy-loaded views, lazy-loaded locale bundles, and dynamic `import()` for heavy parsers (`xlsx` and `pdfjs-dist`).
3. **Modular Component Structure**:
   - Every component enforces strict file separation (`.tsx` logic/markup and `.module.css` scoped styles with zero inline styles), small focused files (< 300 lines target), and reusable primitives in `src/components/shared/`.
4. **Zustand State Management & Hybrid Local Storage**:
   - Modular Zustand store slices backed by IndexedDB (`idb-storage.ts`) with debounced JSON persistence for large transaction datasets and LocalStorage for lightweight UI preferences.
5. **High-Performance Virtualization**:
   - Large transaction feeds render via `react-virtuoso` to maintain smooth 60fps scrolling regardless of history size.
6. **Comprehensive Vitest Suite**:
   - Over 105 test suites and 1,600+ unit tests running via **Vitest 4** and **jsdom** with V8 code coverage thresholds and SonarCloud execution reporting.

---

## 📁 Project Structure

```text
money-management/
├── .github/
│   ├── ISSUE_TEMPLATE/         # Bug report and feature request templates
│   ├── workflows/              # GitHub Actions CI/CD security and quality workflows
│   ├── CODEOWNERS              # Repository code ownership rules
│   ├── dependabot.yml          # Automated weekly dependency updates
│   ├── PULL_REQUEST_TEMPLATE.md # Pull request checklist template
│   └── SECURITY.md             # Security vulnerability reporting policy
├── .husky/                     # Git hooks (pre-commit, commit-msg, pre-push)
├── public/                     # Static assets, PWA manifest, bank logos, and country flags
├── scripts/                    # Security, secret scanning, OSV, and Lighthouse flow scripts
├── src/
│   ├── components/             # Feature views and shared UI components
│   │   ├── CountrySelector/    # Step 1: Country selection onboarding view
│   │   ├── InstitutionSelector/ # Step 2: Bank & institution selection view
│   │   ├── TransactionImporter/ # Step 3: Excel, CSV, PDF, and clipboard importer
│   │   ├── ImportReview/       # Step 4: Duplicate detection and pre-import review
│   │   ├── Dashboard/          # Analytics charts, insight modals, and virtualized feed
│   │   ├── Settings/           # Categories, keyword/duplicate rules, backup, and data reset
│   │   ├── layout/             # App header, controls, and footer
│   │   └── shared/             # Reusable UI primitives (modals, brand logos, buttons)
│   ├── config/                 # Application configuration constants
│   ├── data/                   # Financial institutions, merchant registries, and countries
│   ├── hooks/                  # Custom React hooks (analytics, backups, imports, formatters)
│   ├── i18n/                   # Lazy-loaded locales (en, de, bs, sr, id, pl) and parser rules
│   ├── store/                  # Zustand global state stores and slices
│   ├── test/                   # Vitest global test setup
│   ├── types/                  # TypeScript domain models and interfaces
│   ├── utils/                  # Parsers, categorizer, brand logos, date/storage utilities
│   ├── App.tsx                 # Root application shell and step orchestrator
│   ├── index.css               # Global CSS custom properties, themes, and resets
│   └── main.tsx                # React bootstrap entry point
├── CODE_OF_CONDUCT.md          # Community code of conduct
├── COMMERCIAL.md               # Commercial licensing terms beyond non-commercial/trial use
├── CONTRIBUTING.md             # Contribution guidelines and workflow
├── LICENSE.md                  # Prosperity Public License 3.0.0
├── commitlint.config.js        # Conventional Commits lint configuration
├── eslint.config.js            # ESLint 9 flat config with React Hooks, TS, and security rules
├── firebase.json               # Firebase Hosting config and HTTP security headers
├── lighthouserc.json           # Lighthouse CI performance and accessibility budgets
├── package.json                # Dependencies, engine constraints, and operational scripts
├── sonar-project.properties    # SonarCloud static analysis and coverage configuration
├── tsconfig.json               # Shared base TypeScript compiler options & project references
├── tsconfig.app.json           # Application & Vitest TypeScript configuration
├── tsconfig.node.json          # Node/Vite tooling TypeScript configuration
└── vite.config.ts              # Vite 8 (Rolldown) bundler and Vitest 4 runner configuration
```

---

## 📖 How to Use

### 1. Select Country & Financial Institution

- Choose your country in the **Country Selector** (currently active for **Germany**, with additional countries queued) and pick your bank, Sparkasse, Volksbank, neobank, or payment provider.

### 2. Import Bank Statements

- Select your preferred import method:
  - **Spreadsheet File**: Upload `.xlsx`, `.xls`, or `.csv` exports from your online banking portal.
  - **PDF Statement**: Drag and drop official `.pdf` account statements.
  - **Copy & Paste**: Paste copied transaction tables or raw text directly from your clipboard.

### 3. Review & Deduplicate

- Inspect the **Import Review** screen before saving:
  - Verify automatically cleaned merchant descriptions, detected categories, and excluded internal space movements.
  - Review flagged duplicate transactions and choose which entries to import or skip.

### 4. Analyze Spending on the Dashboard

- Switch between an **All Accounts** combined view or individual imported banks using the sticky switcher.
- Filter by custom periods or drag across the timeline chart to inspect specific date windows.
- Open interactive detail modals for **Income vs. Expenses**, **Expense Categories**, **Mean vs. Median Spending**, **Savings Trends**, **Recurring Expenses**, and **Top Merchants**.
- Toggle **Privacy Mode** in the header at any time to blur sensitive amounts.

### 5. Customize Rules & Manage Backups

- Open **Settings** from the header to manage:
  - **Categories & Rules**: Create custom categories and merchant keyword rules for instant auto-categorization.
  - **Duplicate Rules**: Manage saved duplicate override rules.
  - **Advanced**: Configure specialized transaction display and logo filters.
  - **Data Management**: Export a validated `.json` backup, restore from an existing backup file, delete an individual bank's transactions, or clear all local data.

---

## 💻 Local Development

### 📋 Prerequisites

- **Node.js**: `v22.13.0` or later (Node `v22` / `v24` LTS recommended)
- **npm**: `v10.0.0` or later (`npm@11.6.2` configured in `packageManager`)

### 🚀 Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Memija/money-management.git
   cd money-management
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the local development server:**

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173/` in your browser. The app reloads automatically on code changes.

4. **Build for production:**

   ```bash
   npm run build
   ```

5. **Preview the production build locally:**

   ```bash
   npm run preview
   ```

   Serves the production bundle at `http://localhost:4173/`.

---

## 🛠️ Available Scripts

| Category         | Script                           | Description                                                                                      |
| :--------------- | :------------------------------- | :----------------------------------------------------------------------------------------------- |
| **Development**  | `npm run dev`                    | Launches local Vite development server on port `5173`                                            |
|                  | `npm run watch`                  | Rebuilds production bundle continuously on file changes                                          |
|                  | `npm run build`                  | Typechecks (`tsc -b`) and builds production bundle (`vite build`)                                |
|                  | `npm run preview`                | Serves production build locally on port `4173` for verification                                  |
| **Code Quality** | `npm run typecheck`              | Validates TypeScript types across project references without emitting files                      |
|                  | `npm run lint`                   | Lints codebase via ESLint (`--max-warnings 0`, including `eslint-plugin-security`)               |
|                  | `npm run lint:fix`               | Auto-fixes ESLint issues with zero-warning enforcement                                           |
|                  | `npm run format`                 | Auto-formats files with Prettier                                                                 |
|                  | `npm run format:check`           | Verifies code formatting without modifying files                                                 |
|                  | `npm run sonar:scan`             | Executes `sonar-scanner-npm` against local codebase and coverage telemetry                       |
| **Testing**      | `npm test`                       | Starts Vitest in interactive watch mode                                                          |
|                  | `npm run test:run`               | Executes all unit tests once and exits                                                           |
|                  | `npm run test:coverage`          | Runs test suite with V8 code coverage and Sonar XML test execution report                        |
| **Performance**  | `npm run lighthouse`             | Runs Lighthouse CI (`lhci autorun`) for both mobile and desktop presets                          |
|                  | `npm run lighthouse:flows`       | Runs Lighthouse user flows (supports `-- --quick`, `--desktop`, `--mobile`, `--light`, `--dark`) |
|                  | `npm run lighthouse:flows:quick` | Runs quick desktop light-theme user-flow verification                                            |
| **Security**     | `npm run security:all`           | Executes full local security scan suite (Trivy, OSV, Gitleaks, Zizmor, SBOM, etc.)               |
|                  | `npm run security:audit`         | Audits dependencies for critical vulnerabilities (`npm audit`)                                   |
|                  | `npm run security:codeql`        | Runs local CodeQL database creation and static security analysis                                 |
|                  | `npm run security:dast`          | Runs local OWASP ZAP baseline DAST scan via Docker                                               |
|                  | `npm run security:gitleaks`      | Scans git history and workspace for secrets with Gitleaks                                        |
|                  | `npm run security:licenses`      | Validates production dependency licenses against approved open-source list                       |
|                  | `npm run security:osv`           | Identifies open-source vulnerabilities via Google OSV-Scanner                                    |
|                  | `npm run security:sbom`          | Generates a CycloneDX Software Bill of Materials (`cyclonedx.sbom.json`)                         |
|                  | `npm run security:secrets`       | Scans git staged changes for accidentally committed credentials & keys                           |
|                  | `npm run security:socket`        | Scans dependencies for supply-chain risks via Socket.dev CLI                                     |
|                  | `npm run security:trivy`         | Scans repository filesystem and dependencies for known CVEs via Aqua Trivy                       |
|                  | `npm run security:zizmor`        | Audits GitHub Actions workflows with Zizmor                                                      |
| **Pre-Flight**   | `npm run validate`               | Runs formatting, linting, typecheck, secret/license audits, build, coverage & Lighthouse CI      |
| **Deployment**   | `npm run deploy`                 | Builds (`predeploy`) and deploys static bundle to Firebase Hosting                               |

---

## 🛡️ Security & Quality Assurance Pipeline

This project employs a defense-in-depth security and performance pipeline enforced via GitHub Actions CI/CD:

- **SonarCloud**: Static analysis, quality gate enforcement, code coverage, duplication (CPD), and maintainability metrics.
- **CodeQL**: Semantic code analysis detecting security vulnerabilities, data leaks, and injection risks.
- **OWASP ZAP (DAST)**: Dynamic application security testing against the built web application and HTTP security headers.
- **Lighthouse CI**: Automated mobile, desktop, and interactive user-flow audits for performance, accessibility, best practices, and SEO.
- **Aqua Trivy**: Scans repository filesystem and dependencies for known CVEs.
- **Google OSV-Scanner**: Identifies open-source vulnerabilities via the Google OSV database.
- **GitLeaks**: Prevents hardcoded secrets, credentials, and API tokens from entering git history.
- **OpenSSF Scorecard**: Automated evaluation of supply-chain security and repository hygiene.
- **Socket.dev**: Detects malicious supply-chain package behavior and typosquatting.
- **Zizmor**: Static security audit and misconfiguration analyzer for GitHub Actions workflows.
- **CycloneDX & SPDX SBOM**: Automated generation of Software Bills of Materials for dependency transparency.
- **Husky, Lint-Staged & Commitlint**: Enforces pre-commit secret checks, zero-warning linting, Prettier formatting, and Conventional Commits.

---

## 🌐 Supported Languages

| Language      | Code | Default Locale | Status   |
| :------------ | :--- | :------------- | :------- |
| 🇬🇧 English    | `en` | `en-US`        | Complete |
| 🇩🇪 German     | `de` | `de-DE`        | Complete |
| 🇧🇦 Bosnian    | `bs` | `bs-BA`        | Complete |
| 🇷🇸 Serbian    | `sr` | `sr-RS`        | Complete |
| 🇮🇩 Indonesian | `id` | `id-ID`        | Complete |
| 🇵🇱 Polish     | `pl` | `pl-PL`        | Complete |

---

## 🤝 Contributing & Security

- **Contributions**: Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before submitting pull requests.
- **Security Vulnerabilities**: Please follow the responsible disclosure instructions in [.github/SECURITY.md](./.github/SECURITY.md) rather than opening a public issue.

---

## 📄 License

- **Non-Commercial & 30-Day Trial**: Licensed under the **Prosperity Public License 3.0.0** — see [LICENSE.md](./LICENSE.md) for full details.
- **Commercial Use**: Commercial usage beyond the trial period is governed by the terms in [COMMERCIAL.md](./COMMERCIAL.md).
