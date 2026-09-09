"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "../../prisma/db";
import { verifySession } from "../../lib/auth";
import { createUserNotification } from "../../lib/notification-engine";

export async function completeLessonAction(lessonId: number, quizScore?: number) {
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

      // Trigger lesson completed notification
      try {
        await createUserNotification({
          userId: user.id,
          type: "lesson_completed",
          title: "Lesson Completed",
          message: `Great job! You completed "${lesson.title}". Keep up the momentum!`,
          actionUrl: "/lessons",
        });
      } catch (notifErr: any) {
        console.error("Lesson notification notice:", notifErr?.message);
      }
    }

    // Find the next sequential lesson
    const allLessons = await db.orm.public.Lesson.orderBy((m) => m.id.asc()).all();
    const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
    const nextLesson = currentIdx >= 0 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

    revalidatePath("/lessons");
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/progress");

    return {
      success: true,
      quizScore,
      nextLessonId: nextLesson?.id || null,
      nextLessonTitle: nextLesson?.title || null,
    };
  } catch (error: any) {
    console.error("Failed to complete lesson:", error);
    return { success: false, error: error.message || "Failed to save progress" };
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

    let vocab = await db.orm.public.Vocabulary.where({ word: vocabWord }).first();
    if (!vocab) {
      vocab = await db.orm.public.Vocabulary.create({
        word: vocabWord,
        definition: `Key term learned in lessons.`,
        partOfSpeech: "Key Term",
        example: `Used in lesson dialogue.`,
      });
    }

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
    revalidatePath("/progress");
    revalidatePath("/lessons");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to learn vocabulary:", error);
    return { success: false, error: error.message || "Failed to save vocabulary progress" };
  }
}

export async function learnLessonVocabularyListAction(
  words: Array<{ word: string; definition: string; partOfSpeech?: string; example?: string }>
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

    for (const item of words) {
      if (!item.word) continue;
      let vocab = await db.orm.public.Vocabulary.where({ word: item.word }).first();
      if (!vocab) {
        vocab = await db.orm.public.Vocabulary.create({
          word: item.word,
          definition: item.definition || "Lesson vocabulary item",
          partOfSpeech: item.partOfSpeech || "noun",
          example: item.example || `Example sentence for ${item.word}.`,
        });
      }

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
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/progress");
    return { success: true, count: words.length };
  } catch (error: any) {
    console.error("Failed to learn vocabulary list:", error);
    return { success: false, error: error.message || "Failed to save vocabulary" };
  }
}

