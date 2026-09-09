"use server";

import { cookies } from "next/headers";
import { db } from "../../prisma/db";
import { verifySession } from "../../lib/auth";
import { syncUserAchievements, UserGamificationProfile } from "../../lib/achievements";

export interface AchievementsResponse {
  success: boolean;
  profile?: UserGamificationProfile | null;
  error?: string;
}

/**
 * Server action to fetch authenticated user's gamification profile and achievements.
 * Evaluates real learning milestones and records new unlocks in PostgreSQL.
 */
export async function getUserAchievementsAction(): Promise<AchievementsResponse> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user")?.value;
    const session = verifySession(sessionCookie || "");

    if (!session?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.orm.public.User.where({ email: session.email }).first();
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const gamificationProfile = await syncUserAchievements(user.id, user.email);

    if (!gamificationProfile) {
      return { success: false, error: "Failed to load achievements" };
    }

    return {
      success: true,
      profile: gamificationProfile,
    };
  } catch (err: any) {
    console.error("[getUserAchievementsAction] Error:", err.message);
    return { success: false, error: "An unexpected error occurred" };
  }
}
