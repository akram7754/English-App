"use server";

import { db } from "../../prisma/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword, signSession } from "../../lib/auth";

export async function loginAction(email: string, password?: string) {
  if (!email) {
    return { success: false, error: "Email is required" };
  }
  if (!password) {
    return { success: false, error: "Password is required" };
  }

  try {
    const user = await db.orm.public.User.where({ email }).first();

    if (!user) {
      // Generic error to prevent email enumeration
      return { success: false, error: "Invalid email or password" };
    }

    if (!user.passwordHash) {
      // Legacy user: secure their account on first login
      const hash = await hashPassword(password);
      await db.orm.public.User.where({ id: user.id }).update({
        passwordHash: hash,
      });
    } else {
      // Verify password hash
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return { success: false, error: "Invalid email or password" };
      }
    }

    const cookieStore = await cookies();
    const sessionToken = signSession({
      email: user.email,
      name: user.name || user.username || "Sarah Jenkins",
    });

    cookieStore.set("user", sessionToken, {
      path: "/",
      maxAge: 86400, // 1 day
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Database authentication failed" };
  }
}

export async function signupAction(username: string, email: string, password?: string) {
  if (!username || !email || !password) {
    return { success: false, error: "Username, email, and password are required" };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long" };
  }

  try {
    const existing = await db.orm.public.User.where({ email }).first();

    if (existing) {
      return { success: false, error: "Email already registered" };
    }

    const hash = await hashPassword(password);

    const user = await db.orm.public.User.create({
      email,
      username,
      name: username,
      passwordHash: hash,
    });

    const cookieStore = await cookies();
    const sessionToken = signSession({
      email: user.email,
      name: user.name || user.username,
    });

    cookieStore.set("user", sessionToken, {
      path: "/",
      maxAge: 86400, // 1 day
      httpOnly: true,
      secure: false,
      sameSite: "lax",
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
