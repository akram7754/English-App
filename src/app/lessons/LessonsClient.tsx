"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Lesson {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  content: string;
}

export default function LessonsClient({ initialLessons }: { initialLessons: Lesson[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(initialLessons[0] || null);

  const categories = ["All", "Grammar", "Vocabulary", "Speaking"];

  const filteredLessons = selectedCategory === "All"
    ? initialLessons
    : initialLessons.filter((l) => l.category.toLowerCase() === selectedCategory.toLowerCase());

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
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>
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

      {/* Main View Area */}
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
                    <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md dark:bg-indigo-950/40 dark:text-indigo-400">
                      {lesson.category}
                    </span>
                    <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md dark:bg-amber-950/40 dark:text-amber-400">
                      {lesson.difficulty}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{lesson.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{lesson.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold pt-4 mt-auto">
                  <span>Start Learning</span>
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
                onClick={() => alert(`Marked "${selectedLesson.title}" as complete!`)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-md"
              >
                Mark Lesson as Complete
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
