/// <reference types="node" />
import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import { localeLabels, localeOrder, translations } from '../i18n/translations'
import { countries } from './countries'

const flagsDir = path.resolve(__dirname, '../../public/flags')

describe('countries data', () => {
  describe('structure and integrity', () => {
    it('contains a non-empty list of countries', () => {
      expect(countries.length).toBeGreaterThan(0)
    })

    it('has unique country codes', () => {
      const codes = countries.map((c) => c.code)
      const uniqueCodes = new Set(codes)
      expect(uniqueCodes.size).toBe(codes.length)
    })

    it('has valid, lowercase 2-letter ISO codes and non-empty names', () => {
      for (const country of countries) {
        expect(country.code).toMatch(/^[a-z]{2}$/)
        expect(country.name.trim().length).toBeGreaterThan(0)
        expect(typeof country.supported).toBe('boolean')
      }
    })

    it('orders supported countries first, followed by alphabetical order', () => {
      let seenUnsupported = false
      for (let i = 0; i < countries.length; i++) {
        const country = countries[i]
        if (!country.supported) {
          seenUnsupported = true
        } else if (seenUnsupported) {
          // A supported country appeared after an unsupported one
          expect(country.supported).toBe(false)
        }

        if (i > 0 && countries[i - 1].supported === country.supported) {
          expect(country.name.localeCompare(countries[i - 1].name)).toBeGreaterThanOrEqual(0)
        }
      }
    })
  })

  describe('asset verification (flags)', () => {
    it('has an existing flag image file for every country', () => {
      for (const country of countries) {
        expect(country.flag).toMatch(/^\/flags\/[a-z]{2}\.png$/)
        const flagFileName = path.basename(country.flag)
        const flagFilePath = path.join(flagsDir, flagFileName)
        expect(
          fs.existsSync(flagFilePath),
          `Flag image missing for country code "${country.code}" at ${flagFilePath}`,
        ).toBe(true)
      }
    })

    it('has an existing flag image for every locale label in translations.ts', () => {
      for (const [locale, labelInfo] of Object.entries(localeLabels)) {
        expect(labelInfo.flag).toMatch(/^\/flags\/[a-z]{2}\.png$/)
        const flagFileName = path.basename(labelInfo.flag)
        const flagFilePath = path.join(flagsDir, flagFileName)
        expect(
          fs.existsSync(flagFilePath),
          `Flag image missing for locale "${locale}" (${labelInfo.flag}) at ${flagFilePath}`,
        ).toBe(true)
      }
    })
  })

  describe('i18n completeness guardrail', () => {
    it.each(localeOrder)(
      'locale "%s" translates all country codes defined in countries.ts',
      (locale) => {
        const localeTranslations = translations[locale]
        expect(
          localeTranslations.countries,
          `Locale "${locale}" is missing the "countries" map`,
        ).toBeDefined()

        const missingTranslations: string[] = []
        for (const country of countries) {
          const translatedName = localeTranslations.countries?.[country.code]
          if (!translatedName || translatedName.trim().length === 0) {
            missingTranslations.push(country.code)
          }
        }

        expect(
          missingTranslations,
          `Locale "${locale}" is missing country translations for: ${missingTranslations.join(', ')}`,
        ).toEqual([])
      },
    )

    it.each(localeOrder)(
      'locale "%s" does not contain obsolete country codes not in countries.ts',
      (locale) => {
        const localeCountries = translations[locale].countries || {}
        const validCodes = new Set(countries.map((c) => c.code))

        const obsoleteCodes = Object.keys(localeCountries).filter((code) => !validCodes.has(code))
        expect(
          obsoleteCodes,
          `Locale "${locale}" has obsolete country translations: ${obsoleteCodes.join(', ')}`,
        ).toEqual([])
      },
    )

    it('includes all countries referenced by localeLabels in countries.ts', () => {
      const countryCodes = new Set(countries.map((c) => c.code))
      for (const [locale, labelInfo] of Object.entries(localeLabels)) {
        // Extract country code from flag path (e.g. /flags/de.png -> de)
        const flagCode = path.basename(labelInfo.flag, '.png')
        expect(
          countryCodes.has(flagCode),
          `Flag country "${flagCode}" used by locale "${locale}" is missing from countries.ts`,
        ).toBe(true)
      }
    })
  })
})
