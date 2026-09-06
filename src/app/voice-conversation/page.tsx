import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "../../lib/auth";
import { db } from "../../prisma/db";
import { getPersonalizedLearningProfile } from "../../lib/learning-engine";
import VoiceConversationClient from "./VoiceConversationClient";
import UserPanelShell from "../components/UserPanelShell";

export const dynamic = "force-dynamic";

export default async function VoiceConversationPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;

  if (!sessionUser) {
    redirect("/login");
  }

  // Fetch real authenticated user profile from PostgreSQL
  let user = await db.orm.public.User.where({ email: sessionUser.email }).first();

  if (!user) {
    user = await db.orm.public.User.create({
      email: sessionUser.email,
      name: sessionUser.name,
      username: sessionUser.email.split("@")[0],
    });
  }

  // Fetch Phase 8 personalized learning profile for real stats and weaknesses
  let learningProfile = null;
  try {
    learningProfile = await getPersonalizedLearningProfile(sessionUser.email);
  } catch (e) {
    console.warn("Could not load personalized learning profile for voice page:", e);
  }

  const completedLessons = learningProfile?.completedLessonsCount || 0;
  const learnedVocab = learningProfile?.learnedVocabCount || 0;
  const attempts = learningProfile?.speakingAttemptsCount || 0;
  const computedXP = completedLessons * 50 + learnedVocab * 20 + attempts * 30 + 240;

  interface UserRecordExtended {
    level?: "Beginner" | "Intermediate" | "Advanced";
    nativeLanguage?: string;
    targetLanguage?: string;
  }
  const extUser = user as unknown as UserRecordExtended;

  const userProfile = {
    id: user.id,
    name: user.name || user.username || "Learner",
    email: user.email,
    level: extUser.level || "Beginner",
    nativeLanguage: extUser.nativeLanguage || "Hindi",
    targetLanguage: extUser.targetLanguage || "English",
    streakDays: learningProfile?.streakDays || 1,
    xp: computedXP,
    weaknesses: learningProfile?.detectedWeaknesses?.map((w) => w.title) || [],
  };

  const userInitials = (user.name || user.username || "Learner")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "LE";

  return (
    <UserPanelShell
      activeNav="voice-conversation"
      userName={userProfile.name}
      userEmail={userProfile.email}
      userLevel={userProfile.level}
      userInitials={userInitials}
      isAdmin={user.role === "admin"}
      fullHeightContent={true}
    >
      <VoiceConversationClient initialUserProfile={userProfile} isAdmin={user.role === "admin"} />
    </UserPanelShell>
  );
}
