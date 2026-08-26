"use server";

import { revalidatePath } from "next/cache";
import { db } from "../../prisma/db";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const authorEmail = formData.get("authorEmail") as string || "sarah@example.com";

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
