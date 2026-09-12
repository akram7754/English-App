import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "../../lib/auth";
import { db } from "../../prisma/db";
import UserPanelShell from "../components/UserPanelShell";
import BasicWordsClient from "./BasicWordsClient";
import { getBasicWordsProgressAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function BasicWordsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;

  if (!sessionUser) {
    redirect("/login");
  }

  let user = await db.orm.public.User.where({ email: sessionUser.email }).first();

  if (!user) {
    user = await db.orm.public.User.create({
      email: sessionUser.email,
      name: sessionUser.name,
      username: sessionUser.email.split("@")[0],
    });
  }

  const progressResult = await getBasicWordsProgressAction();
  const stats = progressResult.success ? progressResult.stats : undefined;

  const realUserName = user.name || user.username || sessionUser.name || "Learner";
  const userInitials =
    realUserName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "LE";

  interface UserRecordExtended {
    level?: "Beginner" | "Intermediate" | "Advanced";
    nativeLanguage?: string;
    targetLanguage?: string;
  }
  const extUser = user as unknown as UserRecordExtended;

  return (
    <UserPanelShell
      activeNav="basic-words"
      userName={realUserName}
      userEmail={user.email}
      userLevel={extUser.level || "Beginner"}
      userInitials={userInitials}
      isAdmin={user.role === "admin"}
    >
      <BasicWordsClient initialStats={stats} />
    </UserPanelShell>
  );
}
