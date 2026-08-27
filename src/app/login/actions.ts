"use server";

import { db } from "../../prisma/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(email: string) {
  if (!email) {
    return { success: false, error: "Email is required" };
  }

  try {
    let user = await db.orm.public.User.where({ email }).first();

    if (!user) {
      // Automatically register new emails to make login frictionless
      user = await db.orm.public.User.create({
        email,
        username: email.split("@")[0],
        name: email.split("@")[0],
      });
    }

    const cookieStore = await cookies();
    cookieStore.set("user", JSON.stringify({
      email: user.email,
      name: user.name || user.username || "Sarah Jenkins",
    }), {
      path: "/",
      maxAge: 86400, // 1 day
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Database authentication failed" };
  }
}

export async function signupAction(username: string, email: string) {
  if (!username || !email) {
    return { success: false, error: "Username and email are required" };
  }

  try {
    const existing = await db.orm.public.User.where({ email }).first();

    if (existing) {
      return { success: false, error: "Email already registered" };
    }

    const user = await db.orm.public.User.create({
      email,
      username,
      name: username,
    });

    const cookieStore = await cookies();
    cookieStore.set("user", JSON.stringify({
      email: user.email,
      name: user.name || user.username,
    }), {
      path: "/",
      maxAge: 86400, // 1 day
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "Database signup failed" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("user");
  redirect("/login");
}
