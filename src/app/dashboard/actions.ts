"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "../../prisma/db";
import { verifySession } from "../../lib/auth";
import {
  getPersonalizedLearningProfile,
  submitVocabularySpacedReview,
} from "../../lib/learning-engine";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const authorEmail = (formData.get("authorEmail") as string) || "sarah@example.com";

  if (!title || !content) {
    return;
  }

  try {
    // 1. Get or create the author
    let author = await db.orm.public.User.where({ email: authorEmail }).first();
    if (!author) {
      author = await db.orm.public.User.create({
        email: authorEmail,
        name: "Sarah Jenkins",
        username: "sarah_j",
      });
    }

    // 2. Create the post linking it to the author
    await db.orm.public.Post.create({
      title,
      content,
      author: (a) => a.connect({ id: author.id }),
    });

    // 3. Revalidate the dashboard page to display the new post
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Failed to create post:", error);
  }
}

export async function updateUserPreferencesAction(
  level: string,
  dailyGoalMinutes: number,
  nativeLanguage?: string,
  targetLanguage?: string
) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return { success: false, error: "User not found" };

    const updateData: any = {
      level: ["Beginner", "Intermediate", "Advanced"].includes(level) ? level : "Beginner",
      dailyGoalMinutes: Number(dailyGoalMinutes) || 15,
    };

    if (nativeLanguage) updateData.nativeLanguage = nativeLanguage;
    if (targetLanguage) updateData.targetLanguage = targetLanguage;

    await db.orm.public.User.where({ id: user.id }).update(updateData);

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update user learning preferences:", error);
    return { success: false, error: error.message || "Failed to update preferences" };
  }
}

export async function submitVocabReviewAction(vocabId: number, remembered: boolean) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    return { success: false, error: "Unauthorized" };
  }

  const res = await submitVocabularySpacedReview(sessionUser.email, vocabId, remembered);
  if (res.success) {
    revalidatePath("/");
    revalidatePath("/dashboard");
  }
  return res;
}

export async function getPersonalizedEngineDataAction() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) return null;

  return getPersonalizedLearningProfile(sessionUser.email);
}
