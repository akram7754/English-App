"use server";

import { db } from "../../prisma/db";
import { cookies } from "next/headers";
import { verifySession } from "../../lib/auth";
import { revalidatePath } from "next/cache";
import {
  compareTargetVsActual,
  computeDeterministicScores,
  generatePronunciationGuidance,
  generateSpeakingFeedback,
} from "../../lib/speaking-engine";
import { BASIC_WORDS_CURRICULUM } from "../../lib/basic-words-data";

export interface BasicWordsUserStats {
  wordsLearnedCount: number;
  phrasesLearnedCount: number;
  wordsPracticedCount: number;
  speakingAttemptsCount: number;
  correctAttemptsCount: number;
  needsPracticeCount: number;
  dailyGoalCompleted: number;
  dailyGoalTarget: number;
  learnedIds: string[];
  favoriteIds: string[];
  needsPracticeIds: string[];
}

export async function getBasicWordsProgressAction(): Promise<{
  success: boolean;
  stats: BasicWordsUserStats;
  error?: string;
}> {
  const defaultStats: BasicWordsUserStats = {
    wordsLearnedCount: 0,
    phrasesLearnedCount: 0,
    wordsPracticedCount: 0,
    speakingAttemptsCount: 0,
    correctAttemptsCount: 0,
    needsPracticeCount: 0,
    dailyGoalCompleted: 0,
    dailyGoalTarget: 10,
    learnedIds: [],
    favoriteIds: [],
    needsPracticeIds: [],
  };

  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    return { success: false, stats: defaultStats, error: "Unauthorized" };
  }

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) {
      return { success: false, stats: defaultStats, error: "User not found" };
    }

    // 1. Fetch user vocab progress with associated vocabulary
    const vocabProgresses = await db.orm.public.UserVocabularyProgress.where({ userId: user.id })
      .include("vocab")
      .all();

    // 2. Fetch practice attempts
    const practiceAttempts = await db.orm.public.PracticeAttempt.where({ userId: user.id })
      .orderBy((m) => m.createdAt.desc())
      .all();

    const learnedIds: string[] = [];
    const favoriteIds: string[] = [];
    const needsPracticeIds: string[] = [];
    const practicedIdSet = new Set<string>();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let dailyGoalCompleted = 0;

    // Process vocab progress
    vocabProgresses.forEach((vp: any) => {
      const wordKey = vp.vocab?.word || "";
      if (!wordKey) return;

      const isFav = typeof vp.masteryLevel === "number" && vp.masteryLevel >= 100;
      const effectiveMastery = (vp.masteryLevel || 0) % 100;

      if (isFav) {
        favoriteIds.push(wordKey);
      }

      if (vp.learned) {
        learnedIds.push(wordKey);
      }

      if (vp.reviewCount > 0) {
        practicedIdSet.add(wordKey);
      }

      if (effectiveMastery === 1) {
        needsPracticeIds.push(wordKey);
      }

      // Check daily activity
      if (vp.lastReviewedAt && new Date(vp.lastReviewedAt) >= startOfToday) {
        dailyGoalCompleted++;
      }
    });

    // Process attempts to find speaking stats and mistake revision
    let correctAttemptsCount = 0;
    const latestAttemptByPhrase = new Map<string, any>();

    practiceAttempts.forEach((att: any) => {
      if (att.status === "Correct" || att.score >= 85) {
        correctAttemptsCount++;
      }

      if (!latestAttemptByPhrase.has(att.phrase)) {
        latestAttemptByPhrase.set(att.phrase, att);
      }
    });

    // If latest attempt for an item was "Needs Practice", ensure it is in needsPracticeIds
    BASIC_WORDS_CURRICULUM.forEach((item) => {
      const latest = latestAttemptByPhrase.get(item.id) || latestAttemptByPhrase.get(item.translations.en?.text);
      if (latest && (latest.status === "Needs Practice" || latest.score < 60)) {
        if (!needsPracticeIds.includes(item.id)) {
          needsPracticeIds.push(item.id);
        }
      }
    });

    // Split learned into words vs phrases
    let wordsLearnedCount = 0;
    let phrasesLearnedCount = 0;

    learnedIds.forEach((id) => {
      const item = BASIC_WORDS_CURRICULUM.find((c) => c.id === id);
      if (item?.type === "phrase") {
        phrasesLearnedCount++;
      } else {
        wordsLearnedCount++;
      }
    });

    return {
      success: true,
      stats: {
        wordsLearnedCount,
        phrasesLearnedCount,
        wordsPracticedCount: practicedIdSet.size,
        speakingAttemptsCount: practiceAttempts.length,
        correctAttemptsCount,
        needsPracticeCount: needsPracticeIds.length,
        dailyGoalCompleted: Math.min(10, dailyGoalCompleted),
        dailyGoalTarget: 10,
        learnedIds,
        favoriteIds,
        needsPracticeIds,
      },
    };
  } catch (error: any) {
    console.error("Failed to query basic words progress:", error);
    return { success: false, stats: defaultStats, error: error.message };
  }
}

