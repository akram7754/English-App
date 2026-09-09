import { containsArabic, getRomanizedPronunciation } from "./transliteration";

export interface SpeakingScoreBreakdown {
  overall: number; // 0-100 weighted
  grammar: number; // 0-100
  fluency: number; // 0-100
  vocabulary: number; // 0-100
  pronunciation: number; // 0-100 (AI Pronunciation Guidance / Estimate)
  status: "Excellent" | "Good" | "Needs Practice";
}

export interface TargetComparison {
  target: string;
  actual: string;
  matchedWords: string[];
  omittedWords: string[];
  insertedWords: string[];
  substitutedWords: Array<{ expected: string; spoken: string }>;
  differences: string[];
  correctedSentence: string;
  targetTokens: Array<{ word: string; status: "match" | "omitted" | "substituted" }>;
  spokenTokens: Array<{ word: string; status: "match" | "inserted" | "substituted" }>;
}

export interface PronunciationGuidanceItem {
  word: string;
  phonetic: string;
  tip: string;
  audioTarget: string;
}

export interface SpeakingFeedback {
  whatWentWell: string[];
  whatToImprove: string[];
  correctedSentence: string;
  practiceTip: string;
}

export interface SpeakingEvaluationResult {
  scores: SpeakingScoreBreakdown;
  comparison: TargetComparison;
  pronunciationGuidance: PronunciationGuidanceItem[];
  feedback: SpeakingFeedback;
  recommendation: {
    title: string;
    description: string;
    href: string;
    actionLabel: string;
  };
  disclaimer: string;
}

export interface MultilingualPracticePhrase {
  id: string;
  targetLangCode: string;
  targetText: string;
  romanized: string;
  translations: Record<string, string>; // key: sourceLangCode, value: native meaning
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  trickyWords?: Array<{ word: string; phonetic: string; tip: string }>;
}

/**
 * Curated multilingual practice phrases across all 6 supported languages
 * (English, Hindi, Arabic, French, Spanish, German)
 */
