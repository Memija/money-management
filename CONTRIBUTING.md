# Contributing to Saldio 💰

Thank you for your interest in contributing to Saldio! We welcome contributions from everyone and are excited to have you join our community.

---

## ⚖️ Commercial Use & "Safe Harbor" for Contributors

This project uses the **PolyForm Noncommercial License 1.0.0** (see [LICENSE](./LICENSE), [NOTICE](./NOTICE), and [COMMERCIAL.md](./COMMERCIAL.md)), which restricts commercial use unless a separate written contract is signed with the Owner. However, we want to make it as easy as possible for developers to contribute!

**Important**: The Owner explicitly authorizes developing feedback, bug fixes, changes, or additions solely for the purpose of contributing them back to this repository under a standardized public software license (such as MIT, Apache-2.0, or BSD-2-Clause) without requiring a commercial license.

This means you and your company can fix bugs and submit pull requests without triggering commercial licensing requirements for that contribution activity. We value your help in making this software better for everyone!

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 22.13.0`
- **npm** `>= 10.0.0`

### Setup

1. **Fork the repository** on GitHub.
2. **Clone your fork** to your local machine:

   ```bash
   git clone https://github.com/YOUR_USERNAME/money-management.git
   cd money-management
   ```

3. **Install dependencies** (this also configures Husky Git hooks):

   ```bash
   npm install
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Create a branch** for your feature or bug fix:

   ```bash
   git checkout -b feat/your-feature-name
   ```

---

## 🛠️ Development Standards

For the complete engineering rulebook—including file-size ceilings, TypeScript 6 compiler flags, import sorting, and the 8-step checklist for adding a new language—see [GEMINI.md](./GEMINI.md).

### 🔒 100% Local-First Privacy

Saldio runs entirely in the user's browser with zero backend servers, external API calls, or telemetry. Never introduce network-fetching libraries or external tracking scripts.

### 🧩 Component Structure (No Inline Styles)

Every styled component **must** separate logic/markup from styles using CSS Modules consuming design tokens from `src/index.css`. Inline `style={{ ... }}` attributes are forbidden.

```text
ComponentName/
├── ComponentName.tsx        # Logic and Markup (JSX)
├── ComponentName.module.css # Scoped CSS Module
└── index.ts                 # Clean barrel export (when helpful)
```

### ⚛️ State Management & DRY

- **Zustand Stores Only**: Read and mutate persistent state through Zustand stores (`useAppStore`, `useLanguageStore`, `useThemeStore`, `usePrivacyStore`, `useTimelineSelectionStore`) rather than scattering raw `localStorage` calls across components.
- **DRY (Don't Repeat Yourself)**: Before writing new code, check `src/components/shared/` for reusable UI components, `src/hooks/` for shared stateful hooks, `src/utils/` for pure helpers/parsers, and `src/types/` for shared interfaces.

### 🌍 Internationalization (i18n)

- **Zero hardcoded UI strings**: Every user-facing label, `aria-label`, `title`, placeholder, and error message must come from `useLanguageStore((s) => s.t)`.
- **Locale parity**: Keep flat translation keys in `src/i18n/types.ts` synchronized across all supported locales (`en`, `id`, `pl`, `bs`, `sr`, `de`), and always write complete German compound words (e.g., `Kaltwasserverbrauch`, never truncated `Kalt-`).

### ♿ Accessibility & Lighthouse (`100%` Gate)

- CI and local Lighthouse audits enforce **`100` (`1.0`)** on **Accessibility**, **Best Practices**, and **SEO** (`Performance >= 80`) across mobile, desktop, and user flows.
- Maintain WCAG AA color contrast in both dark (`[data-theme='dark']`) and light (`[data-theme='light']`) themes, follow sequential heading hierarchy (`<h1>` → `<h2>` → `<h3>`), and never attach an `aria-label` that omits a button's visible text (WCAG 2.5.3).

---

## ✅ Checklist for Pull Requests

Automated **Husky Git hooks** run secret scanning and `lint-staged` on `pre-commit`, validate Conventional Commits via Commitlint on `commit-msg`, and run `npm run typecheck` + `npm run security:audit` on `pre-push`.

Before opening a pull request, please verify:

- [ ] **Formatting**: `npm run format:check` passes (or run `npm run format`).
- [ ] **Linting**: `npm run lint` passes with zero warnings (`--max-warnings 0`).
- [ ] **Type Safety**: `npm run typecheck` passes (`tsc -b --noEmit` with zero `any` types).
- [ ] **Unit Tests**: `npm run test:run` (or `npm run test:coverage`) passes in Vitest, with co-located `*.test.ts(x)` coverage for new features or bug fixes.
- [ ] **Lighthouse Audits**: `npm run lighthouse` and `npm run lighthouse:flows:quick` pass if your change touches UI, styles, or routing/steps.
- [ ] **Full Gate (Recommended)**: Run `npm run validate` to execute all formatting, linting, typechecking, security, build, coverage, and Lighthouse checks in one command.
- [ ] **Conventional Commits**: Use descriptive Conventional Commit messages (`feat:`, `fix:`, `refactor:`, `perf:`, `test:`, `docs:`, `chore:`, `ci:`, `build:`, `style:` — e.g., `feat(dashboard): add transaction category filtering`).

---

## 📬 Reporting Issues

If you have found a bug or have a suggestion, please open a **GitHub Issue** with:

- A clear description of the issue or proposal.
- Steps to reproduce the bug.
- Expected vs. actual behavior.
- Screenshots, browser/OS details, or sample anonymized data if applicable.

**Note:** For reporting security vulnerabilities, please refer to our [Security Policy](./.github/SECURITY.md) rather than opening a public issue.

---

## ❤️ Recognition

All contributors will be recognized in our documentation!

By contributing to this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).
