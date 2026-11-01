# Coding Principles & Guidelines

Saldio (`money-management`) is a **100% local-first, zero-backend** personal finance web application built with **React 19**, **TypeScript 6**, **Vite 8 (Rolldown)**, **Zustand 5** (`localStorage`-persisted), **Recharts**, **Framer Motion**, **Lucide React** / **React Icons**, **`pdfjs-dist`**, **`xlsx`**, **`react-virtuoso`**, and **CSS Modules**.

---

## 1. DRY Principle (Don't Repeat Yourself)

**CRITICAL RULE:** Before writing ANY new code, verify whether similar functionality already exists in the codebase.

### Pre-Implementation Checklist

- [ ] **Search existing code** — Use grep/codebase search before writing new utilities, parsers, or UI patterns
- [ ] **Check shared components** — Inspect `src/components/shared/` (`Modal`, `DeleteConfirmationModal`, `Select`, `CategorySelect`, `CategoryIcon`, `DatePicker`, `CopyButton`, `ErrorBoundary`, `RenderWhenVisible`, `TimelineSlider`, `TimelineToolbar`, etc.)
- [ ] **Check hooks & utilities** — Inspect `src/hooks/` and `src/utils/` (`date-utils.ts`, `period-utils.ts`, `category-utils.ts`, `analytics-utils.ts`, `string-utils.ts`, etc.)
- [ ] **Check store slices & selectors** — Inspect `src/store/` and `src/store/slices/` before adding derived state
- [ ] **Check existing translation keys** — Search `src/i18n/types.ts` and `src/i18n/locales/en.ts` before adding duplicate keys

### Shared Code Locations

- `src/components/shared/` — Reusable UI components used across features
- `src/hooks/` — Shared stateful hooks and UI/analytics behavior
- `src/utils/` — Pure helper functions, parsers, and data transformations
- `src/store/` & `src/store/slices/` — Zustand stores and modular domain slices
- `src/types/` — Shared TypeScript interfaces and type aliases
- `src/i18n/` — Lazy-loaded translations, category terms, and parser locales
- `src/data/` — Static regional datasets (countries, institutions, merchants)

### Refactoring Triggers

Stop and extract a shared abstraction whenever you see:

1. Identical or near-identical logic in 2+ places
2. Copied JSX structures (modals, cards, filter bars, form controls)
3. Duplicated date/currency formatting, validation, or transaction parsing rules
4. Repeated CSS declarations that belong in `src/index.css` tokens or a shared component

---

## 2. Project Structure & Component Architecture

### Folder Organization

```text
public/                 # Static assets served at root (/flags, icons, site.webmanifest)
scripts/                # Node CLI scripts (Lighthouse flows, security orchestration, test data)
src/
├── components/         # Feature folders + shared/ + layout/ (AppHeader, AppFooter)
├── config/             # App-level configuration constants
├── data/               # Countries, financial institutions, and merchant catalogs
├── hooks/              # Custom React hooks
├── i18n/               # Locales, lazy loader, locale metadata, category terms, parser locales
├── store/              # Zustand stores (useAppStore + slices/, useLanguageStore, useThemeStore, etc.)
├── test/               # Vitest global test setup (setup.ts)
├── types/              # Shared TypeScript types
├── utils/              # Pure utilities, parsers, brand logos, analytics helpers
├── App.tsx             # Step-based root shell & lazy view orchestration
├── index.css           # Global CSS custom properties (dark/light themes) & resets
└── main.tsx            # React root entry point
```

### Component File Structure (No Inline Styles)

**CRITICAL RULE:** Every styled component MUST separate logic/markup from styles using CSS Modules. Inline `style={{ ... }}` attributes are forbidden.

```text
ComponentName/
├── ComponentName.tsx        # Logic and JSX markup
├── ComponentName.module.css # Scoped CSS Module consuming tokens from src/index.css
└── index.ts                 # Clean barrel export (when helpful)
```

