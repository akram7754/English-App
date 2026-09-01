export interface LanguageConfig {
  code: string; // ISO / ID code e.g. "hi", "en", "ar", "fr", "es", "de"
  name: string; // English name
  nativeName: string; // Name in its native script
  flag: string; // Emoji flag
  sttLang: string; // BCP 47 code for Web Speech Recognition e.g. "hi-IN"
  ttsLang: string; // BCP 47 code for Web Speech Synthesis e.g. "hi-IN"
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    sttLang: "hi-IN",
    ttsLang: "hi-IN",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    sttLang: "en-US",
    ttsLang: "en-US",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    sttLang: "ar-SA",
    ttsLang: "ar-SA",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    sttLang: "fr-FR",
    ttsLang: "fr-FR",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    sttLang: "es-ES",
    ttsLang: "es-ES",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    sttLang: "de-DE",
    ttsLang: "de-DE",
  },
];

export interface ConversationTopic {
  id: string;
  title: string;
  icon: string;
  description: string;
  starterSourcePrompt: string; // Sample native prompt
  sampleEnglishTranslation: string;
}

export const CONVERSATION_TOPICS: ConversationTopic[] = [
  {
    id: "daily",
    title: "Daily Conversation",
    icon: "🗣️",
    description: "Everyday small talk, introducing yourself, hobbies, and weather.",
    starterSourcePrompt: "Mujhe aam bolchal ki baatcheet karni hai.",
    sampleEnglishTranslation: "I want to have a casual daily conversation.",
  },
  {
    id: "interview",
    title: "Job Interview",
    icon: "💼",
    description: "Prepare for HR interviews, self-introductions, and discussing career skills.",
    starterSourcePrompt: "Mujhe job interview ki practice karni hai.",
    sampleEnglishTranslation: "I want to practice for a job interview.",
  },
  {
    id: "travel",
    title: "Travel & Tourism",
    icon: "✈️",
    description: "Airport check-in, asking directions, hotel booking, and sight-seeing.",
    starterSourcePrompt: "Mujhe airport par ticket check-in ke baare mein puchna hai.",
    sampleEnglishTranslation: "I need to ask about flight check-in at the airport.",
  },
  {
    id: "shopping",
    title: "Shopping & Bargaining",
    icon: "🛍️",
    description: "Asking for prices, sizes, discounts, returns, and payment methods.",
    starterSourcePrompt: "Mujhe is shirt ki size aur discount ke baare mein puchna hai.",
    sampleEnglishTranslation: "I want to ask about the size and discount on this shirt.",
  },
  {
    id: "restaurant",
    title: "Restaurant & Food",
    icon: "🍽️",
    description: "Ordering food, requesting the bill, dietary preferences, and reservations.",
    starterSourcePrompt: "Mujhe do logon ke liye table book karna hai aur coffee order karni hai.",
    sampleEnglishTranslation: "I want to book a table for two and order coffee.",
  },
  {
    id: "business",
    title: "Business English",
    icon: "📈",
    description: "Workplace meetings, presentations, client calls, and formal discussions.",
    starterSourcePrompt: "Mujhe project update meeting ke liye formal English bolni hai.",
    sampleEnglishTranslation: "I need to speak formal English for the project update meeting.",
  },
  {
    id: "free",
    title: "Free Conversation",
    icon: "💬",
    description: "Speak freely about any topic and receive live speaking feedback.",
    starterSourcePrompt: "Chaliye kisi bhi vishay par baat karte hain.",
    sampleEnglishTranslation: "Let's talk freely about any topic.",
  },
];

export function getLanguageByCode(code: string): LanguageConfig {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
}

export function getLanguageByName(name: string): LanguageConfig {
  return SUPPORTED_LANGUAGES.find((l) => l.name.toLowerCase() === name.toLowerCase()) || SUPPORTED_LANGUAGES[0];
}
