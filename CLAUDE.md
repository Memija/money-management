# Coding Principles & Guidelines

## DRY Principle (Don't Repeat Yourself)

**CRITICAL RULE:** Before writing ANY new code, you MUST check if similar functionality already exists in the codebase.

### Pre-Implementation Checklist

Before creating new components, functions, or code blocks, complete this checklist:

- [ ] **Search for existing implementations** - Use grep/codebase search to find similar functionality
- [ ] **Check shared components** - Look in `src/components/shared/` for reusable components
- [ ] **Review hooks/utilities** - Check if a custom hook or utility already provides similar functionality
- [ ] **Examine API services** - Look for existing API calls that could be extended
- [ ] **Consider abstraction** - If duplicating code, create a shared abstraction or custom hook instead

### Decision Tree for New Code

```text
Need to implement feature X?
│
├─ Does similar code exist?
│  ├─ YES → Can it be reused as-is?
│  │         ├─ YES → Use it! ✓
│  │         └─ NO → Can it be extended/modified?
│  │                   ├─ YES → Extend it! ✓
│  │                   └─ NO → Create abstraction, extract common parts
│  └─ NO → Is this likely to be used elsewhere?
│            ├─ YES → Create it in shared location
│            └─ NO → Create it component-specific, but keep it modular
```

### Examples of Code Reuse Opportunities

#### ✅ GOOD - Identified and Extracted

- **Deletion Modal** - Was duplicated in transactions and budget components → Extracted to `DeleteConfirmationModal` shared component
- **Date Formatting** - Duplicated in lists → Extracted to `useFormatters` hook or `date-utils.ts`

#### ❌ BAD - Code Duplication to Avoid

- Copying modal markup into multiple components
- Duplicating validation logic across forms
- Repeating API call patterns in multiple hooks
- Copy-pasting styling rules

### Shared Code Locations

When creating reusable code, place it in:

- **`src/components/shared/`** - For UI components used across multiple features
- **`src/hooks/`** - For shared business logic and stateful behavior
- **`src/utils/`** - For pure helper functions and data transformation
- **`src/types/`** - For shared TypeScript type definitions and interfaces
- **`src/i18n/`** - For translation files and localization logic

### Refactoring Triggers

If you notice ANY of these, stop and refactor:

1. **Copying code** from one component to another
2. **Similar logic** in 2+ places
3. **Identical JSX structure** in multiple components
4. **Repeated patterns** in styling
5. **Duplicate validation** or data transformation

### Code Review Questions

Before committing new code, ask:

1. Does this code already exist somewhere?
2. Could this be useful in other parts of the application?
3. Is there a more general solution that would work here?
4. Can I extract common functionality into a shared location?
5. Am I introducing technical debt by duplicating this?

## Component File Structure

**CRITICAL RULE:** Components MUST use separate files for logic/markup and styles. No inline styles are allowed.

### Required Structure

```text
ComponentName/
├── ComponentName.tsx        # Logic and Markup (JSX)
├── ComponentName.module.css # Scoped Styles
└── index.ts                # (Optional) Clean export
```

### ❌ NEVER DO THIS

```typescript
const MyComponent = () => {
  return (
    <div style={{ color: 'red', padding: '10px' }}> // ❌ Inline styles - FORBIDDEN
      Hello World
    </div>
  );
};
```

### ✅ ALWAYS DO THIS

```typescript
// ComponentName.tsx
import styles from './ComponentName.module.css';

export const ComponentName = () => {
  return <div className={styles.container}>Hello World</div>;
};
```

### Why This Matters

- **Separation of concerns** - Logic and styling are distinct responsibilities
- **Better tooling** - IDEs provide better syntax highlighting and linting for separate files
- **Easier reviews** - Changes to CSS are clearly visible in diffs
- **Maintainability** - Large components with inline styles become unreadable quickly
- **Consistency** - All components follow the same structure

---

## Implementation Guidelines

### When Creating Shared Components

**Must have:**

- Clear, descriptive name reflecting its purpose (PascalCase)
- Documented props (via TypeScript interfaces)
- Flexible enough for multiple use cases
- Proper TypeScript typing
- Functional component with Hooks

**Example Structure:**

```typescript
interface ReusableThingProps {
  config: SomeConfig;
  variant?: 'primary' | 'secondary';
  onActionCompleted: () => void;
}

export const ReusableThing = ({ 
  config, 
  variant = 'primary', 
  onActionCompleted 
}: ReusableThingProps) => {
  // ... implementation
  return (
    <div className={variant}>
      {/* ... */}
    </div>
  );
};
```

### When Creating Hooks

