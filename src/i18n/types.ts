export type Locale = 'en' | 'id' | 'pl' | 'bs' | 'sr' | 'de';

export interface TranslationStrings {
  // Header
  appName: string;

  // Theme switcher labels
  themeSystem: string;
  themeLight: string;
  themeDark: string;
  changeTheme: string;
  themeOptions: string;

  // Language switcher
  changeLanguage: string;

  // Progress stepper
  stepCountry: string;
  stepInstitution: string;
  stepImport: string;
  stepReview: string;

  // Country Selector
  welcomeTitle: string;
  welcomeSubtitle: string;
  selectCountryPlaceholder: string;
  searchCountries: string;
  noCountriesFound: string;
  soon: string;
  continue: string;

  // Institution Selector
  selectInstitutionTitle: string;
  selectInstitutionSubtitle: string;
  searchInstitutions: string;
  all: string;
  noInstitutionsFound: string;
  back: string;

  // Category labels
  catTraditional: string;
  catSparkasse: string;
  catVolksbank: string;
  catDirect: string;
  catNeobank: string;
  catLandesbank: string;
  catBrokerage: string;
  catSpecialized: string;
  catPayment: string;

  // Transaction Importer
  importTransactionsTitle: string;
  importTransactionsSubtitle: string; // contains {institution} placeholder
  importPsd2Notice: string;
  spreadsheetFile: string;
  spreadsheetFileDesc: string;
  pdfStatement: string;
  pdfStatementDesc: string;
  copyPaste: string;
  copyPasteDesc: string;
  chooseDifferentFormat: string;
  dropHere: string;
  dragDropFile: string;
  orClickToBrowse: string;
  acceptedFormats: string;
  pasteDataPlaceholder: string;
  parseTransactions: string;
  processingData: string;
  transactionsFound: string; // contains {count} placeholder
  clear: string;
  date: string;
  description: string;
  amount: string;
  confirmImport: string;
  moreTransactions: string; // contains {count} placeholder
  reviewTransactions: string;
  clearAllTransactionsTitle: string;
  clearAllTransactionsMessage: string;
  clearAll: string;
  cancel: string;
  done: string;
  noTransactionsLeft: string;
  filterDatePlaceholder: string;
  filterPlaceholder: string;
  selectDatePlaceholder: string;

  // Import Review
  importSuccessTitle: string;
  importSuccessSubtitle: string;
  institutions: string;
  transactions: string;
  totalIncome: string;
  totalExpenses: string;
  imported: string;
  addAnotherInstitution: string;
  proceedToAnalysis: string;

  // Dashboard
  newImport: string;
  totalBalance: string;
  income: string;
  expenses: string;
  incomeVsExpenses: string;
  expenseCategories: string;
  spendingTrend: string;
  allTransactions: string;
  search: string;
  allInstitutions: string;
  newestFirst: string;
  oldestFirst: string;
  highestAmount: string;
  lowestAmount: string;
  showingOf: string; // "Showing {shown} of {total} transactions"
  noTransactionsMatch: string;

  // Expense category labels
  catSalary: string;
  catRent: string;
  catGroceries: string;
  catDiningOut: string;
  catShopping: string;
  catTransport: string;
  catEntertainment: string;
  catInsurance: string;
  catUtilities: string;
  catHealthcare: string;
  catSavings: string;
  catTransfers: string;
  catOther: string;

  // Countries
  countries: Record<string, string>;

  // Holidays
  holidays: Record<string, string>;
}
