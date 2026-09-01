"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "../../prisma/db";
import { verifySession } from "../../lib/auth";

export async function completeLessonAction(lessonId: number) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return { success: false, error: "User not found" };

    const lesson = await db.orm.public.Lesson.where({ id: lessonId }).first();
    if (!lesson) return { success: false, error: "Lesson not found" };

    // Check if progress already exists
    const existing = await db.orm.public.UserLessonProgress.where({
      userId: user.id,
      lessonId: lesson.id,
    }).first();

    if (!existing) {
      await db.orm.public.UserLessonProgress.create({
        userId: user.id,
        lessonId: lesson.id,
        completed: true,
      });
    }

    revalidatePath("/lessons");
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to complete lesson:", error);
    return { success: false, error: error.message || "Failed to save progress" };
  }
}

export async function seedLessonsAndVocabularyAction() {
  try {
    // Check if lessons are empty
    const lessonCount = (await db.orm.public.Lesson.all()).length;
    if (lessonCount === 0) {
      console.log("Seeding default lessons...");
      const defaultLessons = [
        {
          title: "Introduction to Tenses",
          description: "Master the past, present, and future timelines in English grammar.",
          category: "Grammar",
          difficulty: "Beginner",
          content: "Tenses are used to express the time at which an action takes place.\n\n" +
            "1. **Present Tense**: Expresses actions occurring now.\n" +
            "   * Example: 'I learn English.'\n" +
            "2. **Past Tense**: Expresses actions that already occurred.\n" +
            "   * Example: 'I learned English yesterday.'\n" +
            "3. **Future Tense**: Expresses actions that will occur.\n" +
            "   * Example: 'I will learn English tomorrow.'\n\n" +
            "Practice forming your own sentences using these three simple tenses!"
        },
        {
          title: "Advanced Present Perfect",
          description: "Understand the subtle connections between past actions and present status.",
          category: "Grammar",
          difficulty: "Intermediate",
          content: "The Present Perfect tense connects the past to the present.\n\n" +
            "**Formula**: Subject + have/has + Past Participle\n\n" +
            "**Common Uses**:\n" +
            "1. **Life Experiences**:\n" +
            "   * 'I have visited Paris three times.' (It doesn't matter when; it's a life experience up to now).\n" +
            "2. **Actions starting in the past continuing now**:\n" +
            "   * 'She has lived here since 2018.'\n" +
            "3. **Recent actions with present results**:\n" +
            "   * 'I have lost my keys.' (So I don't have them right now)."
        },
        {
          title: "Essential Travel Phrases",
          description: "Crucial vocabulary and dialogue prompts for navigating foreign countries.",
          category: "Vocabulary",
          difficulty: "Beginner",
          content: "When traveling, these standard phrases will help you get assistance:\n\n" +
            "* **Asking for Directions**:\n  * 'Excuse me, where is the nearest train station?'\n  * 'How do I get to the city center?'\n" +
            "* **At a Restaurant**:\n  * 'Could we have the menu, please?'\n  * 'Is service included?'\n" +
            "* **At a Hotel**:\n  * 'I have a reservation under the name Akram.'\n  * 'What time is check-out?'"
        },
        {
          title: "Speaking Confidently",
          description: "Tips on pitch fluctuation, word stress, and rhythm to sound natural.",
          category: "Speaking",
          difficulty: "Advanced",
          content: "To speak naturally, focus on these three phonetic aspects:\n\n" +
            "1. **Sentence Stress**: Emphasize content words (nouns, verbs, adjectives) and de-emphasize function words (pronouns, prepositions, articles).\n" +
            "   * *Example*: 'I want to **go** to the **store**.'\n" +
            "2. **Intonation**: Raise your pitch at the end of Yes/No questions, and lower it at the end of Wh-questions.\n" +
            "3. **Linking**: Connect the ending consonant sound of one word to the starting vowel sound of the next word.\n" +
            "   * *Example*: 'Turn off' sounds like 'Tur-noff'."
        }
      ];

      for (const lesson of defaultLessons) {
        await db.orm.public.Lesson.create(lesson);
      }
    }

    // Check if vocabulary is empty
    const vocabCount = (await db.orm.public.Vocabulary.all()).length;
    if (vocabCount === 0) {
      console.log("Seeding default vocabulary...");
      const defaultVocab = [
        { word: "Ubiquitous", definition: "Present, appearing, or found everywhere.", partOfSpeech: "adjective", example: "Cell phones are ubiquitous in modern society." },
        { word: "Eloquent", definition: "Fluent or persuasive in speaking or writing.", partOfSpeech: "adjective", example: "He delivered an eloquent speech that moved the audience." },
        { word: "Meticulous", definition: "Showing great attention to detail; very careful and precise.", partOfSpeech: "adjective", example: "She is meticulous about her language pronunciation." },
        { word: "Pragmatic", definition: "Dealing with things sensibly and realistically in a practical way.", partOfSpeech: "adjective", example: "A pragmatic approach is needed to solve this problem." }
      ];

      for (const vocab of defaultVocab) {
        await db.orm.public.Vocabulary.create(vocab);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to seed data:", error);
    return { success: false, error: error.message || "Seeding failed" };
  }
}

export async function learnVocabularyAction(vocabWord: string) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;
  if (!sessionUser) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) return { success: false, error: "User not found" };

    const vocab = await db.orm.public.Vocabulary.where({ word: vocabWord }).first();
    if (!vocab) return { success: false, error: "Vocabulary word not found" };

    const existing = await db.orm.public.UserVocabularyProgress.where({
      userId: user.id,
      vocabId: vocab.id,
    }).first();

    if (!existing) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await db.orm.public.UserVocabularyProgress.create({
        userId: user.id,
        vocabId: vocab.id,
        learned: true,
        masteryLevel: 1,
        reviewCount: 0,
        lastReviewedAt: new Date().toISOString(),
        nextReviewAt: tomorrow.toISOString(),
      });
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to learn vocabulary:", error);
    return { success: false, error: error.message || "Failed to save vocabulary progress" };
  }
}
