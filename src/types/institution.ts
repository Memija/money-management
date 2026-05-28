export type InstitutionCategory =
  | 'traditional'
  | 'sparkasse'
  | 'volksbank'
  | 'direct'
  | 'neobank'
  | 'landesbank'
  | 'brokerage'
  | 'specialized'
  | 'payment'
  | 'other';

export interface FinancialInstitution {
  id: string;
  name: string;
  type: 'bank' | 'neobank' | 'credit_union' | 'brokerage' | 'insurance';
  category: InstitutionCategory;
  logo?: string;
}
