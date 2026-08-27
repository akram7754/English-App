"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { logoutAction } from "../login/actions";

interface Attempt {
  id: number;
  date: string;
  phrase: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  score: number;
  status: "Excellent" | "Good" | "Needs Practice";
}

export default function SpeakingScorePage() {
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
  const attempts: Attempt[] = [
    {
      id: 1,
      date: "Aug 26, 2026 at 11:42 AM",
      phrase: "If practice makes perfect, then persistent pronunciation practice will yield progress.",
      difficulty: "Advanced",
      score: 91,
      status: "Excellent",
    },
    {
      id: 2,
      date: "Aug 25, 2026 at 09:15 AM",
      phrase: "We need to get the ball rolling on this business project.",
      difficulty: "Intermediate",
      score: 86,
      status: "Good",
    },
    {
      id: 3,
      date: "Aug 24, 2026 at 04:30 PM",
      phrase: "Good morning. How are you today?",
      difficulty: "Beginner",
      score: 98,
      status: "Excellent",
    },
    {
      id: 4,
      date: "Aug 23, 2026 at 02:10 PM",
      phrase: "She sells seashells by the seashore.",
      difficulty: "Advanced",
      score: 72,
      status: "Needs Practice",
    },
    {
      id: 5,
      date: "Aug 22, 2026 at 10:05 AM",
      phrase: "I would like to order a cup of hot coffee, please.",
      difficulty: "Beginner",
      score: 95,
      status: "Excellent",
    },
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
            <Link href="/speaking-score" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-indigo-900 text-white font-medium transition">
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
              <p className="font-semibold text-white">Score Center Live</p>
              <p className="opacity-75">Track pronunciation accuracy</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main progress center */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Speaking Scores</h1>
            <p className="text-zinc-500 text-sm mt-1">Review your historical pronunciation progress and learn enunciation recommendations.</p>
          </div>
          <Link
            href="/voice-practice"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md"
          >
            Practice Speaking Now
          </Link>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average circular gauge card */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Average Score</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">88.4%</p>
              <p className="text-xs text-green-500 font-medium mt-1">Proficient speaker level</p>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="5" fill="transparent" />
                <circle cx="32" cy="32" r="26" className="stroke-indigo-500" strokeWidth="5" fill="transparent" strokeDasharray={163} strokeDashoffset={163 - (163 * 88) / 100} />
              </svg>
              <span className="absolute text-xs font-bold text-indigo-500">88%</span>
            </div>
          </div>

          {/* Total attempts */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Total Readings</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">24 Phrases</p>
              <p className="text-xs text-zinc-400 mt-1">Completed across 3 levels</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 dark:bg-indigo-950/30">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>

          {/* Practice Streak */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
            <div>
              <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Speaking Streak</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">4 Days</p>
              <p className="text-xs text-amber-500 font-medium mt-1">Strengthens pronunciation memory</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 dark:bg-amber-950/30">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Detailed performance breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Level meters */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-6 lg:col-span-2 dark:bg-zinc-900 dark:border-zinc-800">
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Level Proficiency Breakdown</h3>
              <p className="text-zinc-400 text-xs mt-0.5">Average accuracy rates across graded phrase sets.</p>
            </div>

            <div className="space-y-5">
              {/* Beginner */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <span>Beginner Phrases (Short Greetings)</span>
                  <span className="text-indigo-600 dark:text-indigo-400">95% Accuracy</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-100 rounded-full dark:bg-zinc-800">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '95%' }} />
                </div>
              </div>

              {/* Intermediate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <span>Intermediate Phrases (Workplace/Compound)</span>
                  <span className="text-indigo-600 dark:text-indigo-400">86% Accuracy</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-100 rounded-full dark:bg-zinc-800">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '86%' }} />
                </div>
              </div>

              {/* Advanced */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <span>Advanced Phrases (Tongue Twisters/Long)</span>
                  <span className="text-indigo-600 dark:text-indigo-400">74% Accuracy</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-100 rounded-full dark:bg-zinc-800">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '74%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Voice enunciation advice card */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm space-y-4 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Pronunciation Insights 💡</h3>
            <ul className="space-y-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              <li>
                <strong className="text-zinc-800 dark:text-zinc-300">Focus on "th" sounds:</strong> The analyzer notes brief phoneme gaps on words containing *the* or *seashore*. Practice putting your tongue between your teeth!
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-300">Enunciate consonant endings:</strong> Ensure you clearly speak word endings like *t* or *d* (e.g. *project*, *coffee*).
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-300">Speaking Pace:</strong> Your pacing is excellent. Maintaining 120-140 words per minute helps recognition algorithms.
              </li>
            </ul>
          </div>
        </div>

        {/* Attempts Log list Table */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-6 overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
          <div className="mb-6">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Recent Speaking Attempts</h3>
            <p className="text-zinc-400 text-xs mt-0.5">Chronological record of completed pronunciation practices.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-500 dark:text-zinc-400">
              <thead className="bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-wider dark:bg-zinc-950/40">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Phrase</th>
                  <th className="px-6 py-3">Difficulty</th>
                  <th className="px-6 py-3 text-right">Score</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-zinc-400">{attempt.date}</td>
                    <td className="px-6 py-4 max-w-xs truncate font-semibold text-zinc-700 dark:text-zinc-300">"{attempt.phrase}"</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md font-semibold text-[10px] dark:bg-zinc-800 dark:text-zinc-300">
                        {attempt.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-extrabold text-zinc-900 dark:text-zinc-100">{attempt.score}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase ${
                        attempt.status === "Excellent" 
                          ? "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400"
                          : attempt.status === "Good"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                          : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                      }`}>
                        {attempt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