```tsx
// ❌ FORBIDDEN — inline styles
export const BadBadge = () => <span style={{ color: 'red', padding: '8px' }}>Alert</span>

// ✅ REQUIRED — CSS Module + global design tokens
import styles from './StatusBadge.module.css'

interface StatusBadgeProps {
  label: string
}

export const StatusBadge = ({ label }: StatusBadgeProps) => (
  <span className={styles.badge}>{label}</span>
)
```

### File Size & Extraction Limits

Keep files small and focused on a single responsibility. ESLint enforces hard ceilings in `eslint.config.js`:

- **Components** (`src/components/**/*.tsx`): Target `< 300` lines, hard max **`500` lines** (`max-lines-per-function: 420`)
- **Hooks, Stores & Utils** (`src/{hooks,store,utils}/**/*.ts`): Target `< 200` lines, hard max **`400` lines** (`max-lines-per-function: 350`)
- **Scripts** (`scripts/**/*.{js,mjs}`): Hard max **`400` lines** (`max-lines-per-function: 80`, `complexity: 15`)
- **Stylesheets** (`*.module.css`): Target `< 300` lines, max **`500` lines**

Extract sub-components, custom hooks, or pure helper modules early—do not wait until a file hits the ESLint ceiling.

### Naming Conventions

| Artifact              | Convention                            | Example                                     |
| --------------------- | ------------------------------------- | ------------------------------------------- |
| Component files/dirs  | `PascalCase`                          | `TransactionList/TransactionList.tsx`       |
| Hook files            | `camelCase` prefixed with `use`       | `useBackupRestore.ts`, `useAccountBalances` |
| Utility / data files  | `kebab-case`                          | `date-utils.ts`, `import-fingerprint.ts`    |
| Functions & variables | `camelCase`                           | `parseTransactions`, `resolvedTheme`        |
| Constants             | `SCREAMING_SNAKE_CASE`                | `DEFAULT_LOCALE`, `SECURITY_HEADERS`        |
| Booleans              | Prefixed `is`, `has`, `can`, `should` | `isCompleted`, `hasHydrated`, `shouldReset` |

---

## 3. State, Navigation & Performance (Local-First)

### Local-First State Management

- **Zero Backend:** Saldio runs entirely in the browser with no backend server or external API calls. Do **not** introduce `react-query`, `axios`, `msw`, or `src/services/api.ts`.
- **Zustand Stores Only:** Read and mutate persistent state exclusively through Zustand stores (`useAppStore`, `useLanguageStore`, `useThemeStore`, `usePrivacyStore`, `useTimelineSelectionStore`)—never scatter raw `localStorage` reads/writes across UI components.
- **Fine-Grained Selectors:** Subscribe to the minimal slice needed (`const currentStep = useAppStore((s) => s.currentStep)`) to prevent unnecessary re-renders.

### Step-Based Lazy Navigation

- Navigation is controlled by `currentStep` (`'country' | 'institution' | 'import' | 'review' | 'dashboard' | 'settings'`) in `src/App.tsx` (no `react-router`).
- Keep top-level views (`Dashboard`, `Settings`, onboarding steps) and heavy file parsers (`pdfjs-dist`, `xlsx`) lazy-loaded via `React.lazy` + `Suspense` or dynamic `import()`, wrapped in `ErrorBoundary`.

### Rendering & Memory Performance

- Use `react-virtuoso` for large transaction lists and `RenderWhenVisible` to defer offscreen chart/section work.
- Use `useMemo` for expensive aggregations over transactions and `useCallback` for handlers passed to memoized children (`React.memo`).
- Always return cleanup functions in `useEffect` (event listeners, `matchMedia`, timers, observers).
- Never use array index as `key` when list items can reorder, filter, or delete.

---

## 4. TypeScript, Code Quality & Formatting

### Strict TypeScript (`tsconfig.json`)

