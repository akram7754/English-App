"use server";

import { db } from "../../prisma/db";
import { cookies } from "next/headers";
import { verifySession } from "../../lib/auth";
import { callGeminiFast } from "../../lib/gemini";
import { getPersonalizedLearningProfile } from "../../lib/learning-engine";
import {
  compareTargetVsActual,
  computeDeterministicScores,
  generatePronunciationGuidance,
  generateSpeakingFeedback,
  formatFeedbackForStorage,
  parseStoredAttemptFeedback,
  SpeakingEvaluationResult,
  SpeakingScoreBreakdown,
} from "../../lib/speaking-engine";

export async function getAttemptsAction() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) return [];

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return [];

    // Query attempts from PostgreSQL
    const attempts = await db.orm.public.PracticeAttempt.where({ userId: user.id })
      .orderBy((m) => m.createdAt.desc())
      .all();
    return attempts;
  } catch (error) {
    console.error("Failed to query voice practice attempts:", error);
    return [];
  }
}

export async function analyzeSpeakingAction(
  targetPhrase: string,
  userTranscript: string,
  difficulty: string,
  targetLangCode: string = "en",
  sourceLangCode: string = "hi"
) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return { success: false, error: "User not found" };

    const cleanTarget = targetPhrase.trim();
    const cleanSpoken = (userTranscript || "").trim();

    // 1. Run deterministic comparison and baseline scoring
    const comparison = compareTargetVsActual(cleanTarget, cleanSpoken);
    const deterministicScores = computeDeterministicScores(cleanTarget, cleanSpoken, comparison);
    const deterministicGuidance = generatePronunciationGuidance(cleanTarget, comparison, targetLangCode);
    const deterministicFeedback = generateSpeakingFeedback(deterministicScores, comparison, difficulty);

    let finalScores: SpeakingScoreBreakdown = { ...deterministicScores };
    let finalFeedback = { ...deterministicFeedback };
    let finalGuidance = [...deterministicGuidance];

    // 2. Query Gemini for qualitative linguistic refinement if speech exists
    if (cleanSpoken.length > 0) {
      try {
        const prompt =
          `You are an expert Speaking and Pronunciation Evaluator.\n\n` +
          `Target Phrase (${targetLangCode}): "${cleanTarget}"\n` +
          `User Spoken Transcript: "${cleanSpoken}"\n` +
          `Student Native Language: ${sourceLangCode}\n` +
          `Level: ${difficulty}\n\n` +
          `Linguistic Evidence Identified:\n` +
          `- Matched words: ${comparison.matchedWords.join(", ") || "none"}\n` +
          `- Omitted words: ${comparison.omittedWords.join(", ") || "none"}\n` +
          `- Substituted words: ${comparison.substitutedWords.map((s) => `${s.spoken} for ${s.expected}`).join(", ") || "none"}\n\n` +
          `STRICT ANTI-HALLUCINATION RULES:\n` +
          `1. Base your evaluation ONLY on the actual transcript evidence.\n` +
          `2. Do NOT accuse the user of mispronouncing words that were simply omitted. If a word was omitted, classify it as an omission, NOT a pronunciation error.\n` +
          `3. Ordinary Web Speech API cannot provide phoneme-level measurements. Therefore, treat pronunciation as an AI Pronunciation Estimate based on word-level recognition accuracy and phonetics.\n` +
          `4. Do NOT generate inflated scores.\n\n` +
          `OUTPUT FORMAT: Return ONLY valid JSON matching this exact structure:\n` +
          `{\n` +
          `  "grammarScore": number,\n` +
          `  "fluencyScore": number,\n` +
          `  "vocabScore": number,\n` +
          `  "pronunciationScore": number,\n` +
          `  "overallScore": number,\n` +
          `  "whatWentWell": ["string", "string"],\n` +
          `  "whatToImprove": ["string", "string"],\n` +
          `  "correctedSentence": "string",\n` +
          `  "practiceTip": "string",\n` +
          `  "pronunciationGuidance": [\n` +
          `    {\n` +
          `      "word": "string",\n` +
          `      "phonetic": "string",\n` +
          `      "tip": "string"\n` +
          `    }\n` +
          `  ]\n` +
          `}`;

        const responseText = await callGeminiFast({
          contents: prompt,
          timeoutMs: 6500,
        });

        const cleanJSON = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJSON);

        if (typeof parsed.grammarScore === "number") {
          finalScores.grammar = Math.min(100, Math.max(10, Math.round(parsed.grammarScore)));
        }
        if (typeof parsed.fluencyScore === "number") {
          finalScores.fluency = Math.min(100, Math.max(10, Math.round(parsed.fluencyScore)));
        }
        if (typeof parsed.vocabScore === "number") {
          finalScores.vocabulary = Math.min(100, Math.max(10, Math.round(parsed.vocabScore)));
        }
        if (typeof parsed.pronunciationScore === "number") {
          finalScores.pronunciation = Math.min(100, Math.max(10, Math.round(parsed.pronunciationScore)));
        }

        // Weighted combination: 30% Grammar + 25% Fluency + 25% Vocab + 20% Pronunciation
        finalScores.overall = Math.round(
          finalScores.grammar * 0.3 +
          finalScores.fluency * 0.25 +
          finalScores.vocabulary * 0.25 +
          finalScores.pronunciation * 0.2
        );
        finalScores.status =
          finalScores.overall >= 90 ? "Excellent" : finalScores.overall >= 75 ? "Good" : "Needs Practice";

        if (Array.isArray(parsed.whatWentWell) && parsed.whatWentWell.length > 0) {
          finalFeedback.whatWentWell = parsed.whatWentWell.slice(0, 3);
        }
        if (Array.isArray(parsed.whatToImprove) && parsed.whatToImprove.length > 0) {
          finalFeedback.whatToImprove = parsed.whatToImprove.slice(0, 3);
        }
        if (parsed.correctedSentence) {
          finalFeedback.correctedSentence = parsed.correctedSentence;
        }
        if (parsed.practiceTip) {
          finalFeedback.practiceTip = parsed.practiceTip;
        }
        if (Array.isArray(parsed.pronunciationGuidance) && parsed.pronunciationGuidance.length > 0) {
          finalGuidance = parsed.pronunciationGuidance.slice(0, 3).map((g: any) => ({
            word: g.word || cleanTarget,
            phonetic: g.phonetic || g.word,
            tip: g.tip || "Enunciate clearly.",
            audioTarget: g.word || cleanTarget,
          }));
        }
      } catch (geminiError) {
        console.warn("Gemini speaking analysis fallback to deterministic engine:", geminiError);
      }
    }

    // 3. Recommended Next Action
    let recommendation = {
      title: "Continue Voice Practice",
      description: "Keep training with graded phrases to improve speech fluency.",
      href: "/voice-practice",
      actionLabel: "Next Phrase",
    };

    if (finalScores.fluency < 75) {
      recommendation = {
        title: "Practice Natural Dialogue",
        description: "Your fluency score is currently lower than other areas. Try a 5-minute interactive conversation.",
        href: "/voice-conversation",
        actionLabel: "Practice Conversation",
      };
    } else if (finalScores.grammar < 75) {
      recommendation = {
        title: "Review Grammar Rules",
        description: "Focus on sentence construction and connecting words with instant feedback.",
        href: "/grammar-correction",
        actionLabel: "Practice Grammar",
      };
    }

    const evaluationResult: SpeakingEvaluationResult = {
      scores: finalScores,
      comparison,
      pronunciationGuidance: finalGuidance,
      feedback: finalFeedback,
      recommendation,
      disclaimer:
        "AI Pronunciation Guidance is an estimate derived from Speech-to-Text transcript matching and linguistic phonetics. It does not replace clinical phoneme laboratory diagnostics.",
    };

    // 4. Save into PostgreSQL
    const storageFeedback = formatFeedbackForStorage(evaluationResult);

    const attempt = await db.orm.public.PracticeAttempt.create({
      userId: user.id,
      phrase: cleanTarget,
      score: finalScores.overall,
      difficulty,
      status: finalScores.status,
      transcript: cleanSpoken,
      grammarFeedback: storageFeedback.grammarFeedback,
      fluencyFeedback: storageFeedback.fluencyFeedback,
      vocabFeedback: storageFeedback.vocabFeedback,
    });

    return {
      success: true,
      attempt,
      evaluation: evaluationResult,
    };
  } catch (error: any) {
    console.error("Failed in analyzeSpeakingAction:", error);
    return { success: false, error: error.message || "Database action error" };
  }
}

