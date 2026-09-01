import { db } from "../prisma/db";
import { CONVERSATION_TOPICS } from "./languages";

export interface SpacedVocabItem {
  id: number;
  vocabId: number;
  word: string;
  definition: string;
  partOfSpeech?: string | null;
  example?: string | null;
  masteryLevel: number;
  reviewCount: number;
  nextReviewAt: string;
}

export interface WeaknessItem {
  id: string;
  category: "Tenses" | "Articles" | "Subject-Verb" | "Fluency" | "Vocabulary";
  title: string;
  description: string;
  severity: "High" | "Medium";
  frequency: number;
  advice: string;
  actionHref: string;
  actionLabel: string;
}

export interface PersonalizedLearningProfile {
  userId: number;
  userName: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  nativeLanguage: string;
  targetLanguage: string;
  dailyGoalMinutes: number;
  todayStudyMinutes: number;
  todayGoalCompleted: boolean;
  todayGoalPercentage: number;
  streakDays: number;
  totalLessonsCount: number;
  completedLessonsCount: number;
  completionPercentage: number;
  learnedVocabCount: number;
  dueVocabReviewsCount: number;
  dueVocabList: SpacedVocabItem[];
  nextRecommendedLesson: {
    id: number;
    title: string;
    description: string;
    category: string;
    difficulty: string;
  } | null;
  recentlyCompletedLessons: Array<{
    id: number;
    title: string;
    category: string;
    difficulty: string;
    completedAt: string;
  }>;
  speakingAttemptsCount: number;
  averageSpeakingScore: number;
  scoreTrend: Array<{
    id: number;
    date: string;
    score: number;
    phrase: string;
    difficulty: string;
    status: string;
  }>;
  detectedWeaknesses: WeaknessItem[];
  recommendedSpeakingTopic: {
    id: string;
    title: string;
    icon: string;
    description: string;
    reason: string;
  };
}

