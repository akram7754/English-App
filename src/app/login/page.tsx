"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions";
import ThemeSwitcher from "../components/ThemeSwitcher";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleNotice, setGoogleNotice] = useState("");
  const [selectedLang, setSelectedLang] = useState("English");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setGoogleNotice("");
    setIsLoading(true);
    try {
      const res = await loginAction(email, password);
      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Login failed. Please check your credentials.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setGoogleNotice("Google sign-in is coming soon! Please sign in with your email and password.");
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#070914] text-white relative flex flex-col justify-between overflow-x-hidden font-sans select-none">
      
      {/* ========================================================================= */}
      {/* COSMIC NEBULA & AMBIENT BACKGROUND GLOWS                                  */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-left Indigo Nebula */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[130px]" />
        {/* Center-right Violet Nebula */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px]" />
        {/* Top-right Cyan Aura */}
        <div className="absolute top-10 -right-20 w-[450px] h-[450px] bg-cyan-600/12 rounded-full blur-[120px]" />
        {/* Bottom Ambient */}
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[500px] bg-blue-600/12 rounded-full blur-[130px]" />

        {/* Wavy Neon Audio Ribbon Lines across lower background */}
        <svg className="absolute bottom-6 left-0 w-full h-44 opacity-30 pointer-events-none" viewBox="0 0 1440 200" fill="none">
          <path d="M0 120 C 300 40, 600 190, 900 80 C 1200 -20, 1350 160, 1440 100" stroke="url(#waveGrad1)" strokeWidth="1.5" />
          <path d="M0 140 C 250 60, 550 200, 850 100 C 1150 0, 1380 170, 1440 120" stroke="url(#waveGrad2)" strokeWidth="1.2" strokeDasharray="4 4" />
          <path d="M0 160 C 350 90, 650 180, 950 110 C 1250 40, 1400 150, 1440 130" stroke="url(#waveGrad1)" strokeWidth="1" />
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Starlight Particles */}
        <div className="absolute top-[12%] left-[18%] w-1 h-1 bg-white/70 rounded-full blur-[0.5px] animate-pulse" />
        <div className="absolute top-[25%] left-[8%] w-1.5 h-1.5 bg-indigo-300/80 rounded-full blur-[0.5px]" />
        <div className="absolute top-[10%] right-[30%] w-1 h-1 bg-purple-300/60 rounded-full blur-[0.5px]" />
        <div className="absolute top-[35%] right-[6%] w-1.5 h-1.5 bg-cyan-300/70 rounded-full blur-[0.5px] animate-pulse" />
        <div className="absolute bottom-[28%] left-[24%] w-1 h-1 bg-white/50 rounded-full blur-[0.5px]" />
        <div className="absolute bottom-[22%] right-[18%] w-1.5 h-1.5 bg-indigo-300/80 rounded-full blur-[0.5px]" />
      </div>

      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR: BRAND LOGO + LANGUAGE & THEME TOGGLES                */}
      {/* ========================================================================= */}
      <header className="relative z-30 w-full px-6 sm:px-10 lg:px-12 pt-4 pb-1 flex items-center justify-between shrink-0">
        {/* Left: Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6366f1] via-[#7c3aed] to-[#8b5cf6] p-[1px] shadow-lg shadow-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0d1026]/90 rounded-[15px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-400/30 rounded-full blur-md" />
              <svg className="w-5 h-5 text-indigo-300" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.8214 3.54133 15.5164 4.47407 16.9312L3.25 21L7.54583 19.9882C8.91307 20.6385 10.4191 21 12 21Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M12 7.5V14.5M8.5 11H15.5" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="11" r="1.5" fill="#FBBF24" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center">
              Lingo<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">AI</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-indigo-200/60 tracking-wider -mt-0.5">
              Speak. Learn. Grow.
            </span>
          </div>
        </Link>

        {/* Right: Language Selector & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121630]/80 hover:bg-[#191f42] border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition backdrop-blur-md cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="1.8" />
              </svg>
              <span>{selectedLang}</span>
              <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 py-1 bg-[#10142b] border border-white/10 rounded-xl shadow-2xl z-50 backdrop-blur-xl">
                {["English", "Español", "Français", "Deutsch", "हिंदी", "العربية"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLang(lang);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs transition ${
                      selectedLang === lang ? "text-indigo-400 font-bold bg-indigo-950/40" : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Global Theme Toggle */}
          <ThemeSwitcher className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#121630]/80 hover:bg-[#191f42] border-white/10 text-zinc-300 hover:text-white backdrop-blur-md" />
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN 3-COLUMN DASHBOARD (Proportioned, cohesive, centered together)        */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full max-w-[1240px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 xl:px-8 py-2 xl:py-3 flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 xl:gap-8 my-auto">

        {/* ----------------------------------------------------------------------- */}
        {/* COLUMN 1: LEFT HERO HEADLINE + 4 FEATURE TILES + TESTIMONIAL           */}
        {/* ----------------------------------------------------------------------- */}
        <div className="hidden lg:flex flex-col justify-center items-start w-[340px] xl:w-[370px] shrink-0">
          
          {/* Main Headline */}
          <h1 className="text-3xl xl:text-[38px] font-black tracking-tight text-white leading-[1.12]">
            Master English
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 mt-0.5">
              with the power of AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs xl:text-sm text-zinc-400 mt-2 mb-4 xl:mb-5 leading-relaxed max-w-sm">
            Practice speaking, get instant feedback and achieve fluency faster than ever.
          </p>

          {/* 4 Feature Items with Exact HD Circular Badges */}
          <div className="space-y-3.5 w-full">
            {/* 1. Smart Voice Practice */}
            <div className="flex items-center gap-3.5 group cursor-default">
              <Image
                src="/images/icon_voice_hd.png"
                alt="Smart Voice Practice"
                width={44}
                height={44}
                className="w-10 h-10 xl:w-11 xl:h-11 rounded-full shadow-lg shadow-purple-950/50 shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-xs xl:text-sm font-bold text-white">Smart Voice Practice</span>
                <span className="text-[11px] xl:text-xs text-zinc-400">Speak naturally &amp; build confidence</span>
              </div>
            </div>

            {/* 2. AI Tutor */}
            <div className="flex items-center gap-3.5 group cursor-default">
              <Image
                src="/images/icon_tutor_hd.png"
                alt="AI Tutor"
                width={44}
                height={44}
                className="w-10 h-10 xl:w-11 xl:h-11 rounded-full shadow-lg shadow-blue-950/50 shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-xs xl:text-sm font-bold text-white">AI Tutor</span>
                <span className="text-[11px] xl:text-xs text-zinc-400">Get real-time feedback &amp; corrections</span>
              </div>
            </div>

            {/* 3. Personalized Learning */}
            <div className="flex items-center gap-3.5 group cursor-default">
              <Image
                src="/images/icon_learning_hd.png"
                alt="Personalized Learning"
                width={44}
                height={44}
                className="w-10 h-10 xl:w-11 xl:h-11 rounded-full shadow-lg shadow-purple-950/50 shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-xs xl:text-sm font-bold text-white">Personalized Learning</span>
                <span className="text-[11px] xl:text-xs text-zinc-400">Lessons tailored to your goals</span>
              </div>
            </div>

            {/* 4. Track Progress */}
            <div className="flex items-center gap-3.5 group cursor-default">
              <Image
                src="/images/icon_track_hd.png"
                alt="Track Progress"
                width={44}
                height={44}
                className="w-10 h-10 xl:w-11 xl:h-11 rounded-full shadow-lg shadow-emerald-950/50 shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-xs xl:text-sm font-bold text-white">Track Progress</span>
                <span className="text-[11px] xl:text-xs text-zinc-400">See your improvement every day</span>
              </div>
            </div>
          </div>

          {/* Social Proof / Testimonial Glass Card */}
          <div className="w-full mt-4 xl:mt-5 rounded-2xl bg-[#0f132b]/85 backdrop-blur-xl border border-white/10 p-3.5 xl:p-4 shadow-xl">
            {/* 5 Stars */}
            <div className="flex items-center gap-1 text-amber-400 text-xs xl:text-sm mb-1.5">
              {"★★★★★".split("").map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>

            {/* Testimonial Quote */}
            <p className="text-xs xl:text-sm text-zinc-300 leading-relaxed italic mb-2.5">
              &ldquo;LingoAI helped me transform my speaking skills in just a few weeks!&rdquo;
            </p>

            {/* Overlapping Genuine Learner Photo Avatars + Happy Learners */}
            <div className="flex items-center">
              <Image
                src="/images/learner_avatars_hd.png"
                alt="Learner Avatars"
                width={105}
                height={35}
                className="object-contain shrink-0"
              />
              <span className="text-xs xl:text-sm font-semibold text-zinc-300 ml-2.5">
                50K+ Happy Learners
              </span>
            </div>
          </div>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* COLUMN 2: CENTER / MAIN GLASSMORPHIC SIGN-IN CARD                       */}
        {/* ----------------------------------------------------------------------- */}
        <div className="w-full max-w-[390px] xl:max-w-[420px] relative shrink-0">
          
          {/* Subtle multi-color neon edge glow */}
          <div className="absolute -inset-[1.5px] rounded-[32px] bg-gradient-to-b from-purple-500/40 via-indigo-500/30 to-blue-600/40 -z-10 blur-[1px]" />
          
          {/* Main Frosted Glass Card Container */}
          <div className="rounded-[30px] bg-[#0d1028]/95 backdrop-blur-2xl p-6 sm:p-7 xl:p-8 shadow-2xl border border-white/10 relative z-10 flex flex-col">
            
            {/* Top Large Glowing App Emblem from Reference Mockup */}
            <div className="mx-auto mb-1 flex items-center justify-center">
              <Image
                src="/images/center_emblem_hd.png"
                alt="LingoAI Emblem"
                width={84}
                height={84}
                priority
                className="object-contain drop-shadow-[0_0_22px_rgba(99,102,241,0.55)] hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Header: Welcome back! 👋 */}
            <div className="text-center mb-4">
              <h2 className="text-2xl xl:text-[26px] font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
                Welcome back! <span>👋</span>
              </h2>
              <p className="text-xs xl:text-sm text-zinc-400 mt-1 leading-relaxed">
                Sign in to continue your learning journey
              </p>
            </div>

            {/* Error Message Display */}
            {errorMsg && (
              <div className="mb-3 p-3 bg-red-950/60 border border-red-500/40 text-red-200 rounded-xl text-xs flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google Notice Display */}
            {googleNotice && (
              <div className="mb-3 p-3 bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 rounded-xl text-xs flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{googleNotice}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Email Address Input */}
              <div className="relative">
                <div className="w-full bg-[#151934]/90 border border-white/10 rounded-2xl flex items-center px-4 py-3 xl:py-3.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                  <svg className="w-5 h-5 text-zinc-400 shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-transparent text-white placeholder-zinc-500 text-sm xl:text-base focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="w-full bg-[#151934]/90 border border-white/10 rounded-2xl flex items-center px-4 py-3 xl:py-3.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                  <svg className="w-5 h-5 text-zinc-400 shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-transparent text-white placeholder-zinc-500 text-sm xl:text-base focus:outline-none"
                  />
                  {/* Eye Icon Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 text-zinc-400 hover:text-zinc-200 transition focus:outline-none ml-2 cursor-pointer p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end pr-1 pt-0.5">
                  <Link
                    href="/forgot-password"
                    className="text-xs xl:text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Sign In Button with Gradient & Arrow */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 xl:py-4 rounded-2xl font-bold text-sm xl:text-base text-white bg-gradient-to-r from-[#8b5cf6] via-[#6366f1] to-[#3b82f6] hover:from-[#7c3aed] hover:via-[#4f46e5] hover:to-[#2563eb] shadow-xl shadow-indigo-600/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Keep Login</span>
                    <span className="text-lg font-normal">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-3 flex items-center">
              <div className="flex-1 border-t border-white/10" />
              <span className="px-3 text-xs text-zinc-500 font-medium">or</span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            {/* Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full py-3 px-4 rounded-2xl bg-[#151934]/85 hover:bg-[#1c2246] border border-white/10 text-white text-xs xl:text-sm font-semibold flex items-center justify-center gap-3 transition active:scale-[0.99] shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Sign Up Transition Link */}
            <div className="text-center text-xs xl:text-sm text-zinc-400 mt-3.5">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition ml-1"
              >
                Sign Up
              </Link>
            </div>

          </div>

          {/* Security Guarantee Footnote below card */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-400/80 text-center">
            <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Your data is safe and secure with enterprise-grade encryption</span>
          </div>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* COLUMN 3: RIGHT COLUMN — ROBOT TUTOR + DAILY GOAL + YOUR PROGRESS      */}
        {/* ----------------------------------------------------------------------- */}
        <div className="hidden lg:flex flex-col items-end justify-center w-[340px] xl:w-[370px] shrink-0 space-y-3 xl:space-y-4">
          
          {/* Top Robot + Speech Bubble (Exact 3D Composition from Reference Mockup) */}
          <div className="w-full relative flex items-center justify-end">
            <Image
              src="/images/robot_bubble_clean.png"
              alt="AI Tutor Robot and Speech Bubble"
              width={370}
              height={217}
              priority
              className="w-full max-w-[360px] xl:max-w-[375px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] hover:scale-[1.02] transition-transform duration-300"
              style={{
                maskImage: "linear-gradient(to bottom, black 86%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 86%, transparent 100%)",
              }}
            />
          </div>

          {/* Daily Goal Glassmorphic Card */}
          <div className="w-full rounded-2xl bg-[#0f132b]/85 backdrop-blur-xl border border-white/10 p-3.5 xl:p-4 shadow-xl flex items-center justify-between">
            <div className="flex flex-col flex-1 pr-4">
              <div className="flex items-center gap-1.5 text-xs xl:text-sm text-zinc-300 font-semibold mb-1">
                <span className="text-amber-400">🔥</span>
                <span>Daily Goal</span>
              </div>
              <div className="text-base xl:text-lg font-bold text-white mb-2">
                15 <span className="text-xs xl:text-sm font-normal text-zinc-400">/ 30 min</span>
              </div>
              {/* Progress bar (50% filled with glowing purple-indigo-cyan gradient) */}
              <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              </div>
            </div>

            {/* Exact Bullseye Target with Diagonal Arrow from Reference Mockup */}
            <Image
              src="/images/target_bullseye_hd.png"
              alt="Daily Goal Target"
              width={52}
              height={52}
              className="object-contain mix-blend-screen drop-shadow-[0_0_12px_rgba(56,189,248,0.55)] shrink-0"
            />
          </div>

          {/* Your Progress Glassmorphic Card */}
          <div className="w-full rounded-2xl bg-[#0f132b]/85 backdrop-blur-xl border border-white/10 p-3.5 xl:p-4 shadow-xl">
            {/* Header: Your Progress + Level 12 */}
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs xl:text-sm font-semibold text-zinc-300">Your Progress</span>
              <span className="text-xs xl:text-sm font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                Level 12
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Circular Progress Ring (72%) */}
              <div className="relative w-16 h-16 xl:w-18 xl:h-18 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="28" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
                  <circle
                    cx="36"
                    cy="36"
                    r="28"
                    stroke="#06b6d4"
                    strokeWidth="6"
                    strokeDasharray="175.9"
                    strokeDashoffset="49.2"
                    strokeLinecap="round"
                    fill="none"
                    className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                  />
                </svg>
                <span className="absolute text-sm xl:text-base font-extrabold text-white">72%</span>
              </div>

              {/* Right: Great job text + upward trend line chart */}
              <div className="flex flex-col flex-1">
                <span className="text-xs xl:text-sm font-bold text-white">Great job!</span>
                <span className="text-[11px] xl:text-xs text-zinc-400 mb-1.5 leading-tight">
                  You&apos;re improving every day.
                </span>
                {/* Mini Upward Line Chart SVG */}
                <svg className="w-full h-6 xl:h-7" viewBox="0 0 100 30" fill="none">
                  <path
                    d="M 0 25 L 20 20 L 40 22 L 60 12 L 80 16 L 100 4"
                    stroke="#8b5cf6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]"
                  />
                  {/* Glowing Nodes */}
                  <circle cx="20" cy="20" r="2.5" fill="#38bdf8" />
                  <circle cx="60" cy="12" r="2.5" fill="#38bdf8" />
                  <circle cx="100" cy="4" r="3" fill="#8b5cf6" />
                </svg>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* ========================================================================= */}
      {/* BOTTOM FEATURE BAR (Full-width 5-item highlight banner)                  */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full border-t border-white/5 bg-[#070a1a]/80 backdrop-blur-xl py-2.5 px-6 sm:px-12 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400 font-medium">
          
          {/* 1. AI-Powered Conversations */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>AI-Powered Conversations</span>
          </div>

          {/* 2. Real-time Feedback */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Real-time Feedback</span>
          </div>

          {/* 3. Multilingual Support */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>Multilingual Support</span>
          </div>

          {/* 4. Fun & Interactive Lessons */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-pink-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="6" />
              <path d="M6 12h4m-2-2v4m9-3h.01m2 2h.01" />
            </svg>
            <span>Fun &amp; Interactive Lessons</span>
          </div>

          {/* 5. Available on All Devices */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="13" height="14" rx="2" />
              <rect x="17" y="9" width="5" height="9" rx="1" />
            </svg>
            <span>Available on All Devices</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
