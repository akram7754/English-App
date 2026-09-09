"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import UserPanelShell from "../components/UserPanelShell";
import { ComprehensiveProgressData, ProgressSpeakingAttempt, ActivityTimelineItem } from "./data";

interface Props {
  initialData: ComprehensiveProgressData;
}

type TimeframeFilter = "all" | "30d" | "7d" | "today";

export default function ProgressClient({ initialData }: Props) {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>("all");
  const [hoveredAttempt, setHoveredAttempt] = useState<ProgressSpeakingAttempt | null>(null);

  const {
    user,
    overall,
    lessons,
    vocabulary,
    speaking,
    grammar,
    streak,
    dailyGoal,
    xp,
    milestones,
    recentActivities,
    recommendedNextStep,
  } = initialData;

  // Filter activities and speaking attempts by selected timeframe
  const filteredData = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    let cutoffTimestamp = 0;
    if (timeframe === "today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      cutoffTimestamp = todayStart.getTime();
    } else if (timeframe === "7d") {
      cutoffTimestamp = now - 7 * oneDayMs;
    } else if (timeframe === "30d") {
      cutoffTimestamp = now - 30 * oneDayMs;
    }

    const attempts = speaking.chronologicalAttempts.filter(
      (a) => a.timestamp >= cutoffTimestamp
    );
    const activities = recentActivities.filter(
      (a) => a.timestamp >= cutoffTimestamp
    );

    return { attempts, activities };
  }, [timeframe, speaking.chronologicalAttempts, recentActivities]);

  // Compute SVG chart coordinates for filtered attempts
  const chartConfig = useMemo(() => {
    const attempts = filteredData.attempts;
    if (attempts.length === 0) return null;

    const width = 640;
    const height = 180;
    const padX = 40;
    const padY = 24;

    const graphW = width - padX * 2;
    const graphH = height - padY * 2;

    const minScore = 0;
    const maxScore = 100;

    const points = attempts.map((att, i) => {
      const x =
        attempts.length === 1
          ? padX + graphW / 2
          : padX + (i / (attempts.length - 1)) * graphW;
      const score = Math.max(0, Math.min(100, att.score));
      const y = padY + graphH - ((score - minScore) / (maxScore - minScore)) * graphH;
      return { x, y, attempt: att };
    });

    const pathD = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");

    // Area fill path
    const firstPt = points[0];
    const lastPt = points[points.length - 1];
    const areaD = `${pathD} L ${lastPt.x} ${padY + graphH} L ${firstPt.x} ${padY + graphH} Z`;

    return { width, height, padX, padY, graphW, graphH, points, pathD, areaD };
  }, [filteredData.attempts]);

  return (
    <UserPanelShell
      activeNav="progress"
      userName={user.name}
      userEmail={user.email}
      userLevel={user.level}
      userInitials={user.initials}
      isAdmin={user.isAdmin}
    >
      <div className="p-4 sm:p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
        
        {/* ========================================================= */}
        {/* 1. PROGRESS HEADER                                        */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800/40 shadow-xl relative overflow-hidden">
          {/* Subtle decorative background circles */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
                <span>📊 Personal Learning Analytics</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                MY PROGRESS
              </h1>
              <p className="text-indigo-200/90 text-sm sm:text-base max-w-xl">
                Your personal learning journey — tracked with real-time analytics from lessons, vocabulary, grammar, and speaking practice.
              </p>
            </div>

            {/* Quick Metrics Pill Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="px-3 py-2 text-center">
                <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Level</p>
                <p className="text-base sm:text-lg font-black text-white mt-0.5">{user.level}</p>
              </div>
              <div className="px-3 py-2 text-center border-l border-white/10">
                <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Overall</p>
                <p className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">
                  {overall.hasEnoughData ? `${overall.overallPercentage}%` : "No data yet"}
                </p>
              </div>
              <div className="px-3 py-2 text-center border-l border-white/10">
                <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Streak</p>
                <p className="text-base sm:text-lg font-black text-amber-400 mt-0.5">
                  {streak.currentStreakDays > 0 ? `${streak.currentStreakDays} Days 🔥` : "0 Days"}
                </p>
              </div>
              <div className="px-3 py-2 text-center border-l border-white/10">
                <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">XP</p>
                <p className="text-base sm:text-lg font-black text-purple-300 mt-0.5">{xp.totalXP} XP</p>
              </div>
            </div>
          </div>

          {/* Languages Track Bar */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-indigo-200">
              <span className="font-semibold text-white">Language Track:</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 font-medium">
                I SPEAK: <strong className="text-white">{user.nativeLanguage}</strong>
              </span>
              <span>➔</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/40 text-white font-bold border border-indigo-400/30">
                I LEARN: <strong className="text-white">{user.targetLanguage}</strong>
              </span>
            </div>

            <div className="text-indigo-300 text-[11px]">
              {streak.activeDatesCount} active study day{streak.activeDatesCount === 1 ? "" : "s"} recorded
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RECOMMENDED NEXT STEP BANNER                             */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-500/20 dark:border-amber-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-md shadow-amber-500/20">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  {recommendedNextStep.badge}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {recommendedNextStep.title}
                </h3>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {recommendedNextStep.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 self-stretch sm:self-auto">
            <Link
              href="/study-plan"
              className="px-4 py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 text-xs font-bold rounded-xl transition shadow-xs text-center"
            >
              Open Study Plan ➔
            </Link>
            <Link
              href={recommendedNextStep.actionHref}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md text-center"
            >
              {recommendedNextStep.actionLabel} →
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. OVERALL LEARNING PROGRESS SECTION                     */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                Overall Learning Progress
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Composite evaluation across curriculum, vocabulary retention, grammar accuracy, and speaking.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {overall.hasEnoughData ? `${overall.overallPercentage}%` : "0%"}
              </span>
              <p className="text-[10px] font-bold uppercase text-zinc-400">Curriculum Avg</p>
            </div>
          </div>

          {/* 4 Dimension Progress Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Lessons Card */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Lessons</span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  {lessons.percentage}%
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${lessons.percentage}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {lessons.completedCount} of {lessons.totalCount} completed
              </p>
            </div>

            {/* Vocabulary Card */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Vocabulary</span>
                <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                  {vocabulary.percentage}%
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${vocabulary.percentage}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {vocabulary.learnedCount} words learned ({vocabulary.masteredCount} mastered)
              </p>
            </div>

            {/* Grammar Card */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Grammar</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {grammar.grammarScore !== null ? `${grammar.grammarScore}%` : "No data yet"}
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${grammar.grammarScore || 0}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {grammar.weaknesses.length === 0
                  ? "✓ No weak areas flagged"
                  : `${grammar.weaknesses.length} focus area${grammar.weaknesses.length > 1 ? "s" : ""}`}
              </p>
            </div>

            {/* Speaking Card */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Speaking</span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                  {speaking.averageScore !== null ? `${speaking.averageScore}%` : "No data yet"}
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${speaking.averageScore || 0}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {speaking.totalAttempts > 0
                  ? `${speaking.totalAttempts} practice run${speaking.totalAttempts > 1 ? "s" : ""}`
                  : "0 practice runs"}
              </p>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. LESSONS & VOCABULARY DETAILED SECTION                 */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Lessons Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <span>📚</span> Curriculum Lessons
                </h3>
                <p className="text-xs text-zinc-500">Track structured lesson milestones</p>
              </div>
              <Link
                href="/lessons"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Go to Lessons →
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-center">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Completed</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {lessons.completedCount}
                </p>
              </div>
              <div className="border-x border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Remaining</p>
                <p className="text-lg font-black text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {lessons.remainingCount}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Progress</p>
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {lessons.percentage}%
                </p>
              </div>
            </div>

            {/* Current / Next Lesson Box */}
            {lessons.currentLesson ? (
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Current Target Lesson
                  </span>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                    {lessons.currentLesson.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Category: {lessons.currentLesson.category} • {lessons.currentLesson.difficulty}
                  </p>
                </div>
                <Link
                  href="/lessons"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shrink-0 transition"
                >
                  Continue →
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 text-center">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  🎉 All available curriculum lessons completed!
                </p>
              </div>
            )}
          </div>

          {/* Vocabulary SRS Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <span>📖</span> Spaced Repetition Vocabulary
                </h3>
                <p className="text-xs text-zinc-500">Long-term memory retention tracking</p>
              </div>
              <Link
                href="/lessons"
                className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                Learn Vocab →
              </Link>
            </div>

            {/* SRS Status Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-center">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Learned</p>
                <p className="text-lg font-black text-zinc-900 dark:text-zinc-50 mt-0.5">
                  {vocabulary.learnedCount}
                </p>
              </div>
              <div className="border-l border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Mastered</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {vocabulary.masteredCount}
                </p>
              </div>
              <div className="border-l border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">In Review</p>
                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {vocabulary.inReviewCount}
                </p>
              </div>
              <div className="border-l border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Due Now</p>
                <p className={`text-lg font-black mt-0.5 ${vocabulary.dueCount > 0 ? "text-amber-500" : "text-zinc-400"}`}>
                  {vocabulary.dueCount}
                </p>
              </div>
            </div>

            {/* Action block */}
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  {vocabulary.dueCount > 0
                    ? `${vocabulary.dueCount} word${vocabulary.dueCount > 1 ? "s" : ""} scheduled for review`
                    : "✓ All flashcards reviewed for today"}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Mastery Levels: 1 (Learning) to 5 (Permanent Memory)
                </p>
              </div>
              {vocabulary.dueCount > 0 ? (
                <Link
                  href="/lessons"
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shrink-0 transition shadow-sm"
                >
                  Review Due →
                </Link>
              ) : (
                <Link
                  href="/lessons"
                  className="px-3.5 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-xl shrink-0 transition"
                >
                  Explore →
                </Link>
              )}
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* 4. SPEAKING PROGRESS & CHRONOLOGICAL TREND CHART         */}
        {/* ========================================================= */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <span>🎙️</span> Speaking Accuracy & Score Trend
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Real chronological scores from pronunciation recordings
              </p>
            </div>

            {/* Timeframe Filter Buttons */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl shrink-0 self-start sm:self-auto">
              {(["all", "30d", "7d", "today"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    timeframe === tf
                      ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
                  }`}
                >
                  {tf === "all" ? "All Time" : tf === "30d" ? "30 Days" : tf === "7d" ? "7 Days" : "Today"}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/80">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Average Score</p>
              <p className="text-xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                {speaking.averageScore !== null ? `${speaking.averageScore}%` : "No data yet"}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">All recorded attempts</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/80">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Best Score</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {speaking.bestScore !== null ? `${speaking.bestScore}%` : "No data yet"}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Peak performance</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/80">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Recent Score</p>
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {speaking.recentScore !== null ? `${speaking.recentScore}%` : "No data yet"}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Last attempt</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/80">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Total Attempts</p>
              <p className="text-xl font-black text-zinc-900 dark:text-zinc-50 mt-1">
                {speaking.totalAttempts}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Recorded recordings</p>
            </div>
          </div>

          {/* Chronological SVG Score Chart */}
          {chartConfig && filteredData.attempts.length > 0 ? (
            <div className="space-y-3 pt-2">
              <div className="relative w-full bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 overflow-hidden">
                
                {/* SVG Canvas */}
                <svg
                  viewBox={`0 0 ${chartConfig.width} ${chartConfig.height}`}
                  className="w-full h-44 sm:h-52 overflow-visible"
                >
                  <defs>
                    <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[100, 80, 60, 40, 20, 0].map((val) => {
                    const y =
                      chartConfig.padY +
                      chartConfig.graphH -
                      (val / 100) * chartConfig.graphH;
                    return (
                      <g key={val}>
                        <line
                          x1={chartConfig.padX}
                          y1={y}
                          x2={chartConfig.width - chartConfig.padX}
                          y2={y}
                          stroke="currentColor"
                          className="text-zinc-200 dark:text-zinc-800"
                          strokeDasharray={val === 0 || val === 100 ? "0" : "3 3"}
                          strokeWidth="1"
                        />
                        <text
                          x={chartConfig.padX - 8}
                          y={y + 3}
                          textAnchor="end"
                          className="text-[9px] fill-zinc-400 font-semibold"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Gradient Area Fill */}
                  <path d={chartConfig.areaD} fill="url(#scoreAreaGradient)" />

                  {/* Connecting Line */}
                  <path
                    d={chartConfig.pathD}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Interactive Points */}
                  {chartConfig.points.map((pt, i) => {
                    const isHovered = hoveredAttempt?.id === pt.attempt.id;
                    return (
                      <g
                        key={pt.attempt.id || i}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredAttempt(pt.attempt)}
                        onClick={() => setHoveredAttempt(pt.attempt)}
                      >
                        {/* Hit area */}
                        <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                        {/* Outer ring on hover */}
                        {isHovered && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="9"
                            fill="#6366f1"
                            opacity="0.3"
                            className="animate-ping"
                          />
                        )}

                        {/* Point circle */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? "6" : "4.5"}
                          fill={pt.attempt.score >= 85 ? "#10b981" : pt.attempt.score >= 70 ? "#6366f1" : "#f59e0b"}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />

                        {/* Score text label */}
                        <text
                          x={pt.x}
                          y={pt.y - 10}
                          textAnchor="middle"
                          className="text-[10px] font-black fill-zinc-700 dark:fill-zinc-300"
                        >
                          {pt.attempt.score}%
                        </text>

                        {/* Date label at bottom */}
                        <text
                          x={pt.x}
                          y={chartConfig.height - 4}
                          textAnchor="middle"
                          className="text-[9px] fill-zinc-400"
                        >
                          {pt.attempt.dateFormatted}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Interactive Tooltip Card */}
                {hoveredAttempt && (
                  <div className="mt-3 p-3 bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-900/50 rounded-xl shadow-md text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-zinc-50">
                        {hoveredAttempt.dateFormatted} • Attempt #{hoveredAttempt.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                        hoveredAttempt.score >= 85
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                      }`}>
                        Score: {hoveredAttempt.score}% ({hoveredAttempt.status})
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 italic">
                      "{hoveredAttempt.phrase}"
                    </p>
                    {hoveredAttempt.grammarFeedback && (
                      <p className="text-[11px] text-zinc-500">
                        Feedback: {hoveredAttempt.grammarFeedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-3">
              <span className="text-3xl">🎙️</span>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {timeframe === "all"
                  ? "No speaking attempts recorded yet."
                  : `No speaking practice sessions found for ${
                      timeframe === "today" ? "Today" : timeframe === "7d" ? "the last 7 days" : "the last 30 days"
                    }.`}
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Practice pronunciation, get real-time enunciation feedback, and watch your progress trend line grow.
              </p>
              <Link
                href="/voice-practice"
                className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md"
              >
                Start Speaking Practice →
              </Link>
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* 5. GRAMMAR & WEAKNESS ANALYSIS SECTION                   */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Grammar Strengths */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <span>🌟</span> Grammar Strengths
              </h3>
              <p className="text-xs text-zinc-500">Consistently accurate patterns in your activity</p>
            </div>

            {grammar.strengths.length > 0 ? (
              <div className="space-y-2.5">
                {grammar.strengths.map((str, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs text-emerald-900 dark:text-emerald-300 font-semibold"
                  >
                    <span className="text-emerald-500 text-base">✓</span>
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 text-xs text-zinc-500 text-center">
                Complete more speaking & grammar exercises to identify validated strengths.
              </div>
            )}
          </div>

          {/* Detected Focus Areas / Weaknesses */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <span>🎯</span> Personal Weakness Analysis & Focus Areas
                </h3>
                <p className="text-xs text-zinc-500">Targeted areas identified from your practice sessions</p>
              </div>
              <Link
                href="/grammar-correction"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Grammar Coach →
              </Link>
            </div>

            {grammar.weaknesses.length > 0 ? (
              <div className="space-y-3">
                {grammar.weaknesses.map((weak) => (
                  <div
                    key={weak.id}
                    className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          weak.severity === "High"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}>
                          {weak.severity} Priority
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {weak.title}
                        </h4>
                      </div>

                      <Link
                        href={weak.actionHref}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition shrink-0 shadow-sm"
                      >
                        {weak.actionLabel} →
                      </Link>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {weak.description}
                    </p>

                    <div className="pt-1 text-[11px] text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      💡 <strong>Coach Advice:</strong> {weak.advice}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-center space-y-2">
                <span className="text-2xl">🎉</span>
                <p className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  No grammar weaknesses detected — Great job!
                </p>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Your recent practice sessions demonstrate clean accuracy. Continue practicing speaking and reading to keep advancing.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* ========================================================= */}
        {/* 6. DAILY GOAL, STREAK & XP BREAKDOWN                     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Daily Goal Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  Daily Learning Goal
                </h3>
                <p className="text-xs text-zinc-500">Target daily study time</p>
              </div>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                {dailyGoal.goalPercentage}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 text-center space-y-2">
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {dailyGoal.todayStudyMinutes} / {dailyGoal.dailyGoalMinutes} min
              </p>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dailyGoal.goalCompleted ? "bg-emerald-500" : "bg-indigo-600"
                  }`}
                  style={{ width: `${dailyGoal.goalPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500">
                {dailyGoal.goalCompleted ? "✓ Daily goal completed!" : `${Math.max(0, dailyGoal.dailyGoalMinutes - dailyGoal.todayStudyMinutes)} minutes remaining`}
              </p>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                Study Streak Record
              </h3>
              <p className="text-xs text-zinc-500">Consecutive days of real activity</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 text-center">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Current Streak</p>
                <p className="text-2xl font-black text-amber-500 mt-1">
                  {streak.currentStreakDays} 🔥
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Days in a row</p>
              </div>
              <div className="border-l border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Best Streak</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {streak.bestStreakDays} 🏆
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">All-time record</p>
              </div>
            </div>
          </div>

          {/* XP Breakdown Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  Experience Points (XP)
                </h3>
                <p className="text-xs text-zinc-500">Milestone calculation</p>
              </div>
              <span className="text-base font-black text-purple-600 dark:text-purple-400">
                {xp.totalXP} XP
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>📚 Lessons ({lessons.completedCount} × 50)</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">+{xp.breakdown.lessonsXP} XP</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>📖 Vocabulary ({vocabulary.learnedCount} × 20)</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">+{xp.breakdown.vocabXP} XP</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>🗣️ Speaking ({speaking.totalAttempts} × 30)</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">+{xp.breakdown.speakingXP} XP</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                <span>⭐ Base Milestone Bonus</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">+{xp.breakdown.baseXP} XP</span>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 7. MILESTONE ACHIEVEMENTS (REAL DATA ONLY)               */}
        {/* ========================================================= */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <span>🏅</span> Milestone Achievements
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Badges unlocked strictly through validated learning actions
              </p>
            </div>
            <Link
              href="/achievements"
              className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition border border-indigo-200/60 dark:border-indigo-800/60 inline-flex items-center gap-1.5"
            >
              View Full Achievements Hub →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {milestones.map((ms) => (
              <div
                key={ms.id}
                className={`p-4 rounded-2xl border transition-all ${
                  ms.unlocked
                    ? "bg-gradient-to-br from-indigo-50/50 to-purple-50/40 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-900/50 shadow-sm"
                    : "bg-zinc-50/60 dark:bg-zinc-950/30 border-zinc-200/60 dark:border-zinc-800/80 opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    ms.unlocked
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                  }`}>
                    {ms.icon}
                  </div>

                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    ms.unlocked
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}>
                    {ms.unlocked ? "✓ Unlocked" : "Locked"}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {ms.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {ms.description}
                  </p>
                </div>

                {/* Progress bar towards unlock */}
                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-zinc-400">
                    <span>{ms.progressText}</span>
                    <span>{ms.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ms.unlocked ? "bg-emerald-500" : "bg-indigo-500"}`}
                      style={{ width: `${ms.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 8. RECENT ACTIVITY TIMELINE                              */}
        {/* ========================================================= */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <span>⏱️</span> Recent Activity Timeline
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Chronological log of verified lessons, vocabulary, and speaking practice
              </p>
            </div>

            <span className="text-xs text-zinc-400">
              Showing {filteredData.activities.length} activit{filteredData.activities.length === 1 ? "y" : "ies"}
            </span>
          </div>

          {filteredData.activities.length > 0 ? (
            <div className="space-y-3">
              {filteredData.activities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/30 hover:bg-zinc-100/60 dark:hover:bg-zinc-950/60 transition flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 mt-0.5 ${
                      act.type === "lesson"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                        : act.type === "vocab"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}>
                      {act.type === "lesson" ? "📚" : act.type === "vocab" ? "📖" : "🎙️"}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {act.title}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {act.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {act.badge}
                    </span>
                    <p className="text-[11px] text-zinc-400">
                      {act.relativeTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-2">
              <span className="text-2xl">⏳</span>
              <p className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
                No recent activity recorded for this timeframe.
              </p>
              <p className="text-xs text-zinc-500">
                Complete a lesson or speaking practice session to start building your activity log.
              </p>
            </div>
          )}

        </div>

      </div>
    </UserPanelShell>
  );
}
