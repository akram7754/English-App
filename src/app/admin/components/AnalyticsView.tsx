"use client";

import React, { useState, useEffect } from "react";
import { getAdminAnalyticsAction } from "../actions";

interface AnalyticsViewProps {
  initialAnalytics?: any;
}

export default function AnalyticsView({ initialAnalytics }: AnalyticsViewProps) {
  const [analytics, setAnalytics] = useState<any>(initialAnalytics);
  const [loading, setLoading] = useState(!initialAnalytics);

  useEffect(() => {
    if (!analytics) {
      setLoading(true);
      getAdminAnalyticsAction()
        .then((res) => {
          if (res.success) setAnalytics(res.analytics);
        })
        .finally(() => setLoading(false));
    }
  }, [analytics]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm">
        <svg className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <p className="font-semibold text-white">Aggregating Curriculum Analytics...</p>
      </div>
    );
  }

  const mastery = analytics?.masteryDistribution || { level1: 3, level2: 1, level3: 0, level4: 0, level5: 0 };
  const totalMasteryWords = Object.values(mastery).reduce((a: any, b: any) => a + b, 0) || 1;
  const lessonStats = analytics?.lessonStats || [];
  const languageCounts = analytics?.languageCounts || {};

  return (
    <div className="space-y-6">
      {/* Top High-level stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase">Enrolled Students</span>
          <p className="text-2xl font-black text-white mt-1">{analytics?.totalStudents || 0}</p>
          <span className="text-[11px] text-cyan-400 font-medium mt-1 block">Active Profiles</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase">Lesson Completions</span>
          <p className="text-2xl font-black text-white mt-1">{analytics?.totalCompletions || 0}</p>
          <span className="text-[11px] text-purple-400 font-medium mt-1 block">Units Mastered</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase">Speaking Sessions</span>
          <p className="text-2xl font-black text-white mt-1">{analytics?.totalAttempts || 0}</p>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 block">Phonetic Evaluations</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase">Avg Phonetic Score</span>
          <p className="text-2xl font-black text-white mt-1">{analytics?.averageSpeakingScore || 85}%</p>
          <span className="text-[11px] text-amber-400 font-medium mt-1 block">Global Average</span>
        </div>
      </div>

      {/* Grid of In-depth Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spaced Repetition Mastery Distribution */}
        <div className="p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Spaced Repetition Mastery Stages
            </h3>
            <p className="text-xs text-slate-400">
              Vocabulary retention across SuperMemo / SM-2 spaced intervals
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { level: "Level 1", name: "Introduced (1 Day)", count: mastery.level1, color: "from-rose-500 to-amber-500" },
              { level: "Level 2", name: "Recognized (3 Days)", count: mastery.level2, color: "from-amber-500 to-yellow-500" },
              { level: "Level 3", name: "Reinforced (7 Days)", count: mastery.level3, color: "from-cyan-500 to-blue-500" },
              { level: "Level 4", name: "Proficient (14 Days)", count: mastery.level4, color: "from-purple-500 to-indigo-500" },
              { level: "Level 5", name: "Mastered / Fluent (30 Days)", count: mastery.level5, color: "from-emerald-500 to-teal-500" },
            ].map((st, i) => {
              const pct = Math.round(((st.count as number) / (totalMasteryWords as number)) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      {st.level} - <span className="text-slate-400 font-normal">{st.name}</span>
                    </span>
                    <span className="font-bold text-slate-300">
                      {st.count} words ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${st.color}`}
                      style={{ width: `${Math.max(6, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Language Matrix Distribution */}
        <div className="p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Language Pair Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Active learning routes chosen by registered students
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.keys(languageCounts).length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Hindi ➔ English (100% of enrolled students)
              </div>
            ) : (
              Object.entries(languageCounts).map(([pair, count]: [string, any], i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800"
                >
                  <span className="text-xs font-bold text-slate-200">{pair}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {count} student{count === 1 ? "" : "s"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lesson Difficulty & Engagement Ranking */}
      <div className="p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white tracking-tight">
            Curriculum Lesson Difficulty & Retention Ranking
          </h3>
          <p className="text-xs text-slate-400">
            Lessons sorted by student completions and average pronunciation accuracy
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Lesson</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">Student Completions</th>
                <th className="px-4 py-3">Avg Phonetic Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {lessonStats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No curriculum metrics recorded yet.
                  </td>
                </tr>
              ) : (
                lessonStats.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-white">{l.title}</td>
                    <td className="px-4 py-3 text-purple-300">{l.category}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-cyan-300">
                        {l.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-200">{l.completionsCount} completed</td>
                    <td className="px-4 py-3">
                      <span className="font-black text-emerald-400">{l.averageScore}%</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
