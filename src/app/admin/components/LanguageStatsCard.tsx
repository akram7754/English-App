"use client";

import React from "react";
import { SUPPORTED_LANGUAGES } from "../../../lib/languages";

interface LanguageStatsCardProps {
  users: { nativeLanguage?: string | null; targetLanguage?: string | null }[];
}

export default function LanguageStatsCard({ users }: LanguageStatsCardProps) {
  // Count how many users target each language
  const counts: Record<string, number> = {};
  users.forEach((u) => {
    const lang = u.targetLanguage || "English";
    counts[lang] = (counts[lang] || 0) + 1;
  });

  const totalUsers = users.length || 1;

  return (
    <div className="flex flex-col h-full p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800/80 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Multilingual Matrix</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              6 Active
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Target language enrollment across students
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-auto">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const userCount = counts[lang.name] || (lang.code === "en-US" ? users.length : 0);
          const pct = Math.round((userCount / totalUsers) * 100);

          return (
            <div
              key={lang.code}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    {lang.flag}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">
                      {lang.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {lang.nativeName} ({lang.code})
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-300">
                  {userCount} student{userCount === 1 ? "" : "s"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${Math.max(12, pct)}%` }}
                />
              </div>

              {/* Capability badges */}
              <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-400">
                <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-slate-700/50">
                  STT Voice
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-purple-300 border border-slate-700/50">
                  TTS Audio
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-emerald-300 border border-slate-700/50">
                  AI Context
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
