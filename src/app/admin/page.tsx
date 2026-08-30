import { db } from "../../prisma/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "../../lib/auth";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

interface UserData {
  id: number;
  email: string;
  name?: string | null;
  username?: string | null;
  createdAt: string;
}

interface CourseData {
  id: number;
  title: string;
  description?: string | null;
  createdAt: string;
}

interface LessonData {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  content: string;
  courseId?: number | null;
  createdAt: string;
}

interface VocabularyData {
  id: number;
  word: string;
  definition: string;
  partOfSpeech?: string | null;
  example?: string | null;
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

  const userName = dbUser.name || dbUser.username || "Admin User";
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "AD";

  let users: UserData[] = [];
  let courses: CourseData[] = [];
  let lessons: LessonData[] = [];
  let vocabularies: VocabularyData[] = [];
  let attemptsCount = 0;
  let postsCount = 0;

  try {
    const rawUsers = await db.orm.public.User.all();
    users = rawUsers.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      username: u.username,
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

    attemptsCount = (await db.orm.public.PracticeAttempt.all()).length;
    postsCount = (await db.orm.public.Post.all()).length;
  } catch (error) {
    console.error("Failed to query administration metrics in server layout:", error);
  }

  return (
    <AdminClient
      initialUsers={users}
      initialCourses={courses}
      initialLessons={lessons}
      initialVocabularies={vocabularies}
      initialAttemptsCount={attemptsCount}
      initialPostsCount={postsCount}
      userName={userName}
      userInitials={userInitials}
    />
  );
}
