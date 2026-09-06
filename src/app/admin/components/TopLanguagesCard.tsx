"use client";

import React from "react";
import type { AdminUserData } from "../page";

interface TopLanguagesCardProps {
  users?: AdminUserData[];
}

export default function TopLanguagesCard({ users }: TopLanguagesCardProps) {
  // If users array is passed, compute real counts
  const targetCounts: Record<string, number> = {
    English: 0,
    French: 0,
    Spanish: 0,
    German: 0,
    Arabic: 0,
    Hindi: 0,
  };

  if (users && users.length > 0) {
    users.forEach((u) => {
      const lang = u.targetLanguage || "English";
      if (targetCounts[lang] !== undefined) {
        targetCounts[lang] += 1;
      } else {
        targetCounts["English"] += 1;
      }
    });
  }

  const totalUsersWithLang = users && users.length > 0 ? users.length : 1;

  const languages = [
    {
      name: "English",
      flag: "🇬🇧",
      count: targetCounts["English"],
      pct: Math.round((targetCounts["English"] / totalUsersWithLang) * 100),
    },
    {
      name: "French",
      flag: "🇫🇷",
      count: targetCounts["French"],
      pct: Math.round((targetCounts["French"] / totalUsersWithLang) * 100),
    },
    {
      name: "Spanish",
      flag: "🇪🇸",
      count: targetCounts["Spanish"],
      pct: Math.round((targetCounts["Spanish"] / totalUsersWithLang) * 100),
    },
    {
      name: "German",
      flag: "🇩🇪",
      count: targetCounts["German"],
      pct: Math.round((targetCounts["German"] / totalUsersWithLang) * 100),
    },
    {
      name: "Arabic",
      flag: "🇸🇦",
      count: targetCounts["Arabic"],
      pct: Math.round((targetCounts["Arabic"] / totalUsersWithLang) * 100),
    },
    {
      name: "Hindi",
      flag: "🇮🇳",
      count: targetCounts["Hindi"],
      pct: Math.round((targetCounts["Hindi"] / totalUsersWithLang) * 100),
    },
  ];

  return (
    <div className="flex flex-col h-full p-5 rounded-2xl bg-[#0F1424] border border-[#1B2238]">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-white tracking-tight">Top Learning Languages</h2>
        <p className="text-[11px] text-slate-400">Most popular target languages</p>
      </div>

      {/* Language List */}
      <div className="space-y-3 my-auto">
        {languages.map((l, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 w-24 flex-shrink-0">
              <span className="text-base">{l.flag}</span>
              <span className="text-xs font-medium text-slate-200">{l.name}</span>
            </div>

            {/* Blue Rounded Bar */}
            <div className="flex-1 h-2 rounded-full bg-[#161C33] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#3B82F6] transition-all duration-500"
                style={{ width: `${l.pct}%` }}
              />
            </div>

            {/* Count */}
            <span className="text-xs font-bold text-slate-300 w-9 text-right flex-shrink-0">
              {l.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