export async function recordBasicWordAttemptAction(params: {
  wordId: string;
  targetPhrase: string;
  userTranscript: string;
  difficulty: string;
  targetLangCode: string;
  sourceLangCode: string;
  category: string;
  type: string;
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return { success: false, error: "User not found" };

    const cleanTarget = (params.targetPhrase || "").trim();
    const cleanSpoken = (params.userTranscript || "").trim();

    // 1. Linguistic Deterministic Scoring
    const comparison = compareTargetVsActual(cleanTarget, cleanSpoken);
    const scores = computeDeterministicScores(cleanTarget, cleanSpoken, comparison);
    const guidance = generatePronunciationGuidance(cleanTarget, comparison, params.targetLangCode);
    const feedback = generateSpeakingFeedback(scores, comparison, params.difficulty);

    const score = scores.overall;
    const status: "Correct" | "Almost Correct" | "Needs Practice" =
      score >= 85 ? "Correct" : score >= 60 ? "Almost Correct" : "Needs Practice";

    const mastery = score >= 85 ? 3 : score >= 60 ? 2 : 1;
    const learned = score >= 60;

    // 2. Find or create Vocabulary entry in PostgreSQL
    const vocabWord = params.wordId;
    let vocab = await db.orm.public.Vocabulary.where({ word: vocabWord }).first();
    if (!vocab) {
      vocab = await db.orm.public.Vocabulary.create({
        word: vocabWord,
        definition: `${params.category} - ${params.type}`,
        partOfSpeech: params.category,
        example: cleanTarget,
      });
    }

    // 3. Upsert UserVocabularyProgress
    const existingProgress = await db.orm.public.UserVocabularyProgress.where({
      userId: user.id,
      vocabId: vocab.id,
    }).first();

    const wasFavorite = existingProgress?.masteryLevel ? existingProgress.masteryLevel >= 100 : false;
    const storedMastery = wasFavorite ? 100 + mastery : mastery;
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + (status === "Correct" ? 3 : 1));

    if (existingProgress) {
      await db.orm.public.UserVocabularyProgress.where({ id: existingProgress.id }).update({
        learned: learned || existingProgress.learned,
        masteryLevel: storedMastery,
        reviewCount: (existingProgress.reviewCount || 0) + 1,
        lastReviewedAt: new Date().toISOString(),
        nextReviewAt: nextReview.toISOString(),
      });
    } else {
      await db.orm.public.UserVocabularyProgress.create({
        userId: user.id,
        vocabId: vocab.id,
        learned,
        masteryLevel: storedMastery,
        reviewCount: 1,
        lastReviewedAt: new Date().toISOString(),
        nextReviewAt: nextReview.toISOString(),
      });
    }

    // 4. Save Practice Attempt in PostgreSQL
    await db.orm.public.PracticeAttempt.create({
      userId: user.id,
      phrase: cleanTarget,
      score: Math.round(score),
      difficulty: params.difficulty,
      status,
      transcript: cleanSpoken || "(No speech detected)",
      grammarFeedback: feedback.whatWentWell.join(" ") || "Clear pronunciation attempt.",
      fluencyFeedback: feedback.whatToImprove.join(" ") || "Practice enunciation consistently.",
      vocabFeedback: `Category: ${params.category} | ${params.wordId}`,
    });

    revalidatePath("/basic-words");
    revalidatePath("/progress");
    revalidatePath("/dashboard");

    return {
      success: true,
      score: Math.round(score),
      status,
      guidance,
      feedback,
      transcript: cleanSpoken,
    };
  } catch (err: any) {
    console.error("Failed to record basic word attempt:", err);
    return { success: false, error: err.message || "Failed to process attempt" };
  }
}

