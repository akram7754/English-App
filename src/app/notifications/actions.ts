"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifySession } from "../../lib/auth";
import {
  getUserNotifications,
  syncUserLearningNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NotificationItem,
} from "../../lib/notification-engine";

export interface NotificationsResponse {
  success: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  error?: string;
}

/**
 * Server action to fetch authenticated user's notifications.
 * Runs deterministic learning reminder sync for today's activities.
 */
export async function getNotificationsAction(): Promise<NotificationsResponse> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user")?.value;
    const session = verifySession(sessionCookie || "");

    if (!session || !session.id || !session.email) {
      return {
        success: false,
        notifications: [],
        unreadCount: 0,
        error: "Unauthorized",
      };
    }

    // Sync today's real learning conditions into notifications
    await syncUserLearningNotifications(session.id, session.email);

    // Fetch user notifications from PostgreSQL
    const data = await getUserNotifications(session.id);

    return {
      success: true,
      notifications: data.notifications,
      unreadCount: data.unreadCount,
    };
  } catch (err: any) {
    console.error("[getNotificationsAction] Error:", err.message);
    return {
      success: false,
      notifications: [],
      unreadCount: 0,
      error: "Failed to load notifications",
    };
  }
}

/**
 * Server action to mark a single notification as read.
 * Strictly verifies ownership by authenticated user session.
 */
export async function markNotificationAsReadAction(
  notificationId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user")?.value;
    const session = verifySession(sessionCookie || "");

    if (!session || !session.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await markNotificationAsRead(notificationId, session.id);

    if (result.success) {
      revalidatePath("/");
      revalidatePath("/profile");
      revalidatePath("/progress");
    }

    return result;
  } catch (err: any) {
    console.error("[markNotificationAsReadAction] Error:", err.message);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

/**
 * Server action to mark all unread notifications as read for authenticated user.
 */
export async function markAllNotificationsAsReadAction(): Promise<{
  success: boolean;
  updatedCount: number;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user")?.value;
    const session = verifySession(sessionCookie || "");

    if (!session || !session.id) {
      return { success: false, updatedCount: 0, error: "Unauthorized" };
    }

    const result = await markAllNotificationsAsRead(session.id);

    if (result.success) {
      revalidatePath("/");
      revalidatePath("/profile");
      revalidatePath("/progress");
    }

    return result;
  } catch (err: any) {
    console.error("[markAllNotificationsAsReadAction] Error:", err.message);
    return { success: false, updatedCount: 0, error: "Failed to mark all as read" };
  }
}
