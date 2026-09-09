import { db } from "../prisma/db";
import { getPersonalizedLearningProfile } from "./learning-engine";

export interface NotificationItem {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface UserNotificationsResult {
  notifications: NotificationItem[];
  unreadCount: number;
}

/**
 * Creates a single notification for a user, enforcing deduplication for daily reminder types.
 */
export async function createUserNotification(params: {
  userId: number;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  deduplicateDaily?: boolean;
}): Promise<NotificationItem | null> {
  const { userId, type, title, message, actionUrl = null, deduplicateDaily = false } = params;

  try {
    const todayStr = new Date().toISOString().split("T")[0];

    if (deduplicateDaily) {
      // Check if a notification of this type already exists for today
      const existing = await (db.orm.public as any).Notification.where({
        userId,
        type,
      })
        .orderBy((m: any) => m.createdAt.desc())
        .all();

      const existsToday = existing.some((n: any) => {
        const dateStr = new Date(n.createdAt).toISOString().split("T")[0];
        return dateStr === todayStr;
      });

      if (existsToday) {
        return null;
      }
    }

    const created = await (db.orm.public as any).Notification.create({
      userId,
      type,
      title,
      message,
      read: false,
      actionUrl: actionUrl || null,
      createdAt: new Date().toISOString(),
    });

    return {
      id: created.id,
      userId: created.userId,
      type: created.type,
      title: created.title,
      message: created.message,
      read: created.read,
      actionUrl: created.actionUrl,
      createdAt: String(created.createdAt),
      readAt: created.readAt ? String(created.readAt) : null,
    };
  } catch (err: any) {
    console.error("[Notification Engine] Failed to create notification:", err.message);
    return null;
  }
}

/**
 * Evaluates real student progress against deterministic reminder rules.
 * Emits notifications ONLY when genuine underlying conditions exist.
 * Applies strict deduplication (maximum 1 reminder of each type per user per day).
 */
export async function syncUserLearningNotifications(
  userId: number,
  userEmail: string
): Promise<void> {
  try {
    const profile = await getPersonalizedLearningProfile(userEmail);
    if (!profile) return;

    const todayStr = new Date().toISOString().split("T")[0];

    // Fetch user's existing notifications for today
    const existingNotifications = await (db.orm.public as any).Notification.where({
      userId,
    })
      .orderBy((m: any) => m.createdAt.desc())
      .all();

    const existingTypesToday = new Set<string>();
    for (const n of existingNotifications) {
      const nDate = new Date(n.createdAt).toISOString().split("T")[0];
      if (nDate === todayStr) {
        existingTypesToday.add(n.type);
      }
    }

    // 1. Daily Goal Reminder:
    // Only if today's study minutes < daily goal minutes AND not yet completed today
    if (!profile.todayGoalCompleted && profile.todayStudyMinutes < profile.dailyGoalMinutes) {
      if (!existingTypesToday.has("daily_goal")) {
        const minutesLeft = Math.max(1, profile.dailyGoalMinutes - profile.todayStudyMinutes);
        await createUserNotification({
          userId,
          type: "daily_goal",
          title: "Daily Goal",
          message: `You're ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"} away from completing today's goal.`,
          actionUrl: "/lessons",
          deduplicateDaily: true,
        });
      }
    }

    // 2. Streak Reminder:
    // Only if active streak (> 0 days) AND user has not yet practiced today
    const practicedToday = profile.todayStudyMinutes > 0;
    if (profile.streakDays > 0 && !practicedToday) {
      if (!existingTypesToday.has("streak")) {
        await createUserNotification({
          userId,
          type: "streak",
          title: "Keep Your Streak Alive",
          message: `Keep your ${profile.streakDays}-day streak alive today! Practice for a few minutes.`,
          actionUrl: "/voice-practice",
          deduplicateDaily: true,
        });
      }
    }

    // 3. Spaced Repetition Vocabulary Review Reminder:
    // Only if words are actually due in the SRS queue (dueVocabReviewsCount > 0)
    if (profile.dueVocabReviewsCount > 0) {
      if (!existingTypesToday.has("vocab_review")) {
        await createUserNotification({
          userId,
          type: "vocab_review",
          title: "Vocabulary Review",
          message: `${profile.dueVocabReviewsCount} vocabulary word${
            profile.dueVocabReviewsCount === 1 ? "" : "s"
          } are ready for review.`,
          actionUrl: "/progress",
          deduplicateDaily: true,
        });
      }
    }

    // 4. Speaking Practice Reminder:
    // Check practice attempts today directly from database
    const attemptsToday = await (db.orm.public as any).PracticeAttempt.where({
      userId,
    })
      .orderBy((m: any) => m.createdAt.desc())
      .limit(10)
      .all();

    const hasSpokenToday = attemptsToday.some((pa: any) => {
      const paDate = new Date(pa.createdAt).toISOString().split("T")[0];
      return paDate === todayStr;
    });

    if (!hasSpokenToday) {
      if (!existingTypesToday.has("speaking_practice")) {
        await createUserNotification({
          userId,
          type: "speaking_practice",
          title: "Speaking Practice",
          message: "You haven't practiced speaking today. Practice a phrase to sharpen your accent!",
          actionUrl: "/voice-practice",
          deduplicateDaily: true,
        });
      }
    }

    // 5. Lesson Reminder:
    // Only if user has an unfinished/unlocked lesson waiting
    if (profile.nextRecommendedLesson && profile.completedLessonsCount < profile.totalLessonsCount) {
      if (!existingTypesToday.has("lesson_reminder")) {
        await createUserNotification({
          userId,
          type: "lesson_reminder",
          title: "Lesson Waiting",
          message: `You have a lesson waiting for you: "${profile.nextRecommendedLesson.title}".`,
          actionUrl: "/lessons",
          deduplicateDaily: true,
        });
      }
    }

    // 6. Curriculum Milestone Notification (Lifetime check):
    if (profile.completedLessonsCount >= 5) {
      const existingMilestone = existingNotifications.some((n: any) => n.type === "milestone_lessons_5");
      if (!existingMilestone) {
        await createUserNotification({
          userId,
          type: "milestone_lessons_5",
          title: "Curriculum Milestone",
          message: "Outstanding! You have completed 5 lessons on your learning pathway.",
          actionUrl: "/progress",
        });
      }
    }

    if (profile.learnedVocabCount >= 10) {
      const existingVocabMilestone = existingNotifications.some((n: any) => n.type === "milestone_vocab_10");
      if (!existingVocabMilestone) {
        await createUserNotification({
          userId,
          type: "milestone_vocab_10",
          title: "Vocabulary Milestone",
          message: "Impressive! You have mastered 10 vocabulary words in your SRS personal bank.",
          actionUrl: "/progress",
        });
      }
    }
  } catch (err: any) {
    console.error("[Notification Engine] Sync error:", err.message);
  }
}

/**
 * Retrieves all notifications for an authenticated user and calculates unread count.
 */
export async function getUserNotifications(userId: number): Promise<UserNotificationsResult> {
  try {
    const rawList = await (db.orm.public as any).Notification.where({
      userId,
    })
      .orderBy((m: any) => m.createdAt.desc())
      .limit(30)
      .all();

    const notifications: NotificationItem[] = rawList.map((n: any) => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      read: Boolean(n.read),
      actionUrl: n.actionUrl || null,
      createdAt: String(n.createdAt),
      readAt: n.readAt ? String(n.readAt) : null,
    }));

