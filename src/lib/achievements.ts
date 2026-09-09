import { db } from "../prisma/db";
import { getPersonalizedLearningProfile, PersonalizedLearningProfile } from "./learning-engine";
import { createUserNotification } from "./notification-engine";

export type AchievementCategory = "lessons" | "vocab" | "speaking" | "streaks" | "xp";

export interface AchievementDefinition {
  key: string;
  category: AchievementCategory;
  name: string;
  description: string;
  icon: string;
  targetValue: number;
  unit: string;
}

export interface UserAchievementItem extends AchievementDefinition {
  unlocked: boolean;
  unlockedAt: string | null;
  currentValue: number;
  progressPercent: number;
  progressText: string;
}

export interface UserGamificationProfile {
  totalXP: number;
  xpBreakdown: {
    lessonsXP: number;
    vocabXP: number;
    speakingXP: number;
    baseXP: number;
  };
  totalAchievements: number;
  unlockedCount: number;
  completionPercent: number;
  userLevel: string;
  achievements: UserAchievementItem[];
  recentAchievement: UserAchievementItem | null;
}

/**
 * Approved canonical dynamic XP formula:
 * Total XP = (completedLessons * 50) + (learnedVocab * 20) + (speakingAttempts * 30) + 240
 */
export function calculateUserXP(
  completedLessons: number,
  learnedVocab: number,
  speakingAttempts: number
) {
  const lessonsXP = completedLessons * 50;
  const vocabXP = learnedVocab * 20;
  const speakingXP = speakingAttempts * 30;
  const baseXP = 240;
  const totalXP = lessonsXP + vocabXP + speakingXP + baseXP;

  return {
    totalXP,
    breakdown: {
      lessonsXP,
      vocabXP,
      speakingXP,
      baseXP,
    },
  };
}

/**
 * 16 Deterministic Achievements mapped to real PostgreSQL learning metrics
 */
export const ACHIEVEMENTS_CATALOG: AchievementDefinition[] = [
  // LESSONS
  {
    key: "first_lesson",
    category: "lessons",
    name: "First Step",
    description: "Complete your first curriculum lesson",
    icon: "📚",
    targetValue: 1,
    unit: "Lesson",
  },
  {
    key: "lesson_explorer",
    category: "lessons",
    name: "Lesson Explorer",
    description: "Complete 5 curriculum lessons",
    icon: "🧭",
    targetValue: 5,
    unit: "Lessons",
  },
  {
    key: "learning_master",
    category: "lessons",
    name: "Learning Master",
    description: "Complete 10 curriculum lessons",
    icon: "🎓",
    targetValue: 10,
    unit: "Lessons",
  },

  // VOCABULARY
  {
    key: "first_vocab",
    category: "vocab",
    name: "First Word",
    description: "Learn your first vocabulary word in Spaced Repetition",
    icon: "📖",
    targetValue: 1,
    unit: "Word",
  },
  {
    key: "vocabulary_builder",
    category: "vocab",
    name: "Vocabulary Builder",
    description: "Learn 10 vocabulary words in Spaced Repetition",
    icon: "🏛️",
    targetValue: 10,
    unit: "Words",
  },
  {
    key: "word_master",
    category: "vocab",
    name: "Word Master",
    description: "Reach Level 5 Mastery on any vocabulary item",
    icon: "🏆",
    targetValue: 1,
    unit: "Mastered",
  },

  // SPEAKING
  {
    key: "first_speaking",
    category: "speaking",
    name: "First Voice Practice",
    description: "Complete 1 speaking pronunciation attempt",
    icon: "🎤",
    targetValue: 1,
    unit: "Attempt",
  },
  {
    key: "speaking_starter",
    category: "speaking",
    name: "Speaking Starter",
    description: "Complete 10 speaking pronunciation attempts",
    icon: "🎙️",
    targetValue: 10,
    unit: "Attempts",
  },
  {
    key: "speaking_80",
    category: "speaking",
    name: "Speaking 80",
    description: "Reach a speaking pronunciation accuracy score of 80%+",
    icon: "🎯",
    targetValue: 80,
    unit: "% Score",
  },
  {
    key: "speaking_90",
    category: "speaking",
    name: "Fluency Ace",
    description: "Reach a speaking pronunciation accuracy score of 90%+",
    icon: "⚡",
    targetValue: 90,
    unit: "% Score",
  },
  {
    key: "speaking_excellence",
    category: "speaking",
    name: "Speaking Excellence",
    description: "Reach an outstanding speaking accuracy score of 95%+",
    icon: "👑",
    targetValue: 95,
    unit: "% Score",
  },

  // STREAKS
  {
    key: "streak_3",
    category: "streaks",
    name: "3-Day Streak",
    description: "Maintain a 3-day consecutive study streak",
    icon: "🔥",
    targetValue: 3,
    unit: "Days",
  },
  {
    key: "streak_7",
    category: "streaks",
    name: "7-Day Streak",
    description: "Maintain a 7-day consecutive study streak",
    icon: "⚡",
    targetValue: 7,
    unit: "Days",
  },
  {
    key: "streak_30",
    category: "streaks",
    name: "30-Day Streak",
    description: "Maintain a 30-day consecutive study streak",
    icon: "🌟",
    targetValue: 30,
    unit: "Days",
  },

  // XP
  {
    key: "xp_500",
    category: "xp",
    name: "Rising Star",
    description: "Accumulate 500+ XP in verified learning activities",
    icon: "⭐",
    targetValue: 500,
    unit: "XP",
  },
  {
    key: "xp_1000",
    category: "xp",
    name: "Knowledge Champion",
    description: "Accumulate 1,000+ XP in verified learning activities",
    icon: "💎",
    targetValue: 1000,
    unit: "XP",
  },
];

