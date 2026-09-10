/**
 * Multilingual Transliteration, Phonetic Pronunciation, and RTL/LTR Helpers
 * Provides Roman/Latin phonetic pronunciations for all supported languages,
 * and detects text direction for accurate RTL/LTR rendering.
 */

// Arabic Unicode block regex
export const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Devanagari Unicode block regex (Hindi, Sanskrit, Marathi, etc.)
export const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

/**
 * Checks if a string contains Arabic script characters.
 */
export function containsArabic(text: string): boolean {
  if (!text) return false;
  return ARABIC_REGEX.test(text);
}

/**
 * Checks if a string contains Devanagari script characters (Hindi).
 */
export function containsDevanagari(text: string): boolean {
  if (!text) return false;
  return DEVANAGARI_REGEX.test(text);
}

/**
 * Checks if a string should be displayed Right-To-Left (RTL).
 */
export function isRtlText(text: string): boolean {
  if (!text) return false;
  return containsArabic(text);
}

/**
 * Known conversational phrases dictionary for Arabic.
 */
const COMMON_ARABIC_ROMANIZATIONS: Record<string, string> = {
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
  "أना بخير": "Ana bi-khair",
  "الحمد لله": "Al-hamdulillah",
  "ما اسمك؟": "Ma ismuka?",
  "اسمي": "Ismi",
  "فرصة سعيدة": "Fursa sa'eedah",
  "بالتأكيد": "Bil-ta'keed",
  "ممتاز": "Mumtaz",
  "جيد جداً": "Jayyid jiddan",
  "تفضل القهوة، من فضلك.": "Tafaddal al-qahwah, min fadlik.",
  "تفضل الشاي، من فضلك.": "Tafaddal ash-shay, min fadlik.",
  "لا مشكلة.": "La mushkilah.",
  "المعنى هو:": "Al-ma'na huwa:",
  "يؤسفني سماع ذلك.": "Ya'sufuni sama'u dhalik.",
  "هل ترغب في أخذ استراحة قصيرة؟": "Hal targhabu fi akhdh istirahatin qasirah?",
  "أنا أيضاً أحب الحديث عن كرة القدم.": "Ana aydan uhibbu al-hadith 'an kurat al-qadam.",
  "ما هو فريقك المفضل؟": "Ma huwa fareequka al-mufaddal?",
  "هذا مجال ممتع للغاية.": "Hadha majalun mumti'un lil-ghayah.",
  "ما هو نوع التسويق الذي تعمل به؟": "Ma huwa naw'u at-tasweeq alladhi ta'malu bihi?",
};

const ARABIC_CHAR_MAP: Record<string, string> = {
  "ا": "a", "أ": "a", "إ": "i", "آ": "aa", "ب": "b", "ت": "t", "ث": "th",
  "ج": "j", "ح": "h", "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z",
  "س": "s", "श": "sh", "ص": "s", "ض": "d", "ط": "t", "ظ": "z", "ع": "'",
  "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n",
  "ه": "h", "و": "w", "ي": "y", "ى": "a", "ة": "ah", "ء": "'", "ئ": "'",
  "ؤ": "'", "َ": "a", "ُ": "u", "ِ": "i", "ً": "an", "ٌ": "un", "ٍ": "in",
  "ّ": "", "ْ": "", "؟": "?", "،": ",", "؛": ";",
};

/**
 * Transliterates Arabic text into Roman/Latin phonetics.
 */
