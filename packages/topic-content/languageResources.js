/**
 * Official translated information for the language topics: the pages the NDIS and My Aged Care themselves publish
 * in or about each language. Each link was opened in a browser on 15 October 2026 and returned the page named
 * (NDIS: https://www.ndis.gov.au/languages, My Aged Care: https://www.myagedcare.gov.au/translated).
 *
 * Only languages those two lists name are here. A language missing from this file has no page on either list,
 * which is not the same as having no translated material anywhere, so pages for those say nothing about it.
 * `native` is how the agency itself writes the language name. Re-open the links in a real browser when updating:
 * both sites refuse scripted requests.
 */
export const LANGUAGE_RESOURCES_CHECKED = '15 October 2026';

const NDIS = 'https://www.ndis.gov.au';
const MAC = 'https://www.myagedcare.gov.au';

const ndis = (path, label, native) => ({ agency: 'NDIS', label, href: `${NDIS}${path}`, ...(native ? { native } : {}) });
const mac = (path, label, native) => ({ agency: 'My Aged Care', label, href: `${MAC}${path}`, ...(native ? { native } : {}) });

const CHINESE_NDIS = [
  ndis('/contact/ndis-chinese-simplified', 'NDIS in Chinese (Simplified)', '简体中文'),
  ndis('/contact/ndis-chinese-traditional', 'NDIS in Chinese (Traditional)', '繁體中文'),
];
const CHINESE_MAC = [
  mac('/zh-hans/chinese-simplified', 'My Aged Care in Chinese (Simplified)', '简体中文'),
  mac('/zh-hant/chinese-traditional', 'My Aged Care in Chinese (Traditional)', '繁體中文'),
];

export const LANGUAGE_RESOURCES = {
  arabic: [ndis('/ndis-arabic', 'NDIS in Arabic', 'العربية'), mac('/ar/arabic', 'My Aged Care in Arabic', 'العربية')],
  mandarin: [...CHINESE_NDIS, ...CHINESE_MAC],
  cantonese: [...CHINESE_NDIS, ...CHINESE_MAC],
  vietnamese: [ndis('/ndis-vietnamese', 'NDIS in Vietnamese', 'Tiếng Việt'), mac('/vi/vietnamese', 'My Aged Care in Vietnamese', 'Tiếng Việt')],
  greek: [mac('/el/greek', 'My Aged Care in Greek', 'Ελληνικά')],
  italian: [mac('/it/italian', 'My Aged Care in Italian', 'Italiano')],
  hindi: [mac('/hi/hindi', 'My Aged Care in Hindi', 'हिन्दी')],
  punjabi: [mac('/pa/punjabi', 'My Aged Care in Punjabi', 'ਪੰਜਾਬੀ')],
  assyrian: [ndis('/contact/ndis-assyrian', 'NDIS in Assyrian', 'ܐܵܬܘܿܪܵܝܵܐ')],
  'persian-farsi': [ndis('/ndis-farsi', 'NDIS in Farsi', 'فارسی'), mac('/fa/persian', 'My Aged Care in Persian (Farsi)', 'فارسی')],
  dari: [ndis('/contact/ndis-dari', 'NDIS in Dari', 'دری')],
  turkish: [mac('/tr/turkish', 'My Aged Care in Turkish', 'Türkçe')],
  somali: [ndis('/ndis-somali', 'NDIS in Somali')],
  swahili: [ndis('/ndis-swahili', 'NDIS in Swahili')],
  spanish: [mac('/es/spanish', 'My Aged Care in Spanish', 'Español')],
  portuguese: [mac('/pt/portuguese', 'My Aged Care in Portuguese', 'Português')],
  croatian: [mac('/hr/croatian', 'My Aged Care in Croatian', 'Hrvatski')],
  serbian: [mac('/sr/serbian', 'My Aged Care in Serbian', 'Српски')],
  russian: [mac('/ru/russian', 'My Aged Care in Russian', 'Русский')],
  macedonian: [mac('/mk/macedonian', 'My Aged Care in Macedonian', 'Македонски')],
  tagalog: [mac('/tl/tagalog', 'My Aged Care in Tagalog')],
  indonesian: [mac('/id/indonesian', 'My Aged Care in Indonesian', 'Bahasa Indonesia')],
  korean: [ndis('/contact/ndis-korean', 'NDIS in Korean', '한국어'), mac('/ko/korean', 'My Aged Care in Korean', '한국어')],
  nepali: [ndis('/ndis-nepali', 'NDIS in Nepali'), mac('/ne/nepali', 'My Aged Care in Nepali', 'नेपाली')],
  thai: [mac('/th/thai', 'My Aged Care in Thai', 'ภาษาไทย')],
  khmer: [ndis('/contact/ndis-khmer', 'NDIS in Khmer', 'ភាសាខ្មែរ')],
  auslan: [ndis('/information-auslan', 'NDIS information in Auslan (videos)')],
};

/** The agencies that publish in the language, e.g. "the NDIS and My Aged Care" (lower case; capitalise at a sentence start). */
export function languageResourceAgencies(slug) {
  const list = LANGUAGE_RESOURCES[slug] ?? [];
  const names = [...new Set(list.map((item) => (item.agency === 'NDIS' ? 'the NDIS' : item.agency)))];
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] ?? '';
}
