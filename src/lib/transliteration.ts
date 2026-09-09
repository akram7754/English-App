/**
 * Multilingual Transliteration and RTL/LTR Formatting Helpers
 * Provides Roman/Latin phonetic pronunciations for Arabic and non-Latin scripts,
 * and detects text direction for accurate RTL rendering.
 */

// Arabic Unicode block regex
export const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Checks if a string contains Arabic script characters.
 */
export function containsArabic(text: string): boolean {
  return ARABIC_REGEX.test(text);
}

/**
 * Checks if a string should be displayed Right-To-Left (RTL).
 */
export function isRtlText(text: string): boolean {
  if (!text) return false;
  return containsArabic(text);
}

/**
 * Known conversational phrases dictionary for accurate Romanization.
 */
const COMMON_ARABIC_ROMANIZATIONS: Record<string, string> = {
  // Common greetings & questions
  "صباح الخير، كيف حالك اليوم؟": "Sabah al-khair, kaifa haluka al-yawm?",
  "صباح الخير، كيف حالك اليوم": "Sabah al-khair, kaifa haluka al-yawm?",
  "صباح الخير! كيف حالك اليوم؟": "Sabah al-khair! Kaifa haluka al-yawm?",
  "صباح الخير": "Sabah al-khair",
  "صباح النور": "Sabah an-noor",
  "مساء الخير": "Masa'a al-khair",
  "كيف حالك اليوم؟": "Kaifa haluka al-yawm?",
  "كيف حالك؟": "Kaifa haluka?",
  "كيف حالك": "Kaifa haluka",
  "أهلاً وسهلاً": "Ahlan wa sahlan",
  "أهلا بك": "Ahlan bika",
  "أهلاً بك": "Ahlan bika",
  "أهلاً بك! دعنا نبدأ التدريب على المقابلة الشخصية.": "Ahlan bika! Da'na nabda' at-tadrīb 'ala al-muqabala ash-shakhsiyya.",
  "في البداية، هل يمكنك التحدث عن نفسك باختصار؟": "Fi al-bidayah, hal yumkinuka at-tahadduth 'an nafsika bi-ikhtisar?",
  "أهلاً بك! دعنا نبدأ التدريب على المقابلة الشخصية. في البداية، هل يمكنك التحدث عن نفسك باختصار؟": "Ahlan bika! Da'na nabda' at-tadrīb 'ala al-muqabala ash-shakhsiyya. Fi al-bidayah, hal yumkinuka at-tahadduth 'an nafsika bi-ikhtisar?",
  "يسعدني سماع ذلك!": "Yas'uduni sama'u dhalik!",
  "كيف يمكنني مساعدتك اليوم؟": "Kaifa yumkinuni musa'adatuka al-yawm?",
  "يسعدني سماع ذلك! كيف يمكنني مساعدتك اليوم؟": "Yas'uduni sama'u dhalik! Kaifa yumkinuni musa'adatuka al-yawm?",
  "صباح الخير! يسعدني لقاؤك.": "Sabah al-khair! Yas'uduni liqa'uka.",
  "صباح الخير! يسعدني لقاؤك. كيف حالك اليوم؟": "Sabah al-khair! Yas'uduni liqa'uka. Kaifa haluka al-yawm?",
  "شكراً لإجابتك.": "Shukran li-ijabatika.",
  "هل يمكنك إخباري بالمزيد عن ذلك؟": "Hal yumkinuka ikhbari bil-mazid 'an dhalik?",
  "شكراً لإجابتك. هل يمكنك إخباري بالمزيد عن ذلك؟": "Shukran li-ijabatika. Hal yumkinuka ikhbari bil-mazid 'an dhalik?",
  "شكراً لك": "Shukran lak",
  "شكرا جزيلا": "Shukran jazeelan",
  "عفواً": "Afwan",
  "مع السلامة": "Ma'a as-salama",
  "إلى اللقاء": "Ila al-liqa'",
  "نعم": "Na'am",
  "لا": "La",
  "من فضلك": "Min fadlik",
  "لو سمحت": "Law samaht",
  "أنا بخير، شكراً لك": "Ana bi-khair, shukran lak",
  "أنا بخير": "Ana bi-khair",
  "الحمد لله": "Al-hamdulillah",
  "ما اسمك؟": "Ma ismuka?",
  "اسمي": "Ismi",
  "فرصة سعيدة": "Fursa sa'eedah",
  "بالتأكيد": "Bil-ta'keed",
  "ممتاز": "Mumtaz",
  "جيد جداً": "Jayyid jiddan",
};

