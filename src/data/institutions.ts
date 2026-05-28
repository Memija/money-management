import type { FinancialInstitution, InstitutionCategory } from '../types';

export const germanInstitutions: FinancialInstitution[] = ([
  // Traditional Banks
  { id: 'deutsche-bank', name: 'Deutsche Bank', type: 'bank' as const, category: 'traditional' as const, logo: '/banks/deutsche-bank.png' },
  { id: 'commerzbank', name: 'Commerzbank', type: 'bank' as const, category: 'traditional' as const, logo: '/banks/commerzbank.png' },
  { id: 'hypovereinsbank', name: 'HypoVereinsbank (UniCredit)', type: 'bank' as const, category: 'traditional' as const, logo: '/banks/hypovereinsbank.png' },
  { id: 'postbank', name: 'Postbank', type: 'bank' as const, category: 'traditional' as const, logo: '/banks/postbank.png' },
  { id: 'targobank', name: 'Targobank', type: 'bank' as const, category: 'traditional' as const, logo: '/banks/targobank.png' },
  { id: 'santander-de', name: 'Santander Deutschland', type: 'bank' as const, category: 'traditional' as const, logo: '/banks/santander-de.png' },
  { id: 'ing-de', name: 'ING Deutschland', type: 'bank' as const, category: 'traditional' as const, logo: '/banks/ing-de.png' },

  // Sparkassen (Savings Banks)
  { id: 'berliner-sparkasse', name: 'Berliner Sparkasse', type: 'bank' as const, category: 'sparkasse' as const, logo: '/banks/berliner-sparkasse.png' },
  { id: 'hamburger-sparkasse', name: 'Hamburger Sparkasse (Haspa)', type: 'bank' as const, category: 'sparkasse' as const, logo: '/banks/hamburger-sparkasse.png' },
  { id: 'stadtsparkasse-muenchen', name: 'Stadtsparkasse München', type: 'bank' as const, category: 'sparkasse' as const, logo: '/banks/stadtsparkasse-muenchen.png' },
  { id: 'kreissparkasse-koeln', name: 'Kreissparkasse Köln', type: 'bank' as const, category: 'sparkasse' as const, logo: '/banks/kreissparkasse-koeln.png' },
  { id: 'sparkasse-koelnbonn', name: 'Sparkasse KölnBonn', type: 'bank' as const, category: 'sparkasse' as const, logo: '/banks/sparkasse-koelnbonn.png' },
  { id: 'nassauische-sparkasse', name: 'Nassauische Sparkasse (Naspa)', type: 'bank' as const, category: 'sparkasse' as const, logo: '/banks/nassauische-sparkasse.png' },
  { id: 'frankfurter-sparkasse', name: 'Frankfurter Sparkasse', type: 'bank' as const, category: 'sparkasse' as const, logo: '/banks/frankfurter-sparkasse.png' },
  { id: 'sparkasse-hannover', name: 'Sparkasse Hannover', type: 'bank' as const, category: 'sparkasse' as const, logo: '/banks/sparkasse-hannover.png' },
  { id: 'sparkasse-nuernberg', name: 'Sparkasse Nürnberg', type: 'bank' as const, category: 'sparkasse' as const, logo: '/banks/sparkasse-nuernberg.png' },
  { id: 'sparkasse-other', name: 'Other Sparkasse', type: 'bank' as const, category: 'sparkasse' as const, logo: '/banks/sparkasse-other.png' },

  // Volksbanken / Raiffeisenbanken
  { id: 'dz-bank', name: 'DZ Bank', type: 'bank' as const, category: 'volksbank' as const, logo: '/banks/dz-bank.png' },
  { id: 'berliner-volksbank', name: 'Berliner Volksbank', type: 'bank' as const, category: 'volksbank' as const, logo: '/banks/berliner-volksbank.png' },
  { id: 'frankfurter-volksbank', name: 'Frankfurter Volksbank Rhein/Main', type: 'bank' as const, category: 'volksbank' as const, logo: '/banks/frankfurter-volksbank.png' },
  { id: 'muenchner-bank', name: 'Münchner Bank', type: 'bank' as const, category: 'volksbank' as const, logo: '/banks/muenchner-bank.png' },
  { id: 'volksbank-other', name: 'Other Volksbank / Raiffeisenbank', type: 'bank' as const, category: 'volksbank' as const, logo: '/banks/volksbank-other.png' },

  // Direct & Online Banks
  { id: 'dkb', name: 'DKB (Deutsche Kreditbank)', type: 'bank' as const, category: 'direct' as const, logo: '/banks/dkb.png' },
  { id: 'comdirect', name: 'comdirect', type: 'bank' as const, category: 'direct' as const, logo: '/banks/comdirect.png' },
  { id: 'consorsbank', name: 'Consorsbank', type: 'bank' as const, category: 'direct' as const, logo: '/banks/consorsbank.png' },
  { id: 'norisbank', name: 'norisbank', type: 'bank' as const, category: 'direct' as const, logo: '/banks/norisbank.png' },
  { id: '1822direkt', name: '1822direkt', type: 'bank' as const, category: 'direct' as const, logo: '/banks/1822direkt.png' },

  // Neobanks & Fintechs
  { id: 'n26', name: 'N26', type: 'neobank' as const, category: 'neobank' as const, logo: '/banks/n26.png' },
  { id: 'tomorrow', name: 'Tomorrow Bank', type: 'neobank' as const, category: 'neobank' as const, logo: '/banks/tomorrow.png' },
  { id: 'vivid-money', name: 'Vivid Money', type: 'neobank' as const, category: 'neobank' as const, logo: '/banks/vivid-money.png' },
  { id: 'c24', name: 'C24 Bank', type: 'neobank' as const, category: 'neobank' as const, logo: '/banks/c24.png' },
  { id: 'openbank-de', name: 'Openbank', type: 'neobank' as const, category: 'neobank' as const, logo: '/banks/openbank-de.png' },
  { id: 'revolut-de', name: 'Revolut', type: 'neobank' as const, category: 'neobank' as const, logo: '/banks/revolut-de.png' },
  { id: 'wise-de', name: 'Wise', type: 'neobank' as const, category: 'neobank' as const, logo: '/banks/wise-de.png' },
  { id: 'bunq-de', name: 'bunq', type: 'neobank' as const, category: 'neobank' as const, logo: '/banks/bunq-de.png' },

  // Landesbanken
  { id: 'lbbw', name: 'LBBW (Landesbank Baden-Württemberg)', type: 'bank' as const, category: 'landesbank' as const, logo: '/banks/lbbw.png' },
  { id: 'helaba', name: 'Helaba (Landesbank Hessen-Thüringen)', type: 'bank' as const, category: 'landesbank' as const, logo: '/banks/helaba.png' },
  { id: 'bayernlb', name: 'BayernLB', type: 'bank' as const, category: 'landesbank' as const, logo: '/banks/bayernlb.png' },
  { id: 'norddeutsche-lb', name: 'Nord/LB', type: 'bank' as const, category: 'landesbank' as const, logo: '/banks/norddeutsche-lb.png' },

  // Brokerages & Investment
  { id: 'trade-republic', name: 'Trade Republic', type: 'brokerage' as const, category: 'brokerage' as const, logo: '/banks/trade-republic.png' },
  { id: 'scalable-capital', name: 'Scalable Capital', type: 'brokerage' as const, category: 'brokerage' as const, logo: '/banks/scalable-capital.png' },
  { id: 'flatex', name: 'flatex', type: 'brokerage' as const, category: 'brokerage' as const, logo: '/banks/flatex.png' },
  { id: 'smartbroker', name: 'Smartbroker+', type: 'brokerage' as const, category: 'brokerage' as const, logo: '/banks/smartbroker.png' },
  { id: 'degiro-de', name: 'DEGIRO', type: 'brokerage' as const, category: 'brokerage' as const, logo: '/banks/degiro-de.png' },

  // Specialized Banks
  { id: 'apobank', name: 'apoBank (Deutsche Apotheker- und Ärztebank)', type: 'bank' as const, category: 'specialized' as const, logo: '/banks/apobank.png' },
  { id: 'psd-bank', name: 'PSD Bank', type: 'bank' as const, category: 'specialized' as const, logo: '/banks/psd-bank.png' },
  { id: 'sparda-bank', name: 'Sparda-Bank', type: 'bank' as const, category: 'specialized' as const, logo: '/banks/sparda-bank.png' },
  { id: 'gls-bank', name: 'GLS Bank', type: 'bank' as const, category: 'specialized' as const, logo: '/banks/gls-bank.png' },
  { id: 'ethikbank', name: 'EthikBank', type: 'bank' as const, category: 'specialized' as const, logo: '/banks/ethikbank.png' },
  { id: 'triodos-de', name: 'Triodos Bank', type: 'bank' as const, category: 'specialized' as const, logo: '/banks/triodos-de.png' },
  { id: 'umweltbank', name: 'UmweltBank', type: 'bank' as const, category: 'specialized' as const, logo: '/banks/umweltbank.png' },

  // Payment Services
  { id: 'paypal-de', name: 'PayPal', type: 'neobank' as const, category: 'payment' as const, logo: '/banks/paypal-de.png' },
  { id: 'klarna-de', name: 'Klarna', type: 'neobank' as const, category: 'payment' as const, logo: '/banks/klarna-de.png' },

  // Other
  { id: 'other-de', name: 'Other Institution', type: 'bank' as const, category: 'other' as const },
] as FinancialInstitution[]).sort((a, b) => a.name.localeCompare(b.name));

export const institutionsByCountry: Record<string, FinancialInstitution[]> = {
  de: germanInstitutions,
};

/** Display labels for each category */
export const categoryLabels: Record<InstitutionCategory, string> = {
  traditional: 'Traditional Banks',
  sparkasse: 'Sparkassen',
  volksbank: 'Volksbanken',
  direct: 'Direct / Online Banks',
  neobank: 'Neobanks',
  landesbank: 'Landesbanken',
  brokerage: 'Brokerages',
  specialized: 'Specialized Banks',
  payment: 'Payment Services',
  other: 'Other',
};

/** Category display order for filter pills */
export const categoryOrder: InstitutionCategory[] = [
  'traditional',
  'sparkasse',
  'volksbank',
  'direct',
  'neobank',
  'landesbank',
  'brokerage',
  'specialized',
  'payment',
  'other',
];

export function getInstitutionTypeLabel(type: FinancialInstitution['type']): string {
  switch (type) {
    case 'bank': return 'Bank';
    case 'neobank': return 'Neobank / Fintech';
    case 'credit_union': return 'Credit Union';
    case 'brokerage': return 'Brokerage';
    case 'insurance': return 'Insurance';
    default: return 'Other';
  }
}
