"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAuthUserRoleAction } from "../login/actions";
import { getSpeakingStatsAction } from "../voice-practice/actions";
import MobileHeader from "../components/MobileHeader";
import UserSidebar from "../components/UserSidebar";
import ThemeSwitcher from "../components/ThemeSwitcher";

interface SpeakingStatsData {
  totalReadings: number;
  avgScore: number | null;
  grammarAvg: number | null;
  fluencyAvg: number | null;
  vocabAvg: number | null;
  pronunciationAvg: number | null;
  speakingStreak: number;
  trend: "improving" | "stable" | "needs-attention" | "insufficient";
  trendLabel: string;
  trendDelta: string;
  levelProficiency: {
    beginner: { count: number; accuracy: number | null };
    intermediate: { count: number; accuracy: number | null };
    advanced: { count: number; accuracy: number | null };
  };
  detectedWeaknesses: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    severity: "High" | "Medium";
    frequency: number;
    advice: string;
    actionHref: string;
    actionLabel: string;
  }>;
  attempts: Array<{
    id: number;
    date: string;
    createdAt: string;
    phrase: string;
    transcript?: string | null;
    difficulty: string;
    score: number;
    status: string;
    scores: {
      overall: number;
      grammar: number;
      fluency: number;
      vocabulary: number;
      pronunciation: number;
    };
  }>;
}

