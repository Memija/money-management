import { render } from '@testing-library/react'
import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import {
  BadenWuerttembergFlagLogo,
  BayernFlagLogo,
  BerlinFlagLogo,
  GERMAN_STATE_LOGOS,
  GERMAN_STATES,
  type GermanStateCode,
  GermanStateFlag,
  normalizeGermanStateCode,
} from './german-state-flags'
import { MERCHANT_LOGOS } from './merchant-logos'

describe('german-state-flags', () => {
  const expectedCodes: GermanStateCode[] = [
    'bw',
    'by',
    'be',
    'bb',
    'hb',
    'hh',
    'he',
    'mv',
    'ni',
    'nw',
    'rp',
    'sl',
    'sn',
    'st',
    'sh',
    'th',
  ]

  it('contains exactly the 16 official German federal states', () => {
    const keys = Object.keys(GERMAN_STATES)
    expect(keys).toHaveLength(16)
    for (const code of expectedCodes) {
      expect(GERMAN_STATES[code]).toBeDefined()
      expect(GERMAN_STATES[code].name.length).toBeGreaterThan(0)
      expect(GERMAN_STATES[code].nameDe.length).toBeGreaterThan(0)
    }
  })

  it('verifies all 16 SVG and PNG flag files exist on disk in public/flags/de', () => {
    for (const code of expectedCodes) {
      const meta = GERMAN_STATES[code]
      const svgPath = path.join(process.cwd(), 'public', meta.flagSvg.replace(/^\//, ''))
      const pngPath = path.join(process.cwd(), 'public', meta.flagPng.replace(/^\//, ''))

      expect(fs.existsSync(svgPath), `Missing SVG file for ${code}: ${svgPath}`).toBe(true)
      expect(fs.existsSync(pngPath), `Missing PNG file for ${code}: ${pngPath}`).toBe(true)
    }
  })

  it('maps all 16 state logos into GERMAN_STATE_LOGOS and MERCHANT_LOGOS', () => {
    for (const code of expectedCodes) {
      expect(GERMAN_STATE_LOGOS[code]).toBeDefined()
    }
    expect(MERCHANT_LOGOS.BayernFlagLogo).toBe(BayernFlagLogo)
    expect(MERCHANT_LOGOS.BerlinFlagLogo).toBe(BerlinFlagLogo)
    expect(MERCHANT_LOGOS.BadenWuerttembergFlagLogo).toBe(BadenWuerttembergFlagLogo)
  })

  it('normalizes various input formats to German state codes', () => {
    expect(normalizeGermanStateCode('he')).toBe('he')
    expect(normalizeGermanStateCode('HE')).toBe('he')
    expect(normalizeGermanStateCode('de-he')).toBe('he')
    expect(normalizeGermanStateCode('DE-BY')).toBe('by')
    expect(normalizeGermanStateCode('Bavaria')).toBe('by')
    expect(normalizeGermanStateCode('Bayern')).toBe('by')
    expect(normalizeGermanStateCode('Berlin')).toBe('be')
    expect(normalizeGermanStateCode('Hessen')).toBe('he')
    expect(normalizeGermanStateCode('invalid-unknown')).toBeUndefined()
  })

  it('renders GermanStateFlag and state flag logo components into the DOM', () => {
    const { container: byContainer } = render(<BayernFlagLogo size={24} />)
    const byImg = byContainer.querySelector('img')
    expect(byImg).toBeInTheDocument()
    expect(byImg).toHaveAttribute('src', '/flags/de/de-by.svg')
    expect(byImg).toHaveAttribute('alt', 'Bayern')

    const { container: genericContainer } = render(
      <GermanStateFlag state="Berlin" size={20} className="custom-flag" />,
    )
    const beImg = genericContainer.querySelector('img')
    expect(beImg).toBeInTheDocument()
    expect(beImg).toHaveAttribute('src', '/flags/de/de-be.svg')
    expect(beImg).toHaveAttribute('alt', 'Berlin')
  })
})
