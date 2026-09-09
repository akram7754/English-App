"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "../../prisma/db";
import { verifySession, signSession, hashPassword, verifyPassword } from "../../lib/auth";
import { setSessionCookie } from "../../lib/session-cookie";
import { requestPasswordResetAction } from "../forgot-password/actions";
import { createUserNotification } from "../../lib/notification-engine";

export interface UpdateProfileParams {
  name?: string;
  username?: string;
  level?: string;
  dailyGoalMinutes?: number;
  nativeLanguage?: string;
  targetLanguage?: string;
}

export interface ProfileActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Updates learner profile and preferences in PostgreSQL.
 * Validates identity server-side via session cookie; never trusts client-provided user IDs.
 * Re-issues the signed session cookie so navigation headers reflect changes instantly.
 */
export async function updateFullProfileAction(
  params: UpdateProfileParams
): Promise<ProfileActionResult> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user")?.value;
    const sessionUser = userCookie ? verifySession(userCookie) : null;

    if (!sessionUser?.email) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) {
      return { success: false, error: "User account not found in database." };
    }

    const updatePayload: Record<string, any> = {};

    // Validate and update Full Name
    if (params.name !== undefined) {
      const trimmedName = params.name.trim();
      if (trimmedName.length < 2) {
        return { success: false, error: "Full name must be at least 2 characters long." };
      }
      if (trimmedName.length > 100) {
        return { success: false, error: "Full name cannot exceed 100 characters." };
      }
      updatePayload.name = trimmedName;
    }

    // Validate and update Username handle
    if (params.username !== undefined) {
      const trimmedUsername = params.username.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(trimmedUsername)) {
        return {
          success: false,
          error: "Username must be 3-30 characters and contain only letters, numbers, and underscores.",
        };
      }

      // Check if handle is taken by another user
      if (trimmedUsername !== (user.username || "").toLowerCase()) {
        const existingHandle = await db.orm.public.User.where({
          username: trimmedUsername,
        }).first();

        if (existingHandle && existingHandle.id !== user.id) {
          return { success: false, error: `Username @${trimmedUsername} is already taken.` };
        }
      }
      updatePayload.username = trimmedUsername;
    }

    // Validate CEFR Level
    if (params.level !== undefined) {
      const validLevels = ["Beginner", "Intermediate", "Advanced"];
      if (validLevels.includes(params.level)) {
        updatePayload.level = params.level;
      } else {
        updatePayload.level = "Beginner";
      }
    }

    // Validate Daily Goal Minutes
    if (params.dailyGoalMinutes !== undefined) {
      const minutes = Number(params.dailyGoalMinutes);
      if (Number.isInteger(minutes) && minutes >= 5 && minutes <= 300) {
        updatePayload.dailyGoalMinutes = minutes;
      } else {
        updatePayload.dailyGoalMinutes = 15;
      }
    }

    // Validate Native & Target Languages
    const candidateNative = (params.nativeLanguage !== undefined ? params.nativeLanguage.trim() : user.nativeLanguage) || "Hindi";
    const candidateTarget = (params.targetLanguage !== undefined ? params.targetLanguage.trim() : user.targetLanguage) || "English";

    if (candidateNative.toLowerCase() === candidateTarget.toLowerCase()) {
      return {
        success: false,
        error: "Native language and target language cannot be the same. Please select different languages for speaking and learning.",
      };
    }

    if (params.nativeLanguage !== undefined && params.nativeLanguage.trim()) {
      updatePayload.nativeLanguage = params.nativeLanguage.trim();
    }
    if (params.targetLanguage !== undefined && params.targetLanguage.trim()) {
      updatePayload.targetLanguage = params.targetLanguage.trim();
    }

    if (Object.keys(updatePayload).length > 0) {
      await db.orm.public.User.where({ id: user.id }).update(updatePayload);
    }

    // Re-sign session cookie with updated details
    const effectiveName = updatePayload.name || user.name || user.username || "Learner";
    const effectiveLevel = updatePayload.level || user.level || "Beginner";
    const effectiveNative = updatePayload.nativeLanguage || user.nativeLanguage || "Hindi";
    const effectiveTarget = updatePayload.targetLanguage || user.targetLanguage || "English";

    const sessionToken = signSession({
      id: user.id,
      email: user.email,
      name: effectiveName,
      role: user.role || "student",
      level: effectiveLevel,
      nativeLanguage: effectiveNative,
      targetLanguage: effectiveTarget,
    });

    await setSessionCookie(sessionToken);

    // Trigger security notification
    try {
      await createUserNotification({
        userId: user.id,
        type: "security",
        title: "Profile Preferences Updated",
        message: "Your learning preferences and profile information were updated successfully.",
        actionUrl: "/profile",
      });
    } catch (notifErr: any) {
      console.error("Profile notification notice:", notifErr?.message);
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath("/progress");
    revalidatePath("/speaking-score");

    return {
      success: true,
      message: "Profile preferences saved successfully!",
      data: {
        name: effectiveName,
        username: updatePayload.username || user.username,
        level: effectiveLevel,
        dailyGoalMinutes: updatePayload.dailyGoalMinutes || user.dailyGoalMinutes,
        nativeLanguage: effectiveNative,
        targetLanguage: effectiveTarget,
      },
    };
  } catch (error: any) {
    console.error("updateFullProfileAction error:", error);
    return {
      success: false,
      error: error?.message || "Failed to update profile preferences.",
    };
  }
}

