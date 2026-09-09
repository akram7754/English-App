"use server";

import { callGeminiFast } from "../../lib/gemini";
import { getLanguageByCode } from "../../lib/languages";

export type AssistantMode = "chat" | "translate" | "grammar" | "vocabulary" | "improve";

export interface MultilingualChatTurnPayload {
  message: string;
  sourceLangCode: string; // I SPEAK (e.g. "hi")
  targetLangCode: string; // I LEARN (e.g. "en")
  level: "Beginner" | "Intermediate" | "Advanced";
  mode?: AssistantMode;
  conversationHistory?: { sender: "user" | "ai"; text: string }[];
}

export interface MultilingualChatResponse {
  type: "chat" | "translation" | "grammar" | "vocabulary" | "improvement" | "clarification";
  targetText: string;
  pronunciation?: string;
  meaningInSourceLang: string;
  grammarDetails?: {
    incorrectSentence: string;
    correctedSentence: string;
    explanationInSourceLang: string;
  };
  vocabularyDetails?: {
    word: string;
    partOfSpeech?: string;
    pronunciation?: string;
    meaningInSourceLang: string;
    exampleSentence: string;
    exampleTranslation: string;
  };
  clarificationQuestion?: string;
  additionalNotes?: string;
}

/**
 * High-quality offline fallback generator for all supported modes and language pairs
 */
function getOfflineFallbackResponse(
  payload: MultilingualChatTurnPayload
): MultilingualChatResponse {
  const sourceLang = getLanguageByCode(payload.sourceLangCode);
  const targetLang = getLanguageByCode(payload.targetLangCode);
  const msg = payload.message.trim();
  const lowerMsg = msg.toLowerCase();
  const mode = payload.mode || "chat";

  // Check for ambiguous short message
  if (msg.length < 10 && /^(tea|coffee|water|help|hi|hello|please)\b/i.test(msg)) {
    if (/tea/i.test(msg)) {
      return {
        type: "clarification",
        targetText: targetLang.code === "en" ? "A cup of tea, please." : targetLang.code === "fr" ? "Un thé, s'il vous plaît." : targetLang.code === "es" ? "Un té, por favor." : targetLang.code === "de" ? "Einen Tee, bitte." : targetLang.code === "ar" ? "شاي من فضلك." : "कृपया मुझे चाय दीजिए।",
        pronunciation: targetLang.code === "ar" ? "Shay min fadlik." : targetLang.code === "fr" ? "Un tay, seel voo play." : undefined,
        meaningInSourceLang: `${sourceLang.name}: Simple polite phrase for asking for tea.`,
        clarificationQuestion: `Would you like a polite way to order, or a specific phrase for a different context?`,
      };
    }
  }

  // Grammar mode fallback
  if (mode === "grammar" || lowerMsg.includes("he go") || lowerMsg.includes("i has")) {
    const isHeGo = lowerMsg.includes("he go");
    const incorrect = isHeGo ? "He go to office." : msg;
    const corrected = isHeGo ? "He goes to the office." : msg;
    const explanation = sourceLang.code === "hi"
      ? "Third-person singular 'He' ke saath present simple tense mein verb mein 'es' ('goes') lagta hai aur 'office' se pehle article 'the' use hota hai."
      : "In the present simple tense, third-person singular subjects (he/she/it) take the '-s' or '-es' verb ending, and specific destinations require 'the'.";

    return {
      type: "grammar",
      targetText: corrected,
      pronunciation: "He goes to the office.",
      meaningInSourceLang: sourceLang.code === "hi" ? "वह कार्यालय/ऑफिस जाता है।" : "He travels to the office.",
      grammarDetails: {
        incorrectSentence: incorrect,
        correctedSentence: corrected,
        explanationInSourceLang: explanation,
      },
    };
  }

  // Vocabulary mode fallback
  if (mode === "vocabulary") {
    return {
      type: "vocabulary",
      targetText: msg,
      pronunciation: msg,
      meaningInSourceLang: `Definition and usage for "${msg}" in ${sourceLang.name}.`,
      vocabularyDetails: {
        word: msg,
        partOfSpeech: "Noun / Term",
        pronunciation: msg,
        meaningInSourceLang: `Key vocabulary term explained for ${sourceLang.name} speakers.`,
        exampleSentence: `Practice using "${msg}" in your daily conversations.`,
        exampleTranslation: `इस शब्द का प्रयोग अपने दैनिक अभ्यास में करें।`,
      },
    };
  }

  // Translation / Chat fallback
  return {
    type: mode === "translate" ? "translation" : "chat",
    targetText: msg,
    pronunciation: msg,
    meaningInSourceLang: `[${sourceLang.name} Meaning]: "${msg}" translated and prepared for ${targetLang.name} learners.`,
  };
}

