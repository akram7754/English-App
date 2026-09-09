/**
 * Multilingual Lesson Curriculum Engine
 * Phase 21: Full Multilingual Learning Content Expansion
 *
 * Supported Languages (6 Canonical Languages):
 * - Hindi (hi-IN)
 * - English (en-US)
 * - Arabic (ar-SA)
 * - French (fr-FR)
 * - Spanish (es-ES)
 * - German (de-DE)
 *
 * 8 Interactive Stages:
 * 1. Introduction (Summary + Key Phrases + Phonetic Pronunciation + Native Translations)
 * 2. Vocabulary (Words + Part of Speech + Read + 6 Translations + SRS Integration)
 * 3. Grammar (Language-Specific Grammar Rules for Target Language)
 * 4. Listening (TTS Spoken Audio Dialogue + Comprehension Question)
 * 5. Speaking (Spoken Target + Phonetic Guide + Web Speech Assessment)
 * 6. AI Conversation (Scenario + Starter Prompt + Deep Link to Voice/Chat)
 * 7. Graded Quiz (Scored Multi-Question Assessment)
 * 8. Complete (Celebration + Sequential Lesson Unlock + 50 XP Reward)
 */

export type LessonStage =
  | "intro"
  | "learn"
  | "vocab"
  | "grammar"
  | "listening"
  | "speaking"
  | "conversation"
  | "practice"
  | "quiz"
  | "complete";

export interface KeyPhrase {
  target: string;
  read: string;
  meaning: Record<string, string>;
}

export interface LessonVocab {
  word: string;
  partOfSpeech: string;
  read: string;
  meaning: Record<string, string>;
  example: string;
}

export interface GrammarRuleExample {
  sentence: string;
  breakdown: string;
}

export interface GrammarSection {
  title: string;
  explanation: string;
  rule: string;
  examples: GrammarRuleExample[];
  tip: string;
}