/**
 * Changes authenticated user password with current password verification and bcrypt hashing.
 */
export async function changeProfilePasswordAction(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ProfileActionResult> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user")?.value;
    const sessionUser = userCookie ? verifySession(userCookie) : null;

    if (!sessionUser?.email) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    if (!currentPassword) {
      return { success: false, error: "Please provide your current password." };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "New password and confirmation do not match." };
    }

    if (currentPassword === newPassword) {
      return { success: false, error: "New password must be different from current password." };
    }

    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) {
      return { success: false, error: "User account not found." };
    }

    // Verify current password
    if (user.passwordHash) {
      const isMatch = await verifyPassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        return { success: false, error: "Incorrect current password." };
      }
    } else {
      // Default initial password fallback
      if (currentPassword !== "123456") {
        return { success: false, error: "Incorrect current password." };
      }
    }

    // Hash new password using bcrypt salt 10
    const newHash = await hashPassword(newPassword);

    await db.orm.public.User.where({ id: user.id }).update({
      passwordHash: newHash,
    });

    // Re-sign session cookie with fresh token
    try {
      const sessionToken = signSession({
        id: user.id,
        email: user.email,
        name: user.name || user.username || "Learner",
        role: user.role || "student",
        level: user.level || "Beginner",
        nativeLanguage: user.nativeLanguage || "Hindi",
        targetLanguage: user.targetLanguage || "English",
      });

      await setSessionCookie(sessionToken);
    } catch (cookieErr) {
      // Safe fallback in standalone test contexts
    }

    // Trigger security notification
    try {
      await createUserNotification({
        userId: user.id,
        type: "security",
        title: "Password Changed",
        message: "Your account password was changed successfully.",
        actionUrl: "/profile",
      });
    } catch (notifErr: any) {
      console.error("Password notification notice:", notifErr?.message);
    }

    return { success: true, message: "Password changed successfully!" };
  } catch (error: any) {
    console.error("changeProfilePasswordAction error:", error);
    return {
      success: false,
      error: error?.message || "Failed to update password.",
    };
  }
}

/**
 * Triggers a secure password reset link sent to the user's verified registered email.
 */
export async function triggerProfilePasswordResetAction(): Promise<ProfileActionResult> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user")?.value;
    const sessionUser = userCookie ? verifySession(userCookie) : null;

    if (!sessionUser?.email) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    return await requestPasswordResetAction(sessionUser.email);
  } catch (error: any) {
    console.error("triggerProfilePasswordResetAction error:", error);
    return {
      success: false,
      error: error?.message || "Failed to initiate password reset.",
    };
  }
}

/**
 * Creates a personal writing journal post linked strictly to the authenticated user.
 * Client-provided user IDs are completely ignored.
 */
export async function createProfileJournalPostAction(
  title: string,
  content: string
): Promise<ProfileActionResult> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user")?.value;
    const sessionUser = userCookie ? verifySession(userCookie) : null;

    if (!sessionUser?.email) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const trimmedTitle = (title || "").trim();
    const trimmedContent = (content || "").trim();

    if (!trimmedTitle) {
      return { success: false, error: "Entry title is required." };
    }

    if (!trimmedContent) {
      return { success: false, error: "Entry content cannot be empty." };
    }

    const user = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (!user) {
      return { success: false, error: "User account not found." };
    }

    const post = await db.orm.public.Post.create({
      title: trimmedTitle,
      content: trimmedContent,
      author: (a) => a.connect({ id: user.id }),
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Journal entry published successfully!",
      data: post,
    };
  } catch (error: any) {
    console.error("createProfileJournalPostAction error:", error);
    return {
      success: false,
      error: error?.message || "Failed to publish journal entry.",
    };
  }
}
