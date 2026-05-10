export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category?: string;
  type: 'income' | 'expense';
  institution: string;
}
