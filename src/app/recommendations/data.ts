import { db } from "../../prisma/db";
import { callGeminiFast } from "../../lib/gemini";

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  reason: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  type: "vocabulary" | "grammar" | "speaking" | "lesson";
  targetRoute: string;
  actionLabel: string;
  estimatedMinutes: number;
  score: number;
  icon: string;
  badge: string;
  completed?: boolean;
}

export interface StudyPlanTask {
  id: string;
  stepNumber: number;
  title: string;
  category: "vocabulary" | "grammar" | "speaking" | "lesson";
  description: string;
  reason: string;
  estimatedMinutes: number;
  targetRoute: string;
  actionLabel: string;
  completedToday: boolean;
  priority: "HIGH" | "MEDIUM" | "LOW";
  icon: string;
}

export interface CoachingAdvice {
  headline: string;
  message: string;
  focusArea: string;
}

export interface PersonalizedRecommendationsData {
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
  hasLearningHistory: boolean;
  topRecommendation: RecommendationItem | null;
  recommendations: RecommendationItem[];
  studyPlan: {
    tasks: StudyPlanTask[];
    totalEstimatedMinutes: number;
    completedMinutesToday: number;
    remainingMinutesToday: number;
    dailyGoalMinutes: number;
    goalProgressPercentage: number;
    completedTasksCount: number;
    totalTasksCount: number;
  };
  coachingAdvice: CoachingAdvice;
}

