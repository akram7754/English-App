import { db } from "../../prisma/db";
import LessonsClient from "./LessonsClient";

export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  let lessons: any[] = [];

  try {
    lessons = await db.orm.public.Lesson.all();
  } catch (error) {
    console.error("Failed to load lessons from database:", error);
  }

  return <LessonsClient initialLessons={lessons} />;
}
