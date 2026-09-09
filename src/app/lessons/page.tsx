import { db } from "../../prisma/db";
import LessonsClient from "./LessonsClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "../../lib/auth";
import { seedLessonsAndVocabularyAction } from "./actions";
import { getPersonalizedLearningProfile } from "../../lib/learning-engine";

export const dynamic = "force-dynamic";

export interface CourseData {
  id: number;
  title: string;
  description?: string | null;
}

export default async function LessonsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    redirect("/login");
  }

  // Seed default course/lessons if missing (additive only)
  await seedLessonsAndVocabularyAction();

  let userRecord: any = null;
  let lessons: any[] = [];
  let courses: CourseData[] = [];
  let completedLessonIds: number[] = [];
  let isAdmin = false;

  try {
    userRecord = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (userRecord) {
      isAdmin = userRecord.role === "admin";
      // Query completed lessons for this specific user
      const completions = await db.orm.public.UserLessonProgress.where({ userId: userRecord.id }).all();
      completedLessonIds = completions.map((c) => c.lessonId);
    }

    const rawCourses = await db.orm.public.Course.all();
    courses = rawCourses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
    }));

    lessons = await db.orm.public.Lesson.orderBy((m) => m.id.asc()).all();
  } catch (error) {
    console.error("Failed to load lessons and courses from database:", error);
  }

  // Load personalized profile for learning recommendations
  let profile = null;
  try {
    profile = await getPersonalizedLearningProfile(sessionUser.email);
  } catch (e) {
    console.warn("Could not load personalized learning profile:", e);
  }

  const realUserName = userRecord?.name || userRecord?.username || sessionUser.name || "Learner";
  const userEmail = sessionUser.email;
  const userLevel = userRecord?.level || profile?.level || "Beginner";
  const nativeLanguage = userRecord?.nativeLanguage || profile?.nativeLanguage || "Hindi";
  const targetLanguage = userRecord?.targetLanguage || profile?.targetLanguage || "English";

  return (
    <LessonsClient
      initialLessons={lessons}
      initialCourses={courses}
      userName={realUserName}
      userEmail={userEmail}
      userLevel={userLevel}
      nativeLanguage={nativeLanguage}
      targetLanguage={targetLanguage}
      initialCompletedLessonIds={completedLessonIds}
      recommendedLessonId={profile?.nextRecommendedLesson?.id || null}
      isAdmin={isAdmin}
    />
  );
}