export async function getSpeakingStatsAction() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return { success: false, error: "User not found" };

    const attempts = await db.orm.public.PracticeAttempt.where({ userId: user.id })
      .orderBy((m) => m.createdAt.desc())
      .all();

    const totalReadings = attempts.length;

    if (totalReadings === 0) {
      return {
        success: true,
        stats: {
          totalReadings: 0,
          avgScore: null,
          grammarAvg: null,
          fluencyAvg: null,
          vocabAvg: null,
          pronunciationAvg: null,
          speakingStreak: 0,
          trend: "insufficient",
          trendLabel: "Complete more speaking practice to see your trend.",
          trendDelta: "0%",
          levelProficiency: {
            beginner: { count: 0, accuracy: null },
            intermediate: { count: 0, accuracy: null },
            advanced: { count: 0, accuracy: null },
          },
          detectedWeaknesses: [],
          attempts: [],
        },
      };
    }

    // 1. Overall & Dimensional Averages
    let sumOverall = 0;
    let sumGrammar = 0;
    let sumFluency = 0;
    let sumVocab = 0;
    let sumPronunciation = 0;

    let begCount = 0, begSum = 0;
    let intCount = 0, intSum = 0;
    let advCount = 0, advSum = 0;

    const parsedAttempts = attempts.map((att) => {
      const breakdown = parseStoredAttemptFeedback(att);
      sumOverall += att.score;
      sumGrammar += breakdown.grammar;
      sumFluency += breakdown.fluency;
      sumVocab += breakdown.vocabulary;
      sumPronunciation += breakdown.pronunciation;

      const diff = (att.difficulty || "").toLowerCase();
      if (diff.includes("beg")) {
        begCount++;
        begSum += att.score;
      } else if (diff.includes("int")) {
        intCount++;
        intSum += att.score;
      } else if (diff.includes("adv")) {
        advCount++;
        advSum += att.score;
      }

      return {
        id: att.id,
        date: new Date(att.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: String(att.createdAt),
        phrase: att.phrase,
        transcript: att.transcript,
        difficulty: att.difficulty,
        score: att.score,
        status: att.status,
        scores: breakdown,
      };
    });

    const avgScore = Math.round(sumOverall / totalReadings);
    const grammarAvg = Math.round(sumGrammar / totalReadings);
    const fluencyAvg = Math.round(sumFluency / totalReadings);
    const vocabAvg = Math.round(sumVocab / totalReadings);
    const pronunciationAvg = Math.round(sumPronunciation / totalReadings);

    // 2. Trend Calculation
    let trend: "improving" | "stable" | "needs-attention" | "insufficient" = "insufficient";
    let trendLabel = "Complete more speaking practice to see your trend.";
    let trendDelta = "±0%";

    if (totalReadings >= 2) {
      const recentWindow = Math.min(3, Math.floor(totalReadings / 2) || 1);
      const recentScores = attempts.slice(0, recentWindow).map((a) => a.score);
      const olderScores = attempts.slice(recentWindow).map((a) => a.score);

      const recentAvg = Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length);
      const olderAvg = Math.round(olderScores.reduce((a, b) => a + b, 0) / olderScores.length);
      const diff = recentAvg - olderAvg;

      if (diff >= 2) {
        trend = "improving";
        trendLabel = "📈 Improving (+ " + diff + "%)";
        trendDelta = `+${diff}%`;
      } else if (diff <= -2) {
        trend = "needs-attention";
        trendLabel = "📉 Needs Attention (" + diff + "%)";
        trendDelta = `${diff}%`;
      } else {
        trend = "stable";
        trendLabel = "→ Stable (consistent performance)";
        trendDelta = "±0%";
      }
    }

    // 3. Speaking Streak (Distinct consecutive activity dates)
    const distinctDates = new Set<string>();
    attempts.forEach((a) => {
      distinctDates.add(new Date(a.createdAt).toISOString().split("T")[0]);
    });
    const sortedDates = Array.from(distinctDates).sort().reverse();
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let speakingStreak = 0;
    if (sortedDates.includes(todayStr) || sortedDates.includes(yesterdayStr)) {
      let checkDate = sortedDates.includes(todayStr) ? new Date() : yesterday;
      while (true) {
        const dStr = checkDate.toISOString().split("T")[0];
        if (distinctDates.has(dStr)) {
          speakingStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 4. Personalized Weaknesses from learning engine
    let detectedWeaknesses: any[] = [];
    try {
      const profile = await getPersonalizedLearningProfile(user.email);
      if (profile?.detectedWeaknesses) {
        detectedWeaknesses = profile.detectedWeaknesses;
      }
    } catch (e) {
      console.warn("Could not fetch personalized profile for speaking stats:", e);
    }

    return {
      success: true,
      stats: {
        totalReadings,
        avgScore,
        grammarAvg,
        fluencyAvg,
        vocabAvg,
        pronunciationAvg,
        speakingStreak,
        trend,
        trendLabel,
        trendDelta,
        levelProficiency: {
          beginner: {
            count: begCount,
            accuracy: begCount > 0 ? Math.round(begSum / begCount) : null,
          },
          intermediate: {
            count: intCount,
            accuracy: intCount > 0 ? Math.round(intSum / intCount) : null,
          },
          advanced: {
            count: advCount,
            accuracy: advCount > 0 ? Math.round(advSum / advCount) : null,
          },
        },
        detectedWeaknesses,
        attempts: parsedAttempts,
      },
    };
  } catch (err: any) {
    console.error("Failed in getSpeakingStatsAction:", err);
    return { success: false, error: err.message || "Failed to load speaking statistics." };
  }
}
