/// <reference types="node" />
import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import { countries } from './countries'
import {
  categoryLabels,
  categoryOrder,
  germanInstitutions,
  getInstitutionTypeLabel,
  institutionsByCountry,
} from './institutions'

const banksDir = path.resolve(__dirname, '../../public/banks')

const VALID_INSTITUTION_TYPES = ['bank', 'neobank', 'credit_union', 'brokerage', 'insurance'] as const

describe('institutions data', () => {
  describe('supported country parity', () => {
    it('provides institutions for every country marked as supported in countries.ts', () => {
      const supportedCountries = countries.filter((c) => c.supported)
      expect(supportedCountries.length).toBeGreaterThan(0)

      for (const country of supportedCountries) {
        const countryInstitutions = institutionsByCountry[country.code]
        expect(
          countryInstitutions,
          `Supported country "${country.code}" (${country.name}) is missing from institutionsByCountry`,
        ).toBeDefined()
        expect(
          countryInstitutions.length,
          `Supported country "${country.code}" (${country.name}) has an empty institutions list`,
        ).toBeGreaterThan(0)
      }
    })

    it('only registers countries in institutionsByCountry that exist in countries.ts', () => {
      const countryCodeMap = new Map(countries.map((c) => [c.code, c]))

      for (const countryCode of Object.keys(institutionsByCountry)) {
        const country = countryCodeMap.get(countryCode)
        expect(
          country,
          `institutionsByCountry contains country code "${countryCode}" which does not exist in countries.ts`,
        ).toBeDefined()
        expect(
          country?.supported,
          `Country "${countryCode}" has registered institutions but is marked supported: false in countries.ts`,
        ).toBe(true)
      }
    })
  })

  describe('institution entry integrity', () => {
    const allInstitutions = Object.values(institutionsByCountry).flat()

    it('contains institutions with globally unique IDs', () => {
      const ids = allInstitutions.map((i) => i.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('has non-empty names and valid types and categories for all institutions', () => {
      const validCategories = new Set(categoryOrder)

      for (const inst of allInstitutions) {
        expect(inst.id.trim().length).toBeGreaterThan(0)
        expect(inst.name.trim().length).toBeGreaterThan(0)
        expect(VALID_INSTITUTION_TYPES).toContain(inst.type)
        expect(
          validCategories.has(inst.category),
          `Institution "${inst.id}" has unknown category "${inst.category}"`,
        ).toBe(true)
      }
    })

    it('sorts germanInstitutions alphabetically by name', () => {
      for (let i = 1; i < germanInstitutions.length; i++) {
        expect(
          germanInstitutions[i].name.localeCompare(germanInstitutions[i - 1].name),
        ).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('categories & labels', () => {
    it('defines unique categories in categoryOrder', () => {
      const uniqueCats = new Set(categoryOrder)
      expect(uniqueCats.size).toBe(categoryOrder.length)
    })

    it('provides a display label in categoryLabels for every category in categoryOrder', () => {
      for (const category of categoryOrder) {
        const label = categoryLabels[category]
        expect(label).toBeDefined()
        expect(label.trim().length).toBeGreaterThan(0)
      }
    })

    it('returns appropriate human-readable type labels from getInstitutionTypeLabel', () => {
      expect(getInstitutionTypeLabel('bank')).toBe('Bank')
      expect(getInstitutionTypeLabel('neobank')).toBe('Neobank / Fintech')
      expect(getInstitutionTypeLabel('credit_union')).toBe('Credit Union')
      expect(getInstitutionTypeLabel('brokerage')).toBe('Brokerage')
      expect(getInstitutionTypeLabel('insurance')).toBe('Insurance')
      // @ts-expect-error testing unknown fallback
      expect(getInstitutionTypeLabel('unknown')).toBe('Other')
    })
  })

  describe('asset verification (bank logos)', () => {
    it('has an existing logo image for every institution that specifies a logo', () => {
      const allInstitutions = Object.values(institutionsByCountry).flat()
      const institutionsWithLogos = allInstitutions.filter((i) => Boolean(i.logo))

      expect(institutionsWithLogos.length).toBeGreaterThan(0)

      for (const inst of institutionsWithLogos) {
        expect(inst.logo).toMatch(/^\/banks\/[^/]+$/)
        const logoFileName = path.basename(inst.logo!)
        const logoFilePath = path.join(banksDir, logoFileName)
        expect(
          fs.existsSync(logoFilePath),
          `Bank logo missing for institution "${inst.id}" at ${logoFilePath}`,
        ).toBe(true)
      }
    })
  })
})
