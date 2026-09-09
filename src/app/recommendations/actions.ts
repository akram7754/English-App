"use server";

import { cookies } from "next/headers";
import { verifySession } from "../../lib/auth";
import { getPersonalizedRecommendations, PersonalizedRecommendationsData } from "./data";

export async function getRecommendationsAction(): Promise<{
  success: boolean;
  data?: PersonalizedRecommendationsData;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user")?.value;
    const sessionUser = userCookie ? verifySession(userCookie) : null;

    if (!sessionUser?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const data = await getPersonalizedRecommendations(sessionUser.email);
    if (!data) {
      return { success: false, error: "User not found or query error" };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to get recommendations action:", error);
    return { success: false, error: error?.message || "Internal server error" };
  }
}
