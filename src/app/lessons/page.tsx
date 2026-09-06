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
  let isAdmin = false;

  let userRecord: any = null;
  try {
    userRecord = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (userRecord) {
      isAdmin = userRecord.role === "admin";
      // Query completed lessons for this specific user
      const completions = await db.orm.public.UserLessonProgress.where({ userId: userRecord.id }).all();
      completedLessonIds = completions.map((c) => c.lessonId);
    }
    lessons = await db.orm.public.Lesson.all();
  } catch (error) {
    console.error("Failed to load lessons from database:", error);
  }

  const realUserName = userRecord?.name || userRecord?.username || sessionUser.name || "Learner";
  const userEmail = sessionUser.email;
  const userLevel = userRecord?.level || "Beginner";

  return (
    <LessonsClient
      initialLessons={lessons}
      userName={realUserName}
      userEmail={userEmail}
      userLevel={userLevel}
      initialCompletedLessonIds={completedLessonIds}
      isAdmin={isAdmin}
    />
  );
}