Prefer:

- Using custom hooks to encapsulate complex state logic
- Keeping hooks focused on a single responsibility
- Using `useMemo` and `useCallback` for stability in shared hooks

### Code Organization Priority

1. **Reuse existing** code
2. **Extend/modify** existing code to be more flexible
3. **Extract common** patterns into shared utilities/hooks
4. **Create new** code only when necessary
5. **Document** for future reuse

---

## Automation Reminders

- Always run `grep` or `codebase_search` before creating new functionality
- Check `src/components/shared/` directory contents before creating components
- Use `view_file_outline` to understand existing component structure
- Search for existing translation keys in `src/i18n/locales/` before adding new ones

---

## Project-Specific Patterns

### This Project Uses

- **React Hooks** (useState, useMemo, useEffect) for state management
- **Functional Components** (no Class components)
- **Zustand** for global state management
- **Lucide React** for icons
- **Recharts** for data visualisation
- **CSS Modules** (`.module.css`) and a global `index.css` for styling

### Common Reusable Patterns to Use

- Modal components with configurable content (using a Modal Manager or Portal)
- Data display components with custom sorting/filtering hooks
- Custom hooks that read from and write to Zustand stores
- Shared form inputs with built-in validation

---

## File Size & Component Extraction

### Keep Files Small and Focused

**CRITICAL RULE:** Large files are hard to maintain, test, and understand. Extract functionality early and often.

#### File Size Guidelines

- **Components (TSX):** Target < 300 lines, max 500 lines (includes JSX + Logic)
- **Stylesheets (CSS):** Target < 300 lines, max 500 lines
- **Hooks/Utilities:** Target < 200 lines, max 400 lines

#### When to Extract

Extract to a new component/hook when:

1. **File exceeds target size** - Don't wait for max size
2. **Distinct sections** - Code has clear, separable responsibilities
3. **Reusability potential** - Section could be used elsewhere
4. **Testing complexity** - Too many test cases for one file
5. **Multiple concerns** - Component handles more than one main purpose

#### Extraction Checklist

Before extracting code:

- [ ] **Identify boundaries** - Find natural separation points (e.g., a table, a form, a complex filter)
- [ ] **Name clearly** - New component/hook should have descriptive, focused name
- [ ] **Define interface** - Props/Return values should be minimal and clear
- [ ] **Move related code** - Include all related logic, styles, and types
- [ ] **Update tests** - Create tests for new unit
- [ ] **Verify functionality** - Ensure everything works after extraction

#### Example: Dashboard Extraction

Good example from this project:

**Before:** `Dashboard.tsx` was 520 lines with transaction list, filtering, sorting, pagination, chart logic, and data management.

**After:**

- `Dashboard.tsx`: ~200 lines (orchestration + charts)
- `TransactionList.tsx`: ~200 lines (display + filtering + pagination)
- `useTransactions.ts`: ~100 lines (data access and transformation logic)

**Benefits:**

- Each part has single responsibility
- `TransactionList` can be reused across different views
- Logic is testable in isolation (the hook)
- Clearer code organization

#### Component Extraction Priority

1. **UI sections** that are self-contained (modals, cards, list items)
2. **Repeated markup** across multiple components
3. **Complex logic** that can be isolated into a custom hook
4. **Feature-specific code** that might grow (wizards, multi-step forms)

### Naming Extracted Components

Use descriptive names that reflect single responsibility:

✅ **Good:** `TransactionList`, `DeleteConfirmationModal`, `AmountInput`
❌ **Bad:** `Records`, `Modal`, `Input` (too generic)
❌ **Bad:** `DashboardTransactionListWithFilters` (too specific, should be generic)

---

**Remember:** Every line of duplicated code is a future maintenance burden. Code reuse isn't just about reducing lines—it's about creating a maintainable, consistent, and scalable codebase.

---

## Error Handling

**CRITICAL:** Never let errors fail silently.

- **Always handle async errors** - Use try/catch for promises and async operations
- **Log errors meaningfully** - Technical details to console, user-friendly messages in UI
- **Reset UI state on error** - Clear loading states, re-enable buttons, reset file inputs
- **Provide actionable feedback** - Tell users what went wrong and how to fix it

### Error Handling Pattern

