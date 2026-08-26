import { db } from "../prisma/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  let usersCount = 0;
  let connectionSuccess = false;

  try {
    const users = await db.orm.public.User.all();
    usersCount = users.length;
    connectionSuccess = true;
  } catch (error: any) {
    console.error("Failed to fetch users from database:", error);
  }

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-indigo-950 text-indigo-100 flex flex-col justify-between hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-lg tracking-wider">
              AI
            </div>
            <span className="text-xl font-bold tracking-tight text-white">English AI</span>
          </div>

          <nav className="space-y-1.5">
            <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-indigo-900 text-white font-medium transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              Dashboard
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              My Progress
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
            <Link href="/lessons" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Practice
            </Link>
            <Link href="/grammar-correction" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Grammar Check
            </Link>
            <Link href="/lessons" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Vocabulary
            </Link>
            <Link href="/login" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Login / Profile
            </Link>
          </nav>
        </div>

        {/* Database Status Footer info */}
        <div className="p-6 border-t border-indigo-900/60 bg-indigo-950/50">
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${connectionSuccess ? 'bg-green-400' : 'bg-red-400'}`} />
            <div className="text-xs text-indigo-200">
              <p className="font-semibold text-white">{connectionSuccess ? "Database Connected" : "DB Disconnected"}</p>
              <p className="opacity-75">{usersCount} system users</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-200/80 bg-white px-8 flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search lessons, vocabulary..."
                className="w-full pl-10 pr-4 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:border-zinc-700"
              />
              <svg className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Sarah Jenkins</p>
              <p className="text-xs text-zinc-400">Level: Intermediate</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              SJ
            </div>
          </div>
        </header>

        {/* Dashboard Panels */}
        <div className="p-8 space-y-8 flex-1">
          {/* Welcome Title */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Welcome back, Sarah! 👋</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Let's continue learning English today.</p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Streak */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
              <div>
                <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Daily Streak</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">28 Days</p>
                <p className="text-xs text-green-500 font-medium mt-1">Keep it up!</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 dark:bg-amber-950/30">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Vocabulary */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
              <div>
                <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Vocabulary</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">1,450</p>
                <p className="text-xs text-zinc-400 mt-1">12 words added today</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 dark:bg-indigo-950/30">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>

            {/* Lesson Progress */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
              <div>
                <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Lesson Progress</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">65%</p>
                <p className="text-xs text-zinc-400 mt-1">Unit 4: Advanced Tenses</p>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* Simple Circular Progress SVGs */}
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="18" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="3" fill="transparent" />
                  <circle cx="24" cy="24" r="18" className="stroke-indigo-500" strokeWidth="3" fill="transparent" strokeDasharray={113} strokeDashoffset={113 - (113 * 65) / 100} />
                </svg>
                <span className="absolute text-[10px] font-bold text-indigo-500">65%</span>
              </div>
            </div>
          </div>

          {/* Feature Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat with AI Tutor */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between dark:bg-zinc-900 dark:border-zinc-800">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center dark:bg-indigo-950/30 dark:text-indigo-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Chat with AI Tutor</h3>
                  <p className="text-zinc-500 text-sm mt-1">Practice speaking & conversation with dynamic AI feedback on grammar, tone, and vocabulary.</p>
                </div>
              </div>
              <Link href="/ai-tutor" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl text-sm transition mt-6 dark:bg-indigo-600 dark:hover:bg-indigo-700 flex items-center justify-center">
                Start Chatting
              </Link>
            </div>

            {/* Sentence Improver */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between dark:bg-zinc-900 dark:border-zinc-800">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center dark:bg-purple-950/30 dark:text-purple-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Sentence Improver</h3>
                  <p className="text-zinc-500 text-sm mt-1">Paste your writing and get real-time recommendations, synonyms, and natural corrections.</p>
                </div>
              </div>
              <Link href="/grammar-correction" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-xl text-sm transition mt-6 dark:bg-purple-600 dark:hover:bg-purple-700 flex items-center justify-center">
                Improve Now
              </Link>
            </div>

            {/* Word of the Day */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between dark:bg-zinc-900 dark:border-zinc-800">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center dark:bg-emerald-950/30 dark:text-emerald-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Word of the Day</h3>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/30 dark:text-emerald-400">Vocabulary</span>
                  </div>
                  <p className="font-bold text-xl text-zinc-800 mt-2 dark:text-zinc-200">Ubiquitous <span className="text-sm font-normal text-zinc-400">(adj.)</span></p>
                  <p className="text-zinc-500 text-sm mt-1">Present, appearing, or found everywhere.</p>
                  <p className="text-xs text-zinc-400 italic mt-2">"Cell phones are ubiquitous in modern society."</p>
                </div>
              </div>

              <div className="flex gap-4 mt-6 text-sm font-medium border-t border-zinc-100 pt-3 dark:border-zinc-800/80 shrink-0">
                <button className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">Pronounce</button>
                <span className="text-zinc-200 dark:text-zinc-700">|</span>
                <button className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400">Save to list</button>
              </div>
            </div>
          </div>

          {/* Learning Activity Chart Section */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 mb-6">Learning Activity</h3>

            <div className="relative h-48 w-full flex items-end justify-between px-4">
              {/* Mon */}
              <div className="flex flex-col items-center gap-2 w-12 group">
                <div className="relative w-8 bg-indigo-600 rounded-t-lg transition-all group-hover:bg-indigo-500" style={{ height: '70px' }}>
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">20</span>
                </div>
                <span className="text-xs text-zinc-400">Mon</span>
              </div>
              {/* Tue */}
              <div className="flex flex-col items-center gap-2 w-12 group">
                <div className="relative w-8 bg-indigo-600 rounded-t-lg transition-all group-hover:bg-indigo-500" style={{ height: '110px' }}>
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">30</span>
                </div>
                <span className="text-xs text-zinc-400">Tue</span>
              </div>
              {/* Wed */}
              <div className="flex flex-col items-center gap-2 w-12 group">
                <div className="relative w-8 bg-indigo-600 rounded-t-lg transition-all group-hover:bg-indigo-500" style={{ height: '80px' }}>
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">22</span>
                </div>
                <span className="text-xs text-zinc-400">Wed</span>
              </div>
              {/* Thu */}
              <div className="flex flex-col items-center gap-2 w-12 group">
                <div className="relative w-8 bg-indigo-600 rounded-t-lg transition-all group-hover:bg-indigo-500" style={{ height: '135px' }}>
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">36</span>
                </div>
                <span className="text-xs text-zinc-400">Thu</span>
              </div>
              {/* Fri */}
              <div className="flex flex-col items-center gap-2 w-12 group">
                <div className="relative w-8 bg-indigo-600 rounded-t-lg transition-all group-hover:bg-indigo-500" style={{ height: '120px' }}>
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">32</span>
                </div>
                <span className="text-xs text-zinc-400">Fri</span>
              </div>
              {/* Sat */}
              <div className="flex flex-col items-center gap-2 w-12 group">
                <div className="relative w-8 bg-indigo-600 rounded-t-lg transition-all group-hover:bg-indigo-500" style={{ height: '80px' }}>
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">22</span>
                </div>
                <span className="text-xs text-zinc-400">Sat</span>
              </div>
              {/* Sun */}
              <div className="flex flex-col items-center gap-2 w-12 group">
                <div className="relative w-8 bg-indigo-600 rounded-t-lg transition-all group-hover:bg-indigo-500" style={{ height: '100px' }}>
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">28</span>
                </div>
                <span className="text-xs text-zinc-400">Sun</span>
              </div>

              {/* Background grid lines */}
              <div className="absolute left-0 right-0 top-0 border-t border-dashed border-zinc-100 dark:border-zinc-800 -z-10" />
              <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-zinc-100 dark:border-zinc-800 -z-10" />
              <div className="absolute left-0 right-0 top-2/4 border-t border-dashed border-zinc-100 dark:border-zinc-800 -z-10" />
              <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-zinc-100 dark:border-zinc-800 -z-10" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
