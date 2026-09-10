import {
  getRomanizedPronunciation,
  cleanRomanPronunciation,
  containsArabic,
  containsDevanagari,
} from "./transliteration";
import { getLanguageByName, getLanguageByCode, LanguageConfig } from "./languages";

export type TutorPersonality =
  | "Friendly Teacher"
  | "Professional Interviewer"
  | "Conversation Partner"
  | "AI Tutor";

export interface VoiceTurnPayload {
  stage?: "teach" | "evaluate" | "conversation";
  turnType?: "start" | "answer" | "next_question";
  questionNumber: number; // 1 to 10
  totalQuestions?: number; // default 10
  personality?: TutorPersonality;
  sourceLanguage: string; // e.g. "Hindi", "Arabic", "French", etc.
  targetLanguage: string; // e.g. "English", "Arabic", "French", etc.
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  topic: string; // e.g. "Job Interview"
  userTranscript: string;
  targetPhraseExpected?: string;
  weaknesses?: string[];
  conversationHistory?: Array<{
    role: "user" | "model";
    text: string;
    nativeExplanation?: string;
  }>;
}

export interface VoiceEvaluationMetrics {
  score: number; // overall 0-100
  grammarScore: number; // 0-100
  fluencyScore: number; // 0-100
  vocabScore: number; // 0-100
  pronunciationScore: number; // 0-100
  status: "Excellent" | "Good" | "Needs Practice";
  whatWentWell: string;
  whatToImprove: string;
  correctedSentence: string;
  tip: string;
  grammarFeedback: string;
  fluencyFeedback: string;
  vocabFeedback: string;
  pronunciationTip: string;
}

export interface VoiceTurnResult {
  aiReply?: string; // Natural conversational reply to user's speech
  targetPhrase: string; // Next question or target sentence in target language
  pronunciation: string; // Phonetic pronunciation in Roman/Latin letters for all languages
  nativeExplanation: string; // Meaning/hint in source language native script
  spokenText: string; // Combined audio string to speak via TTS in target language
  evaluation?: VoiceEvaluationMetrics;
  questionNumber: number;
  totalQuestions: number;
  intentUnderstood?: string;
  followUpPrompt?: string;
  followUpSpoken?: string;
}

