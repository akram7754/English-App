import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "../../lib/auth";
import { db } from "../../prisma/db";
import { getPersonalizedLearningProfile } from "../../lib/learning-engine";
import GrammarCorrectionClient from "./GrammarCorrectionClient";

export const dynamic = "force-dynamic";

export default async function GrammarCorrectionPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;

  if (!sessionUser) {
    redirect("/login");
  }

  let userRecord: any = null;
  let isAdmin = false;
  let detectedWeaknesses: string[] = [];
  let userLevel = "Beginner";
  let nativeLanguage = "hi";
  let targetLanguage = "en";

  try {
    userRecord = await db.orm.public.User.where({ email: sessionUser.email }).first();
    if (userRecord) {
      isAdmin = userRecord.role === "admin";
      userLevel = userRecord.level || "Beginner";
      if (userRecord.nativeLanguage) {
        nativeLanguage = userRecord.nativeLanguage.toLowerCase().slice(0, 2);
      }
      if (userRecord.targetLanguage) {
        targetLanguage = userRecord.targetLanguage.toLowerCase().slice(0, 2);
      }
    }
  } catch (err) {
    console.error("Could not fetch user record for grammar page:", err);
  }

  try {
    const profile = await getPersonalizedLearningProfile(sessionUser.email);
    if (profile?.detectedWeaknesses) {
      detectedWeaknesses = profile.detectedWeaknesses.map((w) => w.title);
    }
  } catch (err) {
    console.warn("Could not fetch personalized profile weaknesses:", err);
  }

  const userDisplayName = userRecord?.name || sessionUser.name || "Learner";
  const userInitials = userDisplayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "LE";

  return (
    <GrammarCorrectionClient
      userName={userDisplayName}
      userEmail={sessionUser.email}
      userLevel={userLevel}
      userInitials={userInitials}
      isAdmin={isAdmin}
      detectedWeaknesses={detectedWeaknesses}
      initialNativeLang={nativeLanguage || "hi"}
      initialTargetLang={targetLanguage || "en"}
    />
  );
}