/**
 * Phonetic Arabic letter mapping for Roman transliteration.
 */
const ARABIC_CHAR_MAP: Record<string, string> = {
  "ا": "a",
  "أ": "a",
  "إ": "i",
  "آ": "aa",
  "ب": "b",
  "ت": "t",
  "ث": "th",
  "ج": "j",
  "ح": "h",
  "خ": "kh",
  "د": "d",
  "ذ": "dh",
  "ر": "r",
  "ز": "z",
  "س": "s",
  "ش": "sh",
  "ص": "s",
  "ض": "d",
  "ط": "t",
  "ظ": "z",
  "ع": "'",
  "غ": "gh",
  "ف": "f",
  "ق": "q",
  "ك": "k",
  "ل": "l",
  "م": "m",
  "ن": "n",
  "ه": "h",
  "و": "w",
  "ي": "y",
  "ى": "a",
  "ة": "ah",
  "ء": "'",
  "ئ": "'",
  "ؤ": "'",
  "َ": "a",
  "ُ": "u",
  "ِ": "i",
  "ً": "an",
  "ٌ": "un",
  "ٍ": "in",
  "ّ": "",
  "ْ": "",
  "؟": "?",
  "،": ",",
  "؛": ";",
};

/**
 * Transliterates Arabic text into Roman/Latin phonetics.
 */
export function transliterateArabicToRoman(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();

  // 1. Direct dictionary match
  if (COMMON_ARABIC_ROMANIZATIONS[trimmed]) {
    return COMMON_ARABIC_ROMANIZATIONS[trimmed];
  }

  // 2. Check if a partial or punctuation-stripped match exists
  const stripped = trimmed.replace(/[؟.,!]/g, "").trim();
  if (COMMON_ARABIC_ROMANIZATIONS[stripped]) {
    const punc = trimmed.match(/[؟.,!]+$/)?.[0] === "؟" ? "?" : trimmed.match(/[.,!]+$/)?.[0] || "";
    return `${COMMON_ARABIC_ROMANIZATIONS[stripped]}${punc}`;
  }

  // 3. Word-by-word matching & character transliteration
  const words = trimmed.split(/(\s+|[،,؛;؟?]+)/);
  const resultWords = words.map((chunk) => {
    if (!chunk.trim()) return chunk;
    if (COMMON_ARABIC_ROMANIZATIONS[chunk]) {
      return COMMON_ARABIC_ROMANIZATIONS[chunk];
    }
    if (chunk === "الخير") return "al-khair";
    if (chunk === "اليوم") return "al-yawm";
    if (chunk === "حالك") return "haluka";
    if (chunk === "صباح") return "Sabah";
    if (chunk === "كيف") return "kaifa";

    // Handle "ال" prefix
    let w = chunk;
    let prefix = "";
    if (w.startsWith("ال")) {
      prefix = "al-";
      w = w.slice(2);
    }

    let roman = "";
    for (const ch of w) {
      roman += ARABIC_CHAR_MAP[ch] !== undefined ? ARABIC_CHAR_MAP[ch] : ch;
    }
    return prefix + roman;
  });

  const transliterated = resultWords.join("").trim();
  if (transliterated.length > 0) {
    return transliterated.charAt(0).toUpperCase() + transliterated.slice(1);
  }
  return transliterated;
}

/**
 * Returns Roman/Latin pronunciation for target text.
 */
export function getRomanizedPronunciation(text: string, langCode: string): string {
  if (!text) return "";
  if (langCode === "ar" || containsArabic(text)) {
    return transliterateArabicToRoman(text);
  }
  return "";
}