export function buildVoiceTurnPrompt(payload: VoiceTurnPayload): string {
  const {
    turnType = "answer",
    questionNumber = 1,
    totalQuestions = 10,
    personality = "Friendly Teacher",
    sourceLanguage,
    targetLanguage,
    difficulty,
    topic,
    userTranscript,
    weaknesses = [],
    conversationHistory = [],
  } = payload;

  const personalityGuidelines = {
    "Friendly Teacher":
      "Warm, encouraging, and immensely patient. Praise progress genuinely, explain concepts gently, and keep the tone cheerful and inspiring.",
    "Professional Interviewer":
      "Formal corporate tone, structured interview questions, professional workplace vocabulary, insightful inquiries about competencies, leadership, and problem-solving.",
    "Conversation Partner":
      "Relaxed, natural peer dialogue, casual conversational flow as if chatting in a coffee shop, using everyday idioms, authentic conversational reactions, and open-ended curiosity.",
    "AI Tutor":
      "Pedagogical and analytical, focused on skill development, structured grammar pointers, precise pronunciation tips, and constructive drills.",
  }[personality];

  const levelGuidelines = {
    Beginner:
      `Use simple ${targetLanguage} vocabulary, short sentences (6-10 words per phrase), clear syntax, lots of encouragement, and detailed native explanations in ${sourceLanguage}.`,
    Intermediate:
      `Use natural everyday ${targetLanguage}, moderate vocabulary, common phrasal verbs, realistic conversational pace, and balanced native explanations in ${sourceLanguage}.`,
    Advanced:
      `Use fluent, sophisticated ${targetLanguage}, complex sentence structures, nuanced idioms, professional/academic terms, and minimal native language assistance in ${sourceLanguage}.`,
  }[difficulty];

  const weaknessInstruction =
    weaknesses && weaknesses.length > 0
      ? `\nSTUDENT'S KNOWN WEAK AREAS: ${weaknesses.join(", ")}.\nWhen appropriate in the practice flow, naturally weave in conversational questions or feedback that help the learner practice these weak points.\n`
      : "";

  const historyContext =
    conversationHistory.length > 0
      ? `\nPREVIOUS CONVERSATION HISTORY (Chronological):\n` +
        conversationHistory
          .slice(-10)
          .map((h) => `${h.role === "user" ? "Student" : "Tutor"}: ${h.text}`)
          .join("\n") +
        `\n`
      : "";

  const universalFormatInstructions =
    `==================================================\n` +
    `REQUIRED UNIVERSAL 3-PART RESPONSE FORMAT:\n` +
    `==================================================\n` +
    `Every AI response must provide these 3 distinct parts:\n` +
    `1. TARGET LANGUAGE ORIGINAL SCRIPT ("aiReply" and "targetPhrase" / "spokenText"):\n` +
    `   - The response in the student's target language: ${targetLanguage}.\n` +
    `   - Preserve the native script of ${targetLanguage} (e.g. Arabic script for Arabic, Devanagari for Hindi, Latin alphabet for French/German/Spanish/English).\n` +
    `2. ROMAN PRONUNCIATION ("pronunciation" field):\n` +
    `   - Show the pronunciation of the ${targetLanguage} response using Roman/Latin letters.\n` +
    `   - This is pronunciation/transliteration of the ${targetLanguage} sentence, NOT an English translation.\n` +
    `   - For non-Latin scripts (Arabic, Hindi), provide accurate Roman transliteration (e.g. Arabic: 'Kaifa haluka al-yawm?', Hindi: 'Aaj aap kaise hain?').\n` +
    `   - For Latin-script languages (French, German, Spanish, English), provide an intuitive phonetic reading in Roman letters (e.g. French 'Comment allez-vous aujourd\\'hui ?' -> 'Koh-mahn ah-lay voo oh-zhoor-dwee ?').\n` +
    `   - NEVER output an English translation in the 'pronunciation' field.\n` +
    `3. SOURCE LANGUAGE MEANING ("nativeExplanation" field):\n` +
    `   - Translate and explain the ${targetLanguage} response into the student's native language: ${sourceLanguage}.\n` +
    `   - Preserve the native script of ${sourceLanguage} (e.g. Hindi -> Devanagari script, Arabic -> Arabic script, French -> French, German -> German, Spanish -> Spanish, English -> English).\n` +
    `   - Do not output English if ${sourceLanguage} is not English.\n\n`;

  if (turnType === "start" || !userTranscript) {
    return (
      `You are a natural, bilingual AI Voice Conversation Tutor acting as a "${personality}".\n` +
      `Guidelines: ${personalityGuidelines}\n` +
      `Target Level: ${difficulty} (${levelGuidelines})\n` +
      `Overall Session Theme: ${topic}\n` +
      `Target Language: ${targetLanguage} | Student's Native Language: ${sourceLanguage}\n` +
      weaknessInstruction +
      universalFormatInstructions +
      `TASK: Generate an opening greeting and friendly check-in to start Question 1 of ${totalQuestions}.\n` +
      `RULES FOR OPENING:\n` +
      `1. Greet the student warmly in ${targetLanguage} matching your persona.\n` +
      `2. For French: Always use the formal "vous" consistently (e.g. "Bonjour ! Comment allez-vous aujourd'hui ?"). NEVER use "tu".\n` +
      `3. For Spanish/German: Maintain consistent formal register.\n` +
      `4. Invite the student to respond naturally (e.g. ask how they are doing or if they are ready for today's session).\n` +
      `5. Do not jump into deep interview or topic questions on the very first turn before the student has even answered the greeting.\n\n` +
      `OUTPUT FORMAT: Return ONLY valid JSON matching this schema:\n` +
      `{\n` +
      `  "aiReply": "Brief greeting in ${targetLanguage}",\n` +
      `  "targetPhrase": "Friendly opening question in ${targetLanguage}",\n` +
      `  "pronunciation": "Phonetic reading/transliteration of the target response in Roman/Latin letters",\n` +
      `  "nativeExplanation": "Translation and explanation of the response in ${sourceLanguage} native script",\n` +
      `  "spokenText": "Full text to speak aloud via TTS in ${targetLanguage} (greeting + question)",\n` +
      `  "questionNumber": 1,\n` +
      `  "totalQuestions": ${totalQuestions}\n` +
      `}`
    );
  }

  // turnType === "answer" or continuing conversation
  return (
    `You are a natural, context-aware bilingual AI Voice Conversation Tutor acting as a "${personality}".\n` +
    `Guidelines: ${personalityGuidelines}\n` +
    `Target Level: ${difficulty} (${levelGuidelines})\n` +
    `Practice Session Topic/Theme: ${topic} (Note: This is a high-level practice theme, NOT permission to invent facts or force questions!)\n` +
    `Target Language: ${targetLanguage} | Student's Native Language: ${sourceLanguage}\n` +
    `Current Progress: Question ${questionNumber} of ${totalQuestions}\n` +
    weaknessInstruction +
    historyContext +
    universalFormatInstructions +
    `\nSTUDENT'S LATEST SPOKEN MESSAGE: "${userTranscript}"\n\n` +
    `==================================================\n` +
    `STRICT PRIMARY CONVERSATION DIRECTIVE (MANDATORY):\n` +
    `==================================================\n` +
    `"Respond to the user's literal meaning. Do not hallucinate or invent user intent. Do not transform short phrases into additional claims. The selected topic is a guide, not permission to invent context. When the user's meaning is short or ambiguous, respond conservatively or ask a clarification question."\n\n` +
    `The latest user message is the primary source of truth.\n` +
    `NEVER invent: objects, actions, intentions, reasons, background, emotions, topics, events, or facts that the user did not express or clearly imply.\n` +
    `Do not expand a short user phrase into a completely different sentence or add unprompted praise/emotions.\n\n` +
    `PRIORITY ORDER (STRICT):\n` +
    `1. Latest user message\n` +
    `2. Immediate conversation context\n` +
    `3. Previous conversation\n` +
    `4. Selected topic\n` +
    `5. User level\n` +
    `6. Personality\n` +
    `7. Learning weaknesses\n` +
    `Do NOT let topic, personality, or learning profile override the latest user message!\n\n` +
    `==================================================\n` +
    `MANDATORY FLOW & MEANING SAFETY RULES:\n` +
    `==================================================\n` +
    `1. SHORT FOOD / BEVERAGE / CONCRETE REQUESTS (e.g., "tea please", "coffee", "un thé"):\n` +
    `   - Respond naturally to the actual request in ${targetLanguage}.\n` +
    `   - DO NOT say "C'est une excellente idée" or "A cup of tea is a great idea!" because the user did not say having tea was a good idea.\n` +
    `   - DO NOT jump to "How can I help you today?" or ask job/interview questions.\n\n` +
    `2. GREETINGS (e.g., "Good morning", "Hello", "Hi", "Bonjour"):\n` +
    `   - Respond with a natural greeting in ${targetLanguage} and ask how they are doing.\n` +
    `   - DO NOT ask "Quel poste recherchez-vous ?" or introduce job/interview questions unless the conversation has naturally reached that topic.\n\n` +
    `3. SMALL TALK & WELL-BEING (e.g., "I'm good", "I'm doing well", "All good"):\n` +
    `   - Acknowledge warmly in ${targetLanguage}.\n` +
    `   - DO NOT mention the words "job", "interview", "mock", "career", or "practice" here.\n\n` +
    `4. PHYSICAL STATE & FEELINGS (e.g., "I am tired."):\n` +
    `   - Respond with natural empathy.\n` +
    `   - DO NOT invent reasons such as "You had a difficult day at work." Address only what was said.\n\n` +
    `5. INTERESTS & HOBBIES (e.g., "I like football."):\n` +
    `   - Conversational follow-up.\n` +
    `   - DO NOT invent facts like "You play football every weekend." Follow-up questions are allowed; invented facts are forbidden.\n\n` +
    `6. PROFESSION & WORK STATEMENTS (e.g., "I work in marketing"):\n` +
    `   - Natural field-related response.\n` +
    `   - DO NOT invent the user's company, job title, salary, or years of experience.\n\n` +
    `7. USER EXPLICITLY INITIATES TOPIC (e.g., "I am here for a job interview", "Can you help me practice my interview?"):\n` +
    `   - Transition into the topic naturally.\n\n` +
    `8. CLARIFICATION REQUESTS (e.g., "I don't understand", "Je ne comprends pas"):\n` +
    `   - Rephrase or explain the previous AI message more simply in ${targetLanguage}.\n` +
    `   - DO NOT advance to an unrelated next question. Set "questionNumber": ${questionNumber}.\n\n` +
    `9. MEANING INQUIRIES (e.g., "What does this mean?", "Qu'est-ce que ça veut dire ?"):\n` +
    `   - Explain the previous AI message in the student's native language (${sourceLanguage}).\n` +
    `   - DO NOT advance to an unrelated question. Set "questionNumber": ${questionNumber}.\n\n` +
    `10. PRONOUN & REGISTER CONSISTENCY (FRENCH/SPANISH/GERMAN):\n` +
    `   - For French: consistently use formal "vous" (vouvoyer). NEVER mix "vous" and "tu" in the same response or session!\n\n` +
    `11. CONVERSATION MEMORY & NO REPETITIONS:\n` +
    `   - Review PREVIOUS CONVERSATION HISTORY. Never repeat questions that have already been asked or answered.\n\n` +
    `==================================================\n` +
    `AI RESPONSE CONTRACT:\n` +
    `==================================================\n` +
    `Every AI response must satisfy:\n` +
    `A. Does it directly respond to what the user actually said?\n` +
    `B. Did it add any fact the user never said?\n` +
    `C. Did it assume an intention without evidence?\n` +
    `D. Did it introduce an unrelated topic?\n` +
    `E. Did it preserve the original meaning?\n` +
    `F. Is the target-language grammar correct?\n` +
    `G. Is the response natural for the selected personality and level?\n` +
    `If B, C, or D is YES, that response violates the contract and is forbidden.\n\n` +
    `OUTPUT FORMAT: Return ONLY valid JSON matching this schema:\n` +
    `{\n` +
    `  "aiReply": "Brief acknowledgment in ${targetLanguage} (or empty if targetPhrase covers it)",\n` +
    `  "targetPhrase": "Natural follow-up response or question in ${targetLanguage}",\n` +
    `  "pronunciation": "Phonetic reading/pronunciation of the full ${targetLanguage} response in Roman/Latin letters",\n` +
    `  "nativeExplanation": "Translation and explanation of the response/question in ${sourceLanguage} native script",\n` +
    `  "spokenText": "The complete, natural text to speak aloud via TTS in ${targetLanguage}",\n` +
    `  "questionNumber": ${Math.min(questionNumber + 1, totalQuestions)},\n` +
    `  "totalQuestions": ${totalQuestions},\n` +
    `  "evaluation": {\n` +
    `    "score": 85,\n` +
    `    "grammarScore": 88,\n` +
    `    "fluencyScore": 82,\n` +
    `    "vocabScore": 85,\n` +
    `    "pronunciationScore": 80,\n` +
    `    "status": "Good",\n` +
    `    "whatWentWell": "Positive note about student's speech",\n` +
    `    "whatToImprove": "Helpful grammar or fluency advice",\n` +
    `    "correctedSentence": "Polished natural version in ${targetLanguage}",\n` +
    `    "tip": "Short helpful tip",\n` +
    `    "grammarFeedback": "Grammar feedback detail",\n` +
    `    "fluencyFeedback": "Fluency feedback detail",\n` +
    `    "vocabFeedback": "Vocabulary feedback detail",\n` +
    `    "pronunciationTip": "Pronunciation tip"\n` +
    `  }\n` +
    `}`
  );
}

