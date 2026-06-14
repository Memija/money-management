/**
 * Calculates Easter Sunday for a given year using the Gauss algorithm.
 * Returns a Date object for Easter Sunday at 00:00:00 local time.
 */
function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed month
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

/**
 * Checks if a given date is a public holiday in the specified country.
 * Returns the name of the holiday if it is one, otherwise null.
 * Currently supports Germany ('DE') nationwide holidays.
 */
export function getPublicHolidayName(date: Date, countryCode: string = 'DE'): string | null {
  if (countryCode !== 'DE') return null;

  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // Fixed nationwide holidays in Germany
  if (month === 0 && day === 1) return 'newYear';
  if (month === 4 && day === 1) return 'laborDay';
  if (month === 9 && day === 3) return 'germanUnity';
  if (month === 11 && day === 25) return 'christmas1';
  if (month === 11 && day === 26) return 'christmas2';

  // Relative holidays based on Easter
  const easter = getEasterSunday(year);

  // Helper to compare dates ignoring time
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Good Friday (Karfreitag): Easter - 2 days
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  if (isSameDay(date, goodFriday)) return 'goodFriday';

  // Easter Monday (Ostermontag): Easter + 1 day
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  if (isSameDay(date, easterMonday)) return 'easterMonday';

  // Ascension Day (Christi Himmelfahrt): Easter + 39 days
  const ascensionDay = new Date(easter);
  ascensionDay.setDate(easter.getDate() + 39);
  if (isSameDay(date, ascensionDay)) return 'ascensionDay';

  // Whit Monday (Pfingstmontag): Easter + 50 days
  const whitMonday = new Date(easter);
  whitMonday.setDate(easter.getDate() + 50);
  if (isSameDay(date, whitMonday)) return 'whitMonday';

  return null;
}
