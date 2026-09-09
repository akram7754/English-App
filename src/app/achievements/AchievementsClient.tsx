"use client";

import React, { useState } from "react";
import Link from "next/link";
import UserPanelShell from "../components/UserPanelShell";
import type {
  UserGamificationProfile,
  UserAchievementItem,
  AchievementCategory,
} from "../../lib/achievements";

interface AchievementsClientProps {
  userName: string;
  userEmail: string;
  userInitials: string;
  userLevel: string;
  isAdmin: boolean;
  gamificationProfile: UserGamificationProfile;
}

export default function AchievementsClient({
  userName,
  userEmail,
  userInitials,
  userLevel,
  isAdmin,
  gamificationProfile,
}: AchievementsClientProps) {
  const [profile] = useState<UserGamificationProfile>(gamificationProfile);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [activeModalItem, setActiveModalItem] = useState<UserAchievementItem | null>(null);

  // Filter achievements
  const filteredAchievements = profile.achievements.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unlocked" && item.unlocked) ||
      (statusFilter === "locked" && !item.unlocked);
    return matchesCategory && matchesStatus;
  });

  const categoryCounts = {
    all: profile.achievements.length,
    lessons: profile.achievements.filter((a) => a.category === "lessons").length,
    vocab: profile.achievements.filter((a) => a.category === "vocab").length,
    speaking: profile.achievements.filter((a) => a.category === "speaking").length,
    streaks: profile.achievements.filter((a) => a.category === "streaks").length,
    xp: profile.achievements.filter((a) => a.category === "xp").length,
  };

  const getCategoryLabel = (cat: AchievementCategory | "all") => {
    switch (cat) {
      case "lessons":
        return "📚 Lessons";
      case "vocab":
        return "📖 Vocabulary";
      case "speaking":
        return "🎤 Speaking";
      case "streaks":
        return "🔥 Streaks";
      case "xp":
        return "⭐ XP";
      default:
        return "🌟 All";
    }
  };

  const getActionLink = (category: AchievementCategory) => {
    switch (category) {
      case "lessons":
        return { label: "Go to Lessons", href: "/lessons" };
      case "vocab":
        return { label: "Review Vocabulary", href: "/progress" };
      case "speaking":
        return { label: "Practice Speaking", href: "/voice-practice" };
      case "streaks":
        return { label: "Practice Now", href: "/voice-practice" };
      case "xp":
        return { label: "View Progress", href: "/progress" };
    }
  };

  return (
    <UserPanelShell
      activeNav="progress"
      userName={userName}
      userEmail={userEmail}
      userLevel={userLevel}
      userInitials={userInitials}
      isAdmin={isAdmin}
      searchPlaceholder="Search achievements, badges, milestones..."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* ========================================================= */}
        {/* 1. HERO HEADER: MOTIVATION & XP SUMMARY                  */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-indigo-800/50">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Gamification & Rewards
                </span>
                <span className="text-xs text-indigo-300">Real Learning Milestones</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Achievements & Badges
              </h1>
              <p className="text-sm sm:text-base text-indigo-200 max-w-xl">
                Every badge is unlocked strictly from validated lesson completions, vocabulary reviews,
                speaking attempts, and streaks in PostgreSQL.
              </p>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto shrink-0">
              {/* Total XP */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-200">
                    Total XP
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
                  {profile.totalXP} XP
                </p>
                <span className="text-[10px] text-indigo-300">Level: {profile.userLevel}</span>
              </div>

              {/* Badges Unlocked */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏆</span>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-200">
                    Badges
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">
                  {profile.unlockedCount} / {profile.totalAchievements}
                </p>
                <span className="text-[10px] text-indigo-300">{profile.completionPercent}% Unlocked</span>
              </div>

              {/* Recent Unlocked */}
              <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-200">
                    Latest
                  </span>
                </div>
                <p className="text-sm font-bold text-white truncate mt-1">
                  {profile.recentAchievement ? profile.recentAchievement.name : "In Progress"}
                </p>
                <span className="text-[10px] text-indigo-300 truncate block">
                  {profile.recentAchievement ? "Keep it up!" : "Complete 1st lesson"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CATEGORY FILTERS & CONTROLS                            */}
        {/* ========================================================= */}
        <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {(["all", "lessons", "vocab", "speaking", "streaks", "xp"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                }`}
              >
                {getCategoryLabel(cat)} ({categoryCounts[cat]})
              </button>
            ))}
          </div>

          {/* Status Filter (All / Unlocked / Locked) */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl self-end md:self-auto shrink-0">
            {(["all", "unlocked", "locked"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition ${
                  statusFilter === st
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm font-bold"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. ACHIEVEMENTS GRID                                      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredAchievements.map((item) => (
            <div
              key={item.key}
              onClick={() => setActiveModalItem(item)}
              className={`group cursor-pointer rounded-3xl p-5 border transition-all hover:scale-[1.02] flex flex-col justify-between ${
                item.unlocked
                  ? "bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-zinc-900 border-indigo-200 dark:border-indigo-900/60 shadow-md shadow-indigo-500/5"
                  : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 opacity-80 hover:opacity-100"
              }`}
            >
              <div>
                {/* Card Header: Icon & Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition ${
                      item.unlocked
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 group-hover:rotate-6"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 grayscale"
                    }`}
                  >
                    {item.icon}
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      item.unlocked
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    {item.unlocked ? "✓ Unlocked" : "🔒 Locked"}
                  </span>
                </div>

                {/* Name & Description */}
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mb-1">
                  {item.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              {/* Card Footer: Progress Bar */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  <span>{item.progressText}</span>
                  <span className={item.unlocked ? "text-emerald-600 dark:text-emerald-400" : ""}>
                    {item.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.unlocked ? "bg-emerald-500" : "bg-indigo-600"
                    }`}
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if filter yields 0 items */}
        {filteredAchievements.length === 0 && (
          <div className="py-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-3">
            <span className="text-4xl">🔍</span>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              No achievements in this view
            </h3>
            <p className="text-xs text-zinc-500">Try changing your category or status filter above.</p>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. APPROVED XP BREAKDOWN CARD                            */}
        {/* ========================================================= */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>⭐</span> Verified XP Architecture
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Calculated dynamically from real learning records in PostgreSQL
              </p>
            </div>
            <span className="text-2xl font-black text-amber-500">
              {profile.totalXP} XP Total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Lessons XP */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Lessons Completed
              </span>
              <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                +{profile.xpBreakdown.lessonsXP} XP
              </p>
              <p className="text-[11px] text-zinc-400">+50 XP per completed lesson</p>
            </div>

            {/* Vocabulary XP */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Vocabulary Mastered
              </span>
              <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                +{profile.xpBreakdown.vocabXP} XP
              </p>
              <p className="text-[11px] text-zinc-400">+20 XP per learned word</p>
            </div>

            {/* Speaking XP */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Speaking Practice
              </span>
              <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                +{profile.xpBreakdown.speakingXP} XP
              </p>
              <p className="text-[11px] text-zinc-400">+30 XP per voice attempt</p>
            </div>

            {/* Base Milestone XP */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Base Milestone Bonus
              </span>
              <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                +{profile.xpBreakdown.baseXP} XP
              </p>
              <p className="text-[11px] text-zinc-400">Granted upon account initialization</p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. ACHIEVEMENT DETAIL MODAL                               */}
        {/* ========================================================= */}
        {activeModalItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setActiveModalItem(null)}
          >
            <div
              className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center justify-center"
              >
                ✕
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                    activeModalItem.unlocked
                      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 grayscale"
                  }`}
                >
                  {activeModalItem.icon}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                    {activeModalItem.category}
                  </span>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                    {activeModalItem.name}
                  </h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {activeModalItem.description}
                </p>

                {/* Progress Details */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    <span>Requirement Progress:</span>
                    <span>{activeModalItem.progressText}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        activeModalItem.unlocked ? "bg-emerald-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${activeModalItem.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Unlock Status */}
                {activeModalItem.unlocked ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                    <span>✓ Unlocked</span>
                    {activeModalItem.unlockedAt && (
                      <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-300">
                        • Verified on{" "}
                        {new Date(activeModalItem.unlockedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 p-3 rounded-xl">
                    Keep practicing to unlock this achievement badge!
                  </div>
                )}
              </div>

              {/* Action Link */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Close
                </button>

                <Link
                  href={getActionLink(activeModalItem.category).href}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
                >
                  {getActionLink(activeModalItem.category).label} →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserPanelShell>
  );
}