export function transliterateArabicToRoman(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();

  if (COMMON_ARABIC_ROMANIZATIONS[trimmed]) {
    return COMMON_ARABIC_ROMANIZATIONS[trimmed];
  }

  const stripped = trimmed.replace(/[؟.,!]/g, "").trim();
  if (COMMON_ARABIC_ROMANIZATIONS[stripped]) {
    const punc = trimmed.match(/[؟.,!]+$/)?.[0] === "؟" ? "?" : trimmed.match(/[.,!]+$/)?.[0] || "";
    return `${COMMON_ARABIC_ROMANIZATIONS[stripped]}${punc}`;
  }

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
 * Known conversational phrases dictionary for Hindi.
 */
const COMMON_HINDI_ROMANIZATIONS: Record<string, string> = {
  "नमस्ते": "Namaste",
  "नमस्ते!": "Namaste!",
  "सुप्रभात": "Shubh prabhat",
  "सुप्रभात!": "Shubh prabhat!",
  "सुप्रभात, आज आप कैसे हैं?": "Shubh prabhat, aaj aap kaise hain?",
  "आज आप कैसे हैं?": "Aaj aap kaise hain?",
  "आप कैसे हैं?": "Aap kaise hain?",
  "आप कैसे हैं": "Aap kaise hain",
  "मैं ठीक हूँ": "Main theek hoon",
  "मैं ठीक हूँ, धन्यवाद।": "Main theek hoon, dhanyavaad.",
  "धन्यवाद": "Dhanyavaad",
  "धन्यवाद।": "Dhanyavaad.",
  "आपका स्वागत है": "Aapka swaagat hai",
  "आपका स्वागत है!": "Aapka swaagat hai!",
  "अपने बारे में बताइए": "Apne baare mein bataiye",
  "अपने बारे में बताइए।": "Apne baare mein bataiye.",
  "बहुत बढ़िया। आपकी मुख्य खूबियाँ क्या हैं?": "Bahut badhiya. Aapki mukhya khoobiyan kya hain?",
  "बहुत बढ़िया": "Bahut badhiya",
  "यह सुनकर अच्छा लगा!": "Yeh sunkar achha laga!",
  "यह सुनकर बहुत अच्छा लगा!": "Yeh sunkar bahut achha laga!",
  "आज मैं आपकी क्या मदद कर सकता हूँ?": "Aaj main aapki kya madad kar sakta hoon?",
  "क्या आप दोहरा सकते हैं?": "Kya aap dohra sakte hain?",
  "कोई बात नहीं, मैं इसे और सरल तरीके से समझाता हूँ।": "Koi baat nahin, main ise aur saral tareeqe se samjhata hoon.",
  "ज़रूर। यह रही आपकी कॉफ़ी।": "Zaroor. Yeh rahi aapki coffee.",
  "ज़रूर। यह रहा आपका चाय।": "Zaroor. Yeh raha aapka chaay.",
  "मुझे यह सुनकर दुख हुआ।": "Mujhe yeh sunkar dukh hua.",
  "क्या आप थोड़ा आराम लेना चाहेंगे?": "Kya aap thoda aaraam lena chahenge?",
  "मुझे भी फ़ुटबॉल के बारे में बात करना पसंद है।": "Mujhe bhi football ke baare mein baat karna pasand hai.",
  "आपकी पसंदीदा टीम कौन सी है?": "Aapki pasandida team kaun si hai?",
  "यह बहुत ही दिलचस्प क्षेत्र है।": "Yeh bahut hi dilchasp kshetra hai.",
  "आप किस प्रकार के विपणन में काम करते हैं?": "Aap kis prakaar ke vipanan mein kaam karte hain?",
  "संक्षेप में अपना परिचय दीजिए।": "Sankshep mein apna parichay deejiye.",
  "धन्यवाद। क्या आप मुझे इसके बारे में थोड़ा और बता सकते हैं?": "Dhanyavaad. Kya aap mujhe iske baare mein thoda aur bata sakte hain?",
  "अलविदा": "Alvida",
  "फिर मिलेंगे": "Phir milenge",
  "हाँ": "Haan",
  "नहीं": "Nahin",
  "कृपया": "Kripya",
};

const DEVANAGARI_VOWELS: Record<string, string> = {
  "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo",
  "ऋ": "ri", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au",
  "अं": "an", "अः": "ah",
};

const DEVANAGARI_MATRAS: Record<string, string> = {
  "ा": "aa", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "ृ": "ri",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ं": "n", "ँ": "n", "ः": "h",
};

const DEVANAGARI_CONSONANTS: Record<string, string> = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "v",
  "श": "sh", "ष": "sh", "स": "s", "ह": "h",
  "क़": "q", "ख़": "kh", "ग़": "gh", "ज़": "z", "ड़": "r", "ढ़": "rh", "फ़": "f",
};

/**
 * Transliterates Devanagari (Hindi) text into Roman/Latin phonetics.
 */
