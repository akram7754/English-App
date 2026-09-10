"use server";

import { db } from "../../prisma/db";
import { cookies } from "next/headers";
import { verifySession } from "../../lib/auth";
import { ai, callGeminiFast } from "../../lib/gemini";
import { getPersonalizedLearningProfile } from "../../lib/learning-engine";
import {
  buildVoiceTurnPrompt,
  getOfflineVoiceFallback,
  validateAndSanitizeVoiceResponse,
  VoiceTurnPayload,
  VoiceTurnResult,
} from "../../lib/voice-prompts";

export async function processVoiceConversationTurnAction(
  payload: VoiceTurnPayload,
  standaloneSessionToken?: string
) {
  let userCookie: string | undefined = standaloneSessionToken;
  if (!userCookie) {
    try {
      const cookieStore = await cookies();
      userCookie = cookieStore.get("user")?.value;
    } catch {
      // standalone test runner fallback
    }
  }
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) {
      return { success: false, error: "User profile not found." };
    }

    // Automatically enrich with Phase 8 student weaknesses if not provided
    let weaknesses = payload.weaknesses || [];
    if (weaknesses.length === 0) {
      try {
        const profile = await getPersonalizedLearningProfile(user.email);
        if (profile?.detectedWeaknesses) {
          weaknesses = profile.detectedWeaknesses.map((w) => w.title);
        }
      } catch (profErr) {
        console.warn("Could not fetch personalized profile for voice turn:", profErr);
      }
    }

    const cleanTranscript = (payload.userTranscript || "").slice(0, 2000);
    const enrichedPayload: VoiceTurnPayload = {
      ...payload,
      userTranscript: cleanTranscript,
      weaknesses,
    };

    const prompt = buildVoiceTurnPrompt(enrichedPayload);
    let result: VoiceTurnResult;

    try {
      const responseText = await callGeminiFast({
        contents: prompt,
        timeoutMs: 6500,
      });

      const cleanJSON = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJSON);

      result = {
        aiReply: parsed.aiReply || "",
        targetPhrase: parsed.targetPhrase || "Let's continue our conversation.",
        pronunciation:
          parsed.pronunciation ||
          parsed.read ||
          parsed.romanPronunciation ||
          parsed.romanized ||
          "",
        nativeExplanation:
          parsed.nativeExplanation ||
          parsed.explanation ||
          parsed.meaning ||
          parsed.translation ||
          "",
        spokenText:
          parsed.spokenText ||
          `${parsed.aiReply || ""} ${parsed.targetPhrase || ""}`.trim(),
        questionNumber: parsed.questionNumber || payload.questionNumber || 1,
        totalQuestions: parsed.totalQuestions || payload.totalQuestions || 10,
        evaluation: parsed.evaluation
          ? {
              score: typeof parsed.evaluation.score === "number" ? parsed.evaluation.score : 80,
              grammarScore:
                typeof parsed.evaluation.grammarScore === "number"
                  ? parsed.evaluation.grammarScore
                  : 82,
              fluencyScore:
                typeof parsed.evaluation.fluencyScore === "number"
                  ? parsed.evaluation.fluencyScore
                  : 80,
              vocabScore:
                typeof parsed.evaluation.vocabScore === "number"
                  ? parsed.evaluation.vocabScore
                  : 84,
              pronunciationScore:
                typeof parsed.evaluation.pronunciationScore === "number"
                  ? parsed.evaluation.pronunciationScore
                  : 78,
              status:
                parsed.evaluation.score >= 90
                  ? "Excellent"
                  : parsed.evaluation.score >= 75
                  ? "Good"
                  : "Needs Practice",
              whatWentWell:
                parsed.evaluation.whatWentWell || "Good sentence structure and ideas.",
              whatToImprove:
                parsed.evaluation.whatToImprove || "Try using more descriptive phrases.",
              correctedSentence:
                parsed.evaluation.correctedSentence || payload.userTranscript || "",
              tip: parsed.evaluation.tip || "Keep practicing speaking with confidence.",
              grammarFeedback:
                parsed.evaluation.grammarFeedback || "Grammar evaluated accurately.",
              fluencyFeedback:
                parsed.evaluation.fluencyFeedback || "Fluency evaluated accurately.",
              vocabFeedback:
                parsed.evaluation.vocabFeedback || "Vocabulary terms evaluated.",
              pronunciationTip:
                parsed.evaluation.pronunciationTip ||
                "Maintain consistent enunciation and clear stress on key syllables.",
            }
          : undefined,
      };
    } catch (geminiError) {
      console.warn("Gemini voice conversation fallback used:", geminiError);
      result = getOfflineVoiceFallback(enrichedPayload);
    }

    // Apply strict AI Response Contract & Context Sanitization
    const validation = validateAndSanitizeVoiceResponse(result, enrichedPayload);
    result = validation.result;
    if (validation.wasModified) {
      console.log(`[AI Response Contract] Sanitized response: ${validation.reason}`);
    }

    // If turn has an evaluation, record attempt into PostgreSQL
    if (result.evaluation && payload.userTranscript) {
      try {
        await db.orm.public.PracticeAttempt.create({
          userId: user.id,
          phrase: result.targetPhrase || payload.topic,
          score: result.evaluation.score,
          difficulty: payload.difficulty,
          status: result.evaluation.status,
          transcript: payload.userTranscript,
          grammarFeedback: result.evaluation.whatWentWell,
          fluencyFeedback: result.evaluation.whatToImprove,
          vocabFeedback: result.evaluation.tip,
        });
      } catch (dbError) {
        console.error("Failed to record practice attempt in PostgreSQL:", dbError);
      }
    }

    return { success: true, result };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to process conversational voice turn.";
    console.error("Failed in processVoiceConversationTurnAction:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

export async function saveVoiceSessionSummaryAction(
  params: {
    topic: string;
    difficulty: string;
    averageScore: number;
    turnsCompleted: number;
  },
  standaloneSessionToken?: string
) {
  let userCookie: string | undefined = standaloneSessionToken;
  if (!userCookie) {
    try {
      const cookieStore = await cookies();
      userCookie = cookieStore.get("user")?.value;
    } catch {
      // standalone test runner fallback
    }
  }
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) return { success: false, error: "Unauthorized" };

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return { success: false, error: "User not found" };

    const status =
      params.averageScore >= 90
        ? "Excellent"
        : params.averageScore >= 75
        ? "Good"
        : "Needs Practice";

    await db.orm.public.PracticeAttempt.create({
      userId: user.id,
      phrase: `Session Complete: ${params.topic} (${params.turnsCompleted} questions)`,
      score: Math.round(params.averageScore),
      difficulty: params.difficulty,
      status,
      transcript: `Completed full 10-turn dialogue session on ${params.topic}`,
      grammarFeedback: `Overall session average score: ${Math.round(params.averageScore)}%`,
      fluencyFeedback: `Completed ${params.turnsCompleted} conversational prompts.`,
      vocabFeedback: `Topic mastery: ${params.topic}`,
    });

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to save session summary.";
    console.error("Failed to save session summary:", errorMsg);
    return {
      success: false,
      error: process.env.NODE_ENV === "production" ? "Failed to save session summary." : errorMsg,
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
