import { useLanguageStore } from '../store/useLanguageStore';

export const useFormatters = () => {
  const locale = useLanguageStore((s) => s.locale);

  // Some browsers (especially Chromium-based ones on Windows) have stripped ICU data
  // for 'bs' and 'sr', causing them to fall back to English (YYYY-MM-DD and -€500.00).
  // We map them to 'de-DE' to ensure consistent European formatting (DD.MM.YYYY and -500,00 €).
  const intlLocale = (locale === 'bs' || locale === 'sr') ? 'de-DE' : locale;

  const formatCurrency = (amount: number, maximumFractionDigits?: number) => {
    return amount.toLocaleString(intlLocale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString(intlLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatMonthYear = (dateString: string) => {
    return new Date(dateString + '-01').toLocaleDateString(intlLocale, {
      month: 'short',
      year: '2-digit',
    });
  };

  return { formatCurrency, formatDate, formatMonthYear, locale };
};