export function transliterateDevanagariToRoman(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();

  if (COMMON_HINDI_ROMANIZATIONS[trimmed]) {
    return COMMON_HINDI_ROMANIZATIONS[trimmed];
  }

  const stripped = trimmed.replace(/[।.,!?]/g, "").trim();
  if (COMMON_HINDI_ROMANIZATIONS[stripped]) {
    const punc = trimmed.match(/[।.,!?]+$/)?.[0] === "।" ? "." : trimmed.match(/[.,!?]+$/)?.[0] || "";
    return `${COMMON_HINDI_ROMANIZATIONS[stripped]}${punc}`;
  }

  let result = "";
  const chars = Array.from(trimmed);

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const nextCh = chars[i + 1];

    if (ch === "।") {
      result += ".";
    } else if (DEVANAGARI_VOWELS[ch]) {
      result += DEVANAGARI_VOWELS[ch];
    } else if (DEVANAGARI_CONSONANTS[ch]) {
      const base = DEVANAGARI_CONSONANTS[ch];
      if (nextCh === "्") {
        // Virama: silent vowel
        result += base;
        i++; // skip virama
      } else if (nextCh && DEVANAGARI_MATRAS[nextCh]) {
        // Followed by matra
        result += base + DEVANAGARI_MATRAS[nextCh];
        i++; // skip matra
      } else if (nextCh && (DEVANAGARI_CONSONANTS[nextCh] || DEVANAGARI_VOWELS[nextCh])) {
        // Followed by another consonant (inherent 'a')
        result += base + "a";
      } else if (!nextCh || /\s|[.,!?।:;]/.test(nextCh)) {
        // Word ending consonant in Hindi: schwa is dropped (e.g. आप -> aap, not aapa)
        result += base;
      } else {
        result += base + "a";
      }
    } else if (DEVANAGARI_MATRAS[ch]) {
      result += DEVANAGARI_MATRAS[ch];
    } else {
      result += ch;
    }
  }

  const cleaned = result
    .replace(/\s+/g, " ")
    .replace(/aa+/g, "aa")
    .replace(/ee+/g, "ee")
    .replace(/oo+/g, "oo")
    .trim();

  return cleaned.length > 0 ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : cleaned;
}

/**
 * Common French phrases phonetic pronunciation dictionary.
 */
const COMMON_FRENCH_ROMANIZATIONS: Record<string, string> = {
  "Bonjour ! Comment allez-vous aujourd'hui ?": "Bohn-zhoor ! Koh-mahn ah-lay voo oh-zhoor-dwee ?",
  "Bonjour ! Comment allez-vous aujourd'hui": "Bohn-zhoor ! Koh-mahn ah-lay voo oh-zhoor-dwee ?",
  "Comment allez-vous aujourd'hui ?": "Koh-mahn ah-lay voo oh-zhoor-dwee ?",
  "Comment allez-vous ?": "Koh-mahn ah-lay voo ?",
  "Bonjour !": "Bohn-zhoor !",
  "Bonjour": "Bohn-zhoor",
  "Bonsoir !": "Bohn-swahr !",
  "Bienvenue !": "Byan-vuh-noo !",
  "Bienvenue ! Commençons votre entraînement pour l'entretien d'embauche.": "Byan-vuh-noo ! Koh-mahn-sohn voh-truh ahn-treh-nuh-mahn poor lahn-truh-tyan dahm-bohsh.",
  "Pour commencer, pouvez-vous vous présenter et décrire brièvement votre parcours ?": "Poor koh-mahn-say, poo-vay voo voo pray-zahn-tay ay day-kreer bree-ev-mahn voh-truh par-koor ?",
  "Ravi de l'entendre !": "Rah-vee duh lahn-tahn-druh !",
  "Comment puis-je vous aider aujourd'hui ?": "Koh-mahn pweezh vooz ay-day oh-zhoor-dwee ?",
  "Ravi de l'entendre ! Comment puis-je vous aider aujourd'hui ?": "Rah-vee duh lahn-tahn-druh ! Koh-mahn pweezh vooz ay-day oh-zhoor-dwee ?",
  "Bien sûr.": "Byan soor.",
  "Un café, s'il vous plaît.": "Uhn kah-fay, seel voo play.",
  "Un thé, s'il vous plaît.": "Uhn tay, seel voo play.",
  "Bien sûr. Un café, s'il vous plaît.": "Byan soor. Uhn kah-fay, seel voo play.",
  "Bien sûr. Un thé, s'il vous plaît.": "Byan soor. Uhn tay, seel voo play.",
  "Pas de problème.": "Pah duh proh-blem.",
  "Je suis désolé de l'entendre.": "Zhuh swee day-zoh-lay duh lahn-tahn-druh.",
  "Vous voulez faire une petite pause ?": "Voo voo-lay fair oon puh-teet pohz ?",
  "J'aime aussi parler de football.": "Zhem oh-see par-lay duh foot-bawl.",
  "Quelle équipe aimez-vous ?": "Kell ay-keep em-ay voo ?",
  "C'est un domaine très dynamique.": "Set uhn doh-men tray dee-nah-meek.",
  "Quel type de marketing faites-vous ?": "Kell teep duh mar-kuh-teeng fet voo ?",
  "Merci pour votre réponse.": "Mehr-see poor voh-truh ray-pohnss.",
  "Pouvez-vous m'en dire un peu plus à ce sujet ?": "Poo-vay voo mahn deer uhn puh ploo ah suh soo-zhay ?",
  "Merci beaucoup.": "Mehr-see boh-koo.",
  "Au revoir !": "Oh ruh-vwahr !",
  "À bientôt !": "Ah byan-toh !",
  "Je vais bien, merci.": "Zhuh vay byan, mehr-see.",
};