/**
 * Extracts the user's real current metric corresponding to an achievement key.
 */
function extractMetricValue(
  key: string,
  profile: PersonalizedLearningProfile,
  masteredVocabCount: number,
  bestSpeakingScore: number,
  totalXP: number
): number {
  switch (key) {
    case "first_lesson":
    case "lesson_explorer":
    case "learning_master":
      return profile.completedLessonsCount;

    case "first_vocab":
    case "vocabulary_builder":
      return profile.learnedVocabCount;

    case "word_master":
      return masteredVocabCount;

    case "first_speaking":
    case "speaking_starter":
      return profile.speakingAttemptsCount;

    case "speaking_80":
    case "speaking_90":
    case "speaking_excellence":
      return bestSpeakingScore;

    case "streak_3":
    case "streak_7":
    case "streak_30":
      return profile.streakDays;

    case "xp_500":
    case "xp_1000":
      return totalXP;

    default:
      return 0;
  }
}

/**
 * Evaluates real user learning milestones, unlocks achievements in PostgreSQL,
 * and triggers Phase 19 notifications for newly unlocked achievements.
 */
export async function syncUserAchievements(
  userId: number,
  userEmail: string
): Promise<UserGamificationProfile | null> {
  try {
    const profile = await getPersonalizedLearningProfile(userEmail);
    if (!profile) return null;

    // 1. Calculate real XP using approved formula
    const xpData = calculateUserXP(
      profile.completedLessonsCount,
      profile.learnedVocabCount,
      profile.speakingAttemptsCount
    );

    // 2. Fetch vocabulary mastery level >= 5 count from PostgreSQL
    const masteredVocabs = await (db.orm.public as any).UserVocabularyProgress.where({
      userId,
    }).all();
    const masteredVocabCount = masteredVocabs.filter((v: any) => (v.masteryLevel || 0) >= 5).length;

    // 3. Fetch highest speaking score from PracticeAttempt
    const attempts = await (db.orm.public as any).PracticeAttempt.where({
      userId,
    }).all();
    const bestSpeakingScore = attempts.length > 0
      ? Math.max(...attempts.map((a: any) => a.score || 0))
      : 0;

    // 4. Load already unlocked achievements from PostgreSQL
    const existingUnlocked = await (db.orm.public as any).UserAchievement.where({
      userId,
    }).all();

    const unlockedMap = new Map<string, string>();
    for (const record of existingUnlocked) {
      unlockedMap.set(record.achievementKey, String(record.unlockedAt));
    }

    const evaluatedAchievements: UserAchievementItem[] = [];
    const newUnlocks: AchievementDefinition[] = [];

    // 5. Evaluate each achievement against real data
    for (const def of ACHIEVEMENTS_CATALOG) {
      const currentValue = extractMetricValue(
        def.key,
        profile,
        masteredVocabCount,
        bestSpeakingScore,
        xpData.totalXP
      );

      const isEligible = currentValue >= def.targetValue;
      let unlockedAt = unlockedMap.get(def.key) || null;

      // Unlock newly eligible achievement in PostgreSQL
      if (isEligible && !unlockedAt) {
        try {
          const created = await (db.orm.public as any).UserAchievement.create({
            userId,
            achievementKey: def.key,
            unlockedAt: new Date().toISOString(),
          });
          unlockedAt = String(created.unlockedAt);
          unlockedMap.set(def.key, unlockedAt);
          newUnlocks.push(def);
        } catch {
          // In case of race condition or duplicate key, ignore
        }
      }

      const unlocked = Boolean(unlockedAt);
      const progressPercent = Math.min(
        100,
        Math.round((Math.min(currentValue, def.targetValue) / def.targetValue) * 100)
      );

      evaluatedAchievements.push({
        ...def,
        unlocked,
        unlockedAt,
        currentValue,
        progressPercent: unlocked ? 100 : progressPercent,
        progressText: unlocked
          ? `${def.targetValue} / ${def.targetValue} ${def.unit}`
          : `${Math.min(currentValue, def.targetValue)} / ${def.targetValue} ${def.unit}`,
      });
    }

    // 6. Trigger notifications for newly unlocked achievements via Phase 19 notification engine
    for (const item of newUnlocks) {
      try {
        await createUserNotification({
          userId,
          type: "achievement_unlocked",
          title: "🏆 Achievement Unlocked!",
          message: `You earned the "${item.name}" badge: ${item.description}`,
          actionUrl: "/achievements",
        });
      } catch (notifErr: any) {
        console.error("Achievement notification notice:", notifErr?.message);
      }
    }

    // 7. Calculate overall summary
    const unlockedCount = evaluatedAchievements.filter((a) => a.unlocked).length;
    const completionPercent = Math.round((unlockedCount / ACHIEVEMENTS_CATALOG.length) * 100);

    // Find latest unlocked achievement
    const unlockedOnly = evaluatedAchievements
      .filter((a) => a.unlocked && a.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime());

    const recentAchievement = unlockedOnly[0] || null;

    return {
      totalXP: xpData.totalXP,
      xpBreakdown: xpData.breakdown,
      totalAchievements: ACHIEVEMENTS_CATALOG.length,
      unlockedCount,
      completionPercent,
      userLevel: profile.level,
      achievements: evaluatedAchievements,
      recentAchievement,
    };
  } catch (err: any) {
    console.error("[syncUserAchievements] Error:", err.message);
    return null;
  }
}
