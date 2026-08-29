"use client";

import React, { useState } from "react";
import Link from "next/link";
import { logoutAction } from "../login/actions";
import { completeLessonAction } from "./actions";
import MobileHeader from "../components/MobileHeader";

interface Lesson {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  content: string;
}

interface LessonsClientProps {
  initialLessons: Lesson[];
  userName?: string;
  initialCompletedLessonIds?: number[];
}

export default function LessonsClient({
  initialLessons,
  userName = "Sarah Jenkins",
  initialCompletedLessonIds = [],
}: LessonsClientProps) {
  const userInitials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "SJ";

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(initialLessons[0] || null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>(initialCompletedLessonIds);
  const [loading, setLoading] = useState(false);

  const categories = ["All", "Grammar", "Vocabulary", "Speaking"];

  const filteredLessons = selectedCategory === "All"
    ? initialLessons
    : initialLessons.filter((l) => l.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleComplete = async (lessonId: number) => {
    if (loading) return;
    setLoading(true);
    const res = await completeLessonAction(lessonId);
    setLoading(false);
    if (res.success) {
      setCompletedLessonIds((prev) => [...prev, lessonId]);
    } else {
      alert(res.error || "Failed to mark lesson as complete.");
    }
  };

  const isCompleted = (lessonId: number) => completedLessonIds.includes(lessonId);

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-indigo-950 text-indigo-100 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/" className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-lg tracking-wider">
              AI
            </Link>
            <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-indigo-200 transition">
              English AI
            </Link>
          </div>

          <nav className="space-y-1.5">
            <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              Dashboard
            </Link>
            <Link href="/lessons" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-indigo-900 text-white font-medium transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Lessons / Skills
            </Link>
            <Link href="/ai-tutor" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              AI Tutor
            </Link>
            <Link href="/ai-chat" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              AI Chat
            </Link>
            <Link href="/voice-practice" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Voice Practice
            </Link>
            <Link href="/grammar-correction" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Grammar Check
            </Link>
            <Link href="/speaking-score" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Speaking Score
            </Link>
            <Link href="/progress" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Progress Track
            </Link>
            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Panel
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>
            <form action={logoutAction} className="w-full">
              <button type="submit" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white text-left transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Logout / Exit
              </button>
            </form>
          </nav>
        </div>

        {/* Database Status footer */}
        <div className="p-6 border-t border-indigo-900/60 bg-indigo-950/50">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <div className="text-xs text-indigo-200">
              <p className="font-semibold text-white">Database Online</p>
              <p className="opacity-75">{initialLessons.length} lessons loaded</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main View Area Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader userName={userName} userInitials={userInitials} />
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Lessons List */}
        <div className="flex-1 flex flex-col overflow-y-auto border-r border-zinc-200/80 p-8 dark:border-zinc-800/80">
          <div className="mb-6 shrink-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">English Lessons</h1>
            <p className="text-zinc-500 text-sm mt-1">Select a topic to start practicing grammar, vocabulary, and speaking.</p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto shrink-0 pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Lessons Grid list */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                className={`p-6 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedLesson?.id === lesson.id
                    ? "bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/10 dark:bg-zinc-900"
                    : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md dark:bg-indigo-950/40 dark:text-indigo-400">
                        {lesson.category}
                      </span>
                      <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md dark:bg-amber-950/40 dark:text-amber-400">
                        {lesson.difficulty}
                      </span>
                    </div>
                    {isCompleted(lesson.id) && (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center gap-0.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Completed
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{lesson.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{lesson.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold pt-4 mt-auto">
                  <span>{isCompleted(lesson.id) ? "Review Lesson" : "Start Learning"}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Lesson Content Reader Drawer */}
        <div className="w-full md:w-[480px] bg-white border-t md:border-t-0 md:border-l border-zinc-200/80 p-8 flex flex-col justify-between overflow-y-auto shrink-0 dark:bg-zinc-900 dark:border-zinc-800/80">
          {selectedLesson ? (
            <div className="space-y-6">
              <div className="space-y-3 pb-6 border-b border-zinc-100 dark:border-zinc-850">
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full dark:bg-indigo-950/40 dark:text-indigo-400">
                    {selectedLesson.category}
                  </span>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full dark:bg-amber-950/40 dark:text-amber-400">
                    {selectedLesson.difficulty}
                  </span>
                  {isCompleted(selectedLesson.id) && (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full dark:bg-emerald-950/40 dark:text-emerald-400">
                      Completed
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{selectedLesson.title}</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">{selectedLesson.description}</p>
              </div>

              {/* Lesson Text Viewer */}
              <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedLesson.content}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <svg className="w-12 h-12 text-zinc-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="font-bold text-zinc-700 dark:text-zinc-300">Select a Lesson</h3>
              <p className="text-zinc-400 text-xs mt-1">Choose a topic from the grid list on the left to display its full content.</p>
            </div>
          )}

          {selectedLesson && (
            <div className="border-t border-zinc-100 pt-6 mt-8 shrink-0 dark:border-zinc-800">
              <button
                disabled={isCompleted(selectedLesson.id) || loading}
                onClick={() => handleComplete(selectedLesson.id)}
                className={`w-full font-medium py-2.5 rounded-xl text-sm transition focus:outline-none focus:ring-2 shadow-md ${
                  isCompleted(selectedLesson.id)
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/20"
                }`}
              >
                {loading ? "Saving Progress..." : isCompleted(selectedLesson.id) ? "Lesson Completed! 🎉" : "Mark Lesson as Complete"}
              </button>
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}