```typescript
const handleAction = async () => {
  try {
    setIsLoading(true);
    await apiService.doSomething();
    showSuccess('Success!');
  } catch (error) {
    console.error('Action failed:', error);
    showError('Failed to complete action. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

---

## Naming Conventions

Consistent naming improves readability and searchability.

| Type              | Convention                                | Example                               |
| ----------------- | ----------------------------------------- | ------------------------------------- |
| Files             | kebab-case (non-comp) / PascalCase (comp) | `user-profile.ts` / `UserProfile.tsx` |
| Components        | PascalCase                                | `UserProfile`                         |
| Hooks             | camelCase (prefix `use`)                  | `useUserProfile`, `useLoading`        |
| Methods/Variables | camelCase                                 | `getUserProfile`, `isLoading`         |
| Constants         | SCREAMING_SNAKE_CASE                      | `MAX_FILE_SIZE`, `API_URL`            |
| Booleans          | Prefix with `is`, `has`, `can`, `should`  | `isValid`, `hasChanges`               |

---

## Code Quality

### Must Avoid

- ❌ **No `console.log` in production** - Remove or use proper logging
- ❌ **No commented-out code** - Delete it; git has history
- ❌ **No `any` type** - Always define proper types/interfaces
- ❌ **No magic numbers** - Extract to named constants
- ❌ **No deep nesting** - Max 3 levels; extract to smaller components/functions

### Must Follow

- ✅ **Single Responsibility** - One component/function does one thing
- ✅ **Early returns** - Reduce nesting with guard clauses in hooks/functions
- ✅ **Descriptive names** - Code should read like prose
- ✅ **Small functions** - Target < 30 lines per function
- ✅ **Use curly braces for all control structures** - Even for single-line `if`/`else` statements

---

## Accessibility (A11y)

**CRITICAL:** Accessibility is not optional.

- **All buttons must have discernible text** - Use `title`, `aria-label`, or visible text
- **All images must have `alt` attributes** - Empty string for decorative images
- **All form inputs must have labels** - Use `<label htmlFor="">` or `aria-label`
- **Interactive elements must be keyboard accessible** - Tab navigation must work
- **Color is not the only indicator** - Use icons/text alongside color

### Quick Check

```jsx
// ❌ BAD
<button onClick={close}><LucideIcon name="X" /></button>

// ✅ GOOD
<button onClick={close} title="Close" aria-label="Close modal">
  <XIcon size={20} />
</button>
```

---

## Performance

### Code Splitting & Lazy Loading

- **Lazy load routes** - Use `React.lazy` and `Suspense` for page-level components
- **Dynamic imports** - Load heavy libraries on demand (e.g., chart.js, xlsx) using `await import()`

### React-Specific

- **Use `key` prop correctly** - Never use index as key if items can change order
- **Stabilize references** - Use `useCallback` for functions passed to memoized components
- **Memoize expensive calculations** - Use `useMemo` for heavy data processing
- **React.memo** - Wrap heavy UI components that receive stable props

### General

- **Minimize bundle size** - Check for duplicate imports and large libraries
- **Optimize images** - Use WebP, lazy load images below the fold
- **Debounce user input** - Use a debounce hook for search or frequent updates

### Memory Management

- **Effect Cleanups** - Always return a cleanup function in `useEffect` to remove listeners or cancel subscriptions
- **AbortController** - Use to cancel pending API requests on component unmount
- **Avoid closures capturing large objects** in long-lived hooks

### Rendering Performance

- **Avoid unnecessary state updates** - Batch updates or use `useReducer` for complex state
- **Virtual scrolling** - For long lists (100+ items), use `react-window` or `react-virtuoso`
- **Avoid layout thrashing** - Measure DOM only when necessary (e.g., `useLayoutEffect`)

---

## React Best Practices

### Hooks & Reactivity

- **Keep hooks at the top level** - Never call hooks inside loops or conditions
- **Dependencies array** - Always include all used variables in `useEffect`, `useMemo`, `useCallback`
- **Prefer custom hooks** for logic that involves multiple built-in hooks

### Component Architecture

- **Composition over Inheritance** - Use `children` prop to create flexible layouts
- **Controlled vs Uncontrolled** - Prefer controlled components for forms
- **Single Source of Truth** - Lift state up when multiple components need the same data
- **Prop Drilling** - Use React Context or a State Management library (Zustand/Redux) if drilling exceeds 3 levels

### JSX Rules

- **No complex logic in JSX** - Extract to variables or helper functions above the `return`
- **Conditional Rendering** - Use `condition && <Component />` or ternary operators
- **Fragments** - Use `<></>` to avoid unnecessary DOM nodes

### State & Data Access

- **Use Zustand stores** - The app is local-storage-backed; read and write via store actions, not raw `localStorage`
- **Loading/Error States** - Always handle and display loading and error indicators
- **Derive data in selectors** - Prefer `useMemo` or store selectors over recomputing in JSX

---

## TypeScript Best Practices

### Type Safety

- **Never use `any`** - Use `unknown` or specific interfaces
- **Define interfaces for Props** - Every component should have a Props interface
- **Strict Mode** - Ensure `strict: true` in `tsconfig.json`
- **Discriminated Unions** - Use for complex state or API responses

### Modern Syntax

```typescript
// ✅ GOOD
const name = user?.profile?.name ?? 'Anonymous';
const message = `Hello, ${name}!`;

