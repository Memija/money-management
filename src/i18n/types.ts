/**
 * Supported application locales.
 *
 * Checklist when adding a new locale:
 * 1. Add locale code to this `Locale` union.
 * 2. Create translations in `src/i18n/locales/<locale>.ts`.
 * 3. Register in `src/i18n/translations.ts` (`translations`, `localeLabels`, and `localeOrder`).
 * 4. Create parser configuration in `src/i18n/parser-locales/<locale>.ts`.
 * 5. Verify date formatting in `src/utils/date-utils.ts` (`MONTH_FALLBACKS` & `WEEKDAY_FALLBACKS` if ICU data is incomplete).
 *    Note: The automated guardrail test in `date-utils.test.ts` will test all `localeOrder` entries automatically.
 * 6. Verify data guardrails pass in `src/data/` (`countries.test.ts`, `institutions.test.ts`, `merchants.test.ts`).
 */
export type Locale = 'en' | 'id' | 'pl' | 'bs' | 'sr' | 'de'

export interface CategoryKeywords {
  Salary: string[]
  Rent: string[]
  Groceries: string[]
  DiningOut: string[]
  Shopping: string[]
  Transport: string[]
  Entertainment: string[]
  Insurance: string[]
  Utilities: string[]
  Healthcare: string[]
  Savings: string[]
  Transfers: string[]
}

export interface TranslationStrings {
  // Header
  appName: string
  goToDashboard: string
  loading: string

  // Theme switcher labels
  themeSystem: string
  themeLight: string
  themeDark: string
  changeTheme: string
  themeOptions: string

  // Language switcher
  changeLanguage: string

  // Progress stepper
  stepCountry: string
  stepInstitution: string
  stepImport: string
  stepReview: string

  // Country Selector
  welcomeTitle: string
  welcomeSubtitle: string
  selectCountryPlaceholder: string
  searchCountries: string
  noCountriesFound: string
  soon: string
  continue: string

  // Institution Selector
  selectInstitutionTitle: string
  selectInstitutionSubtitle: string
  searchInstitutions: string
  all: string
  noInstitutionsFound: string
  back: string

  // Category labels
  catTraditional: string
  catSparkasse: string
  catVolksbank: string
  catDirect: string
  catNeobank: string
  catLandesbank: string
  catBrokerage: string
  catSpecialized: string
  catPayment: string

  // Transaction Importer
  importTransactionsTitle: string
  importTransactionsSubtitle: string // contains {institution} placeholder
  importPsd2Notice: string
  spreadsheetFile: string
  spreadsheetFileDesc: string
  pdfStatement: string
  pdfStatementDesc: string
  copyPaste: string
  copyPasteDesc: string
  chooseDifferentFormat: string
  dropHere: string
  dragDropFile: string
  orClickToBrowse: string
  acceptedFormats: string
  errorParsePaste: string
  errorParsePasteOneRow: string
  errorParsePasteInvalidDate: string
  errorParsePasteFailed: string
  errorParsePasteMore: string
  errorParsePdf: string
  errorProcessFile: string
  errorParsePastedData: string
  errorNoTransactionsInFile: string
  errorNoTransactionsInCSV: string
  pasteDataPlaceholder: string
  parseTransactions: string
  processingData: string
  transactionsFound: string // contains {count} placeholder
  clear: string
  date: string
  description: string
  amount: string
  confirmImport: string
  moreTransactions: string // contains {count} placeholder
  reviewTransactions: string
  clearAllTransactionsTitle: string
  clearAllTransactionsMessage: string
  clearAll: string
  cancel: string
  close: string
  removeTransaction: string
  selectDatePlaceholder: string
  clearDate: string
  previousMonth: string
  nextMonth: string
  done: string
  noTransactionsLeft: string
  filterDatePlaceholder: string
  filterPlaceholder: string
  searchTransactionsPlaceholder: string
  clearFilters: string
  duplicate: string
  allDates: string
  fromDate: string
  toDate: string
  transactionCountSingular: string
  transactionCountFew: string
  transactionCountPlural: string

  // Duplicate import warning
  duplicateImportTitle: string
  duplicateImportMessageAll: string
  duplicateImportMessagePartial: string
  duplicateImportProceed: string
  duplicateImportCancel: string
  duplicateImportOk: string
  duplicateTransactionsDetectedSingular: string
  duplicateTransactionsDetected: string

  // Import Review
  importSuccessTitle: string
  importSuccessSubtitle: string
  institutions: string
  transactions: string
  totalIncome: string
  totalExpenses: string
  imported: string
  addAnotherInstitution: string
  proceedToAnalysis: string