export const MULTILINGUAL_PRACTICE_PHRASES: MultilingualPracticePhrase[] = [
  // ===================== ENGLISH TARGET =====================
  {
    id: "en-beg-1",
    targetLangCode: "en",
    targetText: "Good morning. How are you today?",
    romanized: "Good morning. How are you today?",
    translations: {
      hi: "सुप्रभात। आज आप कैसे हैं?",
      ar: "صباح الخير. كيف حالك اليوم؟",
      fr: "Bonjour. Comment allez-vous aujourd'hui ?",
      es: "Buenos días. ¿Cómo estás hoy?",
      de: "Guten Morgen. Wie geht es Ihnen heute?",
    },
    difficulty: "Beginner",
    trickyWords: [
      { word: "morning", phonetic: "MOR-ning", tip: "Keep the 'r' soft and emphasize the first syllable." },
      { word: "today", phonetic: "tuh-DAY", tip: "Stress the second syllable." },
    ],
  },
  {
    id: "en-beg-2",
    targetLangCode: "en",
    targetText: "I would like to order a cup of hot coffee, please.",
    romanized: "I would like to order a cup of hot coffee, please.",
    translations: {
      hi: "कृपया मुझे एक कप गर्म कॉफ़ी चाहिए।",
      ar: "أود أن أطلب فنجاناً من القهوة الساخنة، من فضلك.",
      fr: "Je voudrais commander une tasse de café chaud, s'il vous plaît.",
      es: "Me gustaría pedir una taza de café caliente, por favor.",
      de: "Ich möchte bitte eine Tasse heißen Kaffee bestellen.",
    },
    difficulty: "Beginner",
    trickyWords: [
      { word: "would", phonetic: "wood", tip: "The 'l' is completely silent." },
      { word: "coffee", phonetic: "KAW-fee", tip: "Pronounce the double 'f' clearly." },
    ],
  },
  {
    id: "en-int-1",
    targetLangCode: "en",
    targetText: "I have been practicing my English speaking skills every day.",
    romanized: "I have been practicing my English speaking skills every day.",
    translations: {
      hi: "मैं हर दिन अपनी अंग्रेजी बोलने के कौशल का अभ्यास कर रहा हूँ।",
      ar: "أمارس مهارات التحدث باللغة الإنجليزية كل يوم.",
      fr: "Je pratique mes compétences orales en anglais tous les jours.",
      es: "He estado practicando mis habilidades para hablar inglés todos los días.",
      de: "Ich übe jeden Tag meine Englisch-Sprechfähigkeiten.",
    },
    difficulty: "Intermediate",
    trickyWords: [
      { word: "practicing", phonetic: "PRAK-tiss-ing", tip: "Clear crisp 'k' sound in the middle." },
      { word: "skills", phonetic: "skilz", tip: "End with a soft voiced 'z' sound." },
    ],
  },
  {
    id: "en-int-2",
    targetLangCode: "en",
    targetText: "Could you please explain the difference between these two words?",
    romanized: "Could you please explain the difference between these two words?",
    translations: {
      hi: "क्या आप कृपया इन दोनों शब्दों के बीच का अंतर समझा सकते हैं?",
      ar: "هل يمكنك من فضلك شرح الفرق بين هاتين الكلمتين؟",
      fr: "Pourriez-vous s'il vous plaît expliquer la différence entre ces deux mots ?",
      es: "¿Podrías explicar la diferencia entre estas dos palabras, por favor?",
      de: "Könnten Sie bitte den Unterschied zwischen diesen beiden Wörtern erklären?",
    },
    difficulty: "Intermediate",
    trickyWords: [
      { word: "explain", phonetic: "ik-SPLAYN", tip: "Clear stress on 'splayn'." },
      { word: "difference", phonetic: "DIF-rins", tip: "Often spoken with two syllables rather than three." },
    ],
  },
  {
    id: "en-adv-1",
    targetLangCode: "en",
    targetText: "Persistent pronunciation practice will yield substantial linguistic progress.",
    romanized: "Persistent pronunciation practice will yield substantial linguistic progress.",
    translations: {
      hi: "लगातार उच्चारण अभ्यास से पर्याप्त भाषाई प्रगति होगी।",
      ar: "الممارسة المستمرة للنطق ستحقق تقدماً لغوياً ملموساً.",
      fr: "Une pratique constante de la prononciation apportera des progrès linguistiques substantiels.",
      es: "La práctica constante de la pronunciación producirá un progreso lingüístico sustancial.",
      de: "Beharrliches Aussprachetraining wird erhebliche sprachliche Fortschritte bringen.",
    },
    difficulty: "Advanced",
    trickyWords: [
      { word: "persistent", phonetic: "per-SIS-tuhnt", tip: "Stress the middle syllable 'sis'." },
      { word: "pronunciation", phonetic: "pruh-nun-see-AY-shuhn", tip: "Notice it is 'nun', not 'noun'." },
      { word: "substantial", phonetic: "suhb-STAN-shuhl", tip: "Blend 'ti' into 'sh'." },
    ],
  },
  {
    id: "en-adv-2",
    targetLangCode: "en",
    targetText: "She sells seashells by the seashore, and the shells she sells are surely seashells.",
    romanized: "She sells seashells by the seashore, and the shells she sells are surely seashells.",
    translations: {
      hi: "वह समुद्र तट पर सीपियाँ बेचती है।",
      ar: "إنها تبيع الأصداف على شاطئ البحر.",
      fr: "Elle vend des coquillages au bord de la mer.",
      es: "Ella vende conchas marinas a la orilla del mar.",
      de: "Sie verkauft Muscheln am Meeresufer.",
    },
    difficulty: "Advanced",
    trickyWords: [
      { word: "seashells", phonetic: "SEE-shelz", tip: "Contrast the 's' sound with the 'sh' sound." },
      { word: "surely", phonetic: "SHUR-lee", tip: "Start with a soft 'sh' sound." },
    ],
  },

  // ===================== HINDI TARGET =====================
  {
    id: "hi-beg-1",
    targetLangCode: "hi",
    targetText: "नमस्ते, आप कैसे हैं?",
    romanized: "Namaste, aap kaise hain?",
    translations: {
      en: "Hello, how are you?",
      ar: "مرحباً، كيف حالك؟",
      fr: "Bonjour, comment allez-vous ?",
      es: "Hola, ¿cómo estás?",
      de: "Hallo, wie geht es Ihnen?",
    },
    difficulty: "Beginner",
    trickyWords: [
      { word: "नमस्ते", phonetic: "Nah-mus-tay", tip: "Stress the final syllable 'tay'." },
      { word: "कैसे", phonetic: "KAI-say", tip: "Dipthong 'ai' sound like in 'aisle'." },
    ],
  },
  {
    id: "hi-int-1",
    targetLangCode: "hi",
    targetText: "मुझे आज एक नया पाठ सीखना बहुत पसंद आया।",
    romanized: "Mujhe aaj ek naya paath seekhna bahut pasand aaya.",
    translations: {
      en: "I really enjoyed learning a new lesson today.",
      ar: "لقد استمتعت كثيراً بتعلم درس جديد اليوم.",
      fr: "J'ai beaucoup aimé apprendre une nouvelle leçon aujourd'hui.",
      es: "Me gustó mucho aprender una nueva lección hoy.",
      de: "Ich habe heute sehr gerne eine neue Lektion gelernt.",
    },
    difficulty: "Intermediate",
    trickyWords: [
      { word: "सीखना", phonetic: "SEEKH-naa", tip: "Aspirated 'kh' sound from the back of the throat." },
      { word: "पसंद", phonetic: "puh-SUND", tip: "Nasalized vowel before the final 'd'." },
    ],
  },
  {
    id: "hi-adv-1",
    targetLangCode: "hi",
    targetText: "निरंतर और गहन भाषाई अभ्यास से अभिव्यक्ति में अभूतपूर्व निखार आता है।",
    romanized: "Nirantar aur gahan bhashaai abhyaas se abhivyakti mein abhootpoorva nikhaar aata hai.",
    translations: {
      en: "Continuous and in-depth linguistic practice brings unprecedented refinement to expression.",
      ar: "الممارسة اللغوية المستمرة والمعمقة تضفي صقلاً غير مسبوق على التعبير.",
      fr: "Une pratique linguistique continue et approfondie affine l'expression.",
      es: "La práctica lingüística continua y profunda refina la expresión de forma inédita.",
      de: "Kontinuierliche und tiefgehende Sprachpraxis verfeinert den Ausdruck.",
    },
    difficulty: "Advanced",
    trickyWords: [
      { word: "अभिव्यक्ति", phonetic: "Ubh-ee-vyuk-tee", tip: "Blend 'vya' with crisp articulation." },
      { word: "अभूतपूर्व", phonetic: "Ah-bhoot-poorv", tip: "Long 'oo' vowel and soft final 'r' glide." },
    ],
  },

  // ===================== ARABIC TARGET =====================
  {
    id: "ar-beg-1",
    targetLangCode: "ar",
    targetText: "صباح الخير، كيف حالك اليوم؟",
    romanized: "Sabah al-khair, kaifa haluka al-yawm?",
    translations: {
      en: "Good morning, how are you today?",
      hi: "सुप्रभात, आज आप कैसे हैं?",
      fr: "Bonjour, comment allez-vous aujourd'hui ?",
      es: "Buenos días, ¿cómo estás hoy?",
      de: "Guten Morgen, wie geht es Ihnen heute?",
    },
    difficulty: "Beginner",
    trickyWords: [
      { word: "الخير", phonetic: "al-khayr", tip: "The 'kh' (خ) is pronounced as a soft guttural fricative." },
      { word: "حالك", phonetic: "HAluk", tip: "The pharyngeal 'H' (ح) comes from the mid-throat." },
    ],
  },
  {
    id: "ar-int-1",
    targetLangCode: "ar",
    targetText: "أود أن أتعلم التحدث باللغة العربية بطلاقة.",
    romanized: "Awaddu an ata'allama at-tahaddutha bil-lughati al-'arabiyyati bi-talaqah.",
    translations: {
      en: "I would like to learn to speak the Arabic language fluently.",
      hi: "मैं अरबी भाषा धाराप्रवाह बोलना सीखना चाहता हूँ।",
      fr: "J'aimerais apprendre à parler couramment la langue arabe.",
      es: "Me gustaría aprender a hablar el idioma árabe con fluidez.",
      de: "Ich möchte lernen, fließend Arabisch zu sprechen.",
    },
    difficulty: "Intermediate",
    trickyWords: [
      { word: "بطلاقة", phonetic: "bi-ta-LA-qah", tip: "Emphatic 'T' (ط) followed by deep uvular 'q' (ق)." },
      { word: "العربية", phonetic: "al-'ara-BEE-yah", tip: "Pronounce the 'Ayn (ع) clearly with throat constriction." },
    ],
  },
  {
    id: "ar-adv-1",
    targetLangCode: "ar",
    targetText: "إن إتقان البلاغة والفصاحة يتطلب قراءة متعمقة وممارسة يومية مستمرة.",
    romanized: "Inna itqaana al-balaaghati wal-fasaahati yatatallabu qiraa'atan muta'ammiqatan wa mumaarasatan yawmiyatan mustamirrah.",
    translations: {
      en: "Mastering eloquence and articulation requires in-depth reading and continuous daily practice.",
      hi: "भाषण कला और वाकपटुता में निपुणता के लिए गहन अध्ययन और निरंतर अभ्यास आवश्यक है।",
      fr: "La maîtrise de l'éloquence exige une lecture approfondie et une pratique quotidienne continue.",
      es: "El dominio de la elocuencia requiere una lectura profunda y una práctica diaria continua.",
      de: "Die Beherrschung der Beredsamkeit erfordert gründliche Lektüre und tägliche Übung.",
    },
    difficulty: "Advanced",
    trickyWords: [
      { word: "البلاغة", phonetic: "al-ba-LAA-ghah", tip: "Voiced uvular fricative 'gh' (غ)." },
      { word: "الفصاحة", phonetic: "al-fa-SAA-hah", tip: "Emphatic 'S' (ص) with pharyngeal depth." },
    ],
  },

  // ===================== FRENCH TARGET =====================
  {
    id: "fr-beg-1",
    targetLangCode: "fr",
    targetText: "Bonjour ! Comment allez-vous aujourd'hui ?",
    romanized: "Bonjour ! Comment allez-vous aujourd'hui ?",
    translations: {
      en: "Hello! How are you doing today?",
      hi: "नमस्ते! आज आप कैसे हैं?",
      ar: "مرحباً! كيف حالك اليوم؟",
      es: "¡Hola! ¿Cómo está usted hoy?",
      de: "Guten Tag! Wie geht es Ihnen heute?",
    },
    difficulty: "Beginner",
    trickyWords: [
      { word: "Bonjour", phonetic: "bon-ZHOOR", tip: "Soft 'zh' sound, nasal 'on', light French uvular 'r'." },
      { word: "aujourd'hui", phonetic: "oh-zhoor-DWEE", tip: "Glide smoothly into the 'dwee' sound." },
    ],
  },
  {
    id: "fr-int-1",
    targetLangCode: "fr",
    targetText: "Pourriez-vous m'expliquer cette règle de grammaire, s'il vous plaît ?",
    romanized: "Pourriez-vous m'expliquer cette règle de grammaire, s'il vous plaît ?",
    translations: {
      en: "Could you please explain this grammar rule to me?",
      hi: "क्या आप कृपया मुझे यह व्याकरण का नियम समझा सकते हैं?",
      ar: "هل يمكنك أن تشرح لي هذه القاعدة النحوية، من فضلك؟",
      es: "¿Podría explicarme esta regla gramatical, por favor?",
      de: "Könnten Sie mir bitte diese Grammatikregel erklären?",
    },
    difficulty: "Intermediate",
    trickyWords: [
      { word: "expliquer", phonetic: "ex-plee-KAY", tip: "Stress the final 'er' sounded as 'ay'." },
      { word: "règle", phonetic: "REH-gluh", tip: "Open 'è' sound like in 'bed'." },
    ],
  },
  {
    id: "fr-adv-1",
    targetLangCode: "fr",
    targetText: "L'éloquence et la précision syntaxique témoignent d'une maîtrise approfondie de la langue.",
    romanized: "L'éloquence et la précision syntaxique témoignent d'une maîtrise approfondie de la langue.",
    translations: {
      en: "Eloquence and syntactic precision demonstrate an in-depth mastery of the language.",
      hi: "वाकपटुता और वाक्यगत सटीकता भाषा पर गहन अधिकार का प्रमाण हैं।",
      ar: "إن البلاغة والدقة التركيبية تدلان على تمكن عميق من اللغة.",
      es: "La elocuencia y la precisión sintáctica demuestran un dominio profundo del idioma.",
      de: "Eloquenz und syntaktische Präzision zeugen von einer profunden Sprachbeherrschung.",
    },
    difficulty: "Advanced",
    trickyWords: [
      { word: "syntaxique", phonetic: "sehn-tahk-SEEK", tip: "Nasal 'in' followed by crisp 'x'." },
      { word: "témoignent", phonetic: "tay-MWAN-yuh", tip: "Silent grammatical ending '-ent'." },
    ],
  },

  // ===================== SPANISH TARGET =====================
  {
    id: "es-beg-1",
    targetLangCode: "es",
    targetText: "Buenos días. Es un gran placer conocerte.",
    romanized: "Buenos días. Es un gran placer conocerte.",
    translations: {
      en: "Good morning. It is a great pleasure to meet you.",
      hi: "सुप्रभात। आपसे मिलकर बहुत खुशी हुई।",
      ar: "صباح الخير. يسعدني جداً التعرف عليك.",
      fr: "Bonjour. C'est un grand plaisir de vous rencontrer.",
      de: "Guten Morgen. Es ist mir eine große Freude, Sie kennenzulernen.",
    },
    difficulty: "Beginner",
    trickyWords: [
      { word: "placer", phonetic: "plah-SEHR", tip: "Crisp 'r' tap at the end." },
      { word: "conocerte", phonetic: "koh-noh-SEHR-teh", tip: "Keep vowels pure and short." },
    ],
  },
  {
    id: "es-int-1",
    targetLangCode: "es",
    targetText: "Estoy practicando mi pronunciación para hablar con mayor fluidez.",
    romanized: "Estoy practicando mi pronunciación para hablar con mayor fluidez.",
    translations: {
      en: "I am practicing my pronunciation to speak with greater fluency.",
      hi: "मैं अधिक धाराप्रवाह बोलने के लिए अपने उच्चारण का अभ्यास कर रहा हूँ।",
      ar: "أنا أمارس نطقي للتحدث بمزيد من الطلاقة.",
      fr: "Je pratique ma prononciation pour parler avec plus de fluidité.",
      de: "Ich übe meine Aussprache, um flüssiger zu sprechen.",
    },
    difficulty: "Intermediate",
    trickyWords: [
      { word: "pronunciación", phonetic: "proh-noon-syah-SYOHN", tip: "Strong stress on the accented 'ón'." },
      { word: "fluidez", phonetic: "flew-ee-DETH / flew-ee-DEZ", tip: "Final 'z' is soft and clear." },
    ],
  },
  {
    id: "es-adv-1",
    targetLangCode: "es",
    targetText: "El dominio fluido y elocuente de un idioma trasciende la mera memorización de reglas.",
    romanized: "El dominio fluido y elocuente de un idioma trasciende la mera memorización de reglas.",
    translations: {
      en: "The fluent and eloquent mastery of a language transcends the mere memorization of rules.",
      hi: "किसी भाषा का धाराप्रवाह ज्ञान नियमों को रटने से कहीं आगे की बात है।",
      ar: "إن التمكن الفصيح والطلاقة في لغة ما يتجاوز مجرد حفظ القواعد.",
      fr: "La maîtrise fluide et éloquente d'une langue dépasse la simple mémorisation des règles.",
      de: "Die fließende und wortgewandte Beherrschung einer Sprache geht weit über das Auswendiglernen von Regeln hinaus.",
    },
    difficulty: "Advanced",
    trickyWords: [
      { word: "trasciende", phonetic: "trahs-SYEHN-deh", tip: "Smooth blend of 'sc' into a soft 's'." },
      { word: "memorización", phonetic: "meh-moh-ree-zah-SYOHN", tip: "Accent on the final 'ón'." },
    ],
  },

  // ===================== GERMAN TARGET =====================
  {
    id: "de-beg-1",
    targetLangCode: "de",
    targetText: "Guten Tag! Es freut mich sehr, Sie kennenzulernen.",
    romanized: "Guten Tag! Es freut mich sehr, Sie kennenzulernen.",
    translations: {
      en: "Good day! I am very pleased to meet you.",
      hi: "नमस्ते! आपसे मिलकर मुझे बहुत खुशी हुई।",
      ar: "طاب يومك! يسعدني جداً التعرف عليك.",
      fr: "Bonjour ! Je suis ravi de faire votre connaissance.",
      es: "¡Buenos días! Es un placer conocerle.",
    },
    difficulty: "Beginner",
    trickyWords: [
      { word: "kennenzulernen", phonetic: "KEN-nen-tsoo-lehr-nen", tip: "Pronounce the 'z' as a crisp 'ts'." },
      { word: "freut", phonetic: "froit", tip: "'eu' sounds like 'oy' in boy." },
    ],
  },
  {
    id: "de-int-1",
    targetLangCode: "de",
    targetText: "Ich übe jeden Tag meine Aussprache und Grammatik.",
    romanized: "Ich übe jeden Tag meine Aussprache und Grammatik.",
    translations: {
      en: "I practice my pronunciation and grammar every day.",
      hi: "मैं हर दिन अपने उच्चारण और व्याकरण का अभ्यास करता हूँ।",
      ar: "أمارس نطقي وقواعدي كل يوم.",
      fr: "Je pratique ma prononciation et ma grammaire tous les jours.",
      es: "Practico mi pronunciación y gramática todos los días.",
    },
    difficulty: "Intermediate",
    trickyWords: [
      { word: "übe", phonetic: "UE-buh", tip: "Rounded umlaut 'ü' with lips pursed." },
      { word: "Aussprache", phonetic: "OWS-shpra-kheh", tip: "Guttural 'ch' sound." },
    ],
  },
  {
    id: "de-adv-1",
    targetLangCode: "de",
    targetText: "Eine präzise Ausdrucksweise und fundierte Grammatikkenntnisse sind das Fundament überzeugender Kommunikation.",
    romanized: "Eine präzise Ausdrucksweise und fundierte Grammatikkenntnisse sind das Fundament überzeugender Kommunikation.",
    translations: {
      en: "Precise phrasing and solid grammatical knowledge are the foundation of persuasive communication.",
      hi: "सटीक अभिव्यक्ति और व्याकरण का ठोस ज्ञान प्रभावशाली संचार की नींव हैं।",
      ar: "إن دقة التعبير والمعرفة النحوية الراسخة هما أساس التواصل المقنع.",
      fr: "Une expression précise et de solides connaissances grammaticales sont le socle d'une communication convaincante.",
      es: "Una expresión precisa y sólidos conocimientos gramaticales son la base de una comunicación convincente.",
    },
    difficulty: "Advanced",
    trickyWords: [
      { word: "Ausdrucksweise", phonetic: "OWS-drooks-vy-zuh", tip: "Compound word: stress 'Aus' and pronounce 'w' as 'v'." },
      { word: "überzeugender", phonetic: "ue-ber-TSOY-gen-der", tip: "Pursed 'ü' followed by crisp 'ts' in 'zeug'." },
    ],
  },
];