export interface ListeningExercise {
  audioPrompt: string;
  speakerRole: string;
  comprehensionQuestion: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SpeakingExercise {
  promptPhrase: string;
  phoneticGuide: string;
  translation: Record<string, string>;
  pronunciationTip: string;
  expectedKeywords: string[];
}

export interface ConversationPrompt {
  scenario: string;
  role: string;
  aiRole: string;
  starterPrompt: string;
  suggestedPhrases: string[];
}

export interface PracticeExercise {
  id: string;
  prompt: string;
  type: "multiple_choice" | "fill_blank";
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StructuredLessonContent {
  estimatedMinutes: number;
  targetLanguage?: string;
  sourceLanguage?: string;
  isRTL?: boolean;
  introduction: {
    summary: string;
    keyPhrases: KeyPhrase[];
  };
  vocabulary: LessonVocab[];
  grammar: GrammarSection;
  listening: ListeningExercise[];
  speaking: SpeakingExercise[];
  conversation: ConversationPrompt;
  practice: PracticeExercise[];
  quiz: QuizQuestion[];
}

export interface LessonItem {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  content: string;
  courseId?: number | null;
}

/**
 * Returns true if the language is right-to-left (Arabic)
 */
export function isRtlLanguage(lang: string = ""): boolean {
  const normalized = lang.toLowerCase().trim();
  return normalized === "ar" || normalized === "arabic" || normalized.startsWith("ar-");
}

/**
 * Normalizes language names or codes to standard capitalized language names
 */
export function normalizeLanguageName(nameOrCode: string = "en"): string {
  const clean = nameOrCode.toLowerCase().trim();
  if (clean === "hi" || clean === "hindi" || clean.startsWith("hi-")) return "Hindi";
  if (clean === "ar" || clean === "arabic" || clean.startsWith("ar-")) return "Arabic";
  if (clean === "fr" || clean === "french" || clean.startsWith("fr-")) return "French";
  if (clean === "es" || clean === "spanish" || clean.startsWith("es-")) return "Spanish";
  if (clean === "de" || clean === "german" || clean.startsWith("de-")) return "German";
  return "English";
}

// =========================================================================
// MULTILINGUAL 10 PRACTICAL SITUATIONS DATA STORE
// =========================================================================

interface RawSituation {
  summary: Record<string, string>;
  phrases: Record<string, Array<{ target: string; read: string; meaning: Record<string, string> }>>;
  vocab: Record<string, Array<{ word: string; partOfSpeech: string; read: string; meaning: Record<string, string>; example: string }>>;
  listening: Record<string, Array<ListeningExercise>>;
  speaking: Record<string, Array<SpeakingExercise>>;
  conversation: Record<string, ConversationPrompt>;
  practice: Record<string, Array<PracticeExercise>>;
  quiz: Record<string, Array<QuizQuestion>>;
}

const SITUATIONS_DB: Record<string, RawSituation> = {
  // 1. Greetings & Introductions
  "Greetings & Introductions": {
    summary: {
      English: "Master confident first impressions, polite daily greetings, and introducing yourself in social and professional settings.",
      French: "Maîtrisez les présentations en toute confiance, les salutations courtoises du quotidien et la façon de vous présenter.",
      Spanish: "Domina las primeras impresiones, los saludos cotidianos y cómo presentarte de forma natural en sociedad.",
      German: "Meistern Sie sichere erste Eindrücke, höfliche Alltagsgrüße und wie Sie sich professionell vorstellen.",
      Arabic: "أتقن إلقاء التحية بثقة، والعبارات الترحيبية اليومية المهذبة، والتعريف بنفسك في المواقف الاجتماعية والمهنية.",
      Hindi: "आत्मविश्वास के साथ अभिवादन करना, शिष्टाचार की बातें और सामाजिक एवं व्यावसायिक माहौल में अपना परिचय देना सीखें।",
    },
    phrases: {
      English: [
        {
          target: "Hello, it is a pleasure to meet you.",
          read: "Heh-loh, it iz a pleh-zhur too meet yoo.",
          meaning: {
            Hindi: "नमस्ते, आपसे मिलकर बहुत खुशी हुई।",
            Arabic: "مرحباً، يسعدني جداً التعرف عليك.",
            French: "Bonjour, c'est un plaisir de vous rencontrer.",
            Spanish: "Hola, es un placer conocerte.",
            German: "Hallo, es ist mir eine Freude, Sie kennenzulernen.",
            English: "Hello, it is a pleasure to meet you.",
          },
        },
        {
          target: "My name is Sarah, and I am from California.",
          read: "My naym iz Seh-rah, and eye am fruhm Kal-ih-forn-yuh.",
          meaning: {
            Hindi: "मेरा नाम सारा है, और मैं कैलिफोर्निया से हूँ।",
            Arabic: "اسمي سارة، وأنا من كاليفورنيا.",
            French: "Je m'appelle Sarah, et je viens de Californie.",
            Spanish: "Mi nombre es Sarah, y soy de California.",
            German: "Mein Name ist Sarah, und ich komme aus Kalifornien.",
            English: "My name is Sarah, and I am from California.",
          },
        },
      ],
      French: [
        {
          target: "Bonjour, ravi de faire votre connaissance.",
          read: "Bon-zhoor, rah-vee duh fehr vo-truh koh-neh-sahns.",
          meaning: {
            English: "Hello, delighted to make your acquaintance.",
            Hindi: "नमस्ते, आपसे मिलकर बहुत अच्छा लगा।",
            Arabic: "مرحباً، يسعدني التعرف عليك.",
            Spanish: "Hola, encantado de conocerte.",
            German: "Guten Tag, freut mich sehr, Sie kennenzulernen.",
            French: "Bonjour, ravi de faire votre connaissance.",
          },
        },
        {
          target: "Je m'appelle Julien et j'habite à Lyon.",
          read: "Zhuh mah-pell Zhoo-lyen ay zhah-beet ah Lee-on.",
          meaning: {
            English: "My name is Julien and I live in Lyon.",
            Hindi: "मेरा नाम जूलियन है और मैं ल्योन में रहता हूँ।",
            Arabic: "اسمي جوليان وأنا أعيش في ليون.",
            Spanish: "Me llamo Julien y vivo en Lyon.",
            German: "Ich heiße Julien und wohne in Lyon.",
            French: "Je m'appelle Julien et j'habite à Lyon.",
          },
        },
      ],
      Spanish: [
        {
          target: "¡Hola! Mucho gusto en conocerte.",
          read: "OH-lah! MOO-choh GOO-stoh en koh-noh-SEHR-teh.",
          meaning: {
            English: "Hello! Pleased to meet you.",
            Hindi: "नमस्ते! आपसे मिलकर खुशी हुई।",
            Arabic: "أهلاً! سعدت جداً بمعرفتك.",
            French: "Bonjour ! Ravi de vous rencontrer.",
            German: "Hallo! Sehr erfreut, Sie kennenzulernen.",
            Spanish: "¡Hola! Mucho gusto en conocerte.",
          },
        },
        {
          target: "Me llamo Mateo y soy profesor de idiomas.",
          read: "Meh YAH-moh Mah-TEH-oh ee soy proh-feh-SOHR deh ee-DYOH-mahs.",
          meaning: {
            English: "My name is Mateo and I am a language teacher.",
            Hindi: "मेरा नाम मातेओ है और मैं भाषा शिक्षक हूँ।",
            Arabic: "اسمي ماتيو وأنا مدرس لغات.",
            French: "Je m'appelle Mateo et je suis professeur de langues.",
            German: "Ich heiße Mateo und bin Sprachlehrer.",
            Spanish: "Me llamo Mateo y soy profesor de idiomas.",
          },
        },
      ],
      German: [
        {
          target: "Guten Tag! Schön, Sie kennenzulernen.",
          read: "GOO-ten tahk! Shurn, zee KEN-nen-tsoo-lehr-nen.",
          meaning: {
            English: "Good day! Nice to meet you.",
            Hindi: "नमस्ते! आपसे मिलकर अच्छा लगा।",
            Arabic: "طاب يومك! من الجميل مقابلتك.",
            French: "Bonjour ! Ravi de faire votre connaissance.",
            Spanish: "¡Buenos días! Un gusto conocerle.",
            German: "Guten Tag! Schön, Sie kennenzulernen.",
          },
        },
        {
          target: "Mein Name ist Lukas und ich wohne in Berlin.",
          read: "Mine NAH-muh ist LOO-kahs oont ikh VOH-nuh in behr-LEEN.",
          meaning: {
            English: "My name is Lukas and I live in Berlin.",
            Hindi: "मेरा नाम लुकास है और मैं बर्लिन में रहता हूँ।",
            Arabic: "اسمي لوكاس وأسكن في برلين.",
            French: "Mon nom est Lukas et j'habite à Berlin.",
            Spanish: "Mi nombre es Lukas y vivo en Berlín.",
            German: "Mein Name ist Lukas und ich wohne in Berlin.",
          },
        },
      ],
      Arabic: [
        {
          target: "مرحباً، تشرفت بلقائك كثيراً.",
          read: "Marhaban, tasharraftu bi-liqaa'ika katheeran.",
          meaning: {
            English: "Hello, I am greatly honored to meet you.",
            Hindi: "नमस्ते, आपसे मिलकर बहुत सम्मान महसूस हुआ।",
            French: "Bonjour, très honoré de vous rencontrer.",
            Spanish: "Hola, es un gran honor conocerte.",
            German: "Hallo, es ist mir eine Ehre, Sie kennenzulernen.",
            Arabic: "مرحباً، تشرفت بلقائك كثيراً.",
          },
        },
        {
          target: "اسمي طارق، وأنا مهندس برمجيات.",
          read: "Ismee Taariq, wa ana muhandis barmajiyyaat.",
          meaning: {
            English: "My name is Tariq, and I am a software engineer.",
            Hindi: "मेरा नाम तारिक है, और मैं एक सॉफ्टवेयर इंजीनियर हूँ।",
            French: "Je m'appelle Tariq et je suis ingénieur logiciel.",
            Spanish: "Mi nombre es Tariq y soy ingeniero de software.",
            German: "Mein Name ist Tariq und ich bin Softwareingenieur.",
            Arabic: "اسمي طارق، وأنا مهندس برمجيات.",
          },
        },
      ],
      Hindi: [
        {
          target: "नमस्ते! आपसे मिलकर मुझे बहुत प्रसन्नता हुई।",
          read: "Namaste! Aap-se mil-kar mujhe bahut prasann-taa hui.",
          meaning: {
            English: "Hello! I am very pleased to meet you.",
            Arabic: "أهلاً وسهلاً! يسعدني جداً لقاؤك.",
            French: "Bonjour ! Je suis très heureux de vous rencontrer.",
            Spanish: "¡Hola! Me da mucho gusto conocerte.",
            German: "Hallo! Es freut mich sehr, Sie kennenzulernen.",
            Hindi: "नमस्ते! आपसे मिलकर मुझे बहुत प्रसन्नता हुई।",
          },
        },
        {
          target: "मेरा नाम राहुल है और मैं नई दिल्ली से हूँ।",
          read: "Mera naam Rahul hai aur main Nayi Dilli se hoon.",
          meaning: {
            English: "My name is Rahul and I am from New Delhi.",
            Arabic: "اسمي راهول وأنا من نيودلهي.",
            French: "Je m'appelle Rahul et je viens de New Delhi.",
            Spanish: "Mi nombre es Rahul y soy de Nueva Delhi.",
            German: "Mein Name ist Rahul und ich komme aus Neu-Delhi.",
            Hindi: "मेरा नाम राहुल है और मैं नई दिल्ली से हूँ।",
          },
        },
      ],
    },
    vocab: {
      English: [
        {
          word: "pleasure",
          partOfSpeech: "noun",
          read: "PLEH-zhur",
          meaning: { Hindi: "खुशी", Arabic: "سرور", French: "plaisir", Spanish: "placer", German: "Freude", English: "happy satisfaction" },
          example: "It was a pleasure talking with you.",
        },
        {
          word: "introduce",
          partOfSpeech: "verb",
          read: "in-truh-DOOS",
          meaning: { Hindi: "परिचय कराना", Arabic: "يُقدّم", French: "présenter", Spanish: "presentar", German: "vorstellen", English: "to make known" },
          example: "Allow me to introduce my colleague.",
        },
      ],
      French: [
        {
          word: "enchanté",
          partOfSpeech: "adjectif",
          read: "ahn-shahn-tay",
          meaning: { English: "delighted", Hindi: "प्रसन्न", Arabic: "سعيد", Spanish: "encantado", German: "erfreut", French: "ravi" },
          example: "Enchanté de faire votre connaissance !",
        },
        {
          word: "présenter",
          partOfSpeech: "verbe",
          read: "pray-zahn-tay",
          meaning: { English: "to introduce", Hindi: "परिचय कराना", Arabic: "يُعرّف", Spanish: "presentar", German: "vorstellen", French: "faire connaître" },
          example: "Je vous présente mon collègue Alexandre.",
        },
      ],
      Spanish: [
        {
          word: "encantado",
          partOfSpeech: "adjetivo",
          read: "en-kahn-TAH-doh",
          meaning: { English: "delighted", Hindi: "प्रसन्न", Arabic: "مسرور", French: "ravi", German: "erfreut", Spanish: "mucho gusto" },
          example: "¡Mucho gusto, encantado de conocerte!",
        },
        {
          word: "presentar",
          partOfSpeech: "verbo",
          read: "preh-sen-TAHR",
          meaning: { English: "to introduce", Hindi: "परिचय कराना", Arabic: "تقديم", French: "présenter", German: "vorstellen", Spanish: "dar a conocer" },
          example: "Permíteme presentarte a mi hermana.",
        },
      ],
      German: [
        {
          word: "willkommen",
          partOfSpeech: "Adjektiv",
          read: "vil-KOM-men",
          meaning: { English: "welcome", Hindi: "स्वागत है", Arabic: "مرحباً", French: "bienvenue", Spanish: "bienvenido", German: "willkommen" },
          example: "Herzlich willkommen in Deutschland!",
        },
        {
          word: "vorstellen",
          partOfSpeech: "Verb",
          read: "FOHR-shtel-len",
          meaning: { English: "to introduce", Hindi: "परिचय कराना", Arabic: "يُعرّف", French: "présenter", Spanish: "presentar", German: "bekannt machen" },
          example: "Darf ich mich kurz vorstellen?",
        },
      ],
      Arabic: [
        {
          word: "أهلاً",
          partOfSpeech: "اسم ترحيب",
          read: "Ahlan",
          meaning: { English: "welcome", Hindi: "स्वागत", French: "bienvenue", Spanish: "bienvenido", German: "willkommen", Arabic: "ترحيب بالضيف" },
          example: "أهلاً وسهلاً بك في مدينتنا.",
        },
        {
          word: "فرصة",
          partOfSpeech: "اسم",
          read: "Fursah",
          meaning: { English: "opportunity", Hindi: "अवसर", French: "occasion", Spanish: "oportunidad", German: "Gelegenheit", Arabic: "مناسبة سعيدة" },
          example: "فرصة سعيدة جداً أن ألتقي بك.",
        },
      ],
      Hindi: [
        {
          word: "स्वागत",
          partOfSpeech: "संज्ञा",
          read: "Swaagat",
          meaning: { English: "welcome", Arabic: "ترحاب", French: "bienvenue", Spanish: "bienvenida", German: "Willkommen", Hindi: "अभिनंदन" },
          example: "हमारी कक्षा में आपका स्वागत है।",
        },
        {
          word: "परिचय",
          partOfSpeech: "संज्ञा",
          read: "Parichay",
          meaning: { English: "introduction", Arabic: "تعارف", French: "présentation", Spanish: "presentación", German: "Bekanntschaft", Hindi: "जान-पहचान" },
          example: "कृपया अपना परिचय दीजिए।",
        },
      ],
    },
    listening: {
      English: [
        {
          audioPrompt: "Good afternoon! My name is David Miller. I am joining the marketing team today as a coordinator.",
          speakerRole: "David (New Team Member)",
          comprehensionQuestion: "What is David's new role?",
          options: ["Marketing coordinator", "Lead software architect", "Financial advisor", "Security specialist"],
          correctIndex: 0,
          explanation: "David explicitly says: 'I am joining the marketing team today as a coordinator.'",
        },
      ],
      French: [
        {
          audioPrompt: "Bonjour à tous ! Je m'appelle Claire. Je suis la nouvelle directrice artistique.",
          speakerRole: "Claire (Collaboratrice)",
          comprehensionQuestion: "Quel est le poste de Claire ?",
          options: ["Directrice artistique", "Comptable", "Responsable logistique", "Stagiaire"],
          correctIndex: 0,
          explanation: "Claire déclare explicitement être la nouvelle directrice artistique.",
        },
      ],
      Spanish: [
        {
          audioPrompt: "¡Hola! Mi nombre es Sofía y seré la nueva supervisora de proyectos en la oficina.",
          speakerRole: "Sofía (Supervisora)",
          comprehensionQuestion: "¿Cuál es el puesto de Sofía?",
          options: ["Supervisora de proyectos", "Recepcionista", "Gerente de compras", "Ingeniera de sonido"],
          correctIndex: 0,
          explanation: "Sofía menciona que será la nueva supervisora de proyectos.",
        },
      ],
      German: [
        {
          audioPrompt: "Guten Tag! Ich bin Thomas Schneider, der neue Teamleiter im Kundendienst.",
          speakerRole: "Thomas (Teamleiter)",
          comprehensionQuestion: "Welche Position hat Thomas?",
          options: ["Teamleiter im Kundendienst", "Reiseleiter", "Buchhalter", "Praktikant"],
          correctIndex: 0,
          explanation: "Thomas stellt sich als der neue Teamleiter im Kundendienst vor.",
        },
      ],
      Arabic: [
        {
          audioPrompt: "أهلاً وسهلاً بكم، أنا الدكتورة منى، وأنا أستاذة اللغويات الجديدة في الجامعة.",
          speakerRole: "د. منى (أستاذة جامعية)",
          comprehensionQuestion: "ما هو عمل الدكتورة منى؟",
          options: ["أستاذة اللغويات بالجامعة", "مهندسة معمارية", "مديرة بنك", "طبيبة أطفال"],
          correctIndex: 0,
          explanation: "ذكرت الدكتورة منى أنها أستاذة اللغويات الجديدة في الجامعة.",
        },
      ],
      Hindi: [
        {
          audioPrompt: "नमस्ते मित्रों! मेरा नाम अमित है और मैं आज से आपका नया प्रोजेक्ट मैनेजर हूँ।",
          speakerRole: "अमित (प्रोजेक्ट मैनेजर)",
          comprehensionQuestion: "अमित का नया पद क्या है?",
          options: ["प्रोजेक्ट मैनेजर", "लेखाकार", "ड्राइवर", "छात्र"],
          correctIndex: 0,
          explanation: "अमित स्पष्ट रूप से कहता है कि वह नया प्रोजेक्ट मैनेजर है।",
        },
      ],
    },
    speaking: {
      English: [
        {
          promptPhrase: "It is an absolute pleasure to meet you.",
          phoneticGuide: "It iz an AB-soh-loot PLEH-zhur too meet yoo.",
          translation: { Hindi: "आपसे मिलकर अत्यंत खुशी हुई।", Arabic: "يسعدني جداً مقابلتك.", French: "Un plaisir de vous rencontrer.", Spanish: "Es un placer conocerte.", German: "Eine Freude, Sie kennenzulernen.", English: "It is an absolute pleasure to meet you." },
          pronunciationTip: "Keep 'pleasure' smooth with a soft 'zh' sound in the middle.",
          expectedKeywords: ["pleasure", "meet", "absolute"],
        },
      ],
      French: [
        {
          promptPhrase: "C'est un réel plaisir de faire votre connaissance.",
          phoneticGuide: "Say tuhn ray-el pleh-zeer duh fehr vo-truh koh-neh-sahns.",
          translation: { English: "It is a real pleasure to make your acquaintance.", Hindi: "आपसे मिलकर बहुत अच्छा लगा।", Arabic: "يسعدني التعرف عليك.", Spanish: "Un placer conocerle.", German: "Freut mich, Sie kennenzulernen.", French: "C'est un réel plaisir de faire votre connaissance." },
          pronunciationTip: "Liaison 'un réel' and pronounce 'connaissance' with open vowels.",
          expectedKeywords: ["plaisir", "connaissance", "faire"],
        },
      ],
      Spanish: [
        {
          promptPhrase: "Es un verdadero honor poder conocerte hoy.",
          phoneticGuide: "Ehs oon behr-dah-DEH-roh oh-NOHR poh-DEHR koh-noh-SEHR-teh oy.",
          translation: { English: "It is a true honor to meet you today.", Hindi: "आज आपसे मिलकर सम्मान हुआ।", Arabic: "شرف حقيقي مقابلتك اليوم.", French: "Un honneur de vous rencontrer.", German: "Eine Ehre, Sie kennenzulernen.", Spanish: "Es un verdadero honor poder conocerte hoy." },
          pronunciationTip: "Silent 'h' in 'honor' and 'hoy'.",
          expectedKeywords: ["honor", "conocerte", "verdadero"],
        },
      ],
      German: [
        {
          promptPhrase: "Es ist mir eine Freude, Sie zu treffen.",
          phoneticGuide: "Es ist meer eye-nuh FROY-duh, zee tsoo TREF-fen.",
          translation: { English: "It is a pleasure to meet you.", Hindi: "आपसे मिलना मेरे लिए खुशी की बात है।", Arabic: "يسعدني لقاؤك.", French: "Un plaisir de vous rencontrer.", Spanish: "Un placer coincidir con usted.", German: "Es ist mir eine Freude, Sie zu treffen." },
          pronunciationTip: "Pronounce 'z' as 'ts' and stress 'Freude'.",
          expectedKeywords: ["Freude", "treffen"],
        },
      ],
      Arabic: [
        {
          promptPhrase: "تشرفت بمعرفتك وسعيد جداً بلقائك.",
          phoneticGuide: "Ta-shar-raf-tu bi-ma'-ri-fa-ti-ka wa sa-'ee-dun jid-dan bi-li-qaa'-ik.",
          translation: { English: "I am honored to know you.", Hindi: "आपसे परिचय होना सम्मान की बात है।", French: "Honoré de vous connaître.", Spanish: "Honrado de conocerte.", German: "Geehrt, Sie kennenzulernen.", Arabic: "تشرفت بمعرفتك وسعيد جداً بلقائك." },
          pronunciationTip: "Pronounce the 'Ayn (ع) with gentle constriction in the throat.",
          expectedKeywords: ["تشرفت", "معرفتك", "لقائك"],
        },
      ],
      Hindi: [
        {
          promptPhrase: "आपसे मिलकर मुझे हार्दिक प्रसन्नता हुई।",
          phoneticGuide: "Aap-se mil-kar mujhe haar-dik prasann-taa hui.",
          translation: { English: "I felt heartfelt pleasure meeting you.", Arabic: "شعرت بسعادة غامرة بلقائك.", French: "Plaisir sincère de vous rencontrer.", Spanish: "Sincera alegría al conocerte.", German: "Herzlich gefreut.", Hindi: "आपसे मिलकर मुझे हार्दिक प्रसन्नता हुई।" },
          pronunciationTip: "Keep the vowel in 'haar-dik' long and crisp.",
          expectedKeywords: ["मिलकर", "हार्दिक", "प्रसन्नता"],
        },
      ],
    },
    conversation: {
      English: {
        scenario: "You are meeting an overseas colleague at a conference in London.",
        role: "New Delegate",
        aiRole: "Host Coordinator",
        starterPrompt: "Hello! Welcome to our symposium. Where did you travel from?",
        suggestedPhrases: ["I traveled from California.", "It is my first time here and I am excited.", "Nice to meet you!"],
      },
      French: {
        scenario: "Vous rencontrez un collègue d'une autre université à Paris.",
        role: "Chercheur invité",
        aiRole: "Hôte de réception",
        starterPrompt: "Bienvenue à Paris ! Comment s'est passé votre voyage ?",
        suggestedPhrases: ["Mon voyage s'est très bien passé, merci !", "Je m'appelle Thomas.", "Ravi de vous rencontrer."],
      },
      Spanish: {
        scenario: "Llegas a una conferencia internacional en Madrid y saludas a un colega.",
        role: "Asistente invitado",
        aiRole: "Coordinador de bienvenida",
        starterPrompt: "¡Bienvenido a Madrid! ¿Es tu primera vez en nuestra ciudad?",
        suggestedPhrases: ["Sí, es mi primera visita y me encanta.", "Mucho gusto, mi nombre es Carlos.", "Encantado de estar aquí."],
      },
      German: {
        scenario: "Sie nehmen an einer Tagung in München teil und unterhalten sich am Empfang.",
        role: "Gastteilnehmer",
        aiRole: "Empfangskoordinator",
        starterPrompt: "Guten Tag! Schön, dass Sie da sind. Wie war Ihre Anreise?",
        suggestedPhrases: ["Vielen Dank, die Anreise war sehr angenehm.", "Mein Name ist Markus.", "Freut mich sehr!"],
      },
      Arabic: {
        scenario: "تحضر ملتقى دولياً في دبي وتلتقي بأحد المنظمين في بهو الاستقبال.",
        role: "مشارك في المؤتمر",
        aiRole: "منسق الاستقبال",
        starterPrompt: "أهلاً وسهلاً بك في دبي! نورت ملتقانا اليوم.",
        suggestedPhrases: ["شكراً جزيلاً، يسعدني ويشرفني الحضور.", "اسمي كريم.", "تشرفت بلقائكم."],
      },
      Hindi: {
        scenario: "आप एक अंतरराष्ट्रीय सम्मेलन में भाग लेने आए हैं और साथी से मिल रहे हैं।",
        role: "आमंत्रित प्रतिनिधि",
        aiRole: "सम्मेलन स्वागतकर्ता",
        starterPrompt: "नमस्ते! हमारे सम्मेलन में आपका स्वागत है। आपकी यात्रा कैसी रही?",
        suggestedPhrases: ["नमस्ते! यात्रा बहुत सुखद रही, धन्यवाद।", "मेरा नाम विकास है।", "आपसे मिलकर प्रसन्नता हुई।"],
      },
    },
    practice: {
      English: [
        {
          id: "greetings-p1",
          prompt: "Choose the most polite and natural response: 'Sarah, this is our director Mr. Vance.'",
          type: "multiple_choice",
          options: ["It is a pleasure to meet you, Mr. Vance.", "I don't care who you are.", "Goodbye Vance.", "Who asked?"],
          correctAnswer: "It is a pleasure to meet you, Mr. Vance.",
          explanation: "'It is a pleasure to meet you' is standard polite greeting.",
        },
      ],
      French: [
        {
          id: "fr-p1",
          prompt: "Quelle est la réponse la plus polie à 'Bonjour, je vous présente Paul' ?",
          type: "multiple_choice",
          options: ["Enchanté de faire votre connaissance, Paul.", "Au revoir Paul.", "Je refuse.", "Pourquoi ?"],
          correctAnswer: "Enchanté de faire votre connaissance, Paul.",
          explanation: "'Enchanté de faire votre connaissance' est la formule de politesse usuelle.",
        },
      ],
      Spanish: [
        {
          id: "es-p1",
          prompt: "Elige la respuesta más cortés al ser presentado: 'Hola, te presento a mi profesor.'",
          type: "multiple_choice",
          options: ["Mucho gusto en conocerle, profesor.", "Adiós.", "No me importa.", "Vete."],
          correctAnswer: "Mucho gusto en conocerle, profesor.",
          explanation: "'Mucho gusto en conocerle' demuestra respeto formal.",
        },
      ],
      German: [
        {
          id: "de-p1",
          prompt: "Was ist die höflichste Antwort auf eine Vorstellung?",
          type: "multiple_choice",
          options: ["Sehr erfreut, Sie kennenzulernen.", "Gehen Sie weg.", "Keine Ahnung.", "Tschüss."],
          correctAnswer: "Sehr erfreut, Sie kennenzulernen.",
          explanation: "'Sehr erfreut, Sie kennenzulernen' ist der gehobene Standard.",
        },
      ],
      Arabic: [
        {
          id: "ar-p1",
          prompt: "ما هو الرد الأنسب عندما يقول لك شخص 'أهلاً وسهلاً بك'؟",
          type: "multiple_choice",
          options: ["أهلاً بك، تشرفت بمعرفتك.", "لا أريد التحدث.", "وداعاً فوراً.", "من أنت؟"],
          correctAnswer: "أهلاً بك، تشرفت بمعرفتك.",
          explanation: "'أهلاً بك، تشرفت بمعرفتك' هو الأسلوب المهذب.",
        },
      ],
      Hindi: [
        {
          id: "hi-p1",
          prompt: "परिचय कराने पर सबसे उपयुक्त उत्तर क्या है?",
          type: "multiple_choice",
          options: ["नमस्ते, आपसे मिलकर खुशी हुई।", "मुझे बात नहीं करनी।", "यहाँ से जाइए।", "आप कौन हैं?"],
          correctAnswer: "नमस्ते, आपसे मिलकर खुशी हुई।",
          explanation: "यह शिष्ट और सम्मानजनक सामाजिक अभिवादन है।",
        },
      ],
    },
    quiz: {
      English: [
        {
          id: "q-greet-1",
          question: "Which expression is the most formal and courteous way to greet someone?",
          options: ["Good morning, it is a pleasure to meet you.", "Yo, what's up?", "See ya later.", "Hey you."],
          correctIndex: 0,
          explanation: "'Good morning, it is a pleasure to meet you' provides polite formal tone.",
        },
      ],
      French: [
        {
          id: "q-fr-1",
          question: "Quelle salutation est la plus courtoise lors d'une première rencontre professionnelle ?",
          options: ["Bonjour, ravi de faire votre connaissance.", "Salut toi.", "Quoi de neuf ?", "À plus tard."],
          correctIndex: 0,
          explanation: "C'est l'expression la plus respectueuse et professionnelle.",
        },
      ],
      Spanish: [
        {
          id: "q-es-1",
          question: "¿Cuál es la forma más adecuada y formal de saludar en una reunión matutina?",
          options: ["Buenos días, es un gran honor conocerle.", "¿Qué onda?", "Nos vemos.", "Oye tú."],
          correctIndex: 0,
          explanation: "Mantiene la cortesía y el respeto formal requeridos.",
        },
      ],
      German: [
        {
          id: "q-de-1",
          question: "Welche Höflichkeitsformel verwendet man im geschäftlichen Gespräch?",
          options: ["Sie", "Du", "Ihr", "Er"],
          correctIndex: 0,
          explanation: "Im Deutschen ist 'Sie' die formelle Anrede.",
        },
      ],
      Arabic: [
        {
          id: "q-ar-1",
          question: "أي من العبارات التالية تمثل أسلوب التحية الرسمي الأكثر احتراماً؟",
          options: ["صباح الخير، يشرفني جداً لقاؤك والتعرف عليك.", "سلام يا هذا.", "ماذا تريد؟", "وداعاً الآن."],
          correctIndex: 0,
          explanation: "تبدأ بالتحية الصباحية وتعبر عن التقدير والاحترام.",
        },
      ],
      Hindi: [
        {
          id: "q-hi-1",
          question: "औपचारिक बातचीत में किसी नए व्यक्ति से बात करते समय कौन सा सर्वनाम उपयुक्त है?",
          options: ["आप", "तू", "तुम", "वह"],
          correctIndex: 0,
          explanation: "'आप' आदरसूचक और शिष्ट सर्वनाम है।",
        },
      ],
    },
  },
};

// Now build situations 2 through 10 dynamically using a clean curriculum builder
const SITUATION_CONFIGS: Array<{
  name: string;
  category: string;
  enSummary: string;
  enP1: string; enP1Read: string; enP1Hi: string; enP1Ar: string; enP1Fr: string; enP1Es: string; enP1De: string;
  enV1: string; enV1POS: string; enV1Read: string; enV1Def: string; enV1Hi: string; enV1Ar: string; enV1Fr: string; enV1Es: string; enV1De: string; enV1Ex: string;
  frP1: string; frP1Read: string; frP1En: string; frV1: string; frV1En: string;
  esP1: string; esP1Read: string; esP1En: string; esV1: string; esV1En: string;
  deP1: string; deP1Read: string; deP1En: string; deV1: string; deV1En: string;
  arP1: string; arP1Read: string; arP1En: string; arV1: string; arV1En: string;
  hiP1: string; hiP1Read: string; hiP1En: string; hiV1: string; hiV1En: string;
}> = [
  {
    name: "Daily Conversation",
    category: "Conversation",
    enSummary: "Communicate naturally about daily routines, weather, schedules, and common day-to-day happenings.",
    enP1: "What do you usually do in the morning?", enP1Read: "Wut doo yoo YOO-zhoo-uh-lee doo in the MOR-ning?",
    enP1Hi: "आप आमतौर पर सुबह क्या करते हैं?", enP1Ar: "ماذا تفعل عادة في الصباح؟", enP1Fr: "Que faites-vous le matin ?", enP1Es: "¿Qué sueles hacer por la mañana?", enP1De: "Was machen Sie morgens?",
    enV1: "routine", enV1POS: "noun", enV1Read: "roo-TEEN", enV1Def: "daily habitual actions", enV1Hi: "दिनचर्या", enV1Ar: "روتين", enV1Fr: "routine", enV1Es: "rutina", enV1De: "Routine", enV1Ex: "A regular morning routine sets a calm day.",
    frP1: "Que fais-tu généralement le matin ?", frP1Read: "Kuh feh-too zhay-nay-rahl-mahn luh mah-tehn?", frP1En: "What do you usually do in the morning?", frV1: "quotidien", frV1En: "daily life",
    esP1: "¿Qué sueles hacer por las mañanas?", esP1Read: "Keh SWEH-lehs ah-SEHR pohr lahs mah-NYAH-nahs?", esP1En: "What do you usually do in the morning?", esV1: "rutina", esV1En: "routine",
    deP1: "Was machen Sie normalerweise morgens?", deP1Read: "Vahs MAH-khen zee nor-MAHL-er-vy-zuh MOR-gens?", deP1En: "What do you normally do in the mornings?", deV1: "Tagesablauf", deV1En: "daily routine",
    arP1: "ماذا تفعل عادةً في الصباح الباكر؟", arP1Read: "Maadha taf'alu 'aadatan fee as-sabaahi al-baakir?", arP1En: "What do you usually do in the early morning?", arV1: "روتين", arV1En: "routine",
    hiP1: "आप आमतौर पर सुबह क्या करते हैं?", hiP1Read: "Aap aamtaur par subah kya karte hain?", hiP1En: "What do you usually do in the morning?", hiV1: "दिनचर्या", hiV1En: "daily routine",
  },
  {
    name: "Family & Friends",
    category: "Social & Lifestyle",
    enSummary: "Describe family members, relationships, friendships, hobbies, and personal connections.",
    enP1: "I have a close-knit family with two siblings.", enP1Read: "Eye hav a klohs-nit FAM-uh-lee with too SIB-lings.",
    enP1Hi: "मेरा दो भाई-बहनों वाला एक घनिष्ठ परिवार है।", enP1Ar: "لدي عائلة متماسكة وأخوان.", enP1Fr: "J'ai une famille très unie avec deux frères et sœurs.", enP1Es: "Tengo una familia muy unida con dos hermanos.", enP1De: "Ich habe eine enge Familie mit zwei Geschwistern.",
    enV1: "relative", enV1POS: "noun", enV1Read: "REL-uh-tiv", enV1Def: "family member", enV1Hi: "रिश्तेदार", enV1Ar: "قريب", enV1Fr: "parent", enV1Es: "pariente", enV1De: "Verwandter", enV1Ex: "We visit our relatives every holiday.",
    frP1: "J'aime passer du temps avec mes amis proches.", frP1Read: "Zhem pah-say doo tahn ah-vek may zah-mee prohsh.", frP1En: "I love spending time with close friends.", frV1: "famille", frV1En: "family",
    esP1: "Mi familia siempre se reúne los domingos.", esP1Read: "Mee fah-MEE-lyah SYEM-preh seh reh-OO-neh lohs doh-MEEN-gohs.", esP1En: "My family always gathers on Sundays.", esV1: "amistad", esV1En: "friendship",
    deP1: "Ich habe ein sehr gutes Verhältnis zu meinen Eltern.", deP1Read: "Ikh HAH-buh eye-n zayr GOO-tes fehr-HELT-nis tsoo MY-nen EL-tern.", deP1En: "I have a very good relationship with my parents.", deV1: "Geschwister", deV1En: "siblings",
    arP1: "العائلة والأصدقاء هم أهم ما في حياتي.", arP1Read: "Al-'aa'ilatu wal-asdiqaa'u hum ahammu maa fee hayaatee.", arP1En: "Family and friends are the most important in my life.", arV1: "صداقة", arV1En: "friendship",
    hiP1: "मेरे परिवार में सभी एक-दूसरे का बहुत ध्यान रखते हैं।", hiP1Read: "Mere parivaar mein sabhi ek-doosre ka bahut dhyaan rakhte hain.", hiP1En: "Everyone in my family cares deeply for one another.", hiV1: "रिश्तेदार", hiV1En: "relative",
  },
  {
    name: "Food & Restaurant",
    category: "Dining & Practical",
    enSummary: "Order dishes, ask for recommendations, navigate dietary preferences, and handle restaurant bills.",
    enP1: "Could we please see the dinner menu and wine list?", enP1Read: "Kood wee pleez see the DIN-ner MEN-yoo and wyn list?",
    enP1Hi: "क्या हम कृपया खाने का मेनू देख सकते हैं?", enP1Ar: "هل يمكننا رؤية قائمة العشاء من فضلك؟", enP1Fr: "Pourrions-nous avoir le menu du dîner s'il vous plaît ?", enP1Es: "¿Podríamos ver el menú de la cena, por favor?", enP1De: "Könnten wir bitte die Speisekarte sehen?",
    enV1: "delicious", enV1POS: "adjective", enV1Read: "dih-LISH-us", enV1Def: "highly pleasant to the taste", enV1Hi: "स्वादिष्ट", enV1Ar: "لذيذ", enV1Fr: "délicieux", enV1Es: "delicioso", enV1De: "köstlich", enV1Ex: "This regional specialty is delicious.",
    frP1: "L'addition s'il vous plaît, nous avons très bien mangé.", frP1Read: "Lah-dee-syohn seel voo pleh, noo zah-vohn tray byen mahn-zhay.", frP1En: "The bill please, we ate very well.", frV1: "commander", frV1En: "to order",
    esP1: "¿Qué plato típico de la casa nos recomienda hoy?", esP1Read: "Keh PLAH-toh TEE-pee-koh deh lah KAH-sah nohs reh-koh-MYEHN-dah oy?", esP1En: "What house specialty dish do you recommend today?", esV1: "delicioso", esV1En: "delicious",
    deP1: "Wir möchten gerne die Rechnung bezahlen, bitte.", deP1Read: "Veer MURKH-ten GEHR-nuh dee REKH-noong buh-TSAH-len, BIT-tuh.", deP1En: "We would like to pay the bill, please.", deV1: "Speisekarte", deV1En: "menu",
    arP1: "من فضلك، أود أن أطلب الطبق الخاص لهذا اليوم.", arP1Read: "Min fadlika, awaddu an atloba at-tabaqa al-khaassa li-haadhaa al-yawm.", arP1En: "Please, I would like to order today's special dish.", arV1: "فاتورة", arV1En: "bill / check",
    hiP1: "कृपया आज का विशेष व्यंजन और बिल ले आइए।", hiP1Read: "Kripya aaj ka vishesh vyanjan aur bill le aaiye.", hiP1En: "Please bring today's special dish and the bill.", hiV1: "स्वादिष्ट", hiV1En: "delicious",
  },
  {
    name: "Shopping",
    category: "Practical",
    enSummary: "Inquire about prices, try on clothing sizes, explore discounts, and navigate retail transactions.",
    enP1: "Excuse me, how much does this jacket cost?", enP1Read: "Eks-KYOOS mee, how much duz this JAK-it kawst?",
    enP1Hi: "माफ कीजिए, इस जैकेट की कीमत कितनी है?", enP1Ar: "عذراً، كم سعر هذه السترة؟", enP1Fr: "Excusez-moi, combien coûte cette veste ?", enP1Es: "Disculpe, ¿cuánto cuesta esta chaqueta?", enP1De: "Entschuldigung, wie viel kostet diese Jacke?",
    enV1: "discount", enV1POS: "noun", enV1Read: "DIS-kownt", enV1Def: "deduction from usual cost", enV1Hi: "छूट", enV1Ar: "خصم", enV1Fr: "réduction", enV1Es: "descuento", enV1De: "Rabatt", enV1Ex: "Is there a seasonal discount on this item?",
    frP1: "Est-ce que je peux essayer ce modèle en taille moyenne ?", frP1Read: "Es-kuh zhuh puh eh-seh-yay suh moh-del ahn tie moy-yen?", frP1En: "Can I try this model in medium size?", frV1: "essayer", frV1En: "to try on",
    esP1: "¿Tiene este modelo en una talla más grande?", esP1Read: "TYEH-neh EHS-teh moh-DEH-loh en OO-nah TAH-yah mahs GRAHN-deh?", esP1En: "Do you have this model in a larger size?", esV1: "descuento", esV1En: "discount",
    deP1: "Kann ich dieses Hemd bitte anprobieren?", deP1Read: "Kahn ikh DEE-zes hemt BIT-tuh AHN-proh-bee-ren?", deP1En: "Can I try this shirt on, please?", deV1: "anprobieren", deV1En: "to try on",
    arP1: "هل يتوفر هذا القميص بمقاس أكبر ولون مختلف؟", arP1Read: "Hal yatawaffaru haadhaa al-qameesu bi-maqaasin akbar wa lawnin mukhtalif?", arP1En: "Is this shirt available in a larger size and different color?", arV1: "تخفيض", arV1En: "discount",
    hiP1: "क्या यह पोशाक किसी दूसरे रंग और नाप में उपलब्ध है?", hiP1Read: "Kya yeh poshaak kisi doosre rang aur naap mein uplabdh hai?", hiP1En: "Is this dress available in another color and size?", hiV1: "कीमत", hiV1En: "price",
  },
  {
    name: "Travel",
    category: "Travel & Directions",
    enSummary: "Navigate airports, book hotels, ask for directions, and explore historical monuments.",
    enP1: "Could you tell me how to get to the central station?", enP1Read: "Kood yoo tel mee how too get too the SEN-trul STAY-shun?",
    enP1Hi: "क्या आप मुझे बता सकते हैं कि सेंट्रल स्टेशन कैसे जाएँ?", enP1Ar: "هل يمكنك إخباري كيف أصل إلى المحطة المركزية؟", enP1Fr: "Pourriez-vous m'indiquer le chemin de la gare centrale ?", enP1Es: "¿Podría decirme cómo llegar a la estación central?", enP1De: "Könnten Sie mir sagen, wie ich zum Hauptbahnhof komme?",
    enV1: "destination", enV1POS: "noun", enV1Read: "des-tih-NAY-shun", enV1Def: "the place to which someone is going", enV1Hi: "गंतव्य", enV1Ar: "وجهة", enV1Fr: "destination", enV1Es: "destino", enV1De: "Reiseziel", enV1Ex: "Our travel destination is Paris.",
    frP1: "J'ai une réservation pour deux nuits sous le nom de Laurent.", frP1Read: "Zhay oon ray-zair-vah-syohn poor duh nwee soo luh nohm duh Loh-rahn.", frP1En: "I have a reservation for two nights under the name Laurent.", frV1: "voyage", frV1En: "journey",
    esP1: "¿A qué hora sale el próximo tren hacia Barcelona?", esP1Read: "Ah keh OH-rah SAH-leh el PROHK-see-moh tren ah-SYAH Bahr-seh-LOH-nah?", esP1En: "What time does the next train to Barcelona depart?", esV1: "billete", esV1En: "ticket",
    deP1: "Entschuldigung, wo befindet sich Gleis vier?", deP1Read: "Ent-SHOOL-dee-goong, voh buh-FIN-det zikh glys feer?", deP1En: "Excuse me, where is platform four located?", deV1: "Fahrkarte", deV1En: "ticket",
    arP1: "أين تقع صالة المغادرة لرحلات الطيران الدولية؟", arP1Read: "Ayna taqa'u saalatu al-mughaadarati li-rihlaati at-tayarani ad-duwaliyyah?", arP1En: "Where is the departure lounge for international flights located?", arV1: "تذكرة", arV1En: "ticket",
    hiP1: "हवाई अड्डे के लिए सबसे तेज़ रास्ता कौन सा है?", hiP1Read: "Hawaai adde ke liye sabse tez raasta kaun sa hai?", hiP1En: "Which is the fastest route to the airport?", hiV1: "यात्रा", hiV1En: "travel",
  },
  {
    name: "Workplace Conversation",
    category: "Professional",
    enSummary: "Collaborate on projects, communicate in meetings, align on deadlines, and exchange professional emails.",
    enP1: "Let's touch base tomorrow morning regarding project timelines.", enP1Read: "Lets tuch bays tuh-MOR-roh MOR-ning reh-GARD-ing PRAH-jekt TYM-lyns.",
    enP1Hi: "परियोजना की समय-सीमा के संबंध में कल सुबह बात करते हैं।", enP1Ar: "دعنا نتواصل صباح الغد بشأن الجداول الزمنية للمشروع.", enP1Fr: "Faisons le point demain matin sur le calendrier du projet.", enP1Es: "Pongámonos en contacto mañana por la mañana sobre los plazos del proyecto.", enP1De: "Lassen Sie uns morgen früh über den Projektzeitplan sprechen.",
    enV1: "deadline", enV1POS: "noun", enV1Read: "DED-lyn", enV1Def: "latest time by which something should be completed", enV1Hi: "अंतिम तिथि", enV1Ar: "موعد نهائي", enV1Fr: "date limite", enV1Es: "fecha límite", enV1De: "Frist", enV1Ex: "The submission deadline is Thursday at 5 PM.",
    frP1: "Nous devons respecter l'échéance fixée pour ce livrable.", frP1Read: "Noo duh-vohn reh-spek-tay lay-shay-ahns feek-say poor suh lee-vrah-bluh.", frP1En: "We must respect the deadline set for this deliverable.", frV1: "projet", frV1En: "project",
    esP1: "Vamos a coordinar la presentación con todo el equipo de diseño.", esP1Read: "VAH-mohs ah koh-or-dee-NAHR lah preh-sehn-tah-SYOHN kohn TOH-doh el eh-KEE-poh.", esP1En: "We are going to coordinate the presentation with the whole team.", esV1: "equipo", esV1En: "team",
    deP1: "Wir haben das Projektziel pünktlich erreicht.", deP1Read: "Veer HAH-ben dahs proh-YEKT-tseel POONKT-likh ehr-RYKHT.", deP1En: "We achieved the project goal right on time.", deV1: "Zusammenarbeit", deV1En: "collaboration",
    arP1: "أنجزنا جميع المهام المطلوبة قبل الموعد النهائي المحدد.", arP1Read: "Anjaznaa jamee'a al-mahaammi al-matloobati qabla al-maw'idi an-nihaa'iyyi al-muhaddad.", arP1En: "We completed all required tasks before the scheduled deadline.", arV1: "مشروع", arV1En: "project",
    hiP1: "हम सभी सहकर्मियों के सहयोग से काम समय पर पूरा करेंगे।", hiP1Read: "Hum sabhi sah-karmiyon ke sahyog se kaam samay par poora karenge.", hiP1En: "We will complete the work on time with all colleagues' cooperation.", hiV1: "सहयोग", hiV1En: "collaboration",
  },
  {
    name: "Job Interview",
    category: "Career & Interview",
    enSummary: "Present your qualifications, discuss professional achievements, and respond to behavioral interview questions.",
    enP1: "My primary strength is delivering complex software projects on schedule.", enP1Read: "My PRY-mair-ee strength iz dih-LIV-er-ing KAHM-pleks SAHFT-wair PRAH-jekts.",
    enP1Hi: "मेरी मुख्य ताकत समय पर जटिल सॉफ्टवेयर परियोजनाओं को पूरा करना है।", enP1Ar: "نقطة قوتي الرئيسية هي تسليم البرمجيات المعقدة في موعدها.", enP1Fr: "Ma force principale est de livrer des projets complexes dans les délais.", enP1Es: "Mi mayor fortaleza es entregar proyectos complejos puntualmente.", enP1De: "Meine Stärke ist die termingerechte Umsetzung komplexer Projekte.",
    enV1: "experience", enV1POS: "noun", enV1Read: "ek-SPEER-ee-ens", enV1Def: "knowledge gained over time", enV1Hi: "अनुभव", enV1Ar: "خبرة", enV1Fr: "expérience", enV1Es: "experiencia", enV1De: "Erfahrung", enV1Ex: "I have five years of hands-on experience in cloud architecture.",
    frP1: "J'ai développé une solide expertise en gestion de projets numériques.", frP1Read: "Zhay day-vuh-loh-pay oon soh-leed ex-pehr-teez.", frP1En: "I have developed solid expertise in digital project management.", frV1: "compétence", frV1En: "competence",
    esP1: "Cuento con más de cinco años de experiencia liderando equipos técnicos.", esP1Read: "KWEHN-toh kohn mahs deh SEEN-koh AH-nyohs deh ex-peh-RYEHN-syah.", esP1En: "I have over five years of experience leading technical teams.", esV1: "liderazgo", esV1En: "leadership",
    deP1: "Ich bringe mehrjährige Erfahrung im internationalen Projektmanagement mit.", deP1Read: "Ikh BRING-uh mayr-YAY-ree-guh ehr-FAH-roong mit.", deP1En: "I bring multi-year experience in international project management.", deV1: "Erfahrung", deV1En: "experience",
    arP1: "أمتلك خبرة واسعة تمتد لخمس سنوات في تطوير المنصات التقنية الحديثة.", arP1Read: "Amtaliku khibratan waasi'atan tamtaddu li-khamsi sanawaatin.", arP1En: "I possess extensive 5-year experience developing modern tech platforms.", arV1: "خبرة", arV1En: "experience",
    hiP1: "मेरे पास सॉफ्टवेयर विकास में पाँच वर्षों का व्यावहारिक अनुभव है।", hiP1Read: "Mere paas software vikaas mein paanch varshon ka vyavahaarik anubhav hai.", hiP1En: "I have five years of practical experience in software development.", hiV1: "अनुभव", hiV1En: "experience",
  },
  {
    name: "Phone & Online Conversation",
    category: "Communication",
    enSummary: "Handle voice calls, verify audio quality, manage interruptions, and schedule virtual conference calls.",
    enP1: "Could you please speak a little louder? The connection is breaking up.", enP1Read: "Kood yoo pleez speek a LIT-tul LOW-der? The kuh-NEK-shun iz BRAY-king up.",
    enP1Hi: "क्या आप कृपया थोड़ा जोर से बोलेंगे? आवाज़ कट रही है।", enP1Ar: "هل يمكنك التحدث بصوت أعلى قليلاً؟ الصوت يتقطع.", enP1Fr: "Pourriez-vous parler un peu plus fort ? La communication coupe.", enP1Es: "¿Podrías hablar un poco más alto? Se corta la llamada.", enP1De: "Könnten Sie bitte etwas lauter sprechen? Die Verbindung bricht ab.",
    enV1: "connection", enV1POS: "noun", enV1Read: "kuh-NEK-shun", enV1Def: "relationship or link in communication", enV1Hi: "संपर्क / आवाज़ की कड़ी", enV1Ar: "اتصال", enV1Fr: "connexion", enV1Es: "conexión", enV1De: "Verbindung", enV1Ex: "The audio connection is crystal clear now.",
    frP1: "Je vous rappelle dès que j'ai vérifié les détails du dossier.", frP1Read: "Zhuh voo rah-pell deh kuh zhay vay-ree-fyay lay day-tie.", frP1En: "I will call you back as soon as I check the file details.", frV1: "appel", frV1En: "call",
    esP1: "Disculpa, ¿me escuchas bien o hay interferencia en la línea?", esP1Read: "Dees-KOOL-pah, meh ehs-KOO-chahs byen oh eye een-tehr-feh-RYEHN-syah?", esP1En: "Excuse me, can you hear me well or is there line interference?", esV1: "llamada", esV1En: "call",
    deP1: "Ich kann Sie jetzt sehr gut und deutlich verstehen.", deP1Read: "Ikh kahn zee yetst zayr goot oont DOYT-likh fehr-SHTAY-en.", deP1En: "I can hear and understand you very well and clearly now.", deV1: "Gespräch", deV1En: "conversation",
    arP1: "عفواً، هل يمكنك إعادة الجملة الأخيرة؟ انقطع الصوت لثوانٍ.", arP1Read: "'Afwan, hal yumkinuka i'aadatu al-jumlati al-akheerah? Inqata'a as-sawt.", arP1En: "Excuse me, could you repeat the last sentence? The audio cut out.", arV1: "مكالمة", arV1En: "phone call",
    hiP1: "क्या आपको मेरी आवाज़ साफ़ सुनाई दे रही है?", hiP1Read: "Kya aapko meri aawaaz saaf sunaai de rahi hai?", hiP1En: "Can you hear my voice clearly?", hiV1: "संपर्क", hiV1En: "connection",
  },
  {
    name: "Free Conversation",
    category: "Fluency & Discussion",
    enSummary: "Express opinions freely, debate perspectives, exchange cultural insights, and develop spontaneous fluency.",
    enP1: "In my opinion, learning multiple languages opens entirely new worldviews.", enP1Read: "In my oh-PIN-yun, LER-ning MUL-tuh-pul LANG-gwij-iz OH-pinz noo werld-vyooz.",
    enP1Hi: "मेरी राय में, कई भाषाएँ सीखना दुनिया को देखने का बिल्कुल नया नज़रिया देता है।", enP1Ar: "في رأيي، تعلم لغات متعددة يفتح آفاقاً جديدة تماماً.", enP1Fr: "À mon avis, apprendre plusieurs langues ouvre des perspectives totalement nouvelles.", enP1Es: "En mi opinión, aprender varios idiomas abre perspectivas totalmente nuevas.", enP1De: "Meiner Meinung nach eröffnet das Erlernen mehrerer Sprachen neue Horizonte.",
    enV1: "perspective", enV1POS: "noun", enV1Read: "per-SPEK-tiv", enV1Def: "a particular attitude toward something; point of view", enV1Hi: "दृष्टिकोण", enV1Ar: "منظور / وجهة نظر", enV1Fr: "perspective", enV1Es: "perspectiva", enV1De: "Perspektive", enV1Ex: "Traveling broadens your global perspective.",
    frP1: "Je trouve passionnant d'échanger sur nos différentes traditions culturelles.", frP1Read: "Zhuh troov pah-syoh-nahn day-shahn-zhay soor noh trah-dee-syohn.", frP1En: "I find it fascinating to exchange on our different cultural traditions.", frV1: "opinion", frV1En: "opinion",
    esP1: "Creo firmemente que la comunicación intercultural enriquece a la sociedad.", esP1Read: "KREH-oh feer-meh-MEN-teh keh lah koh-moo-nee-kah-SYOHN...", esP1En: "I firmly believe that intercultural communication enriches society.", esV1: "perspectiva", esV1En: "perspective",
    deP1: "Der offene Austausch über verschiedene Kulturen bereichert unser Denken.", deP1Read: "Dayr OF-feh-nuh OWS-towsh bay-RY-khert OON-zehr DENG-ken.", deP1En: "Open exchange about different cultures enriches our thinking.", deV1: "Meinung", deV1En: "opinion",
    arP1: "الحوار الثقافي المفتوح يبني جسور التفاهم والتعايش السلمي بين الشعوب.", arP1Read: "Al-hiwaaru ath-thaqaafiyyu al-maftoohu yabnee jusoora at-tafaahum.", arP1En: "Open cultural dialogue builds bridges of understanding and peaceful coexistence.", arV1: "رأي", arV1En: "opinion",
    hiP1: "खुले मन से संवाद करने से विभिन्न संस्कृतियों की समझ गहरी होती है।", hiP1Read: "Khule man se samvaad karne se vibhinn sanskritiyon ki samajh gehri hoti hai.", hiP1En: "Communicating with an open mind deepens understanding of different cultures.", hiV1: "दृष्टिकोण", hiV1En: "perspective",
  },
];

// Populate SITUATIONS_DB with situation configs
for (const cfg of SITUATION_CONFIGS) {
  SITUATIONS_DB[cfg.name] = {
    summary: {
      English: cfg.enSummary,
      French: "Maîtrisez cette compétence clé avec des dialogues naturels, du vocabulaire ciblé et des règles claires.",
      Spanish: "Domina esta situación práctica con diálogos naturales, vocabulario esencial y explicaciones claras.",
      German: "Meistern Sie diese praktische Situation mit authentischen Dialogen und klaren Grammatikerklärungen.",
      Arabic: "أتقن هذا الموقف العملي بمحادثات طبيعية، ومفردات أساسية، وقواعد لغوية واضحة ومبسطة.",
      Hindi: "इस व्यावहारिक स्थिति में स्वाभाविक संवाद, महत्वपूर्ण शब्दावली और स्पष्ट व्याकरण सीखें।",
    },
    phrases: {
      English: [
        {
          target: cfg.enP1,
          read: cfg.enP1Read,
          meaning: {
            Hindi: cfg.enP1Hi,
            Arabic: cfg.enP1Ar,
            French: cfg.enP1Fr,
            Spanish: cfg.enP1Es,
            German: cfg.enP1De,
            English: cfg.enP1,
          },
        },
      ],
      French: [
        {
          target: cfg.frP1,
          read: cfg.frP1Read,
          meaning: {
            English: cfg.frP1En,
            Hindi: cfg.enP1Hi,
            Arabic: cfg.enP1Ar,
            Spanish: cfg.esP1,
            German: cfg.deP1,
            French: cfg.frP1,
          },
        },
      ],
      Spanish: [
        {
          target: cfg.esP1,
          read: cfg.esP1Read,
          meaning: {
            English: cfg.esP1En,
            Hindi: cfg.enP1Hi,
            Arabic: cfg.enP1Ar,
            French: cfg.frP1,
            German: cfg.deP1,
            Spanish: cfg.esP1,
          },
        },
      ],
      German: [
        {
          target: cfg.deP1,
          read: cfg.deP1Read,
          meaning: {
            English: cfg.deP1En,
            Hindi: cfg.enP1Hi,
            Arabic: cfg.enP1Ar,
            French: cfg.frP1,
            Spanish: cfg.esP1,
            German: cfg.deP1,
          },
        },
      ],
      Arabic: [
        {
          target: cfg.arP1,
          read: cfg.arP1Read,
          meaning: {
            English: cfg.arP1En,
            Hindi: cfg.enP1Hi,
            French: cfg.frP1,
            Spanish: cfg.esP1,
            German: cfg.deP1,
            Arabic: cfg.arP1,
          },
        },
      ],
      Hindi: [
        {
          target: cfg.hiP1,
          read: cfg.hiP1Read,
          meaning: {
            English: cfg.hiP1En,
            Arabic: cfg.enP1Ar,
            French: cfg.frP1,
            Spanish: cfg.esP1,
            German: cfg.deP1,
            Hindi: cfg.hiP1,
          },
        },
      ],
    },
    vocab: {
      English: [
        {
          word: cfg.enV1,
          partOfSpeech: cfg.enV1POS,
          read: cfg.enV1Read,
          meaning: {
            Hindi: cfg.enV1Hi,
            Arabic: cfg.enV1Ar,
            French: cfg.enV1Fr,
            Spanish: cfg.enV1Es,
            German: cfg.enV1De,
            English: cfg.enV1Def,
          },
          example: cfg.enV1Ex,
        },
      ],
      French: [
        {
          word: cfg.frV1,
          partOfSpeech: "nom",
          read: cfg.frV1,
          meaning: {
            English: cfg.frV1En,
            Hindi: cfg.enV1Hi,
            Arabic: cfg.enV1Ar,
            Spanish: cfg.esV1,
            German: cfg.deV1,
            French: cfg.frV1En,
          },
          example: "Un mot essentiel dans notre leçon.",
        },
      ],
      Spanish: [
        {
          word: cfg.esV1,
          partOfSpeech: "sustantivo",
          read: cfg.esV1,
          meaning: {
            English: cfg.esV1En,
            Hindi: cfg.enV1Hi,
            Arabic: cfg.enV1Ar,
            French: cfg.frV1,
            German: cfg.deV1,
            Spanish: cfg.esV1En,
          },
          example: "Un término clave en esta situación.",
        },
      ],
      German: [
        {
          word: cfg.deV1,
          partOfSpeech: "Nomen",
          read: cfg.deV1,
          meaning: {
            English: cfg.deV1En,
            Hindi: cfg.enV1Hi,
            Arabic: cfg.enV1Ar,
            French: cfg.frV1,
            Spanish: cfg.esV1,
            German: cfg.deV1En,
          },
          example: "Ein wichtiger Begriff für den Alltag.",
        },
      ],
      Arabic: [
        {
          word: cfg.arV1,
          partOfSpeech: "اسم",
          read: cfg.arV1,
          meaning: {
            English: cfg.arV1En,
            Hindi: cfg.enV1Hi,
            French: cfg.frV1,
            Spanish: cfg.esV1,
            German: cfg.deV1,
            Arabic: cfg.arV1En,
          },
          example: "كلمة أساسية ومفيدة جداً.",
        },
      ],
      Hindi: [
        {
          word: cfg.hiV1,
          partOfSpeech: "संज्ञा",
          read: cfg.hiV1,
          meaning: {
            English: cfg.hiV1En,
            Arabic: cfg.enV1Ar,
            French: cfg.frV1,
            Spanish: cfg.esV1,
            German: cfg.deV1,
            Hindi: cfg.hiV1En,
          },
          example: "दैनिक बातचीत के लिए यह आवश्यक शब्द है।",
        },
      ],
    },
    listening: {
      English: [
        {
          audioPrompt: cfg.enP1,
          speakerRole: "Native Speaker",
          comprehensionQuestion: `What is the central focus of this phrase?`,
          options: [cfg.enV1Def, "Irrelevant noise", "Opposite meaning", "Random grammar"],
          correctIndex: 0,
          explanation: `The prompt clearly highlights ${cfg.enV1Def}.`,
        },
      ],
      French: [
        {
          audioPrompt: cfg.frP1,
          speakerRole: "Locuteur natif",
          comprehensionQuestion: "Quel est le sujet principal évoqué ?",
          options: [cfg.frV1En, "Sujet hors propos", "Bruit aléatoire", "Silence"],
          correctIndex: 0,
          explanation: "La phrase porte sur cette situation pratique.",
        },
      ],
      Spanish: [
        {
          audioPrompt: cfg.esP1,
          speakerRole: "Hablante nativo",
          comprehensionQuestion: "¿Cuál es el tema central de la conversación?",
          options: [cfg.esV1En, "Tema irrelevante", "Error de sonido", "Sin sentido"],
          correctIndex: 0,
          explanation: "El enunciado aborda esta temática cotidiana.",
        },
      ],
      German: [
        {
          audioPrompt: cfg.deP1,
          speakerRole: "Muttersprachler",
          comprehensionQuestion: "Was ist das Hauptthema dieses Satzes?",
          options: [cfg.deV1En, "Unwichtiges Thema", "Geräusch", "Kein Inhalt"],
          correctIndex: 0,
          explanation: "Der Sprecher betont genau diesen Sachverhalt.",
        },
      ],
      Arabic: [
        {
          audioPrompt: cfg.arP1,
          speakerRole: "متحدث أصلي",
          comprehensionQuestion: "ما هو المحور الأساسي لهذه العبارة؟",
          options: [cfg.arV1En, "موضوع عشوائي", "لا معنى له", "صوت غير واضح"],
          correctIndex: 0,
          explanation: "العبارة تركز بوضوح على هذا المعنى العملي.",
        },
      ],
      Hindi: [
        {
          audioPrompt: cfg.hiP1,
          speakerRole: "देशी वक्ता",
          comprehensionQuestion: "इस कथन का मुख्य भाव क्या है?",
          options: [cfg.hiV1En, "अनुचित विषय", "कोई अर्थ नहीं", "गलत वाक्य"],
          correctIndex: 0,
          explanation: "यह वाक्य इस व्यावहारिक स्थिति को स्पष्ट करता है।",
        },
      ],
    },
    speaking: {
      English: [
        {
          promptPhrase: cfg.enP1,
          phoneticGuide: cfg.enP1Read,
          translation: {
            Hindi: cfg.enP1Hi,
            Arabic: cfg.enP1Ar,
            French: cfg.enP1Fr,
            Spanish: cfg.enP1Es,
            German: cfg.enP1De,
            English: cfg.enP1,
          },
          pronunciationTip: "Speak with natural rhythm and clear vowel sounds.",
          expectedKeywords: [cfg.enV1],
        },
      ],
      French: [
        {
          promptPhrase: cfg.frP1,
          phoneticGuide: cfg.frP1Read,
          translation: {
            English: cfg.frP1En,
            Hindi: cfg.enP1Hi,
            Arabic: cfg.enP1Ar,
            Spanish: cfg.esP1,
            German: cfg.deP1,
            French: cfg.frP1,
          },
          pronunciationTip: "Articulez distinctement les liaisons et voyelles nasales.",
          expectedKeywords: [cfg.frV1],
        },
      ],
      Spanish: [
        {
          promptPhrase: cfg.esP1,
          phoneticGuide: cfg.esP1Read,
          translation: {
            English: cfg.esP1En,
            Hindi: cfg.enP1Hi,
            Arabic: cfg.enP1Ar,
            French: cfg.frP1,
            German: cfg.deP1,
            Spanish: cfg.esP1,
          },
          pronunciationTip: "Mantén vocales puras y ritmo fluido.",
          expectedKeywords: [cfg.esV1],
        },
      ],
      German: [
        {
          promptPhrase: cfg.deP1,
          phoneticGuide: cfg.deP1Read,
          translation: {
            English: cfg.deP1En,
            Hindi: cfg.enP1Hi,
            Arabic: cfg.enP1Ar,
            French: cfg.frP1,
            Spanish: cfg.esP1,
            German: cfg.deP1,
          },
          pronunciationTip: "Achten Sie auf klare Konsonanten am Wortende.",
          expectedKeywords: [cfg.deV1],
        },
      ],
      Arabic: [
        {
          promptPhrase: cfg.arP1,
          phoneticGuide: cfg.arP1Read,
          translation: {
            English: cfg.arP1En,
            Hindi: cfg.enP1Hi,
            French: cfg.frP1,
            Spanish: cfg.esP1,
            German: cfg.deP1,
            Arabic: cfg.arP1,
          },
          pronunciationTip: "أخرج الحروف الحلقية برقة وتأنٍ دون شدة.",
          expectedKeywords: [cfg.arV1],
        },
      ],
      Hindi: [
        {
          promptPhrase: cfg.hiP1,
          phoneticGuide: cfg.hiP1Read,
          translation: {
            English: cfg.hiP1En,
            Arabic: cfg.enP1Ar,
            French: cfg.frP1,
            Spanish: cfg.esP1,
            German: cfg.deP1,
            Hindi: cfg.hiP1,
          },
          pronunciationTip: "मात्राओं का उच्चारण स्पष्ट और सहज रखें।",
          expectedKeywords: [cfg.hiV1],
        },
      ],
    },
    conversation: {
      English: {
        scenario: `You are practicing a scenario about ${cfg.name}.`,
        role: "Learner",
        aiRole: "AI Language Partner",
        starterPrompt: cfg.enP1,
        suggestedPhrases: [cfg.enP1, `Tell me more about ${cfg.enV1}.`, "That sounds very interesting!"],
      },
      French: {
        scenario: `Mise en situation pratique : ${cfg.name}.`,
        role: "Apprenant",
        aiRole: "Partenaire linguistique IA",
        starterPrompt: cfg.frP1,
        suggestedPhrases: [cfg.frP1, "C'est très intéressant.", "Pouvez-vous m'en dire plus ?"],
      },
      Spanish: {
        scenario: `Práctica interactiva sobre ${cfg.name}.`,
        role: "Estudiante",
        aiRole: "Tutor virtual de idiomas",
        starterPrompt: cfg.esP1,
        suggestedPhrases: [cfg.esP1, "¡Qué interesante!", "¿Puedes contarme más detalles?"],
      },
      German: {
        scenario: `Interaktive Gesprächsübung zu ${cfg.name}.`,
        role: "Lernender",
        aiRole: "KI-Gesprächspartner",
        starterPrompt: cfg.deP1,
        suggestedPhrases: [cfg.deP1, "Das ist sehr interessant.", "Können Sie mir mehr dazu erzählen?"],
      },
      Arabic: {
        scenario: `محاكاة حوارية تفاعلية حول ${cfg.name}.`,
        role: "المتعلم",
        aiRole: "المعلم الذكي",
        starterPrompt: cfg.arP1,
        suggestedPhrases: [cfg.arP1, "هذا رائع ومفيد جداً.", "هل يمكنك توضيح المزيد؟"],
      },
      Hindi: {
        scenario: `${cfg.name} पर आधारित स्वाभाविक बातचीत अभ्यास।`,
        role: "शिक्षार्थी",
        aiRole: "एआई भाषा मित्र",
        starterPrompt: cfg.hiP1,
        suggestedPhrases: [cfg.hiP1, "यह बहुत दिलचस्प है।", "कृपया इसके बारे में और बताएं।"],
      },
    },
    practice: {
      English: [
        {
          id: `${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-p1`,
          prompt: `What does the key vocabulary term '${cfg.enV1}' mean?`,
          type: "multiple_choice",
          options: [cfg.enV1Def, "A heavy vehicle", "A musical instrument", "A cold beverage"],
          correctAnswer: cfg.enV1Def,
          explanation: `'${cfg.enV1}' refers to ${cfg.enV1Def}.`,
        },
      ],
      French: [
        {
          id: `${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-fr-p1`,
          prompt: `Que signifie le mot clé '${cfg.frV1}' ?`,
          type: "multiple_choice",
          options: [cfg.frV1En, "Un véhicule", "Un instrument", "Une boisson"],
          correctAnswer: cfg.frV1En,
          explanation: `Ce terme se traduit par '${cfg.frV1En}'.`,
        },
      ],
      Spanish: [
        {
          id: `${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-es-p1`,
          prompt: `¿Qué significa el término clave '${cfg.esV1}'?`,
          type: "multiple_choice",
          options: [cfg.esV1En, "Un vehículo pesado", "Un instrumento musical", "Una bebida fría"],
          correctAnswer: cfg.esV1En,
          explanation: `El término equivale a '${cfg.esV1En}'.`,
        },
      ],
      German: [
        {
          id: `${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-de-p1`,
          prompt: `Was bedeutet das Schlüsselwort '${cfg.deV1}'?`,
          type: "multiple_choice",
          options: [cfg.deV1En, "Ein schweres Fahrzeug", "Ein Musikinstrument", "Ein kaltes Getränk"],
          correctAnswer: cfg.deV1En,
          explanation: `'${cfg.deV1}' entspricht '${cfg.deV1En}'.`,
        },
      ],
      Arabic: [
        {
          id: `${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-ar-p1`,
          prompt: `ما المعنى المناسب للكلمة '${cfg.arV1}'؟`,
          type: "multiple_choice",
          options: [cfg.arV1En, "مركبة ثقيلة", "آلة موسيقية", "مشروب بارد"],
          correctAnswer: cfg.arV1En,
          explanation: `الكلمة تعني '${cfg.arV1En}'.`,
        },
      ],
      Hindi: [
        {
          id: `${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-hi-p1`,
          prompt: `मुख्य शब्द '${cfg.hiV1}' का क्या अर्थ है?`,
          type: "multiple_choice",
          options: [cfg.hiV1En, "एक भारी वाहन", "एक वाद्य यंत्र", "एक ठंडा पेय"],
          correctAnswer: cfg.hiV1En,
          explanation: `यह शब्द '${cfg.hiV1En}' को दर्शाता है।`,
        },
      ],
    },
    quiz: {
      English: [
        {
          id: `${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-q1`,
          question: `Which phrase is most natural when discussing ${cfg.name}?`,
          options: [cfg.enP1, "Leave me alone completely.", "I dislike all words.", "Zero conversation please."],
          correctIndex: 0,
          explanation: `'${cfg.enP1}' is authentic and natural in this context.`,
        },
      ],
      French: [
        {
          id: `${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-fr-q1`,
          question: `Quelle expression est la plus appropriée pour ${cfg.name} ?`,
          options: [cfg.frP1, "Ne me parlez pas.", "Je refuse tout mot.", "Silence total."],
          correctIndex: 0,
          explanation: "Cette phrase correspond fidèlement au contexte étudié.",
        },
      ],
      Spanish: [
        {
          id: `${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-es-q1`,
          question: `¿Qué expresión es más natural en ${cfg.name}?`,
          options: [cfg.esP1, "No me hables.", "Cero palabras.", "Adiós sin motivo."],
          correctIndex: 0,
          explanation: "Expresa con naturalidad la idea en español.",
        },
      ],
      German: [
        {
          id: `${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-de-q1`,
          question: `Welcher Ausdruck passt am besten zu ${cfg.name}?`,
          options: [cfg.deP1, "Sprechen Sie nicht mit mir.", "Kein Wort bitte.", "Auf Wiedersehen ohne Grund."],
          correctIndex: 0,
          explanation: "Dieser Satz ist authentisch und standardsprachlich.",
        },
      ],
      Arabic: [
        {
          id: `${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-ar-q1`,
          question: `أي من العبارات الآتية هي الأنسب لسياق ${cfg.name}؟`,
          options: [cfg.arP1, "لا تتحدث معي إطلاقاً.", "أرفض جميع الكلمات.", "صمت تام من فضلك."],
          correctIndex: 0,
          explanation: "تعد العبارة من الأنماط الشائعة والمعتمدة في هذا الموقف.",
        },
      ],
      Hindi: [
        {
          id: `${cfg.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-hi-q1`,
          question: `${cfg.name} के संदर्भ में कौन सा वाक्य सबसे स्वाभाविक है?`,
          options: [cfg.hiP1, "मुझसे बिल्कुल बात न करें।", "मुझे शब्द पसंद नहीं।", "कोई संवाद नहीं चाहिए।"],
          correctIndex: 0,
          explanation: "यह वाक्य इस विषय के लिए सटीक और स्वाभाविक है।",
        },
      ],
    },
  };
}

// Target Language Grammar Rules Generator
function getGrammarSection(situationTitle: string, targetLangName: string): GrammarSection {
  const normTarget = normalizeLanguageName(targetLangName);

  if (normTarget === "French") {
    return {
      title: "Grammaire Française : Être, Avoir et le Genre Grammatical",
      explanation:
        "En français, tous les noms ont un genre (masculin ou féminin) qui détermine les articles (un/une, le/la) et l'accord des adjectifs. Les verbes auxiliaires 'être' et 'avoir' sont les piliers essentiels de toute communication.",
      rule: "Sujet + Verbe (Accordé) + Complément / Adjectif (Accordé en genre et nombre)",
      examples: [
        {
          sentence: "Je suis ravi de faire votre connaissance.",
          breakdown: "Sujet 'Je' + auxiliaire être 'suis' + adjectif masculin singulier 'ravi'.",
        },
        {
          sentence: "Elle a une réunion importante ce matin.",
          breakdown: "Sujet 'Elle' + verbe avoir 'a' + article indéfini féminin 'une' + nom.",
        },
      ],
      tip: "Pensez toujours à vérifier le genre du nom pour choisir entre 'le' ou 'la', 'un' ou 'une'.",
    };
  }

  if (normTarget === "Spanish") {
    return {
      title: "Gramática Española: Ser vs. Estar y la Concordancia de Género",
      explanation:
        "En español, distinguimos entre 'ser' (cualidades permanentes, identidad, origen) y 'estar' (estados transitorios, emociones, ubicación). Además, los sustantivos y adjetivos concuerdan en género (masculino/femenino) y número.",
      rule: "Sujeto + Verbo (Ser/Estar conjugado) + Adjetivo/Complemento (Concordancia obligatoria)",
      examples: [
        {
          sentence: "Yo soy profesor y estoy muy contento hoy.",
          breakdown: "'Soy' (identidad permanente) + 'estoy' (estado de ánimo temporal).",
        },
        {
          sentence: "La casa es hermosa y está en el centro.",
          breakdown: "'Es' describe una característica; 'está' indica su ubicación geográfica.",
        },
      ],
      tip: "Recuerda: usa 'ser' para decir quién eres o de dónde vienes, y 'estar' para decir cómo te sientes o dónde te encuentras.",
    };
  }

  if (normTarget === "German") {
    return {
      title: "Deutsche Grammatik: Sein, Haben und die Verbposition (V2-Regel)",
      explanation:
        "Im deutschen Hauptsatz steht das konjugierte Verb immer an zweiter Position (V2). Substantive haben drei Genera (der, die, das) und werden nach vier Fällen dekliniert (Nominativ, Akkusativ, Dativ, Genitiv).",
      rule: "Position 1 (Subjekt/Zeit) + Position 2 (Konjugiertes Verb) + Mittelfeld + Satzende",
      examples: [
        {
          sentence: "Heute lerne ich die deutsche Sprache.",
          breakdown: "Position 1: Zeitadverb 'Heute' | Position 2: Verb 'lerne' | Subjekt 'ich'.",
        },
        {
          sentence: "Ich habe einen neuen Termin im Büro.",
          breakdown: "Akkusativ maskulin: 'einen neuen Termin' nach dem transitiven Verb 'haben'.",
        },
      ],
      tip: "Achten Sie darauf, dass das Verb im Hauptsatz immer an zweiter Stelle steht, auch wenn der Satz mit einer Zeitangabe beginnt!",
    };
  }

  if (normTarget === "Arabic") {
    return {
      title: "قواعد اللغة العربية: الجملة الاسمية والمطابقة في التذكير والتأنيث",
      explanation:
        "في اللغة العربية، تبدأ الجملة الاسمية بمبتدأ يليه خبر دون حاجة إلى فعل كينونة في المضارع. وتتطابق الصفة مع الموصوف في الإعراب والتعريف والتنكير والجنس والعدد.",
      rule: "المبتدأ (معرفة مرفوع) + الخبر (نكرة مرفوع يتمم المعنى) + النعت (يتبع المنعوت)",
      examples: [
        {
          sentence: "الطقسُ جميلٌ اليوم.",
          breakdown: "المبتدأ 'الطقسُ' معرف بـ (الـ) مرفوع بالضمة، والخبر 'جميلٌ' نكرة مرفوع يتمم المعنى.",
        },
        {
          sentence: "أنا طالبٌ مجتهدٌ في دراستي.",
          breakdown: "الضمير المنفصل 'أنا' في محل رفع مبتدأ، 'طالبٌ' خبر، و'مجتهدٌ' صفة تتبع المنعوت.",
        },
      ],
      tip: "تذكر دائماً أن الصفة في العربية تتبع الموصوف في كل شيء: في التعريف والتنكير والتذكير والتأنيث!",
    };
  }

  if (normTarget === "Hindi") {
    return {
      title: "हिन्दी व्याकरण: कर्ता-कर्म-क्रिया (SOV) क्रम और परसर्ग (कारक)",
      explanation:
        "हिन्दी वाक्यों की मुख्य संरचना SOV (कर्ता + कर्म + क्रिया) होती है। क्रिया सदैव कर्ता या कर्म के लिंग और वचन के अनुसार बदलती है। परसर्ग (में, पर, से, को, का/के/की) शब्दों को जोड़ते हैं।",
      rule: "कर्ता (Subject) + परसर्ग/कर्म (Object) + सहायक क्रिया सहित मुख्य क्रिया (Verb)",
      examples: [
        {
          sentence: "मैं रोज़ सुबह हिन्दी सीखता हूँ।",
          breakdown: "कर्ता 'मैं' (Subject) + काल/कर्म 'सुबह हिन्दी' (Object) + क्रिया 'सीखता हूँ' (Verb).",
        },
        {
          sentence: "हम कार्यालय में बातचीत कर रहे हैं।",
          breakdown: "कर्ता 'हम' + स्थान परसर्ग 'कार्यालय में' + क्रिया 'कर रहे हैं'.",
        },
      ],
      tip: "हिन्दी बोलते समय क्रिया को सदैव वाक्य के अंत में रखें और आदर के लिए 'आप' के साथ बहुवचन क्रिया का प्रयोग करें।",
    };
  }

  // Default: English Grammar Engine
  return {
    title: `English Grammar Mastery: Core Patterns for ${situationTitle}`,
    explanation:
      "English sentences follow a standard Subject-Verb-Object (SVO) pattern. Verbs inflect for tense and aspect (Present Simple for habits, Continuous for ongoing actions), while prepositions specify time and location.",
    rule: "Subject + Modal/Auxiliary Verb + Base Verb + Direct Object + Contextual Modifiers",
    examples: [
      {
        sentence: "I practice English speaking skills every single morning.",
        breakdown: "Subject 'I' + base verb 'practice' + noun phrase object + time adverbial.",
      },
      {
        sentence: "She is working diligently on her presentation.",
        breakdown: "Subject 'She' + auxiliary 'is' + present participle 'working' + adverb of manner.",
      },
    ],
    tip: "Keep subject-verb agreement consistent: third-person singular subjects (he, she, it) take '-s' or '-es' in the present simple!",
  };
}

// =========================================================================
// PARSER & COMPREHENSIVE GENERATOR
// =========================================================================

/**
 * Intelligent parser:
 * Converts any Lesson record from PostgreSQL into a rich 8-stage StructuredLessonContent
 * supporting all 6 target languages and all 6 source languages!
 */
export function parseLessonContent(
  lesson: LessonItem,
  sourceLangName: string = "Hindi",
  targetLangName: string = "English"
): StructuredLessonContent {
  const normSource = normalizeLanguageName(sourceLangName);
  const normTarget = normalizeLanguageName(targetLangName);
  const isRTL = isRtlLanguage(normTarget);

  // 1. Check if database content already contains a pre-rendered JSON bundle
  if (lesson.content && lesson.content.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(lesson.content);
      if (parsed.introduction && parsed.vocabulary && parsed.grammar && parsed.quiz) {
        return {
          ...parsed,
          targetLanguage: normTarget,
          sourceLanguage: normSource,
          isRTL,
          listening: parsed.listening || [],
          speaking: parsed.speaking || [],
          conversation: parsed.conversation || {
            scenario: `Practice ${lesson.title}`,
            role: "Learner",
            aiRole: "Tutor",
            starterPrompt: "Hello! Let's practice.",
            suggestedPhrases: ["Hello!", "I am ready."],
          },
        } as StructuredLessonContent;
      }
    } catch {
      // Continue to fallback
    }
  }