export async function getPersonalizedRecommendations(
  userEmail: string
): Promise<PersonalizedRecommendationsData | null> {
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

    const completedLessonIds = new Set(lessonProgresses.map((p) => p.lessonId));
    const uncompletedLessons = allLessons.filter((l) => !completedLessonIds.has(l.id));
    const currentLesson = uncompletedLessons[0] || null;

    // 2. Fetch Vocabulary SRS
    const totalVocabList = await db.orm.public.Vocabulary.all();
    const vocabProgresses = await db.orm.public.UserVocabularyProgress.where({ userId: user.id })
      .include("vocab")
      .all();

    const nowIso = new Date().toISOString();
    let dueVocabCount = 0;
    let inReviewVocabCount = 0;

    vocabProgresses.forEach((vp: any) => {
      const isDue = !vp.nextReviewAt || vp.nextReviewAt <= nowIso;
      if (isDue) dueVocabCount++;
      if ((vp.masteryLevel || 1) < 5) inReviewVocabCount++;
    });

    const learnedVocabCount = vocabProgresses.length;
    const unlearnedVocabCount = Math.max(0, totalVocabList.length - learnedVocabCount);

    // 3. Fetch Practice Attempts
    const practiceAttempts = await db.orm.public.PracticeAttempt.where({ userId: user.id })
      .orderBy((m) => m.createdAt.desc())
      .all();

    const speakingAttemptsCount = practiceAttempts.length;
    const scores = practiceAttempts.map((a) => a.score);
    const averageSpeakingScore =
      speakingAttemptsCount > 0
        ? Math.round(scores.reduce((acc, cur) => acc + cur, 0) / speakingAttemptsCount)
        : null;
    const recentAttempt = practiceAttempts[0] || null;
    const recentSpeakingScore = recentAttempt ? recentAttempt.score : null;

    // 4. Grammar Error Analysis (Real data only)
    let tenseErrors = 0;
    let articleErrors = 0;
    let subjectVerbErrors = 0;
    let prepositionErrors = 0;
    let lowFluencyCount = 0;

    practiceAttempts.forEach((att) => {
      const fb = (att.grammarFeedback || "").toLowerCase() + " " + (att.phrase || "").toLowerCase();
      if (fb.includes("tense") || fb.includes("past") || fb.includes("perfect") || fb.includes("yesterday")) {
        tenseErrors++;
      }
      if (fb.includes("article") || fb.includes(" a ") || fb.includes(" an ") || fb.includes("the ")) {
        articleErrors++;
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
      }
      if (fb.includes("preposition") || fb.includes(" in ") || fb.includes(" on ") || fb.includes(" at ")) {
        prepositionErrors++;
      }
      if (att.score < 75 || (att.fluencyFeedback || "").toLowerCase().includes("omission")) {
        lowFluencyCount++;
      }
    });

    // Determine if user has real learning history
    const hasLearningHistory =
      lessonProgresses.length > 0 || vocabProgresses.length > 0 || practiceAttempts.length > 0;

    // 5. Build Deterministic Recommendations
    const recommendations: RecommendationItem[] = [];

    // Recommendation A: Overdue Vocabulary Review
    if (dueVocabCount > 0) {
      const urgency = Math.min(50, 35 + dueVocabCount * 3);
      const weakness = 15;
      const recency = 15;
      const benefit = 15;
      const score = urgency + weakness + recency + benefit;

      recommendations.push({
        id: "rec-vocab-due",
        title: `Review ${dueVocabCount} Due Vocabulary Word${dueVocabCount > 1 ? "s" : ""}`,
        description: "Scheduled for Spaced Repetition (SRS) review today to cement long-term memory.",
        reason: `You have ${dueVocabCount} word${dueVocabCount > 1 ? "s" : ""} reaching retention interval thresholds.`,
        priority: "HIGH",
        type: "vocabulary",
        targetRoute: "/lessons",
        actionLabel: "Review Due Words",
        estimatedMinutes: Math.min(20, Math.max(5, Math.ceil(dueVocabCount * 1.5))),
        score,
        icon: "🧠",
        badge: "SRS Urgent",
      });
    }

    // Recommendation B: Subject-Verb Agreement Weakness
    if (subjectVerbErrors >= 2) {
      const score = 30 + Math.min(20, subjectVerbErrors * 4) + 15 + 15;
      recommendations.push({
        id: "rec-grammar-subject-verb",
        title: "Master Subject-Verb Agreement",
        description: "Focus on aligning singular third-person subjects ('he/she/it') with appropriate verb forms.",
        reason: `Detected ${subjectVerbErrors} subject-verb agreement errors across your recent speaking practice.`,
        priority: "HIGH",
        type: "grammar",
        targetRoute: "/grammar-correction",
        actionLabel: "Practice Subject-Verb",
        estimatedMinutes: 10,
        score,
        icon: "✍️",
        badge: "Frequent Slip",
      });
    }

    // Recommendation C: Verb Tenses Weakness
    if (tenseErrors >= 2) {
      const score = 28 + Math.min(20, tenseErrors * 4) + 15 + 15;
      recommendations.push({
        id: "rec-grammar-tenses",
        title: "Past & Perfect Tense Accuracy",
        description: "Practice connecting past participles and irregular past action timeframes.",
        reason: `Detected ${tenseErrors} verb tense inconsistencies in recent recorded speech.`,
        priority: "HIGH",
        type: "grammar",
        targetRoute: "/grammar-correction",
        actionLabel: "Practice Verb Tenses",
        estimatedMinutes: 10,
        score,
        icon: "⏳",
        badge: "Tense Focus",
      });
    }

    // Recommendation D: Articles Weakness
    if (articleErrors >= 2) {
      const score = 25 + Math.min(15, articleErrors * 4) + 10 + 15;
      recommendations.push({
        id: "rec-grammar-articles",
        title: "Definite & Indefinite Articles (a / an / the)",
        description: "Refine noun modifiers and eliminate accidental omission of articles before countable nouns.",
        reason: `Detected ${articleErrors} article usage slips in your recent practice transcripts.`,
        priority: "MEDIUM",
        type: "grammar",
        targetRoute: "/grammar-correction",
        actionLabel: "Review Articles Rule",
        estimatedMinutes: 10,
        score,
        icon: "📝",
        badge: "Grammar Slip",
      });
    }

    // Recommendation E: Prepositions Weakness
    if (prepositionErrors >= 2) {
      const score = 24 + Math.min(15, prepositionErrors * 4) + 10 + 15;
      recommendations.push({
        id: "rec-grammar-prepositions",
        title: "Preposition Selection & Idiomatic Usage",
        description: "Sharpen preposition selection in spatial and temporal phrases (in, on, at, for, to).",
        reason: `Detected ${prepositionErrors} preposition selection slips across your recordings.`,
        priority: "MEDIUM",
        type: "grammar",
        targetRoute: "/grammar-correction",
        actionLabel: "Practice Prepositions",
        estimatedMinutes: 10,
        score,
        icon: "📍",
        badge: "Prepositions",
      });
    }

    // Recommendation F: Low Speaking Performance / Enunciation Drill
    if (recentSpeakingScore !== null && recentSpeakingScore < 75) {
      const score = 30 + 20 + 15 + 15;
      recommendations.push({
        id: "rec-speaking-fluency",
        title: "Pacing & Spoken Fluency Drill",
        description: "Practice reading conversational phrases aloud to boost enunciation score and rhythmic cadence.",
        reason: `Recent speaking attempt scored ${recentSpeakingScore}%. Targeted practice will raise accuracy.`,
        priority: "HIGH",
        type: "speaking",
        targetRoute: "/voice-practice",
        actionLabel: "Practice Speaking",
        estimatedMinutes: 10,
        score,
        icon: "🎙️",
        badge: "Needs Practice",
      });
    } else if (lowFluencyCount >= 2) {
      const score = 26 + 18 + 15 + 15;
      recommendations.push({
        id: "rec-speaking-pace",
        title: "Speech Enunciation & Cadence",
        description: "Eliminate hesitations and word omissions with guided phrase readings.",
        reason: `Multiple recent practice sessions noted pauses or omissions during recording.`,
        priority: "MEDIUM",
        type: "speaking",
        targetRoute: "/voice-practice",
        actionLabel: "Enunciation Drill",
        estimatedMinutes: 10,
        score,
        icon: "🗣️",
        badge: "Pacing Focus",
      });
    }

    // Recommendation G: Continue Current Lesson
    if (currentLesson) {
      const score = 25 + 10 + 10 + 20;
      recommendations.push({
        id: "rec-lesson-current",
        title: `Continue: ${currentLesson.title}`,
        description: `Complete the 6-stage interactive lesson in ${currentLesson.category} (${currentLesson.difficulty}).`,
        reason: `Curriculum milestone: Unlocks sequential lessons and earns +50 XP upon completion.`,
        priority: recommendations.length === 0 ? "HIGH" : "MEDIUM",
        type: "lesson",
        targetRoute: "/lessons",
        actionLabel: "Continue Lesson",
        estimatedMinutes: 15,
        score,
        icon: "📚",
        badge: "Curriculum Target",
      });
    }

    // Recommendation H: New Vocabulary Expansion
    if (unlearnedVocabCount > 0 && dueVocabCount === 0) {
      const score = 15 + 5 + 10 + 15;
      recommendations.push({
        id: "rec-vocab-expand",
        title: "Expand Vocabulary with New Terms",
        description: `Learn new foundational and business idioms from your ${userLevel} curriculum.`,
        reason: `You have completed all pending reviews. Expand your vocabulary bank today.`,
        priority: "MEDIUM",
        type: "vocabulary",
        targetRoute: "/lessons",
        actionLabel: "Learn New Words",
        estimatedMinutes: 10,
        score,
        icon: "📖",
        badge: "Word Bank",
      });
    }

    // Recommendation I: Conversational Speaking Practice
    if (speakingAttemptsCount > 0 && recommendations.filter((r) => r.type === "speaking").length === 0) {
      const score = 15 + 5 + 10 + 15;
      recommendations.push({
        id: "rec-speaking-conversation",
        title: "Two-Way AI Voice Conversation",
        description: "Engage in an unscripted voice conversation on daily topics with instantaneous audio correction.",
        reason: `Keep conversational confidence and pronunciation sharp with real-time audio interaction.`,
        priority: "LOW",
        type: "speaking",
        targetRoute: "/voice-conversation",
        actionLabel: "Start Voice Tutor",
        estimatedMinutes: 10,
        score,
        icon: "⚡",
        badge: "Fluency Habit",
      });
    }

    // Sort descending by score
    recommendations.sort((a, b) => b.score - a.score);
    const topRecommendation = recommendations[0] || null;

    // 6. Calculate Today's Real Study Time
    const todayStr = new Date().toISOString().split("T")[0];
    let completedMinutesToday = 0;
    let completedLessonToday = false;
    let completedSpeakingToday = false;
    let completedVocabToday = false;

    lessonProgresses.forEach((lp: any) => {
      if (new Date(lp.completedAt).toISOString().split("T")[0] === todayStr) {
        completedMinutesToday += 5;
        completedLessonToday = true;
      }
    });
    practiceAttempts.forEach((pa) => {
      if (new Date(pa.createdAt).toISOString().split("T")[0] === todayStr) {
        completedMinutesToday += 2;
        completedSpeakingToday = true;
      }
    });
    vocabProgresses.forEach((vp: any) => {
      const d = vp.lastReviewedAt || vp.learnedAt;
      if (d && new Date(d).toISOString().split("T")[0] === todayStr) {
        completedMinutesToday += 1;
        completedVocabToday = true;
      }
    });

    // 7. Generate Today's Personalized Study Plan Tasks
    const studyPlanTasks: StudyPlanTask[] = [];

    // Task 1: Vocabulary
    if (dueVocabCount > 0) {
      studyPlanTasks.push({
        id: "plan-task-vocab",
        stepNumber: 1,
        title: `Spaced Repetition Review (${dueVocabCount} words)`,
        category: "vocabulary",
        description: "Review flashcards scheduled for memory reinforcement today.",
        reason: `${dueVocabCount} word${dueVocabCount > 1 ? "s" : ""} due for review based on your retention schedule.`,
        estimatedMinutes: 10,
        targetRoute: "/lessons",
        actionLabel: "Review Vocab",
        completedToday: completedVocabToday,
        priority: "HIGH",
        icon: "🧠",
      });
    } else {
      studyPlanTasks.push({
        id: "plan-task-vocab",
        stepNumber: 1,
        title: "Vocabulary Expansion",
        category: "vocabulary",
        description: "Learn new keywords and idioms from the curriculum.",
        reason: "Expand active vocabulary and add terms to your Spaced Repetition bank.",
        estimatedMinutes: 10,
        targetRoute: "/lessons",
        actionLabel: "Learn Vocab",
        completedToday: completedVocabToday,
        priority: "MEDIUM",
        icon: "📖",
      });
    }

    // Task 2: Grammar Practice
    const primaryGrammarWeakness = recommendations.find((r) => r.type === "grammar");
    if (primaryGrammarWeakness) {
      studyPlanTasks.push({
        id: "plan-task-grammar",
        stepNumber: 2,
        title: primaryGrammarWeakness.title,
        category: "grammar",
        description: primaryGrammarWeakness.description,
        reason: primaryGrammarWeakness.reason,
        estimatedMinutes: 10,
        targetRoute: primaryGrammarWeakness.targetRoute,
        actionLabel: "Practice Grammar",
        completedToday: false,
        priority: "HIGH",
        icon: "✍️",
      });
    } else {
      studyPlanTasks.push({
        id: "plan-task-grammar",
        stepNumber: 2,
        title: "Grammar & Sentence Construction",
        category: "grammar",
        description: "Submit sentences to the multilingual AI writing coach for instant structural analysis.",
        reason: "Reinforce correct sentence patterns and natural phrasing.",
        estimatedMinutes: 10,
        targetRoute: "/grammar-correction",
        actionLabel: "Check Grammar",
        completedToday: false,
        priority: "MEDIUM",
        icon: "✍️",
      });
    }

    // Task 3: Speaking Practice
    const speakingRec = recommendations.find((r) => r.type === "speaking");
    studyPlanTasks.push({
      id: "plan-task-speaking",
      stepNumber: 3,
      title: speakingRec ? speakingRec.title : "Voice Pronunciation & Enunciation",
      category: "speaking",
      description: speakingRec
        ? speakingRec.description
        : "Record phrases aloud and receive instant enunciation scores.",
      reason: speakingRec ? speakingRec.reason : "Build spoken fluency, pacing, and confidence.",
      estimatedMinutes: 10,
      targetRoute: speakingRec ? speakingRec.targetRoute : "/voice-practice",
      actionLabel: "Practice Speaking",
      completedToday: completedSpeakingToday,
      priority: speakingRec?.priority === "HIGH" ? "HIGH" : "MEDIUM",
      icon: "🎙️",
    });

    // Task 4: Curriculum Lesson
    if (currentLesson) {
      studyPlanTasks.push({
        id: "plan-task-lesson",
        stepNumber: 4,
        title: `Curriculum Lesson: ${currentLesson.title}`,
        category: "lesson",
        description: `Complete the 6-stage interactive lesson in ${currentLesson.category}.`,
        reason: `Advance through the structured course roadmap and earn +50 XP.`,
        estimatedMinutes: 15,
        targetRoute: "/lessons",
        actionLabel: "Start Lesson",
        completedToday: completedLessonToday,
        priority: "MEDIUM",
        icon: "📚",
      });
    } else {
      studyPlanTasks.push({
        id: "plan-task-lesson",
        stepNumber: 4,
        title: "Curriculum Review & Mastery",
        category: "lesson",
        description: "Review completed lessons or explore advanced conversation topics.",
        reason: "Consolidate your mastery across completed curriculum units.",
        estimatedMinutes: 15,
        targetRoute: "/lessons",
        actionLabel: "Review Lessons",
        completedToday: completedLessonToday,
        priority: "LOW",
        icon: "🎓",
      });
    }

    const totalEstimatedMinutes = studyPlanTasks.reduce((acc, cur) => acc + cur.estimatedMinutes, 0);
    const completedTasksCount = studyPlanTasks.filter((t) => t.completedToday).length;
    const goalProgressPercentage = Math.min(
      100,
      Math.round((completedMinutesToday / dailyGoalMinutes) * 100)
    );
    const remainingMinutesToday = Math.max(0, dailyGoalMinutes - completedMinutesToday);

    // 8. Optional Gemini Enhancement (Strictly Server-Side)
    let coachingAdvice: CoachingAdvice = {
      headline: topRecommendation
        ? `Today's Priority: ${topRecommendation.title}`
        : "Welcome to Your Personalized Learning Journey!",
      message: topRecommendation
        ? topRecommendation.reason
        : "Complete your first lesson to receive personalized AI recommendations tailored to your performance.",
      focusArea: topRecommendation ? topRecommendation.type.toUpperCase() : "FOUNDATION",
    };

    if (hasLearningHistory && topRecommendation) {
      try {
        const prompt = `You are a warm, encouraging language tutor for a learner whose native language is "${nativeLanguage}" learning "${targetLanguage}".
Learner Level: ${userLevel}
Factual Learning Data:
- Top Priority Recommendation: "${topRecommendation.title}" (${topRecommendation.type})
- Factual Reason: "${topRecommendation.reason}"
- Today's Completed Study: ${completedMinutesToday} / ${dailyGoalMinutes} minutes

Write a 2-sentence encouraging, practical coaching tip for this student's study plan today.
IMPORTANT:
- Do NOT invent or fabricate any scores or numbers.
- Keep it concise (under 40 words), friendly, and directly motivating for their specific task.`;

        const geminiRes = await callGeminiFast({ contents: prompt, timeoutMs: 3500 });
        if (geminiRes && geminiRes.trim()) {
          coachingAdvice = {
            headline: `Coach Advice: ${topRecommendation.title}`,
            message: geminiRes.trim().replace(/^["']|["']$/g, ""),
            focusArea: topRecommendation.type.toUpperCase(),
          };
        }
      } catch (e) {
        // Fallback gracefully without throwing
      }
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
      hasLearningHistory,
      topRecommendation,
      recommendations,
      studyPlan: {
        tasks: studyPlanTasks,
        totalEstimatedMinutes,
        completedMinutesToday,
        remainingMinutesToday,
        dailyGoalMinutes,
        goalProgressPercentage,
        completedTasksCount,
        totalTasksCount: studyPlanTasks.length,
      },
      coachingAdvice,
    };
  } catch (error) {
    console.error("Failed to generate personalized recommendations:", error);
    return null;
  }
}