/**
 * Filter phrases by language and difficulty
 */
export function getPhrasesForLanguage(
  targetLangCode: string,
  difficulty?: "Beginner" | "Intermediate" | "Advanced"
): MultilingualPracticePhrase[] {
  return MULTILINGUAL_PRACTICE_PHRASES.filter((p) => {
    const langMatch = p.targetLangCode === targetLangCode;
    if (!difficulty) return langMatch;
    return langMatch && p.difficulty === difficulty;
  });
}

/**
 * Tokenize string into lowercase alphanumeric words
 */
function cleanTokens(s: string): string[] {
  if (!s) return [];
  // Retain letters across all unicode scripts (Arabic, Devanagari, Latin, etc.)
  return s
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡"'\n\r]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Word-level Target vs Actual Comparison
 * Anti-hallucination: distinguishes omissions from mispronunciations
 */
export function compareTargetVsActual(target: string, actual: string): TargetComparison {
  const targetWords = cleanTokens(target);
  const actualWords = cleanTokens(actual);

  const matchedWords: string[] = [];
  const omittedWords: string[] = [];
  const insertedWords: string[] = [];
  const substitutedWords: Array<{ expected: string; spoken: string }> = [];
  const differences: string[] = [];

  const targetTokens: TargetComparison["targetTokens"] = [];
  const spokenTokens: TargetComparison["spokenTokens"] = [];

  const actualWordPool = [...actualWords];

  targetWords.forEach((tw, idx) => {
    const matchIdx = actualWordPool.indexOf(tw);
    if (matchIdx !== -1) {
      matchedWords.push(tw);
      targetTokens.push({ word: tw, status: "match" });
      actualWordPool.splice(matchIdx, 1);
    } else {
      // Check if word was substituted at or near this position
      const actualAtPos = actualWords[idx];
      if (actualAtPos && !targetWords.includes(actualAtPos)) {
        substitutedWords.push({ expected: tw, spoken: actualAtPos });
        targetTokens.push({ word: tw, status: "substituted" });
        differences.push(`Said "${actualAtPos}" instead of "${tw}"`);
      } else {
        omittedWords.push(tw);
        targetTokens.push({ word: tw, status: "omitted" });
        differences.push(`Missing "${tw}"`);
      }
    }
  });

  actualWords.forEach((aw) => {
    if (targetWords.includes(aw)) {
      spokenTokens.push({ word: aw, status: "match" });
    } else {
      insertedWords.push(aw);
      spokenTokens.push({ word: aw, status: "inserted" });
      if (!substitutedWords.some((sw) => sw.spoken === aw)) {
        differences.push(`Added extra word "${aw}"`);
      }
    }
  });

  return {
    target,
    actual: actual || "(No speech detected)",
    matchedWords,
    omittedWords,
    insertedWords,
    substitutedWords,
    differences: differences.length > 0 ? differences : ["Perfect match with the target phrase!"],
    correctedSentence: target,
    targetTokens,
    spokenTokens,
  };
}

/**
 * Deterministic Transparent Score Calculation
 */
export function computeDeterministicScores(
  target: string,
  actual: string,
  comparison: TargetComparison
): SpeakingScoreBreakdown {
  const targetWords = cleanTokens(target);
  const actualWords = cleanTokens(actual);

  if (actualWords.length === 0) {
    return {
      overall: 0,
      grammar: 0,
      fluency: 0,
      vocabulary: 0,
      pronunciation: 0,
      status: "Needs Practice",
    };
  }

  // 1. Vocabulary Match Rate
  const matchCount = comparison.matchedWords.length;
  const targetLen = Math.max(1, targetWords.length);
  const vocabScore = Math.min(100, Math.max(10, Math.round((matchCount / targetLen) * 100)));

  // 2. Fluency (Length ratio, flow, penalty for extreme brevity or excess words)
  const lengthRatio = Math.min(1, actualWords.length / targetLen);
  const omissionPenalty = comparison.omittedWords.length * 6;
  const fluencyScore = Math.min(100, Math.max(15, Math.round(lengthRatio * 100 - omissionPenalty)));

  // 3. Grammar (Checks omission of structural/connecting words e.g. articles, prepositions, auxiliaries)
  const structuralWords = new Set(["to", "the", "a", "an", "is", "are", "was", "were", "of", "in", "at", "de", "le", "la", "el", "der", "die", "das"]);
  let grammarDeductions = 0;
  comparison.omittedWords.forEach((w) => {
    if (structuralWords.has(w)) {
      grammarDeductions += 10;
    } else {
      grammarDeductions += 5;
    }
  });
  comparison.insertedWords.forEach(() => {
    grammarDeductions += 4;
  });
  const grammarScore = Math.min(100, Math.max(20, Math.round(100 - grammarDeductions)));

  // 4. AI Pronunciation Guidance / Estimate
  // Base on Speech Recognition accuracy match rate & substitution penalties
  const substitutionPenalty = comparison.substitutedWords.length * 8;
  const rawPronunciation = Math.round((matchCount / Math.max(actualWords.length, targetLen)) * 100) - substitutionPenalty;
  const pronunciationScore = Math.min(100, Math.max(15, rawPronunciation));

  // 5. Overall Weighted Formula:
  // 30% Grammar + 25% Fluency + 25% Vocabulary + 20% Pronunciation Guidance
  const overall = Math.round(
    grammarScore * 0.3 +
    fluencyScore * 0.25 +
    vocabScore * 0.25 +
    pronunciationScore * 0.2
  );

  const status: "Excellent" | "Good" | "Needs Practice" =
    overall >= 90 ? "Excellent" : overall >= 75 ? "Good" : "Needs Practice";

  return {
    overall,
    grammar: grammarScore,
    fluency: fluencyScore,
    vocabulary: vocabScore,
    pronunciation: pronunciationScore,
    status,
  };
}

/**
 * Generates useful pronunciation guidance for difficult or mismatched words
 */
export function generatePronunciationGuidance(
  targetPhrase: string,
  comparison: TargetComparison,
  targetLangCode: string
): PronunciationGuidanceItem[] {
  const items: PronunciationGuidanceItem[] = [];

  // 1. Check if the curated phrase has known tricky words
  const curated = MULTILINGUAL_PRACTICE_PHRASES.find(
    (p) => p.targetText.toLowerCase().trim() === targetPhrase.toLowerCase().trim()
  );
  if (curated?.trickyWords) {
    curated.trickyWords.forEach((tw) => {
      items.push({
        word: tw.word,
        phonetic: tw.phonetic,
        tip: tw.tip,
        audioTarget: tw.word,
      });
    });
  }

  // 2. Add mismatched / substituted words from actual transcript
  comparison.substitutedWords.forEach((sw) => {
    if (!items.some((i) => i.word.toLowerCase() === sw.expected.toLowerCase())) {
      items.push({
        word: sw.expected,
        phonetic: `Focus on target: "${sw.expected}"`,
        tip: `The recognizer captured "${sw.spoken}". Speak clearly and enunciate the start and ending consonants.`,
        audioTarget: sw.expected,
      });
    }
  });

  // 3. If target is Arabic, provide Roman transliteration
  if (targetLangCode === "ar" || containsArabic(targetPhrase)) {
    const roman = getRomanizedPronunciation(targetPhrase, "ar");
    if (roman && items.length === 0) {
      items.push({
        word: "Phrase Enunciation",
        phonetic: roman,
        tip: "Pronounce throat sounds (ح, خ, ع, ق) distinctly with steady cadence.",
        audioTarget: targetPhrase,
      });
    }
  }

  return items.slice(0, 3);
}

/**
 * Generates actionable speaking feedback (What You Did Well, What To Improve, Practice Tip)
 */
export function generateSpeakingFeedback(
  scores: SpeakingScoreBreakdown,
  comparison: TargetComparison,
  difficulty: string
): SpeakingFeedback {
  const whatWentWell: string[] = [];
  const whatToImprove: string[] = [];

  // What you did well
  if (comparison.matchedWords.length > 0) {
    whatWentWell.push(`Accurately recognized ${comparison.matchedWords.length} target words.`);
  }
  if (scores.grammar >= 80) {
    whatWentWell.push("Maintained strong grammatical sentence structure.");
  }
  if (scores.fluency >= 80) {
    whatWentWell.push("Clear speaking rhythm and consistent phrasing.");
  }
  if (scores.vocabulary >= 80) {
    whatWentWell.push("Correct vocabulary usage aligned with target.");
  }
  if (whatWentWell.length === 0) {
    whatWentWell.push("Good effort speaking into the microphone. Keep practicing to build confidence.");
  }

  // What to improve
  if (comparison.omittedWords.length > 0) {
    whatToImprove.push(`Noticeable omission: missing "${comparison.omittedWords.slice(0, 3).join('", "')}".`);
  }
  if (comparison.substitutedWords.length > 0) {
    whatToImprove.push(
      `Word substitution: try enunciating "${comparison.substitutedWords[0].expected}" clearly instead of "${comparison.substitutedWords[0].spoken}".`
    );
  }
  if (scores.fluency < 75 && comparison.omittedWords.length === 0) {
    whatToImprove.push("Pacing: Maintain an even flow without pauses between words.");
  }
  if (difficulty === "Advanced" && scores.overall >= 85) {
    whatWentWell.push("Excellent mastery of complex advanced sentence structures.");
  }
  if (whatToImprove.length === 0) {
    whatToImprove.push(`Keep practicing at the ${difficulty} level to lock in natural intonation and speaking speed.`);
  }


  // Actionable tip
  let practiceTip = "Listen to the reference pronunciation and practice reading the phrase aloud once more.";
  if (scores.grammar < 75) {
    practiceTip = "Pay attention to small function words like 'to', 'the', and 'in' to maintain clean sentence grammar.";
  } else if (scores.fluency < 75) {
    practiceTip = "Try shadowing: listen to the audio first, then speak simultaneously at a steady 120-140 WPM pace.";
  } else if (scores.pronunciation < 75) {
    practiceTip = "Focus on syllable stress: emphasize the stressed syllable and soften unstressed vowels.";
  }

  return {
    whatWentWell,
    whatToImprove,
    correctedSentence: comparison.target,
    practiceTip,
  };
}

/**
 * Formats structured scores and details into PracticeAttempt database fields
 * in a backward-compatible way for older string consumers
 */
export function formatFeedbackForStorage(result: SpeakingEvaluationResult): {
  grammarFeedback: string;
  fluencyFeedback: string;
  vocabFeedback: string;
} {
  const gScores = `[Grammar: ${result.scores.grammar}/100]`;
  const fScores = `[Fluency: ${result.scores.fluency}/100]`;
  const vScores = `[Vocab: ${result.scores.vocabulary}/100] [Pronunciation: ${result.scores.pronunciation}/100]`;

  const grammarText = `${gScores} ${result.feedback.whatWentWell[0] || "Grammar evaluated."} ${
    result.comparison.differences.length > 0 ? "Differences: " + result.comparison.differences.slice(0, 2).join("; ") : ""
  }`.trim();

  const fluencyText = `${fScores} ${result.feedback.whatToImprove[0] || "Fluency evaluated."} Tip: ${result.feedback.practiceTip}`.trim();

  const vocabText = `${vScores} ${
    result.pronunciationGuidance.length > 0
      ? `AI Pronunciation Guidance: ${result.pronunciationGuidance[0].word} (${result.pronunciationGuidance[0].tip})`
      : "Target vocabulary matched."
  }`.trim();

  return {
    grammarFeedback: grammarText,
    fluencyFeedback: fluencyText,
    vocabFeedback: vocabText,
  };
}

/**
 * Parses stored PracticeAttempt feedback into structured dimensional scores
 */
export function parseStoredAttemptFeedback(attempt: {
  score: number;
  grammarFeedback?: string | null;
  fluencyFeedback?: string | null;
  vocabFeedback?: string | null;
}): SpeakingScoreBreakdown {
  const parseNumber = (text: string | null | undefined, pattern: RegExp): number | null => {
    if (!text) return null;
    const match = text.match(pattern);
    return match ? parseInt(match[1], 10) : null;
  };

  const gScore = parseNumber(attempt.grammarFeedback, /\[Grammar:\s*(\d+)\/100\]/i);
  const fScore = parseNumber(attempt.fluencyFeedback, /\[Fluency:\s*(\d+)\/100\]/i);
  const vScore = parseNumber(attempt.vocabFeedback, /\[Vocab:\s*(\d+)\/100\]/i);
  const pScore = parseNumber(attempt.vocabFeedback, /\[Pronunciation:\s*(\d+)\/100\]/i);

  // Fallback to proportional calculation if older record without explicit dimension tags
  const base = attempt.score;
  const grammar = gScore ?? Math.min(100, Math.max(20, base + (base >= 80 ? 2 : -4)));
  const fluency = fScore ?? Math.min(100, Math.max(15, base + (base >= 80 ? -2 : -6)));
  const vocabulary = vScore ?? Math.min(100, Math.max(20, base));
  const pronunciation = pScore ?? Math.min(100, Math.max(15, base + (base >= 80 ? -4 : -8)));

  const status: "Excellent" | "Good" | "Needs Practice" =
    base >= 90 ? "Excellent" : base >= 75 ? "Good" : "Needs Practice";

  return {
    overall: base,
    grammar,
    fluency,
    vocabulary,
    pronunciation,
    status,
  };
}