export async function toggleBasicWordFavoriteAction(params: {
  wordId: string;
  isFavorite: boolean;
  category?: string;
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) return { success: false, error: "Unauthorized" };

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return { success: false, error: "User not found" };

    let vocab = await db.orm.public.Vocabulary.where({ word: params.wordId }).first();
    if (!vocab) {
      vocab = await db.orm.public.Vocabulary.create({
        word: params.wordId,
        definition: `${params.category || "General"} vocabulary item`,
        partOfSpeech: params.category || "Vocabulary",
        example: "Basic vocabulary word",
      });
    }

    const existingProgress = await db.orm.public.UserVocabularyProgress.where({
      userId: user.id,
      vocabId: vocab.id,
    }).first();

    const currentMastery = (existingProgress?.masteryLevel || 1) % 100;
    const newMastery = params.isFavorite ? 100 + currentMastery : currentMastery;

    if (existingProgress) {
      await db.orm.public.UserVocabularyProgress.where({ id: existingProgress.id }).update({
        masteryLevel: newMastery,
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await db.orm.public.UserVocabularyProgress.create({
        userId: user.id,
        vocabId: vocab.id,
        learned: false,
        masteryLevel: newMastery,
        reviewCount: 0,
        lastReviewedAt: new Date().toISOString(),
        nextReviewAt: tomorrow.toISOString(),
      });
    }

    revalidatePath("/basic-words");
    return { success: true, isFavorite: params.isFavorite };
  } catch (err: any) {
    console.error("Failed to toggle favorite:", err);
    return { success: false, error: err.message };
  }
}

export async function toggleBasicWordLearnedAction(params: {
  wordId: string;
  learned: boolean;
  category?: string;
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) return { success: false, error: "Unauthorized" };

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return { success: false, error: "User not found" };

    let vocab = await db.orm.public.Vocabulary.where({ word: params.wordId }).first();
    if (!vocab) {
      vocab = await db.orm.public.Vocabulary.create({
        word: params.wordId,
        definition: `${params.category || "General"} vocabulary item`,
        partOfSpeech: params.category || "Vocabulary",
        example: "Basic vocabulary word",
      });
    }

    const existingProgress = await db.orm.public.UserVocabularyProgress.where({
      userId: user.id,
      vocabId: vocab.id,
    }).first();

    if (existingProgress) {
      await db.orm.public.UserVocabularyProgress.where({ id: existingProgress.id }).update({
        learned: params.learned,
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await db.orm.public.UserVocabularyProgress.create({
        userId: user.id,
        vocabId: vocab.id,
        learned: params.learned,
        masteryLevel: params.learned ? 3 : 1,
        reviewCount: 0,
        lastReviewedAt: new Date().toISOString(),
        nextReviewAt: tomorrow.toISOString(),
      });
    }

    revalidatePath("/basic-words");
    revalidatePath("/dashboard");
    revalidatePath("/progress");
    return { success: true, learned: params.learned };
  } catch (err: any) {
    console.error("Failed to toggle learned status:", err);
    return { success: false, error: err.message };
  }
}