/**
 * Multilingual Canned Dialogue Phrases for Offline Fallbacks & Guardrails
 */
interface DialoguePhraseBundle {
  [langCode: string]: {
    reply: string;
    phrase: string;
    meaning: string;
  };
}

const DIALOGUE_BUNDLES: Record<string, DialoguePhraseBundle> = {
  tea_or_coffee: {
    en: { reply: "Certainly.", phrase: "Here is your beverage.", meaning: "Certainly. Here is your beverage." },
    hi: { reply: "ज़रूर।", phrase: "यह रहा आपका पेय।", meaning: "ज़रूर। यह रहा आपका पेय।" },
    ar: { reply: "بالتأكيد.", phrase: "تفضل مشروبك، من فضلك.", meaning: "تفضل مشروبك، من فضلك." },
    fr: { reply: "Bien sûr.", phrase: "Voici votre boisson, s'il vous plaît.", meaning: "Voici votre boisson, s'il vous plaît." },
    es: { reply: "Por supuesto.", phrase: "Aquí tiene su bebida, por favor.", meaning: "Aquí tiene su bebida, por favor." },
    de: { reply: "Natürlich.", phrase: "Hier ist Ihr Getränk, bitte.", meaning: "Hier ist Ihr Getränk, bitte." },
  },
  clarification: {
    en: { reply: "No problem.", phrase: "Let me rephrase that more simply: Does that make sense?", meaning: "No problem, let me rephrase that more simply." },
    hi: { reply: "कोई बात नहीं।", phrase: "मैं इसे और सरल तरीके से समझाता हूँ: क्या अब यह स्पष्ट है?", meaning: "कोई बात नहीं, मैं इसे और सरल तरीके से समझाता हूँ।" },
    ar: { reply: "لا مشكلة.", phrase: "سأعيد صياغة ذلك بشكل أبسط: هل هذا أوضح لك؟", meaning: "لا مشكلة، سأوضح ذلك بشكل أبسط من أجلك." },
    fr: { reply: "Pas de problème.", phrase: "Je reformule plus simplement : est-ce plus clair pour vous ?", meaning: "Pas de problème, laissez-moi reformuler plus simplement." },
    es: { reply: "No hay problema.", phrase: "Se lo explico de forma más sencilla: ¿queda más claro?", meaning: "No hay problema, permítame explicarlo más sencillamente." },
    de: { reply: "Kein Problem.", phrase: "Ich formuliere das einfacher: Ist das jetzt klarer für Sie?", meaning: "Kein Problem, ich erkläre es einfacher für Sie." },
  },
  greeting: {
    en: { reply: "Good morning!", phrase: "How are you doing today?", meaning: "Good morning! How are you doing today?" },
    hi: { reply: "नमस्ते!", phrase: "आज आप कैसे हैं?", meaning: "नमस्ते! आज आप कैसे हैं?" },
    ar: { reply: "صباح الخير!", phrase: "كيف حالك اليوم؟", meaning: "صباح الخير! كيف حالك اليوم؟" },
    fr: { reply: "Bonjour !", phrase: "Comment allez-vous aujourd'hui ?", meaning: "Bonjour ! Comment allez-vous aujourd'hui ?" },
    es: { reply: "¡Hola!", phrase: "¿Cómo está usted hoy?", meaning: "¡Hola! ¿Cómo está usted hoy?" },
    de: { reply: "Guten Tag !", phrase: "Wie geht es Ihnen heute?", meaning: "Guten Tag ! Wie geht es Ihnen heute?" },
  },
  small_talk: {
    en: { reply: "That's great to hear!", phrase: "How can I help you today?", meaning: "That's great to hear! How can I help you today?" },
    hi: { reply: "यह सुनकर अच्छा लगा!", phrase: "आज मैं आपकी क्या मदद कर सकता हूँ?", meaning: "यह सुनकर अच्छा लगा! आज मैं आपकी क्या मदद कर सकता हूँ?" },
    ar: { reply: "يسعدني سماع ذلك!", phrase: "كيف يمكنني مساعدتك اليوم؟", meaning: "يسعدني سماع ذلك! كيف يمكنني مساعدتك اليوم؟" },
    fr: { reply: "Ravi de l'entendre !", phrase: "Comment puis-je vous aider aujourd'hui ?", meaning: "Ravi de l'entendre ! Comment puis-je vous aider aujourd'hui ?" },
    es: { reply: "¡Me alegra escucharlo!", phrase: "¿Cómo puedo ayudarle hoy?", meaning: "¡Me alegra escucharlo! ¿Cómo puedo ayudarle hoy?" },
    de: { reply: "Freut mich zu hören !", phrase: "Wie kann ich Ihnen heute helfen?", meaning: "Freut mich zu hören ! Wie kann ich Ihnen heute helfen?" },
  },
  interview_intent: {
    en: { reply: "Welcome!", phrase: "To begin, could you tell me a little about yourself?", meaning: "Welcome! To begin, could you tell me a little about yourself?" },
    hi: { reply: "स्वागत है!", phrase: "शुरू करने के लिए, क्या आप अपने बारे में थोड़ा बता सकते हैं?", meaning: "स्वागत है! शुरू करने के लिए, क्या आप अपने बारे में थोड़ा बता सकते हैं?" },
    ar: { reply: "أهلاً بك!", phrase: "في البداية، هل يمكنك التحدث عن نفسك باختصار؟", meaning: "أهلاً بك! في البداية، هل يمكنك التحدث عن نفسك باختصار؟" },
    fr: { reply: "Bienvenue !", phrase: "Pour commencer, pouvez-vous vous présenter brièvement ?", meaning: "Bienvenue ! Pour commencer, pouvez-vous vous présenter brièvement ?" },
    es: { reply: "¡Bienvenido!", phrase: "Para empezar, ¿podría contarme un poco sobre usted?", meaning: "¡Bienvenido! Para empezar, ¿podría contarme un poco sobre usted?" },
    de: { reply: "Willkommen !", phrase: "Können Sie sich zu Beginn kurz vorstellen?", meaning: "Willkommen ! Können Sie sich zu Beginn kurz vorstellen?" },
  },
  tired: {
    en: { reply: "I'm sorry to hear that.", phrase: "Would you like to take a short break?", meaning: "I'm sorry to hear that. Would you like to take a short break?" },
    hi: { reply: "मुझे यह सुनकर दुख हुआ।", phrase: "क्या आप थोड़ा आराम लेना चाहेंगे?", meaning: "मुझे यह सुनकर दुख हुआ। क्या आप थोड़ा आराम लेना चाहेंगे?" },
    ar: { reply: "يؤسفني سماع ذلك.", phrase: "هل ترغب في أخذ استراحة قصيرة؟", meaning: "يؤسفني سماع ذلك. هل ترغب في أخذ استراحة قصيرة؟" },
    fr: { reply: "Je suis désolé de l'entendre.", phrase: "Vous voulez faire une petite pause ?", meaning: "Je suis désolé de l'entendre. Vous voulez faire une petite pause ?" },
    es: { reply: "Siento escuchar eso.", phrase: "¿Le gustaría tomar un breve descanso?", meaning: "Siento escuchar eso. ¿Le gustaría tomar un breve descanso?" },
    de: { reply: "Das tut mir leid.", phrase: "Möchten Sie eine kurze Pause machen?", meaning: "Das tut mir leid. Möchten Sie eine kurze Pause machen?" },
  },
  football: {
    en: { reply: "I enjoy talking about football too.", phrase: "Which team do you like?", meaning: "I enjoy talking about football too. Which team do you like?" },
    hi: { reply: "मुझे भी फ़ुटबॉल के बारे में बात करना पसंद है।", phrase: "आपकी पसंदीदा टीम कौन सी है?", meaning: "मुझे भी फ़ुटबॉल के बारे में बात करना पसंद है। आपकी पसंदीदा टीम कौन सी है?" },
    ar: { reply: "أنا أيضاً أحب الحديث عن كرة القدم.", phrase: "ما هو فريقك المفضل؟", meaning: "أنا أيضاً أحب الحديث عن كرة القدم. ما هو فريقك المفضل؟" },
    fr: { reply: "J'aime aussi parler de football.", phrase: "Quelle équipe aimez-vous ?", meaning: "J'aime aussi parler de football. Quelle équipe aimez-vous ?" },
    es: { reply: "A mí también me gusta hablar de fútbol.", phrase: "¿Cuál es su equipo favorito?", meaning: "A mí también me gusta hablar de fútbol. ¿Cuál es su equipo favorito?" },
    de: { reply: "Ich spreche auch gern über Fußball.", phrase: "Welche Mannschaft mögen Sie?", meaning: "Ich spreche auch gern über Fußball. Welche Mannschaft mögen Sie?" },
  },
  marketing: {
    en: { reply: "That is a very dynamic field.", phrase: "What type of marketing do you do?", meaning: "That is a very dynamic field. What type of marketing do you do?" },
    hi: { reply: "यह बहुत ही दिलचस्प क्षेत्र है।", phrase: "आप किस प्रकार के विपणन में काम करते हैं?", meaning: "यह बहुत ही दिलचस्प क्षेत्र है। आप किस प्रकार के विपणन में काम करते हैं?" },
    ar: { reply: "هذا مجال ممتع للغاية.", phrase: "ما هو نوع التسويق الذي تعمل به؟", meaning: "هذا مجال ممتع للغاية. ما هو نوع التسويق الذي تعمل به؟" },
    fr: { reply: "C'est un domaine très dynamique.", phrase: "Quel type de marketing faites-vous ?", meaning: "C'est un domaine très dynamique. Quel type de marketing faites-vous ?" },
    es: { reply: "Es un campo muy dinámico.", phrase: "¿Qué tipo de marketing hace usted?", meaning: "Es un campo muy dinámico. ¿Qué tipo de marketing hace usted?" },
    de: { reply: "Das ist ein sehr dynamisches Feld.", phrase: "Welche Art von Marketing machen Sie?", meaning: "Das ist ein sehr dynamisches Feld. Welche Art von Marketing machen Sie?" },
  },
  general_followup: {
    en: { reply: "Thank you for sharing that.", phrase: "Could you tell me a little more about that?", meaning: "Thank you for sharing that. Could you tell me a little more about that?" },
    hi: { reply: "धन्यवाद।", phrase: "क्या आप मुझे इसके बारे में थोड़ा और बता सकते हैं?", meaning: "धन्यवाद। क्या आप मुझे इसके बारे में थोड़ा और बता सकते हैं?" },
    ar: { reply: "شكراً لإجابتك.", phrase: "هل يمكنك إخباري بالمزيد عن ذلك؟", meaning: "شكراً لإجابتك. هل يمكنك إخباري بالمزيد عن ذلك؟" },
    fr: { reply: "Merci pour votre réponse.", phrase: "Pouvez-vous m'en dire un peu plus à ce sujet ?", meaning: "Merci pour votre réponse. Pouvez-vous m'en dire un peu plus à ce sujet ?" },
    es: { reply: "Gracias por su respuesta.", phrase: "¿Podría contarme un poco más al respecto?", meaning: "Gracias por su respuesta. ¿Podría contarme un poco más al respecto?" },
    de: { reply: "Danke für Ihre Antwort.", phrase: "Können Sie mir etwas mehr darüber erzählen?", meaning: "Danke für Ihre Antwort. Können Sie mir etwas mehr darüber erzählen?" },
  },
};