- `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noImplicitReturns: true`, `noImplicitOverride: true`, `noFallthroughCasesInSwitch: true`.
- `verbatimModuleSyntax: true` — Always use `import type { ... }` for type-only imports.
- `erasableSyntaxOnly: true` — Do **not** use TypeScript `enum`, runtime `namespace`, or constructor parameter properties; use union literal types (`type Theme = 'system' | 'light' | 'dark'`) or `as const` objects instead.
- `@/*` path alias maps to `./src/*` (`tsconfig.app.json` + Vite `tsconfigPaths: true`).

### Mandatory ESLint & Quality Rules (`eslint.config.js`)

- **No `any` (`@typescript-eslint/no-explicit-any`):** Use concrete interfaces, generics, or `unknown` with type guards.
- **Curly braces always (`curly: ['error', 'all']`):** Every `if`, `else`, `for`, and `while` block MUST use `{ ... }`, even for a single line.
- **Strict equality (`eqeqeq`):** Always use `===` / `!==` (`== null` check is permitted).
- **Bounded complexity:** Max nesting depth `4` (`max-depth`), max function parameters `6` (`max-params` — group into an options object when > 3–4). Prefer early-return guard clauses and small functions (`< 30` lines where practical).
- **No `console.log` in `src/`:** `no-console` permits only `console.warn`, `console.error`, and `console.debug` in application code.
- **No dead code:** Delete commented-out code and unused exports; extract magic numbers into named constants.

### Prettier Formatting (`.prettierrc`)

All files use Prettier (`npm run format`): **`semi: false`**, **`singleQuote: true`**, **`trailingComma: 'all'`**, **`printWidth: 100`**, **`tabWidth: 2`**.

### Import Sorting (`eslint-plugin-simple-import-sort`)

Imports are auto-sorted into **4 blank-line-separated groups** (`npm run lint:fix`):

```tsx
// 1. React, node: built-ins, and third-party packages
import React, { useMemo } from 'react'
import { Download } from 'lucide-react'

// 2. @/ aliased internal imports (when used)
import type { Transaction } from '@/types'

// 3. Relative internal imports
import { useLanguageStore } from '../../store/useLanguageStore'

// 4. Stylesheets
import styles from './SummaryCard.module.css'
```

---

## 5. Error Handling, Security & Licensing

### Error Handling

- Never let async or storage/file operations fail silently (`try / catch / finally`).
- Log technical context with `console.error` / `console.warn`, surface localized actionable feedback in the UI, and always reset loading/file-input states in `finally`.

### Security & Data Integrity

- **Untrusted Inputs:** Treat all imported files (CSV, XLSX, PDF, JSON backups) and `localStorage` data as untrusted—validate structure, types, and bounds before updating state.
- **XSS Prevention:** Never use `dangerouslySetInnerHTML`.
- **Secrets & Environment Variables:** Prefix public Vite variables with `VITE_` and never store secrets or tokens in the repo (`npm run security:secrets` and `npm run security:gitleaks` must pass).

### Licensing & Author Privacy

- Licensed under **PolyForm Noncommercial License 1.0.0** (`PolyForm-Noncommercial-1.0.0` in `LICENSE`, attribution in `NOTICE`, commercial terms in `COMMERCIAL.md`).
- **Author Privacy Rule:** Never insert a personal author name into source files, documentation, or package metadata—always use `Owner` or `Repository Owner`.

---

## 6. Accessibility (A11y) & Lighthouse Gates (100% Rule)

**CRITICAL:** CI and local Lighthouse budgets (`lighthouserc.json` & `scripts/lighthouse-flow.mjs`) require **`100` (`1.0`)** on **Accessibility**, **Best Practices**, and **SEO** (`Performance >= 80`) across mobile, desktop, and user flows.

- **WCAG AA Color Contrast:** Every text/background token pair in `src/index.css` must meet WCAG AA (`>= 4.5:1` normal text, `>= 3:1` large text & UI components) in **both** dark (`:root` / `[data-theme='dark']`) and light (`[data-theme='light']`) themes.
- **WCAG 2.5.3 Label in Name:** Never attach an `aria-label` that overrides or omits a control's visible text. Omit `aria-label` when visible text is already descriptive, or ensure `aria-label` contains the exact visible text string.
- **Sequential Heading Order:** Follow strict `<h1>` → `<h2>` → `<h3>` hierarchy without skipping levels.
- **Accessible Controls:** Icon-only buttons MUST have localized `aria-label` (and `title`); images MUST have `alt` (`alt=""` if decorative); inputs MUST have `<label htmlFor>` or `aria-label`; all interactive elements MUST be keyboard operable (`<button type="button">`, never `<div onClick>`).

