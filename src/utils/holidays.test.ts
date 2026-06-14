import { describe, it, expect } from 'vitest';
import { getPublicHolidayName } from './holidays';

describe('getPublicHolidayName', () => {
  it('should return null for non-supported country codes', () => {
    const date = new Date(2024, 0, 1); // Jan 1st, normally New Year's
    expect(getPublicHolidayName(date, 'US')).toBeNull();
    expect(getPublicHolidayName(date, 'AT')).toBeNull();
    expect(getPublicHolidayName(date, 'FR')).toBeNull();
  });

  describe('Germany (DE) - Fixed Holidays', () => {
    it('should identify New Year (Neujahr)', () => {
      expect(getPublicHolidayName(new Date(2024, 0, 1))).toBe('newYear');
      expect(getPublicHolidayName(new Date(2025, 0, 1))).toBe('newYear');
    });

    it('should identify Labor Day (Tag der Arbeit)', () => {
      expect(getPublicHolidayName(new Date(2024, 4, 1))).toBe('laborDay'); // May is month 4
    });

    it('should identify Day of German Unity (Tag der Deutschen Einheit)', () => {
      expect(getPublicHolidayName(new Date(2024, 9, 3))).toBe('germanUnity'); // Oct is month 9
    });

    it('should identify Christmas Day (1. Weihnachtstag)', () => {
      expect(getPublicHolidayName(new Date(2024, 11, 25))).toBe('christmas1'); // Dec is month 11
    });

    it('should identify Boxing Day / 2nd Christmas Day (2. Weihnachtstag)', () => {
      expect(getPublicHolidayName(new Date(2024, 11, 26))).toBe('christmas2'); // Dec is month 11
    });
  });

  describe('Germany (DE) - Relative Holidays (Easter dependent)', () => {
    // 2024: Easter is March 31
    it('should calculate correctly for 2024', () => {
      expect(getPublicHolidayName(new Date(2024, 2, 29))).toBe('goodFriday'); // March 29
      expect(getPublicHolidayName(new Date(2024, 3, 1))).toBe('easterMonday'); // April 1
      expect(getPublicHolidayName(new Date(2024, 4, 9))).toBe('ascensionDay'); // May 9
      expect(getPublicHolidayName(new Date(2024, 4, 20))).toBe('whitMonday'); // May 20
    });

    // 2025: Easter is April 20
    it('should calculate correctly for 2025', () => {
      expect(getPublicHolidayName(new Date(2025, 3, 18))).toBe('goodFriday'); // April 18
      expect(getPublicHolidayName(new Date(2025, 3, 21))).toBe('easterMonday'); // April 21
      expect(getPublicHolidayName(new Date(2025, 4, 29))).toBe('ascensionDay'); // May 29
      expect(getPublicHolidayName(new Date(2025, 5, 9))).toBe('whitMonday'); // June 9
    });

    // 2038: A late Easter, April 25
    it('should calculate correctly for 2038', () => {
      expect(getPublicHolidayName(new Date(2038, 3, 23))).toBe('goodFriday'); // April 23
      expect(getPublicHolidayName(new Date(2038, 3, 26))).toBe('easterMonday'); // April 26
      expect(getPublicHolidayName(new Date(2038, 5, 3))).toBe('ascensionDay'); // June 3
      expect(getPublicHolidayName(new Date(2038, 5, 14))).toBe('whitMonday'); // June 14
    });

    // 2285: Easter is March 22 (earliest possible)
    it('should calculate correctly for 2285 (earliest possible Easter)', () => {
      expect(getPublicHolidayName(new Date(2285, 2, 20))).toBe('goodFriday'); // March 20
      expect(getPublicHolidayName(new Date(2285, 2, 23))).toBe('easterMonday'); // March 23
    });
  });

  describe('Edge Cases and Regular Days', () => {
    it('should return null for non-holidays', () => {
      expect(getPublicHolidayName(new Date(2024, 2, 15))).toBeNull(); // Random March day
      expect(getPublicHolidayName(new Date(2024, 6, 4))).toBeNull(); // Random July day
      expect(getPublicHolidayName(new Date(2024, 11, 24))).toBeNull(); // Christmas Eve is not a nationwide public holiday
      expect(getPublicHolidayName(new Date(2024, 11, 31))).toBeNull(); // New Year's Eve is not a nationwide public holiday
    });

    it('should handle dates with different times of the day', () => {
      // The function uses local time to extract year, month, date
      const dateStartOfDay = new Date(2024, 0, 1, 0, 0, 0);
      const dateMiddleOfDay = new Date(2024, 0, 1, 12, 30, 45);
      const dateEndOfDay = new Date(2024, 0, 1, 23, 59, 59);

      expect(getPublicHolidayName(dateStartOfDay)).toBe('newYear');
      expect(getPublicHolidayName(dateMiddleOfDay)).toBe('newYear');
      expect(getPublicHolidayName(dateEndOfDay)).toBe('newYear');
    });

    it('should handle leap year dates gracefully', () => {
      expect(getPublicHolidayName(new Date(2024, 1, 29))).toBeNull(); // Feb 29 2024 (Leap Day) is not a holiday
    });

    it('should default to DE when country code is not provided', () => {
      expect(getPublicHolidayName(new Date(2024, 0, 1))).toBe('newYear');
      expect(getPublicHolidayName(new Date(2024, 0, 1), undefined)).toBe('newYear');
    });
  });
});