function getBundleContent(bundleKey: string, tgtCode: string, srcCode: string) {
  const bundle = DIALOGUE_BUNDLES[bundleKey] || DIALOGUE_BUNDLES.general_followup;
  const tgtItem = bundle[tgtCode] || bundle.en;
  const srcItem = bundle[srcCode] || bundle.en;
  return {
    reply: tgtItem.reply,
    phrase: tgtItem.phrase,
    meaning: srcItem.meaning,
  };
}

export function validateAndSanitizeVoiceResponse(
  result: VoiceTurnResult,
  payload: VoiceTurnPayload
): { result: VoiceTurnResult; wasModified: boolean; reason?: string } {
  const transcript = (payload.userTranscript || "").trim();
  const transcriptLower = transcript.toLowerCase();

  const tgtLang = getLanguageByName(payload.targetLanguage);
  const srcLang = getLanguageByName(payload.sourceLanguage);
  const tgtCode = tgtLang.code;
  const srcCode = srcLang.code;

  let modified = false;
  let reason = "";

  // 1. Short Food/Drink Request (e.g., "tea please", "coffee", "water please", "tea")
  const isTeaOrCoffee =
    /^(tea\s*(please)?|coffee\s*(please)?|water\s*(please)?|un th[eé]\s*(s'il vous pla[iî]t)?|un caf[eé]\s*(s'il vous pla[iî]t)?|de l'eau)\b/i.test(
      transcriptLower
    );
  if (isTeaOrCoffee) {
    const textLower = (result.spokenText || "").toLowerCase();
    if (
      textLower.includes("excellente idée") ||
      textLower.includes("bonne idée") ||
      textLower.includes("great idea") ||
      textLower.includes("good idea") ||
      textLower.includes("comment puis-je vous aider") ||
      textLower.includes("how can i help you") ||
      textLower.includes("poste") ||
      textLower.includes("interview") ||
      textLower.includes("job")
    ) {
      modified = true;
      reason = "Removed hallucinated praise/unrelated assistance from short beverage request";
      const bundle = getBundleContent("tea_or_coffee", tgtCode, srcCode);
      result.aiReply = bundle.reply;
      result.targetPhrase = bundle.phrase;
      result.spokenText = `${bundle.reply} ${bundle.phrase}`.trim();
      result.nativeExplanation = bundle.meaning;
    }
  }

  // 2. Clarification request: "I don't understand" / "Je ne comprends pas"
  const isDontUnderstand =
    /^(i don't understand|i do not understand|je ne comprends pas|could you repeat|pardon|i didn't understand|je n'ai pas compris|لا أفهم|لم أفهم|मुझे समझ नहीं आया)\b/i.test(
      transcriptLower
    );
  if (isDontUnderstand) {
    result.questionNumber = payload.questionNumber;
    const bundle = getBundleContent("clarification", tgtCode, srcCode);
    result.aiReply = bundle.reply;
    result.targetPhrase = bundle.phrase;
    result.spokenText = `${bundle.reply} ${bundle.phrase}`.trim();
    result.nativeExplanation = bundle.meaning;
    modified = true;
    reason = "Handled student clarification without advancing question or inventing topic";
  }

  // 3. Greeting: prevent premature job questions
  const isGreeting =
    /^(good morning|good afternoon|good evening|hello|hi|hey|bonjour|bonsoir|salut|hola|namaste|صباح|أهلا|مرحبا)\b/i.test(
      transcriptLower
    );
  if (isGreeting && !transcriptLower.includes("interview") && !transcriptLower.includes("entretien")) {
    const textLower = (result.spokenText || "").toLowerCase();
    if (/poste|cherches|recherchez|interview|salary|salaire|cv|resume|embauche/i.test(textLower)) {
      modified = true;
      reason = "Removed premature job questions from greeting";
      const bundle = getBundleContent("greeting", tgtCode, srcCode);
      result.aiReply = bundle.reply;
      result.targetPhrase = bundle.phrase;
      result.spokenText = `${bundle.reply} ${bundle.phrase}`.trim();
      result.nativeExplanation = bundle.meaning;
    }
  }

  // 4. Small talk: prevent premature job questions
  const isSmallTalk =
    /^(i'm good|i am good|i'm fine|i am fine|doing well|all good|ça va|ca va|bien|بخير|الحمد لله|मैं ठीक हूँ)\b/i.test(
      transcriptLower
    );
  if (isSmallTalk && !transcriptLower.includes("interview") && !transcriptLower.includes("entretien")) {
    const textLower = (result.spokenText || "").toLowerCase();
    if (/poste|cherches|recherchez|interview|salary|salaire|cv|resume|embauche|job\s*interview|mock/i.test(textLower)) {
      modified = true;
      reason = "Removed premature job questions from small talk";
      const bundle = getBundleContent("small_talk", tgtCode, srcCode);
      result.aiReply = bundle.reply;
      result.targetPhrase = bundle.phrase;
      result.spokenText = `${bundle.reply} ${bundle.phrase}`.trim();
      result.nativeExplanation = bundle.meaning;
    }
  }

  // 5. French Pronoun Consistency Gate: ensure formal "vous" consistently
  if (tgtCode === "fr") {
    const text = result.spokenText || "";
    if (/\b(vous|votre|vos)\b/i.test(text) && /\b(tu|te|toi|cherches|peux-tu|veux-tu)\b/i.test(text)) {
      modified = true;
      reason = "Corrected mixed French pronouns to consistent formal 'vous'";
      const corrected = text
        .replace(/\bcherches-tu\b/gi, "recherchez-vous")
        .replace(/\bcherches\b/gi, "recherchez")
        .replace(/\bpeux-tu\b/gi, "pouvez-vous")
        .replace(/\bveux-tu\b/gi, "voulez-vous")
        .replace(/\best-ce que tu\b/gi, "est-ce que vous")
        .replace(/\btu\b/gi, "vous")
        .replace(/\bte\b/gi, "vous")
        .replace(/\btoi\b/gi, "vous");
      result.spokenText = corrected;
      result.targetPhrase = corrected;
    }
  }

  // 6. Universal Roman Pronunciation Guarantee:
  // Ensure Roman/Latin pronunciation is ALWAYS present and accurate for all languages
  const spoken = (result.spokenText || result.targetPhrase || "").trim();
  if (!result.pronunciation || result.pronunciation.trim().length === 0) {
    result.pronunciation = getRomanizedPronunciation(spoken, tgtCode);
    modified = true;
  } else {
    result.pronunciation = cleanRomanPronunciation(result.pronunciation, spoken);
  }

  // 7. Universal Native Explanation Guarantee:
  if (!result.nativeExplanation || result.nativeExplanation.trim().length === 0) {
    const bundle = getBundleContent("general_followup", tgtCode, srcCode);
    result.nativeExplanation = bundle.meaning;
    modified = true;
  }

  return { result, wasModified: modified, reason };
}

