"use client";

import React, { useState } from "react";
import Link from "next/link";
import UserPanelShell from "../components/UserPanelShell";
import { PersonalizedRecommendationsData, StudyPlanTask } from "../recommendations/data";

interface Props {
  initialData: PersonalizedRecommendationsData;
}

export default function StudyPlanClient({ initialData }: Props) {
  const { user, studyPlan, coachingAdvice, hasLearningHistory } = initialData;

  // Local state to allow learners to interactively check off completed tasks during their study session
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    studyPlan.tasks.forEach((t) => {
      if (t.completedToday) initial.add(t.id);
    });
    return initial;
  });

  const toggleTaskCompleted = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const completedCount = completedTaskIds.size;
  const totalTasks = studyPlan.tasks.length;
  const planCompletionPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <UserPanelShell
      activeNav="dashboard"
      userName={user.name}
      userEmail={user.email}
      userLevel={user.level}
      userInitials={user.initials}
      isAdmin={user.isAdmin}
    >
      <div className="p-4 sm:p-8 space-y-8 flex-1 max-w-5xl w-full mx-auto">
        
        {/* ========================================================= */}
        {/* 1. STUDY PLAN HEADER                                      */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
                <span>📅 Daily Personalized Roadmap</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Today's Study Plan
              </h1>
              <p className="text-indigo-200/90 text-sm sm:text-base max-w-xl">
                A structured, 4-step routine based on your real performance — calculated to hit your {user.dailyGoalMinutes}-minute daily study goal.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                href="/recommendations"
                className="px-5 py-3 bg-white text-indigo-950 hover:bg-indigo-50 font-bold rounded-xl text-sm transition shadow-lg text-center"
              >
                All Recommendations ➔
              </Link>
            </div>
          </div>

          {/* User Track Info */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-indigo-200">
              <span>Learning Track:</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 font-bold text-white">
                {user.nativeLanguage} ➔ {user.targetLanguage}
              </span>
              <span className="px-2 py-1 rounded-lg bg-indigo-500/30 text-indigo-200">
                Level: {user.level}
              </span>
            </div>

            <div className="text-indigo-300">
              {completedCount} of {totalTasks} tasks finished ({planCompletionPct}%)
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. DAILY GOAL PROGRESS METRIC BAR                         */}
        {/* ========================================================= */}
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-7 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <span>⏱️</span> Daily Study Goal Progress
              </h2>
              <p className="text-xs text-zinc-500">
                Actual activity recorded today vs your configured daily target
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {studyPlan.completedMinutesToday} / {studyPlan.dailyGoalMinutes} min
              </span>
              <p className="text-[10px] uppercase font-bold text-zinc-400">
                {studyPlan.goalProgressPercentage}% Completed
              </p>
            </div>
          </div>

          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                studyPlan.goalProgressPercentage >= 100 ? "bg-emerald-500" : "bg-indigo-600"
              }`}
              style={{ width: `${studyPlan.goalProgressPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Total Planned</p>
              <p className="text-base font-black text-zinc-900 dark:text-zinc-50 mt-0.5">
                {studyPlan.totalEstimatedMinutes} min
              </p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Completed Today</p>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {studyPlan.completedMinutesToday} min
              </p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Remaining Goal</p>
              <p className="text-base font-black text-zinc-900 dark:text-zinc-50 mt-0.5">
                {studyPlan.remainingMinutesToday} min
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. 4-STEP PERSONALIZED STUDY PLAN ROADMAP                 */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                Today's Step-by-Step Roadmap
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Follow these 4 prioritized steps in sequence for optimal memory retention and fluency.
              </p>
            </div>

            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {planCompletionPct}% Finished
            </span>
          </div>

          <div className="space-y-4">
            {studyPlan.tasks.map((task) => {
              const isChecked = completedTaskIds.has(task.id);
              return (
                <div
                  key={task.id}
                  className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                    isChecked
                      ? "bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-900/40 shadow-xs"
                      : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:border-indigo-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left: Step number and details */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="flex flex-col items-center gap-1.5 shrink-0">
                        <span
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm ${
                            isChecked
                              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                              : "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                          }`}
                        >
                          {isChecked ? "✓" : task.stepNumber}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400">
                          {task.estimatedMinutes}m
                        </span>
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              task.priority === "HIGH"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                : task.priority === "MEDIUM"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                                : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                          <span className="text-xs text-zinc-400 capitalize">
                            • {task.category}
                          </span>
                        </div>

                        <h4 className={`text-base font-bold text-zinc-900 dark:text-zinc-50 ${isChecked ? "line-through opacity-70" : ""}`}>
                          {task.title}
                        </h4>

                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {task.description}
                        </p>

                        <div className="pt-1 text-[11px] text-zinc-500 flex items-center gap-1.5">
                          <span>💡</span>
                          <span><strong>Reason:</strong> {task.reason}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => toggleTaskCompleted(task.id)}
                        className={`px-3 py-2 text-xs font-bold rounded-xl border transition ${
                          isChecked
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200"
                        }`}
                        title="Mark as finished"
                      >
                        {isChecked ? "✓ Completed" : "Mark Done"}
                      </button>

                      <Link
                        href={task.targetRoute}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                      >
                        {task.actionLabel} ➔
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. AI COACH ADVICE                                        */}
        {/* ========================================================= */}
        {coachingAdvice && coachingAdvice.message && (
          <div className="p-6 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-700 dark:text-indigo-300 tracking-wider">
              <span>✨</span>
              <span>{coachingAdvice.headline}</span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
              "{coachingAdvice.message}"
            </p>
          </div>
        )}

      </div>
    </UserPanelShell>
  );
}
