import { db } from "../../prisma/db";
import LessonsClient from "./LessonsClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "../../lib/auth";
import { seedLessonsAndVocabularyAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    redirect("/login");
  }

  // Seed default data if database is empty
  await seedLessonsAndVocabularyAction();

  const userName = sessionUser.name || "Sarah Jenkins";
  let lessons: any[] = [];
  let completedLessonIds: number[] = [];

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (user) {
      // Query completed lessons for this specific user
      const completions = await db.orm.public.UserLessonProgress.where({ userId: user.id }).all();
      completedLessonIds = completions.map((c) => c.lessonId);
    }
    lessons = await db.orm.public.Lesson.all();
  } catch (error) {
    console.error("Failed to load lessons from database:", error);
  }

  return (
    <LessonsClient
      initialLessons={lessons}
      userName={userName}
      initialCompletedLessonIds={completedLessonIds}
    />
  );
}