export default function SpeakingScorePage() {
  const [userName, setUserName] = useState("Learner");
  const [userInitials, setUserInitials] = useState("US");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SpeakingStatsData | null>(null);

  useEffect(() => {
    getAuthUserRoleAction().then((res) => {
      setIsAdmin(res.isAdmin);
    });

    try {
      const match = document.cookie.match(/(?:^|;\s*)user=([^;]+)/);
      if (match) {
        const rawToken = decodeURIComponent(match[1]);
        const payloadBase64 = rawToken.split(".")[0];
        const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
        const decodedJSON = decodeURIComponent(escape(atob(normalized)));
        const decoded = JSON.parse(decodedJSON);
        if (decoded?.name) {
          setUserName(decoded.name);
          setUserInitials(
            decoded.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "US"
          );
        }
      }
    } catch (e) {
      console.warn("Client session decode notice:", e);
    }

    getSpeakingStatsAction()
      .then((res) => {
        if (res.success && res.stats) {
          setStats(res.stats as SpeakingStatsData);
        }
      })
      .catch((err) => {
        console.error("Failed to load speaking statistics:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalReadings = stats?.totalReadings || 0;
  const avgScore: number | null = typeof stats?.avgScore === "number" ? stats.avgScore : null;
  const primaryWeakness = stats?.detectedWeaknesses?.[0];

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-50 overflow-hidden">
      {/* 1. Sidebar Navigation (Canonical 11-Item Order Maintained) */}
      <UserSidebar activeNav="speaking-score" isAdmin={isAdmin} />

      {/* 2. Main Progress Center */}
      <main className="flex-1 overflow-y-auto">
        <MobileHeader
          userName={userName}
          userInitials={userInitials}
          isAdmin={isAdmin}
          activeNav="speaking-score"
        />

        <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <span>📊</span>
                Speaking Scores & Analysis
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                Transparent multi-dimensional evaluation based on real voice practice attempts.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <Link
                href="/voice-practice"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition shadow-md cursor-pointer"
              >
                Practice Speaking Now
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-zinc-400 space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium">Loading real speaking scores from database...</p>
            </div>
          ) : totalReadings === 0 ? (
            /* Empty State 1: Zero Practice Attempts */
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-12 text-center space-y-5 dark:bg-zinc-900 dark:border-zinc-800 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl mx-auto shadow-sm">
                🎙️
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  No Speaking Practice Recorded Yet
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                  Complete your first speaking practice to see your speaking score, grammar accuracy, fluency flow, and AI pronunciation guidance.
                </p>
              </div>
              <Link
                href="/voice-practice"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
              >
                <span>🚀</span>
                <span>Start Speaking Practice</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Stat Cards Grid (Real Data) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {/* 1. Average Circular Score */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
                  <div>
                    <p className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">
                      Overall Average
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                      {avgScore !== null ? `${avgScore}%` : "--"}
                    </p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                      {avgScore !== null && avgScore >= 90
                        ? "Excellent speaker"
                        : avgScore !== null && avgScore >= 75
                        ? "Good communication"
                        : "Developing fluency"}
                    </p>
                  </div>
                  {avgScore !== null && (
                    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          className="stroke-zinc-100 dark:stroke-zinc-800"
                          strokeWidth="5"
                          fill="transparent"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          className={
                            avgScore >= 90
                              ? "stroke-emerald-500"
                              : avgScore >= 75
                              ? "stroke-amber-500"
                              : "stroke-rose-500"
                          }
                          strokeWidth="5"
                          fill="transparent"
                          strokeDasharray={163}
                          strokeDashoffset={163 - (163 * avgScore) / 100}
                        />
                      </svg>
                      <span className="absolute text-xs font-bold text-zinc-800 dark:text-zinc-100">
                        {avgScore}%
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Total Attempts Count */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
                  <div>
                    <p className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">
                      Total Readings
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                      {totalReadings} {totalReadings === 1 ? "Phrase" : "Phrases"}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">Saved in PostgreSQL</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 dark:bg-indigo-950/30 text-xl">
                    🗣️
                  </div>
                </div>

                {/* 3. Speaking Streak */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
                  <div>
                    <p className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">
                      Speaking Streak
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                      {stats?.speakingStreak || 0} {stats?.speakingStreak === 1 ? "Day" : "Days"}
                    </p>
                    <p className="text-xs text-amber-500 font-medium mt-1">
                      Active pronunciation habit
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 dark:bg-amber-950/30 text-xl">
                    🔥
                  </div>
                </div>
              </div>

              {/* Dimensional Breakdown Cards (Real Averages) */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <span>📐</span>
                    Speaking Dimensions Average
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Evaluated across all completed speaking attempts
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60 dark:bg-zinc-950/40 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Grammar Accuracy
                    </span>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {stats?.grammarAvg !== null ? `${stats?.grammarAvg}%` : "--"}
                    </p>
                    <span className="text-[10px] text-zinc-500">Sentence structure & syntax</span>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60 dark:bg-zinc-950/40 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Fluency Flow
                    </span>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {stats?.fluencyAvg !== null ? `${stats?.fluencyAvg}%` : "--"}
                    </p>
                    <span className="text-[10px] text-zinc-500">Pacing & phrase completeness</span>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60 dark:bg-zinc-950/40 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Vocabulary Match
                    </span>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {stats?.vocabAvg !== null ? `${stats?.vocabAvg}%` : "--"}
                    </p>
                    <span className="text-[10px] text-zinc-500">Target terminology alignment</span>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/60 dark:bg-zinc-950/40 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      AI Pronunciation Guidance
                    </span>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {stats?.pronunciationAvg !== null ? `${stats?.pronunciationAvg}%` : "--"}
                    </p>
                    <span className="text-[10px] text-zinc-500">Speech recognition estimate</span>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown: Level Proficiency & Real Speaking Trend */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Level Proficiency Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-6 lg:col-span-2 dark:bg-zinc-900 dark:border-zinc-800">
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                      <span>🎯</span>
                      Proficiency Across Levels
                    </h3>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      Average accuracy rates across graded phrase difficulty
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Beginner */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        <span>
                          Beginner Phrases ({stats?.levelProficiency.beginner.count || 0} attempts)
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                          {stats?.levelProficiency.beginner.accuracy !== null
                            ? `${stats?.levelProficiency.beginner.accuracy}%`
                            : "No attempts yet"}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-100 rounded-full dark:bg-zinc-800">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{
                            width: `${stats?.levelProficiency.beginner.accuracy || 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Intermediate */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        <span>
                          Intermediate Phrases ({stats?.levelProficiency.intermediate.count || 0} attempts)
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                          {stats?.levelProficiency.intermediate.accuracy !== null
                            ? `${stats?.levelProficiency.intermediate.accuracy}%`
                            : "No attempts yet"}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-100 rounded-full dark:bg-zinc-800">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{
                            width: `${stats?.levelProficiency.intermediate.accuracy || 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Advanced */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                        <span>
                          Advanced Phrases ({stats?.levelProficiency.advanced.count || 0} attempts)
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                          {stats?.levelProficiency.advanced.accuracy !== null
                            ? `${stats?.levelProficiency.advanced.accuracy}%`
                            : "No attempts yet"}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-100 rounded-full dark:bg-zinc-800">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{
                            width: `${stats?.levelProficiency.advanced.accuracy || 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trend & Focus Area Card */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4 dark:bg-zinc-900 dark:border-zinc-800 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                      <span>📈</span>
                      Speaking Performance Trend
                    </h3>

                    {stats?.trend === "insufficient" ? (
                      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 dark:bg-zinc-950/40 dark:border-zinc-800 text-xs text-zinc-500 space-y-1">
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                          Single attempt recorded
                        </p>
                        <p>{stats.trendLabel}</p>
                      </div>
                    ) : (
                      <div
                        className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                          stats?.trend === "improving"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
                            : stats?.trend === "needs-attention"
                            ? "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800"
                            : "bg-zinc-50 text-zinc-800 border-zinc-200 dark:bg-zinc-950/30 dark:text-zinc-300 dark:border-zinc-800"
                        }`}
                      >
                        <p className="font-black text-sm">{stats?.trendLabel}</p>
                        <p className="text-[11px] opacity-80">
                          Calculated by comparing recent vs earlier speaking attempts.
                        </p>
                      </div>
                    )}

                    {/* Real Focus Area */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                        🎯 Personalized Focus Area
                      </span>
                      {primaryWeakness ? (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            {primaryWeakness.title}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {primaryWeakness.description}
                          </p>
                          <Link
                            href={primaryWeakness.actionHref}
                            className="inline-block px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs font-semibold transition"
                          >
                            {primaryWeakness.actionLabel} ➔
                          </Link>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500">
                          No recurring weaknesses detected yet. Keep speaking consistently!
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    href="/voice-conversation"
                    className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold text-center transition block"
                  >
                    Try AI Voice Tutor ➔
                  </Link>
                </div>
              </div>

              {/* Chronological Attempts Log Table (Real Data) */}
              <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6 overflow-hidden dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <span>📜</span>
                    Speaking Score History
                  </h3>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    Chronological record of speaking attempts in PostgreSQL
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-500 dark:text-zinc-400">
                    <thead className="bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-wider dark:bg-zinc-950/40">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Target Phrase</th>
                        <th className="px-4 py-3">Level</th>
                        <th className="px-4 py-3 text-right">Score</th>
                        <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                      {stats?.attempts.map((att) => (
                        <tr
                          key={att.id}
                          className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition"
                        >
                          <td className="px-4 py-3.5 whitespace-nowrap font-medium text-zinc-400">
                            {att.date}
                          </td>
                          <td className="px-4 py-3.5 max-w-xs truncate font-semibold text-zinc-700 dark:text-zinc-300">
                            "{att.phrase}"
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md font-semibold text-[10px] dark:bg-zinc-800 dark:text-zinc-300">
                              {att.difficulty}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-right font-black text-zinc-900 dark:text-zinc-100">
                            {att.score}%
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-right">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase ${
                                att.status === "Excellent"
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : att.status === "Good"
                                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                              }`}
                            >
                              {att.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
