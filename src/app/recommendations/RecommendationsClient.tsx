"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import UserPanelShell from "../components/UserPanelShell";
import { PersonalizedRecommendationsData, RecommendationItem } from "./data";

interface Props {
  initialData: PersonalizedRecommendationsData;
}

type CategoryFilter = "all" | "vocabulary" | "grammar" | "speaking" | "lesson";

export default function RecommendationsClient({ initialData }: Props) {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const { user, hasLearningHistory, topRecommendation, recommendations, studyPlan, coachingAdvice } =
    initialData;

  const filteredRecommendations = useMemo(() => {
    if (filter === "all") return recommendations;
    return recommendations.filter((r) => r.type === filter);
  }, [filter, recommendations]);

  return (
    <UserPanelShell
      activeNav="dashboard"
      userName={user.name}
      userEmail={user.email}
      userLevel={user.level}
      userInitials={user.initials}
      isAdmin={user.isAdmin}
    >
      <div className="p-4 sm:p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
        
        {/* ========================================================= */}
        {/* 1. HEADER BANNER                                          */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
                <span>🎯 Smart Learning Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Personalized Recommendations
              </h1>
              <p className="text-indigo-200/90 text-sm sm:text-base max-w-xl">
                Data-driven learning guidance tailored strictly to your verified performance in lessons, vocabulary, grammar, and speaking.
              </p>
            </div>

            {/* Quick Actions & Navigation to Study Plan */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                href="/study-plan"
                className="px-5 py-3 bg-white text-indigo-950 hover:bg-indigo-50 font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 text-center"
              >
                <span>📅</span>
                <span>View Today's Study Plan</span>
                <span>➔</span>
              </Link>
              <Link
                href="/progress"
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-xs transition border border-white/20 text-center"
              >
                Analytics Dashboard
              </Link>
            </div>
          </div>

          {/* User Language & Goal Status */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-indigo-200">
              <span className="font-semibold text-white">Track:</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 font-medium">
                {user.nativeLanguage} ➔ <strong className="text-white">{user.targetLanguage}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/30 text-indigo-200 font-bold">
                Level: {user.level}
              </span>
            </div>

            <div className="text-indigo-300 text-[11px]">
              Daily Goal: <strong>{studyPlan.completedMinutesToday} / {user.dailyGoalMinutes} min</strong> ({studyPlan.goalProgressPercentage}%)
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. TOP PRIORITY SPOTLIGHT CARD                            */}
        {/* ========================================================= */}
        {hasLearningHistory && topRecommendation ? (
          <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-500/30 p-6 sm:p-7 rounded-3xl space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md shadow-amber-500/30">
                  {topRecommendation.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                      🔥 #1 HIGHEST PRIORITY
                    </span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      Estimated: ~{topRecommendation.estimatedMinutes} min
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                    {topRecommendation.title}
                  </h2>
                </div>
              </div>

              <Link
                href={topRecommendation.targetRoute}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm rounded-2xl transition shadow-md shadow-amber-500/20 shrink-0 text-center"
              >
                {topRecommendation.actionLabel} ➔
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {topRecommendation.description}
            </p>

            {/* Factual reason box */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs flex items-start gap-2.5">
              <span className="text-base shrink-0">💡</span>
              <div>
                <strong className="text-zinc-900 dark:text-zinc-100">Why this matters today:</strong>{" "}
                <span className="text-zinc-600 dark:text-zinc-400">{topRecommendation.reason}</span>
              </div>
            </div>

            {/* AI Coaching message if available */}
            {coachingAdvice && coachingAdvice.message && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs flex items-start gap-2.5">
                <span className="text-base shrink-0">✨</span>
                <div>
                  <strong className="text-indigo-900 dark:text-indigo-200">AI Coach Advice:</strong>{" "}
                  <span className="text-indigo-800 dark:text-indigo-300">{coachingAdvice.message}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty state for users without learning history */
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-4 shadow-sm">
            <span className="text-4xl">🚀</span>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Start Your Learning Journey
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
                Your personalized AI recommendations will appear as you practice. Complete your first lesson to unlock intelligent guidance.
              </p>
            </div>
            <Link
              href="/lessons"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-md"
            >
              Start First Lesson ➔
            </Link>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. ALL RECOMMENDATIONS GRID WITH CATEGORY FILTERS         */}
        {/* ========================================================= */}
        {hasLearningHistory && recommendations.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  All Prioritized Recommendations
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Ordered by deterministic score: Urgency + Weakness + Recency + Benefit
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl shrink-0 self-start sm:self-auto overflow-x-auto max-w-full">
                {(
                  [
                    { id: "all", label: "All Priorities" },
                    { id: "vocabulary", label: "Vocabulary" },
                    { id: "grammar", label: "Grammar" },
                    { id: "speaking", label: "Speaking" },
                    { id: "lesson", label: "Lessons" },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                      filter === cat.id
                        ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRecommendations.map((rec, idx) => (
                <div
                  key={rec.id}
                  className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{rec.icon}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            rec.priority === "HIGH"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                              : rec.priority === "MEDIUM"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          }`}
                        >
                          {rec.priority} PRIORITY
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-zinc-400 shrink-0">
                        ~{rec.estimatedMinutes}m
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 text-[11px] space-y-1">
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                        📊 <strong>Reason:</strong> {rec.reason}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      Score: {rec.score} pts
                    </span>
                    <Link
                      href={rec.targetRoute}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                    >
                      {rec.actionLabel} ➔
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. TODAY'S STUDY PLAN PREVIEW CARD                        */}
        {/* ========================================================= */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <span>📅</span> Today's Study Plan Roadmap
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Structured sequential steps designed to meet your {user.dailyGoalMinutes}-minute daily study target.
              </p>
            </div>

            <Link
              href="/study-plan"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-sm self-start sm:self-auto"
            >
              Open Full Study Plan ➔
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {studyPlan.tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition ${
                  task.completedToday
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                    : "bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200/80 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                    {task.stepNumber}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400">
                    {task.estimatedMinutes} min
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <h5 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {task.title}
                  </h5>
                  <p className="text-[11px] text-zinc-500 line-clamp-2">
                    {task.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className={`text-[10px] font-bold ${task.completedToday ? "text-emerald-600" : "text-zinc-400"}`}>
                    {task.completedToday ? "✓ Done Today" : "Pending"}
                  </span>
                  <Link
                    href={task.targetRoute}
                    className="font-bold text-indigo-600 hover:text-indigo-700 text-[11px]"
                  >
                    Start ➔
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </UserPanelShell>
  );
}
