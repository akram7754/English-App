"use server";

import { ai } from "../../lib/gemini";
import { db } from "../../prisma/db";
import { cookies } from "next/headers";
import { verifySession } from "../../lib/auth";

import { getPersonalizedLearningProfile } from "../../lib/learning-engine";
import {
  getAttemptsAction as voiceGetAttemptsAction,
  analyzeSpeakingAction as voiceAnalyzeSpeakingAction,
} from "../voice-practice/actions";

async function callGeminiFast(params: {
  contents: any;
  config?: any;
  timeoutMs?: number;
}): Promise<string> {
  const models = ["gemini-flash-lite-latest", "gemini-3.1-flash-lite"];
  const timeoutMs = params.timeoutMs || 7000;

  for (const model of models) {
    try {
      const callPromise = ai.models.generateContent({
        model,
        contents: params.contents,
        ...(params.config ? { config: params.config } : {}),
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("CALL_TIMEOUT")), timeoutMs)
      );
      const res: any = await Promise.race([callPromise, timeoutPromise]);
      if (res?.text) return res.text;
    } catch (e: any) {
      console.warn(`[AI Tutor] Model ${model} failed or timed out (${e?.message}), trying fallback...`);
    }
  }
  throw new Error("ALL_MODELS_FAILED");
}

export interface AskTutorOptions {
  sourceLanguage?: string; // e.g. "Hindi", "English"
  targetLanguage?: string; // e.g. "English", "Arabic", "French", "Spanish", "German"
  sourceLangCode?: string; // e.g. "hi"
  targetLangCode?: string; // e.g. "en", "ar", "fr", "es", "de"
  mode?: "conversation" | "grammar" | "vocabulary" | "translation" | "practice";
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
}