// ❌ BAD
const name = (user && user.profile && user.profile.name) || 'Anonymous';
```

### Functions

- **Type all parameters and return values**
- **Use arrow functions** for component definitions and callbacks
- **Keep functions small** - Max ~30 lines

---

## CSS Best Practices

### Global Styles Architecture

```text
src/
├── index.css          # Global styles, CSS custom properties, resets
└── components/
    └── ComponentName/
        └── ComponentName.module.css  # Scoped component styles
```

### CSS Rules

- **Use CSS Modules** (`.module.css`) - Prevent style leaking between components
- **Use `index.css` for globals** - CSS custom properties, resets, typography
- **Don't duplicate global styles** in component modules
- **Nesting** - Use the native CSS nesting syntax (`& .child {}`) or keep selectors flat

### CSS Custom Properties

```css
/* index.css — define global tokens */
:root {
  --color-primary: #007bff;
  --border-radius: 8px;
}

/* ComponentName.module.css — consume tokens */
.button {
  background: var(--color-primary);
  border-radius: var(--border-radius);
}
```

---

## Security Best Practices

### Input Validation

- **Validate all user input** - Use libraries like `zod` or `yup` with forms
- **Sanitize imported data** - Check JSON/Excel structure before processing

### Storage Security

- **No sensitive data in localStorage**
- **No secrets in client-side code** (API keys should be behind a proxy if sensitive)

### Code Security

- **Avoid `dangerouslySetInnerHTML`** - If needed, sanitize with `DOMPurify` first
- **Keep dependencies updated** - Run `npm audit`

---

## Resilience Best Practices

### Graceful Degradation

- **Error Boundaries** - Use React Error Boundaries to catch crashes in specific UI trees
- **Fallback values** - Provide defaults for missing data

### Error Recovery

- **Retry logic** - For API calls (React Query handles this well)
- **Preserve input** - Don't clear forms on submission failure

---

## Testing

### What to Test

- **Critical user flows** - Using React Testing Library
- **Hook logic** - Using `@testing-library/react-hooks`
- **Edge cases** - Empty states, invalid inputs

### Test Naming

```typescript
it('should display error message when form is invalid', () => {});
it('should call onSave when button is clicked', () => {});
```

### Testing Best Practices

- **Test behavior, not implementation** - Don't test internal state, test what the user sees
- **Mock API calls** - Use MSW (Mock Service Worker) for network mocking

---

## Documentation

### JSDoc Standards

```typescript
/**
 * Calculates the total amount spent in a given category.
 * @param transactions - List of transactions to filter
 * @param category - The category to sum
 * @returns Total amount spent, or 0 if no matching transactions
 */
export const sumByCategory = (transactions: Transaction[], category: string): number => {
  return transactions
    .filter(t => t.category === category)
    .reduce((sum, t) => sum + t.amount, 0);
};
```

---

## Internationalization (i18n)

### Pattern

The project uses a custom i18n solution via `useLanguageStore` (Zustand).

### Usage

```typescript
const { t } = useLanguageStore();

return <h1>{t.dashboard.title}</h1>;
```

### i18n Rules

- **Never hardcode user-facing strings** - Always use the `t` object
- **Hierarchical keys** - Maintain the structure in `src/i18n/locales/`
- **German Compound Words** - Always use full forms (e.g., 'Kaltwasserverbrauch' instead of 'Kalt-')
- **Add new keys to all locales** - Ensure consistency across `en`, `de`, `pl`, etc.

---

## Project Structure

### Folder Organization

```text
src/
├── assets/             # Images, fonts, static files
├── components/         # UI components
│   ├── shared/         # Reusable across features
│   └── layout/         # Header, Footer, Sidebar
├── data/               # Static data and seed files
├── i18n/               # Localization files (locales, types, translations)
├── store/              # Zustand stores (state management)
├── hooks/              # Custom React hooks
├── index.css           # Global styles and CSS custom properties
├── types/              # TypeScript interfaces
└── utils/              # Helper functions
```

### Guidelines

- **Feature-based structure** - Group components and logic by feature
- **Keep components and their styles together** in the same folder
- **Export from index.ts** in each folder for cleaner imports
