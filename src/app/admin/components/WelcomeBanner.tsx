"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface WelcomeBannerProps {
  adminName?: string;
}

export default function WelcomeBanner({}: WelcomeBannerProps) {
  const [dateString, setDateString] = useState("Sunday, August 29, 2026");

  useEffect(() => {
    const now = new Date();
    setDateString(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0C1024] via-[#101633] to-[#0A0D1D] border border-[#1E274A] px-5 py-4 sm:px-8 sm:py-5 shadow-2xl">
      {/* Background ambient glow stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-3 right-1/4 text-purple-400 text-xs opacity-60">✦</div>
        <div className="absolute bottom-3 left-1/2 text-cyan-400 text-xs opacity-50">✨</div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Greeting */}
        <div className="max-w-sm">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Welcome Back, Admin!</span>
            <span className="text-xl sm:text-2xl lg:text-3xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
            Here's an overview of your platform's performance.
          </p>
        </div>

        {/* Center: Exact Robot Mascot & Speech Bubble from Approved Concept */}
        <div className="flex items-center justify-center relative my-1 md:my-0">
          <div className="relative w-[210px] sm:w-[240px] h-[65px] sm:h-[75px]">
            <Image
              src="/banner_center_mascot.png"
              alt="LingoAI Robot Mascot - Education for a better tomorrow!"
              fill
              className="object-contain object-center"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Right: Date Card */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-[#12182E]/90 border border-[#212A4D] shadow-xl flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#1A2342] flex items-center justify-center text-blue-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">
              Sunday, August 29, 2026
            </p>
            <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
              Keep building a smarter world
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