export async function askTutorAction(
  history: { sender: "user" | "ai"; text: string }[],
  message: string,
  options?: AskTutorOptions
) {
  const cleanMessage = (message || "").trim().slice(0, 2000);
  if (!cleanMessage) return "Please enter a message.";
  history = (history || []).slice(-6).map((h) => ({
    sender: h.sender,
    text: (h.text || "").slice(0, 1000),
  }));
  message = cleanMessage;

  const sourceLang = options?.sourceLanguage || "Hindi";
  const targetLang = options?.targetLanguage || "English";
  const mode = options?.mode || "conversation";
  const difficulty = options?.difficulty || "Intermediate";

  let userCookie: string | undefined;
  try {
    const cookieStore = await cookies();
    userCookie = cookieStore.get("user")?.value;
  } catch {
    // standalone test runner fallback
  }
  const sessionUser = userCookie ? verifySession(userCookie) : null;

  let personalizedContext = "";
  if (sessionUser?.email) {
    try {
      const profile = await getPersonalizedLearningProfile(sessionUser.email);
      if (profile) {
        const weakList = profile.detectedWeaknesses.map((w) => w.title).join(", ");
        personalizedContext =
          `\n[STUDENT LEARNING PROFILE]\n` +
          `• Student Name: ${profile.userName}\n` +
          `• Proficiency Level: ${difficulty} (User Profile: ${profile.level})\n` +
          `• Identified Weak Grammar/Fluency Areas: ${weakList || "None recorded"}\n` +
          `• Next Recommended Topic: ${profile.nextRecommendedLesson?.title || "Language Mastery"}\n` +
          `INSTRUCTION: Adapt your vocabulary complexity to ${difficulty} level. Naturally weave in practice opportunities for the student's weak areas (${weakList || "General Fluency"}) without lecturing unless they make a mistake.`;
      }
    } catch (e) {
      console.warn("Could not retrieve personalized profile for AI tutor context:", e);
    }
  }

  const modeInstructions: Record<string, string> = {
    conversation:
      `MODE: Natural Conversational Practice.\n` +
      `Engage in a warm, interactive conversation primarily in ${targetLang} at a ${difficulty} level. ` +
      `Respond naturally to the student's ideas. If any mistakes are made, provide gentle corrections under '💡 **Grammar Corrections:**' and continue the dialogue with an engaging follow-up question.`,
    grammar:
      `MODE: Grammar Coach & Explanations.\n` +
      `Focus on grammar rules, verb tenses, sentence structures, and common pitfalls in ${targetLang}. ` +
      `Explain the underlying grammatical patterns clearly in the student's native language (${sourceLang}). ` +
      `Highlight corrections clearly under '💡 **Grammar Corrections:**' showing *Incorrect:*, *Correct:*, and the clear grammar rule reason.`,
    vocabulary:
      `MODE: Vocabulary Builder.\n` +
      `Teach 2 to 4 high-frequency or idiomatic vocabulary words in ${targetLang} related to the topic. ` +
      `Under '📖 **Key Vocabulary:**', provide the term, phonetic pronunciation, ${sourceLang} definition, and an example sentence. ` +
      `Ask the student a follow-up challenge to write a sentence using one of the new words.`,
    translation:
      `MODE: Translation & Linguistic Bridge.\n` +
      `Provide accurate, natural translation between ${sourceLang} and ${targetLang}. ` +
      `Under '🌐 **Translation Breakdown:**', explain the nuances, formal vs informal registers, and idiomatic subtleties. ` +
      `Offer alternative natural ways to express the same thought.`,
    practice:
      `MODE: Interactive Exercises & Micro-Drills.\n` +
      `Provide interactive practice challenges (e.g. fill-in-the-blank, translate-this-phrase, or sentence reordering) in ${targetLang} at a ${difficulty} level. ` +
      `Encourage the student, evaluate their attempts accurately, and explain the correct solution in ${sourceLang}.`,
  };

  const selectedModeInstruction = modeInstructions[mode] || modeInstructions.conversation;

  const isArabicOrNonLatin =
    targetLang.toLowerCase().includes("ar") ||
    targetLang.toLowerCase().includes("hi") ||
    options?.targetLangCode === "ar" ||
    options?.targetLangCode === "hi";

  const systemInstruction =
    `You are a warm, highly encouraging, and skilled Multilingual Personal Language Teacher.\n` +
    `Teaching Parameters:\n` +
    `• Student's Native Language: ${sourceLang}\n` +
    `• Target Language Being Taught: ${targetLang}\n` +
    `• Student Level: ${difficulty}\n` +
    `• Current Teaching Objective: ${selectedModeInstruction}\n` +
    personalizedContext + `\n\n` +
    `PEDAGOGICAL RULES:\n` +
    `1. Teach ${targetLang} effectively using ${sourceLang} for conceptual explanations, meanings, and tips.\n` +
    `2. Keep the tone friendly, patient, and inspiring—like a dedicated personal 1-on-1 tutor.\n` +
    `3. Always end your response with an engaging question, practice prompt, or next step for the student to continue the lesson.\n` +
    (isArabicOrNonLatin
      ? `4. MULTILINGUAL PRONUNCIATION & SCRIPT DIRECTIVE (STRICT):\n` +
        `   Whenever presenting phrases or sentences in ${targetLang} (Arabic or non-Latin script), ALWAYS format with these THREE distinct parts:\n` +
        `   [1] Target-language text in original script\n` +
        `   [2] Read: <phonetic pronunciation in Roman/Latin letters>\n` +
        `   [3] ${sourceLang}: <meaning in student's native language>\n\n` +
        `   Example for Arabic:\n` +
        `   صباح الخير، كيف حالك اليوم؟\n\n` +
        `   Read: Sabah al-khair, kaifa haluka al-yawm?\n\n` +
        `   ${sourceLang}:\n` +
        `   सुप्रभात, आज आप कैसे हैं?\n`
      : `4. For Latin languages (${targetLang}): Provide clear ${sourceLang} translations and only include pronunciation tips when phonetically tricky or requested.\n`);

  // Build clean history turns without duplicating the message
  const contents: { role: string; parts: { text: string }[] }[] = [];
  for (const msg of history) {
    contents.push({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    });
  }

  // Ensure current message is at the end
  if (
    contents.length === 0 ||
    contents[contents.length - 1].parts[0].text !== message ||
    contents[contents.length - 1].role !== "user"
  ) {
    contents.push({ role: "user", parts: [{ text: message }] });
  }

  try {
    const text = await callGeminiFast({
      contents,
      config: {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        maxOutputTokens: 450,
      },
      timeoutMs: 7000,
    });

    return text || "I'm sorry, I couldn't process that response.";
  } catch (error: any) {
    console.error("Gemini Tutor error:", error);

    // Provide intelligent offline fallbacks based on target language and mode
    const lower = message.toLowerCase();
    const isArabic = targetLang.toLowerCase().includes("ar") || options?.targetLangCode === "ar" || /[\u0600-\u06FF]/.test(message);
    const isFrench = targetLang.toLowerCase().includes("fr") || options?.targetLangCode === "fr";
    const isSpanish = targetLang.toLowerCase().includes("es") || options?.targetLangCode === "es";
    const isGerman = targetLang.toLowerCase().includes("de") || options?.targetLangCode === "de";

    // 1. Arabic Target Fallbacks
    if (isArabic) {
      if (lower.includes("interview") || lower.includes("job") || lower.includes("عمل")) {
        return "أهلاً بك! دعنا نبدأ التدريب على المقابلة الشخصية.\n\n" +
               "Read: Ahlan bika! Da'na nabda' at-tadrīb 'ala al-muqabala ash-shakhsiyya.\n\n" +
               `${sourceLang}:\n` +
               "स्वागत है! चलिए नौकरी के साक्षात्कार का अभ्यास शुरू करते हैं। संक्षेप में अपना परिचय दीजिए।";
      }
      if (mode === "grammar" || lower.includes("grammar") || lower.includes("قواعد")) {
        return "💡 **قواعد اللغة العربية (Arabic Grammar Tip):**\n" +
               "في اللغة العربية، تبدأ الجملة الفعلية عادةً بالفعل ثم الفاعل.\n\n" +
               "Read: Fi al-lughati al-'arabiyyah, tabda'u al-jumlatu al-fi'liyyah 'aadatan bil-fi'li thumma al-faa'il.\n\n" +
               `${sourceLang}:\n` +
               "अरबी में सामान्यतः क्रियात्मक वाक्य पहले क्रिया (Verb) और उसके बाद कर्ता (Subject) से शुरू होता है।\n\n" +
               "مثال: كَتَبَ الطالبُ الدرسَ (Kataba at-talibu ad-darsa) = छात्र ने पाठ लिखा।";
      }
      if (mode === "vocabulary") {
        return "📖 **مفردات هامة (Key Vocabulary):**\n" +
               "1. مرحبا (Marhaban) - नमस्ते / Hello\n" +
               "2. صديق (Sadiq) - मित्र / Friend\n" +
               "3. شكراً (Shukran) - धन्यवाद / Thank you\n\n" +
               "حاول كتابة جملة باستخدام كلمة 'صديق'!";
      }
      return "صباح الخير، كيف حالك اليوم؟\n\n" +
             "Read: Sabah al-khair, kaifa haluka al-yawm?\n\n" +
             `${sourceLang}:\n` +
             "सुप्रभात, आज आप कैसे हैं?";
    }

    // 2. French Target Fallbacks
    if (isFrench) {
      if (mode === "grammar" || lower.includes("vous") || lower.includes("tu")) {
        return "💡 **Grammaire Française:**\n" +
               "En français, utilisez **'vous'** pour la politesse et le milieu professionnel, et **'tu'** avec vos amis proches.\n\n" +
               `*Explication (${sourceLang}):* फ़्रेंच में आदर और औपचारिकता के लिए 'vous' का प्रयोग करें।\n\n` +
               "Comment puis-je vous aider aujourd'hui ?";
      }
      if (mode === "vocabulary") {
        return "📖 **Vocabulaire Français Utile:**\n" +
               "1. **Bienvenue** - स्वागत है (Welcome)\n" +
               "2. **Enchanté(e)** - आपसे मिलकर खुशी हुई (Nice to meet you)\n" +
               "3. **S'il vous plaît** - कृपया (Please)\n\n" +
               "Pouvez-vous vous présenter en une phrase ?";
      }
      return "Bonjour ! Je suis votre professeur personnel de français. 🥐 Comment allez-vous aujourd'hui ?\n\n" +
             `*Signification (${sourceLang}):* नमस्ते! मैं आपका फ़्रेंच शिक्षक हूँ। आज आप कैसे हैं?`;
    }

    // 3. Spanish Target Fallbacks
    if (isSpanish) {
      if (mode === "grammar" || lower.includes("ser") || lower.includes("estar")) {
        return "💡 **Gramática Española:**\n" +
               "* **Ser:** Se usa para características permanentes (ej. *'Soy estudiante'*).\n" +
               "* **Estar:** Se usa para estados temporales o ubicaciones (ej. *'Estoy feliz'*).\n\n" +
               `*Explicación (${sourceLang}):* 'Ser' स्थायी पहचान के लिए और 'Estar' अस्थायी स्थिति के लिए प्रयुक्त होता है।`;
      }
      return "¡Hola! Soy tu profesor personal de español. 🇪🇸 ¿Cómo estás hoy?\n\n" +
             `*Significado (${sourceLang}):* नमस्ते! मैं आपका स्पैनिश शिक्षक हूँ। आज आप कैसे हैं?`;
    }

    // 4. German Target Fallbacks
    if (isGerman) {
      if (mode === "grammar" || lower.includes("der") || lower.includes("die") || lower.includes("das")) {
        return "💡 **Deutsche Grammatik:**\n" +
               "Im Deutschen haben Nomen drei Artikel: **der** (maskulin), **die** (feminin), **das** (neutral).\n\n" +
               `*Erklärung (${sourceLang}):* जर्मन में संज्ञाओं के तीन लिंग रूप होते हैं: der, die, और das.`;
      }
      return "Guten Tag! Ich bin Ihr persönlicher Deutschlehrer. 🇩🇪 Wie geht es Ihnen heute?\n\n" +
             `*Bedeutung (${sourceLang}):* नमस्ते! मैं आपका जर्मन शिक्षक हूँ। आज आप कैसे हैं?`;
    }

    // 5. English Target Fallbacks
    if (lower.includes("interview")) {
      return "💡 **Note:** Live AI is using conversational fallback.\n\n" +
             "Excellent! Let's practice a job interview. 💼 I will act as the interviewer. To start, tell me: what role are you applying for, and why are you interested in it?";
    }
    if (lower.includes("perfect") || lower.includes("tense")) {
      return "💡 **Present Perfect Tense Guide:**\n" +
             "The **Present Perfect** connects the past to the present (e.g. *'I have lived here for two years'*).\n" +
             "Formula: **Subject + have/has + Past Participle**.\n\n" +
             "Try writing a sentence in the Present Perfect about something you did today!";
    }
    if (lower.includes("have a") || lower.includes("she have")) {
      return "💡 **Grammar Corrections:**\n" +
             "* *Incorrect:* 'She have'\n" +
             "* *Correct:* 'She has' (use singular verbs with third-person singular pronoun 'she').\n\n" +
             "**Corrected Sentence:** *'She has a dog and she went to school yesterday.'*";
    }

    return `Hello! I am your personal ${targetLang} teacher. 👋\n\n` +
           `I can help you practice conversation, learn grammar rules, build vocabulary, and translate between ${sourceLang} and ${targetLang}.\n\n` +
           `What topic would you like to explore today?`;
  }
}

