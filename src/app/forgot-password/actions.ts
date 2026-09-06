"use server";

import { db } from "../../prisma/db";
import { generateResetToken, hashResetToken } from "../../lib/auth";
import { sendPasswordResetEmail } from "../../lib/email";

// In-memory rate limiting store: email -> timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 3;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(key, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(key, validTimestamps);
  return false;
}

// Function to reset rate limit for testing purposes
export async function resetRateLimitForTesting(key: string) {
  rateLimitMap.delete(key);
}

export async function requestPasswordResetAction(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Enforce rate limiting per email address
  if (isRateLimited(normalizedEmail)) {
    return {
      success: false,
      error: "Too many password reset requests. Please wait 15 minutes before trying again.",
    };
  }

  const genericSuccessMessage =
    "If an account exists with that email address, you will receive password reset instructions shortly.";

  try {
    const user = await db.orm.public.User.where({ email: normalizedEmail }).first();

    // Security: Do not reveal if the email exists in the database
    if (!user) {
      return { success: true, message: genericSuccessMessage };
    }

    // Invalidate any previously active unused tokens for this user
    try {
      const activeTokens = await db.orm.public.PasswordResetToken.where({
        userId: user.id,
        used: false,
      }).all();

      for (const t of activeTokens) {
        await db.orm.public.PasswordResetToken.where({ id: t.id }).update({
          used: true,
        });
      }
    } catch (invalErr: any) {
      console.error("Token cleanup notice:", invalErr?.message);
    }

    // Generate cryptographically random token (32 bytes = 64 hex chars)
    const rawToken = generateResetToken();
    // Compute SHA-256 hash to store in the database
    const tokenHash = hashResetToken(rawToken);

    // 1-hour expiration timestamp
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await db.orm.public.PasswordResetToken.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      used: false,
    });

    // Determine application base URL
    const baseUrl =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${rawToken}`;

    // Send email via server-side provider
    await sendPasswordResetEmail({
      toEmail: user.email,
      resetUrl,
    });

    return {
      success: true,
      message: genericSuccessMessage,
    };
  } catch (err: any) {
    console.error("Forgot password request error:", err?.message || "Unknown error");
    return {
      success: false,
      error: "Unable to process request right now. Please try again later.",
    };
  }
}
