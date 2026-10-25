# Saldio 💰

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Memija_money-management&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Memija_money-management)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Memija_money-management&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Memija_money-management)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=Memija_money-management&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=Memija_money-management)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=Memija_money-management&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=Memija_money-management)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=Memija_money-management&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=Memija_money-management)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff.svg?logo=vite)](https://vite.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6e9f18.svg?logo=vitest)](https://vitest.dev)
[![License: Prosperity-3.0.0](https://img.shields.io/badge/License-Prosperity%203.0.0-blue.svg)](./LICENSE.md)

An enterprise-grade, privacy-first personal finance and expense tracking application built with **React 19**, **Vite**, **TypeScript**, and **Zustand**. Designed for maximum financial sovereignty, Saldio operates entirely client-side with offline-first persistence, automated statement ingestion (PDF, CSV, and clipboard text), customizable multi-account management, deep analytical visualisations, and a defense-in-depth security and quality verification pipeline.

---

## ✨ Features

### 🏦 Multi-Account & Space Management

- **Accounts & Spaces**: Organize finances across checking accounts, savings accounts, credit cards, investment pockets, and cash spaces.
- **Inter-Account Transfers**: Track money moving between accounts and spaces without skewing your net income or expense totals.
- **Balance Projections & Reconciliation**: Real-time balance calculations with automated adjustments and reconciliation logs.

### 📄 Smart Bank Statement Ingestion

- **Multi-Format Importer**: Seamlessly import bank statements via **PDF files**, **CSV spreadsheets**, or **unstructured copied text**.
- **Institution & Country Detection**: Smart pattern matching for institutions across Germany, Bosnia, Serbia, and international banks.
- **Duplicate Detection & Review**: Intelligent fingerprinting flags repeated transactions before importing, allowing one-click review and deduplication.
- **Client-Side Parsing**: All PDF and text extractions execute directly inside your browser via web workers—no financial data is ever transmitted to remote servers.

### 📊 Interactive Visualizations & Analytics

- **Dynamic Charts (Recharts)**: Interactive timeline charts for income, expenses, and net cash flow trends.
- **Category Breakdowns**: Visual donut and bar charts showing spending distribution across customizable categories.
- **Flexible Period Filtering**: Seamlessly toggle between monthly, quarterly, yearly, year-to-date, or custom date ranges.
- **Merchant & Category Insights**: Track recurring payees, identify spending spikes, and analyze category trends over time.

### 🔒 100% Privacy & Offline-First

- **Zero Cloud Tracking**: All transactions, accounts, and settings are stored locally in browser storage (IndexedDB / LocalStorage).
- **No Remote Telemetry**: Zero external tracking scripts, third-party analytics, or remote API calls.
- **Privacy Masking**: Built-in privacy mode toggles to blur account balances and transaction amounts when viewing in public.

### 💾 Backup, Restore & Data Portability

- **Encrypted Local Backups**: Export your complete transaction history, account configurations, and categories to JSON backups.
- **Excel & CSV Export**: Export historical records for tax preparation or external spreadsheet analysis.
- **One-Click Restore**: Easily restore from previous backup files with data integrity validation.

### 🌍 Multi-Language Internationalization (i18n)

- Full multilingual support across 6 languages:
  - 🇬🇧 **English** (`en`)
  - 🇩🇪 **German** (`de`)
  - 🇧🇦 **Bosnian** (`bs`)
  - 🇷🇸 **Serbian** (`sr`)
  - 🇮🇩 **Indonesian** (`id`)
  - 🇵🇱 **Polish** (`pl`)
- Complete localization of currencies, dates, decimal separators, number formats, and category naming.

---

## 🏗️ Architecture & Key Technical Decisions

The application follows clean-code principles, modular architecture, and modern React best practices:

1. **React 19 & TypeScript Strict Mode**:
   - Modern functional components with hooks (`useState`, `useMemo`, `useCallback`, `useTransition`).
   - Strict TypeScript typing with zero `any` usage.
2. **Modular Component Structure**:
   - Every component enforces strict file separation (`.tsx` logic/markup and `.module.css` scoped styles) with target file sizes (< 300 lines) and DRY reusable components in `src/components/shared/`.
3. **Zustand State Management**:
   - Centralized, predictable UI and transaction state management with reactive selectors and debounced persistence.
4. **Fast Local-First Storage**:
   - Hybrid persistence leveraging IndexedDB for large transaction datasets and LocalStorage for user preferences.
5. **High-Performance Virtualization**:
   - Large transaction feeds use `react-virtuoso` to ensure 60fps scrolling performance regardless of history size.
6. **Comprehensive Vitest Suite**:
   - Over 100 test suites and 1,600+ unit tests running via **Vitest** and **jsdom** with V8 code coverage.

---

## 📁 Project Structure

```text
money-management/
├── .github/
│   ├── ISSUE_TEMPLATE/       # Bug report and feature request templates
│   ├── workflows/            # GitHub Actions CI/CD security and quality workflows
│   ├── CODEOWNERS            # Repository code ownership rules
│   ├── dependabot.yml        # Automated weekly dependency updates
│   └── SECURITY.md           # Security vulnerability reporting policy
├── .husky/                   # Git hooks (pre-commit, commit-msg, pre-push)
├── scripts/                  # Security scanners (secrets, Gitleaks, OSV, Trivy, Zizmor)
├── src/
│   ├── components/           # Feature and shared UI components
│   │   ├── Dashboard/        # Dashboard metrics, period filters, and overview cards
│   │   ├── layout/           # App navigation, header, and footer
│   │   ├── Settings/         # Settings panel (categories, accounts, theme, i18n)
│   │   └── shared/           # Reusable UI components (modals, dropdowns, buttons)
│   ├── config/               # Application configuration constants
│   ├── data/                 # Static financial institutions, merchants, and country data
│   ├── hooks/                # Custom React hooks (analytics, transactions, formatters)
│   ├── i18n/                 # Translation bundles (en, de, bs, sr, id, pl) and loaders
│   ├── store/                # Zustand global state stores
│   ├── types/                # TypeScript domain models and interfaces
│   ├── utils/                # Pure utility functions (parsers, date-utils, storage)
│   ├── App.tsx               # Root application component
│   ├── index.css             # Global CSS tokens, resets, and design variables
│   └── main.tsx              # React bootstrap entry point
├── commitlint.config.js      # Conventional Commits lint configuration
├── eslint.config.js          # ESLint flat config with React Hooks and TypeScript rules
├── package.json              # Project dependencies and operational scripts
├── sonar-project.properties  # SonarCloud quality analysis rules
└── vite.config.ts            # Vite bundler and Vitest test runner configuration
```

---

## 💻 Local Development

### 📋 Prerequisites

- **Node.js**: `v20.x` or later (LTS recommended)
- **npm**: `v10.x` or later

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

   Open your browser at `http://localhost:5173/`. The app reloads automatically on code changes.

4. **Build for production:**

   ```bash
   npm run build
   ```

5. **Preview production build locally:**

   ```bash
   npm run preview
   ```

---

## 🛠️ Available Scripts

| Category         | Script                      | Description                                                                         |
| :--------------- | :-------------------------- | :---------------------------------------------------------------------------------- |
| **Development**  | `npm run dev` / `npm start` | Launches local Vite development server                                              |
|                  | `npm run build`             | Compiles TypeScript and builds production distribution bundle                       |
|                  | `npm run preview`           | Serves production build locally for verification                                    |
| **Code Quality** | `npm run typecheck`         | Validates TypeScript types without emitting build files                             |
|                  | `npm run lint`              | Lints TypeScript and TSX files via ESLint                                           |
|                  | `npm run format`            | Auto-formats code with Prettier                                                     |
|                  | `npm run format:check`      | Verifies code formatting without modifying files                                    |
| **Testing**      | `npm test`                  | Starts Vitest in interactive watch mode                                             |
|                  | `npm run test:run`          | Executes all unit tests once and exits                                              |
|                  | `npm run test:watch`        | Explicit watch mode alias for unit tests                                            |
|                  | `npm run test:coverage`     | Runs test suite with V8 code coverage report generation                             |
|                  | `npm run sonar:scan`        | Executes SonarScanner CLI against local codebase and coverage telemetry             |
| **Security**     | `npm run security:all`      | Executes full local security scan suite (Trivy, OSV, Gitleaks, Zizmor, SBOM)        |
|                  | `npm run security:audit`    | Audits dependencies for critical vulnerabilities (`npm audit`)                      |
|                  | `npm run security:secrets`  | Scans git staged changes for accidentally committed credentials & keys              |
|                  | `npm run security:gitleaks` | Scans git history and workspace for secrets with Gitleaks                           |
|                  | `npm run security:osv`      | Identifies open-source vulnerabilities via Google OSV-Scanner                       |
|                  | `npm run security:sbom`     | Generates a CycloneDX Software Bill of Materials (`cyclonedx.sbom.json`)            |
|                  | `npm run security:trivy`    | Scans repository filesystem and dependencies for known CVEs via Aqua Trivy          |
|                  | `npm run security:zizmor`   | Audits GitHub Actions workflows with Zizmor                                         |
|                  | `npm run audit:licenses`    | Validates dependency licenses against approved open-source list                     |
| **Pre-Flight**   | `npm run validate`          | Runs formatting, linting, typecheck, secret checks, license audit, build, and tests |

---

## 🛡️ Security & Quality Assurance Pipeline

This project employs a defense-in-depth security approach integrated into GitHub Actions CI/CD:

- **SonarCloud**: Static analysis, quality gate evaluation, code duplication, and maintainability metrics.
- **CodeQL**: Semantic analysis detecting security vulnerabilities, data leaks, and injection risks.
- **Aqua Trivy**: Scans repository filesystem and dependencies for known CVEs.
- **Google OSV-Scanner**: Identifies open-source vulnerabilities via the Google OSV database.
- **GitLeaks**: Prevents hardcoded secrets, credentials, and API tokens from entering git history.
- **OpenSSF Scorecard**: Automated evaluation of supply-chain security and repo hygiene.
- **Socket.dev**: Detects malicious supply-chain package risks and typosquatting.
- **Zizmor**: Security audit and misconfiguration analyzer for GitHub Actions workflows.
- **CycloneDX & SPDX SBOM**: Automated generation of Software Bill of Materials for dependency transparency.
- **Husky & Lint-Staged**: Enforces pre-commit secret screening, formatting, and Conventional Commits.

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

## 📄 License

This project is licensed under the **Prosperity Public License 3.0.0** - see the [LICENSE.md](./LICENSE.md) file for details.
