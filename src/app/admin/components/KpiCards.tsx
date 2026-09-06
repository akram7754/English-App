"use client";

import React from "react";

import { SUPPORTED_LANGUAGES } from "../../../lib/languages";

interface KpiCardsProps {
  totalUsers?: number;
  totalStudents?: number;
  totalLessons?: number;
  totalAttempts?: number;
  averageScore?: number;
}

export default function KpiCards({
  totalUsers = 0,
  totalStudents = 0,
  totalLessons = 0,
  totalAttempts = 0,
  averageScore = 0,
}: KpiCardsProps) {
  // Format numbers with commas e.g. 1,248 or 6
  const formatNum = (n: number) => n.toLocaleString();

  const cards = [
    {
      title: "Total Users",
      value: formatNum(totalUsers),
      trend: "↑ +12%",
      trendColor: "text-emerald-400",
      iconBg: "bg-blue-500/15 text-blue-400",
      strokeColor: "#38BDF8",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      wavePath: "M0 25 C15 30, 25 15, 45 22 C65 28, 75 10, 95 18",
    },
    {
      title: "Active Users",
      value: formatNum(totalStudents),
      trend: "↑ +18%",
      trendColor: "text-emerald-400",
      iconBg: "bg-teal-500/15 text-teal-400",
      strokeColor: "#2DD4BF",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 17v-1.5a3.5 3.5 0 00-3.5-3.5h-1a3.5 3.5 0 00-3.5 3.5V17h8z" />
        </svg>
      ),
      wavePath: "M0 28 C20 18, 35 32, 55 16 C70 6, 80 22, 95 12",
    },
    {
      title: "Total Lessons",
      value: formatNum(totalLessons),
      trend: "↑ +4%",
      trendColor: "text-purple-400",
      iconBg: "bg-purple-500/15 text-purple-400",
      strokeColor: "#C084FC",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      ),
      wavePath: "M0 24 C20 32, 35 12, 55 24 C75 32, 85 14, 95 20",
    },
    {
      title: "Speaking Attempts",
      value: formatNum(totalAttempts),
      trend: "↑ +23%",
      trendColor: "text-amber-400",
      iconBg: "bg-amber-500/15 text-amber-400",
      strokeColor: "#FBBF24",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
        </svg>
      ),
      wavePath: "M0 28 C20 28, 30 10, 50 18 C70 26, 80 10, 95 14",
    },
    {
      title: "Avg. Speaking Score",
      value: `${averageScore}%`,
      trend: "↑ +5%",
      trendColor: "text-pink-400",
      iconBg: "bg-pink-500/15 text-pink-400",
      strokeColor: "#F472B6",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ),
      wavePath: "M0 26 C15 32, 35 16, 55 24 C75 32, 85 12, 95 18",
    },
    {
      title: "Languages",
      value: String(SUPPORTED_LANGUAGES.length),
      subtitle: SUPPORTED_LANGUAGES.map((l) => l.code.toUpperCase()).join(", "),
      iconBg: "bg-blue-500/15 text-blue-400",
      strokeColor: "#60A5FA",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v.183a2 2 0 00.183.817H13a2 2 0 00-2 2v.183A5.992 5.992 0 0110 16c-.34 0-.67-.028-.99-.083V15a2 2 0 00-2-2H6a2 2 0 00-2 2v.083A5.97 5.97 0 014 10c0-.686.115-1.346.332-1.973z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl bg-[#0F1424] border border-[#1B2238] p-4 flex flex-col justify-between hover:border-[#2E3A5E] transition-all group"
        >
          {/* Top Row: Icon + Title */}
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
              {c.icon}
            </div>
            <span className="text-xs font-semibold text-slate-400 truncate">
              {c.title}
            </span>
          </div>

          {/* Middle: Big Value */}
          <div className="text-2xl font-black text-white tracking-tight my-1">
            {c.value}
          </div>

          {/* Bottom Row: Trend / Subtitle + Sparkline */}
          <div className="flex items-center justify-between text-xs mt-1">
            {c.trend ? (
              <span className={`font-bold ${c.trendColor}`}>{c.trend}</span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium truncate">
                {c.subtitle}
              </span>
            )}

            {/* Mini wavy sparkline if present */}
            {c.wavePath && (
              <div className="w-16 h-7 flex items-center">
                <svg viewBox="0 0 100 35" className="w-full h-full overflow-visible">
                  <path
                    d={c.wavePath}
                    fill="none"
                    stroke={c.strokeColor}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
