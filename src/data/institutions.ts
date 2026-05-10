import type { FinancialInstitution, InstitutionCategory } from '../types';

export const germanInstitutions: FinancialInstitution[] = ([
  // Traditional Banks
  { id: 'deutsche-bank', name: 'Deutsche Bank', type: 'bank' as const, category: 'traditional' as const },
  { id: 'commerzbank', name: 'Commerzbank', type: 'bank' as const, category: 'traditional' as const },
  { id: 'hypovereinsbank', name: 'HypoVereinsbank (UniCredit)', type: 'bank' as const, category: 'traditional' as const },
  { id: 'postbank', name: 'Postbank', type: 'bank' as const, category: 'traditional' as const },
  { id: 'targobank', name: 'Targobank', type: 'bank' as const, category: 'traditional' as const },
  { id: 'santander-de', name: 'Santander Deutschland', type: 'bank' as const, category: 'traditional' as const },
  { id: 'ing-de', name: 'ING Deutschland', type: 'bank' as const, category: 'traditional' as const },

  // Sparkassen (Savings Banks)
  { id: 'berliner-sparkasse', name: 'Berliner Sparkasse', type: 'bank' as const, category: 'sparkasse' as const },
  { id: 'hamburger-sparkasse', name: 'Hamburger Sparkasse (Haspa)', type: 'bank' as const, category: 'sparkasse' as const },
  { id: 'stadtsparkasse-muenchen', name: 'Stadtsparkasse München', type: 'bank' as const, category: 'sparkasse' as const },
  { id: 'kreissparkasse-koeln', name: 'Kreissparkasse Köln', type: 'bank' as const, category: 'sparkasse' as const },
  { id: 'sparkasse-koelnbonn', name: 'Sparkasse KölnBonn', type: 'bank' as const, category: 'sparkasse' as const },
  { id: 'nassauische-sparkasse', name: 'Nassauische Sparkasse (Naspa)', type: 'bank' as const, category: 'sparkasse' as const },
  { id: 'frankfurter-sparkasse', name: 'Frankfurter Sparkasse', type: 'bank' as const, category: 'sparkasse' as const },
  { id: 'sparkasse-hannover', name: 'Sparkasse Hannover', type: 'bank' as const, category: 'sparkasse' as const },
  { id: 'sparkasse-nuernberg', name: 'Sparkasse Nürnberg', type: 'bank' as const, category: 'sparkasse' as const },
  { id: 'sparkasse-other', name: 'Other Sparkasse', type: 'bank' as const, category: 'sparkasse' as const },

  // Volksbanken / Raiffeisenbanken
  { id: 'dz-bank', name: 'DZ Bank', type: 'bank' as const, category: 'volksbank' as const },
  { id: 'berliner-volksbank', name: 'Berliner Volksbank', type: 'bank' as const, category: 'volksbank' as const },
  { id: 'frankfurter-volksbank', name: 'Frankfurter Volksbank Rhein/Main', type: 'bank' as const, category: 'volksbank' as const },
  { id: 'muenchner-bank', name: 'Münchner Bank', type: 'bank' as const, category: 'volksbank' as const },
  { id: 'volksbank-other', name: 'Other Volksbank / Raiffeisenbank', type: 'bank' as const, category: 'volksbank' as const },

  // Direct & Online Banks
  { id: 'dkb', name: 'DKB (Deutsche Kreditbank)', type: 'bank' as const, category: 'direct' as const },
  { id: 'comdirect', name: 'comdirect', type: 'bank' as const, category: 'direct' as const },
  { id: 'consorsbank', name: 'Consorsbank', type: 'bank' as const, category: 'direct' as const },
  { id: 'norisbank', name: 'norisbank', type: 'bank' as const, category: 'direct' as const },
  { id: '1822direkt', name: '1822direkt', type: 'bank' as const, category: 'direct' as const },

  // Neobanks & Fintechs
  { id: 'n26', name: 'N26', type: 'neobank' as const, category: 'neobank' as const },
  { id: 'tomorrow', name: 'Tomorrow Bank', type: 'neobank' as const, category: 'neobank' as const },
  { id: 'vivid-money', name: 'Vivid Money', type: 'neobank' as const, category: 'neobank' as const },
  { id: 'c24', name: 'C24 Bank', type: 'neobank' as const, category: 'neobank' as const },
  { id: 'openbank-de', name: 'Openbank', type: 'neobank' as const, category: 'neobank' as const },
  { id: 'revolut-de', name: 'Revolut', type: 'neobank' as const, category: 'neobank' as const },
  { id: 'wise-de', name: 'Wise', type: 'neobank' as const, category: 'neobank' as const },
  { id: 'bunq-de', name: 'bunq', type: 'neobank' as const, category: 'neobank' as const },

  // Landesbanken
  { id: 'lbbw', name: 'LBBW (Landesbank Baden-Württemberg)', type: 'bank' as const, category: 'landesbank' as const },
  { id: 'helaba', name: 'Helaba (Landesbank Hessen-Thüringen)', type: 'bank' as const, category: 'landesbank' as const },
  { id: 'bayernlb', name: 'BayernLB', type: 'bank' as const, category: 'landesbank' as const },
  { id: 'norddeutsche-lb', name: 'Nord/LB', type: 'bank' as const, category: 'landesbank' as const },

  // Brokerages & Investment
  { id: 'trade-republic', name: 'Trade Republic', type: 'brokerage' as const, category: 'brokerage' as const },
  { id: 'scalable-capital', name: 'Scalable Capital', type: 'brokerage' as const, category: 'brokerage' as const },
  { id: 'flatex', name: 'flatex', type: 'brokerage' as const, category: 'brokerage' as const },
  { id: 'smartbroker', name: 'Smartbroker+', type: 'brokerage' as const, category: 'brokerage' as const },
  { id: 'degiro-de', name: 'DEGIRO', type: 'brokerage' as const, category: 'brokerage' as const },

  // Specialized Banks
  { id: 'apobank', name: 'apoBank (Deutsche Apotheker- und Ärztebank)', type: 'bank' as const, category: 'specialized' as const },
  { id: 'psd-bank', name: 'PSD Bank', type: 'bank' as const, category: 'specialized' as const },
  { id: 'sparda-bank', name: 'Sparda-Bank', type: 'bank' as const, category: 'specialized' as const },
  { id: 'gls-bank', name: 'GLS Bank', type: 'bank' as const, category: 'specialized' as const },
  { id: 'ethikbank', name: 'EthikBank', type: 'bank' as const, category: 'specialized' as const },
  { id: 'triodos-de', name: 'Triodos Bank', type: 'bank' as const, category: 'specialized' as const },
  { id: 'umweltbank', name: 'UmweltBank', type: 'bank' as const, category: 'specialized' as const },

  // Payment Services
  { id: 'paypal-de', name: 'PayPal', type: 'neobank' as const, category: 'payment' as const },
  { id: 'klarna-de', name: 'Klarna', type: 'neobank' as const, category: 'payment' as const },

  // Other
  { id: 'other-de', name: 'Other Institution', type: 'bank' as const, category: 'traditional' as const },
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
