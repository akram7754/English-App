import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "../../lib/auth";
import VoiceConversationClient from "./VoiceConversationClient";

export const dynamic = "force-dynamic";

export default async function VoiceConversationPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const user = userCookie ? verifySession(userCookie) : null;

  if (!user) {
    redirect("/login");
  }

  return <VoiceConversationClient />;
}
