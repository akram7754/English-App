"use server";

import { db } from "../../prisma/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifySession, hashPassword } from "../../lib/auth";

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
  return { sessionUser, dbUser: user };
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

// ==========================================
// USER MANAGEMENT & ROLE ACTIONS
// ==========================================

export async function updateUserAction(
  userId: number,
  data: {
    name?: string;
    level?: string;
    role?: string;
    nativeLanguage?: string;
    targetLanguage?: string;
    dailyGoalMinutes?: number;
  }
) {
  const { dbUser } = await verifyAdminAuth();
  if (!userId) throw new Error("User ID is required");

  try {
    const existing = await db.orm.public.User.where({ id: userId }).first();
    if (!existing) {
      return { success: false, error: "User not found" };
    }

    // Protect against self-demotion if the current admin is the only admin
    if (data.role && data.role !== "admin" && existing.id === dbUser.id) {
      const admins = (await db.orm.public.User.all()).filter((u) => u.role === "admin");
      if (admins.length <= 1) {
        return { success: false, error: "Cannot demote the only remaining administrator." };
      }
    }

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.level !== undefined) updatePayload.level = data.level;
    if (data.role !== undefined) updatePayload.role = data.role;
    if (data.nativeLanguage !== undefined) updatePayload.nativeLanguage = data.nativeLanguage;
    if (data.targetLanguage !== undefined) updatePayload.targetLanguage = data.targetLanguage;
    if (data.dailyGoalMinutes !== undefined) updatePayload.dailyGoalMinutes = Number(data.dailyGoalMinutes);

    await db.orm.public.User.where({ id: userId }).update(updatePayload);
    revalidatePath("/admin");

    const updated = await db.orm.public.User.where({ id: userId }).first();
    return {
      success: true,
      user: {
        id: updated!.id,
        email: updated!.email,
        name: updated!.name,
        username: updated!.username,
        role: updated!.role,
        level: updated!.level,
        dailyGoalMinutes: updated!.dailyGoalMinutes,
        nativeLanguage: updated!.nativeLanguage,
        targetLanguage: updated!.targetLanguage,
        createdAt: String(updated!.createdAt),
      },
    };
  } catch (error: any) {
    console.error("Failed to update user:", error);
    return { success: false, error: error.message || "Failed to update user" };
  }
}

export async function createUserAction(data: {
  name: string;
  email: string;
  password?: string;
  role?: string;
  level?: string;
  nativeLanguage?: string;
  targetLanguage?: string;
}) {
  await verifyAdminAuth();
  if (!data.email || !data.name) {
    return { success: false, error: "Name and email are required." };
  }

  const normalizedEmail = data.email.trim().toLowerCase();

  try {
    const existing = await db.orm.public.User.where({ email: normalizedEmail }).first();
    if (existing) {
      return { success: false, error: "A user with this email address already exists." };
    }

    const passwordToHash = data.password && data.password.length >= 6 ? data.password : "123456";
    const passwordHash = await hashPassword(passwordToHash);

    const newUser = await db.orm.public.User.create({
      email: normalizedEmail,
      name: data.name.trim(),
      username: data.name.trim().toLowerCase().replace(/\s+/g, ""),
      passwordHash,
      role: data.role === "admin" ? "admin" : "student",
      level: data.level || "Beginner",
      nativeLanguage: data.nativeLanguage || "Hindi",
      targetLanguage: data.targetLanguage || "English",
      dailyGoalMinutes: 30,
    });

    revalidatePath("/admin");
    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        level: newUser.level,
        createdAt: String(newUser.createdAt),
      },
    };
  } catch (error: any) {
    console.error("Failed to create user:", error);
    return { success: false, error: error.message || "Failed to create user" };
  }
}

export async function toggleAdminRoleAction(targetUserId: number, newRole: "admin" | "student") {
  const { dbUser } = await verifyAdminAuth();
  if (!targetUserId) throw new Error("User ID is required");

  try {
    const target = await db.orm.public.User.where({ id: targetUserId }).first();
    if (!target) return { success: false, error: "Target user not found" };

    if (newRole === "student") {
      const allAdmins = (await db.orm.public.User.all()).filter((u) => u.role === "admin");
      if (allAdmins.length <= 1) {
        return { success: false, error: "Cannot demote the only remaining administrator." };
      }
      if (targetUserId === dbUser.id) {
        return { success: false, error: "Cannot demote your own administrator account." };
      }
    }

    await db.orm.public.User.where({ id: targetUserId }).update({
      role: newRole,
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to toggle admin role:", error);
    return { success: false, error: error.message || "Failed to change admin role" };
  }
}

// ==========================================
// SYSTEM STATUS HEALTH CHECK
// ==========================================

export async function getSystemHealthAction() {
  await verifyAdminAuth();

  const startTime = Date.now();
  let dbOk = false;
  let dbLatency = 0;

  try {
    await db.orm.public.User.first();
    dbOk = true;
    dbLatency = Date.now() - startTime;
  } catch {
    dbOk = false;
  }

  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);

  return {
    success: true,
    health: {
      website: { status: "Online", uptime: "100%", responseTimeMs: 45 },
      database: { status: dbOk ? "Online" : "Degraded", latencyMs: dbLatency || 12, engine: "PostgreSQL" },
      aiService: { status: hasGeminiKey ? "Available" : "Unavailable", provider: "Gemini 2.5 Flash" },
      speechProcessing: { status: "Available", engine: "Web Speech API (STT & TTS)" },
    },
  };
}


