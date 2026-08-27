"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signupAction } from "../login/actions";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }
    const res = await signupAction(username, email, password);
    if (res.success) {
      router.push("/");
      router.refresh();
    } else {
      setErrorMsg(res.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 dark:bg-zinc-950">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200/80 shadow-lg p-8 dark:bg-zinc-900 dark:border-zinc-800">
        
        {/* Logo and Titles */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-xl tracking-wider mb-4 shadow-md">
            AI
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create an Account
          </h1>
          <p className="text-sm text-zinc-500 mt-2 dark:text-zinc-400">
            Start learning English with AI today.
          </p>
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold w-full">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="english_learner"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
              />
              <svg
                className="w-5 h-5 text-zinc-400 absolute left-3.5 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
              />
              <svg
                className="w-5 h-5 text-zinc-400 absolute left-3.5 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
              />
              <svg
                className="w-5 h-5 text-zinc-400 absolute left-3.5 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Confirm Password field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
              />
              <svg
                className="w-5 h-5 text-zinc-400 absolute left-3.5 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              required
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20 border-zinc-300"
            />
            <label htmlFor="terms" className="text-xs text-zinc-500 dark:text-zinc-400">
              I agree to the{" "}
              <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                Privacy Policy
              </a>
              .
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-md mt-4"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-zinc-400 dark:bg-zinc-900">or</span>
          </div>
        </div>

        {/* Transition link */}
        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
