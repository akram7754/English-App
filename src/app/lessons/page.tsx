import { db } from "../../prisma/db";
import LessonsClient from "./LessonsClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifySession } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    redirect("/login");
  }

  const userName = sessionUser.name || "Sarah Jenkins";

  let lessons: any[] = [];

  try {
    lessons = await db.orm.public.Lesson.all();
  } catch (error) {
    console.error("Failed to load lessons from database:", error);
  }

  return <LessonsClient initialLessons={lessons} userName={userName} />;
}