  // Dashboard
  newImport: string
  totalBalance: string
  income: string
  expenses: string
  incomeVsExpenses: string
  expenseCategories: string
  category: string
  categories: string
  categoryCountSingular: string
  categoryCountFew: string
  categoryCountPlural: string
  spendingTrend: string
  viewMonthly: string
  viewCumulative: string
  cumulativeBalance: string
  allTransactions: string
  search: string
  allInstitutions: string
  sortOrder: string
  newestFirst: string
  oldestFirst: string
  highestAmount: string
  lowestAmount: string
  showingOf: string // "Showing {shown} of {total} transactions"
  noTransactionsMatch: string
  perPage: string

  // Dashboard — Analytics enhancements
  insightTransactions: string
  insightAvgTransaction: string
  insightTopCategory: string
  insightSavingsRate: string
  topMerchants: string
  viewRankedList: string
  viewBarChart: string
  topMerchantsShare: string
  categoryTrend: string
  monthlyAverage: string
  peakMonth: string
  avgPerCategory: string
  viewStackedBars: string
  viewTrendArea: string
  allCategories: string
  monthsTracked: string
  periodAll: string
  periodYear: string
  periodQuarter: string
  periodMonth: string
  ofTotal: string // "{percent}% of total"
  ofAvgIncome: string // "{percent}% of avg. income"
  savingsRateLabel: string
  totalIncomeLabel: string
  totalExpensesLabel: string
  netSavedLabel: string
  savingsTrendTitle: string
  savingsBestMonth: string
  savingsWorstMonth: string
  deficitRateTitle: string
  netDeficitLabel: string
  deficitRateLabel: string
  multiplierInfo: string
  noExpenseData: string
  incomeCount: string
  expenseCount: string
  avgIncomeLabel: string
  avgExpenseLabel: string
  avgAllLabel: string
  median: string
  averages: string
  avgPerTransaction: string
  perTransaction: string
  perTransactionShort: string
  total: string
  ofTopSpend: string
  numTransactions: string
  avgPerMonthWithCount: string
  highestSingle: string
  lowestSingle: string
  medianInfo: string
  aboveAvg: string
  atBelowAvg: string
  noTransactionsInPeriod: string

  // Recurring Expenses
  recurringTitle: string
  monthlyTotal: string
  yearlyTotal: string
  activeSubscriptionsSingular: string
  activeSubscriptions: string
  estimatedLabel: string
  chargesCountSingular: string
  chargesCountFew: string
  chargesCountPlural: string
  chargesCount: string
  monthlyFrequency: string
  perMonth: string
  perYear: string
  selectedCount: string
  selectAll: string
  deselectAll: string
  changeCategory: string
  bulkEdit: string

  // Settings
  settingsTitle: string
  createCustomRule: string
  createCustomRuleDesc: string
  targetCategory: string
  keywordOrMerchant: string
  keywordPlaceholder: string
  addRule: string
  manualOverridesInfo: string
  activeRules: string
  rulesTotal: string
  noCustomRules: string
  noCustomRulesDesc: string
  yourCategories: string
  customCount: string
  newCategoryNamePlaceholder: string
  addTranslationsTitle: string
  noCustomCategories: string
  defaultCategoriesGroup: string
  customCategoriesGroup: string
  popularMerchants: string
  popularMerchantsCountSingular: string
  popularMerchantsCountFew: string
  popularMerchantsCountPlural: string
  add: string
  chooseIconTitle: string
  searchIconsPlaceholder: string
  noIconsFound: string
  chooseIconOptional: string
  optionalTranslationsHelp: string
  name: string
  translation: string
  deleteCategory: string
  editCategory: string
  editCategoryTitle: string
  saveChanges: string
  removeIcon: string
  addNewCategory: string
  manageInSettings: string
  createAndApply: string
  quickCreateCategoryTitle: string
  manageInSettingsHint: string

  // Expense category labels
  catSalary: string
  catRent: string
  catGroceries: string
  catDiningOut: string
  catShopping: string
  catTransport: string
  catEntertainment: string
  catInsurance: string
  catUtilities: string
  catHealthcare: string
  catSavings: string
  catTransfers: string
  catOther: string

  // Category keywords for auto-categorization
  categoryKeywords: CategoryKeywords

  // Countries
  countries: Record<string, string>

  // Holidays
  holidays: Record<string, string>

  // Icons
  iconGroups: Record<string, string>
  icons: Record<string, string>
}
