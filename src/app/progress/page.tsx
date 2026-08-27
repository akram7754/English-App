"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { logoutAction } from "../login/actions";

interface Unit {
  id: number;
  title: string;
  description: string;
  status: "Completed" | "In Progress" | "Locked";
  tasks: string[];
}

export default function ProgressPage() {
  const [userName, setUserName] = useState("Sarah Jenkins");
  const [userInitials, setUserInitials] = useState("SJ");

  useEffect(() => {
    const match = document.cookie.match(new RegExp('(^| )user=([^;]+)'));
    if (!match) {
      window.location.href = "/login";
    } else {
      try {
        const token = match[2];
        const payloadBase64 = token.split(".")[0];
        const decodedJSON = atob(payloadBase64);
        const decoded = JSON.parse(decodedJSON);
        const name = decoded.name || "Sarah Jenkins";
        setUserName(name);
        setUserInitials(name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "SJ");
      } catch (e) {
        window.location.href = "/login";
      }
    }
  }, []);
  const [units, setUnits] = useState<Unit[]>([
    {
      id: 1,
      title: "Unit 1: Present Tense & Greetings",
      description: "Learn how to introduce yourself and structure sentences in Simple Present Tense.",
      status: "Completed",
      tasks: ["Practice introduction sentences", "Learn 5 greetings", "Complete Unit 1 Quiz"],
    },
    {
      id: 2,
      title: "Unit 2: Workplace Idioms & Phrasings",
      description: "Master business idioms and formal phrasings for workplace emails and presentations.",
      status: "Completed",
      tasks: ["Learn 10 Business Idioms", "Draft follow-up email", "Complete Idioms Speaking Practice"],
    },
    {
      id: 3,
      title: "Unit 3: Formal Conversational Tone",
      description: "Develop structural skills to hold professional chats with managers and clients.",
      status: "Completed",
      tasks: ["Practice formal introductions", "Complete vocabulary matching", "AI Tutor Interview Quiz"],
    },
    {
      id: 4,
      title: "Unit 4: Pronunciation & Complex Tenses",
      description: "Focus on Present Perfect, Past Perfect, and enunciation accuracy of consonant endings.",
      status: "In Progress",
      tasks: ["Master Present Perfect Tense", "Achieve 90%+ matching score in Voice practice", "Write past actions log"],
    },
    {
      id: 5,
      title: "Unit 5: Advanced Speech & Tongue Twisters",
      description: "Deliver fluent speeches, handle advanced tongue twisters, and build an extensive vocabulary.",
      status: "Locked",
      tasks: ["Tongue twister speed practice", "Learn 50 scientific vocab terms", "Final fluency evaluation"],
    },
  ]);

  // Generates array representing a 4-week activity calendar block grid
  const activityDays = [
    { day: 1, active: true }, { day: 2, active: true }, { day: 3, active: false }, { day: 4, active: true },
    { day: 5, active: true }, { day: 6, active: true }, { day: 7, active: false }, { day: 8, active: true },
    { day: 9, active: true }, { day: 10, active: false }, { day: 11, active: true }, { day: 12, active: true },
    { day: 13, active: true }, { day: 14, active: true }, { day: 15, active: false }, { day: 16, active: true },
    { day: 17, active: true }, { day: 18, active: true }, { day: 19, active: true }, { day: 20, active: true },
    { day: 21, active: false }, { day: 22, active: true }, { day: 23, active: true }, { day: 24, active: true },
    { day: 25, active: true }, { day: 26, active: true }, { day: 27, active: true }, { day: 28, active: true },
  ];

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
            <Link href="/lessons" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
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
            <Link href="/progress" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-indigo-900 text-white font-medium transition">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
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
              <p className="font-semibold text-white">Progress Center Live</p>
              <p className="opacity-75">Curriculum tracker synced</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main progress center */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">General Progress</h1>
          <p className="text-zinc-500 text-sm mt-1">Centralized roadmap tracking curriculum units, enunciation scores, and active daily streaks.</p>
        </div>

        {/* Integrated metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Course completion */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Course Progress</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">65%</p>
              <p className="text-xs text-zinc-400 mt-1">Unit 4: In Progress</p>
            </div>
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="18" className="stroke-zinc-100 dark:stroke-zinc-850" strokeWidth="4" fill="transparent" />
                <circle cx="24" cy="24" r="18" className="stroke-indigo-500" strokeWidth="4" fill="transparent" strokeDasharray={113} strokeDashoffset={113 - (113 * 65) / 100} />
              </svg>
              <span className="absolute text-[10px] font-bold text-indigo-500">65%</span>
            </div>
          </div>

          {/* Vocabulary Learned */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Vocab Learned</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">1,450</p>
              <p className="text-xs text-green-500 mt-1">+12 words today</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 dark:bg-indigo-950/30 shrink-0">
              📖
            </div>
          </div>

          {/* Grammar accuracy */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Grammar Accuracy</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">92%</p>
              <p className="text-xs text-zinc-400 mt-1">12 checks completed</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 dark:bg-indigo-950/30 shrink-0">
              ✍️
            </div>
          </div>

          {/* Speaking accuracy */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Speaking Score</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-1">88%</p>
              <p className="text-xs text-zinc-400 mt-1">24 practice runs</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 dark:bg-indigo-950/30 shrink-0">
              🗣️
            </div>
          </div>
        </div>

        {/* Roadmap + Activity section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Roadmap list */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm lg:col-span-2 space-y-6 dark:bg-zinc-900 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Course Curriculum Curriculum</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Check completed sections and review target lessons below.</p>
            </div>

            <div className="space-y-6">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className="flex gap-4 p-4 border border-zinc-100 rounded-2xl dark:border-zinc-850 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition"
                >
                  {/* Status Indicator */}
                  <div className="mt-1 shrink-0">
                    {unit.status === "Completed" ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold font-sans">
                        ✓
                      </span>
                    ) : unit.status === "In Progress" ? (
                      <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold animate-pulse">
                        •
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-400 flex items-center justify-center text-xs font-bold dark:bg-zinc-800">
                        🔒
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{unit.title}</h4>
                      <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${
                        unit.status === "Completed"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : unit.status === "In Progress"
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}>
                        {unit.status}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs leading-relaxed">{unit.description}</p>
                    
                    {/* Unit task checkpoints */}
                    <div className="pt-2 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-zinc-400 font-medium">
                      {unit.tasks.map((task, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className={unit.status === "Completed" ? "text-emerald-500" : "text-zinc-300 dark:text-zinc-700"}>
                            ●
                          </span>
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Heatmap Grid */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-6 dark:bg-zinc-900 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Study Streak Log</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Heatmap visualizing days with completed enunciation practice or grammar checks.</p>
            </div>

            {/* Simulated Git-like calendar heat grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {activityDays.map((day) => (
                  <div
                    key={day.day}
                    title={`Day ${day.day}: ${day.active ? "Study session completed" : "No session recorded"}`}
                    className={`aspect-square rounded-md transition ${
                      day.active
                        ? "bg-indigo-600 border border-indigo-600 shadow-sm scale-105"
                        : "bg-zinc-100 border border-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:border-zinc-800 dark:hover:bg-zinc-750"
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center text-[10px] text-zinc-400 font-semibold uppercase tracking-wider pt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-zinc-100 border border-zinc-200 rounded dark:bg-zinc-800 dark:border-zinc-700" />
                  Inactive
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded" />
                  Studied
                </span>
              </div>
            </div>

            {/* Encouraging message block */}
            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl text-xs leading-relaxed text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300">
              <p className="font-bold">🌟 Daily Learning tip:</p>
              <p className="opacity-90 mt-1">You have studied 24 out of the past 28 days! Practicing consistently for just 10 minutes a day is more effective than studying for hours once a week.</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
