"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PersonalizedLearningProfile } from "../../lib/learning-engine";
import { updateUserPreferencesAction } from "../dashboard/actions";
import VocabReviewModal from "./VocabReviewModal";

interface Props {
  initialProfile: PersonalizedLearningProfile;
}

export default function PersonalizedDashboardWidgets({ initialProfile }: Props) {
  const [profile, setProfile] = useState<PersonalizedLearningProfile>(initialProfile);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);

  const handleGoalChange = async (newMinutes: number) => {
    setSavingGoal(true);
    try {
      const res = await updateUserPreferencesAction(profile.level, newMinutes, profile.nativeLanguage, profile.targetLanguage);
      if (res.success) {
        setProfile((prev) => ({
          ...prev,
          dailyGoalMinutes: newMinutes,
          todayGoalPercentage: Math.min(100, Math.round((prev.todayStudyMinutes / newMinutes) * 100)),
          todayGoalCompleted: prev.todayStudyMinutes >= newMinutes,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingGoal(false);
    }
  };

  const handleLevelChange = async (newLevel: "Beginner" | "Intermediate" | "Advanced") => {
    try {
      const res = await updateUserPreferencesAction(newLevel, profile.dailyGoalMinutes, profile.nativeLanguage, profile.targetLanguage);
      if (res.success) {
        setProfile((prev) => ({ ...prev, level: newLevel }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const primaryWeakness = profile.detectedWeaknesses[0];

  return (
    <div className="space-y-8">
      
      {/* Top Banner: Greeting & Daily Target Tracker */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Good day, {profile.userName.split(" ")[0]}! 👋
            </h1>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
              {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleLevelChange(lvl)}
                  className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg transition ${
                    profile.level === lvl
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm">
            Curriculum Progress: <strong>{profile.completionPercentage}%</strong> • Learning {profile.nativeLanguage} ➔ {profile.targetLanguage}
          </p>
        </div>

        {/* Daily Goal Gauge & Selector */}
        <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shrink-0">
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r="22" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="5" fill="transparent" />
              <circle
                cx="28"
                cy="28"
                r="22"
                className={profile.todayGoalCompleted ? "stroke-emerald-500" : "stroke-indigo-600"}
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={138}
                strokeDashoffset={138 - (138 * profile.todayGoalPercentage) / 100}
              />
            </svg>
            <span className={`absolute text-xs font-black ${profile.todayGoalCompleted ? "text-emerald-500" : "text-indigo-600"}`}>
              {profile.todayGoalPercentage}%
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                Daily Goal: {profile.todayStudyMinutes}m / {profile.dailyGoalMinutes}m
              </span>
              {profile.todayGoalCompleted && <span className="text-xs">🎯</span>}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Target:</span>
              {[10, 15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  disabled={savingGoal}
                  onClick={() => handleGoalChange(mins)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                    profile.dailyGoalMinutes === mins
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-200/80 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Real Streak */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
          <div>
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Active Study Streak</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{profile.streakDays} Days</p>
            <p className="text-xs text-amber-500 font-medium mt-1">
              {profile.streakDays > 0 ? "🔥 Keep the fire going!" : "Practice today to start streak!"}
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 dark:bg-amber-950/30 text-xl shrink-0">
            🔥
          </div>
        </div>

        {/* Vocabulary Progress */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
          <div>
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Vocabulary Learned</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{profile.learnedVocabCount} Words</p>
            <p className="text-xs text-purple-500 font-medium mt-1">
              {profile.dueVocabReviewsCount > 0
                ? `🧠 ${profile.dueVocabReviewsCount} words due for review`
                : "✓ All reviews completed"}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 dark:bg-purple-950/30 text-xl shrink-0">
            📖
          </div>
        </div>

        {/* Speaking Practice Score */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
          <div>
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Speaking Score</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{profile.averageSpeakingScore}%</p>
            <p className="text-xs text-zinc-400 mt-1">{profile.speakingAttemptsCount} practice attempts</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 dark:bg-indigo-950/30 text-xl shrink-0">
            🗣️
          </div>
        </div>

        {/* Curriculum Completion */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
          <div>
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Curriculum Progress</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">{profile.completionPercentage}%</p>
            <p className="text-xs text-zinc-400 mt-1">{profile.completedLessonsCount} of {profile.totalLessonsCount} lessons</p>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="18" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="4" fill="transparent" />
              <circle cx="24" cy="24" r="18" className="stroke-indigo-600" strokeWidth="4" fill="transparent" strokeDasharray={113} strokeDashoffset={113 - (113 * profile.completionPercentage) / 100} />
            </svg>
            <span className="absolute text-[10px] font-bold text-indigo-600">{profile.completionPercentage}%</span>
          </div>
        </div>

      </div>

      {/* PHASE 8 SPOTLIGHT: "RECOMMENDED FOR YOU TODAY" COMMAND CENTER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-indigo-200/90 shadow-md dark:bg-zinc-900 dark:border-indigo-900/60 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
              ✨
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Recommended For You Today
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                Personalized practice plan generated from your live learning activity & progress.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs font-bold rounded-full self-start sm:self-auto">
            AI Curriculum Active
          </span>
        </div>

        {/* Recommendation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. Next Recommended Lesson */}
          {profile.nextRecommendedLesson ? (
            <div className="p-5 bg-zinc-50 border border-zinc-200/70 rounded-2xl flex flex-col justify-between dark:bg-zinc-950/40 dark:border-zinc-800 space-y-4 hover:border-indigo-300 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                    📚 Next Lesson
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-400">
                    {profile.nextRecommendedLesson.difficulty}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  {profile.nextRecommendedLesson.title}
                </h3>
                <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">
                  {profile.nextRecommendedLesson.description}
                </p>
              </div>
              <Link
                href="/lessons"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs text-center transition shadow-xs"
              >
                Start Lesson ➔
              </Link>
            </div>
          ) : (
            <div className="p-5 bg-zinc-50 border border-zinc-200/70 rounded-2xl flex flex-col justify-between dark:bg-zinc-950/40 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-emerald-600">🎉 Curriculum Completed!</span>
              <p className="text-xs text-zinc-400">You've completed all curriculum lessons. Review past lessons anytime.</p>
              <Link href="/lessons" className="text-xs text-indigo-600 font-bold hover:underline">
                Review Lessons
              </Link>
            </div>
          )}

          {/* 2. Spaced Repetition Vocabulary Review */}
          <div className="p-5 bg-purple-50/50 border border-purple-200/80 rounded-2xl flex flex-col justify-between dark:bg-purple-950/15 dark:border-purple-900/40 space-y-4 hover:border-purple-300 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                  🧠 Smart Review (SRS)
                </span>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  {profile.dueVocabReviewsCount} Due
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-purple-950 dark:text-purple-100">
                Spaced Vocab Revision
              </h3>
              <p className="text-purple-800/80 dark:text-purple-300/80 text-xs leading-relaxed">
                {profile.dueVocabReviewsCount > 0
                  ? `${profile.dueVocabReviewsCount} words are due for memory review based on your retention schedule.`
                  : "All learned words are currently fresh in memory! Great retention."}
              </p>
            </div>
            {profile.dueVocabReviewsCount > 0 ? (
              <button
                onClick={() => setShowReviewModal(true)}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Start Review Quiz ({profile.dueVocabReviewsCount})</span>
              </button>
            ) : (
              <Link
                href="/lessons"
                className="w-full py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold rounded-xl text-xs text-center transition"
              >
                Learn New Words ➔
              </Link>
            )}
          </div>

          {/* 3. Targeted Speaking Practice */}
          <div className="p-5 bg-indigo-50/50 border border-indigo-200/80 rounded-2xl flex flex-col justify-between dark:bg-indigo-950/15 dark:border-indigo-900/40 space-y-4 hover:border-indigo-300 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                  🎙️ Speaking Topic
                </span>
                <span className="text-xs">{profile.recommendedSpeakingTopic.icon}</span>
              </div>
              <h3 className="font-extrabold text-sm text-indigo-950 dark:text-indigo-100">
                {profile.recommendedSpeakingTopic.title}
              </h3>
              <p className="text-indigo-800/80 dark:text-indigo-300/80 text-xs line-clamp-2 leading-relaxed">
                {profile.recommendedSpeakingTopic.description}
              </p>
            </div>
            <Link
              href="/voice-conversation"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs text-center transition shadow-xs"
            >
              Practice AI Voice Tutor ➔
            </Link>
          </div>

          {/* 4. Focus Weakness Area */}
          {primaryWeakness && (
            <div className="p-5 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex flex-col justify-between dark:bg-amber-950/15 dark:border-amber-900/40 space-y-4 hover:border-amber-300 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                    ⚠️ Focus Area
                  </span>
                  <span className="text-[10px] font-bold text-amber-600">
                    {primaryWeakness.severity} Priority
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-amber-950 dark:text-amber-100">
                  {primaryWeakness.title}
                </h3>
                <p className="text-amber-850 dark:text-amber-300/80 text-xs leading-relaxed line-clamp-2">
                  {primaryWeakness.advice}
                </p>
              </div>
              <Link
                href={primaryWeakness.actionHref}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs text-center transition shadow-xs"
              >
                {primaryWeakness.actionLabel} ➔
              </Link>
            </div>
          )}

        </div>

      </div>

      {/* Historical Speaking Score Trend & Activity Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Score Trend Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-sm space-y-6 lg:col-span-2 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Speaking Accuracy Trend</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Chronological record of recent pronunciation & conversational scores.</p>
            </div>
            <Link href="/speaking-score" className="text-xs font-bold text-indigo-600 hover:underline">
              View All History ➔
            </Link>
          </div>

          {profile.scoreTrend.length === 0 ? (
            <div className="p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center text-zinc-400 text-xs">
              No speaking attempts recorded yet. Practice reading phrases aloud in Voice Practice or AI Voice Tutor!
            </div>
          ) : (
            <div className="space-y-3">
              {profile.scoreTrend.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between text-xs dark:bg-zinc-950/30 dark:border-zinc-800"
                >
                  <div className="space-y-0.5 max-w-sm sm:max-w-md">
                    <span className="text-[10px] text-zinc-400 font-semibold">{item.date} • {item.difficulty}</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">"{item.phrase}"</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`font-black text-sm ${
                        item.score >= 90
                          ? "text-emerald-500"
                          : item.score >= 75
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                    >
                      {item.score}%
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        item.status === "Excellent"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                          : item.status === "Good"
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40"
                          : "bg-red-50 text-red-600 dark:bg-red-950/40"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Completed Lessons list */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4 dark:bg-zinc-900 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Recent Completions</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Lessons marked complete in your curriculum.</p>
          </div>

          {profile.recentlyCompletedLessons.length === 0 ? (
            <div className="p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center text-zinc-400 text-xs">
              No completed lessons yet. Start your first lesson today!
            </div>
          ) : (
            <div className="space-y-3">
              {profile.recentlyCompletedLessons.map((l) => (
                <div
                  key={l.id}
                  className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between text-xs dark:bg-zinc-950/30 dark:border-zinc-800"
                >
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-indigo-600 uppercase">{l.category}</span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">{l.title}</p>
                  </div>
                  <span className="text-emerald-500 font-bold text-xs">✓ Done</span>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/lessons"
            className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-bold rounded-xl text-xs text-center block transition mt-4"
          >
            Explore All Lessons ➔
          </Link>
        </div>

      </div>

      {/* Vocab Spaced Review Modal */}
      {showReviewModal && (
        <VocabReviewModal
          dueList={profile.dueVocabList}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onRefresh={() => {
            // Re-fetch or advance local state
            setProfile((prev) => ({
              ...prev,
              dueVocabReviewsCount: 0,
              dueVocabList: [],
            }));
          }}
        />
      )}

    </div>
  );
}