---

## 7. Internationalization (i18n)

### Usage & Rules

Saldio uses a custom lazy-loaded i18n system via `useLanguageStore` (`en`, `id`, `pl`, `bs`, `sr`, `de`):

```tsx
const t = useLanguageStore((s) => s.t)

return <h2>{t.catGroceries}</h2>
```

- **Zero hardcoded UI strings:** Every user-facing label, `aria-label`, `title`, placeholder, and error message must come from `t`.
- **Flat typed keys:** Maintain key parity across all locales via `TranslationStrings` in `src/i18n/types.ts`.
- **German compound words:** Always write complete compound words (e.g., `Kaltwasserverbrauch`, never truncated `Kalt-`).

### Adding a New Language Checklist

1. **Declare Locale:** Add the locale code to `export type Locale` in `src/i18n/types.ts`.
2. **Category Terms:** Create `src/i18n/category-terms/<locale>.ts` and register it in `src/i18n/category-terms/index.ts`.
3. **Translations:** Create `src/i18n/locales/<locale>.ts` implementing `TranslationStrings` (spreading `...<locale>Terms.labels` and reusing `<locale>Terms.keywords` / `coffee`).
4. **Loader & Metadata:** Register the dynamic chunk loader in `src/i18n/locale-loader.ts` (`LOADERS`), picker metadata in `src/i18n/locale-meta.ts` (`localeLabels`, `localeOrder`), and static test map in `src/i18n/translations.ts` (verified by `src/i18n/locale-loader.test.ts`).
5. **Pre-Paint HTML Bootstrap:** Add the locale code to `supportedLang` in `index.html` so `<html lang>` resolves before first paint.
6. **Parser Locale:** Create transaction parser rules in `src/i18n/parser-locales/<locale>.ts`.
7. **Date Fallbacks:** Check `MONTH_FALLBACKS` and `WEEKDAY_FALLBACKS` in `src/utils/date-utils.ts` (automatically tested for every `localeOrder` entry by `src/utils/date-utils.test.ts`).
8. **Regional Data Guardrails:** Run `src/data/` tests (`countries.test.ts`, `institutions.test.ts`, `merchants.test.ts`) to verify translations and flag assets.

---

## 8. Testing, Validation & Commits

### Testing (`Vitest` + React Testing Library)

- Co-locate unit and component tests alongside source files (`*.test.ts`, `*.test.tsx`).
- Test user-visible behavior, accessibility roles/labels, edge cases (empty/corrupt imports, locale switching, boundary dates), and store/hook contracts (`renderHook` from `@testing-library/react`).
- Add concise JSDoc (`@param`, `@returns`) on exported utilities, parsers, and non-trivial hooks.

### Quality Gate Commands

- `npm run format:check` / `npm run format` — Prettier check / write
- `npm run lint` — ESLint with `--max-warnings 0`
- `npm run typecheck` — TypeScript project-references check (`tsc -b --noEmit`)
- `npm run test:run` / `npm run test:coverage` — Vitest test suite & V8 coverage
- `npm run lighthouse` / `npm run lighthouse:flows:quick` — Mobile, desktop & user-flow Lighthouse audits
- `npm run validate` — Full gate (format, lint, typecheck, secrets, gitleaks, audit, licenses, build, coverage, Lighthouse)

### Conventional Commits (`commitlint.config.js` + Husky)

All commit messages are validated by Commitlint via Husky (`feat:`, `fix:`, `refactor:`, `perf:`, `test:`, `docs:`, `chore:`, `ci:`, `build:`, `style:`):

```text
feat(dashboard): add monthly category trend breakdown
```
