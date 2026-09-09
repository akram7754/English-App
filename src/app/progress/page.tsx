import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "../../lib/auth";
import { getComprehensiveProgressData } from "./data";
import ProgressClient from "./ProgressClient";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;

  if (!sessionUser) {
    redirect("/login");
  }

  const data = await getComprehensiveProgressData(sessionUser.email);

  if (!data) {
    redirect("/login");
  }

  return <ProgressClient initialData={data} />;
}
