import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "../../prisma/db";
import { verifySession } from "../../lib/auth";
import { syncUserAchievements } from "../../lib/achievements";
import AchievementsClient from "./AchievementsClient";

export const metadata = {
  title: "Achievements & Milestones | LingoAI",
  description: "Track your learning achievements, XP, streak milestones, and proficiency badges.",
};

export default async function AchievementsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("user")?.value;
  const session = verifySession(sessionCookie || "");

  if (!session?.email) {
    redirect("/login");
  }

  const user = await db.orm.public.User.where({ email: session.email }).first();
  if (!user) {
    redirect("/login");
  }

  // Sync and evaluate deterministic achievements from PostgreSQL
  const gamificationProfile = await syncUserAchievements(user.id, user.email);

  const userName = user.name || user.username || "Learner";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "L";

  return (
    <AchievementsClient
      userName={userName}
      userEmail={user.email}
      userInitials={userInitials}
      userLevel={user.level || "Beginner"}
      isAdmin={user.role === "admin"}
      gamificationProfile={gamificationProfile!}
    />
  );
}
