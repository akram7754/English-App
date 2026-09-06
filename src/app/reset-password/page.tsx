"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyResetTokenAction, resetPasswordAction } from "./actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenError, setTokenError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function verify() {
      if (!token) {
        if (isMounted) {
          setTokenError("Missing password reset token. Please use the link provided in your email.");
          setIsVerifying(false);
        }
        return;
      }

      const res = await verifyResetTokenAction(token);
      if (isMounted) {
        if (!res.valid) {
          setTokenError(res.error || "This password reset link is invalid or has expired.");
        }
        setIsVerifying(false);
      }
    }

    verify();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPasswordAction(token, newPassword);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(res.error || "Failed to reset password.");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200/80 shadow-2xl p-8 dark:bg-zinc-900 dark:border-zinc-800 relative z-10">
      {/* BRANDING */}
      <div className="flex flex-col items-center text-center mb-6">
        <Link href="/login" className="flex items-center gap-2 mb-4 hover:opacity-90 transition">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <svg
              className="w-full h-full text-[#2E3A8C]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5" />
            </svg>
            <svg
              className="w-4 h-4 text-amber-400 absolute top-0.5 right-0.5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
          <span className="text-3xl font-extrabold text-zinc-900 tracking-tight dark:text-zinc-50">
            Lingo<span className="text-[#2E3A8C]">AI</span>
          </span>
        </Link>

        {isSuccess ? (
          <>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 dark:bg-emerald-950 dark:text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Password Reset Complete!
            </h2>
            <p className="text-sm text-zinc-500 mt-2 dark:text-zinc-400 leading-relaxed">
              Your password has been successfully updated. You can now log in with your new credentials.
            </p>
          </>
        ) : tokenError ? (
          <>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3 dark:bg-red-950 dark:text-red-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Link Expired or Invalid
            </h2>
            <p className="text-sm text-zinc-500 mt-2 dark:text-zinc-400 leading-relaxed">
              {tokenError}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Set New Password
            </h2>
            <p className="text-sm text-zinc-500 mt-2 dark:text-zinc-400 leading-relaxed">
              Please enter and confirm your new password below.
            </p>
          </>
        )}

        {errorMsg && (
          <div className="mt-4 p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold w-full border border-red-200 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-400 flex items-start gap-2 text-left">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* STATE 1: INITIAL VERIFICATION */}
      {isVerifying ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <svg className="animate-spin h-8 w-8 text-[#2E3A8C]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xs font-semibold text-zinc-500">Verifying reset token...</span>
        </div>
      ) : isSuccess ? (
        /* STATE 2: SUCCESS */
        <div className="space-y-4 pt-2">
          <Link
            href="/login"
            className="w-full bg-[#2E3A8C] hover:bg-[#1E296C] text-white font-bold py-3.5 rounded-full text-sm transition focus:outline-none shadow-lg shadow-indigo-900/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            Back to Sign In
          </Link>
        </div>
      ) : tokenError ? (
        /* STATE 3: INVALID/EXPIRED TOKEN */
        <div className="space-y-4 pt-2">
          <Link
            href="/forgot-password"
            className="w-full bg-[#2E3A8C] hover:bg-[#1E296C] text-white font-bold py-3.5 rounded-full text-sm transition focus:outline-none shadow-lg shadow-indigo-900/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            Request New Reset Link
          </Link>
          <div className="text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        /* STATE 4: RESET PASSWORD FORM */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password (min. 6 chars)"
              disabled={isSubmitting}
              className="w-full pl-12 pr-32 py-3.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-[#2E3A8C] focus:ring-1 focus:ring-[#2E3A8C] transition dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 disabled:opacity-60"
            />
            <svg
              className="w-5 h-5 text-zinc-400 absolute left-4 top-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-zinc-400 hover:text-zinc-600 focus:outline-none flex items-center gap-1 py-0.5"
            >
              <span className="text-[11px] font-semibold select-none">
                {showPassword ? "Hide" : "Show"}
              </span>
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              disabled={isSubmitting}
              className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-[#2E3A8C] focus:ring-1 focus:ring-[#2E3A8C] transition dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 disabled:opacity-60"
            />
            <svg
              className="w-5 h-5 text-zinc-400 absolute left-4 top-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#2E3A8C] hover:bg-[#1E296C] text-white font-bold py-3.5 rounded-full text-sm transition focus:outline-none shadow-lg shadow-indigo-900/10 flex items-center justify-center gap-2 ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </button>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#2E3A8C] hover:underline dark:text-indigo-400 inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 dark:bg-zinc-950 relative overflow-hidden">
      {/* BACKGROUND VECTOR DECORATIONS */}
      <div
        className="absolute top-[10%] right-[10%] md:right-[15%] hidden sm:flex flex-col items-center select-none animate-bounce"
        style={{ animationDuration: "6s" }}
      >
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center font-extrabold text-white text-xl shadow-xl shadow-blue-500/20 border border-white/20 relative">
          AI
        </div>
      </div>

      <div className="absolute top-[20%] left-[8%] hidden lg:block text-zinc-300/40 dark:text-zinc-800/40 text-6xl font-black select-none">
        A
      </div>
      <div className="absolute bottom-[35%] right-[15%] hidden md:block text-zinc-300/30 dark:text-zinc-800/30 text-7xl font-bold select-none">
        B
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200/80 shadow-2xl p-8 dark:bg-zinc-900 dark:border-zinc-800 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-zinc-200 rounded w-1/2 mx-auto dark:bg-zinc-700"></div>
              <div className="h-4 bg-zinc-100 rounded w-3/4 mx-auto dark:bg-zinc-800"></div>
            </div>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