  // 2. Identify matching situation (handling aliases)
  let matchedKey = Object.keys(SITUATIONS_DB).find(
    (k) => k.toLowerCase() === lesson.title.toLowerCase()
  );

  // Alias resolution
  if (!matchedKey) {
    const titleLower = lesson.title.toLowerCase();
    if (titleLower.includes("greet") || titleLower.includes("everyday basics") || titleLower.includes("introduc")) {
      matchedKey = "Greetings & Introductions";
    } else if (titleLower.includes("daily") || titleLower.includes("routine")) {
      matchedKey = "Daily Conversation";
    } else if (titleLower.includes("family") || titleLower.includes("friend")) {
      matchedKey = "Family & Friends";
    } else if (titleLower.includes("food") || titleLower.includes("restaurant") || titleLower.includes("dining")) {
      matchedKey = "Food & Restaurant";
    } else if (titleLower.includes("shop") || titleLower.includes("store") || titleLower.includes("market")) {
      matchedKey = "Shopping";
    } else if (titleLower.includes("travel") || titleLower.includes("airport") || titleLower.includes("trip")) {
      matchedKey = "Travel";
    } else if (titleLower.includes("work") || titleLower.includes("business") || titleLower.includes("office") || titleLower.includes("idiom")) {
      matchedKey = "Workplace Conversation";
    } else if (titleLower.includes("interview") || titleLower.includes("job") || titleLower.includes("career")) {
      matchedKey = "Job Interview";
    } else if (titleLower.includes("phone") || titleLower.includes("online") || titleLower.includes("call")) {
      matchedKey = "Phone & Online Conversation";
    } else if (titleLower.includes("free") || titleLower.includes("discussion") || titleLower.includes("fluency")) {
      matchedKey = "Free Conversation";
    } else {
      matchedKey = "Greetings & Introductions";
    }
  }

  const sit = SITUATIONS_DB[matchedKey] || SITUATIONS_DB["Greetings & Introductions"];

  // Extract language-appropriate content
  const summary = sit.summary[normTarget] || sit.summary["English"];
  const keyPhrases = sit.phrases[normTarget] || sit.phrases["English"];
  const vocabulary = sit.vocab[normTarget] || sit.vocab["English"];
  const listening = sit.listening[normTarget] || sit.listening["English"];
  const speaking = sit.speaking[normTarget] || sit.speaking["English"];
  const conversation = sit.conversation[normTarget] || sit.conversation["English"];
  const practice = sit.practice[normTarget] || sit.practice["English"];
  const quiz = sit.quiz[normTarget] || sit.quiz["English"];
  const grammar = getGrammarSection(lesson.title, normTarget);

  return {
    estimatedMinutes: lesson.difficulty === "Advanced" ? 15 : lesson.difficulty === "Intermediate" ? 12 : 10,
    targetLanguage: normTarget,
    sourceLanguage: normSource,
    isRTL,
    introduction: {
      summary,
      keyPhrases,
    },
    vocabulary,
    grammar,
    listening,
    speaking,
    conversation,
    practice,
    quiz,
  };
}
