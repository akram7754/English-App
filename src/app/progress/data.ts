import { db } from "../../prisma/db";
import { SUPPORTED_LANGUAGES } from "../../lib/languages";

export interface ProgressLessonItem {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  completed: boolean;
  completedAt?: string;
}

export interface ProgressSpeakingAttempt {
  id: number;
  score: number;
  phrase: string;
  difficulty: string;
  status: string;
  grammarFeedback?: string | null;
  fluencyFeedback?: string | null;
  vocabFeedback?: string | null;
  createdAt: string;
  timestamp: number;
  dateFormatted: string;
}

export interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "lessons" | "vocab" | "speaking" | "streak" | "xp";
  unlocked: boolean;
  progressText: string;
  progressPercent: number;
  unlockedAt?: string;
}

export interface ActivityTimelineItem {
  id: string;
  type: "lesson" | "vocab" | "speaking";
  title: string;
  description: string;
  timestamp: number;
  dateFormatted: string;
  relativeTime: string;
  score?: number;
  badge?: string;
}

export interface ComprehensiveProgressData {
  user: {
    id: number;
    name: string;
    email: string;
    level: string;
    initials: string;
    isAdmin: boolean;
    nativeLanguage: string;
    targetLanguage: string;
    dailyGoalMinutes: number;
  };
  overall: {
    overallPercentage: number;
    lessonsPercentage: number;
    vocabPercentage: number;
    grammarPercentage: number;
    speakingPercentage: number;
    hasEnoughData: boolean;
  };
  lessons: {
    totalCount: number;
    completedCount: number;
    remainingCount: number;
    percentage: number;
    currentLesson: ProgressLessonItem | null;
    nextRecommendedLesson: ProgressLessonItem | null;
    recentCompletedList: ProgressLessonItem[];
  };
  vocabulary: {
    totalCurriculumCount: number;
    learnedCount: number;
    masteredCount: number;
    inReviewCount: number;
    dueCount: number;
    percentage: number;
  };
  speaking: {
    totalAttempts: number;
    averageScore: number | null;
    bestScore: number | null;
    recentScore: number | null;
    chronologicalAttempts: ProgressSpeakingAttempt[];
  };
  grammar: {
    grammarScore: number | null;
    strengths: string[];
    weaknesses: Array<{
      id: string;
      category: string;
      title: string;
      description: string;
      severity: "High" | "Medium";
      frequency: number;
      advice: string;
      actionHref: string;
      actionLabel: string;
    }>;
  };
  streak: {
    currentStreakDays: number;
    bestStreakDays: number;
    activeDatesCount: number;
  };
  dailyGoal: {
    dailyGoalMinutes: number;
    todayStudyMinutes: number;
    goalPercentage: number;
    goalCompleted: boolean;
  };
  xp: {
    totalXP: number;
    breakdown: {
      lessonsXP: number;
      vocabXP: number;
      speakingXP: number;
      baseXP: number;
    };
  };
  milestones: MilestoneItem[];
  recentActivities: ActivityTimelineItem[];
  recommendedNextStep: {
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
    badge: string;
  };
}

