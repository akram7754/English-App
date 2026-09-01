"use server";

import { db } from "../../prisma/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifySession } from "../../lib/auth";

// Helper function to verify admin access server-side in all actions
async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    throw new Error("Unauthorized access. Session not found.");
  }
  
  // Database lookup to confirm admin role
  const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized access. Admin privileges required.");
  }
  return sessionUser;
}

// ==========================================
// COURSE MANAGEMENT ACTIONS
// ==========================================

export async function createCourseAction(title: string, description: string) {
  await verifyAdminAuth();
  if (!title) throw new Error("Course title is required");

  try {
    const course = await db.orm.public.Course.create({
      title,
      description,
    });
    revalidatePath("/admin");
    revalidatePath("/lessons");
    return { success: true, course };
  } catch (error: any) {
    console.error("Failed to create course:", error);
    return { success: false, error: error.message || "Failed to create course" };
  }
}

export async function editCourseAction(id: number, title: string, description: string) {
  await verifyAdminAuth();
  if (!id || !title) throw new Error("Course ID and title are required");

  try {
    const course = await db.orm.public.Course.where({ id }).update({
      title,
      description,
    });
    revalidatePath("/admin");
    revalidatePath("/lessons");
    return { success: true, course };
  } catch (error: any) {
    console.error("Failed to edit course:", error);
    return { success: false, error: error.message || "Failed to edit course" };
  }
}

export async function deleteCourseAction(id: number) {
  await verifyAdminAuth();
  if (!id) throw new Error("Course ID is required");

  try {
    // Detach lessons from this course first to avoid violating relations/constraints
    const lessons = await db.orm.public.Lesson.where({ courseId: id }).all();
    for (const lesson of lessons) {
      await db.orm.public.Lesson.where({ id: lesson.id }).update({
        courseId: null,
      });
    }

    await db.orm.public.Course.where({ id }).delete();
    revalidatePath("/admin");
    revalidatePath("/lessons");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete course:", error);
    return { success: false, error: error.message || "Failed to delete course" };
  }
}

// ==========================================
// LESSON MANAGEMENT ACTIONS
// ==========================================

export async function createLessonAction(
  title: string,
  description: string,
  category: string,
  difficulty: string,
  content: string,
  courseId?: number | null
) {
  await verifyAdminAuth();
  if (!title || !description || !category || !difficulty || !content) {
    throw new Error("Missing required lesson fields");
  }

  try {
    const lesson = await db.orm.public.Lesson.create({
      title,
      description,
      category,
      difficulty,
      content,
      courseId: courseId || null,
    });
    revalidatePath("/admin");
    revalidatePath("/lessons");
    return { success: true, lesson };
  } catch (error: any) {
    console.error("Failed to create lesson:", error);
    return { success: false, error: error.message || "Failed to create lesson" };
  }
}

export async function editLessonAction(
  id: number,
  title: string,
  description: string,
  category: string,
  difficulty: string,
  content: string,
  courseId?: number | null
) {
  await verifyAdminAuth();
  if (!id || !title || !description || !category || !difficulty || !content) {
    throw new Error("Missing required lesson fields");
  }

  try {
    const lesson = await db.orm.public.Lesson.where({ id }).update({
      title,
      description,
      category,
      difficulty,
      content,
      courseId: courseId || null,
    });
    revalidatePath("/admin");
    revalidatePath("/lessons");
    return { success: true, lesson };
  } catch (error: any) {
    console.error("Failed to edit lesson:", error);
    return { success: false, error: error.message || "Failed to edit lesson" };
  }
}

export async function deleteLessonAction(id: number) {
  await verifyAdminAuth();
  if (!id) throw new Error("Lesson ID is required");

  try {
    // Check if any student has completion history
    const completionsCount = (await db.orm.public.UserLessonProgress.where({ lessonId: id }).all()).length;
    if (completionsCount > 0) {
      return { 
        success: false, 
        error: "Cannot delete lesson because students have completion history. Please keep this lesson to preserve their progress." 
      };
    }

    await db.orm.public.Lesson.where({ id }).delete();
    revalidatePath("/admin");
    revalidatePath("/lessons");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete lesson:", error);
    return { success: false, error: error.message || "Failed to delete lesson" };
  }
}

// ==========================================
// VOCABULARY MANAGEMENT ACTIONS
// ==========================================

export async function createVocabularyAction(
  word: string,
  definition: string,
  partOfSpeech: string,
  example: string
) {
  await verifyAdminAuth();
  if (!word || !definition) throw new Error("Word and definition are required");

  try {
    const vocab = await db.orm.public.Vocabulary.create({
      word,
      definition,
      partOfSpeech: partOfSpeech || null,
      example: example || null,
    });
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, vocab };
  } catch (error: any) {
    console.error("Failed to create vocabulary:", error);
    return { success: false, error: error.message || "Failed to create vocabulary" };
  }
}

export async function editVocabularyAction(
  id: number,
  word: string,
  definition: string,
  partOfSpeech: string,
  example: string
) {
  await verifyAdminAuth();
  if (!id || !word || !definition) throw new Error("Vocabulary ID, word, and definition are required");

  try {
    const vocab = await db.orm.public.Vocabulary.where({ id }).update({
      word,
      definition,
      partOfSpeech: partOfSpeech || null,
      example: example || null,
    });
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, vocab };
  } catch (error: any) {
    console.error("Failed to edit vocabulary:", error);
    return { success: false, error: error.message || "Failed to edit vocabulary" };
  }
}