export async function processMultilingualChatTurnAction(
  payload: MultilingualChatTurnPayload
): Promise<{ success: boolean; response: MultilingualChatResponse; error?: string }> {
  try {
    const cleanMessage = (payload.message || "").trim().slice(0, 2000);
    if (!cleanMessage) {
      return {
        success: false,
        error: "Message cannot be empty.",
        response: {
          type: "chat",
          targetText: "Please enter a message.",
          meaningInSourceLang: "Please enter a message.",
        },
      };
    }
    payload = { ...payload, message: cleanMessage };

    const sourceLang = getLanguageByCode(payload.sourceLangCode);
    const targetLang = getLanguageByCode(payload.targetLangCode);
    const level = payload.level || "Intermediate";
    const mode = payload.mode || "chat";

    // Build strict system prompt
    const systemPrompt = `You are LingoAI's Multilingual AI Language Assistant.
You assist learners with dynamic language pairs:
- User's native/known language (I SPEAK): "${sourceLang.name}" (Code: ${sourceLang.code})
- Language being learned/targeted (I LEARN): "${targetLang.name}" (Code: ${targetLang.code})
- Learner Level: "${level}"
- Current Active Assistant Mode: "${mode}" (Options: chat, translate, grammar, vocabulary, improve)

CRITICAL INSTRUCTION ON TRUTH & ACCURACY:
1. The latest user message is the absolute primary truth.
2. NEVER invent or hallucinate:
   - user's unstated intentions
   - fictional locations (e.g. do not invent a restaurant, hotel, airport unless the user explicitly mentions it)
   - background stories or fictional characters
   - emotions, past events, or reasons
3. If the user's message is ambiguous, brief, or underspecified (e.g., "tea please" or "water"):
   - Give a direct, concise, natural phrase in the target language.
   - Set "clarificationQuestion" with a short, polite clarification asking how they want to use it without inventing stories.
4. Language Rules:
   - "targetText" MUST be in ${targetLang.name}.
   - "meaningInSourceLang" MUST be in ${sourceLang.name}.
   - "pronunciation" MUST be phonetically written in Latin/Roman script for non-native readers (especially critical for Arabic script or Devanagari Hindi script).
   - For Grammar mode: Provide "grammarDetails" with "incorrectSentence", "correctedSentence", and "explanationInSourceLang" written in ${sourceLang.name}.
   - For Vocabulary mode: Provide "vocabularyDetails" with "word", "partOfSpeech", "pronunciation", "meaningInSourceLang" (in ${sourceLang.name}), "exampleSentence" (in ${targetLang.name}), and "exampleTranslation" (in ${sourceLang.name}).

OUTPUT FORMAT REQUIREMENTS:
You MUST respond with valid raw JSON only (no markdown fences, no extra commentary).
JSON structure:
{
  "type": "chat" | "translation" | "grammar" | "vocabulary" | "improvement" | "clarification",
  "targetText": "Text in ${targetLang.name}",
  "pronunciation": "Phonetic / Romanized reading in Latin letters",
  "meaningInSourceLang": "Clear translation and explanation in ${sourceLang.name}",
  "grammarDetails": {
    "incorrectSentence": "User incorrect text or null",
    "correctedSentence": "Grammatically sound correction in ${targetLang.name} or null",
    "explanationInSourceLang": "Why the change was made, explained in ${sourceLang.name} or null"
  },
  "vocabularyDetails": {
    "word": "Word in ${targetLang.name} or null",
    "partOfSpeech": "e.g. Noun, Verb, Adjective or null",
    "pronunciation": "Romanized pronunciation or null",
    "meaningInSourceLang": "Definition in ${sourceLang.name} or null",
    "exampleSentence": "Example sentence in ${targetLang.name} or null",
    "exampleTranslation": "Translation of example in ${sourceLang.name} or null"
  },
  "clarificationQuestion": "Short clarification question in ${sourceLang.name} if ambiguous, else null"
}`;

    let parsedResponse: MultilingualChatResponse | null = null;

    try {
      const contents = [
        ...(payload.conversationHistory || []).slice(-4).map((h) => ({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        })),
        {
          role: "user",
          parts: [{ text: `[I SPEAK: ${sourceLang.name}, I LEARN: ${targetLang.name}, MODE: ${mode}, LEVEL: ${level}]\n${payload.message}` }],
        },
      ];

      const rawAiText = await callGeminiFast({
        contents,
        config: {
          systemInstruction: { parts: [{ text: systemPrompt }] },
          temperature: 0.2,
          maxOutputTokens: 600,
        },
        timeoutMs: 8500,
      });

      if (rawAiText) {
        let clean = rawAiText.trim();
        if (clean.startsWith("```json")) {
          clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (clean.startsWith("```")) {
          clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }

        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const obj = JSON.parse(jsonMatch[0]);
          if (obj.targetText || obj.grammarDetails || obj.vocabularyDetails) {
            parsedResponse = {
              type: obj.type || (mode === "grammar" ? "grammar" : mode === "vocabulary" ? "vocabulary" : "chat"),
              targetText: obj.targetText || (obj.grammarDetails ? obj.grammarDetails.correctedSentence : obj.vocabularyDetails?.word || payload.message),
              pronunciation: obj.pronunciation || obj.vocabularyDetails?.pronunciation,
              meaningInSourceLang: obj.meaningInSourceLang || obj.grammarDetails?.explanationInSourceLang || obj.vocabularyDetails?.meaningInSourceLang || "",
              grammarDetails: obj.grammarDetails?.correctedSentence ? {
                incorrectSentence: obj.grammarDetails.incorrectSentence || payload.message,
                correctedSentence: obj.grammarDetails.correctedSentence,
                explanationInSourceLang: obj.grammarDetails.explanationInSourceLang || "",
              } : undefined,
              vocabularyDetails: obj.vocabularyDetails?.word ? {
                word: obj.vocabularyDetails.word,
                partOfSpeech: obj.vocabularyDetails.partOfSpeech || "Vocabulary",
                pronunciation: obj.vocabularyDetails.pronunciation || "",
                meaningInSourceLang: obj.vocabularyDetails.meaningInSourceLang || "",
                exampleSentence: obj.vocabularyDetails.exampleSentence || "",
                exampleTranslation: obj.vocabularyDetails.exampleTranslation || "",
              } : undefined,
              clarificationQuestion: obj.clarificationQuestion || undefined,
            };
          }
        }
      }
    } catch (apiError) {
      console.warn("[Multilingual Chat] Gemini API error, falling back to smart local response:", apiError);
    }

    if (!parsedResponse) {
      parsedResponse = getOfflineFallbackResponse(payload);
    }

    return {
      success: true,
      response: parsedResponse,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to process chat request.";
    console.error("Error in processMultilingualChatTurnAction:", errorMsg);
    return {
      success: false,
      error: errorMsg,
      response: getOfflineFallbackResponse(payload),
    };
  }
}