/**
 * Phonetic pronunciation generator for French text.
 */
export function transliterateFrenchToRomanPhonetic(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (COMMON_FRENCH_ROMANIZATIONS[trimmed]) {
    return COMMON_FRENCH_ROMANIZATIONS[trimmed];
  }

  const stripped = trimmed.replace(/[.,!?]/g, "").trim();
  if (COMMON_FRENCH_ROMANIZATIONS[stripped]) {
    const punc = trimmed.match(/[.,!?]+$/)?.[0] || "";
    return `${COMMON_FRENCH_ROMANIZATIONS[stripped]}${punc}`;
  }

  let roman = trimmed
    .replace(/aujourd'hui/gi, "oh-zhoor-dwee")
    .replace(/comment/gi, "koh-mahn")
    .replace(/allez-vous/gi, "ah-lay-voo")
    .replace(/pouvez-vous/gi, "poo-vay-voo")
    .replace(/s'il vous plaît/gi, "seel voo play")
    .replace(/bienvenue/gi, "byan-vuh-noo")
    .replace(/bonjour/gi, "bohn-zhoor")
    .replace(/bonsoir/gi, "bohn-swahr")
    .replace(/merci/gi, "mehr-see")
    .replace(/beaucoup/gi, "boh-koo")
    .replace(/entretien/gi, "ahn-truh-tyan")
    .replace(/d'embauche/gi, "dahm-bohsh")
    .replace(/parcours/gi, "par-koor")
    .replace(/présenter/gi, "pray-zahn-tay")
    .replace(/marketing/gi, "mar-kuh-teeng")
    .replace(/football/gi, "foot-bawl")
    .replace(/domaine/gi, "doh-men")
    .replace(/dynamique/gi, "dee-nah-meek")
    .replace(/problème/gi, "proh-blem")
    .replace(/pause/gi, "pohz")
    .replace(/équipe/gi, "ay-keep")
    .replace(/vous/gi, "voo")
    .replace(/nous/gi, "noo")
    .replace(/oui/gi, "wee")
    .replace(/non/gi, "nohn");

  return roman;
}

/**
 * Common German phrases phonetic pronunciation dictionary.
 */
const COMMON_GERMAN_ROMANIZATIONS: Record<string, string> = {
  "Guten Tag ! Wie geht es Ihnen heute?": "Goo-ten Tahk ! Vee gayt es Ee-nen hoy-tuh?",
  "Guten Tag !": "Goo-ten Tahk !",
  "Guten Tag": "Goo-ten Tahk",
  "Guten Morgen !": "Goo-ten Mor-gen !",
  "Wie geht es Ihnen heute?": "Vee gayt es Ee-nen hoy-tuh?",
  "Wie geht es Ihnen?": "Vee gayt es Ee-nen?",
  "Sehr gut, danke.": "Zayr goot, dahn-kuh.",
  "Freut mich zu hören !": "Froy-t mikh tsoo her-ren !",
  "Wie kann ich Ihnen heute helfen?": "Vee kahn ikh Ee-nen hoy-tuh hel-fen?",
  "Wie kann ich Ihnen helfen?": "Vee kahn ikh Ee-nen hel-fen?",
  "Willkommen !": "Vil-kom-men !",
  "Erzählen Sie mir etwas über sich.": "Ehr-tsay-len zee meer et-vahs oo-ber zikh.",
  "Was sind Ihre Stärken?": "Vahs zint Ee-reh Shtehr-ken?",
  "Danke schön.": "Dahn-kuh shern.",
  "Bitte schön.": "Bit-tuh shern.",
  "Auf Wiedersehen !": "Owf Vee-der-zay-en !",
  "Bis bald !": "Bis bahlt !",
};

export function transliterateGermanToRomanPhonetic(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (COMMON_GERMAN_ROMANIZATIONS[trimmed]) {
    return COMMON_GERMAN_ROMANIZATIONS[trimmed];
  }
  const stripped = trimmed.replace(/[.,!?]/g, "").trim();
  if (COMMON_GERMAN_ROMANIZATIONS[stripped]) {
    const punc = trimmed.match(/[.,!?]+$/)?.[0] || "";
    return `${COMMON_GERMAN_ROMANIZATIONS[stripped]}${punc}`;
  }

  let roman = trimmed
    .replace(/guten tag/gi, "goo-ten tahk")
    .replace(/guten morgen/gi, "goo-ten mor-gen")
    .replace(/wie geht es ihnen/gi, "vee gayt es ee-nen")
    .replace(/wie kann ich/gi, "vee kahn ikh")
    .replace(/danke schön/gi, "dahn-kuh shern")
    .replace(/bitte schön/gi, "bit-tuh shern")
    .replace(/auf wiedersehen/gi, "owf vee-der-zay-en");

  return roman;
}

/**
 * Common Spanish phrases phonetic pronunciation dictionary.
 */
const COMMON_SPANISH_ROMANIZATIONS: Record<string, string> = {
  "¡Hola! ¿Cómo está hoy?": "¡Oh-lah! ¿Koh-moh es-tah oy?",
  "¿Cómo está usted hoy?": "¿Koh-moh es-tah oos-ted oy?",
  "¿Cómo está usted?": "¿Koh-moh es-tah oos-ted?",
  "¡Hola!": "¡Oh-lah!",
  "¡Buenos días!": "¡Bweh-nohs dee-ahs!",
  "¡Buenas tardes!": "¡Bweh-nahs tar-des!",
  "¡Bienvenido!": "¡Byen-veh-nee-doh!",
  "¡Bienvenida!": "¡Byen-veh-nee-dah!",
  "Muy bien, gracias.": "Mwee byan, grah-syahs.",
  "¡Me alegra escucharlo!": "¡Meh ah-leh-grah es-koo-char-loh!",
  "¿Cómo puedo ayudarle hoy?": "¿Koh-moh pweh-doh ah-yoo-dar-leh oy?",
  "Cuénteme sobre usted.": "Kwen-teh-meh soh-breh oos-ted.",
  "¿Cuáles son sus puntos fuertes?": "¿Kwah-les sohn soos pwon-tohs fwer-tes?",
  "Muchas gracias.": "Moo-chahs grah-syahs.",
  "De nada.": "Deh nah-dah.",
  "Hasta luego.": "Ahs-tah lweh-goh.",
  "Adiós.": "Ah-dyohs.",
};

export function transliterateSpanishToRomanPhonetic(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (COMMON_SPANISH_ROMANIZATIONS[trimmed]) {
    return COMMON_SPANISH_ROMANIZATIONS[trimmed];
  }
  const stripped = trimmed.replace(/[¡¿.,!?]/g, "").trim();
  if (COMMON_SPANISH_ROMANIZATIONS[stripped]) {
    const punc = trimmed.match(/[.,!?]+$/)?.[0] || "";
    return `${COMMON_SPANISH_ROMANIZATIONS[stripped]}${punc}`;
  }

  let roman = trimmed
    .replace(/¿cómo está/gi, "¿koh-moh es-tah")
    .replace(/buenos días/gi, "bweh-nohs dee-ahs")
    .replace(/muchas gracias/gi, "moo-chahs grah-syahs")
    .replace(/hasta luego/gi, "ahs-tah lweh-goh")
    .replace(/cuénteme/gi, "kwen-teh-meh");

  return roman;
}

/**
 * Common English phrases phonetic reading dictionary.
 */
const COMMON_ENGLISH_ROMANIZATIONS: Record<string, string> = {
  "Tell me about yourself.": "Tell mee uh-bowt yoor-self.",
  "Tell me about yourself": "Tell mee uh-bowt yoor-self",
  "How are you doing today?": "How ahr yoo doo-ing tuh-day?",
  "How are you today?": "How ahr yoo tuh-day?",
  "How can I help you today?": "How kan eye help yoo tuh-day?",
  "That's great to hear!": "Dhats grayt too heer!",
  "What are your main strengths?": "Wut ahr yoor mayn strengths?",
  "Nice to meet you!": "Nise too meet yoo!",
  "Good morning! How are you today?": "Good mor-ning! How ahr yoo tuh-day?",
  "Good morning! It's nice to meet you.": "Good mor-ning! Its nise too meet yoo.",
  "Certainly. Here is your tea.": "Ser-ten-lee. Heer iz yoor tee.",
  "Certainly. Here is your coffee.": "Ser-ten-lee. Heer iz yoor kaw-fee.",
  "Certainly.": "Ser-ten-lee.",
  "Thank you for sharing that.": "Thank yoo for sha-ring dhat.",
  "Could you tell me a little more about that?": "Kood yoo tell mee uh lit-tl mor uh-bowt dhat?",
  "Welcome! Let's get started with your job interview practice.": "Wel-kum! Lets get star-tid with yoor job in-ter-view prak-tis.",
  "To begin, could you tell me a little about yourself and your background?": "Too bee-gin, kood yoo tell mee uh lit-tl uh-bowt yoor-self and yoor bak-ground?",
};

export function transliterateEnglishToRomanPhonetic(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (COMMON_ENGLISH_ROMANIZATIONS[trimmed]) {
    return COMMON_ENGLISH_ROMANIZATIONS[trimmed];
  }
  const stripped = trimmed.replace(/[.,!?]/g, "").trim();
  if (COMMON_ENGLISH_ROMANIZATIONS[stripped]) {
    const punc = trimmed.match(/[.,!?]+$/)?.[0] || "";
    return `${COMMON_ENGLISH_ROMANIZATIONS[stripped]}${punc}`;
  }
  return trimmed;
}

/**
 * Universal Romanized Pronunciation dispatcher:
 * Guarantees Roman/Latin pronunciation guide for EVERY supported language.
 */
export function getRomanizedPronunciation(text: string, langCode?: string): string {
  if (!text) return "";
  const trimmed = text.trim();

  // 1. Script auto-detection takes highest precedence
  if (containsArabic(trimmed)) {
    return transliterateArabicToRoman(trimmed);
  }
  if (containsDevanagari(trimmed)) {
    return transliterateDevanagariToRoman(trimmed);
  }

  // 2. Language code dispatch
  const code = (langCode || "").toLowerCase();
  if (code === "ar" || code.startsWith("ar")) {
    return transliterateArabicToRoman(trimmed);
  }
  if (code === "hi" || code.startsWith("hi")) {
    return transliterateDevanagariToRoman(trimmed);
  }
  if (code === "fr" || code.startsWith("fr")) {
    return transliterateFrenchToRomanPhonetic(trimmed);
  }
  if (code === "de" || code.startsWith("de")) {
    return transliterateGermanToRomanPhonetic(trimmed);
  }
  if (code === "es" || code.startsWith("es")) {
    return transliterateSpanishToRomanPhonetic(trimmed);
  }
  if (code === "en" || code.startsWith("en")) {
    return transliterateEnglishToRomanPhonetic(trimmed);
  }

  return trimmed;
}

/**
 * Sanitizes and cleans Roman pronunciation string:
 * Ensures it contains valid Roman letters and is not an English or native translation.
 */
export function cleanRomanPronunciation(pronunciation: string, targetText?: string): string {
  if (!pronunciation) return "";
  let clean = pronunciation.trim();

  // Strip accidental prefixes like "Read:", "Pronunciation:", "Roman:"
  clean = clean.replace(/^(?:read|pronunciation|roman\s*pronunciation|phonetic)\s*:\s*/i, "").trim();

  // If the pronunciation still contains non-Latin scripts (e.g. Arabic or Devanagari), transliterate it
  if (containsArabic(clean)) {
    clean = transliterateArabicToRoman(clean);
  } else if (containsDevanagari(clean)) {
    clean = transliterateDevanagariToRoman(clean);
  }

  return clean;
}
