import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "../../lib/auth";
import { getPersonalizedRecommendations } from "./data";
import RecommendationsClient from "./RecommendationsClient";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const sessionUser = userCookie ? verifySession(userCookie) : null;

  if (!sessionUser) {
    redirect("/login");
  }

  const data = await getPersonalizedRecommendations(sessionUser.email);
  if (!data) {
    redirect("/login");
  }

  return <RecommendationsClient initialData={data} />;
}