export function getOfflineVoiceFallback(payload: VoiceTurnPayload): VoiceTurnResult {
  const {
    difficulty,
    personality = "Friendly Teacher",
    userTranscript,
    questionNumber = 1,
    totalQuestions = 10,
    sourceLanguage = "Hindi",
    targetLanguage = "English",
    conversationHistory = [],
  } = payload;

  const textLower = (userTranscript || "").toLowerCase().trim();
  let nextQNum = Math.min(questionNumber + 1, totalQuestions);

  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .split(/\s+/)
      .filter(Boolean);

  const words = clean(userTranscript || "");
  const wordCount = words.length;

  const baseScore = Math.min(94, Math.max(65, 75 + Math.min(18, wordCount * 3)));
  const grammarScore = Math.min(96, baseScore + (wordCount > 3 ? 2 : -2));
  const fluencyScore = Math.min(95, baseScore + (wordCount > 4 ? 3 : -3));
  const vocabScore = Math.min(92, baseScore + (wordCount > 3 ? 2 : -2));
  const pronunciationScore = Math.min(90, baseScore - 1);

  const status: "Excellent" | "Good" | "Needs Practice" =
    baseScore >= 88 ? "Excellent" : baseScore >= 75 ? "Good" : "Needs Practice";

  const tgtLang = getLanguageByName(targetLanguage);
  const srcLang = getLanguageByName(sourceLanguage);
  const tgtCode = tgtLang.code;
  const srcCode = srcLang.code;

  let bundleKey = "general_followup";

  if (/^(tea\s*(please)?|coffee\s*(please)?|water\s*(please)?|un th[eé]|un caf[eé]|de l'eau)\b/i.test(textLower)) {
    bundleKey = "tea_or_coffee";
  } else if (/^(good morning|good afternoon|good evening|hello|hi|hey|bonjour|bonsoir|salut|hola|buenos dias|namaste|صباح|أهلا|مرحبا)/i.test(textLower)) {
    bundleKey = "greeting";
  } else if (/^(i'm good|i am good|i'm fine|i am fine|doing well|all good|ça va|ca va|bien|muy bien|theek hu|بخير|الحمد لله|मैं ठीक हूँ)/i.test(textLower)) {
    bundleKey = "small_talk";
  } else if (/^(i am tired|i'm tired|fatigué|je suis fatigué|تعبان|أنا متعب|थक गया)/i.test(textLower)) {
    bundleKey = "tired";
  } else if (/^(i like football|i love football|j'aime le football|football|كرة القدم|फुटबॉल)/i.test(textLower)) {
    bundleKey = "football";
  } else if (/^(i work in marketing|je travaille dans le marketing|marketing|تسويق|التسويق|विपणन)/i.test(textLower)) {
    bundleKey = "marketing";
  } else if (/(interview|job|career|entretien|poste|travail|trabajo|naukri|مقابلة|وظيفة|عمل|नौकरी|इंटरव्यू)/i.test(textLower)) {
    bundleKey = "interview_intent";
  } else if (/^(i don't understand|i do not understand|je ne comprends pas|could you repeat|pardon|i didn't understand|لا أفهم|لم أفهم|मुझे समझ नहीं आया)\b/i.test(textLower)) {
    bundleKey = "clarification";
    nextQNum = questionNumber;
  }

  const bundle = getBundleContent(bundleKey, tgtCode, srcCode);
  const spokenText = `${bundle.reply} ${bundle.phrase}`.trim();
  const pronunciation = getRomanizedPronunciation(spokenText, tgtCode);

  return {
    aiReply: bundle.reply,
    targetPhrase: bundle.phrase,
    pronunciation,
    nativeExplanation: bundle.meaning,
    spokenText,
    questionNumber: nextQNum,
    totalQuestions,
    evaluation: {
      score: baseScore,
      grammarScore,
      fluencyScore,
      vocabScore,
      pronunciationScore,
      status,
      whatWentWell: `Polite and natural delivery in ${targetLanguage}.`,
      whatToImprove: `As a ${personality}, I encourage you to expand on your ideas as the conversation develops.`,
      correctedSentence: userTranscript || bundle.phrase,
      tip: "Keep speaking clearly and naturally with good confidence.",
      grammarFeedback: "Sentence structure matches the context appropriately.",
      fluencyFeedback: "Good natural conversational rhythm.",
      vocabFeedback: `Appropriate vocabulary for ${difficulty} level.`,
      pronunciationTip: "Maintain natural pacing and clear pronunciation on key syllables.",
    },
  };
}