export async function seedLessonsAndVocabularyAction() {
  try {
    // 1. Ensure default course exists (additive only)
    const courses = await db.orm.public.Course.all();
    let defaultCourse = courses[0];
    if (!defaultCourse) {
      defaultCourse = await db.orm.public.Course.create({
        title: "English Foundations",
        description: "Core grammar, vocabulary, and speaking skills for everyday fluency.",
      });
    }

    // 2. Link any unlinked lessons to the default course
    const unlinkedLessons = await db.orm.public.Lesson.where({ courseId: null }).all();
    for (const l of unlinkedLessons) {
      await db.orm.public.Lesson.where({ id: l.id }).update({ courseId: defaultCourse.id });
    }

    // 3. Ensure all 10 Beginner Practical Situations exist without duplicates
    const beginnerLessons = [
      {
        title: "Greetings & Everyday Basics",
        aliasTitle: "Greetings & Introductions",
        description: "Master standard greetings, polite expressions, and daily conversation starters.",
        category: "Speaking",
        difficulty: "Beginner",
        content:
          "Learn how to greet people, ask how they are, and respond politely in everyday English.\n\n" +
          "* **Greeting:** Hello! Good morning, good afternoon, good evening.\n" +
          "* **Small talk:** How are you doing today? I am doing great, thank you!\n" +
          "* **Polite phrases:** Please, thank you, you are welcome, have a wonderful day.",
      },
      {
        title: "Daily Conversation",
        description: "Communicate naturally about daily routines, weather, schedules, and common day-to-day happenings.",
        category: "Conversation",
        difficulty: "Beginner",
        content:
          "Learn how to discuss your day-to-day life, personal habits, and morning schedules.\n\n" +
          "* **Routines:** What do you usually do in the morning? I wake up at seven and drink water.\n" +
          "* **Weather:** The weather is exceptionally pleasant today, perfect for walking outside.\n" +
          "* **Frequency:** I always prepare my schedule the evening before.",
      },
      {
        title: "Family & Friends",
        description: "Describe family members, relationships, friendships, hobbies, and personal connections.",
        category: "Social & Lifestyle",
        difficulty: "Beginner",
        content:
          "Talk warmly about your household, relatives, lifelong friendships, and shared activities.\n\n" +
          "* **Family:** I have a close-knit family with two siblings and supportive parents.\n" +
          "* **Friendship:** Spending quality time with friends brings tremendous joy.\n" +
          "* **Hobbies:** We enjoy cooking, reading, and hiking together on weekends.",
      },
      {
        title: "Food & Restaurant",
        description: "Order dishes, ask for recommendations, navigate dietary preferences, and handle restaurant bills.",
        category: "Dining & Practical",
        difficulty: "Beginner",
        content:
          "Master dining etiquette, reading restaurant menus, requesting food, and asking for the bill.\n\n" +
          "* **Ordering:** Could we please see the dinner menu and wine list?\n" +
          "* **Preferences:** What house specialty dish do you recommend for dinner today?\n" +
          "* **Paying:** We would like to pay the bill now, please. Thank you for the delicious meal.",
      },
      {
        title: "Shopping",
        description: "Inquire about prices, try on clothing sizes, explore discounts, and navigate retail transactions.",
        category: "Practical",
        difficulty: "Beginner",
        content:
          "Confidently ask for clothing items, request different sizes and colors, and verify discounts.\n\n" +
          "* **Pricing:** Excuse me, how much does this jacket cost?\n" +
          "* **Fitting:** Can I please try this on in a medium size in the fitting room?\n" +
          "* **Discounts:** Is there an ongoing seasonal promotional discount on these items?",
      },
      {
        title: "Travel",
        description: "Navigate airports, book hotels, ask for directions, and explore historical monuments.",
        category: "Travel & Directions",
        difficulty: "Beginner",
        content:
          "Travel with confidence by asking directions, checking into hotels, and boarding transit.\n\n" +
          "* **Directions:** Could you please tell me how to get to the central station?\n" +
          "* **Lodging:** I have a room reservation for two nights under my name.\n" +
          "* **Transit:** Where is the platform for the airport express train located?",
      },
      {
        title: "Workplace Conversation",
        description: "Collaborate on projects, communicate in meetings, align on deadlines, and exchange professional emails.",
        category: "Professional",
        difficulty: "Beginner",
        content:
          "Speak effectively in office environments, coordinate meetings, and discuss project deliverables.\n\n" +
          "* **Coordination:** Let's touch base tomorrow morning regarding project timelines.\n" +
          "* **Progress:** We completed all required tasks ahead of the scheduled deadline.\n" +
          "* **Teamwork:** Collaborative communication makes every team initiative successful.",
      },
      {
        title: "Job Interview",
        description: "Present your qualifications, discuss professional achievements, and respond to behavioral interview questions.",
        category: "Career & Interview",
        difficulty: "Beginner",
        content:
          "Introduce your career background, articulate personal strengths, and highlight experience.\n\n" +
          "* **Background:** My primary strength is delivering complex software projects on schedule.\n" +
          "* **Expertise:** I bring five years of hands-on experience in modern technology platforms.\n" +
          "* **Goals:** I am eager to contribute to innovative and high-impact team challenges.",
      },
      {
        title: "Phone & Online Conversation",
        description: "Handle voice calls, verify audio quality, manage interruptions, and schedule virtual conference calls.",
        category: "Communication",
        difficulty: "Beginner",
        content:
          "Handle phone etiquette, audio checkups, voice messages, and virtual meetings smoothly.\n\n" +
          "* **Clarity:** Could you please speak a little louder? The connection is breaking up slightly.\n" +
          "* **Messages:** May I leave a brief message for Ms. Clark regarding our call?\n" +
          "* **Scheduling:** Let's schedule a video conference tomorrow afternoon at three.",
      },
      {
        title: "Free Conversation",
        description: "Express opinions freely, debate perspectives, exchange cultural insights, and develop spontaneous fluency.",
        category: "Fluency & Discussion",
        difficulty: "Beginner",
        content:
          "Express thoughts spontaneously, share cultural perspectives, and discuss varied interests.\n\n" +
          "* **Opinion:** In my opinion, learning multiple languages opens entirely new worldviews.\n" +
          "* **Culture:** Open cultural dialogue builds bridges of mutual understanding and peace.\n" +
          "* **Perspective:** Exchanging ideas with people worldwide broadens one's perspective.",
      },
    ];

    for (const item of beginnerLessons) {
      // Check if either primary title or alias title exists
      const existing = await db.orm.public.Lesson.where({ title: item.title }).first();
      const existingAlias = item.aliasTitle
        ? await db.orm.public.Lesson.where({ title: item.aliasTitle }).first()
        : null;

      if (!existing && !existingAlias) {
        await db.orm.public.Lesson.create({
          title: item.title,
          description: item.description,
          category: item.category,
          difficulty: item.difficulty,
          courseId: defaultCourse.id,
          content: item.content,
        });
      }
    }

    // 4. Ensure practical vocabulary exists across core everyday topics
    const practicalVocabList = [
      {
        word: "pleasure",
        definition: "A feeling of happy satisfaction and enjoyment.",
        partOfSpeech: "noun",
        example: "It is an absolute pleasure to meet you.",
      },
      {
        word: "introduce",
        definition: "To make someone known by name to another person.",
        partOfSpeech: "verb",
        example: "Allow me to introduce my colleague.",
      },
      {
        word: "routine",
        definition: "A sequence of actions regularly followed as a habit.",
        partOfSpeech: "noun",
        example: "A healthy morning routine boosts productivity.",
      },
      {
        word: "relative",
        definition: "A person connected by blood or marriage.",
        partOfSpeech: "noun",
        example: "We visit our relatives every holiday season.",
      },
      {
        word: "delicious",
        definition: "Highly pleasant to the taste.",
        partOfSpeech: "adjective",
        example: "This regional specialty dish is delicious.",
      },
      {
        word: "discount",
        definition: "A deduction from the usual cost of something.",
        partOfSpeech: "noun",
        example: "Is there a seasonal discount on this item?",
      },
      {
        word: "destination",
        definition: "The place to which someone or something is going.",
        partOfSpeech: "noun",
        example: "Our travel destination is Paris.",
      },
      {
        word: "deadline",
        definition: "The latest time or date by which something should be completed.",
        partOfSpeech: "noun",
        example: "The project deadline is Thursday afternoon.",
      },
      {
        word: "experience",
        definition: "Practical contact with and observation of facts or events over time.",
        partOfSpeech: "noun",
        example: "I have five years of hands-on technical experience.",
      },
      {
        word: "connection",
        definition: "A relationship or link in communication.",
        partOfSpeech: "noun",
        example: "The audio connection is crystal clear now.",
      },
      {
        word: "perspective",
        definition: "A particular attitude toward or way of regarding something.",
        partOfSpeech: "noun",
        example: "Traveling broadens your global perspective.",
      },
    ];

    for (const v of practicalVocabList) {
      const existingV = await db.orm.public.Vocabulary.where({ word: v.word }).first();
      if (!existingV) {
        await db.orm.public.Vocabulary.create(v);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to seed data:", error);
    return { success: false, error: error.message || "Seeding failed" };
  }
}