    const unreadCount = notifications.filter((n) => !n.read).length;

    return { notifications, unreadCount };
  } catch (err: any) {
    console.error("[Notification Engine] Get notifications error:", err.message);
    return { notifications: [], unreadCount: 0 };
  }
}

/**
 * Marks a single notification as read, strictly enforcing user ownership.
 */
export async function markNotificationAsRead(
  notificationId: number,
  userId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const target = await (db.orm.public as any).Notification.where({
      id: notificationId,
      userId,
    }).first();

    if (!target) {
      return { success: false, error: "Notification not found or access denied." };
    }

    if (!target.read) {
      await (db.orm.public as any).Notification.where({ id: notificationId }).update({
        read: true,
        readAt: new Date().toISOString(),
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Notification Engine] Mark as read error:", err.message);
    return { success: false, error: "Failed to mark notification as read." };
  }
}

/**
 * Marks all unread notifications as read for an authenticated user.
 */
export async function markAllNotificationsAsRead(
  userId: number
): Promise<{ success: boolean; updatedCount: number; error?: string }> {
  try {
    const unreadItems = await (db.orm.public as any).Notification.where({
      userId,
      read: false,
    }).all();

    const now = new Date().toISOString();
    for (const item of unreadItems) {
      await (db.orm.public as any).Notification.where({ id: item.id }).update({
        read: true,
        readAt: now,
      });
    }

    return { success: true, updatedCount: unreadItems.length };
  } catch (err: any) {
    console.error("[Notification Engine] Mark all as read error:", err.message);
    return { success: false, updatedCount: 0, error: "Failed to mark all notifications as read." };
  }
}
