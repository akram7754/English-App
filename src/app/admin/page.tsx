import { db } from "../../prisma/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "../../lib/auth";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export interface AdminUserData {
  id: number;
  email: string;
  name?: string | null;
  username?: string | null;
  role?: string | null;
  level?: string | null;
  nativeLanguage?: string | null;
  targetLanguage?: string | null;
  dailyGoalMinutes?: number | null;
  createdAt: string;
}

export interface AdminCourseData {
  id: number;
  title: string;
  description?: string | null;
  createdAt: string;
}

export interface AdminLessonData {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  content: string;
  courseId?: number | null;
  createdAt: string;
}

export interface AdminVocabularyData {
  id: number;
  word: string;
  definition: string;
  partOfSpeech?: string | null;
  example?: string | null;
  createdAt: string;
}

export interface AdminPracticeAttemptData {
  id: number;
  userId: number;
  phrase: string;
  score: number;
  difficulty: string;
  status: string;
  transcript?: string | null;
  grammarFeedback?: string | null;
  fluencyFeedback?: string | null;
  vocabFeedback?: string | null;
  createdAt: string;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    redirect("/login");
  }

  // Fetch the user from the database to check their role column
  const dbUser = await db.orm.public.User.where({ email: sessionUser.email }).first();
  if (!dbUser || dbUser.role !== "admin") {
    redirect("/dashboard");
  }

  const userName = dbUser.name || dbUser.username || "Super Administrator";
  const userInitials =
    userName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "SA";

  let users: AdminUserData[] = [];
  let courses: AdminCourseData[] = [];
  let lessons: AdminLessonData[] = [];
  let vocabularies: AdminVocabularyData[] = [];
  let practiceAttempts: AdminPracticeAttemptData[] = [];

  try {
    const rawUsers = await db.orm.public.User.all();
    users = rawUsers.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      username: u.username,
      role: u.role,
      level: u.level,
      nativeLanguage: u.nativeLanguage,
      targetLanguage: u.targetLanguage,
      dailyGoalMinutes: u.dailyGoalMinutes,
      createdAt: String(u.createdAt),
    }));

    const rawCourses = await db.orm.public.Course.all();
    courses = rawCourses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      createdAt: String(c.createdAt),
    }));

    const rawLessons = await db.orm.public.Lesson.all();
    lessons = rawLessons.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      category: l.category,
      difficulty: l.difficulty,
      content: l.content,
      courseId: l.courseId,
      createdAt: String(l.createdAt),
    }));

    const rawVocabularies = await db.orm.public.Vocabulary.all();
    vocabularies = rawVocabularies.map((v) => ({
      id: v.id,
      word: v.word,
      definition: v.definition,
      partOfSpeech: v.partOfSpeech,
      example: v.example,
      createdAt: String(v.createdAt),
    }));

    const rawAttempts = await db.orm.public.PracticeAttempt.orderBy((m) => m.createdAt.desc()).all();
    practiceAttempts = rawAttempts.map((a) => ({
      id: a.id,
      userId: a.userId,
      phrase: a.phrase,
      score: a.score,
      difficulty: a.difficulty,
      status: a.status,
      transcript: a.transcript,
      grammarFeedback: a.grammarFeedback,
      fluencyFeedback: a.fluencyFeedback,
      vocabFeedback: a.vocabFeedback,
      createdAt: String(a.createdAt),
    }));
  } catch (error) {
    console.error("Failed to query administration metrics in server layout:", error);
  }

  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);

  return (
    <AdminClient
      initialUsers={users}
      initialCourses={courses}
      initialLessons={lessons}
      initialVocabularies={vocabularies}
      initialAttempts={practiceAttempts}
      currentAdmin={{
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        username: dbUser.username,
      }}
      userName={userName}
      userInitials={userInitials}
      hasGeminiKey={hasGeminiKey}
    />
  );
}
