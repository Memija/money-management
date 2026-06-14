export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function inferType(amount: number): 'income' | 'expense' {
  return amount >= 0 ? 'income' : 'expense';
}

export function parseAmount(raw: string | number): number {
  if (typeof raw === 'number') return raw;

  // Normalize Unicode minus/dash variants
  const cleanedStr = raw.toString().replace(/[\u2212\u2013\u2014\u2015]/g, '-').trim();

  // Clean out spaces, currency symbols, and any alphabetic indicators (S/H/EUR/etc)
  let cleaned = cleanedStr
    .replace(/[€$£a-zA-Z\s+]/g, '')
    .trim();

  let isNegative = false;
  // Detect trailing signs/indicators or leading minus
  if (cleanedStr.endsWith('-') || cleanedStr.endsWith('S') || cleanedStr.endsWith('s') || cleaned.startsWith('-')) {
    isNegative = true;
  }

  cleaned = cleaned.replace(/-/g, ''); // remove minus so we only rely on isNegative

  // Handle European format: 1.234,56 → 1234.56
  if (/,\d{1,2}$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // US format: remove commas
    cleaned = cleaned.replace(/,/g, '');
  }

  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;

  return isNegative ? -Math.abs(num) : Math.abs(num);
}

export function parseDate(raw: string): string {
  if (!raw) return new Date().toISOString().split('T')[0];
  // Try to parse DD.MM.YYYY (common German format)
  const deMatch = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (deMatch) {
    const year = deMatch[3].length === 2 ? '20' + deMatch[3] : deMatch[3];
    return `${year}-${deMatch[2].padStart(2, '0')}-${deMatch[1].padStart(2, '0')}`;
  }
  // Try ISO format
  const isoMatch = raw.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];
  // Try MM/DD/YYYY
  const usMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (usMatch) {
    const year = usMatch[3].length === 2 ? '20' + usMatch[3] : usMatch[3];
    return `${year}-${usMatch[1].padStart(2, '0')}-${usMatch[2].padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0];
}