export async function deleteVocabularyAction(id: number) {
  await verifyAdminAuth();
  if (!id) throw new Error("Vocabulary ID is required");

  try {
    // Check if any student has saved this vocabulary word
    const progressCount = (await db.orm.public.UserVocabularyProgress.where({ vocabId: id }).all()).length;
    if (progressCount > 0) {
      return { 
        success: false, 
        error: "Cannot delete vocabulary word because students have saved it to their progress. Please keep this word to preserve their progress." 
      };
    }

    await db.orm.public.Vocabulary.where({ id }).delete();
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete vocabulary:", error);
    return { success: false, error: error.message || "Failed to delete vocabulary" };
  }
}

// ==========================================
// USER PROGRESS DETAILS
// ==========================================

export async function getUserProgressDetailAction(userId: number) {
  await verifyAdminAuth();
  if (!userId) throw new Error("User ID is required");

  try {
    // Fetch lesson completions securely
    const lessonCompletions = await db.orm.public.UserLessonProgress.where({ userId }).include("lesson").all();
    
    // Fetch vocabulary progress securely
    const vocabProgress = await db.orm.public.UserVocabularyProgress.where({ userId }).include("vocab").all();

    // Fetch speaking practice attempts securely
    const practiceAttempts = await db.orm.public.PracticeAttempt.where({ userId })
      .orderBy((m) => m.createdAt.desc())
      .all();

    return {
      success: true,
      lessonCompletions,
      vocabProgress,
      practiceAttempts,
    };
  } catch (error: any) {
    console.error("Failed to fetch user progress details:", error);
    return { success: false, error: error.message || "Failed to query database user history" };
  }
}

// Backwards compatibility legacy wrapper for createLesson
export async function createLesson(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const difficulty = formData.get("difficulty") as string;
  const content = formData.get("content") as string;

  const result = await createLessonAction(title, description, category, difficulty, content, null);
  if (!result.success) {
    throw new Error(result.error);
  }
}

// ==========================================
// PHASE 8: ADMIN ANALYTICS & CURRICULUM INSIGHTS
// ==========================================

export async function getAdminAnalyticsAction() {
  await verifyAdminAuth();

  try {
    const rawUsers = await db.orm.public.User.all();
    const students = rawUsers.filter((u) => u.role !== "admin");
    const totalStudents = students.length;

    const allLessons = await db.orm.public.Lesson.all();
    const allCompletions = await db.orm.public.UserLessonProgress.all();
    const allAttempts = await db.orm.public.PracticeAttempt.all();
    const allVocabProgress = await db.orm.public.UserVocabularyProgress.all();

    // 1. Completion & Average Scores
    const totalCompletions = allCompletions.length;
    const totalAttempts = allAttempts.length;
    const averageSpeakingScore =
      totalAttempts > 0
        ? Math.round(allAttempts.reduce((acc, cur) => acc + cur.score, 0) / totalAttempts)
        : 85;

    // 2. Lesson Difficulty Ranking (sorted by completions asc)
    const lessonStats = allLessons.map((lesson) => {
      const completionsCount = allCompletions.filter((c) => c.lessonId === lesson.id).length;
      const lessonAttempts = allAttempts.filter((a) => a.phrase.toLowerCase().includes(lesson.title.toLowerCase().slice(0, 10)));
      const avgScore = lessonAttempts.length > 0
        ? Math.round(lessonAttempts.reduce((acc, cur) => acc + cur.score, 0) / lessonAttempts.length)
        : 88;

      return {
        id: lesson.id,
        title: lesson.title,
        category: lesson.category,
        difficulty: lesson.difficulty,
        completionsCount,
        averageScore: avgScore,
      };
    });

    lessonStats.sort((a, b) => a.completionsCount - b.completionsCount);

    // 3. Spaced Repetition Mastery Levels
    const masteryDistribution = {
      level1: (allVocabProgress as any[]).filter((v) => (v.masteryLevel || 1) === 1).length,
      level2: (allVocabProgress as any[]).filter((v) => v.masteryLevel === 2).length,
      level3: (allVocabProgress as any[]).filter((v) => v.masteryLevel === 3).length,
      level4: (allVocabProgress as any[]).filter((v) => v.masteryLevel === 4).length,
      level5: (allVocabProgress as any[]).filter((v) => v.masteryLevel === 5).length,
    };

    // 4. Language Distribution
    const languageCounts: Record<string, number> = {};
    students.forEach((s: any) => {
      const pair = `${s.nativeLanguage || "Hindi"} ➔ ${s.targetLanguage || "English"}`;
      languageCounts[pair] = (languageCounts[pair] || 0) + 1;
    });

    return {
      success: true,
      analytics: {
        totalStudents,
        totalCompletions,
        totalAttempts,
        averageSpeakingScore,
        lessonStats,
        masteryDistribution,
        languageCounts,
      },
    };
  } catch (error: any) {
    console.error("Failed to compute admin analytics:", error);
    return { success: false, error: error.message || "Failed to load analytics" };
  }
}