function formatRelativeTime(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function getComprehensiveProgressData(userEmail: string): Promise<ComprehensiveProgressData | null> {
  try {
    const user = await db.orm.public.User.where({ email: userEmail }).first();
    if (!user) return null;

    const isAdmin = user.role === "admin";
    const userName = user.name || user.username || "Learner";
    const userInitials =
      userName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "US";

    const userLevel = (user as any).level || "Beginner";
    const nativeLanguage = (user as any).nativeLanguage || "Hindi";
    const targetLanguage = (user as any).targetLanguage || "English";
    const dailyGoalMinutes = (user as any).dailyGoalMinutes || 15;

    // 1. Fetch Lessons & User Progress
    const allLessons = await db.orm.public.Lesson.orderBy((m) => m.id.asc()).all();
    const lessonProgresses = await db.orm.public.UserLessonProgress.where({ userId: user.id })
      .include("lesson")
      .orderBy((m) => m.completedAt.desc())
      .all();

    const completedLessonIdMap = new Map<number, string>();
    lessonProgresses.forEach((lp: any) => {
      completedLessonIdMap.set(lp.lessonId, String(lp.completedAt));
    });

    const totalLessonsCount = allLessons.length;
    const completedLessonsCount = completedLessonIdMap.size;
    const remainingLessonsCount = Math.max(0, totalLessonsCount - completedLessonsCount);
    const lessonProgressPercentage =
      totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

    const lessonItems: ProgressLessonItem[] = allLessons.map((l) => ({
      id: l.id,
      title: l.title,
      category: l.category,
      difficulty: l.difficulty,
      completed: completedLessonIdMap.has(l.id),
      completedAt: completedLessonIdMap.get(l.id),
    }));

    const currentLesson = lessonItems.find((l) => !l.completed) || lessonItems[0] || null;
    const nextRecommendedLesson = currentLesson;
    const recentCompletedList = lessonItems.filter((l) => l.completed).slice(0, 4);

    // 2. Fetch Vocabulary SRS
    const totalVocabList = await db.orm.public.Vocabulary.all();
    const vocabProgresses = await db.orm.public.UserVocabularyProgress.where({ userId: user.id })
      .include("vocab")
      .orderBy((m) => m.learnedAt.desc())
      .all();

    const learnedVocabCount = vocabProgresses.length;
    const totalCurriculumVocabCount = totalVocabList.length;
    const nowIso = new Date().toISOString();

    let masteredVocabCount = 0;
    let inReviewVocabCount = 0;
    let dueVocabCount = 0;

    vocabProgresses.forEach((vp: any) => {
      const mastery = vp.masteryLevel || 1;
      if (mastery >= 5) {
        masteredVocabCount++;
      } else {
        inReviewVocabCount++;
      }

      if (!vp.nextReviewAt || vp.nextReviewAt <= nowIso) {
        dueVocabCount++;
      }
    });

    const vocabProgressPercentage =
      totalCurriculumVocabCount > 0
        ? Math.min(100, Math.round((learnedVocabCount / totalCurriculumVocabCount) * 100))
        : 0;

    // 3. Fetch Speaking Attempts
    const practiceAttempts = await db.orm.public.PracticeAttempt.where({ userId: user.id })
      .orderBy((m) => m.createdAt.asc())
      .all();

    const speakingAttemptsCount = practiceAttempts.length;
    const scores = practiceAttempts.map((a) => a.score);
    const averageSpeakingScore =
      speakingAttemptsCount > 0
        ? Math.round(scores.reduce((acc, cur) => acc + cur, 0) / speakingAttemptsCount)
        : null;

    const bestSpeakingScore = speakingAttemptsCount > 0 ? Math.max(...scores) : null;
    const recentSpeakingScore =
      speakingAttemptsCount > 0 ? practiceAttempts[practiceAttempts.length - 1].score : null;

    const chronologicalAttempts: ProgressSpeakingAttempt[] = practiceAttempts.map((att) => {
      const createdDate = new Date(att.createdAt);
      return {
        id: att.id,
        score: att.score,
        phrase: att.phrase,
        difficulty: att.difficulty,
        status: att.status,
        grammarFeedback: att.grammarFeedback,
        fluencyFeedback: att.fluencyFeedback,
        vocabFeedback: att.vocabFeedback,
        createdAt: String(att.createdAt),
        timestamp: createdDate.getTime(),
        dateFormatted: createdDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };
    });

    // 4. Grammar Progress & Weakness Analysis
    let grammarWeaknessList: ComprehensiveProgressData["grammar"]["weaknesses"] = [];
    const grammarStrengths: string[] = [];

    let tenseErrors = 0;
    let articleErrors = 0;
    let subjectVerbErrors = 0;
    let prepositionErrors = 0;
    let lowFluencyCount = 0;
    let attemptsWithGrammarFeedback = 0;
    let cleanGrammarAttempts = 0;

    practiceAttempts.forEach((att) => {
      const fb = (att.grammarFeedback || "").toLowerCase() + " " + (att.phrase || "").toLowerCase();
      let hasError = false;

      if (att.grammarFeedback) {
        attemptsWithGrammarFeedback++;
      }

      if (fb.includes("tense") || fb.includes("past") || fb.includes("perfect") || fb.includes("yesterday")) {
        tenseErrors++;
        hasError = true;
      }
      if (fb.includes("article") || fb.includes(" a ") || fb.includes(" an ") || fb.includes("the ")) {
        articleErrors++;
        hasError = true;
      }
      if (
        fb.includes("verb") ||
        fb.includes("subject") ||
        fb.includes("has") ||
        fb.includes("have") ||
        fb.includes("was") ||
        fb.includes("were")
      ) {
        subjectVerbErrors++;
        hasError = true;
      }
      if (fb.includes("preposition") || fb.includes(" in ") || fb.includes(" on ") || fb.includes(" at ")) {
        prepositionErrors++;
        hasError = true;
      }

      if (!hasError && att.score >= 80) {
        cleanGrammarAttempts++;
      }

      if (att.score < 75 || (att.fluencyFeedback || "").toLowerCase().includes("omission")) {
        lowFluencyCount++;
      }
    });

    if (tenseErrors >= 1) {
      grammarWeaknessList.push({
        id: "weak-tenses",
        category: "Tenses",
        title: "Past & Perfect Verb Tenses",
        description: "Frequent slips with irregular past verb forms or timeframes.",
        severity: tenseErrors >= 3 ? "High" : "Medium",
        frequency: tenseErrors,
        advice: "Focus on connecting past participle forms (e.g., 'have worked', 'went').",
        actionHref: "/grammar-correction",
        actionLabel: "Practice Verb Tenses",
      });
    } else if (speakingAttemptsCount > 0) {
      grammarStrengths.push("Past & Present Verb Tenses");
    }

    if (subjectVerbErrors >= 1) {
      grammarWeaknessList.push({
        id: "weak-subject-verb",
        category: "Subject-Verb",
        title: "Subject-Verb Agreement",
        description: "Misalignment between subjects and verb forms (e.g. 'he go' instead of 'he goes').",
        severity: subjectVerbErrors >= 2 ? "High" : "Medium",
        frequency: subjectVerbErrors,
        advice: "Remember singular verbs for third-person singular subjects (He/She/It has/does).",
        actionHref: "/grammar-correction",
        actionLabel: "Practice Subject-Verb",
      });
    } else if (speakingAttemptsCount > 0) {
      grammarStrengths.push("Subject-Verb Concord");
    }

    if (articleErrors >= 1) {
      grammarWeaknessList.push({
        id: "weak-articles",
        category: "Articles",
        title: "Definite & Indefinite Articles",
        description: "Omission or misuse of 'a/an/the' before singular countable nouns.",
        severity: "Medium",
        frequency: articleErrors,
        advice: "Use 'an' before vowel sounds and 'a' before consonants.",
        actionHref: "/grammar-correction",
        actionLabel: "Review Articles Rule",
      });
    } else if (speakingAttemptsCount > 0) {
      grammarStrengths.push("Articles Usage (a/an/the)");
    }

    if (prepositionErrors >= 1) {
      grammarWeaknessList.push({
        id: "weak-prepositions",
        category: "Prepositions",
        title: "Preposition Selection",
        description: "Inconsistencies with preposition choice (in, on, at, for, to).",
        severity: "Medium",
        frequency: prepositionErrors,
        advice: "Group prepositions by context: time ('at 5 PM', 'in July') vs. location ('at home', 'in Paris').",
        actionHref: "/grammar-correction",
        actionLabel: "Practice Prepositions",
      });
    }

    if (lowFluencyCount >= 2) {
      grammarWeaknessList.push({
        id: "weak-fluency",
        category: "Fluency",
        title: "Speaking Pacing & Enunciation",
        description: "Pauses or word omissions detected during voice recordings.",
        severity: "High",
        frequency: lowFluencyCount,
        advice: "Practice reading phrases aloud at a steady 120-140 WPM pace.",
        actionHref: "/voice-practice",
        actionLabel: "Voice Enunciation Drill",
      });
    }

    let grammarScore: number | null = null;
    if (attemptsWithGrammarFeedback > 0) {
      grammarScore = Math.round((cleanGrammarAttempts / attemptsWithGrammarFeedback) * 100);
    } else if (speakingAttemptsCount > 0) {
      grammarScore = averageSpeakingScore;
    }

    // 5. Calculate Real Consecutive Study Streak and Best Streak
    const allActivityDates = new Set<string>();

    practiceAttempts.forEach((a) => {
      allActivityDates.add(new Date(a.createdAt).toISOString().split("T")[0]);
    });
    lessonProgresses.forEach((lp: any) => {
      allActivityDates.add(new Date(lp.completedAt).toISOString().split("T")[0]);
    });
    vocabProgresses.forEach((vp: any) => {
      allActivityDates.add(new Date(vp.learnedAt).toISOString().split("T")[0]);
      if (vp.lastReviewedAt) {
        allActivityDates.add(new Date(vp.lastReviewedAt).toISOString().split("T")[0]);
      }
    });

    const activeDatesList = Array.from(allActivityDates).sort((a, b) => b.localeCompare(a));
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let currentStreakDays = 0;
    if (activeDatesList.includes(todayStr) || activeDatesList.includes(yesterdayStr)) {
      let checkDate = activeDatesList.includes(todayStr) ? new Date() : yesterday;
      while (true) {
        const curStr = checkDate.toISOString().split("T")[0];
        if (allActivityDates.has(curStr)) {
          currentStreakDays++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate Best Streak across all activity history
    let bestStreakDays = 0;
    if (allActivityDates.size > 0) {
      const sortedAscDates = Array.from(allActivityDates)
        .map((d) => new Date(d + "T00:00:00Z").getTime())
        .sort((a, b) => a - b);

      let currentRun = 1;
      let maxRun = 1;
      const oneDayMs = 24 * 60 * 60 * 1000;

      for (let i = 1; i < sortedAscDates.length; i++) {
        const diff = sortedAscDates[i] - sortedAscDates[i - 1];
        if (diff === oneDayMs) {
          currentRun++;
          if (currentRun > maxRun) maxRun = currentRun;
        } else if (diff > oneDayMs) {
          currentRun = 1;
        }
      }
      bestStreakDays = Math.max(currentStreakDays, maxRun);
    }

    // 6. Calculate Today's Estimated Study Time
    let todayMinutes = 0;
    lessonProgresses.forEach((lp: any) => {
      if (new Date(lp.completedAt).toISOString().split("T")[0] === todayStr) {
        todayMinutes += 5;
      }
    });
    practiceAttempts.forEach((pa) => {
      if (new Date(pa.createdAt).toISOString().split("T")[0] === todayStr) {
        todayMinutes += 2;
      }
    });
    vocabProgresses.forEach((vp: any) => {
      if (
        (vp.lastReviewedAt && new Date(vp.lastReviewedAt).toISOString().split("T")[0] === todayStr) ||
        (vp.learnedAt && new Date(vp.learnedAt).toISOString().split("T")[0] === todayStr)
      ) {
        todayMinutes += 1;
      }
    });

    const dailyGoalPercentage = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));
    const dailyGoalCompleted = todayMinutes >= dailyGoalMinutes;

    // 7. Calculate XP System (Reusing existing approved formula)
    // Formula: completedLessons * 50 + learnedVocab * 20 + attempts * 30 + 240
    const lessonsXP = completedLessonsCount * 50;
    const vocabXP = learnedVocabCount * 20;
    const speakingXP = speakingAttemptsCount * 30;
    const baseXP = 240;
    const totalXP = lessonsXP + vocabXP + speakingXP + baseXP;

    // 8. Overall Learning Progress Calculation
    // Only calculate components that have data
    const activeDimensions: number[] = [];
    activeDimensions.push(lessonProgressPercentage);
    activeDimensions.push(vocabProgressPercentage);
    if (grammarScore !== null) activeDimensions.push(grammarScore);
    if (averageSpeakingScore !== null) activeDimensions.push(averageSpeakingScore);

    const hasEnoughData = completedLessonsCount > 0 || learnedVocabCount > 0 || speakingAttemptsCount > 0;
    const overallPercentage =
      hasEnoughData && activeDimensions.length > 0
        ? Math.round(activeDimensions.reduce((a, b) => a + b, 0) / activeDimensions.length)
        : 0;

    // 9. Achievements / Milestones (100% Real Data Only)
    const milestones: MilestoneItem[] = [
      {
        id: "first-lesson",
        title: "First Step",
        description: "Complete your first curriculum lesson",
        icon: "🎯",
        category: "lessons",
        unlocked: completedLessonsCount >= 1,
        progressText: `${Math.min(completedLessonsCount, 1)} / 1 Lesson`,
        progressPercent: completedLessonsCount >= 1 ? 100 : 0,
        unlockedAt: lessonProgresses[lessonProgresses.length - 1]?.completedAt
          ? String(lessonProgresses[lessonProgresses.length - 1].completedAt)
          : undefined,
      },
      {
        id: "word-collector",
        title: "Word Collector",
        description: "Add 5 vocabulary words to Spaced Repetition",
        icon: "📖",
        category: "vocab",
        unlocked: learnedVocabCount >= 5,
        progressText: `${Math.min(learnedVocabCount, 5)} / 5 Words`,
        progressPercent: Math.min(100, Math.round((learnedVocabCount / 5) * 100)),
      },
      {
        id: "voice-pioneer",
        title: "Voice Pioneer",
        description: "Complete your first speaking practice attempt",
        icon: "🗣️",
        category: "speaking",
        unlocked: speakingAttemptsCount >= 1,
        progressText: `${Math.min(speakingAttemptsCount, 1)} / 1 Attempt`,
        progressPercent: speakingAttemptsCount >= 1 ? 100 : 0,
        unlockedAt: practiceAttempts[0]?.createdAt ? String(practiceAttempts[0].createdAt) : undefined,
      },
      {
        id: "on-fire",
        title: "On Fire",
        description: "Maintain a 3-day consecutive study streak",
        icon: "🔥",
        category: "streak",
        unlocked: bestStreakDays >= 3,
        progressText: `${Math.min(bestStreakDays, 3)} / 3 Days`,
        progressPercent: Math.min(100, Math.round((bestStreakDays / 3) * 100)),
      },
      {
        id: "centurion",
        title: "Centurion",
        description: "Accumulate 500+ XP in learning activities",
        icon: "🌟",
        category: "xp",
        unlocked: totalXP >= 500,
        progressText: `${Math.min(totalXP, 500)} / 500 XP`,
        progressPercent: Math.min(100, Math.round((totalXP / 500) * 100)),
      },
      {
        id: "fluency-ace",
        title: "Fluency Ace",
        description: "Achieve a speaking accuracy score of 90% or higher",
        icon: "⚡",
        category: "speaking",
        unlocked: (bestSpeakingScore || 0) >= 90,
        progressText: bestSpeakingScore ? `${bestSpeakingScore} / 90% Score` : "0 / 90% Score",
        progressPercent: bestSpeakingScore ? Math.min(100, Math.round((bestSpeakingScore / 90) * 100)) : 0,
      },
      {
        id: "word-master",
        title: "Word Master",
        description: "Reach Level 5 Mastery on any vocabulary item",
        icon: "🏆",
        category: "vocab",
        unlocked: masteredVocabCount >= 1,
        progressText: `${Math.min(masteredVocabCount, 1)} / 1 Mastered`,
        progressPercent: masteredVocabCount >= 1 ? 100 : 0,
      },
      {
        id: "master-scholar",
        title: "Master Scholar",
        description: "Complete all available curriculum lessons",
        icon: "🎓",
        category: "lessons",
        unlocked: totalLessonsCount > 0 && completedLessonsCount >= totalLessonsCount,
        progressText: `${completedLessonsCount} / ${totalLessonsCount} Lessons`,
        progressPercent: lessonProgressPercentage,
      },
    ];

    // 10. Merge Recent Activity Timeline (Sorted Descending by Timestamp)
    const now = new Date();
    const rawActivities: ActivityTimelineItem[] = [];

    lessonProgresses.forEach((lp: any) => {
      const d = new Date(lp.completedAt);
      rawActivities.push({
        id: `lp-${lp.id}`,
        type: "lesson",
        title: lp.lesson?.title || "Curriculum Lesson",
        description: `Completed lesson in ${lp.lesson?.category || "General"} (${lp.lesson?.difficulty || "Beginner"})`,
        timestamp: d.getTime(),
        dateFormatted: d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        relativeTime: formatRelativeTime(d, now),
        badge: "+50 XP",
      });
    });

    vocabProgresses.forEach((vp: any) => {
      const d = new Date(vp.lastReviewedAt || vp.learnedAt);
      const isReview = (vp.reviewCount || 0) > 0;
      rawActivities.push({
        id: `vp-${vp.id}`,
        type: "vocab",
        title: vp.vocab?.word || "Vocabulary Word",
        description: isReview
          ? `Reviewed SRS card • Mastery Level ${vp.masteryLevel || 1}`
          : `Learned new word (${vp.vocab?.partOfSpeech || "term"})`,
        timestamp: d.getTime(),
        dateFormatted: d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        relativeTime: formatRelativeTime(d, now),
        badge: isReview ? "+10 XP" : "+20 XP",
      });
    });

    practiceAttempts.forEach((pa) => {
      const d = new Date(pa.createdAt);
      rawActivities.push({
        id: `pa-${pa.id}`,
        type: "speaking",
        title: `Speaking Practice: "${pa.phrase.slice(0, 36)}${pa.phrase.length > 36 ? "..." : ""}"`,
        description: `Score: ${pa.score}% • Status: ${pa.status} • Level: ${pa.difficulty}`,
        timestamp: d.getTime(),
        dateFormatted: d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        relativeTime: formatRelativeTime(d, now),
        score: pa.score,
        badge: "+30 XP",
      });
    });

    // Sort descending by timestamp
    const recentActivities = rawActivities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);

    // 11. Recommended Next Step
    let recommendedNextStep: ComprehensiveProgressData["recommendedNextStep"];

    if (dueVocabCount > 0) {
      recommendedNextStep = {
        title: `Review ${dueVocabCount} Due Vocabulary Word${dueVocabCount > 1 ? "s" : ""}`,
        description: "You have words scheduled for Spaced Repetition review today. Solidify your memory now.",
        actionLabel: "Review Vocabulary",
        actionHref: "/lessons",
        badge: "SRS Due",
      };
    } else if (currentLesson) {
      recommendedNextStep = {
        title: `Continue: ${currentLesson.title}`,
        description: `Dive into ${currentLesson.category} (${currentLesson.difficulty}) and complete the 6-stage interactive lesson.`,
        actionLabel: "Continue Lesson",
        actionHref: "/lessons",
        badge: "Next Lesson",
      };
    } else if (grammarWeaknessList.length > 0) {
      const primaryWeak = grammarWeaknessList[0];
      recommendedNextStep = {
        title: `Focus on: ${primaryWeak.title}`,
        description: primaryWeak.description,
        actionLabel: primaryWeak.actionLabel,
        actionHref: primaryWeak.actionHref,
        badge: `${primaryWeak.severity} Priority`,
      };
    } else {
      recommendedNextStep = {
        title: "Practice Speaking Conversation",
        description: "Keep your pronunciation sharp with real-time AI Voice feedback and topic prompts.",
        actionLabel: "Start Voice Practice",
        actionHref: "/voice-conversation",
        badge: "Speaking Goal",
      };
    }

    return {
      user: {
        id: user.id,
        name: userName,
        email: user.email,
        level: userLevel,
        initials: userInitials,
        isAdmin,
        nativeLanguage,
        targetLanguage,
        dailyGoalMinutes,
      },
      overall: {
        overallPercentage,
        lessonsPercentage: lessonProgressPercentage,
        vocabPercentage: vocabProgressPercentage,
        grammarPercentage: grammarScore !== null ? grammarScore : 0,
        speakingPercentage: averageSpeakingScore !== null ? averageSpeakingScore : 0,
        hasEnoughData,
      },
      lessons: {
        totalCount: totalLessonsCount,
        completedCount: completedLessonsCount,
        remainingCount: remainingLessonsCount,
        percentage: lessonProgressPercentage,
        currentLesson,
        nextRecommendedLesson,
        recentCompletedList,
      },
      vocabulary: {
        totalCurriculumCount: totalCurriculumVocabCount,
        learnedCount: learnedVocabCount,
        masteredCount: masteredVocabCount,
        inReviewCount: inReviewVocabCount,
        dueCount: dueVocabCount,
        percentage: vocabProgressPercentage,
      },
      speaking: {
        totalAttempts: speakingAttemptsCount,
        averageScore: averageSpeakingScore,
        bestScore: bestSpeakingScore,
        recentScore: recentSpeakingScore,
        chronologicalAttempts,
      },
      grammar: {
        grammarScore,
        strengths: grammarStrengths,
        weaknesses: grammarWeaknessList,
      },
      streak: {
        currentStreakDays,
        bestStreakDays,
        activeDatesCount: allActivityDates.size,
      },
      dailyGoal: {
        dailyGoalMinutes,
        todayStudyMinutes: todayMinutes,
        goalPercentage: dailyGoalPercentage,
        goalCompleted: dailyGoalCompleted,
      },
      xp: {
        totalXP,
        breakdown: {
          lessonsXP,
          vocabXP,
          speakingXP,
          baseXP,
        },
      },
      milestones,
      recentActivities,
      recommendedNextStep,
    };
  } catch (error) {
    console.error("Failed to compile comprehensive progress data:", error);
    return null;
  }
}