export async function getPersonalizedLearningProfile(userEmail: string): Promise<PersonalizedLearningProfile | null> {
  try {
    const user = await db.orm.public.User.where({ email: userEmail }).first();
    if (!user) return null;

    const userName = user.name || user.username || "Learner";
    const userLevel = ((user as any).level || "Beginner") as "Beginner" | "Intermediate" | "Advanced";
    const nativeLanguage = (user as any).nativeLanguage || "Hindi";
    const targetLanguage = (user as any).targetLanguage || "English";
    const dailyGoalMinutes = (user as any).dailyGoalMinutes || 15;

    // 1. Fetch Lessons and User Progress
    const allLessons = await db.orm.public.Lesson.orderBy((m) => m.id.asc()).all();
    const lessonProgresses = await db.orm.public.UserLessonProgress.where({ userId: user.id })
      .include("lesson")
      .orderBy((m) => m.completedAt.desc())
      .all();

    const completedLessonIds = new Set(lessonProgresses.map((p) => p.lessonId));
    const totalLessonsCount = allLessons.length;
    const completedLessonsCount = completedLessonIds.size;
    const completionPercentage =
      totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

    // Find next uncompleted lesson
    const nextLesson = allLessons.find((l) => !completedLessonIds.has(l.id)) || allLessons[0] || null;

    const recentlyCompletedLessons = lessonProgresses.slice(0, 3).map((p: any) => ({
      id: p.lesson?.id || p.lessonId,
      title: p.lesson?.title || "Lesson",
      category: p.lesson?.category || "General",
      difficulty: p.lesson?.difficulty || "Beginner",
      completedAt: String(p.completedAt),
    }));

    // 2. Fetch Vocabulary Progress & Spaced Repetition Due Queue
    const vocabProgresses = await db.orm.public.UserVocabularyProgress.where({ userId: user.id })
      .include("vocab")
      .all();

    const learnedVocabCount = vocabProgresses.length;
    const nowIso = new Date().toISOString();

    const dueVocabList: SpacedVocabItem[] = [];
    for (const vp of vocabProgresses as any[]) {
      const isDue = !vp.nextReviewAt || vp.nextReviewAt <= nowIso;
      if (isDue && vp.vocab) {
        dueVocabList.push({
          id: vp.id,
          vocabId: vp.vocabId,
          word: vp.vocab.word,
          definition: vp.vocab.definition,
          partOfSpeech: vp.vocab.partOfSpeech,
          example: vp.vocab.example,
          masteryLevel: vp.masteryLevel || 1,
          reviewCount: vp.reviewCount || 0,
          nextReviewAt: String(vp.nextReviewAt || vp.learnedAt),
        });
      }
    }

    // 3. Fetch Practice Attempts & Speaking Scores
    const practiceAttempts = await db.orm.public.PracticeAttempt.where({ userId: user.id })
      .orderBy((m) => m.createdAt.desc())
      .all();

    const speakingAttemptsCount = practiceAttempts.length;
    const averageSpeakingScore =
      speakingAttemptsCount > 0
        ? Math.round(practiceAttempts.reduce((acc, cur) => acc + cur.score, 0) / speakingAttemptsCount)
        : 85;

    const scoreTrend = practiceAttempts.slice(0, 7).map((att) => ({
      id: att.id,
      date: new Date(att.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: att.score,
      phrase: att.phrase,
      difficulty: att.difficulty,
      status: att.status,
    }));

    // 4. Calculate Real Consecutive Study Streak
    const allActivityDates = new Set<string>();

    practiceAttempts.forEach((a) => {
      allActivityDates.add(new Date(a.createdAt).toISOString().split("T")[0]);
    });
    lessonProgresses.forEach((lp) => {
      allActivityDates.add(new Date(lp.completedAt).toISOString().split("T")[0]);
    });
    vocabProgresses.forEach((vp) => {
      allActivityDates.add(new Date(vp.learnedAt).toISOString().split("T")[0]);
    });

    const activeDatesList = Array.from(allActivityDates).sort((a, b) => b.localeCompare(a));
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let streakDays = 0;
    if (activeDatesList.includes(todayStr) || activeDatesList.includes(yesterdayStr)) {
      let checkDate = activeDatesList.includes(todayStr) ? new Date() : yesterday;
      while (true) {
        const curStr = checkDate.toISOString().split("T")[0];
        if (allActivityDates.has(curStr)) {
          streakDays++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 5. Calculate Today's Estimated Study Time
    let todayMinutes = 0;
    lessonProgresses.forEach((lp) => {
      if (new Date(lp.completedAt).toISOString().split("T")[0] === todayStr) {
        todayMinutes += 5; // 5 mins per completed lesson
      }
    });
    practiceAttempts.forEach((pa) => {
      if (new Date(pa.createdAt).toISOString().split("T")[0] === todayStr) {
        todayMinutes += 2; // 2 mins per speaking practice
      }
    });
    vocabProgresses.forEach((vp: any) => {
      if (
        (vp.lastReviewedAt && new Date(vp.lastReviewedAt).toISOString().split("T")[0] === todayStr) ||
        (vp.learnedAt && new Date(vp.learnedAt).toISOString().split("T")[0] === todayStr)
      ) {
        todayMinutes += 1; // 1 min per vocab review
      }
    });

    const todayGoalPercentage = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));
    const todayGoalCompleted = todayMinutes >= dailyGoalMinutes;

    // 6. Weakness Detection Analysis
    const detectedWeaknesses: WeaknessItem[] = [];
    let tenseErrors = 0;
    let articleErrors = 0;
    let subjectVerbErrors = 0;
    let lowFluencyCount = 0;

    const recentAttempts = practiceAttempts.slice(0, 15);
    recentAttempts.forEach((att) => {
      const fb = (att.grammarFeedback || "").toLowerCase() + " " + (att.phrase || "").toLowerCase();
      if (fb.includes("tense") || fb.includes("past") || fb.includes("perfect") || fb.includes("yesterday")) {
        tenseErrors++;
      }
      if (fb.includes("article") || fb.includes(" a ") || fb.includes(" an ") || fb.includes("the ")) {
        articleErrors++;
      }
      if (fb.includes("verb") || fb.includes("subject") || fb.includes("has") || fb.includes("have") || fb.includes("was") || fb.includes("were")) {
        subjectVerbErrors++;
      }
      if (att.score < 75 || (att.fluencyFeedback || "").toLowerCase().includes("omission")) {
        lowFluencyCount++;
      }
    });

    if (tenseErrors >= 2 || (speakingAttemptsCount === 0 && userLevel === "Beginner")) {
      detectedWeaknesses.push({
        id: "weak-tenses",
        category: "Tenses",
        title: "Past & Present Perfect Tenses",
        description: "Frequent hesitation or structural slips with irregular verbs and past-action timeframes.",
        severity: tenseErrors >= 3 ? "High" : "Medium",
        frequency: tenseErrors || 1,
        advice: "Focus on connecting past participle forms (e.g., 'have worked', 'did not go').",
        actionHref: "/lessons",
        actionLabel: "Study Tenses Lesson",
      });
    }

    if (subjectVerbErrors >= 2) {
      detectedWeaknesses.push({
        id: "weak-subject-verb",
        category: "Subject-Verb",
        title: "Subject-Verb Agreement",
        description: "Misalignment between third-person singular pronouns ('he/she has') and plural verbs.",
        severity: "Medium",
        frequency: subjectVerbErrors,
        advice: "Remember to use singular verbs with third-person singular subjects (He/She/It has/does).",
        actionHref: "/grammar-correction",
        actionLabel: "Practice Grammar Check",
      });
    }

    if (articleErrors >= 2) {
      detectedWeaknesses.push({
        id: "weak-articles",
        category: "Articles",
        title: "Definite & Indefinite Articles",
        description: "Occasional omission of 'a/an/the' before singular countable nouns.",
        severity: "Medium",
        frequency: articleErrors,
        advice: "Use 'an' before vowel sounds (an apple, an hour) and 'a' before consonant sounds.",
        actionHref: "/grammar-correction",
        actionLabel: "Review Articles Rule",
      });
    }

    if (lowFluencyCount >= 2) {
      detectedWeaknesses.push({
        id: "weak-fluency",
        category: "Fluency",
        title: "Speaking Pacing & Enunciation",
        description: "Pacing gaps and word omissions detected during voice practice readings.",
        severity: "High",
        frequency: lowFluencyCount,
        advice: "Practice reading phrases aloud at a steady 120-140 words per minute cadence.",
        actionHref: "/voice-practice",
        actionLabel: "Voice Enunciation Drill",
      });
    }

    // Default friendly focus area if user has clean record
    if (detectedWeaknesses.length === 0) {
      detectedWeaknesses.push({
        id: "weak-general",
        category: "Vocabulary",
        title: "Conversational Idioms & Phrasings",
        description: "Expand your professional vocabulary and everyday conversational fluency.",
        severity: "Medium",
        frequency: 1,
        advice: "Incorporate new idioms into your daily speaking practice.",
        actionHref: "/voice-conversation",
        actionLabel: "Practice AI Voice Tutor",
      });
    }

    // 7. Recommended Speaking Topic Matcher
    let recommendedTopic = CONVERSATION_TOPICS[1]; // Default: Job Interview
    if (tenseErrors > articleErrors) {
      recommendedTopic = CONVERSATION_TOPICS[0]; // Daily conversation (great for tenses)
    } else if (lowFluencyCount > 0) {
      recommendedTopic = CONVERSATION_TOPICS[5]; // Business English
    } else if (speakingAttemptsCount % 2 === 0) {
      recommendedTopic = CONVERSATION_TOPICS[2]; // Travel
    }

    return {
      userId: user.id,
      userName,
      level: userLevel,
      nativeLanguage,
      targetLanguage,
      dailyGoalMinutes,
      todayStudyMinutes: todayMinutes,
      todayGoalCompleted,
      todayGoalPercentage,
      streakDays,
      totalLessonsCount,
      completedLessonsCount,
      completionPercentage,
      learnedVocabCount,
      dueVocabReviewsCount: dueVocabList.length,
      dueVocabList,
      nextRecommendedLesson: nextLesson
        ? {
            id: nextLesson.id,
            title: nextLesson.title,
            description: nextLesson.description,
            category: nextLesson.category,
            difficulty: nextLesson.difficulty,
          }
        : null,
      recentlyCompletedLessons,
      speakingAttemptsCount,
      averageSpeakingScore,
      scoreTrend,
      detectedWeaknesses,
      recommendedSpeakingTopic: {
        id: recommendedTopic.id,
        title: recommendedTopic.title,
        icon: recommendedTopic.icon,
        description: recommendedTopic.description,
        reason: `Targeted practice for ${userLevel} level conversational fluency.`,
      },
    };
  } catch (error) {
    console.error("Failed to build personalized learning profile:", error);
    return null;
  }
}

/**
 * Spaced Repetition Review Engine
 * Interval Schedule:
 * Mastery 1 -> 1 day
 * Mastery 2 -> 3 days
 * Mastery 3 -> 7 days
 * Mastery 4 -> 14 days
 * Mastery 5 -> 30 days (Mastered)
 */
export async function submitVocabularySpacedReview(
  userEmail: string,
  vocabId: number,
  remembered: boolean
) {
  try {
    const user = await db.orm.public.User.where({ email: userEmail }).first();
    if (!user) return { success: false, error: "User not found" };

    const existing = await db.orm.public.UserVocabularyProgress.where({
      userId: user.id,
      vocabId,
    }).first();

    if (!existing) return { success: false, error: "Vocabulary progress record not found" };

    const currentMastery = (existing as any).masteryLevel || 1;
    const currentReviews = (existing as any).reviewCount || 0;

    let newMastery = remembered ? Math.min(5, currentMastery + 1) : 1;
    const intervalDays =
      newMastery === 1 ? 1 : newMastery === 2 ? 3 : newMastery === 3 ? 7 : newMastery === 4 ? 14 : 30;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);

    await db.orm.public.UserVocabularyProgress.where({
      userId: user.id,
      vocabId,
    }).update({
      masteryLevel: newMastery,
      reviewCount: currentReviews + 1,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: nextDate.toISOString(),
    });

    return {
      success: true,
      masteryLevel: newMastery,
      nextReviewDays: intervalDays,
    };
  } catch (error: any) {
    console.error("Failed to update spaced vocabulary review:", error);
    return { success: false, error: error.message || "Failed to save review" };
  }
}
