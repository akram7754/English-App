"use server";

import { db } from "../../prisma/db";
import { revalidatePath } from "next/cache";

export async function createLesson(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const difficulty = formData.get("difficulty") as string;
  const content = formData.get("content") as string;

  if (!title || !description || !category || !difficulty || !content) {
    throw new Error("Missing required fields");
  }

  try {
    await db.orm.public.Lesson.create({
      title,
      description,
      category,
      difficulty,
      content,
    });

    revalidatePath("/lessons");
    revalidatePath("/admin");
  } catch (error) {
    console.error("Failed to create lesson:", error);
    throw new Error("Failed to write lesson to database");
  }
}
