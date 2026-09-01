"use server";

import { db } from "../../prisma/db";
import { cookies } from "next/headers";
import { verifySession } from "../../lib/auth";
import { ai } from "../../lib/gemini";
import {
  buildVoiceTurnPrompt,
  getOfflineVoiceFallback,
  VoiceTurnPayload,
  VoiceTurnResult,
} from "../../lib/voice-prompts";

export async function processVoiceConversationTurnAction(payload: VoiceTurnPayload) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) {
      return { success: false, error: "User profile not found." };
    }

    const prompt = buildVoiceTurnPrompt(payload);
    let result: VoiceTurnResult;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      const responseText = response.text || "";
      const cleanJSON = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJSON);

      result = {
        intentUnderstood: parsed.intentUnderstood,
        targetPhrase: parsed.targetPhrase || payload.targetPhraseExpected || "Target sentence",
        nativeExplanation: parsed.nativeExplanation || "",
        spokenText: parsed.spokenText || "",
        evaluation: parsed.evaluation
          ? {
              score: typeof parsed.evaluation.score === "number" ? parsed.evaluation.score : 80,
              status:
                parsed.evaluation.score >= 90
                  ? "Excellent"
                  : parsed.evaluation.score >= 75
                  ? "Good"
                  : "Needs Practice",
              grammarFeedback: parsed.evaluation.grammarFeedback || "Grammar evaluated.",
              fluencyFeedback: parsed.evaluation.fluencyFeedback || "Fluency evaluated.",
              vocabFeedback: parsed.evaluation.vocabFeedback || "Vocabulary evaluated.",
              pronunciationTip: parsed.evaluation.pronunciationTip,
            }
          : undefined,
        followUpPrompt: parsed.followUpPrompt,
        followUpSpoken: parsed.followUpSpoken,
      };
    } catch (geminiError) {
      console.warn("Gemini voice conversation fallback used:", geminiError);
      result = getOfflineVoiceFallback(payload);
    }

    // If this turn was an evaluation stage, record it in PostgreSQL
    if (payload.stage === "evaluate" && result.evaluation) {
      try {
        await db.orm.public.PracticeAttempt.create({
          userId: user.id,
          phrase: result.targetPhrase,
          score: result.evaluation.score,
          difficulty: payload.difficulty,
          status: result.evaluation.status,
          transcript: payload.userTranscript,
          grammarFeedback: result.evaluation.grammarFeedback,
          fluencyFeedback: result.evaluation.fluencyFeedback,
          vocabFeedback: result.evaluation.vocabFeedback,
        });
      } catch (dbError) {
        console.error("Failed to record practice attempt in PostgreSQL:", dbError);
      }
    }

    return { success: true, result };
  } catch (error: any) {
    console.error("Failed in processVoiceConversationTurnAction:", error);
    return {
      success: false,
      error: error.message || "Failed to process conversational voice turn.",
    };
  }
}

export async function getVoiceConversationHistoryAction() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) return [];

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return [];

    const attempts = await db.orm.public.PracticeAttempt.where({ userId: user.id })
      .orderBy((m) => m.createdAt.desc())
      .all();
    return attempts;
  } catch (error) {
    console.error("Failed to query voice conversation attempts:", error);
    return [];
  }
}
