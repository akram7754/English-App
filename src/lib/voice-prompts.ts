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
  sourceLanguage: string; // e.g. "Hindi"
  targetLanguage: string; // e.g. "English"
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
  nativeExplanation: string; // Meaning/hint in native language (e.g. Hindi)
  spokenText: string; // Combined audio string to speak via TTS
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

  if (turnType === "start" || !userTranscript) {
    return (
      `You are a natural, bilingual AI Voice Conversation Tutor acting as a "${personality}".\n` +
      `Guidelines: ${personalityGuidelines}\n` +
      `Target Level: ${difficulty} (${levelGuidelines})\n` +
      `Overall Session Theme: ${topic}\n` +
      `Target Language: ${targetLanguage} | Student's Native Language: ${sourceLanguage}\n` +
      weaknessInstruction +
      `\nTASK: Generate an opening greeting and friendly check-in to start Question 1 of ${totalQuestions}.\n` +
      `RULES FOR OPENING:\n` +
      `1. Greet the student warmly in ${targetLanguage} matching your persona.\n` +
      `2. For French: Always use the formal "vous" consistently (e.g. "Bonjour ! Bienvenue. Comment allez-vous aujourd'hui ?"). NEVER use "tu".\n` +
      `3. For Spanish/German: Maintain consistent formal register.\n` +
      `4. Invite the student to respond naturally (e.g. ask how they are doing or if they are ready for today's session).\n` +
      `5. Do not jump into deep interview or topic questions on the very first turn before the student has even answered the greeting.\n\n` +
      `OUTPUT FORMAT: Return ONLY valid JSON matching this schema:\n` +
      `{\n` +
      `  "aiReply": "Brief greeting in ${targetLanguage}",\n` +
      `  "targetPhrase": "Friendly opening question in ${targetLanguage}",\n` +
      `  "nativeExplanation": "Translation and explanation of the question in ${sourceLanguage}",\n` +
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
    `   - Respond naturally to the actual request in ${targetLanguage} (e.g., in French: "Bien sûr. Un thé, s'il vous plaît." or "Bien sûr. Vous voulez un thé ?").\n` +
    `   - DO NOT say "C'est une excellente idée" or "A cup of tea is a great idea!" because the user did not say having tea was a good idea.\n` +
    `   - DO NOT jump to "How can I help you today?" or ask job/interview questions.\n\n` +
    `2. GREETINGS (e.g., "Good morning", "Hello", "Hi", "Bonjour"):\n` +
    `   - Respond with a natural greeting in ${targetLanguage} and ask how they are doing (e.g., in French: "Bonjour ! Comment allez-vous aujourd'hui ?").\n` +
    `   - DO NOT ask "Quel poste recherchez-vous ?" or introduce job/interview questions unless the conversation has naturally reached that topic.\n\n` +
    `3. SMALL TALK & WELL-BEING (e.g., "I'm good", "I'm doing well", "All good"):\n` +
    `   - Acknowledge warmly in ${targetLanguage} (e.g., in French: "Ravi de l'entendre ! Comment puis-je vous aider aujourd'hui ?" / in English: "That's great to hear! How can I help you today?").\n` +
    `   - DO NOT mention the words "job", "interview", "mock", "career", or "practice" here.\n\n` +
    `4. PHYSICAL STATE & FEELINGS (e.g., "I am tired."):\n` +
    `   - Respond with natural empathy (e.g., in French: "Je suis désolé de l'entendre. Vous voulez faire une petite pause ?").\n` +
    `   - DO NOT invent reasons such as "You had a difficult day at work." Address only what was said.\n\n` +
    `5. INTERESTS & HOBBIES (e.g., "I like football."):\n` +
    `   - Conversational follow-up (e.g., in French: "J'aime aussi parler de football. Quelle équipe aimez-vous ?" / in English: "I enjoy football too! Which team do you like?").\n` +
    `   - DO NOT invent facts like "You play football every weekend." Follow-up questions are allowed; invented facts are forbidden.\n\n` +
    `6. PROFESSION & WORK STATEMENTS (e.g., "I work in marketing"):\n` +
    `   - Natural field-related response (e.g., in French: "C'est un domaine très dynamique. Quel type de marketing faites-vous ?" / in English: "That is a very dynamic field. What type of marketing do you do?").\n` +
    `   - DO NOT invent the user's company, job title, salary, or years of experience.\n\n` +
    `7. USER EXPLICITLY INITIATES TOPIC (e.g., "I am here for a job interview", "Can you help me practice my interview?"):\n` +
    `   - Transition into the topic naturally (e.g., in French: "Bienvenue ! Commençons votre entraînement pour l'entretien d'embauche. Pour commencer, pouvez-vous vous présenter brièvement ?").\n\n` +
    `8. CLARIFICATION REQUESTS (e.g., "I don't understand", "Je ne comprends pas"):\n` +
    `   - Rephrase or explain the previous AI message more simply in ${targetLanguage}.\n` +
    `   - DO NOT advance to an unrelated next question. Set "questionNumber": ${questionNumber}.\n\n` +
    `9. MEANING INQUIRIES (e.g., "What does this mean?", "Qu'est-ce que ça veut dire ?"):\n` +
    `   - Explain the previous AI message in the student's native language (${sourceLanguage}).\n` +
    `   - DO NOT advance to an unrelated question. Set "questionNumber": ${questionNumber}.\n\n` +
    `10. PRONOUN & REGISTER CONSISTENCY (FRENCH):\n` +
    `   - Consistently use formal "vous" (vouvoyer) throughout the entire response. NEVER mix "vous" and "tu" in the same response or session!\n\n` +
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
    `  "nativeExplanation": "Translation and explanation of the response/question in ${sourceLanguage}",\n` +
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

export function validateAndSanitizeVoiceResponse(
  result: VoiceTurnResult,
  payload: VoiceTurnPayload
): { result: VoiceTurnResult; wasModified: boolean; reason?: string } {
  const transcript = (payload.userTranscript || "").trim();
  const transcriptLower = transcript.toLowerCase();
  const isFrench =
    payload.targetLanguage.toLowerCase().includes("french") ||
    payload.targetLanguage.toLowerCase().includes("fr");
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
      const isCoffee = transcriptLower.includes("caf") || transcriptLower.includes("coffee");
      if (isFrench) {
        const item = isCoffee ? "café" : "thé";
        result.aiReply = "Bien sûr.";
        result.targetPhrase = `Un ${item}, s'il vous plaît.`;
        result.spokenText = `Bien sûr. Un ${item}, s'il vous plaît.`;
        result.nativeExplanation = `Certainly. One ${item === "café" ? "coffee" : "tea"}, please.`;
      } else {
        const item = isCoffee ? "coffee" : "tea";
        result.aiReply = "Certainly.";
        result.targetPhrase = `Here is your ${item}.`;
        result.spokenText = `Certainly. Here is your ${item}.`;
        result.nativeExplanation = `Here is your ${item}.`;
      }
    }
  }

  // 2. Clarification request: "I don't understand" / "Je ne comprends pas"
  const isDontUnderstand =
    /^(i don't understand|i do not understand|je ne comprends pas|could you repeat|pardon|i didn't understand|je n'ai pas compris)\b/i.test(
      transcriptLower
    );
  if (isDontUnderstand) {
    result.questionNumber = payload.questionNumber;
    const history = payload.conversationHistory || [];
    const lastAiTurn = [...history].reverse().find((h) => h.role === "model");
    const prevText = lastAiTurn?.text || "";

    if (isFrench) {
      result.aiReply = "Pas de problème.";
      result.targetPhrase = prevText
        ? `Je reformule plus simplement : "${prevText}". Est-ce plus clair pour vous ?`
        : "Je vais reformuler plus simplement pour vous.";
      result.spokenText = result.targetPhrase;
      result.nativeExplanation = "No problem, let me rephrase that more simply for you.";
    } else {
      result.aiReply = "No problem.";
      result.targetPhrase = prevText
        ? `Let me rephrase that more simply: "${prevText}". Does that make sense?`
        : "Let me explain that more simply for you.";
      result.spokenText = result.targetPhrase;
      result.nativeExplanation = "No problem, let me rephrase that more simply.";
    }
    modified = true;
    reason = "Handled student clarification without advancing question or inventing topic";
  }

  // 3. Meaning inquiry: "What does this mean?" / "Qu'est-ce que ça veut dire ?"
  const isMeaningInquiry =
    /^(what does this mean|what do you mean|qu'est-ce que [çc]a veut dire|c'est quoi|what does it mean|explain this)\b/i.test(
      transcriptLower
    );
  if (isMeaningInquiry) {
    result.questionNumber = payload.questionNumber;
    const history = payload.conversationHistory || [];
    const lastAiTurn = [...history].reverse().find((h) => h.role === "model");
    const prevText = lastAiTurn?.text || "";

    if (payload.sourceLanguage === "French") {
      result.aiReply = "Voici l'explication :";
      result.targetPhrase = prevText
        ? `En français, cela signifie : "${prevText}".`
        : "Voici ce que cela signifie.";
      result.spokenText = result.targetPhrase;
      result.nativeExplanation = "Explication de la phrase en français.";
    } else if (payload.sourceLanguage === "English") {
      result.aiReply = "Here is the meaning:";
      result.targetPhrase =
        result.nativeExplanation || (prevText ? `In English, that means: "${prevText}".` : "Here is what that means.");
      result.spokenText = result.targetPhrase;
      result.nativeExplanation = `Meaning of previous sentence in English`;
    } else {
      result.aiReply = "अर्थ यह है:";
      result.targetPhrase = result.nativeExplanation || (prevText ? `इसका मतलब है: "${prevText}"` : "यहाँ इसका अर्थ है।");
      result.spokenText = result.targetPhrase;
      result.nativeExplanation = `Explanation in ${payload.sourceLanguage}`;
    }
    modified = true;
    reason = "Explained previous message in student native language without advancing question";
  }

  // 4. Greeting: prevent premature job questions
  const isGreeting =
    /^(good morning|good afternoon|good evening|hello|hi|hey|bonjour|bonsoir|salut|hola|namaste)\b/i.test(
      transcriptLower
    );
  if (isGreeting && !transcriptLower.includes("interview") && !transcriptLower.includes("entretien")) {
    const textLower = (result.spokenText || "").toLowerCase();
    if (/poste|cherches|recherchez|interview|salary|salaire|cv|resume|embauche/i.test(textLower)) {
      modified = true;
      reason = "Removed premature job questions from greeting";
      if (isFrench) {
        result.aiReply = "Bonjour !";
        result.targetPhrase = "Comment allez-vous aujourd'hui ?";
        result.spokenText = "Bonjour ! Comment allez-vous aujourd'hui ?";
        result.nativeExplanation = "Hello! How are you today?";
      } else {
        result.aiReply = "Good morning!";
        result.targetPhrase = "How are you today?";
        result.spokenText = "Good morning! How are you today?";
        result.nativeExplanation = "Good morning! How are you today?";
      }
    }
  }

  // 5. Small talk: prevent premature job questions
  const isSmallTalk =
    /^(i'm good|i am good|i'm fine|i am fine|doing well|all good|ça va|ca va|bien)\b/i.test(
      transcriptLower
    );
  if (isSmallTalk && !transcriptLower.includes("interview") && !transcriptLower.includes("entretien")) {
    const textLower = (result.spokenText || "").toLowerCase();
    if (/poste|cherches|recherchez|interview|salary|salaire|cv|resume|embauche|job\s*interview|mock/i.test(textLower)) {
      modified = true;
      reason = "Removed premature job questions from small talk";
      if (isFrench) {
        result.aiReply = "Ravi de l'entendre !";
        result.targetPhrase = "Comment puis-je vous aider aujourd'hui ?";
        result.spokenText = "Ravi de l'entendre ! Comment puis-je vous aider aujourd'hui ?";
        result.nativeExplanation = "Glad to hear that! How can I help you today?";
      } else {
        result.aiReply = "That's great to hear!";
        result.targetPhrase = "How can I help you today?";
        result.spokenText = "That's great to hear! How can I help you today?";
        result.nativeExplanation = "That's great to hear! How can I help you today?";
      }
    }
  }

  // 6. Sport statement: prevent hallucinating that user plays every weekend or belongs to a club
  if (transcriptLower.includes("football") || transcriptLower.includes("soccer")) {
    const textLower = (result.spokenText || "").toLowerCase();
    if (/jouez\s*(chaque|tous\s*les|le\s*week-end)|play\s*(every|on\s*the\s*weekend)|in\s*a\s*team|dans\s*un\s*club/i.test(textLower)) {
      modified = true;
      reason = "Removed hallucinated claim that user plays football every weekend";
      if (isFrench) {
        result.aiReply = "J'aime aussi parler de football.";
        result.targetPhrase = "Quelle équipe aimez-vous ?";
        result.spokenText = "J'aime aussi parler de football. Quelle équipe aimez-vous ?";
        result.nativeExplanation = "I also enjoy talking about football. Which team do you like?";
      } else {
        result.aiReply = "I also enjoy talking about football.";
        result.targetPhrase = "Which team do you like?";
        result.spokenText = "I also enjoy talking about football. Which team do you like?";
        result.nativeExplanation = "I also enjoy talking about football. Which team do you like?";
      }
    }
  }

  // 7. Profession statement: prevent hallucinating company, title, salary, or years of experience
  if (transcriptLower.includes("marketing")) {
    const textLower = (result.spokenText || "").toLowerCase();
    if (/chez\s*(google|apple|meta)|depuis\s*\d+\s*ans|\d+\s*years\s*of\s*experience|votre\s*salaire|your\s*salary/i.test(textLower)) {
      modified = true;
      reason = "Removed hallucinated company/salary/years of experience for marketing statement";
      if (isFrench) {
        result.aiReply = "C'est un domaine très dynamique.";
        result.targetPhrase = "Quel type de marketing faites-vous ?";
        result.spokenText = "C'est un domaine très dynamique. Quel type de marketing faites-vous ?";
        result.nativeExplanation = "That's a very dynamic field. What type of marketing do you do?";
      } else {
        result.aiReply = "That is a very dynamic field.";
        result.targetPhrase = "What type of marketing do you do?";
        result.spokenText = "That is a very dynamic field. What type of marketing do you do?";
        result.nativeExplanation = "That is a very dynamic field. What type of marketing do you do?";
      }
    }
  }

  // 8. French Pronoun Consistency Gate: ensure formal "vous" consistently
  if (isFrench) {
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

  const isFrench =
    targetLanguage.toLowerCase().includes("french") || targetLanguage.toLowerCase().includes("fr");

  const isTeaOrCoffee =
    /^(tea\s*(please)?|coffee\s*(please)?|water\s*(please)?|un th[eé]|un caf[eé]|de l'eau)\b/i.test(
      textLower
    );
  const isGreeting =
    /^(good morning|good afternoon|good evening|hello|hi|hey|bonjour|bonsoir|salut|hola|buenos dias|namaste)/i.test(
      textLower
    );
  const isSmallTalk =
    /^(i'm good|i am good|i'm fine|i am fine|doing well|all good|ça va|ca va|bien|muy bien|theek hu)/i.test(
      textLower
    );
  const isTired = /^(i am tired|i'm tired|fatigué|je suis fatigué)/i.test(textLower);
  const isFootball = /^(i like football|i love football|j'aime le football|football)/i.test(textLower);
  const isMarketing = /^(i work in marketing|je travaille dans le marketing|marketing)/i.test(textLower);
  const isInterviewIntent =
    /(interview|job|career|entretien|poste|travail|trabajo|naukri)/i.test(textLower);
  const isDontUnderstand =
    /^(i don't understand|i do not understand|je ne comprends pas|could you repeat|pardon|i didn't understand)\b/i.test(
      textLower
    );
  const isMeaningInquiry =
    /^(what does this mean|what do you mean|qu'est-ce que [çc]a veut dire|c'est quoi|what does it mean)\b/i.test(
      textLower
    );

  let reply = "";
  let question = "";
  let native = "";

  if (isTeaOrCoffee) {
    const isCoffee = textLower.includes("coffee") || textLower.includes("caf");
    if (isFrench) {
      reply = "Bien sûr.";
      question = `Un ${isCoffee ? "café" : "thé"}, s'il vous plaît.`;
      native = `Certainly. One ${isCoffee ? "coffee" : "tea"}, please.`;
    } else {
      reply = "Certainly.";
      question = `Here is your ${isCoffee ? "coffee" : "tea"}.`;
      native = `Certainly. Here is your ${isCoffee ? "coffee" : "tea"}.`;
    }
  } else if (isDontUnderstand) {
    nextQNum = questionNumber;
    const lastAi = [...conversationHistory].reverse().find((h) => h.role === "model");
    const prev = lastAi?.text || "";
    if (isFrench) {
      reply = "Pas de problème.";
      question = prev
        ? `Je reformule plus simplement : "${prev}". Est-ce plus clair pour vous ?`
        : "Je vais reformuler plus simplement pour vous.";
      native = "No problem, let me rephrase that more simply.";
    } else {
      reply = "No problem.";
      question = prev
        ? `Let me rephrase that more simply: "${prev}". Does that make sense?`
        : "Let me explain that more simply for you.";
      native = "No problem, let me rephrase that more simply.";
    }
  } else if (isMeaningInquiry) {
    nextQNum = questionNumber;
    const lastAi = [...conversationHistory].reverse().find((h) => h.role === "model");
    const prev = lastAi?.text || "";
    if (sourceLanguage === "French") {
      reply = "Voici l'explication :";
      question = `En français, cela signifie : "${prev}".`;
      native = "Explication de la phrase en français.";
    } else if (sourceLanguage === "English") {
      reply = "Here is the meaning:";
      question = `In English, that means: "${prev}".`;
      native = `Meaning of "${prev}" in English`;
    } else {
      reply = "अर्थ यह है:";
      question = `इसका मतलब है: "${prev}"`;
      native = `Meaning in ${sourceLanguage}`;
    }
  } else if (isTired) {
    if (isFrench) {
      reply = "Je suis désolé de l'entendre.";
      question = "Vous voulez faire une petite pause ?";
      native = "I'm sorry to hear that. Would you like to take a short break?";
    } else {
      reply = "I'm sorry to hear that.";
      question = "Would you like to take a short break?";
      native = "I'm sorry to hear that. Would you like to take a short break?";
    }
  } else if (isFootball) {
    if (isFrench) {
      reply = "J'aime aussi parler de football.";
      question = "Quelle équipe aimez-vous ?";
      native = "I also enjoy talking about football. Which team do you like?";
    } else {
      reply = "I also enjoy talking about football.";
      question = "Which team do you like?";
      native = "I also enjoy talking about football. Which team do you like?";
    }
  } else if (isMarketing) {
    if (isFrench) {
      reply = "C'est un domaine très dynamique.";
      question = "Quel type de marketing faites-vous ?";
      native = "That's a very dynamic field. What type of marketing do you do?";
    } else {
      reply = "That is a very dynamic field.";
      question = "What type of marketing do you do?";
      native = "That is a very dynamic field. What type of marketing do you do?";
    }
  } else if (isGreeting) {
    if (isFrench) {
      reply = "Bonjour ! C'est un plaisir de vous rencontrer.";
      question = "Comment allez-vous aujourd'hui ?";
      native = "नमस्ते! आपसे मिलकर अच्छा लगा। आज आप कैसे हैं?";
    } else {
      reply = "Good morning! It's nice to meet you.";
      question = "How are you doing today?";
      native = "शुभ प्रभात! आपसे मिलकर अच्छा लगा। आज आप कैसे हैं?";
    }
  } else if (isSmallTalk) {
    if (isFrench) {
      reply = "Ravi de l'entendre !";
      question = "Comment puis-je vous aider aujourd'hui ?";
      native = "यह सुनकर अच्छा लगा! आज मैं आपकी क्या मदद कर सकता हूँ?";
    } else {
      reply = "That's great to hear!";
      question = "How can I help you today?";
      native = "यह सुनकर बहुत अच्छा लगा! आज मैं आपकी क्या मदद कर सकता हूँ?";
    }
  } else if (isInterviewIntent) {
    if (isFrench) {
      reply = "Bienvenue ! Commençons votre entraînement pour l'entretien d'embauche.";
      question = "Pour commencer, pouvez-vous vous présenter et décrire brièvement votre parcours ?";
      native = "स्वागत है! चलिए नौकरी के साक्षात्कार का अभ्यास शुरू करते हैं। संक्षेप में अपना परिचय दीजिए।";
    } else {
      reply = "Welcome! Let's get started with your job interview practice.";
      question = "To begin, could you tell me a little about yourself and your background?";
      native = "स्वागत है! चलिए नौकरी के साक्षात्कार का अभ्यास शुरू करते हैं। संक्षेप में अपना परिचय दीजिए।";
    }
  } else {
    if (isFrench) {
      reply = "Merci pour votre réponse.";
      question = "Pouvez-vous m'en dire un peu plus à ce sujet ?";
      native = "धन्यवाद। क्या आप मुझे इस बारे में थोड़ा और बता सकते हैं?";
    } else {
      reply = "Thank you for sharing that.";
      question = "Could you tell me a little more about that?";
      native = "धन्यवाद। क्या आप मुझे इसके बारे में थोड़ा और बता सकते हैं?";
    }
  }

  const spokenText = `${reply} ${question}`.trim();

  return {
    aiReply: reply,
    targetPhrase: question,
    nativeExplanation:
      sourceLanguage === "English" ? `${reply} ${question}`.trim() : native,
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
      correctedSentence:
        userTranscript || (isFrench ? "Bonjour, comment allez-vous ?" : "Good morning, how are you?"),
      tip: isFrench
        ? "Utilisez 'vous' de manière constante dans un contexte professionnel."
        : "Keep speaking clearly and naturally with good confidence.",
      grammarFeedback: "Sentence structure matches the context appropriately.",
      fluencyFeedback: "Good natural conversational rhythm.",
      vocabFeedback: `Appropriate vocabulary for ${difficulty} level.`,
      pronunciationTip: "Maintain natural pacing and clear pronunciation on key syllables.",
    },
  };
}
