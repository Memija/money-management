const cyrillicToLatinMap: Record<string, string> = {
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Ђ': 'Đ', 'Е': 'E', 'Ж': 'Ž', 'З': 'Z', 'И': 'I',
  'Ј': 'J', 'К': 'K', 'Л': 'L', 'Љ': 'Lj', 'М': 'M', 'Н': 'N', 'Њ': 'Nj', 'О': 'O', 'П': 'P', 'Р': 'R',
  'С': 'S', 'Т': 'T', 'Ћ': 'Ć', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Č', 'Џ': 'Dž', 'Ш': 'Š',
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'ђ': 'đ', 'е': 'e', 'ж': 'ž', 'з': 'z', 'и': 'i',
  'ј': 'j', 'к': 'k', 'л': 'l', 'љ': 'lj', 'м': 'm', 'н': 'n', 'њ': 'nj', 'о': 'o', 'п': 'p', 'р': 'r',
  'с': 's', 'т': 't', 'ћ': 'ć', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'č', 'џ': 'dž', 'ш': 'š'
};

/**
 * Transliterates Cyrillic characters to Latin.
 */
export function transliterateCyrillicToLatin(text: string): string {
  if (!text) return '';
  return text.split('').map(char => cyrillicToLatinMap[char] || char).join('');
}

/**
 * Normalizes text for search by:
 * 1. Transliterating Cyrillic to Latin
 * 2. Converting special characters (đ -> dj)
 * 3. Removing diacritics (č -> c, š -> s, etc.)
 * 4. Lowercasing
 */
export function normalizeForSearch(text: string): string {
  if (!text) return '';

  let latin = transliterateCyrillicToLatin(text);

  // Handle 'đ' separately as NFD normalization doesn't decompose it to 'd'
  latin = latin.replace(/đ/g, 'dj').replace(/Đ/g, 'Dj');

  return latin
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
