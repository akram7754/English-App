"use client";

import React, { useState } from "react";
import type { AdminTab } from "./AdminSidebar";

interface ContentManagementViewProps {
  coursesCount: number;
  lessonsCount: number;
  vocabCount: number;
  onNavigateTab: (tab: AdminTab) => void;
  onAddLesson: () => void;
  onAddCourse: () => void;
  onAddVocab: () => void;
}

export default function ContentManagementView({
  coursesCount,
  lessonsCount,
  vocabCount,
  onNavigateTab,
  onAddLesson,
  onAddCourse,
  onAddVocab,
}: ContentManagementViewProps) {
  const [activeType, setActiveType] = useState<"all" | "lessons" | "courses" | "vocab">("all");

  const sections = [
    {
      title: "Interactive Lessons",
      count: lessonsCount,
      type: "Curriculum Units",
      description: "Dialogue scripts, pronunciation phrases, grammar exercises, and practice questions.",
      tab: "courses" as AdminTab,
      onAdd: onAddLesson,
      actionText: "New Lesson",
      color: "from-purple-600/20 to-indigo-600/5",
      border: "border-purple-500/30",
      textColor: "text-purple-400",
      icon: "📖",
    },
    {
      title: "Course Modules",
      count: coursesCount,
      type: "Curriculum Tracks",
      description: "Structured tracks organizing sequential lessons by difficulty and topic goals.",
      tab: "courses" as AdminTab,
      onAdd: onAddCourse,
      actionText: "New Course",
      color: "from-cyan-600/20 to-blue-600/5",
      border: "border-cyan-500/30",
      textColor: "text-cyan-400",
      icon: "📚",
    },
    {
      title: "Vocabulary Bank",
      count: vocabCount,
      type: "Lexical Items",
      description: "Spaced-repetition flashcards, contextual definitions, parts of speech, and real usage examples.",
      tab: "vocabulary" as AdminTab,
      onAdd: onAddVocab,
      actionText: "New Word",
      color: "from-emerald-600/20 to-teal-600/5",
      border: "border-emerald-500/30",
      textColor: "text-emerald-400",
      icon: "🔤",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className={`flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b ${sec.color} bg-[#0D1127]/90 backdrop-blur-xl border ${sec.border} shadow-xl`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">
                  {sec.icon}
                </span>
                <span className={`text-2xl font-black ${sec.textColor}`}>
                  {sec.count}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{sec.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {sec.description}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80">
              <button
                onClick={() => onNavigateTab(sec.tab)}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-colors text-center"
              >
                Manage All
              </button>
              <button
                onClick={sec.onAdd}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
              >
                + {sec.actionText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Content Quality & Guidelines */}
      <div className="p-6 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">
          LingoAI Curriculum Content Standards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-purple-400 block">1. CEFR Level Alignment</span>
            <p className="text-slate-400">
              Beginner units focus on essential survival dialogue (A1-A2). Intermediate units emphasize professional and conversational fluency (B1-B2).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-cyan-400 block">2. Spaced Repetition (SM-2)</span>
            <p className="text-slate-400">
              Vocabulary words are queued for student review at increasing intervals (1, 3, 7, 14, 30 days) depending on user accuracy.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <span className="font-bold text-emerald-400 block">3. Authentic Phonetical Context</span>
            <p className="text-slate-400">
              Target phrases should resemble real-life conversations to maximize AI speech recognition accuracy and student practical recall.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
