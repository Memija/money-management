import { describe, expect, it } from 'vitest'

import { normalizeForSearch, transliterateCyrillicToLatin } from './string-utils'

describe('string-utils', () => {
  describe('transliterateCyrillicToLatin', () => {
    it('returns an empty string when given empty text', () => {
      expect(transliterateCyrillicToLatin('')).toBe('')
    })

    it('transliterates uppercase Cyrillic characters to Latin', () => {
      expect(transliterateCyrillicToLatin('БЕОГРАД')).toBe('BEOGRAD')
      expect(transliterateCyrillicToLatin('ЂОРЂЕ')).toBe('ĐORĐE')
      expect(transliterateCyrillicToLatin('ЋЕВАПИ')).toBe('ĆEVAPI')
    })

    it('transliterates lowercase Cyrillic characters to Latin', () => {
      expect(transliterateCyrillicToLatin('београд')).toBe('beograd')
      expect(transliterateCyrillicToLatin('ђорђе')).toBe('đorđe')
      expect(transliterateCyrillicToLatin('ћевапи')).toBe('ćevapi')
    })

    it('transliterates Cyrillic digraphs (Lj, Nj, Dž) correctly', () => {
      expect(transliterateCyrillicToLatin('Љиљана')).toBe('Ljiljana')
      expect(transliterateCyrillicToLatin('Њујорк')).toBe('Njujork')
      expect(transliterateCyrillicToLatin('Џамија')).toBe('Džamija')
      expect(transliterateCyrillicToLatin('љубав')).toBe('ljubav')
      expect(transliterateCyrillicToLatin('коњ')).toBe('konj')
      expect(transliterateCyrillicToLatin('џем')).toBe('džem')
    })

    it('transliterates all 30 Serbian Cyrillic alphabet letters', () => {
      const cyrillicAlphabetLower = 'абвгдђежзијклљмнњопрстћуфхцчџш'
      const expectedLatinLower = 'abvgdđežzijklljmnnjoprstćufhcčdžš'
      expect(transliterateCyrillicToLatin(cyrillicAlphabetLower)).toBe(expectedLatinLower)
    })

    it('leaves Latin characters untouched', () => {
      expect(transliterateCyrillicToLatin('Hello World!')).toBe('Hello World!')
      expect(transliterateCyrillicToLatin('Sarajevo, Bosna')).toBe('Sarajevo, Bosna')
    })

    it('handles mixed Cyrillic, Latin, numbers, and symbols', () => {
      expect(transliterateCyrillicToLatin('Тест 123: test #45!')).toBe('Test 123: test #45!')
    })
  })

  describe('normalizeForSearch', () => {
    it('returns an empty string when given empty text', () => {
      expect(normalizeForSearch('')).toBe('')
    })

    it('converts text to lowercase', () => {
      expect(normalizeForSearch('HELLO WORLD')).toBe('hello world')
      expect(normalizeForSearch('Kupovina')).toBe('kupovina')
    })

    it('removes common South Slavic Latin diacritics (č, ć, š, ž)', () => {
      expect(normalizeForSearch('Čaša')).toBe('casa')
      expect(normalizeForSearch('Ćevapi')).toBe('cevapi')
      expect(normalizeForSearch('Šuma')).toBe('suma')
      expect(normalizeForSearch('Život')).toBe('zivot')
      expect(normalizeForSearch('ČŠŽĆčšžć')).toBe('cszccszc')
    })

    it('replaces "đ" and "Đ" with "dj"', () => {
      expect(normalizeForSearch('Đorđe')).toBe('djordje')
      expect(normalizeForSearch('đurđevak')).toBe('djurdjevak')
      expect(normalizeForSearch('međa')).toBe('medja')
    })

    it('normalizes Cyrillic strings into search-friendly ASCII Latin', () => {
      expect(normalizeForSearch('Београд')).toBe('beograd')
      expect(normalizeForSearch('Ђорђе')).toBe('djordje')
      expect(normalizeForSearch('Ћевапи')).toBe('cevapi')
      expect(normalizeForSearch('Шабац')).toBe('sabac')
      expect(normalizeForSearch('Жељко')).toBe('zeljko')
      expect(normalizeForSearch('Џем')).toBe('dzem')
    })

    it('normalizes European accented Latin characters', () => {
      expect(normalizeForSearch('Café')).toBe('cafe')
      expect(normalizeForSearch('Über')).toBe('uber')
      expect(normalizeForSearch('Niño')).toBe('nino')
    })

    it('preserves numbers, spaces, and punctuation', () => {
      expect(normalizeForSearch('  Račun & Плаћање 100€  ')).toBe('  racun & placanje 100€  ')
    })
  })
})
