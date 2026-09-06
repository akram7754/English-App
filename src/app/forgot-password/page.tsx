"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "./actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await requestPasswordResetAction(email);
      if (res.success) {
        setSuccessMsg(
          res.message ||
            "If an account exists with that email address, you will receive password reset instructions shortly."
        );
      } else {
        setErrorMsg(res.error || "Failed to process request");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 dark:bg-zinc-950 relative overflow-hidden">
      {/* BACKGROUND VECTOR DECORATIONS */}
      <div
        className="absolute top-[10%] right-[10%] md:right-[15%] hidden sm:flex flex-col items-center select-none animate-bounce"
        style={{ animationDuration: "6s" }}
      >
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center font-extrabold text-white text-xl shadow-xl shadow-blue-500/20 border border-white/20 relative">
          AI
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500"></span>
          </span>
        </div>
        <span className="absolute -top-6 -left-6 text-zinc-400/60 dark:text-zinc-600/40 text-xl font-bold font-sans">
          E
        </span>
        <span className="absolute -bottom-6 -left-8 text-zinc-400/60 dark:text-zinc-600/40 text-2xl font-black font-sans">
          D
        </span>
      </div>

      <div className="absolute top-[20%] left-[8%] hidden lg:block text-zinc-300/40 dark:text-zinc-800/40 text-6xl font-black select-none">
        A
      </div>
      <div className="absolute bottom-[35%] right-[15%] hidden md:block text-zinc-300/30 dark:text-zinc-800/30 text-7xl font-bold select-none">
        B
      </div>

      {/* CONTAINER CARD */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200/80 shadow-2xl p-8 dark:bg-zinc-900 dark:border-zinc-800 relative z-10">
        {/* LOGO & BRANDING */}
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

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Reset Your Password
          </h2>
          <p className="text-sm text-zinc-500 mt-2 dark:text-zinc-400 px-2 leading-relaxed">
            Enter your registered email address and we will send you instructions to reset your password.
          </p>

          {errorMsg && (
            <div className="mt-4 p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold w-full border border-red-200 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-400 flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-medium w-full border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300 flex items-start gap-2.5 text-left">
              <svg className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="space-y-1">
                <p className="font-bold text-emerald-900 dark:text-emerald-200">Check your inbox</p>
                <p>{successMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* REQUEST FORM OR SUCCESS STATE */}
        {successMsg ? (
          <div className="space-y-4 pt-2">
            <Link
              href="/login"
              className="w-full bg-[#2E3A8C] hover:bg-[#1E296C] text-white font-bold py-3.5 rounded-full text-sm transition focus:outline-none shadow-lg shadow-indigo-900/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              Back to Sign In
            </Link>
            <button
              type="button"
              onClick={() => {
                setSuccessMsg("");
                setEmail("");
              }}
              className="w-full text-center text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 py-2"
            >
              Send another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-[#2E3A8C] focus:ring-1 focus:ring-[#2E3A8C] transition dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 disabled:opacity-60"
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#2E3A8C] hover:bg-[#1E296C] text-white font-bold py-3.5 rounded-full text-sm transition focus:outline-none shadow-lg shadow-indigo-900/10 flex items-center justify-center gap-2 ${
                isLoading ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Sending request...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
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
    </div>
  );
}
