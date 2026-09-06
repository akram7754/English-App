"use server";

import { db } from "../../prisma/db";
import { hashPassword, hashResetToken } from "../../lib/auth";

export async function verifyResetTokenAction(rawToken: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  if (!rawToken || typeof rawToken !== "string" || rawToken.length !== 64) {
    return { valid: false, error: "Invalid password reset link." };
  }

  try {
    const tokenHash = hashResetToken(rawToken);
    const tokenRecord = await db.orm.public.PasswordResetToken.where({ tokenHash }).first();

    if (!tokenRecord) {
      return { valid: false, error: "Invalid password reset link." };
    }

    if (tokenRecord.used) {
      return {
        valid: false,
        error: "This password reset link has already been used. Please request a new one.",
      };
    }

    const expiryTime = new Date(tokenRecord.expiresAt).getTime();
    if (isNaN(expiryTime) || expiryTime <= Date.now()) {
      return {
        valid: false,
        error: "This password reset link has expired. Please request a new one.",
      };
    }

    return { valid: true };
  } catch (err: any) {
    console.error("Token verification error:", err?.message || "Unknown error");
    return {
      valid: false,
      error: "Unable to verify password reset token at this time.",
    };
  }
}

export async function resetPasswordAction(
  rawToken: string,
  newPassword: string
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  if (!rawToken || typeof rawToken !== "string" || rawToken.length !== 64) {
    return { success: false, error: "Invalid or malformed reset token." };
  }

  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters long.",
    };
  }

  try {
    const tokenHash = hashResetToken(rawToken);
    const tokenRecord = await db.orm.public.PasswordResetToken.where({ tokenHash }).first();

    if (!tokenRecord) {
      return { success: false, error: "Invalid password reset token." };
    }

    if (tokenRecord.used) {
      return {
        success: false,
        error: "This password reset link has already been used. Please request a new one.",
      };
    }

    const expiryTime = new Date(tokenRecord.expiresAt).getTime();
    if (isNaN(expiryTime) || expiryTime <= Date.now()) {
      return {
        success: false,
        error: "This password reset link has expired. Please request a new one.",
      };
    }

    // Hash the new password securely using bcrypt
    const passwordHash = await hashPassword(newPassword);

    // Update user's password in database
    await db.orm.public.User.where({ id: tokenRecord.userId }).update({
      passwordHash,
    });

    // Mark current token as used
    await db.orm.public.PasswordResetToken.where({ id: tokenRecord.id }).update({
      used: true,
    });

    // Also mark any other remaining tokens for this user as used
    try {
      const remainingTokens = await db.orm.public.PasswordResetToken.where({
        userId: tokenRecord.userId,
        used: false,
      }).all();

      for (const t of remainingTokens) {
        await db.orm.public.PasswordResetToken.where({ id: t.id }).update({
          used: true,
        });
      }
    } catch (cleanErr: any) {
      console.error("Cleanup notice:", cleanErr?.message);
    }

    return {
      success: true,
      message: "Your password has been successfully reset. You can now sign in with your new password.",
    };
  } catch (err: any) {
    console.error("Reset password execution error:", err?.message || "Unknown error");
    return {
      success: false,
      error: "Unable to update password. Please try again later.",
    };
  }
}
