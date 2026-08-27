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
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("You must agree to the Terms of Service.");
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 dark:bg-zinc-950 relative overflow-hidden">
      
      {/* BACKGROUND VECTOR DECORATIONS (Mockup graphics match) */}
      
      {/* Glowing AI Badge (Top Right) */}
      <div className="absolute top-[10%] right-[10%] md:right-[15%] hidden sm:flex flex-col items-center select-none animate-bounce" style={{ animationDuration: "6s" }}>
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center font-extrabold text-white text-xl shadow-xl shadow-blue-500/20 border border-white/20 relative">
          AI
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500"></span>
          </span>
        </div>
        {/* Floating Letters around AI */}
        <span className="absolute -top-6 -left-6 text-zinc-400/60 dark:text-zinc-600/40 text-xl font-bold font-sans">E</span>
        <span className="absolute -bottom-6 -left-8 text-zinc-400/60 dark:text-zinc-600/40 text-2xl font-black font-sans">D</span>
        <span className="absolute -bottom-8 right-2 text-zinc-400/60 dark:text-zinc-600/40 text-lg font-bold font-sans">A</span>
      </div>

      {/* Floating Letters & bubbles (Background) */}
      <div className="absolute top-[20%] left-[8%] hidden lg:block text-zinc-300/40 dark:text-zinc-800/40 text-6xl font-black select-none">A</div>
      <div className="absolute top-[60%] right-[8%] hidden lg:block text-zinc-300/40 dark:text-zinc-800/40 text-5xl font-black select-none">E</div>
      <div className="absolute bottom-[35%] right-[15%] hidden md:block text-zinc-300/30 dark:text-zinc-800/30 text-7xl font-bold select-none">B</div>

      {/* Student illustration (Bottom Left) */}
      <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 hidden sm:flex flex-col items-center select-none max-w-[160px] text-center">
        <svg className="w-28 h-28 text-indigo-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="#E0E7FF" className="dark:fill-zinc-900" />
          {/* Student body sketch */}
          <path d="M25 85 C25 65, 40 60, 50 60 C60 60, 75 65, 75 85" fill="#312E81" />
          <circle cx="50" cy="38" r="14" fill="#FDBA74" />
          <path d="M38 38 C38 22, 62 22, 62 38" fill="#1E293B" />
          {/* Laptop sketch */}
          <path d="M35 78 H65 L67 83 H33 Z" fill="#64748B" />
          <path d="M37 77 H63 L62 67 H38 Z" fill="#E2E8F0" />
        </svg>
        <span className="text-zinc-400 text-[10px] font-medium mt-1 leading-tight">Interactive Language Lessons</span>
      </div>

      {/* Speech translation bubble (Bottom Left floating) */}
      <div className="absolute bottom-[25%] left-[12%] hidden lg:block bg-indigo-50 p-3 rounded-2xl shadow-md border border-indigo-100 dark:bg-zinc-900 dark:border-zinc-850">
        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </div>

      {/* CONTAINER SIGNUP CARD */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200/80 shadow-2xl p-8 dark:bg-zinc-900 dark:border-zinc-800 relative z-10">
        
        {/* LOGO & APP BRANDING */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              {/* Outer chat bubble path */}
              <svg className="w-full h-full text-[#2E3A8C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5" />
              </svg>
              {/* Overlapping yellow star inside */}
              <svg className="w-4 h-4 text-amber-400 absolute top-0.5 right-0.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
            <span className="text-3xl font-extrabold text-zinc-900 tracking-tight dark:text-zinc-50">
              Lingo<span className="text-[#2E3A8C]">AI</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create an Account
          </h2>
          <p className="text-sm text-zinc-500 mt-1 dark:text-zinc-400">
            Start learning English with AI today.
          </p>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold w-full border border-red-150 animate-shake">
              {errorMsg}
            </div>
          )}
        </div>

        {/* SIGNUP FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Field */}
          <div className="relative">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username / Full Name"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-[#2E3A8C] focus:ring-1 focus:ring-[#2E3A8C] transition dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
            />
            <svg
              className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          {/* Email field */}
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-[#2E3A8C] focus:ring-1 focus:ring-[#2E3A8C] transition dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
            />
            <svg
              className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5"
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

          {/* Password field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              className="w-full pl-12 pr-12 py-3 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-[#2E3A8C] focus:ring-1 focus:ring-[#2E3A8C] transition dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
            />
            <svg
              className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5"
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
              className="absolute right-4 top-3 text-zinc-400 hover:text-zinc-650"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Confirm Password field */}
          <div className="relative">
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:outline-none focus:border-[#2E3A8C] focus:ring-1 focus:ring-[#2E3A8C] transition dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
            />
            <svg
              className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5"
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
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2.5 py-1">
            <input
              type="checkbox"
              id="agree-terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-zinc-300 text-[#2E3A8C] focus:ring-[#2E3A8C] cursor-pointer"
            />
            <label htmlFor="agree-terms" className="text-xs text-zinc-500 leading-normal select-none dark:text-zinc-400">
              I agree to the{" "}
              <a href="#" className="font-semibold text-[#2E3A8C] hover:underline dark:text-indigo-400">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="font-semibold text-[#2E3A8C] hover:underline dark:text-indigo-400">
                Privacy Policy
              </a>.
            </label>
          </div>

          {/* Submit button (Pill-shaped) */}
          <button
            type="submit"
            className="w-full bg-[#2E3A8C] hover:bg-[#1E296C] text-white font-bold py-3.5 rounded-full text-sm transition focus:outline-none shadow-lg shadow-indigo-900/10 cursor-pointer"
          >
            Sign Up
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-zinc-400 dark:bg-zinc-900">or</span>
          </div>
        </div>

        {/* Login transition link */}
        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-extrabold text-[#2E3A8C] hover:underline dark:text-indigo-400"
          >
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