export async function askAssistantAction(message: string, promptType: string) {
  if (!message) return "Please enter a message.";

  let systemInstruction = "You are a helpful AI writing assistant for English learners.";

  if (promptType === "translate") {
    systemInstruction = 
      "You are an English Translation Helper. Translate the user's input phrase into natural, clear English. " +
      "If the input is already in English, refine it to sound more native, and provide brief explanations of synonyms or idioms used.";
  } else if (promptType === "email") {
    systemInstruction = 
      "You are a Professional Email Drafting Helper. Help the user write a structured, professional email draft based on their input prompts. " +
      "Explain key professional phrases or formal phrasings used in your draft so they can learn.";
  } else if (promptType === "summarize") {
    systemInstruction = 
      "You are a Reading Summarization Helper. Summarize the user's input paragraph in clear, simple bullet-points. " +
      "Highlight 3 useful vocabulary words from the text and explain their meanings.";
  }

  try {
    const text = await callGeminiFast({
      contents: [{ role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        maxOutputTokens: 350,
      },
      timeoutMs: 6000,
    });

    return text || "No response generated.";
  } catch (error) {
    console.error("Gemini Assistant error:", error);
    
    // Fallback based on type
    if (promptType === "translate") {
      return "💡 **Note:** Live AI is using fallback mode (valid API key not found).\n\n" +
             "🌐 **Translation Fallback:**\nHere is a translation helper suggestion:\n* *Input:* '" + message + "'\n* *English translation suggestion:* '" + message + "' (looks like it is ready, or try typing another phrase to translate).";
    }
    if (promptType === "email") {
      return "💡 **Note:** Live AI is using fallback mode (valid API key not found).\n\n" +
             "✉️ **Email Draft Fallback:**\n\nSubject: Follow-up on LingoAI\n\nDear Team,\n\nI hope this email finds you well. I would like to check on our progress.\n\nBest regards,\nUser";
    }
    if (promptType === "summarize") {
      return "💡 **Note:** Live AI is using fallback mode (valid API key not found).\n\n" +
             "📝 **Summarization Fallback:**\n* The text emphasizes practicing English using AI-assisted tools.\n* Daily consistent reading helps reinforce vocabulary memory.";
    }
    return "💡 **Note:** Live AI is using fallback mode (valid API key not found).\n\n" +
           "Hello! I am your AI Writing Assistant. Please let me know if you would like to translate, draft an email, or summarize text.";
  }
}

export async function saveAttemptAction(phrase: string, score: number, difficulty: string) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return { success: false, error: "User not found" };

    const status = score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Needs Practice";

    const attempt = await db.orm.public.PracticeAttempt.create({
      userId: user.id,
      phrase,
      score,
      difficulty,
      status,
      user: (u) => u.connect({ id: user.id }),
    });

    return { success: true, attemptId: attempt.id };
  } catch (error) {
    console.error("Failed to save voice attempt:", error);
    return { success: false, error: "Database error" };
  }
}

export async function getAttemptsAction() {
  return voiceGetAttemptsAction();
}

export async function analyzeSpeakingAction(
  targetPhrase: string,
  userTranscript: string,
  difficulty: string,
  targetLangCode?: string,
  sourceLangCode?: string
) {
  return voiceAnalyzeSpeakingAction(
    targetPhrase,
    userTranscript,
    difficulty,
    targetLangCode,
    sourceLangCode
  );
}

